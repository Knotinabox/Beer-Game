import { describe, it } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('4-Tier Recipes & Segregated Stations Visual Verification', () => {
  it('captures rotary market with Tiers 1-4 and gallery modal', async () => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1750, height: 1150 },
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

    // Capture main board with rotary stations 1-6
    const rotarySvg = page.locator('svg[viewBox="-5.750 -5.750 11.500 11.500"]').first();
    await rotarySvg.waitFor({ state: 'visible', timeout: 8000 });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_rotary_market_4_tiers.png') });
    console.log('Saved 06_rotary_market_4_tiers.png');

    // Open Card Gallery modal via Recipe Cards button
    const galleryBtn = page.locator('button:has-text("Recipe Cards")').first();
    if (await galleryBtn.isVisible()) {
      await galleryBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_card_gallery_4_tiers.png') });
      console.log('Saved 07_card_gallery_4_tiers.png');
    }

    await browser.close();
  }, 25000);
});
