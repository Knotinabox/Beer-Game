import { describe, it } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('Personal Brewery Departments Visual Verification', () => {
  it('renders docked 2.25x3.5 department card left of Zone 1 and places meeple in Phase 2', async () => {
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

    console.log('1. Loading tabletop application on port 5174...');
    await page.goto('http://127.0.0.1:5174', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Uncheck auto AI
    const autoAiCheckbox = page.locator('label:has-text("Auto AI") input[type="checkbox"]');
    if ((await autoAiCheckbox.count()) > 0 && (await autoAiCheckbox.isChecked())) {
      await autoAiCheckbox.uncheck();
      await page.waitForTimeout(300);
    }

    // Locate the docked department card
    const deptCard = page.locator('[data-department-card]').first();
    await deptCard.waitFor({ state: 'visible', timeout: 10000 });

    // Capture zoomed-in department card before placement
    console.log('2. Capturing zoomed-in department card...');
    const deptZoomPath = path.join(ARTIFACT_DIR, 'department_card_view.png');
    await deptCard.screenshot({ path: deptZoomPath });
    console.log('Saved:', deptZoomPath);

    // Capture whole board layout showing card docked flush to Zone 1 Warehouse
    console.log('3. Capturing board with docked department card...');
    const boardLocator = page.locator('[data-board-format="11.5x5.75-single-piece"]').first();
    const boardPath = path.join(ARTIFACT_DIR, 'board_with_department_card.png');
    await boardLocator.screenshot({ path: boardPath });
    console.log('Saved:', boardPath);

    // Place meeple on personal department in Phase 2
    console.log('4. Clicking personal department card to place worker meeple...');
    await deptCard.click({ force: true });
    await page.waitForTimeout(800);

    // Capture screenshot showing placed meeple
    console.log('5. Capturing department card with placed meeple...');
    const placedPath = path.join(ARTIFACT_DIR, 'department_card_with_meeple.png');
    await deptCard.screenshot({ path: placedPath });
    console.log('Saved:', placedPath);

    // Capture tabletop view showing meeple in place
    const tablePath = path.join(ARTIFACT_DIR, 'tabletop_with_department_placed.png');
    await page.screenshot({ path: tablePath });
    console.log('Saved:', tablePath);

    await browser.close();
  }, 30000);
});
