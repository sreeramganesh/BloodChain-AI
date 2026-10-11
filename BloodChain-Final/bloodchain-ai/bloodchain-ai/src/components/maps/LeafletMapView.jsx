import React, { useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Phase 4: OSRM route origin/source icons
const routeOriginIcon = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="34" height="46" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#7c3aed" stroke="#4c1d95" stroke-width="1.5"/>
    <circle cx="12" cy="11" r="5.5" fill="#ffffff"/>
    <circle cx="12" cy="11" r="3" fill="#7c3aed"/>
    <circle cx="12" cy="11" r="1.5" fill="#ffffff"/>
  </svg>`;
  return L.divIcon({ html: svg, className: "route-origin-pin", iconSize: [34, 46], iconAnchor: [17, 46], popupAnchor: [0, -44] });
})();

const routeDestIcon = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="38" height="51" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#dc2626" stroke="#fbbf24" stroke-width="2.5"/>
    <circle cx="12" cy="11" r="5.5" fill="#ffffff"/>
    <path d="M12 7c-1.5 2-3 3.5-3 5a3 3 0 006 0c0-1.5-1.5-3-3-5z" fill="#dc2626"/>
  </svg>`;
  return L.divIcon({ html: svg, className: "route-dest-pin selected-pin", iconSize: [38, 51], iconAnchor: [19, 51], popupAnchor: [0, -49] });
})();

// Fix default Leaflet marker assets in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import {
  DEFAULT_MAP_CENTER,
  OSM_TILE_URL,
  OSM_ATTRIBUTION,
} from "./mapConstants.js";

/**
 * Custom SVG DivIcon builder for high-contrast, dependency-free map pins
 */
