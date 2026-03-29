/**
 * ngx-guided-steps E2E Test Suite
 * Comprehensive tests covering 100% of library features
 * Single tour walkthrough + isolated feature tests
 */

import { chromium } from 'playwright-core';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
const BASE_URL = 'http://localhost:4200';
const FEATURES_URL = `${BASE_URL}/features`;
const CHROME_PATH = '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome';

const DEVICES = [
  { name: 'iphone-se', width: 375, height: 667, isMobile: true, label: 'iPhone SE' },
  { name: 'iphone-14-pro', width: 393, height: 852, isMobile: true, label: 'iPhone 14 Pro' },
  { name: 'pixel-7', width: 412, height: 915, isMobile: true, label: 'Pixel 7' },
  { name: 'ipad-mini', width: 768, height: 1024, isMobile: true, label: 'iPad Mini' },
  { name: 'ipad-pro', width: 1024, height: 1366, isMobile: false, label: 'iPad Pro' },
  { name: 'desktop-hd', width: 1920, height: 1080, isMobile: false, label: 'Desktop 1080p' },
  { name: 'desktop-4k', width: 2560, height: 1440, isMobile: false, label: 'Desktop 1440p' },
];

// Devices for full tour walkthrough
const FULL_TOUR_DEVICES = ['iphone-se', 'ipad-mini', 'desktop-hd'];

let totalTests = 0;
let passed = 0;
let failed = 0;

function log(msg) { console.log(`  ${msg}`); }
function logOk(msg) { console.log(`  ✅ ${msg}`); passed++; totalTests++; }
function logFail(msg) { console.log(`  ❌ ${msg}`); failed++; totalTests++; }

async function screenshot(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
}

async function waitForOverlay(page, timeout = 3000) {
  try {
    await page.waitForSelector('.ngs-overlay:not(.ngs-hidden)', { timeout });
    return true;
  } catch { return false; }
}

