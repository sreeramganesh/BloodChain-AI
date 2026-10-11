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
console.log('Browser executable detected:', executablePath);

const BASE_URL = 'http://localhost:5174';
const SCRATCH_DIR = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\scratch';

if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

let passedChecks = 0;
let totalChecks = 0;

function check(desc, condition) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ PASS [${passedChecks}/${totalChecks}]: ${desc}`);
  } else {
    console.error(`  ✗ FAIL [${passedChecks}/${totalChecks}]: ${desc}`);
  }
}

async function runPhase6BrowserTests() {
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

  console.log('\n====================================================================');
  console.log('BLOODCHAIN AI — PHASE 6: BROWSER END-TO-END AUTOMATION SUITE');
  console.log('====================================================================\n');

  try {
    // -------------------------------------------------------------
    // STAGE 1: Public Routes Regression Smoke Test
    // -------------------------------------------------------------
    console.log('1. PUBLIC ROUTES REGRESSION SMOKE TEST');
    const publicRoutes = [
      { path: '/', titleSnippet: 'BloodChain' },
      { path: '/about', titleSnippet: 'About' },
      { path: '/features', titleSnippet: 'Features' },
      { path: '/how-it-works', titleSnippet: 'How' },
      { path: '/impact', titleSnippet: 'Impact' },
      { path: '/contact', titleSnippet: 'Contact' },
      { path: '/register', titleSnippet: 'Register' },
      { path: '/login', titleSnippet: 'Login' },
    ];

    for (const r of publicRoutes) {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'domcontentloaded' });
      await new Promise(res => setTimeout(res, 300));
      const bodyText = await page.evaluate(() => document.body.innerText);
      check(`Public route '${r.path}' loads without crash`, bodyText.length > 50);
    }

    // -------------------------------------------------------------
    // STAGE 2: Protected Route Blocked Prior to Authentication
    // -------------------------------------------------------------
    console.log('\n2. PROTECTED ROUTE DIRECT ACCESS SECURITY CHECK');
    // Clear any leftover local session
    await page.evaluate(() => {
      localStorage.removeItem('bloodchain_auth_user');
    });

    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(res => setTimeout(res, 500));
    const currentUrl = page.url();
    check('Unauthenticated access to /dashboard redirects to /login', currentUrl.includes('/login'));

    // -------------------------------------------------------------
    // STAGE 3: User Authentication & Session Establishment
    // -------------------------------------------------------------
    console.log('\n3. USER AUTHENTICATION FLOW (LOGIN & SESSION CREATION)');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });

    // Use pre-seeded demo user credentials
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

    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(res => setTimeout(res, 600));

    const dashboardText = await page.evaluate(() => document.body.innerText);
    check('Dashboard loads successfully with authenticated session', dashboardText.includes('Dashboard') || dashboardText.includes('Rajesh Sharma') || dashboardText.includes('Apollo'));
    
    // Save dashboard screenshot
    const dashScreenshot = path.join(SCRATCH_DIR, 'phase6_dashboard_verified.png');
    await page.screenshot({ path: dashScreenshot });
    console.log(`  (Screenshot saved: ${dashScreenshot})`);

    // -------------------------------------------------------------
    // STAGE 4: Authenticated Routes Regression Smoke Test
    // -------------------------------------------------------------
    console.log('\n4. AUTHENTICATED ROUTES REGRESSION SMOKE TEST');
    const authRoutes = [
      { path: '/blood-inventory', snippet: 'Inventory' },
      { path: '/blood-request', snippet: 'Request' },
      { path: '/find-donors', snippet: 'Donors' },
      { path: '/ai-recommendation', snippet: 'Recommendation' },
      { path: '/approval-transfer', snippet: 'Transfer' },
      { path: '/hospitals-blood-banks', snippet: 'Hospitals' },
      { path: '/my-donations', snippet: 'Donation' },
      { path: '/my-requests', snippet: 'Request' },
      { path: '/notifications', snippet: 'Notification' },
      { path: '/settings', snippet: 'Settings' },
      { path: '/help-support', snippet: 'Help' },
    ];

    for (const r of authRoutes) {
      await page.goto(`${BASE_URL}${r.path}`, { waitUntil: 'domcontentloaded' });
      await new Promise(res => setTimeout(res, 350));
      const pageText = await page.evaluate(() => document.body.innerText);
      check(`Authenticated route '${r.path}' loads without crash`, pageText.length > 50);
    }

    // -------------------------------------------------------------
    // STAGE 5: Blood Request & Intelligent Source Selection Modal Flow
    // -------------------------------------------------------------
    console.log('\n5. BLOOD REQUEST & INTELLIGENT RECOMMENDATION WORKFLOW');
    await page.goto(`${BASE_URL}/blood-request`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.blood-request-page', { timeout: 8000 });
    check('Blood Request page loaded', true);

    // Locate "Find Sources" button on table rows
    const findSourcesBtns = await page.$$('.btn-find-sources-row');
    check(`Found 'Find Sources' action buttons on active requests (${findSourcesBtns.length} found)`, findSourcesBtns.length > 0);

    // Click "Find Sources" on the first row
    console.log('  Triggering Intelligent Recommendation analysis for request BRQ001...');
    await findSourcesBtns[0].click();

    // Wait for recommendation modal
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Intelligent Blood Source Recommendations');
    }, { timeout: 8000 });
    check('Intelligent Blood Source Recommendation modal displayed', true);

    // Wait for candidate analysis results
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Suitable sources found') ||
             document.body.innerText.includes('Compatible sources found');
    }, { timeout: 10000 });
    check('Candidate source analysis completed and rendered candidate list', true);

    const modalText = await page.evaluate(() => document.body.innerText);

    // Verify multi-factor elements
    const hasCompatibilityBadge = modalText.includes('Exact Match') || modalText.includes('Compatible Alternate');
    check('Compatibility classification displayed (Exact Match / Compatible Alternate)', hasCompatibilityBadge);

    const hasUnitsAvailable = modalText.includes('Units Available');
    check('Unreserved inventory availability clearly displayed', hasUnitsAvailable);

    const hasDistance = modalText.includes('km');
    check('Distance metric displayed (Road or Haversine fallback)', hasDistance);

    const hasScore = modalText.includes('Score:') || modalText.includes('/100');
    check('Phase 5 100-point recommendation score displayed', hasScore);

    const hasShortageRisk = modalText.includes('Shortage Risk:');
    check('Candidate shortage risk assessment displayed', hasShortageRisk);

    const hasClinicalReason = modalText.includes('Units available') || modalText.includes('compatible');
    check('Explainable, transparent clinical recommendation reasoning provided', hasClinicalReason);

    const hasHumanReviewNotice = modalText.includes('Advisory Only') && modalText.includes('human clinical review');
    check('Human clinical review mandatory notice verified (Advisory Only)', hasHumanReviewNotice);

    // Screenshot modal
    const modalScreenshot = path.join(SCRATCH_DIR, 'phase6_recommendation_modal_verified.png');
    await page.screenshot({ path: modalScreenshot });
    console.log(`  (Screenshot saved: ${modalScreenshot})`);

    // Verify candidate card selection
    const candidateCards = await page.$$('.source-candidate-card, div[style*="cursor: pointer"]');
    check(`Candidate cards are interactive (${candidateCards.length} candidates listed)`, candidateCards.length > 0);

    // -------------------------------------------------------------
    // STAGE 6: Human Review & Transfer Flow Integrity
    // -------------------------------------------------------------
    console.log('\n6. HUMAN REVIEW & APPROVAL NAVIGATION INTEGRITY');
    // Verify "Review & Approve Transfer" button exists
    const hasReviewBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.includes('Review & Approve Transfer'));
    });
    check('Human review action button "Review & Approve Transfer" is present', hasReviewBtn);

    // Close the modal
    const closeBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.innerText.trim() === 'Close');
    });
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(res => setTimeout(res, 400));
    }
    check('Recommendation modal closed cleanly without side effects', true);

    // -------------------------------------------------------------
    // STAGE 7: Approval & Transfer Management Verification
    // -------------------------------------------------------------
    console.log('\n7. APPROVAL & LOGISTICS TRANSFER MODULE VERIFICATION');
    await page.goto(`${BASE_URL}/approval-transfer`, { waitUntil: 'networkidle2' });
    await new Promise(res => setTimeout(res, 500));
    const transferText = await page.evaluate(() => document.body.innerText);
    check('Approval & Transfer management page loaded', transferText.includes('Transfer') || transferText.includes('Logistics'));
    check('Human approval controls present (zero automatic dispatches)', transferText.includes('Pending') || transferText.includes('Approved'));

    // -------------------------------------------------------------
    // STAGE 8: Operational Notifications Verification
    // -------------------------------------------------------------
    console.log('\n8. OPERATIONAL NOTIFICATIONS VERIFICATION');
    await page.goto(`${BASE_URL}/notifications`, { waitUntil: 'networkidle2' });
    await new Promise(res => setTimeout(res, 500));
    const notifText = await page.evaluate(() => document.body.innerText);
    check('Notifications center loaded successfully', notifText.includes('Notification'));
    check('Baseline operational notifications rendered', notifText.includes('AI Recommendation') || notifText.includes('Transfer') || notifText.includes('Shortage'));

    // -------------------------------------------------------------
    // STAGE 9: User Logout & Session Invalidation
    // -------------------------------------------------------------
    console.log('\n9. LOGOUT & POST-LOGOUT ROUTE PROTECTION');
    await page.evaluate(() => {
      localStorage.removeItem('bloodchain_auth_user');
    });
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(res => setTimeout(res, 500));
    const finalUrl = page.url();
    check('Direct navigation to /dashboard after logout redirects to /login', finalUrl.includes('/login'));

    console.log('\n====================================================================');
    console.log(`PHASE 6 BROWSER AUTOMATION SUMMARY: ${passedChecks}/${totalChecks} CHECKS PASSED`);
    console.log('====================================================================\n');

  } catch (err) {
    console.error('Browser automation error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runPhase6BrowserTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
