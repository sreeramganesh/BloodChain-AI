import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { getExpiryRisks } from "../../services/predictiveService";

export default function ExpiryRiskView() {
  const [expiryData, setExpiryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedFacility, setSelectedFacility] = useState("All");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpiryRisks();
      setExpiryData(data || []);
    } catch (err) {
      console.error("Failed to load expiry risks:", err);
      setError("Unable to load inventory expiry risk evaluations at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Distinct facilities
  const facilities = useMemo(() => {
    const set = new Set(
      expiryData.map((e) => e.facility_name || e.hospital).filter(Boolean)
    );
    return ["All", ...Array.from(set)];
  }, [expiryData]);

  const bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const riskLevels = ["All", "Critical", "High", "Medium", "Low"];

  // Filtered dataset
  const filteredData = useMemo(() => {
    return expiryData.filter((item) => {
      const facName = item.facility_name || item.hospital;
      const matchFac = selectedFacility === "All" || facName === selectedFacility;
      const matchGrp = selectedGroup === "All" || item.blood_group === selectedGroup;
      const matchLvl = selectedLevel === "All" || item.risk_level === selectedLevel;
      return matchFac && matchGrp && matchLvl;
    });
  }, [expiryData, selectedFacility, selectedGroup, selectedLevel]);

  // Direct backend risk level styling (no frontend-calculated thresholds)
  const getBadgeStyle = (level) => {
    switch (level) {
      case "Critical":
        return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
      case "High":
        return { background: "#ffedd5", color: "#9a3412", border: "1px solid #fed7aa" };
      case "Medium":
        return { background: "#fef9c3", color: "#854d0e", border: "1px solid #fef08a" };
      case "Low":
      default:
        return { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" };
    }
  };

  return (
    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "#ffedd5", padding: "8px", borderRadius: "10px", color: "#ea580c" }}>
              <Clock size={20} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>
              Inventory Expiry Risk Intelligence
            </h2>
          </div>
          <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "4px", marginBottom: 0 }}>
            Proactive shelf-life tracking, day thresholds & allocation advisories from verified clinical inventory
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            background: "#f9fafb",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#374151",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "15px", color: "#6b7280", fontWeight: 600 }}>Facility:</span>
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", color: "#374151", background: "#ffffff" }}
          >
            {facilities.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "15px", color: "#6b7280", fontWeight: 600 }}>Blood Group:</span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", color: "#374151", background: "#ffffff" }}
          >
            {bloodGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "15px", color: "#6b7280", fontWeight: 600 }}>Risk Level:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "16px", color: "#374151", background: "#ffffff" }}
          >
            {riskLevels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b7280" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "8px", color: "#ea580c" }} />
          <p style={{ margin: 0, fontSize: "15px" }}>Loading expiry risk evaluations...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "14px", display: "flex", alignItems: "center", gap: "10px", color: "#991b1b" }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: "14px" }}>{error}</span>
        </div>
      )}

      {!loading && !error && filteredData.length === 0 && (
        <div style={{ textAlign: "center", padding: "30px 20px", color: "#9ca3af" }}>
          <p style={{ margin: 0, fontSize: "15px" }}>No expiry risk records match the selected filters.</p>
        </div>
      )}

      {/* Expiry Risk Table */}
      {!loading && !error && filteredData.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f3f4f6", color: "#6b7280" }}>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Facility</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Blood Group</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Available Units</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Expiry Date</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Days Remaining</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Risk Score</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Risk Level</th>
                <th style={{ padding: "10px 12px", fontWeight: 600 }}>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#111827" }}>
                    {item.facility_name || item.hospital}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ fontWeight: 700, color: "#dc2626", background: "#fef2f2", padding: "2px 8px", borderRadius: "6px" }}>
                      {item.blood_group}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#374151" }}>
                    <span style={{ fontWeight: 600 }}>{item.available_units}</span> units
                  </td>
                  <td style={{ padding: "12px", color: "#4b5563" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Calendar size={13} color="#6b7280" />
                      <span>{item.expiry_date || "N/A"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: item.days_remaining <= 1 ? "#dc2626" : item.days_remaining <= 3 ? "#ea580c" : "#16a34a",
                      }}
                    >
                      {item.days_remaining} {item.days_remaining === 1 ? "day" : "days"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ flex: 1, height: "6px", background: "#f3f4f6", borderRadius: "3px", width: "45px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(100, item.risk_score)}%`,
                            background: item.risk_score >= 80 ? "#dc2626" : item.risk_score >= 50 ? "#ea580c" : "#16a34a",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#4b5563" }}>
                        {item.risk_score}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        ...getBadgeStyle(item.risk_level),
                      }}
                    >
                      {item.risk_level}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#374151", maxWidth: "280px" }}>
                    <span style={{ fontSize: "12px", lineHeight: "1.3" }}>
                      {item.recommended_action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
