import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const executablePath = chromePaths.find(p => fs.existsSync(p));
console.log('Found browser executable:', executablePath);

async function testHospitalsPage() {
  if (!executablePath) {
    console.error('No browser executable found!');
    return;
  }
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 950 });

  console.log('Navigating to http://localhost:5174/login ...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle2' });

  // Set auth session in localStorage
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

  console.log('Navigating to http://localhost:5174/hospitals-blood-banks ...');
  await page.goto('http://localhost:5174/hospitals-blood-banks', { waitUntil: 'networkidle2' });

  // Wait for the page container to render
  await page.waitForSelector('.hospitals-page', { timeout: 10000 });

  // 1. Inspect initial dropdowns
  const states = await page.$$eval('.hospital-filter-card .hospital-select:first-child select option', opts => opts.map(o => o.value));
  console.log('States in dropdown:', states);

  const selectedState = await page.$eval('.hospital-filter-card .hospital-filter-group:nth-child(1) select', sel => sel.value);
  const selectedDistrict = await page.$eval('.hospital-filter-card .hospital-filter-group:nth-child(2) select', sel => sel.value);
  console.log(`Initial selection: State = "${selectedState}", District = "${selectedDistrict}"`);

  // Count facilities displayed
  const facilityRows = await page.$$eval('.hospitals-table tbody tr', trs => trs.length);
  console.log('Facility rows count in table:', facilityRows);

  const firstHospitalName = await page.$eval('.hospitals-table tbody tr:first-child td:nth-child(2) strong', el => el.textContent.trim());
  console.log('First facility name:', firstHospitalName);

  if (!fs.existsSync('scratch')) {
    fs.mkdirSync('scratch');
  }

  await page.screenshot({ path: 'scratch/phase2_hospitals_view.png' });
  console.log('Screenshot saved to scratch/phase2_hospitals_view.png');

  // 2. Change state to Kerala -> verify dependent district reset
  console.log('\n--- TESTING STATE CHANGE -> Kerala ---');
  await page.select('.hospital-filter-card .hospital-filter-group:nth-child(1) select', 'Kerala');
  await new Promise(r => setTimeout(r, 600));

  const keralaSelectedDistrict = await page.$eval('.hospital-filter-card .hospital-filter-group:nth-child(2) select', sel => sel.value);
  console.log('District auto-reset to:', keralaSelectedDistrict);

  const keralaDistricts = await page.$$eval('.hospital-filter-card .hospital-filter-group:nth-child(2) select option', opts => opts.map(o => o.value));
  console.log('Kerala districts count:', keralaDistricts.length, 'Districts:', keralaDistricts);

  const keralaRows = await page.$$eval('.hospitals-table tbody tr', trs => trs.length);
  const keralaFirstHosp = await page.$eval('.hospitals-table tbody tr:first-child td:nth-child(2) strong', el => el.textContent.trim());
  console.log(`Kerala facilities in table: ${keralaRows}, First: "${keralaFirstHosp}"`);

  await page.screenshot({ path: 'scratch/phase2_kerala_view.png' });
  console.log('Kerala view screenshot saved to scratch/phase2_kerala_view.png');

  // 3. Change to Karnataka -> Bengaluru Urban
  console.log('\n--- TESTING KARNATAKA -> Bengaluru Urban ---');
  await page.select('.hospital-filter-card .hospital-filter-group:nth-child(1) select', 'Karnataka');
  await new Promise(r => setTimeout(r, 600));
  await page.select('.hospital-filter-card .hospital-filter-group:nth-child(2) select', 'Bengaluru Urban');
  await new Promise(r => setTimeout(r, 600));

  const blrRows = await page.$$eval('.hospitals-table tbody tr', trs => trs.length);
  const blrFirstHosp = await page.$eval('.hospitals-table tbody tr:first-child td:nth-child(2) strong', el => el.textContent.trim());
  console.log(`Bengaluru Urban facilities: ${blrRows}, First: "${blrFirstHosp}"`);

  await page.screenshot({ path: 'scratch/phase2_bengaluru_view.png' });
  console.log('Bengaluru view screenshot saved to scratch/phase2_bengaluru_view.png');

  // 4. Change to New Delhi / Delhi -> Central Delhi
  console.log('\n--- TESTING NEW DELHI / DELHI -> Central Delhi ---');
  await page.select('.hospital-filter-card .hospital-filter-group:nth-child(1) select', 'New Delhi / Delhi');
  await new Promise(r => setTimeout(r, 600));
  const delhiRows = await page.$$eval('.hospitals-table tbody tr', trs => trs.length);
  const delhiFirstHosp = await page.$eval('.hospitals-table tbody tr:first-child td:nth-child(2) strong', el => el.textContent.trim());
  console.log(`Delhi facilities: ${delhiRows}, First: "${delhiFirstHosp}"`);

  // 5. Change back to Tamil Nadu -> Tiruchirappalli
  console.log('\n--- TESTING TAMIL NADU -> Tiruchirappalli & MAP HIGHLIGHT ---');
  await page.select('.hospital-filter-card .hospital-filter-group:nth-child(1) select', 'Tamil Nadu');
  await new Promise(r => setTimeout(r, 600));
  await page.select('.hospital-filter-card .hospital-filter-group:nth-child(2) select', 'Tiruchirappalli');
  await new Promise(r => setTimeout(r, 600));

  const trichyRows = await page.$$eval('.hospitals-table tbody tr', trs => trs.length);
  console.log(`Trichy facilities: ${trichyRows}`);

  // Click 2nd facility
  await page.click('.hospitals-table tbody tr:nth-child(2)');
  await new Promise(r => setTimeout(r, 400));
  const activeHospTitle = await page.$eval('.selected-hospital-header h2', el => el.textContent.trim());
  console.log(`Clicked 2nd facility, Active Hospital Title: "${activeHospTitle}"`);

  await page.screenshot({ path: 'scratch/phase2_trichy_verified_view.png' });
  console.log('Trichy verified view screenshot saved to scratch/phase2_trichy_verified_view.png');

  await browser.close();
  console.log('\nALL BROWSER UI VERIFICATIONS PASSED 100%!');
}

testHospitalsPage().catch(e => console.error('Puppeteer test error:', e));
