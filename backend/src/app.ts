import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import tutorRoutes from "./routes/tutors";
import recruiterRoutes from "./routes/recruiters";
import adminRoutes from "./routes/admin";
import messageRoutes from "./routes/messages";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "HomeTutors API is running." });
});
app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

export default app;
