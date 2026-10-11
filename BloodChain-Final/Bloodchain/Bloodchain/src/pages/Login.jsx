import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please enter your name, email and password.");
      return;
    }

    // Temporary frontend user data
    const user = {
      name: name.trim(),
      email: email.trim(),
      role: "Hospital Admin",
    };

    onLogin(user);
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

            <p>Sign in to access your BloodChain dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <div className="form-group">
              <label>Full Name</label>

              <div className="input-wrapper">
                <HeartPulse size={19} />

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>Email Address</label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <div className="password-label">
                <label>Password</label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    alert("Password reset will be connected later.")
                  }
                >
                  Forgot Password?
                </button>
              </div>

              <div className="input-wrapper">
                <Lock size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && <div className="login-error">{error}</div>}

            {/* REMEMBER */}
            <div className="remember-row">
              <label>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
            </div>

            {/* LOGIN BUTTON */}
            <button type="submit" className="login-button">
              Sign In
              <ArrowRight size={19} />
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <p className="login-help">
            Need access?{" "}
            <button
              type="button"
              onClick={() =>
                alert("Please contact your hospital administrator.")
              }
            >
              Contact Administrator
            </button>
          </p>

          <div className="login-security">
            <ShieldCheck size={16} />

            <span>Your healthcare data is protected and securely handled.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
