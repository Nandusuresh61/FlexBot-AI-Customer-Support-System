import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", AuthController.register);

export default authRouter;