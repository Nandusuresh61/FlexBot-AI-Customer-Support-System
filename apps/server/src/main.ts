import { env } from "./config/env.js";
import app from "./app.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./infrastructure/database/mongodb.js";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(
      ` FlexBot API running at http://localhost:${env.PORT}`,
    );
  });

  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(() => {
      void disconnectDatabase()
        .then(() => {
          process.exitCode = 0;
        })
        .catch((error: unknown) => {
          console.error("Database disconnection failed:", error);
          process.exitCode = 1;
        });
    });
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error: unknown) => {
  console.error(" Failed to start FlexBot API:", error);
  process.exitCode = 1;
});