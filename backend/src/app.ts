import express from "express";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth";
import tutorRoutes from "./routes/tutors";
import recruiterRoutes from "./routes/recruiters";
import adminRoutes from "./routes/admin";
import messageRoutes from "./routes/messages";
import chatRoutes from "./routes/chat";
import uploadRoutes from "./routes/upload";

const app = express();
app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "HomeTutors API is running." });
});
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/upload", uploadRoutes);

export default app;
