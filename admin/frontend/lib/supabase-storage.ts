import { supabase } from './supabase';

export async function uploadProductImage(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session) throw new Error('User not authenticated');

  const fileExt = file.name.split('.').pop() ?? 'jpg';
  const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('Product')
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: '31536000', // 1 year — images are immutable (new path on each upload)
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // getPublicUrl returns a permanent, non-expiring URL for public buckets.
  // Product images must always be publicly accessible (shown to all store visitors).
  const { data } = supabase.storage.from('Product').getPublicUrl(filePath);
  return data.publicUrl;
}
