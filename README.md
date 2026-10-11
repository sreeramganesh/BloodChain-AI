# 🩸 BloodChain AI

> **Intelligent Blood Supply Chain, Predictive Inventory & Logistics Network**  
> Developed with ❤️ by **Team Zenith**

BloodChain AI is a unified healthcare intelligence platform that bridges hospitals, regional blood banks, and community donors into a synchronized, transparent, and resilient network. Powered by real-time inventory synchronization, strict clinical ABO/Rh compatibility rules, an explainable 100-point multi-factor source recommendation engine, OSRM road routing, and statistical demand forecasting.

---

## 👥 Stakeholder-Specific Features

BloodChain AI provides customized, role-based workflows (RBAC) designed specifically around the distinct operational needs of each stakeholder in the blood supply chain:

```
               ┌────────────────────────────────────────────────────────┐
               │                     BLOODCHAIN AI                      │
               └───────────┬───────────────────┬────────────────────┬───┘
                           │                   │                    │
              ┌────────────▼─────────┐ ┌───────▼──────────┐ ┌───────▼──────────┐
              │   1. DONOR / USER    │ │   2. HOSPITAL    │ │  3. BLOOD BANK   │
              │  Community & Donors  │ │  Emergency Care  │ │ Supply & Storage │
              └──────────────────────┘ └──────────────────┘ └──────────────────┘
```

---

### 🩸 1. Donors / Users (5 Core Features)

Designed for voluntary blood donors and patients needing community assistance:

1. **Nearby Donor & Facility Discovery (`/find-donors`)**:
   - Geospatial proximity search with GPS pre-filtering to locate active blood banks, hospitals, and eligible community donors within custom radius boundaries (5 km – 50 km).
2. **Personal Donation History & Health Timeline (`/my-donations`)**:
   - Digital log of previous donations, blood components donated (Whole Blood, Platelets, RBC, FFP), donation center verification, and an automated eligibility countdown timer (56/90 days) until the next safe donation window.
3. **Personal Emergency Requests ("My Requests") (`/my-requests`)**:
   - Submit personal or family blood requirements directly to the regional network, tracking real-time status updates (`Pending` ➔ `In Progress` ➔ `Matched` ➔ `Fulfilled`).
4. **Privacy-Preserving Locality Centroid Matching**:
   - Mathematical privacy protection where donor residential coordinates are snapped to regional locality centroids, safeguarding donor privacy while allowing accurate distance calculations.
5. **Real-Time Emergency Broadcasts & Notifications (`/notifications`)**:
   - Instant push notifications when critical shortages or emergency surgical requirements for the donor's specific blood group arise in nearby hospitals.

---

### 🏥 2. Hospitals (Emergency Care & Clinical Demand)

Built for hospital administrators, emergency triage units, and surgeons:

1. **Emergency Blood Request Portal (`/blood-request`)**:
   - Rapid requisition system specifying patient details, clinical urgency level (`Critical`, `High`, `Medium`), blood group, and required units with automated validation.
2. **Intelligent Source Selection Engine (`/ai-recommendation`)**:
   - 100-point multi-factor clinical scoring model (`v2-routes`) that identifies the top candidate blood sources evaluating:
     - *ABO/Rh Clinical Compatibility* (Exact match vs. compatible alternative)
     - *Usable Unreserved Stock* (Deducting already committed units)
     - *Source Shortage Protection* (Ensuring the donor facility retains safe reserves)
     - *Near-Expiry Prioritization* (Minimizing wastage)
     - *Road Travel Duration* (OSRM real driving time & ETA)
3. **Multi-Facility Cross-Network Inventory Visibility (`/blood-inventory`)**:
   - Read-only real-time search across 740 connected medical centers in 74 districts with unit cost estimations (`₹1,300 – ₹1,650/unit`) and expiry horizons.
4. **Inter-Hospital Transfer Coordination (`/approval-transfer`)**:
   - Request inter-facility transfers with complete audit trails, transparent clinical explanations ("WHY" a facility was recommended), and mandatory authorized medical officer review.
