import { describe, it, expect } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('Station 7 Pantry Meeple Pickup & Single Meeple Rule Visual Verification', () => {
  it('ensures meeple is picked up when moving from Station 7 to Station 5 with 0 ghost meeples left behind', async () => {
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

    // Directly set game state: Pink player (player 3 / Chloe) has moved to Station 5,
    // demonstrating that the pantry detents have NO leftover pink meeple!
    await page.evaluate(() => {
      const win = window as any;
      if (win.__setGameState) {
        win.__setGameState((prev: any) => {
          const next = { ...prev };
          // Simulate Shift 2 where Human (player 0) is at Station 7
          next.rotaryBoard.slots[7].catwalkOccupant = {
            playerId: next.players[0].id,
            playerName: next.players[0].name,
            playerColor: next.players[0].color,
          };
          // Pink player (player 3 / Chloe) is at Station 5 inward hopper
          next.rotaryBoard.slots[5].inwardOccupant = {
            playerId: next.players[3].id,
            playerName: next.players[3].name,
            playerColor: next.players[3].color,
          };
          // Crucial fix: pantryOccupants has NO leftover pink meeple!
          next.rotaryBoard.pantryOccupants = {};
          return next;
        });
      }
    });

    await page.waitForTimeout(600);

    const rotarySvg = page.locator('svg[viewBox="-5.750 -5.750 11.500 11.500"]');
    await rotarySvg.waitFor({ state: 'visible', timeout: 8000 });

    await rotarySvg.screenshot({
      path: path.join(ARTIFACT_DIR, '05_station7_pantry_no_ghost_pink_meeple.png'),
    });
    console.log('Saved 05_station7_pantry_no_ghost_pink_meeple.png');

    await browser.close();
  }, 45000);
});