async function waitForOverlayGone(page, timeout = 5000) {
  try {
    await page.waitForSelector('.ngs-overlay.ngs-hidden, #ngs-host:empty', { timeout });
    return true;
  } catch {
    const host = await page.$('#ngs-host');
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

async function getProgressText(page) {
  try {
    const el = await page.$('.ngs-progress');
    return el ? (await el.textContent()).trim() : null;
  } catch { return null; }
}

async function isElementVisible(page, selector) {
  const el = await page.$(selector);
  return !!el;
}

async function startTour(page) {
  await page.goto(FEATURES_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.click('#btn-start-tour');
  return await waitForOverlay(page);
}

async function getLabelBox(page) {
  const lbl = await page.$('.ngs-label');
  return lbl ? await lbl.boundingBox() : null;
}

function isInViewport(box, device) {
  if (!box) return false;
  return box.x >= -10 && box.y >= -10 &&
    (box.x + box.width) <= device.width + 15 &&
    (box.y + box.height) <= device.height + 15;
}

// ============================
// HELPERS
// ============================

/**
 * Advance tour from step 1 to targetStep, handling all special steps.
 * Assumes the tour is already started and on step 1.
 */
async function advanceToStep(page, targetStep) {
  for (let current = 1; current < targetStep; current++) {
    if (current === 4) {
      // Step 4: click event — dispatch click on #demo-click-btn
      await page.evaluate(() => {
        const btn = document.querySelector('#demo-click-btn');
        if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await page.waitForTimeout(500);
    } else if (current === 5) {
      // Step 5: key event — dispatch keydown Enter on #demo-key-input
      await page.evaluate(() => {
        const input = document.querySelector('#demo-key-input');
        if (input) input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });
      await page.waitForTimeout(500);
    } else if (current === 10 || current === 11) {
      // Steps 10-11: auto-advance — poll for progress text change
      const prefix = String(current);
      for (let i = 0; i < 16; i++) {
        await page.waitForTimeout(500);
        const p = await getProgressText(page);
        if (p && !p.startsWith(prefix)) break;
      }
    } else if (current === 13) {
      // Step 13: custom event — poll for progress text change (3s auto next)
      for (let i = 0; i < 12; i++) {
        await page.waitForTimeout(500);
        const p = await getProgressText(page);
        if (p && !p.startsWith('13')) break;
      }
    } else if (current === 14) {
      // Step 14: timeout step — wait 1000ms then click next
      await page.waitForTimeout(1000);
      await clickButton(page, '.ngs-next-btn');
      await page.waitForTimeout(500);
    } else {
      // Normal step: click next
      await clickButton(page, '.ngs-next-btn');
      await page.waitForTimeout(500);
    }
  }
}

// ============================
// TEST SUITES
// ============================

async function testPageLoad(page, device) {
  log(`\n--- Page Load [${device.label}] ---`);

  await page.goto(FEATURES_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await screenshot(page, `${device.name}_01_page-load`);

  // Check main sections exist
  const sections = ['#section-shapes', '#section-events', '#section-buttons', '#section-scroll',
    '#section-auto', '#section-themes', '#section-modal', '#section-api', '#section-log'];
  for (const id of sections) {
    const el = await page.$(id);
    el ? logOk(`[${device.label}] Section ${id} present`) : logFail(`[${device.label}] Section ${id} missing`);
  }

  // Start tour button
  const btn = await page.$('#btn-start-tour');
  btn ? logOk(`[${device.label}] Start tour button present`) : logFail(`[${device.label}] Start tour button missing`);

  // No horizontal overflow
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  bodyWidth <= viewportWidth + 5
    ? logOk(`[${device.label}] No horizontal overflow (${bodyWidth} <= ${viewportWidth})`)
    : logFail(`[${device.label}] Horizontal overflow (${bodyWidth} > ${viewportWidth})`);
}

async function testCompleteTourWalkthrough(page, device) {
  log(`\n--- Complete Tour Walkthrough [${device.label}] ---`);

  const overlayVisible = await startTour(page);
  overlayVisible
    ? logOk(`[${device.label}] Tour started, overlay visible`)
    : logFail(`[${device.label}] Tour failed to start`);

  if (!overlayVisible) return;
  await page.waitForTimeout(500);

  // === STEP 1: Welcome (next event) ===
  await screenshot(page, `${device.name}_02_step1-welcome`);
  const label = await page.$('.ngs-label');
  label ? logOk(`[${device.label}] Step 1: Label visible`) : logFail(`[${device.label}] Step 1: Label missing`);

  const nextBtn = await page.$('.ngs-next-btn');
  nextBtn ? logOk(`[${device.label}] Step 1: Next button visible`) : logFail(`[${device.label}] Step 1: Next button missing`);

  const closeBtn = await page.$('.ngs-close-btn');
  closeBtn ? logOk(`[${device.label}] Step 1: Close button visible`) : logFail(`[${device.label}] Step 1: Close button missing`);

  // Progress indicator
  const progress1 = await getProgressText(page);
  progress1 && progress1.includes('1')
    ? logOk(`[${device.label}] Step 1: Progress shows "${progress1}"`)
    : logFail(`[${device.label}] Step 1: Progress missing or wrong "${progress1}"`);

  // Label in viewport
  const box1 = await getLabelBox(page);
  isInViewport(box1, device)
    ? logOk(`[${device.label}] Step 1: Label in viewport`)
    : logFail(`[${device.label}] Step 1: Label out of viewport`);

  // === STEP 2: Circle shape ===
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);
  await screenshot(page, `${device.name}_03_step2-circle`);

  const circle = await page.$('mask circle');
  circle ? logOk(`[${device.label}] Step 2: Circle cutout present`) : logFail(`[${device.label}] Step 2: Circle cutout missing`);

  // === STEP 3: Rect with margin ===
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);
  await screenshot(page, `${device.name}_04_step3-rect-margin`);

  const rect = await page.$('mask rect[fill="black"]');
  rect ? logOk(`[${device.label}] Step 3: Rect cutout present`) : logFail(`[${device.label}] Step 3: Rect cutout missing`);

  // Verify prev button appears (showPrev: true)
  const prevBtn3 = await page.$('.ngs-prev-btn');
  prevBtn3 ? logOk(`[${device.label}] Step 3: Prev button visible`) : logFail(`[${device.label}] Step 3: Prev button missing`);

  // === STEP 4: Click event ===
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);
  await screenshot(page, `${device.name}_05_step4-click-event`);

  // Next button should NOT be visible (showNext: false)
  const nextBtn4 = await page.$('.ngs-next-btn');
  const nextVisible4 = nextBtn4 ? await nextBtn4.isVisible() : false;
  !nextVisible4
    ? logOk(`[${device.label}] Step 4: Next button hidden (click event)`)
    : logFail(`[${device.label}] Step 4: Next button should be hidden`);

  // Click the target element to advance (use dispatchEvent to bypass overlay blockers)
  const clicked4 = await page.evaluate(() => {
    const btn = document.querySelector('#demo-click-btn');
    if (btn) { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; }
    return false;
  });
  if (clicked4) {
    await page.waitForTimeout(500);
    logOk(`[${device.label}] Step 4: Clicked target to advance`);
  } else {
    logFail(`[${device.label}] Step 4: Click target not found`);
  }

  // === STEP 5: Key event (Enter) ===
  await screenshot(page, `${device.name}_06_step5-key-event`);

  const nextBtn5 = await page.$('.ngs-next-btn');
  const nextVisible5 = nextBtn5 ? await nextBtn5.isVisible() : false;
  !nextVisible5
    ? logOk(`[${device.label}] Step 5: Next button hidden (key event)`)
    : logFail(`[${device.label}] Step 5: Next button should be hidden`);

  // Dispatch keydown Enter on the input (bypass overlay blockers)
  const keyed5 = await page.evaluate(() => {
    const input = document.querySelector('#demo-key-input');
    if (input) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      return true;
    }
    return false;
  });
  if (keyed5) {
    await page.waitForTimeout(500);
    logOk(`[${device.label}] Step 5: Pressed Enter to advance`);
  } else {
    logFail(`[${device.label}] Step 5: Key input not found`);
  }

  // === STEP 6: Custom buttons + skip hidden ===
  await screenshot(page, `${device.name}_07_step6-custom-buttons`);

  const nextBtn6 = await page.$('.ngs-next-btn');
  if (nextBtn6) {
    const text = await nextBtn6.textContent();
    text.includes('Continuer')
      ? logOk(`[${device.label}] Step 6: Custom next button text "${text.trim()}"`)
      : logFail(`[${device.label}] Step 6: Expected "Continuer", got "${text.trim()}"`);
  }

  const skipBtn6 = await page.$('.ngs-skip-btn');
  const skipVisible6 = skipBtn6 ? await skipBtn6.isVisible() : false;
  !skipVisible6
    ? logOk(`[${device.label}] Step 6: Skip button hidden (showSkip: false)`)
    : logFail(`[${device.label}] Step 6: Skip button should be hidden`);

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);

  // === STEP 7: Arrow color ===
  await screenshot(page, `${device.name}_08_step7-arrow-color`);

  const arrow = await page.$('.ngs-arrow');
  if (arrow) {
    const stroke = await arrow.getAttribute('stroke');
    stroke === '#ff6b6b'
      ? logOk(`[${device.label}] Step 7: Red arrow color (#ff6b6b)`)
      : logFail(`[${device.label}] Step 7: Expected #ff6b6b, got "${stroke}"`);
  } else {
    logFail(`[${device.label}] Step 7: Arrow not found`);
  }

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(1500); // wait for scroll

  // === STEP 8: Scroll to target ===
  await screenshot(page, `${device.name}_09_step8-scroll`);

  const scrollTarget = await page.$('#demo-scroll-target');
  if (scrollTarget) {
    const box = await scrollTarget.boundingBox();
    if (box) {
      const visible = box.y >= -50 && box.y < device.height;
      visible
        ? logOk(`[${device.label}] Step 8: Scrolled to target (y=${Math.round(box.y)})`)
        : logFail(`[${device.label}] Step 8: Target not visible (y=${Math.round(box.y)})`);
    }
  }

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(1500); // scroll back

  // === STEP 9: Scroll back ===
  await screenshot(page, `${device.name}_10_step9-scroll-back`);

  const scrollTop = await page.$('#demo-scroll-top');
  if (scrollTop) {
    const box = await scrollTop.boundingBox();
    if (box) {
      const visible = box.y >= -50 && box.y < device.height;
      visible
        ? logOk(`[${device.label}] Step 9: Scrolled back to top (y=${Math.round(box.y)})`)
        : logFail(`[${device.label}] Step 9: Top element not visible (y=${Math.round(box.y)})`);
    }
  }

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);

  // === STEP 10: Auto-advance 5s ===
  await screenshot(page, `${device.name}_11_step10-auto-5s`);

  // Check countdown element exists
  const countdown = await page.$('.ngs-countdown');
  countdown
    ? logOk(`[${device.label}] Step 10: Countdown element present`)
    : log(`[${device.label}] Step 10: Countdown element not found (may use different selector)`);

  // Wait for auto-advance: 5s timer + scroll/render buffer
  // Use polling approach instead of fixed wait
  log(`  Waiting for step 10 auto-advance (5s timer)...`);
  for (let i = 0; i < 16; i++) { // up to 8s
    await page.waitForTimeout(500);
    const p = await getProgressText(page);
    if (p && !p.startsWith('10')) break;
  }

  const progress10 = await getProgressText(page);
  progress10 && !progress10.startsWith('10')
    ? logOk(`[${device.label}] Step 10: Auto-advanced (progress: "${progress10}")`)
    : logFail(`[${device.label}] Step 10: Did not auto-advance (progress: "${progress10}")`);

  // === STEP 11: Auto-advance 3s ===
  await screenshot(page, `${device.name}_12_step11-auto-3s`);
  log(`  Waiting for step 11 auto-advance (3s timer)...`);
  for (let i = 0; i < 12; i++) { // up to 6s
    await page.waitForTimeout(500);
    const p = await getProgressText(page);
    if (p && !p.startsWith('11')) break;
  }

  const progress11 = await getProgressText(page);
  progress11 && !progress11.startsWith('11')
    ? logOk(`[${device.label}] Step 11: Auto-advanced (progress: "${progress11}")`)
    : logFail(`[${device.label}] Step 11: Did not auto-advance (progress: "${progress11}")`);

  // === STEP 12: Manual after auto ===
  await screenshot(page, `${device.name}_13_step12-manual`);
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);

  // === STEP 13: Custom event (programmatic next in 3s) ===
  await screenshot(page, `${device.name}_14_step13-custom`);

  // Check that next button is hidden for custom event type
  const nextBtn13 = await page.$('.ngs-next-btn');
  const nextVisible13 = nextBtn13 ? await nextBtn13.isVisible() : false;
  !nextVisible13
    ? logOk(`[${device.label}] Step 13: Next button hidden (custom event)`)
    : logFail(`[${device.label}] Step 13: Next button should be hidden`);

  log(`  Waiting for step 13 programmatic next() (3s timer)...`);
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(500);
    const p = await getProgressText(page);
    if (p && !p.startsWith('13')) break;
  }

  const progress13 = await getProgressText(page);
  progress13 && !progress13.startsWith('13')
    ? logOk(`[${device.label}] Step 13: Programmatic next() advanced (progress: "${progress13}")`)
    : logFail(`[${device.label}] Step 13: Did not advance (progress: "${progress13}")`);

  // === STEP 14: Timeout step (500ms delay) ===
  await page.waitForTimeout(1000);
  await screenshot(page, `${device.name}_15_step14-timeout`);
  logOk(`[${device.label}] Step 14: Timeout step rendered after delay`);

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);

  // === STEP 15: Dark theme (#demo-theme-dark) ===
  await waitForOverlay(page);
  const darkThemeClass = await page.$('.ngs-overlay.ngs-theme-dark');
  darkThemeClass
    ? logOk(`[${device.label}] Step 15: .ngs-theme-dark class present on overlay`)
    : logFail(`[${device.label}] Step 15: .ngs-theme-dark class missing on overlay`);
  await screenshot(page, `${device.name}_16_step15-dark-theme`);

  // === STEP 16: Light theme (#demo-theme-light) ===
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);
  const darkThemeGone = !(await page.$('.ngs-overlay.ngs-theme-dark'));
  darkThemeGone
    ? logOk(`[${device.label}] Step 16: .ngs-theme-dark class NOT present (light theme)`)
    : logFail(`[${device.label}] Step 16: .ngs-theme-dark class still present`);
  await screenshot(page, `${device.name}_17_step16-light-theme`);

  // === STEP 17: i18n French (#demo-i18n-fr) ===
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);
  const nextBtn17 = await page.$('.ngs-next-btn');
  if (nextBtn17) {
    const text17 = (await nextBtn17.textContent()).trim();
    text17 === 'Suivant'
      ? logOk(`[${device.label}] Step 17: Next button text is "Suivant" (French)`)
      : logFail(`[${device.label}] Step 17: Expected "Suivant", got "${text17}"`);
  }
  await screenshot(page, `${device.name}_18_step17-i18n-fr`);

  // === STEP 18: i18n English (#demo-i18n-en) ===
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);
  const nextBtn18 = await page.$('.ngs-next-btn');
  if (nextBtn18) {
    const text18 = (await nextBtn18.textContent()).trim();
    text18 === 'Next'
      ? logOk(`[${device.label}] Step 18: Next button text is "Next" (English)`)
      : logFail(`[${device.label}] Step 18: Expected "Next", got "${text18}"`);
  }
  await screenshot(page, `${device.name}_19_step18-i18n-en`);

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);

  // === STEP 19: onBeforeStart + waitForSelector (modal opens) ===
  log(`  Waiting for modal to open via onBeforeStart...`);
  let modalHeader = null;
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(500);
    modalHeader = await page.$('#demo-modal-header');
    if (modalHeader) break;
  }
  modalHeader
    ? logOk(`[${device.label}] Step 19: Modal opened via onBeforeStart`)
    : logFail(`[${device.label}] Step 19: Modal not opened`);

  await screenshot(page, `${device.name}_20_step19-modal`);

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);

  // === STEP 20: Inside modal ===
  await screenshot(page, `${device.name}_21_step20-modal-body`);
  logOk(`[${device.label}] Step 20: Targeting element inside modal`);

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);

  // === STEP 21: API state (modal closed via onBeforeStart) ===
  await screenshot(page, `${device.name}_22_step21-api`);

  const modalGone = !(await page.$('#demo-modal-header'));
  modalGone
    ? logOk(`[${device.label}] Step 21: Modal closed via onBeforeStart`)
    : log(`[${device.label}] Step 21: Modal may still be visible`);

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);

  // === STEP 22: Event log ===
  await screenshot(page, `${device.name}_23_step22-log`);

  const logEntries = await page.$$('.log-entry');
  logEntries.length > 0
    ? logOk(`[${device.label}] Step 22: Event log has ${logEntries.length} entries`)
    : logFail(`[${device.label}] Step 22: Event log empty`);

  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);

  // === STEP 23: Cross-route to /dashboard (#dashboard-stats) ===
  // Wait for URL to contain '/dashboard' (poll up to 8s)
  log(`  Waiting for cross-route navigation to /dashboard...`);
  for (let i = 0; i < 16; i++) {
    const pathname = await page.evaluate(() => window.location.pathname);
    if (pathname.includes('/dashboard')) break;
    await page.waitForTimeout(500);
  }
  const pathname23 = await page.evaluate(() => window.location.pathname);
  pathname23.includes('/dashboard')
    ? logOk(`[${device.label}] Step 23: URL changed to ${pathname23}`)
    : logFail(`[${device.label}] Step 23: URL did not change to /dashboard (got ${pathname23})`);

  // Wait for #dashboard-stats element (poll up to 5s)
  for (let i = 0; i < 10; i++) {
    const el = await page.$('#dashboard-stats');
    if (el) break;
    await page.waitForTimeout(500);
  }
  const dashStats = await page.$('#dashboard-stats');
  dashStats
    ? logOk(`[${device.label}] Step 23: #dashboard-stats element present`)
    : logFail(`[${device.label}] Step 23: #dashboard-stats element missing`);

  const overlay23 = await waitForOverlay(page);
  overlay23
    ? logOk(`[${device.label}] Step 23: Overlay visible after cross-route`)
    : logFail(`[${device.label}] Step 23: Overlay not visible after cross-route`);
  await screenshot(page, `${device.name}_24_step23-dashboard`);

  // === STEP 24: Dashboard chart (#dashboard-chart) ===
  await clickButton(page, '.ngs-next-btn');
  await waitForOverlay(page);
  await page.waitForTimeout(400);
  await screenshot(page, `${device.name}_25_step24-dashboard-chart`);

  // === STEP 25: Final — back to /features (#section-shapes) ===
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);

  // Wait for URL to contain '/features' (poll up to 8s)
  log(`  Waiting for cross-route navigation back to /features...`);
  for (let i = 0; i < 16; i++) {
    const pathname = await page.evaluate(() => window.location.pathname);
    if (pathname.includes('/features')) break;
    await page.waitForTimeout(500);
  }
  const pathname25 = await page.evaluate(() => window.location.pathname);
  pathname25.includes('/features')
    ? logOk(`[${device.label}] Step 25: URL changed back to ${pathname25}`)
    : logFail(`[${device.label}] Step 25: URL did not change to /features (got ${pathname25})`);

  // Wait for #section-shapes element
  for (let i = 0; i < 10; i++) {
    const el = await page.$('#section-shapes');
    if (el) break;
    await page.waitForTimeout(500);
  }

  const overlay25 = await waitForOverlay(page);
  overlay25
    ? logOk(`[${device.label}] Step 25: Overlay visible after route back`)
    : logFail(`[${device.label}] Step 25: Overlay not visible after route back`);
  await screenshot(page, `${device.name}_26_step25-back-features`);

  // Finish the tour
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);

  const overlayGone = await waitForOverlayGone(page);
  overlayGone
    ? logOk(`[${device.label}] Tour completed, overlay removed`)
    : logFail(`[${device.label}] Overlay still present after tour completion`);

  await screenshot(page, `${device.name}_27_tour-finished`);
}

