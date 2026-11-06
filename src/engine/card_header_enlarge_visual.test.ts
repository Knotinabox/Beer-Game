import { describe, it } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('Card Header Enlargement & Stacked Cost Visual Verification', () => {
  it('captures enlarged card headers with stacked ingredients, larger VP, and no award icon', async () => {
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

    // Open Card Gallery modal
    const equipStaffBtn = page.locator('button:has-text("Equipment & Staff")').first();
    if (await equipStaffBtn.isVisible()) {
      await equipStaffBtn.click();
      await page.waitForTimeout(1000);

      // Screenshot 1: Equipment Cards Gallery (Bulk Pallet Racks, Roasted Malt Bin, etc.)
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '15_equipment_cards_enlarged_header.png') });
      console.log('Saved 15_equipment_cards_enlarged_header.png');

      // Click Staff Deck tab
      const staffTab = page.locator('button:has-text("Staff Deck"), button:has-text("STAFF DECK")').first();
      if (await staffTab.isVisible()) {
        await staffTab.click();
        await page.waitForTimeout(800);

        // Screenshot 2: Staff Cards Gallery
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '16_staff_cards_enlarged_header.png') });
        console.log('Saved 16_staff_cards_enlarged_header.png');
        const z4Btn = page.locator('button:has-text("Z4 Cold Room"), button:has-text("Z4")').first();
        if (await z4Btn.isVisible()) {
          await z4Btn.click();
          await page.waitForTimeout(600);
          await page.screenshot({ path: path.join(ARTIFACT_DIR, '20_staff_z4_gallery.png') });
          console.log('Saved 20_staff_z4_gallery.png');
        }
      }

      // Click Recipe Deck tab
      const recipeTab = page.locator('button:has-text("Recipe Deck"), button:has-text("RECIPE DECK")').first();
      if (await recipeTab.isVisible()) {
        await recipeTab.click();
        await page.waitForTimeout(800);

        // Screenshot: Recipe Cards Gallery (Down Easy, Por Favor, etc.)
        await page.screenshot({ path: path.join(ARTIFACT_DIR, '18_recipe_cards_scaled_canonical.png') });
        console.log('Saved 18_recipe_cards_scaled_canonical.png');
      }

      // Close modal
      const closeBtn = page.locator('button:has-text("Close Archive"), button:has-text("✕"), button:has-text("Close")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(600);
      }
    }

    // Screenshot 3: Brewhouse Board & Market Shelf
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '17_rotary_market_enlarged_headers.png') });
    console.log('Saved 17_rotary_market_enlarged_headers.png');

    // Screenshot 4: Close up of Station 6 on the Rotary Wheel
    const station6Card = page.locator('[data-station-slot="6"]').first();
    if (await station6Card.isVisible()) {
      await station6Card.screenshot({ path: path.join(ARTIFACT_DIR, '19_station6_recipe_scaled_closeup.png') });
      console.log('Saved 19_station6_recipe_scaled_closeup.png');
    }

    await browser.close();
  }, 30000);
});
