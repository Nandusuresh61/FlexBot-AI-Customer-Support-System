import { createHash, randomBytes } from "node:crypto";

import type {
  GeneratedRefreshToken,
  RefreshTokenService,
} from "../../application/interfaces/refresh-token-service.js";

export class CryptoRefreshTokenService implements RefreshTokenService {
  generate(): GeneratedRefreshToken {
    const token = randomBytes(32).toString("base64url");

    return {
      token,
      tokenHash: this.hash(token),
    };
  }

  hash(token: string): string {
    return createHash("sha256")
      .update(token, "utf8")
      .digest("hex");
  }
}