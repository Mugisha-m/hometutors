import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";

interface PendingRecruiter {
  id: string;
  user: {
    id: string;
    phone: string;
    email?: string;
  };
  fullName?: string;
  companyName?: string;
}

interface ContactRequest {
  id: string;
  title: string;
  message: string;
  user: {
    id: string;
    phone: string;
  };
}

interface UnverifiedTutor {
  id: string;
  displayName: string;
  user: {
    phone: string;
  };
  documents: any[];
}

const AdminApprovalsPage = () => {
  const navigate = useNavigate();
  const [pendingRecruiters, setPendingRecruiters] = useState<PendingRecruiter[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [unverifiedTutors, setUnverifiedTutors] = useState<UnverifiedTutor[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        const [recruitersRes, requestsRes, tutorsRes] = await Promise.all([
          axios.get("http://localhost:4000/api/recruiters/pending-requests", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:4000/api/admin/contact-requests", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:4000/api/admin/unverified-tutors", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setPendingRecruiters(recruitersRes.data.data);
        setContactRequests(requestsRes.data.data);
        setUnverifiedTutors(tutorsRes.data.data);
      } catch (error) {
        navigate("/login");
      }
    };

    loadData();
  }, [navigate]);

  const approveRecruiter = async (recruiterId: string) => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      await axios.post("http://localhost:4000/api/admin/approve-recruiter", { recruiterId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRecruiters(prev => prev.filter(r => r.id !== recruiterId));
      alert("Recruiter approved!");
    } catch (error) {
      alert("Failed to approve recruiter");
    }
  };

  const approveContact = async (recruiterUserId: string) => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      await axios.post("http://localhost:4000/api/admin/approve-contact", { recruiterUserId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContactRequests(prev => prev.filter(r => r.user.id !== recruiterUserId));
      alert("Contact access approved!");
    } catch (error) {
      alert("Failed to approve contact access");
    }
  };

  const verifyTutor = async (tutorId: string) => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      await axios.post("http://localhost:4000/api/admin/verify-tutor", { tutorId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnverifiedTutors(prev => prev.filter(t => t.id !== tutorId));
      alert("Tutor verified!");
    } catch (error) {
      alert("Failed to verify tutor");
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-turquoise">Admin approvals</p>
          <h1 className="text-3xl font-bold text-charcoal">Manage Approvals</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">Pending Recruiter Approvals</h2>
          <div className="space-y-4">
            {pendingRecruiters.length === 0 ? (
              <p className="text-slate-500">No pending recruiter approvals.</p>
            ) : (
              pendingRecruiters.map((recruiter) => (
                <div key={recruiter.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-charcoal">{recruiter.fullName || "Unnamed"}</p>
                      <p className="text-sm text-slate-600">{recruiter.companyName || "No company"}</p>
                      <p className="text-sm text-slate-500">{recruiter.user.phone}</p>
                    </div>
                    <PrimaryButton label="Approve" onClick={() => approveRecruiter(recruiter.id)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">Contact Access Requests</h2>
          <div className="space-y-4">
            {contactRequests.length === 0 ? (
              <p className="text-slate-500">No contact access requests.</p>
            ) : (
              contactRequests.map((request) => (
                <div key={request.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-charcoal">{request.title}</p>
                      <p className="text-sm text-slate-600">{request.message}</p>
                      <p className="text-sm text-slate-500">From: {request.user.phone}</p>
                    </div>
                    <PrimaryButton label="Approve" onClick={() => approveContact(request.user.id)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">Tutor Verification</h2>
          <div className="space-y-4">
            {unverifiedTutors.length === 0 ? (
              <p className="text-slate-500">No tutors awaiting verification.</p>
            ) : (
              unverifiedTutors.map((tutor) => (
                <div key={tutor.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-charcoal">{tutor.displayName}</p>
                      <p className="text-sm text-slate-600">{tutor.user.phone}</p>
                      <p className="text-sm text-slate-500">{tutor.documents.length} documents</p>
                    </div>
                    <PrimaryButton label="Verify" onClick={() => verifyTutor(tutor.id)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminApprovalsPage;