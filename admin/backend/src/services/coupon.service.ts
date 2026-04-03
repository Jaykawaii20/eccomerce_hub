import { Result, ok, err } from 'neverthrow';
import { Coupon } from '@prisma/client';
import { ICouponRepository } from '../repositories/coupon.repository';
import { DomainError, Errors } from '../utils/result';
import { CreateCouponInput, UpdateCouponInput, ListCouponsInput } from '../validators/coupon.validator';

export interface CouponListResult {
  data: Coupon[];
  total: number;
}

export class CouponService {
  constructor(private readonly couponRepo: ICouponRepository) {}

  async list(params: ListCouponsInput): Promise<Result<CouponListResult, DomainError>> {
    const result = await this.couponRepo.findAll(params);
    return ok(result);
  }

  async getById(id: string): Promise<Result<Coupon, DomainError>> {
    const coupon = await this.couponRepo.findById(id);
    if (!coupon) return err(Errors.NOT_FOUND('Coupon'));
    return ok(coupon);
  }

  async create(input: CreateCouponInput): Promise<Result<Coupon, DomainError>> {
    const existing = await this.couponRepo.findByCode(input.code);
    if (existing) return err(Errors.CONFLICT(`Coupon code "${input.code}" already exists.`));
    const coupon = await this.couponRepo.create(input);
    return ok(coupon);
  }

  async update(id: string, input: UpdateCouponInput): Promise<Result<Coupon, DomainError>> {
    const existing = await this.couponRepo.findById(id);
    if (!existing) return err(Errors.NOT_FOUND('Coupon'));

    if (input.code && input.code !== existing.code) {
      const codeTaken = await this.couponRepo.findByCode(input.code);
      if (codeTaken && codeTaken.id !== id) {
        return err(Errors.CONFLICT(`Coupon code "${input.code}" is already in use.`));
      }
    }

    const updated = await this.couponRepo.update(id, input);
    return ok(updated);
  }

  async delete(id: string): Promise<Result<void, DomainError>> {
    const existing = await this.couponRepo.findById(id);
    if (!existing) return err(Errors.NOT_FOUND('Coupon'));
    await this.couponRepo.delete(id);
    return ok(undefined);
  }
}
