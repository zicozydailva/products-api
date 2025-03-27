import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schema/product.entity';
import { Model } from 'mongoose';
import {
  CreateProductDto,
  ProductFilterDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ErrorHelper } from 'src/core/helpers';
import { CURRENCY_P, PRODUCT_NOT_FOUND, USER_P } from 'src/core/constants';
import { Order, PaginationResultDto } from 'src/lib/utils/dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productRepo: Model<ProductDocument>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    userId: string,
  ): Promise<Product> {
    try {
      return await this.productRepo.create({
        createdBy: userId,
        ...createProductDto,
      });
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }

  async findAll(paginationQuery: ProductFilterDto) {
    const { limit, page, order, search, isActive, category } = paginationQuery;
    const skip = (page - 1) * limit;
    const sortOrder = order === Order.DESC ? -1 : 1;

    // dynamic query condition
    const queryCondition: any = {};

    if (typeof isActive !== 'undefined') {
      queryCondition.isActive = isActive;
    }

    if (category) {
      queryCondition.category = category;
    }

    if (search) {
      queryCondition.$or = [
        { name: { $regex: search, $options: 'i' } }, // Case-insensitive search on product name
        { sku: { $regex: search, $options: 'i' } }, // Case-insensitive search on SKU
        { tags: { $in: [new RegExp(search, 'i')] } }, // Case-insensitive search in tags array
      ];
    }

    try {
      const products = await this.productRepo
        .find(queryCondition)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .populate([
          { path: 'currency', select: CURRENCY_P },
          { path: 'createdBy', select: USER_P },
        ]);

      const count = await this.productRepo.countDocuments(queryCondition);

      return new PaginationResultDto(products, count, { limit, page });
    } catch (error) {
      ErrorHelper.NotFoundException(error);
    }
  }

  async findOne(id: string): Promise<Product> {
    try {
      const product = await this.productRepo.findById(id).populate([
        { path: 'currency', select: CURRENCY_P },
        { path: 'createdBy', select: USER_P },
      ]);

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
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const updatedProduct = await this.productRepo
        .findByIdAndUpdate(id, updateProductDto, { new: true })
        .populate([
          { path: 'currency', select: CURRENCY_P },
          { path: 'createdBy', select: USER_P },
        ]);

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
