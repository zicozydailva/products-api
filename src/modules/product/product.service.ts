import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schema/product.entity';
import { Model } from 'mongoose';
import {
  CreateProductDto,
  ProductFilterDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ErrorHelper } from '../../core/helpers';
import { CURRENCY_P, PRODUCT_NOT_FOUND, USER_P } from '../../core/constants';
import { Order, PaginationResultDto } from '../../lib/utils/dto';
import { Cache } from 'cache-manager';

@Injectable()
export class ProductService {
  private logger = new Logger(ProductService.name);
  constructor(
    @InjectModel(Product.name)
    private readonly productRepo: Model<ProductDocument>,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
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

    const cacheKey = `products_${limit}_${page}_${order}_${search}_${isActive}_${category}`;
    this.logger.log({ cacheKey });
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      this.logger.log(`✅ Cache hit: Returning cached data`);
      return cachedData;
    }

    this.logger.log('❌ Cache miss: Fetching from database');

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
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
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

      // Store result in cache
      const result = new PaginationResultDto(products, count, { limit, page });
      await this.cacheManager.set(cacheKey, result, 300); // Cache for 5 minutes

      return result;
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
