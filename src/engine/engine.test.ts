import { describe, expect, it } from 'vitest';
import { executeAITurn } from './ai';
import {
  createAssemblyLineCards,
  createBreweryDeck,
  createFullCatalog,
  createIngredientDeck,
  createRecipeDeck,
  createTaproomDeck,
  createUpgradeDeck,
  createMixerPackDeck,
} from './cards';
import {
  canAffordRecipe,
  canAffordUpgrade,
  canDraftConveyorSlot,
  canPlaceWorkerAtStation,
  checkAndExecuteTaproomFlush,
  checkAndClaimMixerPacks,
  createInitialGameState,
  executeMorningShift,
  getEffectiveRecipeRequirements,
  getPlayerCarboyCapacity,
  getPlayerHandLimit,
  getTargetBatchesForPlayerCount,
  performBrewAction,
  performDiscardExcess,
  performInvestAction,
  performSourceAction,
  performTaproomAction,
  performWorkerSourceAction,
} from './gameEngine';
import { IngredientCard, RecipeCard, UpgradeCard } from './types';

describe('House of Hoyne — 97-Card Brewery Master Deck & Catalog Spec', () => {
  it('creates exactly 218 cards matching the master catalog structure', () => {
    const catalog = createFullCatalog();
    expect(catalog.zones).toHaveLength(30);
    expect(catalog.ingredients).toHaveLength(100);
    expect(catalog.recipes).toHaveLength(64);
    expect(catalog.upgrades).toHaveLength(16);
    expect(catalog.breweryDeck).toHaveLength(80);
    expect(catalog.mixerDeck).toHaveLength(8);
    expect(catalog.totalCount).toBe(218);
  });

  it('verifies exact 4-Tier Recipe distribution (64 total across 4 distinct tiers matching Rotary Stations 3-6)', () => {
    const recipes = createRecipeDeck();
    expect(recipes).toHaveLength(64);

    // Tier 6: Core Crushers (16 Cards • 4 VP Each) — 4 recipes x 4 copies (Rotary Station #6)
    const tier6 = recipes.filter((r) => r.tier === 6);
    expect(tier6).toHaveLength(16);
    for (const r of tier6) {
      expect(r.vp).toBe(4);
      expect(r.tierName).toBe('Core Crusher');
    }

    // Tier 5: Pints & IPAs (16 Cards • 5-6 VP Each) — 4 recipes x 4 copies (Rotary Station #5)
    const tier5 = recipes.filter((r) => r.tier === 5);
    expect(tier5).toHaveLength(16);
    for (const r of tier5) {
      expect(r.tierName).toBe('Pints & IPAs');
      if (['Among Giants', 'Che Bello', 'Helios Dortmunder Golden Lager'].includes(r.name)) {
        expect(r.vp).toBe(5);
      } else {
        expect(r.name).toBe('Shine On Hazy IPA');
        expect(r.vp).toBe(6);
      }
    }

    // Tier 4: Heritage & Dark Ales (16 Cards • 6 VP Each) — 4 recipes x 4 copies (Rotary Station #4)
    const tier4 = recipes.filter((r) => r.tier === 4);
    expect(tier4).toHaveLength(16);
    for (const r of tier4) {
      expect(r.tierName).toBe('Heritage & Dark Ale');
      expect(r.vp).toBe(6);
      if (r.name.includes('Švec')) {
        expect(r.requiredIngredients).toEqual(['yeast', 'grain', 'grain', 'hops', 'chocolate']);
      }
    }

    // Tier 3: Legends & Heavyweights (16 Cards • 7-8 VP Each) — 4 recipes x 4 copies (Rotary Station #3)
    const tier3 = recipes.filter((r) => r.tier === 3);
    expect(tier3).toHaveLength(16);
    for (const r of tier3) {
      expect(r.tierName).toBe('Legend & Heavyweight');
      if (r.name === 'Dark Matter' || r.name.startsWith('Wolf Vine')) {
        expect(r.vp).toBe(7);
      } else {
        expect(r.vp).toBe(8);
      }
    }
  });

  it('verifies exact Upgrade distribution (16 Master Dual-Purpose Zone cards, 0 VP)', () => {
    const upgrades = createUpgradeDeck();
    expect(upgrades).toHaveLength(16);
    for (const u of upgrades) {
      expect(u.bonusEndgameVp).toBe(0);
      expect((u as any).vp || 0).toBe(0);
    }
    expect(upgrades.filter((u) => u.targetZone === 1)).toHaveLength(4);
    expect(upgrades.filter((u) => u.targetZone === 2)).toHaveLength(4);
    expect(upgrades.filter((u) => u.targetZone === 3)).toHaveLength(4);
    expect(upgrades.filter((u) => u.targetZone === 4)).toHaveLength(4);
  });

  it('verifies exact Ingredient subtype distribution (100 total)', () => {
    const ingredients = createIngredientDeck();
    const countBySubtype = (sub: string) =>
      ingredients.filter((c) => c.subtype === sub).length;

    // Malts (44)
    expect(countBySubtype('base_malt')).toBe(24);
    expect(countBySubtype('specialty_grain')).toBe(12);
    expect(countBySubtype('dark_roasted_malt')).toBe(8);
    // Hops (30)
    expect(countBySubtype('bittering_hops')).toBe(12);
    expect(countBySubtype('aroma_hops')).toBe(10);
    expect(countBySubtype('noble_hops')).toBe(8);
    // Yeast (18)
    expect(countBySubtype('house_yeast')).toBe(18);
    // Epic Adjuncts (8)
    expect(countBySubtype('fresh_wet_hops')).toBe(3);
    expect(countBySubtype('winter_spices')).toBe(3);
    expect(countBySubtype('local_raspberries')).toBe(2);
  });

  it('verifies Assembly Line Zone cards per player', () => {
    const zones = createAssemblyLineCards(6);
    expect(zones).toHaveLength(30);
    for (let p = 0; p < 6; p++) {
      const playerZones = zones.filter((z) => z.playerIndex === p);
      expect(playerZones.map((z) => z.zoneId)).toEqual([1, 2, 3, 4, 5]);
    }
  });
});

