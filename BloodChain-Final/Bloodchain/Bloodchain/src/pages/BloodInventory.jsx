import { useState } from "react";

import {
  Droplets,
  Search,
  Bell,
  Plus,
  Pencil,
  Eye,
  MoreVertical,
  Download,
  RefreshCw,
  AlertTriangle,
  Clock3,
  Database,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ArrowDownUp,
  FileText,
  ArrowLeftRight,
  BarChart3,
} from "lucide-react";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

function BloodInventory() {
  const [hospital, setHospital] = useState("All Hospitals");
  const [bloodGroup, setBloodGroup] = useState("All Blood Groups");
  const [stockStatus, setStockStatus] = useState("All Status");
  const [expiry, setExpiry] = useState("All");
  const [search, setSearch] = useState("");

  const bloodGroups = [
    { group: "A+", units: 180, type: "normal" },
    { group: "A-", units: 70, type: "low" },
    { group: "B+", units: 140, type: "good" },
    { group: "B-", units: 50, type: "low" },
    { group: "O+", units: 220, type: "good" },
    { group: "O-", units: 90, type: "normal" },
    { group: "AB+", units: 60, type: "normal" },
    { group: "AB-", units: 38, type: "low" },
  ];

  const inventoryRows = [
    {
      id: 1,
      hospital: "Trichy Blood Bank",
      group: "O+",
      available: 120,
      reserved: 40,
      total: 160,
      expiry: "22 Sep 2026",
      status: "Sufficient",
    },
    {
      id: 2,
      hospital: "SRM Hospital",
      group: "A+",
      available: 45,
      reserved: 10,
      total: 55,
      expiry: "18 Sep 2026",
      status: "Moderate",
    },
    {
      id: 3,
      hospital: "Kauvery Hospital",
      group: "B+",
      available: 28,
      reserved: 5,
      total: 33,
      expiry: "20 Sep 2026",
      status: "Low Stock",
    },
    {
      id: 4,
      hospital: "Apollo Hospital",
      group: "O-",
      available: 60,
      reserved: 20,
      total: 80,
      expiry: "25 Sep 2026",
      status: "Sufficient",
    },
    {
      id: 5,
      hospital: "Government Hospital",
      group: "A-",
      available: 35,
      reserved: 10,
      total: 45,
      expiry: "17 Sep 2026",
      status: "Expiring Soon",
    },
    {
      id: 6,
      hospital: "MGM Hospital",
      group: "AB+",
      available: 18,
      reserved: 7,
      total: 25,
      expiry: "21 Sep 2026",
      status: "Low Stock",
    },
    {
      id: 7,
      hospital: "Cauvery Medical Center",
      group: "B-",
      available: 22,
      reserved: 8,
      total: 30,
      expiry: "19 Sep 2026",
      status: "Moderate",
    },
    {
      id: 8,
      hospital: "Trichy GH",
      group: "AB-",
      available: 12,
      reserved: 3,
      total: 15,
      expiry: "16 Sep 2026",
      status: "Expiring Soon",
    },
    {
      id: 9,
      hospital: "Srirangam PHC",
      group: "O+",
      available: 40,
      reserved: 10,
      total: 50,
      expiry: "24 Sep 2026",
      status: "Sufficient",
    },
    {
      id: 10,
      hospital: "Thillai Nagar Blood Bank",
      group: "A+",
      available: 55,
      reserved: 15,
      total: 70,
      expiry: "23 Sep 2026",
      status: "Sufficient",
    },
  ];

  const stockSummary = [
    { name: "Available", value: 980 },
    { name: "Reserved", value: 220 },
    { name: "Expiring Soon", value: 48 },
  ];

  const expiringUnits = [
    {
      id: 1,
      hospital: "Trichy GH",
      group: "O-",
      units: 8,
      date: "16 Sep 2026",
      days: "1 day",
    },
    {
      id: 2,
      hospital: "Govt. Hospital",
      group: "A-",
      units: 6,
      date: "17 Sep 2026",
      days: "1 day",
    },
    {
      id: 3,
      hospital: "Kauvery Hospital",
      group: "B+",
      units: 10,
      date: "18 Sep 2026",
      days: "2 days",
    },
    {
      id: 4,
      hospital: "SRM Hospital",
      group: "O+",
      units: 12,
      date: "19 Sep 2026",
      days: "3 days",
    },
    {
      id: 5,
      hospital: "Apollo Hospital",
      group: "AB-",
      units: 5,
      date: "20 Sep 2026",
      days: "4 days",
    },
  ];

  const lowStockAlerts = [
    {
      hospital: "Kauvery Hospital",
      group: "B+",
      units: 28,
      threshold: "< 30",
    },
    {
      hospital: "MGM Hospital",
      group: "AB+",
      units: 18,
      threshold: "< 20",
    },
    {
      hospital: "Srirangam PHC",
      group: "A-",
      units: 12,
      threshold: "< 15",
    },
    {
      hospital: "Thillai Nagar Bank",
      group: "O-",
      units: 10,
      threshold: "< 15",
    },
  ];

  const recentUpdates = [
    {
      hospital: "Trichy Blood Bank",
      group: "O+",
      units: "+30",
      action: "Added",
      time: "16 Sep, 09:15 AM",
    },
    {
      hospital: "Apollo Hospital",
      group: "A-",
      units: "-10",
      action: "Transferred",
      time: "16 Sep, 08:40 AM",
    },
    {
      hospital: "SRM Hospital",
      group: "B+",
      units: "+20",
      action: "Added",
      time: "15 Sep, 06:20 PM",
    },
    {
      hospital: "Govt. Hospital",
      group: "O-",
      units: "-5",
      action: "Used",
      time: "15 Sep, 02:10 PM",
    },
  ];

  const filteredRows = inventoryRows.filter((row) => {
    const matchesHospital =
      hospital === "All Hospitals" || row.hospital === hospital;

    const matchesGroup =
      bloodGroup === "All Blood Groups" || row.group === bloodGroup;

    const matchesStatus =
      stockStatus === "All Status" || row.status === stockStatus;

    const matchesSearch =
      row.hospital.toLowerCase().includes(search.toLowerCase()) ||
      row.group.toLowerCase().includes(search.toLowerCase());

    return matchesHospital && matchesGroup && matchesStatus && matchesSearch;
  });

  return (
    <div className="inventory-page">
      {/* ================= HEADER ================= */}

      <div className="inventory-page-header">
        <div className="inventory-title-area">
          <div className="inventory-main-icon">
            <Droplets size={35} />
          </div>

          <div>
            <h1>Blood Inventory</h1>

            <p>
              Manage, track, and update blood stock across hospitals and blood
              banks.
            </p>
          </div>
        </div>

        <div className="inventory-header-right">
          <div className="inventory-quote">
            <strong>“Every unit counts,</strong>

            <span>for a healthier tomorrow.”</span>
          </div>

          <div className="inventory-date">
            <div className="inventory-calendar">
              <span>▣</span>
            </div>

            <div>
              <strong>Tue, 16 Sep 2026</strong>
              <small>10:24 AM</small>
            </div>
          </div>

          <button className="inventory-refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ================= HEADER ACTIONS ================= */}

      <div className="inventory-actions">
        <button className="inventory-primary-button">
          <Plus size={16} />
          Add Stock
        </button>

        <button className="inventory-secondary-button">
          <Pencil size={15} />
          Update Stock
        </button>
      </div>

      {/* ================= BLOOD GROUP CARDS ================= */}

      <div className="blood-group-strip">
        {bloodGroups.map((item) => (
          <div className={`blood-group-card ${item.type}`} key={item.group}>
            <div className="blood-group-name">{item.group}</div>

            <div className="blood-drop-icon">
              <Droplets size={22} fill="currentColor" />
            </div>

            <div className="blood-group-number">{item.units}</div>

            <div className="blood-group-units">Units</div>
          </div>
        ))}

        {/* TOTAL */}

        <div className="blood-total-card">
          <div className="blood-total-icon">
            <Database size={24} />
          </div>

          <div>
            <strong>1,248</strong>
            <span>Total Units</span>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="inventory-filter-bar">
        <div className="inventory-select-field">
          <label>Select Hospital</label>

          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
          >
            <option>All Hospitals</option>
            <option>Trichy Blood Bank</option>
            <option>SRM Hospital</option>
            <option>Kauvery Hospital</option>
            <option>Apollo Hospital</option>
            <option>Government Hospital</option>
          </select>
        </div>

        <div className="inventory-select-field">
          <label>Blood Group</label>

          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          >
            <option>All Blood Groups</option>
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

        <div className="inventory-select-field">
          <label>Stock Status</label>

          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
          >
            <option>All Status</option>
            <option>Sufficient</option>
            <option>Moderate</option>
            <option>Low Stock</option>
            <option>Expiring Soon</option>
          </select>
        </div>

        <div className="inventory-select-field">
          <label>Expiry Within</label>

          <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
            <option>All</option>
            <option>1 Day</option>
            <option>3 Days</option>
            <option>7 Days</option>
          </select>
        </div>

        <div className="inventory-table-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search by unit ID, batch number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}

      <div className="inventory-main-grid">
        {/* DETAILED INVENTORY */}

        <section className="inventory-detail-card">
          <div className="inventory-card-header">
            <div className="inventory-card-heading">
              <div className="red-database-icon">
                <Database size={23} />
              </div>

              <div>
                <h2>Detailed Inventory</h2>
                <p>Real-time stock details across hospitals and blood banks.</p>
              </div>
            </div>

            <button className="export-button">
              <Download size={15} />
              Export
            </button>
          </div>

          <div className="inventory-table-wrapper">
            <table className="inventory-detail-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>

                  <th>#</th>

                  <th>Hospital / Blood Bank</th>

                  <th>Blood Group</th>

                  <th>Available</th>

                  <th>Reserved</th>

                  <th>Total</th>

                  <th>Expiry Date</th>

                  <th>Status</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input type="checkbox" />
                    </td>

                    <td>{row.id}</td>

                    <td>
                      <strong>{row.hospital}</strong>
                    </td>

                    <td>
                      <span
                        className={`table-blood-group group-${row.group
                          .replace("+", "plus")
                          .replace("-", "minus")}`}
                      >
                        {row.group}
                      </span>
                    </td>

                    <td>
                      <strong>{row.available}</strong>
                    </td>

                    <td>{row.reserved}</td>

                    <td>{row.total}</td>

                    <td>{row.expiry}</td>

                    <td>
                      <span
                        className={`inventory-status ${row.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button>
                          <Eye size={14} />
                        </button>

                        <button>
                          <Pencil size={13} />
                        </button>

                        <button>
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="inventory-pagination">
            <span>Showing 1 to {filteredRows.length} of 32 entries</span>

            <div>
              <button>
                <ChevronLeft size={15} />
              </button>

              <button className="active-page-number">1</button>

              <button>2</button>
              <button>3</button>
              <button>4</button>

              <button>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}

        <div className="inventory-right-column">
          {/* STOCK SUMMARY */}

          <section className="inventory-side-card stock-summary-card">
            <div className="inventory-side-heading">
              <div className="red-database-icon">
                <Database size={19} />
              </div>

              <h2>Stock Summary</h2>
            </div>

            <div className="stock-summary-content">
              <div className="stock-pie">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={stockSummary}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={1}
                    >
                      <Cell fill="#16a36b" />
                      <Cell fill="#f4ca61" />
                      <Cell fill="#ef4b51" />
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pie-center">
                  <strong>1,248</strong>
                  <span>Total Units</span>
                </div>
              </div>

              <div className="stock-legend">
                <div>
                  <span className="legend-dot available-dot" />
                  <span>Available</span>
                  <strong>980 (78.5%)</strong>
                </div>

                <div>
                  <span className="legend-dot reserved-dot" />
                  <span>Reserved</span>
                  <strong>220 (17.6%)</strong>
                </div>

                <div>
                  <span className="legend-dot expiry-dot" />
                  <span>Expiring Soon</span>
                  <strong>48 (3.8%)</strong>
                </div>
              </div>
            </div>
          </section>

          {/* EXPIRING */}

          <section className="inventory-side-card">
            <div className="inventory-side-heading">
              <div className="expiry-icon">
                <Clock3 size={19} />
              </div>

              <h2>Units Expiring Soon</h2>

              <button>
                View All <ArrowRight size={13} />
              </button>
            </div>

            <div className="small-table-wrapper">
              <table className="expiry-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Hospital</th>
                    <th>Blood Group</th>
                    <th>Units</th>
                    <th>Expiry Date</th>
                    <th>Days Left</th>
                  </tr>
                </thead>

                <tbody>
                  {expiringUnits.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>

                      <td>{item.hospital}</td>

                      <td>
                        <span className="small-blood-badge">{item.group}</span>
                      </td>

                      <td>{item.units}</td>

                      <td>{item.date}</td>

                      <td>
                        <span className="days-left">{item.days}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* ================= BOTTOM GRID ================= */}

      <div className="inventory-bottom-grid">
        {/* LOW STOCK */}

        <section className="inventory-bottom-card">
          <div className="bottom-card-header">
            <div>
              <div className="bottom-title">
                <AlertTriangle size={18} />

                <h2>Low Stock Alerts</h2>
              </div>
            </div>

            <button>
              View All <ArrowRight size={13} />
            </button>
          </div>

          <table className="bottom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Hospital</th>
                <th>Blood Group</th>
                <th>Available Units</th>
                <th>Threshold</th>
              </tr>
            </thead>

            <tbody>
              {lowStockAlerts.map((item, index) => (
                <tr key={item.hospital}>
                  <td>{index + 1}</td>

                  <td>{item.hospital}</td>

                  <td>
                    <span className="small-blood-badge">{item.group}</span>
                  </td>

                  <td>
                    <strong>{item.units}</strong>
                  </td>

                  <td className="threshold">{item.threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* RECENT UPDATES */}

        <section className="inventory-bottom-card">
          <div className="bottom-card-header">
            <div className="bottom-title">
              <Clock3 size={18} />

              <h2>Recent Stock Updates</h2>
            </div>

            <button>
              View All <ArrowRight size={13} />
            </button>
          </div>

          <table className="bottom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Hospital</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Action</th>
                <th>Updated At</th>
              </tr>
            </thead>

            <tbody>
              {recentUpdates.map((item, index) => (
                <tr key={item.hospital}>
                  <td>{index + 1}</td>

                  <td>{item.hospital}</td>

                  <td>
                    <span className="small-blood-badge">{item.group}</span>
                  </td>

                  <td
                    className={
                      item.units.startsWith("+")
                        ? "stock-increase"
                        : "stock-decrease"
                    }
                  >
                    {item.units}
                  </td>

                  <td>
                    <span
                      className={`update-action ${item.action.toLowerCase()}`}
                    >
                      {item.action}
                    </span>
                  </td>

                  <td>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* QUICK ACTIONS */}

        <section className="inventory-bottom-card quick-actions-card">
          <div className="bottom-title">
            <BarChart3 size={18} />

            <h2>Quick Actions</h2>
          </div>

          <div className="quick-action-grid">
            <button>
              <Plus size={19} />

              <span>Add New Stock</span>
            </button>

            <button>
              <ArrowLeftRight size={19} />

              <span>Transfer Units</span>
            </button>

            <button>
              <Pencil size={19} />

              <span>Update Stock</span>
            </button>

            <button>
              <FileText size={19} />

              <span>Generate Report</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default BloodInventory;
