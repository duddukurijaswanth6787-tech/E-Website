import api from '../client';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export const uploadService = {
  /**
   * Upload a single image
   * @param file File to upload
   * @param folder Folder name (optional)
   */
  uploadSingle: async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const url = folder ? `/uploads/single?folder=${folder}` : '/uploads/single';
    return api.post<any>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload multiple images
   */
  uploadMultiple: async (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    
    const url = folder ? `/uploads/multiple?folder=${folder}` : '/uploads/multiple';
    return api.post<UploadResponse[]>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get files from library
   */
  getLibrary: async (folder?: string) => {
    const url = folder ? `/uploads/library?folder=${folder}` : '/uploads/library';
    return api.get<any>(url);
  },
};
