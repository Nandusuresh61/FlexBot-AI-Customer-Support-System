import type { Request, Response, NextFunction } from "express";
import { loginUserUseCase, registerUserUseCase, tokenService } from "../../composition/container.js";

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
}