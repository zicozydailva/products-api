import { Test } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import RedisMock from 'ioredis-mock';
import { AuthService } from '../auth.service';
import { testUser } from './data';
import { closeInMongodConnection, rootMongooseTestModule } from './test';
import { UserService } from '../../../modules/user/user.service';
import { TokenHelper } from '../../../lib/utils/token/token.utils';
import { UserSessionService } from '../../../global/user-session/service';
import { EncryptHelper } from '../../../core/helpers';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../../modules/user/schema/user.entity';
import { EMAIL_ALREADY_EXISTS } from '../../../core/constants';

const userModelMock = {
  find: jest.fn(),
  findOne: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(testUser),
  }),
  create: jest.fn().mockResolvedValue({
    _id: 'user_id',
    email: 'test@example.com',
    password: 'hashed_password',
  }),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  save: jest.fn(),
  login: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const app = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule({
          dbName: 'test',
        }),
      ],
      providers: [
        UserService,
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
        {
          provide: TokenHelper,
          useValue: {
            generate: jest.fn().mockResolvedValue({
              accessToken: 'token',
              expires: 333,
              refreshToken: 'refreshToken',
              sessionId: 'sessionId',
            }),
          },
        },
        {
          provide: UserSessionService,
          useValue: new UserSessionService(new RedisMock()),
        },
        {
          provide: EncryptHelper,
          useValue: {
            hash: jest.fn().mockImplementation((password) => password),
            compare: jest
              .fn()
              .mockImplementation((password, hash) => password === hash),
            hashSync: jest.fn().mockImplementation((password) => password),
            compareSync: jest
              .fn()
              .mockImplementation((password, hash) => password === hash),
          },
        },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
  });

  describe('signup/createUser', () => {
    it('should create a user', async () => {
      const user = await authService.createUser(testUser);

      expect(user).toBeDefined();
    });

    it('should throw an error if user already exists', async () => {
      await expect(authService.createUser(testUser)).rejects.toThrow(
        EMAIL_ALREADY_EXISTS,
      );
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const data = {
        email: testUser.email,
        password: testUser.password,
      };

      const user = await authService.login(data);

      expect(user).toBeDefined();
    });

    it('should throw an error if user does not exist', async () => {
      const data = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        rememberMe: true,
      };

      await expect(authService.login(data)).rejects.toThrow();
    });

    it('should throw an error if password is incorrect', async () => {
      const data = {
        email: testUser.email,
        password: faker.internet.password(),
        rememberMe: true,
      };

      await expect(authService.login(data)).rejects.toThrow();
    });
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});
