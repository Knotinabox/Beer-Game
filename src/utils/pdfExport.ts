import { createRecipeDeck, createEquipmentDeck, createStaffDeck } from '../engine/cards';
import { RecipeCard, UpgradeCard, IngredientTaxonomy, IngredientSubtype } from '../engine/types';
import { getHoyneBrandPalette } from '../components/HoyneAssets';
import { getUpgradeVisualInfo } from '../components/CardComponents';

export type PdfExportType = 'all' | 'rules' | 'recipes' | 'upgrades';
export type PdfTheme = 'dark' | 'light';

export interface PdfExportOptions {
  type: PdfExportType;
  theme?: PdfTheme;
}

function subtypeToTaxonomy(st: string): IngredientTaxonomy {
  if (st === 'grain' || st === 'base_malt' || st === 'specialty_grain') return 'grain';
  if (st === 'hops' || st.includes('hops')) return 'hops';
  if (st === 'yeast' || st.includes('yeast')) return 'yeast';
  if (st === 'fruit' || st === 'fresh_fruit') return 'fruit';
  if (st === 'spices' || st === 'winter_spices') return 'spices';
  if (st === 'chocolate' || st === 'dark_roasted_malt') return 'chocolate';
  return 'grain';
}

export function generatePdfHtml({
  type = 'all',
  theme = 'dark',
  origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5175',
}: PdfExportOptions & { origin?: string }): string {
  // 1. Gather all unique recipes (16 formulas)
  const allRecipes = createRecipeDeck();
  const uniqueRecipesMap = new Map<string, RecipeCard>();
  for (const r of allRecipes) {
    if (!uniqueRecipesMap.has(r.name)) {
      uniqueRecipesMap.set(r.name, r);
    }
  }
  const uniqueRecipes = Array.from(uniqueRecipesMap.values()).sort((a, b) => a.tier - b.tier);

  // 2. Gather segregated decks: Equipment (20 cards) and Staff (20 cards)
  const equipmentCards = createEquipmentDeck();
  const staffCards = createStaffDeck();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>House of Hoyne — ${
    type === 'rules'
      ? 'Official Tabletop Rulebook & Visual Guide'
      : type === 'recipes'
      ? 'Master Recipe Cards Archive'
      : type === 'upgrades'
      ? 'Equipment & Staff Blueprints Archive'
      : 'Official Rulebook & Scale Card Compendium'
  }</title>
  <style>
    @page {
      size: letter;
      margin: 10mm 8mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      line-height: 1.45;
      background-color: ${theme === 'dark' ? '#140E0A' : '#FFFFFF'};
      color: ${theme === 'dark' ? '#F5EBE1' : '#1A1A1A'};
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Print Controls Header (Hidden during actual print) */
    .no-print-bar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #1f140e;
      border-bottom: 2px solid #d97706;
      padding: 10px 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      color: #fef3c7;
    }
    .no-print-bar button {
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-print {
      background: #f59e0b;
      color: #181008;
      border: 1px solid #fbbf24;
    }
    .btn-print:hover {
      background: #fbbf24;
    }
    .btn-close {
      background: #291f1a;
      color: #e5e7eb;
      border: 1px solid #78350F;
    }
    .btn-close:hover {
      background: #3b2820;
    }

    @media print {
      .no-print-bar {
        display: none !important;
      }
      body {
        background-color: ${theme === 'dark' ? '#140E0A' : '#FFFFFF'} !important;
        color: ${theme === 'dark' ? '#F5EBE1' : '#1A1A1A'} !important;
      }
      .page-break {
        page-break-before: always;
        break-before: page;
      }
      .avoid-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }

    .container {
      max-width: 860px;
      margin: 0 auto;
      padding: 16px 12px;
    }

    /* Typography */
    h1, h2, h3, h4 {
      font-family: "Georgia", "Times New Roman", serif;
      margin: 0;
      color: ${theme === 'dark' ? '#FBBF24' : '#92400E'};
    }
    .doc-header {
      text-align: center;
      border-bottom: 2px solid ${theme === 'dark' ? '#78350F' : '#D97706'};
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .doc-super {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: ${theme === 'dark' ? '#F59E0B' : '#B45309'};
    }
    .doc-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.5px;
      margin: 4px 0 6px 0;
      color: ${theme === 'dark' ? '#FFFBEB' : '#451A03'};
    }
    .doc-sub {
      font-size: 11.5px;
      color: ${theme === 'dark' ? '#D6D3D1' : '#57534E'};
      font-style: italic;
    }

    /* Section Panels */
    .section-block {
      border: 1px solid ${theme === 'dark' ? '#78350F66' : '#E5E7EB'};
      background: ${theme === 'dark' ? '#1C1510' : '#F9FAFB'};
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      border-bottom: 1px solid ${theme === 'dark' ? '#78350F40' : '#E5E7EB'};
      padding-bottom: 6px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Embedded Rule Diagrams */
    .rule-figure {
      margin: 12px 0;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .rule-figure img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      border: 2px solid ${theme === 'dark' ? '#78350F' : '#D97706'};
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
      background: #000;
    }
    .rule-caption {
      font-size: 10px;
      color: ${theme === 'dark' ? '#D6D3D1' : '#57534E'};
      font-style: italic;
      margin-top: 6px;
    }

    /* =========================================================================
       PRINT-AND-PLAY SCALE CARD GRID & CARDS (2.38" x 3.42" Poker Format)
       Fits exactly 3 cards per row across 7.5" printable width on US Letter!
    ========================================================================= */
    .card-grid-pnp {
      display: grid;
      grid-template-columns: repeat(3, 2.25in);
      gap: 0.25in;
      justify-content: center;
      margin: 12px 0 20px 0;
    }
    .pnp-card {
      width: 2.25in;
      height: 3.5in;
      box-sizing: border-box;
      position: relative;
      border-radius: 9px;
      border: 2px solid #b8862d;
      background: #fdfbf7;
      box-shadow: inset 0 0 0 1px rgba(184, 134, 45, 0.4), 0 2px 8px rgba(0,0,0,0.3);
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      flex-direction: column;
    }
    .pnp-card-equip {
      background: #fdfbf7;
      border: 2px solid #b8862d;
      box-shadow: inset 0 0 0 1px rgba(184, 134, 45, 0.4), 0 2px 8px rgba(0,0,0,0.3);
      padding: 4px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .pnp-card-staff {
      background: #fdfbf7;
      border: 2px solid #10B981;
      box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.4), 0 2px 8px rgba(0,0,0,0.3);
      padding: 4px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* 1. Recipe PNP Card - Identical 1:1 Replica of Master Side-Ledger Card */
    .pnp-recipe-layout {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      box-sizing: border-box;
      padding: 3px;
    }
    .pnp-recipe-ledger {
      width: 0.46in;
      height: 100%;
      background: linear-gradient(180deg, #2B2F38 0%, #22252C 50%, #1A1D23 100%);
      border: 1px solid rgba(120, 113, 108, 0.7);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      padding: 4px 1px;
      flex-shrink: 0;
      box-sizing: border-box;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.6);
    }
    .pnp-recipe-token-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .pnp-recipe-token-img {
      width: 25px;
      height: 25px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.85));
    }
    .pnp-recipe-right {
      flex: 1;
      min-width: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding-left: 3.5px;
      box-sizing: border-box;
    }
    .pnp-recipe-canvas {
      flex: 1;
      min-height: 0;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.6), 0 3px 10px rgba(0,0,0,0.3);
      box-sizing: border-box;
    }
    .pnp-recipe-can {
      height: 94%;
      width: auto;
      max-width: 92%;
      object-fit: contain;
      display: block;
      margin: auto;
      filter: drop-shadow(0 5px 12px rgba(0,0,0,0.75));
    }
    .pnp-recipe-vp-modal {
      width: 100%;
      height: 0.46in;
      border-radius: 6px;
      background: rgba(18, 14, 11, 0.95);
      border: 1.5px solid rgba(217, 119, 6, 0.85);
      box-shadow: inset 0 1px 0 rgba(254, 240, 138, 0.35), 0 3px 8px rgba(0,0,0,0.8);
      padding: 0 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 6px;
      box-sizing: border-box;
      flex-shrink: 0;
    }
    .pnp-recipe-tier {
      font-size: 11px;
      font-weight: 900;
      font-family: monospace;
      text-transform: uppercase;
      background: rgba(245, 158, 11, 0.2);
      color: #FCD34D;
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 4px;
      padding: 3px 8px;
      line-height: 1;
      letter-spacing: 0.05em;
    }
    .pnp-recipe-vp {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .pnp-recipe-vp-num {
      font-family: monospace;
      font-weight: 900;
      font-size: 19px;
      color: #FDE68A;
      line-height: 1;
    }
    .pnp-recipe-vp-lbl {
      font-family: 'Cinzel', serif;
      font-weight: 900;
      font-size: 16px;
      color: #FCD34D;
      line-height: 1;
      letter-spacing: 0.05em;
    }

    /* 2. Equipment PNP Card (Top 0.72" Unified Head, Full-Width Bottom Art) */
    .pnp-equip-head {
      height: 0.72in;
      background: linear-gradient(180deg, #1E2533 0%, #0F131C 100%);
      border: 1.5px solid #F59E0B;
      border-radius: 6px;
      padding: 2.5px 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      box-sizing: border-box;
      flex-shrink: 0;
    }
    .pnp-card-titlebox-equip {
      display: none;
    }
    .pnp-card-title-equip {
      font-family: "Georgia", serif;
      font-size: 8.5px;
      font-weight: 900;
      color: #FFFBEB;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.15;
      text-align: center;
    }
    .pnp-equip-art {
      flex: 1;
      position: relative;
      background: #0C0E14;
      border: 1.5px solid rgba(245, 158, 11, 0.6);
      border-radius: 6px;
      overflow: hidden;
      margin-top: 3px;
      margin-bottom: 0;
      min-height: 0;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pnp-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .pnp-card-img-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(6px);
      opacity: 0.45;
      transform: scale(1.1);
      display: block;
      pointer-events: none;
    }
    .pnp-card-img-contain {
      position: relative;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      z-index: 2;
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.9));
    }

    /* 3. Staff PNP Card (Top Portrait Art, Bottom 0.72" Unified Head) */
    .pnp-staff-head {
      height: 0.72in;
      background: linear-gradient(180deg, #183325 0%, #0A1610 100%);
      border: 1.5px solid #10B981;
      border-radius: 6px;
      padding: 2.5px 4px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      box-sizing: border-box;
      flex-shrink: 0;
    }
    .pnp-card-titlebox-staff {
      display: none;
    }
    .pnp-staff-art {
      flex: 1;
      position: relative;
      background: #07120B;
      border: 1.5px solid rgba(16, 185, 129, 0.6);
      border-radius: 6px;
      overflow: hidden;
      margin-top: 0;
      margin-bottom: 3px;
      min-height: 0;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pnp-card-title-staff {
      font-family: "Georgia", serif;
      font-size: 8.5px;
      font-weight: 900;
      color: #ECFDF5;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.15;
      text-align: center;
    }

    /* Common Gameplay Body for Equipment & Staff Heads */
    .pnp-head-body {
      flex: 1;
      min-height: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 1px 1px 1px;
    }
    .pnp-detent-circle {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1.5px solid #F59E0B;
      background: radial-gradient(circle, #221a14 0%, #0c0805 100%);
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
      box-sizing: border-box;
    }
    .pnp-detent-circle img {
      width: 25px;
      height: 25px;
      object-fit: contain;
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.9));
    }
    .pnp-detent-num {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 13.5px;
      height: 13.5px;
      border-radius: 50%;
      background: #F59E0B;
      color: #140E0A;
      font-size: 7.5px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      border: 1px solid #000;
      box-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      border: 1px solid #000;
      box-shadow: 0 1px 3px rgba(0,0,0,0.8);
    }
    .pnp-pill-feature {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 7.8px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      white-space: nowrap;
      line-height: 1.1;
    }
    .pnp-pill-equip {
      background: rgba(120, 53, 15, 0.85);
      border: 1px solid #F59E0B;
      color: #FDE68A;
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .pnp-pill-staff {
      background: rgba(6, 78, 59, 0.85);
      border: 1px solid #10B981;
      color: #A7F3D0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .pnp-rule-desc {
      font-size: 7.2px;
      line-height: 1.25;
      color: #F3F4F6;
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .pnp-rule-flavor {
      font-size: 6.8px;
      font-style: italic;
      color: #FDE68A;
      margin-top: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-family: Georgia, serif; font-weight: bold; font-size: 14px; color: #fbbf24;">House of Hoyne PDF Compendium</span>
      <span style="font-size: 11px; color: #d1d5db;">| Destination: "Save as PDF" &bull; Print in Scale (2.38″ &times; 3.42″ Cards)</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <button class="btn-print" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
      <button class="btn-close" onclick="window.close()">
        ✕ Close
      </button>
    </div>
  </div>

  <div class="container">
    <!-- COVER / HEADER -->
    <div class="doc-header">
      <div class="doc-super">Craft Brewery Board Game &bull; Victoria, BC</div>
      <h1 class="doc-title">House of Hoyne: The Brewhouse Dial Edition</h1>
      <div class="doc-sub">
        ${
          type === 'rules'
            ? 'Official Tabletop Rulebook & Visual Component Guide'
            : type === 'recipes'
            ? 'Master Recipe Cards Compendium (16 Formulas &bull; 57 Poker Cards)'
            : type === 'upgrades'
            ? 'Equipment & Staff Blueprints (20 Hardware &bull; 20 Staff &bull; 40 Cards)'
            : 'Complete Tabletop Rulebook & True-Scale Printable Card Compendium'
        }
      </div>
    </div>

    ${
      type === 'all' || type === 'rules'
        ? `
    <!-- SECTION 1: OBJECTIVE & GAME OVERVIEW -->
    <div class="section-block">
      <div class="section-title">
        <span>🏆 1. Objective, Player Counts &amp; Endgame Trigger</span>
        <span class="badge" style="background:#78350F; color:#FDE68A; padding:2px 6px; border-radius:4px; font-weight:bold;">1–6 Players &bull; 45–75 Mins</span>
      </div>
      <p>
        In <strong>House of Hoyne: The Brewhouse Dial Edition</strong>, players step into the boots of rival Victoria brewmasters competing to build the Pacific Northwest's most celebrated craft brewery. Through worker placement upon the mechanical 11.5″ Rotary Brewhouse Kettle Dial, conveyor assembly line pipeline management, and tactile wooden ingredient token allocation, you will boil wort, ferment vibrant ales, lager crisp Bohemian pilsners, and bottle legendary craft formulas.
      </p>
      <p style="margin-top: 6px;">
        <strong>The Endgame Trigger:</strong>
        The final shift is triggered the moment any brewer delivers their target number of completed beer batches to <strong>Zone 5 (Packaging &amp; Freight Dock)</strong>:
      </p>
      <div style="background: rgba(0,0,0,0.25); border: 1px solid #78350F60; border-radius: 6px; padding: 6px 10px; margin: 6px 0; font-family: monospace; font-size: 10px;">
        &bull; <strong>6 Players:</strong> 5 Batches &nbsp;|&nbsp; <strong>5 Players:</strong> 6 Batches &nbsp;|&nbsp; <strong>4 Players:</strong> 7 Batches &nbsp;|&nbsp; <strong>3 Players:</strong> 8 Batches &nbsp;|&nbsp; <strong>2 Players:</strong> 8 Batches &nbsp;|&nbsp; <strong>Solo (1P):</strong> 8 Batches
      </div>
      <p style="margin-top: 4px;">
        <strong>Equal Shift Rule:</strong> Once the target batch is packaged, all remaining players complete the ongoing shift through Station #7. This ensures every brewer receives an identical number of worker placements and pipeline advances before final Victory Point scoring.
      </p>
    </div>

    <!-- SECTION 2: TABLETOP SETUP WITH VISUAL DIAGRAM -->
    <div class="section-block page-break">
      <div class="section-title">
        <span>🎲 2. Tabletop Setup &amp; Components</span>
        <span class="badge" style="background:#064E3B; color:#A7F3D0; padding:2px 6px; border-radius:4px; font-weight:bold;">Setup Steps 1–8</span>
      </div>

      <div class="rule-figure">
        <img src="${origin}/rulebook/tabletop-overview.png" alt="Complete Tabletop Setup" />
        <div class="rule-caption">Figure 1: Full Tabletop Layout showing the central 11.5″ Rotary Brewhouse Dial, raw token hoppers, 3 perimeter market decks, player assembly board, and central Trophy Rack.</div>
      </div>

      <p><strong>Step-by-Step Setup:</strong></p>
      <ol style="margin: 6px 0 0 16px; padding: 0; line-height: 1.5;">
        <li><strong>Center the 11.5″ Rotary Dial:</strong> Place the heavy dial in the center of the table. Orient Station #1 (Chocolate) facing North (12 o'clock).</li>
        <li><strong>Stock the Inner Hoppers:</strong> Place the tactile wooden ingredient tokens into the 6 radial dial hoppers:
          <br />&bull; Station #1: <strong>Chocolate</strong> (Specialty Roast Malt) &bull; Station #2: <strong>Spices</strong> (Cinnamon &amp; Orange Peel)
          <br />&bull; Station #3: <strong>Fruit</strong> (Pacific Raspberries) &bull; Station #4: <strong>Yeast</strong> (House Cultures)
          <br />&bull; Station #5: <strong>Hops</strong> (Pacific Northwest Cones) &bull; Station #6: <strong>Grain</strong> (Base Pale Malt)
          <br />&bull; Station #7 (Center Hub): <strong>Wild Brewhouse Pantry</strong> (open reserve of all 6 token varieties).
        </li>
        <li><strong>Place the 3 Perimeter Market Decks:</strong>
          <br />&bull; <strong>Station #1 Shelf:</strong> Shuffle the 20-card Equipment Deck and deal 2 cards face-up.
          <br />&bull; <strong>Station #2 Shelf:</strong> Shuffle the 20-card Staff Deck and deal 2 cards face-up.
          <br />&bull; <strong>Stations #3–6 Shelf:</strong> Shuffle the 57-card Beer Recipe Deck and deal 4 cards face-up along the outer perimeter.
        </li>
        <li><strong>Distribute Player Mats:</strong> Give each player one 5-Zone Assembly Line Player Board and one Brewer Meeple in their chosen color.</li>
        <li><strong>Initial Warehouse Stock:</strong> Each player places <strong>2 Grain</strong> and <strong>1 Hops</strong> wooden tokens into their Zone 1 Warehouse detents.</li>
        <li><strong>Starting Recipe Draft:</strong> Deal 2 Recipe cards to each player. Each player secretly selects 1 to keep in their hand and returns the other to the bottom of the Recipe Deck.</li>
        <li><strong>Trophy Rack:</strong> Place the shared Trophy Rack beside the table within reach of all players to collect finished beer batches.</li>
        <li><strong>First Player:</strong> The player who most recently enjoyed a cold craft beer takes the First Player token.</li>
      </ol>
    </div>

    <!-- SECTION 3: 11.5" ROTARY DIAL WITH VISUAL DIAGRAM -->
    <div class="section-block page-break">
      <div class="section-title">
        <span>⚙️ 3. The 11.5″ Rotary Brewhouse Dial &amp; Action Stations</span>
        <span class="badge" style="background:#78350F; color:#FDE68A; padding:2px 6px; border-radius:4px; font-weight:bold;">Stations 1–7</span>
      </div>

      <div class="rule-figure">
        <img src="${origin}/rulebook/rotary-dial-detailed.png" alt="Detailed Rotary Brewhouse Dial" />
        <div class="rule-caption">Figure 2: Close-up of the 11.5″ Rotary Kettle Dial showing Catwalk Portholes 1–7, raw ingredient yields, perimeter market shelves, and shift initiative order.</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px;">
        <thead>
          <tr style="border-bottom: 2px solid #78350F; text-align: left; background: rgba(0,0,0,0.3);">
            <th style="padding: 5px;">Station</th>
            <th style="padding: 5px;">Ingredient</th>
            <th style="padding: 5px;">Hopper Yield (Option A)</th>
            <th style="padding: 5px;">Initiative</th>
            <th style="padding: 5px;">Perimeter Market Shelf (Option B)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #78350F30;">
            <td style="padding: 5px;"><strong>#1</strong> (12 o'clock)</td>
            <td style="padding: 5px; color: #c48859; font-weight: bold;">Chocolate</td>
            <td style="padding: 5px;">+1 Wooden Token</td>
            <td style="padding: 5px; color: #fbbf24; font-weight: bold;">1st</td>
            <td style="padding: 5px; color: #f59e0b; font-weight: bold;">Station #1: Equipment Deck (20 Hardware Cards)</td>
          </tr>
          <tr style="border-bottom: 1px solid #78350F30;">
            <td style="padding: 5px;"><strong>#2</strong> (2 o'clock)</td>
            <td style="padding: 5px; color: #e67e22; font-weight: bold;">Spices</td>
            <td style="padding: 5px;">+1 Wooden Token</td>
            <td style="padding: 5px; color: #fbbf24; font-weight: bold;">2nd</td>
            <td style="padding: 5px; color: #10b981; font-weight: bold;">Station #2: Staff Deck (20 Personnel Cards)</td>
          </tr>
          <tr style="border-bottom: 1px solid #78350F30;">
            <td style="padding: 5px;"><strong>#3</strong> (4 o'clock)</td>
            <td style="padding: 5px; color: #a855f7; font-weight: bold;">Fruit</td>
            <td style="padding: 5px;">+1 Wooden Token</td>
            <td style="padding: 5px; color: #fbbf24; font-weight: bold;">3rd</td>
            <td style="padding: 5px; color: #34d399;">Stations #3–6: Beer Recipe Deck (57 Cards)</td>
          </tr>
          <tr style="border-bottom: 1px solid #78350F30;">
            <td style="padding: 5px;"><strong>#4</strong> (6 o'clock)</td>
            <td style="padding: 5px; color: #f59e0b; font-weight: bold;">Yeast</td>
            <td style="padding: 5px;">+2 Wooden Tokens</td>
            <td style="padding: 5px; color: #fbbf24; font-weight: bold;">4th</td>
            <td style="padding: 5px; color: #34d399;">Stations #3–6: Beer Recipe Deck (57 Cards)</td>
          </tr>
          <tr style="border-bottom: 1px solid #78350F30;">
            <td style="padding: 5px;"><strong>#5</strong> (8 o'clock)</td>
            <td style="padding: 5px; color: #10b981; font-weight: bold;">Hops</td>
            <td style="padding: 5px;">+2 Wooden Tokens</td>
            <td style="padding: 5px; color: #fbbf24; font-weight: bold;">5th</td>
            <td style="padding: 5px; color: #34d399;">Stations #3–6: Beer Recipe Deck (57 Cards)</td>
          </tr>
          <tr style="border-bottom: 1px solid #78350F30;">
            <td style="padding: 5px;"><strong>#6</strong> (10 o'clock)</td>
            <td style="padding: 5px; color: #eab308; font-weight: bold;">Grain</td>
            <td style="padding: 5px;">+2 Wooden Tokens</td>
            <td style="padding: 5px; color: #fbbf24; font-weight: bold;">6th</td>
            <td style="padding: 5px; color: #34d399;">Stations #3–6: Beer Recipe Deck (57 Cards)</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>#7</strong> (Center Hub)</td>
            <td style="padding: 5px; color: #fef08a; font-weight: bold;">Wild Pantry</td>
            <td style="padding: 5px;">+1 Token of ANY Type</td>
            <td style="padding: 5px; color: #9ca3af; font-weight: bold;">7th (Last)</td>
            <td style="padding: 5px;">Central Wild Pantry Porthole</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 10px; padding: 8px 10px; background: rgba(0,0,0,0.3); border-radius: 6px; border-left: 3px solid #F59E0B; font-size: 10.5px;">
        <strong>The Two Golden Rules of the Catwalk:</strong>
        <br />&bull; <strong>Mandatory Movement:</strong> You must relocate your Brewer Meeple to a different station after every shift. You can NEVER remain at the same station (including Station #7) for consecutive shifts.
        <br />&bull; <strong>Contesting &amp; The Hot Seat Eviction:</strong> If an opponent moves their meeple onto your occupied catwalk porthole, your meeple is knocked into the Center Ring Hot Seat. You immediately take an out-of-turn revenge placement onto any open station on the board!
      </div>
    </div>

    <!-- SECTION 4: 5-ZONE ASSEMBLY LINE PLAYER BOARD WITH VISUAL DIAGRAM -->
    <div class="section-block page-break">
      <div class="section-title">
        <span>🏭 4. The 5-Zone Brewery Assembly Line Player Board</span>
        <span class="badge" style="background:#064E3B; color:#A7F3D0; padding:2px 6px; border-radius:4px; font-weight:bold;">Dual Hardware / Staff Tracks</span>
      </div>

      <div class="rule-figure">
        <img src="${origin}/rulebook/player-board-detailed.png" alt="5-Zone Assembly Line Player Board" />
        <div class="rule-caption">Figure 3: The 5-Zone Assembly Line Player Board detailing the 8-slot Warehouse grid, Brewhouse Kettle, Fermentation Cellar, Conditioning Tank, Packaging Dock, and dual card mounting tracks.</div>
      </div>

      <p>Each player operates a dual-layer industrial assembly line consisting of 5 sequential zones:</p>
      <ul style="margin: 6px 0 0 16px; padding: 0; line-height: 1.5;">
        <li><strong>Zone 1: Warehouse &amp; Logistics:</strong> Houses your raw wooden ingredient tokens in an 8-slot physical detent grid. Starting capacity is 8 tokens; expanded by installing Bulk Pallet Racks, High-Capacity Hoppers, and Cryo-Hop Storage. Sourcing personnel enhance drafting yields.</li>
        <li><strong>Zone 2: Brewhouse Kettle (Capacity: 1 Batch):</strong> Where craft beer recipes are brewed. When brewing, pay the matching wooden tokens into the supply and place the Recipe Card face-up in Zone 2. Hardware upgrades (Copper Mash Tun, Hop Back) reduce boil costs; kettle tenders retain spent tokens.</li>
        <li><strong>Zone 3: Fermentation Cellar (Capacity: 1 Batch, Expandable):</strong> Active fermentation where yeast converts malt sugars. Installing a Glycol Cooling Jacket expands cellar capacity to 2 batches. Conical unitanks and cellar apprentices generate kickbacks when beer completes fermentation.</li>
        <li><strong>Zone 4: Conditioning &amp; Lagering (Capacity: 1 Batch):</strong> Maturation tanks for clarification, carbonation, and cold lagering. Aging foeders and horizontal tanks award bonus fruit and spice tokens upon advance.</li>
        <li><strong>Zone 5: Packaging &amp; Freight Dock:</strong> Final stage where conditioned beer is racked into kegs and cans. Batches entering Zone 5 score their printed Victory Points and are transferred to the central Trophy Rack. Keg rackers and route drivers trigger finishing perks.</li>
      </ul>
      <p style="margin-top: 6px;">
        <strong>Dual Card Mounting Tracks:</strong>
        Equipment cards tuck permanently along the <em>top edge</em> of their designated zone, granting passive pipeline perks. Staff cards tuck along the <em>bottom edge</em> of their designated zone, granting active shift abilities and wage triggers.
      </p>
    </div>

    <!-- SECTION 5: SHIFT ARCHITECTURE & TURN WALKTHROUGH WITH DIAGRAM -->
    <div class="section-block page-break">
      <div class="section-title">
        <span>🔄 5. Shift Architecture: 3-Phase Turn Flow Walkthrough</span>
        <span class="badge" style="background:#78350F; color:#FDE68A; padding:2px 6px; border-radius:4px; font-weight:bold;">Every Turn Cycle</span>
      </div>

      <div class="rule-figure">
        <img src="${origin}/rulebook/turn-flow-diagram.png" alt="3-Phase Turn Flow Walkthrough" />
        <div class="rule-caption">Figure 4: Shift resolution sequence: Phase 1 (Conveyor Slide right-to-left), Phase 2 (Catwalk Placement &amp; Initiative), and Phase 3 (Committed Action Resolution in numerical order 1–7).</div>
      </div>

      <p><strong>Phase 1: The Morning Shift (Conveyor Slide)</strong><br />
      Batches in your brewery pipeline advance simultaneously right-to-left across your board:
      <br />1. Conditioned beer in <strong>Zone 4 (Conditioning)</strong> moves into <strong>Zone 5 (Packaging &amp; Dock)</strong>, scoring printed VP + Recipe bonuses and triggering freight perks.
      <br />2. Fermenting wort in <strong>Zone 3 (Fermentation Cellar)</strong> moves into <strong>Zone 4 (Conditioning)</strong> (Cap: 1 batch).
      <br />3. Newly brewed wort in <strong>Zone 2 (Brewhouse Kettle)</strong> moves into <strong>Zone 3 (Cellar)</strong>.
      <br /><em>Bottleneck Invariant:</em> If a downstream vessel is already full, upstream beer cannot advance and must wait for the next shift!
      </p>

      <p style="margin-top: 6px;"><strong>Phase 2: Catwalk Placement &amp; Shift Initiative</strong><br />
      In turn order, players place their Brewer Meeple onto an available Catwalk Porthole (1–7). Porthole numbers determine the exact action resolution order in Phase 3 (Station #1 resolves first, Station #7 resolves last).
      </p>

      <p style="margin-top: 6px;"><strong>Phase 3: Station Action Execution (Numerical Order 1 ➔ 7)</strong><br />
      Players resolve their committed actions in strict numerical initiative order:
      <br />&bull; <strong>Option A — Inner Hopper (IN) (Stations 1–6):</strong> Take raw wooden tokens into your Zone 1 Warehouse (+2 Grain, Hops, or Yeast; or +1 Chocolate, Spices, or Fruit).
      <br />&bull; <strong>Option B — Outer Market Shelf (OUT) (Stations 1–6):</strong>
      <br />&nbsp;&nbsp;&ndash; <em>Station #1:</em> Pay the required token cost to install an Equipment card above its designated zone.
      <br />&nbsp;&nbsp;&ndash; <em>Station #2:</em> Pay the required token wage to hire a Staff card below its designated zone.
      <br />&nbsp;&nbsp;&ndash; <em>Stations #3–6:</em> Spend matching wooden tokens to brew a Recipe card directly into Zone 2 Kettle!
      <br />&bull; <strong>Option C — Brewhouse Pantry (Station #7):</strong> Take 1 wooden token of ANY ingredient from the pantry. Resolves last (#7).
      </p>
    </div>

    <!-- SECTION 6: VICTORY POINT SCORING -->
    <div class="section-block avoid-break">
      <div class="section-title">
        <span>🏅 6. Endgame Scoring &amp; Victory Determination</span>
        <span class="badge" style="background:#78350F; color:#FDE68A; padding:2px 6px; border-radius:4px; font-weight:bold;">Final VP Audit</span>
      </div>
      <p>
        When the endgame is triggered, players tally their final Victory Points across 5 categories:
      </p>
      <ol style="margin: 6px 0 0 16px; padding: 0; line-height: 1.5;">
        <li><strong>Packaged Recipe Victory Points:</strong> Sum the printed VP on all completed Recipe cards in your Trophy Rack (Tier 1 = 4 VP, Tier 2 = 8 VP, Tier 3 = 12 VP).</li>
        <li><strong>Hoyne Portfolio Diversity Bonus (+3 VP):</strong> Awarded to any brewer who successfully packaged at least one beer of each tier (Tier 1, Tier 2, and Tier 3).</li>
        <li><strong>Hardware Infrastructure (+1 VP each):</strong> Score +1 VP for each permanent Equipment card installed on your brewery board.</li>
        <li><strong>Staff Floor Synergy (+1 VP each):</strong> Score +1 VP for each dedicated Staff member hired onto your brewery board.</li>
        <li><strong>Surplus Inventory (+1 VP per 3 tokens):</strong> Convert remaining wooden ingredient tokens in your warehouse into VP at a rate of 1 VP for every 3 tokens (rounded down).</li>
      </ol>
      <p style="margin-top: 4px;">
        <strong>Tiebreaker:</strong> In the event of a tie, the brewer with the highest number of completed Tier 3 seasonal craft beers wins. If still tied, the player with the most installed hardware cards is crowned Master Brewer of Victoria!
      </p>
    </div>
    `
        : ''
    }

    ${
      type === 'all' || type === 'recipes'
        ? `
    <!-- RECIPES SECTION: SCALE PRINTABLE CARDS (2.38" x 3.42") -->
    <div class="section-block page-break">
      <div class="section-title">
        <span>🍺 Master Recipe Cards Compendium (16 Formulas &bull; 57 Poker Cards)</span>
        <span class="badge" style="background:#78350F; color:#FDE68A; padding:2px 6px; border-radius:4px; font-weight:bold;">True Scale &bull; 2.38″ &times; 3.42″ Cards</span>
      </div>
      <p style="margin-bottom: 8px;">
        Authentic craft formulas from Hoyne Brewing Co. To brew a recipe, spend the indicated wooden tokens from your Zone 1 Warehouse and place the card into Zone 2 (Brewhouse Kettle).
      </p>

      <div class="card-grid-pnp">
        ${uniqueRecipes
          .map((r) => {
            const tokenListHtml = r.requiredIngredients
              .map((st) => {
                const tax = subtypeToTaxonomy(st);
                const sizePx = r.requiredIngredients.length >= 6 ? 22 : r.requiredIngredients.length === 5 ? 26 : 30;
                return `
                <div class="pnp-recipe-token-item">
                  <img src="${origin}/tokens/${tax}-wood-piece.png" class="pnp-recipe-token-img" style="width: ${sizePx}px; height: ${sizePx}px;" alt="${tax}" />
                </div>
              `;
              })
              .join('');

            const palette = getHoyneBrandPalette(r.name, r.tier);

            return `
          <div class="pnp-card">
            <div class="pnp-recipe-layout">
              <!-- Left Side-Ledger with 3D Wooden Tokens -->
              <div class="pnp-recipe-ledger">
                ${tokenListHtml}
              </div>

              <!-- Right Area: Branded Can Canvas + Dedicated Full-Width Bottom Modal -->
              <div class="pnp-recipe-right">
                <div class="pnp-recipe-canvas" style="background: radial-gradient(circle at 50% 42%, ${palette.primaryBg} 0%, ${palette.secondaryBg} 65%, #0c0a09 100%); border: 1.5px solid ${palette.borderAccent}80;">
                  <!-- Subtle dotted foil texture rings -->
                  <div style="position: absolute; inset: 0; opacity: 0.12; pointer-events: none; background-image: radial-gradient(${palette.foilAccent} 1px, transparent 1px); background-size: 14px 14px;"></div>
                  <!-- Subtle gold foil inner border -->
                  <div style="position: absolute; inset: 2.5px; border-radius: 6px; border: 1px solid ${palette.borderAccent}40; pointer-events: none;"></div>
                  <img src="${origin}${palette.vesselImageSrc}" class="pnp-recipe-can" alt="${r.name}" onerror="this.style.opacity='0.2'" />
                </div>

                <div class="pnp-recipe-vp-modal">
                  <span class="pnp-recipe-tier">TIER ${r.tier}</span>
                  <div class="pnp-recipe-vp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.8));">
                      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path>
                      <circle cx="12" cy="8" r="6"></circle>
                    </svg>
                    <span class="pnp-recipe-vp-num">${r.vp}</span>
                    <span class="pnp-recipe-vp-lbl">VP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          `;
          })
          .join('')}
      </div>
    </div>
    `
        : ''
    }

    ${
      type === 'all' || type === 'upgrades'
        ? `
    <!-- EQUIPMENT DECK SECTION: SCALE PRINTABLE CARDS (2.38" x 3.42") -->
    <div class="section-block page-break">
      <div class="section-title">
        <span>🔧 Station #1 Market: Equipment Deck (20 Unique Hardware Cards)</span>
        <span class="badge" style="background:#78350F; color:#FDE68A; padding:2px 6px; border-radius:4px; font-weight:bold;">Top 1/3 Head &bull; Bottom 2/3 Machinery Art</span>
      </div>
      <p style="margin-bottom: 8px;">
        Permanent brewery hardware infrastructure installed at Station #1. Mount along the top edge of the designated zone on your player board to unlock storage detents, cost reductions, or pipeline kickbacks.
      </p>

      <div class="card-grid-pnp">
        ${equipmentCards
          .map((u) => {
            const visualInfo = getUpgradeVisualInfo(u);
            const zoneName = u.targetZone === 1 ? 'Warehouse' : u.targetZone === 2 ? 'Brewhouse' : u.targetZone === 3 ? 'Fermentation' : u.targetZone === 4 ? 'Conditioning' : 'Packaging';
            const imgSrc = u.imagePath ? `${origin}${u.imagePath.replace(/^\./, '')}` : '';

            let headBodyHtml = '';
            if (u.storageSlots && u.storageSlots > 0) {
              const tokenType = u.storageAllowedToken && u.storageAllowedToken !== 'any' ? u.storageAllowedToken : 'grain';
              headBodyHtml = `
                <div class="pnp-head-body" style="justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box;">
                  <!-- Detent 1 (Clean circular detent - NO 1 or 2 badge) -->
                  <div class="pnp-detent-circle" title="Detent 1: Place 1 ${tokenType} token here">
                    <img src="${origin}/tokens/${tokenType}-wood-piece.png" alt="slot 1" />
                  </div>
                  <!-- Center Info (Large bold storage badge - NO duplicate '2 detents' text) -->
                  <div style="flex:1; text-align:center; padding: 0 4px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:0;">
                    <div class="pnp-pill-feature pnp-pill-equip" style="display:inline-flex; flex-direction:column; align-items:center; line-height:1.15; padding: 3px 8px; border-radius: 5px;">
                      <span style="font-size: 10px; font-weight: 900; letter-spacing: 0.3px;">+2 ${tokenType.toUpperCase()}</span>
                      <span style="font-size: 8px; font-weight: 800; letter-spacing: 0.6px; opacity: 0.95;">STORAGE</span>
                    </div>
                  </div>
                  <!-- Detent 2 (Clean circular detent - NO 1 or 2 badge) -->
                  <div class="pnp-detent-circle" title="Detent 2: Place 1 ${tokenType} token here">
                    <img src="${origin}/tokens/${tokenType}-wood-piece.png" alt="slot 2" />
                  </div>
                </div>
              `;
            } else if (visualInfo.isStacked) {
              // Dual-option stacked layout: Clean top and bottom tokens (zero redundant badge)
              const topType = visualInfo.tokens[0]?.type || 'fruit';
              const botType = visualInfo.tokens[1]?.type || 'spices';
              headBodyHtml = `
                <div class="pnp-head-body" style="align-items: center;">
                  <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; flex-shrink:0;">
                    <img src="${origin}/tokens/${topType}-wood-piece.png" style="width:20px; height:20px; object-fit:contain; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.85));" alt="${topType}" />
                    <img src="${origin}/tokens/${botType}-wood-piece.png" style="width:20px; height:20px; object-fit:contain; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.85));" alt="${botType}" />
                  </div>
                  <div style="flex:1; min-width:0; padding-left:5px;">
                    <span class="pnp-pill-feature pnp-pill-equip" style="font-size:9.5px;">${visualInfo.headline}</span>
                    <div class="pnp-rule-desc" style="font-size:9.0px; font-weight:700; color:#F3F4F6; line-height:1.25; margin-top:2px;">${visualInfo.description}</div>
                  </div>
                </div>
              `;
            } else {
              // Single token: Clean wooden piece (zero redundant badge, enlarged rule text)
              const tokenType = visualInfo.tokens[0]?.type !== 'any' ? visualInfo.tokens[0]?.type : 'hops';
              headBodyHtml = `
                <div class="pnp-head-body" style="align-items: center;">
                  <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <img src="${origin}/tokens/${tokenType}-wood-piece.png" style="width:34px; height:34px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.9));" alt="${tokenType}" />
                  </div>
                  <div style="flex:1; min-width:0; padding-left:5px;">
                    <span class="pnp-pill-feature pnp-pill-equip" style="font-size:9.5px;">${visualInfo.headline}</span>
                    <div class="pnp-rule-desc" style="font-size:9.0px; font-weight:700; color:#F3F4F6; line-height:1.25; margin-top:2px;">${visualInfo.description}</div>
                  </div>
                </div>
              `;
            }

            const vpVal = u.bonusEndgameVp || (u.storageSlots && u.storageSlots >= 2 ? 2 : Object.values(u.installTokens || {}).reduce((s, n) => s + (n || 0), 0) >= 2 ? 2 : 1);
            const anyCostQty = u.installTokens?.any || (u.storageSlots && u.storageSlots >= 2 ? 2 : vpVal);
            const costHtml = `
              <div style="display:flex; align-items:center; gap:2.5px;">
                <div style="width:12px; height:12px; border-radius:50%; background:linear-gradient(135deg, #F59E0B, #10B981, #0EA5E9); border:1px solid #FCD34D; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <span style="font-size:7.5px; color:#fff; line-height:1;">&#9733;</span>
                </div>
                <span style="font-family:monospace; font-weight:900; font-size:9.5px; color:#FDE68A;">${anyCostQty}</span>
                <span style="font-size:7.5px; font-weight:900; color:#FBBF24; letter-spacing:0.5px;">ANY</span>
              </div>
            `;
            const deptName = u.targetZone === 1 ? 'WAREHOUSE' : u.targetZone === 2 ? 'BREWHOUSE' : u.targetZone === 3 ? 'FERMENTATION' : u.targetZone === 4 ? 'CONDITIONING' : 'PACKAGING';

            return `
          <div class="pnp-card pnp-card-equip">
            <!-- Compact Top Modal: Functionality (Top) + Name, Zone, Cost, VP (Bottom) -->
            <div class="pnp-equip-head">
              <!-- Row 1: Functionality Body -->
              ${headBodyHtml}

              <!-- Hairline Divider -->
              <div style="width:100%; border-top:1px solid rgba(245,158,11,0.35); margin:2px 0;"></div>

              <!-- Row 2: Cost • Name & Zone • VP -->
              <div style="display:flex; align-items:center; justify-content:space-between; width:100%; box-sizing:border-box;">
                <div style="display:flex; align-items:center; gap:2.5px;">${costHtml}</div>
                <div style="text-align:center; flex:1; min-width:0; padding:0 3px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                  <div style="font-family:'Georgia',serif; font-size:10px; font-weight:900; color:#FFFBEB; text-transform:uppercase; letter-spacing:0.3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.15;">${u.name}</div>
                  <div style="font-size:7.5px; font-weight:800; color:#F59E0B; text-transform:uppercase; letter-spacing:0.8px; line-height:1; margin-top:1px;">${deptName}</div>
                </div>
                <div style="display:flex; align-items:center; gap:2px;">
                  <span style="color:#FDE68A; font-size:11px; font-weight:900; font-family:monospace;">${vpVal}</span>
                  <span style="color:#F59E0B; font-size:11px; font-weight:900;">VP</span>
                </div>
              </div>
            </div>

            <!-- Full-Width Artwork Canvas -->
            <div class="pnp-equip-art">
              <img src="${imgSrc}" class="pnp-card-img-bg" alt="" />
              <img src="${imgSrc}" class="pnp-card-img-contain" alt="${u.name}" onerror="this.style.opacity='0.2'" />
            </div>
          </div>
          `;
          })
          .join('')}
      </div>
    </div>

    <!-- STAFF DECK SECTION: SCALE PRINTABLE CARDS (2.38" x 3.42") -->
    <div class="section-block page-break">
      <div class="section-title">
        <span>👤 Station #2 Market: Staff Deck (20 Unique Personnel Cards)</span>
        <span class="badge" style="background:#064E3B; color:#A7F3D0; padding:2px 6px; border-radius:4px; font-weight:bold;">Top 2/3 Portrait Art &bull; Bottom 1/3 Head</span>
      </div>
      <p style="margin-bottom: 8px;">
        Brewery floor personnel hired at Station #2. Mount along the bottom edge of the designated zone on your player board to unlock active shift abilities, drafting bonuses, or spent token recovery.
      </p>

      <div class="card-grid-pnp">
        ${staffCards
          .map((s) => {
            const visualInfo = getUpgradeVisualInfo(s);
            const zoneName = s.targetZone === 1 ? 'Sourcing' : s.targetZone === 2 ? 'Brew Floor' : s.targetZone === 3 ? 'Cellar' : s.targetZone === 4 ? 'Lagering' : 'Delivery';
            const imgSrc = s.imagePath ? `${origin}${s.imagePath.replace(/^\./, '')}` : '';

            let headBodyHtml = '';
            if (s.storageSlots && s.storageSlots > 0) {
              const tokenType = s.storageAllowedToken && s.storageAllowedToken !== 'any' ? s.storageAllowedToken : 'grain';
              headBodyHtml = `
                <div class="pnp-head-body" style="justify-content: space-between; align-items: center; width: 100%; box-sizing: border-box;">
                  <!-- Detent 1 (Clean circular detent - NO 1 or 2 badge) -->
                  <div class="pnp-detent-circle" style="border-color:#10B981;" title="Detent 1: Place 1 ${tokenType} token here">
                    <img src="${origin}/tokens/${tokenType}-wood-piece.png" alt="slot 1" />
                  </div>
                  <!-- Center Info (Large bold storage badge - NO duplicate '2 detents' text) -->
                  <div style="flex:1; text-align:center; padding: 0 4px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:0;">
                    <div class="pnp-pill-feature pnp-pill-staff" style="display:inline-flex; flex-direction:column; align-items:center; line-height:1.15; padding: 3px 8px; border-radius: 5px;">
                      <span style="font-size: 10px; font-weight: 900; letter-spacing: 0.3px;">+2 ${tokenType.toUpperCase()}</span>
                      <span style="font-size: 8px; font-weight: 800; letter-spacing: 0.6px; opacity: 0.95;">STORAGE</span>
                    </div>
                  </div>
                  <!-- Detent 2 (Clean circular detent - NO 1 or 2 badge) -->
                  <div class="pnp-detent-circle" style="border-color:#10B981;" title="Detent 2: Place 1 ${tokenType} token here">
                    <img src="${origin}/tokens/${tokenType}-wood-piece.png" alt="slot 2" />
                  </div>
                </div>
              `;
            } else if (visualInfo.isStacked) {
              // Dual-option stacked layout: Clean top and bottom tokens (zero redundant badge)
              const topType = visualInfo.tokens[0]?.type || 'fruit';
              const botType = visualInfo.tokens[1]?.type || 'spices';
              headBodyHtml = `
                <div class="pnp-head-body" style="align-items: center;">
                  <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; flex-shrink:0;">
                    <img src="${origin}/tokens/${topType}-wood-piece.png" style="width:20px; height:20px; object-fit:contain; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.85));" alt="${topType}" />
                    <img src="${origin}/tokens/${botType}-wood-piece.png" style="width:20px; height:20px; object-fit:contain; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.85));" alt="${botType}" />
                  </div>
                  <div style="flex:1; min-width:0; padding-left:5px;">
                    <span class="pnp-pill-feature pnp-pill-staff" style="font-size:9.5px;">${visualInfo.headline}</span>
                    <div class="pnp-rule-desc" style="font-size:9.0px; font-weight:700; color:#F3F4F6; line-height:1.25; margin-top:2px;">${visualInfo.description}</div>
                  </div>
                </div>
              `;
            } else {
              // Single token: Clean wooden piece (zero redundant badge, enlarged rule text)
              const tokenType = visualInfo.tokens[0]?.type !== 'any' ? visualInfo.tokens[0]?.type : 'grain';
              headBodyHtml = `
                <div class="pnp-head-body" style="align-items: center;">
                  <div style="display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <img src="${origin}/tokens/${tokenType}-wood-piece.png" style="width:34px; height:34px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.9));" alt="${tokenType}" />
                  </div>
                  <div style="flex:1; min-width:0; padding-left:5px;">
                    <span class="pnp-pill-feature pnp-pill-staff" style="font-size:9.5px;">${visualInfo.headline}</span>
                    <div class="pnp-rule-desc" style="font-size:9.0px; font-weight:700; color:#F3F4F6; line-height:1.25; margin-top:2px;">${visualInfo.description}</div>
                  </div>
                </div>
              `;
            }

            const vpVal = s.bonusEndgameVp || (s.storageSlots && s.storageSlots >= 2 ? 2 : Object.values(s.installTokens || {}).reduce((s, n) => s + (n || 0), 0) >= 2 ? 2 : 1);
            const anyCostQty = s.installTokens?.any || (s.storageSlots && s.storageSlots >= 2 ? 2 : vpVal);
            const costHtml = `
              <div style="display:flex; align-items:center; gap:2.5px;">
                <div style="width:12px; height:12px; border-radius:50%; background:linear-gradient(135deg, #F59E0B, #10B981, #0EA5E9); border:1px solid #6EE7B7; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  <span style="font-size:7.5px; color:#fff; line-height:1;">&#9733;</span>
                </div>
                <span style="font-family:monospace; font-weight:900; font-size:9.5px; color:#A7F3D0;">${anyCostQty}</span>
                <span style="font-size:7.5px; font-weight:900; color:#34D399; letter-spacing:0.5px;">ANY</span>
              </div>
            `;
            const deptName = s.targetZone === 1 ? 'WAREHOUSE' : s.targetZone === 2 ? 'BREWHOUSE' : s.targetZone === 3 ? 'FERMENTATION' : s.targetZone === 4 ? 'CONDITIONING' : 'PACKAGING';

            return `
          <div class="pnp-card pnp-card-staff">
            <!-- Full-Width Artwork Canvas on Top -->
            <div class="pnp-staff-art">
              <img src="${imgSrc}" class="pnp-card-img-bg" alt="" />
              <img src="${imgSrc}" class="pnp-card-img-contain" alt="${s.name}" onerror="this.style.opacity='0.2'" />
            </div>

            <!-- Compact Bottom Modal: Name, Zone, Cost, VP (Top) + Functionality (Bottom) -->
            <div class="pnp-staff-head">
              <!-- Row 1: Cost • Name & Zone • VP -->
              <div style="display:flex; align-items:center; justify-content:space-between; width:100%; box-sizing:border-box;">
                <div style="display:flex; align-items:center; gap:2.5px;">${costHtml}</div>
                <div style="text-align:center; flex:1; min-width:0; padding:0 3px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                  <div style="font-family:'Georgia',serif; font-size:10px; font-weight:900; color:#ECFDF5; text-transform:uppercase; letter-spacing:0.3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.15;">${s.name}</div>
                  <div style="font-size:7.5px; font-weight:800; color:#10B981; text-transform:uppercase; letter-spacing:0.8px; line-height:1; margin-top:1px;">${deptName}</div>
                </div>
                <div style="display:flex; align-items:center; gap:2px;">
                  <span style="color:#A7F3D0; font-size:11px; font-weight:900; font-family:monospace;">${vpVal}</span>
                  <span style="color:#10B981; font-size:11px; font-weight:900;">VP</span>
                </div>
              </div>

              <!-- Hairline Divider -->
              <div style="width:100%; border-top:1px solid rgba(16,185,129,0.35); margin:2px 0;"></div>

              <!-- Row 2: Functionality Body -->
              ${headBodyHtml}
            </div>
          </div>
          `;
          })
          .join('')}
      </div>
    </div>
    `
        : ''
    }

    <!-- FOOTER -->
    <div style="text-align: center; border-top: 1px solid #78350F40; padding-top: 12px; margin-top: 16px; font-size: 8.5px; opacity: 0.7;">
      House of Hoyne: The Brewhouse Dial Edition &bull; Authentic Tabletop Craft Brewery Simulation &bull; Victoria, BC
    </div>
  </div>
</body>
</html>
  `;
}

export function generateAndPrintPdf(options: PdfExportOptions = { type: 'all' }) {
  const html = generatePdfHtml({
    ...options,
    origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5175',
  });

  // Open in printable popup window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Fallback if popup blocker caught it: create an invisible iframe to print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }
  }
}
