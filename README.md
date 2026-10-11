# 🩸 BloodChain AI

> **Intelligent Blood Supply Chain, Predictive Inventory & Logistics Network**

BloodChain AI is a healthcare platform connecting hospitals, regional blood banks, and community donors. It features real-time inventory tracking, clinical ABO/Rh compatibility matching, a 100-point multi-factor source recommendation engine, OSRM road routing, and statistical demand forecasting.

---

## 🚀 Key Capabilities

- **Real-Time Blood Inventory**: Multi-state tracking across 740 authoritative medical facilities across 74 districts.
- **Intelligent Source Selection Engine**: 100-point multi-factor clinical scoring model (`v2-routes`) incorporating ABO/Rh compatibility, usable unreserved stock, expiry urgency, and road travel duration.
- **Interactive Facility Map**: Leaflet & OpenStreetMap geospatial navigation with district-level filtering and search.
- **OSRM Road Routing**: Real-world driving distances and travel ETA calculations powered by Open Source Routing Machine with Haversine fallback.
- **Statistical Demand Forecasting**: 30-day demand predictions modeled via Holt's Linear Exponential Smoothing.
- **Role-Based Access Control (RBAC)**: Dedicated operational workflows for Hospital Admins, Blood Bank Staff, and Community Donors.
- **AI Decision-Support Assistant**: Deterministic, rule-based natural language assistant for querying inventory and explaining clinical transfer recommendations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router v7, Tailwind CSS, Recharts, Lucide Icons |
| **Geospatial & Mapping** | Leaflet, React-Leaflet, OpenStreetMap, OSRM Public Routing |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth (`@supabase/supabase-js`) |
| **Offline & Reliability** | Browser LocalStorage session fallback & synthetic operational dataset |

---

## 📁 Repository Structure

```
Blood_chain/
├── BloodChain-Final/
│   ├── bloodchain-ai/bloodchain-ai/   # Primary React 19 + Supabase web application
│   │   ├── src/                       # Application components, pages, and services
│   │   ├── scripts/                   # Forecasting engines & migration generators
│   │   └── supabase/                  # PostgreSQL database schemas and migrations
│   ├── Bloodchain/Bloodchain/         # Initial UI prototype
│   └── datasets/                      # Master hospital directory & inventory datasets
├── docs/
│   └── reports/                       # Implementation & architecture reports (Phases 1-6)
├── .gitignore                         # Repository gitignore rules
└── README.md                          # Project overview and documentation
```

---

## 📋 Implementation Reports & Documentation

Detailed implementation reports for all engineering phases are available in [`docs/reports/`](file:///docs/reports/):

- [`PHASE_1_LEAFLET_IMPLEMENTATION_REPORT.md`](file:///docs/reports/PHASE_1_LEAFLET_IMPLEMENTATION_REPORT.md): Leaflet & OpenStreetMap baseline migration.
- [`PHASE_2_FACILITY_MAP_IMPLEMENTATION_REPORT.md`](file:///docs/reports/PHASE_2_FACILITY_MAP_IMPLEMENTATION_REPORT.md): Interactive facility directory map & district navigation.
- [`PHASE_5_FINAL_INTEGRATION_REPORT.md`](file:///docs/reports/PHASE_5_FINAL_INTEGRATION_REPORT.md): Road routing, OSRM integration, and 100-point scoring model.
- [`PHASE_6_IMPLEMENTATION_REPORT.md`](file:///docs/reports/PHASE_6_IMPLEMENTATION_REPORT.md): End-to-end integration, automated testing, and verification.

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

# 3. Start local development server
npm run dev
```

### Running Tests

```bash
# Run Vitest test suites
npm test

# Build for production
npm run build
```

---

## 🛡️ License

This project is licensed under the MIT License.
