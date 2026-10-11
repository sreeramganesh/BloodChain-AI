# PHASE 1 — LEAFLET + OPENSTREETMAP MIGRATION FOUNDATION
## BloodChain AI Implementation & Verification Report

**Status:** COMPLETE (Phase 1 Foundation Verified)  
**Execution Date:** September 29, 2026  
**Provider Transition:** Google Maps / Google Routes ➔ Leaflet / OpenStreetMap  

---

## 1. Objective
Establish an open-source, vendor-neutral Leaflet + OpenStreetMap mapping foundation for BloodChain AI without breaking existing clinical workflows, GPS geolocation, Haversine distance utilities, recommendation scoring, or Supabase integrations. Safely eliminate the hard dependency on Google Maps JavaScript API and Google Maps API keys from the application's map rendering layer.

---

## 2. Current Google Maps Architecture Found During Audit
Prior to migration, the application relied on:
- `@googlemaps/js-api-loader` (v2.1.3) imported in `src/components/maps/GoogleMapView.jsx`.
- Strict requirement for `VITE_GOOGLE_MAPS_API_KEY` in environment; when absent or invalid, a prominent blocking banner *"Google Maps API Key Not Configured"* was rendered across map viewports.
- Client-side Google Maps JavaScript instances (`window.google.maps.Map`, `window.google.maps.Marker`, `window.google.maps.Polyline`, `window.google.maps.InfoWindow`).
- Map component consumers:
  - `src/pages/HospitalsBloodBanks.jsx`
  - `src/pages/BloodRequest.jsx`
  - `src/components/predictive/RequestRecommendationModal.jsx`
  - `src/components/predictive/AIRecommendationView.jsx`
- Google Routes REST & DirectionsService in `src/services/routesService.js` (used by Phase 5 recommendation scoring).

---

## 3. Leaflet Packages Installed
- `leaflet` (`^1.9.4`): Core Leaflet geospatial mapping library.
- `react-leaflet` (`^5.0.0`): React 19-compatible declarative bindings for Leaflet.
- Removed from dependencies: `@googlemaps/js-api-loader`.

---

## 4. Files Created
1. `src/components/maps/mapConstants.js`: Centralized OpenStreetMap configuration constants, tile endpoints, standard attribution, and default fallback center.
2. `src/components/maps/LeafletMapView.jsx`: Reusable, responsive React-Leaflet map component supporting OpenStreetMap tiles, custom SVG blood-chain pins, user location display, popup cards, and extensible route layers.
3. `scripts/test_phase1_leaflet.mjs`: Automated unit/integration test suite verifying all 16 Phase 1 architectural criteria.
4. `scripts/test_browser_phase1_leaflet.mjs`: End-to-end browser verification script testing page rendering, map containers, tile loading, zoom controls, attribution, and visual integrity.

---

## 5. Files Modified
1. `package.json`: Added `leaflet` and `react-leaflet`; safely uninstalled `@googlemaps/js-api-loader`.
2. `src/components/maps/GoogleMapView.jsx`: Refactored to act as a lightweight backward-compatible adapter delegating directly to `LeafletMapView` without Google Maps SDK dependencies.
3. `src/pages/HospitalsBloodBanks.jsx`: Updated map import from `GoogleMapView` to `LeafletMapView`; rendered `<LeafletMapView height="280px" ... />`.
4. `src/pages/BloodRequest.jsx`: Updated map import to `LeafletMapView`; rendered `<LeafletMapView height="220px" ... />`.
5. `src/components/predictive/RequestRecommendationModal.jsx`: Updated map import and modal view to `LeafletMapView`.
6. `src/components/predictive/AIRecommendationView.jsx`: Updated map import and recommendation view to `LeafletMapView`.
7. `src/components/ai-assistant/AIQuickActions.jsx`: Removed unused internal exports to satisfy ESLint `react-refresh/only-export-components`.
8. `src/services/aiAssistant/queryUnderstandingService.js`: Resolved `no-useless-assignment` variable declaration lints.
9. `src/services/aiAssistant/decisionSupportService.js`: Resolved `no-useless-assignment` lints.

---

## 6. Google Dependencies Removed
- `@googlemaps/js-api-loader` package uninstalled.
- Removed requirement for `VITE_GOOGLE_MAPS_API_KEY` in map rendering.
- Removed the *"Google Maps API Key Not Configured"* error fallback screen.
- Removed Google Maps script tag injections in map components.

---

## 7. Google Dependencies Intentionally Preserved
- `src/services/routesService.js`: Retained temporarily as required by Step 10. `routesService.js` provides road transit distances and ETA calculations for the Phase 5 recommendation engine (`score_version = "v2-routes"`). It gracefully falls back to Haversine straight-line distance when Google Routes is unreachable. Phase 4 will replace this service with OSRM (Open Source Routing Machine).

---

