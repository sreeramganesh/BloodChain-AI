import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  UserCircle,
  Mail,
  Building,
  Phone,
  Settings,
  LogOut,
  HelpCircle,
  Shield,
  CheckCheck,
  Truck,
  AlertTriangle,
  Droplets,
  ExternalLink,
  Clock,
  CheckCircle,
  X,
} from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

// Search Index across all core BloodChain entities
const SEARCH_INDEX = [
  // Hospitals & Blood Banks
  { title: "Trichy Government Hospital", subtitle: "District HQ Hospital • Trichy", category: "Hospital", path: "/hospitals-blood-banks?q=Trichy+Government+Hospital" },
  { title: "Apollo Speciality Hospital", subtitle: "Tertiary Multi-Specialty • Trichy", category: "Hospital", path: "/hospitals-blood-banks?q=Apollo+Speciality+Hospital" },
  { title: "SRM Hospital & Research Centre", subtitle: "Medical College Hospital • Kattankulathur", category: "Hospital", path: "/hospitals-blood-banks?q=SRM+Hospital" },
  { title: "Kauvery Heart City Hospital", subtitle: "Cardiac & Emergency Center • Trichy", category: "Hospital", path: "/hospitals-blood-banks?q=Kauvery+Heart+City" },
  { title: "MGM Healthcare", subtitle: "Super Specialty Center • Chennai", category: "Hospital", path: "/hospitals-blood-banks?q=MGM+Healthcare" },
  { title: "Trichy Central Blood Bank", subtitle: "Licensed 24/7 Blood Bank • Trichy", category: "Blood Bank", path: "/hospitals-blood-banks?q=Trichy+Blood+Bank" },
  { title: "Red Cross Blood Center", subtitle: "Voluntary Regional Center • Tamil Nadu", category: "Blood Bank", path: "/hospitals-blood-banks?q=Red+Cross" },

  // Blood Groups
  { title: "O+ Blood Group", subtitle: "Most common whole blood & red cell type", category: "Blood Group", path: "/blood-inventory?group=O%2B" },
  { title: "O- Blood Group", subtitle: "Universal red blood cell donor", category: "Blood Group", path: "/blood-inventory?group=O-" },
  { title: "A+ Blood Group", subtitle: "High demand surgical component", category: "Blood Group", path: "/blood-inventory?group=A%2B" },
  { title: "A- Blood Group", subtitle: "Rare negative blood group", category: "Blood Group", path: "/blood-inventory?group=A-" },
  { title: "B+ Blood Group", subtitle: "Common regional component", category: "Blood Group", path: "/blood-inventory?group=B%2B" },
  { title: "B- Blood Group", subtitle: "Critical reserve component", category: "Blood Group", path: "/blood-inventory?group=B-" },
  { title: "AB+ Blood Group", subtitle: "Universal plasma donor", category: "Blood Group", path: "/blood-inventory?group=AB%2B" },
  { title: "AB- Blood Group", subtitle: "Ultra-rare blood group", category: "Blood Group", path: "/blood-inventory?group=AB-" },

  // Blood Requests & Transfers
  { title: "BRQ001 - Urgent Trauma Request", subtitle: "Trichy Government Hospital • Status: Pending", category: "Request", path: "/my-requests" },
  { title: "BRQ002 - Orthopedic Surgery Request", subtitle: "SRM Hospital • Status: Approved", category: "Request", path: "/my-requests" },
  { title: "BRQ003 - Cardiac Surgery Request", subtitle: "Apollo Hospital • Status: In Progress", category: "Request", path: "/my-requests" },
  { title: "Create New Blood Request", subtitle: "Submit emergency patient requisition", category: "Request", path: "/blood-request" },
  { title: "Approval & Transfer Workflow", subtitle: "Review cold-chain transit dispatches", category: "Transfer", path: "/approval-transfer" },

  // Donors
  { title: "Find Nearby Donors", subtitle: "Filter voluntary donors by district & blood group", category: "Donors", path: "/find-donors" },
  { title: "Volunteer Donor Registration", subtitle: "Register new life-saving whole blood donor", category: "Donors", path: "/find-donors" },
  { title: "My Donation History", subtitle: "View appointments and official certificates", category: "Donors", path: "/my-donations" },

  // Help & Guides
  { title: "How to Create a Blood Request", subtitle: "Step-by-step requisition tutorial", category: "Help & Guide", path: "/help-support" },
  { title: "How AI Recommendation Works", subtitle: "ABO compatibility & distance optimization", category: "Help & Guide", path: "/help-support" },
  { title: "How to Track Blood Transfers", subtitle: "Real-time cold-chain & GPS monitoring", category: "Help & Guide", path: "/help-support" },
  { title: "Emergency Support & Hotlines", subtitle: "24/7 State Blood Transfusion Helpline 1800-425-1333", category: "Help & Guide", path: "/help-support" },
];

