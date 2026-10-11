/**
 * ====================================================================
 * BLOODCHAIN AI — PHASE 4 UNIT TESTS
 * OSRM Road Routing Service
 *
 * Test Coverage:
 * 1. formatRoadDistance — meters to display string
 * 2. formatDuration — seconds/minutes to human-readable text
 * 3. isValidCoordinate — coordinate validation
 * 4. osrmGeoJsonToLeaflet — GeoJSON [lng,lat] → Leaflet {lat,lng}
 * 5. getCacheKey — consistent key generation (via getRouteCacheSize)
 * 6. getRoute — success, failure, cache, invalid inputs (mocked fetch)
 * 7. getBatchRoutes — shortlist limiting, route attachment
 * 8. clearRouteCache / getRouteCacheSize
 * ====================================================================
 */

import {
  formatRoadDistance,
  formatDuration,
  isValidCoordinate,
  getRoute,
  getBatchRoutes,
  clearRouteCache,
  getRouteCacheSize,
  MAX_ROUTE_CANDIDATES,
} from "../services/routesService.js";

// ---- Helpers ----

function makeOsrmResponse(distanceM, durationS, coords = []) {
  return {
    code: "Ok",
    routes: [
      {
        distance: distanceM,
        duration: durationS,
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      },
    ],
    waypoints: [],
  };
}

// Wrap global.fetch so we can mock it per-test
let _fetchMock = null;
const originalFetch = global.fetch;

beforeEach(() => {
  clearRouteCache();
  _fetchMock = null;
  global.fetch = (...args) => {
    if (typeof _fetchMock === "function") return _fetchMock(...args);
    // Default: network error
    return Promise.reject(new Error("fetch not mocked"));
  };
});

afterAll(() => {
  global.fetch = originalFetch;
});

// ============================================================
// SECTION 1: formatRoadDistance
// ============================================================
describe("formatRoadDistance", () => {
  test("returns meters string for values < 1000", () => {
    expect(formatRoadDistance(850)).toBe("850 m");
    expect(formatRoadDistance(0)).toBe("0 m");
  });

  test("returns km string for values >= 1000 (1 decimal)", () => {
    expect(formatRoadDistance(1000)).toBe("1.0 km");
    // 12450m / 1000 = 12.45 → toFixed(1) = "12.4" (round-half-even)
    expect(formatRoadDistance(12450)).toBe("12.4 km");
    expect(formatRoadDistance(5500)).toBe("5.5 km");
    // Verify large value
    expect(formatRoadDistance(100000)).toBe("100.0 km");
  });

  test("returns N/A for null, undefined, NaN", () => {
    expect(formatRoadDistance(null)).toBe("N/A");
    expect(formatRoadDistance(undefined)).toBe("N/A");
    expect(formatRoadDistance(NaN)).toBe("N/A");
  });
});

// ============================================================
// SECTION 2: formatDuration
// ============================================================
describe("formatDuration (seconds input)", () => {
  test("< 60 min — returns X min", () => {
    expect(formatDuration(900)).toBe("15 min");
    expect(formatDuration(2040)).toBe("34 min");
    expect(formatDuration(59 * 60)).toBe("59 min");
  });

  test("exactly 60 min — returns 1 hr", () => {
    expect(formatDuration(3600)).toBe("1 hr");
  });

  test("> 60 min — returns X hr Y min", () => {
    expect(formatDuration(4320)).toBe("1 hr 12 min");
    expect(formatDuration(7500)).toBe("2 hr 5 min");
  });

  test("handles string seconds with trailing s", () => {
    expect(formatDuration("900s")).toBe("15 min");
  });

  test("returns N/A for null/undefined", () => {
    expect(formatDuration(null)).toBe("N/A");
    expect(formatDuration(undefined)).toBe("N/A");
  });

  test("isMinutes=true mode", () => {
    expect(formatDuration(34, true)).toBe("34 min");
    expect(formatDuration(90, true)).toBe("1 hr 30 min");
    expect(formatDuration(60, true)).toBe("1 hr");
  });
});

