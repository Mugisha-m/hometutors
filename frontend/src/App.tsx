import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TutorListPage from "./pages/TutorListPage";
import TutorDetailPage from "./pages/TutorDetailPage";
import TutorDashboardPage from "./pages/TutorDashboardPage";
import RecruiterDashboardPage from "./pages/RecruiterDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminApprovalsPage from "./pages/AdminApprovalsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import MessagesPage from "./pages/MessagesPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-charcoal">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tutors" element={<TutorListPage />} />
          <Route path="/tutors/:id" element={<TutorDetailPage />} />
          <Route
            path="/dashboard/tutor"
            element={
              <ProtectedRoute roles={["TUTOR"]}>
                <TutorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/recruiter"
            element={
              <ProtectedRoute roles={["RECRUITER"]}>
                <RecruiterDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
