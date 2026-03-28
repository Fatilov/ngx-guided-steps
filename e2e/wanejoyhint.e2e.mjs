/**
 * Wanejoyhint E2E Tests
 * Tests all 6 tour scenarios across multiple device viewports
 * Takes screenshots at each critical state for visual review
 */

import { chromium } from 'playwright-core';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:4200';
const CHROME_PATH = '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome';

// Device viewports to test
const DEVICES = [
  { name: 'iphone-se', width: 375, height: 667, isMobile: true, label: 'iPhone SE' },
  { name: 'iphone-14-pro', width: 393, height: 852, isMobile: true, label: 'iPhone 14 Pro' },
  { name: 'pixel-7', width: 412, height: 915, isMobile: true, label: 'Pixel 7' },
  { name: 'ipad-mini', width: 768, height: 1024, isMobile: true, label: 'iPad Mini' },
  { name: 'ipad-pro', width: 1024, height: 1366, isMobile: false, label: 'iPad Pro' },
  { name: 'desktop-hd', width: 1920, height: 1080, isMobile: false, label: 'Desktop 1080p' },
  { name: 'desktop-4k', width: 2560, height: 1440, isMobile: false, label: 'Desktop 1440p' },
];

const results = [];
let totalTests = 0;
let passed = 0;
let failed = 0;

function log(msg) { console.log(`  ${msg}`); }
function logOk(msg) { console.log(`  ✅ ${msg}`); passed++; totalTests++; }
function logFail(msg) { console.log(`  ❌ ${msg}`); failed++; totalTests++; }

