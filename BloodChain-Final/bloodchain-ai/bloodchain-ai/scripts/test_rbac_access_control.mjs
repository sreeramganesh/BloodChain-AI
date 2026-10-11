import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const executablePath = chromePaths.find(p => fs.existsSync(p));
const BASE_URL = 'http://localhost:5173';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

const DEMO_USERS = {
  donor: {
    id: "demo-donor-1",
    name: "Priya Nair",
    email: "donor@bloodchain.ai",
    role: "donor",
    displayRole: "Donor / User",
    organization: "Community Blood Donor",
    phone: "+91 98111 22334",
    provider: "demo",
    authenticatedAt: new Date().toISOString()
  },
  hospital: {
    id: "demo-admin-1",
    name: "Dr. Rajesh Sharma",
    email: "admin@apollo.org",
    role: "hospital",
    displayRole: "Hospital Admin",
    organization: "Apollo Hospitals",
    phone: "+91 98765 43210",
    provider: "demo",
    authenticatedAt: new Date().toISOString()
  },
  bloodbank: {
    id: "demo-bloodbank-1",
    name: "Trichy Blood Bank Staff",
    email: "staff@bloodbank.org",
    role: "bloodbank",
    displayRole: "Blood Bank",
    organization: "Trichy Central Blood Bank",
    phone: "+91 98444 55667",
    provider: "demo",
    authenticatedAt: new Date().toISOString()
  }
};

