'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { apiClient } from '@/lib/api-client';
import { slugify } from '@/lib/utils';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  parent?: { name: string } | null;
  _count?: { products: number };
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  parentId: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  description: '',
  parentId: '',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const { data } = await apiClient.get<{ data: Category[] }>(`/categories?${params}`);
      setCategories(data.data ?? []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      parentId: cat.parentId ?? '',
    });
    setOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugify(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name.trim()),
        description: form.description.trim() || null,
        parentId: form.parentId || null,
      };
      if (editingId) {
        await apiClient.put(`/categories/${editingId}`, payload);
        toast({ title: 'Category updated' });
      } else {
        await apiClient.post('/categories', payload);
        toast({ title: 'Category created' });
      }
      setOpen(false);
      fetchCategories();
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description:
          (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data
            ?.error?.message ?? 'Failed to save category',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/categories/${deleteId}`);
      toast({ title: 'Category deleted' });
      fetchCategories();
    } catch {
      toast({ title: 'Failed to delete category', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  const parentOptions = categories.filter((c) => c.id !== editingId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize products into hierarchical categories"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        }
      />

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <DataTableSkeleton columns={6} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableEmpty>No categories found.</TableEmpty>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {cat.slug}
                    </TableCell>
                    <TableCell className="text-sm">{cat._count?.products ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cat.parent?.name ?? <span className="italic">None</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cat.isActive ? 'success' : 'secondary'}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(cat.id)}
                        >
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

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Women's Clothing"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                placeholder="womens-clothing"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from name. Edit if needed.
              </p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="cat-desc">Description</Label>
              <Input
                id="cat-desc"
                placeholder="Optional description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Parent Category</Label>
              <Select
                value={form.parentId || 'none'}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, parentId: v === 'none' ? '' : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {parentOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete category"
        description="This will permanently delete the category. Products in this category will become uncategorized."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
