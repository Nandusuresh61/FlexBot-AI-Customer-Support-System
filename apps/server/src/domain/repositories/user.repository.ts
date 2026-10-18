import type { User } from "../entities/user.entity.js";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;

  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;
}