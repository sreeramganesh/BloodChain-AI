import {
  Truck,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ChevronDown,
  CalendarDays,
  Eye,
  MapPin,
  Navigation,
  Lightbulb,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

function ApprovalTransfer({ user }) {
  const transferRequests = [
    {
      id: "TRF001",
      blood: "O+",
      units: 20,
      from: "Trichy Blood Bank",
      to: "Trichy GH",
      date: "16 Sep, 09:40 AM",
      status: "Pending",
    },
    {
      id: "TRF002",
      blood: "A-",
      units: 10,
      from: "SRM Hospital",
      to: "Kauvery Hospital",
      date: "16 Sep, 11:20 AM",
      status: "Approved",
    },
    {
      id: "TRF003",
      blood: "B+",
      units: 15,
      from: "Government Hospital",
      to: "Apollo Hospital",
      date: "15 Sep, 06:15 PM",
      status: "In Transit",
    },
    {
      id: "TRF004",
      blood: "AB-",
      units: 5,
      from: "MGM Hospital",
      to: "Trichy GH",
      date: "15 Sep, 02:30 PM",
      status: "Pending",
    },
    {
      id: "TRF005",
      blood: "O-",
      units: 12,
      from: "Kauvery Hospital",
      to: "MGM Hospital",
      date: "14 Sep, 10:45 AM",
      status: "Completed",
    },
    {
      id: "TRF006",
      blood: "A+",
      units: 8,
      from: "Apollo Hospital",
      to: "Kauvery Hospital",
      date: "14 Sep, 09:10 AM",
      status: "Approved",
    },
    {
      id: "TRF007",
      blood: "B-",
      units: 10,
      from: "Thillai Nagar Blood Bank",
      to: "SRM Hospital",
      date: "13 Sep, 04:25 PM",
      status: "Rejected",
    },
    {
      id: "TRF008",
      blood: "O+",
      units: 6,
      from: "Trichy GH",
      to: "Thuvakudi PHC",
      date: "13 Sep, 01:50 PM",
      status: "In Transit",
    },
    {
      id: "TRF009",
      blood: "AB+",
      units: 18,
      from: "Government Hospital",
      to: "Kauvery Hospital",
      date: "12 Sep, 11:30 AM",
      status: "Completed",
    },
    {
      id: "TRF010",
      blood: "A-",
      units: 4,
      from: "MGM Hospital",
      to: "Srirangam PHC",
      date: "12 Sep, 08:15 AM",
      status: "Pending",
    },
  ];

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

  return (
    <div className="transfer-page">
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
        <button className="active">All Requests</button>

        <button>Pending</button>

        <button>Approved</button>

        <button>In Transit</button>

        <button>Completed</button>

        <button>Rejected</button>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="transfer-filter-card">
        <div className="transfer-filter-group">
          <label>From Location</label>

          <div className="transfer-select">
            <select>
              <option>All</option>
              <option>Trichy Blood Bank</option>
              <option>SRM Hospital</option>
              <option>Government Hospital</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="transfer-filter-group">
          <label>To Location</label>

          <div className="transfer-select">
            <select>
              <option>All</option>
              <option>Trichy GH</option>
              <option>Kauvery Hospital</option>
              <option>Apollo Hospital</option>
            </select>

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="transfer-filter-group">
          <label>Blood Group</label>

          <div className="transfer-select">
            <select>
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

            <ChevronDown size={15} />
          </div>
        </div>

        <div className="transfer-filter-group">
          <label>Status</label>

          <div className="transfer-select">
            <select>
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>In Transit</option>
              <option>Completed</option>
              <option>Rejected</option>
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

        <button className="transfer-apply">Apply</button>
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
                <h2>Transfer Requests</h2>

                <p>
                  Manage blood transfer requests between hospitals and blood
                  banks.
                </p>
              </div>
            </div>

            <div className="transfer-search">
              <Search size={17} />

              <input placeholder="Search by ID, hospital, or location..." />
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
                {transferRequests.map((request, index) => (
                  <tr key={request.id}>
                    <td>{index + 1}</td>

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
                      <button className="transfer-view-button">
                        {request.status === "Pending"
                          ? "Review"
                          : request.status === "In Transit"
                            ? "Track"
                            : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="transfer-pagination">
            <span>Showing 1 to 10 of 28 requests</span>

            <div>
              <button>‹</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <button>›</button>
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

              <span>TRF001</span>
            </div>

            <div className="detail-list">
              <div>
                <label>Blood Group</label>
                <strong>O+</strong>
              </div>

              <div>
                <label>Units</label>
                <strong>20 Units</strong>
              </div>

              <div>
                <label>From</label>
                <strong>Trichy Blood Bank</strong>
              </div>

              <div>
                <label>To</label>
                <strong>Trichy Government Hospital</strong>
              </div>

              <div>
                <label>Request Date</label>
                <strong>16 Sep 2026, 09:40 AM</strong>
              </div>

              <div>
                <label>Requested By</label>
                <strong>{user?.name || "Hospital Admin"}</strong>
              </div>

              <div>
                <label>Status</label>
                <span className="transfer-status pending">Pending</span>
              </div>

              <div>
                <label>Reason</label>
                <strong>
                  Emergency surgery - O+ units required immediately.
                </strong>
              </div>
            </div>

            <div className="approval-buttons">
              <button className="approve-button">
                <CheckCircle size={18} />
                Approve
              </button>

              <button className="reject-button">
                <XCircle size={18} />
                Reject
              </button>
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
              will help meet the critical requirement at Trichy GH.
            </p>

            <button>
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

            <button>
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

            <button>
              View Guidelines
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovalTransfer;
