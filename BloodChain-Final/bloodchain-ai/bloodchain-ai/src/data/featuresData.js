export const FEATURES_DATA = {
  "ai-demand-forecasting": {
    slug: "ai-demand-forecasting",
    title: "AI Demand Forecasting",
    shortDescription:
      "Predicts future blood demand using historical data, seasonal trends, emergency patterns, and regional demand patterns.",
    iconType: "chart",
    whatItDoes: {
      summary:
        "BloodChain AI's Demand Forecasting engine harnesses advanced time-series machine learning models to anticipate blood requirements up to 30 days in advance. By analyzing multi-source clinical data, regional healthcare dynamics, and demographic patterns, the platform allows hospitals and blood banks to transition from reactive scrambling to proactive inventory preparation.",
      keyPoints: [
        "Analyzes historical blood request velocity across individual hospitals and district clusters.",
        "Tracks demand variations by individual blood groups (O+, O-, A+, A-, B+, B-, AB+, AB-).",
        "Incorporates seasonal outbreak patterns such as monsoon dengue surges and viral fevers.",
        "Monitors surgical schedule loads and emergency trauma admission frequencies.",
        "Evaluates regional demand shifts caused by holidays, festivals, and weather disruptions.",
      ],
    },
    workflow: [
      {
        step: 1,
        title: "Historical Data",
        desc: "Ingests multi-year transfusion logs, request frequency, and seasonal usage history.",
      },
      {
        step: 2,
        title: "Data Processing",
        desc: "Cleanses, normalizes, and correlates weather, surgical calendars, and clinical records.",
      },
      {
        step: 3,
        title: "ML Model",
        desc: "Applies ARIMA, Prophet, and Gradient Boosted trees to forecast demand curves.",
      },
      {
        step: 4,
        title: "Demand Prediction",
        desc: "Generates high-confidence forecasts stratified by blood group, facility, and district.",
      },
      {
        step: 5,
        title: "Hospital / Blood Bank Planning",
        desc: "Automates donation drive scheduling and preemptive inter-facility buffer allocations.",
      },
    ],
    keyInputs: [
      {
        title: "Historical Requests",
        desc: "Transfusion logs and order volumes recorded over rolling 24-month clinical horizons.",
      },
      {
        title: "Blood Group Demand",
        desc: "Group-specific consumption ratios, highlighting rare subgroups like O- and AB-.",
      },
      {
        title: "Hospital-Wise Demand",
        desc: "Bed capacities, trauma center designations, and scheduled major surgical procedures.",
      },
      {
        title: "Seasonal Trends",
        desc: "Vector-borne disease spikes (e.g., dengue, malaria) and holiday season road transit surges.",
      },
      {
        title: "Regional Demand Patterns",
        desc: "District population density, industrial risk corridors, and rural referral inflows.",
      },
      {
        title: "Emergency Patterns",
        desc: "Unscheduled mass-casualty protocols and unexpected multi-unit trauma resuscitations.",
      },
    ],
    aiApproach: {
      headline: "Multi-Model Ensemble Predictive Architecture",
      description:
        "Our engine combines Long Short-Term Memory (LSTM) recurrent networks with LightGBM regressors. The model dynamically weights short-term surgical trends (7-day window) against macro seasonal rhythms (seasonal cycles), achieving a 94.2% forecast accuracy across connected facilities.",
    },
    benefits: [
      {
        title: "Early High-Demand Preparation",
        desc: "Schedules voluntary blood donation camps 2 to 3 weeks before anticipated critical deficits occur.",
      },
      {
        title: "Optimized Inventory Levels",
        desc: "Prevents excessive over-stocking of short-shelf-life components while guaranteeing trauma readiness.",
      },
      {
        title: "Minimized Shortage Risks",
        desc: "Dramatically reduces emergency inter-hospital distress calls by maintaining safe buffer thresholds.",
      },
      {
        title: "Data-Driven Decision Making",
        desc: "Empowers blood bank officers with verifiable statistics for state transfusion council reports.",
      },
    ],
    exampleUseCase: {
      scenario: "Festival Season Surge in Trichy District",
      detail:
        "During the annual festival rush, historical data indicated a 38% surge in emergency surgical blood requirements alongside a 25% dip in walk-in voluntary donors. BloodChain AI predicted a 62-unit shortfall of O+ and B+ units 18 days in advance. The system automatically prompted Trichy Government Hospital and local NGO partners to coordinate two pre-emptive corporate blood drives, averting a critical shortage and ensuring zero surgery postponements.",
    },
  },

  "shortage-risk-detection": {
    slug: "shortage-risk-detection",
    title: "Shortage Risk Detection",
    shortDescription:
      "Identifies potential blood shortages before they happen, so action can be taken early.",
    iconType: "warning",
    whatItDoes: {
      summary:
        "Shortage Risk Detection acts as a continuous early-warning sentinel across the blood supply network. By analyzing real-time shelf inventory against impending requests and forecasted burn rates, the platform flags deficit vulnerabilities hours or days before hospital reserves drop to hazardous thresholds.",
      keyPoints: [
        "Monitors real-time consumption rates versus available shelf stock across connected centers.",
        "Correlates pending elective requests with urgent emergency buffer allocations.",
        "Triggers multi-tier escalation alerts to donor coordinators and inter-bank logistics networks.",
        "Prevents last-minute emergency surgery delays due to unanticipated blood unavailability.",
      ],
    },
    workflow: [
      {
        step: 1,
        title: "Inventory Data",
        desc: "Real-time ledger updates from hospital blood banks and storage cold rooms.",
      },
      {
        step: 2,
        title: "Demand Analysis",
        desc: "Cross-checks active surgical pipelines and projected emergency caseloads.",
      },
      {
        step: 3,
        title: "Risk Prediction",
        desc: "Calculates hours-to-depletion metric for every individual blood group.",
      },
      {
        step: 4,
        title: "Alert Notification",
        desc: "Dispatches prioritized dashboard warnings, SMS pings, and priority badges.",
      },
      {
        step: 5,
        title: "Preventive Action",
        desc: "Triggers inter-bank transfer orders or direct voluntary donor mobilization.",
      },
    ],
    riskLevels: [
      {
        level: "Low Risk",
        badgeColor: "#16a34a",
        bgColor: "#f0fdf4",
        borderColor: "#bbf7d0",
        threshold: "> 14 Days Reserve",
        desc: "Adequate component reserves across all major groups. Regular replenishment cycle.",
      },
      {
        level: "Medium Risk",
        badgeColor: "#d97706",
        bgColor: "#fffbeb",
        borderColor: "#fde68a",
        threshold: "7 – 14 Days Reserve",
        desc: "Inventory within safe buffer but approaching renewal threshold. Donor coordinators notified.",
      },
      {
        level: "High Risk",
        badgeColor: "#ea580c",
        bgColor: "#fff7ed",
        borderColor: "#fed7aa",
        threshold: "3 – 7 Days Reserve",
        desc: "High vulnerability of component deficit. Non-urgent requests restricted, donors contacted.",
      },
      {
        level: "Critical Risk",
        badgeColor: "#dc2626",
        bgColor: "#fef2f2",
        borderColor: "#fecaca",
        threshold: "< 48 Hours Reserve",
        desc: "Immediate intervention required. Emergency inter-bank transfer protocol activated immediately.",
      },
    ],
    keyInputs: [
      { title: "Current Stock", desc: "Live on-shelf units verified by barcode scanning." },
      { title: "Historical Consumption", desc: "Average daily burn rate for weekdays, weekends, and holidays." },
      { title: "Incoming Requests", desc: "Confirmed orders submitted by ICUs, surgical suites, and trauma wards." },
      { title: "Predicted Demand", desc: "Machine-learning forecasted requests for the upcoming 72 hours." },
      { title: "Blood Group Availability", desc: "Rarity index and compatibility alternatives (e.g., O- for trauma)." },
      { title: "Regional Demand", desc: "Nearby partner hospitals experiencing simultaneous shortages." },
    ],
    benefits: [
      {
        title: "Proactive Deficit Mitigation",
        desc: "Intervenes 48 to 72 hours ahead of physical stock depletion, averting clinical emergencies.",
      },
      {
        title: "Automated Donor Activation",
        desc: "Pushes emergency targeted notifications to matched donors residing within a 15 km radius.",
      },
      {
        title: "Protects Elective Surgeries",
        desc: "Prevents traumatic cancellations of cardiac, oncology, and orthopedic procedures.",
      },
      {
        title: "Inter-Hospital Balancing",
        desc: "Enables regional blood banks to share excess buffer stock smoothly before crises escalate.",
      },
    ],
    exampleUseCase: {
      scenario: "Trauma Ward Emergency at SRM Hospital",
      detail:
        "Following a highway collision, SRM Hospital admitted five critical trauma patients requiring 12 units of O- and B- blood within 4 hours. The Shortage Risk Detection module immediately flagged that O- reserves would deplete in under 3 hours, shifting status from Low Risk to Critical Risk. The system instantly alerted Trichy Government Hospital's central bank and dispatched an emergency cold-chain transfer of 6 units, stabilizing the hospital's reserve without interrupting care.",
    },
  },

  "expiry-risk-detection": {
    slug: "expiry-risk-detection",
    title: "Expiry Risk Detection",
    shortDescription:
      "Tracks inventory and predicts blood units at risk of expiry, reducing wastage.",
    iconType: "calendar",
    whatItDoes: {
      summary:
        "Blood is a precious, time-sensitive biological product with a finite viability window (whole blood and packed red cells expire in 35–42 days, while platelets expire in just 5 days). Expiry Risk Detection continuously audits unit lifecycles, identifying units nearing expiry and recommending transfers to high-turnover centers to achieve near-zero wastage.",
      keyPoints: [
        "Tracks age and expiry timestamp of every barcoded blood unit from collection to transfusion.",
        "Categorizes inventory into safe, watch-list, and urgent-utilization tiers.",
        "Recommends automated transfer to regional trauma centers with high daily utilization rates.",
        "Enforces First-Expiry-First-Out (FEFO) dispensing rules across blood bank laboratory refrigerators.",
      ],
    },
    workflow: [
      {
        step: 1,
        title: "Inventory Tracking",
        desc: "Scans RFID/barcode tags to register exact collection dates and batch serials.",
      },
      {
        step: 2,
        title: "Expiry Analysis",
        desc: "Calculates remaining viable hours and cross-references localized burn rates.",
      },
      {
        step: 3,
        title: "Risk Identification",
        desc: "Flags units whose remaining shelf life is shorter than typical local demand cycles.",
      },
      {
        step: 4,
        title: "Automated Alert",
        desc: "Generates notification for blood bank officers highlighting units needing action.",
      },
      {
        step: 5,
        title: "Recommended Action",
        desc: "Prioritizes for immediate local transfusion or triggers transfer to high-demand facilities.",
      },
    ],
    keyInputs: [
      { title: "Blood Unit Age", desc: "Elapsed days since whole-blood phlebotomy or apheresis separation." },
      { title: "Expiry Date", desc: "Rigorous biological expiry threshold determined by anticoagulant preservative." },
      { title: "Blood Group", desc: "Relative local turnover frequency for common vs. rare blood phenotypes." },
      { title: "Current Inventory", desc: "Total component volume residing in cold storage quarantine." },
      { title: "Hospital Location", desc: "Proximity to high-utilization tertiary referral hospitals and trauma wards." },
      { title: "Demand Velocity", desc: "Historical daily transfusion burn rate of the stocking facility." },
    ],
    benefits: [
      {
        title: "Dramatic Wastage Reduction",
        desc: "Cuts blood component discards by up to 85% through timely rotational redistribution.",
      },
      {
        title: "Prioritized Unit Utilization",
        desc: "Ensures older, validated units are cross-matched first ahead of freshly drawn blood.",
      },
      {
        title: "Seamless Inter-Facility Transfer",
        desc: "Redirects slow-moving blood in community centers to tertiary emergency trauma hubs.",
      },
      {
        title: "Compliance & Audit Readiness",
        desc: "Produces full digital audit records verifying strict adherence to national blood safety guidelines.",
      },
    ],
    exampleUseCase: {
      scenario: "Redistribution of Rare O- Units Ahead of Expiry",
      detail:
        "A private clinic in Thanjavur had 3 units of O- whole blood that were 31 days old (11 days remaining before expiry), with no scheduled elective surgeries requiring that group. The Expiry Risk Detection algorithm identified that Trichy Government Hospital's trauma ICU was operating with high O- demand. The system generated an automated transfer advisory, moving the units within 2 hours, where they were successfully transfused to an emergency bypass patient the following morning.",
    },
  },

  "real-time-blood-inventory": {
    slug: "real-time-blood-inventory",
    title: "Real-Time Blood Inventory",
    shortDescription:
      "Provides live updates on blood availability across hospitals and blood banks.",
    iconType: "drop",
    whatItDoes: {
      summary:
        "The Real-Time Blood Inventory module delivers a unified, synchronized view of all blood products across connected hospitals, blood banks, and mobile storage facilities. Replacing fragmented phone calls and outdated paper logs, every unit checked in, reserved, cross-matched, or dispatched is reflected instantaneously across the network.",
      keyPoints: [
        "Maintains accurate counts for whole blood, packed red cells, platelets, and fresh frozen plasma.",
        "Differentiates between total on-hand units, reserved clinical units, and freely available inventory.",
        "Synchronizes with hospital laboratory information systems (LIS) and e-RaktKosh portals.",
        "Guarantees that doctors never commit to blood units that have already been allocated to another patient.",
      ],
    },
    inventorySample: [
      { group: "A+", available: 42, reserved: 8, status: "Available", color: "#16a34a", bg: "#f0fdf4" },
      { group: "O-", available: 6, reserved: 4, status: "Low Stock", color: "#d97706", bg: "#fffbeb" },
      { group: "B+", available: 0, reserved: 2, status: "Critical", color: "#dc2626", bg: "#fef2f2" },
      { group: "O+", available: 54, reserved: 14, status: "Available", color: "#16a34a", bg: "#f0fdf4" },
      { group: "AB+", available: 18, reserved: 3, status: "Available", color: "#16a34a", bg: "#f0fdf4" },
      { group: "A-", available: 9, reserved: 1, status: "Available", color: "#16a34a", bg: "#f0fdf4" },
      { group: "B-", available: 4, reserved: 2, status: "Low Stock", color: "#d97706", bg: "#fffbeb" },
      { group: "AB-", available: 2, reserved: 1, status: "Low Stock", color: "#d97706", bg: "#fffbeb" },
    ],
    keyInputs: [
      { title: "Blood Group & Component", desc: "Detailed breakdown by whole blood, PRBCs, platelets, FFP, and cryoprecipitate." },
      { title: "Available Units", desc: "Unassigned stock immediately ready for patient cross-matching." },
      { title: "Reserved Units", desc: "Units locked for scheduled operating theater sessions or verified cross-matches." },
      { title: "Critical Stock Thresholds", desc: "Configurable minimum operating reserve targets tailored per hospital." },
      { title: "Cold-Chain GPS Location", desc: "Physical storage coordinates, refrigerator zone, and shelf compartment." },
      { title: "Last Updated Timestamp", desc: "Live heartbeat sync showing exact seconds since latest registry update." },
    ],
    benefits: [
      {
        title: "Eliminates Manual Calls",
        desc: "Saves clinical staff valuable hours spent dialing dozens of blood banks during emergency resuscitations.",
      },
      {
        title: "Transparent Regional View",
        desc: "Provides health authorities with single-pane visibility across government and private healthcare providers.",
      },
      {
        title: "Prevents Double-Allocation",
        desc: "Cryptographic state locking prevents simultaneous reservation of identical blood units.",
      },
      {
        title: "Instant Verification",
        desc: "Barcode and QR code integration enables rapid reconciliation during intake and dispatch.",
      },
    ],
    exampleUseCase: {
      scenario: "Instant Verification During Multi-Organ Transfusion",
      detail:
        "An acute obstetric hemorrhage at Cauvery Hospital required 5 units of B+ blood. Rather than calling four local facilities, the on-duty resident checked the Real-Time Blood Inventory dashboard. The portal showed Apollo Hospital 4.2 km away had 14 available units updated 45 seconds prior. The request was reserved digitally in seconds, cross-matched, and dispatched via cold-chain transit within 25 minutes.",
    },
  },

  "location-based-search": {
    slug: "location-based-search",
    title: "Location-Based Search",
    shortDescription:
      "Finds nearby hospitals or blood banks with the required blood type.",
    iconType: "location",
    whatItDoes: {
      summary:
        "Location-Based Search empowers doctors, donor coordinators, and patients to instantly identify licensed blood banks and healthcare facilities holding verified supplies of required blood groups within custom radius boundaries. Utilizing geospatial indexing, results are ranked by verified availability and real-time transit distance.",
      keyPoints: [
        "Filters facilities by blood group, component type, and minimum required units.",
        "Sorts matching centers by road transit distance and estimated cold-chain delivery time.",
        "Distinguishes between 24/7 government facilities, charitable blood banks, and private centers.",
        "Features emergency SOS mode prioritizing fastest transit response for critical patients.",
      ],
    },
    workflow: [
      {
        step: 1,
        title: "Enter Blood Group",
        desc: "Select patient blood group and component requirement (e.g., O+, PRBC).",
      },
      {
        step: 2,
        title: "Select Location",
        desc: "Pin current hospital GPS or select district/radius (5 km, 15 km, 50 km).",
      },
      {
        step: 3,
        title: "Instant Search",
        desc: "Geospatial engine queries active inventory indexes across all nearby facilities.",
      },
      {
        step: 4,
        title: "View Available Sources",
        desc: "Review distance, verified stock, operational status, and emergency hotlines.",
      },
      {
        step: 5,
        title: "Contact or Request",
        desc: "Initiate direct digital transfer request or trigger instant phone dispatch.",
      },
    ],
    keyInputs: [
      { title: "Blood Group Filter", desc: "ABO and Rh factor matching, including compatible emergency alternates." },
      { title: "District & Radius", desc: "Geographic search parameters from 1 km to state-wide inter-district corridors." },
      { title: "Availability Threshold", desc: "Minimum unit volume required to satisfy surgical procedures." },
      { title: "Facility Type Filter", desc: "Filter by Government Medical Colleges, District Hospitals, or Red Cross banks." },
      { title: "Emergency Requirement", desc: "Toggle elevating priority routing and displaying active dispatch vehicles." },
      { title: "Real-Time Road Distance", desc: "Calculated via active route mapping considering current traffic delays." },
    ],
    benefits: [
      {
        title: "Minimizes Search Time",
        desc: "Reduces the critical window required to locate compatible blood from hours to under 60 seconds.",
      },
      {
        title: "Geographic Precision",
        desc: "Presents closest facilities first to minimize cold-chain exposure and transit costs.",
      },
      {
        title: "Verified Active Inventory",
        desc: "Filters out facilities with zero stock, displaying only facilities with authenticated reserves.",
      },
      {
        title: "Direct Hospital Connection",
        desc: "Provides authenticated 24/7 emergency dispatch phone numbers and direct digital messaging.",
      },
    ],
    exampleUseCase: {
      scenario: "Locating Rare Bombay Phenotype / O- Blood in Sub-Urban Center",
      detail:
        "A pregnant mother in an emergency center in Kattankulathur required 2 units of rare O- whole blood immediately. By setting the location filter with a 25 km radius, the attending physician instantly located 6 units at SRM Hospital (3.1 km) and 8 units at a nearby government facility. The team initiated the digital transfer in seconds, securing delivery in under 18 minutes.",
    },
  },

  "smart-source-recommendation": {
    slug: "smart-source-recommendation",
    title: "Smart Source Recommendation",
    shortDescription:
      "Uses AI to suggest the best blood sources based on availability, distance, and urgency.",
    iconType: "network",
    whatItDoes: {
      summary:
        "Rather than forcing medical personnel to guess which blood bank to request from, Smart Source Recommendation applies multi-objective algorithmic decision intelligence. It calculates a composite suitability score considering donor compatibility, physical proximity, stock depletion vulnerability, and unit expiry dates.",
      keyPoints: [
        "Balances immediate transit proximity against regional inventory buffer sustainability.",
        "Prevents over-exhausting a single hospital blood bank when nearby alternatives exist.",
        "Prioritizes units nearing expiry to optimize regional component utilization.",
        "Supports ABO and Rh clinical compatibility alternatives when exact matches are unavailable.",
      ],
    },
    recommendationFactors: [
      {
        title: "Blood Group Compatibility",
        weight: "Critical (100%)",
        desc: "Strict clinical adherence to universal donor rules (e.g., O- for packed cells, AB+ for plasma).",
      },
      {
        title: "Current Available Units",
        weight: "High (90%)",
        desc: "Ensures the supplying blood bank retains adequate safety buffer after fulfilling the request.",
      },
      {
        title: "Distance & Travel Time",
        weight: "High (85%)",
        desc: "Calculates actual road transit time and cold-chain vehicle logistics availability.",
      },
      {
        title: "Patient Urgency Level",
        weight: "Critical (95%)",
        desc: "Differentiates Immediate Trauma (minutes) from Scheduled Elective Surgery (hours/days).",
      },
      {
        title: "Expiry Risk Prioritization",
        weight: "Medium (75%)",
        desc: "Favors dispatching viable units with shorter remaining shelf life to eliminate waste.",
      },
      {
        title: "Operational Status",
        weight: "High (80%)",
        desc: "Verifies 24/7 laboratory staffing and instant cross-match readiness at the source.",
      },
    ],
    exampleCase: {
      request: {
        bloodGroup: "O+",
        unitsRequired: 4,
        urgency: "High (Surgical Trauma)",
        requestingHospital: "Trichy District General Hospital",
      },
      recommendations: [
        {
          rank: 1,
          name: "Trichy Government Blood Bank",
          availableUnits: "8 units",
          distance: "3.2 km",
          score: "96% Optimal Match",
          rationale: "Closest facility, high stock buffer, 2 units nearing optimal transfer window.",
        },
        {
          rank: 2,
          name: "Apollo Speciality Blood Center",
          availableUnits: "5 units",
          distance: "6.4 km",
          score: "88% Match",
          rationale: "Fast highway route, sufficient reserve, active cold-box courier ready.",
        },
        {
          rank: 3,
          name: "Cauvery Regional Blood Bank",
          availableUnits: "12 units",
          distance: "11.1 km",
          score: "82% Match",
          rationale: "Largest surplus reserve, slightly longer transit time.",
        },
      ],
    },
    benefits: [
      {
        title: "Objective AI Decisions",
        desc: "Removes subjective guesswork and personal bias from emergency component sourcing.",
      },
      {
        title: "Protects Supplier Reserves",
        desc: "Intelligently distributes request burdens so no single hospital is left drained.",
      },
      {
        title: "Accelerates Care Delivery",
        desc: "Presents ranked choices with ready-to-dispatch buttons directly on the clinical console.",
      },
      {
        title: "Optimizes Biological Resources",
        desc: "Coordinates blood transfer where need is highest and wastage probability is lowest.",
      },
    ],
    exampleUseCase: {
      scenario: "Coordinated Supply for Multi-Vessel Bypass",
      detail:
        "A cardiothoracic surgeon required 4 units of B+ and 2 units of fresh frozen plasma. The AI engine recommended sourcing 4 units of B+ from Apollo Hospital (closest transit) and the FFP from Trichy Government Hospital (highest tested coagulation quality and surplus reserve), orchestrating concurrent deliveries that arrived 15 minutes before incision.",
    },
  },

  "request-approval-workflow": {
    slug: "request-approval-workflow",
    title: "Request & Approval Workflow",
    shortDescription:
      "Streamlines blood requests with a digital approval system for faster response.",
    iconType: "approval",
    whatItDoes: {
      summary:
        "The Request & Approval Workflow digitizes and accelerates the end-to-end requisition, clinical verification, donor matching, and regulatory sign-off processes. Eliminating illegible paper forms, lost chits, and unrecorded handoffs, the workflow creates an auditable, timestamped ledger for every blood unit transferred.",
      keyPoints: [
        "Enables standardized digital requisition forms with mandatory clinical diagnosis fields.",
        "Supports two-factor biometric and digital signature approvals by authorized medical officers.",
        "Maintains an immutable chain-of-custody audit log for clinical compliance.",
        "Automatically updates supplying and receiving inventory ledgers upon physical barcode handover.",
      ],
    },
    workflow: [
      {
        step: 1,
        title: "Hospital Creates Request",
        desc: "Clinician submits patient ID, diagnosis, blood group, units, and required arrival time.",
      },
      {
        step: 2,
        title: "Blood Requirement Details",
        desc: "System validates clinical justification, component specifications, and urgency tier.",
      },
      {
        step: 3,
        title: "Source Identification",
        desc: "AI engine matches approved requisition with optimal hospital blood bank or donor pool.",
      },
      {
        step: 4,
        title: "Request Sent Digitally",
        desc: "Supplying blood bank receives prioritized push alert on workstation and mobile app.",
      },
      {
        step: 5,
        title: "Blood Bank / Hospital Approval",
        desc: "Authorized medical officer verifies cross-match eligibility and signs digital release.",
      },
      {
        step: 6,
        title: "Transfer Confirmation",
        desc: "Courier scans unit barcode into temperature-monitored cold chain carrier box.",
      },
      {
        step: 7,
        title: "Inventory Updated",
        desc: "Receiving ward scans barcode on delivery; ledgers update automatically across all nodes.",
      },
    ],
    statusLifecycle: [
      {
        status: "Pending",
        color: "#d97706",
        bg: "#fffbeb",
        desc: "Request generated and queued; awaiting review by supplying blood bank officer.",
      },
      {
        status: "Approved",
        color: "#16a34a",
        bg: "#f0fdf4",
        desc: "Supplying facility accepted the requisition and locked specific units in storage.",
      },
      {
        status: "Processing",
        color: "#2563eb",
        bg: "#eff6ff",
        desc: "Laboratory conducting compatibility cross-matching and preparing cold packaging.",
      },
      {
        status: "Transferred",
        color: "#7c3aed",
        bg: "#f5f3ff",
        desc: "Blood units picked up by certified ambulance courier and in active transit.",
      },
      {
        status: "Completed",
        color: "#059669",
        bg: "#ecfdf5",
        desc: "Handover confirmed by receiving hospital transfusionist; inventory reconciled.",
      },
      {
        status: "Rejected",
        color: "#dc2626",
        bg: "#fef2f2",
        desc: "Request declined due to clinical incompatibility or zero reserve; alternative routed.",
      },
    ],
    benefits: [
      {
        title: "Accelerated Turnaround",
        desc: "Cuts administrative processing time from an average of 45 minutes down to under 4 minutes.",
      },
      {
        title: "Zero Lost Records",
        desc: "Every interaction is permanently archived with cryptographic timestamps and user IDs.",
      },
      {
        title: "Instant Inventory Sync",
        desc: "Eliminates ledger reconciliation discrepancies between supplying and receiving entities.",
      },
      {
        title: "Regulatory Compliance",
        desc: "Complies fully with National Blood Transfusion Council (NBTC) and FDA standards.",
      },
    ],
    exampleUseCase: {
      scenario: "Audited Emergency Requisition in Obstetrics",
      detail:
        "During a critical delivery complication, an on-duty OB-GYN created an urgent request for 3 units of O- blood. Within 90 seconds, the central blood bank officer received the notification, validated the doctor's digital credential, approved the release, and dispatched the cold carrier. The entire handover was scanned digitally, updating both hospital ledgers with zero manual paperwork.",
    },
  },

  "ai-insights-analytics": {
    slug: "ai-insights-analytics",
    title: "AI Insights & Analytics",
    shortDescription:
      "Visualizes trends, usage patterns, and key insights for better decision-making.",
    iconType: "analytics",
    whatItDoes: {
      summary:
        "AI Insights & Analytics transforms millions of localized blood transaction records, donor demographics, and hospital requisition streams into clear visual intelligence. Healthcare executives, district medical officers, and blood bank directors gain continuous visibility into system performance, waste reduction, and clinical trends.",
      keyPoints: [
        "Visualizes daily, weekly, and seasonal blood group usage velocity across districts.",
        "Detects recurring shortage bottlenecks and predicts future regional supply deficits.",
        "Evaluates voluntary donor retention rates, repeat frequency, and drop-off indicators.",
        "Tracks key performance indicators including fulfillment speed, cold-chain compliance, and wastage.",
      ],
    },
    sampleMetrics: [
      {
        label: "Total Monitored Units",
        value: "1,428",
        subtext: "Across 48 connected facilities",
        color: "#dc2626",
      },
      {
        label: "Active Requests",
        value: "34",
        subtext: "12 in transit, 22 approved",
        color: "#2563eb",
      },
      {
        label: "Critical Blood Groups",
        value: "2",
        subtext: "O- and B- below minimum buffer",
        color: "#ea580c",
      },
      {
        label: "Expiring Units (72h)",
        value: "14",
        subtext: "100% targeted for priority redistribution",
        color: "#d97706",
      },
      {
        label: "High-Demand Corridors",
        value: "3",
        subtext: "Trichy Central, Madurai North, Thanjavur",
        color: "#7c3aed",
      },
    ],
    analyticsDimensions: [
      {
        title: "Blood Demand Trends",
        desc: "Tracks multi-month transfusion velocity curves to discover upward seasonal shifts.",
      },
      {
        title: "Blood Group Usage",
        desc: "Measures precise consumption ratios: O+ (38%), B+ (30%), A+ (21%), AB+ (7%), Negatives (4%).",
      },
      {
        title: "Shortage Trends",
        desc: "Pinpoints recurrent deficit periods during exam months and festival seasons.",
      },
      {
        title: "Expiry Trends",
        desc: "Monitors historical discard rates, showing an 82% reduction since AI adoption.",
      },
      {
        title: "Hospital Demand Patterns",
        desc: "Clusters hospitals by trauma velocity, elective surgical load, and component preference.",
      },
      {
        title: "Regional Utilization",
        desc: "Identifies resource imbalances between metropolitan centers and rural taluk hospitals.",
      },
    ],
    benefits: [
      {
        title: "Evidence-Based Planning",
        desc: "Guides state healthcare authorities on where to invest in blood bank cold-storage infrastructure.",
      },
      {
        title: "Optimized Mobile Camps",
        desc: "Directs blood donation buses to specific neighborhoods where targeted blood groups reside.",
      },
      {
        title: "Continuous Quality Improvement",
        desc: "Tracks order fulfillment times and courier cold-chain compliance across every trip.",
      },
      {
        title: "Measurable Impact Reporting",
        desc: "Generates comprehensive PDF reports for accreditation boards and donor recognition programs.",
      },
    ],
    exampleUseCase: {
      scenario: "District Health Administration Strategic Review",
      detail:
        "The District Blood Transfusion Committee utilized the BloodChain AI Analytics portal during their quarterly review. The analytics highlighted that while urban Trichy maintained surplus O+ inventory, rural facilities in surrounding taluks faced 3-day delays for emergency platelets. Using these insights, the committee re-routed mobile apheresis vans and established two refrigerated sub-depots, elevating regional emergency platelet fulfillment by 65%.",
    },
  },
};
