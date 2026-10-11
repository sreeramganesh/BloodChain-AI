import { useState, useMemo } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  Flag,
  Heart,
  Users,
  Phone,
  Bell,
  Gift,
  X,
  Thermometer,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import BloodRequestModal from "../components/BloodRequestModal";
import DonorRegistrationModal from "../components/DonorRegistrationModal";

const INITIAL_REQUESTS = [
  {
    id: "BRQ001",
    bloodGroup: "O+",
    units: 2,
    hospital: "Trichy Government Hospital",
    location: "Trichy",
    date: "16 Sep 2026",
    status: "Pending",
    urgency: "High",
    notes: "Post-trauma care requirement.",
    eta: "Pending allocation",
    temperature: "Stored at +4.0°C",
  },
  {
    id: "BRQ002",
    bloodGroup: "A+",
    units: 3,
    hospital: "SRM Hospital",
    location: "Kattankulathur",
    date: "02 Sep 2026",
    status: "Approved",
    urgency: "Medium",
    notes: "Elective orthopedic surgery.",
    eta: "Ready for collection",
    temperature: "+4.1°C monitored",
  },
  {
    id: "BRQ003",
    bloodGroup: "B+",
    units: 1,
    hospital: "Apollo Hospital",
    location: "Trichy",
    date: "18 Aug 2026",
    status: "In Progress",
    urgency: "Critical",
    notes: "Required for cardiac surgery. Urgent.",
    eta: "19 Aug 2026, 04:30 PM",
    temperature: "+3.8°C (Cold-chain GPS active)",
  },
  {
    id: "BRQ004",
    bloodGroup: "O-",
    units: 2,
    hospital: "Cauvery Hospital",
    location: "Trichy",
    date: "10 Jul 2026",
    status: "Approved",
    urgency: "High",
    notes: "Maternity emergency blood reserve.",
    eta: "Dispatched from central bank",
    temperature: "+4.2°C steady",
  },
  {
    id: "BRQ005",
    bloodGroup: "AB+",
    units: 1,
    hospital: "MGM Hospital",
    location: "Trichy",
    date: "25 Jun 2026",
    status: "Pending",
    urgency: "Normal",
    notes: "Oncology ward transfusion request.",
    eta: "Evaluating donor pool",
    temperature: "Standby",
  },
];

