'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPPORT', 'VENDOR', 'CUSTOMER'] as const;

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Valid email required'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(ROLES),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewUserPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CUSTOMER' },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await apiClient.post('/users', values);
      router.push('/users');
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Failed to create user.';
      setServerError(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="New User" description="Create a new user account and assign a role" />

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">First Name</label>
              <Input placeholder="John" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last Name</label>
              <Input placeholder="Doe" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address</label>
            <Input type="email" placeholder="user@example.com" {...register('email')} />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <Input type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" {...register('password')} />
            {errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <select
              {...register('role')}
              className="w-full h-10 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.replace('_', ' ')}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-destructive mt-1">{errors.role.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
            <Input type="tel" placeholder="+1 555 000 0000" {...register('phone')} />
          </div>

          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">
              {serverError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
            >
              {isSubmitting ? 'Creating…' : 'Create User'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/users')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
