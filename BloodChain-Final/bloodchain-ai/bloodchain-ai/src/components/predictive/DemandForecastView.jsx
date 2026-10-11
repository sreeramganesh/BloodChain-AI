import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Brain,
  Filter,
  BarChart3,
  Calendar,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
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
import { getDemandPredictions } from "../../services/predictiveService";

export default function DemandForecastView() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedFacility, setSelectedFacility] = useState("All");
  const [selectedGroup, setSelectedGroup] = useState("All");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDemandPredictions();
      setPredictions(data || []);
    } catch (err) {
      console.error("Failed to load demand predictions:", err);
      setError("Unable to load predictive demand forecasts at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Distinct facilities
  const facilities = useMemo(() => {
    const set = new Set(predictions.map((p) => p.facility_name).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [predictions]);

  const bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // Filtered dataset
  const filteredData = useMemo(() => {
    return predictions.filter((p) => {
      const matchFac = selectedFacility === "All" || p.facility_name === selectedFacility;
      const matchGrp = selectedGroup === "All" || p.blood_group === selectedGroup;
      return matchFac && matchGrp;
    });
  }, [predictions, selectedFacility, selectedGroup]);

  // Aggregate for chart
  const chartData = useMemo(() => {
    const map = {};
    ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].forEach((g) => {
      map[g] = 0;
    });
    filteredData.forEach((p) => {
      if (map[p.blood_group] !== undefined) {
        map[p.blood_group] += p.predicted_units || 0;
      }
    });
    return Object.entries(map).map(([group, units]) => ({
      group,
      predicted: Math.round(units * 10) / 10,
    }));
  }, [filteredData]);

  return (
    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "#fee2e2", padding: "8px", borderRadius: "10px", color: "#ed1c2c" }}>
              <TrendingUp size={20} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>
              30-Day Predictive Demand Forecast
            </h2>
          </div>
          <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "4px", marginBottom: 0 }}>
            Statistical projection using <strong>Holt Linear Exponential Smoothing</strong> (v1.0-12m-statistical)
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
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b7280" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", marginBottom: "8px", color: "#ed1c2c" }} />
          <p style={{ margin: 0, fontSize: "15px" }}>Loading predictive demand forecasts...</p>
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
          <p style={{ margin: 0, fontSize: "15px" }}>No forecast records available for the selected filters.</p>
        </div>
      )}

      {!loading && !error && filteredData.length > 0 && (
        <>
          {/* Chart */}
          <div style={{ height: "220px", width: "100%", marginBottom: "24px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="group" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={{ stroke: "#e5e7eb" }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={{ stroke: "#e5e7eb" }} />
                <Tooltip
                  formatter={(val) => [`${val} units`, "Predicted Demand"]}
                  contentStyle={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
                <Bar dataKey="predicted" fill="#ed1c2c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
            {filteredData.slice(0, 8).map((p) => (
              <div
                key={p.id}
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{p.blood_group}</span>
                  <span style={{ fontSize: "11px", background: "#e0e7ff", color: "#3730a3", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                    {p.forecast_period}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.facility_name}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "4px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 800, color: "#ed1c2c" }}>{p.predicted_units}</span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>units</span>
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                  95% CI: [{p.lower_bound} – {p.upper_bound}] units
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
