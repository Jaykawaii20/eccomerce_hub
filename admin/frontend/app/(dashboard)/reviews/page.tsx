'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: string;
  product: { name: string };
  user: { firstName: string; lastName: string; email: string };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-sm tracking-tight" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? 'text-yellow-500' : 'text-muted-foreground/40'}>
          {i < rating ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}

function ratingVariant(rating: number): 'success' | 'warning' | 'destructive' {
  if (rating >= 4) return 'success';
  if (rating === 3) return 'warning';
  return 'destructive';
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [approvedFilter, setApprovedFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (approvedFilter === 'approved') params.set('isApproved', 'true');
      if (approvedFilter === 'pending') params.set('isApproved', 'false');
      const { data } = await apiClient.get<{ data: Review[] }>(`/reviews?${params}`);
      setReviews(data.data ?? []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [search, approvedFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleApprove = async (review: Review) => {
    setTogglingId(review.id);
    try {
      await apiClient.patch(`/reviews/${review.id}/approve`, {
        isApproved: !review.isApproved,
      });
      toast({
        title: review.isApproved ? 'Review unapproved' : 'Review approved',
      });
      fetchReviews();
    } catch {
      toast({ title: 'Failed to update review', variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/reviews/${deleteId}`);
      toast({ title: 'Review deleted' });
      fetchReviews();
    } catch {
      toast({ title: 'Failed to delete review', variant: 'destructive' });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="Moderate product reviews and ratings" />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={approvedFilter}
            onValueChange={(v) =>
              setApprovedFilter(v as 'all' | 'pending' | 'approved')
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All reviews" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reviews</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <DataTableSkeleton columns={7} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableEmpty>No reviews found.</TableEmpty>
              ) : (
                reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-sm max-w-[140px] truncate">
                      {r.product.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {r.user.firstName} {r.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{r.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StarRating rating={r.rating} />
                        <Badge variant={ratingVariant(r.rating)} className="w-fit text-xs px-1.5 py-0">
                          {r.rating}/5
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {r.title && (
                        <p className="font-medium text-sm truncate">{r.title}</p>
                      )}
                      {r.body && (
                        <p className="text-xs text-muted-foreground truncate">{r.body}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.isVerified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Unverified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.isApproved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="warning">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={togglingId === r.id}
                          onClick={() => handleToggleApprove(r)}
                          title={r.isApproved ? 'Unapprove' : 'Approve'}
                        >
                          {r.isApproved ? (
                            <XCircle className="h-4 w-4 text-warning" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-success" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(r.id)}
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

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete review"
        description="This will permanently delete the review. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
