import { Result, ok, err } from 'neverthrow';
import { User } from '@prisma/client';
import { ICustomerRepository, CustomerListParams } from '../repositories/customer.repository';
import { DomainError, Errors } from '../utils/result';

export interface CustomerListResult {
  data: User[];
  total: number;
}

export class CustomerService {
  constructor(private readonly customerRepo: ICustomerRepository) {}

  async list(params: CustomerListParams): Promise<Result<CustomerListResult, DomainError>> {
    const result = await this.customerRepo.findAll(params);
    return ok(result);
  }

  async getById(id: string): Promise<Result<User, DomainError>> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      return err(Errors.NOT_FOUND('Customer'));
    }
    return ok(customer);
  }

  async toggleActive(id: string, isActive: boolean): Promise<Result<User, DomainError>> {
    const existing = await this.customerRepo.findById(id);
    if (!existing) {
      return err(Errors.NOT_FOUND('Customer'));
    }
    const updated = await this.customerRepo.update(id, { isActive });
    return ok(updated);
  }
}
