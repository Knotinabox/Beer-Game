import { describe, it } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('Rotary Pantry Station 7 & Centered Meeple Visual Verification', () => {
  it('verifies center standby, ingredient pickup removal, and centered meeple on outer cards', async () => {
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

    await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Uncheck auto AI
    const autoAiCheckbox = page.locator('label:has-text("Auto AI") input[type="checkbox"]');
    if ((await autoAiCheckbox.count()) > 0 && (await autoAiCheckbox.isChecked())) {
      await autoAiCheckbox.uncheck();
      await page.waitForTimeout(300);
    }

    const rotarySvg = page.locator('svg[viewBox="-5.750 -5.750 11.500 11.500"]');
    await rotarySvg.waitFor({ state: 'visible', timeout: 8000 });
    const box = await rotarySvg.boundingBox();

    if (box) {
      // 1. Initial Rotary Dial
      await rotarySvg.screenshot({
        path: path.join(ARTIFACT_DIR, '01_rotary_initial.png'),
      });
      console.log('1. Saved 01_rotary_initial.png');

      // 2. Click dead center (Station 7)
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      await page.mouse.click(centerX, centerY);
      await page.waitForTimeout(600);

      await rotarySvg.screenshot({
        path: path.join(ARTIFACT_DIR, '02_station7_worker_in_center.png'),
      });
      console.log('2. Saved 02_station7_worker_in_center.png');

      // 3. Advance other players in Phase 2
      const skipAiBtn = page.locator('button:has-text("Skip AI")');
      let steps = 0;
      while (steps < 20) {
        steps++;
        if (await skipAiBtn.isVisible()) {
          await skipAiBtn.click();
          await page.waitForTimeout(100);
        } else {
          break;
        }
      }

      await page.waitForTimeout(600);
      await rotarySvg.screenshot({
        path: path.join(ARTIFACT_DIR, '03_after_ai_placement.png'),
      });
      console.log('3. Saved 03_after_ai_placement.png');

      // 4. In Phase 3, click on the Grain or Hops pantry target
      console.log('Selecting pantry ingredient in Phase 3...');
      const pantrySubslot = page.locator('g[class*="cursor-pointer"]').filter({ has: page.locator('text:has-text("HOPS")') }).first();
      if (await pantrySubslot.count() > 0) {
        await pantrySubslot.click();
        await page.waitForTimeout(600);
      } else {
        // Alternatively click directly on the center-left Grain/Hops region
        const hopsText = page.locator('text:has-text("+1 HOPS"), text:has-text("TAKE +1 HOPS")').first();
        if (await hopsText.count() > 0) {
          await hopsText.click({ force: true });
          await page.waitForTimeout(600);
        }
      }

      // 5. Screenshot after Station 7 resolves (meeple moved to interior pantry detent!)
      await rotarySvg.screenshot({
        path: path.join(ARTIFACT_DIR, '04_station7_resolved_meeple_in_interior_pantry.png'),
      });
      console.log('4. Saved 04_station7_resolved_meeple_in_interior_pantry.png');
    }

    await browser.close();
  }, 45000);
});
