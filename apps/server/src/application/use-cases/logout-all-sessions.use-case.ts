import type { RefreshSessionRepository } from "../../domain/repositories/refresh-session.repository.js";

export class LogoutAllSessionsUseCase {
  constructor(
    private readonly refreshSessionRepository: RefreshSessionRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.refreshSessionRepository.revokeAllByUserId(
      userId,
      new Date(),
    );
  }
}