import { CreateProductDto } from '../dto/product.dto';

export const testProduct: CreateProductDto = {
  name: 'Wireless Headphones',
  sku: 'WH-12345',
  price: 99.99,
  currency: '67e4667d94548789f05efea4',
  stock: 50,
  category: 'Electronics',
  isActive: true,
  tags: ['wireless', 'bluetooth', 'audio'],
};
