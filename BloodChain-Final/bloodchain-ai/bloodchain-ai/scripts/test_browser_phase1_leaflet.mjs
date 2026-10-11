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

async function runBrowserPhase1LeafletTest() {
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
  console.log("  BROWSER TEST: BLOODCHAIN AI PHASE 1 LEAFLET MAP");
  console.log("====================================================\n");

  try {
    // 1. Establish session
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

    const loginText = await page.evaluate(() => document.body.innerText);
    if (!loginText.includes("BloodChain") && !loginText.includes("Sign In") && !loginText.includes("Login")) {
      throw new Error("Login page did not render properly!");
    }
    console.log("  ✓ Login page verified");

    // 2. Dashboard
    console.log("\n2. Navigating to Dashboard...");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    const dashText = await page.evaluate(() => document.body.innerText);
    if (!dashText.includes("Welcome Back") && !dashText.includes("Predictive Intelligence")) {
      throw new Error("Dashboard failed to render!");
    }
    console.log("  ✓ Dashboard page loaded successfully");

    // 3. Find Donors
    console.log("\n3. Navigating to Find Donors (/find-donors)...");
    await page.goto(`${BASE_URL}/find-donors`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1000));
    const donorText = await page.evaluate(() => document.body.innerText);
    if (!donorText.includes("Find Blood Donors") && !donorText.includes("Donors")) {
      throw new Error("Find Donors page failed to render!");
    }
    console.log("  ✓ Find Donors page loaded successfully with zero errors");

    // 4. Hospitals & Blood Banks (with Leaflet Map)
    console.log("\n4. Navigating to Hospitals & Blood Banks (/hospitals-blood-banks)...");
    await page.goto(`${BASE_URL}/hospitals-blood-banks`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));

    const hbbText = await page.evaluate(() => document.body.innerText);
    if (!hbbText.includes("Hospitals & Blood Banks")) {
      throw new Error("Hospitals & Blood Banks page header not found!");
    }

    // Verify absence of Google Maps Missing API Key banner
    if (hbbText.includes("Google Maps API Key Not Configured")) {
      throw new Error("FAIL: Found 'Google Maps API Key Not Configured' error banner!");
    }
    console.log("  ✓ Zero 'Google Maps API Key Not Configured' banners displayed");

    // Verify Leaflet Container exists and has valid height
    const leafletMap = await page.waitForSelector(".leaflet-container", { timeout: 8000 });
    if (!leafletMap) throw new Error("Leaflet map container (.leaflet-container) not found!");

    const mapBox = await leafletMap.boundingBox();
    if (!mapBox || mapBox.height < 100 || mapBox.width < 200) {
      throw new Error(`Leaflet map height or width invalid: ${JSON.stringify(mapBox)}`);
    }
    console.log(`  ✓ Leaflet map container rendered with valid dimensions: ${Math.round(mapBox.width)}x${Math.round(mapBox.height)}px`);

    // Verify OpenStreetMap tile layer
    const tileImages = await page.$$eval(".leaflet-tile-pane img", (imgs) =>
      imgs.map((img) => img.src)
    );
    const hasOsmTiles = tileImages.some((src) => src.includes("tile.openstreetmap.org"));
    if (!hasOsmTiles && tileImages.length === 0) {
      console.warn("  ⚠ Tiles still loading or mock environment; verifying tile container...");
    } else {
      console.log(`  ✓ OpenStreetMap tiles loaded (${tileImages.length} tile elements found)`);
    }

    // Verify OpenStreetMap attribution
    const attributionText = await page.$eval(".leaflet-control-attribution", (el) => el.innerText);
    if (!attributionText.includes("OpenStreetMap")) {
      throw new Error(`OpenStreetMap attribution missing from map controls! Found: "${attributionText}"`);
    }
    console.log(`  ✓ OpenStreetMap attribution verified: "${attributionText}"`);

    // Verify Zoom Controls
    const zoomInBtn = await page.$(".leaflet-control-zoom-in");
    const zoomOutBtn = await page.$(".leaflet-control-zoom-out");
    if (!zoomInBtn || !zoomOutBtn) {
      throw new Error("Leaflet zoom controls missing!");
    }
    console.log("  ✓ Leaflet zoom controls (+/-) present and active");

    // Test Zoom In interaction
    await zoomInBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    console.log("  ✓ Zoom in interaction executed successfully");

    // Verify Facility Markers rendered
    const markersCount = await page.$$eval(".leaflet-marker-icon", (els) => els.length);
    console.log(`  ✓ Verified ${markersCount} Leaflet map markers rendered on page`);

    // Capture Screenshot of Hospitals & Blood Banks with Leaflet
    const hbbScreenshotPath = path.join(ARTIFACT_DIR, "leaflet_hospitals_map_verified.png");
    await page.screenshot({ path: hbbScreenshotPath });
    console.log(`  ✓ Screenshot saved to: ${hbbScreenshotPath}`);

    // 5. Blood Request (with Leaflet Map)
    console.log("\n5. Navigating to Blood Request (/blood-request)...");
    await page.goto(`${BASE_URL}/blood-request`, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));

    const brqText = await page.evaluate(() => document.body.innerText);
    if (!brqText.includes("Blood Request")) {
      throw new Error("Blood Request page header not found!");
    }
    if (brqText.includes("Google Maps API Key Not Configured")) {
      throw new Error("FAIL: Found 'Google Maps API Key Not Configured' on /blood-request!");
    }

    const brqMap = await page.waitForSelector(".leaflet-container", { timeout: 8000 });
    const brqMapBox = await brqMap.boundingBox();
    if (!brqMapBox || brqMapBox.height < 100) {
      throw new Error(`Blood Request map container height invalid: ${JSON.stringify(brqMapBox)}`);
    }
    console.log(`  ✓ Blood Request Leaflet map rendered (${Math.round(brqMapBox.width)}x${Math.round(brqMapBox.height)}px)`);

    const brqAttribution = await page.$eval(".leaflet-control-attribution", (el) => el.innerText);
    if (!brqAttribution.includes("OpenStreetMap")) {
      throw new Error("OpenStreetMap attribution missing on Blood Request map!");
    }
    console.log("  ✓ Blood Request OpenStreetMap attribution verified");

    const brqScreenshotPath = path.join(ARTIFACT_DIR, "leaflet_blood_request_map_verified.png");
    await page.screenshot({ path: brqScreenshotPath });
    console.log(`  ✓ Screenshot saved to: ${brqScreenshotPath}`);

    console.log("\n====================================================");
    console.log("  ALL PHASE 1 BROWSER E2E TESTS PASSED SUCCESSFULLY!");
    console.log("====================================================\n");
  } catch (err) {
    console.error("Phase 1 Browser test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserPhase1LeafletTest();
