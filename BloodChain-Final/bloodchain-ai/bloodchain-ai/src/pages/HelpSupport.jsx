import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  X,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  FileText,
  Truck,
  Heart,
  Droplets,
  Building2,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { submitContactMessage, getBloodInventory } from "../services/bloodService";

function HelpSupport() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search & Accordion State
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(0); // Default open first FAQ

  // Modal States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Selected guide in Knowledge Base
  const [selectedGuideIndex, setSelectedGuideIndex] = useState(0);

  // Feedback Notification Banner
  const [actionNotice, setActionNotice] = useState(null);

  const showNotification = (message) => {
    setActionNotice(message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Chat conversation state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! Welcome to BloodChain AI Support. How can I help you today?",
      time: "Just now",
      actions: [
        { label: "Create Blood Request", path: "/blood-request" },
        { label: "Find Donors", path: "/find-donors" },
        { label: "Check Blood Inventory", path: "/blood-inventory" },
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatContext, setChatContext] = useState({
    awaiting: null,
    bloodGroup: null,
    lastTopic: null,
  });
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping, isChatOpen]);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    subject: "BloodChain AI Support Request",
    category: "General Inquiry",
    message: "",
  });
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  // Still need help / Contact form state
  const [contactForm, setContactForm] = useState({
    name: user?.name || "Keerthiga S",
    email: user?.email || "keerthiga@bloodchain.ai",
    subject: "Technical Support",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Comprehensive FAQ list
  const faqs = [
    {
      question: "How do I create a blood request?",
      answer:
        "Open 'Blood Request' or 'My Requests' from the sidebar and click '+ New Blood Request'. Select the patient blood group, units required, destination facility, and urgency level (Critical, High, or Normal). Upon submission, your request is immediately assigned an ID (e.g. BRQ001) and queued for AI source allocation.",
      category: "Requests",
      tags: ["request", "new", "create", "units", "blood group", "urgency"],
    },
    {
      question: "How can I find nearby donors?",
      answer:
        "Open 'Find Donors' from the sidebar. You can filter voluntary donors by blood group, district, and distance radius. Each compatible donor card displays contact details, last donation date, and verified availability. Click the call button to initiate immediate contact.",
      category: "Donors",
      tags: ["donor", "find", "nearby", "contact", "volunteer", "blood group"],
    },
    {
      question: "How does AI Recommendation work?",
      answer:
        "Our AI engine analyzes real-time blood bank inventory across 48+ connected facilities using a clinical ABO/Rh compatibility matrix, in-database Haversine distance, source safety buffer thresholds, and component expiration windows. It calculates a suitability score (0–100%) and provides explainable rationale for medical officer review.",
      category: "AI",
      tags: ["ai", "recommendation", "algorithm", "score", "compatibility", "matching"],
    },
    {
      question: "How can I track a blood transfer?",
      answer:
        "Open 'Approval & Transfer' or 'My Requests' to view the live tracking timeline. The monitor displays dispatch ambulance vehicles, digital cold-chain temperature compliance (+2°C to +6°C), and estimated arrival timestamps (ETA).",
      category: "Transfers",
      tags: ["transfer", "track", "cold chain", "ambulance", "delivery", "eta"],
    },
    {
      question: "How do I check blood inventory & expiry risks?",
      answer:
        "Open 'Blood Inventory' to view live stock by blood group. The Expiry Risk Sentinel categorizes units nearing biological shelf-life (35–42 days for whole blood, 5 days for platelets) and recommends timely rotational redistribution under First-Expiry-First-Out (FEFO) rules.",
      category: "Inventory",
      tags: ["inventory", "expiry", "stock", "shelf life", "fefo", "units"],
    },
    {
      question: "How do I update my profile and notifications?",
      answer:
        "Open 'Settings' from the sidebar or click your profile avatar in the topbar and select 'Settings' or 'Profile'. You can update your contact information, password, and customize your alert preferences for shortage warnings and dispatch updates.",
      category: "Account",
      tags: ["profile", "settings", "notifications", "update", "account", "password"],
    },
    {
      question: "What should I do during an emergency blood shortage?",
      answer:
        "If your facility faces critical stock depletion, trigger an Emergency Blood Request marked as 'Critical' or call the 24/7 State Blood Transfusion Helpline at 1800-425-1333. Our system immediately alerts neighboring blood banks with surplus reserves.",
      category: "Emergency",
      tags: ["emergency", "shortage", "urgent", "helpline", "1800", "critical"],
    },
    {
      question: "How is healthcare data and donor privacy protected?",
      answer:
        "All records are secured via Supabase PostgreSQL Row Level Security (RLS) policies and encrypted sessions. Donor contact numbers and patient diagnostic records are strictly shielded and accessible only to authorized medical officers.",
      category: "Security",
      tags: ["security", "privacy", "data", "rls", "protection", "encryption"],
    },
  ];

  // Dynamic filter for search
  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q) ||
        faq.tags.some((tag) => tag.includes(q))
    );
  }, [search, faqs]);

  // Knowledge Base Guides
  const guides = [
    {
      title: "How to Create a Blood Request",
      category: "Clinical Workflow",
      icon: FileText,
      route: "/blood-request",
      steps: [
        "Navigate to 'Blood Request' in the left sidebar.",
        "Click the '+ New Blood Request' button to launch the requisition form.",
        "Specify the patient's blood group (e.g. O+, A-, B+).",
        "Enter the required whole blood or component units (minimum 1 unit).",
        "Select your hospital / clinical department and set the urgency level.",
        "Click 'Submit Blood Request'. The requisition is broadcast to AI source matching.",
      ],
      tip: "For surgical procedures, submit your request at least 24 hours in advance to allow seamless cross-matching.",
    },
    {
      title: "How to Find & Contact Donors",
      category: "Donor Network",
      icon: Heart,
      route: "/find-donors",
      steps: [
        "Open 'Find Donors' from the navigation sidebar.",
        "Choose the required blood group from the dropdown selector.",
        "Filter by district and set your preferred distance radius.",
        "Review compatible voluntary donors with verified health eligibility.",
        "Click 'Call Donor' to initiate immediate phone coordination.",
      ],
      tip: "Universal donors (O-) can provide red blood cells to any patient in severe trauma emergencies.",
    },
    {
      title: "Understanding AI Recommendations",
      category: "Decision Support",
      icon: Droplets,
      route: "/ai-recommendation",
      steps: [
        "Navigate to 'AI Recommendation' to inspect prioritized allocation matches.",
        "The system evaluates donor-recipient ABO/Rh clinical compatibility.",
        "Haversine GPS calculation identifies the closest supplying blood bank.",
        "The engine ensures the donor facility retains a minimum safety stock buffer.",
        "Units nearing expiry are prioritized to reduce clinical biological waste.",
        "Click 'Accept' to authorize the transfer or 'Reject' with clinical notes.",
      ],
      tip: "AI recommendations are strictly advisory; a medical officer's digital sign-off is always required.",
    },
    {
      title: "Blood Inventory & Expiry Tracking",
      category: "Inventory Management",
      icon: Clock,
      route: "/blood-inventory",
      steps: [
        "Open 'Blood Inventory' to view live on-shelf units across all blood groups.",
        "Check status pills: Green (Available), Yellow (Low Stock), Red (Critical).",
        "Review the Expiry Sentinel table for units expiring in 1–3 days.",
        "Click 'Update Stock' to record incoming donation batches or deductions.",
        "Use 'Export CSV' to download official reports for regulatory audit.",
      ],
      tip: "Enforce First-Expiry-First-Out (FEFO) dispensing to maintain near-zero wastage.",
    },
    {
      title: "Approving Blood Transfers & Cold Chain",
      category: "Logistics",
      icon: Truck,
      route: "/approval-transfer",
      steps: [
        "Access 'Approval & Transfer' to review scheduled inter-facility dispatches.",
        "Inspect the assigned transport ambulance and digital cold-box sensor status.",
        "Verify temperature compliance is maintained within the +2°C to +6°C safe corridor.",
        "Upon physical arrival, scan the barcode manifest and confirm receipt.",
        "Both supplying and receiving hospital ledgers update automatically.",
      ],
      tip: "Report any cold-chain temperature excursion above +6°C immediately before transfusion.",
    },
    {
      title: "Managing Donations & Certificates",
      category: "Donor Records",
      icon: Building2,
      route: "/my-donations",
      steps: [
        "Navigate to 'My Donations' to review your personal blood donation history.",
        "Click 'Schedule New Donation' to book an upcoming whole blood slot.",
        "Select your preferred hospital, appointment date, and time window.",
        "After completion, click 'View Certificate' to access your official recognition.",
        "Download or print your verified life-saver certificate for your records.",
      ],
      tip: "Healthy adults can safely donate whole blood once every 90 days (3 months).",
    },
  ];

  // Helper to extract blood group from user message
  const extractBloodGroup = (text) => {
    const t = text.toLowerCase();
    if (/\bab[- ]?(?:negative|ve)\b|\bab-\b/.test(t)) return "AB-";
    if (/\bab[+]|\bab[- ]?(?:positive|ve)\b/.test(t)) return "AB+";
    if (/\ba[- ]?(?:negative|ve)\b|\ba-\b/.test(t)) return "A-";
    if (/\ba[+]|\ba[- ]?(?:positive|ve)\b/.test(t)) return "A+";
    if (/\bb[- ]?(?:negative|ve)\b|\bb-\b/.test(t)) return "B-";
    if (/\bb[+]|\bb[- ]?(?:positive|ve)\b/.test(t)) return "B+";
    if (/\bo[- ]?(?:negative|ve)\b|\bo-\b/.test(t)) return "O-";
    if (/\bo[+]|\bo[- ]?(?:positive|ve)\b/.test(t)) return "O+";
    return null;
  };

  // Intent-based response classifier with conversational context
  const generateChatResponse = (userText, currentContext, inventoryData = []) => {
    const text = userText.trim();
    const lower = text.toLowerCase();
    const bg = extractBloodGroup(text);

    // 1. EMERGENCY & MEDICAL SAFETY
    if (
      lower.includes("emergency") ||
      lower.includes("urgent blood") ||
      lower.includes("life threatening") ||
      lower.includes("need blood immediately") ||
      lower.includes("critical condition") ||
      lower.includes("patient dying") ||
      lower.includes("severe bleeding") ||
      lower.includes("trauma emergency")
    ) {
      return {
        responseText:
          "If this is an immediate medical emergency, please contact your hospital emergency team or local emergency services immediately. BloodChain AI can help locate relevant blood-source information, but it does not replace emergency medical care.\n\nYou can also contact the 24/7 State Blood Transfusion Helpline at 1800-425-1333 or dial 108 for Emergency Ambulance Dispatch.",
        actions: [
          { label: "Call 108 Ambulance", type: "tel", href: "tel:108" },
          { label: "Call 1800-425-1333", type: "tel", href: "tel:18004251333" },
          { label: "Create Emergency Request", path: "/blood-request" },
        ],
        nextContext: { awaiting: null, lastTopic: "emergency" },
      };
    }

    // 2. CONTEXTUAL CONVERSATION MULTI-TURN
    if (currentContext?.awaiting === "blood_group_for_request") {
      if (bg) {
        return {
          responseText: `Got it. You need ${bg} blood. How many units do you need, and is this an urgent requirement? Would you like to search available blood sources or create a request now?`,
          actions: [
            { label: "Create Blood Request", path: "/blood-request" },
            { label: `Check ${bg} Inventory`, path: "/blood-inventory" },
          ],
          nextContext: { awaiting: "units_or_confirm", bloodGroup: bg, lastTopic: "request" },
        };
      }
    }

    if (currentContext?.awaiting === "units_or_confirm") {
      if (
        lower.includes("unit") ||
        lower.includes("urgent") ||
        lower.includes("yes") ||
        lower.includes("sure") ||
        lower.includes("please") ||
        /\d+/.test(lower)
      ) {
        const selectedBg = currentContext.bloodGroup || "blood";
        return {
          responseText: `Understood. You can use the Hospitals & Blood Banks section to check available ${selectedBg} sources, or click Create Blood Request below to launch the formal requisition form and initiate AI source matching.`,
          actions: [
            { label: "Create Blood Request", path: "/blood-request" },
            { label: "Hospitals & Blood Banks", path: "/hospitals-blood-banks" },
          ],
          nextContext: { awaiting: null, bloodGroup: selectedBg, lastTopic: "request" },
        };
      }
    }

    // Simple affirmative response to previous context
    if (
      lower === "yes" ||
      lower === "sure" ||
      lower === "yeah" ||
      lower === "yep" ||
      lower === "yes please" ||
      lower === "ok"
    ) {
      if (currentContext?.lastTopic === "request" || currentContext?.lastTopic === "inventory") {
        const selectedBg = currentContext.bloodGroup ? ` for ${currentContext.bloodGroup}` : "";
        return {
          responseText: `Sure. You can use the Hospitals & Blood Banks or Blood Inventory section to check available sources${selectedBg}, or submit a direct blood request below.`,
          actions: [
            { label: "Create Blood Request", path: "/blood-request" },
            { label: "Check Blood Inventory", path: "/blood-inventory" },
          ],
          nextContext: { awaiting: null, lastTopic: "inventory" },
        };
      }
      return {
        responseText:
          "How else can I assist you with BloodChain AI features today? Feel free to ask about blood requests, donors, inventory availability, or AI recommendations.",
        actions: [
          { label: "Create Blood Request", path: "/blood-request" },
          { label: "Find Donors", path: "/find-donors" },
          { label: "Check Blood Inventory", path: "/blood-inventory" },
        ],
        nextContext: { awaiting: null, lastTopic: "general" },
      };
    }

    // 3. GREETINGS
    if (
      /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|namaste|hi there|hello there)\b/i.test(
        lower
      ) ||
      lower === "hello" ||
      lower === "hi" ||
      lower === "hey"
    ) {
      return {
        responseText: "Hello! Welcome to BloodChain AI Support. How can I help you today?",
        actions: [
          { label: "Create Blood Request", path: "/blood-request" },
          { label: "Find Donors", path: "/find-donors" },
          { label: "Check Blood Inventory", path: "/blood-inventory" },
        ],
        nextContext: { awaiting: null, lastTopic: "greeting" },
      };
    }

    // 4. BLOOD DONATION & ELIGIBILITY
    if (
      lower.includes("donate") ||
      lower.includes("donation") ||
      lower.includes("eligible") ||
      lower.includes("eligibility") ||
      lower.includes("give blood") ||
      lower.includes("volunteer donor") ||
      lower.includes("requirements for donating") ||
      lower.includes("criteria")
    ) {
      return {
        responseText:
          "Yes, you may be able to donate blood if you meet the eligibility requirements. Eligibility can depend on your age (typically 18–65 years), general health condition, weight (minimum 45–50 kg), recent illness, medications, and other factors. Please contact a blood bank or healthcare professional to confirm whether you are currently eligible.",
        actions: [
          { label: "Find Donors / Camps", path: "/find-donors" },
          { label: "My Donations", path: "/my-donations" },
        ],
        nextContext: { awaiting: null, lastTopic: "donation" },
      };
    }

    // 5. SPECIFIC BLOOD GROUP AVAILABILITY QUERY (e.g. "Is O+ available?", "Show O negative stock")
    if (
      bg &&
      (lower.includes("available") ||
        lower.includes("availability") ||
        lower.includes("stock") ||
        lower.includes("inventory") ||
        lower.includes("how much") ||
        lower.includes("have") ||
        lower.includes("units"))
    ) {
      const matching = Array.isArray(inventoryData)
        ? inventoryData.filter((item) => item.group === bg)
        : [];
      const totalUnits = matching.reduce(
        (sum, item) => sum + (Number(item.available) || 0),
        0
      );

      if (totalUnits > 0) {
        const topHospitals = [
          ...new Set(matching.map((item) => item.hospital).filter(Boolean)),
        ]
          .slice(0, 2)
          .join(", ");

        const facilityText = topHospitals ? ` (including ${topHospitals})` : "";
        return {
          responseText: `According to current BloodChain inventory data, there are approximately ${totalUnits} available units of ${bg} across registered facilities${facilityText}. You can filter real-time availability by hospital and location in the Blood Inventory section.`,
          actions: [
            { label: `Check ${bg} Inventory`, path: "/blood-inventory" },
            { label: "Create Blood Request", path: "/blood-request" },
          ],
          nextContext: { awaiting: null, bloodGroup: bg, lastTopic: "inventory" },
        };
      } else if (matching.length === 0 && inventoryData.length === 0) {
        return {
          responseText: `I can't verify the current ${bg} inventory from the available data right now. Please check the Blood Inventory section.`,
          actions: [
            { label: "Check Blood Inventory", path: "/blood-inventory" },
            { label: "Create Blood Request", path: "/blood-request" },
          ],
          nextContext: { awaiting: null, bloodGroup: bg, lastTopic: "inventory" },
        };
      } else {
        return {
          responseText: `Currently, there are 0 recorded units of ${bg} in the immediate reserve buffer. You can check neighboring facilities under Hospitals & Blood Banks or launch a high-urgency blood request to alert regional banks.`,
          actions: [
            { label: "Create Blood Request", path: "/blood-request" },
            { label: "Find Donors", path: "/find-donors" },
          ],
          nextContext: { awaiting: null, bloodGroup: bg, lastTopic: "inventory" },
        };
      }
    }

    // 6. BLOOD REQUEST / "I NEED BLOOD"
    const isRequestIntent =
      lower.includes("blood request") ||
      lower.includes("create request") ||
      lower.includes("how do i create") ||
      lower.includes("how can i request") ||
      lower.includes("request blood") ||
      lower.includes("how to request") ||
      /\b(?:need|want|require|order|get|looking for)\b.*\b(?:blood|units?)\b/i.test(lower) ||
      /\b(?:need|want|require|looking for|get)\b.*\b(?:o|a|b|ab)[+-]?\b/i.test(lower);

    if (isRequestIntent) {
      if (bg) {
        return {
          responseText: `To create a blood request, open My Requests and select Create Blood Request. Enter the required blood group (${bg}), number of units, urgency, hospital details, and required date/time. Submit the request to start the approval process.\n\nWould you like to create a blood request now?`,
          actions: [
            { label: `Create ${bg} Request`, path: "/blood-request" },
            { label: "Check Blood Inventory", path: "/blood-inventory" },
          ],
          nextContext: { awaiting: "units_or_confirm", bloodGroup: bg, lastTopic: "request" },
        };
      }

      if (
        lower.includes("how do i create") ||
        lower.includes("how can i request") ||
        lower.includes("create blood request") ||
        lower.includes("how to request")
      ) {
        return {
          responseText:
            "To create a blood request, open My Requests and select Create Blood Request. Enter the required blood group, number of units, urgency, hospital details, and required date/time. Submit the request to start the approval process.",
          actions: [
            { label: "Create Blood Request", path: "/blood-request" },
            { label: "My Requests", path: "/my-requests" },
          ],
          nextContext: { awaiting: "blood_group_for_request", lastTopic: "request" },
        };
      }

      // Direct "I need blood" statement
      return {
        responseText: "Sure. What blood group do you need?",
        actions: [
          { label: "Create Blood Request", path: "/blood-request" },
          { label: "Check Blood Inventory", path: "/blood-inventory" },
        ],
        nextContext: { awaiting: "blood_group_for_request", lastTopic: "request" },
      };
    }

    // 7. FIND DONOR
    if (
      lower.includes("find donor") ||
      lower.includes("find a donor") ||
      lower.includes("need a donor") ||
      lower.includes("where can i find donor") ||
      lower.includes("where can i find donors") ||
      lower.includes("search donor") ||
      lower.includes("contact donor") ||
      lower.includes("voluntary donor") ||
      lower.includes("donor list") ||
      lower.includes("locate donor")
    ) {
      return {
        responseText:
          "Open Find Donors and enter the required blood group and location. BloodChain AI can help you identify relevant available donor sources based on the information available in the system.",
        actions: [
          { label: "Find Donors", path: "/find-donors" },
          { label: "Create Blood Request", path: "/blood-request" },
        ],
        nextContext: { awaiting: null, lastTopic: "donor" },
      };
    }

    // 8. GENERAL BLOOD INVENTORY & STOCK
    if (
      lower.includes("inventory") ||
      lower.includes("blood stock") ||
      lower.includes("available blood") ||
      lower.includes("blood availability") ||
      lower.includes("units available") ||
      lower.includes("check blood") ||
      lower.includes("how much blood") ||
      lower.includes("stock")
    ) {
      return {
        responseText:
          "Use the Blood Inventory or Hospitals & Blood Banks section to check available blood units. You can filter by blood group and location.",
        actions: [
          { label: "Check Blood Inventory", path: "/blood-inventory" },
          { label: "Hospitals & Blood Banks", path: "/hospitals-blood-banks" },
        ],
        nextContext: { awaiting: null, lastTopic: "inventory" },
      };
    }

    // 9. AI RECOMMENDATION
    if (
      lower.includes("ai recommendation") ||
      lower.includes("ai find") ||
      lower.includes("algorithm") ||
      lower.includes("smart source") ||
      lower.includes("how does the ai") ||
      lower.includes("how does ai") ||
      lower.includes("explain ai") ||
      lower.includes("ai matching")
    ) {
      return {
        responseText:
          "BloodChain AI analyzes factors such as blood group compatibility, current availability, location, urgency, and inventory information to help identify suitable blood sources.",
        actions: [
          { label: "AI Recommendation", path: "/ai-recommendation" },
        ],
        nextContext: { awaiting: null, lastTopic: "ai" },
      };
    }

    // 10. BLOOD TRANSFER & TRACKING
    if (
      lower.includes("track") ||
      lower.includes("transfer") ||
      lower.includes("transit") ||
      lower.includes("cold chain") ||
      lower.includes("where is my blood") ||
      lower.includes("transfer status") ||
      lower.includes("dispatch")
    ) {
      return {
        responseText:
          "You can track blood transfer and request status from the Approval & Transfer or My Requests section, depending on your user role.",
        actions: [
          { label: "Approval & Transfer", path: "/approval-transfer" },
          { label: "My Requests", path: "/my-requests" },
        ],
        nextContext: { awaiting: null, lastTopic: "transfer" },
      };
    }

    // 11. PROFILE & ACCOUNT SETTINGS
    if (
      lower.includes("profile") ||
      lower.includes("update my account") ||
      lower.includes("change my profile") ||
      lower.includes("edit profile") ||
      lower.includes("password") ||
      lower.includes("account settings")
    ) {
      return {
        responseText:
          "Open your Profile section to update the available account information. If a field cannot be edited, contact the appropriate administrator.",
        actions: [
          { label: "Open Settings", path: "/settings" },
        ],
        nextContext: { awaiting: null, lastTopic: "profile" },
      };
    }

    // 12. NOTIFICATIONS
    if (
      lower.includes("notification") ||
      lower.includes("alert") ||
      lower.includes("why did i get")
    ) {
      return {
        responseText:
          "Open the Notifications section from the sidebar or the notification bell in the top navigation to view your latest updates.",
        actions: [
          { label: "View Notifications", path: "/notifications" },
        ],
        nextContext: { awaiting: null, lastTopic: "notifications" },
      };
    }

    // 13. HELP & CAPABILITIES
    if (
      lower.includes("help") ||
      lower.includes("what can you do") ||
      lower.includes("how can you help") ||
      lower.includes("features") ||
      lower.includes("what do you do")
    ) {
      return {
        responseText:
          "I can help you with BloodChain AI features such as blood requests, donor search, blood availability, AI recommendations, transfers, notifications, and account-related questions. What would you like to know?",
        actions: [
          { label: "Create Blood Request", path: "/blood-request" },
          { label: "Find Donors", path: "/find-donors" },
          { label: "Check Blood Inventory", path: "/blood-inventory" },
        ],
        nextContext: { awaiting: null, lastTopic: "help" },
      };
    }

    // 14. UNRELATED / OFF-TOPIC QUESTIONS
    if (
      lower.includes("weather") ||
      lower.includes("joke") ||
      lower.includes("president") ||
      lower.includes("recipe") ||
      lower.includes("movie") ||
      lower.includes("song") ||
      lower.includes("sports") ||
      lower.includes("cricket") ||
      lower.includes("football") ||
      lower.includes("capital of")
    ) {
      return {
        responseText:
          "I am BloodChain AI's specialized clinical and logistics support assistant. I focus exclusively on blood coordination, donor inquiries, requests, inventory, AI recommendations, and account assistance. How can I assist you with BloodChain today?",
        actions: [
          { label: "Create Blood Request", path: "/blood-request" },
          { label: "Find Donors", path: "/find-donors" },
          { label: "Check Blood Inventory", path: "/blood-inventory" },
        ],
        nextContext: { awaiting: null, lastTopic: "offtopic" },
      };
    }

    // 15. UNKNOWN / GENERAL FALLBACK
    return {
      responseText:
        "I'm not sure I understood that. I can help with blood requests, donor search, blood availability, AI recommendations, transfers, notifications, and account support. Could you rephrase your question?",
      actions: [
        { label: "Create Blood Request", path: "/blood-request" },
        { label: "Find Donors", path: "/find-donors" },
        { label: "Check Blood Inventory", path: "/blood-inventory" },
      ],
      nextContext: { awaiting: null, lastTopic: "unknown" },
    };
  };

  // Chat message send handler
  const handleSendChat = async (e) => {
    e?.preventDefault();
    const text = chatInput.trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text,
      time: "Just now",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      let inventoryData = [];
      try {
        inventoryData = await getBloodInventory();
      } catch (err) {
        console.warn("Could not retrieve live inventory for chat:", err);
      }

      const { responseText, actions, nextContext } = generateChatResponse(
        text,
        chatContext,
        inventoryData
      );

      setChatContext(nextContext);

      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            text: responseText,
            actions: actions || [],
            time: "Just now",
          },
        ]);
        setIsTyping(false);
      }, 400);
    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
    }
  };

  // Email support submit handler
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailForm.message.trim()) return;

    setEmailSubmitting(true);
    await submitContactMessage({
      name: user?.name || "Healthcare Staff",
      email: user?.email || "support@bloodchain.ai",
      subject: `[${emailForm.category}] ${emailForm.subject}`,
      message: emailForm.message,
    });

    setEmailSubmitting(false);
    setIsEmailModalOpen(false);
    setEmailForm({
      subject: "BloodChain AI Support Request",
      category: "General Inquiry",
      message: "",
    });
    showNotification("Support email dispatched successfully! Our clinical desk will respond shortly.");
  };

  // Contact support form submit handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.message.trim()) return;

    setContactSubmitting(true);
    await submitContactMessage(contactForm);
    setContactSubmitting(false);
    setIsContactModalOpen(false);
    setContactForm({
      name: user?.name || "Keerthiga S",
      email: user?.email || "keerthiga@bloodchain.ai",
      subject: "Technical Support",
      message: "",
    });
    showNotification("Your support inquiry has been submitted! Support Ticket #TN-BC-4182 created.");
  };

  return (
    <div className="help-page">
      {/* NOTIFICATION FEEDBACK BANNER */}
      {actionNotice && (
        <div
          style={{
            position: "sticky",
            top: "16px",
            zIndex: 1000,
            background: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            borderRadius: "10px",
            padding: "12px 20px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          <CheckCircle2 size={20} color="#059669" />
          <span>{actionNotice}</span>
        </div>
      )}

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
            <p>Find answers, get assistance, and learn how to use BloodChain AI.</p>
          </div>
        </div>
      </div>

      {/* =========================
          SEARCH CARD
      ========================= */}
      <div className="help-search-card">
        <div className="help-search-icon">
          <Search size={22} />
        </div>

        <div>
          <h2>How can we help you?</h2>
          <p>Search our frequently asked questions, clinical guides, and workflows.</p>
        </div>

        <div className="help-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search for help (e.g. blood request, donor, AI, transfer)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search for help"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#9ca3af",
                padding: "2px",
              }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* =========================
          QUICK SUPPORT OPTIONS
      ========================= */}
      <div className="help-section-title">
        <h2>Get Support</h2>
        <p>Choose the support option that works best for you.</p>
      </div>

      <div className="support-grid">
        {/* 1. CHAT */}
        <div className="support-card">
          <div className="support-icon blue">
            <MessageCircle size={24} />
          </div>

          <div className="support-card-content">
            <h3>Live Chat</h3>
            <p>Chat with our intelligent clinical assistant for instant guidance.</p>

            <button
              className="support-button blue-button"
              onClick={() => setIsChatOpen(true)}
              style={{ cursor: "pointer" }}
              aria-label="Start Live Chat"
            >
              <MessageCircle size={15} />
              Start Chat
            </button>
          </div>
        </div>

        {/* 2. PHONE */}
        <div className="support-card">
          <div className="support-icon red">
            <Phone size={24} />
          </div>

          <div className="support-card-content">
            <h3>Call Support</h3>
            <p>Speak directly with our regional dispatch desk for urgent issues.</p>

            <button
              className="support-button red-button"
              onClick={() => setIsCallModalOpen(true)}
              style={{ cursor: "pointer" }}
              aria-label="Call Support"
            >
              <Phone size={15} />
              Call Support
            </button>
          </div>
        </div>

        {/* 3. EMAIL */}
        <div className="support-card">
          <div className="support-icon green">
            <Mail size={24} />
          </div>

          <div className="support-card-content">
            <h3>Email Support</h3>
            <p>Send our clinical logistics desk your questions and inquiries.</p>

            <button
              className="support-button green-button"
              onClick={() => setIsEmailModalOpen(true)}
              style={{ cursor: "pointer" }}
              aria-label="Send Email Support"
            >
              <Mail size={15} />
              Send Email
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          FAQ + RIGHT SIDEBAR
      ========================= */}
      <div className="help-main-grid">
        {/* FAQ ACCORDION */}
        <div className="faq-card">
          <div className="faq-header">
            <div className="faq-header-icon">
              <CircleHelp size={22} />
            </div>

            <div>
              <h2>Frequently Asked Questions</h2>
              <p>Find quick answers to common questions ({filteredFaqs.length} available).</p>
            </div>
          </div>

          <div className="faq-list">
            {filteredFaqs.length === 0 ? (
              <div className="no-results">
                <Search size={28} />
                <strong>No help articles found.</strong>
                <span>Try searching with a different term like "blood request", "donor", or "AI".</span>
                <button
                  onClick={() => setSearch("")}
                  style={{
                    marginTop: "12px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div className={`faq-item ${isOpen ? "open" : ""}`} key={faq.question}>
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      style={{ cursor: "pointer" }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: "700" }}>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={isOpen ? "faq-arrow-open" : ""}
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div
                        className="faq-answer"
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.6",
                          color: "#4b5563",
                          paddingBottom: "16px",
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="help-right-column">
          {/* KNOWLEDGE BASE CARD */}
          <div className="help-info-card">
            <div className="help-info-icon purple">
              <BookOpen size={22} />
            </div>

            <div>
              <h3>Knowledge Base</h3>
              <p>Learn more about BloodChain features, blood management, and clinical workflows.</p>
              <button
                onClick={() => setIsKnowledgeModalOpen(true)}
                style={{ cursor: "pointer" }}
                aria-label="Explore Knowledge Base Guides"
              >
                Explore Guides →
              </button>
            </div>
          </div>

          {/* SECURITY & PRIVACY CARD */}
          <div className="help-info-card">
            <div className="help-info-icon green">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h3>Security & Privacy</h3>
              <p>Learn how your BloodChain account, patient data, and donor records are protected.</p>
              <button
                onClick={() => setIsSecurityModalOpen(true)}
                style={{ cursor: "pointer" }}
                aria-label="View Security & Privacy Guide"
              >
                Security Guide →
              </button>
            </div>
          </div>

          {/* EMERGENCY SUPPORT CARD */}
          <div className="emergency-card">
            <div className="emergency-icon">
              <AlertTriangle size={23} />
            </div>

            <h3>Emergency Support</h3>
            <p>
              For critical clinical situations requiring immediate blood escalation, access emergency protocols.
            </p>

            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              style={{ cursor: "pointer" }}
              aria-label="Open Emergency Support"
            >
              <Phone size={15} />
              Emergency Support
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          CONTACT FORM / STILL NEED HELP
      ========================= */}
      <div className="contact-support-card">
        <div className="contact-support-icon">
          <Send size={24} />
        </div>

        <div className="contact-support-text">
          <h2>Still need help?</h2>
          <p>Send a message to our support desk and our duty officer will assist you immediately.</p>
        </div>

        <button
          onClick={() => setIsContactModalOpen(true)}
          style={{ cursor: "pointer" }}
          aria-label="Contact Support"
        >
          Contact Support
          <Send size={15} />
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. LIVE CHAT MODAL */}
      {/* ============================================================== */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
          onClick={() => setIsChatOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              height: "560px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div
              style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#fee2e2",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>BloodChain Clinical Support</div>
                  <div style={{ fontSize: "12px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    Active Online Duty Officer
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                background: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: msg.sender === "user" ? "#dc2626" : "#ffffff",
                      color: msg.sender === "user" ? "#ffffff" : "#1e293b",
                      padding: "10px 14px",
                      borderRadius:
                        msg.sender === "user"
                          ? "14px 14px 2px 14px"
                          : "14px 14px 14px 2px",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      border: msg.sender === "user" ? "none" : "1px solid #e2e8f0",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* Optional Action Pills */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                      {msg.actions.map((act, i) =>
                        act.type === "tel" ? (
                          <a
                            key={i}
                            href={act.href}
                            style={{
                              background: "#fee2e2",
                              color: "#dc2626",
                              border: "1px solid #fecaca",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Phone size={12} />
                            {act.label}
                          </a>
                        ) : (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setIsChatOpen(false);
                              navigate(act.path);
                            }}
                            style={{
                              background: "#f1f5f9",
                              color: "#334155",
                              border: "1px solid #cbd5e1",
                              padding: "5px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {act.label} &rarr;
                          </button>
                        )
                      )}
                    </div>
                  )}

                  <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px" }}>
                    {msg.time}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div style={{ alignSelf: "flex-start", background: "#ffffff", padding: "8px 14px", borderRadius: "14px", fontSize: "12px", color: "#64748b", border: "1px solid #e2e8f0" }}>
                  Clinical Assistant is typing...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Footer */}
            <form
              onSubmit={handleSendChat}
              style={{
                padding: "12px 16px",
                background: "#ffffff",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="text"
                placeholder="Type your question here..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSendChat(e);
                  }
                }}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  cursor: !chatInput.trim() || isTyping ? "not-allowed" : "pointer",
                  opacity: !chatInput.trim() || isTyping ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.15s ease",
                }}
                aria-label="Send Message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CALL SUPPORT MODAL */}
      {/* ============================================================== */}
      {isCallModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
          onClick={() => setIsCallModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #fff1f2 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Phone size={22} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                  Clinical Support Helplines
                </h3>
              </div>
              <button
                onClick={() => setIsCallModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
                Connect directly with certified duty officers and emergency logistics dispatchers across Tamil Nadu.
              </p>

              {/* 1800 Toll Free */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                    State Blood Transfusion Helpline
                  </strong>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>24/7 Central Emergency Desk</span>
                </div>
                <a
                  href="tel:18004251333"
                  style={{
                    background: "#dc2626",
                    color: "#ffffff",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "700",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Phone size={14} />
                  1800-425-1333
                </a>
              </div>

              {/* Direct Support */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                    Regional Logistics Help Desk
                  </strong>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Mon – Sat, 8:00 AM – 8:00 PM</span>
                </div>
                <a
                  href="tel:+919876543210"
                  style={{
                    background: "#0284c7",
                    color: "#ffffff",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "700",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Phone size={14} />
                  +91 98765 43210
                </a>
              </div>

              {/* Ambulance 108 */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                    Emergency Ambulance Dispatch
                  </strong>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>Cold-Chain Vehicle Transit</span>
                </div>
                <a
                  href="tel:108"
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "700",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Phone size={14} />
                  Call 108
                </a>
              </div>
            </div>

            <div style={{ padding: "14px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", background: "#f8fafc" }}>
              <button
                onClick={() => setIsCallModalOpen(false)}
                style={{ background: "#0f172a", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. EMAIL SUPPORT MODAL */}
      {/* ============================================================== */}
      {isEmailModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
          onClick={() => setIsEmailModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={22} color="#059669" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                  Email Support Desk
                </h3>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                    To:
                  </label>
                  <input
                    type="text"
                    disabled
                    value="support@bloodchain.ai"
                    style={{ width: "100%", padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "14px", color: "#64748b" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                    Category:
                  </label>
                  <select
                    value={emailForm.category}
                    onChange={(e) => setEmailForm({ ...emailForm, category: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px" }}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Blood Transfer Assistance">Blood Transfer Assistance</option>
                    <option value="Technical Issue">Technical / Dashboard Issue</option>
                    <option value="Account & Hospital Verification">Account & Hospital Verification</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                    Subject:
                  </label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                    Message:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your issue or clinical question in detail..."
                    value={emailForm.message}
                    onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "20px" }}>
                <a
                  href={`mailto:support@bloodchain.ai?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}`}
                  style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none", fontWeight: "600" }}
                >
                  Open in Email Client &rarr;
                </a>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    style={{ background: "#ffffff", border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 16px", fontSize: "14px", fontWeight: "600", color: "#374151", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailSubmitting}
                    style={{ background: "#059669", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    {emailSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. KNOWLEDGE BASE MODAL */}
      {/* ============================================================== */}
      {isKnowledgeModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
          onClick={() => setIsKnowledgeModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "840px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BookOpen size={22} color="#7c3aed" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                  BloodChain AI Knowledge Base & Operational Guides
                </h3>
              </div>
              <button
                onClick={() => setIsKnowledgeModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Grid: Left Guide Nav + Right Content */}
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", flex: 1, overflow: "hidden" }}>
              {/* Guides List */}
              <div style={{ background: "#f8fafc", borderRight: "1px solid #e2e8f0", overflowY: "auto", padding: "12px" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", padding: "8px", letterSpacing: "0.5px" }}>
                  Select Guide
                </div>
                {guides.map((g, idx) => {
                  const Icon = g.icon;
                  const isSelected = selectedGuideIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedGuideIndex(idx)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: isSelected ? "#fee2e2" : "transparent",
                        color: isSelected ? "#dc2626" : "#334155",
                        fontWeight: isSelected ? "700" : "500",
                        fontSize: "13px",
                        marginBottom: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon size={16} />
                      <span style={{ lineHeight: "1.3" }}>{g.title}</span>
                    </div>
                  );
                })}
              </div>

              {/* Guide Content */}
              <div style={{ padding: "24px", overflowY: "auto" }}>
                {guides[selectedGuideIndex] && (
                  <div>
                    <span
                      style={{
                        background: "#ede9fe",
                        color: "#6d28d9",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "700",
                        display: "inline-block",
                        marginBottom: "8px",
                      }}
                    >
                      {guides[selectedGuideIndex].category}
                    </span>
                    <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 16px 0" }}>
                      {guides[selectedGuideIndex].title}
                    </h2>

                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
                      Step-by-Step Instructions:
                    </div>
                    <ol style={{ paddingLeft: "20px", margin: "0 0 20px 0", color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
                      {guides[selectedGuideIndex].steps.map((st, i) => (
                        <li key={i} style={{ marginBottom: "6px" }}>
                          {st}
                        </li>
                      ))}
                    </ol>

                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        fontSize: "13px",
                        color: "#166534",
                        marginBottom: "20px",
                      }}
                    >
                      <strong>Clinical Tip:</strong> {guides[selectedGuideIndex].tip}
                    </div>

                    <button
                      onClick={() => {
                        setIsKnowledgeModalOpen(false);
                        navigate(guides[selectedGuideIndex].route);
                      }}
                      style={{
                        background: "#dc2626",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "9px 18px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Open Relevant Workflow
                      <ExternalLink size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", background: "#f8fafc", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsKnowledgeModalOpen(false)}
                style={{ background: "#0f172a", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SECURITY & PRIVACY MODAL */}
      {/* ============================================================== */}
      {isSecurityModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
          onClick={() => setIsSecurityModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={22} color="#059669" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                  Security & Healthcare Privacy Protocol
                </h3>
              </div>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ borderLeft: "4px solid #10b981", paddingLeft: "12px" }}>
                <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                  1. Authentication & Session Security
                </strong>
                <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>
                  User sessions are authenticated using JSON Web Tokens (JWT) managed through Supabase Auth with secure cookie persistence. Inactive sessions are automatically expired.
                </p>
              </div>

              <div style={{ borderLeft: "4px solid #10b981", paddingLeft: "12px" }}>
                <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                  2. Row Level Security (RLS) & Access Control
                </strong>
                <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>
                  Every database table implements Row Level Security (RLS) policies. Donors can only view public regional drives, while patient diagnostic data is strictly restricted to certified hospital personnel.
                </p>
              </div>

              <div style={{ borderLeft: "4px solid #10b981", paddingLeft: "12px" }}>
                <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                  3. Donor Identity & Contact Shielding
                </strong>
                <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>
                  Volunteer donor telephone numbers and precise residence addresses are shielded to prevent unsolicited communication. Contact is coordinated through verified healthcare dispatch channels.
                </p>
              </div>

              <div style={{ borderLeft: "4px solid #10b981", paddingLeft: "12px" }}>
                <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                  4. Transfer Audit Logging & Compliance
                </strong>
                <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>
                  All blood transfer acceptances and rejections are cryptographically timestamped and attributed to the reviewer's authenticated user ID, ensuring a full chain-of-custody audit log.
                </p>
              </div>

              <div style={{ borderLeft: "4px solid #10b981", paddingLeft: "12px" }}>
                <strong style={{ display: "block", color: "#0f172a", fontSize: "15px" }}>
                  5. Clinical Best Practices
                </strong>
                <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>
                  Always sign out from shared hospital workstation terminals when away. Never share authorized login credentials or export patient transfusion registries to unapproved external devices.
                </p>
              </div>
            </div>

            <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", background: "#f8fafc", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsSecurityModalOpen(false)}
                style={{ background: "#0f172a", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. EMERGENCY SUPPORT MODAL */}
      {/* ============================================================== */}
      {isEmergencyModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
          onClick={() => setIsEmergencyModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertTriangle size={22} color="#ea580c" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#9a3412" }}>
                  Emergency Clinical Escalation Protocol
                </h3>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "13px",
                  color: "#92400e",
                  lineHeight: "1.5",
                }}
              >
                <strong>Clinical Notice:</strong> BloodChain AI is a logistics coordination and clinical decision-support platform. In acute life-threatening medical emergencies, please initiate primary emergency resuscitation and contact hospital emergency triage immediately.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a
                  href="tel:108"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#16a34a",
                    color: "#ffffff",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontWeight: "700",
                    fontSize: "15px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={18} />
                    Emergency Ambulance (Call 108)
                  </span>
                  <span>Toll-Free &rarr;</span>
                </a>

                <a
                  href="tel:18004251333"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "#dc2626",
                    color: "#ffffff",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontWeight: "700",
                    fontSize: "15px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={18} />
                    State Blood Transfusion Desk (1800-425-1333)
                  </span>
                  <span>24/7 &rarr;</span>
                </a>
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <button
                  onClick={() => {
                    setIsEmergencyModalOpen(false);
                    navigate("/blood-request");
                  }}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    borderRadius: "8px",
                    fontWeight: "700",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <FileText size={16} />
                  Create Emergency Blood Request &rarr;
                </button>
              </div>
            </div>

            <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e7eb", background: "#f8fafc", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                style={{ background: "#0f172a", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. CONTACT SUPPORT INQUIRY MODAL */}
      {/* ============================================================== */}
      {isContactModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "16px",
          }}
          onClick={() => setIsContactModalOpen(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Send size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                  Submit Support Ticket
                </h3>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                    Subject *
                  </label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                  >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Blood Transfer Issue">Blood Transfer Issue</option>
                    <option value="Hospital Onboarding">Hospital / Blood Bank Onboarding</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about your query or incident..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  style={{ background: "#ffffff", border: "1px solid #d1d5db", borderRadius: "6px", padding: "8px 16px", fontSize: "14px", fontWeight: "600", color: "#374151", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  style={{ background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {contactSubmitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpSupport;
