import {
  SignJWT,
  jwtVerify,
  type JWTPayload,
} from "jose";

import { env } from "../../config/env.js";
import { AppError } from "../../domain/errors/app-error.js";

import type {
  AccessTokenPayload,
  TokenService,
} from "../../application/interfaces/token-service.js";

const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export class JwtTokenService implements TokenService {
  async generateAccessToken(
    payload: AccessTokenPayload,
  ): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(payload.userId)
      .setIssuer(env.JWT_ISSUER)
      .setAudience(env.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
      .sign(secret);
  }

  async verifyAccessToken(
    token: string,
  ): Promise<AccessTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      });

      if (!isValidPayload(payload)) {
        throw new AppError("Invalid access token", 401);
      }

      return {
        userId: payload.sub,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Invalid or expired access token", 401);
    }
  }
}

function isValidPayload(
  payload: JWTPayload,
): payload is JWTPayload & { sub: string } {
  return (
    typeof payload.sub === "string" &&
    payload.sub.length > 0
  );
}