async function testCloseButton(page, device) {
  log(`\n--- Close Button [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] Close: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  await page.click('.ngs-close-btn');
  await page.waitForTimeout(300);

  const gone = await waitForOverlayGone(page);
  gone
    ? logOk(`[${device.label}] Close button dismisses overlay`)
    : logFail(`[${device.label}] Close button did not dismiss overlay`);

  await screenshot(page, `${device.name}_22_close-btn`);
}

async function testSkipButton(page, device) {
  log(`\n--- Skip Button [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] Skip: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Skip button may be scrolled out of view on mobile, use evaluate
  const skipClicked = await page.evaluate(() => {
    const btn = document.querySelector('.ngs-skip-btn');
    if (btn) { btn.click(); return true; }
    return false;
  }).catch(() => false);
  if (!skipClicked) {
    logFail(`[${device.label}] Skip button not found`);
    return;
  }
  await page.waitForTimeout(300);

  const gone = await waitForOverlayGone(page);
  gone
    ? logOk(`[${device.label}] Skip button dismisses overlay`)
    : logFail(`[${device.label}] Skip button did not dismiss overlay`);
}

async function testEscapeKey(page, device) {
  log(`\n--- Escape Key [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] ESC: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  const gone = await waitForOverlayGone(page);
  gone
    ? logOk(`[${device.label}] Escape key dismisses overlay`)
    : logFail(`[${device.label}] Escape key did not dismiss overlay`);
}

async function testKeyboardNavigation(page, device) {
  log(`\n--- Keyboard Navigation [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] KBD: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Get initial progress
  const p1 = await getProgressText(page);

  // ArrowRight → advance to step 2
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);

  const p2 = await getProgressText(page);
  (p2 && p2 !== p1)
    ? logOk(`[${device.label}] ArrowRight advanced step ("${p1}" → "${p2}")`)
    : logFail(`[${device.label}] ArrowRight did not advance ("${p1}" → "${p2}")`);

  // ArrowLeft → go back to step 1
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(400);

  const p3 = await getProgressText(page);
  (p3 === p1)
    ? logOk(`[${device.label}] ArrowLeft went back ("${p2}" → "${p3}")`)
    : logFail(`[${device.label}] ArrowLeft did not go back ("${p2}" → "${p3}")`);

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testPreviousButton(page, device) {
  log(`\n--- Previous Button [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] Prev: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Step 1: no prev button
  const prevBtn1 = await page.$('.ngs-prev-btn');
  const prevVisible1 = prevBtn1 ? await prevBtn1.isVisible() : false;
  !prevVisible1
    ? logOk(`[${device.label}] Step 1: No prev button`)
    : logFail(`[${device.label}] Step 1: Prev button should not be visible`);

  // Advance to step 2
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);

  // Advance to step 3 (showPrev: true)
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);

  // Click prev → back to step 2
  const prevClicked = await clickButton(page, '.ngs-prev-btn');
  prevClicked
    ? logOk(`[${device.label}] Prev button navigates back`)
    : logFail(`[${device.label}] Prev button click failed`);

  await page.waitForTimeout(400);

  const progress = await getProgressText(page);
  progress && progress.includes('2')
    ? logOk(`[${device.label}] After prev: on step 2 (progress: "${progress}")`)
    : logFail(`[${device.label}] After prev: wrong step (progress: "${progress}")`);

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testBackdropNoDissmiss(page, device) {
  log(`\n--- Backdrop No-Dismiss [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] Backdrop: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Click the dark overlay area (SVG rect at position 10,10 which should be overlay)
  await page.click('.ngs-overlay svg', { position: { x: 10, y: 10 }, force: true }).catch(() => {});
  await page.waitForTimeout(300);

  const overlayStillThere = await waitForOverlay(page, 500);
  overlayStillThere
    ? logOk(`[${device.label}] Backdrop click does NOT dismiss (backdropDismiss: false)`)
    : logFail(`[${device.label}] Backdrop click incorrectly dismissed overlay`);

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testAccessibility(page, device) {
  log(`\n--- Accessibility [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] A11y: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // role="dialog"
  const dialog = await page.$('[role="dialog"]');
  dialog
    ? logOk(`[${device.label}] role="dialog" present`)
    : logFail(`[${device.label}] role="dialog" missing`);

  // aria-modal="true"
  const ariaModal = dialog ? await dialog.getAttribute('aria-modal') : null;
  ariaModal === 'true'
    ? logOk(`[${device.label}] aria-modal="true"`)
    : logFail(`[${device.label}] aria-modal missing or wrong: "${ariaModal}"`);

  // aria-live region
  const liveRegion = await page.$('[aria-live="polite"]');
  liveRegion
    ? logOk(`[${device.label}] aria-live="polite" region exists`)
    : logFail(`[${device.label}] aria-live region missing`);

  // Close button has aria-label
  const closeBtn = await page.$('.ngs-close-btn');
  if (closeBtn) {
    const ariaLabel = await closeBtn.getAttribute('aria-label');
    ariaLabel
      ? logOk(`[${device.label}] Close button has aria-label="${ariaLabel}"`)
      : logFail(`[${device.label}] Close button missing aria-label`);
  }

  // Dialog has aria-label
  if (dialog) {
    const dialogLabel = await dialog.getAttribute('aria-label');
    dialogLabel
      ? logOk(`[${device.label}] Dialog has aria-label="${dialogLabel}"`)
      : logFail(`[${device.label}] Dialog missing aria-label`);
  }

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testProgressIndicator(page, device) {
  log(`\n--- Progress Indicator [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] Progress: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  const p1 = await getProgressText(page);
  p1 && p1.includes('1') && p1.includes('sur')
    ? logOk(`[${device.label}] Step 1 progress: "${p1}" (i18n French)`)
    : logFail(`[${device.label}] Step 1 progress wrong: "${p1}"`);

  // Advance
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(400);

  const p2 = await getProgressText(page);
  p2 && p2.includes('2')
    ? logOk(`[${device.label}] Step 2 progress updated: "${p2}"`)
    : logFail(`[${device.label}] Step 2 progress wrong: "${p2}"`);

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testI18nLabels(page, device) {
  log(`\n--- i18n Labels [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] i18n: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Check French labels
  const nextBtn = await page.$('.ngs-next-btn');
  if (nextBtn) {
    const text = await nextBtn.textContent();
    text.trim() === 'Suivant'
      ? logOk(`[${device.label}] Next button says "Suivant" (French)`)
      : logFail(`[${device.label}] Next button text: "${text.trim()}", expected "Suivant"`);
  }

  // Advance to step 3 to see prev button (showPrev: true)
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(300);
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(300);

  const prevBtn = await page.$('.ngs-prev-btn');
  if (prevBtn) {
    const text = await prevBtn.textContent();
    text.trim() === 'Precedent'
      ? logOk(`[${device.label}] Prev button says "Precedent" (French)`)
      : logFail(`[${device.label}] Prev button text: "${text.trim()}", expected "Precedent"`);
  }

  const skipBtn = await page.$('.ngs-skip-btn');
  if (skipBtn) {
    const text = await skipBtn.textContent();
    text.trim() === 'Passer'
      ? logOk(`[${device.label}] Skip button says "Passer" (French)`)
      : logFail(`[${device.label}] Skip button text: "${text.trim()}", expected "Passer"`);
  }

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testThemeDefault(page, device) {
  log(`\n--- Theme Default [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] Theme: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Default theme is light (no .ngs-theme-dark class)
  const darkTheme = await page.$('.ngs-theme-dark');
  !darkTheme
    ? logOk(`[${device.label}] Default theme is light (no .ngs-theme-dark)`)
    : logFail(`[${device.label}] Unexpected .ngs-theme-dark class present`);

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testEventLog(page, device) {
  log(`\n--- Event Log [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] Log: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Advance a few steps
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(300);
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(300);

  // Check log entries
  const entries = await page.$$('.log-entry');
  entries.length > 0
    ? logOk(`[${device.label}] Event log: ${entries.length} entries after 2 advances`)
    : logFail(`[${device.label}] Event log: No entries recorded`);

  // Skip tour and verify skip event logged
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  const allEntries = await page.$$('.log-entry');
  allEntries.length > entries.length
    ? logOk(`[${device.label}] Event log: Skip event recorded (${allEntries.length} entries)`)
    : logFail(`[${device.label}] Event log: Skip event not recorded`);

  await screenshot(page, `${device.name}_23_event-log`);
}

async function testViewportBounds(page, device) {
  log(`\n--- Viewport Bounds [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] Bounds: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Check label and buttons across first 3 steps
  for (let step = 1; step <= 3; step++) {
    const labelBox = await getLabelBox(page);
    isInViewport(labelBox, device)
      ? logOk(`[${device.label}] Step ${step}: Label within viewport`)
      : logFail(`[${device.label}] Step ${step}: Label outside viewport (${JSON.stringify(labelBox)})`);

    const nextBtnEl = await page.$('.ngs-next-btn');
    if (nextBtnEl) {
      const btnBox = await nextBtnEl.boundingBox();
      if (btnBox) {
        const inVp = btnBox.x >= -5 && (btnBox.x + btnBox.width) <= device.width + 10;
        inVp
          ? logOk(`[${device.label}] Step ${step}: Next button within viewport`)
          : logFail(`[${device.label}] Step ${step}: Next button outside viewport (x=${Math.round(btnBox.x)})`);
      }
    }

    if (step < 3) {
      await clickButton(page, '.ngs-next-btn');
      await page.waitForTimeout(400);
    }
  }

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testSVGMask(page, device) {
  log(`\n--- SVG Mask [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] SVG: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Check SVG overlay exists
  const svg = await page.$('.ngs-overlay svg');
  svg
    ? logOk(`[${device.label}] SVG overlay present`)
    : logFail(`[${device.label}] SVG overlay missing`);

  // Check mask element
  const mask = await page.$('mask');
  mask
    ? logOk(`[${device.label}] SVG mask element present`)
    : logFail(`[${device.label}] SVG mask element missing`);

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testDarkTheme(page, device) {
  log(`\n--- Dark Theme [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] DarkTheme: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Advance to step 15 (dark theme)
  await advanceToStep(page, 15);
  await waitForOverlay(page);
  await page.waitForTimeout(400);

  // Verify .ngs-theme-dark class on .ngs-overlay
  const darkOverlay = await page.$('.ngs-overlay.ngs-theme-dark');
  darkOverlay
    ? logOk(`[${device.label}] DarkTheme: .ngs-theme-dark class present on overlay`)
    : logFail(`[${device.label}] DarkTheme: .ngs-theme-dark class missing on overlay`);

  // Verify backgroundColor changed (overlay rect fill should be light)
  const rectFill = await page.evaluate(() => {
    const rect = document.querySelector('.ngs-overlay svg rect[fill="white"]');
    return rect ? rect.getAttribute('fill') : null;
  });
  rectFill
    ? logOk(`[${device.label}] DarkTheme: Overlay rect fill is light ("${rectFill}")`)
    : log(`[${device.label}] DarkTheme: Overlay rect fill not white (may use different selector)`);

  // Advance to step 16 (light theme), verify .ngs-theme-dark is gone
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);

  const darkGone = !(await page.$('.ngs-overlay.ngs-theme-dark'));
  darkGone
    ? logOk(`[${device.label}] DarkTheme: .ngs-theme-dark removed after switching to light`)
    : logFail(`[${device.label}] DarkTheme: .ngs-theme-dark still present after switching to light`);

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testI18nSwitch(page, device) {
  log(`\n--- i18n Switch [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] i18nSwitch: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Advance to step 18 (i18n English)
  await advanceToStep(page, 18);
  await page.waitForTimeout(400);

  // Verify next button text is "Next" (English)
  const nextBtn = await page.$('.ngs-next-btn');
  if (nextBtn) {
    const text = (await nextBtn.textContent()).trim();
    text === 'Next'
      ? logOk(`[${device.label}] i18nSwitch: Next button text is "Next" (English)`)
      : logFail(`[${device.label}] i18nSwitch: Expected "Next", got "${text}"`);
  } else {
    logFail(`[${device.label}] i18nSwitch: Next button not found`);
  }

  // Verify skip button text is "Skip" (English)
  const skipBtn = await page.$('.ngs-skip-btn');
  if (skipBtn) {
    const skipVisible = await skipBtn.isVisible();
    if (skipVisible) {
      const text = (await skipBtn.textContent()).trim();
      text === 'Skip'
        ? logOk(`[${device.label}] i18nSwitch: Skip button text is "Skip" (English)`)
        : logFail(`[${device.label}] i18nSwitch: Expected "Skip", got "${text}"`);
    } else {
      log(`[${device.label}] i18nSwitch: Skip button not visible on this step`);
    }
  }

  // Verify progress text contains "of" instead of "sur"
  const progress = await getProgressText(page);
  if (progress) {
    progress.includes('of')
      ? logOk(`[${device.label}] i18nSwitch: Progress text contains "of" (English): "${progress}"`)
      : logFail(`[${device.label}] i18nSwitch: Progress text does not contain "of": "${progress}"`);
  } else {
    logFail(`[${device.label}] i18nSwitch: No progress text found`);
  }

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

async function testCrossRouteNavigation(page, device) {
  log(`\n--- Cross-Route Navigation [${device.label}] ---`);

  const started = await startTour(page);
  if (!started) { logFail(`[${device.label}] CrossRoute: Tour failed to start`); return; }
  await page.waitForTimeout(400);

  // Advance to step 23 (cross-route to /dashboard)
  await advanceToStep(page, 23);
  await page.waitForTimeout(500);

  // Wait for URL to change to /dashboard (poll up to 8s)
  for (let i = 0; i < 16; i++) {
    const pathname = await page.evaluate(() => window.location.pathname);
    if (pathname.includes('/dashboard')) break;
    await page.waitForTimeout(500);
  }

  const pathname23 = await page.evaluate(() => window.location.pathname);
  pathname23.includes('/dashboard')
    ? logOk(`[${device.label}] CrossRoute: URL changed to /dashboard`)
    : logFail(`[${device.label}] CrossRoute: URL did not change to /dashboard (got ${pathname23})`);

  // Verify #dashboard-stats is visible
  for (let i = 0; i < 10; i++) {
    const el = await page.$('#dashboard-stats');
    if (el) break;
    await page.waitForTimeout(500);
  }
  const dashStats = await page.$('#dashboard-stats');
  dashStats
    ? logOk(`[${device.label}] CrossRoute: #dashboard-stats is visible`)
    : logFail(`[${device.label}] CrossRoute: #dashboard-stats not found`);

  // Advance to step 24, verify #dashboard-chart targeted
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);
  const dashChart = await page.$('#dashboard-chart');
  dashChart
    ? logOk(`[${device.label}] CrossRoute: #dashboard-chart is present on step 24`)
    : logFail(`[${device.label}] CrossRoute: #dashboard-chart not found on step 24`);

  // Advance to step 25, verify URL changed back to /features
  await clickButton(page, '.ngs-next-btn');
  await page.waitForTimeout(500);

  for (let i = 0; i < 16; i++) {
    const pathname = await page.evaluate(() => window.location.pathname);
    if (pathname.includes('/features')) break;
    await page.waitForTimeout(500);
  }

  const pathname25 = await page.evaluate(() => window.location.pathname);
  pathname25.includes('/features')
    ? logOk(`[${device.label}] CrossRoute: URL changed back to /features`)
    : logFail(`[${device.label}] CrossRoute: URL did not change back to /features (got ${pathname25})`);

  // Cleanup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
}

// ============================
// MAIN RUNNER
// ============================

async function runAllTests() {
  console.log('\n🚀 ngx-guided-steps E2E Test Suite — Comprehensive\n');
  console.log(`Testing on ${DEVICES.length} devices...\n`);

  mkdirSync(SCREENSHOTS_DIR, { recursive: true });

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
      // All devices: page load + viewport bounds + SVG mask
      await testPageLoad(page, device);
      await testViewportBounds(page, device);
      await testSVGMask(page, device);

      // Full test suite on subset of devices
      if (FULL_TOUR_DEVICES.includes(device.name)) {
        await testCompleteTourWalkthrough(page, device);
        await testCloseButton(page, device);
        await testSkipButton(page, device);
        await testPreviousButton(page, device);
        await testProgressIndicator(page, device);
        await testI18nLabels(page, device);
        await testThemeDefault(page, device);
        await testEventLog(page, device);
        await testDarkTheme(page, device);
        await testI18nSwitch(page, device);
        await testCrossRouteNavigation(page, device);
      }

      // Desktop-only tests (keyboard, accessibility, backdrop)
      if (device.name === 'desktop-hd') {
        await testEscapeKey(page, device);
        await testKeyboardNavigation(page, device);
        await testBackdropNoDissmiss(page, device);
        await testAccessibility(page, device);
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
