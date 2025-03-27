import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';

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

export const mockProductId = 'product_123';

export const updatedProduct: UpdateProductDto = {
  name: 'Updated Wireless Headphones',
  price: 89.99,
};
