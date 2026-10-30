import { z } from "zod";

import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { AppError } from "../../domain/errors/app-error.js";
import type { User } from "../../domain/entities/user.entity.js";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import type { PasswordHasher } from "../interfaces/password-hasher.js";

export const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email("A valid email address is required")
    .max(254)
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Invalid email or password"),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;

export class LoginUserUseCase {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginUserInput): Promise<User> {
    const validatedInput = loginUserSchema.parse(input);

    const user = await this._userRepository.findByEmail(
      validatedInput.email,
    );

    if (!user) {
      throw new AppError(
        AppMessage.INVALID_CREDENTIALS,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const isPasswordValid = await this._passwordHasher.verify(
      user.passwordHash,
      validatedInput.password,
    );

    if (!isPasswordValid) {
      throw new AppError(
        AppMessage.INVALID_CREDENTIALS,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(
        AppMessage.ACCOUNT_NOT_AVAILABLE,
        HttpStatusCode.FORBIDDEN,
      );
    }

    return user;
  }
}