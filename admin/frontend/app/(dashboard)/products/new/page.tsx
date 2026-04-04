'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Save, ImageIcon } from 'lucide-react';

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

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currency, currencySymbol } = useStoreSettings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');

  useEffect(() => {
    apiClient.get('/products/categories').then((res) => {
      setCategories((res.data as { data: Category[] }).data ?? []);
    }).catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...data,
        price: Math.round(data.price * 100),
        salePrice: data.salePrice ? Math.round(data.salePrice * 100) : undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
        featuredImageUrl: featuredImageUrl.trim() || undefined,
      };
      await apiClient.post('/products', payload);
      router.push('/products');
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Failed to save product.'
      );
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Add Product"
        description="Create a new product in your catalog"
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
              {saving ? 'Saving…' : 'Save Product'}
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
        {/* Main content */}
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

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="featuredImageUrl">Image URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="featuredImageUrl"
                      placeholder="https://example.com/image.jpg"
                      className="pl-9"
                      value={featuredImageUrl}
                      onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Paste an image URL. Use Supabase Storage or any public image host.</p>
              </div>
              {featuredImageUrl && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImageUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
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
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    {...register('price')}
                  />
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
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    {...register('salePrice')}
                  />
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
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    {...register('stockQuantity')}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
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

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No categories yet.{' '}
                  <Link href="/categories" className="text-primary underline-offset-4 hover:underline">
                    Create one
                  </Link>
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        id={`cat-${cat.id}`}
                        checked={selectedCategoryIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 select-none">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {selectedCategoryIds.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedCategoryIds.length} selected
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
