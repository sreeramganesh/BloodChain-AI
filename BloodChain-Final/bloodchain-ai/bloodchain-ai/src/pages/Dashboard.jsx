import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  RefreshCw,
  CheckCircle2,
  Bell,
  Heart,
  Users,
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

import { useAuth } from "../context/AuthContext";
import { getBloodInventory, getBloodRequests } from "../services/bloodService";
import { getNotifications } from "../services/notificationService";
import { PredictiveDashboardSummary } from "../components/predictive";
import { STATE_DISTRICTS } from "../constants/locationData";
import { getSyntheticDistrictSummaryForState } from "../constants/hospitalMasterData";

// Fallback baseline for initial display
const BASE_DISTRICT_DATA = [
  { district: "Trichy", units: 1248, change: "+12%", status: "Good" },
  { district: "Thanjavur", units: 842, change: "+8%", status: "Good" },
  { district: "Madurai", units: 1096, change: "-3%", status: "Moderate" },
  { district: "Coimbatore", units: 1385, change: "+15%", status: "Good" },
  { district: "Chennai", units: 2410, change: "+6%", status: "Good" },
];

const BASE_BLOOD_BANKS = [
  { name: "Trichy Blood Bank", location: "Cantonment, Trichy", units: 420, status: "Available" },
  { name: "SRM Hospital Blood Bank", location: "Trichy", units: 285, status: "Available" },
  { name: "Kauvery Hospital", location: "Trichy", units: 198, status: "Limited" },
  { name: "Apollo Hospital", location: "Trichy", units: 176, status: "Available" },
];

const BASE_RECENT_REQUESTS = [
  { id: "BRQ001", hospital: "Trichy Government Hospital", group: "O+", units: 20, urgency: "Critical", status: "Pending" },
  { id: "BRQ002", hospital: "SRM Hospital", group: "A+", units: 10, urgency: "High", status: "Processing" },
  { id: "BRQ003", hospital: "Apollo Hospital", group: "B+", units: 15, urgency: "Medium", status: "Approved" },
  { id: "BRQ004", hospital: "Kauvery Hospital", group: "AB-", units: 5, urgency: "High", status: "Pending" },
];

