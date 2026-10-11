import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Lock,
  Globe,
  Mail,
  Smartphone,
  Save,
  Camera,
  CheckCircle2,
} from "lucide-react";

function Settings({ user }) {
  const [activeTab, setActiveTab] = useState("Profile");

  const [name, setName] = useState(user?.name || "Sreeram Ganesh");

  const [email, setEmail] = useState(user?.email || "sreeram@example.com");

  const [phone, setPhone] = useState("+91 98765 43210");

  const [role, setRole] = useState(user?.role || "Hospital Admin");

  const [emailNotifications, setEmailNotifications] = useState(true);

  const [smsNotifications, setSmsNotifications] = useState(true);

  const [bloodAlerts, setBloodAlerts] = useState(true);

  const [requestAlerts, setRequestAlerts] = useState(true);

  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 2500);
  };

  const tabs = [
    {
      name: "Profile",
      icon: User,
    },
    {
      name: "Notifications",
      icon: Bell,
    },
    {
      name: "Security",
      icon: Shield,
    },
    {
      name: "Preferences",
      icon: Globe,
    },
  ];

  return (
    <div className="settings-page">
      {/* =========================
          HEADER
      ========================= */}

      <div className="settings-header">
        <div className="settings-title">
          <div className="settings-title-icon">
            <Shield size={28} />
          </div>

          <div>
            <div className="settings-eyebrow">ACCOUNT SETTINGS</div>

            <h1>Settings</h1>

            <p>Manage your account, preferences, notifications and security.</p>
          </div>
        </div>

        <button className="settings-save-top" onClick={handleSave}>
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {/* =========================
          SUCCESS MESSAGE
      ========================= */}

      {success && (
        <div className="settings-success">
          <CheckCircle2 size={19} />

          <span>Your settings have been saved successfully.</span>
        </div>
      )}

      {/* =========================
          MAIN SETTINGS AREA
      ========================= */}

      <div className="settings-layout">
        {/* =========================
            SETTINGS MENU
        ========================= */}

        <div className="settings-sidebar">
          <div className="settings-menu-title">SETTINGS</div>

          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.name}
                type="button"
                className={`settings-tab ${
                  activeTab === tab.name ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.name)}
              >
                <Icon size={19} />

                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* =========================
            SETTINGS CONTENT
        ========================= */}

        <div className="settings-content">
          {/* =========================
              PROFILE
          ========================= */}

          {activeTab === "Profile" && (
            <>
              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Profile Information</h2>

                    <p>Update your personal and account information.</p>
                  </div>
                </div>

                <div className="profile-settings-top">
                  <div className="settings-avatar">
                    <User size={42} />

                    <button type="button" className="camera-button">
                      <Camera size={15} />
                    </button>
                  </div>

                  <div>
                    <strong>{name}</strong>

                    <span>{role}</span>
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-form-group">
                    <label>Full Name</label>

                    <div className="settings-input">
                      <User size={17} />

                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-form-group">
                    <label>Email Address</label>

                    <div className="settings-input">
                      <Mail size={17} />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-form-group">
                    <label>Phone Number</label>

                    <div className="settings-input">
                      <Smartphone size={17} />

                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-form-group">
                    <label>Account Role</label>

                    <div className="settings-input">
                      <Shield size={17} />

                      <input value={role} readOnly />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <div>
                    <h2>Account Status</h2>

                    <p>Current status of your BloodChain account.</p>
                  </div>

                  <span className="account-status">
                    <span />
                    Active
                  </span>
                </div>

                <div className="account-info-row">
                  <div>
                    <span>Account Type</span>
                    <strong>Healthcare Network</strong>
                  </div>

                  <div>
                    <span>Location</span>
                    <strong>Trichy, Tamil Nadu</strong>
                  </div>

                  <div>
                    <span>Member Since</span>
                    <strong>January 2026</strong>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================
              NOTIFICATIONS
          ========================= */}

          {activeTab === "Notifications" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Notification Settings</h2>

                  <p>Choose which updates you want to receive.</p>
                </div>

                <Bell size={25} />
              </div>

              <div className="notification-setting">
                <div>
                  <strong>Blood Availability Alerts</strong>

                  <span>
                    Get notified when important blood groups become available.
                  </span>
                </div>

                <button
                  type="button"
                  className={`toggle ${bloodAlerts ? "on" : ""}`}
                  onClick={() => setBloodAlerts(!bloodAlerts)}
                >
                  <span />
                </button>
              </div>

              <div className="notification-setting">
                <div>
                  <strong>Blood Request Alerts</strong>

                  <span>
                    Receive updates about blood requests and emergencies.
                  </span>
                </div>

                <button
                  type="button"
                  className={`toggle ${requestAlerts ? "on" : ""}`}
                  onClick={() => setRequestAlerts(!requestAlerts)}
                >
                  <span />
                </button>
              </div>

              <div className="notification-setting">
                <div>
                  <strong>Email Notifications</strong>

                  <span>Receive important account updates by email.</span>
                </div>

                <button
                  type="button"
                  className={`toggle ${emailNotifications ? "on" : ""}`}
                  onClick={() => setEmailNotifications(!emailNotifications)}
                >
                  <span />
                </button>
              </div>

              <div className="notification-setting">
                <div>
                  <strong>SMS Notifications</strong>

                  <span>
                    Receive urgent alerts through your registered mobile number.
                  </span>
                </div>

                <button
                  type="button"
                  className={`toggle ${smsNotifications ? "on" : ""}`}
                  onClick={() => setSmsNotifications(!smsNotifications)}
                >
                  <span />
                </button>
              </div>
            </div>
          )}

          {/* =========================
              SECURITY
          ========================= */}

          {activeTab === "Security" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Security</h2>

                  <p>Protect your BloodChain account.</p>
                </div>

                <Lock size={25} />
              </div>

              <div className="security-item">
                <div className="security-icon">
                  <Lock size={20} />
                </div>

                <div>
                  <strong>Password</strong>

                  <span>Last changed recently</span>
                </div>

                <button className="outline-button">Change Password</button>
              </div>

              <div className="security-item">
                <div className="security-icon">
                  <Shield size={20} />
                </div>

                <div>
                  <strong>Two-Factor Authentication</strong>

                  <span>Add an extra layer of account security.</span>
                </div>

                <button className="outline-button">Enable</button>
              </div>

              <div className="security-item">
                <div className="security-icon">
                  <Smartphone size={20} />
                </div>

                <div>
                  <strong>Login Sessions</strong>

                  <span>
                    Manage devices currently signed into your account.
                  </span>
                </div>

                <button className="outline-button">View Sessions</button>
              </div>
            </div>
          )}

          {/* =========================
              PREFERENCES
          ========================= */}

          {activeTab === "Preferences" && (
            <div className="settings-card">
              <div className="settings-card-header">
                <div>
                  <h2>Preferences</h2>

                  <p>Customize your BloodChain experience.</p>
                </div>

                <Globe size={25} />
              </div>

              <div className="preference-row">
                <div>
                  <strong>Language</strong>

                  <span>Select your preferred language.</span>
                </div>

                <select defaultValue="English">
                  <option>English</option>
                  <option>Tamil</option>
                </select>
              </div>

              <div className="preference-row">
                <div>
                  <strong>Default State</strong>

                  <span>Location used for blood availability.</span>
                </div>

                <select defaultValue="Tamil Nadu">
                  <option>Tamil Nadu</option>
                  <option>Kerala</option>
                  <option>Karnataka</option>
                </select>
              </div>

              <div className="preference-row">
                <div>
                  <strong>Default District</strong>

                  <span>Your preferred district.</span>
                </div>

                <select defaultValue="Trichy">
                  <option>Trichy</option>
                  <option>Madurai</option>
                  <option>Chennai</option>
                  <option>Coimbatore</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
