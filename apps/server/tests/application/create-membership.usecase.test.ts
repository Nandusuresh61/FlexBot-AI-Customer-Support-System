
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../src/domain/errors/app-error.js";
import { User } from "../../src/domain/entities/user.entity.js";
import { Organization } from "../../src/domain/entities/organization.entity.js";
import { Membership } from "../../src/domain/entities/membership.entity.js";

import type { UserRepository } from "../../src/domain/repositories/user.repository.js";
import type { OrganizationRepository } from "../../src/domain/repositories/organization.repository.js";
import type { MembershipRepository } from "../../src/domain/repositories/membership.repository.js";

import { CreateMembershipUseCase } from "../../src/application/use-cases/create-membership.use-case.js";

describe("CreateMembershipUseCase", () => {
  let userRepository: UserRepository;
  let organizationRepository: OrganizationRepository;
  let membershipRepository: MembershipRepository;
  let useCase: CreateMembershipUseCase;

  const userId = "user-123";
  const organizationId = "org-123";

  const createUser = (status: "ACTIVE" | "SUSPENDED" = "ACTIVE") =>
    new User({
      id: userId,
      name: "Test User",
      email: "test@example.com",
      passwordHash: "hashed-password",
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const createOrganization = (
    status: "ACTIVE" | "SUSPENDED" = "ACTIVE",
  ) =>
    new Organization({
      id: organizationId,
      name: "Test Organization",
      slug: "test-organization",
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  const createMembership = () =>
    new Membership({
      id: "membership-123",
      userId,
      organizationId,
      role: "ORG_MEMBER",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
    userRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByEmail: vi.fn(),
    };

    organizationRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
    };

    membershipRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserAndOrganization: vi.fn(),
      findAllByOrganization: vi.fn(),
    };

    useCase = new CreateMembershipUseCase(
      membershipRepository,
      organizationRepository,
      userRepository,
    );
  });

  it("creates an ORG_MEMBER membership for an existing active user", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(createUser());
    vi.mocked(organizationRepository.findById).mockResolvedValue(
      createOrganization(),
    );
    vi.mocked(
      membershipRepository.findByUserAndOrganization,
    ).mockResolvedValue(null);
    vi.mocked(membershipRepository.create).mockResolvedValue(
      createMembership(),
    );

    const result = await useCase.execute({
      userId,
      organizationId,
    });

    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(organizationRepository.findById).toHaveBeenCalledWith(
      organizationId,
    );
    expect(
      membershipRepository.findByUserAndOrganization,
    ).toHaveBeenCalledWith(userId, organizationId);

    expect(membershipRepository.create).toHaveBeenCalledWith({
      userId,
      organizationId,
      role: "ORG_MEMBER",
    });

    expect(result.role).toBe("ORG_MEMBER");
    expect(result.userId).toBe(userId);
    expect(result.organizationId).toBe(organizationId);
  });

  it("rejects when the target user does not exist", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, organizationId }),
    ).rejects.toMatchObject({
      message: "User not found",
      statusCode: 404,
    } satisfies Partial<AppError>);

    expect(organizationRepository.findById).not.toHaveBeenCalled();
    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it("rejects when the target user is suspended", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(
      createUser("SUSPENDED"),
    );

    await expect(
      useCase.execute({ userId, organizationId }),
    ).rejects.toMatchObject({
      message: "User account is not active",
      statusCode: 403,
    } satisfies Partial<AppError>);

    expect(organizationRepository.findById).not.toHaveBeenCalled();
    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it("rejects when the organization does not exist", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(createUser());
    vi.mocked(organizationRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId, organizationId }),
    ).rejects.toMatchObject({
      message: "Organization not found",
      statusCode: 404,
    } satisfies Partial<AppError>);

    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it("rejects when the organization is suspended", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(createUser());
    vi.mocked(organizationRepository.findById).mockResolvedValue(
      createOrganization("SUSPENDED"),
    );

    await expect(
      useCase.execute({ userId, organizationId }),
    ).rejects.toMatchObject({
      message: "Organization is not active",
      statusCode: 403,
    } satisfies Partial<AppError>);

    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it("rejects when the user already belongs to the organization", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(createUser());
    vi.mocked(organizationRepository.findById).mockResolvedValue(
      createOrganization(),
    );
    vi.mocked(
      membershipRepository.findByUserAndOrganization,
    ).mockResolvedValue(createMembership());

    await expect(
      useCase.execute({ userId, organizationId }),
    ).rejects.toMatchObject({
      message: "This user already belongs to the organization",
      statusCode: 409,
    } satisfies Partial<AppError>);

    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it("rejects invalid input", async () => {
    await expect(
      useCase.execute({
        userId: "",
        organizationId,
      }),
    ).rejects.toThrow();

    expect(userRepository.findById).not.toHaveBeenCalled();
    expect(organizationRepository.findById).not.toHaveBeenCalled();
    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it("does not allow the caller to assign an administrator role through input", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(createUser());
    vi.mocked(organizationRepository.findById).mockResolvedValue(
      createOrganization(),
    );
    vi.mocked(
      membershipRepository.findByUserAndOrganization,
    ).mockResolvedValue(null);
    vi.mocked(membershipRepository.create).mockResolvedValue(
      createMembership(),
    );

    // Simulate a malicious client submitting an extra role field.
    const maliciousInput = {
      userId,
      organizationId,
      role: "ORG_ADMIN",
    } as Parameters<typeof useCase.execute>[0];

    await useCase.execute(maliciousInput);

    expect(membershipRepository.create).toHaveBeenCalledWith({
      userId,
      organizationId,
      role: "ORG_MEMBER",
    });
  });
});
