import { describe, it } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('Single Yeast Token Visual Verification', () => {
  it('captures single yeast wooden flask token on board and cards', async () => {
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

    // Capture main board with rotary dial Station 4 (Yeast) and inventory
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '13_single_yeast_token_verification.png') });
    console.log('Saved 13_single_yeast_token_verification.png');

    // Open Card Gallery modal to view cards requiring yeast
    const equipStaffBtn = page.locator('button:has-text("Equipment & Staff")').first();
    if (await equipStaffBtn.isVisible()) {
      await equipStaffBtn.click();
      await page.waitForTimeout(1000);

      // Screenshot Equipment deck showing yeast cost icons
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '14_single_yeast_cards_verification.png') });
      console.log('Saved 14_single_yeast_cards_verification.png');
    }

    await browser.close();
  }, 30000);
});
