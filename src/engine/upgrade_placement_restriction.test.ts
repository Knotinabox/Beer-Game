import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  canAffordUpgradeWithTokens,
  performStationCommitment,
  performInvestAction,
} from './gameEngine';
import { chooseAIAction } from './ai';
import { EQUIPMENT_DECK_DEFS, STAFF_DECK_DEFS, UpgradeCard } from './cards';

const ALL_UPGRADES: UpgradeCard[] = [
  ...EQUIPMENT_DECK_DEFS.map((d, i) => ({ ...d, id: `test-eq-${i}` } as UpgradeCard)),
  ...STAFF_DECK_DEFS.map((d, i) => ({ ...d, id: `test-staff-${i}` } as UpgradeCard)),
];

describe('Strict Upgrade Placement Restrictions (Equipment vs Staff & Target Zone)', () => {
  it('strictly rejects installing a Staff card into the Equipment slot', () => {
    const state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];

    // Staff card #1: Yeast Lab Tech (Zone 1 Staff)
    const staffCard = ALL_UPGRADES.find((c) => c.name === 'Yeast Lab Tech')!;
    expect(staffCard.cardKind).toBe('staff');
    expect(staffCard.targetZone).toBe(1);

    // Give player plenty of tokens
    p0.tokens.grain = 10;
    p0.tokens.hops = 10;
    p0.tokens.yeast = 10;

    // Attempt to install as 'equipment'
    const afford = canAffordUpgradeWithTokens(p0, staffCard, 'equipment');
    expect(afford.canAfford).toBe(false);
    expect(afford.reason).toContain('Staff cards must be hired into the Staff slot');
  });

  it('strictly rejects installing an Equipment card into the Staff slot', () => {
    const state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];

    // Equipment card #1: High-Capacity Hopper (Zone 1 Equipment)
    const equipCard = ALL_UPGRADES.find((c) => c.name === 'High-Capacity Hopper')!;
    expect(equipCard.cardKind).toBe('equipment');
    expect(equipCard.targetZone).toBe(1);

    // Give player plenty of tokens
    p0.tokens.grain = 10;
    p0.tokens.hops = 10;

    // Attempt to install as 'staff'
    const afford = canAffordUpgradeWithTokens(p0, equipCard, 'staff');
    expect(afford.canAfford).toBe(false);
    expect(afford.reason).toContain('Equipment cards must be installed into the Equipment slot');
  });

  it('correctly installs Staff into zones[targetZone].staff and Equipment into zones[targetZone].equipment', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const p0 = state.players[0];
    p0.tokens.grain = 10;
    p0.tokens.hops = 10;

    // Kettle Operator: Zone 2 Staff
    const kettleOperator = ALL_UPGRADES.find((c) => c.name === 'Kettle Operator')!;
    expect(kettleOperator.cardKind).toBe('staff');
    expect(kettleOperator.targetZone).toBe(2);

    // Spent Grain Collector: Zone 2 Equipment
    const spentGrainCollector = ALL_UPGRADES.find((c) => c.name === 'Spent Grain Collector')!;
    expect(spentGrainCollector.cardKind).toBe('equipment');
    expect(spentGrainCollector.targetZone).toBe(2);

    // Set Station 1 outer card to kettleOperator (Staff)
    state.rotaryBoard!.slots[1].outerCard = kettleOperator;
    state.rotaryBoard!.slots[1].catwalkOccupant = {
      playerId: p0.id,
      playerName: p0.name,
      playerColor: p0.color,
    };
    state.phase = 'PHASE_3_STATION_COMMITMENT';

    // Commit to outer card as staff
    state = performStationCommitment(state, 1, 'outward', 'staff');

    // Verify it landed in zones[2].staff, NOT zones[2].equipment!
    expect(state.players[0].zones[2].staff).toHaveLength(1);
    expect(state.players[0].zones[2].staff[0].name).toBe('Kettle Operator');
    expect(state.players[0].zones[2].equipment).toHaveLength(0);

    // Now set Station 2 outer card to spentGrainCollector (Equipment)
    state.currentPlayerIndex = 0;
    state.rotaryBoard!.turnOrder = [p0.id];
    state.rotaryBoard!.slots[2].outerCard = spentGrainCollector;
    state.rotaryBoard!.slots[2].catwalkOccupant = {
      playerId: p0.id,
      playerName: p0.name,
      playerColor: p0.color,
    };

    // Commit to outer card as equipment
    state = performStationCommitment(state, 2, 'outward', 'equipment');

    // Verify it landed in zones[2].equipment, NOT zones[2].staff!
    expect(state.players[0].zones[2].equipment).toHaveLength(1);
    expect(state.players[0].zones[2].equipment[0].name).toBe('Spent Grain Collector');
    expect(state.players[0].zones[2].staff).toHaveLength(1); // Still just the 1 Kettle Operator
  });

  it('AI players choose the correct slot (staff for staff cards, equipment for equipment cards)', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const aiPlayer = state.players[1];
    aiPlayer.isAI = true;
    aiPlayer.tokens = { grain: 10, hops: 10, yeast: 10, chocolate: 10, spices: 10, fruit: 10 };

    // Set Station 1 outer card to Head Cellarman (Zone 3 Staff)
    const headCellarman = ALL_UPGRADES.find((c) => c.name === 'Head Cellarman')!;
    state.rotaryBoard!.slots[1].outerCard = headCellarman;
    state.rotaryBoard!.slots[1].catwalkOccupant = {
      playerId: aiPlayer.id,
      playerName: aiPlayer.name,
      playerColor: aiPlayer.color,
    };
    state.currentPlayerIndex = 1;
    state.phase = 'PHASE_3_STATION_COMMITMENT';

    const aiAction = chooseAIAction(state);
    expect(aiAction.actionDescription).toContain('Head Cellarman');

    const nextState = aiAction.nextState;
    // Verify Head Cellarman is in Cellar (Zone 3) staff, NOT equipment!
    expect(nextState.players[1].zones[3].staff).toHaveLength(1);
    expect(nextState.players[1].zones[3].staff[0].name).toBe('Head Cellarman');
    expect(nextState.players[1].zones[3].equipment).toHaveLength(0);
  });
});
