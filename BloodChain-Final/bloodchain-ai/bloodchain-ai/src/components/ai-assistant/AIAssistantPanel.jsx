import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, RefreshCw, MessageSquare } from "lucide-react";
import AIMessage, { BloodChainMiniIcon } from "./AIMessage.jsx";
import AIQuickActions from "./AIQuickActions.jsx";
import { getBloodChainKnowledgeResponse } from "../../services/aiAssistant/knowledgeService.js";

const AIAssistantPanel = React.forwardRef(function AIAssistantPanel({ onClose }, ref) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionContextRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSelectQuestion = (questionText) => {
    setInputValue(questionText);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await getBloodChainKnowledgeResponse(text, sessionContextRef.current);
      if (response?.contextState) {
        sessionContextRef.current = response.contextState;
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        topic: response.topic,
        category: response.category,
        source: response.source,
        decisionSupportData: response.decisionSupportData || null,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("[BloodChain AI Assistant] Query error:", err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "I couldn't retrieve the current BloodChain data right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        topic: "error",
        category: "System Error",
        source: "fallback",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputValue("");
    sessionContextRef.current = null;
    inputRef.current?.focus();
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby="bc-assistant-title"
      aria-modal="false"
      style={{
        position: "fixed",
        bottom: "94px",
        right: "24px",
        width: "410px",
        maxWidth: "calc(100vw - 32px)",
        height: "600px",
        maxHeight: "calc(100vh - 120px)",
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.22), 0 0 1px 1px rgba(0, 0, 0, 0.06)",
        border: "1px solid #fee2e2",
        overflow: "hidden",
        zIndex: 9991,
        display: "flex",
        flexDirection: "column",
        animation: "bcSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ==============================================================
          1. ASSISTANT HEADER (Section 2)
      ============================================================== */}
      <div
        style={{
          background: "linear-gradient(135deg, #12204a 0%, #1e3a8a 100%)",
          color: "#ffffff",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(237, 28, 44, 0.2)",
              border: "1px solid rgba(237, 28, 44, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BloodChainMiniIcon size={24} />
          </div>

          <div>
            <h2
              id="bc-assistant-title"
              style={{
                margin: 0,
                fontSize: "15px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.2px",
                lineHeight: "1.2",
              }}
            >
              BloodChain AI Assistant
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "3px",
              }}
            >
              <span style={{ fontSize: "11.5px", color: "#93c5fd", fontWeight: 500 }}>
                Healthcare Decision Support
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "rgba(16, 185, 129, 0.18)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  color: "#6ee7b7",
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "1px 6px",
                  borderRadius: "10px",
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
                AI Assistant
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleResetChat}
              title="Reset Conversation"
              aria-label="Reset Conversation"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "#cbd5e1",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#cbd5e1")}
            >
              <RefreshCw size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close BloodChain AI Assistant"
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              border: "none",
              color: "#ffffff",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)")}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ==============================================================
          2. SCROLLING MESSAGE / WELCOME BODY (Section 3, 4, 5, 8)
      ============================================================== */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overscrollBehavior: "contain",
          padding: "16px",
          background: "#fafafa",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Welcome State (Shown when no messages yet) */}
        {messages.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Welcome Greeting Banner */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #fee2e2",
                borderRadius: "14px",
                padding: "16px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#fef2f2",
                  color: "#ed1c2c",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                <Sparkles size={12} />
                <span>Decision Support Ready</span>
              </div>

              <h3
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Hello! I&apos;m your BloodChain AI Assistant.
              </h3>

              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "13px",
                  lineHeight: "1.55",
                  color: "#475569",
                }}
              >
                I can help you understand and navigate the BloodChain blood-management platform.
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                What can I help you with?
              </p>
            </div>

            {/* Capability Cards & Quick Questions */}
            <AIQuickActions onSelectQuestion={handleSelectQuestion} />
          </div>
        ) : (
          /* Render Active Message History */
          <div style={{ display: "flex", flexDirection: "column" }}>
            {messages.map((msg) => (
              <AIMessage key={msg.id} message={msg} />
            ))}

            {/* Deliberation / Typing Indicator */}
            {isTyping && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #ed1c2c 0%, #b91c1c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <BloodChainMiniIcon size={20} />
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "4px 16px 16px 16px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#ed1c2c",
                      animation: "bcBlink 1.4s infinite",
                    }}
                  />
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#ed1c2c",
                      animation: "bcBlink 1.4s infinite 0.2s",
                    }}
                  />
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#ed1c2c",
                      animation: "bcBlink 1.4s infinite 0.4s",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "4px" }}>
                    Checking current BloodChain data...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ==============================================================
          3. FIXED BOTTOM INPUT AREA (Section 7)
      ============================================================== */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          background: "#ffffff",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask BloodChain AI..."
            aria-label="Ask BloodChain AI"
            style={{
              flex: 1,
              resize: "none",
              padding: "10px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#1e293b",
              background: "#ffffff",
              fontFamily: "inherit",
              outline: "none",
              lineHeight: "1.4",
              maxHeight: "80px",
              minHeight: "40px",
              boxSizing: "border-box",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#ed1c2c")}
            onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background:
                !inputValue.trim() || isTyping
                  ? "#e2e8f0"
                  : "linear-gradient(135deg, #ed1c2c 0%, #b91c1c 100%)",
              border: "none",
              color: !inputValue.trim() || isTyping ? "#94a3b8" : "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: !inputValue.trim() || isTyping ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0,
              boxShadow:
                !inputValue.trim() || isTyping ? "none" : "0 3px 8px rgba(237, 28, 44, 0.35)",
            }}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Input Helper note / Phase indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "10.5px",
            color: "#94a3b8",
            padding: "0 2px",
          }}
        >
          <span>Shift+Enter for new line • Enter to send</span>
          <span>Phase 2 Chat UI</span>
        </div>
      </div>

      <style>{`
        @keyframes bcBlink {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
});

export default AIAssistantPanel;
