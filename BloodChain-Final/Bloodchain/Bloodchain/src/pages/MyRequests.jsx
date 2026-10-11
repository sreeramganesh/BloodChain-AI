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
  ArrowRight,
} from "lucide-react";

function MyRequests({ user }) {
  const requests = [
    {
      id: "BRQ001",
      bloodGroup: "O+",
      units: 2,
      hospital: "Trichy Government Hospital",
      location: "Trichy",
      date: "16 Sep 2026",
      status: "Pending",
    },
    {
      id: "BRQ002",
      bloodGroup: "A+",
      units: 3,
      hospital: "SRM Hospital",
      location: "Kattankulathur",
      date: "02 Sep 2026",
      status: "Approved",
    },
    {
      id: "BRQ003",
      bloodGroup: "B+",
      units: 1,
      hospital: "Apollo Hospital",
      location: "Trichy",
      date: "18 Aug 2026",
      status: "In Progress",
    },
    {
      id: "BRQ004",
      bloodGroup: "O-",
      units: 2,
      hospital: "Cauvery Hospital",
      location: "Trichy",
      date: "10 Jul 2026",
      status: "Approved",
    },
    {
      id: "BRQ005",
      bloodGroup: "AB+",
      units: 1,
      hospital: "MGM Hospital",
      location: "Trichy",
      date: "25 Jun 2026",
      status: "Pending",
    },
  ];

  return (
    <div className="my-requests-page">
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

            <p>
              Track the status of your blood requests and get real-time updates.
            </p>
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

          <button className="new-request-button">
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
            <strong>5</strong>
            <small>All time requests</small>
          </div>
        </div>

        <div className="request-stat-card request-orange">
          <div className="request-stat-icon">
            <Clock size={27} />
          </div>

          <div>
            <span>Pending</span>
            <strong>2</strong>
            <small>Waiting for confirmation</small>
          </div>
        </div>

        <div className="request-stat-card request-green">
          <div className="request-stat-icon">
            <CheckCircle2 size={27} />
          </div>

          <div>
            <span>Approved</span>
            <strong>2</strong>
            <small>Donor/Hospital assigned</small>
          </div>
        </div>

        <div className="request-stat-card request-blue">
          <div className="request-stat-icon">
            <Truck size={27} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>1</strong>
            <small>Blood on the way</small>
          </div>
        </div>

        <div className="request-stat-card request-light-green">
          <div className="request-stat-icon">
            <Flag size={27} />
          </div>

          <div>
            <span>Completed</span>
            <strong>0</strong>
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
            <button className="active">All Requests</button>

            <button>Pending (2)</button>

            <button>Approved (2)</button>

            <button>In Progress (1)</button>

            <button>Completed (0)</button>

            <button>Cancelled (0)</button>
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
                  {requests.map((request, index) => (
                    <tr key={request.id}>
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

                      <td>{request.units}</td>

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
                        <button className="request-view-button">View</button>
                      </td>
                    </tr>
                  ))}
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

                <p>
                  Contact support or nearby hospitals for faster assistance.
                </p>

                <button>
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
                  Expand your search area or allow nearby blood banks to notify
                  you.
                </p>

                <button>
                  <Bell size={15} />
                  Enable Notifications
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

              <p>
                While you wait, consider becoming a donor and help save lives.
              </p>
            </div>

            <button>Register as a Donor</button>

            <div className="request-heart-line">♡</div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="request-details-side">
          {/* SELECTED REQUEST */}

          <div className="selected-request-card">
            <div className="selected-request-header">
              <div>
                <FileText size={20} />
                <h2>Selected Request Details</h2>
              </div>

              <span>BRQ003</span>
            </div>

            <div className="request-detail-row">
              <span>Blood Group</span>
              <strong>B+</strong>
            </div>

            <div className="request-detail-row">
              <span>Units Required</span>
              <strong>1 Unit</strong>
            </div>

            <div className="request-detail-row">
              <span>Hospital</span>
              <strong>Apollo Hospital, Trichy</strong>
            </div>

            <div className="request-detail-row">
              <span>Request Date</span>
              <strong>18 Aug 2026, 10:30 AM</strong>
            </div>

            <div className="request-detail-row">
              <span>Status</span>

              <strong>
                <span className="detail-status">In Progress</span>
              </strong>
            </div>

            <div className="request-detail-row">
              <span>Expected Availability</span>
              <strong>19 Aug 2026</strong>
            </div>

            <div className="request-detail-row">
              <span>Notes</span>
              <strong>Required for surgery. Urgent.</strong>
            </div>
          </div>

          {/* REQUEST PROGRESS */}

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
                  <span>18 Aug 2026, 10:30 AM</span>
                </div>
              </div>

              <div className="progress-step completed">
                <div className="progress-dot">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <strong>AI Recommendation Completed</strong>
                  <span>18 Aug 2026, 10:45 AM</span>
                </div>
              </div>

              <div className="progress-step completed">
                <div className="progress-dot">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <strong>Hospital Confirmed</strong>
                  <span>18 Aug 2026, 11:20 AM</span>
                </div>
              </div>

              <div className="progress-step current">
                <div className="progress-dot"></div>

                <div>
                  <strong>Blood On The Way</strong>
                  <span>Estimated: 19 Aug 2026</span>
                </div>
              </div>

              <div className="progress-step">
                <div className="progress-dot"></div>

                <div>
                  <strong>Completed</strong>
                  <span>Waiting...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyRequests;
