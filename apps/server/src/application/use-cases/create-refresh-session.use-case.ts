import { z } from "zod";

import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session.repository.js";
import type { RefreshTokenService } from "../interfaces/refresh-token-service.js";

const createRefreshSessionSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),
});

export type CreateRefreshSessionInput = z.infer<
  typeof createRefreshSessionSchema
>;

export interface CreateRefreshSessionResult {
  refreshToken: string;
  expiresAt: Date;
}

export class CreateRefreshSessionUseCase {
  constructor(
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly expiresInDays: number,
  ) {
    if (!Number.isInteger(expiresInDays) || expiresInDays <= 0) {
      throw new Error("Refresh token lifetime must be a positive integer");
    }
  }

  async execute(
    input: CreateRefreshSessionInput,
  ): Promise<CreateRefreshSessionResult> {
    const validatedInput = createRefreshSessionSchema.parse(input);

    const generatedToken = this.refreshTokenService.generate();

    const expiresAt = new Date(
      Date.now() + this.expiresInDays * 24 * 60 * 60 * 1000,
    );

    await this.refreshSessionRepository.create({
      userId: validatedInput.userId,
      tokenHash: generatedToken.tokenHash,
      expiresAt,
    });

    return {
      refreshToken: generatedToken.token,
      expiresAt,
    };
  }
}