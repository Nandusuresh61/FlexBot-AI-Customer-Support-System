import { describe, it, expect, vi, beforeEach } from "vitest";

import { LoginUserUseCase } from "../../src/application/use-cases/login-user.use-case.js";

import type { UserRepository } from "../../src/domain/repositories/user.repository.js";
import type { PasswordHasher } from "../../src/application/interfaces/password-hasher.js";
import type { User } from "../../src/domain/entities/user.entity.js";

describe("LoginUserUseCase", () => {
  let userRepository: UserRepository;
  let passwordHasher: PasswordHasher;
  let loginUserUseCase: LoginUserUseCase;

  const mockUser = {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    passwordHash: "$2b$12$mocked-password-hash",
    status: "ACTIVE",
  } as User;

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
    } as unknown as UserRepository;

    passwordHasher = {
      hash: vi.fn(),
      verify: vi.fn(),
    };

    loginUserUseCase = new LoginUserUseCase(
      userRepository,
      passwordHasher,
    );
  });

  it("should return the user when credentials are valid", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordHasher.verify).mockResolvedValue(true);

    const result = await loginUserUseCase.execute({
      email: "test@example.com",
      password: "SecurePassword123!",
    });

    expect(result).toBe(mockUser);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      "test@example.com",
    );
    expect(passwordHasher.verify).toHaveBeenCalledWith(
      mockUser.passwordHash,
      "SecurePassword123!",
    );
  });

  it("should reject an unknown email", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      loginUserUseCase.execute({
        email: "unknown@example.com",
        password: "SecurePassword123!",
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid email or password",
    });

    expect(passwordHasher.verify).not.toHaveBeenCalled();
  });

  it("should reject an incorrect password", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordHasher.verify).mockResolvedValue(false);

    await expect(
      loginUserUseCase.execute({
        email: "test@example.com",
        password: "WrongPassword123!",
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid email or password",
    });
  });

  it("should reject an invalid email", async () => {
    await expect(
      loginUserUseCase.execute({
        email: "invalid-email",
        password: "SecurePassword123!",
      }),
    ).rejects.toThrow();

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  it("should reject an empty password", async () => {
    await expect(
      loginUserUseCase.execute({
        email: "test@example.com",
        password: "",
      }),
    ).rejects.toThrow();

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  it("should reject a suspended account", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue({
      ...mockUser,
      status: "SUSPENDED",
    } as User);

    vi.mocked(passwordHasher.verify).mockResolvedValue(true);

    await expect(
      loginUserUseCase.execute({
        email: "test@example.com",
        password: "SecurePassword123!",
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});