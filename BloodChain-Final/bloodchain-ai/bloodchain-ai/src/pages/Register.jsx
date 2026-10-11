import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import RegistrationSuccessModal from "../components/RegistrationSuccessModal";
import "./Register.css";

const roles = [
  {
    id: "donor",
    title: "Donor / User",
    text: "I want to donate blood or request help",
    icon: "user",
  },
  {
    id: "hospital",
    title: "Hospital",
    text: "I represent a hospital (Healthcare staff)",
    icon: "hospital",
  },
  {
    id: "bloodbank",
    title: "Blood Bank",
    text: "I represent a blood bank (Blood bank staff)",
    icon: "drop",
  },
];

function Icon({ type, size = 22 }) {
  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
      </>
    ),
    hospital: (
      <>
        <path d="M5 21V5h10v16" />
        <path d="M15 10h4v11" />
        <path d="M8 8h4M8 12h4M8 16h4" />
        <path d="M18 13v4M16 15h4" />
      </>
    ),
    drop: (
      <path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z" />
    ),
    heart: (
      <path d="M20.8 8.8c0 5.4-8.8 10.7-8.8 10.7S3.2 14.2 3.2 8.8A5 5 0 0 1 12 6a5 5 0 0 1 8.8 2.8Z" />
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="3" />
        <path d="M2 20c0-4 3-6 7-6s7 2 7 6" />
        <path d="M15 15c4 0 7 2 7 5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V11M10 20V7M16 20V3" />
        <path d="M3 20h17" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    phone: (
      <path d="M6.5 3.5 9 3l2 5-2.5 1.7a16 16 0 0 0 5.3 5.3l1.7-2.5 5 2 .5 2.5c.2 1.2-.8 2.3-2 2.3C11 19.3 4.7 13 3.2 5.5c-.2-1.2.7-2.3 1.8-2.5Z" />
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

function Field({ icon, children, className = "" }) {
  return (
    <div className={`bc-field ${className}`}>
      <span className="bc-field-icon">
        <Icon type={icon} size={19} />
      </span>
      {children}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("donor");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    organization: "",
    terms: false,
  });

  const change = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const { register } = useAuth();

  const submit = async (e) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.terms) {
      setError("Please accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: role, // normalized role: "donor" | "hospital" | "bloodbank"
        phone: form.phone.trim(),
        organization: form.organization.trim() || (role === "hospital" ? "Apollo Hospitals" : "Blood Bank Partner"),
      });

      setRegisteredEmail(form.email.trim());
      setRequiresEmailConfirmation(Boolean(result?.requiresEmailConfirmation));
      setShowSuccessModal(true);
    } catch (err) {
      if (
        err.message?.toLowerCase().includes("already registered") ||
        err.message?.toLowerCase().includes("already exists") ||
        err.message?.toLowerCase().includes("duplicate")
      ) {
        setError("This email is already registered. Please sign in or use another email.");
      } else {
        setError(err.message || "Unable to create your account. Please check your details and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bc-register-page">
      <header className="bc-register-header">
        <Link to="/" className="bc-brand">
          <img src="/images/bloodchain-logo.jpg" alt="BloodChain AI" />
        </Link>

        <nav className="bc-main-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/features">Features</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/impact">Impact</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="bc-header-actions">
          <Link to="/login" className="bc-login-top">
            <Icon type="user" size={18} />
            Login
          </Link>
          <Link to="/register" className="bc-register-top">
            <Icon type="users" size={18} />
            Register
          </Link>
        </div>
      </header>

      <main className="bc-register-main">
        <section className="bc-register-story">
          <div className="bc-label">
            <span />
            JOIN BLOODCHAIN AI
          </div>

          <h1>
            Together for a
            <br />
            <strong>Healthier Tomorrow</strong>
          </h1>

          <p className="bc-story-text">
            Create an account and be a part of a community that connects people,
            saves lives, and builds a smarter blood supply network.
          </p>

          <div className="bc-story-interactive">
            <div className="bc-benefits">
              <div className="bc-benefit">
                <span><Icon type="heart" size={27} /></span>
                <div>
                  <h3>Save Lives</h3>
                  <p>Help patients get the blood they need, when they need it.</p>
                </div>
              </div>

              <div className="bc-benefit">
                <span><Icon type="users" size={27} /></span>
                <div>
                  <h3>Stronger Communities</h3>
                  <p>Connect donors, hospitals and blood banks on one platform.</p>
                </div>
              </div>

              <div className="bc-benefit">
                <span><Icon type="chart" size={27} /></span>
                <div>
                  <h3>Real Impact</h3>
                  <p>Be a part of a data-driven solution for a healthier tomorrow.</p>
                </div>
              </div>
            </div>

            <div className="bc-art" aria-hidden="true">
              <span className="bc-plus p1">+</span>
              <span className="bc-plus p2">+</span>
              <span className="bc-plus p3">+</span>

              <div className="bc-art-drop-wrapper">
                <img
                  src="/images/register-blood-drop.png"
                  alt=""
                  className="bc-art-drop-img"
                />
              </div>

              <div className="bc-art-caption">
                DONATE
                <br />
                CONNECT
                <br />
                SAVE LIVES
              </div>
            </div>
          </div>

          <div className="bc-script">
            Every Connection
            <br />
            <strong>Saves Lives</strong>
          </div>
        </section>

        <section className="bc-register-card">
          <h2>Create Your Account</h2>
          <p className="bc-card-subtitle">
            Join BloodChain AI and start making a difference today.
          </p>

          <form onSubmit={submit} noValidate>
            <div className="bc-role-label">
              Select Your Role <em>*</em>
            </div>

            <div className="bc-roles">
              {roles.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`bc-role ${role === item.id ? "selected" : ""}`}
                  onClick={() => setRole(item.id)}
                >
                  <span className="bc-role-icon">
                    <Icon type={item.icon} size={28} />
                  </span>
                  <strong>{item.title}</strong>
                  <small>{item.text}</small>
                  {role === item.id && <b className="bc-check">✓</b>}
                </button>
              ))}
            </div>

            <div className="bc-two-fields">
              <Field icon="user">
                <input
                  required
                  placeholder="First Name *"
                  value={form.firstName}
                  onChange={(e) => change("firstName", e.target.value)}
                />
              </Field>

              <Field icon="user">
                <input
                  required
                  placeholder="Last Name *"
                  value={form.lastName}
                  onChange={(e) => change("lastName", e.target.value)}
                />
              </Field>
            </div>

            <Field icon="mail">
              <input
                required
                type="email"
                placeholder="Email Address *"
                value={form.email}
                onChange={(e) => change("email", e.target.value)}
              />
            </Field>

            <Field icon="lock">
              <input
                required
                type={showPass ? "text" : "password"}
                placeholder="Password *"
                value={form.password}
                onChange={(e) => change("password", e.target.value)}
              />
              <button
                type="button"
                className="eye"
                aria-label="Toggle password visibility"
                onClick={() => setShowPass((v) => !v)}
              >
                {showPass ? "◉" : "◌"}
              </button>
            </Field>

            <Field icon="lock">
              <input
                required
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password *"
                value={form.confirmPassword}
                onChange={(e) => change("confirmPassword", e.target.value)}
              />
              <button
                type="button"
                className="eye"
                aria-label="Toggle confirm password visibility"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? "◉" : "◌"}
              </button>
            </Field>

            <div className="bc-phone-row">
              <div className="bc-country">
                <span>🇮🇳</span>
                <b>+91</b>
                <span>⌄</span>
              </div>

              <Field icon="phone" className="phone-field">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => change("phone", e.target.value)}
                />
              </Field>
            </div>

            <Field icon="hospital">
              <input
                placeholder="Organization / Hospital Name (Optional)"
                value={form.organization}
                onChange={(e) => change("organization", e.target.value)}
              />
            </Field>

            <label className="bc-terms">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => change("terms", e.target.checked)}
              />
              <span>
                I agree to the <b>Terms &amp; Conditions</b> and{" "}
                <b>Privacy Policy</b>
              </span>
            </label>

            {error && <div className="bc-error">{error}</div>}

            <button className="bc-create" type="submit" disabled={isSubmitting}>
              <Icon type="users" size={18} />
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

            <div className="bc-or">
              <span />
              OR
              <span />
            </div>

            <p className="bc-already">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </form>
        </section>
      </main>

      {/* BloodChain Registration Success Modal */}
      <RegistrationSuccessModal
        isOpen={showSuccessModal}
        onContinue={() => navigate("/login")}
        onClose={() => setShowSuccessModal(false)}
        email={registeredEmail}
        requiresEmailConfirmation={requiresEmailConfirmation}
        autoRedirectSeconds={3}
      />

      <Footer />
    </div>
  );
}
