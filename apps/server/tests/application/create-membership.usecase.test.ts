import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../src/domain/errors/app-error.js";
import { Membership } from "../../src/domain/entities/membership.entity.js";
import { Organization } from "../../src/domain/entities/organization.entity.js";

import type { MembershipRepository } from "../../src/domain/repositories/membership.repository.js";
import type { OrganizationRepository } from "../../src/domain/repositories/organization.repository.js";

import { CreateMembershipUseCase } from "../../src/application/use-cases/create-membership.use-case.js";

describe("CreateMembershipUseCase", () => {
  let membershipRepository: MembershipRepository;
  let organizationRepository: OrganizationRepository;
  let useCase: CreateMembershipUseCase;

  const organization = new Organization({
    id: "org-123",
    name: "Acme Support",
    slug: "acme-support",
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    membershipRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUserAndOrganization: vi.fn(),
      findAllByOrganization: vi.fn(),
    };

    organizationRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findBySlug: vi.fn(),
    };

    useCase = new CreateMembershipUseCase(
      membershipRepository,
      organizationRepository,
    );
  });

  it("creates a membership for an existing organization", async () => {
    const input = {
      userId: "user-123",
      organizationId: "org-123",
      role: "ORG_MEMBER" as const,
    };

    const expectedMembership = new Membership({
      id: "membership-123",
      userId: input.userId,
      organizationId: input.organizationId,
      role: input.role,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(organizationRepository.findById).mockResolvedValue(
      organization,
    );

    vi.mocked(
      membershipRepository.findByUserAndOrganization,
    ).mockResolvedValue(null);

    vi.mocked(membershipRepository.create).mockResolvedValue(
      expectedMembership,
    );

    const result = await useCase.execute(input);

    expect(organizationRepository.findById).toHaveBeenCalledWith(
      "org-123",
    );

    expect(
      membershipRepository.findByUserAndOrganization,
    ).toHaveBeenCalledWith("user-123", "org-123");

    expect(membershipRepository.create).toHaveBeenCalledWith(input);

    expect(result).toEqual(expectedMembership);
  });

  it("throws a 404 error when the organization does not exist", async () => {
    vi.mocked(organizationRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: "user-123",
        organizationId: "org-missing",
        role: "ORG_MEMBER",
      }),
    ).rejects.toMatchObject({
      message: "Organization not found",
      statusCode: 404,
    } satisfies Partial<AppError>);

    expect(
      membershipRepository.findByUserAndOrganization,
    ).not.toHaveBeenCalled();

    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it("rejects an existing membership", async () => {
    const existingMembership = new Membership({
      id: "membership-existing",
      userId: "user-123",
      organizationId: "org-123",
      role: "ORG_MEMBER",
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(organizationRepository.findById).mockResolvedValue(
      organization,
    );

    vi.mocked(
      membershipRepository.findByUserAndOrganization,
    ).mockResolvedValue(existingMembership);

    await expect(
      useCase.execute({
        userId: "user-123",
        organizationId: "org-123",
        role: "ORG_MEMBER",
      }),
    ).rejects.toMatchObject({
      message: "This user already belongs to the organization",
      statusCode: 409,
    } satisfies Partial<AppError>);

    expect(membershipRepository.create).not.toHaveBeenCalled();
  });

  it("rejects invalid input", async () => {
    await expect(
      useCase.execute({
        userId: " ",
        organizationId: "org-123",
        role: "ORG_MEMBER",
      }),
    ).rejects.toThrow();

    expect(organizationRepository.findById).not.toHaveBeenCalled();
    expect(membershipRepository.create).not.toHaveBeenCalled();
  });
});