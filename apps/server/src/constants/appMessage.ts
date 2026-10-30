export const AppMessage = {
  // Authentication & User
  USER_REGISTERED: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logged out successfully",
  LOGOUT_ALL_SUCCESS: "All sessions have been logged out",
  TOKEN_REFRESHED: "Token refreshed successfully",
  USER_RETRIEVED: "Authenticated user retrieved successfully",
  AUTH_REQUIRED: "Authentication required",
  AUTHENTICATED_USER_REQUIRED: "Authenticated user is required",
  INVALID_AUTH_HEADER: "Invalid authorization header",
  INVALID_ACCESS_TOKEN: "Invalid access token",
  INVALID_OR_EXPIRED_ACCESS_TOKEN: "Invalid or expired access token",
  INVALID_OR_EXPIRED_REFRESH_TOKEN: "Invalid or expired refresh token",
  INVALID_REFRESH_TOKEN: "Invalid refresh token",
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_EMAIL_EXISTS: "An account with this email already exists",
  ACCOUNT_NOT_AVAILABLE: "This account is not available for login",
  USER_NOT_FOUND: "User not found",
  USER_INACTIVE: "User account is not active",
  USER_NOT_FOUND_OR_INACTIVE: "User not found or inactive",

  // Super Admin
  SUPER_ADMIN_REQUIRED: "Super Admin access required",

  // Organization
  ORGANIZATION_CREATED: "Organization created successfully",
  ORGANIZATION_RETRIEVED: "Organization retrieved successfully",
  ORGANIZATION_NOT_FOUND: "Organization not found",
  ORGANIZATION_SUSPENDED: "This organization is suspended",
  ORGANIZATION_NOT_ACTIVE: "Organization is not active",
  ORGANIZATION_SLUG_EXISTS: "An organization with this slug already exists",
  ORGANIZATION_ID_REQUIRED: "A valid organization ID is required",
  ORGANIZATION_ACCESS_DENIED: "You do not have access to this organization",
  ORGANIZATION_ACCESS_REQUIRED: "Organization access must be verified first",
  ORGANIZATION_PERMISSION_DENIED:
    "You do not have permission to perform this action",

  // Organization Memberships
  MEMBER_ADDED: "Organization member added successfully",
  MEMBERS_RETRIEVED: "Organization members retrieved successfully",
  MEMBER_SUSPENDED: "Organization member suspended successfully",
  MEMBERSHIP_SUSPENDED_ALREADY: "Membership is already suspended",
  MEMBERSHIP_SUSPENDED: "Your organization membership is suspended",
  MEMBERSHIP_NOT_FOUND: "Membership not found in this organization",
  CANNOT_SUSPEND_LAST_ADMIN:
    "Cannot suspend the last active organization admin",
  MEMBERSHIP_COULD_NOT_BE_SUSPENDED: "Membership could not be suspended",
  USER_ALREADY_MEMBER: "This user already belongs to the organization",
  INVALID_ORG_MEMBER_IDS: "Valid organization and membership IDs are required",

  // API Key Management
  API_KEY_CREATED: "API key created successfully",
  API_KEYS_RETRIEVED: "API keys retrieved successfully",
  API_KEY_REVOKED: "API key revoked successfully",
  API_KEY_NAME_REQUIRED: "API key name is required",
  API_KEY_TYPE_INVALID: "Invalid API key type",
  API_KEY_EXPIRATION_INVALID: "API key expiration must be a future date",
  API_KEY_NOT_FOUND: "API key not found",
  API_KEY_ALREADY_REVOKED: "API key is already revoked",
  API_KEY_GENERATION_FAILED: "API key generation failed",
  INVALID_API_KEY: "Invalid or expired API key",
  API_KEY_AUTH_SUCCESS: "API key authenticated successfully",
  // Common & Errors
  VALIDATION_FAILED: "Validation failed",
  INTERNAL_SERVER_ERROR: "Internal server error",
  UNEXPECTED_ERROR: "An unexpected error occurred",
  ROUTE_NOT_FOUND: (method: string, url: string) =>
    `Route not found: ${method} ${url}`,
  API_RUNNING: "FlexBot API is running",
} as const;

export type AppMessageType = (typeof AppMessage)[keyof typeof AppMessage];
