'use client';

import { useMutation } from '@tanstack/react-query';
import { SUPABASE_FUNCTION_URL } from '@/lib/supabase';

interface UploadResponse {
  success: boolean;
  publicUrl: string;
  base64: string;
  filename: string;
  error?: string;
}

export function useImageUpload() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${SUPABASE_FUNCTION_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    },
  });
}
