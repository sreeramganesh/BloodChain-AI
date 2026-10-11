import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BloodInventory from "./pages/BloodInventory";
import BloodRequest from "./pages/BloodRequest";
import FindDonors from "./pages/FindDonors";
import AIRecommendation from "./pages/AIRecommendation";
import ApprovalTransfer from "./pages/ApprovalTransfer";
import HospitalsBloodBanks from "./pages/HospitalsBloodBanks";
import MyDonations from "./pages/MyDonations";
import MyRequests from "./pages/MyRequests";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";

function App() {
  const [user, setUser] = useState(null);

  const [activePage, setActivePage] = useState("Dashboard");

  // =========================
  // LOGIN
  // =========================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setActivePage("Dashboard");
  };

  // =========================
  // SIDEBAR NAVIGATION
  // =========================

  const handleNavigation = (page) => {
    if (page === "Logout") {
      setUser(null);
      setActivePage("Dashboard");
      return;
    }

    setActivePage(page);
  };

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="app-layout">
      {/* SIDEBAR */}

      <Sidebar activePage={activePage} onNavigate={handleNavigation} />

      {/* MAIN AREA */}

      <div className="main-area">
        {/* TOPBAR */}

        <Topbar user={user} />

        {/* PAGE CONTENT */}

        <main className="page-container">
          {/* =========================
              DASHBOARD
          ========================= */}

          {activePage === "Dashboard" && <Dashboard user={user} />}

          {/* =========================
              BLOOD INVENTORY
          ========================= */}

          {activePage === "Blood Inventory" && <BloodInventory user={user} />}

          {/* =========================
              BLOOD REQUEST
          ========================= */}

          {activePage === "Blood Request" && <BloodRequest user={user} />}

          {/* =========================
              FIND DONORS
          ========================= */}

          {activePage === "Find Donors" && <FindDonors user={user} />}

          {/* =========================
              AI RECOMMENDATION
          ========================= */}

          {activePage === "AI Recommendation" && (
            <AIRecommendation user={user} />
          )}

          {/* =========================
              APPROVAL & TRANSFER
          ========================= */}

          {activePage === "Approval & Transfer" && (
            <ApprovalTransfer user={user} />
          )}

          {/* =========================
              HOSPITALS & BLOOD BANKS
          ========================= */}

          {activePage === "Hospitals & Blood Banks" && (
            <HospitalsBloodBanks user={user} />
          )}

          {/* =========================
              MY DONATIONS
          ========================= */}

          {activePage === "My Donations" && <MyDonations user={user} />}

          {/* =========================
              MY REQUESTS
          ========================= */}

          {activePage === "My Requests" && <MyRequests user={user} />}

          {/* =========================
              NOTIFICATIONS
          ========================= */}

          {activePage === "Notifications" && <Notifications user={user} />}

          {/* =========================
              SETTINGS
          ========================= */}

          {activePage === "Settings" && <Settings user={user} />}

          {/* =========================
              HELP & SUPPORT
          ========================= */}

          {activePage === "Help & Support" && <HelpSupport user={user} />}
        </main>
      </div>
    </div>
  );
}

export default App;
