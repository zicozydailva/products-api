import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency, CurrencyDocument } from '../product/schema/currency.schema';
import { currencies } from './currencies/currencies';

@Injectable()
export class SeedService {
  private logger = new Logger(SeedService.name);
  constructor(
    @InjectModel(Currency.name)
    private readonly CurrencyRepo: Model<CurrencyDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCurrencies();
  }

  async seedCurrencies() {
    const currencyCount = await this.CurrencyRepo.count();
    this.logger.log(`currency count is ${currencyCount}`);
    if (currencyCount > 0) return;

    await this.CurrencyRepo.insertMany(currencies, { lean: true });

    this.logger.log('Seeding Currencies completed');
  }
}