// ============================================================
// SECTION 3: isValidCoordinate
// ============================================================
describe("isValidCoordinate", () => {
  test("accepts {latitude, longitude}", () => {
    expect(isValidCoordinate({ latitude: 10.79, longitude: 78.70 })).toBe(true);
  });

  test("accepts {lat, lng}", () => {
    expect(isValidCoordinate({ lat: 13.08, lng: 80.27 })).toBe(true);
  });

  test("rejects zero coordinates", () => {
    expect(isValidCoordinate({ lat: 0, lng: 0 })).toBe(false);
    expect(isValidCoordinate({ latitude: 0, longitude: 78.7 })).toBe(false);
  });

  test("rejects NaN", () => {
    expect(isValidCoordinate({ lat: NaN, lng: 78.7 })).toBe(false);
  });

  test("rejects out-of-range latitude", () => {
    expect(isValidCoordinate({ lat: 95, lng: 78.7 })).toBe(false);
    expect(isValidCoordinate({ lat: -91, lng: 78.7 })).toBe(false);
  });

  test("rejects null/undefined", () => {
    expect(isValidCoordinate(null)).toBe(false);
    expect(isValidCoordinate(undefined)).toBe(false);
  });
});

// ============================================================
// SECTION 4: osrmGeoJsonToLeaflet (via getRoute coordinate output)
// ============================================================
describe("OSRM GeoJSON to Leaflet coordinate conversion", () => {
  test("converts [lng, lat] pairs to {lat, lng} objects", async () => {
    const mockCoords = [
      [78.7047, 10.7905],
      [78.8001, 10.9080],
    ];
    _fetchMock = () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(15000, 1200, mockCoords)),
      });

    const result = await getRoute(
      { lat: 10.7905, lng: 78.7047 },
      { lat: 10.908, lng: 78.8001 }
    );

    expect(result.status).toBe("success");
    expect(Array.isArray(result.coordinates)).toBe(true);
    expect(result.coordinates.length).toBe(2);

    // Leaflet format: {lat, lng}
    expect(result.coordinates[0]).toHaveProperty("lat");
    expect(result.coordinates[0]).toHaveProperty("lng");

    // First point: GeoJSON [lng=78.7047, lat=10.7905] → Leaflet {lat: 10.7905, lng: 78.7047}
    expect(result.coordinates[0].lat).toBeCloseTo(10.7905, 3);
    expect(result.coordinates[0].lng).toBeCloseTo(78.7047, 3);

    // Second point: GeoJSON [lng=78.8001, lat=10.9080] → Leaflet {lat: 10.9080, lng: 78.8001}
    expect(result.coordinates[1].lat).toBeCloseTo(10.908, 3);
    expect(result.coordinates[1].lng).toBeCloseTo(78.8001, 3);
  });
});

