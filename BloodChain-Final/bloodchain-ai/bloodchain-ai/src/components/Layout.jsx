import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";
import "../styles/typography.css";

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="app-layout dashboard-scope">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="main-area">
        {/* TOPBAR */}
        <Topbar user={user} />

        {/* PAGE CONTENT */}
        <main className="page-container">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}

