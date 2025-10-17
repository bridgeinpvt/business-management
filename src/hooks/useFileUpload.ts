import { useState } from 'react';

interface UseFileUploadProps {
  purpose?: string;
  onSuccess?: (response: { url: string; id: string }) => void;
}

export const useFileUpload = ({ purpose, onSuccess }: UseFileUploadProps = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (purpose) {
        formData.append('purpose', purpose);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadProgress(100);

      if (onSuccess && data.url) {
        onSuccess({ url: data.url, id: data.id || '' });
      }

      return { success: true, url: data.url, id: data.id };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFiles = async (files: File[]) => {
    const results = await Promise.all(files.map(file => uploadFile(file)));
    return { success: results.every(r => r.success), files: results };
  };

  return { uploadFile, uploadFiles, isUploading, uploadProgress, error, setError };
};
