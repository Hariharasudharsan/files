export interface StoragePort {
  /**
   * Uploads a file to the storage bucket.
   * @param key The unique key/path where the file will be stored (e.g., "products/vadam.png")
   * @param fileBuffer The raw binary data of the file
   * @param contentType The MIME type of the file (e.g., "image/png")
   * @returns The public URL of the uploaded file
   */
  uploadFile(key: string, fileBuffer: Buffer, contentType: string): Promise<string>;

  /**
   * Deletes a file from the storage bucket.
   * @param key The unique key/path of the file to delete
   */
  deleteFile(key: string): Promise<void>;

  /**
   * Generates a temporary, signed URL for private access or secure uploads.
   * @param key The unique key/path of the file
   * @param expiresInSeconds Duration the URL is valid for
   */
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
}