function Topbar({ user: propUser }) {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const user = propUser || authUser;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Profile popover state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Load unread count and notifications
  useEffect(() => {
    let isMounted = true;
    const loadNotifs = async () => {
      try {
        const count = await getUnreadNotificationCount({
          userId: user?.id,
          role: user?.role,
        });
        const list = await getNotifications({
          userId: user?.id,
          role: user?.role,
        });
        if (isMounted) {
          setUnreadCount(count);
          setNotifications(list ? list.slice(0, 5) : []);
        }
      } catch (err) {
        console.warn("Failed to load notifications in Topbar:", err);
      }
    };

    loadNotifs();

    const handleStorage = () => loadNotifs();
    window.addEventListener("storage", handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, [user]);

  // Click outside listener for all dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter search results
  const filteredSearchResults = searchQuery.trim()
    ? SEARCH_INDEX.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSelect = (item) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(item.path);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    if (filteredSearchResults.length > 0) {
      handleSearchSelect(filteredSearchResults[0]);
    } else {
      navigate(`/hospitals-blood-banks?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead({ userId: user?.id, role: user?.role });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.warn("Mark all read failed:", e);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      await markNotificationAsRead(notif.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.warn("Mark read failed:", e);
    }

    setIsNotifOpen(false);

    if (notif.related_transfer_id) {
      navigate("/approval-transfer");
    } else if (notif.related_recommendation_id) {
      navigate("/ai-recommendation");
    } else if (notif.related_request_id) {
      navigate("/blood-request");
    } else if (notif.type === "shortage_alert" || notif.type === "expiry_alert") {
      navigate("/blood-inventory");
    } else {
      navigate("/notifications");
    }
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    if (logout) {
      await logout();
    }
    navigate("/login");
  };

  return (
    <header className="topbar">
      {/* LEFT: MOBILE MENU & TOP SEARCH BAR */}
      <div className="topbar-left">
        <button
          className="mobile-menu"
          aria-label="Open navigation menu"
          onClick={() => {
            const sidebar = document.querySelector(".sidebar");
            if (sidebar) sidebar.classList.toggle("mobile-open");
          }}
        >
          <Menu size={25} />
        </button>

        {/* FUNCTIONAL SEARCH BAR */}
        <div className="search-box-wrapper" ref={searchRef} style={{ position: "relative" }}>
          <div className="search-box">
            <button
              type="button"
              onClick={handleSearchSubmit}
              aria-label="Submit search"
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#8c96a8",
              }}
            >
              <Search size={19} />
            </button>
            <input
              type="text"
              placeholder="Search hospitals, blood groups, requests, or donors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchSubmit();
                } else if (e.key === "Escape") {
                  setIsSearchOpen(false);
                }
              }}
              aria-label="Search hospitals, blood groups, requests, or donors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "2px",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* SEARCH DROPDOWN RESULTS */}
          {isSearchOpen && searchQuery.trim() && (
            <div
              className="search-results-dropdown"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                width: "480px",
                maxWidth: "90vw",
                background: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
                zIndex: 1000,
                overflow: "hidden",
                animation: "fadeIn 0.15s ease-out",
              }}
            >
              <div
                style={{
                  padding: "10px 16px",
                  background: "#f8fafc",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: "600",
                }}
              >
                <span>SEARCH RESULTS ({filteredSearchResults.length})</span>
                <span>Press Enter to select</span>
              </div>

              <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSearchSelect(item)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                          {item.subtitle}
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background:
                            item.category === "Hospital"
                              ? "#eff6ff"
                              : item.category === "Blood Bank"
                              ? "#ecfdf5"
                              : item.category === "Blood Group"
                              ? "#fee2e2"
                              : item.category === "Request"
                              ? "#fff7ed"
                              : item.category === "Donors"
                              ? "#fdf2f8"
                              : "#f5f3ff",
                          color:
                            item.category === "Hospital"
                              ? "#1d4ed8"
                              : item.category === "Blood Bank"
                              ? "#047857"
                              : item.category === "Blood Group"
                              ? "#dc2626"
                              : item.category === "Request"
                              ? "#c2410c"
                              : item.category === "Donors"
                              ? "#be185d"
                              : "#6d28d9",
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "#6b7280" }}>
                    <Search size={28} color="#9ca3af" style={{ margin: "0 auto 8px" }} />
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "#374151" }}>
                      No matching results found.
                    </div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      Try searching for a hospital, blood group (e.g. O+), donor, or request ID.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: NOTIFICATIONS, DIVIDER & PROFILE */}
      <div className="topbar-right">
        {/* NOTIFICATION BELL & DROPDOWN */}
        <div className="notification-wrapper" ref={notifRef} style={{ position: "relative" }}>
          <button
            className="topbar-notification"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            title="Notifications"
            aria-label="View notifications"
            aria-expanded={isNotifOpen}
            aria-haspopup="true"
            style={{ cursor: "pointer" }}
          >
            <Bell size={23} />
            {unreadCount > 0 && <span>{unreadCount > 99 ? "99+" : unreadCount}</span>}
          </button>

          {/* NOTIFICATION DROPDOWN */}
          {isNotifOpen && (
            <div
              className="notification-dropdown"
              style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                width: "360px",
                maxWidth: "92vw",
                background: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 15px 35px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
                zIndex: 1000,
                overflow: "hidden",
                animation: "fadeIn 0.15s ease-out",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "14px 16px",
                  background: "#ffffff",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Bell size={18} color="#dc2626" />
                  <strong style={{ fontSize: "15px", color: "#111827" }}>Notifications</strong>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "1px 7px",
                        borderRadius: "999px",
                      }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#dc2626",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f3f4f6",
                        cursor: "pointer",
                        background: notif.is_read ? "#ffffff" : "#fffbf7",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = notif.is_read ? "#ffffff" : "#fffbf7")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "13px",
                            color: notif.is_read ? "#374151" : "#111827",
                            fontWeight: notif.is_read ? "600" : "700",
                          }}
                        >
                          {notif.title}
                        </strong>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background:
                              notif.priority === "Critical"
                                ? "#fee2e2"
                                : notif.priority === "High"
                                ? "#ffedd5"
                                : "#ecfdf5",
                            color:
                              notif.priority === "Critical"
                                ? "#991b1b"
                                : notif.priority === "High"
                                ? "#9a3412"
                                : "#166534",
                          }}
                        >
                          {notif.priority}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: "12px",
                          color: "#4b5563",
                          margin: "0 0 6px 0",
                          lineHeight: "1.4",
                        }}
                      >
                        {notif.message}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "11px",
                          color: "#9ca3af",
                        }}
                      >
                        <span>Recently</span>
                        <span style={{ color: "#dc2626", fontWeight: "600" }}>View details &rarr;</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "#6b7280" }}>
                    <Bell size={28} color="#9ca3af" style={{ margin: "0 auto 8px" }} />
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                      No notifications
                    </div>
                    <div style={{ fontSize: "12px" }}>You are completely caught up!</div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "10px 16px",
                  background: "#f8fafc",
                  borderTop: "1px solid #e5e7eb",
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate("/notifications");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#dc2626",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  View All Notifications
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="topbar-divider" />

        {/* USER PROFILE & POPUP */}
        <div className="profile-container" ref={profileRef} style={{ position: "relative" }}>
          <div
            className="profile"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            style={{ cursor: "pointer", userSelect: "none" }}
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="profile-avatar">
              <UserCircle size={34} />
            </div>

            <div className="profile-info">
              <strong>{user?.name || "Keerthiga S"}</strong>
              <span>{user?.role || "Donor / User"}</span>
            </div>

            <ChevronDown
              size={17}
              className="profile-arrow"
              style={{
                transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </div>

          {/* PROFILE POPOVER */}
          {isProfileOpen && (
            <div
              className="profile-popover"
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: "290px",
                background: "#ffffff",
                borderRadius: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
                padding: "16px",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                animation: "fadeIn 0.15s ease-out",
              }}
            >
              {/* Header Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    borderRadius: "50%",
                    width: "42px",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  {(user?.name || "K")[0].toUpperCase()}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "15px",
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.name || "Keerthiga S"}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      background: "#fef2f2",
                      color: "#dc2626",
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      marginTop: "2px",
                    }}
                  >
                    {user?.role || "Donor / User"}
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#4b5563",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={15} color="#9ca3af" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.email || "keerthiga@bloodchain.ai"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Building size={15} color="#9ca3af" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.organization || "Apollo Hospitals, Trichy"}
                  </span>
                </div>
                {user?.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={15} color="#9ca3af" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Shield size={15} color="#10b981" />
                  <span style={{ color: "#059669", fontWeight: "500" }}>Verified Account</span>
                </div>
              </div>

              {/* Action Buttons as requested: Profile, Settings, Help & Support, Logout */}
              <div
                style={{
                  borderTop: "1px solid #f3f4f6",
                  paddingTop: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {/* 1. Profile */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/settings");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "8px 10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <UserCircle size={15} color="#6b7280" />
                  Profile
                </button>

                {/* 2. Settings */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/settings");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "8px 10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Settings size={15} color="#6b7280" />
                  Settings
                </button>

                {/* 3. Help & Support */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/help-support");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "8px 10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <HelpCircle size={15} color="#6b7280" />
                  Help & Support
                </button>

                {/* 4. Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "8px 10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    color: "#dc2626",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    textAlign: "left",
                    marginTop: "2px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut size={15} color="#dc2626" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
