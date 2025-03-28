import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/product.entity';
import { SeedService } from '../seed/seed.service';
import { Currency, CurrencySchema } from './schema/currency.schema';
import { SecretsService } from 'src/global/secrets/service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Currency.name, schema: CurrencySchema },
    ]),
    RedisModule.forRootAsync({
      useFactory: ({ userSessionRedis }: SecretsService) => ({
        config: {
          host: userSessionRedis.REDIS_HOST,
          port: userSessionRedis.REDIS_PORT,
          username: userSessionRedis.REDIS_USER,
          password: userSessionRedis.REDIS_PASSWORD,
        },
      }),
      inject: [SecretsService],
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, SeedService],
})
export class ProductModule {}
