import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../product.service';
import { mockProductId, testProduct, updatedProduct } from './data';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../schema/product.entity';
import { ProductFilterDto } from '../dto/product.dto';
import { Order, PaginationResultDto } from '../../../lib/utils/dto';

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

const mockProducts = [testProduct, { ...testProduct, name: 'Another Product' }];
const totalProducts = mockProducts.length;

const findProductModelMock = {
  find: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  populate: jest.fn().mockResolvedValue(mockProducts),
  countDocuments: jest.fn().mockResolvedValue(totalProducts),
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
          useValue: { ...productModelMock, ...findProductModelMock },
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

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const paginationQuery: ProductFilterDto = {
        limit: 10,
        page: 1,
        skip: 1,
        order: Order.DESC,
        search: '',
        isActive: true,
        category: 'Electronics',
      };

      const result = await productService.findAll(paginationQuery);

      expect(result).toBeInstanceOf(PaginationResultDto);
      expect(result.data).toEqual(mockProducts);
      expect(result.meta.itemCount).toBe(totalProducts);
      expect(findProductModelMock.find).toHaveBeenCalledWith({
        isActive: true,
        category: 'Electronics',
      });
      expect(findProductModelMock.countDocuments).toHaveBeenCalledWith({
        isActive: true,
        category: 'Electronics',
      });
    });

    it('should apply search filters', async () => {
      const paginationQuery: ProductFilterDto = {
        limit: 5,
        page: 1,
        skip: 1,
        order: Order.DESC,
        search: 'wireless',
      };

      await productService.findAll(paginationQuery);

      expect(findProductModelMock.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: [
            { name: { $regex: 'wireless', $options: 'i' } },
            { sku: { $regex: 'wireless', $options: 'i' } },
            { tags: { $in: [new RegExp('wireless', 'i')] } },
          ],
        }),
      );
    });

    it('should return empty array if no products match', async () => {
      findProductModelMock.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
      });
      findProductModelMock.countDocuments.mockResolvedValueOnce(0);

      const paginationQuery: ProductFilterDto = {
        limit: 5,
        page: 1,
        skip: 1,
        order: Order.DESC,
      };
      const result = await productService.findAll(paginationQuery);

      expect(result.data).toEqual([]);
      expect(result.meta.itemCount).toBe(0);
    });

    it('should handle errors and throw an exception', async () => {
      findProductModelMock.find.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      await expect(
        productService.findAll({ limit: 5, page: 1, skip: 1 }),
      ).rejects.toThrow();
    });
  });
});
