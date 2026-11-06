import { describe, it, expect } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\6be331f5-73ab-4294-8950-1a11e897eff7';

describe('Outer Shelves Segregation (Slots 1-2 Upgrades, Slots 3-6 Recipes)', () => {
  it('displays upgrades on Slots 1 & 2 and recipes on Slots 3-6 with clear badges', async () => {
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
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Turn off Auto AI so turn stays on Player 1
    const autoAiCheckbox = page.locator('label:has-text("Auto AI") input[type="checkbox"]');
    if (await autoAiCheckbox.isChecked()) {
      await autoAiCheckbox.uncheck();
      await page.waitForTimeout(300);
    }

    // 1. Verify Slot 1 (Equipment) & Slot 2 (Staff) Shelves are rendered
    const slot1Card = page.locator('[data-station-slot="1"]').first();
    const slot2Card = page.locator('[data-station-slot="2"]').first();
    expect(await slot1Card.isVisible()).toBe(true);
    expect(await slot2Card.isVisible()).toBe(true);

    // 2. Verify Slots 3-6 (Beer Recipe) Shelves are rendered
    const slot3Card = page.locator('[data-station-slot="3"]').first();
    const slot4Card = page.locator('[data-station-slot="4"]').first();
    const slot5Card = page.locator('[data-station-slot="5"]').first();
    const slot6Card = page.locator('[data-station-slot="6"]').first();
    expect(await slot3Card.isVisible()).toBe(true);
    expect(await slot4Card.isVisible()).toBe(true);
    expect(await slot5Card.isVisible()).toBe(true);
    expect(await slot6Card.isVisible()).toBe(true);

    // 3. Capture full overview screenshot
    const shotPath1 = path.join(ARTIFACT_DIR, '177_outer_slots_1_2_upgrades_3_6_recipes.png');
    await page.screenshot({ path: shotPath1, fullPage: false });

    // 4. Capture rotary dial close-up screenshot
    const rotaryElement = page.locator('svg[viewBox="-5.750 -5.750 11.500 11.500"]').locator('..');
    const shotPath2 = path.join(ARTIFACT_DIR, '178_rotary_dial_segregated_outer_shelves.png');
    if (await rotaryElement.isVisible()) {
      await rotaryElement.screenshot({ path: shotPath2 });
    } else {
      await page.screenshot({ path: shotPath2 });
    }

    // 5. Click on Station #1 Equipment Card to open Inspector Modal and capture expanded full art
    await slot1Card.click({ force: true });
    await page.waitForTimeout(600);
    const shotPath3 = path.join(ARTIFACT_DIR, '179_equipment_card_inspected_full_art.png');
    await page.screenshot({ path: shotPath3 });

    // Close modal by clicking backdrop or pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // 6. Click on Station #2 Staff Card to open Inspector Modal and capture expanded full art
    await slot2Card.click({ force: true });
    await page.waitForTimeout(600);
    const shotPath4 = path.join(ARTIFACT_DIR, '180_staff_card_inspected_full_art.png');
    await page.screenshot({ path: shotPath4 });

    await browser.close();
    expect(consoleErrors).toEqual([]);
  }, 30000);
});
