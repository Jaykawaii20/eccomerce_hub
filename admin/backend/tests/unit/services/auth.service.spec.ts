import { AuthService } from '../../../src/services/auth.service';
import { IUserRepository } from '../../../src/repositories/user.repository';
import { UserRole } from '@prisma/client';

// Mock Supabase
jest.mock('../../../src/config/supabase', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: jest.fn(),
        signOut: jest.fn(),
      },
      signInWithPassword: jest.fn(),
      refreshSession: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

import { supabaseAdmin } from '../../../src/config/supabase';

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findBySupabaseId: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

const mockUser = {
  id: 'user-1',
  supabaseId: 'supabase-1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: null,
  avatarUrl: null,
  role: UserRole.CUSTOMER,
  isActive: true,
  emailVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(mockUserRepo);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('returns conflict error if email already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'Password1',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('CONFLICT');
        expect(result.error.httpStatus).toBe(409);
      }
    });

    it('returns auth error if Supabase createUser fails', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      (supabaseAdmin.auth.admin.createUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already registered' },
      });

      const result = await service.register({
        email: 'new@example.com',
        password: 'Password1',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(result.isErr()).toBe(true);
    });

    it('creates user and returns tokens on success', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(mockUser);
      (supabaseAdmin.auth.admin.createUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'supabase-1' } },
        error: null,
      });
      (supabaseAdmin.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
          },
        },
        error: null,
      });

      const result = await service.register({
        email: 'new@example.com',
        password: 'Password1',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.tokens.accessToken).toBe('access-token');
        expect(result.value.user.email).toBe('test@example.com');
      }
    });
  });

  describe('login', () => {
    it('returns invalid credentials on Supabase error', async () => {
      (supabaseAdmin.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid login credentials' },
      });

      const result = await service.login({ email: 'test@example.com', password: 'wrong' });
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('INVALID_CREDENTIALS');
        expect(result.error.httpStatus).toBe(401);
      }
    });

    it('returns tokens on successful login', async () => {
      (supabaseAdmin.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'supabase-1' },
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
          },
        },
        error: null,
      });
      mockUserRepo.findBySupabaseId.mockResolvedValue(mockUser);

      const result = await service.login({ email: 'test@example.com', password: 'Password1' });
      expect(result.isOk()).toBe(true);
    });
  });
});
