import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../product.service';
import { testProduct } from './data';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../schema/product.entity';

const productModelMock = {
  create: jest.fn().mockResolvedValue(testProduct),
};

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: productModelMock,
        },
      ],
    }).compile();

    productService = moduleRef.get<ProductService>(ProductService);
  });

  describe('create', () => {
    it('should create a product', async () => {
      const userId = 'user_123';
      const product = await productService.create(testProduct, userId);

      expect(product).toBeDefined();
      expect(productModelMock.create).toHaveBeenCalledWith({
        createdBy: userId,
        ...testProduct,
      });
    });

    it('should throw an error if creation fails', async () => {
      productModelMock.create.mockRejectedValue(new Error('Database error'));

      await expect(
        productService.create(testProduct, 'user_123'),
      ).rejects.toThrow();
      expect(productModelMock.create).toHaveBeenCalled();
    });
  });
});
