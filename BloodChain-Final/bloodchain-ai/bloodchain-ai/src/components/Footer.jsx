import { Link } from "react-router-dom";

export default function Footer() {
  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Features", path: "/features" },
    { label: "How It Works", path: "/how-it-works" },
    { label: "Impact", path: "/impact" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <footer className="site-footer bc-global-footer">
      <div className="bc-footer-main">
        {/* BRAND */}
        <Link to="/" className="bc-footer-brand-link">
          <div className="bc-footer-drop-badge">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div className="bc-footer-brand-text">
            <strong>
              BloodChain <span>AI</span>
            </strong>
            <small>Connect. Predict. Save Lives.</small>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="bc-footer-nav" aria-label="Footer Navigation">
          {navItems.map((item, idx) => (
            <span key={item.path} className="bc-footer-nav-item">
              <Link to={item.path}>{item.label}</Link>
              {idx < navItems.length - 1 && <i className="bc-footer-sep">|</i>}
            </span>
          ))}
        </nav>

        {/* RIGHT TAGLINE */}
        <div className="bc-footer-tagline">
          A Smarter
          <br />
          Blood Supply
          <br />
          for a Healthier Tomorrow
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bc-footer-bottom-bar">
        <span>© {new Date().getFullYear()} BloodChain AI. All rights reserved.</span>
        <span>
          Made with <b className="bc-footer-heart">♥</b> for a better tomorrow.
        </span>
      </div>
    </footer>
  );
}
