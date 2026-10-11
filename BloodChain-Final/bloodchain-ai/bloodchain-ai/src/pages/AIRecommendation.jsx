import { useState, useMemo, useEffect } from "react";
import {
  Brain,
  Droplets,
  Users,
  MapPin,
  Zap,
  BarChart3,
  Clock,
  ShieldCheck,
  Send,
  ArrowRight,
  Pencil,
  Headphones,
  Info,
  List,
  Search,
  X,
  Phone,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { AIRecommendationView } from "../components/predictive";
import { findSourceCandidates } from "../services/recommendationEngine";

function AIRecommendation() {
  const [activeRequest, setActiveRequest] = useState({
    id: "REQ-O+-20",
    bloodGroup: "O+",
    units: 20,
    location: "Trichy, Tamil Nadu",
    urgency: "Critical",
    requestedBy: "Trichy Government Hospital",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...activeRequest });
  const [editError, setEditError] = useState("");

  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMode, setSupportMode] = useState("chat");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportConfirmation, setSupportConfirmation] = useState(null);

  const [isAllSourcesModalOpen, setIsAllSourcesModalOpen] = useState(false);
  const [sourceSearch, setSourceSearch] = useState("");

  const [notice, setNotice] = useState(null);

  const initialSources = [
    {
      rank: 1,
      name: "Trichy Government Hospital",
      distance: "2.3 km",
      units: "120 units",
      score: "94%",
      tag: "Best Match",
      status: "Immediate Dispatch",
    },
    {
      rank: 2,
      name: "SRM Hospital",
      distance: "5.8 km",
      units: "45 units",
      score: "89%",
      tag: "Closest",
      status: "Ready",
    },
    {
      rank: 3,
      name: "Kauvery Hospital",
      distance: "8.1 km",
      units: "28 units",
      score: "84%",
      tag: "High Availability",
      status: "Ready",
    },
    {
      rank: 4,
      name: "Apollo Hospital",
      distance: "10.4 km",
      units: "60 units",
      score: "79%",
      tag: "Quick Response",
      status: "Ready",
    },
    {
      rank: 5,
      name: "MGM Hospital",
      distance: "12.2 km",
      units: "35 units",
      score: "76%",
      tag: "Trusted Partner",
      status: "Ready",
    },
    {
      rank: 6,
      name: "Thillai Nagar Blood Bank",
      distance: "4.5 km",
      units: "50 units",
      score: "74%",
      tag: "Regional Reserve",
      status: "Ready",
    },
    {
      rank: 7,
      name: "Srirangam PHC Blood Storage",
      distance: "7.0 km",
      units: "22 units",
      score: "71%",
      tag: "Community Hub",
      status: "Ready",
    },
  ];

  const [liveCandidates, setLiveCandidates] = useState([]);

  useEffect(() => {
    let isMounted = true;
    findSourceCandidates({
      request: {
        id: activeRequest.id,
        group: activeRequest.bloodGroup,
        units: activeRequest.units,
        hospital: activeRequest.requestedBy,
        district: "Tiruchirappalli",
        state: "Tamil Nadu",
        urgency: activeRequest.urgency,
      },
      radiusKm: 25,
    })
      .then((res) => {
        if (!isMounted) return;
        if (res.candidates && res.candidates.length > 0) {
          setLiveCandidates(res.candidates);
        }
      })
      .catch((err) => {
        console.warn("Live candidates error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [activeRequest]);

  const activeSources = useMemo(() => {
    if (liveCandidates.length > 0) {
      return liveCandidates.map((c, idx) => ({
        rank: idx + 1,
        name: c.facilityName,
        distance: c.roadDistanceDisplay
          ? `${c.roadDistanceDisplay}${c.durationText ? ` • ${c.durationText}` : ""}`
          : (c.distanceDisplay || "Near"),
        units: `${c.availableUnits} units`,
        score: `${Math.round(c.recommendationScore)}%`,
        tag: c.compatibilityStatus === "Exact Match" ? "Exact Match" : "Compatible Alternate",
        status: c.canFulfill ? "Sufficient" : "Partial",
      }));
    }
    return initialSources;
  }, [liveCandidates]);

  const filteredSources = useMemo(() => {
    if (!sourceSearch.trim()) return activeSources;
    const q = sourceSearch.toLowerCase();
    return activeSources.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q) ||
        s.units.toLowerCase().includes(q)
    );
  }, [sourceSearch, activeSources]);

  const handleOpenEdit = () => {
    setEditFormData({ ...activeRequest });
    setEditError("");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setEditError("");

    const unitsNum = parseInt(editFormData.units, 10);
    if (isNaN(unitsNum) || unitsNum <= 0) {
      setEditError("Please enter a valid number of units (minimum 1).");
      return;
    }
    if (!editFormData.requestedBy.trim()) {
      setEditError("Please specify the requesting hospital/facility.");
      return;
    }

    setActiveRequest({
      ...editFormData,
      units: unitsNum,
    });
    setIsEditModalOpen(false);
    setNotice("Analyzed blood request updated successfully! Re-running recommendation scores...");
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSupportConfirmation(
      `Support ticket #${Date.now().toString().slice(-4)} created. A clinical coordinator will respond shortly.`
    );
    setTimeout(() => {
      setSupportConfirmation(null);
      setIsSupportModalOpen(false);
      setSupportMessage("");
    }, 3000);
  };


  return (
    <div className="ai-recommendation-page">
      {notice && (
        <div
          style={{
            margin: "0 0 16px 0",
            padding: "12px 18px",
            background: "#ecfdf5",
            border: "1px solid #6ee7b7",
            borderRadius: "10px",
            color: "#065f46",
            fontSize: "15px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{notice}</span>
        </div>
      )}

      {/* HEADER */}

      <div className="ai-page-header">
        <div className="ai-page-title">
          <div className="ai-page-icon">
            <Brain size={29} />
          </div>

          <div>
            <h1>AI Recommendation</h1>

            <p>
              Smart blood source recommendations for faster, safer, and more
              reliable supply.
            </p>
          </div>
        </div>

        <div className="ai-header-right">
          <div className="ai-quote">
            <strong>“Data finds the source,</strong>
            <span>AI brings it closer.”</span>
          </div>

          <div className="ai-engine-active">
            <span className="active-dot" />

            <div>
              <strong>AI Engine Active</strong>
              <small>Analyzing real-time data...</small>
            </div>
          </div>
        </div>
      </div>

      {/* REQUEST BEING ANALYSED */}

      <div className="ai-request-card">
        <div className="ai-request-icon">
          <Droplets size={36} />
          <span>1</span>
        </div>

        <div className="ai-request-info">
          <small>Blood Request Being Analysed</small>
        </div>

        <div className="ai-request-item">
          <span>Blood Group</span>
          <strong>{activeRequest.bloodGroup}</strong>
        </div>

        <div className="ai-request-item">
          <span>Units Required</span>
          <strong>{activeRequest.units}</strong>
        </div>

        <div className="ai-request-item">
          <span>Location</span>
          <strong>{activeRequest.location}</strong>
        </div>

        <div className="ai-request-item">
          <span>Urgency</span>
          <b className={`urgency-badge ${activeRequest.urgency.toLowerCase()}`}>
            {activeRequest.urgency}
          </b>
        </div>

        <div className="ai-request-item requested-by">
          <span>Requested By</span>
          <strong>{activeRequest.requestedBy}</strong>
        </div>

        <button className="edit-request-btn" onClick={handleOpenEdit}>
          <Pencil size={14} />
          Edit Request
        </button>
      </div>

      {/* SUMMARY CARDS */}

      <div className="ai-summary-grid">
        <div className="ai-summary-card red">
          <div className="ai-summary-icon">
            <Users size={25} />
          </div>

          <div>
            <strong>{filteredSources.length + 5}</strong>
            <span>Matching Sources</span>
            <small>↑ +4 from last search</small>
          </div>
        </div>

        <div className="ai-summary-card blue">
          <div className="ai-summary-icon">
            <MapPin size={25} />
          </div>

          <div>
            <strong>5</strong>
            <span>Nearby Sources</span>
            <small>Within 10 km</small>
          </div>
        </div>

        <div className="ai-summary-card yellow">
          <div className="ai-summary-icon">
            <Zap size={25} />
          </div>

          <div>
            <strong>3</strong>
            <span>Urgent Matches</span>
            <small>Available now</small>
          </div>
        </div>

        <div className="ai-summary-card green">
          <div className="ai-summary-icon">
            <BarChart3 size={25} />
          </div>

          <div>
            <strong>94%</strong>
            <span>AI Confidence</span>
            <small>High accuracy</small>
          </div>
        </div>
      </div>

      {/* ==============================================================
          LIVE AI RECOMMENDATION ENGINE (PHASE 6 INTEGRATION)
      ============================================================== */}
      <div style={{ marginBottom: "24px" }}>
        <AIRecommendationView />
      </div>

      {/* LOWER GRID */}

      <div className="ai-lower-grid">
        {/* WHY THIS SOURCE */}

        <section className="why-source-card">
          <div className="lower-card-title">
            <MapPin size={19} />

            <h2>Why This Source?</h2>

            <Info size={15} />
          </div>

          <div className="score-bars">
            <div>
              <span>Blood Availability</span>
              <div className="bar">
                <i style={{ width: "98%" }} />
              </div>
              <b>98%</b>
            </div>

            <div>
              <span>Distance Proximity</span>
              <div className="bar">
                <i style={{ width: "92%" }} />
              </div>
              <b>92%</b>
            </div>

            <div>
              <span>Urgency Response</span>
              <div className="bar">
                <i style={{ width: "96%" }} />
              </div>
              <b>96%</b>
            </div>

            <div>
              <span>Historical Reliability</span>
              <div className="bar">
                <i style={{ width: "90%" }} />
              </div>
              <b>90%</b>
            </div>

            <div>
              <span>Demand Forecast</span>
              <div className="bar">
                <i style={{ width: "85%" }} />
              </div>
              <b>85%</b>
            </div>
          </div>
        </section>

        {/* AI INSIGHT */}

        <section className="ai-insight-card">
          <div className="insight-icon">
            <Brain size={24} />
          </div>

          <div>
            <strong>AI Insight</strong>

            <p>
              {activeRequest.requestedBy} recommendation: Regional Blood Bank is the highest ranked match because it has
              sufficient {activeRequest.bloodGroup} stock ({activeRequest.units} units required), shortest dispatch route, and 98% cold-chain reliability score.
            </p>
          </div>
        </section>

        {/* HUMAN ASSISTANT */}

        <section className="human-assistant-card">
          <div className="assistant-header">
            <div>
              <Headphones size={22} />
              <h2>Human Assistant</h2>
            </div>

            <span>
              <i />
              Live Support
            </span>
          </div>

          <div className="assistant-body">
            <div className="assistant-avatar">👩🏻‍💼</div>

            <div>
              <h3>Need assistance?</h3>

              <p>
                Our support team is here to help you with blood requests,
                transfers, or any queries.
              </p>

              <div className="assistant-buttons">
                <button onClick={() => { setSupportMode("chat"); setIsSupportModalOpen(true); }}>
                  💬 Chat Now
                </button>

                <button onClick={() => { setSupportMode("call"); setIsSupportModalOpen(true); }}>
                  📞 Call Support
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* OTHER SOURCES */}

      <div className="other-sources-card">
        <div>
          <List size={21} />
        </div>

        <section>
          <strong>Other Potential Sources</strong>
          <span>
            {initialSources.length} verified blood banks and hospitals can fulfill this request.
          </span>
        </section>

        <button onClick={() => setIsAllSourcesModalOpen(true)}>
          View All Sources
          <ArrowRight size={15} />
        </button>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Edit Request Modal */}
      {isEditModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1500,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                color: "#fff",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Pencil size={20} />
                <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Edit Analyzed Blood Request</h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: "20px 24px" }}>
              {editError && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "13.5px",
                    marginBottom: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{editError}</span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Blood Group
                  </label>
                  <select
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", boxSizing: "border-box" }}
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Units Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editFormData.units}
                    onChange={(e) => setEditFormData({ ...editFormData, units: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                  Location / District
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Urgency Level
                  </label>
                  <select
                    value={editFormData.urgency}
                    onChange={(e) => setEditFormData({ ...editFormData, urgency: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", boxSizing: "border-box" }}
                  >
                    <option value="Critical">Critical</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Routine">Routine</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Requested By
                  </label>
                  <input
                    type="text"
                    value={editFormData.requestedBy}
                    onChange={(e) => setEditFormData({ ...editFormData, requestedBy: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px", borderTop: "1px solid #f3f4f6", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                >
                  Save & Re-Analyze
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Human Assistant Support Modal */}
      {isSupportModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1500,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsSupportModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
                color: "#fff",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Headphones size={22} />
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>BloodChain Support Desk</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#ccfbf1" }}>
                    Ref: {activeRequest.id} ({activeRequest.bloodGroup}, {activeRequest.units} units)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {supportConfirmation ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <CheckCircle2 size={42} color="#059669" style={{ margin: "0 auto 10px" }} />
                  <h3 style={{ fontSize: "17px", color: "#065f46", margin: "0 0 6px" }}>Message Dispatched</h3>
                  <p style={{ fontSize: "14px", color: "#374151" }}>{supportConfirmation}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                    <button
                      onClick={() => setSupportMode("chat")}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: supportMode === "chat" ? "#0d9488" : "#d1d5db",
                        background: supportMode === "chat" ? "#f0fdfa" : "#fff",
                        color: supportMode === "chat" ? "#0f766e" : "#4b5563",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      💬 Live Clinical Chat
                    </button>
                    <button
                      onClick={() => setSupportMode("call")}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: supportMode === "call" ? "#0d9488" : "#d1d5db",
                        background: supportMode === "call" ? "#f0fdfa" : "#fff",
                        color: supportMode === "call" ? "#0f766e" : "#4b5563",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      📞 Direct Helpline
                    </button>
                  </div>

                  {supportMode === "call" ? (
                    <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "10px", textAlign: "center" }}>
                      <div style={{ fontSize: "15px", color: "#374151", marginBottom: "8px" }}>Emergency Transport & Logistics Coordinator:</div>
                      <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f766e", marginBottom: "6px" }}>+91 431 2400108</div>
                      <div style={{ fontSize: "13px", color: "#6b7280" }}>Available 24/7 for acute ICU shortages & route clearance</div>
                    </div>
                  ) : (
                    <form onSubmit={handleSupportSubmit}>
                      <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                        How can we expedite this recommendation?
                      </label>
                      <textarea
                        rows={4}
                        placeholder="e.g. Need immediate green corridor transit from Trichy GH to OT."
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", resize: "vertical", boxSizing: "border-box" }}
                        required
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                        <button
                          type="button"
                          onClick={() => setIsSupportModalOpen(false)}
                          style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#0d9488", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                        >
                          Send Message
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. View All Sources Modal */}
      {isAllSourcesModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1500,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setIsAllSourcesModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "650px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              overflow: "hidden",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                color: "#fff",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <List size={22} />
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>All Potential Blood Sources</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#dbeafe" }}>
                    Ranked by AI matching algorithm for {activeRequest.bloodGroup} demand
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAllSourcesModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ position: "relative" }}>
                <Search size={16} color="#9ca3af" style={{ position: "absolute", left: "12px", top: "11px" }} />
                <input
                  type="text"
                  placeholder="Filter sources by hospital name or tag..."
                  value={sourceSearch}
                  onChange={(e) => setSourceSearch(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredSources.map((s) => (
                  <div
                    key={s.rank}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#fafafa",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: 700, color: "#2563eb", fontSize: "15px" }}>#{s.rank}</span>
                        <strong style={{ fontSize: "15px", color: "#111827" }}>{s.name}</strong>
                        <span style={{ background: "#dbeafe", color: "#1e40af", padding: "1px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 600 }}>
                          {s.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: "13.5px", color: "#4b5563", marginTop: "4px" }}>
                        📍 {s.distance} • Stock: <b>{s.units}</b> • Match Confidence: <b style={{ color: "#16a34a" }}>{s.score}</b>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsAllSourcesModalOpen(false);
                        setNotice(`Dispatch route selected for ${s.name} (${s.units} available)!`);
                        setTimeout(() => setNotice(null), 4000);
                      }}
                      style={{
                        padding: "7px 14px",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Select Source
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIRecommendation;

