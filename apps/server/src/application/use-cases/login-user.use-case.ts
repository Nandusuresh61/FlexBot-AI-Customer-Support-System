import { z } from "zod";

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
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: LoginUserInput): Promise<User> {
    const validatedInput = loginUserSchema.parse(input);

    const user = await this.userRepository.findByEmail(
      validatedInput.email,
    );

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await this.passwordHasher.verify(
      user.passwordHash,
      validatedInput.password,
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("This account is not available for login", 403);
    }

    return user;
  }
}