import { randomUUID } from "node:crypto";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import type {
  FileStorageService,
  StoreFileInput,
  StoredFile,
} from "../../application/services/file-storage.service.js";

const extensionByMimeType: Record<string, string> = {
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/markdown": ".md",
};

export class S3FileStorageService implements FileStorageService {
  private readonly _client: S3Client;
  private readonly _bucketName: string;

  constructor() {
    const region = process.env.AWS_REGION;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!region || !bucketName) {
      throw new Error(
        "AWS_REGION and AWS_S3_BUCKET_NAME must be configured.",
      );
    }

    this._client = new S3Client({ region });
    this._bucketName = bucketName;
  }

  async store(input: StoreFileInput): Promise<StoredFile> {
    const extension = extensionByMimeType[input.mimeType];

    if (!extension) {
      throw new Error("Unsupported file type for storage.");
    }

    const key = `knowledge-documents/${input.organizationId}/${randomUUID()}${extension}`;

    await this._client.send(
      new PutObjectCommand({
        Bucket: this._bucketName,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimeType,
        ContentLength: input.buffer.length,
      }),
    );

    return { storageKey: key };
  }

  async delete(storageKey: string): Promise<void> {
    await this._client.send(
      new DeleteObjectCommand({
        Bucket: this._bucketName,
        Key: storageKey,
      }),
    );
  }
}