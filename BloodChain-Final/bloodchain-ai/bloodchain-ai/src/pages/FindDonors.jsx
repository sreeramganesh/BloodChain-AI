import { useState, useEffect, useMemo } from "react";
import {
  getDonors,
  registerDonor,
  INITIAL_DONORS,
} from "../services/bloodService";
import {
  STATE_DISTRICTS,
  STATES_LIST,
  getDistrictsForState,
} from "../constants/locationData";
import {
  getCurrentUserLocation,
  GEOLOCATION_ERRORS,
} from "../services/geolocationService";
import {
  getApproximateDonorCoordinates,
  findNearbyDonors,
  formatDistance,
  calculateHaversineDistance,
  DEFAULT_NEARBY_RADIUS_KM,
  NEARBY_RADIUS_OPTIONS,
} from "../utils/geoUtils";
import LeafletMapView from "../components/maps/LeafletMapView";
import DonorRegistrationModal from "../components/DonorRegistrationModal";
import BloodRequestModal from "../components/BloodRequestModal";

import {
  Users,
  Droplets,
  MapPin,
  Search,
  RotateCcw,
  Phone,
  ChevronLeft,
  ChevronRight,
  Send,
  Bell,
  Share2,
  FileText,
  Heart,
  ArrowRight,
  X,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Mail,
  Copy,
  Navigation,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";

function FindDonors() {
  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Tiruchirappalli");
  const [appliedState, setAppliedState] = useState("Tamil Nadu");
  const [appliedDistrict, setAppliedDistrict] = useState("Tiruchirappalli");

  const [bloodGroup, setBloodGroup] = useState("All");
  const [distance, setDistance] = useState("Within 10 km");
  const [availability, setAvailability] = useState("Available Now");
  const [gender, setGender] = useState("All");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [donors, setDonors] = useState(INITIAL_DONORS);

  // Phase 3 — GPS & Proximity State
  const [userLocation, setUserLocation] = useState(null); // { latitude, longitude, accuracy }
  const [locationStatus, setLocationStatus] = useState("idle"); // "idle" | "requesting" | "success" | "denied" | "timeout" | "unsupported" | "unavailable"
  const [locationError, setLocationError] = useState(null);
  const [selectedRadius, setSelectedRadius] = useState(DEFAULT_NEARBY_RADIUS_KM);
  const [activeViewMode, setActiveViewMode] = useState("directory"); // "directory" | "nearby"
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [compatibleOnly, setCompatibleOnly] = useState(false);

  // Notice and Modals
  const [notice, setNotice] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState(false);
  const [selectedDonorProfile, setSelectedDonorProfile] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const districts = getDistrictsForState(newState);
    const firstDist = districts.length > 0 ? districts[0] : "";
    setDistrict(firstDist);
    setAppliedState(newState);
    setAppliedDistrict(firstDist);
    setSelectedDonorId(null);
    setActiveViewMode("directory");
    setCurrentPage(1);
  };

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    setDistrict(newDist);
    setAppliedDistrict(newDist);
    setSelectedDonorId(null);
    setActiveViewMode("directory");
    setCurrentPage(1);
  };

  // Phase 3 — Request User GPS Location
  const handleUseMyLocation = async () => {
    setLocationStatus("requesting");
    setLocationError(null);

    const res = await getCurrentUserLocation();

    if (res.success && res.coords) {
      setUserLocation(res.coords);
      setLocationStatus("success");
      setActiveViewMode("nearby");
      setSelectedDonorId(null);
      setCurrentPage(1);
      setNotice("GPS location detected! Showing donors sorted by nearest distance.");
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

  useEffect(() => {
    let isMounted = true;
    getDonors({ state: appliedState, district: appliedDistrict }).then((data) => {
      if (isMounted && data && data.length > 0) {
        setDonors(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [appliedState, appliedDistrict]);

  const handleRegisterDonorSuccess = (newDonor) => {
    setDonors((prev) => [newDonor, ...prev]);
    setNotice(`Volunteer donor ${newDonor.name} (${newDonor.bloodGroup || newDonor.blood_group}) registered successfully!`);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      const query = (appliedSearch || search).trim().toLowerCase();

      const matchesSearch =
        !query ||
        (donor.name || "").toLowerCase().includes(query) ||
        (donor.location || "").toLowerCase().includes(query) ||
        (donor.blood_group || "").toLowerCase().includes(query) ||
        (donor.bloodGroup || "").toLowerCase().includes(query);

      const matchesGender = gender === "All" || donor.gender === gender;

      const matchesBlood =
        bloodGroup === "All" ||
        donor.blood_group === bloodGroup ||
        donor.bloodGroup === bloodGroup;

      const targetDist = (appliedDistrict || district || "").toLowerCase();
      const isTrichy = targetDist === "tiruchirappalli" || targetDist === "trichy";
      const matchesDistrict =
        !targetDist ||
        targetDist === "all" ||
        (donor.location || "").toLowerCase().includes(targetDist) ||
        (donor.district || "").toLowerCase().includes(targetDist) ||
        (isTrichy && (
          (donor.location || "").toLowerCase().includes("trichy") ||
          (donor.location || "").toLowerCase().includes("tiruchirappalli") ||
          (donor.location || "").toLowerCase().includes("srirangam") ||
          (donor.location || "").toLowerCase().includes("thuvakudi") ||
          (donor.location || "").toLowerCase().includes("lalgudi") ||
          (donor.location || "").toLowerCase().includes("thillai nagar") ||
          (donor.location || "").toLowerCase().includes("mannachanallur")
        ));

      return matchesSearch && matchesGender && matchesBlood && matchesDistrict;
    });
  }, [donors, appliedSearch, search, gender, bloodGroup, appliedDistrict, district]);

  // Phase 3 — Nearby donors filtered strictly via Haversine distance, sorted nearest first
  const nearbyDonors = useMemo(() => {
    if (!userLocation) return [];
    return findNearbyDonors({
      userLat: userLocation.latitude,
      userLng: userLocation.longitude,
      donors,
      radiusKm: selectedRadius,
      bloodGroup: bloodGroup === "All" ? null : bloodGroup,
      compatibleOnly: compatibleOnly && bloodGroup !== "All",
    });
  }, [userLocation, donors, selectedRadius, bloodGroup, compatibleOnly]);

  // Phase 3 — Enrich directory donors with straight-line Haversine distance when GPS is active
  const directoryDonorsWithDistance = useMemo(() => {
    return filteredDonors.map((donor) => {
      if (userLocation) {
        const coords = getApproximateDonorCoordinates(donor);
        if (coords) {
          const dist = calculateHaversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            coords.lat,
            coords.lng
          );
          return {
            ...donor,
            distanceKm: dist,
            distanceDisplay: formatDistance(dist),
            hasCoordinates: true,
          };
        }
      }
      return {
        ...donor,
        hasCoordinates: Boolean(getApproximateDonorCoordinates(donor)),
      };
    });
  }, [filteredDonors, userLocation]);

  // Active displayed donor list (Nearby vs District Directory)
  const displayDonors = activeViewMode === "nearby" ? nearbyDonors : directoryDonorsWithDistance;

  // Active markers on Leaflet Map (Privacy-preserving centroids; excluded if no coordinates)
  const activeDonorMarkers = useMemo(() => {
    return displayDonors
      .map((donor) => {
        const coords = getApproximateDonorCoordinates(donor);
        if (!coords) return null;
        return {
          id: donor.id || `donor-${donor.name}`,
          name: donor.name,
          bloodGroup: donor.bloodGroup || donor.blood_group,
          latitude: coords.lat,
          longitude: coords.lng,
          isDonor: true,
          markerType: "donor",
          distance: donor.distanceKm,
          distanceDisplay: donor.distanceDisplay,
          status: donor.status || donor.availability || "Available",
          localityArea: donor.location || donor.district,
          donor: donor,
        };
      })
      .filter(Boolean);
  }, [displayDonors]);

  const totalPages = Math.max(1, Math.ceil(displayDonors.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDonors = displayDonors.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setAppliedState(selectedState);
    setAppliedDistrict(district);
    setSelectedDonorId(null);
    setCurrentPage(1);
    setNotice(`Found ${displayDonors.length} donors matching your search.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleReset = () => {
    setSelectedState("Tamil Nadu");
    setDistrict("Tiruchirappalli");
    setAppliedState("Tamil Nadu");
    setAppliedDistrict("Tiruchirappalli");
    setBloodGroup("All");
    setDistance("Within 10 km");
    setAvailability("Available Now");
    setGender("All");
    setSearch("");
    setAppliedSearch("");
    setCompatibleOnly(false);
    setSelectedDonorId(null);
    setActiveViewMode("directory");
    setCurrentPage(1);
    setNotice("All donor search filters have been reset.");
    setTimeout(() => setNotice(null), 3000);
  };

  const handleContact = (donor) => {
    setNotice(`Emergency contact alert sent to ${donor.name} (${donor.phone || "+91 98765 00000"}).`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleView = (donor) => {
    setSelectedDonorProfile(donor);
  };


  return (
    <div className="find-donors-page">
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

      {/* ================= HEADER ================= */}

      <div className="donor-page-header">
        <div className="donor-title-area">
          <div className="donor-main-icon">
            <Users size={29} />
          </div>

          <div>
            <h1>Find Donors</h1>

            <p>Search and connect with volunteer blood donors near you.</p>
          </div>
        </div>

        <div className="donor-header-right">
          <div className="donor-quote">
            <strong>“Real people. Real impact.”</strong>

            <span>Be the reason someone lives.”</span>
          </div>

          {/* Phase 3 — Use My Location Button */}
          <button
            className="btn-location-gps"
            onClick={handleUseMyLocation}
            disabled={locationStatus === "requesting"}
            style={{
              height: "40px",
              padding: "0 14px",
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
                <span>Permission Denied</span>
              </>
            ) : (
              <>
                <Navigation size={15} color="#2563eb" />
                <span>Use My Location</span>
              </>
            )}
          </button>

          <button
            className="register-donor-button"
            onClick={() => setIsRegisterModalOpen(true)}
          >
            <Users size={16} />
            Register New Donor
          </button>
        </div>
      </div>


      {/* ================= SUMMARY ================= */}

      <div className="donor-summary-grid">
        <div className="donor-summary-card donor-red-card">
          <div className="donor-summary-icon red">
            <Users size={25} />
          </div>

          <div>
            <strong>{filteredDonors.length > 0 ? (filteredDonors.length * 35).toLocaleString("en-IN") : 240}</strong>
            <span>Registered Donors</span>
            <small>in {appliedDistrict || district || "Trichy"}</small>
          </div>
        </div>

        <div className="donor-summary-card donor-blue-card">
          <div className="donor-summary-icon blue">
            <Droplets size={25} />
          </div>

          <div>
            <strong>{filteredDonors.filter(d => (d.blood_group || d.bloodGroup) === "O+").length || 8}</strong>
            <span>O+ Donors</span>
            <small>Available</small>
          </div>
        </div>

        <div className="donor-summary-card donor-green-card">
          <div className="donor-summary-icon green">
            <MapPin size={25} />
          </div>

          <div>
            <strong>{filteredDonors.length}</strong>
            <span>Nearby Donors</span>
            <small>Within district</small>
          </div>
        </div>

        <div className="donor-summary-card donor-purple-card">
          <div className="donor-summary-icon purple">
            <Users size={25} />
          </div>

          <div>
            <strong>{Math.max(2, Math.floor(filteredDonors.length * 0.6))}</strong>
            <span>Active Donors</span>
            <small>This Month</small>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="donor-filter-card">
        <div className="donor-filter-field">
          <label>Select State</label>

          <select value={selectedState} onChange={handleStateChange}>
            <option value="">Select State</option>
            {STATES_LIST.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="donor-filter-field">
          <label>Select District</label>

          <select
            value={district}
            onChange={handleDistrictChange}
            disabled={!selectedState || availableDistricts.length === 0}
          >
            {!selectedState ? (
              <option value="">Select District</option>
            ) : (
              <>
                <option value="">All Districts</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div className="donor-filter-field">
          <label>Blood Group</label>

          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          >
            <option value="All">All</option>
            <option>O+</option>
            <option>O-</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
        </div>

        <div className="donor-filter-field">
          <label>Distance</label>

          <select
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
          >
            <option>Within 5 km</option>
            <option>Within 10 km</option>
            <option>Within 25 km</option>
            <option>Within 50 km</option>
          </select>
        </div>

        <div className="donor-filter-field">
          <label>Availability</label>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option>Available Now</option>
            <option>Available Today</option>
            <option>All</option>
          </select>
        </div>

        <div className="donor-filter-field">
          <label>Gender</label>

          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option>All</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        <button className="donor-search-button" onClick={handleSearch}>
          <Search size={16} />
          Search
        </button>

        <button className="donor-reset-button" onClick={handleReset}>
          <RotateCcw size={15} />
          Reset Filters
        </button>
      </div>

      {/* ================= PHASE 3: GPS PROXIMITY BAR ================= */}
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
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Navigation size={17} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e3a8a" }}>Your GPS Location Active</span>
                <span className="gps-user-coords" style={{ fontSize: "11px", fontWeight: "600", background: "#dbeafe", color: "#1e40af", padding: "1px 7px", borderRadius: "9999px" }}>
                  {userLocation.latitude.toFixed(4)}° N, {userLocation.longitude.toFixed(4)}° E
                </span>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>Straight-line Haversine distance calculated locally • Zero remote tracking</p>
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
                style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #93c5fd", background: "#fff", fontSize: "12px", fontWeight: "700", color: "#1e3a8a", cursor: "pointer", outline: "none" }}
              >
                {NEARBY_RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r} km {r === DEFAULT_NEARBY_RADIUS_KM ? "(Default)" : ""}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: "inline-flex", background: "#dbeafe", padding: "3px", borderRadius: "7px", gap: "3px" }}>
              <button
                onClick={() => setActiveViewMode("nearby")}
                style={{ padding: "5px 12px", borderRadius: "5px", border: "none", background: activeViewMode === "nearby" ? "#2563eb" : "transparent", color: activeViewMode === "nearby" ? "#fff" : "#1e40af", fontSize: "11.5px", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease" }}
              >
                Nearby ({nearbyDonors.length})
              </button>
              <button
                onClick={() => setActiveViewMode("directory")}
                style={{ padding: "5px 12px", borderRadius: "5px", border: "none", background: activeViewMode === "directory" ? "#2563eb" : "transparent", color: activeViewMode === "directory" ? "#fff" : "#1e40af", fontSize: "11.5px", fontWeight: "700", cursor: "pointer", transition: "all 0.15s ease" }}
              >
                District ({filteredDonors.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT ================= */}

      <div className="donor-main-grid">
        {/* DONOR TABLE */}

        <section className="donor-table-card">
          <div className="donor-table-header">
            <div className="donor-table-title">
              <Users size={23} />

              <h2>
                {activeViewMode === "nearby"
                  ? `Nearby Donors (${nearbyDonors.length}) — ${selectedRadius}km radius`
                  : `Available Donors (${bloodGroup === "All" ? "All Groups" : bloodGroup}) — ${appliedDistrict || district || appliedState || "All"}`}
              </h2>
            </div>

            <span>
              Showing {displayDonors.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1} to{" "}
              {Math.min(safeCurrentPage * pageSize, displayDonors.length)} of {displayDonors.length} donors
            </span>
          </div>

          <div className="donor-table-wrapper">
            <table className="donor-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Blood</th>
                  <th>Age / Gender</th>
                  <th>Location</th>
                  {userLocation && <th>Distance</th>}
                  <th>Availability</th>
                  <th>Contact</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedDonors.map((donor, index) => {
                  const isRowSelected = selectedDonorId === (donor.id || `donor-${donor.name}`);
                  return (
                    <tr
                      key={donor.id || index}
                      onClick={() => setSelectedDonorId(donor.id || `donor-${donor.name}`)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isRowSelected ? "#fef2f2" : undefined,
                        borderLeft: isRowSelected ? "3px solid #e11d48" : "3px solid transparent",
                      }}
                    >
                      <td>{(safeCurrentPage - 1) * pageSize + index + 1}</td>

                      <td><strong>{donor.name}</strong></td>

                      <td>
                        <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 7px", borderRadius: "9999px", fontWeight: 800, fontSize: "12px" }}>
                          {donor.blood_group || donor.bloodGroup || "—"}
                        </span>
                      </td>

                      <td>{donor.age} / {donor.gender}</td>

                      <td>{donor.location}</td>

                      {userLocation && (
                        <td>
                          {donor.distanceDisplay && donor.distanceDisplay !== "N/A" ? (
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e40af", background: "#eff6ff", padding: "2px 7px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                              📍 {donor.distanceDisplay}
                            </span>
                          ) : <span style={{ fontSize: "11px", color: "#94a3b8" }}>—</span>}
                        </td>
                      )}

                      <td>
                        <span className="donor-available-badge">
                          {donor.availability || "Available"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="donor-contact-button"
                          onClick={(e) => { e.stopPropagation(); handleContact(donor); }}
                        >
                          <Phone size={12} />
                          Contact
                        </button>
                      </td>

                      <td>
                        <button
                          className="donor-view-button"
                          onClick={(e) => { e.stopPropagation(); handleView(donor); }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {paginatedDonors.length === 0 && (
                  <tr>
                    <td colSpan={userLocation ? 9 : 8} style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                      {activeViewMode === "nearby"
                        ? `No donors found within ${selectedRadius}km. Try increasing the radius.`
                        : "No volunteer donors found matching the selected search criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="donor-pagination">
            <button
              disabled={safeCurrentPage === 1}
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              style={{ opacity: safeCurrentPage === 1 ? 0.4 : 1, cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer" }}
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={safeCurrentPage === pageNum ? "active" : ""}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={safeCurrentPage === totalPages}
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              style={{ opacity: safeCurrentPage === totalPages ? 0.4 : 1, cursor: safeCurrentPage === totalPages ? "not-allowed" : "pointer" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* ================= RIGHT SIDE ================= */}

        <aside className="donor-right-sidebar">
          {/* ================= PHASE 3: LEAFLET DONOR MAP ================= */}

          <section className="donor-map-card">
            <div className="donor-side-title">
              <div>
                <MapPin size={20} />
              </div>

              <h2>Donors Near You (Map View)</h2>

              <span
                style={{
                  fontSize: "11px",
                  color: userLocation ? "#2563eb" : activeDonorMarkers.length > 0 ? "#15803d" : "#64748b",
                  fontWeight: 700,
                }}
              >
                {userLocation
                  ? `📍 GPS Active • ${activeDonorMarkers.length} Mapped`
                  : activeDonorMarkers.length > 0
                  ? `${activeDonorMarkers.length} Donors Mapped`
                  : "Enable GPS to see donor proximity"}
              </span>
            </div>

            <div style={{ marginTop: "10px", marginBottom: "8px" }}>
              <LeafletMapView
                height="260px"
                markers={activeDonorMarkers}
                userLocation={userLocation}
                selectedFacilityId={selectedDonorId}
                onMarkerClick={(m) => setSelectedDonorId(m.id)}
                fitBounds={true}
                center={
                  userLocation
                    ? { lat: Number(userLocation.latitude), lng: Number(userLocation.longitude) }
                    : { lat: 10.7905, lng: 78.7047 }
                }
              />
            </div>

            {/* Privacy notice */}
            <div
              style={{
                margin: "4px 0 2px",
                padding: "5px 10px",
                background: "#f8fafc",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                fontSize: "10.5px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              🔒 Pins show approximate locality only. Exact addresses never revealed.
            </div>

            <div className="map-legend" style={{ marginTop: "4px" }}>
              {userLocation && (
                <span>
                  <i style={{ background: "#2563eb", width: "8px", height: "8px", borderRadius: "50%", display: "inline-block" }} />
                  You are here
                </span>
              )}
              <span>
                <i className="red-dot" />
                Available Donor
              </span>
            </div>
          </section>

          {/* QUICK ACTIONS */}

          <section className="quick-actions-card">
            <div className="quick-actions-title">
              <Heart size={20} />
              <h2>Quick Actions</h2>
            </div>

            <div className="quick-action-grid">
              <button onClick={() => setIsRequestModalOpen(true)}>
                <Send size={16} />
                Send Blood Request
              </button>

              <button
                onClick={() => {
                  setNotice(`Emergency notification dispatched to nearby ${bloodGroup === "All" ? "all-group" : bloodGroup} donors.`);
                  setTimeout(() => setNotice(null), 4000);
                }}
              >
                <Bell size={16} />
                Notify Nearby Donors
              </button>

              <button
                onClick={() => {
                  if (navigator?.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                  }
                  setNotice("Donor registration and search link copied to clipboard!");
                  setTimeout(() => setNotice(null), 3000);
                }}
              >
                <Share2 size={16} />
                Share Request Link
              </button>

              <button onClick={() => setIsGuidelinesModalOpen(true)}>
                <FileText size={16} />
                View Donor Guidelines
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* ================= BOTTOM CARDS ================= */}

      <div className="donor-bottom-grid">
        <div className="need-donor-card">
          <div className="bottom-donor-icon red">
            <Users size={25} />
          </div>

          <div>
            <h2>Need More Donors?</h2>

            <p>
              If you couldn't find enough donors, try expanding the search
              radius or notify registered donors in nearby districts.
            </p>
          </div>

          <button
            onClick={() => {
              setDistance("Within 50 km");
              setNotice("Search radius extended to within 50 km.");
              setTimeout(() => setNotice(null), 3000);
            }}
          >
            Expand Search
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="become-donor-card">
          <div className="bottom-donor-icon blue">
            <Heart size={25} />
          </div>

          <div>
            <h2>Become a Donor</h2>

            <p>Not a donor yet? Register now and help save lives.</p>
          </div>

          <button onClick={() => setIsRegisterModalOpen(true)}>
            Register Now
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Register Donor Modal */}
      <DonorRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={handleRegisterDonorSuccess}
        defaultDistrict={appliedDistrict || district}
        defaultBloodGroup={bloodGroup === "All" ? "O+" : bloodGroup}
      />

      {/* 2. Blood Request Modal */}
      <BloodRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={(newReq) => {
          setNotice(`Blood request ${newReq.id} created successfully!`);
          setTimeout(() => setNotice(null), 4000);
        }}
        defaultDistrict={appliedDistrict || district}
        defaultState={appliedState || selectedState}
      />

      {/* 3. Donor Profile Detail Modal */}
      {selectedDonorProfile && (
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
          onClick={() => setSelectedDonorProfile(null)}
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
              <div>
                <h2 style={{ margin: 0, fontSize: "19px", color: "#fff" }}>{selectedDonorProfile.name}</h2>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#d1fae5" }}>
                  Verified Volunteer Blood Donor Profile
                </p>
              </div>
              <button
                onClick={() => setSelectedDonorProfile(null)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
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

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Blood Group</small>
                  <div style={{ fontWeight: 800, fontSize: "18px", color: "#dc2626" }}>
                    {selectedDonorProfile.blood_group || selectedDonorProfile.bloodGroup || "O+"}
                  </div>
                </div>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Age & Gender</small>
                  <div style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>
                    {selectedDonorProfile.age} yrs • {selectedDonorProfile.gender}
                  </div>
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                <small style={{ color: "#6b7280", fontSize: "12px" }}>Location & District</small>
                <div style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>
                  📍 {selectedDonorProfile.location}, {selectedDonorProfile.district || appliedDistrict || "Trichy"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Last Donation Date</small>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#374151" }}>
                    {selectedDonorProfile.lastDonation || "None recorded"}
                  </div>
                </div>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Availability</small>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#059669" }}>
                    {selectedDonorProfile.availability || "Available Now"}
                  </div>
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                <small style={{ color: "#6b7280", fontSize: "12px" }}>Contact Phone</small>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
                  📞 {selectedDonorProfile.phone || "+91 98765 00000"}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  onClick={() => setSelectedDonorProfile(null)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontSize: "14.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleContact(selectedDonorProfile);
                    setSelectedDonorProfile(null);
                  }}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#059669",
                    color: "#fff",
                    fontSize: "14.5px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <Phone size={15} /> Contact Donor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Donor Guidelines Modal */}
      {isGuidelinesModalOpen && (
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
          onClick={() => setIsGuidelinesModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "560px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              overflow: "hidden",
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={22} />
                <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Blood Donation Safety Guidelines</h2>
              </div>
              <button
                onClick={() => setIsGuidelinesModalOpen(false)}
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

            <div style={{ padding: "20px 24px", fontSize: "14.5px", color: "#374151", lineHeight: 1.6 }}>
              <ul style={{ paddingLeft: "20px", margin: "0 0 16px 0" }}>
                <li><b>Age:</b> 18 to 65 years old.</li>
                <li><b>Weight:</b> At least 45 kg (or 50 kg for double red cell donations).</li>
                <li><b>Hemoglobin:</b> Minimum 12.5 g/dL.</li>
                <li><b>Interval:</b> At least 3 months for whole blood donations.</li>
                <li><b>General Health:</b> Free from active cold, flu, fever, or medication restrictions.</li>
              </ul>
              <div style={{ textAlign: "right" }}>
                <button
                  onClick={() => setIsGuidelinesModalOpen(false)}
                  style={{
                    padding: "8px 18px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FindDonors;

