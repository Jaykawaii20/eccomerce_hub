'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/table';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Search, Eye } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  _count?: { orders: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await apiClient.get<{ data: Customer[] }>(`/customers${params}`);
      setCustomers(data.data ?? []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="View and manage customer accounts" />

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <DataTableSkeleton columns={5} />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableEmpty>No customers found.</TableEmpty>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {c.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.emailVerified ? (
                        <Badge variant="success" className="text-xs">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{c._count?.orders ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/customers/${c.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
