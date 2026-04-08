'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { apiClient } from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Pencil, Trash2, ImageOff } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  type: string;
  price: number;
  stockQuantity: number;
  featuredImageUrl: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, 'default' | 'success' | 'secondary' | 'warning'> = {
  PUBLISHED: 'success',
  DRAFT: 'warning',
  ARCHIVED: 'secondary',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounce search: only update debouncedSearch 350ms after the user stops typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    // Cancel any in-flight request before starting a new one
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setFetchError(false);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status !== 'all') params.set('status', status);
      const { data } = await apiClient.get<{ data: Product[] }>(
        `/products?${params}`,
        { signal: abortRef.current.signal }
      );
      setProducts(data.data ?? []);
    } catch (err: unknown) {
      // Ignore abort errors — they're intentional cancellations
      if ((err as { code?: string })?.code === 'ERR_CANCELED') return;
      setFetchError(true);
      // Keep previous products visible instead of blanking the list
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiClient.delete(`/products/${deleteId}`);
    setDeleteId(null);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <Button asChild>
            <Link href="/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {fetchError && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3 flex items-center gap-2">
          <span>Failed to load products. Showing last known results.</span>
          <button onClick={fetchProducts} className="underline font-medium">Retry</button>
        </div>
      )}

      {loading && products.length === 0 ? (
        <DataTableSkeleton columns={6} />
      ) : loading ? (
        // Keep the table visible with a subtle top-bar spinner while refreshing
        <div className="space-y-2">
          <div className="h-1 w-full rounded-full bg-primary/20 overflow-hidden">
            <div className="h-full bg-primary animate-pulse rounded-full" />
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} className="opacity-50">
                    <TableCell>
                      {p.featuredImageUrl ? (
                        <img src={p.featuredImageUrl} alt={p.name} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                          <ImageOff className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{p.sku ?? '—'}</TableCell>
                    <TableCell><Badge variant={STATUS_COLORS[p.status]}>{p.status}</Badge></TableCell>
                    <TableCell>{formatCurrency(p.price)}</TableCell>
                    <TableCell>{p.stockQuantity}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(p.createdAt)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableEmpty>
                  No products yet.{' '}
                  <Link href="/products/new" className="text-primary underline">
                    Add your first product.
                  </Link>
                </TableEmpty>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.featuredImageUrl ? (
                        <img
                          src={p.featuredImageUrl}
                          alt={p.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 7v10c0 1.104.896 2 2 2h14c1.104 0 2-.896 2-2V7c0-1.104-.896-2-2-2H5c-1.104 0-2 .896-2 2z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 7l6 6 4-4 6 6"
                            />
                          </svg>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {p.sku ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[p.status]}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(p.price)}</TableCell>
                    <TableCell>
                      <span className={p.stockQuantity <= 5 ? 'text-destructive font-medium' : ''}>
                        {p.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(p.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/products/${p.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete product"
        description="This will permanently delete the product and all its variants. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
