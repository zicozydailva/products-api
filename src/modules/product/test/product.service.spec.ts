import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../product.service';
import { mockProductId, testProduct, updatedProduct } from './data';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../schema/product.entity';

const productModelMock = {
  create: jest.fn().mockResolvedValue(testProduct),
  findById: jest.fn().mockReturnValue({
    populate: jest.fn().mockResolvedValue(testProduct),
  }),
  findByIdAndUpdate: jest.fn().mockReturnValue({
    populate: jest
      .fn()
      .mockResolvedValue({ ...testProduct, ...updatedProduct }),
  }),
  findByIdAndDelete: jest.fn().mockResolvedValue(testProduct),
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

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const product = await productService.findOne(mockProductId);

      expect(product).toBeDefined();
      expect(productModelMock.findById).toHaveBeenCalledWith(mockProductId);
    });

    it('should throw an error if product is not found', async () => {
      productModelMock.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(productService.findOne(mockProductId)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const product = await productService.update(
        mockProductId,
        updatedProduct,
      );

      expect(product).toBeDefined();
      expect(product.name).toBe(updatedProduct.name);
      expect(productModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProductId,
        updatedProduct,
        { new: true },
      );
    });

    it('should throw an error if product is not found', async () => {
      productModelMock.findByIdAndUpdate.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(
        productService.update(mockProductId, updatedProduct),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const product = await productService.remove(mockProductId);

      expect(product).toBeDefined();
      expect(productModelMock.findByIdAndDelete).toHaveBeenCalledWith(
        mockProductId,
      );
    });

    it('should throw an error if product is not found', async () => {
      productModelMock.findByIdAndDelete.mockResolvedValueOnce(null);

      await expect(productService.remove(mockProductId)).rejects.toThrow();
    });
  });
});
