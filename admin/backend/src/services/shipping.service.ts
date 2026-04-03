import { Result, ok, err } from 'neverthrow';
import { ShippingMethod } from '@prisma/client';
import {
  IShippingRepository,
  ZoneWithDetails,
  CreateZoneInput,
  UpdateZoneInput,
  CreateMethodInput,
  UpdateMethodInput,
} from '../repositories/shipping.repository';
import { DomainError, Errors } from '../utils/result';

export class ShippingService {
  constructor(private readonly shippingRepo: IShippingRepository) {}

  async listZones(): Promise<Result<ZoneWithDetails[], DomainError>> {
    const zones = await this.shippingRepo.findAllZones();
    return ok(zones);
  }

  async getZone(id: string): Promise<Result<ZoneWithDetails, DomainError>> {
    const zone = await this.shippingRepo.findZoneById(id);
    if (!zone) return err(Errors.NOT_FOUND('Shipping zone'));
    return ok(zone);
  }

  async createZone(data: CreateZoneInput): Promise<Result<ZoneWithDetails, DomainError>> {
    const zone = await this.shippingRepo.createZone(data);
    return ok(zone);
  }

  async updateZone(id: string, data: UpdateZoneInput): Promise<Result<ZoneWithDetails, DomainError>> {
    const existing = await this.shippingRepo.findZoneById(id);
    if (!existing) return err(Errors.NOT_FOUND('Shipping zone'));
    const zone = await this.shippingRepo.updateZone(id, data);
    return ok(zone);
  }

  async deleteZone(id: string): Promise<Result<void, DomainError>> {
    const existing = await this.shippingRepo.findZoneById(id);
    if (!existing) return err(Errors.NOT_FOUND('Shipping zone'));
    if (existing.isDefault) return err(Errors.BUSINESS_RULE('Cannot delete the default shipping zone.'));
    await this.shippingRepo.deleteZone(id);
    return ok(undefined);
  }

  async addMethod(zoneId: string, data: CreateMethodInput): Promise<Result<ShippingMethod, DomainError>> {
    const zone = await this.shippingRepo.findZoneById(zoneId);
    if (!zone) return err(Errors.NOT_FOUND('Shipping zone'));
    const method = await this.shippingRepo.addMethod(zoneId, data);
    return ok(method);
  }

  async updateMethod(methodId: string, data: UpdateMethodInput): Promise<Result<ShippingMethod, DomainError>> {
    const method = await this.shippingRepo.updateMethod(methodId, data);
    return ok(method);
  }

  async deleteMethod(methodId: string): Promise<Result<void, DomainError>> {
    await this.shippingRepo.deleteMethod(methodId);
    return ok(undefined);
  }
}
