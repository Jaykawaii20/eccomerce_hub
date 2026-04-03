'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';
import { slugify } from '@/lib/utils';
import { useStoreSettings } from '@/hooks/use-store-settings';
import { ArrowLeft, Save } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  sku: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  salePrice: z.coerce.number().optional(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  type: z.enum(['SIMPLE', 'VARIABLE', 'VIRTUAL', 'DOWNLOADABLE']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  manageStock: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currency, currencySymbol } = useStoreSettings();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'SIMPLE',
      status: 'DRAFT',
      manageStock: true,
      isFeatured: false,
      stockQuantity: 0,
    },
  });

  useEffect(() => {
    apiClient
      .get<{ data: FormData & { price: number; salePrice?: number } }>(`/products/${id}`)
      .then((r) => {
        const p = r.data.data;
        reset({
          ...p,
          price: p.price / 100,
          salePrice: p.salePrice ? p.salePrice / 100 : undefined,
        });
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setLoadingProduct(false));
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...data,
        price: Math.round(data.price * 100),
        salePrice: data.salePrice ? Math.round(data.salePrice * 100) : undefined,
      };
      await apiClient.put(`/products/${id}`, payload);
      router.push('/products');
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Failed to save product.'
      );
      setSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Edit Product"
        description="Update product information"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Blue Running Shoes"
                  {...register('name')}
                  onChange={(e) => {
                    register('name').onChange(e);
                    setValue('slug', slugify(e.target.value));
                  }}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" placeholder="blue-running-shoes" {...register('slug')} />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  placeholder="Brief product summary…"
                  rows={2}
                  {...register('shortDescription')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  placeholder="Full product description…"
                  rows={6}
                  {...register('description')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="price">Regular Price ({currencySymbol}) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    {currencySymbol}
                  </span>
                  <Input id="price" type="number" step="0.01" placeholder="0.00" className="pl-8" {...register('price')} />
                </div>
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="salePrice">Sale Price ({currencySymbol})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    {currencySymbol}
                  </span>
                  <Input id="salePrice" type="number" step="0.01" placeholder="0.00" className="pl-8" {...register('salePrice')} />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Currency: {currency}. Prices are stored in cents internally.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="PROD-001" {...register('sku')} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Manage Stock</p>
                  <p className="text-xs text-muted-foreground">Track inventory for this product</p>
                </div>
                <Switch
                  checked={watch('manageStock')}
                  onCheckedChange={(v) => setValue('manageStock', v)}
                />
              </div>
              {watch('manageStock') && (
                <div className="space-y-1">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input id="stockQuantity" type="number" min="0" {...register('stockQuantity')} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Publish Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(v) => setValue('status', v as FormData['status'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Product Type</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(v) => setValue('type', v as FormData['type'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIMPLE">Simple</SelectItem>
                    <SelectItem value="VARIABLE">Variable</SelectItem>
                    <SelectItem value="VIRTUAL">Virtual</SelectItem>
                    <SelectItem value="DOWNLOADABLE">Downloadable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-xs text-muted-foreground">Show on homepage</p>
                </div>
                <Switch
                  checked={watch('isFeatured')}
                  onCheckedChange={(v) => setValue('isFeatured', v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
