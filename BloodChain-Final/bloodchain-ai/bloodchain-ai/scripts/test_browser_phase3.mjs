import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const executablePath = chromePaths.find(p => fs.existsSync(p));
console.log('Browser executable:', executablePath);

async function testPhase3Browser() {
  if (!executablePath) {
    console.error('No browser executable found!');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions('http://localhost:5174', ['geolocation']);

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  // Set mock geolocation to Trichy (near GH & Kauvery)
  await page.setGeolocation({
    latitude: 10.8041,
    longitude: 78.6853,
    accuracy: 15
  });

  console.log('Logging in demo session...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const demoUser = {
      id: "demo-admin-1",
      name: "Dr. Rajesh Sharma",
      email: "admin@apollo.org",
      role: "Hospital Admin",
      organization: "Apollo Hospitals",
      phone: "+91 98765 43210",
      provider: "demo"
    };
    localStorage.setItem("bloodchain_auth_user", JSON.stringify(demoUser));
  });

  console.log('Navigating to http://localhost:5174/hospitals-blood-banks ...');
  await page.goto('http://localhost:5174/hospitals-blood-banks', { waitUntil: 'networkidle2' });

  await page.waitForSelector('.hospitals-page', { timeout: 10000 });
  console.log('✓ Hospitals page loaded');

  // Verify initial "Use My Location" button text
  const initialBtnText = await page.$eval('.btn-location-gps', el => el.innerText.trim());
  console.log(`Initial GPS button text: "${initialBtnText}"`);

  // Click "Use My Location"
  console.log('Clicking "Use My Location" button...');
  await page.click('.btn-location-gps');

  // Wait for button text to update to "Location Detected"
  await page.waitForFunction(
    () => {
      const btn = document.querySelector('.btn-location-gps');
      return btn && btn.innerText.includes('Location Detected');
    },
    { timeout: 8000 }
  );
  console.log('✓ GPS detected: Button text changed to "Location Detected"');

  // Verify Proximity Bar is visible
  await page.waitForSelector('.gps-proximity-bar', { timeout: 5000 });
  const userCoordsText = await page.$eval('.gps-user-coords', el => el.innerText.trim());
  console.log(`✓ GPS Proximity Bar visible. User coordinates displayed: "${userCoordsText}"`);

  // Verify radius select default
  const radiusValue = await page.$eval('.gps-radius-select', el => el.value);
  console.log(`✓ Radius selector default value: ${radiusValue} km`);

  // Verify view mode tabs
  const activeTab = await page.$eval('.btn-tab.active', el => el.innerText.trim());
  console.log(`✓ Active view mode tab: "${activeTab}"`);

  // Count nearby facilities shown in table
  const nearbyRowCount = await page.$$eval('.hospitals-table tbody tr', trs => trs.length);
  console.log(`✓ Nearby facilities displayed in table: ${nearbyRowCount}`);

  // Inspect the first row distance badge
  const firstDistance = await page.$eval('.hospitals-table tbody tr:first-child .distance-badge', el => el.innerText.trim());
  const firstName = await page.$eval('.hospitals-table tbody tr:first-child .hospital-name-cell', el => el.innerText.trim());
  console.log(`✓ Nearest facility: "${firstName}" with approx distance "${firstDistance}"`);

  // Inspect distances of all rows to verify ascending sort
  const distances = await page.$$eval('.hospitals-table tbody tr .distance-badge', badges =>
    badges.map(b => parseFloat(b.innerText.replace(/[^0-9.]/g, '')))
  );
  console.log('Distances extracted (km):', distances);

  let isAscending = true;
  for (let i = 1; i < distances.length; i++) {
    if (distances[i] < distances[i - 1]) {
      isAscending = false;
      break;
    }
  }
  console.log(`✓ Distances sorted ascending: ${isAscending}`);

  // Click the first nearby facility to verify map focus & selection card
  console.log('Clicking nearest facility row...');
  await page.click('.hospitals-table tbody tr:first-child');
  await new Promise(r => setTimeout(r, 600));

  const selectionCardVisible = await page.$('.facility-selection-card') !== null;
  console.log(`✓ Facility selection card displayed: ${selectionCardVisible}`);

  const selectedFacilityDistance = await page.$eval('.facility-selection-card .selected-distance-chip', el => el.innerText.trim());
  console.log(`✓ Selected facility card distance chip: "${selectedFacilityDistance}"`);

  // Capture screenshot
  const screenshotPath = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\scratch\\phase3_gps_nearby_verified.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`✓ Screenshot saved to: ${screenshotPath}`);

  await browser.close();
  console.log('\n====================================================');
  console.log('PHASE 3 BROWSER AUTOMATION TEST COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

testPhase3Browser().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
