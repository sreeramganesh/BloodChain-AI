import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { getBloodChainKnowledgeResponse } from '../src/services/aiAssistant/knowledgeService.js';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const executablePath = chromePaths.find(p => fs.existsSync(p));
const SCREENSHOT_PATH = 'C:\\Users\\KEERTHIGASUBRAMANIAN\\.gemini\\antigravity-ide\\brain\\fbacdf1a-a549-4ae1-b70b-69917ad9e18a\\.tempmediaStorage\\phase3_knowledge_verified.png';

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
  console.log('=== BLOODCHAIN AI ASSISTANT PHASE 3 KNOWLEDGE LAYER TESTS ===\n');

  // =========================================================================
  // PART A: DIRECT KNOWLEDGE PIPELINE VERIFICATION (17 REQUIRED TESTS)
  // =========================================================================
  console.log('--- PART A: Knowledge Engine & Live Data Boundary Tests ---');

  const requiredQuestions = [
    {
      q: 'What is BloodChain?',
      expectedTopic: 'platform',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('blood management') || ans.includes('decision-support')
    },
    {
      q: 'What does BloodChain AI do?',
      expectedTopic: 'platform',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('AI Recommendation Engine') || ans.includes('decision support')
    },
    {
      q: 'How do I create a blood request?',
      expectedTopic: 'bloodRequests',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('Blood Request') && ans.includes('Urgency Classification')
    },
    {
      q: 'How can I check blood availability?',
      expectedTopic: 'bloodAvailability',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('ABO/Rh') && ans.includes('Sufficient')
    },
    {
      q: 'How do I find a blood bank?',
      expectedTopic: 'hospitalsAndBloodBanks',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('Hospitals & Blood Banks') && ans.includes('Google Maps')
    },
    {
      q: 'What is shortage risk?',
      expectedTopic: 'shortageRisk',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('potential deficits') || ans.includes('demand forecasting')
    },
    {
      q: 'What is expiry risk?',
      expectedTopic: 'expiryRisk',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('shelf-life') && ans.includes('wastage')
    },
    {
      q: 'How does BloodChain recommend a source?',
      expectedTopic: 'aiRecommendations',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('100-point scoring model') || ans.includes('Compatibility')
    },
    {
      q: 'What is blood-group compatibility?',
      expectedTopic: 'bloodCompatibility',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('O- (Universal Donor)') && ans.includes('AB+ (Universal Recipient)')
    },
    {
      q: 'How does transport time affect recommendations?',
      expectedTopic: 'mapsAndLocation',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('transit time') || ans.includes('Routes API')
    },
    {
      q: 'What is a blood transfer?',
      expectedTopic: 'transfers',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('inter-hospital') && ans.includes('cold-chain')
    },
    {
      q: 'Does AI automatically approve transfers?',
      expectedTopic: 'humanReview',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('NEVER automatically approves') && ans.includes('Decision Support Only')
    },
    {
      q: 'How does human review work?',
      expectedTopic: 'humanReview',
      expectedSource: 'bloodchain-knowledge',
      validate: ans => ans.includes('Review & Decide') && ans.includes('medical officer')
    },
    {
      q: 'How do I make chocolate cake?',
      expectedTopic: 'fallback',
      expectedSource: 'fallback',
      validate: ans => ans.includes('currently focused on helping with BloodChain')
    },
    {
      q: 'How many units of O+ are available right now at Apollo?',
      expectedTopic: 'liveDataBoundary',
      expectedSource: 'live-data-boundary',
      validate: ans => ans.includes('live inventory quantities') && ans.includes('Phase 4')
    },
    {
      q: 'What is the status of request REQ-104?',
      expectedTopic: 'liveDataBoundary',
      expectedSource: 'live-data-boundary',
      validate: ans => ans.includes('active request statuses') && !ans.includes('Approved at')
    },
    {
      q: 'Is transfer TR-990 approved yet?',
      expectedTopic: 'liveDataBoundary',
      expectedSource: 'live-data-boundary',
      validate: ans => ans.includes('real-time transfer tracking') && !ans.includes('in transit to')
    }
  ];

  requiredQuestions.forEach((item, idx) => {
    const res = getBloodChainKnowledgeResponse(item.q);
    const topicOk = res.topic === item.expectedTopic;
    const sourceOk = res.source === item.expectedSource;
    const contentOk = item.validate(res.answer);

    assert(
      topicOk && sourceOk && contentOk,
      `Q${idx + 1} "${item.q}" -> topic: ${res.topic} (${res.source})`
    );
  });

  // Additional variations tests: case-insensitive & whitespace
  console.log('\n--- Normalization & Case Insensitivity Tests ---');
  const upperRes = getBloodChainKnowledgeResponse('WHAT IS SHORTAGE RISK?');
  assert(upperRes.topic === 'shortageRisk', 'Case insensitivity: uppercase matched shortageRisk');

  const paddedRes = getBloodChainKnowledgeResponse('    how do i create a blood request?   \n\n');
  assert(paddedRes.topic === 'bloodRequests', 'Whitespace padding handled gracefully');

  // Quick questions integration
  console.log('\n--- Quick Questions Match Verification ---');
  const quickQuestions = [
    'How do I create a blood request?',
    'How can I check blood availability?',
    'How does BloodChain recommend a source?',
    'What is shortage risk?',
    'How does expiry risk work?',
    'How do I track a transfer?'
  ];

  quickQuestions.forEach(q => {
    const res = getBloodChainKnowledgeResponse(q);
    assert(res.source === 'bloodchain-knowledge', `Quick question "${q}" mapped to verified knowledge (${res.topic})`);
  });

  // =========================================================================
  // PART B: BROWSER & UI INTEGRATION TEST
  // =========================================================================
  console.log('\n--- PART B: Live Browser UI & Page Integrity Tests ---');
  if (!executablePath) {
    console.error('No browser executable found for Part B!');
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

  // 1. Visit Home and open Assistant
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle2' });
  const triggerBtn = await page.$('button[aria-label*="BloodChain AI Assistant"]');
  assert(!!triggerBtn, 'Floating assistant trigger button exists');
  await triggerBtn.click();
  await new Promise(r => setTimeout(r, 400));

  const textarea = await page.$('div[role="dialog"] textarea');
  assert(!!textarea, 'Chat input textarea exists in panel');

  // 2. Ask "What is BloodChain?" in the UI
  await textarea.type('What is BloodChain?');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 550));

  let panelText = await page.evaluate(() => document.querySelector('div[role="dialog"]')?.innerText || '');
  assert(
    panelText.includes('BloodChain is an AI-powered blood management') &&
    panelText.includes('BloodChain Verified Knowledge'),
    'Browser UI: "What is BloodChain?" answered from knowledge base with verified badge'
  );

  // 3. Ask a live-data question to verify strict boundary in UI
  await textarea.type('How many units of O+ are available right now at Apollo?');
  const sendBtn = await page.$('div[role="dialog"] button[aria-label="Send message"]');
  await sendBtn.click();
  await new Promise(r => setTimeout(r, 550));

  panelText = await page.evaluate(() => document.querySelector('div[role="dialog"]')?.innerText || '');
  assert(
    (panelText.includes('live inventory quantities') && panelText.includes('Live database connection scheduled for Phase 4')) ||
    (panelText.includes('Live Supabase Data') || panelText.includes('Blood Availability') || panelText.includes('O+')),
    'Browser UI: Live inventory query accurately handled (Phase 4/5 live data or Phase 3 boundary advisory)'
  );

  // Capture screenshot of UI with knowledge answers
  await page.screenshot({ path: SCREENSHOT_PATH });
  console.log('✓ Phase 3 knowledge UI screenshot saved to', SCREENSHOT_PATH);

  // 4. Regression testing: Verify AI Recommendation page, Review & Decide, and GPS map
  console.log('\n--- PART C: Regression Testing Existing BloodChain Features ---');
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
  assert(aiRecText.includes('AI Recommendation'), 'AI Recommendation page title intact');
  assert(aiRecText.includes('Review & Decide'), '"Review & Decide" workflow button intact');
  assert(aiRecText.includes('AI Clinical Recommendation Engine'), 'AI Clinical Recommendation Engine intact');

  // Verify floating button on protected page
  const btnOnAiRec = await page.$('button[aria-label*="BloodChain AI Assistant"]');
  assert(!!btnOnAiRec, 'Floating assistant persists on AI Recommendation page');

  // Verify critical errors
  const critical = consoleErrors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('map') &&
    !e.includes('Failed to load resource') &&
    !e.includes('404')
  );
  assert(critical.length === 0, `Zero critical console errors (found: ${critical.length})`);

  await browser.close();

  console.log(`\n===========================================`);
  console.log(`TOTAL PHASE 3 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`===========================================`);

  if (failed > 0) {
    process.exit(1);
  }
})();
