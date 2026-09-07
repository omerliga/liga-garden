// scripts/browser-check.js
// Local-only, ad hoc Playwright validation for the LIGA Garden client app
// (public/index.html). Not a test framework, not CI — a manual preview-validation
// tool. Selectors below were read directly from public/index.html.
//
// Usage:
//   node scripts/browser-check.js
//   LIGA_TARGET_URL=https://<draft-or-preview>.netlify.app node scripts/browser-check.js
//   LIGA_CLIENT_NAME="לוי" node scripts/browser-check.js

const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_BASE = process.env.LIGA_TARGET_URL || 'https://liga-garden.netlify.app/';
const CLIENT_NAME = process.env.LIGA_CLIENT_NAME || 'עומר ליגה';
const OUT_DIR = path.join(__dirname, 'validation-output');

function buildUrl(base, client) {
  const u = new URL(base);
  u.searchParams.set('client', client); // URL API percent-encodes correctly (space -> %20, not '+')
  return u.toString();
}

async function collectBrokenImages(page) {
  return page.evaluate(() => {
    return Array.from(document.images)
      .filter((img) => img.src && img.complete && img.naturalWidth === 0)
      .map((img) => img.src);
  });
}

function isFirstParty(url, targetOrigin) {
  try {
    return new URL(url).origin === targetOrigin;
  } catch {
    return false;
  }
}

async function runPass(browser, { viewportLabel, contextOptions, targetUrl, targetOrigin, outDir }) {
  const result = {
    viewportLabel,
    pageLoad: {},
    consoleErrors: [],
    failedFirstPartyRequests: [],
    apiResults: {},
    ui: {},
    brokenAssets: [],
  };

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') result.consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => result.consoleErrors.push(String(err)));

  page.on('requestfailed', (req) => {
    if (isFirstParty(req.url(), targetOrigin)) {
      result.failedFirstPartyRequests.push({ url: req.url(), reason: req.failure()?.errorText || 'unknown' });
    }
  });

  const isApiLike = (u) => u.includes('/.netlify/functions/') || u.includes('/api/');
  page.on('response', async (resp) => {
    const url = resp.url();
    const status = resp.status();
    if (isApiLike(url)) {
      let bodySnippet = null;
      try {
        bodySnippet = (await resp.text()).slice(0, 300);
      } catch {}
      result.apiResults[url] = { status, ok: status < 400, bodySnippet };
    }
    if (status >= 400 && isFirstParty(url, targetOrigin)) {
      result.failedFirstPartyRequests.push({ url, status });
    }
  });

  let mainResponse;
  try {
    mainResponse = await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    result.pageLoad = { error: String(e) };
    await context.close();
    return result;
  }

  result.pageLoad = { status: mainResponse ? mainResponse.status() : null, finalUrl: page.url() };

  // Feed settles into either populated cards or a state screen (loading/error/empty)
  await page.waitForSelector('#feed .card, #feed .state', { timeout: 15000 }).catch(() => {});
  // Splash hides itself after ~2.6-3s (see #splash.out timers in index.html); let it + other animations settle
  await page.waitForTimeout(3500);

  result.pageLoad.title = await page.title();

  // ---- splash / logo ----
  result.ui.splashPresentInDom = (await page.$('#splash')) !== null;
  result.ui.splashDismissed = await page
    .$eval('#splash', (el) => el.classList.contains('out'))
    .catch(() => null);
  result.ui.appRendered = (await page.$('#app')) !== null;

  // ---- manifest ----
  result.ui.manifestLinkPresent = (await page.$('link[rel="manifest"]')) !== null;

  // ---- feed ----
  result.ui.feedExists = (await page.$('#feed')) !== null;
  result.ui.feedCardCount = await page.$$eval('#feed .card', (els) => els.length).catch(() => 0);
  result.ui.feedStateTitle = await page
    .$eval('#feed .state .state-title', (el) => el.textContent.trim())
    .catch(() => null);

  // ---- video feed cards ----
  result.ui.videoCardCount = await page.$$eval('#feed .card video', (els) => els.length).catch(() => 0);

  // ---- irrigation card (only renders when the client has a Galcon serial number) ----
  result.ui.irrigationCardPresent = (await page.$('.card-irr-name')) !== null;
  result.ui.weatherBadgePresent = (await page.$('.irr-weather-badge')) !== null;

  // ---- tabs: gallery ----
  await page.evaluate(() => window.switchTab(1));
  await page.waitForTimeout(1200);
  result.ui.gallery = {
    visible: await page.$eval('#view-gallery', (el) => el.style.display !== 'none').catch(() => null),
    itemCount: await page.$$eval('#view-gallery .gal-item', (els) => els.length).catch(() => 0),
    emptyStateShown: (await page.$('#view-gallery .gal-empty')) !== null,
  };

  // ---- tabs: profile ----
  await page.evaluate(() => window.switchTab(2));
  await page.waitForTimeout(1500);
  const profileHtml = await page.$eval('#view-profile', (el) => el.innerHTML).catch(() => '');
  result.ui.profile = {
    visible: await page.$eval('#view-profile', (el) => el.style.display !== 'none').catch(() => null),
    rendered: profileHtml.length > 0,
    looksLikeError: /שגיאה|error/i.test(profileHtml) && profileHtml.length < 400,
  };

  // back to feed tab
  await page.evaluate(() => window.switchTab(0));
  await page.waitForTimeout(500);

  // ---- broken images ----
  result.brokenAssets = await collectBrokenImages(page);

  // ---- screenshot ----
  fs.mkdirSync(outDir, { recursive: true });
  const shotPath = path.join(outDir, `${viewportLabel}.png`);
  await page.screenshot({ path: shotPath, fullPage: false });
  result.screenshot = shotPath;

  await context.close();
  return result;
}

async function main() {
  const targetUrl = buildUrl(TARGET_BASE, CLIENT_NAME);
  const targetOrigin = new URL(TARGET_BASE).origin;

  const browser = await chromium.launch({ headless: true });

  const desktop = await runPass(browser, {
    viewportLabel: 'desktop',
    contextOptions: { viewport: { width: 1280, height: 800 } },
    targetUrl,
    targetOrigin,
    outDir: OUT_DIR,
  });

  const iphone = devices['iPhone 13'];
  const mobile = await runPass(browser, {
    viewportLabel: 'mobile',
    contextOptions: { ...iphone },
    targetUrl,
    targetOrigin,
    outDir: OUT_DIR,
  });

  await browser.close();

  console.log(JSON.stringify({ targetUrl, desktop, mobile }, null, 2));
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});
