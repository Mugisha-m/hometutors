import { Router } from "express";
import prisma from "../prisma";
import { authenticate } from "../middleware/auth";
import { sendError, sendSuccess, AuthRequest } from "../utils";

const router = Router();

router.get("/", async (req, res) => {
  const tutors = await prisma.tutorProfile.findMany({
    include: {
      user: true,
      weeklyActivities: true
    }
  });
  return sendSuccess(res, tutors.map((tutor) => ({
    id: tutor.id,
    displayName: tutor.displayName,
    skills: tutor.skills,
    diploma: tutor.diploma,
    certificates: tutor.certificates,
    bio: tutor.bio,
    profilePicture: tutor.profilePicture,
    verified: tutor.verified,
    activeThisWeek: tutor.weeklyActivities.some((activity) => activity.active)
  })));
});

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  const tutorId = req.params.id;
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    include: { user: true, documents: true, weeklyActivities: true }
  });
  if (!tutor) {
    return sendError(res, "Tutor not found", 404);
  }

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: req.user.id }
  });

  const canSeeContact = recruiter?.approved;

  return sendSuccess(res, {
    id: tutor.id,
    displayName: tutor.displayName,
    skills: tutor.skills,
    diploma: tutor.diploma,
    certificates: tutor.certificates,
    bio: tutor.bio,
    profilePicture: tutor.profilePicture,
    verified: tutor.verified,
    contactPhone: canSeeContact ? tutor.contactPhone : null,
    contactEmail: canSeeContact ? tutor.contactEmail : null,
    documents: tutor.documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      url: doc.url,
      containsContact: doc.containsContact,
      hidden: doc.containsContact && !canSeeContact
    })),
    activeThisWeek: tutor.weeklyActivities.some((activity) => activity.active)
  });
});

router.post("/:id/request-contact", authenticate, async (req: AuthRequest, res) => {
  const tutorId = req.params.id;
  const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
  if (!recruiterProfile) {
    return sendError(res, "Only approved recruiters can request contact details", 403);
  }

  const tutor = await prisma.tutorProfile.findUnique({ where: { id: tutorId }, include: { user: true } });
  if (!tutor) {
    return sendError(res, "Tutor not found", 404);
  }

  await prisma.notification.create({
    data: {
      userId: tutor.userId,
      title: "Recruiter contact request",
      message: `Recruiter ${recruiterProfile.fullName || recruiterProfile.userId} requested contact access for ${tutor.displayName}`,
      type: "request"
    }
  });

  return sendSuccess(res, { message: "Contact request submitted. Admin will review the request." });
});

router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "TUTOR") {
    return sendError(res, "Only tutors can update their profile", 403);
  }

  const { displayName, skills, diploma, certificates, bio, profilePicture, contactPhone, contactEmail } = req.body;

  const updatedProfile = await prisma.tutorProfile.update({
    where: { userId: req.user.id },
    data: {
      displayName,
      skills,
      diploma,
      certificates,
      bio,
      profilePicture,
      contactPhone,
      contactEmail
    }
  });

  return sendSuccess(res, updatedProfile);
});

router.post("/documents", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "TUTOR") {
    return sendError(res, "Only tutors can upload documents", 403);
  }

  const { title, url, containsContact } = req.body;
  if (!title || !url) {
    return sendError(res, "Title and URL are required");
  }

  const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: req.user.id } });
  if (!tutorProfile) {
    return sendError(res, "Tutor profile not found", 404);
  }

  const document = await prisma.document.create({
    data: {
      tutorId: tutorProfile.id,
      title,
      url,
      containsContact: containsContact || false
    }
  });

  return sendSuccess(res, document);
});

router.get("/profile/me", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "TUTOR") {
    return sendError(res, "Only tutors can access their profile", 403);
  }

  const profile = await prisma.tutorProfile.findUnique({
    where: { userId: req.user.id },
    include: { documents: true, weeklyActivities: true }
  });

  if (!profile) {
    return sendError(res, "Profile not found", 404);
  }

  return sendSuccess(res, profile);
});

router.post("/activity", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "TUTOR") {
    return sendError(res, "Only tutors can update activity", 403);
  }

  const { active } = req.body;
  if (typeof active !== "boolean") {
    return sendError(res, "Active must be a boolean");
  }

  const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: req.user.id } });
  if (!tutorProfile) {
    return sendError(res, "Tutor profile not found", 404);
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  await prisma.weeklyActivity.upsert({
    where: {
      tutorId_weekStart: {
        tutorId: tutorProfile.id,
        weekStart
      }
    },
    update: { active },
    create: {
      tutorId: tutorProfile.id,
      weekStart,
      active
    }
  });

  return sendSuccess(res, { message: "Activity status updated" });
});

export default router;
