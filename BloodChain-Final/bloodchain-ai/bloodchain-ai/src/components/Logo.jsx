import { Link } from "react-router-dom";

export default function Logo({ showTagline = true, className = "" }) {
  return (
    <Link to="/" className={`brand-logo-container ${className}`}>
      <div className="brand-logo-badge">
        <img
          src="/images/bloodchain-logo.png"
          alt="BloodChain AI"
          className="brand-logo-img"
          onError={(e) => {
            e.currentTarget.src = "/images/bloodchain-logo.jpg";
          }}
        />
      </div>
      <div className="brand-logo-text">
        <span className="brand-name">
          BloodChain <span className="brand-accent">AI</span>
        </span>
        {showTagline && (
          <span className="brand-tagline">Connect. Predict. Save Lives.</span>
        )}
      </div>
    </Link>
  );
}
