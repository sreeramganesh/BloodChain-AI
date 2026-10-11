import { useState } from "react";
import {
  Heart,
  CalendarDays,
  Users,
  ShieldCheck,
  FileText,
  ArrowRight,
  Trophy,
  Share2,
  Download,
  Droplets,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Award,
  Printer,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const INITIAL_DONATIONS = [
  {
    id: "DON-2026-01",
    date: "12 Mar 2026",
    bloodGroup: "O+",
    hospital: "Trichy Government Hospital",
    location: "Trichy",
    units: "1 Unit",
    status: "Completed",
    certId: "BC-CERT-8841-TN",
  },
  {
    id: "DON-2025-02",
    date: "18 Nov 2025",
    bloodGroup: "O+",
    hospital: "SRM Hospital",
    location: "Kattankulathur",
    units: "1 Unit",
    status: "Completed",
    certId: "BC-CERT-7612-TN",
  },
  {
    id: "DON-2024-03",
    date: "22 Aug 2024",
    bloodGroup: "O+",
    hospital: "Apollo Hospital",
    location: "Trichy",
    units: "1 Unit",
    status: "Completed",
    certId: "BC-CERT-5409-TN",
  },
  {
    id: "DON-2024-04",
    date: "10 Jan 2024",
    bloodGroup: "O+",
    hospital: "Cauvery Hospital",
    location: "Trichy",
    units: "1 Unit",
    status: "Completed",
    certId: "BC-CERT-4190-TN",
  },
];

const AVAILABLE_HOSPITALS = [
  { name: "Trichy Government Hospital", location: "Trichy" },
  { name: "SRM Hospital & Research Centre", location: "Kattankulathur" },
  { name: "Apollo Speciality Hospital", location: "Trichy" },
  { name: "Cauvery Heart City Hospital", location: "Trichy" },
  { name: "MGM Healthcare", location: "Chennai" },
  { name: "Rajiv Gandhi Government General Hospital", location: "Chennai" },
  { name: "Christian Medical College & Hospital", location: "Vellore" },
  { name: "Madurai Rajaji Government Hospital", location: "Madurai" },
  { name: "Coimbatore Medical College Hospital", location: "Coimbatore" },
];

function MyDonations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState(() => {
    try {
      const saved = localStorage.getItem("bloodchain_my_donations");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not load donations from localStorage:", e);
    }
    return INITIAL_DONATIONS;
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "10:00 AM - 12:00 PM",
    hospital: "Trichy Government Hospital",
    bloodGroup: "O+",
    units: "1 Unit (350ml)",
    notes: "",
    healthConfirmed: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotification = (message) => {
    setActionNotice(message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleOpenScheduleModal = () => {
    // Today's date in YYYY-MM-DD format as default
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      date: today,
      timeSlot: "10:00 AM - 12:00 PM",
      hospital: "Trichy Government Hospital",
      bloodGroup: user?.bloodGroup || "O+",
      units: "1 Unit (350ml)",
      notes: "",
      healthConfirmed: false,
    });
    setFormErrors({});
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.date) {
      errors.date = "Please select a donation date";
    } else {
      const selected = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.date = "Donation date cannot be in the past";
      }
    }

    if (!formData.hospital) {
      errors.hospital = "Please select a hospital or blood bank";
    }

    if (!formData.bloodGroup) {
      errors.bloodGroup = "Please select your blood group";
    }

    if (!formData.healthConfirmed) {
      errors.healthConfirmed = "Please confirm donor health & eligibility criteria";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const selectedHospObj = AVAILABLE_HOSPITALS.find((h) => h.name === formData.hospital) || {
        location: "Tamil Nadu",
      };

      // Format date for display
      const formattedDate = new Date(formData.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const newAppointment = {
        id: `DON-${Date.now().toString().slice(-4)}`,
        date: `${formattedDate} (${formData.timeSlot.split(" - ")[0]})`,
        bloodGroup: formData.bloodGroup,
        hospital: formData.hospital,
        location: selectedHospObj.location,
        units: "1 Unit",
        status: "Scheduled",
        certId: `BC-SCHED-${Date.now().toString().slice(-4)}`,
      };

      const updated = [newAppointment, ...donations];
      setDonations(updated);
      try {
        localStorage.setItem("bloodchain_my_donations", JSON.stringify(updated));
      } catch (err) {
        console.warn("Storage error", err);
      }

      setIsSubmitting(false);
      setIsScheduleModalOpen(false);
      showNotification(
        `Donation appointment scheduled at ${formData.hospital} for ${formattedDate} (${formData.timeSlot})!`
      );
    }, 500);
  };

  const handleViewCertificate = (donation) => {
    setSelectedCertificate({
      donorName: user?.name || "Keerthiga Subramanian",
      bloodGroup: donation.bloodGroup,
      hospital: donation.hospital,
      location: donation.location,
      date: donation.date,
      certId: donation.certId || `BC-CERT-${Math.floor(1000 + Math.random() * 9000)}-TN`,
      units: donation.units || "1 Unit (350ml)",
    });
  };

  const handleShareJourney = () => {
    const shareText = `I've completed ${donations.filter((d) => d.status === "Completed").length} blood donations on BloodChain AI, potentially saving over ${donations.filter((d) => d.status === "Completed").length * 3} lives! Join the mission at https://bloodchain-ai.org`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showNotification("Donor journey story & link copied to clipboard!");
    } else {
      showNotification("Journey shared! Keep inspiring others to save lives.");
    }
  };

  const completedDonationsCount = donations.filter((d) => d.status === "Completed").length;
  const livesSavedEstimate = completedDonationsCount * 3;

  return (
    <div className="donations-page">
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

      {/* HEADER */}
      <div className="donations-header">
        <div className="donations-title-area">
          <div className="donations-title-icon">
            <Heart size={30} fill="currentColor" />
          </div>

          <div>
            <div className="donations-eyebrow">BLOOD DONATION</div>
            <h1>My Donations</h1>
            <p>Track your blood donation history and make a bigger impact.</p>
          </div>
        </div>

        <div className="donations-header-quote">
          <em>
            "A single donation
            <br />
            can save up to three lives."
          </em>

          <button onClick={handleOpenScheduleModal} style={{ cursor: "pointer" }}>
            <span>+</span>
            Schedule New Donation
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="donation-stats">
        <div className="donation-stat-card red">
          <div className="donation-stat-icon">
            <Droplets size={30} />
          </div>
          <div>
            <span>Total Donations</span>
            <strong>{completedDonationsCount}</strong>
            <small>Thank you for your support!</small>
          </div>
        </div>

        <div className="donation-stat-card blue">
          <div className="donation-stat-icon">
            <CalendarDays size={30} />
          </div>
          <div>
            <span>Last Donation</span>
            <strong>{donations[0]?.date || "12 Mar 2026"}</strong>
            <small>{donations[0]?.hospital || "Trichy Government Hospital"}</small>
          </div>
        </div>

        <div className="donation-stat-card pink">
          <div className="donation-stat-icon">
            <Users size={30} />
          </div>
          <div>
            <span>Lives Potentially Saved</span>
            <strong>{livesSavedEstimate}</strong>
            <small>Each donation can save up to 3 lives</small>
          </div>
        </div>

        <div className="donation-stat-card green">
          <div className="donation-stat-icon">
            <ShieldCheck size={30} />
          </div>
          <div>
            <span>Eligibility Status</span>
            <strong>Eligible to Donate</strong>
            <small>You can schedule a slot anytime</small>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="donations-main-grid">
        {/* DONATION HISTORY */}
        <div className="donation-history-card">
          <div className="donation-card-header">
            <div className="donation-section-title">
              <Users size={22} />
              <div>
                <h2>Donation History</h2>
                <p>Your previous blood donations and scheduled appointments</p>
              </div>
            </div>
          </div>

          <div className="donation-table-wrapper">
            <table className="donation-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Donation Date</th>
                  <th>Blood Group</th>
                  <th>Hospital / Blood Bank</th>
                  <th>Location</th>
                  <th>Units</th>
                  <th>Certificate</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {donations.map((donation, index) => (
                  <tr key={donation.id || index}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={14} color="#6b7280" />
                        <strong>{donation.date}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="donation-blood-group">{donation.bloodGroup}</span>
                    </td>
                    <td>
                      <strong>{donation.hospital}</strong>
                    </td>
                    <td>{donation.location}</td>
                    <td>{donation.units}</td>
                    <td>
                      <button
                        className="certificate-button"
                        onClick={() => handleViewCertificate(donation)}
                        style={{ cursor: "pointer" }}
                      >
                        <FileText size={14} />
                        View
                      </button>
                    </td>
                    <td>
                      <span
                        className="donation-status"
                        style={{
                          background:
                            donation.status === "Scheduled"
                              ? "#eff6ff"
                              : donation.status === "Completed"
                              ? "#ecfdf5"
                              : "#fef3c7",
                          color:
                            donation.status === "Scheduled"
                              ? "#1d4ed8"
                              : donation.status === "Completed"
                              ? "#047857"
                              : "#b45309",
                          border: `1px solid ${
                            donation.status === "Scheduled"
                              ? "#bfdbfe"
                              : donation.status === "Completed"
                              ? "#a7f3d0"
                              : "#fde68a"
                          }`,
                        }}
                      >
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="donations-side">
          {/* NEXT ELIGIBLE */}
          <div className="eligible-card">
            <div className="side-card-title">
              <CalendarDays size={23} />
              <h2>Next Eligible Date</h2>
            </div>
            <strong className="eligible-date">15 Jun 2026</strong>
            <p>You can donate again after 3 months from your last whole blood donation.</p>
          </div>

          {/* DONATE AGAIN */}
          <div className="donate-again-card">
            <div className="donate-again-icon">
              <Droplets size={28} />
            </div>
            <h2>Want to Donate Again?</h2>
            <p>Your next donation can make a huge difference in an emergency.</p>
            <button onClick={handleOpenScheduleModal} style={{ cursor: "pointer" }}>
              <CalendarDays size={16} />
              Schedule Donation
            </button>
          </div>

          {/* SHARE */}
          <div className="share-goodness-card">
            <div className="share-icon">
              <Share2 size={26} />
            </div>
            <h2>Share the Goodness</h2>
            <p>Inspire others to donate and be a community hero too!</p>
            <button onClick={handleShareJourney} style={{ cursor: "pointer" }}>
              <Share2 size={16} />
              Share My Journey
            </button>
          </div>

          {/* CERTIFICATE */}
          <div className="certificate-card">
            <div className="certificate-icon">
              <Download size={25} />
            </div>
            <h2>Download Certificate</h2>
            <p>Get your official donation certificates for your records.</p>
            <button
              onClick={() => handleViewCertificate(donations[0])}
              style={{ cursor: "pointer" }}
            >
              <Download size={16} />
              View All Certificates
            </button>
          </div>
        </div>
      </div>

      {/* LIFE SAVER BANNER */}
      <div className="life-saver-banner">
        <div className="life-saver-icon">
          <Trophy size={32} />
        </div>
        <div>
          <h2>You're a Life Saver!</h2>
          <p>
            Your consistent donations help ensure that hospitals always have blood when it's needed
            most. Thank you for being an indispensable pillar of BloodChain AI.
          </p>
        </div>
        <div className="thank-you">
          <strong>Thank You ♡</strong>
          <span>Donors like you make the world healthier!</span>
        </div>
      </div>

      {/* DONATION IMPACT */}
      <div className="donation-impact-card">
        <div className="impact-header">
          <div className="impact-icon">
            <ArrowRight size={20} />
          </div>
          <h2>Donation Impact</h2>
        </div>

        <div className="impact-grid">
          <div className="impact-item">
            <Droplets size={25} />
            <div>
              <strong>{completedDonationsCount}</strong>
              <span>Donations Made</span>
            </div>
          </div>

          <div className="impact-item">
            <Users size={25} />
            <div>
              <strong>{livesSavedEstimate}</strong>
              <span>Lives Potentially Saved</span>
            </div>
          </div>

          <div className="impact-item green-impact">
            <Users size={25} />
            <div>
              <strong>400+</strong>
              <span>People Reached through your support</span>
            </div>
          </div>

          <div className="impact-message">
            <Heart size={28} fill="currentColor" />
            <strong>
              A Healthier
              <br />
              Tomorrow
              <br />
              Because of You
            </strong>
          </div>
        </div>

        <div className="donation-quote">"Not all heroes wear capes. Some donate blood."</div>
      </div>

      {/* ============================================================== */}
      {/* SCHEDULE NEW DONATION MODAL */}
      {/* ============================================================== */}
      {isScheduleModalOpen && (
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
          onClick={handleCloseScheduleModal}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarDays size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>
                    Schedule Blood Donation
                  </h2>
                  <p style={{ fontSize: "14px", color: "#6b7280", margin: "2px 0 0" }}>
                    Select a hospital, date, and preferred time slot
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseScheduleModal}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  padding: "4px",
                  borderRadius: "6px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleScheduleSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Date & Time Slot */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Donation Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: formErrors.date ? "1px solid #ef4444" : "1px solid #d1d5db",
                        fontSize: "15px",
                        boxSizing: "border-box",
                      }}
                    />
                    {formErrors.date && (
                      <span style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", display: "block" }}>
                        {formErrors.date}
                      </span>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Preferred Slot *
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => handleInputChange("timeSlot", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        background: "#ffffff",
                        boxSizing: "border-box",
                      }}
                    >
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                      <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Hospital / Blood Bank */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: "6px",
                    }}
                  >
                    Hospital / Blood Bank *
                  </label>
                  <select
                    value={formData.hospital}
                    onChange={(e) => handleInputChange("hospital", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: formErrors.hospital ? "1px solid #ef4444" : "1px solid #d1d5db",
                      fontSize: "15px",
                      background: "#ffffff",
                      boxSizing: "border-box",
                    }}
                  >
                    {AVAILABLE_HOSPITALS.map((hosp) => (
                      <option key={hosp.name} value={hosp.name}>
                        {hosp.name} ({hosp.location})
                      </option>
                    ))}
                  </select>
                  {formErrors.hospital && (
                    <span style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", display: "block" }}>
                      {formErrors.hospital}
                    </span>
                  )}
                </div>

                {/* Blood Group & Units */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Blood Group *
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        background: "#ffffff",
                        boxSizing: "border-box",
                      }}
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      Units
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.units}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                        fontSize: "15px",
                        color: "#4b5563",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Donor Health Confirmation */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: formErrors.healthConfirmed ? "1px solid #ef4444" : "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "12px 14px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#334155",
                      lineHeight: "1.4",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.healthConfirmed}
                      onChange={(e) => handleInputChange("healthConfirmed", e.target.checked)}
                      style={{ marginTop: "3px", width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <span>
                      I declare that I am feeling well, rested, above 18 years old, and have not had a
                      tattoo or major surgery in the last 6 months.
                    </span>
                  </label>
                  {formErrors.healthConfirmed && (
                    <span style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px", display: "block" }}>
                      {formErrors.healthConfirmed}
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseScheduleModal}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 22px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Confirming Slot..." : "Confirm Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CERTIFICATE MODAL */}
      {/* ============================================================== */}
      {selectedCertificate && (
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
          onClick={() => setSelectedCertificate(null)}
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
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={20} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111827" }}>
                  Official Donation Certificate
                </h3>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Certificate Body (Styled like an official certificate) */}
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                border: "8px double #e2e8f0",
                margin: "16px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
              }}
            >
              <div style={{ marginBottom: "16px" }}>
                <Heart size={44} fill="#dc2626" color="#dc2626" style={{ margin: "0 auto 8px" }} />
                <span
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    fontSize: "12px",
                    fontWeight: "800",
                    color: "#dc2626",
                    display: "block",
                  }}
                >
                  BloodChain AI Logistics & Care Network
                </span>
                <h2
                  style={{
                    fontFamily: "serif",
                    fontSize: "26px",
                    fontWeight: "800",
                    color: "#1e293b",
                    margin: "6px 0 2px",
                  }}
                >
                  Certificate of Appreciation
                </h2>
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                  This acknowledges with profound gratitude
                </p>
              </div>

              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#0f172a",
                  borderBottom: "2px solid #cbd5e1",
                  paddingBottom: "6px",
                  margin: "12px auto 16px",
                  maxWidth: "340px",
                }}
              >
                {selectedCertificate.donorName}
              </div>

              <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.6", margin: "0 0 20px" }}>
                for donating <strong>{selectedCertificate.units}</strong> of blood group{" "}
                <span
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontWeight: "700",
                  }}
                >
                  {selectedCertificate.bloodGroup}
                </span>{" "}
                at <strong>{selectedCertificate.hospital}</strong> ({selectedCertificate.location}) on{" "}
                <strong>{selectedCertificate.date}</strong>. Your selfless gift helps preserve human lives.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "16px",
                  borderTop: "1px solid #e2e8f0",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div>Verification ID:</div>
                  <strong style={{ color: "#1e293b" }}>{selectedCertificate.certId}</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>Certified via:</div>
                  <strong style={{ color: "#059669" }}>✓ Verified Chain Record</strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                style={{
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "9px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <Printer size={15} />
                Print
              </button>
              <button
                type="button"
                onClick={() => {
                  showNotification(`Certificate ${selectedCertificate.certId} downloaded successfully!`);
                  setSelectedCertificate(null);
                }}
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 18px",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <Download size={15} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyDonations;
