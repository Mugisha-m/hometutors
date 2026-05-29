import { Router } from "express";
import prisma from "../prisma";
import { authenticate, authorizeRole } from "../middleware/auth";
import { sendError, sendSuccess, AuthRequest } from "../utils";

const router = Router();
router.use(authenticate, authorizeRole(["ADMIN"]));

router.get("/dashboard", async (_req, res) => {
  const totalTutors = await prisma.tutorProfile.count();
  const totalRecruiters = await prisma.recruiterProfile.count();
  const pendingRecruiters = await prisma.recruiterProfile.count({ where: { approved: false } });
  const totalMessages = await prisma.message.count();

  return sendSuccess(res, { totalTutors, totalRecruiters, pendingRecruiters, totalMessages });
});

router.post("/approve-recruiter", async (req: AuthRequest, res) => {
  const { recruiterId } = req.body;
  if (!recruiterId) return sendError(res, "Recruiter id is required");
  const recruiter = await prisma.recruiterProfile.update({
    where: { id: recruiterId },
    data: { approved: true }
  });
  await prisma.user.update({ where: { id: recruiter.userId }, data: { adminApproved: true } });
  return sendSuccess(res, recruiter);
});

router.post("/unapprove-recruiter", async (req: AuthRequest, res) => {
  const { userId } = req.body;
  if (!userId) return sendError(res, "userId is required");
  const recruiter = await prisma.recruiterProfile.update({
    where: { userId },
    data: { approved: false }
  });
  await prisma.user.update({ where: { id: userId }, data: { adminApproved: false } });
  return sendSuccess(res, recruiter);
});

router.post("/approve-contact", async (req: AuthRequest, res) => {
  const { recruiterUserId } = req.body;
  if (!recruiterUserId) {
    return sendError(res, "Recruiter user id is required");
  }

  const recruiter = await prisma.recruiterProfile.update({
    where: { userId: recruiterUserId },
    data: { approved: true }
  });
  await prisma.notification.create({
    data: {
      userId: recruiterUserId,
      title: "Contact access approved",
      message: "Admin has approved your request to view tutor contact details.",
      type: "approval"
    }
  });
  return sendSuccess(res, recruiter);
});

router.get("/payments", async (_req, res) => {
  const payments = await prisma.payment.findMany({ include: { user: true } });
  return sendSuccess(res, payments);
});

router.get("/messages", async (_req, res) => {
  const messages = await prisma.message.findMany({ include: { sender: true, receiver: true } });
  return sendSuccess(res, messages);
});

router.get("/notifications", async (_req, res) => {
  const notifications = await prisma.notification.findMany({ include: { user: true } });
  return sendSuccess(res, notifications);
});

router.post("/notify", async (req: AuthRequest, res) => {
  const { userId, title, message, type } = req.body;
  if (!userId || !title || !message) {
    return sendError(res, "userId, title and message are required");
  }
  const notification = await prisma.notification.create({
    data: { userId, title, message, type: type || "message" }
  });
  return sendSuccess(res, notification);
});

router.delete("/messages/:id", async (req: AuthRequest, res) => {
  const message = await prisma.message.delete({ where: { id: req.params.id } });
  return sendSuccess(res, message);
});

router.delete("/notifications/:id", async (req: AuthRequest, res) => {
  const notification = await prisma.notification.delete({ where: { id: req.params.id } });
  return sendSuccess(res, notification);
});

router.post("/verify-tutor", async (req: AuthRequest, res) => {
  const { tutorId } = req.body;
  if (!tutorId) {
    return sendError(res, "Tutor id is required");
  }

  const tutor = await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: { verified: true }
  });

  await prisma.notification.create({
    data: {
      userId: tutor.userId,
      title: "Profile verified",
      message: "Your tutor profile has been verified by admin.",
      type: "verification"
    }
  });

  return sendSuccess(res, tutor);
});

router.get("/contact-requests", async (_req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { type: "request" },
    include: { user: true }
  });

  return sendSuccess(res, notifications);
});

router.get("/unverified-tutors", async (_req, res) => {
  const tutors = await prisma.tutorProfile.findMany({
    where: { verified: false },
    include: { user: true, documents: true }
  });

  return sendSuccess(res, tutors);
});

router.post("/send-message", async (req: AuthRequest, res) => {
  const { receiverId, subject, body } = req.body;
  if (!receiverId || !subject || !body) {
    return sendError(res, "Receiver, subject and body are required");
  }

  const message = await prisma.message.create({
    data: {
      senderId: req.user.id,
      receiverId,
      subject,
      body
    }
  });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      title: "New message",
      message: `You have a new message: ${subject}`,
      type: "message"
    }
  });

  return sendSuccess(res, message);
});

router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      phone: true,
      email: true,
      role: true,
      adminApproved: true,
      createdAt: true
    }
  });

  return sendSuccess(res, users);
});

router.delete("/users/:id", async (req: AuthRequest, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return sendError(res, "User not found", 404);
  if (user.role === "ADMIN") return sendError(res, "Cannot delete admin", 403);
  await prisma.user.delete({ where: { id } });
  return sendSuccess(res, { message: "User deleted" });
});

router.patch("/payments/:id/status", async (req: AuthRequest, res) => {
  const { status } = req.body;
  if (!status) return sendError(res, "Status is required");
  const payment = await prisma.payment.update({
    where: { id: req.params.id },
    data: { status }
  });
  return sendSuccess(res, payment);
});

export default router;
