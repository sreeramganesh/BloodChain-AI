import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Droplets,
  FileText,
  Truck,
  Heart,
  AlertTriangle,
  Settings,
  CheckCheck,
  ShieldCheck,
  Clock,
  Brain,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

const DEFAULT_PREFERENCES = {
  ai_approvals: true,
  transfer_logistics: true,
  shortage_alerts: true,
  expiry_warnings: true,
  email_summaries: false,
  sms_emergency: true,
};

function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem("bloodchain_notification_prefs");
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch (e) {
      console.warn("Preferences storage error", e);
    }
    return DEFAULT_PREFERENCES;
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  const handleTogglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleUpdatePreferences = () => {
    setSavingPreferences(true);
    setTimeout(() => {
      try {
        localStorage.setItem("bloodchain_notification_prefs", JSON.stringify(preferences));
      } catch (e) {
        console.warn("Storage write error", e);
      }
      setSavingPreferences(false);
      setActionNotice("Notification preferences updated and saved successfully!");
      setTimeout(() => setActionNotice(null), 4000);
    }, 400);
  };

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications({
        userId: user?.id,
        role: user?.role,
      });
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications at this time.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();

    const handleStorageChange = () => {
      loadNotifications();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const criticalCount = notifications.filter((n) => n.priority === "Critical").length;
  const operationalCount = notifications.filter((n) =>
    n.type?.startsWith("transfer_") ||
    n.type?.startsWith("recommendation_") ||
    n.type === "request_status_changed"
  ).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return !n.is_read;
    if (activeTab === "Critical") return n.priority === "Critical";
    if (activeTab === "Operational") {
      return (
        n.type?.startsWith("transfer_") ||
        n.type?.startsWith("recommendation_") ||
        n.type === "request_status_changed"
      );
    }
    return true;
  });

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      // Dispatch storage event to update topbar
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead({
        userId: user?.id,
        role: user?.role,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setActionNotice("All notifications marked as read.");
      setTimeout(() => setActionNotice(null), 3000);
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleEntityNavigate = (notification) => {
    if (notification.related_transfer_id) {
      navigate("/approval-transfer");
    } else if (notification.related_recommendation_id) {
      navigate("/ai-recommendation");
    } else if (notification.related_request_id) {
      navigate("/blood-request");
    } else if (notification.type === "shortage_alert" || notification.type === "expiry_alert") {
      navigate("/blood-inventory");
    }
  };

  const getNotificationIcon = (type, priority) => {
    switch (type) {
      case "recommendation_accepted":
        return CheckCircle;
      case "recommendation_rejected":
        return XCircle;
      case "transfer_created":
      case "transfer_in_transit":
      case "transfer_completed":
        return Truck;
      case "request_status_changed":
        return Droplets;
      case "shortage_alert":
      case "expiry_alert":
        return AlertTriangle;
      default:
        return priority === "Critical" ? AlertTriangle : Brain;
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
      case "High":
        return { background: "#ffedd5", color: "#9a3412", border: "1px solid #fed7aa" };
      case "Medium":
        return { background: "#fef9c3", color: "#854d0e", border: "1px solid #fef08a" };
      case "Low":
      default:
        return { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
    }
  };

  const formatTimestamp = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Recently";
      const diffMs = Date.now() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="notifications-page">
      {/* HEADER */}
      <div className="notifications-header">
        <div className="notifications-title">
          <div className="notifications-title-icon">
            <Bell size={30} />
          </div>

          <div>
            <div className="notifications-eyebrow">OPERATIONAL AWARENESS</div>
            <h1>Notifications & Alerts</h1>
            <p>
              Live operational event tracking for requests, transfers, AI allocations, and inventory risks.
            </p>
          </div>
        </div>

        <div className="notifications-quote">
          <strong>
            “Stay informed.
            <br />
            Stay connected. Save lives.”
          </strong>
          <span />
        </div>
      </div>

      {actionNotice && (
        <div style={{
          background: "#ecfdf5",
          color: "#065f46",
          border: "1px solid #a7f3d0",
          borderRadius: "8px",
          padding: "10px 16px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
          fontWeight: "500",
        }}>
          <CheckCircle size={16} />
          {actionNotice}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="notifications-layout">
        {/* LEFT */}
        <div className="notifications-main">
          {/* TABS */}
          <div className="notification-tabs" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <button
              className={activeTab === "All" ? "active" : ""}
              onClick={() => setActiveTab("All")}
            >
              All ({notifications.length})
            </button>

            <button
              className={activeTab === "Unread" ? "active" : ""}
              onClick={() => setActiveTab("Unread")}
            >
              Unread ({unreadCount})
            </button>

            <button
              className={activeTab === "Critical" ? "active" : ""}
              onClick={() => setActiveTab("Critical")}
            >
              Critical ({criticalCount})
            </button>

            <button
              className={activeTab === "Operational" ? "active" : ""}
              onClick={() => setActiveTab("Operational")}
            >
              Operational ({operationalCount})
            </button>

            <button
              className="mark-all-read"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              style={{
                marginLeft: "auto",
                opacity: unreadCount === 0 ? 0.5 : 1,
                cursor: unreadCount === 0 ? "not-allowed" : "pointer",
              }}
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#6b7280" }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "15px", fontWeight: "500" }}>Loading notifications...</p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div style={{ padding: "32px 20px", textAlign: "center", background: "#fef2f2", borderRadius: "12px", border: "1px solid #fee2e2" }}>
              <AlertTriangle size={32} color="#dc2626" style={{ margin: "0 auto 10px" }} />
              <h3 style={{ color: "#991b1b", fontSize: "18px", marginBottom: "6px" }}>Unable to load notifications</h3>
              <p style={{ color: "#7f1d1d", fontSize: "15px", marginBottom: "14px" }}>{error}</p>
              <button
                onClick={loadNotifications}
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* NOTIFICATION LIST */}
          {!loading && !error && (
            <div className="notification-list">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type, notification.priority);
                const priorityBadge = getPriorityStyle(notification.priority);

                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? "unread" : ""}`}
                    onClick={() => handleEntityNavigate(notification)}
                    style={{
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.2s ease",
                      border: !notification.is_read ? "1px solid #fed7aa" : "1px solid #f3f4f6",
                      background: !notification.is_read ? "#fffbf7" : "#ffffff",
                    }}
                  >
                    {!notification.is_read && <span className="notification-dot" />}

                    <div className="notification-icon" style={{
                      background: notification.priority === "Critical" ? "#fee2e2" : "#fef3c7",
                      color: notification.priority === "Critical" ? "#dc2626" : "#d97706",
                    }}>
                      <Icon size={24} />
                    </div>

                    <div className="notification-content" style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#111827" }}>
                          {notification.title}
                        </h3>
                        <span style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          padding: "3px 9px",
                          borderRadius: "12px",
                          ...priorityBadge,
                        }}>
                          {notification.priority}
                        </span>
                      </div>

                      <p style={{ color: "#4b5563", fontSize: "16px", lineHeight: "1.5", margin: "6px 0 12px" }}>
                        {notification.message}
                      </p>

                      <div className="notification-bottom" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span className="notification-time" style={{ color: "#9ca3af", fontSize: "14px" }}>
                            <Clock size={14} style={{ display: "inline", marginRight: "4px" }} />
                            {formatTimestamp(notification.created_at)}
                          </span>

                          {/* Related Entity Tag */}
                          {notification.related_transfer_id && (
                            <span style={{ fontSize: "14px", background: "#f0fdf4", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontWeight: "600", border: "1px solid #bbf7d0" }}>
                              Transfer: {notification.related_transfer_id}
                            </span>
                          )}
                          {notification.related_request_id && (
                            <span style={{ fontSize: "14px", background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "4px", fontWeight: "600", border: "1px solid #bfdbfe" }}>
                              Req: {notification.related_request_id}
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {!notification.is_read ? (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="notification-action"
                              style={{
                                background: "#f3f4f6",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "5px 12px",
                                fontSize: "14px",
                                fontWeight: "500",
                                cursor: "pointer",
                              }}
                            >
                              Mark Read
                            </button>
                          ) : (
                            <span style={{ fontSize: "14px", color: "#9ca3af" }}>Read</span>
                          )}

                          <span style={{ fontSize: "14px", color: "#dc2626", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                            View <ExternalLink size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredNotifications.length === 0 && (
                <div className="no-notifications" style={{ textAlign: "center", padding: "48px 20px" }}>
                  <Bell size={45} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
                  <h3 style={{ fontSize: "18px", color: "#374151", marginBottom: "4px" }}>No notifications yet</h3>
                  <p style={{ fontSize: "15px", color: "#6b7280" }}>
                    There are no notifications in the "{activeTab}" category.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="notifications-sidebar">
          {/* PREFERENCES */}
          <div className="notification-preferences">
            <div className="side-card-heading">
              <Settings size={21} />
              <div>
                <h2>Notification Preferences</h2>
                <p>Choose what operational alerts you want to track.</p>
              </div>
            </div>

            <PreferenceToggle
              label="AI Recommendation Approvals"
              checked={preferences.ai_approvals}
              onChange={() => handleTogglePreference("ai_approvals")}
            />
            <PreferenceToggle
              label="Transfer Logistics Updates"
              checked={preferences.transfer_logistics}
              onChange={() => handleTogglePreference("transfer_logistics")}
            />
            <PreferenceToggle
              label="Critical Shortage Alerts"
              checked={preferences.shortage_alerts}
              onChange={() => handleTogglePreference("shortage_alerts")}
            />
            <PreferenceToggle
              label="Expiry Risk Warnings"
              checked={preferences.expiry_warnings}
              onChange={() => handleTogglePreference("expiry_warnings")}
            />
            <PreferenceToggle
              label="Email Summaries"
              checked={preferences.email_summaries}
              onChange={() => handleTogglePreference("email_summaries")}
            />
            <PreferenceToggle
              label="SMS Emergency Alerts"
              checked={preferences.sms_emergency}
              onChange={() => handleTogglePreference("sms_emergency")}
            />

            <button
              className="update-preferences"
              onClick={handleUpdatePreferences}
              disabled={savingPreferences}
              style={{
                cursor: savingPreferences ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: savingPreferences ? 0.7 : 1,
              }}
            >
              {savingPreferences ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving Preferences...
                </>
              ) : (
                <>
                  <Settings size={16} />
                  Update Preferences
                </>
              )}
            </button>
          </div>

          {/* DIFFERENCE CARD */}
          <div className="difference-card">
            <div className="difference-icon">
              <Heart size={25} fill="currentColor" />
            </div>

            <h2>Real-Time Clinical Logistics</h2>
            <p>
              Every notification reflects verified events from hospital transfers, AI matching, and blood bank stocks.
            </p>
          </div>

          {/* HELP */}
          <div className="notification-help-card">
            <div className="help-icon">
              <ShieldCheck size={25} />
            </div>

            <h2>Hospital & Blood Bank Support</h2>
            <p>
              Need operational support for emergency transfers or inventory mismatch?
            </p>

            <button onClick={() => navigate("/help-support")}>Contact Support</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PreferenceToggle({ label, checked, onChange }) {
  return (
    <div className="preference-row">
      <span>{label}</span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? "on" : ""}`}
        onClick={onChange}
        aria-label={label}
        style={{ cursor: "pointer" }}
      >
        <span />
      </button>
    </div>
  );
}

export default Notifications;