5. **Shortage Risk Detection & 30-Day Demand Forecasting**:
   - Visual early-warning alerts for impending group deficits and 30-day statistical demand projections (Holt's Linear Exponential Smoothing) to schedule surgical allocations proactively.

---

### 🏢 3. Blood Banks (Supply Chain & Inventory Storage)

Tailored for blood bank officers, lab technicians, and regional storage facilities:

1. **Granular Batch-Level Inventory Management (`/blood-inventory`)**:
   - Comprehensive CRUD control over cold storage batches (`A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`), segregating *Available Units* from *Reserved Units* with unique batch tracking codes (e.g., `FAC-0001-AP-B1`).
2. **Automated Near-Expiry Wastage Prevention**:
   - Dynamic expiry risk indicators flagging units within 1–5 days of shelf-life expiration, recommending priority dispatch for emergency surgeries or inter-hospital transfers to reach **zero blood wastage**.
3. **Transfer Approval, Dispatch & Rejection Workflow (`/approval-transfer`)**:
   - Operational queue to review incoming transfer requests from hospitals, verify dispatch logistics, approve with mandatory reason logging, or reject with clear clinical justification.
4. **Safety Stock Buffer Monitoring & Deficit Alerts**:
   - Automated triggers that calculate minimum safety stock buffers per blood group so blood banks never commit units that would compromise local trauma emergency reserves.
5. **Regional Network Logistics & Facility Directory (`/hospitals-blood-banks`)**:
   - Leaflet-powered district map linking all 740 facilities across 6 states for coordinating regional blood drives, mobile camps, and inter-city supply rebalancing.

---

## 🧠 Core Intelligence & Decision-Support

- **Deterministic AI Assistant (`FloatingAIAssistant`)**: 100% deterministic, rule-based natural language assistant for querying live inventory, checking compatibility, and explaining clinical recommendations with a strict human-in-the-loop guarantee.
- **OSRM Road Routing Engine**: Real driving distances, turn-by-turn route coordinates, and travel durations computed via Open Source Routing Machine with Haversine fallback.
- **Statistical Time-Series Forecasting**: 30-day facility-level demand projections calculated via Holt's Linear Exponential Smoothing with 95% confidence intervals.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend SPA** | React 19, Vite 8, React Router v7, Tailwind CSS, Recharts, Lucide Icons |
| **Geospatial & Mapping** | Leaflet, React-Leaflet, OpenStreetMap, OSRM Public Routing |
| **Backend & Storage** | Supabase PostgreSQL, Supabase Auth (`@supabase/supabase-js`) |
| **Routing / Deployment** | Vercel SPA Rewrites (`vercel.json`), Continuous Deployment (CI/CD) |
| **Reliability Fallback** | Browser LocalStorage session fallback & verified offline datasets |

---

## 📁 Repository Structure

```
Blood_chain/
├── BloodChain-Final/
│   ├── bloodchain-ai/bloodchain-ai/   # Primary React 19 + Supabase web application
│   │   ├── src/                       # Application components, pages, and services
│   │   ├── scripts/                   # Forecasting engines & migration generators
│   │   ├── supabase/                  # PostgreSQL database schemas and migrations
│   │   └── vercel.json                # Vercel deployment rewrite rules
│   ├── Bloodchain/Bloodchain/         # Initial UI prototype
│   └── datasets/                      # Master hospital directory & inventory datasets
├── .gitignore                         # Repository gitignore rules
├── LICENSE                            # MIT License (Copyright © 2026 zenith)
└── README.md                          # Project overview and documentation
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Local Run

```bash
# 1. Navigate to the main application directory
cd BloodChain-Final/bloodchain-ai/bloodchain-ai

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### Running Tests & Building

```bash
# Run Vitest test suites (37 unit tests)
npm test

# Build for production
npm run build
```

---

## 👥 Creator & Authors

Developed and engineered by **Team Zenith**:
- **Team**: **Team Zenith**
- **Project**: BloodChain AI — Predictive Blood Supply Chain & Logistics Network

---

## 🛡️ License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.  
*Copyright (c) 2026 zenith*
