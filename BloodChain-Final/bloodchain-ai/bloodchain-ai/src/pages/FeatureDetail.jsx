import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  PieChart,
} from "lucide-react";
import Footer from "../components/Footer";
import { FEATURES_DATA } from "../data/featuresData";
import { Logo, Icon } from "./Features";
import "./Features.css";
import "./FeatureDetail.css";

export default function FeatureDetail() {
  const { slug } = useParams();
  const feature = FEATURES_DATA[slug];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!feature) {
    return <Navigate to="/features" replace />;
  }

  const allFeaturesList = Object.values(FEATURES_DATA);

  return (
    <div className="feature-detail-page">
      {/* =====================================
          NAVBAR (MATCHES FEATURES PAGE)
      ===================================== */}
      <header className="features-navbar">
        <Logo />

        <nav className="features-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/features" className="active">Features</Link>
          <Link to="/how-it-works">How It Works</Link>
          <Link to="/impact">Impact</Link>
          <Link to="/contact">Contact</Link>
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
          TOP BREADCRUMB & BACK ACTION
      ===================================== */}
      <div className="feature-detail-topbar">
        <Link to="/features" className="back-to-features-btn">
          <ArrowLeft size={16} />
          Back to Features
        </Link>

        <div className="feature-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/features">Features</Link>
          <span>/</span>
          <span className="current">{feature.title}</span>
        </div>
      </div>

      {/* =====================================
          HERO HEADER
      ===================================== */}
      <section className="feature-detail-hero">
        <div className="hero-content-wrapper">
          <div className="feature-hero-icon-box">
            <Icon type={feature.iconType} />
          </div>

          <div>
            <span className="feature-hero-badge">BLOODCHAIN AI FEATURE</span>
            <h1 className="feature-hero-title">{feature.title}</h1>
            <p className="feature-hero-desc">{feature.shortDescription}</p>
          </div>
        </div>

        <div className="feature-hero-actions">
          <Link to="/register" className="cta-live-btn">
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* =====================================
          MAIN CONTENT CONTAINER
      ===================================== */}
      <main className="feature-detail-container">
        {/* SECTION 1: WHAT IT DOES */}
        <section className="detail-section">
          <div className="detail-section-title">
            <div className="section-icon-pill">
              <Activity size={18} />
            </div>
            <h2>What It Does</h2>
          </div>

          <div className="what-it-does-card">
            <p className="what-it-does-summary">{feature.whatItDoes.summary}</p>
            <ul className="what-it-does-points">
              {feature.whatItDoes.keyPoints.map((point, index) => (
                <li key={index}>
                  <CheckCircle2 size={18} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS / WORKFLOW */}
        {feature.workflow && (
          <section className="detail-section">
            <div className="detail-section-title">
              <div className="section-icon-pill">
                <Layers size={18} />
              </div>
              <h2>How It Works</h2>
            </div>

            <div className="workflow-container">
              {feature.workflow.map((item) => (
                <div key={item.step} className="workflow-step-card">
                  <div className="workflow-step-badge">Step {item.step}</div>
                  <h3 className="workflow-step-title">{item.title}</h3>
                  <p className="workflow-step-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: FEATURE-SPECIFIC DEEP DIVES */}

        {/* A. AI Demand Forecasting Specifics */}
        {feature.slug === "ai-demand-forecasting" && (
          <>
            <section className="detail-section">
              <div className="detail-section-title">
                <div className="section-icon-pill">
                  <TrendingUp size={18} />
                </div>
                <h2>Key Inputs Analyzed by the System</h2>
              </div>
              <div className="key-inputs-grid">
                {feature.keyInputs.map((input, idx) => (
                  <div key={idx} className="input-feature-card">
                    <h4>
                      <span className="bullet" />
                      {input.title}
                    </h4>
                    <p>{input.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {feature.aiApproach && (
              <section className="detail-section">
                <div className="detail-section-title">
                  <div className="section-icon-pill">
                    <Sparkles size={18} />
                  </div>
                  <h2>AI / ML Predictive Approach</h2>
                </div>
                <div className="what-it-does-card" style={{ background: "#f8fafc" }}>
                  <h3 style={{ fontSize: "18px", color: "#0f172a", margin: "0 0 8px 0" }}>
                    {feature.aiApproach.headline}
                  </h3>
                  <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.7", margin: 0 }}>
                    {feature.aiApproach.description}
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        {/* B. Shortage Risk Detection Specifics */}
        {feature.slug === "shortage-risk-detection" && (
          <>
            <section className="detail-section">
              <div className="detail-section-title">
                <div className="section-icon-pill">
                  <AlertCircle size={18} />
                </div>
                <h2>Visual Risk Levels & Depletion Thresholds</h2>
              </div>
              <div className="risk-levels-grid">
                {feature.riskLevels.map((risk) => (
                  <div
                    key={risk.level}
                    className="risk-level-card"
                    style={{
                      backgroundColor: risk.bgColor,
                      borderColor: risk.borderColor,
                    }}
                  >
                    <div className="risk-level-header">
                      <strong style={{ color: risk.badgeColor }}>{risk.level}</strong>
                      <span className="risk-level-threshold" style={{ color: risk.badgeColor }}>
                        {risk.threshold}
                      </span>
                    </div>
                    <p>{risk.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <div className="detail-section-title">
                <div className="section-icon-pill">
                  <Layers size={18} />
                </div>
                <h2>Key Risk Factors Evaluated</h2>
              </div>
              <div className="key-inputs-grid">
                {feature.keyInputs.map((input, idx) => (
                  <div key={idx} className="input-feature-card">
                    <h4>
                      <span className="bullet" />
                      {input.title}
                    </h4>
                    <p>{input.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* C. Expiry Risk Detection Specifics */}
        {feature.slug === "expiry-risk-detection" && (
          <section className="detail-section">
            <div className="detail-section-title">
              <div className="section-icon-pill">
                <Clock size={18} />
              </div>
              <h2>Key Tracking Parameters</h2>
            </div>
            <div className="key-inputs-grid">
              {feature.keyInputs.map((input, idx) => (
                <div key={idx} className="input-feature-card">
                  <h4>
                    <span className="bullet" />
                    {input.title}
                  </h4>
                  <p>{input.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* D. Real-Time Blood Inventory Specifics */}
        {feature.slug === "real-time-blood-inventory" && (
          <>
            <section className="detail-section">
              <div className="detail-section-title">
                <div className="section-icon-pill">
                  <Layers size={18} />
                </div>
                <h2>Example Live Inventory Showcase</h2>
              </div>
              <div className="inventory-showcase-wrapper">
                <table className="inventory-showcase-table">
                  <thead>
                    <tr>
                      <th>Blood Group</th>
                      <th>Available Units</th>
                      <th>Reserved Units</th>
                      <th>Real-Time Status</th>
                      <th>Location Zone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feature.inventorySample.map((item) => (
                      <tr key={item.group}>
                        <td>
                          <span className="blood-group-tag">{item.group}</span>
                        </td>
                        <td>
                          <strong style={{ fontSize: "16px" }}>{item.available} units</strong>
                        </td>
                        <td style={{ color: "#6b7280" }}>{item.reserved} units</td>
                        <td>
                          <span
                            className="inventory-status-pill"
                            style={{
                              backgroundColor: item.bg,
                              color: item.color,
                              border: `1px solid ${item.color}40`,
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ color: "#4b5563" }}>Trichy Central Cold Storage</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="detail-section">
              <div className="detail-section-title">
                <div className="section-icon-pill">
                  <CheckCircle2 size={18} />
                </div>
                <h2>Inventory Parameters Monitored</h2>
              </div>
              <div className="key-inputs-grid">
                {feature.keyInputs.map((input, idx) => (
                  <div key={idx} className="input-feature-card">
                    <h4>
                      <span className="bullet" />
                      {input.title}
                    </h4>
                    <p>{input.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* E. Location-Based Search Specifics */}
        {feature.slug === "location-based-search" && (
          <section className="detail-section">
            <div className="detail-section-title">
              <div className="section-icon-pill">
                <MapPin size={18} />
              </div>
              <h2>Search & Filter Parameters</h2>
            </div>
            <div className="key-inputs-grid">
              {feature.keyInputs.map((input, idx) => (
                <div key={idx} className="input-feature-card">
                  <h4>
                    <span className="bullet" />
                    {input.title}
                  </h4>
                  <p>{input.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* F. Smart Source Recommendation Specifics */}
        {feature.slug === "smart-source-recommendation" && (
          <>
            <section className="detail-section">
              <div className="detail-section-title">
                <div className="section-icon-pill">
                  <Layers size={18} />
                </div>
                <h2>Multi-Objective Recommendation Factors</h2>
              </div>
              <div className="factors-grid">
                {feature.recommendationFactors.map((f, idx) => (
                  <div key={idx} className="factor-card">
                    <div className="factor-header">
                      <strong style={{ fontSize: "15px", color: "#111827" }}>{f.title}</strong>
                      <span className="factor-weight">{f.weight}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#4b5563", margin: 0 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <div className="detail-section-title">
                <div className="section-icon-pill">
                  <CheckCircle2 size={18} />
                </div>
                <h2>Clinical Recommendation Example</h2>
              </div>
              <div className="what-it-does-card" style={{ marginBottom: "16px", background: "#f8fafc" }}>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "15px" }}>
                  <div>
                    <strong>Patient Blood Group:</strong> {feature.exampleCase.request.bloodGroup}
                  </div>
                  <div>
                    <strong>Required Units:</strong> {feature.exampleCase.request.unitsRequired}
                  </div>
                  <div>
                    <strong>Urgency:</strong> {feature.exampleCase.request.urgency}
                  </div>
                  <div>
                    <strong>Facility:</strong> {feature.exampleCase.request.requestingHospital}
                  </div>
                </div>
              </div>

              <div className="example-recommendations-list">
                {feature.exampleCase.recommendations.map((rec) => (
                  <div key={rec.rank} className="rec-item-card">
                    <div className="rec-item-left">
                      <div className="rec-rank-circle">#{rec.rank}</div>
                      <div>
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#111827" }}>
                          {rec.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: "14px", color: "#4b5563" }}>
                          {rec.rationale}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", gap: "16px", alignItems: "center" }}>
                      <div>
                        <span style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>
                          {rec.availableUnits} Available
                        </span>
                        <small style={{ color: "#6b7280" }}>{rec.distance} away</small>
                      </div>
                      <span
                        style={{
                          background: "#ecfdf5",
                          color: "#047857",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          fontSize: "13px",
                          border: "1px solid #a7f3d0",
                        }}
                      >
                        {rec.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* G. Request & Approval Workflow Specifics */}
        {feature.slug === "request-approval-workflow" && (
          <section className="detail-section">
            <div className="detail-section-title">
              <div className="section-icon-pill">
                <FileText size={18} />
              </div>
              <h2>Digital Request Status Lifecycle</h2>
            </div>
            <div className="lifecycle-grid">
              {feature.statusLifecycle.map((st) => (
                <div
                  key={st.status}
                  className="lifecycle-badge-card"
                  style={{
                    backgroundColor: st.bg,
                    borderColor: `${st.color}40`,
                  }}
                >
                  <span
                    className="lifecycle-badge-title"
                    style={{
                      backgroundColor: st.color,
                      color: "#ffffff",
                    }}
                  >
                    {st.status}
                  </span>
                  <p style={{ fontSize: "14px", color: "#374151", margin: 0, lineHeight: "1.5" }}>
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* H. AI Insights & Analytics Specifics */}
        {feature.slug === "ai-insights-analytics" && (
          <>
            <section className="detail-section">
              <div className="detail-section-title">
                <div className="section-icon-pill">
                  <PieChart size={18} />
                </div>
                <h2>Live Network Intelligence Metrics</h2>
              </div>
              <div className="analytics-metrics-grid">
                {feature.sampleMetrics.map((metric, idx) => (
                  <div key={idx} className="analytics-metric-box">
                    <div className="metric-box-val" style={{ color: metric.color }}>
                      {metric.value}
                    </div>
                    <div className="metric-box-label">{metric.label}</div>
                    <div className="metric-box-sub">{metric.subtext}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <div className="detail-section-title">
                <div className="section-icon-pill">
                  <Layers size={18} />
                </div>
                <h2>Core Analytics Dimensions</h2>
              </div>
              <div className="key-inputs-grid">
                {feature.analyticsDimensions.map((dim, idx) => (
                  <div key={idx} className="input-feature-card">
                    <h4>
                      <span className="bullet" />
                      {dim.title}
                    </h4>
                    <p>{dim.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* SECTION 4: KEY BENEFITS (4 CARDS) */}
        <section className="detail-section">
          <div className="detail-section-title">
            <div className="section-icon-pill">
              <ShieldCheck size={18} />
            </div>
            <h2>Key Benefits</h2>
          </div>

          <div className="benefits-grid">
            {feature.benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon-badge">
                  <ShieldCheck size={22} />
                </div>
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: EXAMPLE USE CASE */}
        <section className="detail-section">
          <div className="detail-section-title">
            <div className="section-icon-pill">
              <Building2 size={18} />
            </div>
            <h2>Example Use Case</h2>
          </div>

          <div className="use-case-box">
            <div className="use-case-header">
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#dc2626",
                }}
              />
              <h3>Clinical Scenario in Action</h3>
            </div>
            <div className="use-case-scenario">{feature.exampleUseCase.scenario}</div>
            <p className="use-case-detail">{feature.exampleUseCase.detail}</p>
          </div>
        </section>

        {/* SECTION 6: EXPLORE ALL 8 FEATURES QUICK NAVIGATOR */}
        <section className="other-features-section">
          <div className="detail-section-title">
            <div className="section-icon-pill">
              <Layers size={18} />
            </div>
            <h2>Explore Other BloodChain AI Features</h2>
          </div>

          <div className="other-features-grid">
            {allFeaturesList.map((item) => {
              const isActive = item.slug === feature.slug;
              return (
                <Link
                  key={item.slug}
                  to={`/features/${item.slug}`}
                  className={`other-feature-pill ${isActive ? "active" : ""}`}
                >
                  <Icon type={item.iconType} />
                  <span style={{ fontSize: "14px", fontWeight: isActive ? "700" : "500" }}>
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* =====================================
          CTA BAND (MATCHES FEATURES PAGE)
      ===================================== */}
      <section className="features-cta-band">
        <div className="features-cta-inner">
          <div className="features-cta-content">
            <h2>Experience Smarter Blood Logistics</h2>
            <p>
              Connect with accredited blood banks, hospitals, and voluntary donors across the network.
            </p>
          </div>

          <Link to="/register" className="features-cta-button">
            Get Started &rarr;
          </Link>

          <div className="features-cta-divider" />

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
  );
}
