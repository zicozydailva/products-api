import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product.dto';
import { AuthGuard } from 'src/lib/utils/guards';
import { User as UserDecorator } from 'src/lib/utils/decorators';
import { IUser } from 'src/core/interfaces';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
  async findAll() {
    const res = await this.productService.findAll();

    return {
      data: res,
      message: 'Products Fetched Successfully',
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
  async update(@Param('id') id: string, @Body() updateProductDto) {
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
