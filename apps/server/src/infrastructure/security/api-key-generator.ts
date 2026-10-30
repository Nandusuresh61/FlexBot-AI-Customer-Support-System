import { createHash, randomBytes } from "node:crypto";
import type { ApiKeyType } from "../../domain/entities/api-key.entity.js";

export interface GeneratedApiKey {
  plaintextKey: string;
  keyPrefix: string;
  keyHash: string;
}

export class ApiKeyGenerator {
  generate(type: ApiKeyType): GeneratedApiKey {
    const prefix = type === "PUBLIC" ? "fb_pub" : "fb_sec";
    const randomValue = randomBytes(32).toString("base64url");
    const plaintextKey = `${prefix}_${randomValue}`;

    return {
      plaintextKey,
      keyPrefix: plaintextKey.slice(0, prefix.length + 5),
      keyHash: this.hash(plaintextKey),
    };
  }

  hash(plaintextKey: string): string {
    return createHash("sha256")
      .update(plaintextKey, "utf8")
      .digest("hex");
  }
}