import { User, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findBySupabaseId(supabaseId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
  softDelete(id: string): Promise<void>;
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id, deletedAt: null } });
  }

  async findBySupabaseId(supabaseId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { supabaseId, deletedAt: null } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email, deletedAt: null } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