// ============================================================
// SECTION 5: getRoute — Success Path
// ============================================================
describe("getRoute — success", () => {
  test("returns success result with correct fields", async () => {
    _fetchMock = () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            makeOsrmResponse(12450, 2040, [
              [78.7047, 10.7905],
              [78.8, 10.85],
            ])
          ),
      });

    const result = await getRoute(
      { lat: 10.7905, lng: 78.7047 },
      { lat: 10.85, lng: 78.8 }
    );

    expect(result.status).toBe("success");
    expect(result.success).toBe(true);
    expect(result.distanceMeters).toBe(12450);
    // 12450 / 1000 = 12.45 → Math.round(12.45 * 10) / 10 = Math.round(124.5) / 10
    // In JS: Math.round(124.5) = 125 → 12.5
    expect(result.distanceKm).toBe(12.5);
    // formatRoadDistance(12450): 12450/1000 = 12.45 → toFixed(1) = "12.4" (round-half-even)
    expect(result.distanceDisplay).toBe("12.4 km");
    expect(result.durationSeconds).toBe(2040);
    expect(result.durationMinutes).toBe(34);
    expect(result.durationText).toBe("34 min");
    expect(result.source).toBe("osrm");
    expect(result.provider).toBe("OSRM");
    expect(result.encodedPolyline).toBeNull(); // OSRM returns GeoJSON, not encoded polyline
    expect(result.coordinates.length).toBe(2);
  });

  test("uses OSRM lng,lat coordinate order in URL", async () => {
    let capturedUrl = "";
    _fetchMock = (url) => {
      capturedUrl = url;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(5000, 600, [[80.27, 13.08]])),
      });
    };

    await getRoute({ lat: 13.0827, lng: 80.2707 }, { lat: 10.7905, lng: 78.7047 });

    // OSRM URL must be: /lng,lat;lng,lat format
    expect(capturedUrl).toContain("router.project-osrm.org");
    // Origin: lng=80.2707, lat=13.0827
    expect(capturedUrl).toContain("80.270700,13.082700");
    // Destination: lng=78.7047, lat=10.7905
    expect(capturedUrl).toContain("78.704700,10.790500");
  });
});

// ============================================================
// SECTION 6: getRoute — Failure Paths
// ============================================================
describe("getRoute — failure graceful fallback", () => {
  test("returns unavailable on HTTP error — no invented distances", async () => {
    _fetchMock = () =>
      Promise.resolve({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Too Many Requests"),
      });

    const result = await getRoute(
      { lat: 10.7905, lng: 78.7047 },
      { lat: 10.85, lng: 78.8 }
    );

    expect(result.status).toBe("unavailable");
    expect(result.success).toBe(false);
    expect(result.distanceKm).toBeNull();
    expect(result.durationMinutes).toBeNull();
    // straightLineKm is computed via Haversine (real math, not fake)
    expect(typeof result.straightLineKm).toBe("number");
    expect(result.straightLineKm).toBeGreaterThan(0);
  });

  test("returns no_route on OSRM code !== Ok", async () => {
    _fetchMock = () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ code: "NoRoute", routes: [], waypoints: [] }),
      });

    const result = await getRoute(
      { lat: 10.7905, lng: 78.7047 },
      { lat: 10.85, lng: 78.8 }
    );

    expect(result.status).toBe("no_route");
    expect(result.success).toBe(false);
    expect(result.distanceKm).toBeNull();
  });

  test("returns unavailable on network error", async () => {
    _fetchMock = () => Promise.reject(new Error("Network failure"));

    const result = await getRoute(
      { lat: 10.7905, lng: 78.7047 },
      { lat: 10.85, lng: 78.8 }
    );

    expect(result.status).toBe("unavailable");
    expect(result.success).toBe(false);
    expect(result.distanceKm).toBeNull();
  });

  test("returns unavailable for invalid origin", async () => {
    const result = await getRoute(null, { lat: 10.85, lng: 78.8 });

    expect(result.status).toBe("unavailable");
    expect(result.success).toBe(false);
  });

  test("returns unavailable for zero coordinates", async () => {
    const result = await getRoute(
      { lat: 0, lng: 0 },
      { lat: 10.85, lng: 78.8 }
    );

    expect(result.status).toBe("unavailable");
    expect(result.success).toBe(false);
  });

  test("never invents distance text — distanceDisplay is N/A or straight-line on failure", async () => {
    _fetchMock = () => Promise.reject(new Error("Offline"));

    const result = await getRoute(
      { lat: 10.7905, lng: 78.7047 },
      { lat: 10.85, lng: 78.8 }
    );

    // distanceDisplay should say "straight-line" or similar — NOT a road distance
    expect(result.distanceDisplay).toContain("Straight-line");
    expect(result.durationText).toBe("Road route unavailable");
  });
});