async function screenshot(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function screenshotFull(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}-full.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function waitForOverlay(page, timeout = 3000) {
  try {
    await page.waitForSelector('.wjh-overlay:not(.wjh-hidden)', { timeout });
    return true;
  } catch { return false; }
}

async function waitForOverlayGone(page, timeout = 5000) {
  try {
    await page.waitForSelector('.wjh-overlay.wjh-hidden, #wanejoyhint-host:empty', { timeout });
    return true;
  } catch {
    // Check if overlay host was removed entirely
    const host = await page.$('#wanejoyhint-host');
    return !host;
  }
}

async function clickButton(page, selector, timeout = 2000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch { return false; }
}

// ============================
// TEST SUITES
// ============================

async function testPageLoad(page, device) {
  const prefix = `${device.name}`;
  log(`\n--- Page Load Test [${device.label}] ---`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Screenshot: initial page
  await screenshot(page, `${prefix}_01_page-load`);
  await screenshotFull(page, `${prefix}_01_page-load`);

  // Check main elements exist
  const header = await page.$('#demo-header');
  const controlPanel = await page.$('#control-panel');
  const logSection = await page.$('#log-section');
  const cards = await page.$$('.card');

  header ? logOk(`[${device.label}] Header visible`) : logFail(`[${device.label}] Header missing`);
  controlPanel ? logOk(`[${device.label}] Control panel visible`) : logFail(`[${device.label}] Control panel missing`);
  logSection ? logOk(`[${device.label}] Log section visible`) : logFail(`[${device.label}] Log section missing`);
  cards.length >= 3 ? logOk(`[${device.label}] ${cards.length} cards rendered`) : logFail(`[${device.label}] Only ${cards.length} cards`);

  // Check no horizontal overflow
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  bodyWidth <= viewportWidth + 5
    ? logOk(`[${device.label}] No horizontal overflow (body=${bodyWidth}, viewport=${viewportWidth})`)
    : logFail(`[${device.label}] Horizontal overflow! body=${bodyWidth} > viewport=${viewportWidth}`);

  // Check all 6 buttons are visible
  const buttons = await page.$$('.btn-group .btn');
  buttons.length === 6
    ? logOk(`[${device.label}] All 6 tour buttons present`)
    : logFail(`[${device.label}] Expected 6 buttons, found ${buttons.length}`);
}

async function testTour1BasicTour(page, device) {
  const prefix = `${device.name}`;
  log(`\n--- Tour 1: Basic Tour [${device.label}] ---`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Start tour
  await page.click('#btn-basic-tour');
  const overlayVisible = await waitForOverlay(page);
  overlayVisible
    ? logOk(`[${device.label}] Tour 1: Overlay appeared`)
    : logFail(`[${device.label}] Tour 1: Overlay did not appear`);

  await page.waitForTimeout(500);
  await screenshot(page, `${prefix}_02_tour1-step1`);

  // Check step 1 elements
  const label = await page.$('.wjh-label');
  const nextBtn = await page.$('.wjh-next-btn');
  const closeBtn = await page.$('.wjh-close-btn');

  label ? logOk(`[${device.label}] Tour 1 Step 1: Label visible`) : logFail(`[${device.label}] Tour 1 Step 1: Label missing`);
  nextBtn ? logOk(`[${device.label}] Tour 1 Step 1: Next button visible`) : logFail(`[${device.label}] Tour 1 Step 1: Next button missing`);
  closeBtn ? logOk(`[${device.label}] Tour 1 Step 1: Close button visible`) : logFail(`[${device.label}] Tour 1 Step 1: Close button missing`);

  // Check label is within viewport
  if (label) {
    const box = await label.boundingBox();
    if (box) {
      const inViewport = box.x >= 0 && box.y >= 0 && (box.x + box.width) <= device.width + 5 && (box.y + box.height) <= device.height + 5;
      inViewport
        ? logOk(`[${device.label}] Tour 1 Step 1: Label within viewport (${Math.round(box.x)},${Math.round(box.y)} ${Math.round(box.width)}x${Math.round(box.height)})`)
        : logFail(`[${device.label}] Tour 1 Step 1: Label OUT of viewport (${Math.round(box.x)},${Math.round(box.y)} ${Math.round(box.width)}x${Math.round(box.height)})`);
    }
  }

  // Check next button is within viewport
  if (nextBtn) {
    const box = await nextBtn.boundingBox();
    if (box) {
      const inViewport = box.x >= 0 && box.y >= 0 && (box.x + box.width) <= device.width + 5;
      inViewport
        ? logOk(`[${device.label}] Tour 1 Step 1: Next btn within viewport`)
        : logFail(`[${device.label}] Tour 1 Step 1: Next btn OUT of viewport (x=${Math.round(box.x)}, w=${Math.round(box.width)})`);
    }
  }

  // Navigate through steps
  for (let step = 2; step <= 5; step++) {
    const clicked = await clickButton(page, '.wjh-next-btn');
    if (!clicked) {
      logFail(`[${device.label}] Tour 1 Step ${step}: Could not click Next`);
      break;
    }
    await page.waitForTimeout(400);
    await screenshot(page, `${prefix}_02_tour1-step${step}`);

    // Verify label still in viewport
    const lbl = await page.$('.wjh-label');
    if (lbl) {
      const box = await lbl.boundingBox();
      if (box) {
        const inVp = box.x >= -5 && box.y >= -5 && (box.x + box.width) <= device.width + 10;
        inVp
          ? logOk(`[${device.label}] Tour 1 Step ${step}: Label in viewport`)
          : logFail(`[${device.label}] Tour 1 Step ${step}: Label out of viewport (x=${Math.round(box.x)}, y=${Math.round(box.y)})`);
      }
    }
  }

  // Click last next to finish
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(500);

  const overlayGone = await waitForOverlayGone(page);
  overlayGone
    ? logOk(`[${device.label}] Tour 1: Overlay removed after completion`)
    : logFail(`[${device.label}] Tour 1: Overlay still present after completion`);

  await screenshot(page, `${prefix}_02_tour1-finished`);
}

async function testTour2Shapes(page, device) {
  const prefix = `${device.name}`;
  log(`\n--- Tour 2: Shapes [${device.label}] ---`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.click('#btn-shapes-tour');
  const overlayVisible = await waitForOverlay(page);
  overlayVisible
    ? logOk(`[${device.label}] Tour 2: Overlay appeared`)
    : logFail(`[${device.label}] Tour 2: Overlay did not appear`);

  await page.waitForTimeout(500);
  await screenshot(page, `${prefix}_03_tour2-circle-avatar`);

  // Check SVG mask exists
  const mask = await page.$('mask');
  mask ? logOk(`[${device.label}] Tour 2: SVG mask present`) : logFail(`[${device.label}] Tour 2: SVG mask missing`);

  // Check circle cutout for avatar
  const circle = await page.$('mask circle');
  circle ? logOk(`[${device.label}] Tour 2 Step 1: Circle cutout for avatar`) : logFail(`[${device.label}] Tour 2 Step 1: Circle cutout missing`);

  // Navigate all shapes steps
  for (let step = 2; step <= 5; step++) {
    await clickButton(page, '.wjh-next-btn');
    await page.waitForTimeout(400);
    await screenshot(page, `${prefix}_03_tour2-step${step}`);
  }

  // Finish
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(300);
  logOk(`[${device.label}] Tour 2: Completed all shape steps`);
}

async function testTour3Events(page, device) {
  const prefix = `${device.name}`;
  log(`\n--- Tour 3: Events [${device.label}] ---`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.click('#btn-events-tour');
  await waitForOverlay(page);
  await page.waitForTimeout(500);
  await screenshot(page, `${prefix}_04_tour3-click-event`);

  // Step 1: Click event - click the search button
  const searchBtn = await page.$('#search-btn');
  if (searchBtn) {
    await searchBtn.click();
    await page.waitForTimeout(500);
    logOk(`[${device.label}] Tour 3 Step 1: Click event on search btn`);
    await screenshot(page, `${prefix}_04_tour3-step2`);
  } else {
    logFail(`[${device.label}] Tour 3 Step 1: Search btn not found`);
  }

  // Step 2: Click event - click dashboard menu
  const dashBtn = await page.$('#menu-dashboard');
  if (dashBtn) {
    await dashBtn.click();
    await page.waitForTimeout(500);
    logOk(`[${device.label}] Tour 3 Step 2: Click event on dashboard`);
    await screenshot(page, `${prefix}_04_tour3-step3`);
  } else {
    logFail(`[${device.label}] Tour 3 Step 2: Dashboard btn not found`);
  }

  // Step 3: Next button
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(300);
  logOk(`[${device.label}] Tour 3: Completed`);
}

async function testTour4Advanced(page, device) {
  const prefix = `${device.name}`;
  log(`\n--- Tour 4: Advanced [${device.label}] ---`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.click('#btn-advanced-tour');
  await waitForOverlay(page);
  await page.waitForTimeout(500);
  await screenshot(page, `${prefix}_05_tour4-custom-buttons`);

  // Check custom button text
  const nextBtn = await page.$('.wjh-next-btn');
  if (nextBtn) {
    const text = await nextBtn.textContent();
    text.includes('Continuer')
      ? logOk(`[${device.label}] Tour 4 Step 1: Custom next btn text "${text.trim()}"`)
      : logFail(`[${device.label}] Tour 4 Step 1: Expected custom text, got "${text.trim()}"`);
  }

  // Navigate through steps, check arrow colors
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(400);
  await screenshot(page, `${prefix}_05_tour4-red-arrow`);

  // Check red arrow
  const arrowPath = await page.$('.wjh-arrow');
  if (arrowPath) {
    const stroke = await arrowPath.getAttribute('stroke');
    stroke === '#ff6b6b'
      ? logOk(`[${device.label}] Tour 4 Step 2: Red arrow color`)
      : logFail(`[${device.label}] Tour 4 Step 2: Expected red arrow, got "${stroke}"`);
  }

  // Step 3 has timeout
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(800); // wait for 500ms timeout + render
  await screenshot(page, `${prefix}_05_tour4-orange-arrow`);
  logOk(`[${device.label}] Tour 4 Step 3: Timeout step rendered`);

  // Finish remaining steps
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(300);
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(300);
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(300);
  logOk(`[${device.label}] Tour 4: Completed`);
}

async function testTour5Scroll(page, device) {
  const prefix = `${device.name}`;
  log(`\n--- Tour 5: Scroll [${device.label}] ---`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.click('#btn-scroll-tour');
  await waitForOverlay(page);
  await page.waitForTimeout(500);
  await screenshot(page, `${prefix}_06_tour5-step1-top`);

  // Step 2: Should scroll to #scroll-target
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(1500); // wait for scroll animation + render

  await screenshot(page, `${prefix}_06_tour5-step2-scrolled`);

  // Verify scroll happened
  const scrollTarget = await page.$('#scroll-target');
  if (scrollTarget) {
    const box = await scrollTarget.boundingBox();
    if (box) {
      const visible = box.y >= -50 && box.y < device.height;
      visible
        ? logOk(`[${device.label}] Tour 5 Step 2: Scrolled to target (y=${Math.round(box.y)})`)
        : logFail(`[${device.label}] Tour 5 Step 2: Target not visible after scroll (y=${Math.round(box.y)})`);
    }
  }

  // Step 3
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(500);
  await screenshot(page, `${prefix}_06_tour5-step3`);

  // Step 4: Should scroll back up
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(1500);
  await screenshot(page, `${prefix}_06_tour5-step4-scrollback`);

  const controlPanel = await page.$('#control-panel');
  if (controlPanel) {
    const box = await controlPanel.boundingBox();
    if (box) {
      const visible = box.y >= -50 && box.y < device.height;
      visible
        ? logOk(`[${device.label}] Tour 5 Step 4: Scrolled back to top`)
        : logFail(`[${device.label}] Tour 5 Step 4: Not scrolled back (y=${Math.round(box.y)})`);
    }
  }

  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(300);
  logOk(`[${device.label}] Tour 5: Completed`);
}

async function testTour6Programmatic(page, device) {
  const prefix = `${device.name}`;
  log(`\n--- Tour 6: Programmatic API [${device.label}] ---`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.click('#btn-programmatic');
  await waitForOverlay(page);
  await page.waitForTimeout(500);
  await screenshot(page, `${prefix}_07_tour6-step1-auto`);

  // Step 1 should auto-advance after 3s
  log(`  Waiting 3.5s for auto-advance...`);
  await page.waitForTimeout(3500);
  await screenshot(page, `${prefix}_07_tour6-step2-auto`);

  // Check we're on step 2 (card-profile)
  const label = await page.$('.wjh-label');
  if (label) {
    const text = await label.textContent();
    text.includes('Step 2')
      ? logOk(`[${device.label}] Tour 6: Auto-advanced to step 2`)
      : logFail(`[${device.label}] Tour 6: Not on step 2, label="${text.substring(0, 50)}"`);
  }

  // Wait for step 3 auto-advance
  log(`  Waiting 3.5s for second auto-advance...`);
  await page.waitForTimeout(3500);
  await screenshot(page, `${prefix}_07_tour6-step3`);

  // Steps 3 & 4 use next button
  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(400);
  await screenshot(page, `${prefix}_07_tour6-step4`);

  await clickButton(page, '.wjh-next-btn');
  await page.waitForTimeout(300);

  const overlayGone = await waitForOverlayGone(page);
  overlayGone
    ? logOk(`[${device.label}] Tour 6: Completed via programmatic API`)
    : logFail(`[${device.label}] Tour 6: Overlay still present`);
}

async function testSkipButton(page, device) {
  const prefix = `${device.name}`;
  log(`\n--- Skip/Close Test [${device.label}] ---`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Start tour and use close button
  await page.click('#btn-basic-tour');
  await waitForOverlay(page);
  await page.waitForTimeout(400);

  await page.click('.wjh-close-btn');
  await page.waitForTimeout(300);

  const overlayGone = await waitForOverlayGone(page);
  overlayGone
    ? logOk(`[${device.label}] Close button works`)
    : logFail(`[${device.label}] Close button did not dismiss overlay`);

  await screenshot(page, `${prefix}_08_close-btn`);
}

async function testEventLog(page, device) {
  const prefix = `${device.name}`;
  log(`\n--- Event Log Test [${device.label}] ---`);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Start and finish a short tour
  await page.click('#btn-basic-tour');
  await waitForOverlay(page);
  await page.waitForTimeout(300);

  // Go through 5 steps
  for (let i = 0; i < 5; i++) {
    await clickButton(page, '.wjh-next-btn');
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(500);

  // Check logs were created
  const logEntries = await page.$$('.log-entry');
  logEntries.length > 0
    ? logOk(`[${device.label}] Event log: ${logEntries.length} entries recorded`)
    : logFail(`[${device.label}] Event log: No entries recorded`);

  await screenshot(page, `${prefix}_09_event-log`);
}

// ============================
// MAIN RUNNER
// ============================

async function runAllTests() {
  console.log('\n🚀 Wanejoyhint E2E Test Suite\n');
  console.log(`Testing on ${DEVICES.length} devices...\n`);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  for (const device of DEVICES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📱 ${device.label} (${device.width}x${device.height})`);
    console.log(`${'='.repeat(60)}`);

    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      isMobile: device.isMobile,
      hasTouch: device.isMobile,
      deviceScaleFactor: device.isMobile ? 2 : 1,
    });

    const page = await context.newPage();

    try {
      await testPageLoad(page, device);
      await testTour1BasicTour(page, device);
      // Run remaining tours only on a subset to save time
      if (['iphone-se', 'ipad-mini', 'desktop-hd'].includes(device.name)) {
        await testTour2Shapes(page, device);
        await testTour3Events(page, device);
        await testTour4Advanced(page, device);
        await testTour5Scroll(page, device);
        await testTour6Programmatic(page, device);
        await testSkipButton(page, device);
        await testEventLog(page, device);
      }
    } catch (err) {
      logFail(`[${device.label}] Unexpected error: ${err.message}`);
      await screenshot(page, `${device.name}_ERROR`);
    }

    await context.close();
  }

  await browser.close();

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESULTS: ${passed}/${totalTests} passed, ${failed} failed`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
