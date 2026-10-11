import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { submitContactMessage } from "../services/bloodService";
import Footer from "../components/Footer";
import "./Contact.css";

/* =====================================================
   ICON
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

    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),

    phone: (
      <>
        <path d="M6.5 3.5 9 3l2 5-2.5 1.8a14 14 0 0 0 5.2 5.2L15.5 12l5 2 .5 2.5c.3 1.5-.8 3-2.3 3C11.4 20 4 12.6 4 5.3c0-1 .7-1.6 1.5-1.8Z" />
      </>
    ),

    location: (
      <>
        <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),

    tag: (
      <>
        <path d="m4 5 8-2 9 9-8 8-9-9V5Z" />
        <circle cx="8" cy="8" r="1" />
      </>
    ),

    message: (
      <>
        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-4-.9L4 20l1.5-3.2A7.4 7.4 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
      </>
    ),

    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
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
    <header className="contact-header">
      <div className="contact-header-inner">

        <Link to="/" className="contact-logo">
          <img
            src="/images/bloodchain-logo.png"
            alt="BloodChain AI"
          />
        </Link>

        <nav className="contact-nav">
          {navigation.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive
                  ? "contact-nav-link active"
                  : "contact-nav-link"
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="contact-header-buttons">

          <Link to="/login" className="contact-login">
            <Icon type="user" size={17} />
            <span>Login</span>
          </Link>

          <Link to="/login" className="contact-register">
            <Icon type="users" size={17} />
            <span>Register</span>
          </Link>

        </div>

      </div>
    </header>
  );
}

/* =====================================================
   CONTACT INFORMATION BOX
===================================================== */

function ContactBox({
  icon,
  title,
  text,
  sub,
  color,
}) {
  return (
    <div className={`contact-info-card ${color}`}>

      <div className="contact-info-icon">
        <Icon type={icon} size={27} />
      </div>

      <div className="contact-info-content">

        <h3>{title}</h3>

        <strong>{text}</strong>

        <p>{sub}</p>

      </div>

    </div>
  );
}

/* =====================================================
   CONTACT PAGE
===================================================== */

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Enquiry");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill in your name, email, and message.");
      return;
    }

    try {
      setLoading(true);
      await submitContactMessage({
        name,
        email,
        phone,
        subject,
        message,
      });
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      alert("Thank you! Your message has been sent to BloodChain AI.");
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <Header />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="contact-hero">

        <div className="contact-hero-content">

          <div className="contact-section-label">
            <span></span>
            CONTACT US
          </div>

          <h1>
            Let's Build a Healthier
            <br />
            Tomorrow, <span>Together</span>
          </h1>

          <p>
            We'd love to hear from you! Whether you have a
            question, suggestion, partnership idea, or just want
            to support our mission — feel free to reach out.
          </p>

        </div>

        {/* FULL IMAGE — NO CROPPING */}

        <div className="contact-hero-image">

          <img
            src="/images/contact-hero.jpg"
            alt="BloodChain AI contact"
          />

        </div>

      </section>

      {/* =================================================
          MAIN CONTACT AREA
      ================================================= */}

      <section className="contact-main">

        {/* =================================================
            LEFT INFORMATION
        ================================================= */}

        <div className="contact-information">

          <ContactBox
            icon="mail"
            title="Email Us"
            text="bloodchainai@gmail.com"
            sub="We'll get back to you as soon as possible."
            color="pink"
          />

          <ContactBox
            icon="phone"
            title="Call Us"
            text="+91 98765 43210"
            sub="Mon – Fri, 9:00 AM – 6:00 PM"
            color="blue"
          />

          <ContactBox
            icon="location"
            title="Our Location"
            text="Tiruchirappalli, Tamil Nadu, India"
            sub="Available for collaboration and partnership opportunities."
            color="pink"
          />

          <ContactBox
            icon="users"
            title="Our Team"
            text="Team ZENITH"
            sub="Passionate students building a better tomorrow."
            color="blue"
          />

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <div className="contact-form-card">

          <h2>Send Us a Message</h2>

          <p className="contact-form-description">
            Fill in the details below and we'll get back to you soon.
          </p>

          {sent && (
            <div style={{ padding: "12px 16px", background: "#ecfdf5", border: "1px solid #10b981", borderRadius: "8px", color: "#065f46", marginBottom: "16px", fontSize: "14px" }}>
              ✓ Thank you! Your message has been sent successfully.
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="contact-form-row">

              <div className="contact-input-wrap">

                <Icon type="user" size={17} />

                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

              </div>

              <div className="contact-input-wrap">

                <Icon type="mail" size={17} />

                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

              </div>

            </div>

            <div className="contact-input-wrap">

              <Icon type="phone" size={17} />

              <input
                type="tel"
                placeholder="Your Phone (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

            </div>

            <div className="contact-input-wrap">

              <Icon type="tag" size={17} />

              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              >
                <option>General Enquiry</option>
                <option>Partnership</option>
                <option>Feedback</option>
                <option>Support</option>
              </select>

            </div>

            <div className="contact-textarea-wrap">

              <Icon type="message" size={17} />

              <textarea
                placeholder="Your Message"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>

            </div>

            <button
              type="submit"
              className="contact-send-button"
              disabled={loading}
            >

              <Icon type="send" size={19} />

              <span>{loading ? "Sending..." : "Send Message"}</span>

            </button>

          </form>

        </div>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="contact-right">

          {/* ===============================================
              DONATE / CONNECT / COLLABORATE / SAVE LIVES
          =============================================== */}

          <div className="contact-tomorrow-card">

            <div className="contact-tomorrow-content">

              <h2>
                Together for
                <br />
                a Healthier Tomorrow
              </h2>

              <p>
                Have an idea, feedback, or want to partner
                with us? We're always open to meaningful
                conversations that can help save lives
                and make a real impact.
              </p>

            </div>

            {/* USE YOUR NEW IMAGE HERE */}

            <div className="contact-drop-image">

              <img
                src="/images/donate.jpg"
                alt="Donate Connect Collaborate Save Lives"
              />

            </div>

          </div>

          {/* ===============================================
              SOCIAL
          =============================================== */}

          <div className="contact-social-card">

            <div className="contact-social-content">

              <h2>Follow Us</h2>

              <p>
                Stay connected for updates, news, and more.
              </p>

              <div className="contact-social-icons">

                <a href="#youtube" aria-label="YouTube" title="YouTube">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                <a href="#instagram" aria-label="Instagram" title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>

                <a href="#x" aria-label="X" title="X">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

              </div>

            </div>

            <div className="contact-social-divider"></div>

            <div className="contact-social-slogan">
              Together
              <br />
              <span>We Save Lives</span>
            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}
      <Footer />

    </div>
  );
}