// ============================================================
// SECTION 7: Route Caching
// ============================================================
describe("Route caching", () => {
  test("caches result — second call skips fetch", async () => {
    let fetchCount = 0;
    _fetchMock = () => {
      fetchCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(5000, 600, [[78.7, 10.79]])),
      });
    };

    const o = { lat: 10.79, lng: 78.70 };
    const d = { lat: 10.85, lng: 78.80 };

    const r1 = await getRoute(o, d);
    const r2 = await getRoute(o, d); // should be cached

    expect(fetchCount).toBe(1); // only one real fetch
    expect(r2.fromCache).toBe(true);
    expect(r1.status).toBe("success");
    expect(r2.status).toBe("success");
  });

  test("bypassCache=true re-fetches", async () => {
    let fetchCount = 0;
    _fetchMock = () => {
      fetchCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(5000, 600, [])),
      });
    };

    const o = { lat: 10.79, lng: 78.70 };
    const d = { lat: 10.85, lng: 78.80 };

    await getRoute(o, d);
    await getRoute(o, d, { bypassCache: true });

    expect(fetchCount).toBe(2);
  });

  test("clearRouteCache clears all cached routes", async () => {
    _fetchMock = () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(3000, 400, [])),
      });

    await getRoute({ lat: 10.79, lng: 78.70 }, { lat: 10.85, lng: 78.80 });
    expect(getRouteCacheSize()).toBe(1);

    clearRouteCache();
    expect(getRouteCacheSize()).toBe(0);
  });

  test("cache keys are coordinate-rounded (4 decimals)", async () => {
    let fetchCount = 0;
    _fetchMock = () => {
      fetchCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(3000, 400, [])),
      });
    };

    // Two origin points that differ only at the 5th decimal → same cache key
    await getRoute({ lat: 10.79051, lng: 78.70471 }, { lat: 10.85, lng: 78.80 });
    await getRoute({ lat: 10.79054, lng: 78.70474 }, { lat: 10.85, lng: 78.80 });

    expect(fetchCount).toBe(1); // rounded to 4dp → same key, cache hit
  });
});

// ============================================================
// SECTION 8: getBatchRoutes
// ============================================================
describe("getBatchRoutes", () => {
  test("routes up to MAX_ROUTE_CANDIDATES (5) candidates", async () => {
    let fetchCount = 0;
    _fetchMock = () => {
      fetchCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(8000, 900, [[78.7, 10.8]])),
      });
    };

    const origin = { lat: 10.7905, lng: 78.7047 };
    const candidates = Array.from({ length: 8 }, (_, i) => ({
      facilityId: `fac-${i}`,
      facilityName: `Facility ${i}`,
      latitude: 10.8 + i * 0.01,
      longitude: 78.7 + i * 0.01,
    }));

    const results = await getBatchRoutes(origin, candidates);

    // Should have routed only the first 5
    expect(fetchCount).toBeLessThanOrEqual(MAX_ROUTE_CANDIDATES);
    expect(results.length).toBe(8); // All 8 returned
    // First 5 should have routeStatus
    expect(results[0].routeStatus).toBe("success");
    expect(results[4].routeStatus).toBe("success");
    // Last 3 (indices 5, 6, 7) should NOT have routeStatus set (not routed)
    expect(results[5].routeStatus).toBeUndefined();
  });

  test("candidates missing coordinates get unavailable status", async () => {
    _fetchMock = () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(3000, 400, [])),
      });

    const origin = { lat: 10.7905, lng: 78.7047 };
    const candidates = [
      { facilityId: "a", latitude: null, longitude: null },
      { facilityId: "b", latitude: 10.85, longitude: 78.80 },
    ];

    const results = await getBatchRoutes(origin, candidates);

    expect(results[0].routeStatus).toBe("unavailable");
    expect(results[0].roadDistanceKm).toBeNull();
    expect(results[1].routeStatus).toBe("success");
    expect(typeof results[1].roadDistanceKm).toBe("number");
  });

  test("returns candidates unchanged for invalid origin", async () => {
    const candidates = [{ facilityId: "x", latitude: 10.85, longitude: 78.8 }];
    const results = await getBatchRoutes(null, candidates);
    expect(results).toEqual(candidates);
  });

  test("empty candidates array returns empty array", async () => {
    const results = await getBatchRoutes({ lat: 10.79, lng: 78.70 }, []);
    expect(results).toEqual([]);
  });

  test("attaches roadDistanceKm and durationText to routed candidate", async () => {
    _fetchMock = () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(6200, 720, [[78.7, 10.79], [78.8, 10.85]])),
      });

    const results = await getBatchRoutes(
      { lat: 10.7905, lng: 78.7047 },
      [{ facilityId: "z", latitude: 10.85, longitude: 78.8 }]
    );

    expect(results[0].roadDistanceKm).toBe(6.2);
    expect(results[0].roadDistanceDisplay).toBe("6.2 km");
    expect(results[0].durationMinutes).toBe(12);
    expect(results[0].durationText).toBe("12 min");
    expect(results[0].routeCoordinates.length).toBe(2);
  });
});

