import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { PaginationDto } from 'src/lib/utils/dto';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsMongoId()
  currency: string;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  category: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductFilterDto extends PaginationDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  isActive?: boolean;
}
