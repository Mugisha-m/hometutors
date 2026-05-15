import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PrimaryButton from "../components/PrimaryButton";

interface TutorProfile {
  id: string;
  displayName: string;
  skills: string;
  diploma: string;
  certificates: string;
  bio: string;
  profilePicture?: string;
  contactPhone?: string;
  contactEmail?: string;
  verified: boolean;
  documents: any[];
  weeklyActivities: any[];
}

const TutorDashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [activeThisWeek, setActiveThisWeek] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    skills: "",
    diploma: "",
    certificates: "",
    bio: "",
    contactPhone: "",
    contactEmail: ""
  });
  const [documentForm, setDocumentForm] = useState({
    title: "",
    url: "",
    containsContact: false
  });

  useEffect(() => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("http://localhost:4000/api/tutors/profile/me", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((response) => {
      setProfile(response.data.data);
      setFormData({
        displayName: response.data.data.displayName,
        skills: response.data.data.skills,
        diploma: response.data.data.diploma,
        certificates: response.data.data.certificates,
        bio: response.data.data.bio,
        contactPhone: response.data.data.contactPhone || "",
        contactEmail: response.data.data.contactEmail || ""
      });
      setActiveThisWeek(response.data.data.weeklyActivities.some((activity: any) => activity.active));
    }).catch(() => navigate("/login"));
  }, [navigate]);

  const handleActivityUpdate = async () => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      await axios.post("http://localhost:4000/api/tutors/activity", { active: activeThisWeek }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Activity status updated!");
    } catch (error) {
      alert("Failed to update activity status");
      return;
    }

    try {
      const response = await axios.get("http://localhost:4000/api/tutors/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.data);
      setActiveThisWeek(response.data.data.weeklyActivities.some((activity: any) => activity.active));
    } catch {
      // ignore refresh failure, keep current state
    }
  };

  const handleProfileUpdate = async () => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    try {
      const response = await axios.put("http://localhost:4000/api/tutors/profile", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.data);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  const handleDocumentUpload = async () => {
    const token = localStorage.getItem("hometutors_token");
    if (!token) return;

    if (!documentForm.title || !documentForm.url) {
      alert("Title and URL are required");
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/tutors/documents", documentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocumentForm({ title: "", url: "", containsContact: false });
      // Refresh profile to show new document
      const response = await axios.get("http://localhost:4000/api/tutors/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.data);
      alert("Document uploaded successfully!");
    } catch (error) {
      alert("Failed to upload document");
    }
  };

  if (!profile) {
    return <p className="text-slate-600">Loading dashboard…</p>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-turquoise">Tutor dashboard</p>
            <h1 className="text-3xl font-bold text-charcoal">Welcome, {profile.displayName}</h1>
          </div>
          <div className="flex gap-3">
            <PrimaryButton label={editing ? "Save Changes" : "Edit Profile"} onClick={editing ? handleProfileUpdate : () => setEditing(!editing)} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">Weekly Activity Status</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={activeThisWeek}
                onChange={(e) => setActiveThisWeek(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="text-slate-700">I am active this week</span>
            </label>
            <PrimaryButton label="Update Status" onClick={handleActivityUpdate} />
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-charcoal">Profile Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Verified</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.verified ? "bg-softgreen/15 text-softgreen" : "bg-slate-100 text-slate-600"}`}>
                {profile.verified ? "Yes" : "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Documents</span>
              <span className="text-slate-700">{profile.documents.length} uploaded</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Active this week</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${activeThisWeek ? "bg-softgreen/15 text-softgreen" : "bg-slate-100 text-slate-600"}`}>
                {activeThisWeek ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-charcoal">Profile Information</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">Display Name</span>
            <input
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              disabled={!editing}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">Skills</span>
            <input
              value={formData.skills}
              onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
              disabled={!editing}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">Diploma</span>
            <input
              value={formData.diploma}
              onChange={(e) => setFormData(prev => ({ ...prev, diploma: e.target.value }))}
              disabled={!editing}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">Certificates</span>
            <input
              value={formData.certificates}
              onChange={(e) => setFormData(prev => ({ ...prev, certificates: e.target.value }))}
              disabled={!editing}
            />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-charcoal">Bio</span>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!editing}
              rows={4}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">Contact Phone</span>
            <input
              value={formData.contactPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              disabled={!editing}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">Contact Email</span>
            <input
              value={formData.contactEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              disabled={!editing}
            />
          </label>
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold text-charcoal">Upload Documents</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">Document Title</span>
            <input
              value={documentForm.title}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., National ID, Certificate"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-charcoal">Document URL</span>
            <input
              value={documentForm.url}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
            />
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={documentForm.containsContact}
              onChange={(e) => setDocumentForm(prev => ({ ...prev, containsContact: e.target.checked }))}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700">This document contains contact information</span>
          </label>
          <div className="flex items-end">
            <PrimaryButton label="Upload Document" onClick={handleDocumentUpload} />
          </div>
        </div>
        {profile && profile.documents.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-charcoal">Uploaded Documents</h3>
            <div className="space-y-3">
              {profile.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                  <div>
                    <p className="font-medium text-charcoal">{doc.title}</p>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-turquoise hover:underline">
                      View Document
                    </a>
                  </div>
                  {doc.containsContact && <span className="rounded-full bg-crimson/10 px-3 py-1 text-xs text-crimson">Contains Contact Info</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TutorDashboardPage;