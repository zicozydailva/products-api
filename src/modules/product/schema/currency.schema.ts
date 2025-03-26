import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CurrencyDocument = Currency & Document;

@Schema({
  timestamps: true,
})
export class Currency extends Document {
  @Prop({ type: String })
  code: string;

  @Prop({ required: false, type: String })
  label: string;

  @Prop({ required: false, type: String })
  symbol: string;

  @Prop({
    type: Date,
    default: null,
  })
  deletedAt?: Date;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
