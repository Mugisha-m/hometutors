import { Router } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../prisma";
import { sendError, sendSuccess, AuthRequest } from "../utils";

const router = Router();

router.get("/profile", authenticate, async (req: AuthRequest, res) => {
  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: req.user.id }
  });
  if (!profile) {
    return sendError(res, "Recruiter profile not found", 404);
  }
  return sendSuccess(res, profile);
});

router.get("/pending-requests", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "ADMIN") {
    return sendError(res, "Unauthorized", 403);
  }

  const pending = await prisma.recruiterProfile.findMany({ where: { approved: false }, include: { user: true } });
  return sendSuccess(res, pending);
});

router.post("/activity", authenticate, async (req: AuthRequest, res) => {
  const { active } = req.body;
  if (req.user.role !== "TUTOR") {
    return sendError(res, "Only tutors can update weekly activity", 403);
  }

  const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: req.user.id } });
  if (!tutorProfile) {
    return sendError(res, "Tutor profile not found", 404);
  }

  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  const weekStart = new Date(startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()));

  const record = await prisma.weeklyActivity.upsert({
    where: { tutorId_weekStart: { tutorId: tutorProfile.id, weekStart } },
    create: { tutorId: tutorProfile.id, weekStart, active },
    update: { active }
  });

  return sendSuccess(res, record);
});

router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "RECRUITER") {
    return sendError(res, "Only recruiters can update their profile", 403);
  }

  const { companyName, fullName } = req.body;

  const updatedProfile = await prisma.recruiterProfile.update({
    where: { userId: req.user.id },
    data: { companyName, fullName }
  });

  return sendSuccess(res, updatedProfile);
});

router.post("/payments", authenticate, async (req: AuthRequest, res) => {
  const { amount, description } = req.body;
  if (!amount || !description) {
    return sendError(res, "Amount and description are required");
  }

  const payment = await prisma.payment.create({
    data: {
      userId: req.user.id,
      amount: parseFloat(amount),
      description,
      status: "recorded"
    }
  });

  return sendSuccess(res, payment);
});

router.get("/payments", authenticate, async (req: AuthRequest, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" }
  });

  return sendSuccess(res, payments);
});

export default router;
