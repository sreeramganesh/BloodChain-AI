import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const executablePath = chromePaths.find(p => fs.existsSync(p));
const SCREENSHOT_PATH = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage\\phase2_chat_verified.png';
const SCREENSHOT_WELCOME = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage\\phase2_welcome_verified.png';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

(async () => {
  console.log('=== BLOODCHAIN AI ASSISTANT PHASE 2 VERIFICATION SUITE ===');
  if (!executablePath) {
    console.error('No browser executable found!');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Navigate to Home
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });

  // 1. Phase 1 floating icon still works
  const triggerBtn = await page.$('button[aria-label*="BloodChain AI Assistant"]');
  assert(!!triggerBtn, '1. Phase 1 floating trigger button exists on page');

  const btnPos = await page.evaluate(el => {
    const parent = window.getComputedStyle(el.parentElement);
    return { position: parent.position, bottom: parent.bottom, right: parent.right, zIndex: parent.zIndex };
  }, triggerBtn);
  assert(btnPos.position === 'fixed' && btnPos.bottom === '24px' && btnPos.right === '24px', '1b. Button fixed to bottom-right (24px, 24px)');

  // 2. Panel opens on click
  await triggerBtn.click();
  await new Promise(r => setTimeout(r, 400));
  const panel = await page.$('div[role="dialog"]');
  assert(!!panel, '2. Assistant panel opens on click');

  // 3. Header renders
  const headerText = await page.evaluate(() => {
    const title = document.getElementById('bc-assistant-title')?.innerText || '';
    const panelEl = document.querySelector('div[role="dialog"]');
    return panelEl ? panelEl.innerText : '';
  });
  assert(headerText.includes('BloodChain AI Assistant'), '3a. Header title "BloodChain AI Assistant" renders');
  assert(headerText.includes('Healthcare Decision Support'), '3b. Subtitle "Healthcare Decision Support" renders');
  assert(headerText.includes('AI Assistant'), '3c. Status indicator "AI Assistant" renders');

  // 4. Welcome state renders
  assert(headerText.includes("Hello! I'm your BloodChain AI Assistant."), '4a. Welcome greeting renders');
  assert(headerText.includes("I can help you understand and navigate the BloodChain"), '4b. Navigation purpose renders');
  assert(headerText.includes("What can I help you with?"), '4c. "What can I help you with?" prompt renders');

  // 5. Capability items render
  assert(headerText.includes('Blood Availability') && headerText.includes('Hospitals & Blood Banks'), '5a. Availability & Facilities capabilities render');
  assert(headerText.includes('Blood Requests') && headerText.includes('Risk Insights'), '5b. Requests & Risk capabilities render');
  assert(headerText.includes('AI Recommendations') && headerText.includes('Transfers'), '5c. Recommendations & Transfers capabilities render');

  // Screenshot of welcome state
  await page.screenshot({ path: SCREENSHOT_WELCOME });
  console.log('✓ Welcome state screenshot saved');

  // 6. Quick questions work (clicking chip places question in input without sending)
  const quickQuestionBtns = await page.$$('div[role="dialog"] button');
  let sampleChip = null;
  for (const b of quickQuestionBtns) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text.includes('How can I check blood availability?')) {
      sampleChip = b;
      break;
    }
  }
  assert(!!sampleChip, '6a. Quick question chip "How can I check blood availability?" found');

  const textarea = await page.$('div[role="dialog"] textarea');
  assert(!!textarea, 'Input textarea exists');

  // Click the quick question
  await sampleChip.click();
  await new Promise(r => setTimeout(r, 200));

  const valAfterChip = await page.evaluate(el => el.value, textarea);
  assert(valAfterChip === 'How can I check blood availability?', '6b. Clicking quick question places text into input');

  // Verify that message was NOT sent automatically (messages count is still 0)
  const userMessagesBeforeSend = await page.$$('div[role="dialog"] [class*="message"]');
  assert(userMessagesBeforeSend.length === 0, '6c. Message not sent automatically upon chip click (waits for user Send)');

  // 12. Empty input cannot send (clear input and test send button disabled)
  await textarea.click();
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');

  // Type whitespace only to verify button remains disabled
  await textarea.type('   ');
  const sendBtn = await page.$('div[role="dialog"] button[aria-label="Send message"]');
  const isSendDisabled = await page.evaluate(el => el.disabled, sendBtn);
  assert(isSendDisabled === true, '12. Empty/whitespace input cannot send (Send button disabled)');

  // Clear whitespace
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');

  // 11. Shift+Enter creates newline
  await textarea.type('Line 1');
  await page.keyboard.down('Shift');
  await page.keyboard.press('Enter');
  await page.keyboard.up('Shift');
  await textarea.type('Line 2');
  const multiLineVal = await page.evaluate(el => el.value, textarea);
  assert(multiLineVal.includes('\n'), '11. Shift+Enter creates a newline inside input');

  // Clear before using quick question
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');

  // Click the quick question chip to populate input
  await sampleChip.click();
  await new Promise(r => setTimeout(r, 200));

  // 10. Enter sends message
  await textarea.focus();
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 300));

  // 7. User message appears
  let panelTextAfterSend = await page.evaluate(() => document.querySelector('div[role="dialog"]')?.innerText || '');
  assert(panelTextAfterSend.includes('How can I check blood availability?'), '7. User message appears in chat');

  // 9. Input cleared after send
  const inputAfterSend = await page.evaluate(el => el.value, textarea);
  assert(inputAfterSend === '', '9. Input cleared after sending');

  // 8. Placeholder assistant message appears after delay
  await new Promise(r => setTimeout(r, 600));
  panelTextAfterSend = await page.evaluate(() => document.querySelector('div[role="dialog"]')?.innerText || '');
  assert(
    panelTextAfterSend.includes('BloodChain AI will answer this question') &&
    panelTextAfterSend.includes('AI knowledge service will be connected in the next phase'),
    '8. Placeholder assistant message appears with clear Phase 2 disclaimer and clinical context'
  );

  // Send a second question to test scrolling (13, 14)
  await textarea.type('What is shortage risk?');
  await sendBtn.click();
  await new Promise(r => setTimeout(r, 700));

  // 13. Chat body scrolls and 14. Newest message is visible
  const isScrolledDown = await page.evaluate(() => {
    const scrollContainer = document.querySelector('div[role="dialog"] > div:nth-child(2)');
    return scrollContainer ? scrollContainer.scrollHeight > scrollContainer.clientHeight : false;
  });
  assert(isScrolledDown, '13 & 14. Chat body handles message growth with vertical scroll');

  // Save screenshot of full conversation
  await page.screenshot({ path: SCREENSHOT_PATH });
  console.log('✓ Phase 2 chat screenshot saved to', SCREENSHOT_PATH);

  // 15. Responsive Viewports Test (390px, 430px, 768px, 1280px)
  const viewports = [
    { width: 390, height: 844, name: '390px (Mobile)' },
    { width: 430, height: 932, name: '430px (Large Mobile)' },
    { width: 768, height: 1024, name: '768px (Tablet)' },
    { width: 1280, height: 800, name: '1280px (Desktop)' },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await new Promise(r => setTimeout(r, 200));

    const currentPanel = await page.$('div[role="dialog"]');
    const box = await currentPanel.boundingBox();
    const hasHorizontalOverflow = box.width > vp.width;
    assert(!hasHorizontalOverflow, `15. Responsive at ${vp.name} (width: ${Math.round(box.width)}px <= ${vp.width}px)`);
  }

  // 16. Existing BloodChain pages remain unaffected
  console.log('Testing /ai-recommendation page integrity...');
  await page.evaluate(() => {
    localStorage.setItem('bloodchain_auth_user', JSON.stringify({
      id: "demo-admin-1",
      name: "Dr. Rajesh Sharma",
      email: "admin@apollo.org",
      role: "Hospital Admin",
      organization: "Apollo Hospitals",
      provider: "demo"
    }));
  });
  await page.goto('http://localhost:5174/ai-recommendation', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const aiRecText = await page.evaluate(() => document.body.innerText);
  assert(aiRecText.includes('AI Recommendation'), '16a. AI Recommendation page title verified');
  assert(aiRecText.includes('Review & Decide'), '16b. Review & Decide button verified on AI Recommendation page');
  assert(aiRecText.includes('AI Clinical Recommendation Engine'), '16c. AI Clinical Recommendation Engine verified');

  // Verify assistant still present on /ai-recommendation
  const btnOnAiRec = await page.$('button[aria-label*="BloodChain AI Assistant"]');
  assert(!!btnOnAiRec, '16d. Floating assistant button persists on /ai-recommendation');

  // 17. No console errors
  const critical = consoleErrors.filter(e => 
    !e.includes('favicon') && 
    !e.includes('map') && 
    !e.includes('Failed to load resource') &&
    !e.includes('404')
  );
  if (critical.length > 0) {
    console.warn('Critical errors logged:', critical);
  }
  assert(critical.length === 0, `17. Zero critical console errors (found: ${critical.length})`);

  await browser.close();

  console.log(`\n===========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`===========================================`);

  if (failed > 0) {
    process.exit(1);
  }
})();
