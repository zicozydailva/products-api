import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schema/product.entity';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/product.dto';
import { ErrorHelper } from 'src/core/helpers';
import { PRODUCT_NOT_FOUND } from 'src/core/constants';

@Injectable()
export class ProductService {
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

  async findAll(): Promise<Product[]> {
    try {
      return this.productRepo.find().populate('currency').exec();
    } catch (error) {
      ErrorHelper.NotFoundException(error);
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.productRepo.findById(id).populate('currency');

      if (!product) {
        ErrorHelper.NotFoundException(PRODUCT_NOT_FOUND);
      }

      return product;
    } catch (error) {
      ErrorHelper.NotFoundException(error);
    }
  }

  async update(
    id: string,
    updateProductDto: CreateProductDto, // TODO: UpdateProductDto
  ): Promise<Product> {
    try {
      const updatedProduct = await this.productRepo
        .findByIdAndUpdate(id, updateProductDto, { new: true })
        .populate('currency');

      if (!updatedProduct) {
        ErrorHelper.NotFoundException(PRODUCT_NOT_FOUND);
      }

      return updatedProduct;
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }

  async remove(id: string): Promise<Product> {
    try {
      const deletedProduct = await this.productRepo.findByIdAndDelete(id);

      if (!deletedProduct) {
        ErrorHelper.NotFoundException(PRODUCT_NOT_FOUND);
      }

      return deletedProduct;
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }
}