describe('House of Hoyne — Core Game Engine Mechanics', () => {
  it('scales target batches to trigger endgame by player count', () => {
    expect(getTargetBatchesForPlayerCount(6)).toBe(5);
    expect(getTargetBatchesForPlayerCount(5)).toBe(6);
    expect(getTargetBatchesForPlayerCount(4)).toBe(7);
    expect(getTargetBatchesForPlayerCount(3)).toBe(8);
    expect(getTargetBatchesForPlayerCount(2)).toBe(8);
    expect(getTargetBatchesForPlayerCount(1)).toBe(8);
  });

  it('initializes game state with Zero-Hand Invariant, 6 conveyor slots, and 6 Brewery Market offers', () => {
    const breweryDeck = createBreweryDeck();
    expect(breweryDeck).toHaveLength(80);
    expect(breweryDeck.filter((c) => c.deckType === 'recipe')).toHaveLength(64);
    expect(breweryDeck.filter((c) => c.deckType === 'upgrade')).toHaveLength(16);

    const state = createInitialGameState({ playerCount: 4, seed: 42 });
    expect(state.players).toHaveLength(4);
    expect(state.targetBatchesToTriggerEnd).toBe(7);
    expect(state.conveyorMarket).toHaveLength(6);
    expect(state.breweryMarket).toHaveLength(6);
    for (const p of state.players) {
      expect(p.hand).toHaveLength(0);
      expect(p.hand_cards).toHaveLength(0);
    }
  });

  it('triggers Market Flush State Machine Rule when 6 face-up Taproom cards contain 0 Recipes or 0 Upgrades', () => {
    let state = createInitialGameState({ playerCount: 2, seed: 88 });
    state = executeMorningShift(state);

    const allRecipes = createRecipeDeck();
    const allUpgrades = createUpgradeDeck();

    // Case 1: Force 6 Upgrades and 0 Recipes in taproomMarket
    const sixUpgrades = allUpgrades.slice(0, 6);
    // Provide a mixed deck so the replacement 6 cards do not immediately trigger a secondary monochrome flush
    const mixedReplacementDeck = [
      allRecipes[0],
      allUpgrades[0],
      allRecipes[1],
      allUpgrades[1],
      allRecipes[2],
      allUpgrades[2],
    ];
    const flushResultZeroRecipes = checkAndExecuteTaproomFlush(
      sixUpgrades,
      mixedReplacementDeck,
      [],
      state.turnNumber
    );
    expect(flushResultZeroRecipes.flushEvent).not.toBeNull();
    expect(flushResultZeroRecipes.flushEvent?.reason).toBe('NO_RECIPES');
    expect(flushResultZeroRecipes.flushEvent?.flushedCardNames).toHaveLength(6);
    expect(flushResultZeroRecipes.taproomDiscard.length).toBeGreaterThanOrEqual(6);
    expect(flushResultZeroRecipes.taproomMarket).toHaveLength(6);
    // New market is guaranteed to have at least 1 Recipe and 1 Upgrade
    expect(
      flushResultZeroRecipes.taproomMarket.some((c) => c.deckType === 'recipe')
    ).toBe(true);
    expect(
      flushResultZeroRecipes.taproomMarket.some((c) => c.deckType === 'upgrade')
    ).toBe(true);

    // Case 2: Draft the only Upgrade in Row 2 via performTaproomAction, causing the replacement card to be a Recipe (6 Recipes, 0 Upgrades -> auto flush!)
    const fiveRecipes = allRecipes.slice(0, 5);
    const singleUpgrade = allUpgrades.find((u) => (u.costCategories?.length ?? u.equipment?.costCategories?.length ?? 0) >= 2)!;
    state.breweryMarket = [singleUpgrade, ...fiveRecipes];
    state.taproomMarket = [singleUpgrade, ...fiveRecipes];
    // Put a Recipe on top of taproomDeck / breweryDeck so when slot 0 is refilled, all 6 cards become Recipes
    state.breweryDeck = [allRecipes[6], ...state.breweryDeck];
    state.taproomDeck = [allRecipes[6], ...state.taproomDeck];
    state.taproomDiscard = [];
    state.breweryDiscard = [];

    const ingredients = createIngredientDeck();
    const reqCosts = singleUpgrade.costCategories || singleUpgrade.equipment?.costCategories || ['malt', 'hops'];
    const cat0 = reqCosts[0];
    const cat1 = reqCosts[1];
    const pay0 = ingredients.find((i) => i.category === cat0)!;
    const pay1 = ingredients.find((i) => i.category === cat1 && i.id !== pay0.id)!;
    state.players[0].hand = [pay0, pay1];

    state = performTaproomAction(state, 0, [pay0.id, pay1.id], 'equipment');

    expect(state.lastMarketFlushEvent).not.toBeNull();
    expect(state.lastMarketFlushEvent?.reason).toBe('NO_UPGRADES');
    expect(state.taproomDiscard.length).toBeGreaterThanOrEqual(6);
    expect(state.taproomMarket).toHaveLength(6);
    expect(state.taproomMarket.some((c) => c.deckType === 'recipe')).toBe(true);
    expect(state.taproomMarket.some((c) => c.deckType === 'upgrade')).toBe(true);
  });

  it('slides recipes along the Assembly Line during Morning Shift and enforces Carboy capacity bottlenecks', () => {
    let state = createInitialGameState({ playerCount: 2, seed: 101 });
    const allRecipes = createRecipeDeck();
    const pilsner = allRecipes.find((r) => r.name === 'Hoyne Pilsner')!;
    const darkMatter = allRecipes.find((r) => r.name === 'Dark Matter')!;

    // Place Pilsner in Zone 2 (Kettle)
    state.players[0].zones[2].recipes = [pilsner];
    state = executeMorningShift(state);

    // Pilsner should have moved from Zone 2 -> Zone 3 (Carboy)
    expect(state.players[0].zones[2].recipes).toHaveLength(0);
    expect(state.players[0].zones[3].recipes).toHaveLength(1);
    expect(state.players[0].zones[3].recipes[0].name).toBe('Hoyne Pilsner');
    expect(state.phase).toBe('WORK_DAY');

    // Now test Carboy bottleneck: if Zone 3 is full AND Zone 3 doesn't clear (or if 2 recipes are in Zone 2 with capacity 1)
    const dualKettlePlayer = state.players[0];
    dualKettlePlayer.zones[2].recipes = [darkMatter, pilsner];
    dualKettlePlayer.zones[3].recipes = [];
    expect(getPlayerCarboyCapacity(dualKettlePlayer)).toBe(1);

    state.phase = 'MORNING_SHIFT';
    state = executeMorningShift(state);

    // Only 1 recipe can enter Zone 3; the second stays bottlenecked in Zone 2!
    expect(state.players[0].zones[3].recipes).toHaveLength(1);
    expect(state.players[0].zones[3].recipes[0].name).toBe('Dark Matter');
    expect(state.players[0].zones[2].recipes).toHaveLength(1);
    expect(state.players[0].zones[2].recipes[0].name).toBe('Hoyne Pilsner');

    // On the next Morning Shift, Dark Matter moves Zone 3 -> Zone 4 (Conditioning), and Pilsner moves Zone 2 -> Zone 3
    state.phase = 'MORNING_SHIFT';
    state = executeMorningShift(state);
    expect(state.players[0].zones[4].recipes).toHaveLength(1);
    expect(state.players[0].zones[4].recipes[0].name).toBe('Dark Matter');
    expect(state.players[0].zones[3].recipes).toHaveLength(1);
    expect(state.players[0].zones[3].recipes[0].name).toBe('Hoyne Pilsner');

    // On Morning Shift 4, Dark Matter advances Zone 4 -> Zone 5 (Packaging & Canning Lines)
    state.phase = 'MORNING_SHIFT';
    state = executeMorningShift(state);
    expect(state.players[0].zones[5].recipes).toHaveLength(1);
    expect(state.players[0].zones[5].recipes[0].name).toBe('Dark Matter');
    expect(state.players[0].score).toBe(0); // Still active in Packaging, not delivered yet!
    expect(state.players[0].zones[4].recipes).toHaveLength(1);
    expect(state.players[0].zones[4].recipes[0].name).toBe('Hoyne Pilsner');

    // On Morning Shift 5, Dark Matter finishes packaging and moves into Trophy Rack (scoring 7 base VP)
    state.phase = 'MORNING_SHIFT';
    state = executeMorningShift(state);
    expect(state.players[0].completedBatches).toHaveLength(1);
    expect(state.players[0].completedBatches![0].name).toBe('Dark Matter');
    expect(state.players[0].score).toBe(7);
    expect(state.players[0].zones[5].recipes).toHaveLength(1);
    expect(state.players[0].zones[5].recipes[0].name).toBe('Hoyne Pilsner');
  });

  it('implements Pay to Skip on the Market Conveyor and awards accumulated skipped cards', () => {
    let state = createInitialGameState({ playerCount: 2, seed: 7 });
    state = executeMorningShift(state); // Phase -> WORK_DAY

    const ingredients = createIngredientDeck();
    state.players[0].hand = [ingredients[0], ingredients[1]];
    const p0 = state.players[0];
    const paidCard0 = p0.hand[0];
    const paidCard1 = p0.hand[1];
    const targetSlot2Ingredient = state.conveyorMarket[2].ingredient;
    const slot0IngredientBefore = state.conveyorMarket[0].ingredient;
    const slot1IngredientBefore = state.conveyorMarket[1].ingredient;

    // Player 0 drafts slot index 2 (paying 2 cards from hand onto slots 0 and 1), then draws 1 from deck
    const check = canDraftConveyorSlot(state, p0, 2);
    expect(check.canDraft).toBe(true);
    expect(check.skipsRequired).toBe(2);

    state = performSourceAction(state, [
      {
        type: 'conveyor',
        conveyorIndex: 2,
        paidHandCardIds: [paidCard0.id, paidCard1.id],
      },
      { type: 'deck' },
    ]);

    // Slots 0 and 1 should still be at indices 0 and 1, each now holding 1 skipped card!
    expect(state.conveyorMarket[0].ingredient.id).toBe(slot0IngredientBefore.id);
    expect(state.conveyorMarket[0].skippedCards).toHaveLength(1);
    expect(state.conveyorMarket[0].skippedCards[0].id).toBe(paidCard0.id);

    expect(state.conveyorMarket[1].ingredient.id).toBe(slot1IngredientBefore.id);
    expect(state.conveyorMarket[1].skippedCards).toHaveLength(1);
    expect(state.conveyorMarket[1].skippedCards[0].id).toBe(paidCard1.id);

    // Player 0 should have received targetSlot2Ingredient
    expect(
      state.players[0].hand.some((c) => c.id === targetSlot2Ingredient.id)
    ).toBe(true);

    // Now it's Player 1's turn! Run Morning Shift, then have Player 1 draft slot 0 for free
    state = executeMorningShift(state);
    const p1HandBefore = state.players[1].hand.length;
    state = performSourceAction(state, [
      { type: 'conveyor', conveyorIndex: 0 },
      { type: 'deck' },
    ]);

    // Player 1 gets slot 0's base ingredient + 1 skipped card + 1 deck card = +3 cards total!
    expect(state.players[1].hand.length).toBe(p1HandBefore + 3);
    expect(state.players[1].hand.some((c) => c.id === paidCard0.id)).toBe(true);
  });

  it('applies Copper Mash Tun and Stainless Hop Back discounts on recipe brewing', () => {
    let state = createInitialGameState({ playerCount: 2, seed: 99 });
    state = executeMorningShift(state);

    const upgrades = createUpgradeDeck();
    const mashTun = upgrades.find((u) => u.name.includes('Copper Mash Tun'))!;
    const hopBack = upgrades.find((u) => u.name.includes('Stainless Hop Back'))!;

    const recipes = createRecipeDeck();
    const darkMatter: RecipeCard = recipes.find((r) => r.name.startsWith('Dark Matter'))!;

    const reqsBefore = getEffectiveRecipeRequirements(state.players[0], darkMatter);
    state.players[0].zones[2].equipment.push(mashTun);
    state.players[0].zones[2].equipment.push(hopBack);
    const reqsAfter = getEffectiveRecipeRequirements(state.players[0], darkMatter);

    expect(reqsAfter.effectiveSubtypes.length).toBeLessThan(reqsBefore.effectiveSubtypes.length);
  });

  it('enforces Zone 1 hand limit and transitions to DISCARD phase when exceeded', () => {
    let state = createInitialGameState({ playerCount: 2, seed: 123 });
    state = executeMorningShift(state);

    const ingredients = createIngredientDeck();
    // Give player 0 six cards (already at base hand limit of 6)
    state.players[0].hand = ingredients.slice(0, 6);
    expect(getPlayerHandLimit(state.players[0])).toBe(6);

    // Sourcing 2 more cards brings hand to 8 -> must trigger DISCARD phase
    state = performSourceAction(state, [{ type: 'deck' }, { type: 'deck' }]);
    expect(state.phase).toBe('DISCARD');
    expect(state.players[0].hand).toHaveLength(8);

    // Discard 2 cards to return to 6 and advance turn to Player 1
    const discardIds = [
      state.players[0].hand[0].id,
      state.players[0].hand[1].id,
    ];
    state = performDiscardExcess(state, discardIds);
    expect(state.players[0].hand).toHaveLength(6);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.phase).toBe('MORNING_SHIFT');

    // If a player holds 6 cards (compliant) and performDiscardExcess is called, it cleanly advances turn without discarding
    let testState = createInitialGameState({ playerCount: 2, seed: 124 });
    testState.players[0].hand = ingredients.slice(0, 6);
    testState.phase = 'DISCARD';
    testState = performDiscardExcess(testState, []);
    expect(testState.players[0].hand).toHaveLength(6);
    expect(testState.currentPlayerIndex).toBe(1);
  });

  it('validates Invest action and upgrade placement (Equipment on top, Staff tucked under)', () => {
    let state = createInitialGameState({ playerCount: 2, seed: 55 });
    state = executeMorningShift(state);

    const upgrades = createUpgradeDeck();
    const hopper = upgrades.find((u) => u.id === 'upgrade_01')!;
    state.shopMarket[0] = hopper;
    state.breweryMarket[0] = hopper;

    const ingredients = createIngredientDeck();
    const malt1 = ingredients.find((i) => i.subtype === 'base_malt')!;
    const hops1 = ingredients.find((i) => i.subtype === 'bittering_hops')!;
    state.players[0].hand = [malt1, hops1];

    const check = canAffordUpgrade(state.players[0], hopper, undefined, 'equipment');
    expect(check.canAfford).toBe(true);

    state = performInvestAction(state, 0, undefined, 'equipment');
    expect(state.players[0].zones[1].equipment).toHaveLength(1);
    expect(state.players[0].score).toBe(2); // Worth 2 VP (2-bonus upgrade)
  });

  it('enforces that an upgrade can only be built once in every location (1 max per slot)', () => {
    let state = createInitialGameState({ playerCount: 2, seed: 55 });
    state = executeMorningShift(state);

    const upgrades = createUpgradeDeck();
    const brewhouseUpgrades = upgrades.filter((u) => u.targetZone === 2);
    expect(brewhouseUpgrades.length).toBeGreaterThan(1);
    const steamJacket = brewhouseUpgrades[0];
    const rapidChiller = brewhouseUpgrades[1];

    const ingredients = createIngredientDeck();
    const getIng = (sub: string) => ingredients.find((i) => i.subtype === sub)!;

    // Give player enough ingredients of all needed types
    state.players[0].hand = [
      getIng('base_malt'),
      getIng('bittering_hops'),
      getIng('house_yeast'),
      getIng('specialty_grain'),
      getIng('noble_hops'),
    ];

    // Install Steam-Jacketed Mash Tun into Zone 2 Top (Equipment)
    state.breweryMarket[0] = steamJacket;
    const check1 = canAffordUpgrade(state.players[0], steamJacket, undefined, 'equipment');
    expect(check1.canAfford).toBe(true);

    state = performInvestAction(state, 0, undefined, 'equipment');
    expect(state.players[0].zones[2].equipment).toHaveLength(1);

    // Replenish hand
    state.players[0].hand = [
      getIng('base_malt'),
      getIng('bittering_hops'),
      getIng('house_yeast'),
      getIng('specialty_grain'),
      getIng('noble_hops'),
    ];

    // Now try to install another upgrade into Zone 2 Top (Equipment)
    state.breweryMarket[0] = rapidChiller;

    const checkDuplicateSlot = canAffordUpgrade(state.players[0], rapidChiller, undefined, 'equipment');
    expect(checkDuplicateSlot.canAfford).toBe(false);
    expect(checkDuplicateSlot.reason).toContain('already occupied');

    // Attempting performInvestAction into Zone 2 Top should be rejected
    const prevCount = state.players[0].zones[2].equipment.length;
    state = performInvestAction(state, 0, undefined, 'equipment');
    expect(state.players[0].zones[2].equipment).toHaveLength(prevCount);

    // But installing into Zone 2 Bottom (Staff) should succeed!
    state.currentPlayerIndex = 0;
    state.phase = 'WORK_DAY';
    const checkStaffSlot = canAffordUpgrade(state.players[0], rapidChiller, undefined, 'staff');
    expect(checkStaffSlot.canAfford).toBe(true);

    state = performInvestAction(state, 0, undefined, 'staff');
    expect(state.players[0].zones[2].staff).toHaveLength(1);

    // Now both Top and Bottom of Zone 2 are occupied; an un-optioned call to canAffordUpgrade should return false
    const checkBothFull = canAffordUpgrade(state.players[0], rapidChiller);
    expect(checkBothFull.canAfford).toBe(false);
    expect(checkBothFull.reason).toContain('already occupied');
  });

  it('validates 8-card Mixer Pack Bonus Deck setup and set collection claiming', () => {
    const mixerDeck = createMixerPackDeck();
    expect(mixerDeck).toHaveLength(8);

    // 2 copies each of 4 mixer packs
    const inGoodTime = mixerDeck.filter((c) => c.key === 'in_good_time');
    const fourFineFriends = mixerDeck.filter((c) => c.key === 'four_fine_friends');
    const helloSunshine = mixerDeck.filter((c) => c.key === 'hello_sunshine');
    const helloDarkness = mixerDeck.filter((c) => c.key === 'hello_darkness');

    expect(inGoodTime).toHaveLength(2);
    expect(inGoodTime[0].vp).toBe(4);
    expect(fourFineFriends).toHaveLength(2);
    expect(fourFineFriends[0].vp).toBe(5);
    expect(helloSunshine).toHaveLength(2);
    expect(helloSunshine[0].vp).toBe(6);
    expect(helloDarkness).toHaveLength(2);
    expect(helloDarkness[0].vp).toBe(7);

    // Initial state deals 4 face up, 4 in draw deck
    let state = createInitialGameState({ playerCount: 2, seed: 42 });
    expect(state.mixerMarket).toHaveLength(4);
    expect(state.mixerDeck).toHaveLength(4);

    // Put "In Good Time" into mixerMarket[0]
    const igtCard = inGoodTime[0];
    state.mixerMarket[0] = { ...igtCard };

    // Player 0 brews: Švec + Por Favor + Che Bello + Hoyne Pilsner
    const allRecipes = createRecipeDeck();
    const svec = allRecipes.find((r) => r.key === 'svec' || r.name.includes('vec'))!;
    const porFavor = allRecipes.find((r) => r.name.includes('Por Favor'))!;
    const cheBello = allRecipes.find((r) => r.name.includes('Che Bello'))!;
    const pilsner = allRecipes.find((r) => r.name.includes('Hoyne Pilsner'))!;

    // Place all 4 into Player 0's Zone 5 (Packaging & Dock / Trophy Stack)
    state.players[0].zones[5].recipes = [svec, porFavor, cheBello, pilsner];
    expect(state.players[0].mixerPacks).toHaveLength(0);
    const prevScore = state.players[0].score;

    // Check and claim mixer packs
    const claimRes = checkAndClaimMixerPacks(state, 0);
    state = claimRes.state;

    expect(claimRes.claimedCards).toHaveLength(1);
    expect(claimRes.claimedCards[0].name).toBe('In Good Time');
    expect(state.players[0].mixerPacks).toHaveLength(1);
    expect(state.players[0].scoreBreakdown.mixerPackVp).toBe(4);
    expect(state.players[0].score).toBe(prevScore + 4);

    // Market refilled from mixerDeck (still 4 face-up, deck reduced to 3)
    expect(state.mixerMarket).toHaveLength(4);
    expect(state.mixerDeck).toHaveLength(3);
  });

  it('detects recipes collected in Trophy Rack (completedBatches) and claims Mixer Pack', () => {
    let state = createInitialGameState({ playerCount: 2, seed: 99 });
    const allRecipes = createRecipeDeck();
    const pilsner = allRecipes.find((r) => r.name.includes('Hoyne Pilsner'))!;
    const darkMatter = allRecipes.find((r) => r.name.includes('Dark Matter'))!;
    const downEasy = allRecipes.find((r) => r.name.includes('Down Easy'))!;
    const helios = allRecipes.find((r) => r.name.includes('Helios'))!;

    // Put "Four Fine Friends" in market
    const fourFineFriendsCard = createMixerPackDeck().find((c) => c.name === 'Four Fine Friends')!;
    state.mixerMarket[0] = { ...fourFineFriendsCard };

    // Player has delivered Hoyne Pilsner into Trophy Rack (completedBatches)
    state.players[0].completedBatches = [pilsner];

    // Single recipe does not claim yet
    let res = checkAndClaimMixerPacks(state, 0);
    expect(res.claimedCards).toHaveLength(0);

    // Player now completes all 4 required recipes in completedBatches
    state.players[0].completedBatches = [pilsner, darkMatter, downEasy, helios];
    res = checkAndClaimMixerPacks(state, 0);
    expect(res.claimedCards).toHaveLength(1);
    expect(res.claimedCards[0].name).toBe('Four Fine Friends');
    expect(res.state.players[0].mixerPacks).toHaveLength(1);
    expect(res.state.players[0].scoreBreakdown.mixerPackVp).toBe(5);
  });

  it('completes a full 4-player simulated AI game cleanly to GAME_OVER', () => {
    let state = createInitialGameState({
      playerCount: 4,
      humanCount: 0,
      seed: 2026,
    });

    let turns = 0;
    const maxTurns = 1500;
    while (state.phase !== 'GAME_OVER' && turns < maxTurns) {
      state = executeAITurn(state);
      turns++;
    }

    expect(state.phase).toBe('GAME_OVER');
    expect(state.winnerIds.length).toBeGreaterThanOrEqual(1);
    const maxBatches = Math.max(
      ...state.players.map(
        (p) =>
          (p.completedBatches?.length || 0) +
          (p.rightWing?.filter((r: any) => r.deckType === 'recipe').length || 0) +
          p.zones[5].recipes.length +
          p.zones[4].recipes.length +
          p.zones[3].recipes.length +
          p.zones[2].recipes.length +
          p.zones[1].recipes.length
      )
    );
    expect(maxBatches).toBeGreaterThanOrEqual(state.targetBatchesToTriggerEnd);
  });

  it('correctly recognizes all 16 master recipe requirements against the 6-Color ingredient taxonomy', () => {
    const ingredients = createIngredientDeck();
    const recipes = createRecipeDeck();
    const state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];

    const getCardOfTaxonomy = (tax: 'grain' | 'hops' | 'yeast' | 'fruit' | 'spices' | 'chocolate') => {
      const match = ingredients.find((i) => i.taxonomy === tax);
      expect(match).toBeDefined();
      return match!;
    };

    // 1. Verify Dark Matter (1 Yeast + 2 Grain + 1 Spices + 1 Chocolate = 7 VP)
    const darkMatter = recipes.find((r) => r.name === 'Dark Matter')!;
    p0.hand = [
      getCardOfTaxonomy('yeast'),
      getCardOfTaxonomy('grain'),
      ingredients.find((i) => i.subtype === 'specialty_grain')!,
      ingredients.find((i) => i.subtype === 'winter_spices')!,
      ingredients.find((i) => i.subtype === 'dark_roasted_malt')!,
    ];
    const dmCheck = canAffordRecipe(p0, darkMatter);
    expect(dmCheck.canAfford).toBe(true);
    expect(dmCheck.validHandCardIds).toHaveLength(5);

    // 2. Verify Shine On (1 Yeast + 1 Grain + 2 Hops + 1 Fruit = 6 VP)
    const shineOn = recipes.find((r) => r.name.includes('Shine On'))!;
    p0.hand = [
      getCardOfTaxonomy('yeast'),
      getCardOfTaxonomy('grain'),
      ingredients.find((i) => i.subtype === 'bittering_hops')!,
      ingredients.find((i) => i.subtype === 'fresh_wet_hops')!,
      ingredients.find((i) => i.subtype === 'local_raspberries')!,
    ];
    const shineCheck = canAffordRecipe(p0, shineOn);
    expect(shineCheck.canAfford).toBe(true);
    expect(shineCheck.validHandCardIds).toHaveLength(5);

    // 3. Verify Framboozle (1 Yeast + 2 Grain + 1 Hops + 2 Fruit = 8 VP)
    const framboozle = recipes.find((r) => r.name.includes('Framboozle'))!;
    const berries = ingredients.filter((i) => i.subtype === 'local_raspberries');
    expect(berries).toHaveLength(2);
    p0.hand = [
      getCardOfTaxonomy('yeast'),
      getCardOfTaxonomy('grain'),
      ingredients.find((i) => i.subtype === 'specialty_grain')!,
      getCardOfTaxonomy('hops'),
      berries[0],
      berries[1],
    ];
    const frambCheck = canAffordRecipe(p0, framboozle);
    expect(frambCheck.canAfford).toBe(true);
    expect(frambCheck.validHandCardIds).toHaveLength(6);

    // 4. Verify Dark Roasted Chocolate Malt does NOT count as Grain
    const northStar = recipes.find((r) => r.name.includes('North Star'))!; // 1 Yeast + 3 Grain
    p0.hand = [
      getCardOfTaxonomy('yeast'),
      ingredients.find((i) => i.subtype === 'base_malt')!,
      ingredients.find((i) => i.subtype === 'specialty_grain')!,
      ingredients.find((i) => i.subtype === 'dark_roasted_malt')!, // Chocolate, NOT Grain!
    ];
    const nsCheck = canAffordRecipe(p0, northStar);
    expect(nsCheck.canAfford).toBe(false);
  });

  it('implements 6 dedicated ingredient stations with exclusive worker placement and round recall', () => {
    let state = createInitialGameState({ playerCount: 3 });

    // Verify all 6 stations initialized with 1 face-up card on top of the stack and baseDrawCounts
    const stations = state.ingredientStations;
    expect(stations).toBeDefined();
    expect(Object.keys(stations)).toEqual(['grain', 'hops', 'yeast', 'chocolate', 'spices', 'fruit']);

    // Each station is a single stack with 1 top face-up card
    expect(stations.grain.faceUpCards).toHaveLength(1);
    expect(stations.hops.faceUpCards).toHaveLength(1);
    expect(stations.yeast.faceUpCards).toHaveLength(1);
    expect(stations.chocolate.faceUpCards).toHaveLength(1);
    expect(stations.spices.faceUpCards).toHaveLength(1);
    expect(stations.fruit.faceUpCards).toHaveLength(1);

    // First 3 draw 2 cards; last 3 draw 1 card
    expect(stations.grain.baseDrawCount).toBe(2);
    expect(stations.hops.baseDrawCount).toBe(2);
    expect(stations.yeast.baseDrawCount).toBe(2);
    expect(stations.chocolate.baseDrawCount).toBe(1);
    expect(stations.spices.baseDrawCount).toBe(1);
    expect(stations.fruit.baseDrawCount).toBe(1);

    // Initial state: no stations occupied
    for (const key of Object.keys(stations) as (keyof typeof stations)[]) {
      expect(stations[key].occupiedByPlayerId).toBeNull();
    }

    // Player 0 runs morning shift and can place at 'hops' (draws 2 cards)
    state = executeMorningShift(state);
    const checkP0Hops = canPlaceWorkerAtStation(state, state.players[0], 'hops');
    expect(checkP0Hops.canPlace).toBe(true);

    const initialP0HandLen = state.players[0].hand.length;
    state = performWorkerSourceAction(state, 'hops');

    // Player 0 got exactly 2 cards from Hops and station 'hops' is now locked by Player 0
    expect(state.players[0].hand.length).toBe(initialP0HandLen + 2);
    expect(state.players[0].placedWorkerStationId).toBe('hops');
    expect(state.ingredientStations.hops.occupiedByPlayerId).toBe(state.players[0].id);
    expect(state.ingredientStations.hops.faceUpCards).toHaveLength(1); // stack top replenished

    // Turn advanced to Player 1
    expect(state.currentPlayerIndex).toBe(1);

    // Player 1 runs morning shift
    state = executeMorningShift(state);

    // Player 1 tries to place at 'hops' -> BLOCKED
    const checkP1Hops = canPlaceWorkerAtStation(state, state.players[1], 'hops');
    expect(checkP1Hops.canPlace).toBe(false);
    expect(checkP1Hops.reason).toContain('Exclusive Worker Placement');

    // Player 1 places at 'grain' instead -> SUCCESS (draws 2 cards)
    const initialP1HandLen = state.players[1].hand.length;
    state = performWorkerSourceAction(state, 'grain');
    expect(state.players[1].hand.length).toBe(initialP1HandLen + 2);
    expect(state.ingredientStations.grain.occupiedByPlayerId).toBe(state.players[1].id);

    // Turn advanced to Player 2
    expect(state.currentPlayerIndex).toBe(2);

    // Player 2 runs morning shift
    state = executeMorningShift(state);

    // Player 2 places at 'yeast' -> Action completes (draws 2 cards), wrapping from Player 2 back to Player 0!
    // Round boundary! Round 2 begins and all worker meeples are automatically recalled!
    const initialP2HandLen = state.players[2].hand.length;
    state = performWorkerSourceAction(state, 'yeast');
    expect(state.players[2].hand.length).toBe(initialP2HandLen + 2);

    expect(state.currentPlayerIndex).toBe(0);
    expect(state.roundNumber).toBe(2);

    for (const key of Object.keys(state.ingredientStations) as (keyof typeof state.ingredientStations)[]) {
      expect(state.ingredientStations[key].occupiedByPlayerId).toBeNull();
    }
    for (const p of state.players) {
      expect(p.placedWorkerStationId).toBeNull();
    }

    // Round 2: Test last 3 stacks (chocolate, spices, fruit) draw exactly 1 card each
    state = executeMorningShift(state);
    // Fill P0's hand up to base hand limit (6 cards) to verify exceeding limit triggers DISCARD
    const extraCards = createIngredientDeck().slice(0, 4);
    state.players[0].hand.push(...extraCards);
    expect(state.players[0].hand).toHaveLength(6);

    const r2P0HandLen = state.players[0].hand.length;
    state = performWorkerSourceAction(state, 'chocolate');
    expect(state.players[0].hand.length).toBe(r2P0HandLen + 1); // Chocolate draws 1 -> 7 cards
    expect(state.phase).toBe('DISCARD');
    state = performDiscardExcess(state, [state.players[0].hand[0].id]);
    expect(state.currentPlayerIndex).toBe(1);

    state = executeMorningShift(state);
    state.players[1].hand.push(...createIngredientDeck().slice(0, 4));
    const r2P1HandLen = state.players[1].hand.length;
    state = performWorkerSourceAction(state, 'spices');
    expect(state.players[1].hand.length).toBe(r2P1HandLen + 1); // Spices draws 1 -> 7 cards
    expect(state.phase).toBe('DISCARD');
    state = performDiscardExcess(state, [state.players[1].hand[0].id]);
    expect(state.currentPlayerIndex).toBe(2);

    state = executeMorningShift(state);
    const r2P2HandLen = state.players[2].hand.length;
    state = performWorkerSourceAction(state, 'fruit');
    expect(state.players[2].hand.length).toBe(r2P2HandLen + 1); // Fruit draws 1
  });
});
