import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import AIAssistantPanel from "./AIAssistantPanel.jsx";

/**
 * BloodChain AI Assistant Custom Icon
 * Visual Concept: Organic Blood Drop shape seamlessly integrating an AI neural/circuit core.
 * Meets requirements: BLOOD + AI + ASSISTANT, healthcare technology appearance, zero generic ChatGPT/robot icons.
 */
function BloodChainAIIcon({ size = 32 }) {
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
        {/* Rich Blood Drop Gradient */}
        <linearGradient id="bcAiDropGradient" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fee2e2" stopOpacity="0.85" />
        </linearGradient>

        {/* Neural Circuit Accent */}
        <linearGradient id="bcAiCircuitGradient" x1="8" y1="12" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ed1c2c" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>

        <filter id="bcAiGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Main Blood Drop Contour */}
      <path
        d="M16 3C16 3 7.5 13.2 7.5 19.5C7.5 24.2 11.3 28 16 28C20.7 28 24.5 24.2 24.5 19.5C24.5 13.2 16 3 16 3Z"
        fill="url(#bcAiDropGradient)"
        filter="url(#bcAiGlow)"
      />

      {/* Top Specular Sheen on Drop */}
      <path
        d="M16 6.5C15 8.5 11 14 10.5 17C10 14 13.5 8 16 6.5Z"
        fill="#ffffff"
        opacity="0.8"
      />

      {/* Integrated Neural / AI Circuit Nodes inside Drop */}
      {/* Central AI Processor Node */}
      <circle cx="16" cy="19.5" r="2.6" fill="url(#bcAiCircuitGradient)" />
      <circle cx="16" cy="19.5" r="1.1" fill="#ffffff" />

      {/* Upper Left Synapse */}
      <line x1="16" y1="19.5" x2="12" y2="15.5" stroke="url(#bcAiCircuitGradient)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.5" fill="url(#bcAiCircuitGradient)" />

      {/* Upper Right Synapse */}
      <line x1="16" y1="19.5" x2="20" y2="15.5" stroke="url(#bcAiCircuitGradient)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="20" cy="15.5" r="1.5" fill="url(#bcAiCircuitGradient)" />

      {/* Lower Stem Connector */}
      <line x1="16" y1="19.5" x2="16" y2="24" stroke="url(#bcAiCircuitGradient)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="16" cy="24" r="1.3" fill="url(#bcAiCircuitGradient)" />

      {/* Micro Neural AI Spark at Drop Peak */}
      <path
        d="M16 8.5L16.6 10.2L18.3 10.8L16.6 11.4L16 13.1L15.4 11.4L13.7 10.8L15.4 10.2L16 8.5Z"
        fill="url(#bcAiCircuitGradient)"
        opacity="0.9"
      />
    </svg>
  );
}

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close when clicking outside panel and button
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* ==============================================================
          FLOATING AI ASSISTANT TRIGGER BUTTON & TOOLTIP
      ============================================================== */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9990,
          display: "flex",
          alignItems: "center",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Hover Tooltip (Desktop) */}
        <div
          role="tooltip"
          id="bc-ai-assistant-tooltip"
          style={{
            position: "absolute",
            right: "72px",
            background: "#111827",
            color: "#ffffff",
            fontSize: "12.5px",
            fontWeight: 600,
            padding: "6px 12px",
            borderRadius: "8px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            pointerEvents: "none",
            transition: "opacity 0.2s ease, transform 0.2s ease",
            opacity: isHovered && !isOpen ? 1 : 0,
            transform: isHovered && !isOpen ? "translateX(0)" : "translateX(6px)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>BloodChain AI Assistant</span>
          <span
            style={{
              position: "absolute",
              right: "-4px",
              top: "50%",
              transform: "translateY(-50%) rotate(45deg)",
              width: "8px",
              height: "8px",
              background: "#111827",
            }}
          />
        </div>

        {/* Floating Action Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={togglePanel}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          aria-label={isOpen ? "Close BloodChain AI Assistant" : "Open BloodChain AI Assistant"}
          aria-expanded={isOpen}
          aria-describedby="bc-ai-assistant-tooltip"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ed1c2c 0%, #b91c1c 100%)",
            border: "2px solid rgba(255, 255, 255, 0.4)",
            cursor: "pointer",
            boxShadow: isHovered
              ? "0 12px 28px -4px rgba(237, 28, 44, 0.55), 0 6px 12px rgba(0, 0, 0, 0.15)"
              : "0 8px 24px -4px rgba(237, 28, 44, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1)",
            transform: isHovered ? "scale(1.06) translateY(-2px)" : "scale(1) translateY(0)",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
            position: "relative",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Subtle Ambient Pulse Ring */}
          {!isOpen && (
            <span
              style={{
                position: "absolute",
                inset: "-4px",
                borderRadius: "50%",
                border: "2px solid rgba(237, 28, 44, 0.35)",
                pointerEvents: "none",
                animation: "bcPulse 2.8s infinite ease-out",
              }}
            />
          )}

          {isOpen ? (
            <X size={26} color="#ffffff" strokeWidth={2.4} />
          ) : (
            <BloodChainAIIcon size={36} />
          )}
        </button>
      </div>

      {/* ==============================================================
          BLOODCHAIN AI ASSISTANT PANEL (PHASE 2 CHAT UI)
      ============================================================== */}
      {isOpen && (
        <AIAssistantPanel ref={panelRef} onClose={() => setIsOpen(false)} />
      )}

      {/* Global Embedded Animations */}
      <style>{`
        @keyframes bcPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.18);
            opacity: 0;
          }
          100% {
            transform: scale(1.18);
            opacity: 0;
          }
        }
        @keyframes bcSlideUp {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (max-width: 480px) {
          #bc-ai-assistant-tooltip {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
