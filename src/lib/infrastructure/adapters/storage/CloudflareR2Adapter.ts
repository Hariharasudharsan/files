import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StoragePort } from "@/lib/core/domain/ports/StoragePort";
import { Logger } from "@/lib/infrastructure/logger";

export class CloudflareR2Adapter implements StoragePort {
  private client: S3Client;
  private bucketName: string;
  private publicDomain: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.R2_BUCKET_NAME || "mathuram-assets";
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN || "https://assets.mathuramfoods.com";

    if (!accountId || !accessKeyId || !secretAccessKey) {
      Logger.warn("Cloudflare R2 credentials are missing. Storage operations will fail.");
    }

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || "",
        secretAccessKey: secretAccessKey || "",
      },
    });
  }

  async uploadFile(key: string, fileBuffer: Buffer, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.client.send(command);
      return `${this.publicDomain}/${key}`;
    } catch (error) {
      Logger.error(`Failed to upload file to R2: ${key}`, error);
      throw new Error("Storage upload failed");
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.client.send(command);
    } catch (error) {
      Logger.error(`Failed to delete file from R2: ${key}`, error);
      throw new Error("Storage delete failed");
    }
  }

  async getSignedUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      // Await the presigned URL generation
      return await awsGetSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
    } catch (error) {
      Logger.error(`Failed to generate signed URL for R2: ${key}`, error);
      throw new Error("Storage signed URL generation failed");
    }
  }
}
