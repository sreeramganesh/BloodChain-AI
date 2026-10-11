import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import './Features.css'


/* =========================================
   LOGO
========================================= */

export function Logo() {
  return (
    <Link to="/" className="features-logo">

      <div className="features-logo-mark">

        <svg viewBox="0 0 50 60" fill="none">

          <path
            d="M25 3C25 3 7 23 7 36C7 48 15 56 25 56C35 56 43 48 43 36C43 23 25 3 25 3Z"
            fill="#d71920"
          />

          <path
            d="M13 37C17 37 17 31 21 31C24 31 23 41 27 41C31 41 30 32 34 32C36 32 36 37 39 37"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

        </svg>

      </div>

      <div>

        <div className="features-logo-title">
          BloodChain <span>AI</span>
        </div>

        <div className="features-logo-subtitle">
          Connect. Predict. Save Lives.
        </div>

      </div>

    </Link>
  )
}


/* =========================================
   ICONS
========================================= */

export function Icon({ type }) {

  const common = {
    width: 30,
    height: 30,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }


  if (type === 'chart') {
    return (
      <svg {...common}>
        <line x1="4" y1="19" x2="4" y2="10" />
        <line x1="10" y1="19" x2="10" y2="5" />
        <line x1="16" y1="19" x2="16" y2="8" />
        <line x1="22" y1="19" x2="22" y2="3" />
      </svg>
    )
  }


  if (type === 'warning') {
    return (
      <svg {...common}>
        <path
          d="M10.3 3.6 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"
        />

        <line x1="12" y1="9" x2="12" y2="13" />

        <circle cx="12" cy="17" r="1" />
      </svg>
    )
  }


  if (type === 'calendar') {
    return (
      <svg {...common}>
        <rect
          x="3"
          y="4"
          width="18"
          height="17"
          rx="2"
        />

        <line x1="16" y1="2" x2="16" y2="6" />

        <line x1="8" y1="2" x2="8" y2="6" />

        <line x1="3" y1="10" x2="21" y2="10" />

        <line x1="8" y1="14" x2="8" y2="18" />

        <line x1="12" y1="14" x2="12" y2="18" />

        <line x1="16" y1="14" x2="16" y2="18" />
      </svg>
    )
  }


  if (type === 'drop') {
    return (
      <svg {...common}>
        <path
          d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"
        />
      </svg>
    )
  }


  if (type === 'location') {
    return (
      <svg {...common}>
        <path
          d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
        />

        <circle
          cx="12"
          cy="10"
          r="2.5"
        />
      </svg>
    )
  }


  if (type === 'network') {
    return (
      <svg {...common}>

        <circle
          cx="12"
          cy="5"
          r="2.5"
        />

        <circle
          cx="5"
          cy="18"
          r="2.5"
        />

        <circle
          cx="19"
          cy="18"
          r="2.5"
        />

        <circle
          cx="12"
          cy="14"
          r="2.5"
        />

        <line
          x1="12"
          y1="7.5"
          x2="12"
          y2="11.5"
        />

        <line
          x1="10.5"
          y1="16"
          x2="7"
          y2="17.5"
        />

        <line
          x1="13.5"
          y1="16"
          x2="17"
          y2="17.5"
        />

      </svg>
    )
  }


  if (type === 'approval') {
    return (
      <svg {...common}>

        <path d="M5 3h10l4 4v14H5z" />

        <path d="M15 3v5h5" />

        <circle
          cx="15"
          cy="16"
          r="3"
        />

        <path d="m13.7 16 1 1 1.8-2" />

      </svg>
    )
  }


  if (type === 'analytics') {
    return (
      <svg {...common}>

        <path
          d="M12 3a9 9 0 1 0 9 9h-9Z"
        />

        <path
          d="M12 3v9h9"
        />

      </svg>
    )
  }


  return null
}


/* =========================================
   FEATURE CARD
========================================= */

function FeatureCard({
  icon,
  title,
  slug,
  children
}) {

  return (
    <div className="feature-card">

      <div className="feature-card-icon">
        <Icon type={icon} />
      </div>

      <div className="feature-card-content">

        <h3>
          {title}
        </h3>

        <p>
          {children}
        </p>

        <Link
          to={`/features/${slug}`}
          className="learn-more"
        >
          Learn More <span>→</span>
        </Link>

      </div>

    </div>
  )
}


/* =========================================
   STAT
========================================= */

function Stat({
  icon,
  number,
  label
}) {

  return (
    <div className="stat">

      <div className="stat-icon">
        <Icon type={icon} />
      </div>

      <div>

        <strong>
          {number}
        </strong>

        <span>
          {label}
        </span>

      </div>

    </div>
  )
}


/* =========================================
   FEATURES PAGE
========================================= */

