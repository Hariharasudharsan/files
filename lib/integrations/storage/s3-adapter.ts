import "server-only";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerEnv } from "@/lib/core/config/env";
import { Logger } from "@/lib/infrastructure/logger";
import type { IStorageAdapter, UploadResult } from "./types";
import crypto from "crypto";

export class S3StorageAdapter implements IStorageAdapter {
  private client: S3Client | null = null;
  private bucket: string = "";
  private publicUrl: string = "";

  constructor() {
    const env = getServerEnv();
    if (env.s3.accessKeyId && env.s3.secretAccessKey && env.s3.bucket) {
      this.bucket = env.s3.bucket;
      this.publicUrl = env.s3.publicUrl;
      this.client = new S3Client({
        region: env.s3.region || "us-east-1",
        endpoint: env.s3.endpoint || undefined, // For Cloudflare R2 or DigitalOcean Spaces
        credentials: {
          accessKeyId: env.s3.accessKeyId,
          secretAccessKey: env.s3.secretAccessKey,
        },
        forcePathStyle: !!env.s3.endpoint, // Often required for S3-compatible APIs
      });
      Logger.info("Storage Adapter configured for S3/R2");
    } else {
      Logger.warn("Storage Adapter not fully configured (missing AWS credentials)");
    }
  }

  private isConfigured(): boolean {
    return this.client !== null;
  }

  private generateUniqueKey(fileName: string): string {
    const ext = fileName.split(".").pop();
    const hash = crypto.randomUUID();
    return `${hash}.${ext}`;
  }

  async uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<UploadResult> {
    if (!this.isConfigured() || !this.client) {
      throw new Error("Storage is not configured");
    }

    const key = this.generateUniqueKey(fileName);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
      // ACL: "public-read" // Optional based on bucket config
    });

    await this.client.send(command);

    return {
      url: this.publicUrl ? `${this.publicUrl}/${key}` : key,
      key,
    };
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured() || !this.client) {
      Logger.warn("Storage not configured, skipping delete");
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (!this.isConfigured() || !this.client) {
      throw new Error("Storage is not configured");
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}

export const storageAdapter = new S3StorageAdapter();
