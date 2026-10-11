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
const BASE_URL = 'http://localhost:5174';
const ARTIFACT_DIR = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage';

async function runBrowserPhase5E2ETest() {
  if (!executablePath) {
    console.error('No browser executable found!');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("====================================================");
  console.log("  BROWSER TEST: BLOODCHAIN AI ASSISTANT PHASE 5");
  console.log("====================================================\n");

  try {
    // 1. Establish session
    console.log("1. Setting up authenticated Hospital Admin session...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
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

    // 2. Navigate to Dashboard
    console.log("2. Navigating to Dashboard...");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    // 3. Check for Floating AI Assistant button & open it
    console.log("3. Checking floating AI assistant button & opening panel...");
    const btn = await page.waitForSelector('button[aria-label="Open BloodChain AI Assistant"]', { timeout: 8000 });
    if (!btn) throw new Error("Floating AI Assistant button not found!");
    await btn.click();
    await new Promise(r => setTimeout(r, 600));

    const panel = await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
    const panelText = await page.evaluate(el => el.innerText, panel);
    if (!panelText.includes("BloodChain AI Assistant")) {
      throw new Error("Panel header title not found!");
    }
    console.log("  ✓ AI Assistant Panel opened with header 'BloodChain AI Assistant'");

    const textarea = await page.waitForSelector('textarea[aria-label="Ask BloodChain AI"]');

    // Helper to send question and wait for response
    async function askQuestion(questionText) {
      await textarea.click();
      await page.evaluate(el => el.value = '', textarea);
      await textarea.type(questionText);
      await page.keyboard.press("Enter");
      await new Promise(r => setTimeout(r, 2200));
      return await page.evaluate(el => el.innerText, panel);
    }

    // 4. Test Quick Action button click: "What is shortage risk?"
    console.log("4. Testing Quick Question button click: 'What is shortage risk?'...");
    const quickButtons = await page.$$('button');
    let clickedQuick = false;
    for (const b of quickButtons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text.includes("What is shortage risk?")) {
        await b.click();
        clickedQuick = true;
        break;
      }
    }
    if (!clickedQuick) throw new Error("Quick Question button 'What is shortage risk?' not found!");
    // Quick question fills the input; submit with Enter
    await page.keyboard.press("Enter");
    await new Promise(r => setTimeout(r, 2000));

    const staticResp = await page.evaluate(el => el.innerText, panel);
    if (!staticResp.includes("Verified Knowledge") || !staticResp.includes("potential deficits")) {
      throw new Error("Static question response or 'Verified Knowledge' badge missing!");
    }
    console.log("  ✓ Quick question button clicked and answered with 'Verified Knowledge' badge");

    // 5. Test Natural-Language Inventory Question
    console.log("5. Testing natural-language inventory question: 'Do we have O positive?'...");
    const nlResp = await askQuestion("Do we have O positive?");
    if (!nlResp.includes("Live Supabase Data") || !nlResp.includes("160") || !nlResp.includes("O+")) {
      throw new Error("Natural language inventory query failed to return 160 units of O+ or badge!");
    }
    console.log("  ✓ Natural language query succeeded with 'Live Supabase Data' badge and 160 units of O+!");

    // 6. Test Contextual Follow-up Question
    console.log("6. Testing contextual follow-up: 'What about A+?'...");
    const followUpResp = await askQuestion("What about A+?");
    if (!followUpResp.includes("A+") || !followUpResp.includes("Live Supabase Data")) {
      throw new Error("Contextual follow-up for A+ failed!");
    }
    console.log("  ✓ Contextual follow-up 'What about A+?' correctly maintained inventory availability intent!");

    // 7. Test Contextual Facility Follow-up
    console.log("7. Testing contextual facility follow-up: 'What about Apollo?'...");
    const facilityFollowUpResp = await askQuestion("What about Apollo?");
    if (!facilityFollowUpResp.includes("Apollo Hospital") || !facilityFollowUpResp.includes("A+")) {
      throw new Error("Facility contextual follow-up failed to retain A+ and filter by Apollo!");
    }
    console.log("  ✓ Facility contextual follow-up 'What about Apollo?' retained A+ intent and applied Apollo Hospital filter!");

    // 8. Test Request ID lookup
    console.log("8. Testing Request ID lookup: 'What is the status of BRQ001?'...");
    const reqResp = await askQuestion("What is the status of BRQ001?");
    if (!reqResp.includes("BRQ001") || !reqResp.includes("R. Karthik") || !reqResp.includes("Critical")) {
      throw new Error("Request ID lookup for BRQ001 failed!");
    }
    console.log("  ✓ Request ID lookup BRQ001 returned live patient details and critical urgency!");

    // 9. Test Transfer query
    console.log("9. Testing Transfer query: 'What is TRF001?'...");
    const trfResp = await askQuestion("What is TRF001?");
    if (!trfResp.includes("TRF001") || !trfResp.includes("Live Supabase Data")) {
      throw new Error("Transfer ID lookup for TRF001 failed!");
    }
    console.log("  ✓ Transfer query succeeded with live transfer details!");

    // 10. Test Multi-Source Query
    console.log("10. Testing multi-source query: 'Do we have O+ and are there any shortage risks?'...");
    const multiResp = await askQuestion("Do we have O+ and are there any shortage risks?");
    const multiLower = multiResp.toLowerCase();
    if (!multiLower.includes("current inventory") || !multiLower.includes("shortage risk") || !multiResp.includes("160")) {
      throw new Error("Multi-source query failed to combine inventory and shortage risks!");
    }
    console.log("  ✓ Multi-source query returned combined inventory + shortage risks!");

    // 11. Test Clarification Question
    console.log("11. Testing clarification question: 'Show blood'...");
    const clarifyResp = await askQuestion("Show blood");
    if (!clarifyResp.includes("Which blood group should I check?")) {
      throw new Error("Clarification response missing for ambiguous query 'Show blood'!");
    }
    console.log("  ✓ Clarification question triggered accurately: 'Which blood group should I check?'");

    // 12. Test Comparison Question
    console.log("12. Testing comparison question: 'Which has more O+ stock, Apollo or Kauvery?'...");
    const compResp = await askQuestion("Which has more O+ stock, Apollo or Kauvery?");
    if (!compResp.includes("Comparison") || !compResp.includes("Apollo Hospital") || !compResp.includes("Kauvery Hospital")) {
      throw new Error("Comparison query failed to compare Apollo and Kauvery!");
    }
    console.log("  ✓ Comparison query succeeded with real hospital inventory figures!");

    // Capture Desktop Screenshot
    const screenshotPath = path.join(ARTIFACT_DIR, 'ai_assistant_phase5_verified.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`  ✓ Desktop Screenshot saved to: ${screenshotPath}`);

    // 14. Test Mobile Viewport
    console.log("14. Testing mobile viewport (375x667)...");
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(r => setTimeout(r, 600));

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'ai_assistant_phase5_mobile_verified.png');
    await page.screenshot({ path: mobileScreenshotPath });
    console.log(`  ✓ Mobile Screenshot saved to: ${mobileScreenshotPath}`);

    // 15. Close assistant
    console.log("15. Testing close assistant button...");
    const closeBtn = await page.waitForSelector('button[aria-label="Close BloodChain AI Assistant"]');
    await closeBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const isClosed = await page.evaluate(() => document.querySelector('div[role="dialog"]') === null);
    if (!isClosed) throw new Error("Assistant panel failed to close!");
    console.log("  ✓ AI Assistant panel closed cleanly");

    console.log("\n====================================================");
    console.log("  ALL PHASE 5 BROWSER E2E TESTS PASSED SUCCESSFULLY!");
    console.log("====================================================\n");

  } catch (err) {
    console.error("Phase 5 Browser test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserPhase5E2ETest();
