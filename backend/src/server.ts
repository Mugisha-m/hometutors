import app from "./app";
import { ensureAdminUser } from "./admin";
import { config } from "./config";

ensureAdminUser().then(() => {
  app.listen(config.port, () => {
    console.log(`HomeTutors backend running on port ${config.port}`);
  });
}).catch((error) => {
  console.error("Failed to ensure admin user:", error);
  process.exit(1);
});
