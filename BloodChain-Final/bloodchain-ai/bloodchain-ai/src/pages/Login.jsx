import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_DEMO_USERS } from "../services/authService";
import "../styles/dashboard.css";

export default function Login() {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem("bloodchain_last_registered_email") || "admin@apollo.org";
    } catch {
      return "admin@apollo.org";
    }
  });

  const [password, setPassword] = useState(() => {
    try {
      const reg = localStorage.getItem("bloodchain_last_registered_email");
      return reg ? "" : "password123";
    } catch {
      return "password123";
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(() => {
    try {
      const reg = localStorage.getItem("bloodchain_last_registered_email");
      return reg ? "Account registered successfully! Please enter your password to sign in." : "";
    } catch {
      return "";
    }
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoSelect = (demoUser) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setError("");
    setSuccessMsg(`Loaded demo credentials for ${demoUser.role} (${demoUser.name})`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    try {
      await login(email, password);
      // Navigate to the intended destination or /dashboard
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE */}
      <div className="login-brand">
        <div className="login-brand-content">
          <div className="login-logo">
            <HeartPulse size={32} />
          </div>

          <h1>
            BloodChain <span>AI</span>
          </h1>

          <p className="login-tagline">Connect. Predict. Save Lives.</p>

          <div className="login-message">
            <h2>
              Smarter Blood Management.
              <br />
              Faster Emergency Response.
            </h2>

            <p>
              AI-powered blood inventory, emergency requests, donor matching and
              hospital coordination in one connected platform.
            </p>
          </div>

          <div className="login-features">
            <div>
              <ShieldCheck size={19} />
              <span>Secure Healthcare Network</span>
            </div>

            <div>
              <HeartPulse size={19} />
              <span>Real-time Blood Availability</span>
            </div>

            <div>
              <ArrowRight size={19} />
              <span>AI-powered Resource Allocation</span>
            </div>
          </div>
        </div>

        <div className="login-footer">
          © 2026 BloodChain AI · Saving Lives Through Technology
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-form-section">
        <div className="login-card">
          <div className="mobile-logo">
            <div className="login-logo">
              <HeartPulse size={27} />
            </div>

            <h2>
              BloodChain <span>AI</span>
            </h2>
          </div>

          <div className="login-heading">
            <h2>Welcome Back</h2>
            <p>Sign in to access your BloodChain application dashboard</p>
          </div>

          {/* DEMO ACCOUNTS HELPER PILLS */}
          <div style={{ marginBottom: "18px" }}>
            <span style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: "6px" }}>
              Quick Demo Accounts:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {DEFAULT_DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => handleDemoSelect(u)}
                  style={{
                    fontSize: "14px",
                    padding: "5px 11px",
                    borderRadius: "6px",
                    border: email === u.email ? "1px solid #ed1c2c" : "1px solid #e5e7eb",
                    background: email === u.email ? "#fef2f2" : "#f9fafb",
                    color: email === u.email ? "#ed1c2c" : "#374151",
                    fontWeight: email === u.email ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {u.displayRole || u.role}
                </button>
              ))}
            </div>
          </div>

          {successMsg && (
            <div style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <UserCheck size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {error && <div className="login-error" style={{ marginBottom: "16px" }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={19} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <div className="password-label">
                <label htmlFor="login-password">Password</label>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    alert("Demo Password: password123 (or the password you chose during registration).")
                  }
                >
                  Forgot Password?
                </button>
              </div>

              <div className="input-wrapper">
                <Lock size={19} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* REMEMBER */}
            <div className="remember-row">
              <label>
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
            </div>

            {/* LOGIN BUTTON */}
            <button type="submit" className="login-button">
              Sign In to Dashboard
              <ArrowRight size={19} />
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div style={{ textAlign: "center", margin: "16px 0", fontSize: "15px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#ed1c2c", fontWeight: 700, textDecoration: "none" }}>
              Create an Account
            </Link>
          </div>

          <div style={{ textAlign: "center", marginTop: "12px" }}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#6b7280",
                fontSize: "15px",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} />
              Back to Website
            </Link>
          </div>

          <div className="login-security" style={{ marginTop: "24px" }}>
            <ShieldCheck size={16} />
            <span>Your healthcare data is protected and securely handled.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
