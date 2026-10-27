import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { AppError } from "../../domain/errors/app-error.js";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session.repository.js";
import type { TokenService } from "../interfaces/token-service.js";
import type { RefreshTokenService } from "../interfaces/refresh-token-service.js";

export class RotateRefreshTokenUseCase {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _refreshSessionRepository: RefreshSessionRepository,
    private readonly _tokenService: TokenService,
    private readonly _refreshTokenService: RefreshTokenService,
    private readonly _expiresInDays: number,
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken || !refreshToken.trim()) {
      throw new AppError(
        AppMessage.INVALID_OR_EXPIRED_REFRESH_TOKEN,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const tokenHash = this._refreshTokenService.hash(refreshToken);

    const session =
      await this._refreshSessionRepository.consumeActiveByTokenHash(
        tokenHash,
        new Date(),
      );

    if (!session) {
      throw new AppError(
        AppMessage.INVALID_OR_EXPIRED_REFRESH_TOKEN,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const user = await this._userRepository.findById(session.userId);

    if (!user || user.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.INVALID_OR_EXPIRED_REFRESH_TOKEN,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const generatedToken = this._refreshTokenService.generate();

    const expiresAt = new Date(
      Date.now() + this._expiresInDays * 24 * 60 * 60 * 1000,
    );

    const accessToken = await this._tokenService.generateAccessToken({
      userId: user.id,
    });

    await this._refreshSessionRepository.create({
      userId: user.id,
      tokenHash: generatedToken.tokenHash,
      expiresAt,
    });

    return {
      user,
      accessToken,
      refreshToken: generatedToken.token,
      expiresAt,
    };
  }
}