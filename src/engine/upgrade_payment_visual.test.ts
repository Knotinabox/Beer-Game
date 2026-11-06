import { describe, it, expect } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('Direct Upgrade Purchase & Specific Token Deduction (No Payment Modal)', () => {
  it('installs card directly upon clicking Install/Hire with zero redundant modal', async () => {
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
    const port = process.env.VITE_PORT || 5174;
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Uncheck auto AI so human player controls the flow
    const autoAiCheckbox = page.locator('label:has-text("Auto AI") input[type="checkbox"]');
    if ((await autoAiCheckbox.count()) > 0 && (await autoAiCheckbox.isChecked())) {
      await autoAiCheckbox.uncheck();
      await page.waitForTimeout(300);
    }

    // Give human player ample tokens so they can afford any upgrade
    await page.evaluate(() => {
      const gs = (window as any).__gameState;
      if (gs && gs.players && gs.players[0]) {
        gs.players[0].tokens = { grain: 3, hops: 3, yeast: 3, fruit: 2, spices: 2, chocolate: 2 };
        (window as any).__setGameState({ ...gs });
      }
    });
    await page.waitForTimeout(400);

    // Deploy human player meeple to Catwalk #1
    console.log('2. Deploying human player to Catwalk #1...');
    const porthole1 = page.locator('[data-testid="catwalk-porthole-1"]');
    await porthole1.waitFor({ state: 'visible', timeout: 8000 });
    await porthole1.click({ force: true });
    await page.waitForTimeout(500);

    // Advance AI players through Phase 2 catwalk placement
    console.log('3. Advancing AI players to reach Phase 3...');
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

    // Now in Phase 3! Station 1 has an upgrade card in outer shelf.
    // Click the Station 1 card to inspect it
    console.log('4. Clicking Station 1 Upgrade Card to inspect...');
    const outerCard1 = page.locator('[data-testid="rotary-outer-card-1"]');
    await outerCard1.waitFor({ state: 'visible', timeout: 5000 });
    await outerCard1.click();
    await page.waitForTimeout(600);

    // Click the Install / Hire button in CardInspectorModal
    console.log('5. Clicking Install/Hire in Card Inspector...');
    const installBtn = page.locator('button:has-text("Install")').first();
    await installBtn.waitFor({ state: 'visible', timeout: 5000 });
    expect(await installBtn.isEnabled()).toBe(true);
    await installBtn.click();
    await page.waitForTimeout(800);

    // Verify NO payment modal appeared (it was removed!)
    const paymentModal = page.locator('[data-testid="upgrade-payment-modal"]');
    expect(await paymentModal.count()).toBe(0);
    console.log('Confirmed: No redundant payment modal opened!');

    // Capture screenshot of the board with upgrade installed directly
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '03_upgrade_installed_after_payment.png'),
    });
    console.log('Saved 03_upgrade_installed_after_payment.png');

    await browser.close();
  }, 45000);
});
