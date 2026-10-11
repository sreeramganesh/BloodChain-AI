import { useState } from "react";

import {
  FileText,
  Plus,
  Search,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  MapPin,
  Users,
  Lightbulb,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  Droplets,
  ArrowRight,
} from "lucide-react";

function BloodRequest() {
  const [activeTab, setActiveTab] = useState("All Requests");

  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Trichy");
  const [bloodGroup, setBloodGroup] = useState("All");
  const [requestType, setRequestType] = useState("All");
  const [status, setStatus] = useState("All");

  const [patientName, setPatientName] = useState("");
  const [requestBloodGroup, setRequestBloodGroup] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState("");
  const [reason, setReason] = useState("");

  const [search, setSearch] = useState("");

  const requests = [
    {
      id: 1,
      patient: "R. Karthik",
      group: "O+",
      units: 2,
      hospital: "Trichy GH",
      type: "Patient",
      urgency: "Critical",
      status: "Pending",
      time: "16 Sep, 09:40 AM",
    },
    {
      id: 2,
      patient: "Meena S.",
      group: "A-",
      units: 1,
      hospital: "Kauvery Hospital",
      type: "Patient",
      urgency: "High",
      status: "In Progress",
      time: "16 Sep, 08:15 AM",
    },
    {
      id: 3,
      patient: "S. Prakash",
      group: "B+",
      units: 3,
      hospital: "Apollo Hospital",
      type: "Patient",
      urgency: "Medium",
      status: "Matched",
      time: "15 Sep, 06:20 PM",
    },
    {
      id: 4,
      patient: "Vijay Kumar",
      group: "AB-",
      units: 1,
      hospital: "SRM Hospital",
      type: "Patient",
      urgency: "High",
      status: "Pending",
      time: "15 Sep, 02:10 PM",
    },
    {
      id: 5,
      patient: "Lakshmi P.",
      group: "O-",
      units: 2,
      hospital: "MGM Hospital",
      type: "Patient",
      urgency: "Critical",
      status: "In Review",
      time: "15 Sep, 11:05 AM",
    },
    {
      id: 6,
      patient: "Rahul D.",
      group: "A+",
      units: 1,
      hospital: "Govt. Hospital",
      type: "Patient",
      urgency: "Medium",
      status: "Fulfilled",
      time: "14 Sep, 07:30 AM",
    },
    {
      id: 7,
      patient: "Divya M.",
      group: "B-",
      units: 1,
      hospital: "Trichy GH",
      type: "Patient",
      urgency: "High",
      status: "Pending",
      time: "14 Sep, 10:12 AM",
    },
    {
      id: 8,
      patient: "Arun N.",
      group: "O+",
      units: 4,
      hospital: "Cauvery Medical Center",
      type: "Patient",
      urgency: "Critical",
      status: "Pending",
      time: "13 Sep, 09:45 AM",
    },
    {
      id: 9,
      patient: "Sathish K.",
      group: "AB+",
      units: 1,
      hospital: "Thillai Nagar Blood Bank",
      type: "Patient",
      urgency: "Medium",
      status: "Matched",
      time: "13 Sep, 08:20 AM",
    },
    {
      id: 10,
      patient: "Poorani S.",
      group: "A-",
      units: 2,
      hospital: "KK Nagar Hospital",
      type: "Patient",
      urgency: "High",
      status: "In Progress",
      time: "12 Sep, 04:10 PM",
    },
  ];

  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      item.patient.toLowerCase().includes(search.toLowerCase()) ||
      item.hospital.toLowerCase().includes(search.toLowerCase()) ||
      item.group.toLowerCase().includes(search.toLowerCase());

    const matchesGroup = bloodGroup === "All" || item.group === bloodGroup;

    const matchesStatus = status === "All" || item.status === status;

    const matchesType = requestType === "All" || item.type === requestType;

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
      matchesTab
    );
  });

  const handleSubmitRequest = (e) => {
    e.preventDefault();

    if (!patientName || !requestBloodGroup || !unitsNeeded) {
      alert("Please fill Patient / Hospital, Blood Group and Units Needed.");
      return;
    }

    alert(
      `Blood request created for ${patientName} - ${requestBloodGroup} - ${unitsNeeded} units.`,
    );

    setPatientName("");
    setRequestBloodGroup("");
    setUnitsNeeded("");
    setReason("");
  };

  return (
    <div className="blood-request-page">
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

          <button className="new-request-button">
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

              <select value={state} onChange={(e) => setState(e.target.value)}>
                <option>Tamil Nadu</option>
                <option>Kerala</option>
                <option>Karnataka</option>
                <option>Andhra Pradesh</option>
              </select>
            </div>

            <div className="request-select-field">
              <label>Select District</label>

              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option>Trichy</option>
                <option>Madurai</option>
                <option>Chennai</option>
                <option>Coimbatore</option>
                <option>Salem</option>
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

            <button className="request-filter-button">Apply</button>
          </div>

          {/* REQUEST TABLE */}

          <section className="request-table-card">
            <div className="request-table-header">
              <div>
                <h2>Blood Requests ({district})</h2>

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

                <button className="request-export">↓ Export</button>
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
                  {filteredRequests.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>

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

                      <td>{item.time}</td>

                      <td>
                        <button className="view-request-button">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="request-pagination">
              <span>Showing 1 to {filteredRequests.length} of 48 requests</span>

              <div>
                <button>
                  <ChevronLeft size={14} />
                </button>

                <button className="active-page">1</button>

                <button>2</button>
                <button>3</button>
                <button>4</button>
                <button>5</button>

                <button>
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

                <button>
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

                <p>Reach out to registered donors near Trichy.</p>

                <button>
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
                <h2>Request Locations ({district})</h2>
              </div>

              <button>View Map →</button>
            </div>

            <div className="fake-map">
              <div className="map-grid" />

              <span className="map-marker marker-one">📍</span>

              <span className="map-marker marker-two">📍</span>

              <span className="map-marker marker-three">📍</span>

              <span className="map-marker marker-four">📍</span>

              <div className="map-label label-one">Trichy GH</div>

              <div className="map-label label-two">MGM Hospital</div>

              <div className="map-label label-three">Kauvery Hospital</div>

              <div className="map-label label-four">Apollo Hospital</div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default BloodRequest;
