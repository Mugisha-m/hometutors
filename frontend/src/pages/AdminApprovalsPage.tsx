import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import PrimaryButton from "../components/PrimaryButton";

interface PendingRecruiter {
  id: string;
  fullName?: string;
  companyName?: string;
  user: { id: string; phone: string; email?: string };
}

interface ContactRequest {
  id: string;
  recruiterUserId: string;
  recruiterName: string;
  tutorName: string;
  rawMessage: string;
}

interface UnverifiedTutor {
  id: string;
  displayName: string;
  user: { phone: string };
  documents: { id: string; title: string }[];
}

const token = () => localStorage.getItem("hometutors_token") ?? "";
const headers = () => ({ Authorization: `Bearer ${token()}` });

const AdminApprovalsPage = () => {
  const navigate = useNavigate();
  const [pendingRecruiters, setPendingRecruiters] = useState<PendingRecruiter[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [unverifiedTutors, setUnverifiedTutors] = useState<UnverifiedTutor[]>([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!token()) { navigate("/login"); return; }
    load();
  }, []);

  const load = async () => {
    try {
      const [recruitersRes, requestsRes, tutorsRes] = await Promise.all([
        api.get("/api/recruiters/pending-requests", { headers: headers() }),
        api.get("/api/admin/contact-requests", { headers: headers() }),
        api.get("/api/admin/unverified-tutors", { headers: headers() }),
      ]);

      setPendingRecruiters(recruitersRes.data.data);

      // Parse JSON-encoded message to extract recruiterUserId
      const parsed: ContactRequest[] = (requestsRes.data.data as any[]).map((n: any) => {
        try {
          const data = JSON.parse(n.message);
          return {
            id: n.id,
            recruiterUserId: data.recruiterUserId,
            recruiterName: data.recruiterName,
            tutorName: data.tutorName,
            rawMessage: n.message,
          };
        } catch {
          // Legacy plain-text notifications — skip or show as-is
          return null;
        }
      }).filter(Boolean) as ContactRequest[];

      setContactRequests(parsed);
      setUnverifiedTutors(tutorsRes.data.data);
    } catch {
      navigate("/login");
    }
  };

  const approveRecruiter = async (recruiterId: string) => {
    try {
      await api.post("/api/admin/approve-recruiter", { recruiterId }, { headers: headers() });
      setPendingRecruiters(prev => prev.filter(r => r.id !== recruiterId));
      setFeedback("Recruiter approved.");
    } catch { setFeedback("Failed to approve recruiter."); }
  };

  const approveContact = async (request: ContactRequest) => {
    try {
      await api.post("/api/admin/approve-contact", { recruiterUserId: request.recruiterUserId }, { headers: headers() });
      // Also delete the notification
      await api.delete(`/api/admin/notifications/${request.id}`, { headers: headers() });
      setContactRequests(prev => prev.filter(r => r.id !== request.id));
      setFeedback("Contact access approved.");
    } catch { setFeedback("Failed to approve contact access."); }
  };

  const verifyTutor = async (tutorId: string) => {
    try {
      await api.post("/api/admin/verify-tutor", { tutorId }, { headers: headers() });
      setUnverifiedTutors(prev => prev.filter(t => t.id !== tutorId));
      setFeedback("Tutor verified.");
    } catch { setFeedback("Failed to verify tutor."); }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <p className="text-sm uppercase tracking-[0.3em] text-turquoise">Admin</p>
        <h1 className="mt-1 text-3xl font-bold text-charcoal">Manage Approvals</h1>
        {feedback && (
          <p className="mt-3 inline-block rounded-2xl bg-softgreen/10 px-4 py-2 text-sm font-medium text-softgreen">
            {feedback}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Pending recruiter approvals */}
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-charcoal">Recruiter Approvals</h2>
          <p className="mb-5 text-sm text-slate-400">{pendingRecruiters.length} pending</p>
          <div className="space-y-4">
            {pendingRecruiters.length === 0
              ? <p className="text-sm text-slate-400">No pending approvals.</p>
              : pendingRecruiters.map((r) => (
                <div key={r.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-charcoal">{r.fullName || "Unnamed"}</p>
                  <p className="text-sm text-slate-500">{r.companyName || "No company"}</p>
                  <p className="text-sm text-slate-400">{r.user.phone}</p>
                  <div className="mt-3">
                    <PrimaryButton label="Approve" onClick={() => approveRecruiter(r.id)} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Contact access requests */}
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-charcoal">Contact Access Requests</h2>
          <p className="mb-5 text-sm text-slate-400">{contactRequests.length} pending</p>
          <div className="space-y-4">
            {contactRequests.length === 0
              ? <p className="text-sm text-slate-400">No contact requests.</p>
              : contactRequests.map((req) => (
                <div key={req.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-charcoal">{req.recruiterName}</p>
                  <p className="text-sm text-slate-500">Wants contact for: <span className="font-medium text-charcoal">{req.tutorName}</span></p>
                  <div className="mt-3">
                    <PrimaryButton label="Approve Access" onClick={() => approveContact(req)} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Tutor verification */}
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-charcoal">Tutor Verification</h2>
          <p className="mb-5 text-sm text-slate-400">{unverifiedTutors.length} awaiting</p>
          <div className="space-y-4">
            {unverifiedTutors.length === 0
              ? <p className="text-sm text-slate-400">No tutors awaiting verification.</p>
              : unverifiedTutors.map((t) => (
                <div key={t.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-charcoal">{t.displayName}</p>
                  <p className="text-sm text-slate-500">{t.user.phone}</p>
                  <p className="text-xs text-slate-400">{t.documents.length} document{t.documents.length !== 1 ? "s" : ""}</p>
                  <div className="mt-3">
                    <PrimaryButton label="Verify" onClick={() => verifyTutor(t.id)} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </section>
  );
};

export default AdminApprovalsPage;
