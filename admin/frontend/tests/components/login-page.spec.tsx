import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/(auth)/login/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

// Mock auth store
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({
    login: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
  }),
}));

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
  });

  it('shows validation errors on empty submit', async () => {
    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeDefined();
    });
  });
});
