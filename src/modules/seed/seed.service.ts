import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

import { Currency, CurrencyDocument } from '../product/schema/currency.schema';
import { currencies } from './currencies/currencies';
import { ErrorHelper } from 'src/core/helpers';

@Injectable()
export class SeedService {
  private logger = new Logger(SeedService.name);
  constructor(
    @InjectModel(Currency.name)
    private readonly currencyRepo: Model<CurrencyDocument>,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCurrencies();
  }

  async seedCurrencies() {
    const currencyCount = await this.currencyRepo.countDocuments();
    this.logger.log(`currency count is ${currencyCount}`);
    if (currencyCount > 0) return;

    await this.currencyRepo.insertMany(currencies, { lean: true });

    this.logger.log('Seeding Currencies completed');
  }

  async fetchCurrencies() {
    try {
      const cacheKey = `currencies-products`;
      const cachedData = await this.redisClient.get(cacheKey);
      if (cachedData) {
        this.logger.log(`✅ Cache hit: Returning cached data`);
        return JSON.parse(cachedData); // Ensure JSON format
      }
      this.logger.log('❌ Cache miss: Fetching from database');

      const result = await this.currencyRepo.find({});

      await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 300);

      return result;
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }
}
