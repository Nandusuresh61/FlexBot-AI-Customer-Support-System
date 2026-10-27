export interface PasswordHasher {
  hash(password: string): Promise<string>;

  verify(
    passwordHash: string,
    plainPassword: string,
  ): Promise<boolean>;
}