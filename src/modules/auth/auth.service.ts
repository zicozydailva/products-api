import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/schema/user.entity';
import { Model } from 'mongoose';
import { CreateUserDto, LoginDto } from '../user/dto/user.dto';
import { EncryptHelper, ErrorHelper } from '../../core/helpers';
import {
  EMAIL_ALREADY_EXISTS,
  INVALID_EMAIL_OR_PASSWORD,
} from '../../core/constants';
import { IUser } from '../../core/interfaces';
import { UserSessionService } from '../../global/user-session/service';
import { TokenHelper } from '../../lib/utils/token/token.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userRepo: Model<User>,
    private encryptHelper: EncryptHelper,
    private tokenHelper: TokenHelper,
    private userSessionService: UserSessionService,
  ) {}

  async signup(payload: CreateUserDto) {
    try {
      const user = await this.createUser(payload);
      const tokenInfo = await this.generateUserSession(user as IUser);

      return {
        token: tokenInfo,
        user: user,
      };
    } catch (error) {
      ErrorHelper.ConflictException(error);
    }
  }

  async login(params: LoginDto) {
    try {
      const { email, password } = params;

      const user = await this.validateUser(email, password);

      const tokenInfo = await this.generateUserSession(user as IUser);

      return {
        token: tokenInfo,
        user,
      };
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }

  async createUser(payload: CreateUserDto) {
    const { email } = payload;
    const emailQuery = {
      email: email.toLowerCase(),
    };

    const emailExist = await this.userRepo.findOne(emailQuery);

    if (emailExist) {
      ErrorHelper.BadRequestException(EMAIL_ALREADY_EXISTS);
    }

    const user = await this.userRepo.create({
      ...payload,
      password: await this.encryptHelper.hash(payload.password),
      email: email.toLowerCase(),
    });

    return user.toObject();
  }

  private async validateUser(email: string, password: string) {
    const emailQuery = {
      email: email.toLowerCase(),
    };

    const user = await this.userRepo.findOne(emailQuery);

    if (!user) {
      ErrorHelper.BadRequestException(INVALID_EMAIL_OR_PASSWORD);
    }

    const passwordMatch = await this.encryptHelper.compare(
      password,
      user.password,
    );
    if (!passwordMatch) {
      ErrorHelper.BadRequestException(INVALID_EMAIL_OR_PASSWORD);
    }

    return user.toObject();
  }

  private async generateUserSession(user: IUser) {
    const tokenInfo = this.tokenHelper.generate(user);

    await this.userSessionService.create(user, {
      sessionId: tokenInfo.sessionId,
    });

    return tokenInfo;
  }

  async logout(userId: string) {
    await this.userSessionService.delete(userId);

    return {
      success: true,
    };
  }
}
