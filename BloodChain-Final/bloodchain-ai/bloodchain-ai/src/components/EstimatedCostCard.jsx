import { useState, useEffect } from "react";
import { Coins, AlertCircle, Info, Sparkles } from "lucide-react";
import { calculateEstimatedCostRange } from "../services/bloodService.js";

/**
 * ====================================================================
 * BLOODCHAIN AI — ESTIMATED BLOOD COMPONENT COST CARD
 * ====================================================================
 * 
 * Provides dynamic, non-speculative cost estimation for clinical blood requests.
 * Evaluates real-time available stock across connected blood banks.
 * 
 * STRICT COMPLIANCE:
 * - Informational only; does not replace official facility billing.
 * - Prototype estimate — not an official tariff.
 * - Hides if Blood Group is unselected or Units <= 0.
 * ====================================================================
 */
export default function EstimatedCostCard({
  bloodGroup,
  units,
  state = "Tamil Nadu",
  district = "Tiruchirappalli",
  inventory = null,
  style = {},
}) {
  const [costResult, setCostResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let debounceTimer = null;

    if (!bloodGroup || !units || parseInt(units, 10) <= 0 || isNaN(parseInt(units, 10))) {
      setCostResult(null);
      return;
    }

    setLoading(true);
    // 300ms debounce to avoid redundant fetches on rapid input changes
    debounceTimer = setTimeout(() => {
      calculateEstimatedCostRange({
        bloodGroup,
        units,
        state,
        district,
        inventory,
      })
        .then((res) => {
          if (isMounted) {
            setCostResult(res);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn("Cost calculation error:", err);
            setCostResult({
              status: "unavailable",
              message: "Estimated cost currently unavailable.",
              displayCost: "Unavailable",
            });
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      isMounted = false;
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [bloodGroup, units, state, district, inventory]);

  if (!bloodGroup || !units || parseInt(units, 10) <= 0 || isNaN(parseInt(units, 10))) {
    return null;
  }

  const isUnavailable = costResult?.status === "unavailable";
  const numUnits = parseInt(units, 10);

  return (
    <div
      className="estimated-cost-card"
      style={{
        background: isUnavailable
          ? "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)"
          : "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
        border: isUnavailable ? "1px solid #fdba74" : "1px solid #86efac",
        borderRadius: "12px",
        padding: "14px 16px",
        marginTop: "4px",
        marginBottom: "14px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        transition: "all 0.2s ease-in-out",
        ...style,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <div
            style={{
              background: isUnavailable ? "#ffedd5" : "#dcfce7",
              color: isUnavailable ? "#c2410c" : "#15803d",
              borderRadius: "8px",
              padding: "4px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Coins size={15} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.4px" }}>
            Estimated Blood Component Cost
          </span>
        </div>

        {costResult && !isUnavailable && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              background: "#dcfce7",
              color: "#166534",
              padding: "2px 8px",
              borderRadius: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Sparkles size={11} />
            {costResult.count} {costResult.count === 1 ? "Source" : "Sources"} Available
          </span>
        )}
      </div>

      {/* Main Cost Display */}
      <div style={{ margin: "8px 0 6px" }}>
        {loading ? (
          <div style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, fontStyle: "italic" }}>
            Calculating source estimates...
          </div>
        ) : isUnavailable ? (
          <div>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "#9a3412", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertCircle size={16} />
              <span>Estimated Cost Unavailable</span>
            </div>
            <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#7c2d12" }}>
              No suitable blood-bank source is currently available with sufficient stock for {numUnits} unit{numUnits > 1 ? "s" : ""} of {bloodGroup}.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#065f46",
                  letterSpacing: "-0.5px",
                }}
              >
                {costResult?.displayCost}
              </span>
              <span style={{ fontSize: "12px", color: "#047857", fontWeight: 600 }}>
                for {numUnits} unit{numUnits > 1 ? "s" : ""} ({bloodGroup})
              </span>
            </div>

            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#065f46", lineHeight: 1.4 }}>
              {costResult?.status === "single"
                ? "Based on the currently available source with sufficient inventory."
                : "Based on currently available connected blood-bank sources. Final cost depends on the selected supplying source."}
            </p>
          </div>
        )}
      </div>

      {/* Clinical Disclaimer Footer */}
      <div
        style={{
          borderTop: isUnavailable ? "1px dashed #fed7aa" : "1px dashed #bbf7d0",
          paddingTop: "6px",
          marginTop: "6px",
          display: "flex",
          alignItems: "flex-start",
          gap: "5px",
          fontSize: "11px",
          color: isUnavailable ? "#9a3412" : "#475569",
          lineHeight: 1.35,
        }}
      >
        <Info size={12} style={{ flexShrink: 0, marginTop: "2px" }} />
        <span>
          Estimated cost is based on currently available connected sources. Final amount is determined by the selected supplying blood bank/institution. <em>Prototype estimate — not an official tariff.</em>
        </span>
      </div>
    </div>
  );
}
