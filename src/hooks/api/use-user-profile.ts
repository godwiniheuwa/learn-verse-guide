
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type UserProfileFormData = {
  phone: string | null;
  date_of_birth: string | null;
  location: string | null;
  address: string | null;
  avatar_url: string | null;
};

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch the user profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Update user profile
  const updateProfile = useMutation({
    mutationFn: async (profileData: UserProfileFormData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating user profile:', error);
        throw new Error(error.message);
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Upload avatar
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Reset progress
      setUploadProgress(0);

      // Create upload options without onProgress
      const options = {
        cacheControl: '3600',
        upsert: true
      };

      // Track progress manually using an XMLHttpRequest
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(percent));
        }
      });
      
      // Upload using standard method
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, options);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploadProgress(0);
    }
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    uploadProgress,
  };
};
