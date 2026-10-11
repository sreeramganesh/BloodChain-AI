import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Footer from "../components/Footer";
import "../App.css";

/* =====================================================
   LOGO
===================================================== */

function Logo() {
  return (
    <Link to="/" className="brand">
      <img
        src="/images/bloodchain-logo.jpg"
        alt="BloodChain AI"
        className="brand-logo"
      />
    </Link>
  );
}

/* =====================================================
   ICONS
===================================================== */

function Icon({ type, size = 24 }) {
  const icons = {
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
      </>
    ),

    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="3" />
        <path d="M2 20c0-4 3-6 7-6s7 2 7 6" />
        <path d="M15 15c4 0 7 2 7 5" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    chart: (
      <>
        <path d="M4 20V10" />
        <path d="M10 20V6" />
        <path d="M16 20V3" />
        <path d="M3 20h17" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 5 5" />
      </>
    ),

    bulb: (
      <>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M8 14c-2-2-3-4-2-7a6 6 0 0 1 12 0c1 3 0 5-2 7-1 1-2 2-2 4h-6c0-2-1-3-2-4Z" />
      </>
    ),

    building: (
      <>
        <path d="M4 21V5h10v16" />
        <path d="M14 10h6v11" />
        <path d="M7 8h4M7 12h4M7 16h4" />
      </>
    ),

    bed: (
      <>
        <path d="M3 18V8" />
        <path d="M3 14h18v4" />
        <path d="M7 14V10h5a4 4 0 0 1 4 4" />
        <path d="M21 18v3M3 18v3" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),

    heart: (
      <>
        <path d="M20.8 8.8c0 5.4-8.8 10.7-8.8 10.7S3.2 14.2 3.2 8.8A5 5 0 0 1 12 6a5 5 0 0 1 8.8 2.8Z" />
      </>
    ),

    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 2 3.6 3 8 3s8-1 8-3V5" />
        <path d="M4 12v7c0 2 3.6 3 8 3s8-1 8-3v-7" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),

    droplet: (
      <>
        <path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[type]}
    </svg>
  );
}

/* =====================================================
   NAVIGATION
===================================================== */

const nav = [
  ["Home", "/"],
  ["About", "/about"],
  ["Features", "/features"],
  ["How It Works", "/how-it-works"],
  ["Impact", "/impact"],
  ["Contact", "/contact"],
];

/* =====================================================
   HEADER
===================================================== */

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* LOGO */}
        <Logo />

        {/* NAVIGATION */}
        <nav className={`main-nav ${open ? "show" : ""}`}>
          {nav.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* HEADER ACTIONS */}
        <div className="header-actions">
          <Link
            to="/login"
            className="login-btn"
            onClick={() => setOpen(false)}
          >
            <Icon type="user" size={16} />
            <span>Login</span>
          </Link>

          <Link
            to="/register"
            className="register-btn"
            onClick={() => setOpen(false)}
          >
            <Icon type="users" size={16} />
            <span>Register</span>
          </Link>
        </div>

        {/* MOBILE MENU */}
        <button
          type="button"
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? "×" : "☰"}
        </button>
      </div>
    </header>
  );
}

/* =====================================================
   SECTION LABEL
===================================================== */

function SectionLabel({ children }) {
  return (
    <div className="section-label">
      <span></span>
      {children}
    </div>
  );
}

/* =====================================================
   STATISTICS
===================================================== */

function Stats({ impact = false }) {
  const data = impact
    ? [
        ["users", "100K+", "Lives Potentially Impacted"],
        ["clock", "40%", "Faster Blood Availability"],
        ["droplet", "30%", "Reduction in Blood Wastage"],
        ["building", "500+", "Hospitals & Blood Banks Connected"],
      ]
    : [
        ["building", "1,000+", "Blood Banks"],
        ["bed", "500+", "Hospitals"],
        ["users", "100K+", "Lives Impacted"],
        ["shield", "Smarter", "Healthcare Together"],
      ];

  return (
    <div className="stats-bar">
      {data.map(([icon, big, small]) => (
        <div className="stat" key={big}>
          <Icon type={icon} size={27} />
          <div>
            <strong>{big}</strong>
            <span>{small}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =====================================================
   CTA
===================================================== */

function CTA({
  title,
  text,
  button = "Get Started",
}) {
  return (
    <section className="cta-band">
      <div className="cta-content">
        <h2>{title}</h2>
        <p>{text}</p>
      </div>

      <Link
        className="white-btn"
        to="/register"
      >
        {button}
        <Icon type="arrow" size={17} />
      </Link>

      <div className="cta-slogan">
        Together
        <br />
        <b>We Save Lives</b>
      </div>
    </section>
  );
}

/* =====================================================
   HOME PAGE (LANDING)
===================================================== */

export default function Home() {
  const features = [
    ["chart", "Predict Demand", "AI-powered forecasting for future needs"],
    ["search", "Detect Shortages", "Real-time inventory monitoring"],
    ["bulb", "Smart Recommendations", "Suggests optimal allocation and transfer"],
    ["users", "Connect Network", "Links hospitals, blood banks and communities"],
  ];

  return (
    <div className="landing-wrapper">
      <Header />

      <main>
        {/* HERO */}
        <section className="home-hero">
          <div className="home-copy">
            <SectionLabel>
              A SMARTER BLOOD NETWORK
            </SectionLabel>

            <h1>
              Every Drop
              <br />
              <span>Saves a Life</span>
            </h1>

            <p>
              BloodChain AI uses data and artificial intelligence
              to predict demand, detect shortages, and connect
              blood banks, hospitals, and donors — for a healthier
              tomorrow.
            </p>

            <Link className="red-btn" to="/login">
              Get Started
              <Icon type="arrow" size={17} />
            </Link>
          </div>

          <div className="home-photo">
            <img
              src="/images/home-hero.jpeg"
              alt="Hands holding a blood drop"
            />
          </div>
        </section>

        {/* QUICK FEATURES */}
        <section className="quick-features">
          {features.map(([icon, title, description]) => (
            <div key={title}>
              <span className="soft-icon">
                <Icon type={icon} size={22} />
              </span>

              <b>{title}</b>

              <p>{description}</p>
            </div>
          ))}
        </section>

        <Stats />

        {/* PROCESS */}
        <section className="home-process">
          <h2>How BloodChain AI Works</h2>

          <div className="red-underline"></div>

          <div className="process-row">
            {[
              [
                "database",
                "1. Collect Data",
                "Real-time inventory, historical demand, and regional trends",
              ],
              [
                "chart",
                "2. Predict",
                "AI models forecast future demand and detect shortages",
              ],
              [
                "target",
                "3. Recommend",
                "Suggests optimal allocation and transfer between locations",
              ],
              [
                "users",
                "4. Save Lives",
                "Faster response, better availability, healthier communities",
              ],
            ].map(([icon, title, description]) => (
              <div className="process-item" key={title}>
                <span>
                  <Icon type={icon} size={25} />
                </span>

                <div>
                  <b>{title}</b>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <CTA
          title="Be Part of a Healthier Tomorrow"
          text="Join BloodChain AI and help build a smarter, stronger, and more connected blood supply network."
          button="Create an Account"
        />
      </main>

      <Footer />
    </div>
  );
}
