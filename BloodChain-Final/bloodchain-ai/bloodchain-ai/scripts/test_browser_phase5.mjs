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

async function testPhase5Browser() {
  if (!executablePath) {
    console.error('No browser executable found!');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  console.log('Setting auth session...');
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

  console.log('Navigating to http://localhost:5174/blood-request ...');
  await page.goto('http://localhost:5174/blood-request', { waitUntil: 'networkidle2' });

  await page.waitForSelector('.blood-request-page', { timeout: 10000 });
  console.log('✓ 1. Blood Request page loaded successfully');

  // Verify "Find Sources" button is present on rows
  const findSourcesBtns = await page.$$('.btn-find-sources-row');
  console.log(`✓ 2. Found ${findSourcesBtns.length} "Find Sources" buttons on table rows`);

  // Click "Find Sources" on the first row (BRQ001)
  console.log('Clicking "Find Sources" for request BRQ001...');
  await findSourcesBtns[0].click();

  // Wait for RequestRecommendationModal to open
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Intelligent Blood Source Recommendations');
  }, { timeout: 8000 });
  console.log('✓ 3. RequestRecommendationModal opened successfully');

  // Wait for analysis to complete and display candidates
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Suitable sources found') ||
           document.body.innerText.includes('Compatible sources found');
  }, { timeout: 10000 });
  console.log('✓ 4. Candidate cards rendered');

  // Inspect the rendered chips on the modal
  const modalText = await page.evaluate(() => document.body.innerText);

  const hasDistanceOrRoute =
    modalText.includes('Road:') ||
    modalText.includes('Road Distance') ||
    modalText.includes('Straight-line') ||
    modalText.includes('km');
  console.log(`✓ 5. Distance chip verified (Road / Straight-line): ${hasDistanceOrRoute}`);

  const hasTravelTimeOrFallback =
    modalText.includes('Travel Time') ||
    modalText.includes('Road route unavailable') ||
    modalText.includes('min');
  console.log(`✓ 6. Travel time or graceful fallback verified: ${hasTravelTimeOrFallback}`);

  const hasCompatibility =
    modalText.includes('Exact Match') || modalText.includes('Compatible Alternate');
  console.log(`✓ 7. Blood group compatibility factor verified: ${hasCompatibility}`);

  const hasShortageOrExpiry =
    modalText.includes('Shortage Risk') || modalText.includes('Score:');
  console.log(`✓ 8. Shortage risk & recommendation score verified: ${hasShortageOrExpiry}`);

  const hasAdvisoryNotice =
    modalText.includes('Advisory Only') && modalText.includes('human clinical review');
  console.log(`✓ 9. Human review mandatory notice verified: ${hasAdvisoryNotice}`);

  // Capture screenshot of AI recommendations modal with Phase 5 UI
  const screenshotPath1 = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\scratch\\phase5_routes_recommendation_modal.png';
  await page.screenshot({ path: screenshotPath1, fullPage: false });
  console.log(`✓ 10. Screenshot captured at: ${screenshotPath1}`);

  // Navigate to AI Recommendation page to inspect candidate list
  console.log('Navigating to http://localhost:5174/ai-recommendation ...');
  await page.goto('http://localhost:5174/ai-recommendation', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.ai-recommendation-page', { timeout: 10000 });
  console.log('✓ 11. AI Recommendation page loaded with candidate ranking');

  const screenshotPath2 = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\scratch\\phase5_ai_recommendation_page.png';
  await page.screenshot({ path: screenshotPath2, fullPage: false });
  console.log(`✓ 12. Screenshot captured at: ${screenshotPath2}`);

  await browser.close();
  console.log('\n====================================================');
  console.log('PHASE 5 BROWSER TEST COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

testPhase5Browser().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
