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

async function runBrowserAIAssistantTest() {
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
  console.log("  BROWSER TEST: BLOODCHAIN AI ASSISTANT PHASE 4");
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

    // 3. Check for Floating AI Assistant button
    console.log("3. Checking floating AI assistant button...");
    const btn = await page.waitForSelector('button[aria-label="Open BloodChain AI Assistant"]', { timeout: 8000 });
    if (!btn) throw new Error("Floating AI Assistant button not found!");
    console.log("  ✓ Floating button found");

    // 4. Click button to open panel
    console.log("4. Opening AI Assistant Panel...");
    await btn.click();
    await new Promise(r => setTimeout(r, 600));

    // Verify dialog is open
    const panel = await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
    const panelText = await page.evaluate(el => el.innerText, panel);
    if (!panelText.includes("BloodChain AI Assistant")) {
      throw new Error("Panel header title not found!");
    }
    console.log("  ✓ AI Assistant Panel opened with header 'BloodChain AI Assistant'");

    // 5. Send a Static Knowledge Question
    console.log("5. Asking static question: 'What is shortage risk?'...");
    const textarea = await page.waitForSelector('textarea[aria-label="Ask BloodChain AI"]');
    await textarea.type("What is shortage risk?");
    await page.keyboard.press("Enter");
    await new Promise(r => setTimeout(r, 1000));

    const staticAnswer = await page.evaluate(el => el.innerText, panel);
    if (!staticAnswer.includes("Verified Knowledge") || !staticAnswer.includes("potential deficits")) {
      throw new Error("Static question response or Verified Knowledge badge missing!");
    }
    console.log("  ✓ Static question answered with 'Verified Knowledge' badge");

    // 6. Send a Live Inventory Question
    console.log("6. Asking live inventory question: 'How many O+ units are available?'...");
    await textarea.type("How many O+ units are available?");
    await page.keyboard.press("Enter");

    // Check loading indicator or wait for response
    await new Promise(r => setTimeout(r, 2000));
    const liveInvAnswer = await page.evaluate(el => el.innerText, panel);
    if (!liveInvAnswer.includes("Live Supabase Data") || !liveInvAnswer.includes("160 units")) {
      throw new Error("Live inventory query failed to return real Supabase 160 units or badge!");
    }
    console.log("  ✓ Live inventory query succeeded with 'Live Supabase Data' badge and 160 real units!");

    // 7. Send a Live Request Question
    console.log("7. Asking live blood request question: 'What is the status of BRQ001?'...");
    await textarea.type("What is the status of BRQ001?");
    await page.keyboard.press("Enter");
    await new Promise(r => setTimeout(r, 2000));

    const liveReqAnswer = await page.evaluate(el => el.innerText, panel);
    if (!liveReqAnswer.includes("R. Karthik") || !liveReqAnswer.includes("Live Blood Request Details")) {
      throw new Error("Live request query failed to return real Supabase BRQ001 details!");
    }
    console.log("  ✓ Live request query succeeded with 'R. Karthik' from live Supabase!");

    // Screenshot open panel with verified badges
    const screenshotPath = path.join(ARTIFACT_DIR, 'ai_assistant_live_data_phase4_verified.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`  ✓ Desktop Screenshot saved to: ${screenshotPath}`);

    // 8. Test Mobile Viewport
    console.log("8. Testing mobile viewport (375x667)...");
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(r => setTimeout(r, 600));

    const mobileScreenshotPath = path.join(ARTIFACT_DIR, 'ai_assistant_phase4_mobile_verified.png');
    await page.screenshot({ path: mobileScreenshotPath });
    console.log(`  ✓ Mobile Screenshot saved to: ${mobileScreenshotPath}`);

    // 9. Close assistant
    console.log("9. Testing close assistant button...");
    const closeBtn = await page.waitForSelector('button[aria-label="Close BloodChain AI Assistant"]');
    await closeBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const isClosed = await page.evaluate(() => document.querySelector('div[role="dialog"]') === null);
    if (!isClosed) throw new Error("Assistant panel failed to close!");
    console.log("  ✓ AI Assistant panel closed cleanly");

    console.log("\n====================================================");
    console.log("  ALL BROWSER TESTS PASSED SUCCESSFULLY!");
    console.log("====================================================\n");

  } catch (err) {
    console.error("Browser test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserAIAssistantTest();
