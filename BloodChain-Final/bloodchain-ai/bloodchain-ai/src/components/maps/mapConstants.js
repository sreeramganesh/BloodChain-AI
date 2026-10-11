/**
 * Map Configuration Constants
 * Phase 1 Foundation: Leaflet + OpenStreetMap
 */

/**
 * Default Project Development Center (Fallback only — Step 6)
 * Tiruchirappalli central coordinates.
 * NOTE: Strictly a fallback viewport center. Not user GPS, not fake facility coordinates.
 */
export const DEFAULT_MAP_CENTER = {
  lat: 10.7905,
  lng: 78.7047,
};

/**
 * Standard OpenStreetMap Tile Configuration (Step 4)
 * Free, open, community-driven map tiles with required attribution.
 */
export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
