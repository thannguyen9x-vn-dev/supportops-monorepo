export interface IStorageService {
  /**
   * Upload a file and return its public URL
   * @param objectKey - Unique key/path for the file
   * @param content - File content as Buffer
   * @returns Public URL of the uploaded file
   */
  uploadPublicObject(objectKey: string, content: Buffer): Promise<string>;

  /**
   * Delete a file by its URL
   * @param url - Public URL of the file to delete
   */
  deleteObjectByUrl(url: string | null | undefined): Promise<void>;

  /**
   * Create a temporary signed URL for accessing a file
   * @param url - Original file URL
   * @param expiresInSeconds - Expiration time in seconds
   * @returns Signed URL with expiration
   */
  createTemporaryReadUrlFromUrl(url: string, expiresInSeconds: number): string;
}
