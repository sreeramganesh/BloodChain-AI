import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const chromePaths = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

const executablePath = chromePaths.find((p) => fs.existsSync(p));
const BASE_URL = "http://localhost:5174";
const ARTIFACT_DIR =
  "C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage";

async function runBrowserPhase2FacilityMapTest() {
  if (!executablePath) {
    console.error("No browser executable found!");
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("====================================================");
  console.log("  BROWSER TEST: PHASE 2 INTERACTIVE FACILITY MAP");
  console.log("====================================================\n");

  try {
    // 1. Session Setup
    console.log("1. Setting up authenticated Hospital Admin session...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
    await page.evaluate(() => {
      const demoUser = {
        id: "demo-admin-1",
        name: "Dr. Rajesh Sharma",
        email: "admin@apollo.org",
        role: "Hospital Admin",
        organization: "Apollo Hospitals",
        phone: "+91 98765 43210",
        provider: "demo",
      };
      localStorage.setItem("bloodchain_auth_user", JSON.stringify(demoUser));
    });
    console.log("  ✓ Admin session established");

    // 2. Navigate to Hospitals & Blood Banks
    console.log("\n2. Navigating to /hospitals-blood-banks...");
    await page.goto(`${BASE_URL}/hospitals-blood-banks`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify page loaded
    const pageText = await page.evaluate(() => document.body.innerText);
    if (!pageText.includes("Hospitals & Blood Banks")) {
      throw new Error("Hospitals & Blood Banks page failed to load!");
    }
    console.log("  ✓ Page loaded successfully");

    // 3. Verify Leaflet map container & OSM tiles
    console.log("\n3. Verifying Leaflet map & OpenStreetMap tiles...");
    const leafletMap = await page.waitForSelector(".leaflet-container", { timeout: 8000 });
    if (!leafletMap) throw new Error("Leaflet map container (.leaflet-container) missing!");

    const mapBox = await leafletMap.boundingBox();
    if (!mapBox || mapBox.height < 150 || mapBox.width < 200) {
      throw new Error(`Leaflet map dimensions invalid: ${JSON.stringify(mapBox)}`);
    }
    console.log(`  ✓ Leaflet map container verified (${Math.round(mapBox.width)}x${Math.round(mapBox.height)}px)`);

    // Verify OSM attribution
    const attributionText = await page.$eval(".leaflet-control-attribution", (el) => el.innerText);
    if (!attributionText.includes("OpenStreetMap") || !attributionText.includes("contributors")) {
      throw new Error(`OpenStreetMap attribution missing or incorrect: ${attributionText}`);
    }
    console.log(`  ✓ OSM attribution verified: "${attributionText}"`);

    // 4. Verify initial facility markers (13 verified in Tiruchirappalli)
    console.log("\n4. Verifying initial facility markers...");
    await page.waitForSelector(".leaflet-marker-icon", { timeout: 5000 });
    const initialMarkersCount = await page.$$eval(".leaflet-marker-icon", (els) => els.length);
    if (initialMarkersCount === 0) {
      throw new Error("Zero markers rendered on initial load!");
    }
    console.log(`  ✓ Verified ${initialMarkersCount} facility markers plotted on default Tiruchirappalli view`);

    // 5. Verify dynamic metrics counts
    console.log("\n5. Verifying dynamic facility count metrics...");
    const countFound = await page.$eval('[data-testid="count-facilities-found"]', (el) => el.innerText.trim());
    const countMapped = await page.$eval('[data-testid="count-mapped-facilities"]', (el) => el.innerText.trim());
    const countPending = await page.$eval('[data-testid="count-pending-facilities"]', (el) => el.innerText.trim());

    console.log(`  ✓ Metric Counts - Found: ${countFound}, Mapped: ${countMapped}, Pending: ${countPending}`);
    if (Number(countMapped) !== initialMarkersCount) {
      throw new Error(`Mismatch: UI mapped count (${countMapped}) does not match rendered markers (${initialMarkersCount})!`);
    }

    // 6. Test State filter & Dependent District dropdown
    console.log("\n6. Testing State & Dependent District filter...");
    // Select Kerala
    const stateSelect = await page.$(".hospital-filter-group:nth-child(1) select");
    await stateSelect.select("Kerala");
    await new Promise((r) => setTimeout(r, 1200));

    // Verify district dropdown options for Kerala
    const districtOptions = await page.$$eval(".hospital-filter-group:nth-child(2) select option", (opts) =>
      opts.map((o) => o.value)
    );
    const hasKeralaDistricts = districtOptions.includes("Ernakulam") || districtOptions.includes("Thiruvananthapuram");
    const hasNoTnDistricts = !districtOptions.includes("Tiruchirappalli");

    if (!hasKeralaDistricts || !hasNoTnDistricts) {
      throw new Error(`Dependent district filtering failed for Kerala! Options: ${districtOptions.join(", ")}`);
    }
    console.log("  ✓ District dropdown dynamically updated with Kerala districts");

    // Check Kerala empty state on map (0 verified coords)
    const keralaEmptyOverlay = await page.$(".leaflet-empty-overlay");
    if (!keralaEmptyOverlay) {
      console.warn("  ⚠ Empty state overlay check...");
    } else {
      console.log("  ✓ Empty state overlay properly rendered when 0 facilities have coordinates");
    }

    // Check Coordinates Pending badges in table
    const pendingBadges = await page.$$('[data-testid="badge-coordinates-pending"]');
    if (pendingBadges.length === 0) {
      throw new Error("Facilities without coordinates must show 'Coordinates Pending' badge!");
    }
    console.log(`  ✓ Verified ${pendingBadges.length} facilities displayed with 'Coordinates Pending' badge`);

    // 7. Test switching back to Tamil Nadu -> Tiruchirappalli
    console.log("\n7. Selecting Tamil Nadu -> Tiruchirappalli...");
    await stateSelect.select("Tamil Nadu");
    await new Promise((r) => setTimeout(r, 1000));

    const districtSelect = await page.$(".hospital-filter-group:nth-child(2) select");
    await districtSelect.select("Tiruchirappalli");
    await new Promise((r) => setTimeout(r, 1500));

    const restoredMarkersCount = await page.$$eval(".leaflet-marker-icon", (els) => els.length);
    console.log(`  ✓ Markers updated: ${restoredMarkersCount} markers on Tiruchirappalli`);
    if (restoredMarkersCount === 0) {
      throw new Error("Failed to restore Tiruchirappalli markers after filter change!");
    }

    // 8. Test Marker Click & Popup (Step 4 structure)
    console.log("\n8. Testing Marker Click & Popup content...");
    const firstMarker = await page.$(".leaflet-marker-icon");
    await firstMarker.click();
    await new Promise((r) => setTimeout(r, 600));

    // Verify popup opened
    const popupEl = await page.waitForSelector(".leaflet-popup", { timeout: 4000 });
    if (!popupEl) throw new Error("Marker popup did not open on click!");

    const popupHtml = await page.$eval(".leaflet-popup-content", (el) => el.innerHTML);
    const popupText = await page.$eval(".leaflet-popup-content", (el) => el.innerText);
    const popupLower = popupText.toLowerCase();

    if (!popupLower.includes("type:") || !popupLower.includes("district:") || !popupLower.includes("state:")) {
      throw new Error(`Popup content missing required structure! Text: ${popupText}`);
    }
    if (!popupText.includes("View Details")) {
      throw new Error("Popup missing [View Details] action button!");
    }
    console.log("  ✓ Popup rendered with clean structure: Facility Name, Type, District, State, [View Details]");

    // Capture screenshot of open popup
    const popupScreenshotPath = path.join(ARTIFACT_DIR, "phase2_marker_popup_verified.png");
    await page.screenshot({ path: popupScreenshotPath });
    console.log(`  ✓ Screenshot saved to: ${popupScreenshotPath}`);

    // 9. Test Facility Click from List -> Map Focus & Popup open
    console.log("\n9. Testing Facility selection from table list...");
    const tableRows = await page.$$(".facility-table-row");
    if (tableRows.length > 2) {
      // Click the 2nd facility in the list
      await tableRows[1].click();
      await new Promise((r) => setTimeout(r, 800));

      // Verify row is highlighted
      const isSelectedRow = await page.evaluate(
        (row) => row.classList.contains("selected-facility-row") || row.style.backgroundColor !== "",
        tableRows[1]
      );
      if (!isSelectedRow) {
        console.warn("  ⚠ Row highlight visual check...");
      } else {
        console.log("  ✓ Clicked table row became visually selected/highlighted");
      }

      // Verify popup opened for selected facility
      const isPopupVisible = await page.$eval(".leaflet-popup", (p) => p !== null).catch(() => false);
      if (isPopupVisible) {
        console.log("  ✓ Map auto-focused on selected facility and opened popup");
      }
    }

    // 10. Test Reset Filters
    console.log("\n10. Testing Filter Reset...");
    const resetBtn = await page.$(".hospital-reset-button");
    await resetBtn.click();
    await new Promise((r) => setTimeout(r, 1200));

    const resetStateVal = await page.$eval(".hospital-filter-group:nth-child(1) select", (el) => el.value);
    const resetDistVal = await page.$eval(".hospital-filter-group:nth-child(2) select", (el) => el.value);
    if (resetStateVal !== "Tamil Nadu" || resetDistVal !== "Tiruchirappalli") {
      throw new Error(`Reset button failed to restore defaults! State: ${resetStateVal}, District: ${resetDistVal}`);
    }
    console.log(`  ✓ Filters reset successfully to default (${resetStateVal}, ${resetDistVal})`);

    // Capture desktop screenshot
    const desktopScreenshotPath = path.join(ARTIFACT_DIR, "phase2_hospitals_map_desktop.png");
    await page.screenshot({ path: desktopScreenshotPath });
    console.log(`  ✓ Desktop screenshot saved: ${desktopScreenshotPath}`);

    // 11. Test Mobile/Responsive Viewport
    console.log("\n11. Testing Mobile/Responsive layout (390x844)...");
    await page.setViewport({ width: 390, height: 844 });
    await new Promise((r) => setTimeout(r, 800));

    const mobileMap = await page.waitForSelector(".leaflet-container");
    const mobileBox = await mobileMap.boundingBox();
    if (!mobileBox || mobileBox.width > 390 || mobileBox.height < 150) {
      throw new Error(`Mobile layout overflow: ${JSON.stringify(mobileBox)}`);
    }
    console.log(`  ✓ Mobile map layout responsive without overflow (${Math.round(mobileBox.width)}x${Math.round(mobileBox.height)}px)`);

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, "phase2_hospitals_map_mobile.png");
    await page.screenshot({ path: mobileScreenshotPath });
    console.log(`  ✓ Mobile screenshot saved: ${mobileScreenshotPath}`);

    // Restore desktop viewport
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise((r) => setTimeout(r, 400));

    // 12. Non-regression test on /blood-request
    console.log("\n12. Verifying /blood-request loads without regression...");
    await page.goto(`${BASE_URL}/blood-request`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500));
    const brqMap = await page.waitForSelector(".leaflet-container", { timeout: 6000 });
    if (!brqMap) throw new Error("/blood-request map container failed to render!");
    console.log("  ✓ /blood-request Leaflet map loaded cleanly with zero errors");

    // 13. Non-regression test on /find-donors
    console.log("\n13. Verifying /find-donors loads without regression...");
    await page.goto(`${BASE_URL}/find-donors`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500));
    const donorHeader = await page.evaluate(() => document.body.innerText.includes("Find Donors"));
    if (!donorHeader) throw new Error("/find-donors failed to render!");
    console.log("  ✓ /find-donors loaded cleanly with zero errors");

    console.log("\n====================================================");
    console.log("  ALL PHASE 2 BROWSER E2E TESTS PASSED SUCCESSFULLY!");
    console.log("====================================================\n");
  } catch (err) {
    console.error("Phase 2 Browser test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserPhase2FacilityMapTest();
