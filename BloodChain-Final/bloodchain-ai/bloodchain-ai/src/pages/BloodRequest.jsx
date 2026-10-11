import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBloodRequests,
  createBloodRequest,
  getDonors,
  INITIAL_REQUESTS,
} from "../services/bloodService";
import {
  STATE_DISTRICTS,
  STATES_LIST,
  getDistrictsForState,
} from "../constants/locationData";
import { getAllVerifiedFacilities } from "../services/facilityService";
import BloodRequestModal from "../components/BloodRequestModal";
import EstimatedCostCard from "../components/EstimatedCostCard";
import LeafletMapView from "../components/maps/LeafletMapView";
import { RequestRecommendationModal } from "../components/predictive";

import {
  FileText,
  Plus,
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Send,
  Users,
  Lightbulb,
  ShieldCheck,
  Clock3,
  Droplets,
  ArrowRight,
  X,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building2,
  Download,
  Sparkles,
  MapPin,
} from "lucide-react";

function BloodRequest() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Requests");

  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [selectedDistrict, setSelectedDistrict] = useState("Tiruchirappalli");
  const [appliedState, setAppliedState] = useState("Tamil Nadu");
  const [appliedDistrict, setAppliedDistrict] = useState("Tiruchirappalli");

  const [bloodGroup, setBloodGroup] = useState("All");
  const [requestType, setRequestType] = useState("All");
  const [status, setStatus] = useState("All");

  const [patientName, setPatientName] = useState("");
  const [requestBloodGroup, setRequestBloodGroup] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState("");
  const [reason, setReason] = useState("");
  const [sidebarError, setSidebarError] = useState("");

  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [notice, setNotice] = useState(null);

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isDonorsModalOpen, setIsDonorsModalOpen] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);
  const [recommendationModalRequest, setRecommendationModalRequest] = useState(null);

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
    setSelectedDistrict(firstDist);
    setAppliedState(newState);
    setAppliedDistrict(firstDist);
  };

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    setSelectedDistrict(newDist);
    setAppliedDistrict(newDist);
  };

  const handleApplyFilter = () => {
    setAppliedState(selectedState);
    setAppliedDistrict(selectedDistrict);
  };

  useEffect(() => {
    let isMounted = true;
    getBloodRequests({ state: appliedState, district: appliedDistrict }).then((data) => {
      if (isMounted && data) {
        setRequests(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [appliedState, appliedDistrict]);

  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      (item.patient || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.hospital || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.group || "").toLowerCase().includes(search.toLowerCase());

    const matchesGroup = bloodGroup === "All" || item.group === bloodGroup;

    const matchesStatus = status === "All" || item.status === status;

    const matchesType = requestType === "All" || item.type === requestType;

    const targetDist = (appliedDistrict || "").toLowerCase();
    const isTrichy = targetDist === "tiruchirappalli" || targetDist === "trichy";
    const matchesDistrict =
      !appliedDistrict ||
      appliedDistrict === "" ||
      appliedDistrict === "All" ||
      (item.hospital || "").toLowerCase().includes(targetDist) ||
      (item.district || "").toLowerCase().includes(targetDist) ||
      (isTrichy && (
        (item.hospital || "").toLowerCase().includes("trichy") ||
        (item.hospital || "").toLowerCase().includes("tiruchirappalli") ||
        (item.hospital || "").toLowerCase().includes("gh") ||
        (item.hospital || "").toLowerCase().includes("srm") ||
        (item.hospital || "").toLowerCase().includes("kauvery") ||
        (item.hospital || "").toLowerCase().includes("apollo") ||
        (item.hospital || "").toLowerCase().includes("govt") ||
        (item.hospital || "").toLowerCase().includes("mgm") ||
        (item.hospital || "").toLowerCase().includes("cauvery")
      ));

    const matchesTab =
      activeTab === "All Requests" ||
      (activeTab === "Fulfilled" && item.status === "Fulfilled") ||
      activeTab === "Incoming Requests" ||
      activeTab === "My Hospital Requests" ||
      (activeTab === "Cancelled" && item.status === "Cancelled");

    return (
      matchesSearch &&
      matchesGroup &&
      matchesStatus &&
      matchesType &&
      matchesDistrict &&
      matchesTab
    );
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRequests = filteredRequests.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleModalSuccess = (newReq) => {
    setRequests((prev) => [newReq, ...prev]);
    setNotice(`Blood request ${newReq.id} created successfully for ${newReq.patient} (${newReq.group})!`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Patient", "Blood Group", "Units", "Hospital", "Type", "Urgency", "Status", "Requested At"];
    const rows = filteredRequests.map((r) => [
      r.id,
      `"${r.patient}"`,
      r.group,
      r.units,
      `"${r.hospital}"`,
      r.type,
      r.urgency,
      r.status,
      `"${r.time}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `blood_requests_${appliedDistrict || "Trichy"}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotice(`Exported ${filteredRequests.length} blood requests to CSV.`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSidebarError("");

    if (!patientName.trim()) {
      setSidebarError("Please enter Patient / Hospital Name.");
      return;
    }
    if (!requestBloodGroup) {
      setSidebarError("Please select a Blood Group.");
      return;
    }
    const unitsNum = parseInt(unitsNeeded, 10);
    if (isNaN(unitsNum) || unitsNum <= 0) {
      setSidebarError("Please enter a valid number of units needed.");
      return;
    }

    try {
      const created = await createBloodRequest({
        patientName: patientName.trim(),
        bloodGroup: requestBloodGroup,
        unitsNeeded: `${unitsNum} Unit${unitsNum > 1 ? "s" : ""}`,
        reason: reason.trim() || "Emergency surgery requirements",
        hospital: `${appliedDistrict || "Trichy"} General Hospital`,
        urgency: "Critical",
      });

      setRequests((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      setNotice(`Blood request created successfully for ${patientName} (${requestBloodGroup})!`);
      // Phase 4: Open AI recommendations for the newly created request
      setRecommendationModalRequest(created);
      setTimeout(() => setNotice(null), 4000);

      setPatientName("");
      setRequestBloodGroup("");
      setUnitsNeeded("");
      setReason("");
    } catch (err) {
      console.error("Error creating request:", err);
      setSidebarError("Failed to submit blood request. Please try again.");
    }
  };


  return (
    <div className="blood-request-page">
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

      <div className="request-page-header">
        <div className="request-title-area">
          <div className="request-main-icon">
            <FileText size={28} />
          </div>

          <div>
            <h1>Blood Request</h1>

            <p>
              View, manage, and respond to blood requests from hospitals and
              patients.
            </p>
          </div>
        </div>

        <div className="request-header-right">
          <div className="request-quote">
            <strong>“A timely response,</strong>
            <span>can save a life.”</span>
          </div>

          <button
            className="new-request-button"
            onClick={() => setIsRequestModalOpen(true)}
          >
            <Plus size={17} />
            New Request
          </button>
        </div>
      </div>


      {/* ================= TABS ================= */}

      <div className="request-tabs">
        {[
          "All Requests",
          "Incoming Requests",
          "My Hospital Requests",
          "Fulfilled",
          "Cancelled",
        ].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= SUMMARY ================= */}

      <div className="request-summary-grid">
        <div className="request-summary-card active-request-card">
          <div className="summary-icon red">
            <Droplets size={25} fill="currentColor" />
          </div>

          <div>
            <strong>5</strong>
            <span>Active Requests</span>
          </div>
        </div>

        <div className="request-summary-card urgent-request-card">
          <div className="summary-icon orange">
            <Clock3 size={25} />
          </div>

          <div>
            <strong>3</strong>
            <span>Urgent Requests</span>
          </div>
        </div>

        <div className="request-summary-card fulfilled-request-card">
          <div className="summary-icon green">
            <ShieldCheck size={25} />
          </div>

          <div>
            <strong>12</strong>
            <span>Fulfilled (This Month)</span>
          </div>
        </div>

        <div className="request-summary-card total-request-card">
          <div className="summary-icon blue">
            <Users size={25} />
          </div>

          <div>
            <strong>48</strong>
            <span>Total Requests</span>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="request-content-grid">
        {/* LEFT SIDE */}

        <div className="request-left-content">
          {/* FILTERS */}

          <div className="request-filter-card">
            <div className="request-select-field">
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

            <div className="request-select-field">
              <label>Select District</label>

              <select
                value={selectedDistrict}
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

            <div className="request-select-field">
              <label>Blood Group</label>

              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option>All</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>
            </div>

            <div className="request-select-field">
              <label>Request Type</label>

              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
              >
                <option>All</option>
                <option>Patient</option>
                <option>Hospital</option>
              </select>
            </div>

            <div className="request-select-field">
              <label>Status</label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>All</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Matched</option>
                <option>Fulfilled</option>
                <option>In Review</option>
              </select>
            </div>

            <div className="request-date-field">
              <label>Date Range</label>

              <div>
                <CalendarDays size={14} />
                <span>16 Sep 2026 - 30 Sep 2026</span>
              </div>
            </div>

            <button className="request-filter-button" onClick={handleApplyFilter}>
              Apply
            </button>
          </div>

          {/* REQUEST TABLE */}

          <section className="request-table-card">
            <div className="request-table-header">
              <div>
                <h2>
                  Blood Requests (
                  {appliedDistrict || appliedState || "All"}
                  )
                </h2>

                <p>Real-time requests from hospitals and patients.</p>
              </div>

              <div className="request-table-tools">
                <div className="request-search">
                  <Search size={15} />

                  <input
                    type="text"
                    placeholder="Search by hospital, patient name, or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <button className="request-export" onClick={handleExportCSV}>
                  <Download size={14} style={{ marginRight: "4px" }} /> Export CSV
                </button>
              </div>
            </div>

            <div className="request-table-wrapper">
              <table className="request-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient Name</th>
                    <th>Blood Group</th>
                    <th>Units Needed</th>
                    <th>Hospital / Location</th>
                    <th>Request Type</th>
                    <th>Urgency</th>
                    <th>Status</th>
                    <th>Requested At</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRequests.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(safeCurrentPage - 1) * pageSize + index + 1}</td>

                      <td>
                        <strong>{item.patient}</strong>
                      </td>

                      <td>
                        <span className="request-blood-badge">
                          {item.group}
                        </span>
                      </td>

                      <td>{item.units}</td>

                      <td>{item.hospital}</td>

                      <td>{item.type}</td>

                      <td>
                        <span
                          className={`urgency-badge ${item.urgency.toLowerCase()}`}
                        >
                          {item.urgency}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`request-status-badge ${item.status
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button
                            className="view-request-button"
                            onClick={() => setSelectedRequestDetail(item)}
                          >
                            View
                          </button>
                          <button
                            className="btn-find-sources-row"
                            onClick={() => setRecommendationModalRequest(item)}
                            title="Find Suitable Blood Sources via AI"
                            style={{
                              padding: "5px 9px",
                              borderRadius: "6px",
                              border: "1px solid #bfdbfe",
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              fontSize: "12px",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Sparkles size={12} color="#2563eb" />
                            <span>Find Sources</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedRequests.length === 0 && (
                    <tr>
                      <td colSpan="10" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                        No blood requests found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="request-pagination">
              <span>
                Showing {filteredRequests.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1} to{" "}
                {Math.min(safeCurrentPage * pageSize, filteredRequests.length)} of {filteredRequests.length} requests
              </span>

              <div>
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
                    className={safeCurrentPage === pageNum ? "active-page" : ""}
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
            </div>
          </section>

          {/* BOTTOM CARDS */}

          <div className="request-bottom-grid">
            <div className="request-ai-card">
              <div className="request-bottom-icon">
                <Lightbulb size={24} />
              </div>

              <div>
                <h3>AI Suggestion</h3>

                <p>
                  2 critical requests (O- and O+) can be fulfilled from nearby
                  blood banks with sufficient stock.
                </p>

                <button onClick={() => setIsSuggestionModalOpen(true)}>
                  View Suggestions
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="request-donor-card">
              <div className="request-bottom-icon">
                <Users size={24} />
              </div>

              <div>
                <h3>Need Donors?</h3>

                <p>Reach out to registered donors near {appliedDistrict || "Trichy"}.</p>

                <button onClick={() => setIsDonorsModalOpen(true)}>
                  Find Donors
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* ================= RIGHT SIDEBAR ================= */}

        <aside className="request-right-sidebar">
          {/* NEW REQUEST */}

          <section className="new-request-card">
            <div className="new-request-heading">
              <div>
                <Send size={20} />
              </div>

              <div>
                <h2>Request a New Blood Supply</h2>

                <p>Create a blood request for your hospital or patient.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest}>
              {sidebarError && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{sidebarError}</span>
                </div>
              )}

              <input
                type="text"
                placeholder="Patient / Hospital Name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />

              <select
                value={requestBloodGroup}
                onChange={(e) => setRequestBloodGroup(e.target.value)}
              >
                <option value="">Select Blood Group</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>O+</option>
                <option>O-</option>
                <option>AB+</option>
                <option>AB-</option>
              </select>

              <input
                type="number"
                min="1"
                placeholder="Units Needed"
                value={unitsNeeded}
                onChange={(e) => setUnitsNeeded(e.target.value)}
              />

              <EstimatedCostCard
                bloodGroup={requestBloodGroup}
                units={unitsNeeded}
                state={appliedState}
                district={appliedDistrict}
              />

              <textarea
                placeholder="Reason (Optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <button type="submit" className="submit-request-button">
                <Send size={15} />
                Submit Request
              </button>
            </form>
          </section>

          {/* URGENCY GUIDE */}

          <section className="urgency-guide-card">
            <div className="side-card-title">
              <ShieldCheck size={19} />

              <h2>Urgency Level Guide</h2>
            </div>

            <div className="urgency-guide-list">
              <div>
                <span className="guide-dot critical" />
                <strong>Critical</strong>
                <small>Needed within 6 hours</small>
              </div>

              <div>
                <span className="guide-dot high" />
                <strong>High</strong>
                <small>Needed within 24 hours</small>
              </div>

              <div>
                <span className="guide-dot medium" />
                <strong>Medium</strong>
                <small>Needed within 3 days</small>
              </div>

              <div>
                <span className="guide-dot low" />
                <strong>Low</strong>
                <small>Needed within 7 days</small>
              </div>
            </div>
          </section>

          {/* LOCATIONS */}

          <section className="request-location-card">
            <div className="side-card-title">
              <div>
                <h2>
                  Request Locations ({appliedDistrict || selectedDistrict || "Trichy"})
                </h2>
              </div>
            </div>

            <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <LeafletMapView
                height="220px"
                markers={getAllVerifiedFacilities()}
                center={{ lat: 10.7905, lng: 78.7047 }}
                zoom={11}
              />
            </div>
          </section>
        </aside>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. New Blood Request Modal */}
      <BloodRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={handleModalSuccess}
        defaultDistrict={appliedDistrict}
        defaultState={appliedState}
      />

      {/* 2. AI Blood Matching Suggestions Modal */}
      {isSuggestionModalOpen && (
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
          onClick={() => setIsSuggestionModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "600px",
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
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Lightbulb size={24} />
                <div>
                  <h2 style={{ margin: 0, fontSize: "19px", color: "#fff" }}>AI Matching Suggestions</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#dbeafe" }}>
                    Optimal regional facilities ready to fulfill urgent blood demand
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSuggestionModalOpen(false)}
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

            <div style={{ padding: "20px 24px", maxHeight: "75vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  {
                    name: "Trichy Blood Bank",
                    group: "O+",
                    units: 120,
                    distance: "1.2 km",
                    match: "98% Match",
                    badge: "Highest Stock",
                    eta: "15 mins",
                  },
                  {
                    name: "Apollo Hospital Blood Center",
                    group: "O-",
                    units: 60,
                    distance: "7.4 km",
                    match: "94% Match",
                    badge: "Rare Group Stock",
                    eta: "25 mins",
                  },
                  {
                    name: "SRM Medical College Blood Bank",
                    group: "A+",
                    units: 45,
                    distance: "5.6 km",
                    match: "89% Match",
                    badge: "Rapid Transit",
                    eta: "20 mins",
                  },
                ].map((sug, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "16px",
                      background: "#f9fafb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "16px", color: "#111827" }}>{sug.name}</strong>
                        <span style={{ background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
                          {sug.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", color: "#4b5563", display: "flex", gap: "12px" }}>
                        <span>Available: <b>{sug.units} units ({sug.group})</b></span>
                        <span>Distance: <b>{sug.distance}</b></span>
                        <span>ETA: <b>{sug.eta}</b></span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsSuggestionModalOpen(false);
                        setNotice(`Inter-bank transfer request successfully initiated with ${sug.name}!`);
                        setTimeout(() => setNotice(null), 4000);
                      }}
                      style={{
                        padding: "8px 14px",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Request Transfer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Find Donors Modal */}
      {isDonorsModalOpen && (
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
          onClick={() => setIsDonorsModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "620px",
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
                <Users size={24} />
                <div>
                  <h2 style={{ margin: 0, fontSize: "19px", color: "#fff" }}>Nearby Volunteer Donors</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#d1fae5" }}>
                    Verified registered donors available near {appliedDistrict || "Trichy"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDonorsModalOpen(false)}
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

            <div style={{ padding: "20px 24px", maxHeight: "75vh", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { name: "Dinesh K", age: 22, blood: "O+", loc: "Trichy Cantonment", phone: "+91 98765 11001", status: "Available Now" },
                  { name: "Hari Prasath S", age: 24, blood: "O+", loc: "Srirangam", phone: "+91 98765 11002", status: "Available Now" },
                  { name: "Karthik V", age: 25, blood: "A+", loc: "Thillai Nagar", phone: "+91 98765 11004", status: "Available Now" },
                  { name: "Praveen S", age: 22, blood: "O-", loc: "Mannachanallur", phone: "+91 98765 11007", status: "Available Now" },
                ].map((donor, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "15px", color: "#111827" }}>{donor.name}</strong>
                        <span style={{ background: "#fee2e2", color: "#991b1b", padding: "1px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 700 }}>
                          {donor.blood}
                        </span>
                        <span style={{ fontSize: "13px", color: "#6b7280" }}>({donor.age} yrs)</span>
                      </div>
                      <div style={{ fontSize: "13.5px", color: "#4b5563", marginTop: "3px" }}>
                        📍 {donor.loc} • <span style={{ color: "#059669", fontWeight: 600 }}>{donor.status}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          setIsDonorsModalOpen(false);
                          setNotice(`Contact alert dispatched to donor ${donor.name} (${donor.phone})!`);
                          setTimeout(() => setNotice(null), 4000);
                        }}
                        style={{
                          padding: "7px 12px",
                          background: "#059669",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Phone size={13} /> Call Donor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Request Detail Modal */}
      {selectedRequestDetail && (
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
          onClick={() => setSelectedRequestDetail(null)}
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
                background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
                color: "#fff",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "19px", color: "#fff" }}>
                  Request Details — {selectedRequestDetail.id}
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#fecaca" }}>
                  Status: <b>{selectedRequestDetail.status}</b> • Urgency: <b>{selectedRequestDetail.urgency}</b>
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestDetail(null)}
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
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Patient / Case</small>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>{selectedRequestDetail.patient}</div>
                </div>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Blood Group & Units</small>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#dc2626" }}>
                    {selectedRequestDetail.group} ({selectedRequestDetail.units})
                  </div>
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                <small style={{ color: "#6b7280", fontSize: "12px" }}>Hospital / Requesting Facility</small>
                <div style={{ fontWeight: 600, fontSize: "15px", color: "#111827" }}>{selectedRequestDetail.hospital}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Requested Timestamp</small>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#374151" }}>{selectedRequestDetail.time}</div>
                </div>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Request Type</small>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#374151" }}>{selectedRequestDetail.type}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setSelectedRequestDetail(null)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                <button
                  className="btn-find-sources-detail"
                  onClick={() => {
                    const req = selectedRequestDetail;
                    setSelectedRequestDetail(null);
                    setRecommendationModalRequest(req);
                  }}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2563eb",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles size={16} />
                  <span>Find Suitable Blood Sources</span>
                </button>
                <button
                  onClick={() => {
                    const id = selectedRequestDetail.id;
                    setRequests((prev) =>
                      prev.map((r) => (r.id === id ? { ...r, status: "Fulfilled" } : r))
                    );
                    setSelectedRequestDetail(null);
                    setNotice(`Request ${id} marked as Fulfilled.`);
                    setTimeout(() => setNotice(null), 3000);
                  }}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#16a34a",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Mark as Fulfilled
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Phase 4 & Phase 5: Intelligent AI Source Recommendation Modal */}
      <RequestRecommendationModal
        isOpen={!!recommendationModalRequest}
        onClose={() => setRecommendationModalRequest(null)}
        request={recommendationModalRequest}
        onNavigateToTransfer={(candidate) => {
          navigate("/approval-transfer", {
            state: {
              sourceCandidate: candidate,
              bloodRequest: recommendationModalRequest,
            },
          });
        }}
      />

      {/* 6. New Blood Request Modal with Dynamic Cost Estimation */}
      <BloodRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultDistrict={appliedDistrict}
        defaultState={appliedState}
        onSuccess={async (newReq) => {
          try {
            const created = await createBloodRequest({
              patientName: newReq.patient,
              bloodGroup: newReq.group,
              unitsNeeded: newReq.units,
              hospital: newReq.hospital,
              district: newReq.district,
              urgency: newReq.urgency,
              reason: newReq.reason,
            });
            setRequests((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
            setNotice(`Blood request created successfully for ${newReq.patient} (${newReq.group})!`);
            setRecommendationModalRequest(created);
          } catch (err) {
            console.error("Failed to create request from modal:", err);
          }
        }}
      />
    </div>
  );
}

export default BloodRequest;