## 8. OpenStreetMap Tile Configuration
- **Standard OSM Tile URL:** `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Subdomains:** `{s}` (`a`, `b`, `c`) standard round-robin tile servers.
- **Fair Use:** Zero aggressive pre-fetching, zero bulk downloading, respect for OpenStreetMap tile usage policy.

---

## 9. Attribution Implementation
- TileLayer binds standard OpenStreetMap attribution:
  ```html
  &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
  ```
- Attribution rendered via Leaflet's standard bottom-right control on all active map instances.

---

## 10. GPS Preservation
- `src/services/geolocationService.js` was **100% preserved and untouched**.
- Browser `navigator.geolocation.getCurrentPosition()` remains intact for one-time privacy-compliant location detection.
- `LeafletMapView` accepts optional `userLocation` prop (`{ latitude, longitude, accuracy }`) and renders a distinct blue user location pin with accuracy readout.

---

## 11. Haversine Preservation
- `src/utils/geoUtils.js` was **100% preserved and untouched**.
- `calculateHaversineDistance`, `formatDistance`, and `findNearbyFacilities` continue operating with 0 changes.

---

## 12. Facility Dataset Preservation
- Master authoritative facility dataset in `src/data/facilitiesData.js` and `src/services/facilityService.js` remains **exactly 740 facilities**.
- Zero coordinates were fabricated or modified.
- Facilities with verified coordinates (e.g. Trichy GH, Kauvery, Apollo) are rendered on map; facilities awaiting geocoding remain listed without random coordinates.

---

## 13. Database Safety Verification
- Supabase tables verified before and after migration:
  - `blood_inventory`: 10 rows (Unchanged, read-only)
  - `transfers`: 8 rows (Unchanged, zero auto-dispatches)
  - `blood_requests`: 11 rows (Unchanged)
  - `facilities`: 9 rows (Unchanged)
- Zero database migrations executed. Zero mutations.

---

## 14. Browser Test Results
`node scripts/test_browser_phase1_leaflet.mjs`
- Application loads: **PASS**
- Login page loads: **PASS**
- Dashboard page loads: **PASS**
- Find Donors page loads without crash: **PASS**
- Hospitals & Blood Banks page loads: **PASS**
  - Leaflet map container rendered (385x280px): **PASS**
  - OpenStreetMap tiles loaded: **PASS**
  - OSM attribution displayed: **PASS**
  - Leaflet zoom controls (+/-) active and functional: **PASS**
  - Zoom-in click test: **PASS**
  - Verified 13 Leaflet map markers rendered: **PASS**
  - Zero "Missing API Key" error banners: **PASS**
- Blood Request page loads: **PASS**
  - Leaflet map container rendered (274x220px): **PASS**
  - OSM attribution displayed: **PASS**
  - Zero "Missing API Key" error banners: **PASS**
- **Captured Artifacts:**
  - `leaflet_hospitals_map_verified.png`
  - `leaflet_blood_request_map_verified.png`

---

## 15. Unit / Integration Test Results
`node scripts/test_phase1_leaflet.mjs`
- Test 1: Leaflet Dependency: **PASS**
- Test 2: React-Leaflet Dependency: **PASS**
- Test 3: LeafletMapView Component: **PASS**
- Test 4: Leaflet CSS Import: **PASS**
- Test 5: OpenStreetMap Tile Layer: **PASS**
- Test 6: OSM Attribution: **PASS**
- Test 7: No Google Maps API Key Requirement: **PASS**
- Test 8: Existing geoUtils Preservation: **PASS**
- Test 9: Existing geolocationService Preservation: **PASS**
- Test 10: 740 Authoritative Facilities Preservation: **PASS**
- Test 11: Existing Recommendation Engine Preservation: **PASS**
- Test 12: Existing routesService Preservation: **PASS**
- Test 13: Google Maps Package Safely Removed: **PASS**
- Test 14: Zero Hardcoded API Keys: **PASS**
- Test 15: Coordinates Integrity (No Fake Coords): **PASS**
- Test 16: Fallback Development Center: **PASS**
- **Result:** `34 PASSED, 0 FAILED` (100% Success)

---

## 16. Lint Result
`npm run lint`
- **Result:** `0 ERRORS` (Code 0 exit).

---

## 17. Build Result
`npm run build`
- **Result:** Vite production build successful in 1.29s (Code 0 exit).

---

## 18. Existing Regression Results
1. `node scripts/test_phase3_geo.mjs`: **PASS** (`22 PASSED, 0 FAILED`)
2. `node scripts/test_phase4_recommendations.mjs`: **PASS** (`45 PASSED, 0 FAILED`)
3. `node scripts/test_phase5_routes.mjs`: **PASS** (`49/49 PASSED`, 100% Success)

---

## 19. Bugs Found During Migration
1. **ESLint Fast Refresh Warning:** Exporting non-component constants (`DEFAULT_MAP_CENTER`, `OSM_TILE_URL`) alongside the component in `LeafletMapView.jsx` triggered `react-refresh/only-export-components`.
2. **Missing Leaflet Container Minimum Dimensions:** Without explicit wrapper styling, Leaflet map containers could collapse to 0px height if flex children weren't bounded.

---

## 20. Bugs Fixed
1. Created `src/components/maps/mapConstants.js` to decouple constants from `.jsx` components, achieving clean Fast Refresh and passing ESLint with 0 errors.
2. Configured `minHeight: height === "100%" ? "200px" : height` and `overflow: hidden` on `LeafletMapView` wrapper, ensuring map viewports never render at 0px.
3. Created custom SVG `L.divIcon` pins for facilities and user location, preventing 404 missing PNG assets in bundled Vite environments.

---

## 21. Remaining Google Dependencies (Documented per Step 10 & 19)
- `src/services/routesService.js`:
  - `routes.googleapis.com/directions/v2:computeRoutes` (REST endpoint)
  - `window.google?.maps?.DirectionsService` (Client-side fallback)
  - `VITE_GOOGLE_MAPS_API_KEY` (Used strictly by `routesService.js`)
  - **Status:** Category 3 — Intentionally preserved temporarily for Phase 1; will be replaced by OSRM in Phase 4.

---

## 22. Phase 2 Prerequisites & Readiness
With Phase 1 complete:
- Leaflet and OpenStreetMap tiles are operational across the project.
- No Google Maps API key is required for map rendering.
- All existing application features, routing, and regression suites are green.
- The project is fully ready for **Phase 2: Interactive Facility Maps & District Navigation**.

---

### CRITICAL STOP CONDITION OBSERVED
Phase 1 foundation is complete. No Phase 2, 3, 4, or 5 features have been started. Awaiting user instructions.
