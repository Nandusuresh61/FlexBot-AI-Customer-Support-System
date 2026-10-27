import { z } from "zod";

import { AppError } from "../../domain/errors/app-error.js";
import type { User } from "../../domain/entities/user.entity.js";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import type { PasswordHasher } from "../interfaces/password-hasher.js";

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("A valid email address is required")
    .max(254, "Email cannot exceed 254 characters")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(12, "Password must contain at least 12 characters")
    .max(128, "Password cannot exceed 128 characters"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const validatedInput = registerUserSchema.parse(input);

    const existingUser = await this.userRepository.findByEmail(
      validatedInput.email,
    );

    if (existingUser) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await this.passwordHasher.hash(
      validatedInput.password,
    );

    return this.userRepository.create({
      name: validatedInput.name,
      email: validatedInput.email,
      passwordHash,
      platformRole: "USER",
    });
    
  }
}
