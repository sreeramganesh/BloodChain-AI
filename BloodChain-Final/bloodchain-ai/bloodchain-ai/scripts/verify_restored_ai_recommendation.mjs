import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const executablePath = chromePaths.find(p => fs.existsSync(p));
const BASE_URL = 'http://localhost:5174';

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

async function runVerification() {
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

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  console.log("====================================================================");
  console.log("FINAL VERIFICATION: RESTORED AI RECOMMENDATION FUNCTIONALITY");
  console.log("====================================================================\n");

  try {
    // 1. Establish session
    console.log("1. Authenticating as Hospital Admin...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const demoUser = {
        id: "demo-admin-1",
        name: "Dr. Rajesh Sharma",
        email: "admin@apollo.org",
        role: "Hospital Admin",
        organization: "Apollo Hospitals",
        phone: "+91 98765 43210",
        provider: "demo",
        authenticatedAt: new Date().toISOString()
      };
      localStorage.setItem("bloodchain_auth_user", JSON.stringify(demoUser));
    });

    // 2. Open /ai-recommendation
    console.log("\n2. Navigating to /ai-recommendation...");
    await page.goto(`${BASE_URL}/ai-recommendation`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const pageText = await page.evaluate(() => document.body.innerText);
    assert(pageText.includes("AI Recommendation") && pageText.includes("AI Clinical Recommendation Engine"), "AI Recommendation page loaded with header & engine");

    // 3. Verify recommendation cards and buttons
    console.log("\n3. Checking recommendation cards and buttons...");
    const hasViewGPSBtn = pageText.includes("View GPS Route on Map");
    const hasReviewBtn = pageText.includes("Review & Decide");
    const hasAuthorizeBtn = pageText.includes("Authorize Transfer");
    assert(hasViewGPSBtn, "'View GPS Route on Map' button is present on recommendation cards");
    assert(hasReviewBtn, "'Review & Decide' button is present on recommendation cards");
    assert(hasAuthorizeBtn, "'Authorize Transfer' button is present on recommendation cards");

    // 4. Click Review & Decide
    console.log("\n4. Testing 'Review & Decide' button...");
    const reviewButtons = await page.$$('button');
    let reviewBtn = null;
    for (const b of reviewButtons) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("Review & Decide")) {
        reviewBtn = b;
        break;
      }
    }
    assert(reviewBtn !== null, "Found 'Review & Decide' button");
    await reviewBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // 5. Verify Clinical Human Review & Decision opens
    console.log("\n5. Verifying 'Clinical Human Review & Decision' modal content...");
    const modalText = await page.evaluate(() => document.body.innerText);
    assert(modalText.includes("Clinical Human Review & Decision"), "Modal title 'Clinical Human Review & Decision' displayed");
    assert(modalText.includes("Patient / Request") || modalText.includes("Allocation Route"), "Patient / Request & Allocation Route fields present");
    assert(modalText.includes("Requested Blood & Units"), "Requested Blood & Units field present");
    assert(modalText.includes("Clinical Compatibility"), "Clinical Compatibility field present");
    assert(modalText.includes("Straight-line Distance"), "Straight-line Distance / Transit field present");
    assert(modalText.includes("Human Oversight Required"), "Human Oversight Required warning present");
    assert(modalText.includes("Review Notes & Dispatch Instructions"), "Review Notes & Dispatch Instructions textarea present");
    assert(modalText.includes("Reject Recommendation"), "'Reject Recommendation' button present in modal");
    assert(modalText.includes("Accept & Create Transfer"), "'Accept & Create Transfer' button present in modal");
    assert(modalText.includes("Cancel"), "'Cancel' button present in modal");

    // 6. Click Cancel and verify modal closes
    console.log("\n6. Testing 'Cancel' button in Review modal...");
    const allModalBtns = await page.$$('button');
    let cancelBtn = null;
    for (const b of allModalBtns) {
      const txt = await page.evaluate(el => el.textContent.trim(), b);
      if (txt === "Cancel") {
        cancelBtn = b;
        break;
      }
    }
    assert(cancelBtn !== null, "Found 'Cancel' button in modal");
    await cancelBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const afterCancelText = await page.evaluate(() => document.body.innerText);
    assert(!afterCancelText.includes("Human Oversight Required:"), "Modal closed cleanly after clicking Cancel");

    // 7. Test "View GPS Route on Map" button
    console.log("\n7. Testing 'View GPS Route on Map' button...");
    const currentBtns = await page.$$('button');
    let gpsBtn = null;
    for (const b of currentBtns) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("View GPS Route on Map")) {
        gpsBtn = b;
        break;
      }
    }
    assert(gpsBtn !== null, "Found 'View GPS Route on Map' button");
    await gpsBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    const gpsModalText = await page.evaluate(() => document.body.innerText);
    assert(gpsModalText.includes("GPS Route on Map"), "GPS Route on Map modal opened");
    assert(gpsModalText.includes("Straight-line Distance") || gpsModalText.includes("km"), "GPS Route transit & distance metrics displayed");

    // Close GPS modal
    console.log("\n8. Closing GPS Route modal...");
    const gpsModalBtns = await page.$$('button');
    let closeGpsBtn = null;
    for (const b of gpsModalBtns) {
      const txt = await page.evaluate(el => el.textContent.trim(), b);
      if (txt === "Close") {
        closeGpsBtn = b;
        break;
      }
    }
    if (closeGpsBtn) {
      await closeGpsBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }
    const afterGpsCloseText = await page.evaluate(() => document.body.innerText);
    assert(!afterGpsCloseText.includes("Advisory Route Visualization"), "GPS Route modal closed cleanly");

    // 9. Test "Authorize Transfer" button
    console.log("\n9. Testing 'Authorize Transfer' button...");
    const postGpsBtns = await page.$$('button');
    let authTransferBtn = null;
    for (const b of postGpsBtns) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("Authorize Transfer")) {
        authTransferBtn = b;
        break;
      }
    }
    assert(authTransferBtn !== null, "Found 'Authorize Transfer' button");
    await authTransferBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const authModalText = await page.evaluate(() => document.body.innerText);
    assert(authModalText.includes("Clinical Human Review & Decision"), "Authorize Transfer opened the Clinical Human Review & Decision modal");

    // Close modal
    const closeBtnsFinal = await page.$$('button');
    for (const b of closeBtnsFinal) {
      const txt = await page.evaluate(el => el.textContent.trim(), b);
      if (txt === "Cancel") {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));

    // Capture screenshot
    const screenshotPath = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage\\restored_ai_recommendation_verified.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\nScreenshot saved: ${screenshotPath}`);

  } catch (err) {
    console.error("Test error:", err.message);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n====================================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("====================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runVerification();
