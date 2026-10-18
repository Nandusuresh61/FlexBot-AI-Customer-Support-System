import argon2 from "argon2";
import type { PasswordHasher } from "../../application/interfaces/password-hasher.js";

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  async verify(
    passwordHash: string,
    plainPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, plainPassword);
    } catch {
      return false;
    }
  }
}