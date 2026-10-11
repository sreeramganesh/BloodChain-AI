import { Link, NavLink } from "react-router-dom";
import Footer from "../components/Footer";
import "./HowItWorks.css";

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

    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 2 3.6 3 8 3s8-1 8-3V5" />
        <path d="M4 12v7c0 2 3.6 3 8 3s8-1 8-3v-7" />
      </>
    ),

    chart: (
      <>
        <path d="M4 20V10" />
        <path d="M10 20V6" />
        <path d="M16 20V3" />
        <path d="M3 20h17" />
        <path d="m4 9 6-4 6 1 4-4" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),

    droplet: (
      <>
        <path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 5 5" />
      </>
    ),

    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    heart: (
      <>
        <path d="M20.8 8.8c0 5.4-8.8 10.7-8.8 10.7S3.2 14.2 3.2 8.8A5 5 0 0 1 12 6a5 5 0 0 1 8.8 2.8Z" />
      </>
    ),

    building: (
      <>
        <path d="M4 21V5h10v16" />
        <path d="M14 10h6v11" />
        <path d="M7 8h4M7 12h4M7 16h4" />
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
   HEADER
===================================================== */

function Header() {
  const nav = [
    ["Home", "/"],
    ["About", "/about"],
    ["Features", "/features"],
    ["How It Works", "/how-it-works"],
    ["Impact", "/impact"],
    ["Contact", "/contact"],
  ];

  return (
    <header className="how-header">

      <div className="how-header-inner">

        {/* LOGO */}

        <Link to="/" className="how-logo">
          <img
            src="/images/bloodchain-logo.png"
            alt="BloodChain AI"
          />
        </Link>


        {/* NAVIGATION */}

        <nav className="how-navigation">

          {nav.map(([label, path]) => (

            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "how-nav-link active"
                  : "how-nav-link"
              }
            >
              {label}
            </NavLink>

          ))}

        </nav>


        {/* HEADER BUTTONS */}

        <div className="how-header-actions">

          <Link
            to="/login"
            className="how-login-button"
          >
            <Icon
              type="user"
              size={18}
            />
            Login
          </Link>


          <Link
            to="/register"
            className="how-register-button"
          >
            <Icon
              type="users"
              size={17}
            />
            Register
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
    <div className="how-section-label">

      <span></span>

      {children}

    </div>
  );
}


/* =====================================================
   HOW IT WORKS
===================================================== */

export default function HowItWorks() {

  const steps = [
    {
      number: 1,
      icon: "database",
      title: "Collect Data",
      text:
        "Gather real-time and historical data from hospitals, blood banks, donation camps, and regional records.",
      color: "pink",
    },

    {
      number: 2,
      icon: "chart",
      title: "Predict Demand",
      text:
        "AI analyzes trends, seasonal patterns, and regional data to forecast future blood demand.",
      color: "blue",
    },

    {
      number: 3,
      icon: "shield",
      title: "Detect Risk",
      text:
        "Identifies potential shortages and near-expiry blood units so action can be taken early.",
      color: "yellow",
    },

    {
      number: 4,
      icon: "droplet",
      title: "Check Compatibility",
      text:
        "Matches the required blood type with available compatible blood units.",
      color: "green",
    },

    {
      number: 5,
      icon: "search",
      title: "Find Blood Sources",
      text:
        "Searches nearby hospitals and blood banks with available and compatible units.",
      color: "purple",
    },

    {
      number: 6,
      icon: "target",
      title: "Rank & Recommend",
      text:
        "AI ranks the best blood sources based on availability, distance, urgency, and reliability.",
      color: "rose",
    },

    {
      number: 7,
      icon: "users",
      title: "Human Approval",
      text:
        "Hospital/blood bank authorizes the recommended transfer or allocation.",
      color: "lightblue",
    },

    {
      number: 8,
      icon: "droplet",
      title: "Transfer & Save Lives",
      text:
        "Coordinates the blood transfer and updates inventory in real-time until the blood reaches the patient.",
      color: "mint",
    },
  ];


  return (
    <div className="how-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <Header />


      {/* =================================================
          HERO
      ================================================= */}

      <section className="how-hero">

        <div className="how-hero-content">

          <SectionLabel>
            HOW IT WORKS
          </SectionLabel>


          <h1>
            From Need to <span>Life</span>
          </h1>


          <p>
            A simple, intelligent process that connects data,
            people, and blood — to save lives faster.
          </p>

        </div>


        <div className="how-hero-image">

          <img
            src="/images/how-it-works-hero.jpg"
            alt="Smart blood flow"
          />

        </div>

      </section>


      {/* =================================================
          STEP CONTENT BOXES
      ================================================= */}

      <section className="how-steps-section">

        <div className="how-steps-wrapper">

          {steps.map((step) => (

            <article
              className={`how-step-card ${step.color}`}
              key={step.number}
            >

              {/* NUMBER */}

              <div className="how-step-number">
                {step.number}
              </div>


              {/* MAIN SYMBOL */}

              <div className="how-step-icon">

                <Icon
                  type={step.icon}
                  size={50}
                />

              </div>


              {/* TITLE */}

              <h3>
                {step.title}
              </h3>


              {/* DESCRIPTION */}

              <p>
                {step.text}
              </p>


              {/* BOTTOM SYMBOL */}

              <div className="how-step-bottom-icon">

                <Icon
                  type={step.icon}
                  size={58}
                />

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* =================================================
          BENEFITS
      ================================================= */}

      <section className="how-benefits">

        <div className="how-benefit">

          <Icon
            type="clock"
            size={42}
          />

          <div>

            <h3>
              Faster Response
            </h3>

            <p>
              Reduces time to find and deliver blood.
            </p>

          </div>

        </div>


        <div className="how-benefit">

          <Icon
            type="target"
            size={42}
          />

          <div>

            <h3>
              Smarter Decisions
            </h3>

            <p>
              AI-driven, data-backed recommendations.
            </p>

          </div>

        </div>


        <div className="how-benefit">

          <Icon
            type="shield"
            size={42}
          />

          <div>

            <h3>
              Better Coordination
            </h3>

            <p>
              Connects hospitals, blood banks, and donors.
            </p>

          </div>

        </div>


        <div className="how-benefit">

          <Icon
            type="heart"
            size={42}
          />

          <div>

            <h3>
              More Lives Saved
            </h3>

            <p>
              A stronger, more resilient blood network.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          CTA
      ================================================= */}

      <section className="how-cta">

        <div className="how-cta-content">

          <h2>
            Together, We Make a Difference
          </h2>

          <p>
            Using AI and collaboration to ensure that no life
            is lost due to the unavailability of blood.
          </p>

        </div>


        <Link
          to="/login"
          className="how-cta-button"
        >

          Get Started

          <Icon
            type="arrow"
            size={20}
          />

        </Link>


        <div className="how-cta-slogan">

          Every Drop
          <br />

          <span>
            Counts
          </span>

        </div>

      </section>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}