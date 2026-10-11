import { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { getPredictiveDashboardSummary } from "../../services/predictiveService";

export default function PredictiveDashboardSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPredictiveDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to load predictive dashboard summary:", err);
      setError("Unable to load predictive indicators.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cards = [
    {
      title: "30-Day Demand Forecast",
      value: summary ? `${summary.totalPredictedDemand30d} Units` : "--",
      subtitle: "Holt Linear statistical model",
      icon: TrendingUp,
      color: "#ed1c2c",
      bg: "#fee2e2",
    },
    {
      title: "Critical Shortage Points",
      value: summary ? summary.criticalShortagesCount : "--",
      subtitle: "Zero stock vs safety buffer",
      icon: ShieldAlert,
      color: "#dc2626",
      bg: "#fee2e2",
    },
    {
      title: "High-Risk Shortages",
      value: summary ? summary.highShortagesCount : "--",
      subtitle: "Depletion risk within 7 days",
      icon: AlertTriangle,
      color: "#d97706",
      bg: "#fef3c7",
    },
    {
      title: "Imminent Expiries (≤3d)",
      value: summary ? `${summary.expiringSoonUnits} Units` : "--",
      subtitle: "Eligible for priority transfer",
      icon: Clock,
      color: "#ea580c",
      bg: "#ffedd5",
    },
    {
      title: "AI Advisory Allocations",
      value: summary ? summary.activeRecommendationsCount : "--",
      subtitle: "Human review required",
      icon: Sparkles,
      color: "#2563eb",
      bg: "#dbeafe",
    },
  ];

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
            Predictive Intelligence Pulse
          </h3>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "2px 0 0 0" }}>
            Real-time proactive monitoring across 5 monitored facilities and regional supply chain
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 10px",
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#374151",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={12} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Sync
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "15px", fontWeight: 600, color: "#6b7280" }}>{c.title}</span>
                <div style={{ background: c.bg, color: c.color, padding: "6px", borderRadius: "8px" }}>
                  <Icon size={16} />
                </div>
              </div>

              <div>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "#111827" }}>
                  {loading ? "..." : c.value}
                </span>
              </div>

              <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                {c.subtitle}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
