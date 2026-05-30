import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import prisma from "../prisma";
import { sendError, sendSuccess } from "../utils";
import { authenticate } from "../middleware/auth";

const router = Router();

const signupSchema = z.object({
  phone: z.string().min(7),
  email: z.string().email().optional(),
  password: z.string().min(6),
  role: z.enum(["TUTOR", "RECRUITER"]),
  name: z.string().optional(),
  companyName: z.string().optional()
});

const loginSchema = z.object({
  phone: z.string(),
  password: z.string()
});

router.post("/signup", async (req, res) => {
  const parseResult = signupSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendError(res, parseResult.error.message);
  }

  const { phone, email, password, role, name, companyName } = parseResult.data;
  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return sendError(res, "Phone already registered", 409);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      phone,
      email,
      password: hashed,
      role,
      adminApproved: role === "RECRUITER" ? false : true,
      recruiterProfile: role === "RECRUITER" ? {
        create: {
          companyName,
          fullName: name
        }
      } : undefined,
      tutorProfile: role === "TUTOR" ? {
        create: {
          displayName: name || "Tutor",
          skills: "",
          diploma: "",
          certificates: "",
          bio: ""
        }
      } : undefined
    }
  });

  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: "7d" });
  return sendSuccess(res, { token, user: { id: user.id, phone: user.phone, role: user.role } });
});

router.post("/login", async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return sendError(res, parseResult.error.message);
  }
  const { phone, password } = parseResult.data;

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return sendError(res, "Invalid credentials", 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return sendError(res, "Invalid credentials", 401);
  }

  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: "7d" });
  return sendSuccess(res, { token, user: { id: user.id, phone: user.phone, role: user.role, adminApproved: user.adminApproved } });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Missing auth header", 401);
  }

  try {
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        phone: true,
        email: true,
        role: true,
        adminApproved: true,
        createdAt: true
      }
    });
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, { user });
  } catch (error) {
    return sendError(res, "Invalid token", 401);
  }
});

router.get("/users", authenticate, async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      phone: true,
      email: true,
      role: true,
      adminApproved: true,
      createdAt: true
    },
    orderBy: { createdAt: "desc" }
  });
  return sendSuccess(res, users);
});

export default router;
