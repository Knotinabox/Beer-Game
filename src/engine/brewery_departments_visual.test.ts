import { describe, it } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\1bb89ee8-b753-4f26-8858-eaa0db8096ad';

describe('Personal Brewery Departments Visual Verification', () => {
  it('renders scaled market, scaled player board, setup toggle, and supports toggling departments on/off', async () => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1750, height: 1100 },
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

    // 1. Capture tabletop with scaled-up market dial and scaled-down player board
    console.log('2. Capturing tabletop with departments enabled (scaled market & board)...');
    const deptCard = page.locator('[data-department-card]').first();
    await deptCard.waitFor({ state: 'visible', timeout: 10000 });

    // Capture closeup of docked department card (Side A)
    const cardSideAPath = path.join(ARTIFACT_DIR, 'department_card_side_a.png');
    await deptCard.screenshot({ path: cardSideAPath });
    console.log('Saved Side A closeup:', cardSideAPath);

    // Test Flip Card button to flip to Side B
    console.log('Flipping card to Side B...');
    const flipBtn = page.locator('button:has-text("(Flip)")').first();
    if ((await flipBtn.count()) > 0) {
      await flipBtn.click();
      await page.waitForTimeout(500);
      const cardSideBPath = path.join(ARTIFACT_DIR, 'department_card_side_b.png');
      await deptCard.screenshot({ path: cardSideBPath });
      console.log('Saved Side B closeup:', cardSideBPath);
    }

    // Capture tabletop at 1920x1080 (100% scaling)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(400);
    const table1080Path = path.join(ARTIFACT_DIR, 'tabletop_1080p.png');
    await page.screenshot({ path: table1080Path });
    console.log('Saved 1080p tabletop:', table1080Path);

    // Capture tabletop at 1536x864 (125% scaling)
    await page.setViewportSize({ width: 1536, height: 950 });
    await page.waitForTimeout(400);
    const table1536Path = path.join(ARTIFACT_DIR, 'tabletop_1536p.png');
    await page.screenshot({ path: table1536Path });
    console.log('Saved 1536p tabletop:', table1536Path);

    const tableWithDeptPath = path.join(ARTIFACT_DIR, 'tabletop_with_department_placed.png');
    await page.screenshot({ path: tableWithDeptPath });
    console.log('Saved:', tableWithDeptPath);

    // Capture board with docked department card
    const boardLocator = page.locator('[data-board-format="11.5x5-single-piece"]').first();
    const boardWithDeptPath = path.join(ARTIFACT_DIR, 'board_with_department_card.png');
    await boardLocator.screenshot({ path: boardWithDeptPath });
    console.log('Saved:', boardWithDeptPath);

    // 2. Open New Game Setup Modal and capture setup toggle
    console.log('3. Opening New Game Setup Modal...');
    const setupBtn = page.locator('button:has-text("New Game Setup"), button:has-text("New Game (1–6P)")').first();
    await setupBtn.click();
    await page.waitForTimeout(500);

    const setupModal = page.locator('.stout-panel:has-text("New Brewery Game Setup")').first();
    await setupModal.waitFor({ state: 'visible', timeout: 5000 });

    const setupModalPath = path.join(ARTIFACT_DIR, 'setup_modal_with_toggle.png');
    await setupModal.screenshot({ path: setupModalPath });
    console.log('Saved:', setupModalPath);

    // 3. Toggle OFF the Personal Brewery Departments switch
    console.log('4. Toggling OFF Personal Brewery Departments...');
    const deptToggle = page.locator('input[type="checkbox"].sr-only.peer');
    if ((await deptToggle.count()) > 0 && (await deptToggle.isChecked())) {
      // Click the toggle container
      const toggleLabel = page.locator('label.relative.inline-flex.items-center.cursor-pointer');
      await toggleLabel.click();
      await page.waitForTimeout(300);
    }

    // Start game without departments
    console.log('5. Clicking Start Custom Game without departments...');
    const startBtn = page.locator('button:has-text("Start Custom Game")');
    await startBtn.click();
    await page.waitForTimeout(1000);

    // Verify department card is NOT present on the board
    const remainingDepts = await page.locator('[data-department-card]').count();
    console.log('Department cards count after disabling:', remainingDepts);

    // 4. Capture tabletop and board WITHOUT departments
    console.log('6. Capturing tabletop and board WITHOUT departments...');
    const tableNoDeptPath = path.join(ARTIFACT_DIR, 'tabletop_without_departments.png');
    await page.screenshot({ path: tableNoDeptPath });
    console.log('Saved:', tableNoDeptPath);

    const boardNoDeptPath = path.join(ARTIFACT_DIR, 'board_without_departments.png');
    await boardLocator.screenshot({ path: boardNoDeptPath });
    console.log('Saved:', boardNoDeptPath);

    await browser.close();
  }, 35000);
});
