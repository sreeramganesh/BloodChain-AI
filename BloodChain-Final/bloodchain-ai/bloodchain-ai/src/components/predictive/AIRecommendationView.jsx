import { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Info,
  X,
  FileText,
  CheckCircle,
  XCircle,
  Send,
  AlertTriangle,
  Navigation,
} from "lucide-react";
import LeafletMapView from "../maps/LeafletMapView";
import { useAuth } from "../../context/AuthContext";
import {
  getAIRecommendations,
  reviewAIRecommendation,
} from "../../services/predictiveService";
import {
  createTransfer,
  updateBloodRequestStatus,
} from "../../services/bloodService";
import { createNotification } from "../../services/notificationService";
import { getRoute } from "../../services/routesService";
import { VERIFIED_COORDINATES } from "../../services/facilityService";

export default function AIRecommendationView() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedPriority, setSelectedPriority] = useState("All");

  // Review Modal State
  const [selectedRecForReview, setSelectedRecForReview] = useState(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState(null);

  // Handle escape key to cancel rejection confirmation modal
  useEffect(() => {
    if (!showRejectConfirm) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowRejectConfirm(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showRejectConfirm]);

  // GPS Route Map Modal State
  const [selectedRecForMap, setSelectedRecForMap] = useState(null);
  const [mapRoute, setMapRoute] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Helper to resolve facility coordinates safely
  const resolveFacilityCoords = (facilityName) => {
    if (!facilityName) return null;
    const trichyMap = VERIFIED_COORDINATES["Tiruchirappalli"] || VERIFIED_COORDINATES["Trichy"] || {};
    if (trichyMap[facilityName]) return trichyMap[facilityName];
    const lower = facilityName.toLowerCase();
    for (const [key, val] of Object.entries(trichyMap)) {
      if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
        return val;
      }
    }
    if (lower.includes("mgm")) return { lat: 10.8041, lng: 78.6853, type: "Government Hospital" };
    if (lower.includes("apollo")) return { lat: 10.8354, lng: 78.6948, type: "Hospital" };
    if (lower.includes("kauvery")) return { lat: 10.8062, lng: 78.6865, type: "Hospital" };
    if (lower.includes("srm")) return { lat: 10.9234, lng: 78.7391, type: "Hospital" };
    if (lower.includes("trichy") || lower.includes("blood bank")) return { lat: 10.8035, lng: 78.6872, type: "Blood Bank" };
    if (lower.includes("srirangam")) return { lat: 10.8622, lng: 78.6983, type: "PHC" };
    return { lat: 10.8041, lng: 78.6853 };
  };

  const handleOpenMap = async (rec) => {
    setSelectedRecForMap(rec);
    setLoadingRoute(true);
    const srcCoords = resolveFacilityCoords(rec.source_facility);
    const destCoords = resolveFacilityCoords(rec.dest_facility);

    if (srcCoords && destCoords) {
      try {
        const routeRes = await getRoute(
          { lat: srcCoords.lat, lng: srcCoords.lng },
          { lat: destCoords.lat, lng: destCoords.lng }
        );
        if (routeRes && routeRes.status === "success") {
          setMapRoute({
            origin: { latitude: srcCoords.lat, longitude: srcCoords.lng },
            originName: rec.source_facility,
            destination: { latitude: destCoords.lat, longitude: destCoords.lng },
            coordinates: routeRes.coordinates || [],
            encodedPolyline: routeRes.encodedPolyline || null,
            roadDistanceKm: routeRes.distanceKm,
            roadDistanceDisplay: routeRes.distanceDisplay,
            durationMinutes: routeRes.durationMinutes,
            durationText: routeRes.durationText,
          });
        } else {
          setMapRoute({
            origin: { latitude: srcCoords.lat, longitude: srcCoords.lng },
            originName: rec.source_facility,
            destination: { latitude: destCoords.lat, longitude: destCoords.lng },
            coordinates: [
              { lat: srcCoords.lat, lng: srcCoords.lng },
              { lat: destCoords.lat, lng: destCoords.lng },
            ],
            roadDistanceKm: rec.straight_line_distance_km,
            roadDistanceDisplay: `${rec.straight_line_distance_km} km (Straight-line)`,
            durationMinutes: rec.estimated_transport_minutes,
            durationText: `${rec.estimated_transport_minutes} min est.`,
          });
        }
      } catch (e) {
        setMapRoute({
          origin: { latitude: srcCoords.lat, longitude: srcCoords.lng },
          originName: rec.source_facility,
          destination: { latitude: destCoords.lat, longitude: destCoords.lng },
          coordinates: [
            { lat: srcCoords.lat, lng: srcCoords.lng },
            { lat: destCoords.lat, lng: destCoords.lng },
          ],
          roadDistanceKm: rec.straight_line_distance_km,
          roadDistanceDisplay: `${rec.straight_line_distance_km} km`,
          durationMinutes: rec.estimated_transport_minutes,
          durationText: `${rec.estimated_transport_minutes} min est.`,
        });
      }
    }
    setLoadingRoute(false);
  };

  const handleCloseMap = () => {
    setSelectedRecForMap(null);
    setMapRoute(null);
  };

  const mapMarkers = useMemo(() => {
    if (!selectedRecForMap) return [];
    const src = resolveFacilityCoords(selectedRecForMap.source_facility);
    const dst = resolveFacilityCoords(selectedRecForMap.dest_facility);
    const list = [];
    if (src) {
      list.push({
        id: "src-" + selectedRecForMap.id,
        name: selectedRecForMap.source_facility,
        type: src.type || "Blood Bank",
        facility_type: src.type || "Blood Bank",
        latitude: src.lat,
        longitude: src.lng,
        distanceDisplay: `${selectedRecForMap.straight_line_distance_km} km`,
      });
    }
    if (dst) {
      list.push({
        id: "dst-" + selectedRecForMap.id,
        name: selectedRecForMap.dest_facility,
        type: dst.type || "Hospital",
        facility_type: dst.type || "Hospital",
        latitude: dst.lat,
        longitude: dst.lng,
        distanceDisplay: "Destination",
      });
    }
    return list;
  }, [selectedRecForMap]);

  // Role Awareness (Part 12)
  const userRole = (user?.role || "").toLowerCase();
  const isDonor = userRole.includes("donor");
  const isOperational = !isDonor;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAIRecommendations();
      setRecommendations(data || []);
    } catch (err) {
      console.error("Failed to load AI recommendations:", err);
      setError("Unable to load predictive recommendations at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const priorities = ["All", "Critical", "High", "Medium", "Low"];

  const filteredData = useMemo(() => {
    return recommendations.filter((r) => {
      return selectedPriority === "All" || r.priority === selectedPriority;
    });
  }, [recommendations, selectedPriority]);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Critical":
        return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
      case "High":
        return { background: "#ffedd5", color: "#9a3412", border: "1px solid #fed7aa" };
      case "Medium":
        return { background: "#fef9c3", color: "#854d0e", border: "1px solid #fef08a" };
      case "Low":
      default:
        return { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return { background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", label: "Accepted / Transfer Created" };
      case "Rejected":
        return { background: "#f3f4f6", color: "#4b5563", border: "1px solid #d1d5db", label: "Rejected" };
      case "Completed":
        return { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", label: "Completed" };
      case "Pending":
      default:
        return { background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", label: "Pending Review" };
    }
  };

  // Open review modal
  const handleOpenReview = (rec) => {
    setShowRejectConfirm(false);
    setSelectedRecForReview(rec);
    setReviewNotes("");
    setActionError(null);
  };

  // Close review modal
  const handleCloseReview = () => {
    if (submitting) return;
    setShowRejectConfirm(false);
    setSelectedRecForReview(null);
    setReviewNotes("");
    setActionError(null);
  };

  // Accept recommendation & create transfer (Part 3)
  const handleAccept = async () => {
    if (!selectedRecForReview) return;
    if (selectedRecForReview.status !== "Pending") {
      setActionError("This recommendation is no longer pending and cannot be accepted again.");
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      // Step 1: Create Transfer record in public.transfers
      const transferPayload = {
        blood_group: selectedRecForReview.blood_group,
        units: selectedRecForReview.recommended_units,
        from_location: selectedRecForReview.source_facility,
        to_location: selectedRecForReview.dest_facility,
        status: "Approved",
        reason: `${selectedRecForReview.reason || "AI Advisory Allocation"}${
          reviewNotes.trim() ? ` | Reviewer Notes: ${reviewNotes.trim()}` : ""
        }`,
        requested_by: user?.name || "Hospital Clinical Officer",
      };

      const transferRes = await createTransfer(transferPayload);
      if (!transferRes.success) {
        setActionError(transferRes.error || "Failed to create transfer record in database.");
        setSubmitting(false);
        return;
      }

      const createdTransferId = transferRes.data?.id;

      // Phase 8: Emit Notification for Transfer Creation
      if (createdTransferId) {
        await createNotification({
          event_key: `transfer_created:${createdTransferId}`,
          role: "Hospital Admin",
          type: "transfer_created",
          title: "New Blood Transfer Created",
          message: `Transfer ${createdTransferId} for ${selectedRecForReview.recommended_units} units of ${selectedRecForReview.blood_group} created: ${selectedRecForReview.source_facility} -> ${selectedRecForReview.dest_facility}.`,
          related_request_id: selectedRecForReview.request_id,
          related_recommendation_id: selectedRecForReview.id,
          related_transfer_id: createdTransferId,
          priority: "High",
        });
      }

      // Step 2: Record human decision in public.ai_recommendations
      const recRes = await reviewAIRecommendation(
        selectedRecForReview.id,
        "Accepted",
        reviewNotes.trim(),
        user?.id
      );

      if (!recRes.success) {
        console.warn("Transfer created but recommendation status update failed:", recRes.error);
      } else {
        // Phase 8: Emit Notification for Recommendation Accepted
        await createNotification({
          event_key: `recommendation_accepted:${selectedRecForReview.id}`,
          role: "Hospital Admin",
          type: "recommendation_accepted",
          title: "AI Recommendation Accepted",
          message: `Allocation for Request ${selectedRecForReview.request_id || "Emergency"} (${selectedRecForReview.blood_group}, ${selectedRecForReview.recommended_units} units) authorized for dispatch with Transfer ${createdTransferId || ""}.`,
          related_request_id: selectedRecForReview.request_id,
          related_recommendation_id: selectedRecForReview.id,
          related_transfer_id: createdTransferId,
          priority: "Critical",
        });
      }

      // Step 3: Update associated blood request status if applicable (Part 7)
      if (selectedRecForReview.request_id) {
        await updateBloodRequestStatus(selectedRecForReview.request_id, "In Progress");

        // Phase 8: Emit Notification for Request Status Changed
        await createNotification({
          event_key: `request_status_changed:${selectedRecForReview.request_id}:In Progress`,
          role: "Hospital Admin",
          type: "request_status_changed",
          title: "Blood Request Status Updated",
          message: `Blood Request ${selectedRecForReview.request_id} has moved from 'Pending' to 'In Progress'.`,
          related_request_id: selectedRecForReview.request_id,
          related_recommendation_id: selectedRecForReview.id,
          related_transfer_id: createdTransferId,
          priority: "Medium",
        });
      }

      // Step 4: Success state
      setActionSuccessNotice(
        `Transfer ${createdTransferId || ""} created and recommendation authorized successfully!`
      );
      setTimeout(() => setActionSuccessNotice(null), 5000);
      setSelectedRecForReview(null);
      setReviewNotes("");
      await loadData();
    } catch (err) {
      console.error("Accept recommendation error:", err);
      setActionError("An unexpected error occurred while authorizing the transfer.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open rejection confirmation modal (replaces native browser confirm)
  const handleOpenRejectConfirm = () => {
    if (!selectedRecForReview) return;
    if (selectedRecForReview.status !== "Pending") {
      setActionError("This recommendation is no longer pending.");
      return;
    }
    setShowRejectConfirm(true);
  };

  // Cancel rejection confirmation modal (preserves Layer 1 review notes)
  const handleCancelRejectConfirm = () => {
    setShowRejectConfirm(false);
  };

  // Reject recommendation (Part 4) - executes when confirmed in custom modal
  const handleConfirmReject = async () => {
    if (!selectedRecForReview) return;
    if (selectedRecForReview.status !== "Pending") {
      setActionError("This recommendation is no longer pending.");
      setShowRejectConfirm(false);
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      const recRes = await reviewAIRecommendation(
        selectedRecForReview.id,
        "Rejected",
        reviewNotes.trim(),
        user?.id
      );

      if (!recRes.success) {
        setActionError(recRes.error || "Failed to record rejection decision.");
        setShowRejectConfirm(false);
        setSubmitting(false);
        return;
      }

      // Phase 8: Emit Notification for Recommendation Rejected
      await createNotification({
        event_key: `recommendation_rejected:${selectedRecForReview.id}`,
        role: "Hospital Admin",
        type: "recommendation_rejected",
        title: "AI Recommendation Rejected",
        message: `Recommendation for ${selectedRecForReview.blood_group} (${selectedRecForReview.request_id || "Emergency"}) was rejected by reviewer: ${reviewNotes.trim() || "No notes provided"}.`,
        related_request_id: selectedRecForReview.request_id,
        related_recommendation_id: selectedRecForReview.id,
        priority: "Medium",
      });

      setShowRejectConfirm(false);
      setActionSuccessNotice("Recommendation has been rejected. No transfer created.");
      setTimeout(() => setActionSuccessNotice(null), 5000);
      setSelectedRecForReview(null);
      setReviewNotes("");
      await loadData();
    } catch (err) {
      console.error("Reject recommendation error:", err);
      setActionError("An unexpected error occurred while rejecting the recommendation.");
      setShowRejectConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "#fef3c7", padding: "8px", borderRadius: "10px", color: "#d97706" }}>
              <Sparkles size={20} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>
              AI Clinical Recommendation Engine
            </h2>
          </div>
          <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "4px", marginBottom: 0 }}>
            Automated multi-factor advisory routing matching shortage urgency, straight-line distance & inventory buffers
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            background: "#f9fafb",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#374151",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Advisory Banner (Strict Clinical Human Oversight Requirement) */}
      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Info size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: "14px", color: "#1e40af", lineHeight: "1.5" }}>
          <strong>Clinical Advisory Mode:</strong> Recommendations are calculated for decision-support purposes only. Transshipments, dispatching, and inventory adjustments require human medical officer review and authorization.
        </span>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessNotice && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#166534",
            fontSize: "15px",
          }}
        >
          <CheckCircle size={18} color="#16a34a" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", alignItems: "center" }}>
        <span style={{ fontSize: "15px", color: "#6b7280", fontWeight: 600 }}>Filter by Priority:</span>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", color: "#374151", background: "#ffffff" }}
        >
          {priorities.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b7280" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "8px", color: "#d97706" }} />
          <p style={{ margin: 0, fontSize: "15px" }}>Loading verified advisory recommendations...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px", display: "flex", alignItems: "center", gap: "10px", color: "#991b1b" }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: "14px" }}>{error}</span>
        </div>
      )}

      {!loading && !error && filteredData.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 20px", color: "#9ca3af" }}>
          <p style={{ margin: 0, fontSize: "15px" }}>No active advisory recommendations matching the selected priority.</p>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      {!loading && !error && filteredData.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredData.map((rec) => {
            const statusStyle = getStatusBadge(rec.status || "Pending");
            return (
              <div
                key={rec.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "16px",
                  background: "#fafafa",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {/* Card Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        ...getPriorityBadge(rec.priority),
                      }}
                    >
                      {rec.priority} Priority
                    </span>
                    <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
                      Request ID: {rec.request_id}
                    </span>
                    <span style={{ fontSize: "12px", color: "#374151" }}>
                      • Patient: <strong>{rec.patient_name}</strong>
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: statusStyle.background,
                        color: statusStyle.color,
                        border: statusStyle.border,
                      }}
                    >
                      {statusStyle.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Score:</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#111827" }}>
                        {rec.recommendation_score} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transfer Details Route */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#ffffff",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>Source Provider</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{rec.source_facility}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#9ca3af" }}>
                    <div style={{ height: "1px", width: "30px", background: "#d1d5db" }} />
                    <ArrowRight size={18} color="#ed1c2c" />
                    <div style={{ height: "1px", width: "30px", background: "#d1d5db" }} />
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>Destination Hospital</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{rec.dest_facility}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", fontWeight: 600 }}>Recommended Allocation</div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#ed1c2c" }}>
                      {rec.recommended_units} unit(s) ({rec.blood_group})
                    </div>
                  </div>
                </div>

                {/* Logistics & Clinical Badges */}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "#4b5563" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span>Clinical Compatibility: <strong>{rec.compatibility_status}</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MapPin size={15} color="#6b7280" />
                    <span>Straight-line Distance: <strong>{rec.straight_line_distance_km} km</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={15} color="#6b7280" />
                    <span>Estimated Transport: <strong>{rec.estimated_transport_minutes} min</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#166534", fontWeight: 600 }}>
                    <span style={{ fontSize: "13px" }}>💰</span>
                    <span>Cost per Unit: <strong>₹{(rec.cost_per_unit != null ? Number(rec.cost_per_unit) : 1400).toLocaleString("en-IN")}</strong> • Total: <strong>₹{((rec.cost_per_unit != null ? Number(rec.cost_per_unit) : 1400) * Number(rec.recommended_units || 1)).toLocaleString("en-IN")}</strong></span>
                  </div>
                </div>

                {/* Explainable Decision Logic */}
                <div style={{ background: "#f3f4f6", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", color: "#374151" }}>
                  <span style={{ fontWeight: 600, color: "#111827" }}>Advisory Rationale: </span>
                  {rec.reason}
                </div>

                {/* Actionable Human Review Controls (Parts 5 & 6) */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleOpenMap(rec)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      background: "#ffffff",
                      color: "#2563eb",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <MapPin size={15} />
                    View GPS Route on Map
                  </button>

                  {(!rec.status || rec.status === "Pending" || rec.status === "Pending Review") ? (
                    <button
                      type="button"
                      onClick={() => handleOpenReview(rec)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        background: "#ed1c2c",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 1px 3px rgba(237, 28, 44, 0.2)",
                      }}
                    >
                      <FileText size={15} />
                      Review & Decide
                    </button>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#6b7280", fontStyle: "italic" }}>
                      {rec.status === "Accepted"
                        ? "Transfer dispatched to logistics queue."
                        : rec.status === "Rejected"
                        ? "Decision finalized as rejected."
                        : "Operational decision support."}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==============================================================
          HUMAN DECISION REVIEW MODAL (PARTS 5 & 6)
      ============================================================== */}
      {selectedRecForReview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ background: "#fee2e2", padding: "6px", borderRadius: "8px", color: "#ed1c2c" }}>
                  <Sparkles size={20} />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
                  Clinical Human Review & Decision
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseReview}
                disabled={submitting}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6b7280" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {actionError && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "#991b1b",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} />
                <span>{actionError}</span>
              </div>
            )}

            {/* Clinical Overview Grid */}
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#6b7280" }}>Patient / Request:</span>
                <strong style={{ color: "#111827" }}>
                  {selectedRecForReview.patient_name} ({selectedRecForReview.request_id})
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#6b7280" }}>Allocation Route:</span>
                <strong style={{ color: "#111827" }}>
                  {selectedRecForReview.source_facility} → {selectedRecForReview.dest_facility}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#6b7280" }}>Requested Blood & Units:</span>
                <strong style={{ color: "#ed1c2c" }}>
                  {selectedRecForReview.recommended_units} unit(s) of {selectedRecForReview.blood_group}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#6b7280" }}>Clinical Compatibility:</span>
                <strong style={{ color: "#16a34a" }}>
                  {selectedRecForReview.compatibility_status}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "#6b7280" }}>Straight-line Distance / Transit:</span>
                <strong style={{ color: "#374151" }}>
                  {selectedRecForReview.straight_line_distance_km} km ({selectedRecForReview.estimated_transport_minutes} min est.)
                </strong>
              </div>
            </div>

            {/* Advisory Rationale */}
            <div style={{ fontSize: "12px", color: "#4b5563", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "10px 12px", borderRadius: "8px" }}>
              <strong>AI Recommendation Rationale: </strong>
              {selectedRecForReview.reason}
            </div>

            {/* Mandatory Safety Notice */}
            <div style={{ fontSize: "11px", color: "#b45309", background: "#fef3c7", padding: "8px 12px", borderRadius: "6px" }}>
              ⚠️ <strong>Human Oversight Required:</strong> Accepting this recommendation creates an authorized transfer record in the logistics queue. Physical blood inventory is not automatically deducted.
            </div>

            {/* Review Notes Textarea */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                Review Notes & Dispatch Instructions (Optional):
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter clinical review notes or dispatch requirements (recommended for rejection)..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  color: "#111827",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleCloseReview}
                disabled={submitting}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#4b5563",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                id="open-reject-confirm-btn"
                onClick={handleOpenRejectConfirm}
                disabled={submitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #f87171",
                  background: "#fef2f2",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#991b1b",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                <XCircle size={15} />
                {submitting ? "Processing..." : "Reject Recommendation"}
              </button>

              <button
                type="button"
                onClick={handleAccept}
                disabled={submitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#16a34a",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 1px 3px rgba(22, 163, 74, 0.2)",
                }}
              >
                <CheckCircle size={15} />
                {submitting ? "Authorizing..." : "Accept & Create Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          REJECTION CONFIRMATION MODAL (LAYER 2)
      ============================================================== */}
      {showRejectConfirm && selectedRecForReview && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="reject-confirm-title"
          aria-describedby="reject-confirm-desc"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              handleCancelRejectConfirm();
            }
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "460px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25)",
              border: "1px solid #fecaca",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon & Header */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dc2626",
                  border: "1px solid #fca5a5",
                }}
              >
                <AlertTriangle size={28} />
              </div>

              <div>
                <h3
                  id="reject-confirm-title"
                  style={{
                    fontSize: "19px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Reject AI Recommendation?
                </h3>
                <p
                  id="reject-confirm-desc"
                  style={{
                    fontSize: "14px",
                    color: "#475569",
                    marginTop: "6px",
                    marginBottom: 0,
                    lineHeight: "1.4",
                  }}
                >
                  Are you sure you want to reject this AI recommendation?
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#b91c1c",
                    fontWeight: 500,
                    marginTop: "4px",
                    marginBottom: 0,
                  }}
                >
                  No transfer will be created from this recommendation.
                </p>
              </div>
            </div>

            {/* Dynamic Recommendation Summary Details */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "12px 14px",
                fontSize: "13px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Request:</span>
                <strong style={{ color: "#0f172a" }}>
                  {selectedRecForReview.request_id || selectedRecForReview.patient_name || "Emergency Request"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Source:</span>
                <strong style={{ color: "#0f172a", textAlign: "right", maxWidth: "260px", wordBreak: "break-word" }}>
                  {selectedRecForReview.source_facility || "N/A"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Destination:</span>
                <strong style={{ color: "#0f172a", textAlign: "right", maxWidth: "260px", wordBreak: "break-word" }}>
                  {selectedRecForReview.dest_facility || "N/A"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Blood:</span>
                <strong style={{ color: "#dc2626" }}>
                  {selectedRecForReview.recommended_units} unit(s) of {selectedRecForReview.blood_group}
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                id="reject-modal-cancel-btn"
                onClick={handleCancelRejectConfirm}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "9px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#475569",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                id="reject-modal-confirm-btn"
                onClick={handleConfirmReject}
                disabled={submitting}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "9px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#dc2626",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 1px 3px rgba(220, 38, 38, 0.3)",
                }}
              >
                <XCircle size={15} />
                {submitting ? "Rejecting..." : "Reject Recommendation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          GPS ROUTE ON MAP MODAL
      ============================================================== */}
      {selectedRecForMap && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={handleCloseMap}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "850px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                color: "#ffffff",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={22} color="#93c5fd" />
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#ffffff" }}>
                    GPS Route on Map
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#bfdbfe" }}>
                    {selectedRecForMap.source_facility} ➔ {selectedRecForMap.dest_facility} • {selectedRecForMap.recommended_units} unit(s) ({selectedRecForMap.blood_group})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseMap}
                style={{
                  background: "rgba(255, 255, 255, 0.18)",
                  border: "none",
                  color: "#ffffff",
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

            {/* Route Stats Banner */}
            <div
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", color: "#334155" }}>
                <span>📍 <b>Straight-line Distance:</b> {selectedRecForMap.straight_line_distance_km} km</span>
                {mapRoute?.roadDistanceDisplay && (
                  <span>🚗 <b>Road Distance:</b> {mapRoute.roadDistanceDisplay}</span>
                )}
                <span>⏱ <b>Estimated Transport:</b> {mapRoute?.durationText || `${selectedRecForMap.estimated_transport_minutes} min`}</span>
                <span>🎯 <b>AI Score:</b> {selectedRecForMap.recommendation_score} / 100</span>
              </div>
            </div>

            {/* Map Area */}
            <div style={{ height: "420px", width: "100%", background: "#f1f5f9" }}>
              <LeafletMapView
                height="100%"
                markers={mapMarkers}
                route={mapRoute}
                center={
                  mapMarkers[0]
                    ? { lat: Number(mapMarkers[0].latitude), lng: Number(mapMarkers[0].longitude) }
                    : { lat: 10.7905, lng: 78.7047 }
                }
                zoom={12}
              />
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "12px 20px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                Advisory Route Visualization • Real-time cold-chain transit tracking
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleCloseMap}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                {selectedRecForMap.status === "Pending" && isOperational && (
                  <button
                    type="button"
                    onClick={() => {
                      const rec = selectedRecForMap;
                      handleCloseMap();
                      handleOpenReview(rec);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#ed1c2c",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    <FileText size={15} />
                    Review & Decide
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
