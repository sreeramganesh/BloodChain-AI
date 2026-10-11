import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getTransfers,
  updateTransferStatus,
  INITIAL_TRANSFERS,
} from "../services/bloodService";
import { createNotification } from "../services/notificationService";
import {
  STATE_DISTRICTS,
  STATES_LIST,
  getDistrictsForState,
} from "../constants/locationData";
import {
  Truck,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ChevronDown,
  CalendarDays,
  MapPin,
  Navigation,
  Lightbulb,
  Users,
  ShieldCheck,
  ArrowRight,
  X,
  Phone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Thermometer,
} from "lucide-react";

function ApprovalTransfer({ user: propUser }) {
  const { user: authUser } = useAuth();
  const user = propUser || authUser;

  const [transferRequests, setTransferRequests] = useState(INITIAL_TRANSFERS);
  const [selectedTransfer, setSelectedTransfer] = useState(INITIAL_TRANSFERS[0]);
  const [selectedStatus, setSelectedStatus] = useState("Pending");

  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [selectedDistrict, setSelectedDistrict] = useState("Tiruchirappalli");
  const [appliedState, setAppliedState] = useState("Tamil Nadu");
  const [appliedDistrict, setAppliedDistrict] = useState("Tiruchirappalli");

  const [activeTab, setActiveTab] = useState("All Requests");
  const [filterBloodGroup, setFilterBloodGroup] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [notice, setNotice] = useState(null);
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;


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

  const handleApplyFilters = () => {
    setAppliedState(selectedState);
    setAppliedDistrict(selectedDistrict);
  };

  useEffect(() => {
    let isMounted = true;
    getTransfers({ state: appliedState, district: appliedDistrict }).then((data) => {
      if (isMounted && data && data.length > 0) {
        setTransferRequests(data);
        setSelectedTransfer(data[0]);
        setSelectedStatus(data[0].status);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [appliedState, appliedDistrict]);

  const handleApprove = async () => {
    if (!selectedTransfer) return;
    const res = await updateTransferStatus(selectedTransfer.id, "Approved", selectedTransfer.status);
    if (res.success) {
      setSelectedStatus("Approved");
      setSelectedTransfer((prev) => ({ ...prev, status: "Approved" }));
      setTransferRequests((prev) =>
        prev.map((t) => (t.id === selectedTransfer.id ? { ...t, status: "Approved" } : t))
      );
    } else {
      alert(res.error || "Failed to approve transfer.");
    }
  };

  const handleReject = async () => {
    if (!selectedTransfer) return;
    const res = await updateTransferStatus(selectedTransfer.id, "Rejected", selectedTransfer.status);
    if (res.success) {
      setSelectedStatus("Rejected");
      setSelectedTransfer((prev) => ({ ...prev, status: "Rejected" }));
      setTransferRequests((prev) =>
        prev.map((t) => (t.id === selectedTransfer.id ? { ...t, status: "Rejected" } : t))
      );
    } else {
      alert(res.error || "Failed to reject transfer.");
    }
  };

  const handleDispatch = async () => {
    if (!selectedTransfer) return;
    const res = await updateTransferStatus(selectedTransfer.id, "In Transit", selectedTransfer.status);
    if (res.success) {
      setSelectedStatus("In Transit");
      setSelectedTransfer((prev) => ({ ...prev, status: "In Transit" }));
      setTransferRequests((prev) =>
        prev.map((t) => (t.id === selectedTransfer.id ? { ...t, status: "In Transit" } : t))
      );

      // Phase 8: Emit Notification for Transfer In Transit
      await createNotification({
        event_key: `transfer_in_transit:${selectedTransfer.id}`,
        role: "Hospital Admin",
        type: "transfer_in_transit",
        title: "Blood Transfer In Transit",
        message: `Transfer ${selectedTransfer.id} (${selectedTransfer.units} units of ${selectedTransfer.blood}) is now in transit to ${selectedTransfer.to}.`,
        related_transfer_id: selectedTransfer.id,
        priority: "High",
      });
    } else {
      alert(res.error || "Failed to dispatch transfer.");
    }
  };

  const handleComplete = async () => {
    if (!selectedTransfer) return;
    const res = await updateTransferStatus(selectedTransfer.id, "Completed", selectedTransfer.status);
    if (res.success) {
      setSelectedStatus("Completed");
      setSelectedTransfer((prev) => ({ ...prev, status: "Completed" }));
      setTransferRequests((prev) =>
        prev.map((t) => (t.id === selectedTransfer.id ? { ...t, status: "Completed" } : t))
      );

      // Phase 8: Emit Notification for Transfer Completed
      await createNotification({
        event_key: `transfer_completed:${selectedTransfer.id}`,
        role: "Blood Bank",
        type: "transfer_completed",
        title: "Blood Transfer Completed",
        message: `Transfer ${selectedTransfer.id} (${selectedTransfer.units} units of ${selectedTransfer.blood}) has safely reached ${selectedTransfer.to} and is marked Completed.`,
        related_transfer_id: selectedTransfer.id,
        priority: "Medium",
      });
    } else {
      alert(res.error || "Failed to mark transfer completed.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "transfer-status pending";

      case "Approved":
        return "transfer-status approved";

      case "In Transit":
        return "transfer-status transit";

      case "Completed":
        return "transfer-status completed";

      case "Rejected":
        return "transfer-status rejected";

      default:
        return "transfer-status";
    }
  };

  const filteredTransfers = transferRequests.filter((item) => {
    const text = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      (item.id || "").toLowerCase().includes(text) ||
      (item.from || "").toLowerCase().includes(text) ||
      (item.to || "").toLowerCase().includes(text) ||
      (item.blood || "").toLowerCase().includes(text) ||
      (item.reason || "").toLowerCase().includes(text);

    const matchesTab =
      activeTab === "All Requests" || item.status === activeTab;

    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;

    const matchesBlood =
      filterBloodGroup === "All" || item.blood === filterBloodGroup;

    const targetDist = (appliedDistrict || selectedDistrict || "").toLowerCase();
    const isTrichy = targetDist === "tiruchirappalli" || targetDist === "trichy";
    const matchesDistrict =
      !targetDist ||
      targetDist === "all" ||
      (item.district || "").toLowerCase().includes(targetDist) ||
      (item.from || "").toLowerCase().includes(targetDist) ||
      (item.to || "").toLowerCase().includes(targetDist) ||
      (isTrichy && (
        (item.from || "").toLowerCase().includes("trichy") ||
        (item.to || "").toLowerCase().includes("trichy") ||
        (item.from || "").toLowerCase().includes("srm") ||
        (item.from || "").toLowerCase().includes("kauvery") ||
        (item.from || "").toLowerCase().includes("apollo") ||
        (item.from || "").toLowerCase().includes("govt") ||
        (item.from || "").toLowerCase().includes("mgm")
      ));

    return matchesSearch && matchesTab && matchesStatus && matchesBlood && matchesDistrict;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransfers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTransfers = filteredTransfers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="transfer-page">
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

      <div className="transfer-header">

        <div className="transfer-title-section">
          <div className="transfer-title-icon">
            <Truck size={28} />
          </div>

          <div>
            <div className="transfer-eyebrow">BLOOD LOGISTICS</div>

            <h1>Approval & Transfer</h1>

            <p>
              Review, approve, and manage blood transfers between hospitals and
              blood banks.
            </p>
          </div>
        </div>

        <div className="transfer-header-right">
          <div className="transfer-quote">
            <strong>
              “Faster transfers,
              <br />
              stronger communities.”
            </strong>
          </div>

          <button className="transfer-new-button">
            <Plus size={18} />
            New Transfer Request
          </button>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}

      <div className="transfer-stats">
        <div className="transfer-stat-card pending-card">
          <div className="transfer-stat-icon red">
            <Clock size={25} />
          </div>

          <div>
            <strong>8</strong>
            <span>Pending Approvals</span>
            <small>Requires your action</small>
          </div>
        </div>

        <div className="transfer-stat-card approved-card">
          <div className="transfer-stat-icon green">
            <CheckCircle size={25} />
          </div>

          <div>
            <strong>24</strong>
            <span>Approved Transfers</span>
            <small>↑ +12 this month</small>
          </div>
        </div>

        <div className="transfer-stat-card transit-card">
          <div className="transfer-stat-icon blue">
            <Truck size={25} />
          </div>

          <div>
            <strong>6</strong>
            <span>In Transit</span>
            <small>Being delivered</small>
          </div>
        </div>

        <div className="transfer-stat-card completed-card">
          <div className="transfer-stat-icon orange">
            <Clock size={25} />
          </div>

          <div>
            <strong>2</strong>
            <span>Completed Today</span>
            <small>↑ +2 from yesterday</small>
          </div>
        </div>

        <div className="transfer-stat-card rejected-card">
          <div className="transfer-stat-icon purple">
            <XCircle size={25} />
          </div>

          <div>
            <strong>1</strong>
            <span>Rejected</span>
            <small>Needs review</small>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}

      <div className="transfer-tabs">
        {[
          "All Requests",
          "Pending",
          "Approved",
          "In Transit",
          "Completed",
          "Rejected",
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

      {/* ================= FILTERS ================= */}

      <div className="transfer-filter-card">
        <div className="transfer-filter-group">
          <label>Select State</label>

          <div className="transfer-select">
            <select value={selectedState} onChange={handleStateChange}>
              <option value="">Select State</option>
              {STATES_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="transfer-filter-group">
          <label>Select District</label>

          <div className="transfer-select">
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

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="transfer-filter-group">
          <label>Blood Group</label>

          <div className="transfer-select">
            <select
              value={filterBloodGroup}
              onChange={(e) => setFilterBloodGroup(e.target.value)}
            >
              <option value="All">All</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="transfer-filter-group">
          <label>Status</label>

          <div className="transfer-select">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="transfer-filter-group date-group">
          <label>Date Range</label>

          <div className="transfer-date">
            <CalendarDays size={15} />
            <span>16 Sep 2026 - 30 Sep 2026</span>
          </div>
        </div>

        <button className="transfer-apply" onClick={handleApplyFilters}>
          Apply
        </button>
      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="transfer-main-grid">
        {/* TABLE */}

        <div className="transfer-table-card">
          <div className="transfer-card-header">
            <div className="transfer-card-title">
              <div className="small-red-icon">
                <Truck size={20} />
              </div>

              <div>
                <h2>
                  Transfer Requests (
                  {appliedDistrict || selectedDistrict || appliedState || "All"}
                  )
                </h2>

                <p>
                  Manage blood transfer requests between hospitals and blood
                  banks.
                </p>
              </div>
            </div>

            <div className="transfer-search">
              <Search size={17} />

              <input
                placeholder="Search by ID, hospital, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="transfer-table-wrapper">
            <table className="transfer-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Request ID</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>From (Source)</th>
                  <th>To (Destination)</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedTransfers.map((request, index) => (
                  <tr key={request.id}>
                    <td>{(safeCurrentPage - 1) * pageSize + index + 1}</td>

                    <td>
                      <strong className="transfer-id">{request.id}</strong>
                    </td>

                    <td>
                      <span className="transfer-blood">{request.blood}</span>
                    </td>

                    <td>
                      <strong>{request.units}</strong>
                    </td>

                    <td>{request.from}</td>

                    <td>{request.to}</td>

                    <td>{request.date}</td>

                    <td>
                      <span className={getStatusClass(request.status)}>
                        {request.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="transfer-view-button"
                        onClick={() => {
                          setSelectedTransfer(request);
                          setSelectedStatus(request.status);
                        }}
                      >
                        {request.status === "Pending"
                          ? "Review"
                          : request.status === "In Transit"
                            ? "Track"
                            : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedTransfers.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                      No transfer requests found matching the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="transfer-pagination">
            <span>
              Showing {filteredTransfers.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1} to{" "}
              {Math.min(safeCurrentPage * pageSize, filteredTransfers.length)} of {filteredTransfers.length} requests
            </span>

            <div>
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                style={{ opacity: safeCurrentPage === 1 ? 0.4 : 1, cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer" }}
              >
                ‹
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
                ›
              </button>
            </div>
          </div>
        </div>


        {/* ================= DETAILS ================= */}

        <div className="transfer-side">
          <div className="transfer-details-card">
            <div className="side-card-title">
              <div>
                <Truck size={19} />
                <h2>Transfer Request Details</h2>
              </div>

              <span>{selectedTransfer?.id || "TRF001"}</span>
            </div>

            <div className="detail-list">
              <div>
                <label>Blood Group</label>
                <strong>{selectedTransfer?.blood || "O+"}</strong>
              </div>

              <div>
                <label>Units</label>
                <strong>{selectedTransfer?.units || 20} Units</strong>
              </div>

              <div>
                <label>From</label>
                <strong>{selectedTransfer?.from || "Trichy Blood Bank"}</strong>
              </div>

              <div>
                <label>To</label>
                <strong>{selectedTransfer?.to || "Trichy Government Hospital"}</strong>
              </div>

              <div>
                <label>Request Date</label>
                <strong>{selectedTransfer?.date || "16 Sep 2026, 09:40 AM"}</strong>
              </div>

              <div>
                <label>Requested By</label>
                <strong>{user?.name || "Hospital Admin"}</strong>
              </div>

              <div>
                <label>Status</label>
                <span className={getStatusClass(selectedStatus)}>{selectedStatus}</span>
              </div>

              <div>
                <label>Reason</label>
                <strong>
                  {selectedTransfer?.reason ||
                    "Emergency surgery - O+ units required immediately."}
                </strong>
              </div>
            </div>

            <div className="approval-buttons">
              {selectedStatus === "Pending" && (
                <>
                  <button className="approve-button" onClick={handleApprove}>
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button className="reject-button" onClick={handleReject}>
                    <XCircle size={18} />
                    Reject
                  </button>
                </>
              )}

              {selectedStatus === "Approved" && (
                <button
                  type="button"
                  className="approve-button"
                  onClick={handleDispatch}
                  style={{ background: "#2563eb", width: "100%", justifyContent: "center" }}
                >
                  <Truck size={18} />
                  Dispatch / In Transit
                </button>
              )}

              {selectedStatus === "In Transit" && (
                <button
                  type="button"
                  className="approve-button"
                  onClick={handleComplete}
                  style={{ background: "#16a34a", width: "100%", justifyContent: "center" }}
                >
                  <CheckCircle size={18} />
                  Confirm Delivery / Completed
                </button>
              )}

              {selectedStatus === "Completed" && (
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    color: "#166534",
                    fontSize: "14.5px",
                    fontWeight: 600,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <CheckCircle size={16} />
                  Transfer Completed & Received
                </div>
              )}

              {selectedStatus === "Rejected" && (
                <div
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    color: "#991b1b",
                    fontSize: "14.5px",
                    fontWeight: 600,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <XCircle size={16} />
                  Transfer Rejected & Closed
                </div>
              )}
            </div>
          </div>

          {/* ROUTE CARD */}

          <div className="transfer-route-card">
            <div className="route-header">
              <div>
                <Navigation size={18} />
                <h2>Transfer Route</h2>
              </div>

              <button>View in Maps →</button>
            </div>

            <div className="route-point">
              <div className="route-icon red">
                <MapPin size={20} />
              </div>

              <div>
                <strong>Trichy Blood Bank</strong>
                <span>Cantonment, Trichy - 620001</span>
              </div>
            </div>

            <div className="route-line" />

            <div className="route-middle">
              <Truck size={20} />

              <div>
                <strong>Distance: 2.3 km</strong>
                <span>Estimated Time: 15 minutes</span>
              </div>
            </div>

            <div className="route-line" />

            <div className="route-point">
              <div className="route-icon blue">
                <MapPin size={20} />
              </div>

              <div>
                <strong>Trichy Government Hospital</strong>
                <span>TVS Tollgate, Trichy - 620020</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM CARDS ================= */}

      <div className="transfer-bottom-grid">
        <div className="transfer-bottom-card ai">
          <div className="bottom-icon">
            <Lightbulb size={24} />
          </div>

          <div>
            <h3>AI Suggestion</h3>

            <p>
              Based on current inventory and demand, approving this transfer
              will help meet the critical requirement at {selectedTransfer?.to || "Trichy GH"}.
            </p>

            <button onClick={() => setIsAISuggestionModalOpen(true)}>
              View AI Recommendation
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="transfer-bottom-card help">
          <div className="bottom-icon">
            <Users size={24} />
          </div>

          <div>
            <h3>Need Help?</h3>

            <p>Contact nearby transport support for faster delivery.</p>

            <button onClick={() => setIsHelpModalOpen(true)}>
              Contact Support
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="transfer-bottom-card safety">
          <div className="bottom-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h3>Transfer Safety Guidelines</h3>

            <p>
              Ensure proper storage and transportation conditions for safe blood
              transfer.
            </p>

            <button onClick={() => setIsSafetyModalOpen(true)}>
              View Guidelines
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. AI Suggestion Modal */}
      {isAISuggestionModalOpen && (
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
          onClick={() => setIsAISuggestionModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "580px",
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
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Lightbulb size={22} />
                <div>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>AI Transfer Optimization Analysis</h2>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#dbeafe" }}>
                    Routing & clinical viability report for {selectedTransfer?.id || "TRF001"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAISuggestionModalOpen(false)}
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

            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "8px", color: "#166534" }}>
                <strong style={{ display: "block", fontSize: "15px", marginBottom: "4px" }}>
                  ✓ Recommendation: Immediate Approval Recommended (98% Confidence)
                </strong>
                <span style={{ fontSize: "13.5px" }}>
                  Transferring {selectedTransfer?.units || 20} units of {selectedTransfer?.blood || "O+"} from {selectedTransfer?.from || "Source"} to {selectedTransfer?.to || "Destination"} resolves a critical stock shortage with zero disruption to the source facility's safety reserve.
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Optimal Route</small>
                  <div style={{ fontWeight: 700, fontSize: "14.5px", color: "#111827" }}>Via Collector's Office Corridor</div>
                  <small style={{ color: "#059669" }}>Saves 8 mins vs highway</small>
                </div>
                <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
                  <small style={{ color: "#6b7280", fontSize: "12px" }}>Target Cold-Chain Temp</small>
                  <div style={{ fontWeight: 700, fontSize: "14.5px", color: "#dc2626" }}>+2°C to +6°C</div>
                  <small style={{ color: "#4b5563" }}>Phase-change ice pack required</small>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={() => setIsAISuggestionModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  Close
                </button>
                {selectedStatus === "Pending" && (
                  <button
                    onClick={() => {
                      handleApprove();
                      setIsAISuggestionModalOpen(false);
                      setNotice(`Transfer ${selectedTransfer?.id} approved based on AI recommendation!`);
                      setTimeout(() => setNotice(null), 4000);
                    }}
                    style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#16a34a", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                  >
                    Approve Transfer Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Help & Support Modal */}
      {isHelpModalOpen && (
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
          onClick={() => setIsHelpModalOpen(false)}
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
                background: "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)",
                color: "#fff",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={22} />
                <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Blood Transport Support Desk</h2>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
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
              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "14px", borderRadius: "10px", marginBottom: "16px", textAlign: "center" }}>
                <small style={{ color: "#0369a1", fontWeight: 600 }}>Emergency Transit Dispatch Coordinator</small>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "#0284c7", margin: "6px 0 2px" }}>
                  +91 431 2400108
                </div>
                <small style={{ color: "#64748b" }}>Dedicated 24/7 hotline for blood courier coordination</small>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Send Urgent Dispatch Message:
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Please expedite van assignment for TRF001; patient entering OT at 11 AM."
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  onClick={() => setIsHelpModalOpen(false)}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsHelpModalOpen(false);
                    setNotice("Transport support request received. An operator is dispatching the nearest vehicle.");
                    setTimeout(() => setNotice(null), 4000);
                  }}
                  style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#0284c7", color: "#fff", fontWeight: 600, cursor: "pointer" }}
                >
                  Send Dispatch Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Safety Guidelines Modal */}
      {isSafetyModalOpen && (
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
          onClick={() => setIsSafetyModalOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "580px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
                color: "#fff",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={22} />
                <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Blood Transfer Safety Guidelines</h2>
              </div>
              <button
                onClick={() => setIsSafetyModalOpen(false)}
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

            <div style={{ padding: "20px 24px", fontSize: "14.5px", color: "#374151", lineHeight: 1.6, maxHeight: "75vh", overflowY: "auto" }}>
              <div style={{ marginBottom: "14px" }}>
                <strong style={{ color: "#15803d", display: "block", marginBottom: "4px" }}>
                  1. Temperature Integrity (Cold-Chain)
                </strong>
                <span>Whole Blood and Packed RBCs must be transported at <b>+2°C to +6°C</b> in validated insulated transport containers with gel refrigerant packs. Never place blood bags in direct contact with frozen ice packs.</span>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <strong style={{ color: "#15803d", display: "block", marginBottom: "4px" }}>
                  2. Tamper-Evident Security Seals
                </strong>
                <span>All transport coolboxes must be secured with a numbered tamper-evident security tag matching the transfer manifest ID before vehicle departure.</span>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <strong style={{ color: "#15803d", display: "block", marginBottom: "4px" }}>
                  3. Transit Duration & Monitoring
                </strong>
                <span>Maximum transit duration without active refrigeration is 24 hours. The temperature data logger must be inspected upon arrival before sign-off.</span>
              </div>

              <div style={{ textAlign: "right", marginTop: "18px" }}>
                <button
                  onClick={() => setIsSafetyModalOpen(false)}
                  style={{ padding: "8px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
                >
                  Understood & Verified
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalTransfer;

