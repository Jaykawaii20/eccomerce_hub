import { Result, ok, err } from 'neverthrow';
import { Product, Category } from '@prisma/client';
import { IProductRepository } from '../repositories/product.repository';
import { DomainError, Errors } from '../utils/result';
import { CreateProductInput, UpdateProductInput, ListProductsInput } from '../validators/product.validator';

export interface ProductListResult {
  data: Product[];
  total: number;
}

export class ProductService {
  constructor(private readonly productRepo: IProductRepository) {}

  async list(params: ListProductsInput): Promise<Result<ProductListResult, DomainError>> {
    const result = await this.productRepo.findAll(params);
    return ok(result);
  }

  async getById(id: string): Promise<Result<Product, DomainError>> {
    const product = await this.productRepo.findById(id);
    if (!product || product.deletedAt !== null) {
      return err(Errors.NOT_FOUND('Product'));
    }
    return ok(product);
  }

  async create(input: CreateProductInput, _userId: string): Promise<Result<Product, DomainError>> {
    const existing = await this.productRepo.findBySlug(input.slug);
    if (existing) {
      return err(Errors.CONFLICT(`A product with slug "${input.slug}" already exists.`));
    }
    const product = await this.productRepo.create(input);
    return ok(product);
  }

  async update(id: string, input: UpdateProductInput): Promise<Result<Product, DomainError>> {
    const existing = await this.productRepo.findById(id);
    if (!existing || existing.deletedAt !== null) {
      return err(Errors.NOT_FOUND('Product'));
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugTaken = await this.productRepo.findBySlug(input.slug);
      if (slugTaken && slugTaken.id !== id) {
        return err(Errors.CONFLICT(`A product with slug "${input.slug}" already exists.`));
      }
    }

    const updated = await this.productRepo.update(id, input);
    return ok(updated);
  }

  async delete(id: string): Promise<Result<void, DomainError>> {
    const existing = await this.productRepo.findById(id);
    if (!existing || existing.deletedAt !== null) {
      return err(Errors.NOT_FOUND('Product'));
    }
    await this.productRepo.delete(id);
    return ok(undefined);
  }

  async listCategories(): Promise<Result<Category[], DomainError>> {
    const categories = await this.productRepo.findCategories();
    return ok(categories);
  }
}
