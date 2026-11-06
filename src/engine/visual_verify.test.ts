import { describe, it, expect } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const PARENT_ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\6be331f5-73ab-4294-8950-1a11e897eff7';
const SELF_ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\09ef5415-367a-4e53-8e77-3277cf030421';

async function saveDualScreenshot(page: any, filename: string, fullPage = false) {
  fs.mkdirSync(PARENT_ARTIFACT_DIR, { recursive: true });
  fs.mkdirSync(SELF_ARTIFACT_DIR, { recursive: true });
  const p1 = path.join(PARENT_ARTIFACT_DIR, filename);
  const p2 = path.join(SELF_ARTIFACT_DIR, filename);
  await page.screenshot({ path: p1, fullPage });
  fs.copyFileSync(p1, p2);
}

describe('Live Browser Visual & E2E Verification (HoyneAssets & Rotary Dial)', () => {
  it('captures all 5 refreshed screenshots with HoyneAssets and verifies 0 console/page errors', async () => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: 1.5,
    });

    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const autoAiCheckbox = page.locator('label:has-text("Auto AI") input[type="checkbox"]');
    if (await autoAiCheckbox.isChecked()) {
      await autoAiCheckbox.uncheck();
    }

    // 1. 01_initial_board_and_pub.png: Central 11.5" Rotary Board & Player Mat
    const rotarySvg = page.locator('svg[viewBox="-5.750 -5.750 11.500 11.500"]');
    await rotarySvg.waitFor({ state: 'visible', timeout: 8000 });
    await page.waitForTimeout(400);
    await saveDualScreenshot(page, '01_initial_board_and_pub.png', false);

    // 2. 02_conveyor_pay_to_skip.png: Detailed view with CAD Overlay & Wooden Token Badges
    const cadToggle = page.locator('button[title*="Toggle Engineering CAD"]');
    if (await cadToggle.isVisible()) {
      await cadToggle.click();
      await page.waitForTimeout(300);
    }
    await saveDualScreenshot(page, '02_conveyor_pay_to_skip.png', false);
    if (await cadToggle.isVisible()) {
      await cadToggle.click(); // toggle back
      await page.waitForTimeout(200);
    }

    // 3. 03_shop_upgrades.png: Inspect Card / Master Upgrades Deck View
    const cardInspectorPill = page.locator('button:has-text("Inspect"), button[title*="Inspect"]').first();
    if (await cardInspectorPill.isVisible()) {
      await cardInspectorPill.click();
      await page.waitForTimeout(300);
      await saveDualScreenshot(page, '03_shop_upgrades.png', false);
      const closeInspector = page.locator('button[aria-label="Close modal"], button:has-text("Close")').first();
      if (await closeInspector.isVisible()) {
        await closeInspector.click();
        await page.waitForTimeout(200);
      }
    } else {
      await saveDualScreenshot(page, '03_shop_upgrades.png', false);
    }

    // 4. Play through AI turns to reach midgame (active recipes in Brewhouse, Cellar, Packaging)
    const skipAiBtn = page.locator('button:has-text("Skip AI")');
    let loopCount = 0;
    let capturedMidgame = false;

    while (loopCount < 200) {
      loopCount++;

      const finaleHeading = page.locator('h2:has-text("Master Brewer Standings — Shift Complete!")');
      if (await finaleHeading.isVisible()) {
        break;
      }

      if (await skipAiBtn.isVisible()) {
        await skipAiBtn.click();
        await page.waitForTimeout(50);
      } else {
        // Human action: click any inward action catwalk or quick action
        const actionWing = page.locator('svg path.cursor-pointer').first();
        if (await actionWing.isVisible()) {
          await actionWing.click();
          await page.waitForTimeout(50);
        }
      }

      if (!capturedMidgame && loopCount >= 5) {
        await saveDualScreenshot(page, '04_midgame_morning_shift_slide.png', false);
        capturedMidgame = true;
      }
    }

    if (!capturedMidgame) {
      await saveDualScreenshot(page, '04_midgame_morning_shift_slide.png', false);
    }

    // 5. 05_game_over_taproom_finale.png
    await page.waitForTimeout(300);
    await saveDualScreenshot(page, '05_game_over_taproom_finale.png', false);

    await browser.close();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  }, 60000);
});
