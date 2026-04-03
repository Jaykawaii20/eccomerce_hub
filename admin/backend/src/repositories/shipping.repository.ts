import { ShippingZone, ShippingMethod } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface CreateZoneInput {
  name: string;
  isDefault?: boolean;
}

export interface UpdateZoneInput {
  name?: string;
  isDefault?: boolean;
}

export interface CreateMethodInput {
  name: string;
  type: 'FLAT_RATE' | 'FREE_SHIPPING' | 'LOCAL_PICKUP';
  cost: number;
  minOrderAmount?: number;
  isActive?: boolean;
}

export interface UpdateMethodInput {
  name?: string;
  type?: 'FLAT_RATE' | 'FREE_SHIPPING' | 'LOCAL_PICKUP';
  cost?: number;
  minOrderAmount?: number;
  isActive?: boolean;
}

export type ZoneWithDetails = ShippingZone & {
  regions: { id: string; countryCode: string; stateCode: string | null }[];
  methods: ShippingMethod[];
};

export interface IShippingRepository {
  findAllZones(): Promise<ZoneWithDetails[]>;
  findZoneById(id: string): Promise<ZoneWithDetails | null>;
  createZone(data: CreateZoneInput): Promise<ZoneWithDetails>;
  updateZone(id: string, data: UpdateZoneInput): Promise<ZoneWithDetails>;
  deleteZone(id: string): Promise<void>;
  addMethod(zoneId: string, data: CreateMethodInput): Promise<ShippingMethod>;
  updateMethod(id: string, data: UpdateMethodInput): Promise<ShippingMethod>;
  deleteMethod(id: string): Promise<void>;
}

const zoneInclude = {
  regions: {
    select: { id: true, countryCode: true, stateCode: true },
  },
  methods: true,
};

export class ShippingRepository implements IShippingRepository {
  async findAllZones(): Promise<ZoneWithDetails[]> {
    return prisma.shippingZone.findMany({
      include: zoneInclude,
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    }) as Promise<ZoneWithDetails[]>;
  }

  async findZoneById(id: string): Promise<ZoneWithDetails | null> {
    return prisma.shippingZone.findUnique({
      where: { id },
      include: zoneInclude,
    }) as Promise<ZoneWithDetails | null>;
  }

  async createZone(data: CreateZoneInput): Promise<ZoneWithDetails> {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.shippingZone.updateMany({ data: { isDefault: false } });
      }
      return tx.shippingZone.create({
        data,
        include: zoneInclude,
      });
    }) as Promise<ZoneWithDetails>;
  }

  async updateZone(id: string, data: UpdateZoneInput): Promise<ZoneWithDetails> {
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.shippingZone.updateMany({ where: { id: { not: id } }, data: { isDefault: false } });
      }
      return tx.shippingZone.update({
        where: { id },
        data,
        include: zoneInclude,
      });
    }) as Promise<ZoneWithDetails>;
  }

  async deleteZone(id: string): Promise<void> {
    await prisma.shippingZone.delete({ where: { id } });
  }

  async addMethod(zoneId: string, data: CreateMethodInput): Promise<ShippingMethod> {
    return prisma.shippingMethod.create({
      data: { ...data, shippingZoneId: zoneId },
    });
  }

  async updateMethod(id: string, data: UpdateMethodInput): Promise<ShippingMethod> {
    return prisma.shippingMethod.update({ where: { id }, data });
  }

  async deleteMethod(id: string): Promise<void> {
    await prisma.shippingMethod.delete({ where: { id } });
  }
}
