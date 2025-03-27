import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Currency, CurrencySchema } from '../product/schema/currency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Currency.name, schema: CurrencySchema },
    ]),
  ],
  providers: [SeedService, SeedModule],
})
export class SeedModule {}
