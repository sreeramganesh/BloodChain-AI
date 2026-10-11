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

  console.log('2. Clicking Sign In to Dashboard...');
  const signInBtn = await page.waitForSelector('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
    signInBtn.click(),
  ]);
  console.log('URL after login:', page.url());

  console.log('3. Finding and clicking Logout button...');
  await page.waitForSelector('.sidebar-bottom-menu button');
  const logoutBtn = await page.$('.sidebar-bottom-menu button');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
    logoutBtn.click(),
  ]);
  console.log('URL after logout:', page.url());

  await browser.close();
  console.log('Auth flow test complete!');
})();
