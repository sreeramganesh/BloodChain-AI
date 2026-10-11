import { useState, useEffect, useRef } from "react";
import { Check, X, ArrowRight, ShieldCheck } from "lucide-react";

export default function RegistrationSuccessModal({
  isOpen,
  onClose,
  onContinue,
  email,
  requiresEmailConfirmation = false,
  autoRedirectSeconds = 3,
}) {
  const [countdown, setCountdown] = useState(autoRedirectSeconds);
  const timerRef = useRef(null);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(autoRedirectSeconds);
      hasNavigatedRef.current = false;
      return;
    }

    setCountdown(autoRedirectSeconds);
    hasNavigatedRef.current = false;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!hasNavigatedRef.current && onContinue) {
            hasNavigatedRef.current = true;
            onContinue();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, autoRedirectSeconds, onContinue]);

  const handleContinueClick = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!hasNavigatedRef.current && onContinue) {
      hasNavigatedRef.current = true;
      onContinue();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: "16px",
      }}
      onClick={handleContinueClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <style>{`
        @keyframes bcSuccessModalEntrance {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes bcCheckmarkPulse {
          0% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 12px rgba(220, 38, 38, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }
      `}</style>

      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "440px",
          padding: "36px 30px 30px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
          position: "relative",
          animation: "bcSuccessModalEntrance 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Red Accent Stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #f87171 100%)",
          }}
        />

        {/* Optional Close Button */}
        {onClose && (
          <button
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              onClose();
            }}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s ease",
            }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        )}

        {/* Success Icon with soft red/pink background */}
        <div
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "#fee2e2",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            animation: "bcCheckmarkPulse 1.6s ease-out infinite",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#dc2626",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={28} strokeWidth={3} />
          </div>
        </div>

        {/* Title */}
        <h2
          id="success-modal-title"
          style={{
            margin: "0 0 10px 0",
            fontSize: "22px",
            fontWeight: "800",
            color: "#0f172a",
            letterSpacing: "-0.02em",
          }}
        >
          Account Created Successfully!
        </h2>

        {/* Description */}
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#475569",
          }}
        >
          {requiresEmailConfirmation ? (
            <>
              Your BloodChain AI account has been registered. Please check{" "}
              <strong>{email || "your email"}</strong> to verify your account, then sign in.
            </>
          ) : (
            <>
              Your BloodChain AI account has been created successfully. Please sign in with your credentials to continue.
            </>
          )}
        </p>

        {/* Security verification micro-badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            padding: "5px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            color: "#64748b",
            margin: "12px 0 24px",
          }}
        >
          <ShieldCheck size={14} color="#16a34a" />
          <span>Encrypted Healthcare Authentication</span>
        </div>

        {/* Primary Action Button: Continue to Login */}
        <button
          type="button"
          onClick={handleContinueClick}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "13px 20px",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(220, 38, 38, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(220, 38, 38, 0.3)";
          }}
          autoFocus
        >
          <span>Continue to Login</span>
          <ArrowRight size={17} />
        </button>

        {/* Auto Redirect Countdown */}
        <div
          style={{
            marginTop: "14px",
            fontSize: "12px",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#10b981",
              display: "inline-block",
            }}
          />
          <span>
            Redirecting automatically in{" "}
            <strong style={{ color: "#0f172a" }}>{countdown}s</strong>...
          </span>
        </div>
      </div>
    </div>
  );
}
