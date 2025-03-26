import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const res = await this.productService.create(createProductDto);

    return {
      data: res,
      message: 'Product Created Successfully',
      success: true,
    };
  }

  @Get()
  async findAll() {
    const res = await this.productService.findAll();

    return {
      data: res,
      message: 'Products Fetched Successfully',
      success: true,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const res = await this.productService.findOne(id);

    return {
      data: res,
      message: 'Product Fetched Successfully',
      success: true,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto) {
    const res = await this.productService.update(id, updateProductDto);

    return {
      data: res,
      message: 'Product Updated Successfully',
      success: true,
    };
  }

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
