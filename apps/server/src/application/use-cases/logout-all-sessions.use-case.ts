import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session.repository.js";

export class LogoutAllSessionsUseCase {
  constructor(
    private readonly _refreshSessionRepository: RefreshSessionRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this._refreshSessionRepository.revokeAllByUserId(
      userId,
      new Date(),
    );
  }
}