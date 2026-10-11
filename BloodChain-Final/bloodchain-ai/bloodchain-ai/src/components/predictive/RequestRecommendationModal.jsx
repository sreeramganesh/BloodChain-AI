import { useState, useEffect } from "react";
import {
  Sparkles,
  MapPin,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  Building2,
  X,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Info,
  Navigation,
} from "lucide-react";
import LeafletMapView from "../maps/LeafletMapView";
import {
  findSourceCandidates,
  generateAndSaveRecommendationsForRequest,
} from "../../services/recommendationEngine";
import { getRoute } from "../../services/routesService";
import { DEFAULT_NEARBY_RADIUS_KM, NEARBY_RADIUS_OPTIONS } from "../../utils/geoUtils";

export default function RequestRecommendationModal({
  isOpen,
  onClose,
  request,
  userLocation = null,
  onNavigateToTransfer = null,
}) {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [resultState, setResultState] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [selectedRadius, setSelectedRadius] = useState(DEFAULT_NEARBY_RADIUS_KM);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [routeOrigin, setRouteOrigin] = useState(null);
  const [originName, setOriginName] = useState("");
  const [activeRoute, setActiveRoute] = useState(null);

  useEffect(() => {
    if (!isOpen || !request) return;

    let isMounted = true;
    setLoading(true);
    setSelectedCandidate(null);
    setActiveRoute(null);

    // Run intelligent source recommendation engine with Phase 5 Google Routes
    generateAndSaveRecommendationsForRequest(request, {
      userLocation,
      radiusKm: selectedRadius,
      forceRegenerate: false,
    })
      .then((res) => {
        if (!isMounted) return;
        setCandidates(res.candidates || []);
        setRouteOrigin(res.origin || null);
        setOriginName(res.originFacilityName || request.hospital || "Requesting Hospital");
        setResultState(res.resultState || "SUITABLE_FOUND");
        setResultMessage(res.message || "Suitable sources found");
        if (res.candidates && res.candidates.length > 0) {
          setSelectedCandidate(res.candidates[0]);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to generate recommendations:", err);
        setCandidates([]);
        setResultState("ERROR");
        setResultMessage("Unable to analyze blood sources at this time.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, request, selectedRadius]);

  // Synchronize Active Route for Selected Candidate
  useEffect(() => {
    if (!selectedCandidate) {
      setActiveRoute(null);
      return;
    }

    if (selectedCandidate.routeCoordinates?.length > 0 || selectedCandidate.encodedPolyline) {
      setActiveRoute({
        origin: routeOrigin,
        originName: originName || request?.hospital || "Requesting Hospital",
        destination: {
          latitude: selectedCandidate.latitude,
          longitude: selectedCandidate.longitude,
        },
        destinationName: selectedCandidate.facilityName || "Source Facility",
        coordinates: selectedCandidate.routeCoordinates || [],
        encodedPolyline: selectedCandidate.encodedPolyline || null,
        roadDistanceKm: selectedCandidate.roadDistanceKm,
        roadDistanceDisplay: selectedCandidate.roadDistanceDisplay,
        // Normalized fields for LeafletMapView destination marker popup
        distanceDisplay: selectedCandidate.roadDistanceDisplay || (selectedCandidate.roadDistanceKm != null ? `${selectedCandidate.roadDistanceKm.toFixed(1)} km` : null),
        durationMinutes: selectedCandidate.durationMinutes,
        durationText: selectedCandidate.durationText,
      });
    } else if (routeOrigin && selectedCandidate.latitude != null && selectedCandidate.longitude != null) {
      // Lazy fetch route for candidate if not pre-computed in shortlist
      getRoute(routeOrigin, { lat: selectedCandidate.latitude, lng: selectedCandidate.longitude })
        .then((res) => {
          if (res.status === "success") {
            setActiveRoute({
              origin: routeOrigin,
              originName: originName || request?.hospital || "Requesting Hospital",
              destination: {
                latitude: selectedCandidate.latitude,
                longitude: selectedCandidate.longitude,
              },
              destinationName: selectedCandidate.facilityName || "Source Facility",
              coordinates: res.coordinates || [],
              encodedPolyline: res.encodedPolyline || null,
              roadDistanceKm: res.distanceKm,
              roadDistanceDisplay: res.distanceDisplay,
              // Normalized fields for LeafletMapView destination marker popup
              distanceDisplay: res.distanceDisplay,
              durationMinutes: res.durationMinutes,
              durationText: res.durationText,
            });
          } else {
            setActiveRoute(null);
          }
        })
        .catch(() => setActiveRoute(null));
    } else {
      setActiveRoute(null);
    }
  }, [selectedCandidate, routeOrigin, originName, request]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !request) return null;

  const recipientBloodGroup = request.group || request.bloodGroup || "O+";
  const requiredUnits = request.units || request.unitsNeeded || "1 Unit";
  const requestingHospital = request.hospital || "Requesting Hospital";

  // Prepare map markers for verified candidates
  const mapMarkers = candidates
    .filter((c) => c.hasCoordinates && c.latitude != null && c.longitude != null)
    .map((c) => ({
      id: c.facilityId,
      name: c.facilityName,
      type: c.facilityType,
      facility_type: c.facilityType,
      latitude: c.latitude,
      longitude: c.longitude,
      bloodGroup: c.bloodGroup,
      availableUnits: c.availableUnits,
      compatibilityStatus: c.compatibilityStatus,
      shortageRiskLevel: c.shortageRiskLevel,
      expiryRiskLevel: c.expiryRiskLevel,
      distanceDisplay: c.distanceDisplay,
      roadDistanceKm: c.roadDistanceKm,
      roadDistanceDisplay: c.roadDistanceDisplay,
      durationMinutes: c.durationMinutes,
      durationText: c.durationText,
      routeStatus: c.routeStatus,
      recommendationScore: c.recommendationScore,
    }));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1600,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(5px)",
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
          maxWidth: "960px",
          maxHeight: "92vh",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
            color: "#ffffff",
            padding: "16px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={20} color="#93c5fd" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#ffffff", fontWeight: 700 }}>
                Intelligent Blood Source Recommendations
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#bfdbfe" }}>
                Request {request.id}: <b>{request.patient || "Emergency Patient"}</b> • Need:{" "}
                <b style={{ color: "#ffffff" }}>
                  {requiredUnits} of {recipientBloodGroup}
                </b>{" "}
                at <b>{requestingHospital}</b>
              </p>
            </div>
          </div>

          <button
            className="btn-close-rec-modal"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.18)",
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

        {/* Proximity & Radius Sub-bar */}
        <div
          style={{
            background: "#eff6ff",
            borderBottom: "1px solid #dbeafe",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#1e40af" }}>
            <MapPin size={14} color="#2563eb" />
            <span>
              Haversine straight-line distance from <b>{requestingHospital}</b>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SlidersHorizontal size={13} color="#1e40af" />
            <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#1e40af" }}>Search Radius:</label>
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(Number(e.target.value))}
              style={{
                padding: "3px 8px",
                borderRadius: "5px",
                border: "1px solid #93c5fd",
                background: "#ffffff",
                fontSize: "11.5px",
                fontWeight: 700,
                color: "#1e3a8a",
                cursor: "pointer",
              }}
            >
              {NEARBY_RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} km {r === DEFAULT_NEARBY_RADIUS_KM ? "(Default)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: "18px 22px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 20px" }}>
              <RefreshCw
                size={32}
                color="#2563eb"
                style={{ animation: "spin 1.2s linear infinite", margin: "0 auto 12px" }}
              />
              <h3 style={{ margin: "0 0 6px", fontSize: "16px", color: "#1e293b", fontWeight: 700 }}>
                Analyzing nearby blood sources...
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Evaluating blood group compatibility, unreserved inventory, shortage risk, expiry risk, and straight-line proximity.
              </p>
            </div>
          ) : (
            <>
              {/* Result State Banner */}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background:
                    resultState === "SUITABLE_FOUND"
                      ? "#ecfdf5"
                      : resultState === "INSUFFICIENT_QUANTITY"
                      ? "#fef3c7"
                      : "#fef2f2",
                  border:
                    resultState === "SUITABLE_FOUND"
                      ? "1px solid #a7f3d0"
                      : resultState === "INSUFFICIENT_QUANTITY"
                      ? "1px solid #fde68a"
                      : "1px solid #fecaca",
                  color:
                    resultState === "SUITABLE_FOUND"
                      ? "#065f46"
                      : resultState === "INSUFFICIENT_QUANTITY"
                      ? "#92400e"
                      : "#991b1b",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {resultState === "SUITABLE_FOUND" ? (
                  <CheckCircle2 size={17} color="#059669" />
                ) : (
                  <AlertTriangle size={17} />
                )}
                <span>{resultMessage}</span>
              </div>

              {/* Main Grid: Candidates List + Google Map */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "16px",
                  minHeight: "360px",
                }}
              >
                {/* Left: Candidates List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "420px" }}>
                  {candidates.map((cand, idx) => {
                    const isSelected = selectedCandidate?.candidateId === cand.candidateId;
                    return (
                      <div
                        key={cand.candidateId || idx}
                        onClick={() => setSelectedCandidate(cand)}
                        style={{
                          border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                          borderRadius: "10px",
                          padding: "12px 14px",
                          background: isSelected ? "#eff6ff" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          boxShadow: isSelected ? "0 4px 6px -1px rgba(37, 99, 235, 0.1)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <div>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                color: "#2563eb",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Rank #{idx + 1} • {cand.facilityType}
                            </span>
                            <h4 style={{ margin: "2px 0 0", fontSize: "14px", color: "#0f172a", fontWeight: 700 }}>
                              {cand.facilityName}
                            </h4>
                          </div>

                          <div
                            style={{
                              background: cand.recommendationScore >= 80 ? "#ecfdf5" : "#fef3c7",
                              color: cand.recommendationScore >= 80 ? "#065f46" : "#854d0e",
                              border: `1px solid ${cand.recommendationScore >= 80 ? "#a7f3d0" : "#fde68a"}`,
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 800,
                            }}
                          >
                            Score: {cand.recommendationScore}/100
                          </div>
                        </div>

                        {/* Chips Row */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "6px 0" }}>
                          {/* Compatibility */}
                          <span
                            style={{
                              fontSize: "10.5px",
                              fontWeight: 700,
                              background: cand.compatibilityStatus === "Exact Match" ? "#dcfce7" : "#dbeafe",
                              color: cand.compatibilityStatus === "Exact Match" ? "#15803d" : "#1e40af",
                              padding: "1px 7px",
                              borderRadius: "4px",
                            }}
                          >
                            {cand.compatibilityStatus} ({cand.bloodGroup})
                          </span>

                          {/* Available Stock */}
                          <span
                            style={{
                              fontSize: "10.5px",
                              fontWeight: 700,
                              background: cand.canFulfill ? "#ecfdf5" : "#fef2f2",
                              color: cand.canFulfill ? "#065f46" : "#991b1b",
                              padding: "1px 7px",
                              borderRadius: "4px",
                            }}
                          >
                            {cand.availableUnits} Units Available
                          </span>

                          {/* Phase 5: Road Distance */}
                          {(cand.roadDistanceDisplay || cand.roadDistanceKm != null) ? (
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: 700,
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                                padding: "1px 7px",
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              🚗 Road: {cand.roadDistanceDisplay || `${cand.roadDistanceKm.toFixed(1)} km`}
                            </span>
                          ) : null}

                          {/* Phase 5: Travel Time / ETA */}
                          {(cand.durationText || cand.durationMinutes != null) ? (
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: 700,
                                background: "#f0fdf4",
                                color: "#15803d",
                                border: "1px solid #bbf7d0",
                                padding: "1px 7px",
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              ⏱️ Travel Time: {cand.durationText || `${cand.durationMinutes} min`}
                            </span>
                          ) : null}

                          {/* Straight-line Distance */}
                          {cand.distanceDisplay && cand.distanceDisplay !== "N/A" && (
                            <span
                              style={{
                                fontSize: "10.5px",
                                fontWeight: 600,
                                background: "#f1f5f9",
                                color: "#475569",
                                padding: "1px 7px",
                                borderRadius: "4px",
                              }}
                            >
                              📍 Straight-line: {cand.distanceDisplay}
                            </span>
                          )}

                          {/* Road Route Unavailable Fallback Notice */}
                          {cand.routeStatus === "unavailable" && !cand.roadDistanceKm && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                background: "#fff1f2",
                                color: "#be123c",
                                border: "1px solid #fecdd3",
                                padding: "1px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              Road route unavailable
                            </span>
                          )}

                          {/* Shortage Risk */}
                          <span
                            style={{
                              fontSize: "10.5px",
                              fontWeight: 600,
                              background: cand.shortageRiskLevel === "Low" ? "#f0fdf4" : "#fef2f2",
                              color: cand.shortageRiskLevel === "Low" ? "#166534" : "#991b1b",
                              padding: "1px 7px",
                              borderRadius: "4px",
                            }}
                          >
                            Shortage Risk: {cand.shortageRiskLevel}
                          </span>
                        </div>

                        {/* Estimated Blood Component Cost Breakdown */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            margin: "4px 0",
                            padding: "5px 9px",
                            background: "#f0fdf4",
                            border: "1px solid #dcfce7",
                            borderRadius: "6px",
                            fontSize: "11px",
                          }}
                        >
                          <span style={{ color: "#166534" }}>
                            Cost per Unit: <strong>₹{(cand.costPerUnit || 1400).toLocaleString("en-IN")}</strong>
                          </span>
                          <span style={{ color: "#065f46", fontWeight: 800 }}>
                            Total Estimated Cost: ₹{(cand.totalEstimatedCost || ((cand.costPerUnit || 1400) * (cand.requiredUnits || 1))).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Clinical Reason */}
                        <p style={{ margin: "4px 0 0", fontSize: "11.5px", color: "#475569", lineHeight: 1.4 }}>
                          {cand.reason}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Embedded Google Map with Route Visualization */}
                <div
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "8px 12px",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      color: "#334155",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Regional Source Map</span>
                    <span style={{ fontSize: "10.5px", color: "#059669" }}>
                      ● {mapMarkers.length} Verified Sources Plotted
                    </span>
                  </div>

                  {/* Active Route Banner */}
                  {activeRoute && (
                    <div
                      style={{
                        background: "linear-gradient(90deg, #eff6ff 0%, #f0fdf4 100%)",
                        padding: "6px 12px",
                        borderBottom: "1px solid #bfdbfe",
                        fontSize: "11px",
                        color: "#1e40af",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Navigation size={12} color="#2563eb" />
                        <b>Route:</b> {activeRoute.originName} ➔ {selectedCandidate?.facilityName}
                      </span>
                      <span style={{ color: "#166534", fontWeight: 700 }}>
                        {activeRoute.roadDistanceDisplay || activeRoute.distanceDisplay || (activeRoute.roadDistanceKm != null ? `${activeRoute.roadDistanceKm} km` : "N/A")} • {activeRoute.durationText || "ETA unavailable"}
                      </span>
                    </div>
                  )}

                  <div style={{ flex: 1, minHeight: "280px" }}>
                    <LeafletMapView
                      height="100%"
                      markers={mapMarkers}
                      userLocation={userLocation}
                      selectedFacilityId={selectedCandidate?.facilityId}
                      route={activeRoute}
                      center={
                        selectedCandidate?.hasCoordinates
                          ? { lat: Number(selectedCandidate.latitude), lng: Number(selectedCandidate.longitude) }
                          : userLocation
                          ? { lat: Number(userLocation.latitude), lng: Number(userLocation.longitude) }
                          : { lat: 10.7905, lng: 78.7047 }
                      }
                      zoom={12}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Bar */}
        <div
          style={{
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            padding: "12px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#64748b" }}>
            <ShieldCheck size={14} color="#059669" />
            <span>
              <b>Advisory Only:</b> Recommendations require human clinical review. Zero automated transfers or stock mutations. Prototype cost estimates — not an official tariff.
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "7px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>

            {onNavigateToTransfer && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToTransfer(selectedCandidate);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "7px",
                  border: "none",
                  background: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Review & Approve Transfer</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