// Standard blood groups list
const BLOOD_GROUPS_LIST = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function Dashboard({ user: propUser }) {
  const navigate = useNavigate();
  const { user: authUser, role, isDonor, isHospital, isBloodBank } = useAuth();
  const user = propUser || authUser;
  const displayName = user?.name || "User";

  // Data states
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifSummary, setNotifSummary] = useState({ unread: 0, critical: 0, high: 0 });

  // Filter states (State -> District dependent)
  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [selectedDistrict, setSelectedDistrict] = useState("Tiruchirappalli");
  const [appliedState, setAppliedState] = useState("Tamil Nadu");
  const [appliedDistrict, setAppliedDistrict] = useState("Tiruchirappalli");
  const [filterAppliedNotice, setFilterAppliedNotice] = useState(false);

  // Available districts dependent on selectedState
  const availableDistricts = useMemo(() => {
    if (!selectedState || !STATE_DISTRICTS[selectedState]) {
      return [];
    }
    return STATE_DISTRICTS[selectedState];
  }, [selectedState]);

  // Handle State selection change: auto-selects first district and updates data
  const handleStateChange = (e) => {
    const nextState = e.target.value;
    setSelectedState(nextState);
    const districts = STATE_DISTRICTS[nextState] || [];
    const firstDist = districts.length > 0 ? districts[0] : "";
    setSelectedDistrict(firstDist);
    setAppliedState(nextState);
    setAppliedDistrict(firstDist);
    setFilterAppliedNotice(true);
    setTimeout(() => setFilterAppliedNotice(false), 2400);
  };

  // Handle District selection change
  const handleDistrictChange = (e) => {
    const nextDistrict = e.target.value;
    setSelectedDistrict(nextDistrict);
    setAppliedDistrict(nextDistrict);
    setFilterAppliedNotice(true);
    setTimeout(() => setFilterAppliedNotice(false), 2400);
  };

  // Fetch live Supabase data (or location-aware synthetic data)
  const loadDashboardData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);

    try {
      const [invData, reqData, notifs] = await Promise.all([
        getBloodInventory({ state: appliedState, district: appliedDistrict }),
        getBloodRequests({ state: appliedState, district: appliedDistrict }),
        getNotifications({ userId: user?.id, role: user?.role }),
      ]);

      if (Array.isArray(invData) && invData.length > 0) {
        setInventory(invData);
      }
      if (Array.isArray(reqData) && reqData.length > 0) {
        setRequests(reqData);
      }
      if (Array.isArray(notifs)) {
        setNotifSummary({
          unread: notifs.filter((n) => !n.is_read).length,
          critical: notifs.filter((n) => n.priority === "Critical").length,
          high: notifs.filter((n) => n.priority === "High").length,
        });
      }
    } catch (err) {
      console.error("Dashboard failed to fetch live data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, appliedState, appliedDistrict]);

  useEffect(() => {
    let ignore = false;
    async function initData() {
      try {
        const [invData, reqData, notifs] = await Promise.all([
          getBloodInventory({ state: appliedState, district: appliedDistrict }),
          getBloodRequests({ state: appliedState, district: appliedDistrict }),
          getNotifications({ userId: user?.id, role: user?.role }),
        ]);
        if (!ignore) {
          if (Array.isArray(invData) && invData.length > 0) setInventory(invData);
          if (Array.isArray(reqData) && reqData.length > 0) setRequests(reqData);
          if (Array.isArray(notifs)) {
            setNotifSummary({
              unread: notifs.filter((n) => !n.is_read).length,
              critical: notifs.filter((n) => n.priority === "Critical").length,
              high: notifs.filter((n) => n.priority === "High").length,
            });
          }
        }
      } catch (err) {
        console.error("Dashboard init error:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    initData();
    return () => {
      ignore = true;
    };
  }, [user, appliedState, appliedDistrict]);

  // Handle Location Apply
  const handleApplyFilter = () => {
    if (selectedState) {
      setAppliedState(selectedState);
    }
    if (selectedDistrict) {
      setAppliedDistrict(selectedDistrict);
    }
    setFilterAppliedNotice(true);
    setTimeout(() => setFilterAppliedNotice(false), 2400);
  };

  // Filter inventory by location if available
  const filteredInventory = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];
    if (!appliedDistrict || appliedDistrict === "" || appliedDistrict === "Select District") {
      return inventory;
    }
    const targetDistrict = appliedDistrict.toLowerCase();
    const matched = inventory.filter((item) => {
      if (!item.location) return true;
      const loc = item.location.toLowerCase();
      if (loc === targetDistrict) return true;
      if (targetDistrict === "tiruchirappalli" && loc === "trichy") return true;
      if (targetDistrict === "trichy" && loc === "tiruchirappalli") return true;
      return false;
    });
    return matched.length > 0 ? matched : inventory;
  }, [inventory, appliedDistrict]);

  // Dynamic KPI Metrics
  const totalUnits = useMemo(() => {
    if (filteredInventory.length === 0) return 1248;
    return filteredInventory.reduce((sum, item) => sum + (Number(item.available) || 0), 0);
  }, [filteredInventory]);

  const activeRequestsCount = useMemo(() => {
    if (requests.length === 0) return 5;
    return requests.filter((r) =>
      ["Pending", "In Progress", "In Review", "Processing"].includes(r.status)
    ).length;
  }, [requests]);

  const shortageAlertsCount = useMemo(() => {
    if (filteredInventory.length === 0) return 3;
    return filteredInventory.filter(
      (item) => item.status === "Low Stock" || (Number(item.available) || 0) < 25
    ).length;
  }, [filteredInventory]);

  const expiringSoonUnits = useMemo(() => {
    if (filteredInventory.length === 0) return 28;
    const expiringItems = filteredInventory.filter((item) => item.status === "Expiring Soon");
    if (expiringItems.length === 0) return 0;
    return expiringItems.reduce((sum, item) => sum + (Number(item.available) || 0), 0);
  }, [filteredInventory]);

  // Dynamic Chart Data for all 8 blood groups
  const bloodChartData = useMemo(() => {
    if (filteredInventory.length === 0) {
      return [
        { group: "A+", units: 240 },
        { group: "A-", units: 65 },
        { group: "B+", units: 210 },
        { group: "B-", units: 42 },
        { group: "O+", units: 320 },
        { group: "O-", units: 90 },
        { group: "AB+", units: 150 },
        { group: "AB-", units: 131 },
      ];
    }

    return BLOOD_GROUPS_LIST.map((grp) => {
      const units = filteredInventory
        .filter((item) => item.group === grp)
        .reduce((sum, item) => sum + (Number(item.available) || 0), 0);
      return { group: grp, units };
    });
  }, [filteredInventory]);

  // Dynamic AI Insight derived from real stock levels
  const aiInsight = useMemo(() => {
    const sorted = [...bloodChartData].sort((a, b) => a.units - b.units);
    const lowestTwo = sorted.slice(0, 2).map((g) => g.group);
    const lowestStr = lowestTwo.join(" and ");

    return {
      title: `Attention needed in ${appliedDistrict}`,
      desc: `${lowestStr} blood groups are currently at the lowest safety threshold in this region.`,
      recommendation: `Dispatch automated requests to registered ${lowestStr} donors and reserve incoming hospital batches.`,
    };
  }, [bloodChartData, appliedDistrict]);

  // Dynamic Nearby Blood Banks
  const dynamicBloodBanks = useMemo(() => {
    if (filteredInventory.length === 0) return BASE_BLOOD_BANKS;

    const map = {};
    filteredInventory.forEach((item) => {
      const hosp = item.hospital || "Trichy Blood Center";
      if (!map[hosp]) {
        map[hosp] = {
          name: hosp,
          location: appliedDistrict,
          units: 0,
        };
      }
      map[hosp].units += Number(item.available) || 0;
    });

    const list = Object.values(map);
    if (list.length === 0) return BASE_BLOOD_BANKS;

    return list.map((b) => ({
      ...b,
      status: b.units > 50 ? "Available" : b.units > 20 ? "Limited" : "Low Stock",
    }));
  }, [filteredInventory, appliedDistrict]);

  // Dynamic Recent Requests
  const displayRequests = useMemo(() => {
    if (requests.length === 0) return BASE_RECENT_REQUESTS;
    return requests.slice(0, 5).map((r) => ({
      id: r.id,
      hospital: r.hospital || "Trichy GH",
      group: r.group || "O+",
      units: r.units || 1,
      urgency: r.urgency || "Medium",
      status: r.status || "Pending",
    }));
  }, [requests]);

  // Regional blood distribution data based on selected state
  const regionalDistrictsData = useMemo(() => {
    const list = getSyntheticDistrictSummaryForState(appliedState || selectedState || "Tamil Nadu");
    if (list && list.length > 0) return list;
    return BASE_DISTRICT_DATA;
  }, [appliedState, selectedState]);

  // Date and Time
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
          <p>
            Here's the blood supply status for <strong>{appliedDistrict}</strong>, {selectedState}.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            title="Refresh Live Data from Supabase"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 14px",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
                color: "#ed1c2c",
              }}
            />
            {refreshing ? "Syncing..." : "Sync"}
          </button>

          <div className="dashboard-date-card">
            <CalendarDays size={22} />
            <div>
              <strong>{dateText}</strong>
              <span>{timeText}</span>
            </div>
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
            <strong>Location Filter</strong>
            <span>View live blood inventory and hospital distribution by region</span>
          </div>
        </div>

        <div className="filter-controls">
          <div className="select-group">
            <label>State</label>
            <div className="custom-select">
              <select
                value={selectedState}
                onChange={handleStateChange}
              >
                <option value="">Select State</option>
                {Object.keys(STATE_DISTRICTS).map((stateName) => (
                  <option key={stateName} value={stateName}>
                    {stateName}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </div>
          </div>

          <div className="select-group">
            <label>District</label>
            <div className="custom-select">
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                disabled={!selectedState || availableDistricts.length === 0}
                style={{
                  cursor: !selectedState ? "not-allowed" : "pointer",
                }}
              >
                <option value="">Select District</option>
                {availableDistricts.map((districtName) => (
                  <option key={districtName} value={districtName}>
                    {districtName}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} />
            </div>
          </div>

          <button
            className="apply-filter"
            onClick={handleApplyFilter}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {filterAppliedNotice ? (
              <>
                <CheckCircle2 size={15} /> Applied
              </>
            ) : (
              "Apply"
            )}
          </button>
        </div>
      </div>

      {/* ==============================================================
          ROLE-SPECIFIC PULSE / PREDICTIVE INTELLIGENCE
      ============================================================== */}
      {isDonor ? (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #fed7aa",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                borderRadius: "10px",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart size={24} fill="#dc2626" />
            </div>
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "600", color: "#111827" }}>
                Donor Portal & Community Impact
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                Track your donation appointments, monitor community blood requests, and access instant support.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => navigate("/my-donations")}
              style={{
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <Heart size={14} /> My Donations
            </button>
            <button
              type="button"
              onClick={() => navigate("/find-donors")}
              style={{
                background: "#ffffff",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
              }}
            >
              <Users size={14} /> Find Donors
            </button>
          </div>
        </div>
      ) : (
        <PredictiveDashboardSummary />
      )}

      {/* ==============================================================
          OPERATIONAL NOTIFICATIONS SUMMARY (PHASE 8 INTEGRATION)
      ============================================================== */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #fed7aa",
          borderRadius: "14px",
          padding: "14px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              background: "#fff7ed",
              color: "#ea580c",
              borderRadius: "10px",
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={22} />
          </div>
          <div>
            <h4
              style={{
                margin: "0 0 4px",
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Operational Notifications & Alerts
            </h4>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#ea580c", fontWeight: "600" }}>
                {notifSummary.unread} Unread
              </span>
              <span style={{ color: "#d1d5db" }}>•</span>
              <span style={{ color: "#dc2626", fontWeight: "600" }}>
                {notifSummary.critical} Critical
              </span>
              <span style={{ color: "#d1d5db" }}>•</span>
              <span style={{ color: "#d97706", fontWeight: "600" }}>
                {notifSummary.high} High
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/notifications")}
          style={{
            background: "#ffffff",
            color: "#dc2626",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "14px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          View Notifications <ArrowRight size={14} />
        </button>
      </div>

      {/* =========================
          STAT CARDS (DYNAMIC)
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
          <div className="stat-number">
            {loading ? "..." : totalUnits.toLocaleString("en-IN")}
          </div>
          <div className="stat-label">Total Blood Units</div>
          <div className="stat-description">Available in {appliedDistrict}</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon requests">
              <ClipboardList size={22} />
            </div>
            <div className="stat-trend positive">
              <ArrowUpRight size={13} />
              Live
            </div>
          </div>
          <div className="stat-number">
            {loading ? "..." : activeRequestsCount}
          </div>
          <div className="stat-label">Active Requests</div>
          <div className="stat-description">Awaiting hospital fulfillment</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon shortage">
              <AlertTriangle size={22} />
            </div>
            <div className="stat-trend negative">
              <ArrowUpRight size={13} />
              Alert
            </div>
          </div>
          <div className="stat-number">
            {loading ? "..." : shortageAlertsCount}
          </div>
          <div className="stat-label">Shortage Alerts</div>
          <div className="stat-description">Units below safety threshold</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon expiring">
              <Clock3 size={22} />
            </div>
            <div className="stat-trend negative">
              <ArrowDownRight size={13} />
              Urgent
            </div>
          </div>
          <div className="stat-number">
            {loading ? "..." : expiringSoonUnits}
          </div>
          <div className="stat-label">Units Expiring Soon</div>
          <div className="stat-description">Requires immediate priority use</div>
        </div>
      </div>

      {/* =========================
          CHART + AI INSIGHT
      ========================= */}
      <div className="dashboard-grid">
        {/* BLOOD GROUP CHART */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <div>
              <h2>Blood Group Availability</h2>
              <p>Live inventory breakdown across {appliedDistrict}</p>
            </div>
            <button
              className="view-link"
              onClick={() => navigate(isDonor ? "/find-donors" : "/blood-inventory")}
            >
              {isDonor ? "Find Donors" : "View Inventory"}
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bloodChartData}
                margin={{ top: 15, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="group" tick={{ fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(val) => [`${val} units`, "Available Units"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
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
              <h2>AI Insight Engine</h2>
              <span>Updated live from database</span>
            </div>
          </div>

          <div className="ai-content">
            <h3>{aiInsight.title}</h3>
            <p>{aiInsight.desc}</p>

            <div className="ai-recommendation">
              <Activity size={20} />
              <div>
                <strong>Recommended Action</strong>
                <span>{aiInsight.recommendation}</span>
              </div>
            </div>

            <button
              className="ai-button"
              onClick={() => navigate(isDonor ? "/find-donors" : "/ai-recommendation")}
            >
              {isDonor ? "Find Compatible Donors" : "View AI Recommendations"}
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
              <h2>Regional Blood Distribution</h2>
              <p>{appliedState || selectedState || "Tamil Nadu"} regional reserves</p>
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
                {regionalDistrictsData.map((item) => (
                  <tr key={item.district}>
                    <td>
                      <strong>{item.district}</strong>
                    </td>
                    <td>
                      {item.district.toLowerCase() === appliedDistrict.toLowerCase()
                        ? totalUnits.toLocaleString("en-IN")
                        : item.units.toLocaleString("en-IN")}
                    </td>
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
                          item.status === "Good" ? "good" : item.status === "Moderate" ? "moderate" : "critical"
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
              <h2>Connected Blood Banks</h2>
              <p>Active medical centers in {appliedDistrict}</p>
            </div>
            <button
              className="view-link"
              onClick={() => navigate(isDonor ? "/find-donors" : "/hospitals-blood-banks")}
            >
              {isDonor ? "Find Donors" : "View All"}
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="blood-bank-list">
            {dynamicBloodBanks.map((bank) => (
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
                      bank.status === "Available"
                        ? "available"
                        : bank.status === "Limited"
                        ? "limited"
                        : "critical"
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
            <p>Live incoming emergency and hospital requests</p>
          </div>
          <button
            className="view-link"
            onClick={() => navigate(isDonor ? "/my-requests" : "/blood-request")}
          >
            {isDonor ? "View My Requests" : "View All Requests"}
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Hospital / Facility</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayRequests.map((request) => (
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
                        request.status === "Approved" || request.status === "Fulfilled"
                          ? "approved"
                          : request.status === "In Progress" || request.status === "Processing" || request.status === "Matched"
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
