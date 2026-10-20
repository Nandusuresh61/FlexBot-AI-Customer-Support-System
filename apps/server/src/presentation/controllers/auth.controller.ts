import type { Request, Response, NextFunction } from "express";
import {
  loginUserUseCase,
  logoutAllSessionsUseCase,
  logoutUserUseCase,
  registerUserUseCase,
  tokenService,
} from "../../composition/container.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

import { createRefreshSessionUseCase } from "../../composition/container.js";
import { env } from "../../config/env.js";

import { rotateRefreshTokenUseCase } from "../../composition/container.js";

export class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await registerUserUseCase.execute(req.body);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  static async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await loginUserUseCase.execute(req.body);

      const accessToken = await tokenService.generateAccessToken({
        userId: user.id,
      });

      const refreshSession = await createRefreshSessionUseCase.execute({
        userId: user.id,
      });

      res.cookie("refreshToken", refreshSession.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/auth",
        expires: refreshSession.expiresAt,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          accessToken,
          tokenType: "Bearer",
          expiresIn: 900,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Authenticated user retrieved successfully",
      data: {
        userId: req.auth.userId,
      },
    });
  }
  static async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const refreshToken: unknown = req.cookies?.refreshToken;

      if (typeof refreshToken !== "string" || refreshToken.length === 0) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
        return;
      }

      const result = await rotateRefreshTokenUseCase.execute(refreshToken);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/auth",
        expires: result.expiresAt,
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
          },
          accessToken: result.accessToken,
          tokenType: "Bearer",
          expiresIn: 900,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const refreshToken: unknown = req.cookies?.refreshToken;

      if (typeof refreshToken === "string" && refreshToken.length > 0) {
        await logoutUserUseCase.execute(refreshToken);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/auth",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  static async logoutAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.auth) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      await logoutAllSessionsUseCase.execute(req.auth.userId);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/v1/auth",
      });

      res.status(200).json({
        success: true,
        message: "All sessions have been logged out",
      });
    } catch (error) {
      next(error);
    }
  }
}
