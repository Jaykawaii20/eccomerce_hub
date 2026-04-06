import { supabase } from './supabase'; 

export async function uploadProductImage(file: File) {
  try {
    // Validate file
    if (!file) throw new Error('No file provided');
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('User not authenticated');

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Product')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Check if bucket is public
    const { data: bucketData } = await supabase
      .from('storage.buckets')
      .select('public')
      .eq('name', 'Product')
      .single();

    let fileUrl;
    
    if (bucketData?.public) {
      // Public bucket - use public URL
      const { data: urlData } = supabase.storage
        .from('Product')
        .getPublicUrl(filePath);
      fileUrl = urlData.publicUrl;
    } else {
      // Private bucket - use signed URL (valid for 1 hour)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('Product')
        .createSignedUrl(filePath, 3600); // 1 hour
      
      if (signedUrlError) throw signedUrlError;
      fileUrl = signedUrlData.signedUrl;
    }

    console.log("FILE URL:", fileUrl);
    return fileUrl;

  } catch (err: any) {
    console.error("Upload error:", err.message);
    throw err;
  }
}