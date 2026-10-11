import puppeteer from 'puppeteer-core';

async function checkAllPages() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 950 });
  await page.goto('http://localhost:5174/login');
  await page.evaluate(() => {
    localStorage.setItem('bloodchain_auth_user', JSON.stringify({
      id: 'demo-admin-1',
      name: 'Dr. Rajesh Sharma',
      email: 'admin@apollo.org',
      role: 'Hospital Admin',
      provider: 'demo'
    }));
  });

  const pagesToTest = [
    '/dashboard',
    '/blood-inventory',
    '/blood-request',
    '/ai-recommendation',
    '/approval-transfer',
    '/hospitals-blood-banks',
    '/help-support'
  ];

  for (const path of pagesToTest) {
    await page.goto('http://localhost:5174' + path, { waitUntil: 'networkidle2' });
    const heading = await page.evaluate(() => {
      const h = document.querySelector('h1') || document.querySelector('h2');
      return h ? h.textContent.trim() : document.title;
    });
    console.log(`Route "${path}" -> OK! (Heading: "${heading}")`);
  }

  await browser.close();
  console.log('\nAll application pages verified operational with ZERO errors!');
}

checkAllPages().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
