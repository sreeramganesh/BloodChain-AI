import { useState, useEffect, useMemo } from "react";
import {
  getBloodInventory,
  addInventoryStock,
  updateInventoryStock,
  INITIAL_INVENTORY,
} from "../services/bloodService";
import {
  STATE_DISTRICTS,
  STATES_LIST,
  getDistrictsForState,
} from "../constants/locationData";
import { getHospitalsForDistrict } from "../constants/hospitalMasterData";
import { useAuth } from "../context/AuthContext";

import {
  Droplets,
  Search,
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
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowLeftRight,
  BarChart3,
  TrendingUp,
  Brain,
  ShieldAlert,
} from "lucide-react";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  DemandForecastView,
  ShortageRiskView,
  ExpiryRiskView,
} from "../components/predictive";

function BloodInventory() {
  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [selectedDistrict, setSelectedDistrict] = useState("Tiruchirappalli");
  const [hospital, setHospital] = useState("All Hospitals");
  const [bloodGroup, setBloodGroup] = useState("All Blood Groups");
  const { user, role, isBloodBank } = useAuth();
  const canManageInventory = isBloodBank || role === "bloodbank";

  const [stockStatus, setStockStatus] = useState("All Status");
  const [expiry, setExpiry] = useState("All");
  const [search, setSearch] = useState("");
  const [inventoryRows, setInventoryRows] = useState(INITIAL_INVENTORY);
  const [predictiveTab, setPredictiveTab] = useState("all");

  // Dynamic Date & Clock
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Refresh & Feedback state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState(null);
  const showNotice = (msg, type = "success") => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 3500);
  };

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [formData, setFormData] = useState({
    hospital: "",
    group: "O+",
    available: 20,
    reserved: 0,
    expiryDate: "",
    status: "Sufficient",
    cost_per_unit: 1400,
  });
  const [formError, setFormError] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const hospitalsInDistrict = useMemo(() => {
    return getHospitalsForDistrict(selectedState, selectedDistrict);
  }, [selectedState, selectedDistrict]);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const data = await getBloodInventory({ state: selectedState, district: selectedDistrict });
      if (data && data.length > 0) {
        setInventoryRows(data);
      }
    } catch (e) {
      console.warn("Failed to load inventory:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getBloodInventory({ state: selectedState, district: selectedDistrict }).then((data) => {
      if (isMounted && data && data.length > 0) {
        setInventoryRows(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedState, selectedDistrict]);

  const handleRefresh = async () => {
    await loadData();
    showNotice("Inventory refreshed with latest operational data.");
  };

  // Open Add Stock Modal
  const openAddModal = () => {
    if (!canManageInventory) {
      showNotice("Only authorized Blood Bank personnel can add inventory batches.", "error");
      return;
    }
    const defaultExpiry = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
    setFormData({
      hospital: hospitalsInDistrict[0] || `${selectedDistrict} Central Blood Bank`,
      group: "O+",
      available: 25,
      reserved: 0,
      expiryDate: defaultExpiry,
      status: "Sufficient",
      cost_per_unit: 1400,
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  // Open Update Stock Modal
  const openUpdateModal = (row = null) => {
    if (!canManageInventory) {
      showNotice("Only authorized Blood Bank personnel can update inventory batches.", "error");
      return;
    }
    const target = row || inventoryRows[0];
    if (!target) return;
    setActiveRow(target);
    const defaultExpiry = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
    setFormData({
      hospital: target.hospital || hospitalsInDistrict[0] || "Hospital",
      group: target.group || target.blood_group || "O+",
      available: target.available !== undefined ? target.available : 20,
      reserved: target.reserved !== undefined ? target.reserved : 0,
      expiryDate: target.expiryDate || defaultExpiry,
      status: target.status || "Sufficient",
      cost_per_unit: target.cost_per_unit !== undefined ? target.cost_per_unit : 1400,
    });
    setFormError("");
    setIsUpdateModalOpen(true);
  };

  // Open View Modal
  const openViewModal = (row) => {
    setActiveRow(row);
    setIsViewModalOpen(true);
  };

  // Delete Stock Row
  const handleDeleteRow = (row) => {
    if (!canManageInventory) {
      showNotice("Only authorized Blood Bank personnel can delete inventory batches.", "error");
      return;
    }
    const hosp = row.hospital || "facility";
    const grp = row.group || row.blood_group || "";
    if (window.confirm(`Are you sure you want to delete batch #${row.id} (${grp} at ${hosp})?`)) {
      setInventoryRows((prev) => prev.filter((r) => r.id !== row.id));
      showNotice(`Batch #${row.id} successfully removed from inventory.`);
    }
  };

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hospital.trim()) {
      setFormError("Please select or enter a valid Hospital / Blood Bank.");
      return;
    }
    const avail = parseInt(formData.available, 10);
    const res = parseInt(formData.reserved, 10) || 0;
    if (isNaN(avail) || avail < 0) {
      setFormError("Available units must be a non-negative number.");
      return;
    }

    try {
      const added = await addInventoryStock({
        hospital: formData.hospital.trim(),
        group: formData.group,
        available: avail,
        reserved: res,
        expiryDate: formData.expiryDate,
        status: formData.status,
        cost_per_unit: parseFloat(formData.cost_per_unit) || 1400,
      });

      const newRow = {
        ...added,
        id: added.id || `BAT-${Date.now().toString().slice(-4)}`,
        hospital: formData.hospital.trim(),
        group: formData.group,
        available: avail,
        reserved: res,
        total: avail + res,
        expiry: formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "30 Oct 2026",
        status: formData.status,
        cost_per_unit: parseFloat(formData.cost_per_unit) || 1400,
        location: selectedDistrict,
        data_type: "Synthetic/Demo",
      };

      setInventoryRows((prev) => [newRow, ...prev]);
      setIsAddModalOpen(false);
      showNotice(`Successfully added ${avail} units of ${formData.group} to ${formData.hospital}!`);
    } catch (err) {
      setFormError("Error adding stock: " + err.message);
    }
  };

  // Handle Update Submit
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!activeRow) return;
    const avail = parseInt(formData.available, 10);
    const res = parseInt(formData.reserved, 10) || 0;
    if (isNaN(avail) || avail < 0) {
      setFormError("Available units must be a non-negative number.");
      return;
    }

    const costPerUnit = parseFloat(formData.cost_per_unit) || 1400;

    updateInventoryStock(activeRow.id, {
      hospital: formData.hospital,
      available: avail,
      reserved: res,
      expiryDate: formData.expiryDate,
      status: formData.status,
      cost_per_unit: costPerUnit,
    }).catch((err) => console.warn("Update stock sync error:", err));

    setInventoryRows((prev) =>
      prev.map((r) => {
        if (r.id === activeRow.id) {
          return {
            ...r,
            hospital: formData.hospital,
            group: formData.group,
            available: avail,
            reserved: res,
            total: avail + res,
            status: formData.status,
            cost_per_unit: costPerUnit,
            expiry: formData.expiryDate
              ? new Date(formData.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : r.expiry,
          };
        }
        return r;
      })
    );

    setIsUpdateModalOpen(false);
    showNotice(`Successfully updated batch #${activeRow.id}!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredRows || filteredRows.length === 0) {
      showNotice("No inventory records found to export.", "error");
      return;
    }

    const headers = [
      "Batch ID",
      "Hospital",
      "Blood Group",
      "Available Units",
      "Reserved Units",
      "Total Units",
      "Expiry Date",
      "Status",
      "Location",
      "Data Type",
    ];

    const rows = filteredRows.map((r) => [
      `"${r.id || r.batch_id || ""}"`,
      `"${r.hospital || ""}"`,
      `"${r.group || r.blood_group || ""}"`,
      r.available || r.available_units || 0,
      r.reserved || r.reserved_units || 0,
      r.total || (Number(r.available || 0) + Number(r.reserved || 0)),
      `"${r.expiry || r.expiry_date || ""}"`,
      `"${r.status || ""}"`,
      `"${r.location || selectedDistrict}"`,
      `"${r.data_type || "Synthetic/Demo"}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bloodchain_inventory_${selectedDistrict.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`Exported ${filteredRows.length} inventory records to CSV.`);
  };

  const bloodGroups = useMemo(() => {
    const groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    return groups.map((bg) => {
      const totalAvail = inventoryRows
        .filter((r) => r.group === bg || r.blood_group === bg)
        .reduce((sum, r) => sum + (Number(r.available || r.available_units) || 0), 0);
      return {
        group: bg,
        units: totalAvail,
        type: totalAvail < 10 ? "low" : totalAvail > 30 ? "good" : "normal",
      };
    });
  }, [inventoryRows]);

  const totalCalculatedUnits = useMemo(() => {
    return inventoryRows.reduce(
      (sum, r) => sum + (Number(r.available || r.available_units) || 0),
      0
    );
  }, [inventoryRows]);

  const stockSummary = useMemo(() => {
    const available = totalCalculatedUnits;
    const reserved = inventoryRows.reduce(
      (sum, r) => sum + (Number(r.reserved || r.reserved_units) || 0),
      0
    );
    const expiringSoon = inventoryRows
      .filter((r) => r.status === "Expiring Soon")
      .reduce((sum, r) => sum + (Number(r.available || r.available_units) || 0), 0);
    return [
      { name: "Available", value: available || 980 },
      { name: "Reserved", value: reserved || 220 },
      { name: "Expiring Soon", value: expiringSoon || 48 },
    ];
  }, [inventoryRows, totalCalculatedUnits]);

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
              <strong>
                {currentDateTime.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
              <small>
                {currentDateTime.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </div>
          </div>

          <button
            className="inventory-refresh"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh Inventory"
            style={{ cursor: "pointer" }}
          >
            <RefreshCw
              size={16}
              style={{
                animation: isRefreshing ? "spin 1s linear infinite" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* FEEDBACK NOTICE */}
      {notice && (
        <div
          style={{
            margin: "0 0 16px",
            padding: "10px 16px",
            borderRadius: "8px",
            background: notice.type === "error" ? "#fef2f2" : "#f0fdf4",
            color: notice.type === "error" ? "#b91c1c" : "#15803d",
            border: `1px solid ${notice.type === "error" ? "#fca5a5" : "#86efac"}`,
            fontSize: "14px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{notice.msg}</span>
          <button
            onClick={() => setNotice(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= HEADER ACTIONS ================= */}

      {canManageInventory && (
        <div className="inventory-actions">
          <button className="inventory-primary-button" onClick={openAddModal}>
            <Plus size={16} />
            Add Stock
          </button>

          <button className="inventory-secondary-button" onClick={() => openUpdateModal()}>
            <Pencil size={15} />
            Update Stock
          </button>
        </div>
      )}

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
            <strong>{totalCalculatedUnits.toLocaleString()}</strong>
            <span>Total Units</span>
          </div>
        </div>
      </div>

      {/* ================= FILTERS ================= */}

      <div className="inventory-filter-bar">
        <div className="inventory-select-field">
          <label>State</label>

          <select
            value={selectedState}
            onChange={(e) => {
              const newState = e.target.value;
              setSelectedState(newState);
              const dists = getDistrictsForState(newState);
              setSelectedDistrict(dists.length > 0 ? dists[0] : "");
              setHospital("All Hospitals");
            }}
          >
            {STATES_LIST.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="inventory-select-field">
          <label>District</label>

          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setHospital("All Hospitals");
            }}
          >
            {(STATE_DISTRICTS[selectedState] || []).map((dst) => (
              <option key={dst} value={dst}>
                {dst}
              </option>
            ))}
          </select>
        </div>

        <div className="inventory-select-field">
          <label>Select Hospital</label>

          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
          >
            <option>All Hospitals</option>
            {hospitalsInDistrict.map((hosp) => (
              <option key={hosp} value={hosp}>
                {hosp}
              </option>
            ))}
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

            <button className="export-button" onClick={handleExportCSV} title="Export inventory records as CSV">
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

                  <th>Est. Cost/Unit</th>

                  <th>Status</th>

                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((row, index) => (
                  <tr key={row.id}>
                    <td>
                      <input type="checkbox" />
                    </td>

                    <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>

                    <td>
                      <strong>{row.hospital}</strong>
                    </td>

                    <td>
                      <span
                        className={`table-blood-group group-${(row.group || row.blood_group || "O+")
                          .replace("+", "plus")
                          .replace("-", "minus")}`}
                      >
                        {row.group || row.blood_group}
                      </span>
                    </td>

                    <td>
                      <strong>{row.available !== undefined ? row.available : row.available_units}</strong>
                    </td>

                    <td>{row.reserved !== undefined ? row.reserved : row.reserved_units || 0}</td>

                    <td>{row.total !== undefined ? row.total : (Number(row.available || 0) + Number(row.reserved || 0))}</td>

                    <td>{row.expiry || row.expiry_date}</td>

                    <td>
                      <strong style={{ color: "#065f46" }}>
                        ₹{(row.cost_per_unit != null ? Number(row.cost_per_unit) : 1400).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`inventory-status ${(row.status || "Sufficient")
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {row.status || "Sufficient"}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          onClick={() => openViewModal(row)}
                          title="View Batch Details"
                          style={{ cursor: "pointer" }}
                        >
                          <Eye size={14} />
                        </button>

                        {canManageInventory && (
                          <>
                            <button
                              onClick={() => openUpdateModal(row)}
                              title="Update Blood Stock"
                              style={{ cursor: "pointer" }}
                            >
                              <Pencil size={13} />
                            </button>

                            <button
                              onClick={() => handleDeleteRow(row)}
                              title="Delete Batch Record"
                              style={{ cursor: "pointer" }}
                            >
                              <MoreVertical size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="inventory-pagination">
            <span>
              Showing {filteredRows.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length} entries
            </span>

            <div>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  opacity: currentPage === 1 ? 0.4 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from(
                { length: Math.min(5, Math.ceil(filteredRows.length / rowsPerPage) || 1) },
                (_, idx) => {
                  const totalP = Math.ceil(filteredRows.length / rowsPerPage) || 1;
                  let pageNum = idx + 1;
                  if (totalP > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + idx;
                    if (pageNum > totalP) pageNum = totalP - (4 - idx);
                  }
                  return (
                    <button
                      key={pageNum}
                      className={currentPage === pageNum ? "active-page-number" : ""}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{ cursor: "pointer" }}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(Math.ceil(filteredRows.length / rowsPerPage) || 1, p + 1)
                  )
                }
                disabled={currentPage >= Math.ceil(filteredRows.length / rowsPerPage)}
                style={{
                  opacity:
                    currentPage >= Math.ceil(filteredRows.length / rowsPerPage) ? 0.4 : 1,
                  cursor:
                    currentPage >= Math.ceil(filteredRows.length / rowsPerPage)
                      ? "not-allowed"
                      : "pointer",
                }}
              >
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
            <button onClick={openAddModal} style={{ cursor: "pointer" }}>
              <Plus size={19} />
              <span>Add New Stock</span>
            </button>

            <button onClick={() => window.location.href = "/approval-transfer"} style={{ cursor: "pointer" }}>
              <ArrowLeftRight size={19} />
              <span>Transfer Units</span>
            </button>

            <button onClick={() => openUpdateModal()} style={{ cursor: "pointer" }}>
              <Pencil size={19} />
              <span>Update Stock</span>
            </button>

            <button onClick={handleExportCSV} style={{ cursor: "pointer" }}>
              <FileText size={19} />
              <span>Generate Report</span>
            </button>
          </div>
        </section>
      </div>

      {/* ==============================================================
          PREDICTIVE INTELLIGENCE & FORECASTING SUITE (PHASE 6 INTEGRATION)
      ============================================================== */}
      <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Section Header with Sub-Module Switcher */}
        <div style={{ background: "#ffffff", padding: "20px 24px", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "#fee2e2", padding: "8px", borderRadius: "10px", color: "#ed1c2c" }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>
                    Predictive Intelligence & Forecasting Suite
                  </h2>
                  <p style={{ fontSize: "15px", color: "#6b7280", margin: "4px 0 0 0" }}>
                    Proactive 30-day statistical demand forecasting, dynamic safety stock & clinical shelf-life analytics
                  </p>
                </div>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div style={{ display: "flex", gap: "6px", background: "#f3f4f6", padding: "4px", borderRadius: "10px" }}>
              <button
                type="button"
                onClick={() => setPredictiveTab("all")}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: predictiveTab === "all" ? "#ffffff" : "transparent",
                  color: predictiveTab === "all" ? "#111827" : "#6b7280",
                  boxShadow: predictiveTab === "all" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                All Predictive Modules
              </button>
              <button
                type="button"
                onClick={() => setPredictiveTab("forecast")}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: predictiveTab === "forecast" ? "#ffffff" : "transparent",
                  color: predictiveTab === "forecast" ? "#111827" : "#6b7280",
                  boxShadow: predictiveTab === "forecast" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                Demand Forecast
              </button>
              <button
                type="button"
                onClick={() => setPredictiveTab("shortage")}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: predictiveTab === "shortage" ? "#ffffff" : "transparent",
                  color: predictiveTab === "shortage" ? "#111827" : "#6b7280",
                  boxShadow: predictiveTab === "shortage" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                Shortage Risk
              </button>
              <button
                type="button"
                onClick={() => setPredictiveTab("expiry")}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  background: predictiveTab === "expiry" ? "#ffffff" : "transparent",
                  color: predictiveTab === "expiry" ? "#111827" : "#6b7280",
                  boxShadow: predictiveTab === "expiry" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                Expiry Risk
              </button>
            </div>
          </div>
        </div>

        {/* Modular Predictive Views */}
        {(predictiveTab === "all" || predictiveTab === "forecast") && (
          <DemandForecastView />
        )}

        {(predictiveTab === "all" || predictiveTab === "shortage") && (
          <ShortageRiskView />
        )}

        {(predictiveTab === "all" || predictiveTab === "expiry") && (
          <ExpiryRiskView />
        )}
      </div>

      {/* ==============================================================
          INVENTORY MODALS: ADD, UPDATE, VIEW
      ============================================================== */}

      {/* 1. ADD BLOOD STOCK MODAL */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              padding: "24px 28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "#fee2e2", color: "#ed1c2c", padding: "8px", borderRadius: "10px" }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "700", color: "#111827" }}>Add Blood Stock</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "14px", color: "#6b7280" }}>Register a new blood supply batch into inventory</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "20px", color: "#9ca3af", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "14px" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Hospital / Facility Name
                </label>
                <select
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                >
                  {hospitalsInDistrict.map((hosp) => (
                    <option key={hosp} value={hosp}>
                      {hosp}
                    </option>
                  ))}
                  <option value="District General Blood Bank">District General Blood Bank</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Blood Group
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Units (Bags)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Cost Per Unit (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="20000"
                    step="50"
                    placeholder="e.g. 1400"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Stock Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                >
                  <option value="Sufficient">Sufficient</option>
                  <option value="Adequate">Adequate</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Critical Shortage">Critical Shortage</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ed1c2c",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Add Blood Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. UPDATE BLOOD STOCK MODAL */}
      {isUpdateModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsUpdateModalOpen(false);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              padding: "24px 28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "#e0f2fe", color: "#0284c7", padding: "8px", borderRadius: "10px" }}>
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "700", color: "#111827" }}>Update Blood Stock</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "14px", color: "#6b7280" }}>
                    Modifying Batch #{activeRow?.id || activeRow?.batch_id || "Active"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "20px", color: "#9ca3af", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div style={{ padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", borderRadius: "6px", fontSize: "14px" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Hospital / Facility Name
                </label>
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Blood Group
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Available Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Reserved Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={formData.reserved}
                    onChange={(e) => setFormData({ ...formData, reserved: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Cost Per Unit (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="20000"
                    step="50"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Stock Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px" }}
                >
                  <option value="Sufficient">Sufficient</option>
                  <option value="Adequate">Adequate</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Critical Shortage">Critical Shortage</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#0284c7",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. VIEW BATCH DETAILS MODAL */}
      {isViewModalOpen && activeRow && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsViewModalOpen(false);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              padding: "24px 28px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "#fee2e2", color: "#ed1c2c", padding: "8px", borderRadius: "10px" }}>
                  <Eye size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "700", color: "#111827" }}>Batch #{activeRow.id || activeRow.batch_id}</h3>
                  <p style={{ margin: "2px 0 0", fontSize: "14px", color: "#6b7280" }}>{activeRow.hospital}</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                style={{ background: "none", border: "none", fontSize: "20px", color: "#9ca3af", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
              <div style={{ background: "#f9fafb", padding: "10px 14px", borderRadius: "8px" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Blood Group</span>
                <div style={{ fontWeight: "700", fontSize: "18px", color: "#ed1c2c", marginTop: "2px" }}>
                  {activeRow.group || activeRow.blood_group}
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "10px 14px", borderRadius: "8px" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Available Units</span>
                <div style={{ fontWeight: "700", fontSize: "18px", color: "#111827", marginTop: "2px" }}>
                  {activeRow.available !== undefined ? activeRow.available : activeRow.available_units} Units
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "10px 14px", borderRadius: "8px" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Reserved Units</span>
                <div style={{ fontWeight: "700", fontSize: "18px", color: "#111827", marginTop: "2px" }}>
                  {activeRow.reserved !== undefined ? activeRow.reserved : activeRow.reserved_units || 0} Units
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "10px 14px", borderRadius: "8px" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Total Volume</span>
                <div style={{ fontWeight: "700", fontSize: "18px", color: "#111827", marginTop: "2px" }}>
                  {activeRow.total || (Number(activeRow.available || 0) + Number(activeRow.reserved || 0))} Units
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "10px 14px", borderRadius: "8px" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Expiry Date</span>
                <div style={{ fontWeight: "600", color: "#374151", marginTop: "2px" }}>
                  {activeRow.expiry || activeRow.expiry_date}
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "10px 14px", borderRadius: "8px" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Cost Per Unit</span>
                <div style={{ fontWeight: "700", fontSize: "18px", color: "#065f46", marginTop: "2px" }}>
                  ₹{(activeRow.cost_per_unit != null ? Number(activeRow.cost_per_unit) : 1400).toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ background: "#f9fafb", padding: "10px 14px", borderRadius: "8px" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Status</span>
                <div style={{ fontWeight: "600", color: "#059669", marginTop: "2px" }}>
                  {activeRow.status || "Sufficient"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openUpdateModal(activeRow);
                }}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#0284c7",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Edit Batch
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BloodInventory;
