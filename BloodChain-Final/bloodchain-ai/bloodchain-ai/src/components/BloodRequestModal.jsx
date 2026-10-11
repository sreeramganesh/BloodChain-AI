import { useState } from "react";
import { X, Send, AlertCircle, Building2, Droplets, Calendar, User, FileText } from "lucide-react";
import { STATES_LIST, getDistrictsForState } from "../constants/locationData";
import EstimatedCostCard from "./EstimatedCostCard";

export default function BloodRequestModal({ isOpen, onClose, onSuccess, defaultDistrict = "Tiruchirappalli", defaultState = "Tamil Nadu" }) {
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [units, setUnits] = useState("2");
  const [hospital, setHospital] = useState("");
  const [state, setState] = useState(defaultState);
  const [district, setDistrict] = useState(defaultDistrict);
  const [urgency, setUrgency] = useState("Critical");
  const [requestType, setRequestType] = useState("Hospital");
  const [requiredDate, setRequiredDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  });
  const [reason, setReason] = useState("");
  const [contactPhone, setContactPhone] = useState("+91 ");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const districts = getDistrictsForState(state);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!patientName.trim()) {
      setError("Please enter the patient or requesting authority name.");
      return;
    }
    if (!bloodGroup) {
      setError("Please select a blood group.");
      return;
    }
    const numUnits = parseInt(units, 10);
    if (isNaN(numUnits) || numUnits <= 0) {
      setError("Please enter a valid number of units (minimum 1).");
      return;
    }
    if (!hospital.trim()) {
      setError("Please enter the hospital or medical facility name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newRequest = {
        id: `REQ-${Date.now().toString().slice(-4)}`,
        patient: patientName.trim(),
        group: bloodGroup,
        units: `${numUnits} Unit${numUnits > 1 ? "s" : ""}`,
        hospital: hospital.trim(),
        district: district || defaultDistrict,
        state: state || defaultState,
        type: requestType,
        urgency: urgency,
        status: "Pending",
        time: "Just now",
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        requiredDate,
        reason: reason.trim() || "Emergency clinical requirement",
        contactPhone: contactPhone.trim(),
      };

      if (onSuccess) {
        await onSuccess(newRequest);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "580px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
            color: "#ffffff",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Droplets size={24} />
            <div>
              <h2 style={{ margin: 0, fontSize: "19px", fontWeight: "700", color: "#ffffff" }}>
                New Blood Request
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#fecaca" }}>
                Broadcast emergency request across verified regional blood banks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "#ffffff",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Patient / Case Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar / OT-2"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Request Type
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  background: "#fff",
                  boxSizing: "border-box",
                }}
              >
                <option value="Hospital">Hospital Emergency</option>
                <option value="Patient">Direct Patient Request</option>
                <option value="Blood Bank">Inter-Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Blood Group and Units Needed */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Blood Group *
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  background: "#fff",
                  boxSizing: "border-box",
                }}
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Units Needed *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
          </div>

          {/* Dynamic Estimated Blood Component Cost Card */}
          <EstimatedCostCard
            bloodGroup={bloodGroup}
            units={units}
            state={state}
            district={district}
          />

          {/* Urgency Level */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Urgency Level *
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                background: "#fff",
                boxSizing: "border-box",
              }}
            >
              <option value="Critical">Critical (&lt; 6 hrs)</option>
              <option value="Urgent">Urgent (&lt; 24 hrs)</option>
              <option value="Moderate">Moderate (2-3 days)</option>
              <option value="Routine">Routine (Planned)</option>
            </select>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Hospital / Medical Center *
            </label>
            <input
              type="text"
              placeholder="e.g. Trichy Government Hospital"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                State
              </label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  const dists = getDistrictsForState(e.target.value);
                  if (dists.length > 0) setDistrict(dists[0]);
                }}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  background: "#fff",
                  boxSizing: "border-box",
                }}
              >
                {STATES_LIST.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  background: "#fff",
                  boxSizing: "border-box",
                }}
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Required By Date
              </label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Clinical Reason / Notes
            </label>
            <textarea
              placeholder="e.g., Surgery scheduled tomorrow at 9 AM; severe blood loss."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "15px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#4b5563",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "9px 22px",
                borderRadius: "8px",
                border: "none",
                background: "#dc2626",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <Send size={16} />
              {isSubmitting ? "Submitting..." : "Submit Blood Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
