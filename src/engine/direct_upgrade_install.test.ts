import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  performCatwalkPlacement,
  performRotaryAction,
  canAffordUpgradeWithTokens,
} from './gameEngine';
import { UpgradeCard } from './cards';

describe('Direct Upgrade Purchase & Specific Token Deduction (No Payment Modal)', () => {
  it('directly purchases and installs equipment with exact specific token deduction', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];

    // Give player specific tokens: 2 grain, 1 chocolate, 1 hops
    p0.tokens = { grain: 2, hops: 1, yeast: 0, fruit: 0, spices: 0, chocolate: 1 };

    // Set top equipment at Station 1 to Roasted Malt Bin (cost: 1 chocolate)
    const card = state.rotaryBoard!.slots[1].outerCard as UpgradeCard;
    card.name = 'Roasted Malt Bin';
    card.installTokens = { chocolate: 1 };
    card.bonusEndgameVp = 2;
    card.storageSlots = 2;
    card.targetZone = 1;
    card.equipment = {
      targetZone: 1,
      name: 'Roasted Malt Bin',
      effectText: '+2 Chocolate Storage',
    };

    // Check afford with no custom tokens passed
    const afford = canAffordUpgradeWithTokens(p0, card, 'equipment');
    expect(afford.canAfford).toBe(true);
    expect(afford.tokenCost.chocolate).toBe(1);

    // Move to Phase 2, then Catwalk 1
    state.phase = 'PHASE_2_CATWALK_PLACEMENT';
    state = performCatwalkPlacement(state, 1);
    state = performCatwalkPlacement(state, 2);

    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');

    // Directly perform outer shelf commitment without passing custom paymentTokens (no modal!)
    state = performRotaryAction(state, 1, 'outward', 'equipment');

    const updatedP0 = state.players.find((p) => p.id === p0.id)!;
    // Verify:
    // 1. 1 chocolate spent, 0 chocolate remaining
    expect(updatedP0.tokens.chocolate).toBe(0);
    // 2. Grain and hops untouched
    expect(updatedP0.tokens.grain).toBe(2);
    expect(updatedP0.tokens.hops).toBe(1);
    // 3. Equipment installed in Zone 1
    expect(updatedP0.zones[1].equipment.length).toBe(1);
    expect(updatedP0.zones[1].equipment[0].name).toBe('Roasted Malt Bin');
    // 4. VP increased by 2
    expect(updatedP0.score).toBe(2);
  });

  it('prevents purchase when missing the required specific token', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];

    // Give player only grain & hops (NO chocolate)
    p0.tokens = { grain: 5, hops: 5, yeast: 0, fruit: 0, spices: 0, chocolate: 0 };

    const card = state.rotaryBoard!.slots[1].outerCard as UpgradeCard;
    card.name = 'Roasted Malt Bin';
    card.installTokens = { chocolate: 1 };
    card.bonusEndgameVp = 2;

    const afford = canAffordUpgradeWithTokens(p0, card, 'equipment');
    expect(afford.canAfford).toBe(false);
    expect(afford.reason).toContain('CHOCOLATE');

    state.phase = 'PHASE_2_CATWALK_PLACEMENT';
    state = performCatwalkPlacement(state, 1);
    state = performCatwalkPlacement(state, 2);

    // Perform action should not install card
    const nextState = performRotaryAction(state, 1, 'outward', 'equipment');
    expect(nextState.players[0].zones[1].equipment.length).toBe(0);
  });
});
