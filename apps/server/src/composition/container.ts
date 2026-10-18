import { MongoOrganizationRepository } from "../infrastructure/database/repositories/mongo-organization.repository.js";
import { MongoMembershipRepository } from "../infrastructure/database/repositories/mongo-membership.repository.js";

import { CreateOrganizationUseCase } from "../application/use-cases/create-organization.use-case.js";
import { GetOrganizationByIdUseCase } from "../application/use-cases/get-organization-by-id.use-case.js";
import { CreateMembershipUseCase } from "../application/use-cases/create-membership.use-case.js";
import { MongoUserRepository } from "../infrastructure/database/repositories/mongo-user.repository.js";
import { Argon2PasswordHasher } from "../infrastructure/security/argon2-password-hasher.js";
import { RegisterUserUseCase } from "../application/use-cases/register-user.use-case.js";
const organizationRepository = new MongoOrganizationRepository();
const membershipRepository = new MongoMembershipRepository();

const userRepository = new MongoUserRepository();
const passwordHasher = new Argon2PasswordHasher();

export const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  passwordHasher,
);
export const createOrganizationUseCase = new CreateOrganizationUseCase(
  organizationRepository,
);

export const getOrganizationByIdUseCase = new GetOrganizationByIdUseCase(
  organizationRepository,
);

export const createMembershipUseCase = new CreateMembershipUseCase(
  membershipRepository,
  organizationRepository,
);
