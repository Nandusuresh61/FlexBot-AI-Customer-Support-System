import type { Request, Response, NextFunction } from "express";
import { registerUserUseCase } from "../../composition/container.js";

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
}