function createSvgPinIcon({
  fillColor = "#dc2626",
  strokeColor = "#991b1b",
  size = 32,
  isSelected = false,
  glyph = "dot", // "cross", "droplet", "heart", "bullseye", "dot"
}) {
  const width = size;
  const height = Math.round(size * 1.35);

  let innerGlyph = `
    <circle cx="12" cy="11" r="5" fill="#ffffff" />
    <circle cx="12" cy="11" r="2.5" fill="${fillColor}" />
  `;

  if (glyph === "cross") {
    innerGlyph = `
      <circle cx="12" cy="11" r="5.5" fill="#ffffff" />
      <path d="M11 7h2v3h3v2h-3v3h-2v-3H8v-2h3V7z" fill="${fillColor}" />
    `;
  } else if (glyph === "droplet") {
    innerGlyph = `
      <circle cx="12" cy="11" r="5.5" fill="#ffffff" />
      <path d="M12 7c-1.5 2-3 3.5-3 5a3 3 0 006 0c0-1.5-1.5-3-3-5z" fill="${fillColor}" />
    `;
  } else if (glyph === "heart" || glyph === "donor") {
    innerGlyph = `
      <circle cx="12" cy="11" r="5.5" fill="#ffffff" />
      <path d="M12 15l-1-.9C8 11.5 6 9.8 6 7.8 6 6.2 7.2 5 8.8 5c.9 0 1.8.4 2.2 1.1.4-.7 1.3-1.1 2.2-1.1 1.6 0 2.8 1.2 2.8 2.8 0 2-2 3.7-5 6.3l-1 .9z" fill="${fillColor}" />
    `;
  } else if (glyph === "bullseye") {
    innerGlyph = `
      <circle cx="12" cy="11" r="5.5" fill="#ffffff" />
      <circle cx="12" cy="11" r="3.5" fill="${fillColor}" />
      <circle cx="12" cy="11" r="1.5" fill="#ffffff" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="${width}" height="${height}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" 
            fill="${fillColor}" 
            stroke="${isSelected ? "#fbbf24" : strokeColor}" 
            stroke-width="${isSelected ? "2.5" : "1.5"}"/>
      ${innerGlyph}
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: `bloodchain-map-pin ${isSelected ? "selected-pin" : ""}`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 4],
  });
}

/**
 * Pre-defined icons for hospitals, blood banks, donors, users, and selection states
 */
const hospitalIcon = createSvgPinIcon({
  fillColor: "#dc2626",
  strokeColor: "#991b1b",
  size: 28,
  glyph: "cross",
});

const selectedHospitalIcon = createSvgPinIcon({
  fillColor: "#b91c1c",
  strokeColor: "#f59e0b",
  size: 38,
  isSelected: true,
  glyph: "cross",
});

const bloodBankIcon = createSvgPinIcon({
  fillColor: "#881337",
  strokeColor: "#4c0519",
  size: 28,
  glyph: "droplet",
});

const selectedBloodBankIcon = createSvgPinIcon({
  fillColor: "#701a75",
  strokeColor: "#f59e0b",
  size: 38,
  isSelected: true,
  glyph: "droplet",
});

const donorIcon = createSvgPinIcon({
  fillColor: "#e11d48",
  strokeColor: "#9f1239",
  size: 28,
  glyph: "heart",
});

const selectedDonorIcon = createSvgPinIcon({
  fillColor: "#be123c",
  strokeColor: "#f59e0b",
  size: 38,
  isSelected: true,
  glyph: "heart",
});

const userLocationIcon = createSvgPinIcon({
  fillColor: "#2563eb",
  strokeColor: "#1d4ed8",
  size: 34,
  glyph: "bullseye",
});

// Backward compatibility aliases
const facilityIcon = hospitalIcon;
const selectedFacilityIcon = selectedHospitalIcon;

/**
 * Normalizes coordinate objects to [lat, lng] array
 */
function parseCoordinate(coord) {
  if (!coord) return null;
  const lat = Number(coord.lat ?? coord.latitude);
  const lng = Number(coord.lng ?? coord.longitude);
  if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}

/**
 * MapController component to handle dynamic updates:
 * - map recenter
 * - fit bounds to filtered facilities + route polyline
 * - selected marker focus & popup auto-open
 * - resize invalidation
 */
function MapController({
  center,
  zoom,
  markers,
  userPos,
  selectedFacilityId,
  markerRefs,
  fitBounds = true,
  routePolyline = null,
  onMapLoad,
}) {
  const map = useMap();
  const hasInitializedRef = useRef(false);
  const prevMarkersKeyRef = useRef("");
  const prevSelectedIdRef = useRef(null);

  // Notify parent of map instance on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (typeof onMapLoad === "function") {
        onMapLoad(map);
      }
    }
  }, [map, onMapLoad]);

  // Ensure map tiles render without grey gaps on dynamic layout changes
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  // Fit bounds when route polyline is active (Phase 4: OSRM route)
  useEffect(() => {
    if (routePolyline && routePolyline.length >= 2) {
      const bounds = L.latLngBounds(routePolyline);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
      }
    }
  }, [routePolyline, map]);

  // Fit bounds when markers or user position change
  useEffect(() => {
    // When a route is active, skip re-fitting bounds from markers alone
    if (routePolyline && routePolyline.length >= 2) return;

    const userPosKey = userPos ? userPos.join(",") : "";
    const markersKey =
      markers
        .map((m) => `${m.id || m.name}:${m._position ? m._position.join(",") : ""}`)
        .join("|") + `|user:${userPosKey}`;

    const isNewMarkerSet = markersKey !== prevMarkersKeyRef.current;
    prevMarkersKeyRef.current = markersKey;

    if (isNewMarkerSet) {
      // If a specific facility/donor is selected, focus that marker
      if (selectedFacilityId) {
        const selMarker = markers.find(
          (m) =>
            String(m.id) === String(selectedFacilityId) ||
            String(m.facility_id) === String(selectedFacilityId)
        );
        if (selMarker && selMarker._position) {
          map.setView(selMarker._position, Math.max(map.getZoom(), 13), { animate: true });
          return;
        }
      }

      // Collect all coordinates to fit: markers + userPos (if available)
      const validCoords = markers.map((m) => m._position).filter(Boolean);
      if (userPos) {
        validCoords.push(userPos);
      }

      // Fit bounds when 2 or more coordinates exist
      if (fitBounds && validCoords.length > 1) {
        const bounds = L.latLngBounds(validCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
          return;
        }
      }

      // Single coordinate focus (either user location or single marker)
      if (validCoords.length === 1) {
        map.setView(validCoords[0], Math.max(zoom || 13, 13));
        return;
      }

      // Zero coordinates -> center to fallback center
      if (validCoords.length === 0 && center) {
        const parsed = parseCoordinate(center) || [
          DEFAULT_MAP_CENTER.lat,
          DEFAULT_MAP_CENTER.lng,
        ];
        map.setView(parsed, zoom || 11);
      }
    }
  }, [markers, userPos, fitBounds, selectedFacilityId, center, zoom, routePolyline, map]);

  // Focus and open popup when selectedFacilityId changes
  useEffect(() => {
    if (selectedFacilityId !== null && selectedFacilityId !== undefined) {
      const isNewSelection = selectedFacilityId !== prevSelectedIdRef.current;
      prevSelectedIdRef.current = selectedFacilityId;

      const selMarker = markers.find(
        (m) =>
          String(m.id) === String(selectedFacilityId) ||
          String(m.facility_id) === String(selectedFacilityId)
      );

      if (selMarker && selMarker._position) {
        if (isNewSelection) {
          map.setView(selMarker._position, Math.max(map.getZoom(), 14), { animate: true });
        }

        const timer = setTimeout(() => {
          const inst = markerRefs.current?.get(String(selectedFacilityId));
          if (inst && typeof inst.openPopup === "function" && !inst.isPopupOpen()) {
            inst.openPopup();
          }
        }, 150);

        return () => clearTimeout(timer);
      }
    } else {
      prevSelectedIdRef.current = null;
    }
  }, [selectedFacilityId, markers, markerRefs, map]);

  // Recenter when center prop changes and no markers/selection active
  useEffect(() => {
    if (center && markers.length === 0 && !selectedFacilityId) {
      const lat = Number(center.lat ?? center.latitude);
      const lng = Number(center.lng ?? center.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setView([lat, lng], zoom || map.getZoom());
      }
    }
  }, [center, zoom, markers.length, selectedFacilityId, map]);

  return null;
}

/**
 * Reusable LeafletMapView Component
 * Phase 2 Migration: Interactive Facility Maps & District Navigation
 *
 * Provides a clean, responsive, dependency-free Leaflet map with OpenStreetMap tiles.
 * Supports:
 * - map center & zoom
 * - facility markers with verified coordinates
 * - selected facility visual focus & auto popup
 * - user location marker (browser GPS)
 * - marker popups with name, type, district, state, and [View Details]
 * - fit bounds to filtered facilities
 * - clean empty state overlay when 0 facilities have coordinates
 * - zero Google Maps dependency / zero API keys
 */
export default function LeafletMapView({
  center = DEFAULT_MAP_CENTER,
  zoom = 11,
  height = "320px",
  width = "100%",
  className = "",
  style = {},
  markers = [],
  selectedFacilityId = null,
  userLocation = null,
  route = null,
  fitBounds = true,
  onMarkerClick,
  onMapClick,
  onMapLoad,
}) {
  const markerRefs = useRef(new Map());

  // Normalize map center
  const centerPos = useMemo(() => {
    const parsed = parseCoordinate(center);
    return parsed || [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];
  }, [center]);

  // Normalize user location
  const userPos = useMemo(() => {
    return parseCoordinate(userLocation);
  }, [userLocation]);

  // Filter valid markers with verified coordinates
  const validMarkers = useMemo(() => {
    if (!Array.isArray(markers)) return [];
    return markers
      .map((m) => {
        const pos = parseCoordinate(m);
        if (!pos) return null;
        return {
          ...m,
          _position: pos,
          _isSelected:
            selectedFacilityId !== null &&
            (String(m.id) === String(selectedFacilityId) ||
              String(m.facility_id) === String(selectedFacilityId)),
        };
      })
      .filter(Boolean);
  }, [markers, selectedFacilityId]);

  // Extract route coordinates if available
  const routePolyline = useMemo(() => {
    if (!route || !Array.isArray(route.coordinates)) return null;
    const points = route.coordinates
      .map((pt) => parseCoordinate(pt))
      .filter(Boolean);
    return points.length > 1 ? points : null;
  }, [route]);

  const containerStyle = {
    height,
    width,
    minHeight: height === "100%" ? "200px" : height,
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    ...style,
  };

  return (
    <div
      className={`bloodchain-leaflet-map-wrapper ${className}`}
      style={containerStyle}
      data-testid="leaflet-map-container"
    >
      {/* Empty state overlay when zero facilities have verified coordinates */}
      {validMarkers.length === 0 && (
        <div
          className="leaflet-empty-overlay"
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            right: "12px",
            zIndex: 400,
            background: "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(6px)",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "9px 12px",
            fontSize: "12px",
            color: "#475569",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "16px" }}>📍</span>
          <div>
            <strong style={{ color: "#1e293b", display: "block", fontSize: "12px" }}>
              No verified coordinates in this view
            </strong>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Facilities are listed with &ldquo;Coordinates Pending&rdquo; status. Zero fake coordinates are mapped.
            </span>
          </div>
        </div>
      )}

      <MapContainer
        center={centerPos}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <MapController
          center={center}
          zoom={zoom}
          markers={validMarkers}
          userPos={userPos}
          selectedFacilityId={selectedFacilityId}
          markerRefs={markerRefs}
          fitBounds={fitBounds}
          routePolyline={routePolyline}
          onMapLoad={onMapLoad}
        />

        {/* OpenStreetMap Tile Layer (Step 4) */}
        <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />

        {/* User Location Marker & Accuracy Circle (Phase 3 GPS) */}
        {userPos && (
          <>
            {userLocation?.accuracy && userLocation.accuracy > 0 && (
              <Circle
                center={userPos}
                radius={Math.min(userLocation.accuracy, 25000)}
                pathOptions={{
                  fillColor: "#3b82f6",
                  fillOpacity: 0.12,
                  color: "#2563eb",
                  weight: 1.5,
                  dashArray: "3, 6",
                }}
              />
            )}
            <Marker position={userPos} icon={userLocationIcon} zIndexOffset={500}>
              <Tooltip permanent={false} direction="top" offset={[0, -25]}>
                Your Location
              </Tooltip>
              <Popup>
                <div style={{ padding: "4px 2px", fontSize: "13px" }}>
                  <b style={{ color: "#2563eb", display: "block", marginBottom: "4px" }}>
                    📍 Your Location (Browser GPS)
                  </b>
                  <span style={{ color: "#64748b" }}>
                    {userLocation?.accuracy
                      ? `Accuracy: ±${Math.round(userLocation.accuracy)}m`
                      : "Live GPS coordinates detected"}
                  </span>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Facility & Donor Markers */}
        {validMarkers.map((marker, idx) => {
          const isSelected = marker._isSelected;
          const isDonor = marker.isDonor || marker.markerType === "donor";
          const isBloodBank =
            marker.type === "Blood Bank" || marker.facility_type === "Blood Bank";

          let icon;
          if (isDonor) {
            icon = isSelected ? selectedDonorIcon : donorIcon;
          } else if (isBloodBank) {
            icon = isSelected ? selectedBloodBankIcon : bloodBankIcon;
          } else {
            icon = isSelected ? selectedFacilityIcon : facilityIcon;
          }

          const markerKey = String(
            marker.id || marker.facility_id || (isDonor ? `donor-${idx}` : `fac-${idx}`)
          );

          return (
            <Marker
              key={markerKey}
              ref={(node) => {
                if (node) {
                  markerRefs.current.set(markerKey, node);
                } else {
                  markerRefs.current.delete(markerKey);
                }
              }}
              position={marker._position}
              icon={icon}
              zIndexOffset={isSelected ? 1000 : isDonor ? 200 : 0}
              eventHandlers={{
                click: () => {
                  if (typeof onMarkerClick === "function") {
                    onMarkerClick(marker);
                  }
                },
              }}
            >
              {/* Marker Popup (Donor Privacy or Facility Details) */}
              <Popup>
                {isDonor ? (
                  /* ================= PHASE 3: PRIVACY-PRESERVING DONOR POPUP ================= */
                  /* STRICT PRIVACY RULE: NEVER expose house number, street address, or exact lat/lng */
                  <div
                    className="leaflet-donor-popup"
                    style={{
                      padding: "6px 4px",
                      minWidth: "185px",
                      maxWidth: "240px",
                      fontSize: "13px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#0f172a",
                        fontSize: "14px",
                        marginBottom: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span>👤</span>
                      <span>{marker.name || "Volunteer Donor"}</span>
                    </div>

                    <div
                      style={{
                        marginBottom: "5px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                        Blood Group:
                      </span>
                      <span
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          fontWeight: 800,
                          fontSize: "12px",
                        }}
                      >
                        {marker.bloodGroup || marker.blood_group || "Unknown"}
                      </span>
                    </div>

                    {marker.distanceDisplay && (
                      <div
                        style={{
                          marginBottom: "5px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                          Distance:
                        </span>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb" }}>
                          {marker.distanceDisplay}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        marginBottom: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                        Status:
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a" }}>
                        ● {marker.status || marker.availability || "Available"}
                      </span>
                    </div>

                    {marker.localityArea && (
                      <div
                        style={{
                          marginBottom: "8px",
                          fontSize: "11px",
                          color: "#64748b",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>📍 Approx. Area: {marker.localityArea}</span>
                      </div>
                    )}

                    {/* Button to select donor in table/list */}
                    <button
                      type="button"
                      className="leaflet-donor-select-btn"
                      onClick={() => {
                        if (typeof onMarkerClick === "function") {
                          onMarkerClick(marker);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "6px 12px",
                        background: "#e11d48",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "background 0.15s ease",
                      }}
                    >
                      Select Donor
                    </button>
                  </div>
                ) : (
                  /* ================= FACILITY POPUP ================= */
                  <div
                    className="leaflet-facility-popup"
                    style={{
                      padding: "6px 4px",
                      minWidth: "190px",
                      maxWidth: "250px",
                      fontSize: "13px",
                    }}
                  >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#0f172a",
                      fontSize: "14px",
                      marginBottom: "6px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "6px",
                    }}
                  >
                    <span>🏥</span>
                    <span>{marker.name || marker.facility_name || "Medical Facility"}</span>
                  </div>

                  <div style={{ marginBottom: "5px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      Type:
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#991b1b" }}>
                      {marker.type || marker.facility_type || "Hospital"}
                    </div>
                  </div>

                  {marker.district && (
                    <div style={{ marginBottom: "5px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        District:
                      </div>
                      <div style={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>
                        {marker.district}
                      </div>
                    </div>
                  )}

                  {marker.state && (
                    <div style={{ marginBottom: "5px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        State:
                      </div>
                      <div style={{ fontSize: "12px", color: "#334155", fontWeight: 500 }}>
                        {marker.state}
                      </div>
                    </div>
                  )}

                  {marker._position && (
                    <div style={{ marginBottom: "8px", fontSize: "11px", color: "#64748b" }}>
                      <span>
                        {marker._position[0].toFixed(4)}° N, {marker._position[1].toFixed(4)}° E
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="leaflet-popup-btn"
                    onClick={() => {
                      if (typeof onMarkerClick === "function") {
                        onMarkerClick(marker);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "6px 12px",
                      background: "#dc2626",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "background 0.15s ease",
                    }}
                  >
                    View Details
                  </button>
                </div>
              )}
            </Popup>
            </Marker>
          );
        })}

        {/* Phase 4: OSRM Route Polyline — solid road geometry */}
        {routePolyline && (
          <>
            {/* Shadow/glow layer */}
            <Polyline
              positions={routePolyline}
              color="#1e40af"
              weight={8}
              opacity={0.25}
            />
            {/* Main route line */}
            <Polyline
              positions={routePolyline}
              color="#3b82f6"
              weight={4}
              opacity={0.9}
              className="osrm-route-polyline"
            />
          </>
        )}

        {/* Phase 4: Route Origin Marker (requesting facility / user GPS) */}
        {routePolyline && route?.origin && (() => {
          const oPos = parseCoordinate(route.origin);
          return oPos ? (
            <Marker position={oPos} icon={routeOriginIcon} zIndexOffset={900}>
              <Tooltip permanent={false} direction="top" offset={[0, -44]}>
                📍 {route.originName || "Requesting Facility"}
              </Tooltip>
              <Popup>
                <div style={{ padding: "4px 2px", fontSize: "13px", minWidth: "160px" }}>
                  <b style={{ color: "#7c3aed", display: "block", marginBottom: "4px" }}>📍 Route Origin</b>
                  <span style={{ color: "#334155", fontSize: "12px" }}>{route.originName || "Requesting Facility"}</span>
                </div>
              </Popup>
            </Marker>
          ) : null;
        })()}

        {/* Phase 4: Route Destination Marker (selected source facility) */}
        {routePolyline && route?.destination && (() => {
          const dPos = parseCoordinate(route.destination);
          return dPos ? (
            <Marker position={dPos} icon={routeDestIcon} zIndexOffset={1100}>
              <Tooltip permanent={false} direction="top" offset={[0, -49]}>
                🩸 {route.destinationName || "Source Facility"}
              </Tooltip>
              <Popup>
                <div style={{ padding: "4px 2px", fontSize: "13px", minWidth: "160px" }}>
                  <b style={{ color: "#dc2626", display: "block", marginBottom: "4px" }}>🩸 Blood Source</b>
                  <span style={{ color: "#334155", fontSize: "12px" }}>{route.destinationName || "Source Facility"}</span>
                  {route.distanceDisplay && (
                    <div style={{ marginTop: "5px", fontSize: "12px" }}>
                      <span style={{ color: "#64748b" }}>Road: </span>
                      <strong style={{ color: "#2563eb" }}>{route.distanceDisplay}</strong>
                    </div>
                  )}
                  {route.durationText && route.durationText !== "Road route unavailable" && (
                    <div style={{ fontSize: "12px" }}>
                      <span style={{ color: "#64748b" }}>ETA: </span>
                      <strong style={{ color: "#059669" }}>{route.durationText}</strong>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ) : null;
        })()}
      </MapContainer>
    </div>
  );
}
