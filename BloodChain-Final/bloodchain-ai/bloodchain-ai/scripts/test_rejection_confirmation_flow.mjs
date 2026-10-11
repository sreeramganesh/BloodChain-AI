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

  let nativeDialogCount = 0;
  let nativeDialogMessages = [];
  page.on('dialog', async dialog => {
    nativeDialogCount++;
    nativeDialogMessages.push(dialog.message());
    console.error(`⚠️ NATIVE DIALOG DETECTED (${dialog.type()}): "${dialog.message()}"`);
    await dialog.dismiss();
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  console.log("====================================================================");
  console.log("TESTING: CUSTOM BLOODCHAIN REJECTION CONFIRMATION FLOW");
  console.log("====================================================================\n");

  try {
    // 1. Authenticate session
    console.log("1. Authenticating as Hospital Admin...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      const demoUser = {
        id: "demo-admin-1",
        name: "Dr. Rajesh Sharma",
        role: "Hospital Admin",
        organization: "Apollo Hospitals",
        email: "admin@apollo.org",
        provider: "demo",
        authenticatedAt: new Date().toISOString()
      };
      localStorage.setItem("bloodchain_auth_user", JSON.stringify(demoUser));
    });

    // 2. Open /ai-recommendation
    console.log("2. Navigating to /ai-recommendation...");
    await page.goto(`${BASE_URL}/ai-recommendation`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // 3. Find Review & Decide buttons
    console.log("3. Locating Review & Decide buttons...");
    const reviewButtons = await page.$$('button');
    let reviewBtnsList = [];
    for (const b of reviewButtons) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("Review & Decide")) {
        reviewBtnsList.push(b);
      }
    }
    assert(reviewBtnsList.length > 0, `Found ${reviewBtnsList.length} 'Review & Decide' buttons`);

    // 4. Open Clinical Human Review & Decision modal on Recommendation 1
    console.log("\n4. Opening 'Clinical Human Review & Decision' modal on Recommendation 1...");
    await reviewBtnsList[0].click();
    await new Promise(r => setTimeout(r, 500));

    const modalTitle = await page.$eval('h3', h => h.textContent);
    assert(modalTitle.includes("Clinical Human Review & Decision"), `Layer 1 Modal opened: "${modalTitle}"`);

    // 5. Enter optional review notes
    const testNotes = "Testing notes: Local reserve re-check in progress by clinician.";
    console.log(`\n5. Entering review notes: "${testNotes}"`);
    await page.type('textarea', testNotes);
    const enteredNotes = await page.$eval('textarea', el => el.value);
    assert(enteredNotes === testNotes, `Review notes entered and verified in textarea`);

    // 6. Click "Reject Recommendation"
    console.log("\n6. Clicking 'Reject Recommendation' button in Review modal...");
    const rejectBtn = await page.$('#open-reject-confirm-btn');
    assert(!!rejectBtn, "Found #open-reject-confirm-btn button");
    await rejectBtn.click();
    await new Promise(r => setTimeout(r, 400));

    // 7. Verify NO browser popup appeared
    assert(nativeDialogCount === 0, `Verified zero native browser dialogs appeared (count: ${nativeDialogCount})`);

    // 8. Verify custom BloodChain confirmation modal (Layer 2) appears
    console.log("\n7. Verifying custom BloodChain confirmation modal (Layer 2)...");
    const confirmTitleEl = await page.$('#reject-confirm-title');
    assert(!!confirmTitleEl, "Found #reject-confirm-title in DOM");
    const confirmTitleText = await page.evaluate(el => el.textContent.trim(), confirmTitleEl);
    assert(confirmTitleText === "Reject AI Recommendation?", `Confirmation title is exact: "${confirmTitleText}"`);

    const confirmDescText = await page.$eval('#reject-confirm-desc', el => el.textContent.trim());
    assert(confirmDescText.includes("Are you sure you want to reject this AI recommendation?"), `Confirmation description contains expected text`);

    // 9. Verify dynamic recommendation details in confirmation modal
    const modalContent = await page.evaluate(() => {
      const dialog = document.querySelector('[role="alertdialog"]');
      return dialog ? dialog.innerText : "";
    });
    console.log("Modal inner text summary:\n", modalContent);
    assert(modalContent.includes("Request:") && modalContent.includes("Source:") && modalContent.includes("Destination:") && modalContent.includes("Blood:"),
      "Confirmation modal dynamically displays Request, Source, Destination, and Blood units");
    assert(modalContent.includes("No transfer will be created from this recommendation."),
      "Confirmation modal contains secondary warning message");

    // Capture screenshot of Layer 2 over Layer 1
    const artifactDir = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage';
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }
    const screenshotModalPath = path.join(artifactDir, 'rejection_confirmation_modal_verified.png');
    await page.screenshot({ path: screenshotModalPath });
    console.log(`Saved screenshot: ${screenshotModalPath}`);

    // 10. Click [ Cancel ] button
    console.log("\n8. Clicking [ Cancel ] in confirmation modal...");
    const cancelBtn = await page.$('#reject-modal-cancel-btn');
    assert(!!cancelBtn, "Found #reject-modal-cancel-btn");
    await cancelBtn.click();
    await new Promise(r => setTimeout(r, 400));

    // 11. Verify confirmation modal closes & Layer 1 remains open
    const confirmDialogAfterCancel = await page.$('[role="alertdialog"]');
    assert(confirmDialogAfterCancel === null, "Confirmation modal closed after clicking Cancel");

    const reviewModalAfterCancel = await page.$eval('h3', h => h.textContent);
    assert(reviewModalAfterCancel.includes("Clinical Human Review & Decision"), "Layer 1 Clinical Human Review & Decision remains open");

    // 12. Verify review notes are STILL preserved!
    const notesAfterCancel = await page.$eval('textarea', el => el.value);
    assert(notesAfterCancel === testNotes, `Review notes preserved intact after cancellation: "${notesAfterCancel}"`);

    // 13. Test Escape key accessibility
    console.log("\n9. Testing Escape key behavior...");
    await (await page.$('#open-reject-confirm-btn')).click();
    await new Promise(r => setTimeout(r, 300));
    assert(await page.$('[role="alertdialog"]') !== null, "Confirmation modal re-opened");
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    assert(await page.$('[role="alertdialog"]') === null, "Confirmation modal closed on Escape key press");
    const notesAfterEsc = await page.$eval('textarea', el => el.value);
    assert(notesAfterEsc === testNotes, "Review notes still intact after Escape key dismissal");

    // 14. Test Confirm Rejection
    console.log("\n10. Confirming rejection execution...");
    await (await page.$('#open-reject-confirm-btn')).click();
    await new Promise(r => setTimeout(r, 300));

    const confirmRejectBtn = await page.$('#reject-modal-confirm-btn');
    assert(!!confirmRejectBtn, "Found #reject-modal-confirm-btn");
    await confirmRejectBtn.click();
    await new Promise(r => setTimeout(r, 1500));

    // 15. Verify NO native browser alert/confirm was called during rejection
    assert(nativeDialogCount === 0, `Zero native browser dialogs triggered throughout rejection (count: ${nativeDialogCount})`);

    // 16. Verify confirmation modal and review modal are closed
    assert(await page.$('[role="alertdialog"]') === null, "Confirmation modal closed after rejection");

    // 17. Verify success notification or notice banner appears
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasSuccessNotice = pageText.includes("Recommendation has been rejected. No transfer created.") ||
                             pageText.includes("Recommendation Rejected") ||
                             pageText.includes("rejected");
    assert(hasSuccessNotice, "Success rejection feedback notice displayed to user");

    // 18. Verify View GPS Route on Map still works
    console.log("\n11. Verifying 'View GPS Route on Map' is unchanged and functional...");
    const mapButtons = await page.$$('button');
    let mapBtn = null;
    for (const b of mapButtons) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("View GPS Route on Map")) {
        mapBtn = b;
        break;
      }
    }
    assert(!!mapBtn, "Found 'View GPS Route on Map' button");
    await mapBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    const mapTitle = await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes("GPS Route on Map"));
      return h ? h.textContent : null;
    });
    assert(!!mapTitle, `GPS Route on Map modal opened: "${mapTitle}"`);

    // Close GPS route map modal
    const closeBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const b = btns.find(el => el.textContent.trim() === "Close");
      if (b) { b.click(); return true; }
      return false;
    });
    assert(closeBtn, "GPS Route Map modal closed cleanly");

    // 12. Test Dynamic Details on Card 2 (Second Recommendation)
    console.log("\n12. Testing Dynamic Details on Second Recommendation...");
    await new Promise(r => setTimeout(r, 600));
    const updatedReviewBtns = await page.$$('button');
    let secondReviewBtn = null;
    let countReview = 0;
    for (const b of updatedReviewBtns) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes("Review & Decide")) {
        countReview++;
        if (countReview === 2) {
          secondReviewBtn = b;
          break;
        }
      }
    }

    if (secondReviewBtn) {
      await secondReviewBtn.click();
      await new Promise(r => setTimeout(r, 500));
      
      // Verify Accept button is intact
      const acceptBtnText = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const accept = btns.find(b => b.textContent.includes("Accept & Create Transfer"));
        return accept ? accept.textContent.trim() : null;
      });
      assert(acceptBtnText !== null, `Verified 'Accept & Create Transfer' button is intact and present: "${acceptBtnText}"`);

      // Open Reject Confirmation on Card 2
      await (await page.$('#open-reject-confirm-btn')).click();
      await new Promise(r => setTimeout(r, 400));

      const card2ModalContent = await page.evaluate(() => {
        const dialog = document.querySelector('[role="alertdialog"]');
        return dialog ? dialog.innerText : "";
      });
      console.log("Card 2 confirmation modal content:\n", card2ModalContent);

      assert(card2ModalContent.includes("Reject AI Recommendation?"), "Card 2 rejection confirmation modal displayed");
      assert(card2ModalContent.includes("Trichy SRM Medical College") || card2ModalContent.includes("Kauvery Hospital") || card2ModalContent.includes("MGMGH Blood Bank"),
        "Card 2 confirmation displays its own specific dynamic facility details");

      // Screenshot Card 2 confirmation modal
      const screenshotCard2Path = path.join(artifactDir, 'card2_rejection_confirmation_verified.png');
      await page.screenshot({ path: screenshotCard2Path });
      console.log(`Saved screenshot: ${screenshotCard2Path}`);

      // Cancel Card 2 confirmation
      await (await page.$('#reject-modal-cancel-btn')).click();
      await new Promise(r => setTimeout(r, 300));
      assert(await page.$('[role="alertdialog"]') === null, "Card 2 confirmation closed on Cancel");

      // Close Card 2 Review modal
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cancel = btns.find(b => b.textContent.trim() === "Cancel");
        if (cancel) cancel.click();
      });
      await new Promise(r => setTimeout(r, 400));
    }


    // Take final screenshot
    const screenshotFinalPath = path.join(artifactDir, 'rejection_flow_completed_verified.png');
    await page.screenshot({ path: screenshotFinalPath });
    console.log(`Saved final screenshot: ${screenshotFinalPath}`);

  } catch (err) {
    console.error("Test failed with exception:", err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n====================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED, ${nativeDialogCount} NATIVE DIALOGS`);
  console.log("====================================================================");

  if (failed > 0 || nativeDialogCount > 0) {
    process.exit(1);
  }
}

runTest();
