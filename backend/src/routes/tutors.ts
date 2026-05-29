import { Router } from "express";
import prisma from "../prisma";
import { authenticate } from "../middleware/auth";
import { sendError, sendSuccess, AuthRequest } from "../utils";

const router = Router();

router.get("/", async (req, res) => {
  const { q, location, active, verified } = req.query;

  const where: any = {};

  if (verified === "true") {
    where.verified = true;
  }

  if (active === "true") {
    where.weeklyActivities = {
      some: {
        active: true
      }
    };
  }

  const andConditions: any[] = [];

  if (q && typeof q === "string" && q.trim()) {
    const searchStr = q.trim();
    andConditions.push({
      OR: [
        { displayName: { contains: searchStr, mode: "insensitive" } },
        { skills: { contains: searchStr, mode: "insensitive" } },
        { bio: { contains: searchStr, mode: "insensitive" } },
        { diploma: { contains: searchStr, mode: "insensitive" } }
      ]
    });
  }

  if (location && typeof location === "string" && location.trim()) {
    const locStr = location.trim();
    andConditions.push({
      OR: [
        { district: { contains: locStr, mode: "insensitive" } },
        { sector: { contains: locStr, mode: "insensitive" } },
        { city: { contains: locStr, mode: "insensitive" } }
      ]
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const tutors = await prisma.tutorProfile.findMany({
    where,
    include: { user: true, weeklyActivities: true }
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
    district: tutor.district,
    sector: tutor.sector,
    city: tutor.city,
    activeThisWeek: tutor.weeklyActivities.some((a) => a.active)
  })));
});

// Must be before /:id
router.get("/profile/me", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "TUTOR") return sendError(res, "Only tutors can access their profile", 403);
  const profile = await prisma.tutorProfile.findUnique({
    where: { userId: req.user.id },
    include: { documents: true, weeklyActivities: true }
  });
  if (!profile) return sendError(res, "Profile not found", 404);
  return sendSuccess(res, profile);
});

router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "TUTOR") return sendError(res, "Only tutors can update their profile", 403);
  const { displayName, skills, diploma, certificates, bio, profilePicture, contactPhone, contactEmail, district, sector, city } = req.body;
  const updatedProfile = await prisma.tutorProfile.update({
    where: { userId: req.user.id },
    data: { displayName, skills, diploma, certificates, bio, profilePicture, contactPhone, contactEmail, district, sector, city }
  });
  return sendSuccess(res, updatedProfile);
});

router.post("/documents", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "TUTOR") return sendError(res, "Only tutors can upload documents", 403);
  const { title, url, containsContact } = req.body;
  if (!title || !url) return sendError(res, "Title and URL are required");
  const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: req.user.id } });
  if (!tutorProfile) return sendError(res, "Tutor profile not found", 404);
  const document = await prisma.document.create({
    data: { tutorId: tutorProfile.id, title, url, containsContact: containsContact || false }
  });
  return sendSuccess(res, document);
});

router.post("/activity", authenticate, async (req: AuthRequest, res) => {
  if (req.user.role !== "TUTOR") return sendError(res, "Only tutors can update activity", 403);
  const { active } = req.body;
  if (typeof active !== "boolean") return sendError(res, "Active must be a boolean");
  const tutorProfile = await prisma.tutorProfile.findUnique({ where: { userId: req.user.id } });
  if (!tutorProfile) return sendError(res, "Tutor profile not found", 404);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  await prisma.weeklyActivity.upsert({
    where: { tutorId_weekStart: { tutorId: tutorProfile.id, weekStart } },
    update: { active },
    create: { tutorId: tutorProfile.id, weekStart, active }
  });
  return sendSuccess(res, { message: "Activity status updated" });
});

router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: req.params.id },
    include: { user: true, documents: true, weeklyActivities: true }
  });
  if (!tutor) return sendError(res, "Tutor not found", 404);

  // Admin can always see contact info
  const isAdmin = req.user.role === "ADMIN";
  const recruiter = isAdmin ? null : await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
  const canSeeContact = isAdmin || recruiter?.approved === true;

  return sendSuccess(res, {
    id: tutor.id,
    displayName: tutor.displayName,
    skills: tutor.skills,
    diploma: tutor.diploma,
    certificates: tutor.certificates,
    bio: tutor.bio,
    profilePicture: tutor.profilePicture,
    verified: tutor.verified,
    district: tutor.district,
    sector: tutor.sector,
    city: tutor.city,
    contactPhone: canSeeContact ? tutor.contactPhone : null,
    contactEmail: canSeeContact ? tutor.contactEmail : null,
    documents: tutor.documents.map((doc) => ({
      id: doc.id, title: doc.title, url: doc.url,
      containsContact: doc.containsContact,
      hidden: doc.containsContact && !canSeeContact
    })),
    activeThisWeek: tutor.weeklyActivities.some((a) => a.active)
  });
});

router.post("/:id/request-contact", authenticate, async (req: AuthRequest, res) => {
  const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
  if (!recruiterProfile) return sendError(res, "Only recruiters can request contact details", 403);

  const tutor = await prisma.tutorProfile.findUnique({ where: { id: req.params.id } });
  if (!tutor) return sendError(res, "Tutor not found", 404);

  // Store on admin's account with recruiterUserId embedded so admin can approve
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (adminUser) {
    await prisma.notification.create({
      data: {
        userId: adminUser.id,
        title: "Contact access request",
        // JSON so the approvals page can extract recruiterUserId reliably
        message: JSON.stringify({
          recruiterUserId: req.user.id,
          recruiterName: recruiterProfile.fullName || "Unknown",
          tutorName: tutor.displayName,
        }),
        type: "request",
      }
    });
  }

  return sendSuccess(res, { message: "Contact request submitted. Admin will review the request." });
});

export default router;
