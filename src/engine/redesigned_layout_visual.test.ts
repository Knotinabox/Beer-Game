import { describe, it, expect } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\9ac889d5-2924-4907-a6f7-2421944dcc3a';

describe('Redesigned Assembly Line & Tabletop Visual Verification', () => {
  it('captures full tabletop, column 3, and redesigned player board with trophy rack', async () => {
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
    await page.waitForTimeout(2000);

    // Uncheck auto AI play if enabled
    const autoCheckbox = page.locator('input[type="checkbox"]');
    if (await autoCheckbox.isVisible()) {
      const isChecked = await autoCheckbox.isChecked();
      if (isChecked) await autoCheckbox.uncheck();
    }

    // 1. Capture Full Tabletop Overview
    const fullPath = path.join(ARTIFACT_DIR, 'redesigned_tabletop_overview.png');
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`Saved full tabletop: ${fullPath}`);

    // 2. Capture Column 3 (Expanded Board + Compact Mixers + Trophy Rack)
    const col3 = page.locator('#player-assembly-line').locator('..');
    const col3Path = path.join(ARTIFACT_DIR, 'redesigned_column3_complete.png');
    await col3.screenshot({ path: col3Path });
    console.log(`Saved Column 3: ${col3Path}`);

    // 3. Capture Assembly Line Player Board specifically
    const board = page.locator('#player-assembly-line');
    const boardPath = path.join(ARTIFACT_DIR, 'redesigned_player_board.png');
    await board.screenshot({ path: boardPath });
    console.log(`Saved Player Board: ${boardPath}`);

    // 4. Capture 5-Card Row (4 Mixer Packs + 1 Brewed Recipe Pile)
    const fiveCardRow = page.locator('text=Mixer Pack Bounties (4) & Brewed Recipe Pile (1)').locator('../../..');
    const fiveCardPath = path.join(ARTIFACT_DIR, 'five_cards_actual_size_row.png');
    await fiveCardRow.screenshot({ path: fiveCardPath });
    console.log(`Saved 5-Card Row: ${fiveCardPath}`);

    // 5. Capture Brewed Recipe Pile specifically
    const pileCard = page.locator('[data-card-type="brewed-recipe-pile"]').first();
    const pilePath = path.join(ARTIFACT_DIR, 'brewed_recipe_pile_card.png');
    await pileCard.screenshot({ path: pilePath });
    console.log(`Saved Brewed Recipe Pile: ${pilePath}`);

    // 6. Open Brewery Locations Modal and capture screenshot
    const locBtn = page.locator('button:has-text("1. Storage")').first();
    if (await locBtn.isVisible()) {
      await locBtn.click();
      await page.waitForTimeout(500);
      const modalPath = path.join(ARTIFACT_DIR, 'brewery_locations_modal.png');
      await page.screenshot({ path: modalPath });
      console.log(`Saved Locations Modal: ${modalPath}`);
      expect(fs.existsSync(modalPath)).toBe(true);

      // Close modal
      const closeBtn = page.locator('button:has-text("Close Guide")');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    await browser.close();
    expect(fs.existsSync(col3Path)).toBe(true);
    expect(fs.existsSync(boardPath)).toBe(true);
    expect(fs.existsSync(fiveCardPath)).toBe(true);
    expect(fs.existsSync(pilePath)).toBe(true);
  }, 30000);
});
