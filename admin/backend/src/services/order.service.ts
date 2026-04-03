import { Result, ok, err } from 'neverthrow';
import { Order, OrderNote, OrderStatus } from '@prisma/client';
import { IOrderRepository } from '../repositories/order.repository';
import { DomainError, Errors } from '../utils/result';
import { ListOrdersInput } from '../validators/order.validator';

export interface OrderListResult {
  data: Order[];
  total: number;
}

export class OrderService {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async list(params: ListOrdersInput): Promise<Result<OrderListResult, DomainError>> {
    const result = await this.orderRepo.findAll(params);
    return ok(result);
  }

  async getById(id: string): Promise<Result<Order, DomainError>> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      return err(Errors.NOT_FOUND('Order'));
    }
    return ok(order);
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    comment: string | undefined,
    userId: string
  ): Promise<Result<Order, DomainError>> {
    const existing = await this.orderRepo.findById(id);
    if (!existing) {
      return err(Errors.NOT_FOUND('Order'));
    }
    const updated = await this.orderRepo.updateStatus(id, status, comment, userId);
    return ok(updated);
  }

  async addNote(
    orderId: string,
    note: string,
    isCustomerNote: boolean,
    userId: string
  ): Promise<Result<OrderNote, DomainError>> {
    const existing = await this.orderRepo.findById(orderId);
    if (!existing) {
      return err(Errors.NOT_FOUND('Order'));
    }
    const orderNote = await this.orderRepo.addNote(orderId, note, isCustomerNote, userId);
    return ok(orderNote);
  }
}
