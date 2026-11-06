import { describe, it } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('Warehouse Staging & Brewing Flow Visual Verification', () => {
  it('stages brewed recipe into Zone 1 (Warehouse) and advances to Zone 2 (Brewhouse) on Shift Slide', async () => {
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

    console.log('1. Loading tabletop application...');
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Uncheck auto AI
    const autoAiCheckbox = page.locator('label:has-text("Auto AI") input[type="checkbox"]');
    if ((await autoAiCheckbox.count()) > 0 && (await autoAiCheckbox.isChecked())) {
      await autoAiCheckbox.uncheck();
      await page.waitForTimeout(300);
    }

    // Deploy human player meeple to Catwalk #3 (Fruit Recipe slot)
    console.log('2. Deploying human player to Catwalk #3...');
    const porthole3 = page.locator('[data-testid="catwalk-porthole-3"]');
    await porthole3.waitFor({ state: 'visible', timeout: 8000 });
    await porthole3.click({ force: true });
    await page.waitForTimeout(500);

    // Advance AI players through Phase 2 catwalk placement to reach Phase 3 human turn
    console.log('3. Advancing AI players to reach Phase 3 Human Turn...');
    const skipAiBtn = page.locator('button:has-text("Skip AI")');
    for (let i = 0; i < 30; i++) {
      const isHumanPhase3 = await page.evaluate(() => {
        const win = window as any;
        const state = win.__gameState;
        return state && state.currentPlayerIndex === 0 && state.shiftPhase === 'PHASE_3_STATION_COMMITMENT';
      });
      if (isHumanPhase3) break;
      if (await skipAiBtn.isVisible()) {
        await skipAiBtn.click();
      }
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(400);

    // Ensure the human player has tokens matching the recipe at Station 3
    console.log('4. Granting valid tokens to human player for recipe test...');
    await page.evaluate(() => {
      const win = window as any;
      if (win.__setGameState) {
        win.__setGameState((prev: any) => {
          const next = { ...prev };
          const p0 = next.players[0];
          const st3Card = next.rotaryBoard?.slots?.[3]?.outerCard;
          const tokensNeeded: any = { grain: 0, hops: 0, yeast: 0, fruit: 0, spices: 0, chocolate: 0 };
          if (st3Card && Array.isArray(st3Card.cost)) {
            for (const ing of st3Card.cost) {
              tokensNeeded[ing] = (tokensNeeded[ing] || 0) + 1;
            }
          } else {
            tokensNeeded.grain = 2;
            tokensNeeded.hops = 1;
            tokensNeeded.yeast = 1;
          }
          p0.tokens = tokensNeeded;
          return next;
        });
      }
    });
    await page.waitForTimeout(400);

    // Now in Phase 3! Catwalk 3 has a recipe card in outer shelf.
    // Inspect Station 3 recipe card
    console.log('5. Clicking Station 3 Recipe Card to inspect and brew...');
    const outerCard3 = page.locator('[data-testid="rotary-outer-card-3"]');
    await outerCard3.waitFor({ state: 'visible', timeout: 5000 });
    await outerCard3.click();
    await page.waitForTimeout(600);

    // Click "Brew [RecipeName]" in CardInspectorModal
    console.log('6. Clicking Brew in Card Inspector...');
    const brewBtn = page.locator('[data-testid="inspector-brew-btn"]');
    await brewBtn.waitFor({ state: 'visible', timeout: 5000 });
    const btnText = await brewBtn.textContent();
    const isEnabled = await brewBtn.isEnabled();
    console.log('BREW BTN STATE:', { btnText, isEnabled });
    if (!isEnabled) {
      throw new Error(`Brew button was disabled! Text: ${btnText}`);
    }
    await brewBtn.click();
    await page.waitForTimeout(800);

    // Capture screenshot of player board showing Zone 1 with staged batch
    console.log('7. Capturing screenshot of player board with Zone 1 Warehouse Staging...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '01_recipe_staged_in_warehouse.png'),
    });
    console.log('Saved 01_recipe_staged_in_warehouse.png');

    // Advance any remaining players in turn order using Skip AI
    console.log('8. Advancing remaining players to complete shift...');
    let aiSteps = 0;
    while (aiSteps < 10) {
      aiSteps++;
      if (await skipAiBtn.isVisible()) {
        await skipAiBtn.click();
        await page.waitForTimeout(200);
      } else {
        break;
      }
    }
    await page.waitForTimeout(600);

    // Run shift slide
    console.log('9. Running Shift Slide...');
    const shiftSlideBtn = page.locator('button:has-text("Shift Slide"), button:has-text("End Shift")').first();
    if (await shiftSlideBtn.isVisible() && await shiftSlideBtn.isEnabled()) {
      await shiftSlideBtn.click();
      await page.waitForTimeout(1000);
    }

    // Capture screenshot after conveyor advance
    console.log('10. Capturing screenshot after conveyor operations...');
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '02_recipe_advanced_to_brewhouse.png'),
    });
    console.log('Saved 02_recipe_advanced_to_brewhouse.png');

    await browser.close();
  }, 45000);
});
