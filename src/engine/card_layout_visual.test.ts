import { describe, it } from 'vitest';
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const ARTIFACT_DIR = 'C:\\Users\\knoti\\.gemini\\antigravity\\brain\\9ac889d5-2924-4907-a6f7-2421944dcc3a';

describe('Staff Gallery Complete Visuals', () => {
  it('captures all 15 staff cards scrolled views and individual dossiers', async () => {
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
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    // Open Staff Gallery
    const equipStaffBtn = page.locator('button').filter({ hasText: 'Equipment & Staff' }).first();
    await equipStaffBtn.scrollIntoViewIfNeeded();
    await equipStaffBtn.click();
    await page.waitForTimeout(1000);

    const galleryDialog = page.locator('div[role="dialog"]').first();
    await page.locator('button:has-text("Staff Deck")').click();
    await page.waitForTimeout(800);

    // Scroll gallery down to reveal Cards 9-15
    const scrollContainer = galleryDialog.locator('.overflow-y-auto').first();
    await scrollContainer.evaluate((el) => {
      el.scrollTop = 500;
    });
    await page.waitForTimeout(500);

    await galleryDialog.screenshot({
      path: path.join(ARTIFACT_DIR, 'staff_cards_scrolled_rows.png'),
    });

    // Inspect Taproom Lead
    const taproomLead = page.locator('h4:has-text("Taproom Lead")').first();
    if (await taproomLead.isVisible()) {
      await taproomLead.scrollIntoViewIfNeeded();
      await taproomLead.click({ force: true });
      await page.waitForTimeout(600);
      const inspectorModal = page.locator('div[role="dialog"]').last();
      await inspectorModal.screenshot({
        path: path.join(ARTIFACT_DIR, 'staff_taproom_lead_inspected.png'),
      });
      const closeBtn = page.locator('button[title*="Close"]').last();
      await closeBtn.click();
      await page.waitForTimeout(400);
    }

    // Inspect Freight Lead
    const freightLead = page.locator('h4:has-text("Freight Lead")').first();
    if (await freightLead.isVisible()) {
      await freightLead.scrollIntoViewIfNeeded();
      await freightLead.click({ force: true });
      await page.waitForTimeout(600);
      const inspectorModal = page.locator('div[role="dialog"]').last();
      await inspectorModal.screenshot({
        path: path.join(ARTIFACT_DIR, 'staff_freight_lead_inspected.png'),
      });
      const closeBtn = page.locator('button[title*="Close"]').last();
      await closeBtn.click();
      await page.waitForTimeout(600);
    }

    // Inspect Route Driver
    const routeDriver = page.locator('h4:has-text("Route Driver")').first();
    if (await routeDriver.isVisible()) {
      await routeDriver.scrollIntoViewIfNeeded();
      await routeDriver.click({ force: true });
      await page.waitForTimeout(600);
      const inspectorModal = page.locator('div[role="dialog"]').last();
      await inspectorModal.screenshot({
        path: path.join(ARTIFACT_DIR, 'staff_route_driver_inspected.png'),
      });
    }

    await browser.close();
  }, 60000);
});
