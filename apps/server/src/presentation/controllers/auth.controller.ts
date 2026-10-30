import type { Request, Response, RequestHandler } from "express";
import { HttpStatusCode } from "../../constants/httpStatusCode.js";
import { AppMessage } from "../../constants/appMessage.js";
import { ResponseHandler } from "../utils/responseHandler.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { env } from "../../config/env.js";

import type { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case.js";
import type { LoginUserUseCase } from "../../application/use-cases/login-user.use-case.js";
import type { TokenService } from "../../application/interfaces/token-service.js";
import type { CreateRefreshSessionUseCase } from "../../application/use-cases/create-refresh-session.use-case.js";
import type { RotateRefreshTokenUseCase } from "../../application/use-cases/rotate-refresh-token.use-case.js";
import type { LogoutUserUseCase } from "../../application/use-cases/logout-user.use-case.js";
import type { LogoutAllSessionsUseCase } from "../../application/use-cases/logout-all-sessions.use-case.js";

export class AuthController {
  constructor(
    private readonly _registerUserUseCase: RegisterUserUseCase,
    private readonly _loginUserUseCase: LoginUserUseCase,
    private readonly _tokenService: TokenService,
    private readonly _createRefreshSessionUseCase: CreateRefreshSessionUseCase,
    private readonly _rotateRefreshTokenUseCase: RotateRefreshTokenUseCase,
    private readonly _logoutUserUseCase: LogoutUserUseCase,
    private readonly _logoutAllSessionsUseCase: LogoutAllSessionsUseCase,
  ) {}

  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await this._registerUserUseCase.execute(req.body);

    ResponseHandler.success(
      res,
      HttpStatusCode.CREATED,
      AppMessage.USER_REGISTERED,
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    );
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await this._loginUserUseCase.execute(req.body);

    const accessToken = await this._tokenService.generateAccessToken({
      userId: user.id,
    });

    const refreshSession = await this._createRefreshSessionUseCase.execute({
      userId: user.id,
    });

    res.cookie("refreshToken", refreshSession.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      expires: refreshSession.expiresAt,
    });

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.LOGIN_SUCCESS,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        accessToken,
        tokenType: "Bearer",
        expiresIn: 900,
      },
    );
  });

  me = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.auth) {
      ResponseHandler.error(
        res,
        HttpStatusCode.UNAUTHORIZED,
        AppMessage.AUTH_REQUIRED,
      );
      return;
    }

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.USER_RETRIEVED,
      {
        userId: req.auth.userId,
      },
    );
  });

  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken: unknown = req.cookies?.refreshToken;

    if (typeof refreshToken !== "string" || refreshToken.length === 0) {
      ResponseHandler.error(
        res,
        HttpStatusCode.UNAUTHORIZED,
        AppMessage.INVALID_OR_EXPIRED_REFRESH_TOKEN,
      );
      return;
    }

    const result = await this._rotateRefreshTokenUseCase.execute(refreshToken);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
      expires: result.expiresAt,
    });

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.TOKEN_REFRESHED,
      {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        accessToken: result.accessToken,
        tokenType: "Bearer",
        expiresIn: 900,
      },
    );
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken: unknown = req.cookies?.refreshToken;

    if (typeof refreshToken === "string" && refreshToken.length > 0) {
      await this._logoutUserUseCase.execute(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
    });

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.LOGOUT_SUCCESS,
    );
  });

  logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.auth) {
      ResponseHandler.error(
        res,
        HttpStatusCode.UNAUTHORIZED,
        AppMessage.AUTH_REQUIRED,
      );
      return;
    }

    await this._logoutAllSessionsUseCase.execute(req.auth.userId);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/v1/auth",
    });

    ResponseHandler.success(
      res,
      HttpStatusCode.OK,
      AppMessage.LOGOUT_ALL_SUCCESS,
    );
  });
}
