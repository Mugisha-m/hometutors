import { Router } from "express";
import { sendSuccess } from "../utils";

const router = Router();

const rules: { pattern: RegExp; answer: (role?: string) => string }[] = [
  {
    pattern: /sign\s*up|register|create.*(account|profile)/i,
    answer: () =>
      "To sign up, go to /signup and choose your role — Tutor or Recruiter. Fill in your phone, email, password, and name, then submit."
  },
  {
    pattern: /tutor.*(onboard|start|begin|steps|how)/i,
    answer: () =>
      "As a tutor: sign up → your profile is created automatically → fill in your skills, bio, and diploma from your dashboard → upload documents → update your weekly activity status each week."
  },
  {
    pattern: /recruiter.*(onboard|start|begin|steps|how)/i,
    answer: () =>
      "As a recruiter: sign up → wait for admin approval → once approved you can browse tutors and view their contact details."
  },
  {
    pattern: /approv|pending|waiting|status/i,
    answer: (role) => {
      if (role === "RECRUITER")
        return "Your account is pending admin approval. Once approved, you will be able to view tutor contact details. Check your dashboard for your current approval status.";
      if (role === "TUTOR")
        return "Tutors do not need approval to use the platform. You can fill your profile and set your weekly activity right away.";
      return "Recruiter accounts require admin approval before accessing tutor contact details. Log in and check your dashboard for your status.";
    }
  },
  {
    pattern: /contact.*(tutor|detail|info|phone|email|hidden)/i,
    answer: (role) => {
      if (role === "RECRUITER")
        return "Tutor contact details are hidden until admin approves your account. Once approved, visit any tutor profile to see their phone and email.";
      return "Tutor contact details are only visible to approved recruiters. Recruiters must sign up and wait for admin approval.";
    }
  },
  {
    pattern: /request.*(contact|access)/i,
    answer: () =>
      "On any tutor's profile page, click 'Request Contact Access'. This sends a notification to admin who will review and approve your request."
  },
  {
    pattern: /weekly.*(activity|status|active)/i,
    answer: () =>
      "Tutors can update their weekly activity from their dashboard. Check the 'I am active this week' checkbox and click 'Update Status'."
  },
  {
    pattern: /document|upload|certificate|diploma/i,
    answer: () =>
      "Tutors can upload documents (certificates, diplomas, IDs) from their dashboard. Provide a title and a URL to the document. Mark it if it contains contact information — those will be hidden from unapproved recruiters."
  },
  {
    pattern: /edit.*(profile|info|bio|skill)|update.*(profile|info|bio|skill)/i,
    answer: () =>
      "Go to your dashboard and click 'Edit Profile'. Update your display name, skills, diploma, bio, and contact details, then click 'Save Changes'."
  },
  {
    pattern: /login|sign\s*in|password/i,
    answer: () =>
      "Go to /login and enter your phone number and password. If you forgot your password, contact admin at 0799399575 or mugisharutijanaalbert@gmail.com."
  },
  {
    pattern: /admin.*(contact|reach|email|phone|whatsapp)/i,
    answer: () =>
      "You can reach the admin by phone at 0799399575 or by email at mugisharutijanaalbert@gmail.com."
  },
  {
    pattern: /payment/i,
    answer: (role) => {
      if (role === "RECRUITER")
        return "You can record payments from your recruiter dashboard. Go to 'Record Payment', enter the amount and description, and submit.";
      return "Payment tracking is available for recruiters from their dashboard, and for admin from the payments panel.";
    }
  },
  {
    pattern: /message|inbox|notification/i,
    answer: () =>
      "Go to /messages to view your inbox, sent messages, and notifications. You can also compose new messages to other users from there."
  },
  {
    pattern: /verif(y|ied|ication)/i,
    answer: () =>
      "Tutor profile verification is done by admin. Once verified, a 'Verified' badge appears on your profile. Contact admin if you'd like your profile reviewed."
  },
  {
    pattern: /hello|hi|hey|good (morning|afternoon|evening)/i,
    answer: () =>
      "Hello! I'm the HomeTutors assistant. I can help with signing up, tutor profiles, recruiter approval, contact access, and more. What do you need?"
  },
  {
    pattern: /thank/i,
    answer: () => "You're welcome! Let me know if there's anything else I can help with."
  }
];

const fallback =
  "I can only help with HomeTutors — tutor profiles, recruiter approval, contact access, account questions, or reaching admin. Could you rephrase your question?";

router.post("/", (req, res) => {
  const { message, role } = req.body as { message?: string; role?: string };
  if (!message?.trim()) return sendSuccess(res, { reply: fallback });

  for (const rule of rules) {
    if (rule.pattern.test(message)) {
      return sendSuccess(res, { reply: rule.answer(role) });
    }
  }

  return sendSuccess(res, { reply: fallback });
});

export default router;
