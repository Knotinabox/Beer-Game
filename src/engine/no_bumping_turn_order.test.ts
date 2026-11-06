import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  performCatwalkPlacement,
  performStationCommitment,
  performCenterPantryAction,
} from './gameEngine';

describe('No Player Bumping and Sequential Turn Order Verification', () => {
  it('strictly blocks placing on already occupied catwalk stations without bumping', () => {
    let state = createInitialGameState({ playerCount: 3 });
    const [p0, p1, p2] = state.players;

    // Phase 2: p0 chooses Catwalk 1
    state = performCatwalkPlacement(state, 1);
    expect(state.rotaryBoard!.slots[1].catwalkOccupant?.playerId).toBe(p0.id);
    expect(state.currentPlayerIndex).toBe(1); // Advances clockwise to p1

    // p1 tries to select Catwalk 1 (occupied by p0) -> MUST BE BLOCKED
    const blockedState = performCatwalkPlacement(state, 1);
    expect(blockedState).toBe(state); // Unchanged
    expect(blockedState.rotaryBoard!.slots[1].catwalkOccupant?.playerId).toBe(p0.id);
    expect(blockedState.rotaryBoard!.centerRingHotSeat).toBeNull(); // No hot seat / eviction

    // p1 instead selects open Catwalk 6
    state = performCatwalkPlacement(state, 6);
    expect(state.rotaryBoard!.slots[6].catwalkOccupant?.playerId).toBe(p1.id);
    expect(state.currentPlayerIndex).toBe(2); // Advances clockwise to p2

    // p2 tries to select Catwalk 6 (occupied by p1) -> BLOCKED
    const blockedState2 = performCatwalkPlacement(state, 6);
    expect(blockedState2).toBe(state);

    // p2 selects Catwalk 3
    state = performCatwalkPlacement(state, 3);
    expect(state.rotaryBoard!.slots[3].catwalkOccupant?.playerId).toBe(p2.id);

    // All players have placed! Initiative order is resolved sequentially Catwalks 1 -> 7:
    // Catwalk 1: p0
    // Catwalk 3: p2
    // Catwalk 6: p1
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');
    expect(state.rotaryBoard!.turnOrder).toEqual([p0.id, p2.id, p1.id]);
    expect(state.players[state.currentPlayerIndex].id).toBe(p0.id); // Catwalk 1 acts first!

    // p0 commits to inward hopper 1
    state = performStationCommitment(state, 1, 'inward');
    expect(state.rotaryBoard!.slots[1].inwardOccupant?.playerId).toBe(p0.id);

    // Next in turn order is p2 at Catwalk 3
    expect(state.players[state.currentPlayerIndex].id).toBe(p2.id);
    state = performStationCommitment(state, 3, 'inward');
    expect(state.rotaryBoard!.slots[3].inwardOccupant?.playerId).toBe(p2.id);

    // Next in turn order is p1 at Catwalk 6
    expect(state.players[state.currentPlayerIndex].id).toBe(p1.id);
    state = performStationCommitment(state, 6, 'inward');
    expect(state.rotaryBoard!.slots[6].inwardOccupant?.playerId).toBe(p1.id);
  });

  it('Station #7 middle catwalk porthole is exclusive and resolves last in initiative order', () => {
    let state = createInitialGameState({ playerCount: 2 });
    const [p0, p1] = state.players;

    // p0 takes Catwalk 7 (center porthole)
    state = performCatwalkPlacement(state, 7);
    expect(state.rotaryBoard!.slots[7].catwalkOccupant?.playerId).toBe(p0.id);
    expect(state.currentPlayerIndex).toBe(1);

    // p1 cannot bump p0 from Catwalk 7
    const blocked = performCatwalkPlacement(state, 7);
    expect(blocked).toBe(state);

    // p1 takes Catwalk 2
    state = performCatwalkPlacement(state, 2);
    expect(state.rotaryBoard!.slots[2].catwalkOccupant?.playerId).toBe(p1.id);

    // Phase 3 begins: initiative order is Catwalk 2 (p1) -> Catwalk 7 (p0)
    expect(state.phase).toBe('PHASE_3_STATION_COMMITMENT');
    expect(state.rotaryBoard!.turnOrder).toEqual([p1.id, p0.id]);
    expect(state.players[state.currentPlayerIndex].id).toBe(p1.id); // p1 at Station 2 acts first!

    // p1 commits
    state = performStationCommitment(state, 2, 'inward');

    // p0 acts second at Station 7
    expect(state.players[state.currentPlayerIndex].id).toBe(p0.id);
    state = performCenterPantryAction(state, 'yeast');
    expect(state.rotaryBoard!.pantryOccupants?.yeast?.playerId).toBe(p0.id);
  });
});
