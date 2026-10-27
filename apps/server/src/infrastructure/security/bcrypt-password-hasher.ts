import bcrypt from "bcrypt";
import type { PasswordHasher } from "../../application/interfaces/password-hasher.js";

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(
    passwordHash: string,
    plainPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, passwordHash);
    } catch {
      return false;
    }
  }
}