import { Router } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../prisma";
import { sendError, sendSuccess, AuthRequest } from "../utils";

const router = Router();
router.use(authenticate);

router.get("/messages", async (req: AuthRequest, res) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    },
    include: { sender: true, receiver: true },
    orderBy: { createdAt: "desc" }
  });

  return sendSuccess(res, messages);
});

router.put("/messages/:id/read", async (req: AuthRequest, res) => {
  const message = await prisma.message.update({
    where: { id: req.params.id },
    data: { read: true }
  });

  return sendSuccess(res, message);
});

router.get("/notifications", async (req: AuthRequest, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" }
  });

  return sendSuccess(res, notifications);
});

router.put("/notifications/:id/read", async (req: AuthRequest, res) => {
  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true }
  });

  return sendSuccess(res, notification);
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
    },
    include: {
      sender: true,
      receiver: true
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

export default router;