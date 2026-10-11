import { Link } from "react-router-dom";
import { Target, HeartPulse } from "lucide-react";
import Footer from "../components/Footer";
import "./About.css";

export default function About() {
  return (
    <div className="bc-about">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="bc-header">

        {/* LOGO */}
        <div className="bc-logo-area">
          <Link to="/">
            <img
              src="/images/bloodchain-logo.jpg"
              alt="BloodChain AI"
              className="bc-logo"
            />
          </Link>
        </div>


        {/* NAVIGATION */}
        <nav className="bc-navigation">

          <Link to="/" className="bc-nav-link">
            Home
          </Link>

          <Link to="/about" className="bc-nav-link bc-active">
            About
          </Link>

          <Link to="/features" className="bc-nav-link">
            Features
          </Link>

          <Link to="/how-it-works" className="bc-nav-link">
            How It Works
          </Link>

          <Link to="/impact" className="bc-nav-link">
            Impact
          </Link>

          <Link to="/contact" className="bc-nav-link">
            Contact
          </Link>

        </nav>


        {/* LOGIN / REGISTER */}
        <div className="bc-header-buttons">

          <Link to="/login" className="bc-login" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>

            <svg
              className="bc-button-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm0 2c-3.3 0-6 1.7-6 5v1h12v-1c0-3.3-2.7-5-6-5Z" />
            </svg>

            Login

          </Link>


          <Link to="/register" className="bc-register" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>

            <svg
              className="bc-button-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4Zm0 2c-3.3 0-6 1.7-6 5v1h12v-1c0-3.3-2.7-5-6-5Z" />
            </svg>

            Register

          </Link>

        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="bc-hero">

        {/* =================================================
            LEFT CONTENT
            ================================================= */}
        <div className="bc-hero-content">

          {/* ABOUT US LABEL */}
          <div className="bc-section-label">

            <span></span>

            <p>ABOUT US</p>

          </div>


          {/* HEADING */}
          <h1>
            Building a Smarter,
            <br />
            Stronger <span>Blood Network</span>
          </h1>


          {/* DESCRIPTION */}
          <p className="bc-description">
            BloodChain AI is an AI-powered blood supply network that predicts
            demand, detects shortages, and connects hospitals, blood banks,
            and donors to ensure safe, timely, and efficient blood
            availability.
          </p>


          {/* QUOTE */}
          <div className="bc-quote">

            <span className="bc-quote-mark">
              “
            </span>

            <div>

              <p>
                Because behind every unit of blood,
                <br />
                there is a second chance at life.
              </p>

              <span className="bc-quote-line"></span>

            </div>

          </div>

        </div>


        {/* =================================================
            RIGHT IMAGE

            IMPORTANT:
            Only the image is displayed here.
            No heart.
            No text.
            No overlay card.
            ================================================= */}
        <div className="bc-hero-image">

          <img
            src="/images/about-hero.jpg"
            alt="Healthcare professional caring for a patient"
          />

        </div>

      </section>


      {/* =====================================================
          INFORMATION SECTION
      ===================================================== */}
      <section className="bc-info-section">


        {/* =================================================
            OUR PURPOSE
            ================================================= */}
        <div className="bc-info-item">

          <div className="bc-info-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >

              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />

              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />

              <path
                d="M12 4V1M12 23v-3M4 12H1M23 12h-3"
                stroke="currentColor"
                strokeWidth="2"
              />

            </svg>

          </div>


          <h3>Our Purpose</h3>


          <p>
            To make blood available
            <br />
            whenever and wherever
            <br />
            it is needed.
          </p>

        </div>


        <div className="bc-info-divider"></div>


        {/* =================================================
            WHO WE SERVE
            ================================================= */}
        <div className="bc-info-item">

          <div className="bc-info-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >

              <circle
                cx="9"
                cy="8"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />

              <circle
                cx="17"
                cy="9"
                r="2.5"
                stroke="currentColor"
                strokeWidth="2"
              />

              <path
                d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
                stroke="currentColor"
                strokeWidth="2"
              />

              <path
                d="M15 15c3.1-.2 5.5 1.8 6 5"
                stroke="currentColor"
                strokeWidth="2"
              />

            </svg>

          </div>


          <h3>Who We Serve</h3>


          <p>
            Hospitals, blood banks,
            <br />
            healthcare professionals,
            <br />
            and donors.
          </p>

        </div>


        <div className="bc-info-divider"></div>


        {/* =================================================
            WHY IT MATTERS
            ================================================= */}
        <div className="bc-info-item">

          <div className="bc-info-icon">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >

              <path
                d="M9 18h6"
                stroke="currentColor"
                strokeWidth="2"
              />

              <path
                d="M10 22h4"
                stroke="currentColor"
                strokeWidth="2"
              />

              <path
                d="M8 14c-1.3-1.1-2-2.7-2-4.5C6 6.5 8.7 4 12 4s6 2.5 6 5.5c0 1.8-.7 3.4-2 4.5-.8.7-1 1.5-1 2H9c0-.5-.2-1.3-1-2Z"
                stroke="currentColor"
                strokeWidth="2"
              />

            </svg>

          </div>


          <h3>Why It Matters</h3>


          <p>
            To reduce preventable
            <br />
            deaths caused by blood
            <br />
            shortages and delays.
          </p>

        </div>


        <div className="bc-info-divider"></div>


        {/* =================================================
            WHAT WE DO
            ================================================= */}
        <div className="bc-info-item">

          <div className="bc-info-icon">

            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >

              <rect
                x="4"
                y="12"
                width="4"
                height="8"
                rx="1"
              />

              <rect
                x="10"
                y="8"
                width="4"
                height="12"
                rx="1"
              />

              <rect
                x="16"
                y="4"
                width="4"
                height="16"
                rx="1"
              />

            </svg>

          </div>


          <h3>What We Do</h3>


          <p>
            Use data and AI to predict,
            <br />
            prevent, and connect blood
            <br />
            supply networks efficiently.
          </p>

        </div>

      </section>


      {/* =====================================================
          VISION & MISSION
          BACKGROUND IMAGE = blood-cells.jpg
      ===================================================== */}
      <section className="bc-vision">

        {/* DARK OVERLAY */}
        <div className="bc-vision-overlay"></div>


        <div className="bc-vision-content">

          {/* TITLE */}
          <div className="bc-vision-title">

            <h2>
              Our Vision &amp; Mission
            </h2>

            <span></span>

          </div>


          {/* =================================================
              VISION + MISSION CARDS
              ================================================= */}
          <div className="bc-vision-cards">


            {/* =================================================
                VISION
                ================================================= */}
            <div className="bc-vision-card">

              <div className="bc-vision-icon">
                <Target size={30} strokeWidth={2.2} />
              </div>

              <div className="bc-vision-card-content">
                <h3>Our Vision</h3>
                <p>
                  To Create a world where every patient
                  <br />
                  can access the right blood at the right time.
                </p>
              </div>
            </div>

            {/* =================================================
                MISSION
                ================================================= */}
            <div className="bc-vision-card">
              <div className="bc-vision-icon">
                <HeartPulse size={30} strokeWidth={2.2} />
              </div>

              <div className="bc-vision-card-content">
                <h3>Our Mission</h3>
                <p>
                  To build an intelligent,
                  <br />
                  connected, and sustainable
                  <br />
                  blood supply ecosystem using AI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}