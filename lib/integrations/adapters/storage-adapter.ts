export interface IStorageAdapter {
  uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<boolean>;
  getFileUrl(fileName: string): Promise<string>;
}
