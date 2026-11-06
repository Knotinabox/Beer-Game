const { chromium } = require('playwright-core');
const path = require('node:path');
const fs = require('node:fs');

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\6be331f5-73ab-4294-8950-1a11e897eff7';

async function main() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 1100 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  console.log('Navigating to http://127.0.0.1:5173 ...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Turn off auto AI if present
  const autoAiCheckbox = page.locator('label:has-text("Auto AI") input[type="checkbox"]');
  if (await autoAiCheckbox.count() > 0 && await autoAiCheckbox.isChecked()) {
    await autoAiCheckbox.uncheck();
    await page.waitForTimeout(300);
  }

  // 1. Capture 5-Slot Player Mat Tabletop Overview
  console.log('Capturing 5-Slot Player Board Tabletop Overview...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '201_5zone_player_mat_overview.png') });

  // Focus on the assembly line mat
  const matLocator = page.locator('[data-player-mat="11.5x5.75-borderless-canvas"]').first();
  if (await matLocator.isVisible()) {
    console.log('Capturing close-up of 5-zone mat...');
    await matLocator.screenshot({ path: path.join(ARTIFACT_DIR, '202_5zone_player_mat_closeup.png') });
  }

  // 2. Open Card Compendium (Equipment Deck)
  console.log('Opening Card Compendium...');
  const compendiumBtn = page.locator('button').filter({ hasText: 'Equipment & Staff' }).first();
  if (await compendiumBtn.isVisible()) {
    await compendiumBtn.click();
  } else {
    // Try finding "Card Compendium" or similar button
    const anyArchiveBtn = page.locator('button:has-text("Compendium"), button:has-text("Archive")').first();
    await anyArchiveBtn.click();
  }
  await page.waitForTimeout(1000);

  // Capture Equipment Deck with 5 Zone filter buttons
  console.log('Capturing Equipment Deck (15 cards, 3 per 5 zones)...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '203_card_gallery_equipment_5zones.png') });

  // 3. Switch to Staff Deck
  console.log('Switching to Staff Deck tab...');
  const staffTabBtn = page.locator('button:has-text("Staff Deck")').first();
  await staffTabBtn.click();
  await page.waitForTimeout(1000);

  console.log('Capturing Staff Deck (15 cards, 3 per 5 zones)...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '204_card_gallery_staff_5zones.png') });

  // 4. Click a card in the gallery to inspect in 2" x 2.75" dossier modal
  console.log('Clicking first staff card to inspect...');
  const firstCard = page.locator('[data-card-format="compact-vertical-2x2.75"]').first();
  if (await firstCard.isVisible()) {
    await firstCard.click({ force: true });
    await page.waitForTimeout(1000);
    console.log('Capturing Inspected Card Dossier...');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '205_staff_card_dossier_2x2.75.png') });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  await browser.close();
  console.log('All visual verification captures complete!');
}

main().catch((err) => {
  console.error('Error in screenshot script:', err);
  process.exit(1);
});
