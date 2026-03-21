import { ENDPOINTS } from '@supportops/types';
import type { UploadedFile, UploadFilesResponse } from '@supportops/types';
import { apiClient } from '../../../lib/api/apiClient';

export const fileService = {
  async uploadFiles(files: File[]): Promise<UploadedFile[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await apiClient.upload<UploadFilesResponse>(
      ENDPOINTS.FILES.UPLOAD,
      formData,
    );

    return response.data.files;
  },

  async deleteFile(fileId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.FILES.DELETE(fileId));
  },

  async getAccessUrl(url: string, expiresInSeconds = 300): Promise<string> {
    const response = await apiClient.get<{ url: string; expiresAt: string }>(
      ENDPOINTS.FILES.ACCESS_URL,
      {
        params: { url, expiresInSeconds },
      },
    );
    return response.data.url;
  },
};
