import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/product.entity';
import { SeedService } from '../seed/seed.service';
import { Currency, CurrencySchema } from './schema/currency.schema';
import { redisStore } from 'cache-manager-redis-store';
import { SecretsModule } from 'src/global/secrets/module';
import { SecretsService } from 'src/global/secrets/service';

@Module({
  imports: [
    CacheModule.register({
      imports: [SecretsModule],
      inject: [SecretsService],
      useFactory: (secretsService: SecretsService) => ({
        store: redisStore,
        host: secretsService.userSessionRedis.REDIS_HOST,
        port: secretsService.userSessionRedis.REDIS_PORT,
        ttl: 300, // Cache expiration time in seconds (5 min)
      }),
    }),

    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Currency.name, schema: CurrencySchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, SeedService],
})
export class ProductModule {}
