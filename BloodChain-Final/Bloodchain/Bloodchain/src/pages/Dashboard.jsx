import {
  CalendarDays,
  MapPin,
  ChevronDown,
  Droplets,
  ClipboardList,
  AlertTriangle,
  Clock3,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Brain,
  ArrowRight,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const bloodData = [
  { group: "A+", units: 240 },
  { group: "A-", units: 65 },
  { group: "B+", units: 210 },
  { group: "B-", units: 42 },
  { group: "O+", units: 320 },
  { group: "O-", units: 90 },
  { group: "AB+", units: 150 },
  { group: "AB-", units: 131 },
];

const districtData = [
  {
    district: "Trichy",
    units: 1248,
    change: "+12%",
    status: "Good",
  },
  {
    district: "Thanjavur",
    units: 842,
    change: "+8%",
    status: "Good",
  },
  {
    district: "Madurai",
    units: 1096,
    change: "-3%",
    status: "Moderate",
  },
  {
    district: "Coimbatore",
    units: 1385,
    change: "+15%",
    status: "Good",
  },
  {
    district: "Chennai",
    units: 2410,
    change: "+6%",
    status: "Good",
  },
];

const bloodBanks = [
  {
    name: "Trichy Blood Bank",
    location: "Cantonment, Trichy",
    units: 420,
    status: "Available",
  },
  {
    name: "SRM Hospital Blood Bank",
    location: "Trichy",
    units: 285,
    status: "Available",
  },
  {
    name: "Kauvery Hospital",
    location: "Trichy",
    units: 198,
    status: "Limited",
  },
  {
    name: "Apollo Hospital",
    location: "Trichy",
    units: 176,
    status: "Available",
  },
];

const recentRequests = [
  {
    id: "BRQ001",
    hospital: "Trichy Government Hospital",
    group: "O+",
    units: 20,
    urgency: "Critical",
    status: "Pending",
  },
  {
    id: "BRQ002",
    hospital: "SRM Hospital",
    group: "A+",
    units: 10,
    urgency: "High",
    status: "Processing",
  },
  {
    id: "BRQ003",
    hospital: "Apollo Hospital",
    group: "B+",
    units: 15,
    urgency: "Medium",
    status: "Approved",
  },
  {
    id: "BRQ004",
    hospital: "Kauvery Hospital",
    group: "AB-",
    units: 5,
    urgency: "High",
    status: "Pending",
  },
];

function Dashboard({ user }) {
  const displayName = user?.name || "User";

  const today = new Date();

  const dateText = today.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeText = today.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="dashboard-page">
      {/* =========================
          HEADER
      ========================= */}

      <div className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">BLOODCHAIN AI</div>

          <h1>Welcome Back, {displayName}!</h1>

          <p>Here's the blood supply status for your selected location.</p>
        </div>

        <div className="dashboard-date-card">
          <CalendarDays size={22} />

          <div>
            <strong>{dateText}</strong>
            <span>{timeText}</span>
          </div>
        </div>
      </div>

      {/* =========================
          LOCATION FILTER
      ========================= */}

      <div className="location-filter-card">
        <div className="filter-title">
          <MapPin size={23} />

          <div>
            <strong>Location</strong>
            <span>View blood availability by location</span>
          </div>
        </div>

        <div className="filter-controls">
          <div className="select-group">
            <label>State</label>

            <div className="custom-select">
              <select defaultValue="Tamil Nadu">
                <option>Tamil Nadu</option>
                <option>Kerala</option>
                <option>Karnataka</option>
                <option>Andhra Pradesh</option>
              </select>

              <ChevronDown size={15} />
            </div>
          </div>

          <div className="select-group">
            <label>District</label>

            <div className="custom-select">
              <select defaultValue="Trichy">
                <option>Trichy</option>
                <option>Madurai</option>
                <option>Thanjavur</option>
                <option>Coimbatore</option>
                <option>Chennai</option>
              </select>

              <ChevronDown size={15} />
            </div>
          </div>

          <button className="apply-filter">Apply</button>
        </div>
      </div>

      {/* =========================
          STAT CARDS
      ========================= */}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon blood">
              <Droplets size={22} />
            </div>

            <div className="stat-trend positive">
              <ArrowUpRight size={13} />
              +12%
            </div>
          </div>

          <div className="stat-number">1,248</div>

          <div className="stat-label">Total Blood Units</div>

          <div className="stat-description">Compared with last week</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon requests">
              <ClipboardList size={22} />
            </div>

            <div className="stat-trend positive">
              <ArrowUpRight size={13} />
              +4%
            </div>
          </div>

          <div className="stat-number">5</div>

          <div className="stat-label">Active Requests</div>

          <div className="stat-description">Requiring attention</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon shortage">
              <AlertTriangle size={22} />
            </div>

            <div className="stat-trend negative">
              <ArrowUpRight size={13} />
              +2
            </div>
          </div>

          <div className="stat-number">3</div>

          <div className="stat-label">Shortage Alerts</div>

          <div className="stat-description">Blood groups below threshold</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon expiring">
              <Clock3 size={22} />
            </div>

            <div className="stat-trend negative">
              <ArrowDownRight size={13} />
              -5%
            </div>
          </div>

          <div className="stat-number">28</div>

          <div className="stat-label">Units Expiring Soon</div>

          <div className="stat-description">Within next 7 days</div>
        </div>
      </div>

      {/* =========================
          CHART + AI
      ========================= */}

      <div className="dashboard-grid">
        {/* BLOOD CHART */}

        <div className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <h2>Blood Group Availability</h2>

              <p>Current inventory across Trichy</p>
            </div>

            <button className="view-link">
              View Inventory
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bloodData}
                margin={{
                  top: 15,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="group"
                  tick={{
                    fontSize: 10,
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 9,
                  }}
                />

                <Tooltip />

                <Bar dataKey="units" fill="#ed1c2c" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI INSIGHT */}

        <div className="dashboard-card ai-card">
          <div className="ai-header">
            <div className="ai-icon">
              <Brain size={22} />
            </div>

            <div>
              <h2>AI Insight</h2>
              <span>Updated just now</span>
            </div>
          </div>

          <div className="ai-content">
            <h3>Attention needed in Trichy</h3>

            <p>
              O- and B- blood groups are currently below the recommended safety
              threshold.
            </p>

            <div className="ai-recommendation">
              <Activity size={20} />

              <div>
                <strong>Recommended Action</strong>

                <span>
                  Contact compatible donors and nearby blood banks to improve
                  availability.
                </span>
              </div>
            </div>

            <button className="ai-button">
              View AI Recommendations
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          DISTRICT + BLOOD BANKS
      ========================= */}

      <div className="dashboard-grid">
        {/* DISTRICT AVAILABILITY */}

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>District Blood Availability</h2>

              <p>Current blood stock by district</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>District</th>
                  <th>Available Units</th>
                  <th>Weekly Change</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {districtData.map((item) => (
                  <tr key={item.district}>
                    <td>
                      <strong>{item.district}</strong>
                    </td>

                    <td>{item.units}</td>

                    <td>
                      <span
                        className={
                          item.change.startsWith("+")
                            ? "change-positive"
                            : "change-negative"
                        }
                      >
                        {item.change}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          item.status === "Good" ? "good" : "moderate"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NEARBY BLOOD BANKS */}

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Nearby Blood Banks</h2>

              <p>Connected blood banks near Trichy</p>
            </div>

            <button className="view-link">
              View All
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="blood-bank-list">
            {bloodBanks.map((bank) => (
              <div className="blood-bank-item" key={bank.name}>
                <div className="bank-icon">
                  <Building2 size={19} />
                </div>

                <div className="bank-info">
                  <strong>{bank.name}</strong>

                  <span>{bank.location}</span>
                </div>

                <div className="bank-stock">
                  <strong>{bank.units}</strong>

                  <span>units</span>

                  <small
                    className={
                      bank.status === "Available" ? "available" : "limited"
                    }
                  >
                    {bank.status}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================
          RECENT REQUESTS
      ========================= */}

      <div className="dashboard-card recent-requests-card">
        <div className="card-header">
          <div>
            <h2>Recent Blood Requests</h2>

            <p>Latest requests from hospitals</p>
          </div>

          <button className="view-link">
            View All Requests
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Hospital</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <strong>{request.id}</strong>
                  </td>

                  <td>{request.hospital}</td>

                  <td>
                    <span className="blood-group-badge">{request.group}</span>
                  </td>

                  <td>{request.units}</td>

                  <td>
                    <span
                      className={`priority-badge ${
                        request.urgency === "Critical"
                          ? "emergency"
                          : request.urgency === "High"
                            ? "urgent"
                            : "normal"
                      }`}
                    >
                      {request.urgency}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        request.status === "Approved"
                          ? "approved"
                          : request.status === "Processing"
                            ? "processing"
                            : "pending"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
