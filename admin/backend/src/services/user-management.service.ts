import { Result, ok, err } from 'neverthrow';
import { User, UserRole } from '@prisma/client';
import { supabaseAdmin } from '../config/supabase';
import {
  IUserManagementRepository,
  UserListParams,
  CreateUserData,
  UpdateUserData,
} from '../repositories/user-management.repository';
import { DomainError, Errors } from '../utils/result';

export interface UserListResult {
  data: User[];
  total: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export class UserManagementService {
  constructor(private readonly repo: IUserManagementRepository) {}

  async list(params: UserListParams): Promise<Result<UserListResult, DomainError>> {
    const result = await this.repo.findAll(params);
    return ok(result);
  }

  async getById(id: string): Promise<Result<User, DomainError>> {
    const user = await this.repo.findById(id);
    if (!user) return err(Errors.NOT_FOUND('User'));
    return ok(user);
  }

  async create(input: CreateUserInput): Promise<Result<User, DomainError>> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      return err(Errors.CONFLICT('An account with this email already exists.'));
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    });

    if (error || !data.user) {
      return err({ code: 'AUTH_ERROR', message: error?.message ?? 'Failed to create user.', httpStatus: 400 });
    }

    const createData: CreateUserData = {
      supabaseId: data.user.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      ...(input.phone ? { phone: input.phone } : {}),
    };

    const user = await this.repo.create(createData);
    return ok(user);
  }

  async update(id: string, data: UpdateUserData): Promise<Result<User, DomainError>> {
    const existing = await this.repo.findById(id);
    if (!existing) return err(Errors.NOT_FOUND('User'));

    const updated = await this.repo.update(id, data);
    return ok(updated);
  }

  async delete(id: string, requestingUserId: string): Promise<Result<void, DomainError>> {
    if (id === requestingUserId) {
      return err({ code: 'BUSINESS_RULE_VIOLATION', message: 'You cannot delete your own account.', httpStatus: 422 });
    }

    const user = await this.repo.findById(id);
    if (!user) return err(Errors.NOT_FOUND('User'));

    // Revoke Supabase session
    await supabaseAdmin.auth.admin.deleteUser(user.supabaseId).catch(() => null);

    await this.repo.softDelete(id);
    return ok(undefined);
  }
}
