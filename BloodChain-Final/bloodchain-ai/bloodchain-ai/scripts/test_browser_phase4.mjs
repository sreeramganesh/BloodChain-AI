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

async function testPhase4Browser() {
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
  console.log('✓ Blood Request page loaded');

  // Verify "Find Sources" button is present on rows
  const findSourcesBtns = await page.$$('.btn-find-sources-row');
  console.log(`✓ Found ${findSourcesBtns.length} "Find Sources" buttons on table rows`);

  // Click "Find Sources" on the first row (BRQ001)
  console.log('Clicking "Find Sources" for request BRQ001...');
  await findSourcesBtns[0].click();

  // Wait for RequestRecommendationModal to open
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Intelligent Blood Source Recommendations');
  }, { timeout: 8000 });
  console.log('✓ RequestRecommendationModal opened successfully');

  // Wait for analysis to complete and display candidates
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Suitable sources found') ||
           document.body.innerText.includes('Compatible sources found');
  }, { timeout: 8000 });
  console.log('✓ AI Source analysis completed with suitable sources found');

  // Capture screenshot of AI recommendations modal
  const screenshotPath1 = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\scratch\\phase4_ai_recommendations_modal.png';
  await page.screenshot({ path: screenshotPath1, fullPage: false });
  console.log(`✓ Screenshot saved to: ${screenshotPath1}`);

  // Close modal via close button
  console.log('Closing recommendation modal...');
  await page.click('.btn-close-rec-modal');
  await new Promise(r => setTimeout(r, 600));

  // Now click "View" on the first request to inspect detail modal
  console.log('Clicking "View" button for request details...');
  await page.click('.view-request-button:first-child');
  await page.waitForSelector('.btn-find-sources-detail', { timeout: 5000 });

  const detailFindSourcesVisible = await page.$('.btn-find-sources-detail') !== null;
  console.log(`✓ "Find Suitable Blood Sources" button visible in Request Detail modal: ${detailFindSourcesVisible}`);

  // Click "Find Suitable Blood Sources" inside Detail modal
  console.log('Clicking "Find Suitable Blood Sources" inside Request Detail modal...');
  await page.click('.btn-find-sources-detail');
  await page.waitForFunction(() => {
    return document.body.innerText.includes('Intelligent Blood Source Recommendations');
  }, { timeout: 8000 });
  console.log('✓ Successfully triggered source recommendations from Request Detail modal');

  // Close recommendation modal again
  await page.click('.btn-close-rec-modal');
  await new Promise(r => setTimeout(r, 600));

  // Navigate to AI Recommendation page
  console.log('Navigating to http://localhost:5174/ai-recommendation ...');
  await page.goto('http://localhost:5174/ai-recommendation', { waitUntil: 'networkidle2' });
  await page.waitForSelector('.ai-recommendation-page', { timeout: 10000 });
  console.log('✓ AI Recommendation page loaded');

  const screenshotPath2 = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\scratch\\phase4_ai_recommendation_page.png';
  await page.screenshot({ path: screenshotPath2, fullPage: false });
  console.log(`✓ Screenshot saved to: ${screenshotPath2}`);

  await browser.close();
  console.log('\n====================================================');
  console.log('PHASE 4 BROWSER TEST COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

testPhase4Browser().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