// ============================================================
// SECTION 9: OSRM Coordinate Order Correctness
// ============================================================
describe("OSRM coordinate order strictness", () => {
  test("OSRM request uses longitude FIRST (GeoJSON order)", async () => {
    let capturedUrl = "";
    _fetchMock = (url) => {
      capturedUrl = url;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(3000, 300, [])),
      });
    };

    // Chennai: lat=13.0827, lng=80.2707
    // Trichy:  lat=10.7905, lng=78.7047
    await getRoute(
      { latitude: 13.0827, longitude: 80.2707 },
      { latitude: 10.7905, longitude: 78.7047 }
    );

    // OSRM format: {lng},{lat};{lng},{lat}
    // So origin should appear as "80.270700,13.082700" NOT "13.082700,80.270700"
    expect(capturedUrl).toMatch(/80\.270700,13\.082700;78\.704700,10\.790500/);
  });

  test("Leaflet coordinates output uses lat FIRST (Leaflet format)", async () => {
    _fetchMock = () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            makeOsrmResponse(5000, 600, [
              [80.2707, 13.0827], // GeoJSON: [lng, lat]
              [78.7047, 10.7905],
            ])
          ),
      });

    const result = await getRoute(
      { lat: 13.0827, lng: 80.2707 },
      { lat: 10.7905, lng: 78.7047 }
    );

    // Leaflet: {lat, lng}
    // First point: GeoJSON [lng=80.2707, lat=13.0827] → {lat:13.0827, lng:80.2707}
    expect(result.coordinates[0].lat).toBeCloseTo(13.0827, 3);
    expect(result.coordinates[0].lng).toBeCloseTo(80.2707, 3);
    // NOT inverted
    expect(result.coordinates[0].lat).not.toBeCloseTo(80.2707, 1);
  });
});

// ============================================================
// SECTION 10: Safety — No Fake Data
// ============================================================
describe("No fake data injection", () => {
  test("failure result has null distanceKm and durationMinutes", async () => {
    _fetchMock = () => Promise.reject(new Error("fail"));

    const result = await getRoute(
      { lat: 10.7905, lng: 78.7047 },
      { lat: 10.85, lng: 78.8 }
    );

    expect(result.distanceKm).toBeNull();
    expect(result.durationMinutes).toBeNull();
    expect(result.coordinates).toEqual([]);
  });

  test("success result has actual OSRM-returned values — not estimated", async () => {
    _fetchMock = () =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeOsrmResponse(99999, 99999, [])),
      });

    const result = await getRoute(
      { lat: 10.7905, lng: 78.7047 },
      { lat: 10.85, lng: 78.8 }
    );

    // Must use OSRM-returned values exactly
    expect(result.distanceMeters).toBe(99999);
    expect(result.distanceKm).toBe(100); // 99999/1000 = 99.999 → 100.0
    expect(result.durationSeconds).toBe(99999);
    expect(result.durationMinutes).toBe(1667); // round(99999/60)
  });
});
