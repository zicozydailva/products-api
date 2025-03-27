import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../product/schema/currency.schema';
import { currencies } from './currencies/currencies';
import { ErrorHelper } from 'src/core/helpers';

@Injectable()
export class SeedService {
  private logger = new Logger(SeedService.name);
  constructor(
    @InjectModel(Currency.name)
    private readonly currencyRepo: Model<CurrencyDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCurrencies();
  }

  async seedCurrencies() {
    const currencyCount = await this.currencyRepo.count();
    this.logger.log(`currency count is ${currencyCount}`);
    if (currencyCount > 0) return;

    await this.currencyRepo.insertMany(currencies, { lean: true });

    this.logger.log('Seeding Currencies completed');
  }

  async fetchCurrencies() {
    try {
      return await this.currencyRepo.find({});
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }
}
