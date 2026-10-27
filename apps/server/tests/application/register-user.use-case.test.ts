import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../src/domain/errors/app-error.js";
import { User } from "../../src/domain/entities/user.entity.js";
import type { UserRepository } from "../../src/domain/repositories/user.repository.js";
import type { PasswordHasher } from "../../src/application/interfaces/password-hasher.js";
import { RegisterUserUseCase } from "../../src/application/use-cases/register-user.use-case.js";

describe("RegisterUserUseCase", () => {
  let userRepository: UserRepository;
  let passwordHasher: PasswordHasher;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
    };

    passwordHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    };

    useCase = new RegisterUserUseCase(
      userRepository,
      passwordHasher,
    );
  });

  it("registers a user with a hashed password", async () => {
    const input = {
      name: "Test User",
      email: "TEST@example.com",
      password: "a-secure-password-123",
    };

    const expectedUser = new User({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      passwordHash: "argon2-hashed-password",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(passwordHasher.hash).mockResolvedValue(
      "argon2-hashed-password",
    );
    vi.mocked(userRepository.create).mockResolvedValue(expectedUser);

    const result = await useCase.execute(input);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com",
    );

    expect(passwordHasher.hash).toHaveBeenCalledWith(input.password);

    expect(userRepository.create).toHaveBeenCalledWith({
      name: "Test User",
      email: "test@example.com",
      passwordHash: "argon2-hashed-password",
    });

    expect(result).toEqual(expectedUser);
  });

  it("rejects registration when the email already exists", async () => {
    const existingUser = new User({
      id: "user-existing",
      name: "Existing User",
      email: "test@example.com",
      passwordHash: "existing-hash",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(userRepository.findByEmail).mockResolvedValue(existingUser);

    await expect(
      useCase.execute({
        name: "Test User",
        email: "test@example.com",
        password: "a-secure-password-123",
      }),
    ).rejects.toMatchObject({
      message: "An account with this email already exists",
      statusCode: 409,
    } satisfies Partial<AppError>);

    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    await expect(
      useCase.execute({
        name: "Test User",
        email: "not-an-email",
        password: "a-secure-password-123",
      }),
    ).rejects.toThrow();

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 12 characters", async () => {
    await expect(
      useCase.execute({
        name: "Test User",
        email: "test@example.com",
        password: "short",
      }),
    ).rejects.toThrow();

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });
});