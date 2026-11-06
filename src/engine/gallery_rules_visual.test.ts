import { describe, it, expect } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\9ac889d5-2924-4907-a6f7-2421944dcc3a';

describe('Card Gallery & Rules Update Verification', () => {
  it('captures screenshots of Equipment Deck, Staff Deck, and Rules modal', async () => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

    const browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1600, height: 1100 },
      deviceScaleFactor: 1.5,
    });

    const page = await context.newPage();

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    console.log('1. Page loaded, unchecking auto AI...');
    const autoAiCheckbox = page.locator('input[type="checkbox"]').first();
    if ((await autoAiCheckbox.count()) > 0) {
      try {
        if (await autoAiCheckbox.isChecked({ timeout: 2000 })) {
          await autoAiCheckbox.uncheck();
          await page.waitForTimeout(300);
        }
      } catch {}
    }

    console.log('2. Finding Equipment & Staff button...');
    const equipStaffBtn = page.locator('button').filter({ hasText: '20 Hardware' }).first();
    await equipStaffBtn.scrollIntoViewIfNeeded();
    await equipStaffBtn.click();
    console.log('3. Clicked button, waiting for gallery modal...');
    await page.waitForTimeout(1000);

    // Verify Equipment tab is active
    expect(await page.locator('text=Equipment Deck (20 Hardware • Station #1)').isVisible()).toBe(true);
    console.log('4. Captured Equipment Deck screenshot...');
    const shotPath1 = path.join(ARTIFACT_DIR, '181_card_gallery_equipment_deck.png');
    await page.screenshot({ path: shotPath1 });

    // Capture individual Rotary Canning Line card & inspect it
    const canningEl = page.locator('div[data-card-format="compact-vertical-2.25x3.5"]').filter({ hasText: 'Rotary Canning Line' }).first();
    if (await canningEl.isVisible()) {
      await canningEl.screenshot({ path: path.join(ARTIFACT_DIR, 'rotary_canning_line_card.png') });
      console.log('Captured rotary_canning_line_card.png');
      await canningEl.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'rotary_canning_inspector.png') });
      console.log('Captured rotary_canning_inspector.png');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Capture High-Capacity Hopper (+2 Storage, 2 VP)
    const hopperEl = page.locator('div[data-card-format="compact-vertical-2.25x3.5"]').filter({ hasText: 'High-Capacity Hopper' }).first();
    if (await hopperEl.isVisible()) {
      await hopperEl.screenshot({ path: path.join(ARTIFACT_DIR, 'high_capacity_hopper_card.png') });
      console.log('Captured high_capacity_hopper_card.png');
    }

    // 2. Click Staff Deck Tab
    console.log('5. Clicking Staff Deck tab...');
    await page.locator('button:has-text("Staff Deck")').click();
    await page.waitForTimeout(1000);

    // Verify Staff tab is active
    expect(await page.locator('text=Staff Deck (20 Personnel • Station #2)').isVisible()).toBe(true);
    console.log('6. Captured Staff Deck screenshot...');
    const shotPath2 = path.join(ARTIFACT_DIR, '182_card_gallery_staff_deck.png');
    await page.screenshot({ path: shotPath2 });

    // Capture Yeast Lab Tech staff card (2 ANY cost, 2 VP)
    const yeastTechEl = page.locator('div[data-card-format="compact-vertical-2.25x3.5"]').filter({ hasText: 'Yeast Lab Tech' }).first();
    if (await yeastTechEl.isVisible()) {
      await yeastTechEl.screenshot({ path: path.join(ARTIFACT_DIR, 'yeast_lab_tech_card.png') });
      console.log('Captured yeast_lab_tech_card.png');
    }

    // Capture Taproom Lead staff card (1 ANY cost, 1 VP in Packaging)
    const taproomEl = page.locator('div[data-card-format="compact-vertical-2.25x3.5"]').filter({ hasText: 'Taproom Lead' }).first();
    if (await taproomEl.isVisible()) {
      await taproomEl.screenshot({ path: path.join(ARTIFACT_DIR, 'taproom_lead_card.png') });
      console.log('Captured taproom_lead_card.png');
    }

    // 3. Close Compendium modal
    console.log('7. Closing archive modal...');
    await page.locator('button:has-text("Close Archive")').click();
    await page.waitForTimeout(500);

    // 4. Open Rules Guide
    console.log('8. Opening Tabletop Rules...');
    const rulesBtn = page.locator('button').filter({ hasText: 'Tabletop Rules' }).first();
    await rulesBtn.scrollIntoViewIfNeeded();
    await rulesBtn.click();
    await page.waitForTimeout(1000);

    // Verify Station #1 Equipment Deck and Station #2 Staff Deck in rules
    expect(await page.locator('text=Station #1 (Equipment Deck)').isVisible()).toBe(true);
    expect(await page.locator('text=Station #2 (Staff Deck)').isVisible()).toBe(true);
    console.log('9. Captured Rules modal screenshot...');
    const shotPath3 = path.join(ARTIFACT_DIR, '183_rules_modal_updated.png');
    await page.screenshot({ path: shotPath3 });

    // Scroll rules modal down to show Phase 3 Option B & Section 4
    const modalContent = page.locator('div[role="dialog"] .overflow-y-auto, div.overflow-y-auto').first();
    await modalContent.evaluate((el) => { el.scrollTop = 500; });
    await page.waitForTimeout(400);

    const shotPath4 = path.join(ARTIFACT_DIR, '184_rules_modal_scrolled_phase3.png');
    await page.screenshot({ path: shotPath4 });
    console.log('10. Captured scrolled rules modal screenshot...');

    await browser.close();
    console.log('11. Done!');
  }, 45000);
});