function Features() {

  return (

    <div className="features-page">


      {/* =====================================
          NAVBAR
      ===================================== */}

      <header className="features-navbar">

        <Logo />

        <nav className="features-nav">

          <Link to="/">
            Home
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link
            to="/features"
            className="active"
          >
            Features
          </Link>

          <Link to="/how-it-works">
            How It Works
          </Link>

          <Link to="/impact">
            Impact
          </Link>

          <Link to="/contact">
            Contact
          </Link>

        </nav>


        <div className="features-nav-buttons">

          <Link to="/login" className="features-login-button">
            <svg
              className="features-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
            </svg>
            <span>Login</span>
          </Link>

          <Link to="/register" className="features-register-button">
            <svg
              className="features-btn-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="8" r="3.5" />
              <circle cx="17" cy="9" r="3" />
              <path d="M2 20c0-4 3-6 7-6s7 2 7 6" />
              <path d="M15 15c4 0 7 2 7 5" />
            </svg>
            <span>Register</span>
          </Link>

        </div>

      </header>


      {/* =====================================
          HERO
      ===================================== */}

      <section className="features-hero">


        {/* LEFT CONTENT */}

        <div className="features-hero-text">

          <div className="features-small-title">

            <span></span>

            OUR FEATURES

          </div>


          <h1>

            Powerful Features

            <br />

            for a <span>Healthier Tomorrow</span>

          </h1>


          <p>

            BloodChain AI combines data, artificial
            intelligence, and real-time connectivity
            to make blood supply smarter, faster,
            and more efficient.

          </p>

        </div>


        {/* RIGHT IMAGE */}

        <div className="features-hero-image">

          <img
            src="/images/features-hero.jpg"
            alt="BloodChain AI"
          />

        </div>

      </section>


      {/* =====================================
          FEATURE CARDS
      ===================================== */}

      <section className="feature-cards-section">


        <FeatureCard
          icon="chart"
          title="AI Demand Forecasting"
          slug="ai-demand-forecasting"
        >
          Predicts future blood demand using historical
          data, seasonal trends, and regional patterns.
        </FeatureCard>


        <FeatureCard
          icon="warning"
          title="Shortage Risk Detection"
          slug="shortage-risk-detection"
        >
          Identifies potential blood shortages before
          they happen, so action can be taken early.
        </FeatureCard>


        <FeatureCard
          icon="calendar"
          title="Expiry Risk Detection"
          slug="expiry-risk-detection"
        >
          Tracks inventory and predicts blood units at
          risk of expiry, reducing wastage.
        </FeatureCard>


        <FeatureCard
          icon="drop"
          title="Real-Time Blood Inventory"
          slug="real-time-blood-inventory"
        >
          Provides live updates on blood availability
          across hospitals and blood banks.
        </FeatureCard>


        <FeatureCard
          icon="location"
          title="Location-Based Search"
          slug="location-based-search"
        >
          Finds nearby hospitals or blood banks with
          the required blood type.
        </FeatureCard>


        <FeatureCard
          icon="network"
          title="Smart Source Recommendation"
          slug="smart-source-recommendation"
        >
          Uses AI to suggest the best blood sources based
          on availability, distance, and urgency.
        </FeatureCard>


        <FeatureCard
          icon="approval"
          title="Request & Approval Workflow"
          slug="request-approval-workflow"
        >
          Streamlines blood requests with a digital
          approval system for faster response.
        </FeatureCard>


        <FeatureCard
          icon="analytics"
          title="AI Insights & Analytics"
          slug="ai-insights-analytics"
        >
          Visualizes trends, usage patterns, and key
          insights for better decision-making.
        </FeatureCard>


      </section>


      {/* =====================================
          IMPACT BAR
      ===================================== */}

      <section className="features-impact">


        <Stat
          icon="network"
          number="1,000+"
          label="Blood Banks Connected"
        />


        <Stat
          icon="analytics"
          number="500+"
          label="Hospitals Supported"
        />


        <Stat
          icon="drop"
          number="100K+"
          label="Lives Impacted"
        />


        <Stat
          icon="approval"
          number="Smarter"
          label="Healthcare Together"
        />


      </section>


      {/* =====================================
          CTA BAND
      ===================================== */}
      <section className="features-cta-band">
        <div className="features-cta-inner">
          <div className="features-cta-content">
            <h2>Be a Part of the Change</h2>
            <p>
              Together, we can build a smarter, stronger, and more connected
              blood supply network.
            </p>
          </div>

          <Link to="/register" className="features-cta-button">
            Get Started &rarr;
          </Link>

          <div className="features-cta-divider"></div>

          <div className="features-cta-slogan">
            Give Blood
            <br />
            <span>Give Hope</span>
          </div>
        </div>
      </section>

      {/* =====================================
          FOOTER
      ===================================== */}
      <Footer />

    </div>
  )
}

export default Features