import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, CircleHelp, Home } from "lucide-react";
import { getRoleLabel } from "../utils/rbac";

export default function AccessDenied({ currentRole, allowedRoles = [] }) {
  const navigate = useNavigate();

  const formattedCurrentRole = getRoleLabel(currentRole);
  const formattedAllowedRoles = allowedRoles.map(getRoleLabel).join(" or ");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #fee2e2",
          borderRadius: "16px",
          maxWidth: "520px",
          width: "100%",
          padding: "36px 28px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
        }}
      >
        {/* Warning Icon Badge */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          <ShieldAlert size={34} />
        </div>

        {/* Text Header */}
        <div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#dc2626",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Access Restricted
          </span>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#0f172a",
              margin: "6px 0 8px",
            }}
          >
            Access Restricted
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#475569",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            You don't have permission to access this section.
          </p>
        </div>

        {/* Role Diagnostic Badge */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "12px 16px",
            width: "100%",
            boxSizing: "border-box",
            fontSize: "13px",
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          <div>
            Your logged-in role:{" "}
            <strong style={{ color: "#0f172a" }}>{formattedCurrentRole}</strong>
          </div>
          {formattedAllowedRoles && (
            <div style={{ marginTop: "4px" }}>
              Required access level:{" "}
              <strong style={{ color: "#dc2626" }}>{formattedAllowedRoles}</strong>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            width: "100%",
            marginTop: "6px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "11px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#dc2626",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(220, 38, 38, 0.3)",
              transition: "background 0.15s ease",
            }}
          >
            <Home size={16} />
            Go to Dashboard
          </button>

          <Link
            to="/help-support"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "11px 18px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#475569",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <CircleHelp size={16} />
            Help & Support
          </Link>
        </div>
      </div>
    </div>
  );
}
