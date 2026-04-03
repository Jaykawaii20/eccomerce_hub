'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_CART' | 'FIXED_PRODUCT';
  amount: number;
  usedCount: number;
  usageLimitTotal: number | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const schema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED_CART', 'FIXED_PRODUCT']),
  amount: z.coerce.number().positive('Amount must be positive'),
  usageLimitTotal: z.coerce.number().int().positive().optional().or(z.literal('')),
  expiresAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function formatDiscount(c: Coupon): string {
  return c.type === 'PERCENTAGE' ? `${c.amount}%` : formatCurrency(c.amount);
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'PERCENTAGE' },
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: Coupon[] }>('/coupons');
      setCoupons(data.data ?? []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        usageLimitTotal: data.usageLimitTotal === '' ? undefined : data.usageLimitTotal,
        amount:
          data.type === 'PERCENTAGE' ? data.amount : Math.round(Number(data.amount) * 100),
      };
      await apiClient.post('/coupons', payload);
      reset();
      setOpen(false);
      fetchCoupons();
      toast({ title: 'Coupon created' });
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description:
          (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data
            ?.error?.message ?? 'Failed to create coupon',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiClient.delete(`/coupons/${deleteId}`);
    setDeleteId(null);
    fetchCoupons();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        description="Create and manage discount codes"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </Button>
        }
      />

      {loading ? (
        <DataTableSkeleton columns={6} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableEmpty>No coupons yet.</TableEmpty>
              ) : (
                coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-sm">{c.code}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(c.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.type.replace('_', ' ')}</TableCell>
                    <TableCell className="font-medium">{formatDiscount(c)}</TableCell>
                    <TableCell className="text-sm">
                      {c.usedCount}
                      {c.usageLimitTotal ? ` / ${c.usageLimitTotal}` : ''}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.expiresAt ? formatDate(c.expiresAt) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.isActive ? 'success' : 'secondary'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                placeholder="SAVE20"
                className="font-mono uppercase"
                {...register('code')}
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Type *</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(v) => setValue('type', v as FormData['type'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED_CART">Fixed Cart ($)</SelectItem>
                    <SelectItem value="FIXED_PRODUCT">Fixed Product ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step={watch('type') === 'PERCENTAGE' ? '1' : '0.01'}
                  placeholder={watch('type') === 'PERCENTAGE' ? '20' : '10.00'}
                  {...register('amount')}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="usageLimitTotal">Usage Limit</Label>
                <Input
                  id="usageLimitTotal"
                  type="number"
                  placeholder="Unlimited"
                  {...register('usageLimitTotal')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="expiresAt">Expires At</Label>
                <Input id="expiresAt" type="date" {...register('expiresAt')} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating…' : 'Create Coupon'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete coupon"
        description="This will permanently delete the coupon code and it will no longer be usable."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
