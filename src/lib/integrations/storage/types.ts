export interface UploadResult {
  url: string;
  key: string;
}

export interface IStorageAdapter {
  uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<UploadResult>;
  deleteFile(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
