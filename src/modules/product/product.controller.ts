import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  ProductFilterDto,
  UpdateProductDto,
} from './dto/product.dto';
import { AuthGuard } from 'src/lib/utils/guards';
import { User as UserDecorator } from 'src/lib/utils/decorators';
import { IUser } from 'src/core/interfaces';
import { SeedService } from '../seed/seed.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly seedService: SeedService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createProductDto: CreateProductDto,
    @UserDecorator() user: IUser,
  ) {
    const res = await this.productService.create(createProductDto, user._id);

    return {
      data: res,
      message: 'Product Created Successfully',
      success: true,
    };
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Query() paginationQuery: ProductFilterDto) {
    const res = await this.productService.findAll(paginationQuery);

    return {
      data: res,
      message: 'Products Fetched Successfully',
      success: true,
    };
  }

  @Get('/currencies')
  async fetchCurrencies() {
    const res = await this.seedService.fetchCurrencies();

    return {
      data: res,
      message: 'Currencies Fetched Successfully',
      success: true,
    };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.productService.findOne(id);

    return {
      data: res,
      message: 'Product Fetched Successfully',
      success: true,
    };
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const res = await this.productService.update(id, updateProductDto);

    return {
      data: res,
      message: 'Product Updated Successfully',
      success: true,
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.productService.remove(id);

    return {
      data: res,
      message: 'Product Deleted Successfully',
      success: true,
    };
  }
}
