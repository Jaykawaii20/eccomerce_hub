'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Upload, Search, Trash2, Copy, Image as ImageIcon, FileText, Video } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface MediaFile {
  id: string;
  publicUrl: string;
  mimeType: string;
  altText: string | null;
  size: number;
  createdAt: string;
  path: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-muted-foreground" />;
  if (mimeType.startsWith('video/')) return <Video className="h-8 w-8 text-muted-foreground" />;
  return <FileText className="h-8 w-8 text-muted-foreground" />;
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const { data } = await apiClient.get<{ data: MediaFile[] }>(`/media?${params}`);
      setFiles(data.data ?? []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(fileList).forEach((f) => formData.append('files', f));
      await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchFiles();
    } catch {
      // silent — toast would go here
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/media/${deleteTarget.id}`);
      setFiles((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    } finally {
      setDeleteTarget(null);
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Media Library" description="Manage uploaded images and files">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={handleUpload}
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading…' : 'Upload files'}
        </Button>
      </PageHeader>

      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No files uploaded yet.</p>
          <Button className="mt-4" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Upload your first file
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden group relative">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {file.mimeType.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.publicUrl}
                    alt={file.altText ?? file.path}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MediaIcon mimeType={file.mimeType} />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{file.path.split('/').pop()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.size)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(file.createdAt)}</p>
              </div>
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  onClick={() => copyUrl(file.publicUrl)}
                  title="Copy URL"
                >
                  {copied === file.publicUrl ? (
                    <span className="text-xs">✓</span>
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7"
                  onClick={() => setDeleteTarget(file)}
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Badge variant="secondary" className="absolute bottom-10 left-2 text-xs">
                {file.mimeType.split('/')[1].toUpperCase()}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete file?"
        description={`"${deleteTarget?.path.split('/').pop()}" will be permanently removed and unlinked from any content using it.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