async function runRBACTests() {
  if (!executablePath) {
    console.error('No browser executable found!');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  let nativeDialogCount = 0;
  page.on('dialog', async dialog => {
    nativeDialogCount++;
    console.error(`⚠️ UNEXPECTED NATIVE DIALOG: "${dialog.message()}"`);
    await dialog.dismiss();
  });

  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  const artifactDir = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  async function setSessionAs(roleKey) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    const userObj = DEMO_USERS[roleKey];
    await page.evaluate((u) => {
      localStorage.setItem("bloodchain_auth_user", JSON.stringify(u));
    }, userObj);
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
  }

  console.log("====================================================================");
  console.log("TESTING: ROLE-BASED ACCESS CONTROL (RBAC) END-TO-END");
  console.log("====================================================================\n");

  try {
    // ------------------------------------------------------------------
    // SUITE 1: DONOR ROLE VERIFICATION
    // ------------------------------------------------------------------
    console.log(">>> SUITE 1: DONOR ROLE VERIFICATION <<<\n");

    // 1.1 Authenticate as Donor
    console.log("1.1 Authenticating as Donor (donor@bloodchain.ai)...");
    await setSessionAs('donor');

    // Verify Dashboard reached
    assert(page.url().includes('/dashboard'), "Donor successfully navigated to /dashboard");

    // 1.2 Inspect Donor Sidebar Menu
    console.log("\n1.2 Verifying Donor Sidebar Menu items...");
    const donorSidebarItems = await page.$$eval('.sidebar-menu .sidebar-item span', items =>
      items.map(el => el.textContent.trim())
    );
    console.log("Donor Sidebar visible items:", donorSidebarItems);

    assert(donorSidebarItems.includes("Dashboard"), "Donor sidebar includes 'Dashboard'");
    assert(donorSidebarItems.includes("Find Donors"), "Donor sidebar includes 'Find Donors'");
    assert(donorSidebarItems.includes("My Donations"), "Donor sidebar includes 'My Donations'");
    assert(donorSidebarItems.includes("My Requests"), "Donor sidebar includes 'My Requests'");
    assert(donorSidebarItems.includes("Notifications"), "Donor sidebar includes 'Notifications'");

    // Verify HIDDEN items for Donor
    assert(!donorSidebarItems.includes("Blood Inventory"), "Donor sidebar HIDES 'Blood Inventory'");
    assert(!donorSidebarItems.includes("Blood Request"), "Donor sidebar HIDES 'Blood Request'");
    assert(!donorSidebarItems.includes("AI Recommendation"), "Donor sidebar HIDES 'AI Recommendation'");
    assert(!donorSidebarItems.includes("Approval & Transfer"), "Donor sidebar HIDES 'Approval & Transfer'");
    assert(!donorSidebarItems.includes("Hospitals & Blood Banks"), "Donor sidebar HIDES 'Hospitals & Blood Banks'");

    // Verify Bottom Menu items
    const bottomMenuItems = await page.$$eval('.sidebar-bottom-menu .sidebar-item span', items =>
      items.map(el => el.textContent.trim())
    );
    assert(bottomMenuItems.includes("Settings"), "Sidebar bottom menu includes 'Settings'");
    assert(bottomMenuItems.includes("Help & Support"), "Sidebar bottom menu includes 'Help & Support'");
    assert(bottomMenuItems.includes("Logout"), "Sidebar bottom menu includes 'Logout'");

    // Save Donor Dashboard screenshot
    const donorDashScreenshot = path.join(artifactDir, 'rbac_donor_dashboard_verified.png');
    await page.screenshot({ path: donorDashScreenshot });
    console.log(`Saved screenshot: ${donorDashScreenshot}`);

    // 1.3 Test Manual Route Protection for Donor
    console.log("\n1.3 Testing manual URL route protection for Donor...");

    // Test /blood-inventory
    await page.goto(`${BASE_URL}/blood-inventory`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    let pageText = await page.evaluate(() => document.body.innerText);
    assert(pageText.includes("Access Restricted") && pageText.includes("You don't have permission to access this section."),
      "Direct entry to /blood-inventory displays Access Restricted page for Donor");

    // Screenshot Access Restricted
    const accessDeniedScreenshot = path.join(artifactDir, 'rbac_access_restricted_verified.png');
    await page.screenshot({ path: accessDeniedScreenshot });
    console.log(`Saved screenshot: ${accessDeniedScreenshot}`);

    // Test [ Go to Dashboard ] button from Access Restricted
    const allBtns = await page.$$('button');
    let foundDashBtn = null;
    for (const b of allBtns) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("Go to Dashboard")) {
        foundDashBtn = b;
        break;
      }
    }
    assert(!!foundDashBtn, "Found [ Go to Dashboard ] button on Access Restricted page");
    await foundDashBtn.click();
    await new Promise(r => setTimeout(r, 600));
    assert(page.url().includes('/dashboard'), "[ Go to Dashboard ] button successfully returns to /dashboard");

    // Test /ai-recommendation
    await page.goto(`${BASE_URL}/ai-recommendation`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(pageText.includes("Access Restricted"), "Direct entry to /ai-recommendation displays Access Restricted for Donor");

    // Test /approval-transfer
    await page.goto(`${BASE_URL}/approval-transfer`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(pageText.includes("Access Restricted"), "Direct entry to /approval-transfer displays Access Restricted for Donor");

    // Test /approval-and-transfer
    await page.goto(`${BASE_URL}/approval-and-transfer`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(pageText.includes("Access Restricted"), "Direct entry to /approval-and-transfer displays Access Restricted for Donor");

    // Test /hospitals-blood-banks
    await page.goto(`${BASE_URL}/hospitals-blood-banks`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(pageText.includes("Access Restricted"), "Direct entry to /hospitals-blood-banks displays Access Restricted for Donor");

    // Test allowed donor routes
    await page.goto(`${BASE_URL}/my-donations`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(!pageText.includes("Access Restricted") && (pageText.includes("Donation") || pageText.includes("My Donations")),
      "Donor can freely access /my-donations");

    await page.goto(`${BASE_URL}/my-requests`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(!pageText.includes("Access Restricted") && (pageText.includes("Requests") || pageText.includes("My Requests")),
      "Donor can freely access /my-requests");


    // ------------------------------------------------------------------
    // SUITE 2: HOSPITAL ROLE VERIFICATION
    // ------------------------------------------------------------------
    console.log("\n>>> SUITE 2: HOSPITAL ROLE VERIFICATION <<<\n");

    // 2.1 Authenticate as Hospital Admin
    console.log("2.1 Authenticating as Hospital Admin (admin@apollo.org)...");
    await setSessionAs('hospital');

    // 2.2 Inspect Hospital Sidebar Menu
    console.log("2.2 Verifying Hospital Sidebar Menu items...");
    const hospitalSidebarItems = await page.$$eval('.sidebar-menu .sidebar-item span', items =>
      items.map(el => el.textContent.trim())
    );
    console.log("Hospital Sidebar visible items:", hospitalSidebarItems);

    assert(hospitalSidebarItems.includes("Dashboard"), "Hospital sidebar includes 'Dashboard'");
    assert(hospitalSidebarItems.includes("Blood Inventory"), "Hospital sidebar includes 'Blood Inventory'");
    assert(hospitalSidebarItems.includes("Blood Request"), "Hospital sidebar includes 'Blood Request'");
    assert(hospitalSidebarItems.includes("Find Donors"), "Hospital sidebar includes 'Find Donors'");
    assert(hospitalSidebarItems.includes("AI Recommendation"), "Hospital sidebar includes 'AI Recommendation'");
    assert(hospitalSidebarItems.includes("Approval & Transfer"), "Hospital sidebar includes 'Approval & Transfer'");
    assert(hospitalSidebarItems.includes("Hospitals & Blood Banks"), "Hospital sidebar includes 'Hospitals & Blood Banks'");
    assert(hospitalSidebarItems.includes("Notifications"), "Hospital sidebar includes 'Notifications'");

    // Verify My Donations is hidden for Hospital
    assert(!hospitalSidebarItems.includes("My Donations"), "Hospital sidebar HIDES 'My Donations'");

    // 2.3 Verify Hospital Operational Route Access
    console.log("\n2.3 Verifying Hospital access to operational pages...");
    await page.goto(`${BASE_URL}/blood-inventory`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(!pageText.includes("Access Restricted") && pageText.includes("Detailed Inventory"),
      "Hospital can access /blood-inventory");

    // Check Hospital inventory page-level permissions: Read-only inventory viewing
    const addStockBtn = await page.$('.inventory-primary-button');
    assert(addStockBtn === null, "Hospital CANNOT see 'Add Stock' button (read-only inventory viewing)");

    await page.goto(`${BASE_URL}/ai-recommendation`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(!pageText.includes("Access Restricted") && pageText.includes("Recommendation Engine"),
      "Hospital can access /ai-recommendation");

    await page.goto(`${BASE_URL}/approval-transfer`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(!pageText.includes("Access Restricted") && pageText.includes("Approval & Transfer"),
      "Hospital can access /approval-transfer");

    await page.goto(`${BASE_URL}/hospitals-blood-banks`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));
    pageText = await page.evaluate(() => document.body.innerText);
    assert(!pageText.includes("Access Restricted") && (pageText.includes("Hospitals & Blood Banks") || pageText.includes("HEALTHCARE NETWORK")),
      "Hospital can access /hospitals-blood-banks");

    // Save Hospital screenshot
    const hospitalScreenshot = path.join(artifactDir, 'rbac_hospital_sidebar_verified.png');
    await page.screenshot({ path: hospitalScreenshot });
    console.log(`Saved screenshot: ${hospitalScreenshot}`);


    // ------------------------------------------------------------------
    // SUITE 3: BLOOD BANK ROLE VERIFICATION
    // ------------------------------------------------------------------
    console.log("\n>>> SUITE 3: BLOOD BANK ROLE VERIFICATION <<<\n");

    // 3.1 Authenticate as Blood Bank
    console.log("3.1 Authenticating as Blood Bank (staff@bloodbank.org)...");
    await setSessionAs('bloodbank');

    // 3.2 Inspect Blood Bank Sidebar Menu
    console.log("3.2 Verifying Blood Bank Sidebar Menu items...");
    const bloodBankSidebarItems = await page.$$eval('.sidebar-menu .sidebar-item span', items =>
      items.map(el => el.textContent.trim())
    );
    console.log("Blood Bank Sidebar visible items:", bloodBankSidebarItems);

    assert(bloodBankSidebarItems.includes("Dashboard"), "Blood Bank sidebar includes 'Dashboard'");
    assert(bloodBankSidebarItems.includes("Blood Inventory"), "Blood Bank sidebar includes 'Blood Inventory'");
    assert(bloodBankSidebarItems.includes("Blood Request"), "Blood Bank sidebar includes 'Blood Request'");
    assert(bloodBankSidebarItems.includes("Find Donors"), "Blood Bank sidebar includes 'Find Donors'");
    assert(bloodBankSidebarItems.includes("AI Recommendation"), "Blood Bank sidebar includes 'AI Recommendation'");
    assert(bloodBankSidebarItems.includes("Approval & Transfer"), "Blood Bank sidebar includes 'Approval & Transfer'");
    assert(bloodBankSidebarItems.includes("Hospitals & Blood Banks"), "Blood Bank sidebar includes 'Hospitals & Blood Banks'");
    assert(bloodBankSidebarItems.includes("Notifications"), "Blood Bank sidebar includes 'Notifications'");

    // Verify My Donations is hidden for Blood Bank
    assert(!bloodBankSidebarItems.includes("My Donations"), "Blood Bank sidebar HIDES 'My Donations'");

    // 3.3 Verify Blood Bank Inventory Management Actions
    console.log("\n3.3 Verifying Blood Bank inventory management action permissions...");
    await page.goto(`${BASE_URL}/blood-inventory`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    const bbAddStockBtn = await page.$('.inventory-primary-button');
    assert(bbAddStockBtn !== null, "Blood Bank CAN see and use 'Add Stock' button");

    const bbUpdateStockBtn = await page.$('.inventory-secondary-button');
    assert(bbUpdateStockBtn !== null, "Blood Bank CAN see and use 'Update Stock' button");

    // Save Blood Bank screenshot
    const bloodBankScreenshot = path.join(artifactDir, 'rbac_bloodbank_inventory_verified.png');
    await page.screenshot({ path: bloodBankScreenshot });
    console.log(`Saved screenshot: ${bloodBankScreenshot}`);


    // ------------------------------------------------------------------
    // SUITE 4: ZERO NATIVE DIALOGS VERIFICATION
    // ------------------------------------------------------------------
    assert(nativeDialogCount === 0, `Confirmed zero native browser dialogs (count: ${nativeDialogCount})`);

  } catch (err) {
    console.error("Test execution failed:", err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n====================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED, ${nativeDialogCount} NATIVE DIALOGS`);
  console.log("====================================================================\n");

  if (failed > 0 || nativeDialogCount > 0) {
    process.exit(1);
  }
}

runRBACTests();
