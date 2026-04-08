'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SUPPORT', 'VENDOR', 'CUSTOMER'] as const;

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(ROLES),
  isActive: z.boolean(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  phone?: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    apiClient
      .get<{ data: User }>(`/users/${id}`)
      .then(({ data }) => {
        setUser(data.data);
        reset({
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          role: data.data.role as (typeof ROLES)[number],
          isActive: data.data.isActive,
          phone: data.data.phone ?? '',
        });
      })
      .catch(() => router.push('/users'))
      .finally(() => setLoadingUser(false));
  }, [id, reset, router]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSaveSuccess(false);
    try {
      const { data } = await apiClient.put<{ data: User }>(`/users/${id}`, values);
      setUser(data.data);
      setSaveSuccess(true);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Failed to update user.';
      setServerError(msg);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        description={`Edit account details and role — ${user.email}`}
      />

      {/* Info bar */}
      <Card className="p-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">Email:</strong> {user.email}
        </span>
        <span>
          <strong className="text-foreground">Orders:</strong> {user._count?.orders ?? 0}
        </span>
        <span>
          <strong className="text-foreground">Joined:</strong> {formatDate(user.createdAt)}
        </span>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">First Name</label>
              <Input {...register('firstName')} />
              {errors.firstName && (
                <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Last Name</label>
              <Input {...register('lastName')} />
              {errors.lastName && (
                <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
            <Input type="tel" {...register('phone')} />
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
            <p className="text-xs text-muted-foreground mt-1">
              Changing role immediately affects what this user can access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Account Status</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded" />
              <span className="text-sm text-muted-foreground">Active</span>
            </label>
            <Badge variant={user.isActive ? 'success' : 'destructive'} className="text-xs">
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">
              {serverError}
            </p>
          )}
          {saveSuccess && (
            <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 rounded-lg px-4 py-2">
              User updated successfully.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/users')}>
              Back to Users
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
