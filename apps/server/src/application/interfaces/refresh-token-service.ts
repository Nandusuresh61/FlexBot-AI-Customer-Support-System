export interface GeneratedRefreshToken {
  token: string;
  tokenHash: string;
}

export interface RefreshTokenService {
  generate(): GeneratedRefreshToken;

  hash(token: string): string;
}