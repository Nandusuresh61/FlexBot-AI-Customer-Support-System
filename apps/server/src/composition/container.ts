import { MongoOrganizationRepository } from "../infrastructure/database/repositories/mongo-organization.repository.js";
import { MongoMembershipRepository } from "../infrastructure/database/repositories/mongo-membership.repository.js";
import { BcryptPasswordHasher } from "../infrastructure/security/bcrypt-password-hasher.js";
import { CreateOrganizationUseCase } from "../application/use-cases/create-organization.use-case.js";
import { GetOrganizationByIdUseCase } from "../application/use-cases/get-organization-by-id.use-case.js";
import { CreateMembershipUseCase } from "../application/use-cases/create-membership.use-case.js";
import { MongoUserRepository } from "../infrastructure/database/repositories/mongo-user.repository.js";
import { RegisterUserUseCase } from "../application/use-cases/register-user.use-case.js";
import { LoginUserUseCase } from "../application/use-cases/login-user.use-case.js";
import { JwtTokenService } from "../infrastructure/security/jwt-token.service.js";

const organizationRepository = new MongoOrganizationRepository();
const membershipRepository = new MongoMembershipRepository();

const userRepository = new MongoUserRepository();
const tokenService = new JwtTokenService();
const passwordHasher = new BcryptPasswordHasher();

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

export const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordHasher,
);

export {tokenService}