import { chromium } from 'playwright-core';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1.5 });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1500);

  // 1. Hover over the first Recipe card in the Unified Brewery Market (Row 2)
  const firstRecipe = page.locator('div[data-card-format="poker-vertical-2.5x3.5"]').first();
  await firstRecipe.scrollIntoViewIfNeeded();
  await firstRecipe.hover();
  await page.waitForTimeout(400); // Allow hover debounce (140ms) + fade-in

  await page.screenshot({
    path: 'C:/Users/knoti/.gemini/antigravity/brain/6be331f5-73ab-4294-8950-1a11e897eff7/08_card_hover_zoom_preview.png',
    fullPage: false,
  });
  console.log('Successfully captured 08_card_hover_zoom_preview.png!');

  // 2. Click the card body (or the zoom icon) to open the full Card Archive & Rules Dossier Modal
  await firstRecipe.click();
  await page.waitForTimeout(400);

  await page.screenshot({
    path: 'C:/Users/knoti/.gemini/antigravity/brain/6be331f5-73ab-4294-8950-1a11e897eff7/09_card_click_inspection_modal.png',
    fullPage: false,
  });
  console.log('Successfully captured 09_card_click_inspection_modal.png!');

  // 3. Close the modal by pressing Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 4. Click an Ingredient card in the player hand on the right sidebar
  const handIngredient = page.locator('div[data-card-format="upright-portrait-5-7"]').first();
  await handIngredient.click();
  await page.waitForTimeout(400);

  await page.screenshot({
    path: 'C:/Users/knoti/.gemini/antigravity/brain/6be331f5-73ab-4294-8950-1a11e897eff7/10_ingredient_click_inspection_modal.png',
    fullPage: false,
  });
  console.log('Successfully captured 10_ingredient_click_inspection_modal.png!');

  await browser.close();
}

main().catch(console.error);
