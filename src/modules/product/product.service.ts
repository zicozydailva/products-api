import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schema/product.entity';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/product.dto';
import { ErrorHelper } from 'src/core/helpers';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productRepo: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.productRepo.create(createProductDto);
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findById(id).populate('currency');

    if (!product) {
      ErrorHelper.NotFoundException('Product not found');
    }

    return product;
  }

  
}
