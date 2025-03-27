import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/product.entity';
import { SeedService } from '../seed/seed.service';
import { Currency, CurrencySchema } from './schema/currency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Currency.name, schema: CurrencySchema },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, SeedService],
})
export class ProductModule {}
