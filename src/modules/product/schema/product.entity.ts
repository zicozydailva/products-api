import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Currency } from './currency.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Types.ObjectId, ref: Currency.name, required: true })
  currency: Currency;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ required: true })
  category: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop([String])
  tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
