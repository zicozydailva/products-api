import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { GlobalModule } from './global/global.module';
import { SecretsModule } from './global/secrets/module';
import { SecretsService } from './global/secrets/service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    GlobalModule,
    AuthModule,
    UserModule,
    ProductModule,
    SeedModule,
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
    MongooseModule.forRootAsync({
      imports: [SecretsModule],
      inject: [SecretsService],
      useFactory: (secretsService: SecretsService) => ({
        uri: secretsService.MONGO_URI,
      }),
    }),
  ],
  providers: [],
  controllers: [],
})
export class MainModule {}
