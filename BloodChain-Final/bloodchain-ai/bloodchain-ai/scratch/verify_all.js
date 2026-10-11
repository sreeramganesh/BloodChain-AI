import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:5173';

const routes = [
  '/',
  '/about',
  '/features',
  '/how-it-works',
  '/impact',
  '/contact',
  '/register',
  '/login',
];

const viewports = [
  { name: 'Desktop (1920x1080)', width: 1920, height: 1080 },
  { name: 'Tablet (768x1024)', width: 768, height: 1024 },
  { name: 'Mobile (375x812)', width: 375, height: 812 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('=== 1. TESTING ALL PUBLIC ROUTES ===');
  for (const route of routes) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0' });
    const title = await page.title();
    const hasFooter = await page.evaluate(() => {
      const footer = document.querySelector('.bc-global-footer');
      return !!footer;
    });
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src);
    });

    console.log(`Route [${route}]: Title="${title}", HasFooter=${hasFooter}, BrokenImages=${brokenImages.length}`);
    if (brokenImages.length > 0) {
      console.log(`  Broken images:`, brokenImages);
    }
  }

  console.log('\n=== 2. TESTING INTERACTIVE FLOWS ===');
  // Flow 1: Features -> Get Started -> /register
  await page.goto(`${BASE_URL}/features`, { waitUntil: 'networkidle0' });
  const getStartedBtn = await page.waitForSelector('.features-cta-button');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
    getStartedBtn.click(),
  ]);
  console.log(`Flow 1 (Features -> Get Started): Final URL = ${page.url()}`);

  // Flow 2: Register -> Login link -> /login
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0' });
  const loginLink = await page.waitForSelector('.bc-already a');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
    loginLink.click(),
  ]);
  console.log(`Flow 2 (Register -> Login link): Final URL = ${page.url()}`);

  // Flow 3: Login -> Dashboard
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  const signInBtn = await page.waitForSelector('button[type="submit"]');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {}),
    signInBtn.click(),
  ]);
  console.log(`Flow 3 (Login -> Dashboard): Final URL = ${page.url()}`);

  // Flow 4: Dashboard -> Logout -> Login
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const btn = btns.find(b => b.innerText && b.innerText.includes('Logout'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  await new Promise(r => setTimeout(r, 1200));
  console.log(`Flow 4 (Dashboard -> Logout): Clicked=${clicked}, Final URL = ${page.url()}`);

  console.log('\n=== 3. TESTING RESPONSIVE VIEWPORTS ===');
  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    console.log(`\nTesting Viewport: ${vp.name}`);
    for (const route of ['/', '/about', '/features', '/contact', '/register', '/login']) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle0' });
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      console.log(`  Route ${route}: Horizontal Overflow = ${overflow}`);
    }
  }

  console.log('\n=== 4. CONSOLE ERRORS ===');
  console.log(`Total errors captured: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log(consoleErrors);
  }

  await browser.close();
  console.log('\nAll tests complete.');
})();
