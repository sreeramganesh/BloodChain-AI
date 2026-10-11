import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Features from "./pages/Features.jsx";
import FeatureDetail from "./pages/FeatureDetail.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Impact from "./pages/Impact.jsx";
import Contact from "./pages/Contact.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";

// Auth & Dashboard Infrastructure
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import AccessDenied from "./pages/AccessDenied.jsx";

// Authenticated Dashboard Pages
import Dashboard from "./pages/Dashboard.jsx";
import BloodInventory from "./pages/BloodInventory.jsx";
import BloodRequest from "./pages/BloodRequest.jsx";
import FindDonors from "./pages/FindDonors.jsx";
import AIRecommendation from "./pages/AIRecommendation.jsx";
import ApprovalTransfer from "./pages/ApprovalTransfer.jsx";
import HospitalsBloodBanks from "./pages/HospitalsBloodBanks.jsx";
import MyDonations from "./pages/MyDonations.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import Notifications from "./pages/Notifications.jsx";
import Settings from "./pages/Settings.jsx";
import HelpSupport from "./pages/HelpSupport.jsx";

import FloatingAIAssistant from "./components/ai-assistant/FloatingAIAssistant.jsx";

export default function App() {
  return (
    <>
      <Routes>
      {/* =========================================
          PUBLIC ROUTES (LANDING WEBSITE)
      ========================================= */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/features/:slug" element={<FeatureDetail />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* =========================================
          AUTHENTICATED APPLICATION ROUTES (WITH RBAC)
      ========================================= */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Universal Authenticated Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/find-donors" element={<FindDonors />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help-support" element={<HelpSupport />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Donor-Specific Routes */}
          <Route
            path="/my-donations"
            element={
              <ProtectedRoute allowedRoles={["donor"]}>
                <MyDonations />
              </ProtectedRoute>
            }
          />

          {/* Operational / Administrative Routes (Hospital & Blood Bank) */}
          <Route
            path="/blood-inventory"
            element={
              <ProtectedRoute allowedRoles={["hospital", "bloodbank"]}>
                <BloodInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blood-request"
            element={
              <ProtectedRoute allowedRoles={["hospital", "bloodbank"]}>
                <BloodRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-recommendation"
            element={
              <ProtectedRoute allowedRoles={["hospital", "bloodbank"]}>
                <AIRecommendation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval-transfer"
            element={
              <ProtectedRoute allowedRoles={["hospital", "bloodbank"]}>
                <ApprovalTransfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approval-and-transfer"
            element={
              <ProtectedRoute allowedRoles={["hospital", "bloodbank"]}>
                <ApprovalTransfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals-blood-banks"
            element={
              <ProtectedRoute allowedRoles={["hospital", "bloodbank"]}>
                <HospitalsBloodBanks />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      {/* =========================================
          FALLBACK ROUTE
      ========================================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <FloatingAIAssistant />
    </>
  );
}