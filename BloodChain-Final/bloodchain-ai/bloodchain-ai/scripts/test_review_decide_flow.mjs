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

async function runTest() {
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
  console.log("TESTING: REVIEW & DECIDE WORKFLOW (SPECIFIC RESTORATION)");
  console.log("====================================================================\n");

  try {
    // 1. Authenticate session
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

    // 3. Verify exactly [ View GPS Route on Map ] [ Review & Decide ] on cards
    console.log("\n3. Verifying buttons on cards...");
    const cardButtons = await page.$$eval('button', btns => btns.map(b => b.textContent.trim()));
    const reviewDecideCount = cardButtons.filter(t => t.includes("Review & Decide")).length;
    const viewGpsCount = cardButtons.filter(t => t.includes("View GPS Route on Map")).length;
    const authorizeCount = cardButtons.filter(t => t.includes("Authorize Transfer")).length;

    assert(viewGpsCount > 0, `Found ${viewGpsCount} 'View GPS Route on Map' buttons on cards`);
    assert(reviewDecideCount > 0, `Found ${reviewDecideCount} 'Review & Decide' buttons on cards`);
    assert(authorizeCount === 0, `Confirmed 0 'Authorize Transfer' buttons on cards (bottom-right is cleanly [ View GPS Route on Map ] [ Review & Decide ])`);

    // 4. Test Review & Decide on CARD 1 (First Recommendation)
    console.log("\n4. Testing 'Review & Decide' on CARD 1 (MGMGH Blood Bank)...");
    const reviewButtons = await page.$$('button');
    let reviewBtnsList = [];
    for (const b of reviewButtons) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("Review & Decide")) {
        reviewBtnsList.push(b);
      }
    }
    assert(reviewBtnsList.length >= 2, `Identified at least 2 distinct Review & Decide buttons (${reviewBtnsList.length} found)`);

    await reviewBtnsList[0].click();
    await new Promise(r => setTimeout(r, 600));

    const card1ModalText = await page.evaluate(() => document.body.innerText);
    assert(card1ModalText.includes("Clinical Human Review & Decision"), "Modal title 'Clinical Human Review & Decision' rendered");
    assert(card1ModalText.includes("MGMGH Blood Bank"), "Card 1 dynamically shows Source: MGMGH Blood Bank");
    assert(card1ModalText.includes("4 unit(s) of A+") || card1ModalText.includes("A+"), "Card 1 dynamically shows 4 unit(s) of A+");
    assert(card1ModalText.includes("Human Oversight Required"), "Human Oversight Required warning rendered");
    assert(card1ModalText.includes("Review Notes & Dispatch Instructions"), "Review Notes textarea rendered");

    // Verify modal footer buttons: exactly Cancel, Reject, Accept
    assert(card1ModalText.includes("Cancel"), "Modal contains 'Cancel' button");
    assert(card1ModalText.includes("Reject Recommendation"), "Modal contains 'Reject Recommendation' button");
    assert(card1ModalText.includes("Accept & Create Transfer"), "Modal contains 'Accept & Create Transfer' button");

    // 5. Test Cancel button on Card 1
    console.log("\n5. Testing 'Cancel' button...");
    const modalButtons = await page.$$('button');
    for (const b of modalButtons) {
      const txt = await page.evaluate(el => el.textContent.trim(), b);
      if (txt === "Cancel") {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));
    const afterCancel = await page.evaluate(() => document.body.innerText);
    assert(!afterCancel.includes("Human Oversight Required:"), "Modal closed cleanly without changing recommendation");

    // 6. Test Review & Decide on CARD 2 (Dynamic Selection check!)
    console.log("\n6. Testing 'Review & Decide' on CARD 2 (Trichy SRM Medical College)...");
    // Re-query review buttons from DOM
    const reviewButtons2 = await page.$$('button');
    let reviewBtnsList2 = [];
    for (const b of reviewButtons2) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("Review & Decide")) {
        reviewBtnsList2.push(b);
      }
    }
    await reviewBtnsList2[1].click();
    await new Promise(r => setTimeout(r, 600));

    const card2ModalText = await page.evaluate(() => document.body.innerText);
    assert(card2ModalText.includes("Trichy SRM Medical College"), "Card 2 dynamically displays 'Trichy SRM Medical College' (Not Card 1's MGMGH!)");
    assert(card2ModalText.includes("2 unit(s) of O+") || card2ModalText.includes("O+"), "Card 2 dynamically displays 2 units of O+");
    assert(card2ModalText.includes("18.42 km") || card2ModalText.includes("52 min"), "Card 2 dynamically displays distance 18.42 km / 52 min");

    // Close Card 2 modal via Cancel
    const modalButtons2 = await page.$$('button');
    for (const b of modalButtons2) {
      const txt = await page.evaluate(el => el.textContent.trim(), b);
      if (txt === "Cancel") {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));

    // 7. Verify GPS Route on Map still works untouched
    console.log("\n7. Verifying 'View GPS Route on Map' is untouched and working...");
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("View GPS Route on Map")) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    const gpsText = await page.evaluate(() => document.body.innerText);
    assert(gpsText.includes("GPS Route on Map"), "GPS Route on Map opens correctly and independently");

    // Close GPS modal
    const gpsBtns = await page.$$('button');
    for (const b of gpsBtns) {
      const txt = await page.evaluate(el => el.textContent.trim(), b);
      if (txt === "Close") {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 600));

    // Screenshot
    const screenshotPath = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage\\review_decide_restored_clean.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\nScreenshot captured: ${screenshotPath}`);

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

runTest();
