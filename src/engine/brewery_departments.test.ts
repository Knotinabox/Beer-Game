import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  performCatwalkPlacement,
  performDepartmentPlacement,
  performDepartmentAction,
  performStationCommitment,
  getWarehouseCapacity,
  toggleDepartmentsModule,
  flipPlayerDepartmentCard,
} from './gameEngine';
import {
  BREWERY_DEPARTMENT_DEFINITIONS,
  DOUBLE_SIDED_DEPARTMENT_CARDS,
  createDepartmentDeck,
  createDoubleSidedDepartmentDeck,
} from './cards';
import { PlayerState, RotarySlotNumber } from './types';

describe('Personal Brewery Departments System (6 Double-Sided Cards • 12 Actions)', () => {
  it('initializes 12 unique Brewery Department actions and 6 double-sided cards', () => {
    const deck = createDepartmentDeck();
    expect(deck).toHaveLength(12);

    const numbers = deck.map((d) => d.departmentNumber).sort((a, b) => a - b);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

    const ids = deck.map((d) => d.id);
    expect(ids).toContain('dept_night_shift');
    expect(ids).toContain('dept_taproom');
    expect(ids).toContain('dept_sourcing_desk');
    expect(ids).toContain('dept_farm_swap');
    expect(ids).toContain('dept_grain_silo');
    expect(ids).toContain('dept_hop_locker');
    expect(ids).toContain('dept_yeast_bank');
    expect(ids).toContain('dept_rd_desk');
    expect(ids).toContain('dept_maintenance_shop');
    expect(ids).toContain('dept_hr_office');
    expect(ids).toContain('dept_qa_lab');
    expect(ids).toContain('dept_oak_cellar');

    const doubleCards = createDoubleSidedDepartmentDeck();
    expect(doubleCards).toHaveLength(6);
    for (const dc of doubleCards) {
      expect(dc.sideA).toBeDefined();
      expect(dc.sideB).toBeDefined();
      expect(dc.sideA.departmentNumber).not.toEqual(dc.sideB.departmentNumber);
    }
  });

  it('defaults to starting without department cards unless explicitly enabled', () => {
    const state = createInitialGameState({ playerCount: 4, humanCount: 1 });
    expect(state.enableDepartments).toBe(false);
    for (const p of state.players) {
      expect(p.departmentCard).toBeUndefined();
      expect(p.departmentCardPhysical).toBeUndefined();
    }
  });

  it('deals 1 unique double-sided department card to each player at game setup when enabled', () => {
    const state = createInitialGameState({ playerCount: 4, humanCount: 1, enableDepartments: true });
    expect(state.players).toHaveLength(4);

    const dealtCards = new Set<string>();
    for (const p of state.players) {
      expect(p.departmentCard).toBeDefined();
      expect(p.departmentCardPhysical).toBeDefined();
      expect(p.activeDepartmentSide).toBe('A');
      expect(p.departmentCard?.id).toBe(p.departmentCardPhysical?.sideA.id);
      dealtCards.add(p.departmentCardPhysical!.id);
      expect(p.departmentOccupant).toBeNull();
      expect(p.lastOccupiedDepartment).toBe(false);
    }
    // All 4 players have unique physical cards
    expect(dealtCards.size).toBe(4);
  });

  it('allows players to flip between Side A and Side B of their double-sided card', () => {
    let state = createInitialGameState({ playerCount: 4, humanCount: 1, enableDepartments: true });
    const p1 = state.players[0];
    const originalDept = p1.departmentCard!;
    expect(p1.activeDepartmentSide).toBe('A');

    // Flip to Side B
    state = flipPlayerDepartmentCard(state, p1.id);
    const p1Flipped = state.players[0];
    expect(p1Flipped.activeDepartmentSide).toBe('B');
    expect(p1Flipped.departmentCard?.id).toBe(p1.departmentCardPhysical?.sideB.id);
    expect(p1Flipped.departmentCard?.departmentNumber).toBe(p1.departmentCardPhysical?.sideB.departmentNumber);
    expect(p1Flipped.departmentCard?.id).not.toBe(originalDept.id);

    // Flip back to Side A
    state = flipPlayerDepartmentCard(state, p1.id);
    const p1Back = state.players[0];
    expect(p1Back.activeDepartmentSide).toBe('A');
    expect(p1Back.departmentCard?.id).toBe(originalDept.id);
  });

  it('applies passive storage buffer to getWarehouseCapacity', () => {
    const state = createInitialGameState({ playerCount: 2, humanCount: 1 });
    const p0 = state.players[0];

    // Default base warehouse capacity is 6
    p0.departmentCard = null;
    expect(getWarehouseCapacity(p0)).toBe(6);

    // Silo card has +1 Grain buffer
    const siloCard = BREWERY_DEPARTMENT_DEFINITIONS.find((d) => d.id === 'dept_grain_silo')!;
    p0.departmentCard = siloCard;
    expect(getWarehouseCapacity(p0)).toBe(7);

    // Hop Locker card has +1 Hops buffer
    const hopCard = BREWERY_DEPARTMENT_DEFINITIONS.find((d) => d.id === 'dept_hop_locker')!;
    p0.departmentCard = hopCard;
    expect(getWarehouseCapacity(p0)).toBe(7);
  });

  it('allows meeple placement on personal department in Phase 2 and enforces Mandatory Movement', () => {
    const state = createInitialGameState({ playerCount: 2, humanCount: 1 });
    expect(state.phase).toBe('PHASE_2_CATWALK_PLACEMENT');

    const p0 = state.players[0];
    const taproomCard = BREWERY_DEPARTMENT_DEFINITIONS.find((d) => d.id === 'dept_taproom')!;
    p0.departmentCard = taproomCard;

    // 1. Place on personal department
    const s1 = performDepartmentPlacement(state, p0.id);
    expect(s1.players[0].departmentOccupant?.playerId).toBe(p0.id);

    // 2. If player occupied department on previous shift, placement is blocked!
    const blockedState = {
      ...state,
      players: state.players.map((p, idx) =>
        idx === 0 ? { ...p, lastOccupiedDepartment: true, departmentOccupant: null } : p
      ),
    };
    const sBlocked = performDepartmentPlacement(blockedState, p0.id);
    // Blocked: occupant remains null
    expect(sBlocked.players[0].departmentOccupant).toBeNull();
  });

  it('resolves initiative in two tiers: Public Catwalks (1-7) first, Departments (#1-10) second', () => {
    const state = createInitialGameState({ playerCount: 4, humanCount: 1 });
    // Assign specific departments:
    // Player 0: Dept #5
    // Player 1: Dept #2
    // Player 2: Catwalk 6
    // Player 3: Catwalk 2
    state.players[0].departmentCard = BREWERY_DEPARTMENT_DEFINITIONS.find((d) => d.departmentNumber === 5)!;
    state.players[1].departmentCard = BREWERY_DEPARTMENT_DEFINITIONS.find((d) => d.departmentNumber === 2)!;

    // Turn 1: Player 0 places on Dept #5
    let s = performDepartmentPlacement(state, state.players[0].id);
    // Turn 2: Player 1 places on Dept #2
    s = performDepartmentPlacement(s, state.players[1].id);
    // Turn 3: Player 2 places on Catwalk 6
    s = performCatwalkPlacement(s, 6);
    // Turn 4: Player 3 places on Catwalk 2
    s = performCatwalkPlacement(s, 2);

    // All 4 players placed! Initiative established:
    // Tier 1: Catwalk 2 (Player 3), then Catwalk 6 (Player 2)
    // Tier 2: Dept #2 (Player 1), then Dept #5 (Player 0)
    expect(s.phase).toBe('PHASE_3_STATION_COMMITMENT');
    expect(s.rotaryBoard?.turnOrder).toEqual([
      state.players[3].id, // Catwalk 2
      state.players[2].id, // Catwalk 6
      state.players[1].id, // Dept #2
      state.players[0].id, // Dept #5
    ]);
    expect(s.players[s.currentPlayerIndex].id).toBe(state.players[3].id);
  });

  it('Department #1 (The Night Shift): advances brewery batches rightward and scores Zone 5', () => {
    let state = createInitialGameState({ playerCount: 2, humanCount: 1 });
    const p0 = state.players[0];
    p0.departmentCard = BREWERY_DEPARTMENT_DEFINITIONS.find((d) => d.id === 'dept_night_shift')!;
    p0.departmentOccupant = { playerId: p0.id, playerName: p0.name, playerColor: p0.color };

    // Stage a mock recipe in Zone 4 (Cold Room)
    const mockRecipe = {
      id: 'test_dark_matter',
      name: 'Dark Matter',
      deckType: 'recipe' as const,
      tier: 4 as const,
      vp: 5,
      costTokens: { grain: 2, hops: 1 },
      flavorText: 'Legendary stout',
    };
    p0.zones[4].recipes.push(mockRecipe);
    state.phase = 'PHASE_3_STATION_COMMITMENT';
    state.rotaryBoard!.turnOrder = [p0.id];
    state.currentPlayerIndex = 0;

    const afterAction = performDepartmentAction(state);
    const updatedP0 = afterAction.players[0];

    // Batch should have moved from Zone 4 -> Zone 5
    expect(updatedP0.zones[4].recipes).toHaveLength(0);
    // In Night Shift, 4 moves to 5
    expect(updatedP0.zones[5].recipes.length + (updatedP0.completedBatches?.length || 0)).toBeGreaterThan(0);
  });

  it('Department #2 (The Taproom): Direct-to-Consumer pours from Zone 4 directly to Trophy Rack skipping Zone 5', () => {
    let state = createInitialGameState({ playerCount: 2, humanCount: 1 });
    const p0 = state.players[0];
    p0.departmentCard = BREWERY_DEPARTMENT_DEFINITIONS.find((d) => d.id === 'dept_taproom')!;
    p0.departmentOccupant = { playerId: p0.id, playerName: p0.name, playerColor: p0.color };

    const mockRecipe = {
      id: 'test_pilsner',
      name: 'Hoyne Pilsner',
      deckType: 'recipe' as const,
      tier: 3 as const,
      vp: 4,
      costTokens: { grain: 2 },
      flavorText: 'Crisp draft pour',
    };
    p0.zones[4].recipes.push(mockRecipe);
    p0.score = 0;
    p0.completedBatches = [];
    state.phase = 'PHASE_3_STATION_COMMITMENT';
    state.rotaryBoard!.turnOrder = [p0.id];
    state.currentPlayerIndex = 0;

    const afterAction = performDepartmentAction(state);
    const updatedP0 = afterAction.players[0];

    // Beer left Zone 4 directly
    expect(updatedP0.zones[4].recipes).toHaveLength(0);
    // Never entered Zone 5
    expect(updatedP0.zones[5].recipes).toHaveLength(0);
    // Landed directly in Trophy Rack (completedBatches) and scored +4 VP!
    expect(updatedP0.completedBatches).toHaveLength(1);
    expect(updatedP0.completedBatches![0].name).toBe('Hoyne Pilsner');
    expect(updatedP0.score).toBe(4);
  });

  it('Department #6 (The Grain Silo): grants 2 Grain tokens from hoppers', () => {
    let state = createInitialGameState({ playerCount: 2, humanCount: 1 });
    const p0 = state.players[0];
    p0.departmentCard = BREWERY_DEPARTMENT_DEFINITIONS.find((d) => d.id === 'dept_grain_silo')!;
    p0.departmentOccupant = { playerId: p0.id, playerName: p0.name, playerColor: p0.color };
    p0.tokens.grain = 1;
    state.centralHoppers.grain = 20;
    state.phase = 'PHASE_3_STATION_COMMITMENT';
    state.rotaryBoard!.turnOrder = [p0.id];
    state.currentPlayerIndex = 0;

    const afterAction = performDepartmentAction(state);
    const updatedP0 = afterAction.players[0];

    expect(updatedP0.tokens.grain).toBe(3); // 1 + 2
    expect(afterAction.centralHoppers.grain).toBe(18); // 20 - 2
  });

  it('Department #9 (Spent Grain Farm Swap): returns 1 token and takes 2 tokens (net +1)', () => {
    let state = createInitialGameState({ playerCount: 2, humanCount: 1 });
    const p0 = state.players[0];
    p0.departmentCard = BREWERY_DEPARTMENT_DEFINITIONS.find((d) => d.id === 'dept_farm_swap')!;
    p0.departmentOccupant = { playerId: p0.id, playerName: p0.name, playerColor: p0.color };
    p0.tokens.grain = 2;
    p0.tokens.yeast = 0;
    p0.tokens.hops = 0;
    state.centralHoppers.yeast = 10;
    state.centralHoppers.hops = 10;
    state.phase = 'PHASE_3_STATION_COMMITMENT';
    state.rotaryBoard!.turnOrder = [p0.id];
    state.currentPlayerIndex = 0;

    const afterAction = performDepartmentAction(state, {
      discardToken: 'grain',
      chosenToken: 'yeast',
      secondToken: 'hops',
    });
    const updatedP0 = afterAction.players[0];

    // Discarded 1 grain (2 - 1 = 1)
    expect(updatedP0.tokens.grain).toBe(1);
    // Gained 1 yeast and 1 hops
    expect(updatedP0.tokens.yeast).toBe(1);
    expect(updatedP0.tokens.hops).toBe(1);
  });

  it('supports playing without personal brewery departments when enableDepartments is false', () => {
    const state = createInitialGameState({ playerCount: 4, humanCount: 1, enableDepartments: false });
    expect(state.enableDepartments).toBe(false);
    expect(state.players).toHaveLength(4);

    for (const player of state.players) {
      expect(player.departmentCard).toBeUndefined();
      expect(player.departmentOccupant).toBeNull();
      expect(player.lastOccupiedDepartment).toBe(false);
    }

    // Catwalk placement works normally in base mode
    expect(state.phase).toBe('PHASE_2_CATWALK_PLACEMENT');
    const s1 = performCatwalkPlacement(state, 1, state.players[0].id);
    expect(s1.rotaryBoard?.slots[1]?.catwalkOccupant?.playerId).toBe(state.players[0].id);
  });

  it('supports dynamically toggling departments on and off via toggleDepartmentsModule', () => {
    let state = createInitialGameState({ playerCount: 4, humanCount: 1, enableDepartments: true });
    expect(state.players.every((p) => p.departmentCard !== undefined)).toBe(true);

    // Toggle off
    state = toggleDepartmentsModule(state, false);
    expect(state.enableDepartments).toBe(false);
    expect(state.players.every((p) => p.departmentCard === undefined)).toBe(true);

    // Toggle back on
    state = toggleDepartmentsModule(state, true);
    expect(state.enableDepartments).toBe(true);
    expect(state.players.every((p) => p.departmentCard !== undefined)).toBe(true);
  });
});
