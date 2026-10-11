import React, { useState } from "react";
import { User, ShieldAlert, Sparkles } from "lucide-react";

/**
 * Custom BloodChain AI Icon for Assistant message avatars
 */
export function BloodChainMiniIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="miniDropGrad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fee2e2" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="miniCircGrad" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ed1c2c" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <path
        d="M16 3C16 3 7.5 13.2 7.5 19.5C7.5 24.2 11.3 28 16 28C20.7 28 24.5 24.2 24.5 19.5C24.5 13.2 16 3 16 3Z"
        fill="url(#miniDropGrad)"
      />
      <circle cx="16" cy="19.5" r="2.6" fill="url(#miniCircGrad)" />
      <circle cx="16" cy="19.5" r="1.1" fill="#ffffff" />
      <line x1="16" y1="19.5" x2="12" y2="15.5" stroke="url(#miniCircGrad)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.5" fill="url(#miniCircGrad)" />
      <line x1="16" y1="19.5" x2="20" y2="15.5" stroke="url(#miniCircGrad)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="20" cy="15.5" r="1.5" fill="url(#miniCircGrad)" />
    </svg>
  );
}

/**
 * Message Component
 * Renders distinct visual styles for USER and ASSISTANT messages.
 */
export default function AIMessage({ message }) {
  const isUser = message.sender === "user";

  const [showFactors, setShowFactors] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: "10px",
        marginBottom: "14px",
        width: "100%",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "10px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isUser
            ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
            : "linear-gradient(135deg, #ed1c2c 0%, #b91c1c 100%)",
          color: "#ffffff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        {isUser ? <User size={16} /> : <BloodChainMiniIcon size={20} />}
      </div>

      {/* Message Bubble Container */}
      <div
        style={{
          maxWidth: "82%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        {/* Sender Name & Timestamp */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "4px",
            fontSize: "11px",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          <span>{isUser ? "You" : "BloodChain AI"}</span>
          <span>•</span>
          <span>{message.timestamp || "Just now"}</span>
        </div>

        {/* Message Bubble Body */}
        <div
          style={{
            padding: "11px 14px",
            borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
            background: isUser ? "#1e293b" : "#ffffff",
            color: isUser ? "#ffffff" : "#1e293b",
            fontSize: "13px",
            lineHeight: "1.55",
            border: isUser ? "none" : "1px solid #e2e8f0",
            boxShadow: isUser
              ? "0 3px 10px rgba(15, 23, 42, 0.15)"
              : "0 2px 8px rgba(0, 0, 0, 0.04)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.text}

          {/* Phase 6 Lightweight Expandable Decision Support Breakdown (Step 18 & 19) */}
          {!isUser && (message.category === "Decision Support" || message.decisionSupportData) && (
            <div style={{ marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => setShowFactors((prev) => !prev)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#0369a1",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "background 0.15s ease",
                }}
              >
                <span>Why this matters</span>
                <span>{showFactors ? "▲" : "▼"}</span>
              </button>

              {showFactors && (
                <div
                  style={{
                    marginTop: "6px",
                    padding: "8px 10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#334155",
                    lineHeight: "1.5",
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    Clinical Sourcing Factors (FEFO & Safety):
                  </div>
                  <div>✓ <b>Compatibility:</b> Immunological ABO/Rh matching prevents hemolytic reactions.</div>
                  <div>📍 <b>Stock Availability:</b> Unreserved usable units physically logged in cold storage.</div>
                  <div>⏱ <b>Travel Window:</b> Minimizes transit duration to protect blood cell viability.</div>
                  <div>⚠ <b>Shortage Risk:</b> Safeguards reserve buffer at the supplying facility.</div>
                  <div>○ <b>Expiry Risk:</b> FEFO priority routing prevents clinical blood wastage.</div>
                </div>
              )}
            </div>
          )}

          {/* Phase 4 Live Supabase Data Badge */}
          {!isUser && message.source === "live-supabase-data" && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "10.5px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#059669",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#10b981",
                  }}
                />
                Live Supabase Data
              </span>
              <span style={{ color: "#64748b" }}>Read-Only • Real-Time DB</span>
            </div>
          )}

          {/* Phase 4 Knowledge + Live Data Mixed Badge */}
          {!isUser && message.source === "knowledge-and-live-data" && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "10.5px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#7c3aed",
                  fontWeight: 600,
                }}
              >
                <Sparkles size={11} color="#7c3aed" />
                Knowledge + Live Data
              </span>
              <span style={{ color: "#64748b" }}>Verified + Real-Time DB</span>
            </div>
          )}

          {/* Verified Static Knowledge Footer */}
          {!isUser && message.source === "bloodchain-knowledge" && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "10.5px",
                color: "#64748b",
              }}
            >
              <span style={{ fontWeight: 600, color: "#1e3a8a" }}>
                BloodChain Verified Knowledge
              </span>
              <span>Decision Support</span>
            </div>
          )}

          {/* Fallback / Live Data Unavailable Footer */}
          {!isUser && (message.source === "fallback" || message.source === "live-data-unavailable") && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "10.5px",
                color: "#94a3b8",
              }}
            >
              <span style={{ fontWeight: 600, color: "#64748b" }}>
                Live Data Unavailable
              </span>
              <span>General Guidance</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
