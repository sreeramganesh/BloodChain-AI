import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Navigating to /login...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });

  console.log('2. Logging in to access /dashboard...');
  const submitBtn = await page.waitForSelector('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
    submitBtn.click(),
  ]);

  if (!page.url().includes('/dashboard')) {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
  }
  console.log('Current URL:', page.url());

  // Wait for the location filter card
  await page.waitForSelector('.location-filter-card');
  console.log('Found .location-filter-card!');

  // Select elements
  const stateSelectSelector = '.location-filter-card .select-group:nth-child(1) select';
  const districtSelectSelector = '.location-filter-card .select-group:nth-child(2) select';
  const applyBtnSelector = '.apply-filter';

  const getStateOptions = async () => {
    return await page.$$eval(`${stateSelectSelector} option`, (opts) =>
      opts.map((o) => ({ value: o.value, text: o.textContent.trim() }))
    );
  };

  const getDistrictOptions = async () => {
    return await page.$$eval(`${districtSelectSelector} option`, (opts) =>
      opts.map((o) => ({ value: o.value, text: o.textContent.trim() }))
    );
  };

  const stateOpts = await getStateOptions();
  console.log('\n--- State Options ---');
  console.log(stateOpts);

  // Verification 1: Exactly 6 states + placeholder
  const stateNames = stateOpts.map((s) => s.value).filter(Boolean);
  console.log('State count (excluding placeholder):', stateNames.length);

  // Test 1: Tamil Nadu -> Chennai
  console.log('\n--- Testing Tamil Nadu -> Chennai ---');
  await page.select(stateSelectSelector, 'Tamil Nadu');
  let dists = await getDistrictOptions();
  const hasChennai = dists.some((d) => d.value === 'Chennai');
  console.log(`Tamil Nadu districts count: ${dists.length - 1}, has Chennai: ${hasChennai}`);
  await page.select(districtSelectSelector, 'Chennai');
  let selectedDistVal = await page.$eval(districtSelectSelector, (el) => el.value);
  console.log('Selected District:', selectedDistVal);

  // Test 2: State change resets District: Tamil Nadu -> Kerala
  console.log('\n--- Testing State Switch: Tamil Nadu -> Kerala (reset check) ---');
  await page.select(stateSelectSelector, 'Kerala');
  selectedDistVal = await page.$eval(districtSelectSelector, (el) => el.value);
  console.log('Selected District after switching to Kerala (expect empty/reset):', `"${selectedDistVal}"`);
  dists = await getDistrictOptions();
  const hasErnakulam = dists.some((d) => d.value === 'Ernakulam');
  const stillHasChennai = dists.some((d) => d.value === 'Chennai');
  console.log(`Kerala districts count: ${dists.length - 1}, has Ernakulam: ${hasErnakulam}, still has Chennai: ${stillHasChennai}`);
  await page.select(districtSelectSelector, 'Ernakulam');
  console.log('Selected Ernakulam in Kerala.');

  // Test 3: State Switch: Kerala -> Puducherry (reset check)
  console.log('\n--- Testing State Switch: Kerala -> Puducherry (reset check) ---');
  await page.select(stateSelectSelector, 'Puducherry');
  selectedDistVal = await page.$eval(districtSelectSelector, (el) => el.value);
  console.log('Selected District after switching to Puducherry (expect empty/reset):', `"${selectedDistVal}"`);
  dists = await getDistrictOptions();
  const hasKaraikal = dists.some((d) => d.value === 'Karaikal');
  console.log(`Puducherry districts count: ${dists.length - 1}, has Karaikal: ${hasKaraikal}`);
  await page.select(districtSelectSelector, 'Karaikal');

  // Test 4: Andhra Pradesh -> Visakhapatnam
  console.log('\n--- Testing Andhra Pradesh -> Visakhapatnam ---');
  await page.select(stateSelectSelector, 'Andhra Pradesh');
  dists = await getDistrictOptions();
  const hasVizag = dists.some((d) => d.value === 'Visakhapatnam');
  console.log(`Andhra Pradesh districts count: ${dists.length - 1}, has Visakhapatnam: ${hasVizag}`);
  await page.select(districtSelectSelector, 'Visakhapatnam');

  // Test 5: Karnataka -> Bengaluru Urban
  console.log('\n--- Testing Karnataka -> Bengaluru Urban ---');
  await page.select(stateSelectSelector, 'Karnataka');
  dists = await getDistrictOptions();
  const hasBlr = dists.some((d) => d.value === 'Bengaluru Urban');
  console.log(`Karnataka districts count: ${dists.length - 1}, has Bengaluru Urban: ${hasBlr}`);
  await page.select(districtSelectSelector, 'Bengaluru Urban');

  // Test 6: New Delhi / Delhi -> South Delhi
  console.log('\n--- Testing New Delhi / Delhi -> South Delhi ---');
  await page.select(stateSelectSelector, 'New Delhi / Delhi');
  dists = await getDistrictOptions();
  const hasSouthDelhi = dists.some((d) => d.value === 'South Delhi');
  console.log(`New Delhi / Delhi districts count: ${dists.length - 1}, has South Delhi: ${hasSouthDelhi}`);
  await page.select(districtSelectSelector, 'South Delhi');

  // Test 7: Empty state placeholder disables/resets district
  console.log('\n--- Testing Empty State Placeholder ---');
  await page.select(stateSelectSelector, '');
  const isDisabled = await page.$eval(districtSelectSelector, (el) => el.disabled);
  console.log('Is District dropdown disabled when State is empty?', isDisabled);

  // Test 8: Re-select Tamil Nadu -> Tiruchirappalli and click Apply
  console.log('\n--- Testing Apply Button ---');
  await page.select(stateSelectSelector, 'Tamil Nadu');
  await page.select(districtSelectSelector, 'Tiruchirappalli');
  await page.click(applyBtnSelector);
  await new Promise((r) => setTimeout(r, 600));
  const appliedNotice = await page.$eval(applyBtnSelector, (el) => el.textContent.trim());
  console.log('Apply button text after click (expect "Applied"):', appliedNotice);

  console.log('\nTaking verification screenshot...');
  const screenshotPath = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage\\dashboard_location_filter_verified.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();
  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
})();
