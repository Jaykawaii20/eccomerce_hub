import { Result, ok, err } from 'neverthrow';
import { supabaseAdmin } from '../config/supabase';
import { IUserRepository } from '../repositories/user.repository';
import { DomainError, Errors } from '../utils/result';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { User } from '@prisma/client';
import { env } from '../config/env';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
  tokens: AuthTokens;
}

export class AuthService {
  constructor(private readonly userRepo: IUserRepository) {}

  async register(input: RegisterInput): Promise<Result<AuthResult, DomainError>> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      return err(Errors.CONFLICT('An account with this email already exists.'));
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: false,
    });

    if (error || !data.user) {
      return err({ code: 'AUTH_ERROR', message: error?.message ?? 'Registration failed.', httpStatus: 400 });
    }

    const user = await this.userRepo.create({
      supabaseId: data.user.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    // Sign in to get tokens
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (signInError || !signInData.session) {
      return err({ code: 'AUTH_ERROR', message: 'Registration succeeded but sign-in failed.', httpStatus: 500 });
    }

    return ok({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      tokens: {
        accessToken: signInData.session.access_token,
        refreshToken: signInData.session.refresh_token,
        expiresIn: signInData.session.expires_in,
      },
    });
  }

  async login(input: LoginInput): Promise<Result<AuthResult, DomainError>> {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error || !data.session) {
      return err({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.', httpStatus: 401 });
    }

    const user = await this.userRepo.findBySupabaseId(data.user.id);
    if (!user || !user.isActive) {
      return err(Errors.FORBIDDEN);
    }

    return ok({
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      tokens: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      },
    });
  }

  async logout(accessToken: string): Promise<Result<void, DomainError>> {
    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
    if (error) {
      return err({ code: 'LOGOUT_ERROR', message: error.message, httpStatus: 400 });
    }
    return ok(undefined);
  }

  async refreshSession(refreshToken: string): Promise<Result<AuthTokens, DomainError>> {
    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) {
      return err({ code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token.', httpStatus: 401 });
    }
    return ok({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
    });
  }

  async forgotPassword(email: string): Promise<Result<void, DomainError>> {
    // Always return ok to prevent email enumeration
    await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.FRONTEND_URL}/reset-password`,
    });
    return ok(undefined);
  }
}
