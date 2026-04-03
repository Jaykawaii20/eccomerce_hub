'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status !== 'all') params.set('status', status);
      const { data } = await apiClient.get<{ data: Product[] }>(`/products?${params}`);
      setProducts(data.data ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

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

      {loading ? (
        <DataTableSkeleton columns={6} />
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
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
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
