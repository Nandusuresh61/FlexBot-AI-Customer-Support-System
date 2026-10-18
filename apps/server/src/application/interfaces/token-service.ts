export interface AccessTokenPayload {
  userId: string;
}

export interface TokenService {
  generateAccessToken(
    payload: AccessTokenPayload,
  ): Promise<string>;

  verifyAccessToken(
    token: string,
  ): Promise<AccessTokenPayload>;
}