import { describe, it } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('Upgrade Valuation & Specific Token Costs Visual Verification', () => {
  it('captures equipment & staff cards with specific wooden token costs and 1-3 VP badges', async () => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1800, height: 1150 },
      deviceScaleFactor: 1.5,
    });

    const page = await context.newPage();
    const port = process.env.VITE_PORT || 5174;
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Uncheck auto AI
    const autoAiCheckbox = page.locator('label:has-text("Auto AI") input[type="checkbox"]');
    if ((await autoAiCheckbox.count()) > 0 && (await autoAiCheckbox.isChecked())) {
      await autoAiCheckbox.uncheck();
      await page.waitForTimeout(300);
    }

    // Capture main board with rotary market stations 1 & 2
    const rotarySvg = page.locator('svg[viewBox="-5.750 -5.750 11.500 11.500"]').first();
    await rotarySvg.waitFor({ state: 'visible', timeout: 8000 });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '10_rotary_market_specific_costs.png') });
    console.log('Saved 10_rotary_market_specific_costs.png');

    // Open Card Gallery modal via Equipment & Staff compendium button
    const equipStaffBtn = page.locator('button:has-text("Equipment & Staff")').first();
    if (await equipStaffBtn.isVisible()) {
      await equipStaffBtn.click();
      await page.waitForTimeout(1000);

      // Screenshot Equipment Deck in Gallery
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '11_equipment_gallery_specific_costs.png') });
      console.log('Saved 11_equipment_gallery_specific_costs.png');

      // Click Staff Deck tab
      const staffTab = page.locator('button:has-text("Staff Deck")').first();
      if (await staffTab.isVisible()) {
        await staffTab.click();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '12_staff_gallery_specific_costs.png') });
        console.log('Saved 12_staff_gallery_specific_costs.png');
      }
    }

    await browser.close();
  }, 25000);
});
