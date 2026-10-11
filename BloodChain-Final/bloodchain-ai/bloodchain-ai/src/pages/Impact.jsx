import { Link, NavLink } from "react-router-dom";
import Footer from "../components/Footer";
import "./Impact.css";

/* =====================================================
   ICON
===================================================== */

function Icon({ type, size = 32 }) {
  const icons = {
    users: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <circle cx="17" cy="9" r="3" />
        <path d="M2 20c0-4 3-6 7-6s7 2 7 6" />
        <path d="M15 15c4 0 7 2 7 5" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    droplet: (
      <>
        <path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z" />
      </>
    ),

    building: (
      <>
        <path d="M4 21V5h10v16" />
        <path d="M14 10h6v11" />
        <path d="M7 8h4M7 12h4M7 16h4" />
      </>
    ),

    chart: (
      <>
        <path d="M4 20V11" />
        <path d="M10 20V7" />
        <path d="M16 20V3" />
        <path d="M3 20h18" />
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

    leaf: (
      <>
        <path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-6 10-16Z" />
        <path d="M4 21c3-5 7-9 13-12" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
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

const navigation = [
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
  return (
    <header className="impact-header">

      <div className="impact-header-inner">

        {/* LOGO */}

        <Link to="/" className="impact-logo">
          <img
            src="/images/bloodchain-logo.png"
            alt="BloodChain AI"
          />
        </Link>

        {/* NAVIGATION */}

        <nav className="impact-nav">

          {navigation.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "impact-nav-link active"
                  : "impact-nav-link"
              }
            >
              {label}
            </NavLink>
          ))}

        </nav>

        {/* HEADER BUTTONS */}

        <div className="impact-header-buttons">

          <Link
            to="/login"
            className="impact-login"
          >
            <Icon
              type="user"
              size={17}
            />
            <span>Login</span>
          </Link>

          <Link
            to="/register"
            className="impact-register"
          >
            <Icon
              type="users"
              size={17}
            />
            <span>Register</span>
          </Link>

        </div>

      </div>

    </header>
  );
}

/* =====================================================
   SECTION LABEL
===================================================== */

function SectionLabel({ children }) {
  return (
    <div className="impact-section-label">
      <span></span>
      {children}
    </div>
  );
}

/* =====================================================
   IMPACT PAGE
===================================================== */

export default function Impact() {

  /* ===================================================
     STATISTICS
  =================================================== */

  const stats = [
    {
      icon: "users",
      number: "100K+",
      text: "Lives Potentially Impacted",
    },
    {
      icon: "clock",
      number: "40%",
      text: "Faster Blood Availability",
    },
    {
      icon: "droplet",
      number: "30%",
      text: "Reduction in Blood Wastage",
    },
    {
      icon: "building",
      number: "500+",
      text: "Hospitals & Blood Banks Connected",
    },
  ];

  /* ===================================================
     KEY AREAS
  =================================================== */

  const impactAreas = [
    {
      icon: "clock",
      title: "Faster Response",
      text: "Reduces the time to find and deliver blood to patients in need.",
      color: "pink",
    },
    {
      icon: "chart",
      title: "Reduced Wastage",
      text: "Helps utilize blood units before expiry through AI-driven monitoring.",
      color: "blue",
    },
    {
      icon: "shield",
      title: "Early Warnings",
      text: "Predicts shortages so action can be taken in advance.",
      color: "green",
    },
    {
      icon: "users",
      title: "Stronger Collaboration",
      text: "Connects hospitals, blood banks, and donors in a unified network.",
      color: "yellow",
    },
    {
      icon: "heart",
      title: "More Lives Saved",
      text: "Ensures blood reaches the right patient at the right time.",
      color: "purple",
    },
    {
      icon: "leaf",
      title: "Healthier Communities",
      text: "Builds a safer, stronger, and more resilient society.",
      color: "mint",
    },
  ];

  /* ===================================================
     TESTIMONIALS
  =================================================== */

  const testimonials = [
    {
      text: "BloodChain AI helped us find a match within minutes. It gave us hope when we needed it most.",
      name: "Dr. Priya Sharma",
      role: "City General Hospital",
      avatar: "👩🏻",
    },
    {
      text: "With better inventory visibility, we can serve more patients and reduce wastage significantly.",
      name: "R. Karthik",
      role: "Blood Bank Coordinator",
      avatar: "👨🏻",
    },
    {
      text: "This platform can truly make a difference in communities. It's the future of blood donation.",
      name: "Ananya S.",
      role: "Volunteer & Donor",
      avatar: "👩🏻",
    },
  ];

  return (
    <div className="impact-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <Header />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="impact-hero">

        <div className="impact-hero-content">

          <SectionLabel>
            OUR IMPACT
          </SectionLabel>

          <h1>
            Creating a Healthier,
            <br />
            <span>Safer Tomorrow</span>
          </h1>

          <p>
            BloodChain AI is more than a platform — it's a step
            towards a world where no life is lost due to the
            unavailability of blood. Our impact is measured in
            lives saved, stronger communities, and a more
            connected healthcare system.
          </p>

        </div>

        <div className="impact-hero-image">

          <img
            src="/images/hero-heart.jpg"
            alt="BloodChain AI healthcare impact"
          />

        </div>

      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="impact-stats">

        {stats.map((item) => (

          <div
            className="impact-stat"
            key={item.number}
          >

            <div className="impact-stat-icon">
              <Icon
                type={item.icon}
                size={34}
              />
            </div>

            <div className="impact-stat-text">

              <strong>
                {item.number}
              </strong>

              <span>
                {item.text}
              </span>

            </div>

          </div>

        ))}

      </section>

      {/* =================================================
          KEY AREAS OF IMPACT
      ================================================= */}

      <section className="impact-areas">

        <h2>
          Key Areas of Impact
        </h2>

        <div className="impact-red-line"></div>

        <div className="impact-area-grid">

          {impactAreas.map((item) => (

            <div
              className={`impact-area-card ${item.color}`}
              key={item.title}
            >

              <div className="impact-area-icon">

                <Icon
                  type={item.icon}
                  size={38}
                />

              </div>

              <h3>
                {item.title}
              </h3>

              <p>
                {item.text}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* =================================================
          REAL IMPACT
      ================================================= */}

      <section className="impact-testimonials">

        <div className="impact-testimonial-intro">

          <h2>
            Real Impact. Real People.
          </h2>

          <div className="testimonial-red-line"></div>

          <p>
            Together, we can build a future where no one has
            to wait for a second chance.
          </p>

          <p>
            BloodChain AI turns data into hope and
            hope into lives saved.
          </p>

        </div>

        <div className="testimonial-grid">

          {testimonials.map((item) => (

            <div
              className="testimonial-card"
              key={item.name}
            >

              <div className="quote-mark">
                “
              </div>

              <p className="testimonial-text">
                {item.text}
              </p>

              <div className="testimonial-person">

                <div className="testimonial-avatar">
                  {item.avatar}
                </div>

                <div className="testimonial-person-info">

                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    {item.role}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="impact-cta">

        <div className="impact-cta-icon">

          <Icon
            type="droplet"
            size={48}
          />

        </div>

        <div className="impact-cta-content">

          <h2>
            Be a Part of the Impact
          </h2>

          <p>
            Join BloodChain AI and help us build a healthier,
            safer, and more connected tomorrow.
          </p>

        </div>

        <Link
          to="/login"
          className="impact-cta-button"
        >

          Get Started

          <Icon
            type="arrow"
            size={18}
          />

        </Link>

        <div className="impact-cta-slogan">

          Together
          <br />

          <span>
            We Save Lives
          </span>

        </div>

      </section>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}