function MyRequests() {
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("bloodchain_my_requests");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage read error", e);
    }
    return INITIAL_REQUESTS;
  });

  const [activeTab, setActiveTab] = useState("All Requests");
  const [selectedRequest, setSelectedRequest] = useState(requests[2] || requests[0]);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Notification toggle state persisted to localStorage
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem("bloodchain_requests_notifications_enabled");
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const showNotification = (message) => {
    setActionNotice(message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleNotifications = () => {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    try {
      localStorage.setItem("bloodchain_requests_notifications_enabled", JSON.stringify(nextState));
    } catch (e) {
      console.warn("Failed to persist notification state", e);
    }
    showNotification(
      nextState
        ? "Push notifications & emergency SMS alerts enabled for your blood requests!"
        : "Notifications disabled. You can re-enable anytime."
    );
  };

  const handleNewRequestSubmit = (formData) => {
    const newReq = {
      id: `BRQ${String(requests.length + 1).padStart(3, "0")}`,
      bloodGroup: formData.bloodGroup,
      units: parseInt(formData.units, 10) || 1,
      hospital: formData.hospital,
      location: formData.location || "Tamil Nadu",
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Pending",
      urgency: formData.urgency || "Normal",
      notes: formData.notes || "Urgent patient transfusion request.",
      eta: "Processing AI allocation",
      temperature: "Pending dispatch",
    };

    const updated = [newReq, ...requests];
    setRequests(updated);
    setSelectedRequest(newReq);
    try {
      localStorage.setItem("bloodchain_my_requests", JSON.stringify(updated));
    } catch (e) {
      console.warn("Storage error", e);
    }
    setIsNewRequestModalOpen(false);
    showNotification(`Blood request ${newReq.id} created successfully and prioritized in queue!`);
  };

  const handleDonorRegistered = (donorData) => {
    setIsDonorModalOpen(false);
    showNotification(
      `Thank you, ${donorData.fullName}! You are now registered as an active volunteer donor.`
    );
  };

  // Filtered requests according to tab
  const filteredRequests = useMemo(() => {
    if (activeTab === "All Requests") return requests;
    if (activeTab.startsWith("Pending")) return requests.filter((r) => r.status === "Pending");
    if (activeTab.startsWith("Approved")) return requests.filter((r) => r.status === "Approved");
    if (activeTab.startsWith("In Progress")) return requests.filter((r) => r.status === "In Progress");
    if (activeTab.startsWith("Completed")) return requests.filter((r) => r.status === "Completed");
    if (activeTab.startsWith("Cancelled")) return requests.filter((r) => r.status === "Cancelled");
    return requests;
  }, [requests, activeTab]);

  // Status counts
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const inProgressCount = requests.filter((r) => r.status === "In Progress").length;
  const completedCount = requests.filter((r) => r.status === "Completed").length;

  return (
    <div className="my-requests-page">
      {/* NOTIFICATION FEEDBACK BANNER */}
      {actionNotice && (
        <div
          style={{
            position: "sticky",
            top: "16px",
            zIndex: 1000,
            background: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            borderRadius: "10px",
            padding: "12px 20px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          <CheckCircle2 size={20} color="#059669" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* =========================
          PAGE HEADER
      ========================= */}
      <div className="requests-page-header">
        <div className="requests-title-area">
          <div className="requests-title-icon">
            <FileText size={30} />
          </div>

          <div>
            <div className="requests-eyebrow">BLOOD REQUESTS</div>
            <h1>My Requests</h1>
            <p>Track the status of your blood requests and get real-time operational updates.</p>
          </div>
        </div>

        <div className="requests-header-right">
          <div className="requests-quote">
            <em>
              "Every request brings hope
              <br />
              to someone's tomorrow."
            </em>
          </div>

          <button
            className="new-request-button"
            onClick={() => setIsNewRequestModalOpen(true)}
            style={{ cursor: "pointer" }}
          >
            <span>+</span>
            New Blood Request
          </button>
        </div>
      </div>

      {/* =========================
          STAT CARDS
      ========================= */}
      <div className="request-stats-grid">
        <div className="request-stat-card request-red">
          <div className="request-stat-icon">
            <FileText size={27} />
          </div>
          <div>
            <span>Total Requests</span>
            <strong>{totalCount}</strong>
            <small>All time requests</small>
          </div>
        </div>

        <div className="request-stat-card request-orange">
          <div className="request-stat-icon">
            <Clock size={27} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
            <small>Waiting for confirmation</small>
          </div>
        </div>

        <div className="request-stat-card request-green">
          <div className="request-stat-icon">
            <CheckCircle2 size={27} />
          </div>
          <div>
            <span>Approved</span>
            <strong>{approvedCount}</strong>
            <small>Donor/Hospital assigned</small>
          </div>
        </div>

        <div className="request-stat-card request-blue">
          <div className="request-stat-icon">
            <Truck size={27} />
          </div>
          <div>
            <span>In Progress</span>
            <strong>{inProgressCount}</strong>
            <small>Blood on the way</small>
          </div>
        </div>

        <div className="request-stat-card request-light-green">
          <div className="request-stat-icon">
            <Flag size={27} />
          </div>
          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
            <small>Request fulfilled</small>
          </div>
        </div>
      </div>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <div className="requests-content-grid">
        {/* LEFT */}
        <div className="requests-left">
          {/* TABS */}
          <div className="request-tabs">
            <button
              className={activeTab === "All Requests" ? "active" : ""}
              onClick={() => setActiveTab("All Requests")}
            >
              All Requests ({totalCount})
            </button>

            <button
              className={activeTab.startsWith("Pending") ? "active" : ""}
              onClick={() => setActiveTab("Pending")}
            >
              Pending ({pendingCount})
            </button>

            <button
              className={activeTab.startsWith("Approved") ? "active" : ""}
              onClick={() => setActiveTab("Approved")}
            >
              Approved ({approvedCount})
            </button>

            <button
              className={activeTab.startsWith("In Progress") ? "active" : ""}
              onClick={() => setActiveTab("In Progress")}
            >
              In Progress ({inProgressCount})
            </button>

            <button
              className={activeTab.startsWith("Completed") ? "active" : ""}
              onClick={() => setActiveTab("Completed")}
            >
              Completed ({completedCount})
            </button>

            <button
              className={activeTab.startsWith("Cancelled") ? "active" : ""}
              onClick={() => setActiveTab("Cancelled")}
            >
              Cancelled (0)
            </button>
          </div>

          {/* REQUEST TABLE */}
          <div className="my-request-table-card">
            <div className="my-request-table-wrapper">
              <table className="my-request-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Request ID</th>
                    <th>Blood Group</th>
                    <th>Units</th>
                    <th>Hospital / Location</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request, index) => {
                    const isSelected = selectedRequest?.id === request.id;
                    return (
                      <tr
                        key={request.id}
                        onClick={() => setSelectedRequest(request)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "#fff7ed" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                      >
                        <td>{index + 1}</td>
                        <td>
                          <strong>{request.id}</strong>
                        </td>
                        <td>
                          <span
                            className={`request-blood-group ${request.bloodGroup
                              .replace("+", "positive")
                              .replace("-", "negative")}`}
                          >
                            {request.bloodGroup}
                          </span>
                        </td>
                        <td>{request.units} Unit{request.units > 1 ? "s" : ""}</td>
                        <td>
                          <div className="request-hospital-cell">
                            <strong>{request.hospital}</strong>
                            <span>{request.location}</span>
                          </div>
                        </td>
                        <td>{request.date}</td>
                        <td>
                          <span
                            className={`request-status ${
                              request.status === "Pending"
                                ? "pending"
                                : request.status === "Approved"
                                ? "approved"
                                : "in-progress"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="request-view-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(request);
                              setIsTrackingModalOpen(true);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                        No blood requests found under "{activeTab}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOTTOM HELP CARDS */}
          <div className="request-help-grid">
            <div className="request-help-card urgent">
              <div className="request-help-icon">
                <Heart size={28} fill="currentColor" />
              </div>
              <div>
                <h3>Need Urgent Help?</h3>
                <p>Contact support or nearby hospitals for immediate emergency escalation.</p>
                <button onClick={() => setIsSupportModalOpen(true)} style={{ cursor: "pointer" }}>
                  <Phone size={15} />
                  Call Support
                </button>
              </div>
            </div>

            <div className="request-help-card match">
              <div className="request-help-icon">
                <Users size={28} />
              </div>
              <div>
                <h3>Can't Find a Match?</h3>
                <p>
                  Allow nearby blood banks and real-time donor networks to push immediate match alerts.
                </p>
                <button
                  onClick={handleToggleNotifications}
                  style={{
                    cursor: "pointer",
                    background: notificationsEnabled ? "#15803d" : "#ffffff",
                    color: notificationsEnabled ? "#ffffff" : "#b45309",
                    borderColor: notificationsEnabled ? "#15803d" : "#fde68a",
                  }}
                >
                  <Bell size={15} />
                  {notificationsEnabled ? "Notifications Active ✓" : "Enable Notifications"}
                </button>
              </div>
            </div>
          </div>

          {/* DONOR BANNER */}
          <div className="request-donor-banner">
            <div className="request-donor-icon">
              <Gift size={28} />
            </div>
            <div>
              <h3>Be the Reason for a Brighter Tomorrow</h3>
              <p>While you wait, consider becoming a registered donor and help save lives.</p>
            </div>
            <button onClick={() => setIsDonorModalOpen(true)} style={{ cursor: "pointer" }}>
              Register as a Donor
            </button>
            <div className="request-heart-line">♡</div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="request-details-side">
          {/* SELECTED REQUEST */}
          {selectedRequest && (
            <div className="selected-request-card">
              <div className="selected-request-header">
                <div>
                  <FileText size={20} />
                  <h2>Selected Request Details</h2>
                </div>
                <span>{selectedRequest.id}</span>
              </div>

              <div className="request-detail-row">
                <span>Blood Group</span>
                <strong>{selectedRequest.bloodGroup}</strong>
              </div>

              <div className="request-detail-row">
                <span>Units Required</span>
                <strong>
                  {selectedRequest.units} Unit{selectedRequest.units > 1 ? "s" : ""}
                </strong>
              </div>

              <div className="request-detail-row">
                <span>Hospital</span>
                <strong>
                  {selectedRequest.hospital}, {selectedRequest.location}
                </strong>
              </div>

              <div className="request-detail-row">
                <span>Request Date</span>
                <strong>{selectedRequest.date}</strong>
              </div>

              <div className="request-detail-row">
                <span>Status</span>
                <strong>
                  <span
                    className="detail-status"
                    style={{
                      background:
                        selectedRequest.status === "Pending"
                          ? "#fef3c7"
                          : selectedRequest.status === "Approved"
                          ? "#ecfdf5"
                          : "#eff6ff",
                      color:
                        selectedRequest.status === "Pending"
                          ? "#b45309"
                          : selectedRequest.status === "Approved"
                          ? "#047857"
                          : "#1d4ed8",
                    }}
                  >
                    {selectedRequest.status}
                  </span>
                </strong>
              </div>

              <div className="request-detail-row">
                <span>Expected Availability</span>
                <strong>{selectedRequest.eta || "Pending confirmation"}</strong>
              </div>

              <div className="request-detail-row">
                <span>Notes</span>
                <strong>{selectedRequest.notes || "Urgent requirement for surgical patient."}</strong>
              </div>

              <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f3f4f6" }}>
                <button
                  onClick={() => setIsTrackingModalOpen(true)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Truck size={16} />
                  View in Action & Live Tracking
                </button>
              </div>
            </div>
          )}

          {/* REQUEST PROGRESS */}
          {selectedRequest && (
            <div className="request-progress-card">
              <div className="request-progress-title">
                <Users size={20} />
                <h2>Request Progress</h2>
              </div>

              <div className="progress-timeline">
                <div className="progress-step completed">
                  <div className="progress-dot">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Request Submitted</strong>
                    <span>{selectedRequest.date}, Verified</span>
                  </div>
                </div>

                <div
                  className={`progress-step ${
                    selectedRequest.status !== "Pending" ? "completed" : "current"
                  }`}
                >
                  <div className="progress-dot">
                    {selectedRequest.status !== "Pending" ? (
                      <CheckCircle2 size={18} />
                    ) : null}
                  </div>
                  <div>
                    <strong>AI Recommendation Completed</strong>
                    <span>
                      {selectedRequest.status === "Pending" ? "Processing matching..." : "Completed"}
                    </span>
                  </div>
                </div>

                <div
                  className={`progress-step ${
                    selectedRequest.status === "Approved" || selectedRequest.status === "In Progress" || selectedRequest.status === "Completed"
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="progress-dot">
                    {selectedRequest.status === "Approved" || selectedRequest.status === "In Progress" || selectedRequest.status === "Completed" ? (
                      <CheckCircle2 size={18} />
                    ) : null}
                  </div>
                  <div>
                    <strong>Hospital Confirmed</strong>
                    <span>{selectedRequest.hospital}</span>
                  </div>
                </div>

                <div
                  className={`progress-step ${
                    selectedRequest.status === "In Progress"
                      ? "current"
                      : selectedRequest.status === "Completed"
                      ? "completed"
                      : ""
                  }`}
                >
                  <div className="progress-dot">
                    {selectedRequest.status === "Completed" ? (
                      <CheckCircle2 size={18} />
                    ) : null}
                  </div>
                  <div>
                    <strong>Blood On The Way</strong>
                    <span>{selectedRequest.eta}</span>
                  </div>
                </div>

                <div
                  className={`progress-step ${
                    selectedRequest.status === "Completed" ? "completed" : ""
                  }`}
                >
                  <div className="progress-dot" />
                  <div>
                    <strong>Delivered & Fulfilled</strong>
                    <span>{selectedRequest.status === "Completed" ? "Completed" : "Waiting..."}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* NEW REQUEST MODAL */}
      {/* ============================================================== */}
      <BloodRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSubmit={handleNewRequestSubmit}
      />

      {/* ============================================================== */}
      {/* DONOR REGISTRATION MODAL */}
      {/* ============================================================== */}
      <DonorRegistrationModal
        isOpen={isDonorModalOpen}
        onClose={() => setIsDonorModalOpen(false)}
        onSubmit={handleDonorRegistered}
      />

      {/* ============================================================== */}
      {/* VIEW IN ACTION & LIVE TRACKING MODAL */}
      {/* ============================================================== */}
      {isTrackingModalOpen && selectedRequest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
          onClick={() => setIsTrackingModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Truck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                    Live Request Tracking — {selectedRequest.id}
                  </h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                    Active logistics chain & cold-chain compliance monitor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tracking Content */}
            <div style={{ padding: "24px" }}>
              {/* Cold-Chain Status Card */}
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "#dcfce7",
                      color: "#15803d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Thermometer size={20} />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "#166534", fontSize: "15px" }}>
                      Cold-Chain Status: Optimal
                    </strong>
                    <span style={{ fontSize: "13px", color: "#15803d" }}>
                      {selectedRequest.temperature || "Temperature constant at +4.0°C"}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    background: "#166534",
                    color: "#ffffff",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  COMPLIANT
                </div>
              </div>

              {/* Transit Parameters */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Blood Product</span>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                    {selectedRequest.bloodGroup} Whole Blood ({selectedRequest.units} Unit)
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Destination Facility</span>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
                    {selectedRequest.hospital}
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Dispatch Logistics</span>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>
                    Ambulance Vehicle TN-45-BC-108
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Estimated Handover</span>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#dc2626" }}>
                    {selectedRequest.eta}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  fontSize: "14px",
                  color: "#92400e",
                }}
              >
                <strong>Clinical Notes:</strong> {selectedRequest.notes}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
              }}
            >
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                Live GPS Sync: Active & Broadcasting
              </span>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EMERGENCY SUPPORT MODAL */}
      {/* ============================================================== */}
      {isSupportModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
          onClick={() => setIsSupportModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={22} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                  Emergency Blood Transfusion Hotline
                </h3>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.5", margin: "0 0 16px" }}>
                For high-priority cases, direct dispatch coordinators can expedite inter-hospital transfers
                and alert registered whole-blood emergency donors.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                      TN State Blood Transfusion Helpline
                    </strong>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>24/7 Central Emergency Desk</span>
                  </div>
                  <a
                    href="tel:18004251333"
                    style={{
                      background: "#dc2626",
                      color: "#ffffff",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "700",
                      textDecoration: "none",
                    }}
                  >
                    1800-425-1333
                  </a>
                </div>

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                      Emergency Ambulance Dispatch
                    </strong>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      Inter-District Cold Transport
                    </span>
                  </div>
                  <a
                    href="tel:108"
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "700",
                      textDecoration: "none",
                    }}
                  >
                    Call 108
                  </a>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "flex-end",
                background: "#f8fafc",
              }}
            >
              <button
                onClick={() => setIsSupportModalOpen(false)}
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyRequests;
