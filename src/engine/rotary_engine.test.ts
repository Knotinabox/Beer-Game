import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  performRotaryAction,
  performCenterPantryAction,
  performCatwalkPlacement,
  performStationCommitment,
  executePhase1MarketRefresh,
  executeMorningShift,
  checkAndExecuteGridlockWipe,
  performEndOfShiftSlide,
  executePhase2ConveyorOperations,
  executePhase3ShiftReset,
  verifyAuthoritativeInvariants,
  verifyClosedLoopTokenConservation,
  canAffordRecipeWithTokens,
  canAffordUpgradeWithTokens,
  getRecipeTokenRequirements,
  getWarehouseCapacity,
  allocatePlayerStorage,
  performDiscardToken,
  getTargetBatchesForPlayerCount,
  TOTAL_TOKEN_POOL,
} from './gameEngine';
import {
  ROTARY_SLOT_DEFS,
  createUpgradeDeck,
  createEquipmentDeck,
  createStaffDeck,
  MASTER_UPGRADE_DECK_DEFS,
  createRecipeDeck,
  createBreweryDeck,
} from './cards';
import { RecipeCard, RotarySlotNumber } from './types';

describe('11.5" Rotary Board & Wooden Token Engine (Authoritative Spec)', () => {
  it('strictly adheres to the 6 station mathematical vector definitions and color accents', () => {
    // Station 1: Vector 90° (Top): Chocolate | Yield: 1 | Accent: #c48859
    expect(ROTARY_SLOT_DEFS[1].vectorDeg).toBe(90);
    expect(ROTARY_SLOT_DEFS[1].ingredient).toBe('chocolate');
    expect(ROTARY_SLOT_DEFS[1].tokenYield).toBe(1);
    expect(ROTARY_SLOT_DEFS[1].accent).toBe('#c48859');

    // Station 2: Vector 30° (Upper Right): Spices | Yield: 1 | Accent: #ea580c (Cinnamon Amber)
    expect(ROTARY_SLOT_DEFS[2].vectorDeg).toBe(30);
    expect(ROTARY_SLOT_DEFS[2].ingredient).toBe('spices');
    expect(ROTARY_SLOT_DEFS[2].tokenYield).toBe(1);
    expect(ROTARY_SLOT_DEFS[2].accent).toBe('#ea580c');

    // Station 3: Vector 330° (Lower Right): Fruit | Yield: 1 | Accent: #a855f7 (Royal Purple)
    expect(ROTARY_SLOT_DEFS[3].vectorDeg).toBe(330);
    expect(ROTARY_SLOT_DEFS[3].ingredient).toBe('fruit');
    expect(ROTARY_SLOT_DEFS[3].tokenYield).toBe(1);
    expect(ROTARY_SLOT_DEFS[3].accent).toBe('#a855f7');

    // Station 4: Vector 270° (Bottom): Yeast | Yield: 2 | Accent: #f39c12
    expect(ROTARY_SLOT_DEFS[4].vectorDeg).toBe(270);
    expect(ROTARY_SLOT_DEFS[4].ingredient).toBe('yeast');
    expect(ROTARY_SLOT_DEFS[4].tokenYield).toBe(2);
    expect(ROTARY_SLOT_DEFS[4].accent).toBe('#f39c12');

    // Station 5: Vector 210° (Lower Left): Hops | Yield: 2 | Accent: #2ecc71
    expect(ROTARY_SLOT_DEFS[5].vectorDeg).toBe(210);
    expect(ROTARY_SLOT_DEFS[5].ingredient).toBe('hops');
    expect(ROTARY_SLOT_DEFS[5].tokenYield).toBe(2);
    expect(ROTARY_SLOT_DEFS[5].accent).toBe('#2ecc71');

    // Station 6: Vector 150° (Upper Left): Grain | Yield: 2 | Accent: #f1c40f
    expect(ROTARY_SLOT_DEFS[6].vectorDeg).toBe(150);
    expect(ROTARY_SLOT_DEFS[6].ingredient).toBe('grain');
    expect(ROTARY_SLOT_DEFS[6].tokenYield).toBe(2);
    expect(ROTARY_SLOT_DEFS[6].accent).toBe('#f1c40f');
  });

  it('maintains the Closed-Loop Wooden Token Pool of exactly 108 tokens', () => {
    // 28 Grain, 24 Hops, 20 Yeast, 12 Fruit, 12 Spices, 12 Chocolate
    expect(TOTAL_TOKEN_POOL.grain).toBe(28);
    expect(TOTAL_TOKEN_POOL.hops).toBe(24);
    expect(TOTAL_TOKEN_POOL.yeast).toBe(20);
    expect(TOTAL_TOKEN_POOL.fruit).toBe(12);
    expect(TOTAL_TOKEN_POOL.spices).toBe(12);
    expect(TOTAL_TOKEN_POOL.chocolate).toBe(12);
    const sum = Object.values(TOTAL_TOKEN_POOL).reduce((a, b) => a + b, 0);
    expect(sum).toBe(108);

    const state = createInitialGameState({ playerCount: 4 });
    expect(verifyClosedLoopTokenConservation(state)).toBe(true);
  });

  it('verifies Master 16-Card Dual-Purpose Upgrade Deck: exact 16 cards, 0 VP, 4 zones x 4 cards', () => {
    const upgrades = createUpgradeDeck();
    expect(upgrades).toHaveLength(16);
    expect(MASTER_UPGRADE_DECK_DEFS).toHaveLength(16);

    // All upgrades must provide 0 VP / 0 endgame score bonuses
    for (const u of upgrades) {
      expect(u.bonusEndgameVp).toBe(0);
      expect((u as any).vp || 0).toBe(0);
      expect(u.installTokens).toBeDefined();
    }

    // Exactly 4 cards per Column (Zones 1 to 4)
    expect(upgrades.filter((u) => u.targetZone === 1)).toHaveLength(4);
    expect(upgrades.filter((u) => u.targetZone === 2)).toHaveLength(4);
    expect(upgrades.filter((u) => u.targetZone === 3)).toHaveLength(4);
    expect(upgrades.filter((u) => u.targetZone === 4)).toHaveLength(4);

    // Verify Card 01 and Card 13
    const c01 = upgrades.find((u) => u.id === 'upgrade_01')!;
    expect(c01.name).toBe('High-Capacity Hopper / Hop Broker');
    expect(c01.installTokens).toEqual({ grain: 1, hops: 1 });

    const c13 = upgrades.find((u) => u.id === 'upgrade_13')!;
    expect(c13.name).toBe('Cold Distribution Vault / Taproom Lead');
    expect(c13.installTokens).toEqual({ hops: 1, spices: 1 });
  });

  it('verifies 5-Zone Dedicated Upgrade Decks: 20 Equipment & 20 Staff (exactly 4 of each per 5 zones)', () => {
    const equipment = createEquipmentDeck();
    const staff = createStaffDeck();

    expect(equipment).toHaveLength(20);
    expect(staff).toHaveLength(20);

    const computeCostValuation = (installTokens?: Partial<Record<string, number>>) => {
      if (!installTokens) return 0;
      return Object.entries(installTokens).reduce((sum, [k, v]) => {
        if (!v || k === 'any') return sum;
        const weight = (k === 'chocolate' || k === 'spices' || k === 'fruit') ? 2 : 1;
        return sum + v * weight;
      }, 0);
    };

    // Exactly 4 equipment cards per zone across all 5 zones (Formula: 1 VP = 1 cheap; 2 VP = 2 cheap or 1 exp; 3 VP = 1 cheap + 1 exp)
    for (let zone = 1; zone <= 5; zone++) {
      const zoneEquip = equipment.filter((u) => u.targetZone === zone);
      expect(zoneEquip).toHaveLength(4);
      for (const e of zoneEquip) {
        expect(e.upgradeType).toBe('equipment');
        expect([1, 2, 3]).toContain(e.bonusEndgameVp);
        expect(e.installTokens).toBeDefined();
        const totalTokens = Object.values(e.installTokens || {}).reduce((sum, n) => sum + (n || 0), 0);
        expect(totalTokens).toBeLessThanOrEqual(2); // Max 2 tokens per card
        expect(computeCostValuation(e.installTokens)).toBe(e.bonusEndgameVp);
      }
    }

    // Exactly 4 staff cards per zone across all 5 zones (Formula: 1 VP = 1 cheap; 2 VP = 2 cheap or 1 exp; 3 VP = 1 cheap + 1 exp)
    for (let zone = 1; zone <= 5; zone++) {
      const zoneStaff = staff.filter((u) => u.targetZone === zone);
      expect(zoneStaff).toHaveLength(4);
      for (const s of zoneStaff) {
        expect(s.upgradeType).toBe('staff');
        expect([1, 2, 3]).toContain(s.bonusEndgameVp);
        expect(s.installTokens).toBeDefined();
        const totalTokens = Object.values(s.installTokens || {}).reduce((sum, n) => sum + (n || 0), 0);
        expect(totalTokens).toBeLessThanOrEqual(2); // Max 2 tokens per card
        expect(computeCostValuation(s.installTokens)).toBe(s.bonusEndgameVp);
      }
    }
  });

  it('initializes game state with Zero-Hand Invariant and 1 Head Brewer Meeple per player', () => {
    const state = createInitialGameState({ playerCount: 4 });

    // Zero-Hand Invariant: len(player.hand_cards) == 0
    for (const p of state.players) {
      expect(p.hand).toHaveLength(0);
      expect(p.hand_cards).toHaveLength(0);
      expect(p.tokens.grain).toBe(1);
      expect(p.tokens.hops).toBe(1);
      expect(p.tokens.yeast).toBe(1);
    }

    // The board starts completely empty on Round 1 (all meeples start off-board)
    for (let s = 1; s <= 6; s++) {
      expect(state.rotaryBoard!.slots[s as RotarySlotNumber].standbyOccupant).toBeNull();
      expect(state.rotaryBoard!.slots[s as RotarySlotNumber].inwardOccupant).toBeNull();
      expect(state.rotaryBoard!.slots[s as RotarySlotNumber].outwardOccupant).toBeNull();
    }

    // Verify authoritative invariants
    const check = verifyAuthoritativeInvariants(state);
    expect(check.valid).toBe(true);
  });

  it('enforces Invariant 1: Zero-Hand Invariant', () => {
    const state = createInitialGameState({ playerCount: 2 });
    expect(() => verifyAuthoritativeInvariants(state)).not.toThrow();

    // Violating hand count triggers assertion error
    (state.players[0].hand as any).push({ id: 'dummy', name: 'Illegal Card', deckType: 'ingredient' });
    expect(() => verifyAuthoritativeInvariants(state)).toThrow('Error: Cards cannot be held in player hand.');
  });

  it('enforces Invariant 2: Strict Pipeline Capacity Invariant (Brewhouse 1 BBL, Cellar 1 or 2, Packaging 1)', () => {
    const state = createInitialGameState({ playerCount: 2 });
    const p1 = state.players[0];

    const dummyRecipe: RecipeCard = {
      id: 'r1',
      name: 'Hoyne Pilsner',
      deckType: 'recipe',
      tier: 1,
      tierName: 'Core Crusher',
      style: 'Pilsner',
      abv: '5.3%',
      vp: 4,
      requiredIngredients: ['grain', 'hops', 'yeast'],
      completionBonusText: '',
      flavorText: '',
      colorAccent: '#00ff00',
    };

    // Brewhouse holds 1 recipe -> valid
    p1.zones[2].recipes.push(dummyRecipe);
    expect(() => verifyAuthoritativeInvariants(state)).not.toThrow();

    // Attempting to exceed 1 BBL cap in Brewhouse -> error
    p1.zones[2].recipes.push({ ...dummyRecipe, id: 'r2' });
    expect(() => verifyAuthoritativeInvariants(state)).toThrow('Error: Brewhouse exceeds 1 BBL cap.');

    // Reset Brewhouse
    p1.zones[2].recipes = [dummyRecipe];

    // Cellar holds 1 recipe -> valid
    p1.zones[3].recipes.push(dummyRecipe);
    expect(() => verifyAuthoritativeInvariants(state)).not.toThrow();

    // Cellar holds 2 recipes without Glycol Jacket -> error
    p1.zones[3].recipes.push({ ...dummyRecipe, id: 'r3' });
    expect(() => verifyAuthoritativeInvariants(state)).toThrow('Error: Cellar cap exceeded.');

    // Adding Glycol Jacket expands Cellar cap to 2 BBL -> valid!
    const glycolCard: UpgradeCard = {
      id: 'upgrade_glycol',
      name: 'Glycol Jacket',
      deckType: 'upgrade',
      targetZone: 3,
      bonusEndgameVp: 0,
      equipment: {
        name: 'Glycol Jacket',
        type: 'equipment',
        costCategories: ['malt'],
        effectKey: 'carboy_capacity_plus_1',
        effectText: '+1 Carboy capacity',
        targetZone: 3,
        bonusEndgameVp: 0,
      },
    };
    p1.zones[3].equipment.push(glycolCard);
    expect(() => verifyAuthoritativeInvariants(state)).not.toThrow();

    // Conditioning cap exceeds 1 -> error
    p1.zones[4].recipes.push(dummyRecipe);
    p1.zones[4].recipes.push({ ...dummyRecipe, id: 'r4' });
    expect(() => verifyAuthoritativeInvariants(state)).toThrow('Error: Conditioning cap exceeded.');

    // Packaging dock cap exceeds 1 -> error
    p1.zones[4].recipes = [];
    p1.zones[5].recipes.push(dummyRecipe);
    p1.zones[5].recipes.push({ ...dummyRecipe, id: 'r5' });
    expect(() => verifyAuthoritativeInvariants(state)).toThrow('Error: Packaging dock cap exceeded.');
  });

  it('enforces Invariant 3: Warehouse Ceiling Invariant (Warehouse <= 9 tokens)', () => {
    const state = createInitialGameState({ playerCount: 2 });
    const p1 = state.players[0];

    // Starting warehouse = 3 tokens (1 Grain, 1 Hops, 1 Yeast) -> valid
    expect(p1.mat?.warehouse_token_count).toBe(3);
    expect(() => verifyAuthoritativeInvariants(state)).not.toThrow();

    // Warehouse at 9 tokens -> valid
    p1.tokens.grain = 7; // 7 + 1 + 1 = 9
    expect(() => verifyAuthoritativeInvariants(state)).not.toThrow();

    // Exceeding 9 tokens -> error
    p1.tokens.grain = 8; // 8 + 1 + 1 = 10
    expect(() => verifyAuthoritativeInvariants(state)).toThrow('Error: Warehouse storage exceeded 9-token maximum.');
  });

  it('enforces Invariant 4: Standby Priority Invariant (len(bay.occupants) <= 1)', () => {
    const state = createInitialGameState({ playerCount: 4 });
    expect(() => verifyAuthoritativeInvariants(state)).not.toThrow();

    // Check standby_bays structure
    for (const bay of state.rotaryBoard!.standby_bays!) {
      expect(bay.occupants.length).toBeLessThanOrEqual(1);
    }
  });

  it('enforces Invariant 5: Shift Action Economy Invariant (actions_taken_this_shift == 1)', () => {
    const state = createInitialGameState({ playerCount: 2 });
    state.phase = 'PHASE_2_CONVEYOR_OPERATIONS';

    // Before taking action, actionsTakenThisShift is 0 -> fails check during Phase 2
    expect(() => verifyAuthoritativeInvariants(state)).toThrow('took invalid action count: 0. Expected 1.');

    // When both players have taken strictly 1 action -> passes!
    state.players[0].actionsTakenThisShift = 1;
    state.players[1].actionsTakenThisShift = 1;
    expect(() => verifyAuthoritativeInvariants(state)).not.toThrow();
  });

  it('Rule 1 & 2: simultaneously refills empty outer card shelves and enforces Gridlock Wipe Rule', () => {
    const masterDeck = createBreweryDeck();
    expect(masterDeck).toHaveLength(80);
    expect(masterDeck.filter((c) => c.deckType === 'recipe')).toHaveLength(64);
    expect(masterDeck.filter((c) => c.deckType === 'upgrade')).toHaveLength(16);

    let state = createInitialGameState({ playerCount: 2 });
    expect(state.phase).toBe('PHASE_2_CATWALK_PLACEMENT');

    // Manually set all 6 active market slots to Recipes to trigger Gridlock Wipe
    const recipes = createRecipeDeck();
    for (let s = 1; s <= 6; s++) {
      state.rotaryBoard!.slots[s as RotarySlotNumber].outerCard = { ...recipes[s - 1], id: `r_force_${s}` };
    }

    const initialDiscardCount = state.breweryDiscard.length;
    // Execute Gridlock check
    const wiped = checkAndExecuteGridlockWipe(
      state.rotaryBoard!.slots,
      state.breweryDeck,
      state.breweryDiscard,
      1
    );

    expect(wiped.wipeEvent).not.toBeNull();
    expect(wiped.wipeEvent?.reason).toBe('NO_UPGRADES');
    // All 6 cards swept to discard (or more if consecutive gridlocks wipe)
    expect(wiped.discard.length).toBeGreaterThanOrEqual(initialDiscardCount + 6);
    expect((wiped.discard.length - initialDiscardCount) % 6).toBe(0);
    // 6 newly dealt cards
    for (let s = 1; s <= 6; s++) {
      expect(wiped.slots[s as RotarySlotNumber].outerCard).not.toBeNull();
      expect(wiped.slots[s as RotarySlotNumber].outerCard?.id).not.toContain('r_force_');
    }
    // Segregated card assignments: Slots 1 & 2 are Upgrades, Slots 3-6 are Recipes
    expect(wiped.slots[1].outerCard?.deckType).toBe('upgrade');
    expect(wiped.slots[2].outerCard?.deckType).toBe('upgrade');
    expect(wiped.slots[3].outerCard?.deckType).toBe('recipe');
    expect(wiped.slots[4].outerCard?.deckType).toBe('recipe');
    expect(wiped.slots[5].outerCard?.deckType).toBe('recipe');
    expect(wiped.slots[6].outerCard?.deckType).toBe('recipe');
  });

  it('enforces outer card segregation: Locations 1 & 2 are Upgrades, Locations 3-6 are Recipes', () => {
    let state = createInitialGameState({ playerCount: 2 });
    expect(state.rotaryBoard).toBeDefined();

    // Verify initial layout
    expect(state.rotaryBoard!.slots[1].outerCard?.deckType).toBe('upgrade');
    expect(state.rotaryBoard!.slots[2].outerCard?.deckType).toBe('upgrade');
    expect(state.rotaryBoard!.slots[3].outerCard?.deckType).toBe('recipe');
    expect(state.rotaryBoard!.slots[4].outerCard?.deckType).toBe('recipe');
    expect(state.rotaryBoard!.slots[5].outerCard?.deckType).toBe('recipe');
    expect(state.rotaryBoard!.slots[6].outerCard?.deckType).toBe('recipe');

    // Verify compatibility markets
    expect(state.shopMarket).toHaveLength(2);
    expect(state.shopMarket.every((c) => c.deckType === 'upgrade')).toBe(true);
    expect(state.pubMarket).toHaveLength(4);
    expect(state.pubMarket.every((c) => c.deckType === 'recipe')).toBe(true);

    // Empty outer cards at slot 1 (upgrade) and slot 5 (recipe)
    state.rotaryBoard!.slots[1].outerCard = null;
    state.rotaryBoard!.slots[5].outerCard = null;

    // Execute Phase 1 Market Refresh
    state = executePhase1MarketRefresh(state);

    // Verify refilled cards are segregated appropriately
    expect(state.rotaryBoard!.slots[1].outerCard).not.toBeNull();
    expect(state.rotaryBoard!.slots[1].outerCard?.deckType).toBe('upgrade');
    expect(state.rotaryBoard!.slots[2].outerCard?.deckType).toBe('upgrade');
    expect(state.rotaryBoard!.slots[3].outerCard?.deckType).toBe('recipe');
    expect(state.rotaryBoard!.slots[4].outerCard?.deckType).toBe('recipe');
    expect(state.rotaryBoard!.slots[5].outerCard).not.toBeNull();
    expect(state.rotaryBoard!.slots[5].outerCard?.deckType).toBe('recipe');
    expect(state.rotaryBoard!.slots[6].outerCard?.deckType).toBe('recipe');

    // Empty all 6 slots and refresh
    for (let s = 1; s <= 6; s++) {
      state.rotaryBoard!.slots[s as RotarySlotNumber].outerCard = null;
    }
    state = executePhase1MarketRefresh(state);

    expect(state.rotaryBoard!.slots[1].outerCard?.deckType).toBe('upgrade');
    expect(state.rotaryBoard!.slots[2].outerCard?.deckType).toBe('upgrade');
    expect(state.rotaryBoard!.slots[3].outerCard?.deckType).toBe('recipe');
    expect(state.rotaryBoard!.slots[4].outerCard?.deckType).toBe('recipe');
    expect(state.rotaryBoard!.slots[5].outerCard?.deckType).toBe('recipe');
    expect(state.rotaryBoard!.slots[6].outerCard?.deckType).toBe('recipe');
  });

  it('Rule 3: enforces Forced Movement Rule and establishes sequential Catwalk 1-6 initiative order', () => {
    let state = createInitialGameState({ playerCount: 3 });
    const p1 = state.players[0];
    const p2 = state.players[1];
    const p3 = state.players[2];

    // Simulate Player 1 having occupied Station 2 on the previous shift
    p1.lastOccupiedStation = 2;

    // Player 1 cannot choose Catwalk #2 (Forced Movement Rule)
    const blocked = performCatwalkPlacement(state, 2);
    expect(blocked).toBe(state); // Blocked, state unchanged

    // Player 1 chooses Catwalk #5
    state = performCatwalkPlacement(state, 5);
    expect(state.rotaryBoard!.slots[5].catwalkOccupant?.playerId).toBe(p1.id);
    expect(state.currentPlayerIndex).toBe(1); // Advances to Player 2

    // Player 2 chooses Catwalk #1
    state = performCatwalkPlacement(state, 1);
    expect(state.rotaryBoard!.slots[1].catwalkOccupant?.playerId).toBe(p2.id);
    expect(state.currentPlayerIndex).toBe(2); // Advances to Player 3

    // Player 3 chooses Catwalk #3
    state = performCatwalkPlacement(state, 3);
    expect(state.rotaryBoard!.slots[3].catwalkOccupant?.playerId).toBe(p3.id);

    // All 3 players placed -> transitions to PHASE_3_STATION_COMMITMENT
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // Turn Order is strictly resolved sequentially from Catwalk 1 through 6:
    // Catwalk 1 has Player 2, Catwalk 3 has Player 3, Catwalk 5 has Player 1
    expect(state.rotaryBoard!.turnOrder).toEqual([p2.id, p3.id, p1.id]);
    // Player 2 acts first!
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.players[state.currentPlayerIndex].id).toBe(p2.id);
  });

  it('Rule 4: Station Commitment & Lockout (Inner Hopper tokens vs Outer Shelf cards)', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p1 = state.players[0];
    const p2 = state.players[1];

    // Player 1 places on Catwalk 6 (Grain - Yield 2)
    state = performCatwalkPlacement(state, 6);
    // Player 2 places on Catwalk 4 (Yeast - Yield 2)
    state = performCatwalkPlacement(state, 4);

    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');
    // Initiative order: Catwalk 4 (Player 2) -> Catwalk 6 (Player 1)
    expect(state.rotaryBoard!.turnOrder).toEqual([p2.id, p1.id]);
    expect(state.players[state.currentPlayerIndex].id).toBe(p2.id);

    // Player 2 commits to Inner Hopper at Station 4 (Yeast)
    const initialHopperYeast = state.centralHoppers.yeast;
    const initialP2Yeast = p2.tokens.yeast;
    state = performStationCommitment(state, 4, 'inward');

    // Player 2 drafted 2 Yeast tokens
    expect(state.players[1].tokens.yeast).toBe(initialP2Yeast + 2);
    expect(state.centralHoppers.yeast).toBe(initialHopperYeast - 2);

    // Meeple is now in Inner Hopper, catwalk cleared, station locked
    expect(state.rotaryBoard!.slots[4].inwardOccupant?.playerId).toBe(p2.id);
    expect(state.rotaryBoard!.slots[4].catwalkOccupant).toBeNull();
    expect(state.players[1].lastOccupiedStation).toBe(4);

    // Initiative order advances to Player 1 (at Catwalk 6)
    expect(state.players[state.currentPlayerIndex].id).toBe(p1.id);

    // Player 1 commits to Inner Hopper at Station 6 (Grain)
    const initialHopperGrain = state.centralHoppers.grain;
    const initialP1Grain = p1.tokens.grain;
    state = performStationCommitment(state, 6, 'inward');

    expect(state.players[0].tokens.grain).toBe(initialP1Grain + 2);
    expect(state.centralHoppers.grain).toBe(initialHopperGrain - 2);

    // Both players committed: shift completes, runs conveyor slide, resets for next shift
    expect(state.phase).toBe('PHASE_2_CATWALK_PLACEMENT');
    expect(state.turnNumber).toBe(2);
    // Closed-loop token pool remains conserved
    expect(verifyClosedLoopTokenConservation(state)).toBe(true);
  });

  it('Rule 5: Scaling End Game Trigger allows shift to finish for equal player turns', () => {
    // Scaling threshold: 6p: 5, 5p: 6, 4p: 7, 2-3p: 8
    expect(getTargetBatchesForPlayerCount(6)).toBe(5);
    expect(getTargetBatchesForPlayerCount(5)).toBe(6);
    expect(getTargetBatchesForPlayerCount(4)).toBe(7);
    expect(getTargetBatchesForPlayerCount(3)).toBe(8);
    expect(getTargetBatchesForPlayerCount(2)).toBe(8);

    let state = createInitialGameState({ playerCount: 2 });
    const p1 = state.players[0];
    const p2 = state.players[1];

    // Give Player 1 8 completed recipes in Trophy Rack (target for 2 players is 8)
    const recipes = createRecipeDeck();
    p1.completedBatches = [];
    for (let i = 0; i < 8; i++) {
      p1.completedBatches.push({ ...recipes[i % recipes.length], id: `comp_${i}` });
    }

    // Place meeples on Catwalks
    state = performCatwalkPlacement(state, 1); // p1 on Catwalk 1
    state = performCatwalkPlacement(state, 2); // p2 on Catwalk 2

    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');
    // Player 1 commits first (at Catwalk 1)
    state = performStationCommitment(state, 1, 'inward');

    // Endgame is triggered, BUT phase is not GAME_OVER yet because Player 2 still needs their turn!
    expect(state.isFinalRound).toBe(true);
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');
    expect(state.players[state.currentPlayerIndex].id).toBe(p2.id);

    // Player 2 takes turn (at Catwalk 2)
    state = performStationCommitment(state, 2, 'inward');

    // Shift finishes: now all players received equal turns -> GAME_OVER
    expect(state.phase).toBe('GAME_OVER');
    expect(state.winnerIds).toContain(p1.id);
  });

  it('Hot Seat Eviction Rule: moving onto a catwalk with someone else in catwalk, inward hopper, or outward shelf evicts them to the Hot Seat', () => {
    let state = createInitialGameState({ playerCount: 3 });
    const p1 = state.players[0];
    const p2 = state.players[1];
    const p3 = state.players[2];

    // Player 1 places on Catwalk 5
    state = performCatwalkPlacement(state, 5);
    expect(state.rotaryBoard!.slots[5].catwalkOccupant?.playerId).toBe(p1.id);
    expect(state.currentPlayerIndex).toBe(1); // Player 2's turn

    // Player 2 moves onto Catwalk 5!
    // Player 1 is evicted into the Center Ring Hot Seat!
    state = performCatwalkPlacement(state, 5);
    expect(state.rotaryBoard!.slots[5].catwalkOccupant?.playerId).toBe(p2.id);
    expect(state.rotaryBoard!.centerRingHotSeat?.playerId).toBe(p1.id);
    expect(state.rotaryBoard!.hotSeatPlayerId).toBe(p1.id);
    expect(state.rotaryBoard!.evictedFromStation).toBe(5);

    // Evicted Player 1 acts immediately next from the Hot Seat!
    expect(state.currentPlayerIndex).toBe(0);

    // Player 1 cannot pick Station 5 (evicted from station)
    const blockedP1 = performCatwalkPlacement(state, 5);
    expect(blockedP1).toBe(state);

    // Player 1 chooses Catwalk 2 from the Hot Seat
    state = performCatwalkPlacement(state, 2);
    expect(state.rotaryBoard!.slots[2].catwalkOccupant?.playerId).toBe(p1.id);
    // Hot seat cleared!
    expect(state.rotaryBoard!.centerRingHotSeat).toBeNull();
    expect(state.rotaryBoard!.hotSeatPlayerId).toBeNull();

    // Now Player 3 takes their placement turn
    expect(state.currentPlayerIndex).toBe(2);
  });

  it('Persistent Meeple Locations: meeples persist in hoppers/shelves into next shift and evict to Hot Seat if catwalk taken', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p1 = state.players[0];
    const p2 = state.players[1];

    // Round 1: Player 1 on Catwalk 1, Player 2 on Catwalk 3
    state = performCatwalkPlacement(state, 1);
    state = performCatwalkPlacement(state, 3);
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // Player 1 commits to Inner Hopper 1
    state = performStationCommitment(state, 1, 'inward');
    expect(state.rotaryBoard!.slots[1].inwardOccupant?.playerId).toBe(p1.id);

    // Player 2 commits to Inner Hopper 3
    state = performStationCommitment(state, 3, 'inward');
    expect(state.rotaryBoard!.slots[3].inwardOccupant?.playerId).toBe(p2.id);

    // Shift has completed and reset to Round 2 (Phase 2 Catwalk Placement)
    expect(state.phase).toBe('PHASE_2_CATWALK_PLACEMENT');
    expect(state.turnNumber).toBe(2);

    // VISUAL CUE INVARIANT: Both meeples are STILL in their hoppers on Round 2!
    expect(state.rotaryBoard!.slots[1].inwardOccupant?.playerId).toBe(p1.id);
    expect(state.rotaryBoard!.slots[3].inwardOccupant?.playerId).toBe(p2.id);

    // Player 1 has initiative (Station 1 is lowest).
    // Player 1 chooses Catwalk 3 (where Player 2 is still resting in the Inner Hopper)!
    // Player 1's own meeple is picked up from Hopper 1 and placed on Catwalk 3.
    // Player 2 is evicted from Hopper 3 into the Center Ring Hot Seat!
    state = performCatwalkPlacement(state, 3);

    expect(state.rotaryBoard!.slots[1].inwardOccupant).toBeNull(); // Player 1 picked up from Hopper 1
    expect(state.rotaryBoard!.slots[3].catwalkOccupant?.playerId).toBe(p1.id); // Player 1 now on Catwalk 3
    expect(state.rotaryBoard!.slots[3].inwardOccupant).toBeNull(); // Player 2 vacated from Hopper 3
    expect(state.rotaryBoard!.centerRingHotSeat?.playerId).toBe(p2.id); // Player 2 evicted to Hot Seat!
    expect(state.rotaryBoard!.hotSeatPlayerId).toBe(p2.id);
    expect(state.rotaryBoard!.evictedFromStation).toBe(3);

    // Evicted Player 2 gets immediate revenge action from the Hot Seat!
    expect(state.players[state.currentPlayerIndex].id).toBe(p2.id);
  });

  it('enforces rule: Stainless Hop Back only discounts recipes requiring 2 or more Hops (Framboozle requires 1 Hops -> no discount)', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];

    // Give player Stainless Hop Back upgrade in Zone 2
    p0.zones[2].equipment.push({
      id: 'eq-hop-back',
      cardNumber: 8,
      name: 'Stainless Hop Back',
      type: 'equipment',
      deckType: 'upgrade',
      targetZone: 2,
      effectKey: 'kettle_discount_hops',
      effectText: 'When brewing a recipe requiring 2 or more Hops, reduce the Hops cost by 1 (minimum 1 paid).',
      flavorText: 'Inline hop filtration extracts volatile oils while using fewer cones.',
      bonusEndgameVp: 0,
      costCategories: ['hops'],
    });

    // Player has 2 Grain, 2 Yeast, 2 Fruit, and ZERO Hops
    p0.tokens = {
      grain: 2,
      hops: 0,
      yeast: 2,
      fruit: 2,
      chocolate: 0,
      spices: 0,
    };

    const framboozle: RecipeCard = {
      id: 'test-framboozle',
      cardNumber: 40,
      name: 'Framboozle Raspberry Ale',
      deckType: 'recipe',
      tier: 3,
      tierName: 'Seasonal',
      style: 'Raspberry Ale',
      abv: '6.5%',
      vp: 8,
      requiredIngredients: ['yeast', 'grain', 'grain', 'hops', 'fruit', 'fruit'],
      completionBonusText: '',
      flavorText: 'Raspberry wheat.',
      colorAccent: '#F472B6',
    };

    // 1. Framboozle requires 1 Hops -> NO DISCOUNT APPLIES.
    const checkFramboozle = canAffordRecipeWithTokens(p0, framboozle);
    expect(checkFramboozle.canAfford).toBe(false);
    expect(checkFramboozle.reason).toContain('Missing wooden tokens: 1 hops');

    // 2. Down Easy requires 2 Hops -> DISCOUNT APPLIES (reduces from 2 to 1 Hops)
    const downEasy: RecipeCard = {
      id: 'test-down-easy',
      cardNumber: 2,
      name: 'Down Easy Pale Ale',
      deckType: 'recipe',
      tier: 1,
      tierName: 'Core',
      style: 'Pale Ale',
      abv: '4.5%',
      vp: 4,
      requiredIngredients: ['yeast', 'grain', 'hops', 'hops'],
      completionBonusText: '',
      flavorText: 'Easy drinking pale ale.',
      colorAccent: '#F59E0B',
    };

    // With 0 hops, Down Easy still cannot be brewed because min 1 hop must be paid
    const checkDownEasyNoHops = canAffordRecipeWithTokens(p0, downEasy);
    expect(checkDownEasyNoHops.canAfford).toBe(false);
    expect(checkDownEasyNoHops.tokenCost.hops).toBe(1); // reduced from 2 to 1!

    // With 1 hop, Down Easy CAN be brewed (2 - 1 discount = 1 hop)
    p0.tokens.hops = 1;
    const checkDownEasyWithOneHop = canAffordRecipeWithTokens(p0, downEasy);
    expect(checkDownEasyWithOneHop.canAfford).toBe(true);
  });

  it('Center Space (Catwalk Station #7): allows active player to deploy in Phase 2, wait in turn order, and collect 1 of any ingredient in Phase 3', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p1 = state.players[0];
    const p2 = state.players[1];
    const initialFruit = p1.tokens.fruit || 0;

    // 1. Phase 2: Player 1 deploys to Catwalk #7 in standby (DOES NOT draft tokens yet!)
    state = performCatwalkPlacement(state, 7);
    expect(state.players[0].tokens.fruit).toBe(initialFruit); // No token yet!
    expect(state.rotaryBoard!.slots[7].catwalkOccupant?.playerId).toBe(p1.id);

    // 2. Player 2 deploys to Catwalk #5
    state = performCatwalkPlacement(state, 5);
    expect(state.rotaryBoard!.slots[5].catwalkOccupant?.playerId).toBe(p2.id);

    // 3. Since both players placed, system transitions to Phase 3 (Station Commitment)
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // 4. Initiative order: Catwalk 5 resolves first, Catwalk 7 resolves last!
    expect(state.rotaryBoard!.turnOrder).toEqual([p2.id, p1.id]);
    expect(state.players[state.currentPlayerIndex].id).toBe(p2.id); // Player 2 acts first!

    // 5. Player 2 commits at Station 5 (Inner Hopper)
    state = performStationCommitment(state, 5, 'inward');

    // 6. Turn now advances to Player 1 stationed at Catwalk #7 (Initiative #7)
    expect(state.players[state.currentPlayerIndex].id).toBe(p1.id);

    // 7. Player 1 now commits to Station #7 and selects Fruit from Brewhouse Pantry
    state = performCenterPantryAction(state, 'fruit');

    // Token awarded in Phase 3!
    expect(state.players[0].tokens.fruit).toBe(initialFruit + 1);
    // Meeple moves out of the middle porthole into the interior Fruit pantry detent and stays there!
    expect(state.rotaryBoard!.pantryOccupants?.fruit?.playerId).toBe(p1.id);
    expect(state.rotaryBoard!.slots[7].catwalkOccupant).toBeNull();

    // 8. On end of shift slide, pantryOccupants persist across shifts unless bumped out!
    state = performEndOfShiftSlide(state);
    expect(state.rotaryBoard!.pantryOccupants?.fruit?.playerId).toBe(p1.id);
  });

  it('Catwalk Station #7: resolves last in Phase 3 initiative order among 3 players', () => {
    let state = createInitialGameState({ playerCount: 3 });
    const p0 = state.players[0];
    const p1 = state.players[1];
    const p2 = state.players[2];

    // Player 0 deploys to Catwalk #7 directly
    state = performCatwalkPlacement(state, 7);
    expect(state.rotaryBoard!.slots[7].catwalkOccupant?.playerId).toBe(p0.id);

    // Player 1 deploys to Catwalk #3
    state = performCatwalkPlacement(state, 3);

    // Player 2 deploys to Catwalk #1
    state = performCatwalkPlacement(state, 1);

    // All 3 players placed -> Phase 3 transition
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // Turn order must sort numerically by Catwalk number: 1 -> 3 -> 7
    // Station #7 acts last!
    expect(state.rotaryBoard!.turnOrder).toEqual([p2.id, p1.id, p0.id]);
    expect(state.players[state.currentPlayerIndex].id).toBe(p2.id); // Catwalk 1 acts first
  });

  it('Catwalk Station #7: Forced Movement Rule strictly forbids occupying Station #7 on consecutive shifts', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];
    const p1 = state.players[1];

    // Shift 1 - Phase 2: Player 0 deploys to Catwalk #7, Player 1 deploys to Catwalk #2
    state = performCatwalkPlacement(state, 7);
    state = performCatwalkPlacement(state, 2);
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // Shift 1 - Phase 3: Player 1 (Catwalk #2) commits, then Player 0 (Catwalk #7) commits
    state = performStationCommitment(state, 2, 'inward');
    state = performCenterPantryAction(state, 'spices');

    // Shift 1 completes -> conveyor slide -> next shift begins in Phase 2
    expect(state.players.find((p) => p.id === p0.id)?.lastOccupiedStation).toBe(7);

    // If starting next shift Phase 2:
    state.phase = 'PHASE_2_CATWALK_PLACEMENT';
    state.currentPlayerIndex = state.players.findIndex((p) => p.id === p0.id);

    // Player 0 attempts to deploy to Station #7 AGAIN:
    const blockedState = performCatwalkPlacement(state, 7);
    // Must be blocked by Forced Movement Rule (state returned unchanged)!
    expect(blockedState.rotaryBoard!.slots[7].catwalkOccupant?.playerId).not.toBe(p0.id);

    // Player 0 deploys to a different station (e.g. Catwalk #4):
    const allowedState = performCatwalkPlacement(state, 4);
    // Allowed!
    expect(allowedState.rotaryBoard!.slots[4].catwalkOccupant?.playerId).toBe(p0.id);
  });

  it('Station #7 Cannot be Evacuated/Displaced: Works like all other stations once occupied in Phase 2', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];
    const p1 = state.players[1];

    // Player 0 deploys to Station #7
    state = performCatwalkPlacement(state, 7);
    expect(state.rotaryBoard!.slots[7].catwalkOccupant?.playerId).toBe(p0.id);
    expect(state.currentPlayerIndex).toBe(1); // Player 1's turn

    // Player 1 attempts to deploy to Station #7 (already occupied by Player 0):
    const blockedState = performCatwalkPlacement(state, 7);
    // Must be blocked! Player 0 cannot be evacuated or displaced! State returned unchanged.
    expect(blockedState).toBe(state);
    expect(blockedState.rotaryBoard!.slots[7].catwalkOccupant?.playerId).toBe(p0.id);
    expect(blockedState.rotaryBoard!.centerRingHotSeat).toBeNull();
  });

  it('Station #7: Meeple moves into chosen interior pantry location and stays unless bumped out or redeployed', () => {
    let state = createInitialGameState({ playerCount: 3 });
    const p0 = state.players[0];
    const p1 = state.players[1];
    const p2 = state.players[2];

    // Shift 1: p0 takes Station 7, p1 takes Station 1, p2 takes Station 2
    state = performCatwalkPlacement(state, 7);
    state = performCatwalkPlacement(state, 1);
    state = performCatwalkPlacement(state, 2);

    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');
    state = performStationCommitment(state, 1, 'inward');
    state = performStationCommitment(state, 2, 'inward');

    // p0 at Station 7 selects 'grain'
    state = performCenterPantryAction(state, 'grain');

    // p0's meeple moved into interior location 'grain' and middle porthole is clear
    expect(state.rotaryBoard!.pantryOccupants?.grain?.playerId).toBe(p0.id);
    expect(state.rotaryBoard!.slots[7].catwalkOccupant).toBeNull();

    // Shift 2 starts: p1 deploys to Station 7 while p0 is still resting in Station 7's interior pantry.
    // Rule: Contesting Station 7 bumps the resident pantry worker to the Center Ring Hot Seat!
    state.phase = 'PHASE_2_CATWALK_PLACEMENT';
    state.currentPlayerIndex = 1; // p1's turn
    state = performCatwalkPlacement(state, 7);
    expect(state.rotaryBoard!.slots[7].catwalkOccupant?.playerId).toBe(p1.id);

    // p0 is evicted from the pantry directly into the Center Ring Hot Seat!
    expect(state.rotaryBoard!.centerRingHotSeat?.playerId).toBe(p0.id);
    expect(state.rotaryBoard!.pantryOccupants?.grain).toBeUndefined();
    expect(state.logs.some((l) => l.message.includes('EVICTION') || l.message.includes('knocked out'))).toBe(true);

    // p0 takes immediate revenge placement from Hot Seat to Station 3
    state = performCatwalkPlacement(state, 3);
    expect(state.rotaryBoard!.centerRingHotSeat).toBeNull();
    expect(state.rotaryBoard!.slots[3].catwalkOccupant?.playerId).toBe(p0.id);

    // p2 deploys to Station 4
    state = performCatwalkPlacement(state, 4);

    // In Phase 3: p1 at Station 7 commits and selects 'grain'
    state = performStationCommitment(state, 3, 'inward');
    state = performStationCommitment(state, 4, 'inward');
    state = performCenterPantryAction(state, 'grain');

    // p1 now occupies 'grain' interior location, and p0's meeple is at Station 3 (no duplicate meeple left behind!)
    expect(state.rotaryBoard!.pantryOccupants?.grain?.playerId).toBe(p1.id);
    expect(state.rotaryBoard!.slots[3].inwardOccupant?.playerId).toBe(p0.id);
  });

  it('Station #7: Moving in Phase 2 picks up meeple from interior pantry so no meeple is left behind', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];
    const p1 = state.players[1];

    // Shift 1: p0 takes Station 7, p1 takes Station 1
    state = performCatwalkPlacement(state, 7);
    state = performCatwalkPlacement(state, 1);
    state = performStationCommitment(state, 1, 'inward');
    state = performCenterPantryAction(state, 'hops');

    expect(state.rotaryBoard!.pantryOccupants?.hops?.playerId).toBe(p0.id);

    // Shift 2: p0 deploys to Station 5 (Hops) on their normal turn
    state.phase = 'PHASE_2_CATWALK_PLACEMENT';
    state.currentPlayerIndex = 0;
    state = performCatwalkPlacement(state, 5);

    // p0 is placed on Station 5, and their meeple in the pantry is picked up!
    expect(state.rotaryBoard!.slots[5].catwalkOccupant?.playerId).toBe(p0.id);
    expect(state.rotaryBoard!.pantryOccupants?.hops).toBeUndefined();
  });

  it('Warehouse Over-Capacity (Option 1 Mandatory Return): Requires returning excess tokens to central hoppers before ending shift or turn', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];
    const capacity = getWarehouseCapacity(p0);
    expect(capacity).toBe(6);

    // Give player tokens right up to capacity (e.g. 6 tokens)
    p0.tokens = {
      grain: 2,
      hops: 2,
      yeast: 2,
      fruit: 0,
      spices: 0,
      chocolate: 0,
    };
    const initialTokens = Object.values(p0.tokens).reduce((sum, v) => sum + (v || 0), 0);
    expect(initialTokens).toBe(6);

    // Player 0 deploys to Station #6 (Grain, yields +2 tokens)
    state = performCatwalkPlacement(state, 6);
    // Player 1 deploys to Station #2 (Spices, yields +1 token)
    state = performCatwalkPlacement(state, 2);
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // Turn order resolves numerically (Station 2 first, then Station 6)
    expect(state.players[state.currentPlayerIndex].id).toBe(state.players[1].id);
    state = performStationCommitment(state, 2, 'inward');

    // Now Player 0 (Station 6) acts
    expect(state.players[state.currentPlayerIndex].id).toBe(p0.id);
    state = performStationCommitment(state, 6, 'inward');

    const updatedP0 = state.players.find((p) => p.id === p0.id)!;
    const finalTokens = Object.values(updatedP0.tokens).reduce((sum, v) => sum + (v || 0), 0);

    // Warehouse is now at 8 tokens (over capacity of 6)
    expect(finalTokens).toBe(8);
    expect(updatedP0.tokens.grain).toBe(4);

    // Game log reflects over storage capacity
    const newestLog = state.logs.find((l) => l.message.includes('Inner Hopper Committed'))!;
    expect(newestLog).toBeDefined();
    expect(newestLog.message).toContain('8/6 - Over storage capacity');

    // Option 1 Mandatory Return: Player 0 cannot perform end-of-shift slide while over warehouse capacity
    const blockedState = performEndOfShiftSlide(state);
    expect(blockedState).toBe(state); // Unchanged / blocked

    // Also cannot run morning shift while over capacity
    const blockedMorningShift = executeMorningShift({ ...state, phase: 'MORNING_SHIFT', currentPlayerIndex: 0 });
    expect(blockedMorningShift.phase).toBe('MORNING_SHIFT'); // Guarded

    // Player returns 2 excess tokens to meet Warehouse Capacity (6)
    state = performDiscardToken(state, p0.id, 'grain');
    expect(state.players[0].tokens.grain).toBe(3);
    state = performDiscardToken(state, p0.id, 'grain');
    expect(state.players[0].tokens.grain).toBe(2);

    const compliantP0 = state.players.find((p) => p.id === p0.id)!;
    const compliantTokens = Object.values(compliantP0.tokens).reduce((sum, v) => sum + (v || 0), 0);
    expect(compliantTokens).toBe(6); // Capacity met!

    // Shift slide now unblocks and succeeds
    const unblockedSlide = performEndOfShiftSlide(state);
    expect(unblockedSlide).not.toBe(state);
    expect(unblockedSlide.rotaryBoard!.slots[6].standbyOccupant?.playerId).toBe(p0.id);
  });

  it('Option 1: AI players automatically return excess tokens down to warehouse capacity', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const aiPlayer = state.players[1];
    aiPlayer.isAI = true;
    aiPlayer.tokens = { grain: 2, hops: 2, yeast: 2, fruit: 0, spices: 0, chocolate: 0 };
    expect(getWarehouseCapacity(aiPlayer)).toBe(6);

    const initialHopperGrain = state.centralHoppers.grain;

    // AI deploys to Catwalk 6 (Grain - Yield 2)
    state = performCatwalkPlacement(state, 6);
    // Player 0 deploys to Catwalk 2
    state = performCatwalkPlacement(state, 2);

    // AI commits to Inner Hopper (drafts 2 Grain, which would reach 8 tokens)
    state = performStationCommitment(state, 6, 'inward');

    const updatedAI = state.players.find((p) => p.id === aiPlayer.id)!;
    const totalAiTokens = Object.values(updatedAI.tokens).reduce((sum, v) => sum + (v || 0), 0);

    // AI auto-discard enforced warehouse capacity down to 6!
    expect(totalAiTokens).toBe(6);
    // 2 excess tokens were returned back to central hoppers
    expect(state.centralHoppers.grain).toBe(initialHopperGrain);
  });

  it('Endgame Trigger: Game does NOT end when the target (e.g. 7th) recipe enters the brewery (Zone 2); only once it finishes going through all 5 zones (Zone 1-5)', () => {
    let state = createInitialGameState({ playerCount: 2 });
    state.targetBatchesToTriggerEnd = 7;

    const p0 = state.players[0];
    const recipes = createRecipeDeck();

    // Give Player 0 exactly 6 completed recipes in Trophy Rack (completedBatches)
    p0.completedBatches = [];
    for (let i = 0; i < 6; i++) {
      p0.completedBatches.push({ ...recipes[i], id: `delivered_${i}` });
    }
    expect(p0.completedBatches).toHaveLength(6);
    expect(p0.zones[5].recipes).toHaveLength(0);
    expect(p0.zones[4].recipes).toHaveLength(0);
    expect(p0.zones[3].recipes).toHaveLength(0);
    expect(p0.zones[2].recipes).toHaveLength(0);

    // Give Player 0 enough tokens to brew Down Easy Pale Ale
    p0.tokens = { grain: 2, hops: 2, yeast: 2, fruit: 0, spices: 0, chocolate: 0 };

    // Place an affordable recipe card on Outer Shelf #6
    const seventhRecipe = { ...recipes[6], id: 'recipe_seventh_test', requiredIngredients: ['grain', 'hops', 'yeast'] as any };
    state.rotaryBoard!.slots[6].outerCard = seventhRecipe;

    // Shift 1 - Catwalk placement:
    state = performCatwalkPlacement(state, 6); // Player 0 at Catwalk 6
    state = performCatwalkPlacement(state, 4); // Player 1 at Catwalk 4
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // Initiative order: Catwalk 4 (Player 1) acts first
    state = performStationCommitment(state, 4, 'inward');

    // Player 0 commits to Outer Shelf at Station 6 (Brews 7th recipe into Zone 1 Warehouse)
    expect(state.players[state.currentPlayerIndex].id).toBe(p0.id);
    state = performStationCommitment(state, 6, 'outward');

    // Shift 1 completes, conveyor operations run:
    // 7th recipe slides from Zone 1 (Warehouse) into Zone 2 (Brewhouse Kettle)!
    const p0AfterConveyor = state.players.find((p) => p.id === p0.id)!;
    expect(p0AfterConveyor.zones[2].recipes).toHaveLength(1); // Now in Brewhouse!
    expect(p0AfterConveyor.zones[3].recipes).toHaveLength(0); // Cellar empty
    expect(p0AfterConveyor.zones[4].recipes).toHaveLength(0); // Conditioning empty
    expect(p0AfterConveyor.zones[5].recipes).toHaveLength(0); // Packaging empty
    expect(p0AfterConveyor.completedBatches).toHaveLength(6); // Still only 6 delivered!

    // CRITICAL ASSERTION: The game did NOT end when 7th recipe entered the brewery!
    expect(state.phase).not.toBe('GAME_OVER');
    expect(state.isFinalRound).toBe(false);

    // Shift 2: Players move to fresh empty catwalks
    expect(state.phase).toBe('PHASE_2_CATWALK_PLACEMENT');
    state = performCatwalkPlacement(state, 2); // Player 1 at Catwalk 2
    state = performCatwalkPlacement(state, 1); // Player 0 at Catwalk 1
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // Phase 3: Station 1 commits first, then Station 2
    state = performStationCommitment(state, 1, 'inward');
    state = performStationCommitment(state, 2, 'inward');

    // Shift 2 completes -> Conveyor operations run:
    // 7th recipe slides from Zone 2 (Brewhouse) into Zone 3 (Fermentation Cellar)!
    const midP0 = state.players.find((p) => p.id === p0.id)!;
    expect(midP0.zones[3].recipes).toHaveLength(1); // Now in Cellar!
    expect(midP0.zones[4].recipes).toHaveLength(0); // Conditioning empty
    expect(midP0.zones[5].recipes).toHaveLength(0); // Packaging empty
    expect(midP0.completedBatches).toHaveLength(6); // Still only 6 delivered!
    expect(state.phase).not.toBe('GAME_OVER');
    expect(state.isFinalRound).toBe(false);

    // Shift 3: Players move to fresh empty catwalks
    expect(state.phase).toBe('PHASE_2_CATWALK_PLACEMENT');
    state = performCatwalkPlacement(state, 4); // Player 1 at Catwalk 4
    state = performCatwalkPlacement(state, 3); // Player 0 at Catwalk 3
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    state = performStationCommitment(state, 3, 'inward');
    state = performStationCommitment(state, 4, 'inward');

    // Shift 3 completes -> Conveyor operations run:
    // 7th recipe slides from Zone 3 (Cellar) into Zone 4 (Conditioning & Lagering)!
    const mid2P0 = state.players.find((p) => p.id === p0.id)!;
    expect(mid2P0.zones[4].recipes).toHaveLength(1); // Now in Conditioning!
    expect(mid2P0.zones[5].recipes).toHaveLength(0); // Packaging empty
    expect(mid2P0.completedBatches).toHaveLength(6); // Still only 6 delivered!
    expect(state.phase).not.toBe('GAME_OVER');
    expect(state.isFinalRound).toBe(false);

    // Shift 4: Players move to fresh empty catwalks
    expect(state.phase).toBe('PHASE_2_CATWALK_PLACEMENT');
    state = performCatwalkPlacement(state, 2); // Player 1 at Catwalk 2
    state = performCatwalkPlacement(state, 1); // Player 0 at Catwalk 1
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    state = performStationCommitment(state, 1, 'inward');
    state = performStationCommitment(state, 2, 'inward');

    // Shift 4 completes -> Conveyor operations run:
    // 7th recipe slides from Zone 4 (Conditioning) into Zone 5 (Packaging & Canning Lines)!
    const mid3P0 = state.players.find((p) => p.id === p0.id)!;
    expect(mid3P0.zones[5].recipes).toHaveLength(1); // Now in Zone 5 Packaging!
    expect(mid3P0.completedBatches).toHaveLength(6); // Still only 6 delivered - not finished until AFTER packaging!
    expect(state.phase).not.toBe('GAME_OVER');
    expect(state.isFinalRound).toBe(false);

    // Shift 5: Players move to fresh empty catwalks
    expect(state.phase).toBe('PHASE_2_CATWALK_PLACEMENT');
    state = performCatwalkPlacement(state, 4); // Player 1 at Catwalk 4
    state = performCatwalkPlacement(state, 3); // Player 0 at Catwalk 3
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    state = performStationCommitment(state, 3, 'inward');
    state = performStationCommitment(state, 4, 'inward');

    // Shift 5 completes -> Conveyor operations run:
    // 7th recipe slides OUT of Zone 5 into Trophy Rack (completedBatches)!
    const finalP0 = state.players.find((p) => p.id === p0.id)!;
    expect(finalP0.completedBatches).toHaveLength(7); // NOW exactly 7 delivered!

    // NOW that the 7th recipe finished going through the entire 5-zone process, the game ends!
    expect(state.phase).toBe('GAME_OVER');
    expect(state.winnerIds).toContain(p0.id);
  });

  it('Rule 5 Equal Turns: When endgame is triggered mid-shift, remaining players get to complete their turn before GAME_OVER', () => {
    let state = createInitialGameState({ playerCount: 3 });
    state.targetBatchesToTriggerEnd = 7;
    const p0 = state.players[0];
    const p1 = state.players[1];
    const p2 = state.players[2];

    // Give Player 0 already 7 delivered recipes in Trophy Rack (completedBatches)
    p0.completedBatches = [];
    for (let i = 0; i < 7; i++) {
      p0.completedBatches.push({
        id: `delivered-ale-${i}`,
        name: `Delivered Ale #${i + 1}`,
        beerType: 'Ale',
        deckType: 'recipe',
        cost: { grain: 1, hops: 1, yeast: 1 },
        vp: 3,
        description: 'Delivered Ale',
        batchNumber: i + 1,
      });
    }

    state.phase = 'PHASE_2_CATWALK_PLACEMENT';
    state.shiftPhase = 'PHASE_2_CATWALK_PLACEMENT';

    // Place catwalks: Player 0 at Catwalk 1, Player 1 at Catwalk 2, Player 2 at Catwalk 3
    state = performCatwalkPlacement(state, 1); // P0 at Catwalk 1
    state = performCatwalkPlacement(state, 2); // P1 at Catwalk 2
    state = performCatwalkPlacement(state, 3); // P2 at Catwalk 3

    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');
    expect(state.players[state.currentPlayerIndex].id).toBe(p0.id);

    // Player 0 takes action at Station 1 (triggers endgame check)
    state = performStationCommitment(state, 1, 'inward');

    // Rule 5: Final round is marked active, but GAME_OVER has NOT occurred yet!
    expect(state.isFinalRound).toBe(true);
    expect(state.endgameTriggeredByPlayerId).toBe(p0.id);
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // Player 1 still gets their turn!
    expect(state.players[state.currentPlayerIndex].id).toBe(p1.id);
    state = performStationCommitment(state, 2, 'inward');

    // Rule 5: Player 2 also still gets their turn!
    expect(state.isFinalRound).toBe(true);
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');
    expect(state.players[state.currentPlayerIndex].id).toBe(p2.id);
    state = performStationCommitment(state, 3, 'inward');

    // Only once the entire shift completes with all players having taken equal turns, the game transitions to GAME_OVER!
    expect(state.phase).toBe('GAME_OVER');
  });

  describe('Custom Upgrade & Staff Payment Selection', () => {
    it('allows player to explicitly choose which ingredient tokens to spend when purchasing upgrades', () => {
      let state = createInitialGameState({ playerCount: 2 });
      const p0 = state.players[0];

      // Give Player 0 2 Grain and 2 Yeast tokens
      p0.tokens.grain = 2;
      p0.tokens.yeast = 2;
      p0.tokens.hops = 0;

      // Ensure Station 1 has an upgrade card costing 1 ANY token
      const upgradeCard = state.rotaryBoard!.slots[1].outerCard as UpgradeCard;
      expect(upgradeCard.deckType).toBe('upgrade');
      upgradeCard.installTokens = { any: 1 };
      upgradeCard.storageSlots = 1;
      upgradeCard.bonusEndgameVp = 1;

      // Place P0 at Catwalk 1, P1 at Catwalk 2
      state.phase = 'PHASE_2_CATWALK_PLACEMENT';
      state = performCatwalkPlacement(state, 1);
      state = performCatwalkPlacement(state, 2);

      expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');
      expect(state.players[state.currentPlayerIndex].id).toBe(p0.id);

      // Player 0 chooses explicitly to pay with 1 YEAST (preserving their 2 Grain)
      const initialCentralYeast = state.centralHoppers.yeast;
      state = performRotaryAction(state, 1, 'outward', 'equipment', { yeast: 1 });

      const updatedP0 = state.players.find((p) => p.id === p0.id)!;
      // Grain should still be 2!
      expect(updatedP0.tokens.grain).toBe(2);
      // Yeast should be deducted by 1 (2 -> 1)
      expect(updatedP0.tokens.yeast).toBe(1);
      // Central hopper for yeast increased by 1
      expect(state.centralHoppers.yeast).toBe(initialCentralYeast + 1);

      // Check log contains explicit spent tokens
      const latestLog = state.logs[0];
      expect(latestLog.message).toContain('paid [1 YEAST]');
    });

    it('supports multi-token upgrade costs with mixed token choices (e.g. 1 Grain + 1 Yeast for a 2-token card)', () => {
      let state = createInitialGameState({ playerCount: 2 });
      const p0 = state.players[0];
      p0.tokens.grain = 2;
      p0.tokens.hops = 2;
      p0.tokens.yeast = 2;

      const upgradeCard = state.rotaryBoard!.slots[1].outerCard as UpgradeCard;
      upgradeCard.installTokens = { any: 2 };
      upgradeCard.storageSlots = 2;

      state.phase = 'PHASE_2_CATWALK_PLACEMENT';
      state = performCatwalkPlacement(state, 1);
      state = performCatwalkPlacement(state, 2);

      // Pay exactly 1 Grain and 1 Yeast (keeping Hops intact)
      state = performRotaryAction(state, 1, 'outward', 'equipment', { grain: 1, yeast: 1 });

      const updatedP0 = state.players.find((p) => p.id === p0.id)!;
      expect(updatedP0.tokens.grain).toBe(1);
      expect(updatedP0.tokens.yeast).toBe(1);
      expect(updatedP0.tokens.hops).toBe(2);

      const latestLog = state.logs[0];
      expect(latestLog.message).toContain('paid [1 GRAIN, 1 YEAST]');
    });

    it('rejects upgrade commitment if chosen tokens do not match required cost or player lacks stock', () => {
      let state = createInitialGameState({ playerCount: 2 });
      const p0 = state.players[0];
      p0.tokens.grain = 2;
      p0.tokens.yeast = 0;

      state.phase = 'PHASE_2_CATWALK_PLACEMENT';
      state = performCatwalkPlacement(state, 1);
      state = performCatwalkPlacement(state, 2);

      // Try paying with Yeast which P0 has 0 of
      const beforeState = state;
      const nextState = performRotaryAction(state, 1, 'outward', 'equipment', { yeast: 1 });
      // Should reject and remain unchanged
      expect(nextState).toBe(beforeState);
    });
  });

  describe('Warehouse Staging (Brewing Process Starts in Zone 1)', () => {
    it('places drafted recipe into Zone 1 (Warehouse), blocks second recipe while Zone 1 is full, and advances to Zone 2 on shift slide', () => {
      let state = createInitialGameState({ playerCount: 2 });
      const p0 = state.players[0];
      const recipes = createRecipeDeck();
      const testRecipe = { ...recipes[0], requiredIngredients: ['grain', 'hops', 'yeast'] as any };

      p0.tokens = { grain: 3, hops: 3, yeast: 3, fruit: 0, spices: 0, chocolate: 0 };
      state.rotaryBoard!.slots[3].outerCard = testRecipe;

      // Deploy meeples to catwalk
      state.phase = 'PHASE_2_CATWALK_PLACEMENT';
      state = performCatwalkPlacement(state, 3); // P0 at Catwalk 3
      state = performCatwalkPlacement(state, 4); // P1 at Catwalk 4

      expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

      // P0 commits to Outer Shelf at Station 3 (drafts recipe)
      state = performStationCommitment(state, 3, 'outward');

      const p0AfterCommit = state.players.find((p) => p.id === p0.id)!;
      // 1. Recipe MUST start in Zone 1 (Warehouse)!
      expect(p0AfterCommit.zones[1].recipes).toHaveLength(1);
      expect(p0AfterCommit.zones[1].recipes[0].name).toBe(testRecipe.name);
      expect(p0AfterCommit.zones[2].recipes).toHaveLength(0); // Brewhouse Kettle empty!

      // 2. While Zone 1 is full, canAffordRecipeWithTokens must reject another recipe
      const affordSecond = canAffordRecipeWithTokens(p0AfterCommit, testRecipe);
      expect(affordSecond.canAfford).toBe(false);
      expect(affordSecond.reason).toContain('Warehouse Staging is full');

      // 3. P1 commits and shift ends -> conveyor operations run!
      state = performStationCommitment(state, 4, 'inward');

      const p0AfterConveyor = state.players.find((p) => p.id === p0.id)!;
      // Recipe advanced from Zone 1 (Warehouse) -> Zone 2 (Brewhouse)!
      expect(p0AfterConveyor.zones[1].recipes).toHaveLength(0); // Warehouse cleared
      expect(p0AfterConveyor.zones[2].recipes).toHaveLength(1); // Brewhouse has batch
      expect(p0AfterConveyor.zones[2].recipes[0].name).toBe(testRecipe.name);
    });

    it('Upgrade Area Limits: Each area allows at most 1 equipment and 1 staff upgrade (e.g. Warehouse 1 staff + 1 equipment)', () => {
      let state = createInitialGameState({ playerCount: 2 });
      const p0 = state.players[0];
      p0.tokens = { grain: 5, hops: 5, yeast: 5, fruit: 0, spices: 0, chocolate: 0 };

      const eq1: UpgradeCard = {
        id: 'eq-wh-1',
        name: 'Storage Silo',
        deckType: 'upgrade',
        cardKind: 'equipment',
        targetZone: 1,
        bonusEndgameVp: 1,
        installTokens: { any: 1 },
      };
      const eq2: UpgradeCard = {
        id: 'eq-wh-2',
        name: 'Auger Conveyor',
        deckType: 'upgrade',
        cardKind: 'equipment',
        targetZone: 1,
        bonusEndgameVp: 1,
        installTokens: { any: 1 },
      };
      const staff1: UpgradeCard = {
        id: 'st-wh-1',
        name: 'Warehouse Expediter',
        deckType: 'upgrade',
        cardKind: 'staff',
        targetZone: 1,
        bonusEndgameVp: 1,
        installTokens: { any: 1 },
      };
      const staff2: UpgradeCard = {
        id: 'st-wh-2',
        name: 'Grain Master',
        deckType: 'upgrade',
        cardKind: 'staff',
        targetZone: 1,
        bonusEndgameVp: 1,
        installTokens: { any: 1 },
      };

      // Initially, Zone 1 is empty: can afford eq1 and staff1
      expect(canAffordUpgradeWithTokens(p0, eq1).canAfford).toBe(true);
      expect(canAffordUpgradeWithTokens(p0, staff1).canAfford).toBe(true);

      // 1. Install Equipment in Zone 1
      p0.zones[1].equipment.push(eq1);

      // Now Zone 1 equipment slot is occupied: eq2 must be rejected!
      const eq2Check = canAffordUpgradeWithTokens(p0, eq2);
      expect(eq2Check.canAfford).toBe(false);
      expect(eq2Check.reason).toBe('Zone 1 (Warehouse) already has an Equipment upgrade (1 max per area).');

      // However, staff slot in Zone 1 is still open!
      const staff1Check = canAffordUpgradeWithTokens(p0, staff1);
      expect(staff1Check.canAfford).toBe(true);

      // 2. Hire Staff in Zone 1 (now Warehouse has 1 equipment AND 1 staff)
      p0.zones[1].staff.push(staff1);

      // Now Zone 1 staff slot is occupied: staff2 must be rejected!
      const staff2Check = canAffordUpgradeWithTokens(p0, staff2);
      expect(staff2Check.canAfford).toBe(false);
      expect(staff2Check.reason).toBe('Zone 1 (Warehouse) already has a Staff upgrade (1 max per area).');

      // 3. Test performStationCommitment rejects installing into an occupied slot
      state.phase = 'PHASE_2_CATWALK_PLACEMENT';
      state.rotaryBoard!.slots[2].outerCard = eq2;
      state = performCatwalkPlacement(state, 2); // P0 at Catwalk 2
      state = performCatwalkPlacement(state, 3); // P1 at Catwalk 3
      expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

      const stateBeforeFailedCommit = state;
      const stateAfterFailedCommit = performStationCommitment(state, 2, 'outward');
      // State should not change, card must not be installed
      expect(stateAfterFailedCommit).toBe(stateBeforeFailedCommit);
      expect(state.players[0].zones[1].equipment).toHaveLength(1);
      expect(state.players[0].zones[1].equipment[0].id).toBe('eq-wh-1');
    });

    it('4-Tier Segregated Rotary Market (Layout A): Stations 3-6 host Tiers 3-6 recipes with dedicated refills', () => {
      let state = createInitialGameState({ playerCount: 2, seed: 123 });
      expect(state.rotaryBoard).toBeDefined();

      // Station 1: Equipment card
      const slot1Card = state.rotaryBoard!.slots[1].outerCard;
      expect(slot1Card).not.toBeNull();
      expect(slot1Card?.deckType).toBe('upgrade');
      expect((slot1Card as UpgradeCard).cardKind).toBe('equipment');

      // Station 2: Staff card
      const slot2Card = state.rotaryBoard!.slots[2].outerCard;
      expect(slot2Card).not.toBeNull();
      expect(slot2Card?.deckType).toBe('upgrade');
      expect((slot2Card as UpgradeCard).cardKind).toBe('staff');

      // Station 3: Dedicated Tier 3 Recipe Deck (Fruit Hopper • Legends & Heavyweights)
      const slot3Card = state.rotaryBoard!.slots[3].outerCard as RecipeCard;
      expect(slot3Card).not.toBeNull();
      expect(slot3Card.deckType).toBe('recipe');
      expect(slot3Card.tier).toBe(3);
      expect(slot3Card.tierName).toBe('Legend & Heavyweight');
      expect([7, 8]).toContain(slot3Card.vp);

      // Station 4: Dedicated Tier 4 Recipe Deck (Yeast Hopper • Heritage & Dark Ales)
      const slot4Card = state.rotaryBoard!.slots[4].outerCard as RecipeCard;
      expect(slot4Card).not.toBeNull();
      expect(slot4Card.deckType).toBe('recipe');
      expect(slot4Card.tier).toBe(4);
      expect(slot4Card.tierName).toBe('Heritage & Dark Ale');
      expect(slot4Card.vp).toBe(6);

      // Station 5: Dedicated Tier 5 Recipe Deck (Hops Hopper • Pints & IPAs)
      const slot5Card = state.rotaryBoard!.slots[5].outerCard as RecipeCard;
      expect(slot5Card).not.toBeNull();
      expect(slot5Card.deckType).toBe('recipe');
      expect(slot5Card.tier).toBe(5);
      expect(slot5Card.tierName).toBe('Pints & IPAs');
      expect([5, 6]).toContain(slot5Card.vp);

      // Station 6: Dedicated Tier 6 Recipe Deck (Grain Hopper • Core Crushers)
      const slot6Card = state.rotaryBoard!.slots[6].outerCard as RecipeCard;
      expect(slot6Card).not.toBeNull();
      expect(slot6Card.deckType).toBe('recipe');
      expect(slot6Card.tier).toBe(6);
      expect(slot6Card.tierName).toBe('Core Crusher');
      expect(slot6Card.vp).toBe(4);

      // Now draft Station 6 (Tier 6) and Station 4 (Tier 4)
      state.rotaryBoard!.slots[4].outerCard = null;
      state.rotaryBoard!.slots[6].outerCard = null;

      // Execute Phase 1 Market Refresh
      state = executePhase1MarketRefresh(state);

      // Station 4 must have refilled with another Tier 4 Recipe!
      const refilledSlot4 = state.rotaryBoard!.slots[4].outerCard as RecipeCard;
      expect(refilledSlot4).not.toBeNull();
      expect(refilledSlot4.deckType).toBe('recipe');
      expect(refilledSlot4.tier).toBe(4);

      // Station 6 must have refilled with another Tier 6 Recipe!
      const refilledSlot6 = state.rotaryBoard!.slots[6].outerCard as RecipeCard;
      expect(refilledSlot6).not.toBeNull();
      expect(refilledSlot6.deckType).toBe('recipe');
      expect(refilledSlot6.tier).toBe(6);
    });

    it('triggers Conical Unitank +1 Hops kickback when beer advances from Fermentation Cellar to Conditioning', () => {
      let state = createInitialGameState({ playerCount: 2, seed: 99 });
      const p0 = state.players[0];
      const initialHops = p0.tokens.hops;

      // Install Conical Unitank in Zone 3 Equipment
      const equipmentDeck = createEquipmentDeck();
      const unitank = equipmentDeck.find((e) => e.name === 'Conical Unitank')!;
      expect(unitank).toBeDefined();
      expect(unitank.effectKey).toBe('advance_cellar_to_pack_take_hops');
      p0.zones[3].equipment = [unitank];

      // Place a recipe in Zone 3 (Fermentation Cellar) and ensure Zone 4 is empty
      const recipes = createRecipeDeck();
      p0.zones[3].recipes = [{ ...recipes[0], id: 'test_fermenting_beer' }];
      p0.zones[4].recipes = [];

      // Run shift conveyor operations
      const afterConveyor = executePhase2ConveyorOperations(state);
      const afterP0 = afterConveyor.players[0];

      // Recipe must have advanced to Zone 4 (Conditioning & Lagering)
      expect(afterP0.zones[3].recipes).toHaveLength(0);
      expect(afterP0.zones[4].recipes).toHaveLength(1);
      expect(afterP0.zones[4].recipes[0].id).toBe('test_fermenting_beer');

      // Conical Unitank must have granted +1 Hops token from central hopper!
      expect(afterP0.tokens.hops).toBe(initialHops + 1);
    });
  });
  describe('Warehouse & Card Storage Allocation', () => {
    it('keeps warehouse spaces strictly capped at 6 and allocates extra tokens directly to cards', () => {
      const state = createInitialGameState({ playerCount: 2 });
      const p = state.players[0];

      // Give player 8 tokens: 2 grain, 2 hops, 2 yeast, 2 fruit
      p.tokens = { grain: 2, hops: 2, yeast: 2, fruit: 2, spices: 0, chocolate: 0 };

      // Install Cold Vault (+2 Any Storage) in Zone 4 Equipment
      p.zones[4].equipment = [
        {
          id: 'cold-vault-test',
          name: 'Cold Distribution Vault',
          deckType: 'upgrade',
          cardKind: 'equipment',
          targetZone: 4,
          storageSlots: 2,
          storageAllowedToken: 'any',
        } as any,
      ];

      const alloc = allocatePlayerStorage(p);
      expect(alloc.warehouseTokens).toHaveLength(6);
      expect(alloc.warehouseTokens).toEqual(['grain', 'grain', 'hops', 'hops', 'yeast', 'yeast']);
      expect(alloc.cardTokens['cold-vault-test']).toEqual(['fruit', 'fruit']);
      expect(alloc.excessTokens).toHaveLength(0);
      expect(alloc.totalCapacity).toBe(8);
    });

    it('allocates dedicated tokens directly to matching card first', () => {
      const state = createInitialGameState({ playerCount: 2 });
      const p = state.players[0];

      // Player has 2 grain, 1 hops, 2 spices (total 5 tokens)
      p.tokens = { grain: 2, hops: 1, yeast: 0, fruit: 0, spices: 2, chocolate: 0 };

      // Install Spice Specialist (+2 Spices Storage)
      p.zones[3].staff = [
        {
          id: 'spice-staff-test',
          name: 'Spice Specialist',
          deckType: 'upgrade',
          cardKind: 'staff',
          targetZone: 3,
          storageSlots: 2,
          storageAllowedToken: 'spices',
        } as any,
      ];

      const alloc = allocatePlayerStorage(p);
      // Spices go onto the dedicated card
      expect(alloc.cardTokens['spice-staff-test']).toEqual(['spices', 'spices']);
      // Warehouse only gets the remaining 3 tokens (leaving 3 empty spaces)
      expect(alloc.warehouseTokens).toEqual(['grain', 'grain', 'hops']);
      expect(alloc.excessTokens).toHaveLength(0);
    });
  });
});
