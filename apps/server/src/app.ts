import express from "express";
import cors from "cors";
import helmet from "helmet";
import { notFoundMiddleware } from "./presentation/middlewares/not-found.middleware";
import { errorMiddleware } from "./presentation/middlewares/error.middleware";
import organizationRouter from "./presentation/routes/organization.routes.js";
import authRouter from "./presentation/routes/auth.routes.js";
import cookieParser from "cookie-parser";



const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organizations", organizationRouter);
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FlexBot API is running",
    timestamp: new Date().toISOString(),
  });
});

//Handle requests to undefined routes
app.use(notFoundMiddleware);
//Handle error from the application.
app.use(errorMiddleware);


export default app;