import { useState, useEffect, useMemo } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
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
import { useAuth } from "../context/AuthContext";
import { getUnreadNotificationCount } from "../services/notificationService";
import { NAVIGATION_BY_ROLE, normalizeRole, ROLES } from "../utils/rbac";

const ICON_MAP = {
  Home,
  Droplets,
  FileText,
  Users,
  Sun,
  Truck,
  Building2,
  Heart,
  Bell,
};

function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const effectiveRole = useMemo(() => {
    return role || normalizeRole(user?.role) || ROLES.DONOR;
  }, [role, user?.role]);

  const menuItems = useMemo(() => {
    return NAVIGATION_BY_ROLE[effectiveRole] || NAVIGATION_BY_ROLE[ROLES.DONOR];
  }, [effectiveRole]);

  useEffect(() => {
    let isMounted = true;
    const loadUnread = async () => {
      try {
        const count = await getUnreadNotificationCount({
          userId: user?.id,
          role: effectiveRole,
        });
        if (isMounted) setUnreadCount(count);
      } catch (err) {
        console.warn("Failed to load unread count in Sidebar:", err);
      }
    };

    loadUnread();
    const handleStorage = () => loadUnread();
    window.addEventListener("storage", handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, [user, effectiveRole]);

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* =========================
          BRAND
      ========================= */}
      <Link to="/dashboard" className="sidebar-brand" style={{ textDecoration: "none" }}>
        <div className="brand-logo">
          <Activity size={29} strokeWidth={2.4} />
        </div>

        <div>
          <div className="brand-name">
            BloodChain <span>AI</span>
          </div>

          <div className="brand-tagline">Connect. Predict. Save Lives.</div>
        </div>
      </Link>

      {/* =========================
          MAIN MENU (ROLE-AWARE)
      ========================= */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = ICON_MAP[item.iconName] || FileText;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={22} strokeWidth={2} />

              <span>{item.label}</span>

              {item.label === "Notifications" && unreadCount > 0 && (
                <span className="notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </NavLink>
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
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <Settings size={22} strokeWidth={2} />
          <span>Settings</span>
        </NavLink>

        {/* HELP */}
        <NavLink
          to="/help-support"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <CircleHelp size={22} strokeWidth={2} />
          <span>Help & Support</span>
        </NavLink>

        {/* LOGOUT */}
        <button
          type="button"
          className="sidebar-item"
          onClick={handleLogout}
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
