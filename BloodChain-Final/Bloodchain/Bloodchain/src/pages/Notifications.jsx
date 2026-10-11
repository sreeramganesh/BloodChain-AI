import { useState } from "react";
import {
  Bell,
  Droplets,
  FileText,
  Truck,
  Heart,
  Megaphone,
  AlertTriangle,
  Settings,
  Check,
  CheckCheck,
  Users,
  ShieldCheck,
  Clock,
} from "lucide-react";

const notificationsData = [
  {
    id: 1,
    type: "request",
    icon: Droplets,
    title: "Blood Request Match Found",
    description:
      "A new request for O+ blood near Trichy Government Hospital matches your profile. Would you like to donate?",
    time: "10 minutes ago",
    action: "View Request",
    unread: true,
  },
  {
    id: 2,
    type: "approval",
    icon: FileText,
    title: "Your Blood Request is Approved",
    description:
      "Your request (BRQ003) for 1 unit of B+ blood has been approved. You will be notified once the transfer is initiated.",
    time: "1 hour ago",
    action: "View Details",
    unread: true,
  },
  {
    id: 3,
    type: "transfer",
    icon: Truck,
    title: "Blood is On The Way",
    description:
      "Your requested blood (BRQ003) from Apollo Hospital is now in transit. Estimated delivery: 18 Aug 2026, 4:30 PM.",
    time: "3 hours ago",
    action: "Track Transfer",
    unread: true,
  },
  {
    id: 4,
    type: "donation",
    icon: Heart,
    title: "Thank You for Your Donation!",
    description:
      "Your donation on 12 Mar 2026 at Trichy Government Hospital has helped save lives. You are a hero!",
    time: "1 day ago",
    action: "View Certificate",
    unread: false,
  },
  {
    id: 5,
    type: "system",
    icon: Megaphone,
    title: "Upcoming Blood Donation Camp",
    description:
      "A blood donation camp will be held at Saranathan College of Engineering on 20 Sep 2026. Your participation can make a difference!",
    time: "2 days ago",
    action: "View Details",
    unread: false,
  },
  {
    id: 6,
    type: "alert",
    icon: AlertTriangle,
    title: "Low Stock Alert",
    description:
      "O- blood stock is currently low at SRM Hospital, Trichy. Consider donating if you are eligible.",
    time: "3 days ago",
    action: "Find Donors",
    unread: false,
  },
  {
    id: 7,
    type: "account",
    icon: Settings,
    title: "Account Update",
    description: "Your profile information has been successfully updated.",
    time: "5 days ago",
    action: "View Profile",
    unread: false,
  },
];

function Notifications({ user }) {
  const [activeTab, setActiveTab] = useState("All Notifications");
  const [notifications, setNotifications] = useState(notificationsData);

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "All Notifications") return true;
    if (activeTab === "Unread") return notification.unread;
    if (activeTab === "Requests") {
      return (
        notification.type === "request" ||
        notification.type === "approval" ||
        notification.type === "transfer"
      );
    }
    if (activeTab === "Donations") {
      return notification.type === "donation";
    }
    if (activeTab === "System") {
      return (
        notification.type === "system" ||
        notification.type === "alert" ||
        notification.type === "account"
      );
    }

    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification,
      ),
    );
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
            <div className="notifications-eyebrow">STAY CONNECTED</div>

            <h1>Notifications</h1>

            <p>
              Stay updated with your requests, donations, and important alerts.
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

      {/* MAIN CONTENT */}
      <div className="notifications-layout">
        {/* LEFT */}
        <div className="notifications-main">
          {/* TABS */}
          <div className="notification-tabs">
            <button
              className={activeTab === "All Notifications" ? "active" : ""}
              onClick={() => setActiveTab("All Notifications")}
            >
              All Notifications ({notifications.length})
            </button>

            <button
              className={activeTab === "Unread" ? "active" : ""}
              onClick={() => setActiveTab("Unread")}
            >
              Unread ({unreadCount})
            </button>

            <button
              className={activeTab === "Requests" ? "active" : ""}
              onClick={() => setActiveTab("Requests")}
            >
              Requests (3)
            </button>

            <button
              className={activeTab === "Donations" ? "active" : ""}
              onClick={() => setActiveTab("Donations")}
            >
              Donations (1)
            </button>

            <button
              className={activeTab === "System" ? "active" : ""}
              onClick={() => setActiveTab("System")}
            >
              System (3)
            </button>

            <button className="mark-all-read" onClick={markAllAsRead}>
              <CheckCheck size={16} />
              Mark all as read
            </button>
          </div>

          {/* NOTIFICATION LIST */}
          <div className="notification-list">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon;

              return (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    notification.unread ? "unread" : ""
                  } ${notification.type}`}
                >
                  {notification.unread && <span className="notification-dot" />}

                  <div className="notification-icon">
                    <Icon size={25} />
                  </div>

                  <div className="notification-content">
                    <h3>{notification.title}</h3>

                    <p>{notification.description}</p>

                    <div className="notification-bottom">
                      <span className="notification-time">
                        <Clock size={13} />
                        {notification.time}
                      </span>

                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="notification-action"
                      >
                        {notification.action}
                      </button>
                    </div>
                  </div>

                  <button className="notification-menu">•••</button>
                </div>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="no-notifications">
                <Bell size={45} />
                <h3>No notifications</h3>
                <p>You don't have any notifications in this category.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="notifications-sidebar">
          {/* PREFERENCES */}
          <div className="notification-preferences">
            <div className="side-card-heading">
              <Settings size={21} />
              <div>
                <h2>Notification Preferences</h2>
                <p>Choose what notifications you want to receive.</p>
              </div>
            </div>

            <PreferenceToggle label="Blood Request Alerts" enabled={true} />

            <PreferenceToggle label="Donation Updates" enabled={true} />

            <PreferenceToggle label="Nearby Donation Camps" enabled={true} />

            <PreferenceToggle label="System Announcements" enabled={true} />

            <PreferenceToggle label="Email Notifications" enabled={false} />

            <PreferenceToggle label="SMS Notifications" enabled={true} />

            <button className="update-preferences">
              <Settings size={16} />
              Update Preferences
            </button>
          </div>

          {/* DIFFERENCE CARD */}
          <div className="difference-card">
            <div className="difference-icon">
              <Heart size={25} fill="currentColor" />
            </div>

            <h2>You Make a Difference!</h2>

            <p>
              Stay active and help save more lives. Enable notifications to
              never miss an opportunity to donate.
            </p>

            <button>
              <Bell size={16} />
              Turn On All Notifications
            </button>
          </div>

          {/* HELP */}
          <div className="notification-help-card">
            <div className="help-icon">
              <ShieldCheck size={25} />
            </div>

            <h2>Need Help?</h2>

            <p>
              If you're not receiving notifications or facing any issues,
              contact our support team.
            </p>

            <button>Contact Support</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PreferenceToggle({ label, enabled }) {
  const [active, setActive] = useState(enabled);

  return (
    <div className="preference-row">
      <span>{label}</span>

      <button
        className={`toggle ${active ? "on" : ""}`}
        onClick={() => setActive(!active)}
        aria-label={label}
      >
        <span />
      </button>
    </div>
  );
}

export default Notifications;
