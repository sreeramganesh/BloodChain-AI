import React from "react";
import {
  Droplets,
  Building2,
  ClipboardList,
  AlertTriangle,
  Brain,
  Truck,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

/**
 * Capability Definitions (Section 4)
 */
const CAPABILITIES = [
  {
    id: "blood-availability",
    title: "Blood Availability",
    desc: "Blood inventory and blood-group availability",
    icon: Droplets,
    color: "#ed1c2c",
    bgColor: "#fef2f2",
    sampleQuestion: "How can I check blood availability across hospitals?",
  },
  {
    id: "hospitals-blood-banks",
    title: "Hospitals & Blood Banks",
    desc: "Find and understand connected facilities",
    icon: Building2,
    color: "#0284c7",
    bgColor: "#f0f9ff",
    sampleQuestion: "How do I find connected blood banks in my district?",
  },
  {
    id: "blood-requests",
    title: "Blood Requests",
    desc: "Create and track blood requests",
    icon: ClipboardList,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    sampleQuestion: "How do I create a blood request?",
  },
  {
    id: "risk-insights",
    title: "Risk Insights",
    desc: "Understand shortage and expiry risks",
    icon: AlertTriangle,
    color: "#ea580c",
    bgColor: "#fff7ed",
    sampleQuestion: "What is shortage risk and how does expiry risk work?",
  },
  {
    id: "ai-recommendations",
    title: "AI Recommendations",
    desc: "Understand BloodChain recommendations",
    icon: Brain,
    color: "#059669",
    bgColor: "#ecfdf5",
    sampleQuestion: "How does BloodChain recommend a source?",
  },
  {
    id: "transfers",
    title: "Transfers",
    desc: "Understand blood transfer workflows",
    icon: Truck,
    color: "#0891b2",
    bgColor: "#ecfeff",
    sampleQuestion: "How do I track a transfer?",
  },
];

/**
 * Quick Questions (Section 5)
 */
const QUICK_QUESTIONS = [
  "Check current blood availability",
  "Show current blood requests",
  "How does BloodChain recommend a source?",
  "What is shortage risk?",
  "Show expiry risks",
  "How do I create a blood request?",
  "How do I track a transfer?",
];

export default function AIQuickActions({ onSelectQuestion }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Capability Cards Section */}
      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#64748b",
            letterSpacing: "0.5px",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span>BloodChain Capabilities</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "8px",
          }}
        >
          {CAPABILITIES.map((cap) => {
            const IconComp = cap.icon;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => onSelectQuestion(cap.sampleQuestion)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "10px",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = cap.color;
                  e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                title={`Ask about ${cap.title}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      background: cap.bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={14} color={cap.color} />
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#1e293b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {cap.title}
                  </span>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    color: "#64748b",
                    lineHeight: "1.35",
                  }}
                >
                  {cap.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Question Buttons Section */}
      <div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "#64748b",
            letterSpacing: "0.5px",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <HelpCircle size={13} color="#ed1c2c" />
          <span>Quick Questions</span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(q)}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "20px",
                padding: "6px 12px",
                fontSize: "12px",
                color: "#334155",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "left",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fee2e2";
                e.currentTarget.style.borderColor = "#fca5a5";
                e.currentTarget.style.color = "#b91c1c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.color = "#334155";
              }}
            >
              <span>{q}</span>
              <ArrowRight size={11} style={{ opacity: 0.6 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
