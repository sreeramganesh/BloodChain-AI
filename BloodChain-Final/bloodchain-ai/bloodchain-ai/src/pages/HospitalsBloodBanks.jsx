import { useState, useMemo } from "react";
import {
  Building2,
  Droplets,
  MapPin,
  Users,
  Search,
  RotateCcw,
  Download,
  ChevronDown,
  Eye,
  Plus,
  ShieldCheck,
  ArrowRight,
  Phone,
  Navigation,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import {
  STATES_LIST,
  getDistrictsForState,
} from "../constants/locationData";
import {
  getFilteredMasterFacilities,
  getAllVerifiedFacilities,
  STATE_CENTROIDS,
} from "../services/facilityService";
import {
  getCurrentUserLocation,
  GEOLOCATION_ERRORS,
} from "../services/geolocationService";
import {
  calculateHaversineDistance,
  findNearbyFacilities,
  formatDistance,
  DEFAULT_NEARBY_RADIUS_KM,
  NEARBY_RADIUS_OPTIONS,
} from "../utils/geoUtils";
import LeafletMapView from "../components/maps/LeafletMapView";

function HospitalsBloodBanks() {
  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [selectedDistrict, setSelectedDistrict] = useState("Tiruchirappalli");
  const [appliedState, setAppliedState] = useState("Tamil Nadu");
  const [appliedDistrict, setAppliedDistrict] = useState("Tiruchirappalli");
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);

  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [customInstitutions, setCustomInstitutions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  // Phase 3 — User Location & Proximity State
  const [userLocation, setUserLocation] = useState(null); // { latitude, longitude, accuracy }
  const [locationStatus, setLocationStatus] = useState("idle"); // "idle" | "requesting" | "success" | "denied" | "unavailable" | "timeout" | "unsupported"
  const [locationError, setLocationError] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState(DEFAULT_NEARBY_RADIUS_KM);
  const [activeViewMode, setActiveViewMode] = useState("directory"); // "directory" | "nearby"

  // Add form fields
  const [addForm, setAddForm] = useState({
    name: "",
    type: "Hospital",
    state: "Tamil Nadu",
    district: "Tiruchirappalli",
    address: "",
    contact: "",
    status: "Active",
  });
  const [addError, setAddError] = useState("");

  // Suggest form fields
  const [suggestForm, setSuggestForm] = useState({
    name: "",
    type: "Hospital",
    area: "",
    contact: "",
    notes: "",
  });
  const [suggestNotice, setSuggestNotice] = useState(null);
  const [suggestError, setSuggestError] = useState("");

  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  // Phase 3 — Request User GPS Location
  const handleUseMyLocation = async () => {
    setLocationStatus("requesting");
    setLocationError(null);

    const res = await getCurrentUserLocation();

    if (res.success && res.coords) {
      setUserLocation(res.coords);
      setLocationStatus("success");
      setActiveViewMode("nearby");
      setSelectedHospitalId(null);
      setNotice("GPS location detected! Showing facilities sorted by nearest distance.");
      setTimeout(() => setNotice(null), 4000);
    } else {
      setLocationError(res.error);
      if (res.code === GEOLOCATION_ERRORS.PERMISSION_DENIED) {
        setLocationStatus("denied");
      } else if (res.code === GEOLOCATION_ERRORS.TIMEOUT) {
        setLocationStatus("timeout");
      } else if (res.code === GEOLOCATION_ERRORS.NOT_SUPPORTED) {
        setLocationStatus("unsupported");
      } else {
        setLocationStatus("unavailable");
      }
    }
  };

  // Dependent Filter: State change -> District resets -> Facilities update
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setAppliedState(newState);
    setSelectedDistrict("All");
    setAppliedDistrict("All");
    setSelectedHospitalId(null);
    setActiveViewMode("directory");
  };

  // Dependent Filter: District change -> Facilities update
  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setSelectedDistrict(newDistrict);
    setAppliedDistrict(newDistrict);
    setSelectedHospitalId(null);
    setActiveViewMode("directory");
  };

  const handleSearch = () => {
    setAppliedState(selectedState);
    setAppliedDistrict(selectedDistrict);
    setSelectedHospitalId(null);
  };

  const handleReset = () => {
    setSelectedState("Tamil Nadu");
    setSelectedDistrict("Tiruchirappalli");
    setAppliedState("Tamil Nadu");
    setAppliedDistrict("Tiruchirappalli");
    setSelectedType("All");
    setSearchQuery("");
    setSelectedHospitalId(null);
    setActiveViewMode("directory");
    setNotice("Filters reset to default.");
    setTimeout(() => setNotice(null), 3000);
  };

  // Authoritative facility dataset from HOSPITAL_MASTER + custom/DB facilities
  const masterData = useMemo(() => {
    return getFilteredMasterFacilities({
      state: appliedState,
      district: appliedDistrict,
      type: selectedType,
      searchQuery,
      customFacilities: customInstitutions,
    });
  }, [appliedState, appliedDistrict, selectedType, searchQuery, customInstitutions]);

  // All verified facilities across the network
  const allVerifiedFacilities = useMemo(() => {
    return getAllVerifiedFacilities(customInstitutions);
  }, [customInstitutions]);

  // Nearby facilities calculated strictly via Haversine distance, sorted nearest first
  const nearbyFacilities = useMemo(() => {
    if (!userLocation) return [];
    return findNearbyFacilities({
      userLat: userLocation.latitude,
      userLng: userLocation.longitude,
      facilities: allVerifiedFacilities,
      radiusKm: selectedRadius,
      facilityType: selectedType,
    });
  }, [userLocation, allVerifiedFacilities, selectedRadius, selectedType]);

  // Enrich district directory facilities with straight-line distance if userLocation is available
  const filteredInstitutions = useMemo(() => {
    return masterData.facilities.map((fac) => {
      if (
        userLocation &&
        fac.hasCoordinates &&
        fac.latitude != null &&
        fac.longitude != null
      ) {
        const d = calculateHaversineDistance(
          userLocation.latitude,
          userLocation.longitude,
          fac.latitude,
          fac.longitude
        );
        return {
          ...fac,
          distanceKm: d,
          distanceDisplay: formatDistance(d),
          distanceType: "Straight-line",
        };
      }
      return fac;
    });
  }, [masterData.facilities, userLocation]);

  const mappedFacilities = masterData.mappedFacilities;
  const unmappedFacilities = masterData.unmappedFacilities;

  // Active displayed facilities (Nearby vs Directory mode)
  const displayFacilities = activeViewMode === "nearby" ? nearbyFacilities : filteredInstitutions;
  const activeMarkers = activeViewMode === "nearby" ? nearbyFacilities : mappedFacilities;

  const activeHospital = useMemo(() => {
    if (selectedHospitalId) {
      const found = displayFacilities.find((h) => h.id === selectedHospitalId);
      if (found) return found;
    }
    return displayFacilities[0] || null;
  }, [selectedHospitalId, displayFacilities]);

  return (
    <div className="hospitals-page">
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

      {/* Geolocation Error Alert */}
      {locationError && (
        <div
          style={{
            margin: "0 0 16px 0",
            padding: "12px 18px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            color: "#991b1b",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{locationError}</span>
          </div>
          <button
            onClick={handleUseMyLocation}
            style={{
              padding: "4px 12px",
              borderRadius: "6px",
              border: "1px solid #f87171",
              background: "#ffffff",
              color: "#b91c1c",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ================= HEADER ================= */}

      <div className="hospitals-header">
        <div className="hospitals-title-section">
          <div className="hospitals-title-icon">
            <Building2 size={32} />
          </div>

          <div>
            <div className="hospitals-eyebrow">HEALTHCARE NETWORK</div>

            <h1>Hospitals & Blood Banks</h1>

            <p>Explore authoritative hospitals and blood banks across registered districts.</p>
          </div>
        </div>

        <div className="hospitals-header-right">
          <div className="hospitals-quote">
            “Stronger networks
            <br />
            save more lives.”
          </div>

          {/* Phase 3 — Use My Location Button */}
          <button
            className="btn-location-gps"
            onClick={handleUseMyLocation}
            disabled={locationStatus === "requesting"}
            style={{
              height: "42px",
              padding: "0 16px",
              border:
                locationStatus === "success"
                  ? "1px solid #10b981"
                  : locationStatus === "denied"
                  ? "1px solid #f87171"
                  : "1px solid #2563eb",
              borderRadius: "7px",
              background:
                locationStatus === "success"
                  ? "#ecfdf5"
                  : locationStatus === "denied"
                  ? "#fef2f2"
                  : "#ffffff",
              color:
                locationStatus === "success"
                  ? "#065f46"
                  : locationStatus === "denied"
                  ? "#991b1b"
                  : "#2563eb",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: locationStatus === "requesting" ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            {locationStatus === "requesting" ? (
              <>
                <RefreshCw size={15} style={{ animation: "spin 1.2s linear infinite" }} />
                <span>Getting Location...</span>
              </>
            ) : locationStatus === "success" ? (
              <>
                <CheckCircle2 size={15} color="#059669" />
                <span>Location Detected</span>
              </>
            ) : locationStatus === "denied" ? (
              <>
                <AlertCircle size={15} color="#dc2626" />
                <span>Location Permission Denied</span>
              </>
            ) : (
              <>
                <Navigation size={15} color="#2563eb" />
                <span>Use My Location</span>
              </>
            )}
          </button>

          <button
            className="hospitals-add-button"
            onClick={() => {
              setAddForm((prev) => ({
                ...prev,
                district: appliedDistrict || selectedDistrict || "Tiruchirappalli",
                state: appliedState || selectedState || "Tamil Nadu",
              }));
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={17} />
            Add New Hospital / Blood Bank
          </button>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}

      <div className="hospitals-stats">
        <div className="hospital-stat-card pink">
          <div className="hospital-stat-icon red">
            <Building2 size={25} />
          </div>

          <div>
            <strong>{displayFacilities.filter((i) => i.type.includes("Hospital")).length}</strong>
            <span>Total Hospitals</span>
            <small>{activeViewMode === "nearby" ? `Within ${selectedRadius} km` : "Authoritative source"}</small>
          </div>
        </div>

        <div className="hospital-stat-card blue">
          <div className="hospital-stat-icon blue-icon">
            <Droplets size={25} />
          </div>

          <div>
            <strong>{displayFacilities.filter((i) => i.type === "Blood Bank").length}</strong>
            <span>Blood Banks</span>
            <small>Connected centers</small>
          </div>
        </div>

        <div className="hospital-stat-card green">
          <div className="hospital-stat-icon green-icon">
            <MapPin size={25} />
          </div>

          <div>
            <strong>{activeMarkers.length}</strong>
            <span>Mapped on GPS</span>
            <small>{activeViewMode === "nearby" ? "Proximity sorted" : `${unmappedFacilities.length} pending coords`}</small>
          </div>
        </div>

        <div className="hospital-stat-card purple">
          <div className="hospital-stat-icon purple-icon">
            <Users size={25} />
          </div>

          <div>
            <strong>{displayFacilities.length}</strong>
            <span>{activeViewMode === "nearby" ? "Nearby Facilities" : "District Facilities"}</span>
            <small>{activeViewMode === "nearby" ? `GPS ${selectedRadius} km radius` : appliedDistrict || appliedState}</small>
          </div>
        </div>
      </div>

      {/* ================= PHASE 3: USER LOCATION PROXIMITY BAR ================= */}
      {userLocation && (
        <div
          className="gps-proximity-bar"
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "9px",
            padding: "11px 16px",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Navigation size={17} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e3a8a" }}>
                  Your GPS Location Active
                </span>
                <span
                  className="gps-user-coords"
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    background: "#dbeafe",
                    color: "#1e40af",
                    padding: "1px 7px",
                    borderRadius: "9999px",
                  }}
                >
                  {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
                Straight-line Haversine distance calculated locally • Zero remote tracking
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Radius Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <SlidersHorizontal size={14} color="#1e40af" />
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#1e40af" }}>Radius:</label>
              <select
                className="gps-radius-select"
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #93c5fd",
                  background: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#1e3a8a",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {NEARBY_RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r} km {r === DEFAULT_NEARBY_RADIUS_KM ? "(Default)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div
              style={{
                display: "inline-flex",
                background: "#dbeafe",
                padding: "3px",
                borderRadius: "7px",
                gap: "3px",
              }}
            >
              <button
                className={`btn-tab ${activeViewMode === "nearby" ? "active" : ""}`}
                onClick={() => setActiveViewMode("nearby")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "5px",
                  border: "none",
                  background: activeViewMode === "nearby" ? "#2563eb" : "transparent",
                  color: activeViewMode === "nearby" ? "#ffffff" : "#1e40af",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Nearby ({nearbyFacilities.length})
              </button>
              <button
                className={`btn-tab ${activeViewMode === "directory" ? "active" : ""}`}
                onClick={() => setActiveViewMode("directory")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "5px",
                  border: "none",
                  background: activeViewMode === "directory" ? "#2563eb" : "transparent",
                  color: activeViewMode === "directory" ? "#ffffff" : "#1e40af",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                District Directory ({filteredInstitutions.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FILTERS ================= */}

      <div className="hospital-filter-card">
        <div className="hospital-filter-group">
          <label>Select State</label>

          <div className="hospital-select">
            <select value={selectedState} onChange={handleStateChange}>
              <option value="All">All States</option>
              {STATES_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="hospital-filter-group">
          <label>Select District</label>

          <div className="hospital-select">
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={!selectedState || availableDistricts.length === 0}
            >
              {!selectedState ? (
                <option value="">Select District</option>
              ) : (
                <>
                  <option value="All">All Districts</option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </>
              )}
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="hospital-filter-group">
          <label>Facility Type</label>

          <div className="hospital-select">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Hospital">Hospital</option>
              <option value="Government Hospital">Government Hospital</option>
              <option value="Medical College Hospital">Medical College Hospital</option>
              <option value="Blood Bank">Blood Bank</option>
              <option value="PHC">PHC</option>
              <option value="CHC">CHC</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="hospital-search" style={{ gridColumn: "span 2" }}>
          <Search size={16} />

          <input
            type="text"
            placeholder="Search authoritative facilities by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="hospital-search-button" onClick={handleSearch}>
          <Search size={16} />
          Filter
        </button>

        <button className="hospital-reset-button" onClick={handleReset}>
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      {/* ================= DYNAMIC FACILITY COUNT METRICS (STEP 10) ================= */}
      <div
        className="facility-metrics-summary-bar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          padding: "12px 18px",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          marginBottom: "18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "13.5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Facilities Found:</span>
            <strong style={{ color: "#0f172a", fontSize: "15px", fontWeight: 700 }} data-testid="count-facilities-found">
              {displayFacilities.length}
            </strong>
          </div>
          <span style={{ color: "#cbd5e1" }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Mapped Facilities:</span>
            <strong style={{ color: "#15803d", fontSize: "15px", fontWeight: 700 }} data-testid="count-mapped-facilities">
              {activeMarkers.length}
            </strong>
          </div>
          <span style={{ color: "#cbd5e1" }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Coordinates Pending:</span>
            <strong style={{ color: "#d97706", fontSize: "15px", fontWeight: 700 }} data-testid="count-pending-facilities">
              {unmappedFacilities.length}
            </strong>
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "#64748b" }}>
          Showing: <strong style={{ color: "#334155" }}>{appliedState === "All" ? "All States" : appliedState}</strong>
          {" › "}
          <strong style={{ color: "#334155" }}>{appliedDistrict === "All" ? "All Districts" : appliedDistrict}</strong>
          {selectedType !== "All" && ` › ${selectedType}`}
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="hospitals-main-grid">
        {/* TABLE */}

        <div className="hospitals-table-card">
          <div className="hospitals-card-header">
            <div className="hospitals-card-title">
              <div className="small-hospital-icon">
                {activeViewMode === "nearby" ? <Navigation size={20} /> : <Building2 size={20} />}
              </div>

              <div>
                <h2>
                  {activeViewMode === "nearby"
                    ? `Nearby Facilities (Within ${selectedRadius} km)`
                    : `Facilities in ${appliedDistrict === "All" ? `All Districts (${appliedState})` : appliedDistrict || appliedState}`}
                </h2>
                <p>
                  {activeViewMode === "nearby"
                    ? `Showing ${nearbyFacilities.length} facilities sorted nearest first • Straight-line Haversine distance`
                    : `Showing ${displayFacilities.length > 0 ? 1 : 0} to ${displayFacilities.length} of ${displayFacilities.length} authoritative facilities`}
                </p>
              </div>
            </div>

            <button className="hospital-export-button">
              <Download size={15} />
              Export
            </button>
          </div>

          {/* Empty state for nearby radius */}
          {activeViewMode === "nearby" && nearbyFacilities.length === 0 ? (
            <div
              style={{
                padding: "36px 20px",
                textAlign: "center",
                background: "#f8fafc",
                margin: "16px",
                borderRadius: "8px",
                border: "1px dashed #cbd5e1",
              }}
            >
              <MapPin size={34} color="#94a3b8" style={{ margin: "0 auto 8px" }} />
              <h3 style={{ margin: "0 0 6px", fontSize: "15px", color: "#1e293b", fontWeight: "700" }}>
                No verified facilities found within {selectedRadius} km.
              </h3>
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b" }}>
                Try expanding your nearby radius to search across neighboring districts.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                {[50, 100].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRadius(r)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "6px",
                      border: "1px solid #2563eb",
                      background: "#eff6ff",
                      color: "#1e40af",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Expand to {r} km
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="hospitals-table-wrapper">
              <table className="hospitals-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Facility Name</th>
                    <th>Type</th>
                    <th>District</th>
                    {userLocation && <th>Approx. Distance</th>}
                    <th>Map Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {displayFacilities.map((item, index) => {
                    const isSelected = activeHospital?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedHospitalId(item.id)}
                        className={`facility-table-row ${isSelected ? "selected-facility-row" : ""}`}
                        style={{
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#fef2f2" : undefined,
                          borderLeft: isSelected ? "3px solid #dc2626" : "3px solid transparent",
                        }}
                      >
                        <td>{index + 1}</td>

                        <td>
                          <strong className="hospital-name-cell">{item.name}</strong>
                        </td>

                        <td>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color:
                                item.type === "Blood Bank"
                                  ? "#881337"
                                  : item.type.includes("Government")
                                  ? "#c2410c"
                                  : item.type.includes("Medical")
                                  ? "#991b1b"
                                  : item.type.includes("PHC") || item.type.includes("CHC")
                                  ? "#059669"
                                  : "#475569",
                            }}
                          >
                            {item.type}
                          </span>
                        </td>

                        <td>{item.district || item.location}</td>

                        {userLocation && (
                          <td>
                            {item.distanceDisplay && item.distanceDisplay !== "N/A" ? (
                              <span
                                className="distance-badge"
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: "#1e40af",
                                  background: "#eff6ff",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #bfdbfe",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                }}
                              >
                                📍 {item.distanceDisplay}
                              </span>
                            ) : (
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>—</span>
                            )}
                          </td>
                        )}

                        <td>
                          {item.hasCoordinates ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                background: "#dcfce7",
                                color: "#15803d",
                                fontSize: "10px",
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle2 size={11} /> Verified on Map
                            </span>
                          ) : (
                            <span
                              className="badge-coordinates-pending"
                              data-testid="badge-coordinates-pending"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                background: "#f1f5f9",
                                color: "#64748b",
                                fontSize: "10px",
                                fontWeight: 500,
                              }}
                            >
                              Coordinates Pending
                            </span>
                          )}
                        </td>

                        <td>
                          <button
                            className="hospital-view-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedHospitalId(item.id);
                            }}
                          >
                            <Eye size={13} />
                            {item.hasCoordinates ? "View on Map" : "View Info"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="hospital-pagination">
            <span>
              Showing {displayFacilities.length > 0 ? 1 : 0} to {displayFacilities.length} of {displayFacilities.length} locations
            </span>

            <div>
              <button>‹</button>
              <button className="active">1</button>
              <button>›</button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="hospital-right-column">
          {/* ================= BLOOD NETWORK MAP ================= */}
          <div className="hospital-map-card">
            <div className="hospital-map-header">
              <div>
                <MapPin size={18} />
                <h2>Blood Network Map</h2>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: userLocation ? "#2563eb" : activeMarkers.length > 0 ? "#15803d" : "#64748b",
                  fontWeight: 700,
                }}
              >
                {userLocation
                  ? `📍 GPS Active • ${activeMarkers.length} Mapped`
                  : activeMarkers.length > 0
                  ? `${activeMarkers.length} Verified Locations Mapped`
                  : `Coordinates Pending (${unmappedFacilities.length} Listed)`}
              </span>
            </div>

            <div style={{ marginTop: "10px", marginBottom: "8px" }}>
              <LeafletMapView
                height="280px"
                markers={activeMarkers}
                userLocation={userLocation}
                selectedFacilityId={selectedHospitalId}
                onMarkerClick={(fac) => setSelectedHospitalId(fac.id)}
                fitBounds={true}
                center={
                  userLocation
                    ? { lat: Number(userLocation.latitude), lng: Number(userLocation.longitude) }
                    : activeHospital?.hasCoordinates
                    ? { lat: Number(activeHospital.latitude), lng: Number(activeHospital.longitude) }
                    : STATE_CENTROIDS[appliedState] || { lat: 10.7905, lng: 78.7047 }
                }
              />
            </div>

            {/* Note tracking unmapped facilities without fake coordinates */}
            {unmappedFacilities.length > 0 && activeViewMode !== "nearby" && (
              <div
                style={{
                  margin: "6px 12px",
                  padding: "6px 10px",
                  background: "#f8fafc",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "11px",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <MapPin size={13} color="#94a3b8" />
                <span>
                  {mappedFacilities.length > 0
                    ? `${unmappedFacilities.length} facilities awaiting verified coordinates (not plotted)`
                    : `No verified coordinates for ${appliedDistrict || appliedState} yet (no fake markers plotted)`}
                </span>
              </div>
            )}

            <div className="map-legend" style={{ marginTop: "4px" }}>
              {userLocation && (
                <span>
                  <i style={{ background: "#2563eb", width: "8px", height: "8px", borderRadius: "50%", display: "inline-block" }} />
                  You are here
                </span>
              )}

              <span>
                <i className="legend-red" style={{ background: "#dc2626" }} />
                Hospital
              </span>

              <span>
                <i className="legend-blood" style={{ background: "#881337" }} />
                Blood Bank
              </span>

              <span>
                <i style={{ background: "#059669", width: "8px", height: "8px", borderRadius: "50%", display: "inline-block" }} />
                PHC / CHC
              </span>
            </div>
          </div>

          {/* SELECTED HOSPITAL */}

          <div className="selected-hospital-card facility-selection-card">
            <div className="selected-hospital-header">
              <div>
                <Building2 size={17} />
                <h2>{activeHospital?.name || "Select a Facility"}</h2>
              </div>

              <span>● {activeHospital?.status || "Active"}</span>
            </div>

            <div className="selected-hospital-content">
              <div className="selected-hospital-icon">
                <Building2 size={30} />
              </div>

              <div className="selected-hospital-details">
                <p>
                  <strong>Type</strong>
                  <span>{activeHospital?.type || "Hospital"}</span>
                </p>

                <p>
                  <MapPin size={13} />
                  <strong>District & State</strong>
                  <span>
                    {activeHospital?.district || appliedDistrict}, {activeHospital?.state || appliedState}
                  </span>
                </p>

                {/* Straight-line distance if user location is available */}
                {userLocation && (
                  <p>
                    <Navigation size={13} />
                    <strong>Approx. Distance</strong>
                    <span className="selected-distance-chip" style={{ color: "#1e40af", fontWeight: 700 }}>
                      {activeHospital?.distanceDisplay ||
                        (activeHospital?.hasCoordinates &&
                        activeHospital?.latitude != null &&
                        activeHospital?.longitude != null
                          ? formatDistance(
                              calculateHaversineDistance(
                                userLocation.latitude,
                                userLocation.longitude,
                                activeHospital.latitude,
                                activeHospital.longitude
                              )
                            )
                          : "N/A")}{" "}
                      (Straight-line)
                    </span>
                  </p>
                )}

                <p>
                  <Navigation size={13} />
                  <strong>GPS Coordinates</strong>
                  <span>
                    {activeHospital?.hasCoordinates
                      ? `${Number(activeHospital.latitude).toFixed(4)}° N, ${Number(activeHospital.longitude).toFixed(4)}° E (Verified)`
                      : "Pending GPS Verification"}
                  </span>
                </p>

                <p>
                  <Phone size={13} />
                  <strong>Contact</strong>
                  <span>+91 944{20 + ((activeHospital?.name?.length || 7) % 80)} {10000 + ((activeHospital?.name?.length || 5) * 321)}</span>
                </p>

                <p>
                  <ShieldCheck size={13} />
                  <strong>Network Status</strong>
                  <span>Active Registered Facility</span>
                </p>
              </div>
            </div>

            <div className="selected-hospital-actions">
              <button onClick={() => window.location.href = "/blood-inventory"}>View Inventory</button>

              <button
                onClick={() => {
                  if (activeHospital?.hasCoordinates) {
                    setSelectedHospitalId(activeHospital.id);
                  } else {
                    setNotice(`GPS coordinates for "${activeHospital?.name}" are pending verification.`);
                    setTimeout(() => setNotice(null), 3000);
                  }
                }}
              >
                <MapPin size={13} />
                {activeHospital?.hasCoordinates ? "Focus on Map" : "Coordinates Pending"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM CARDS ================= */}

      <div className="hospital-bottom-grid">
        <div className="hospital-bottom-card trusted">
          <div className="hospital-bottom-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h3>Verified & Trusted</h3>

            <p>
              All hospitals and blood banks are verified by our team to ensure
              reliability and safety.
            </p>
          </div>
        </div>

        <div className="hospital-bottom-card suggest">
          <div className="hospital-bottom-icon">
            <Users size={24} />
          </div>

          <div>
            <h3>Suggest a Hospital/Blood Bank</h3>

            <p>
              Help us grow the network by suggesting nearby hospitals or blood
              banks.
            </p>

            <button onClick={() => setIsSuggestModalOpen(true)}>
              Suggest Now
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="hospital-bottom-card partner">
          <div className="hospital-bottom-icon">
            <Building2 size={24} />
          </div>

          <div>
            <h3>Partner with Us</h3>

            <p>
              Are you a hospital or blood bank? Join BloodChain AI to save more
              lives.
            </p>

            <button onClick={() => setIsAddModalOpen(true)}>
              Register Now
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Add New Hospital / Blood Bank Modal */}
      {isAddModalOpen && (
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
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "560px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              overflow: "hidden",
              maxHeight: "92vh",
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
                <Building2 size={22} />
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Add New Hospital / Blood Bank</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#dbeafe" }}>
                    Register clinical facility to regional BloodChain inventory
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAddError("");
                if (!addForm.name.trim()) {
                  setAddError("Please enter the facility name.");
                  return;
                }
                if (!addForm.address.trim()) {
                  setAddError("Please enter the street address.");
                  return;
                }
                if (!addForm.contact.trim()) {
                  setAddError("Please provide a contact phone number.");
                  return;
                }

                const newFacility = {
                  id: `custom-hosp-${Date.now()}`,
                  name: addForm.name.trim(),
                  type: addForm.type,
                  location: addForm.district || "Trichy",
                  district: addForm.district || "Tiruchirappalli",
                  state: addForm.state || "Tamil Nadu",
                  distance: "1.0 km",
                  groups: addForm.groups,
                  status: addForm.status,
                  address: addForm.address.trim(),
                  contact: addForm.contact.trim(),
                };

                setCustomInstitutions((prev) => [newFacility, ...prev]);
                setSelectedHospitalId(newFacility.id);
                setIsAddModalOpen(false);
                setNotice(`Successfully registered ${newFacility.name} (${newFacility.type}) to regional network!`);
                setTimeout(() => setNotice(null), 4000);
              }}
              style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}
            >
              {addError && (
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
                  <span>{addError}</span>
                </div>
              )}

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                  Facility Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. City Life Care Blood Bank"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Facility Type *
                  </label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Blood Bank">Blood Bank</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Operating Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                  >
                    <option value="Active">Active (24/7 Transfusion)</option>
                    <option value="Limited">Limited Hours</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    State
                  </label>
                  <select
                    value={addForm.state}
                    onChange={(e) => {
                      const newSt = e.target.value;
                      const dists = getDistrictsForState(newSt);
                      setAddForm({ ...addForm, state: newSt, district: dists[0] || "" });
                    }}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                  >
                    {STATES_LIST.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    District
                  </label>
                  <select
                    value={addForm.district}
                    onChange={(e) => setAddForm({ ...addForm, district: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                  >
                    {getDistrictsForState(addForm.state).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                  Street Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24, Cantonment Road, Near Railway Junction"
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 431 2700000"
                    value={addForm.contact}
                    onChange={(e) => setAddForm({ ...addForm, contact: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Available Blood Groups
                  </label>
                  <input
                    type="text"
                    value={addForm.groups}
                    onChange={(e) => setAddForm({ ...addForm, groups: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Suggest Hospital / Blood Bank Modal */}
      {isSuggestModalOpen && (
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
          onClick={() => setIsSuggestModalOpen(false)}
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
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                color: "#fff",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Users size={22} />
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Suggest a Hospital / Blood Bank</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#d1fae5" }}>
                    Help expand regional emergency coverage in {appliedDistrict || "Trichy"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSuggestModalOpen(false)}
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSuggestError("");
                if (!suggestForm.name.trim()) {
                  setSuggestError("Please enter the proposed facility name.");
                  return;
                }
                if (!suggestForm.area.trim()) {
                  setSuggestError("Please specify the area or city.");
                  return;
                }

                setIsSuggestModalOpen(false);
                setNotice(`Thank you! "${suggestForm.name}" has been submitted for network verification.`);
                setSuggestForm({ name: "", type: "Hospital", area: "", contact: "", notes: "" });
                setTimeout(() => setNotice(null), 4000);
              }}
              style={{ padding: "20px 24px" }}
            >
              {suggestError && (
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
                  <span>{suggestError}</span>
                </div>
              )}

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                  Hospital / Blood Bank Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Srirangam Community Trauma Care"
                  value={suggestForm.name}
                  onChange={(e) => setSuggestForm({ ...suggestForm, name: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Facility Type
                  </label>
                  <select
                    value={suggestForm.type}
                    onChange={(e) => setSuggestForm({ ...suggestForm, type: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Blood Bank">Blood Bank</option>
                    <option value="PHC / Clinic">PHC / Clinic</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                    Area / Location *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Srirangam"
                    value={suggestForm.area}
                    onChange={(e) => setSuggestForm({ ...suggestForm, area: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                  Contact Information (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Raman / 0431 2450000"
                  value={suggestForm.contact}
                  onChange={(e) => setSuggestForm({ ...suggestForm, contact: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}>
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us why this facility should be onboarded to the regional blood chain."
                  value={suggestForm.notes}
                  onChange={(e) => setSuggestForm({ ...suggestForm, notes: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14.5px", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsSuggestModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#059669", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                >
                  Submit Suggestion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalsBloodBanks;

