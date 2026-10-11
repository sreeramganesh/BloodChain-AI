/**
 * BloodChain AI Assistant — Static Knowledge Base (Phase 3)
 *
 * Provides deterministic, structured platform knowledge across key operational domains.
 * STRICT CLINICAL & OPERATIONAL BOUNDARIES:
 * - Decision-support only (assists clinical officers; never an autonomous medical authority)
 * - Human review mandatory for transfers and allocations
 * - No live database fabrication (real-time quantities, request IDs, and live routes deferred to Phase 4)
 */

export const BLOODCHAIN_KNOWLEDGE = [
  // =========================================================================
  // 1. PLATFORM OVERVIEW
  // =========================================================================
  {
    topic: "platform",
    category: "Platform Overview",
    keywords: [
      "what is bloodchain",
      "what does bloodchain do",
      "purpose of bloodchain",
      "about bloodchain",
      "how does bloodchain work",
      "what is bloodchain ai",
      "features",
      "features available",
      "platform",
      "overview"
    ],
    answer:
      `BloodChain is an AI-powered blood management and clinical decision-support platform.\n\n` +
      `Key Capabilities:\n` +
      `• Real-Time Inventory: Track unreserved blood units and components across connected hospitals and regional blood banks.\n` +
      `• Clinical Blood Requests: Digital request generation with urgency levels (Normal, Urgent, Critical) and real-time fulfillment tracking.\n` +
      `• AI Recommendation Engine: Multi-factor clinical sourcing evaluating ABO/Rh compatibility, distance, transit ETA, shortage risk, and shelf-life expiry.\n` +
      `• Risk Forecasting: 30-day demand, shortage prediction, and near-expiry detection to minimize clinical wastage.\n` +
      `• Secure Transfer Tracking: Cold-chain integrity and human-reviewed custody transfers between healthcare facilities.\n\n` +
      `Note: BloodChain is designed for healthcare decision support. Final clinical allocations remain subject to authorized medical officer review.`
  },

  // =========================================================================
  // 2. ASSISTANT CAPABILITIES
  // =========================================================================
  {
    topic: "assistantCapabilities",
    category: "Assistant Capabilities",
    keywords: [
      "what can you do",
      "what can the ai assistant help me with",
      "assistant capabilities",
      "how can you help",
      "help me",
      "who are you"
    ],
    answer:
      `I am your BloodChain AI Assistant, designed to guide clinical officers, blood bank coordinators, and healthcare teams through the platform.\n\n` +
      `I can help you understand:\n` +
      `1. Blood Availability & Inventory: How stock monitoring and blood groups work.\n` +
      `2. Blood Requests: How to create, prioritize, and track emergency requests.\n` +
      `3. Hospitals & Blood Banks: How to find connected facilities and utilize map-based search.\n` +
      `4. AI Clinical Recommendations: The multi-factor scoring model, compatibility matrix, and routing logic.\n` +
      `5. Shortage & Expiry Risks: How predictive intelligence prevents deficits and wastage.\n` +
      `6. Secure Transfers: Cold-chain protocols and the mandatory human review workflow.\n\n` +
      `In this phase, I provide comprehensive platform knowledge. Live real-time database queries will be connected in Phase 4.`
  },

  // =========================================================================
  // 3. BLOOD AVAILABILITY & INVENTORY
  // =========================================================================
  {
    topic: "bloodAvailability",
    category: "Blood Availability",
    keywords: [
      "blood availability",
      "check blood availability",
      "inventory",
      "blood stock",
      "blood groups",
      "available units",
      "components",
      "filter by state",
      "filter by district"
    ],
    answer:
      `BloodChain tracks blood availability across all standard ABO/Rh blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-) and blood components:\n\n` +
      `• Tracked Components: Whole Blood, Packed Red Blood Cells (PRBC), Platelet Concentrates, and Fresh Frozen Plasma (FFP).\n` +
      `• Stock Categorization: Classified as Sufficient (healthy reserve), Moderate (monitor closely), or Critical Shortage (priority replenishment required).\n` +
      `• Facility Discovery: Inventory can be searched by facility, filtered by State (e.g., Tamil Nadu) and District (e.g., Tiruchirappalli), or viewed on the facility map.\n` +
      `• Unreserved Units: Only unreserved, clinically cleared units are marked available for allocation.\n\n` +
      `Note: I can explain how BloodChain checks blood availability, but live unit quantities will be connected in the live-data integration phase.`
  },

  // =========================================================================
  // 4. HOSPITALS & BLOOD BANKS
  // =========================================================================
  {
    topic: "hospitalsAndBloodBanks",
    category: "Hospitals & Facilities",
    keywords: [
      "hospitals",
      "blood banks",
      "find blood bank",
      "find hospital",
      "connected facilities",
      "facility search",
      "nearby facilities",
      "nearby blood bank",
      "location search"
    ],
    answer:
      `BloodChain connects verified government hospitals, private healthcare facilities, and regional blood banks in a unified network.\n\n` +
      `Finding Connected Facilities:\n` +
      `1. Navigate to the "Hospitals & Blood Banks" page from the main navigation.\n` +
      `2. Filter by State and District to see registered regional centers.\n` +
      `3. Use the integrated Google Maps view or Haversine proximity search to discover facilities within a chosen radius (5 km, 10 km, 25 km, or 50 km).\n` +
      `4. Each facility profile displays license details, operational contact info, emergency hotline, and available blood component stocks.\n\n` +
      `Note: Facility discovery uses configured location services. Live inventory counts per facility require the live database connection in the next phase.`
  },

  // =========================================================================
  // 5. BLOOD REQUESTS
  // =========================================================================
  {
    topic: "bloodRequests",
    category: "Blood Requests",
    keywords: [
      "create request",
      "create a blood request",
      "request blood",
      "how do i create a blood request",
      "blood request workflow",
      "track request",
      "patient request",
      "urgency level"
    ],
    answer:
      `Creating a clinical blood request in BloodChain follows a standardized 5-step clinical workflow:\n\n` +
      `1. Open Blood Request: Go to the "Blood Request" page and click "Create New Request".\n` +
      `2. Patient & Clinical Details: Enter the patient identifier/name, clinical diagnosis, and hospital/ward information.\n` +
      `3. Blood Group & Quantity: Select the required ABO/Rh group (A+, A-, B+, B-, AB+, AB-, O+, O-) and specified units needed.\n` +
      `4. Urgency Classification: Set the clinical priority level:\n` +
      `   • Critical: Immediate trauma, massive hemorrhage, or active surgery dispatch\n` +
      `   • Urgent: Required within 2–6 hours\n` +
      `   • Normal: Scheduled elective transfusion\n` +
      `5. Submit & Track: Submit the request to enter the workflow (Pending Review → Approved & Sourced → In Transit → Fulfilled).\n\n` +
      `Once submitted, BloodChain's AI recommendation engine immediately identifies optimal nearby candidate blood banks.`
  },

  // =========================================================================
  // 6. SHORTAGE RISK
  // =========================================================================
  {
    topic: "shortageRisk",
    category: "Shortage Risk",
    keywords: [
      "what is shortage risk",
      "shortage risk",
      "shortage prediction",
      "why is shortage risk important",
      "detect shortages",
      "predict shortages",
      "deficit"
    ],
    answer:
      `Shortage Risk identifies potential deficits where expected clinical blood demand is projected to exceed available stock.\n\n` +
      `How BloodChain Uses Shortage Prediction:\n` +
      `• Demand Forecasting: Analyzes historical transfusion velocity, hospital bed occupancy, and seasonal patterns across blood groups.\n` +
      `• Supply Safety Buffers: Evaluates whether a candidate blood bank can fulfill a request without endangering its own local emergency safety threshold.\n` +
      `• Proactive Warning: Alerts administrators 7 to 30 days in advance so targeted donor drives and pre-emptive inter-hospital balancing can be scheduled.\n\n` +
      `Note: Live shortage percentages and active deficit alerts will be connected in the live-data integration phase.`
  },

  // =========================================================================
  // 7. EXPIRY RISK
  // =========================================================================
  {
    topic: "expiryRisk",
    category: "Expiry Risk",
    keywords: [
      "what is expiry risk",
      "expiry risk",
      "why track expiry",
      "shelf life",
      "blood expiration",
      "wastage",
      "how does expiry risk work"
    ],
    answer:
      `Expiry Risk tracks the shelf-life lifecycle of stored blood units to prevent clinical wastage:\n\n` +
      `Clinical Context:\n` +
      `• Packed Red Blood Cells (PRBC) typically have a 35 to 42-day shelf life.\n` +
      `• Platelets have a brief 5-day shelf life requiring constant agitation.\n\n` +
      `How BloodChain Manages Expiry:\n` +
      `• FEFO Principle (First-Expiry, First-Out): The recommendation engine prioritizes clinically sound units approaching expiration for near-term requests.\n` +
      `• Shelf-Life Buckets: Units are categorized by shelf-life remaining (< 3 days, 4–7 days, 8–14 days, 15+ days).\n` +
      `• Wastage Reduction: Prevents usable units from expiring unused on blood bank shelves by transferring them to high-demand surgical centers.`
  },

  // =========================================================================
  // 8. AI RECOMMENDATIONS & SCORING
  // =========================================================================
  {
    topic: "aiRecommendations",
    category: "AI Recommendations",
    keywords: [
      "ai recommendations",
      "how does bloodchain recommend a source",
      "recommend a source",
      "recommendation engine",
      "scoring model",
      "compatibility",
      "blood compatibility",
      "how does ai select",
      "source recommendation"
    ],
    answer:
      `BloodChain's AI Clinical Recommendation Engine evaluates potential donor facilities using a transport-aware 100-point scoring model:\n\n` +
      `Key Scoring Factors:\n` +
      `1. Strict Blood-Group Compatibility: Strict adherence to RBC compatibility (O- universal donor; AB+ universal recipient; exact match preferred).\n` +
      `2. Stock Sufficiency: Verifies unreserved inventory can fulfill the requested units while preserving local emergency minimums.\n` +
      `3. Transit Time & Road Distance: Uses Google Routes API road distance, traffic conditions, and calculated travel duration.\n` +
      `4. Shortage Risk Protection: Protects candidate hospitals from depleting their own critical reserves.\n` +
      `5. Expiry Optimization: Prioritizes near-expiry units where appropriate to avoid wastage.\n\n` +
      `Important: Recommendations are strictly decision-support advisories. They do NOT automatically allocate units without human authorization.`
  },

  // =========================================================================
  // 9. BLOOD-GROUP COMPATIBILITY
  // =========================================================================
  {
    topic: "bloodCompatibility",
    category: "AI Recommendations",
    keywords: [
      "compatibility",
      "blood compatibility",
      "universal donor",
      "universal recipient",
      "compatible alternate",
      "o negative",
      "ab positive",
      "can o+ receive"
    ],
    answer:
      `BloodChain enforces strict clinical Red Blood Cell (RBC) compatibility standards:\n\n` +
      `• O- (Universal Donor): Can be received by all blood groups (O-, O+, A-, A+, B-, B+, AB-, AB+).\n` +
      `• AB+ (Universal Recipient): Can receive RBCs from any blood group.\n` +
      `• Rh Factor Matching: Rh-negative patients must only receive Rh-negative blood; Rh-positive patients can receive either Rh+ or Rh-.\n` +
      `• Clinical Prioritization: The recommendation engine always scores "Exact Match" highest (e.g. O+ for O+) and considers safe alternates (e.g. O- for O+) when exact units are scarce.`
  },

  // =========================================================================
  // 10. TRANSFERS & COLD CHAIN
  // =========================================================================
  {
    topic: "transfers",
    category: "Transfers & Logistics",
    keywords: [
      "transfer",
      "blood transfer",
      "how does transfer work",
      "transfer workflow",
      "track a transfer",
      "cold chain",
      "transit status",
      "dispatch"
    ],
    answer:
      `BloodChain manages inter-hospital blood transfers through an auditable, temperature-controlled custody workflow:\n\n` +
      `Transfer Lifecycle:\n` +
      `1. Recommendation & Review: Hospital medical officer reviews candidate facility recommendation.\n` +
      `2. Approval: Authorized clinical coordinator signs off on the transfer.\n` +
      `3. Secure Dispatch: Source blood bank packages units into validated thermal containers.\n` +
      `4. In-Transit Monitoring: Real-time route tracking and cold-chain compliance (2°C–6°C for whole blood / RBCs; 20°C–24°C for platelets).\n` +
      `5. Delivery & Verification: Destination hospital scans and confirms receipt, updating both inventories simultaneously.\n\n` +
      `Note: Live transfer statuses and GPS vehicle tracking will be connected in the live-data phase.`
  },

  // =========================================================================
  // 11. HUMAN REVIEW & CLINICAL GOVERNANCE
  // =========================================================================
  {
    topic: "humanReview",
    category: "Clinical Governance",
    keywords: [
      "human review",
      "does ai automatically approve",
      "auto approve",
      "medical authority",
      "clinical oversight",
      "review and decide",
      "who approves"
    ],
    answer:
      `No. BloodChain AI NEVER automatically approves a blood transfer or deducts inventory.\n\n` +
      `Clinical Governance Principles:\n` +
      `• Decision Support Only: The AI calculates recommendations, compatibility scores, and transport estimates to inform clinical staff.\n` +
      `• Review & Decide Workflow: Every transfer requires an authorized human medical officer or blood bank coordinator to click "Review & Decide", verify patient compatibility, and authorize dispatch.\n` +
      `• Medical Accountability: Final responsibility for clinical suitability and physical custody remains with authorized healthcare professionals.`
  },

  // =========================================================================
  // 12. MAPS, GPS & LOCATION
  // =========================================================================
  {
    topic: "mapsAndLocation",
    category: "Maps & Location",
    keywords: [
      "maps",
      "location",
      "gps",
      "route",
      "transport time",
      "distance",
      "how does transport time affect",
      "google maps",
      "directions"
    ],
    answer:
      `BloodChain integrates geographic information to minimize emergency transit time:\n\n` +
      `Location Features:\n` +
      `• Facility Mapping: Displays registered blood banks and hospitals with color-coded stock availability markers.\n` +
      `• Proximity Search: Haversine straight-line distance calculations for rapid pre-filtering within 5 km to 50 km.\n` +
      `• Road Transit & Polyline: Google Routes API computes actual driving distance, estimated travel duration, and transit corridors.\n` +
      `• Emergency Route Impact: Shorter transit durations score higher in AI recommendations, ensuring critical patients receive life-saving units as quickly as possible.\n\n` +
      `Note: Live route navigation and real-time transit telemetry will be connected during the live-data integration phase.`
  },

  // =========================================================================
  // 13. WEBSITE NAVIGATION
  // =========================================================================
  {
    topic: "navigation",
    category: "Website Navigation",
    keywords: [
      "navigate",
      "how do i navigate",
      "pages",
      "routes",
      "where can i find",
      "go to dashboard",
      "how to find",
      "menu"
    ],
    answer:
      `BloodChain features intuitive navigation structured into public and authenticated clinical sections:\n\n` +
      `Authenticated Clinical Portal (Sidebar Menu):\n` +
      `• /dashboard — Overview metrics, recent activities, quick dispatch stats\n` +
      `• /blood-inventory — Complete stock management, component filters, predictive risk widgets\n` +
      `• /blood-request — Create, manage, and monitor clinical patient blood requests\n` +
      `• /find-donors — Search verified community donors by blood group and locality\n` +
      `• /ai-recommendation — Multi-factor AI recommendation engine and "Review & Decide" workflow\n` +
      `• /approval-transfer — Authorize inter-hospital transfers and track cold-chain logistics\n` +
      `• /hospitals-blood-banks — Interactive map and regional directory of connected facilities\n` +
      `• /my-donations & /my-requests — Personal donation and request tracking\n` +
      `• /notifications & /settings — Alerts and profile configurations\n\n` +
      `Public Portal:\n` +
      `• Home (/), About (/about), Features (/features), How It Works (/how-it-works), Impact (/impact), Contact (/contact), Register (/register), Login (/login).`
  }
];

/**
 * Live Data Boundary Triggers
 * Queries requesting real-time numeric stock, live request IDs, or immediate operational states
 * that must not be hallucinated.
 */
export const LIVE_DATA_TRIGGERS = [
  "how many units",
  "current units",
  "live stock",
  "stock right now",
  "available right now",
  "status of request",
  "status of transfer",
  "is request",
  "is transfer",
  "my request status",
  "my transfer status",
  "req-",
  "tr-",
  "current risk percentage",
  "what is today's shortage",
  "how many units of"
];
