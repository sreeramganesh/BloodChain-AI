import {
  Home,
  Droplets,
  FileText,
  Users,
  Sun,
  Truck,
  Building2,
  Heart,
  Bell,
  Settings,
  CircleHelp,
  LogOut,
  Activity,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: Home,
  },
  {
    label: "Blood Inventory",
    icon: Droplets,
  },
  {
    label: "Blood Request",
    icon: FileText,
  },
  {
    label: "Find Donors",
    icon: Users,
  },
  {
    label: "AI Recommendation",
    icon: Sun,
  },
  {
    label: "Approval & Transfer",
    icon: Truck,
  },
  {
    label: "Hospitals & Blood Banks",
    icon: Building2,
  },
  {
    label: "My Donations",
    icon: Heart,
  },
  {
    label: "My Requests",
    icon: FileText,
  },
  {
    label: "Notifications",
    icon: Bell,
  },
];

function Sidebar({ activePage = "Dashboard", onNavigate }) {
  return (
    <aside className="sidebar">
      {/* =========================
          BRAND
      ========================= */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Activity size={29} strokeWidth={2.4} />
        </div>

        <div>
          <div className="brand-name">
            BloodChain <span>AI</span>
          </div>

          <div className="brand-tagline">Connect. Predict. Save Lives.</div>
        </div>
      </div>

      {/* =========================
          MAIN MENU
      ========================= */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive = activePage === item.label;

          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate?.(item.label)}
            >
              <Icon size={22} strokeWidth={2} />

              <span>{item.label}</span>

              {item.label === "Notifications" && (
                <span className="notification-count">3</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* =========================
          DIVIDER
      ========================= */}
      <div className="sidebar-divider" />

      {/* =========================
          BOTTOM MENU
      ========================= */}
      <div className="sidebar-bottom-menu">
        {/* SETTINGS */}
        <button
          type="button"
          className={`sidebar-item ${
            activePage === "Settings" ? "active" : ""
          }`}
          onClick={() => onNavigate?.("Settings")}
        >
          <Settings size={22} strokeWidth={2} />

          <span>Settings</span>
        </button>

        {/* HELP */}
        <button
          type="button"
          className={`sidebar-item ${
            activePage === "Help & Support" ? "active" : ""
          }`}
          onClick={() => onNavigate?.("Help & Support")}
        >
          <CircleHelp size={22} strokeWidth={2} />

          <span>Help & Support</span>
        </button>

        {/* LOGOUT */}
        <button
          type="button"
          className="sidebar-item"
          onClick={() => onNavigate?.("Logout")}
        >
          <LogOut size={22} strokeWidth={2} />

          <span>Logout</span>
        </button>
      </div>

      {/* =========================
          FOOTER
      ========================= */}
      <div className="sidebar-footer">
        <div className="footer-heart">
          <Heart size={38} fill="currentColor" />
        </div>

        <div className="footer-title">
          Together
          <br />
          We Can Save Lives
        </div>

        <div className="heartbeat-line">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="version">BloodChain AI v1.0.0</div>
      </div>
    </aside>
  );
}

export default Sidebar;
