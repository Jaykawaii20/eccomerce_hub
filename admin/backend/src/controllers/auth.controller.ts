import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../validators/auth.validator';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/async-handler';
import { AuthenticatedRequest } from '../types';

const authService = new AuthService(new UserRepository());

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    sendSuccess(res, { data: result.value, status: 201 });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', result.value.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, { data: result.value });
  }),

  logout: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const token = req.headers.authorization?.slice(7) ?? '';
    await authService.logout(token);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
    });
    sendSuccess(res, { data: null, status: 200 });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies['refreshToken'] as string | undefined;
    if (!refreshToken) {
      sendError(res, { code: 'MISSING_REFRESH_TOKEN', message: 'Refresh token not provided.', status: 401 });
      return;
    }
    const result = await authService.refreshSession(refreshToken);
    if (result.isErr()) {
      sendError(res, { code: result.error.code, message: result.error.message, status: result.error.httpStatus });
      return;
    }
    res.cookie('refreshToken', result.value.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Include refreshToken in body so the Next.js proxy can set the cookie reliably
    sendSuccess(res, { data: { accessToken: result.value.accessToken, refreshToken: result.value.refreshToken, expiresIn: result.value.expiresIn } });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    await authService.forgotPassword(email);
    // Always return success to prevent email enumeration
    sendSuccess(res, { data: { message: 'If an account exists, a reset email has been sent.' } });
  }),

  me: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    sendSuccess(res, { data: req.user });
  }),
};
