import { createClient } from './client';

export const setupAvatarBucket = async () => {
  const supabase = createClient();
  
  // Create the avatars bucket if it doesn't exist
  const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
    public: true, // Make the bucket public to allow direct URL access
  });
  
  if (createBucketError && createBucketError.message !== 'Bucket already exists') {
    console.error('Error creating avatars bucket:', createBucketError);
    throw createBucketError;
  }
  
  // Set bucket policies to allow users to upload and view their own avatars
  // This is typically done through the Supabase dashboard, but policies are set up in the database
};

export const uploadAvatar = async (userId: string, file: File) => {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Only image files (jpeg, png, webp) are allowed');
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }

  // Upload file to Supabase storage
  const { error: uploadError, data } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
  
  return {
    filePath,
    publicUrl: publicUrlData?.publicUrl
  };
};