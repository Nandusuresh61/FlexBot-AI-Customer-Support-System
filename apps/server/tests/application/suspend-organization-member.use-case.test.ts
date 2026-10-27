import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../../src/domain/errors/app-error.js";
import { Organization } from "../../src/domain/entities/organization.entity.js";
import { Membership } from "../../src/domain/entities/membership.entity.js";

import type { OrganizationRepository } from "../../src/domain/repositories/organization.repository.js";
import type { MembershipRepository } from "../../src/domain/repositories/membership.repository.js";

import { SuspendOrganizationMemberUseCase } from "../../src/application/use-cases/suspend-organization-member.use-case.js";

describe("SuspendOrganizationMemberUseCase", () => {
  let membershipRepository: MembershipRepository;
  let organizationRepository: OrganizationRepository;
  let useCase: SuspendOrganizationMemberUseCase;

  const organizationId = "org-123";
  const membershipId = "membership-123";
  const userId = "user-123";

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

  const createMembership = (
    options: {
      id?: string;
      organizationId?: string;
      role?: "ORG_ADMIN" | "ORG_MEMBER";
      status?: "ACTIVE" | "SUSPENDED";
    } = {},
  ) =>
    new Membership({
      id: options.id ?? membershipId,
      userId,
      organizationId: options.organizationId ?? organizationId,
      role: options.role ?? "ORG_MEMBER",
      status: options.status ?? "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

  beforeEach(() => {
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
      suspendByIdAndOrganization: vi.fn(),
    };

    useCase = new SuspendOrganizationMemberUseCase(
      membershipRepository,
      organizationRepository,
    );

    vi.mocked(organizationRepository.findById).mockResolvedValue(
      createOrganization(),
    );
  });

  it("suspends an active organization member", async () => {
    const activeMembership = createMembership();
    const suspendedMembership = createMembership({ status: "SUSPENDED" });

    vi.mocked(membershipRepository.findById).mockResolvedValue(
      activeMembership,
    );
    vi.mocked(membershipRepository.suspendByIdAndOrganization)
      .mockResolvedValue(suspendedMembership);

    const result = await useCase.execute({
      organizationId,
      membershipId,
    });

    expect(
      membershipRepository.suspendByIdAndOrganization,
    ).toHaveBeenCalledWith(membershipId, organizationId);

    expect(result.status).toBe("SUSPENDED");
  });

  it("rejects when the organization does not exist", async () => {
    vi.mocked(organizationRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ organizationId, membershipId }),
    ).rejects.toMatchObject({
      message: "Organization not found",
      statusCode: 404,
    } satisfies Partial<AppError>);

    expect(membershipRepository.findById).not.toHaveBeenCalled();
  });

  it("rejects when the organization is suspended", async () => {
    vi.mocked(organizationRepository.findById).mockResolvedValue(
      createOrganization("SUSPENDED"),
    );

    await expect(
      useCase.execute({ organizationId, membershipId }),
    ).rejects.toMatchObject({
      message: "Organization is not active",
      statusCode: 403,
    } satisfies Partial<AppError>);

    expect(membershipRepository.findById).not.toHaveBeenCalled();
  });

  it("rejects when the membership does not exist", async () => {
    vi.mocked(membershipRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ organizationId, membershipId }),
    ).rejects.toMatchObject({
      message: "Membership not found in this organization",
      statusCode: 404,
    } satisfies Partial<AppError>);
  });

  it("rejects a membership belonging to another organization", async () => {
    vi.mocked(membershipRepository.findById).mockResolvedValue(
      createMembership({ organizationId: "another-org" }),
    );

    await expect(
      useCase.execute({ organizationId, membershipId }),
    ).rejects.toMatchObject({
      message: "Membership not found in this organization",
      statusCode: 404,
    } satisfies Partial<AppError>);

    expect(
      membershipRepository.suspendByIdAndOrganization,
    ).not.toHaveBeenCalled();
  });

  it("rejects an already-suspended membership", async () => {
    vi.mocked(membershipRepository.findById).mockResolvedValue(
      createMembership({ status: "SUSPENDED" }),
    );

    await expect(
      useCase.execute({ organizationId, membershipId }),
    ).rejects.toMatchObject({
      message: "Membership is already suspended",
      statusCode: 409,
    } satisfies Partial<AppError>);

    expect(
      membershipRepository.suspendByIdAndOrganization,
    ).not.toHaveBeenCalled();
  });

  it("prevents suspension of the last active organization admin", async () => {
    vi.mocked(membershipRepository.findById).mockResolvedValue(
      createMembership({ role: "ORG_ADMIN" }),
    );

    vi.mocked(membershipRepository.findAllByOrganization).mockResolvedValue([
      createMembership({ role: "ORG_ADMIN" }),
      createMembership({
        id: "member-456",
        role: "ORG_MEMBER",
      }),
    ]);

    await expect(
      useCase.execute({ organizationId, membershipId }),
    ).rejects.toMatchObject({
      message: "Cannot suspend the last active organization admin",
      statusCode: 409,
    } satisfies Partial<AppError>);

    expect(
      membershipRepository.suspendByIdAndOrganization,
    ).not.toHaveBeenCalled();
  });

  it("allows admin suspension when another active admin exists", async () => {
    const adminMembership = createMembership({ role: "ORG_ADMIN" });
    const suspendedAdmin = createMembership({
      role: "ORG_ADMIN",
      status: "SUSPENDED",
    });

    vi.mocked(membershipRepository.findById).mockResolvedValue(
      adminMembership,
    );

    vi.mocked(membershipRepository.findAllByOrganization).mockResolvedValue([
      adminMembership,
      createMembership({
        id: "admin-456",
        role: "ORG_ADMIN",
      }),
    ]);

    vi.mocked(membershipRepository.suspendByIdAndOrganization)
      .mockResolvedValue(suspendedAdmin);

    const result = await useCase.execute({
      organizationId,
      membershipId,
    });

    expect(result.status).toBe("SUSPENDED");
    expect(
      membershipRepository.suspendByIdAndOrganization,
    ).toHaveBeenCalledWith(membershipId, organizationId);
  });

  it("rejects when the repository cannot suspend the membership", async () => {
    vi.mocked(membershipRepository.findById).mockResolvedValue(
      createMembership(),
    );

    vi.mocked(membershipRepository.suspendByIdAndOrganization)
      .mockResolvedValue(null);

    await expect(
      useCase.execute({ organizationId, membershipId }),
    ).rejects.toMatchObject({
      message: "Membership could not be suspended",
      statusCode: 409,
    } satisfies Partial<AppError>);
  });

  it("rejects invalid input", async () => {
    await expect(
      useCase.execute({
        organizationId: "",
        membershipId,
      }),
    ).rejects.toThrow();

    expect(organizationRepository.findById).not.toHaveBeenCalled();
  });
});