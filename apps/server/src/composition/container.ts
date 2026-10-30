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
import { CryptoRefreshTokenService } from "../infrastructure/security/crypto-refresh-token.service.js";
import { CreateRefreshSessionUseCase } from "../application/use-cases/create-refresh-session.use-case.js";

import { MongoRefreshSessionRepository } from "../infrastructure/database/repositories/mongo-refresh-session.repository.js";
import { SuspendOrganizationMemberUseCase } from "../application/use-cases/suspend-organization-member.use-case.js";
import { env } from "../config/env.js";
import { RotateRefreshTokenUseCase } from "../application/use-cases/rotate-refresh-token.use-case.js";
import { LogoutUserUseCase } from "../application/use-cases/logout-user.use-case.js";
import { LogoutAllSessionsUseCase } from "../application/use-cases/logout-all-sessions.use-case.js";
import { GetOrganizationMembersUseCase } from "../application/use-cases/get-organization-members.use-case.js";
import { AuthController } from "../presentation/controllers/auth.controller.js";
import { OrganizationController } from "../presentation/controllers/organization.controller.js";
import { MembershipController } from "../presentation/controllers/membership.controller.js";

import { CreateApiKeyUseCase } from "../application/use-cases/create-api-key.use-case.js";
import { ListApiKeysUseCase } from "../application/use-cases/list-api-keys.use-case.js";
import { RevokeApiKeyUseCase } from "../application/use-cases/revoke-api-key.use-case.js";

import { ApiKeyController } from "../presentation/controllers/api-key.controller.js";
import { MongoApiKeyRepository } from "../infrastructure/database/repositories/mongo-api-key.repository.js";
import { ApiKeyGenerator } from "../infrastructure/security/api-key-generator.js";
export const organizationRepository = new MongoOrganizationRepository();
export const membershipRepository = new MongoMembershipRepository();

const apiKeyRepository = new MongoApiKeyRepository();
const apiKeyGenerator = new ApiKeyGenerator();
export const userRepository = new MongoUserRepository();
const tokenService = new JwtTokenService();
const passwordHasher = new BcryptPasswordHasher();

const refreshSessionRepository = new MongoRefreshSessionRepository();

export const registerUserUseCase = new RegisterUserUseCase(
  userRepository,
  passwordHasher,
);
export const createOrganizationUseCase = new CreateOrganizationUseCase(
  organizationRepository,
  membershipRepository,
);

export const getOrganizationByIdUseCase = new GetOrganizationByIdUseCase(
  organizationRepository,
);

export const getOrganizationMembersUseCase = new GetOrganizationMembersUseCase(
  membershipRepository,
  organizationRepository,
);

export const createMembershipUseCase = new CreateMembershipUseCase(
  membershipRepository,
  organizationRepository,
  userRepository,
);

export const loginUserUseCase = new LoginUserUseCase(
  userRepository,
  passwordHasher,
);

export { tokenService };

export const refreshTokenService = new CryptoRefreshTokenService();

export const createRefreshSessionUseCase = new CreateRefreshSessionUseCase(
  refreshSessionRepository,
  refreshTokenService,
  env.REFRESH_TOKEN_EXPIRES_IN_DAYS,
);

export const rotateRefreshTokenUseCase = new RotateRefreshTokenUseCase(
  userRepository,
  refreshSessionRepository,
  tokenService,
  refreshTokenService,
  env.REFRESH_TOKEN_EXPIRES_IN_DAYS,
);

export const logoutUserUseCase = new LogoutUserUseCase(
  refreshSessionRepository,
  refreshTokenService,
);

export const logoutAllSessionsUseCase = new LogoutAllSessionsUseCase(
  refreshSessionRepository,
);

export const suspendOrganizationMemberUseCase =
  new SuspendOrganizationMemberUseCase(
    membershipRepository,
    organizationRepository,
  );

export const authController = new AuthController(
  registerUserUseCase,
  loginUserUseCase,
  tokenService,
  createRefreshSessionUseCase,
  rotateRefreshTokenUseCase,
  logoutUserUseCase,
  logoutAllSessionsUseCase,
);

export const organizationController = new OrganizationController(
  createOrganizationUseCase,
  getOrganizationByIdUseCase,
);

export const membershipController = new MembershipController(
  createMembershipUseCase,
  getOrganizationMembersUseCase,
  suspendOrganizationMemberUseCase,
);
export const createApiKeyUseCase = new CreateApiKeyUseCase(
  apiKeyRepository,
  organizationRepository,
  apiKeyGenerator,
);

export const listApiKeysUseCase = new ListApiKeysUseCase(
  apiKeyRepository,
  organizationRepository,
);

export const revokeApiKeyUseCase = new RevokeApiKeyUseCase(
  apiKeyRepository,
  organizationRepository,
);

export const apiKeyController = new ApiKeyController(
  createApiKeyUseCase,
  listApiKeysUseCase,
  revokeApiKeyUseCase,
);