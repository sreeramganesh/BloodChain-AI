import { useState } from "react";
import {
  CircleHelp,
  Search,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  Send,
} from "lucide-react";

function HelpSupport() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "How do I create a blood request?",
      answer:
        "Open Blood Request from the sidebar, select the required blood group, enter the units needed and submit the request.",
    },
    {
      question: "How can I find nearby donors?",
      answer:
        "Open Find Donors and select the blood group, district and distance. The available donor list will be displayed.",
    },
    {
      question: "How does AI Recommendation work?",
      answer:
        "AI Recommendation compares blood availability, distance, urgency and other available source information to suggest suitable blood sources.",
    },
    {
      question: "How can I track a blood transfer?",
      answer:
        "Open Approval & Transfer or My Requests to view the current transfer status and request progress.",
    },
    {
      question: "How do I update my profile?",
      answer:
        "Open Settings from the sidebar and use the Profile section to update your account information.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="help-page">
      {/* =========================
          HEADER
      ========================= */}

      <div className="help-header">
        <div className="help-title">
          <div className="help-title-icon">
            <CircleHelp size={29} />
          </div>

          <div>
            <div className="help-eyebrow">SUPPORT CENTER</div>

            <h1>Help & Support</h1>

            <p>
              Find answers, get assistance and learn how to use BloodChain AI.
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="help-search-card">
        <div className="help-search-icon">
          <Search size={22} />
        </div>

        <div>
          <h2>How can we help you?</h2>

          <p>Search our frequently asked questions.</p>
        </div>

        <div className="help-search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search for help..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* =========================
          QUICK SUPPORT
      ========================= */}

      <div className="help-section-title">
        <h2>Get Support</h2>

        <p>Choose the support option that works best for you.</p>
      </div>

      <div className="support-grid">
        {/* CHAT */}

        <div className="support-card">
          <div className="support-icon blue">
            <MessageCircle size={24} />
          </div>

          <div className="support-card-content">
            <h3>Live Chat</h3>

            <p>Chat with our support team for quick assistance.</p>

            <button className="support-button blue-button">
              <MessageCircle size={15} />
              Start Chat
            </button>
          </div>
        </div>

        {/* PHONE */}

        <div className="support-card">
          <div className="support-icon red">
            <Phone size={24} />
          </div>

          <div className="support-card-content">
            <h3>Call Support</h3>

            <p>Speak directly with our support team for urgent issues.</p>

            <button className="support-button red-button">
              <Phone size={15} />
              Call Support
            </button>
          </div>
        </div>

        {/* EMAIL */}

        <div className="support-card">
          <div className="support-icon green">
            <Mail size={24} />
          </div>

          <div className="support-card-content">
            <h3>Email Support</h3>

            <p>Send us your questions and we'll get back to you.</p>

            <button className="support-button green-button">
              <Mail size={15} />
              Send Email
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          FAQ + RIGHT SIDE
      ========================= */}

      <div className="help-main-grid">
        {/* FAQ */}

        <div className="faq-card">
          <div className="faq-header">
            <div className="faq-header-icon">
              <CircleHelp size={22} />
            </div>

            <div>
              <h2>Frequently Asked Questions</h2>

              <p>Find quick answers to common questions.</p>
            </div>
          </div>

          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <div className="no-results">
                <Search size={28} />

                <strong>No results found</strong>

                <span>Try a different search term.</span>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    className={`faq-item ${isOpen ? "open" : ""}`}
                    key={faq.question}
                  >
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span>{faq.question}</span>

                      <ChevronDown
                        size={18}
                        className={isOpen ? "faq-arrow-open" : ""}
                      />
                    </button>

                    {isOpen && <div className="faq-answer">{faq.answer}</div>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}

        <div className="help-right-column">
          {/* KNOWLEDGE BASE */}

          <div className="help-info-card">
            <div className="help-info-icon purple">
              <BookOpen size={22} />
            </div>

            <div>
              <h3>Knowledge Base</h3>

              <p>
                Learn more about BloodChain features, blood management and
                workflows.
              </p>

              <button>Explore Guides →</button>
            </div>
          </div>

          {/* SECURITY */}

          <div className="help-info-card">
            <div className="help-info-icon green">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h3>Security & Privacy</h3>

              <p>
                Learn how your BloodChain account and healthcare information is
                protected.
              </p>

              <button>Security Guide →</button>
            </div>
          </div>

          {/* EMERGENCY */}

          <div className="emergency-card">
            <div className="emergency-icon">
              <AlertTriangle size={23} />
            </div>

            <h3>Emergency Support</h3>

            <p>
              For urgent blood-related situations, contact your hospital
              emergency team immediately.
            </p>

            <button>
              <Phone size={15} />
              Emergency Support
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          CONTACT FORM
      ========================= */}

      <div className="contact-support-card">
        <div className="contact-support-icon">
          <Send size={24} />
        </div>

        <div className="contact-support-text">
          <h2>Still need help?</h2>

          <p>
            Send a message to our support team and we'll help you resolve your
            issue.
          </p>
        </div>

        <button>
          Contact Support
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

export default HelpSupport;
