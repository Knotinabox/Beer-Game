import {
  createAssemblyLineCards,
  createIngredientDeck,
  createRecipeDeck,
  createTierRecipeDeck,
  createUpgradeDeck,
  createEquipmentDeck,
  createStaffDeck,
  createBreweryDeck,
  createTaproomDeck,
  createMixerPackDeck,
  createDepartmentDeck,
  createInitialIngredientStations,
  INGREDIENT_STATION_METADATA,
  ROTARY_SLOT_DEFS,
  matchRecipeToMixerRequirement,
} from './cards';
import {
  ConveyorSlot,
  GameState,
  IngredientCard,
  IngredientCategory,
  IngredientSubtype,
  IngredientTaxonomy,
  IngredientStationId,
  IngredientStationState,
  LogEntry,
  MarketFlushEvent,
  MorningShiftEvent,
  MixerPackCard,
  PlayerState,
  RecipeCard,
  RecipeTier,
  SourcePickChoice,
  TaproomCard,
  TurnPhase,
  ShiftPhase,
  UpgradeCard,
  UpgradeEffectKey,
  ZoneId,
  ZoneState,
  RotarySlotNumber,
  RotaryCatwalkAction,
  RotaryOccupant,
  RotarySlotState,
  RotaryBoardState,
  BreweryDepartmentCard,
  BreweryDepartmentId,
  BreweryDepartmentActionType,
} from './types';

const PLAYER_COLORS = [
  '#F59E0B', // Amber Gold
  '#38BDF8', // Sky Blue
  '#4ADE80', // Hop Green
  '#F472B6', // Raspberry Pink
  '#A78BFA', // Solstice Purple
  '#FB923C', // Copper Orange
];

const AI_NAMES = [
  'Sean (Master Brewer)',
  'Nicola (Cellar Boss)',
  'mike (Hop Whisperer)',
  'chloe (Tasting Room Lead)',
  'Dave (Malt Master)',
  'Liam (Packaging Pro)',
];

const AI_PERSONAS = [
  'Balanced Artisan',
  'Core Crusher Speedrunner',
  'Showstopper Hunter',
  'Upgrade Mogul',
  'Hop Head',
  'Dark Malt Specialist',
];

/**
 * Deterministic-capable PRNG (Mulberry32) when seed is supplied, or Math.random otherwise.
 */
function createRng(seed?: number): () => number {
  if (seed === undefined) {
    return () => Math.random();
  }
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleArray<T>(items: T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Dynamic Endgame Batch Trigger by Player Count:
 * - 6 players -> 5 completed batches
 * - 5 players -> 6 completed batches
 * - 4 players -> 7 completed batches
 * - 3 players -> 8 completed batches
 * - 2 players -> 8 completed batches
 * - 1 player (Solo) -> 8 completed batches
 */
export function getTargetBatchesForPlayerCount(playerCount: number): number {
  switch (playerCount) {
    case 6:
      return 5;
    case 5:
      return 6;
    case 4:
      return 7;
    case 3:
    case 2:
    case 1:
    default:
      return 8;
  }
}

export function getPlayerUpgrades(player: PlayerState): UpgradeCard[] {
  const all: UpgradeCard[] = [];
  for (const z of [1, 2, 3, 4, 5] as ZoneId[]) {
    if (player.zones[z]) {
      all.push(...player.zones[z].equipment, ...player.zones[z].staff);
    }
  }
  if (player.leftWing) {
    all.push(...player.leftWing);
  }
  if (player.rightWing) {
    all.push(...player.rightWing);
  }
  return all;
}

export function countUpgradeEffect(
  player: PlayerState,
  effectKey: UpgradeEffectKey
): number {
  return getPlayerUpgrades(player).filter((u) => {
    const key =
      u.installedOption?.effectKey ??
      u.effectKey ??
      (u.installedAs === 'staff' ? u.staff?.effectKey : u.equipment?.effectKey) ??
      u.equipment?.effectKey ??
      u.staff?.effectKey;
    return key === effectKey;
  }).length;
}

export function getPlayerHandLimit(player: PlayerState): number {
  return (
    6 +
    countUpgradeEffect(player, 'hand_limit_plus_3') * 3 +
    countUpgradeEffect(player, 'hand_limit_plus_2') * 3 +
    countUpgradeEffect(player, 'wing_grist_exchange') * 3 +
    countUpgradeEffect(player, 'shift_supervisor') * 1
  );
}

export function getPlayerCarboyCapacity(player: PlayerState): number {
  return 1 + countUpgradeEffect(player, 'carboy_capacity_plus_1');
}

export function getPlayerKettleCapacity(player: PlayerState): number {
  return 1 + countUpgradeEffect(player, 'kettle_double_batch');
}

export function getPlayerFreeSkips(player: PlayerState): number {
  return (
    countUpgradeEffect(player, 'free_skip_conveyor') +
    countUpgradeEffect(player, 'free_skips_plus_2') * 2 +
    countUpgradeEffect(player, 'wing_sourcing_master') * 2
  );
}

export function getPlayerSourceDrawCount(player: PlayerState): number {
  return (
    2 +
    countUpgradeEffect(player, 'extra_source_draw') +
    countUpgradeEffect(player, 'wing_sourcing_master')
  );
}

function drawFromIngredientDeck(
  deck: IngredientCard[],
  discard: IngredientCard[]
): { card: IngredientCard | undefined; deck: IngredientCard[]; discard: IngredientCard[] } {
  let nextDeck = [...deck];
  let nextDiscard = [...discard];

  if (nextDeck.length === 0 && nextDiscard.length > 0) {
    nextDeck = shuffleArray(nextDiscard);
    nextDiscard = [];
  }

  const card = nextDeck.shift();
  return { card, deck: nextDeck, discard: nextDiscard };
}

function drawFromTaproomDeck(
  deck: TaproomCard[],
  discard: TaproomCard[],
  rng: () => number = Math.random
): { card: TaproomCard | undefined; deck: TaproomCard[]; discard: TaproomCard[] } {
  let nextDeck = [...deck];
  let nextDiscard = [...discard];

  if (nextDeck.length === 0 && nextDiscard.length > 0) {
    nextDeck = shuffleArray(nextDiscard, rng);
    nextDiscard = [];
  }

  const card = nextDeck.shift();
  return { card, deck: nextDeck, discard: nextDiscard };
}

export function drawFromRecipeDeck(
  deck: RecipeCard[],
  discard: RecipeCard[],
  rng: () => number = Math.random
): { card: RecipeCard | undefined; deck: RecipeCard[]; discard: RecipeCard[] } {
  let nextDeck = [...deck];
  let nextDiscard = [...discard];

  if (nextDeck.length === 0 && nextDiscard.length > 0) {
    nextDeck = shuffleArray(nextDiscard, rng);
    nextDiscard = [];
  }

  const card = nextDeck.shift();
  return { card, deck: nextDeck, discard: nextDiscard };
}

export function drawFromUpgradeDeck(
  deck: UpgradeCard[],
  discard: UpgradeCard[],
  rng: () => number = Math.random
): { card: UpgradeCard | undefined; deck: UpgradeCard[]; discard: UpgradeCard[] } {
  let nextDeck = [...deck];
  let nextDiscard = [...discard];

  if (nextDeck.length === 0 && nextDiscard.length > 0) {
    nextDeck = shuffleArray(nextDiscard, rng);
    nextDiscard = [];
  }

  const card = nextDeck.shift();
  return { card, deck: nextDeck, discard: nextDiscard };
}

export function drawFromEquipmentDeck(
  deck: UpgradeCard[],
  discard: UpgradeCard[],
  rng: () => number = Math.random
): { card: UpgradeCard | undefined; deck: UpgradeCard[]; discard: UpgradeCard[] } {
  return drawFromUpgradeDeck(deck, discard, rng);
}

export function drawFromStaffDeck(
  deck: UpgradeCard[],
  discard: UpgradeCard[],
  rng: () => number = Math.random
): { card: UpgradeCard | undefined; deck: UpgradeCard[]; discard: UpgradeCard[] } {
  return drawFromUpgradeDeck(deck, discard, rng);
}

export function drawFromTierRecipeDeck(
  tier: RecipeTier,
  deck: RecipeCard[] = [],
  discard: RecipeCard[] = [],
  rng: () => number = Math.random
): { card: RecipeCard | undefined; deck: RecipeCard[]; discard: RecipeCard[] } {
  let nextDeck = [...deck];
  let nextDiscard = [...discard];

  if (nextDeck.length === 0 && nextDiscard.length > 0) {
    nextDeck = shuffleArray(nextDiscard, rng);
    nextDiscard = [];
  }
  if (nextDeck.length === 0) {
    nextDeck = shuffleArray(createTierRecipeDeck(tier), rng);
  }

  const card = nextDeck.shift();
  return { card, deck: nextDeck, discard: nextDiscard };
}

/**
 * Automated Market Flush State Machine Rule for the 6-card Taproom Offer market:
 * Whenever a card is drafted and a new card is flipped into Row 2, check the 6 face-up Taproom cards.
 * If the 6 face-up cards contain ZERO Recipe cards OR ZERO Upgrade cards:
 *   1. Trigger a "Market Flush" event.
 *   2. Discard all 6 face-up cards to the Taproom discard pile.
 *   3. Deal 6 fresh cards from the Taproom Deck to fill Row 2.
 */
export function checkAndExecuteTaproomFlush(
  market: TaproomCard[],
  deck: TaproomCard[],
  discard: TaproomCard[],
  turn: number,
  rng: () => number = Math.random
): {
  taproomMarket: TaproomCard[];
  taproomDeck: TaproomCard[];
  taproomDiscard: TaproomCard[];
  flushEvent: MarketFlushEvent | null;
} {
  let currentMarket = [...market];
  let currentDeck = [...deck];
  let currentDiscard = [...discard];
  let flushEvent: MarketFlushEvent | null = null;

  // Guard loop (max 3 attempts in case a fresh 6-card deal is also monochrome)
  let safetyAttempts = 0;
  while (currentMarket.length > 0 && safetyAttempts < 3) {
    const recipeCount = currentMarket.filter((c) => c.deckType === 'recipe').length;
    const upgradeCount = currentMarket.filter((c) => c.deckType === 'upgrade').length;

    if (recipeCount > 0 && upgradeCount > 0) {
      break;
    }

    // Ensure there are actually cards of the missing type left in deck + discard before flushing
    const poolHasRecipes =
      currentDeck.some((c) => c.deckType === 'recipe') ||
      currentDiscard.some((c) => c.deckType === 'recipe');
    const poolHasUpgrades =
      currentDeck.some((c) => c.deckType === 'upgrade') ||
      currentDiscard.some((c) => c.deckType === 'upgrade');

    if ((recipeCount === 0 && !poolHasRecipes) || (upgradeCount === 0 && !poolHasUpgrades)) {
      break;
    }

    safetyAttempts++;
    const reason: 'NO_RECIPES' | 'NO_UPGRADES' =
      recipeCount === 0 ? 'NO_RECIPES' : 'NO_UPGRADES';
    const flushedCardNames = currentMarket.map((c) => c.name);

    // 1. Discard all face-up cards to the Taproom discard pile
    currentDiscard.push(...currentMarket);
    currentMarket = [];

    // 2. Deal 6 fresh cards from the Taproom Deck to fill Row 2
    for (let i = 0; i < 6; i++) {
      const drawn = drawFromTaproomDeck(currentDeck, currentDiscard, rng);
      currentDeck = drawn.deck;
      currentDiscard = drawn.discard;
      if (drawn.card) {
        currentMarket.push(drawn.card);
      }
    }

    flushEvent = {
      id: `flush_${turn}_${safetyAttempts}_${Date.now()}`,
      turn,
      reason,
      flushedCardNames,
      timestamp: Date.now(),
    };
  }

  return {
    taproomMarket: currentMarket,
    taproomDeck: currentDeck,
    taproomDiscard: currentDiscard,
    flushEvent,
  };
}

function deriveFilteredTaproomArrays(
  taproomDeck: TaproomCard[],
  taproomMarket: TaproomCard[]
): {
  recipeDeck: RecipeCard[];
  pubMarket: RecipeCard[];
  upgradeDeck: UpgradeCard[];
  shopMarket: UpgradeCard[];
} {
  return {
    recipeDeck: taproomDeck.filter((c): c is RecipeCard => c.deckType === 'recipe'),
    pubMarket: taproomMarket.filter((c): c is RecipeCard => c.deckType === 'recipe'),
    upgradeDeck: taproomDeck.filter((c): c is UpgradeCard => c.deckType === 'upgrade'),
    shopMarket: taproomMarket.filter((c): c is UpgradeCard => c.deckType === 'upgrade'),
  };
}

let logSequenceCounter = 0;

function addLog(
  logs: LogEntry[],
  turn: number,
  player: PlayerState,
  phase: TurnPhase,
  message: string
): LogEntry[] {
  logSequenceCounter += 1;
  const entry: LogEntry = {
    id: `log_${turn}_${logSequenceCounter}_${Date.now()}`,
    turn,
    playerId: player.id,
    playerName: player.name,
    phase,
    message,
    timestamp: Date.now(),
  };
  return [entry, ...logs].slice(0, 120);
}


export const TOTAL_TOKEN_POOL: Record<IngredientTaxonomy, number> = {
  grain: 28,
  hops: 24,
  yeast: 20,
  fruit: 12,
  spices: 12,
  chocolate: 12,
};

export function hasUpgradeInstalled(player: PlayerState, upgradeNameOrKey: string): boolean {
  const norm = upgradeNameOrKey.toLowerCase();
  for (let z = 1; z <= 5; z++) {
    const zone = player.zones[z as ZoneId];
    if (!zone) continue;
    for (const u of zone.equipment || []) {
      if (
        u.name?.toLowerCase().includes(norm) ||
        u.equipment?.name?.toLowerCase().includes(norm) ||
        (u.effectKey && u.effectKey.toLowerCase().includes(norm)) ||
        (u.equipment?.effectKey && u.equipment.effectKey.toLowerCase().includes(norm)) ||
        (u.installedOption?.effectKey && u.installedOption.effectKey.toLowerCase().includes(norm))
      ) {
        return true;
      }
    }
    for (const u of zone.staff || []) {
      if (
        u.name?.toLowerCase().includes(norm) ||
        u.staff?.name?.toLowerCase().includes(norm) ||
        (u.effectKey && u.effectKey.toLowerCase().includes(norm)) ||
        (u.staff?.effectKey && u.staff.effectKey.toLowerCase().includes(norm)) ||
        (u.installedOption?.effectKey && u.installedOption.effectKey.toLowerCase().includes(norm))
      ) {
        return true;
      }
    }
  }
  return false;
}

export function getWarehouseCapacity(player: PlayerState): number {
  let cap = 6;
  const processed = new Set<string>();

  const processUpgrade = (u: any) => {
    if (!u) return;
    const key = u.id || u.name;
    if (processed.has(key)) return;
    processed.add(key);

    if (typeof u.storageSlots === 'number' && u.storageSlots > 0) {
      cap += u.storageSlots;
    } else if (
      u.effectKey === 'warehouse_capacity_plus_3_general' ||
      u.effectKey === 'warehouse_capacity_total_9' ||
      u.name === 'Inventory Vault'
    ) {
      cap += 3;
    } else if (
      u.effectKey === 'warehouse_capacity_plus_2_grain' ||
      u.effectKey === 'warehouse_capacity_plus_2_hops' ||
      u.effectKey === 'warehouse_capacity_plus_2_yeast' ||
      u.effectKey === 'warehouse_capacity_plus_2_fruit' ||
      u.effectKey === 'warehouse_capacity_plus_2_spices' ||
      u.effectKey === 'warehouse_capacity_plus_2_chocolate' ||
      u.effectKey === 'warehouse_capacity_plus_2_adjunct' ||
      u.effectKey === 'warehouse_capacity_plus_2_any' ||
      u.effectKey === 'cold_vault_capacity_plus_2_any' ||
      u.name === 'High-Capacity Hopper' ||
      u.name === 'Cryo-Hop Storage' ||
      u.name === 'Roasted Malt Bin' ||
      u.name === 'Bulk Pallet Racks' ||
      u.name === 'Adjunct Spice Rack' ||
      u.name === 'Cold Distribution Vault' ||
      u.name === 'Refrigerated Vault' ||
      u.name === 'Warehouse Foreman' ||
      u.name === 'Yeast Lab Tech' ||
      u.name === 'Orchard Expediter' ||
      u.name === 'Spice Curator'
    ) {
      cap += 2;
    }
  };

  // Inspect installed equipment & staff across all 5 zones
  if (player.zones) {
    for (const zId of [1, 2, 3, 4, 5] as const) {
      const z = player.zones[zId];
      if (z) {
        z.equipment?.forEach(processUpgrade);
        z.staff?.forEach(processUpgrade);
      }
    }
  }

  // Inspect optional legacy list if present
  if ((player as any).installedUpgrades) {
    (player as any).installedUpgrades.forEach(processUpgrade);
  }

  // Inspect active Brewery Department passive storage buffer
  if (player.departmentCard?.passiveEffect?.extraCapacityAmount) {
    cap += player.departmentCard.passiveEffect.extraCapacityAmount;
  }

  return cap;
}

export interface PlayerStorageAllocation {
  /** Tokens assigned to the fixed 6 warehouse slots on the player mat */
  warehouseTokens: IngredientTaxonomy[];
  /** Map of storage card key (id or name) to array of tokens stored on that card */
  cardTokens: Record<string, IngredientTaxonomy[]>;
  /** Any excess tokens beyond total player capacity */
  excessTokens: IngredientTaxonomy[];
  /** Total tokens currently held */
  totalStoredTokens: number;
  /** Total capacity */
  totalCapacity: number;
}

export function allocatePlayerStorage(player: PlayerState): PlayerStorageAllocation {
  const cardTokens: Record<string, IngredientTaxonomy[]> = {};
  const dedicatedCards: Array<{ key: string; allowedToken: IngredientTaxonomy; capacity: number }> = [];
  const genericCards: Array<{ key: string; capacity: number }> = [];

  const checkUpgrade = (u: any) => {
    if (!u) return;
    const key = u.id || u.name;
    const slots = typeof u.storageSlots === 'number' && u.storageSlots > 0 ? u.storageSlots : (
      u.effectKey?.includes('capacity_plus_2') || u.name?.includes('Storage') || u.name?.includes('Vault') || u.name?.includes('Hopper') || u.name?.includes('Rack') ? 2 : 0
    );
    if (slots <= 0) return;
    if (cardTokens[key]) return; // avoid duplicates
    const list: IngredientTaxonomy[] = [];
    cardTokens[key] = list;
    if (u.id) cardTokens[u.id] = list;
    if (u.name) cardTokens[u.name] = list;

    const allowed = u.storageAllowedToken;
    if (allowed && allowed !== 'any') {
      dedicatedCards.push({ key, allowedToken: allowed as IngredientTaxonomy, capacity: slots });
    } else {
      genericCards.push({ key, capacity: slots });
    }
  };

  if (player.zones) {
    for (const zId of [1, 2, 3, 4, 5] as const) {
      const z = player.zones[zId];
      if (z) {
        z.equipment?.forEach(checkUpgrade);
        z.staff?.forEach(checkUpgrade);
      }
    }
  }
  player.leftWing?.forEach(checkUpgrade);
  player.rightWing?.forEach(checkUpgrade);

  const TAX_ORDER: IngredientTaxonomy[] = ['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'];
  const availableTokens: IngredientTaxonomy[] = [];
  const playerTokens = player.tokens || ({} as Record<IngredientTaxonomy, number>);
  for (const tax of TAX_ORDER) {
    const count = playerTokens[tax] || 0;
    for (let i = 0; i < count; i++) {
      availableTokens.push(tax);
    }
  }
  const totalStoredTokens = availableTokens.length;

  // 1. Dedicated cards first
  for (const card of dedicatedCards) {
    let placed = 0;
    for (let i = availableTokens.length - 1; i >= 0 && placed < card.capacity; i--) {
      if (availableTokens[i] === card.allowedToken) {
        cardTokens[card.key].push(availableTokens.splice(i, 1)[0]);
        placed++;
      }
    }
  }

  // 2. Base warehouse (fixed 6 slots)
  const BASE_WAREHOUSE_CAP = 6;
  const warehouseTokens = availableTokens.splice(0, BASE_WAREHOUSE_CAP);

  // 3. Generic cards
  for (const card of genericCards) {
    let placed = 0;
    while (availableTokens.length > 0 && placed < card.capacity) {
      cardTokens[card.key].push(availableTokens.shift());
      placed++;
    }
  }

  const excessTokens = availableTokens;
  const totalCapacity = getWarehouseCapacity(player);

  return {
    warehouseTokens,
    cardTokens,
    excessTokens,
    totalStoredTokens,
    totalCapacity,
  };
}

export function updatePlayerMat(player: PlayerState): void {
  const tokenCount = Object.values(player.tokens || {}).reduce((sum, v) => sum + (v || 0), 0);
  player.mat = {
    columns: {
      1: { batches: player.zones[1]?.recipes || [] }, // Column 1: Warehouse & Token Detents
      2: { batches: player.zones[2]?.recipes || [] }, // Column 2: Brewhouse
      3: { batches: player.zones[3]?.recipes || [] }, // Column 3: Fermentation Cellar
      4: { batches: player.zones[4]?.recipes || [] }, // Column 4: Conditioning & Lagering
      5: { batches: player.zones[5]?.recipes || [] }, // Column 5: Packaging & Loading Dock
    },
    warehouse_token_count: tokenCount,
  };
  player.hand_cards = player.hand;
  player.actions_taken_this_shift = player.actionsTakenThisShift ?? 0;
  (player as any).has_upgrade = (name: string) => hasUpgradeInstalled(player, name);
}

export function verifyAuthoritativeInvariants(state: GameState): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const player of state.players) {
    updatePlayerMat(player);

    // 1. Zero Hand Invariant
    const handCards = player.hand_cards || player.hand || [];
    if (handCards.length !== 0) {
      errors.push(`Error: Cards cannot be held in player hand. Player ${player.id} has ${handCards.length} cards.`);
    }

    // 2. Strict Pipeline Capacity Invariant
    const warehouseBatches = player.mat?.columns[1]?.batches || player.zones[1]?.recipes || [];
    if (warehouseBatches.length > 1) {
      errors.push(`Error: Warehouse staging exceeds 1 BBL cap. Count: ${warehouseBatches.length}`);
    }

    const brewhouseBatches = player.mat?.columns[2]?.batches || player.zones[2]?.recipes || [];
    if (brewhouseBatches.length > 1) {
      errors.push(`Error: Brewhouse exceeds 1 BBL cap. Count: ${brewhouseBatches.length}`);
    }

    const hasGlycol = hasUpgradeInstalled(player, 'Glycol Jacket') || hasUpgradeInstalled(player, 'Glycol Chilling Jacket');
    const cellarCap = hasGlycol ? 2 : 1;
    const cellarBatches = player.mat?.columns[3]?.batches || player.zones[3]?.recipes || [];
    if (cellarBatches.length > cellarCap) {
      errors.push(`Error: Cellar cap exceeded. Count: ${cellarBatches.length}, cap: ${cellarCap}`);
    }

    const conditioningBatches = player.mat?.columns[4]?.batches || player.zones[4]?.recipes || [];
    if (conditioningBatches.length > 1) {
      errors.push(`Error: Conditioning cap exceeded. Count: ${conditioningBatches.length}`);
    }

    const packagingBatches = player.mat?.columns[5]?.batches || player.zones[5]?.recipes || [];
    if (packagingBatches.length > 1) {
      errors.push(`Error: Packaging dock cap exceeded. Count: ${packagingBatches.length}`);
    }

    // 3. Warehouse Ceiling Invariant
    const warehouseTokenCount = player.mat?.warehouse_token_count ??
      Object.values(player.tokens || {}).reduce((sum, v) => sum + (v || 0), 0);
    if (warehouseTokenCount > 9) {
      errors.push(`Error: Warehouse storage exceeded 9-token maximum. Count: ${warehouseTokenCount}`);
    }
  }

  // 4. Standby Priority Invariant
  if (state.rotaryBoard) {
    for (let slotNum = 1; slotNum <= 6; slotNum++) {
      const slot = state.rotaryBoard.slots[slotNum as RotarySlotNumber];
      const occupantsCount = slot.standbyOccupant ? 1 : 0;
      if (occupantsCount > 1) {
        errors.push(`Error: Multiple meeples detected in Standby Bay ${slotNum}.`);
      }
    }
  }

  // 5. Shift Action Economy Invariant
  if (state.phase === 'PHASE_2_CONVEYOR_OPERATIONS') {
    for (const player of state.players) {
      const actionsCount = player.actions_taken_this_shift ?? player.actionsTakenThisShift ?? 0;
      if (actionsCount !== 1) {
        errors.push(`Error: Player ${player.id} took invalid action count: ${actionsCount}. Expected 1.`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return { valid: true, errors: [] };
}

export function verifyClosedLoopTokenConservation(state: GameState): boolean {
  const taxes: IngredientTaxonomy[] = ['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'];
  for (const tax of taxes) {
    let total = (state.centralHoppers?.[tax] || 0) + (state.kettlePool?.[tax] || 0);
    for (const p of state.players) {
      total += p.tokens?.[tax] || 0;
    }
    if (total !== TOTAL_TOKEN_POOL[tax]) {
      throw new Error(`Token leak/creation detected for ${tax}: current total ${total}, expected ${TOTAL_TOKEN_POOL[tax]}`);
    }
  }
  return true;
}

export function createInitialRotaryBoard(
  breweryMarket: (RecipeCard | UpgradeCard)[],
  players: PlayerState[]
): RotaryBoardState {
  const slots: Record<RotarySlotNumber, RotarySlotState> = {
    1: {
      slotNumber: 1,
      ingredient: 'chocolate',
      ingredientName: 'Chocolate',
      tokenYield: 1,
      outerCard: breweryMarket[0] || null,
      catwalkOccupant: null,
      inwardOccupant: null,
      standbyOccupant: null,
      outwardOccupant: null,
    },
    2: {
      slotNumber: 2,
      ingredient: 'spices',
      ingredientName: 'Spices',
      tokenYield: 1,
      outerCard: breweryMarket[1] || null,
      catwalkOccupant: null,
      inwardOccupant: null,
      standbyOccupant: null,
      outwardOccupant: null,
    },
    3: {
      slotNumber: 3,
      ingredient: 'fruit',
      ingredientName: 'Fruit',
      tokenYield: 1,
      outerCard: breweryMarket[2] || null,
      catwalkOccupant: null,
      inwardOccupant: null,
      standbyOccupant: null,
      outwardOccupant: null,
    },
    4: {
      slotNumber: 4,
      ingredient: 'yeast',
      ingredientName: 'Yeast',
      tokenYield: 2,
      outerCard: breweryMarket[3] || null,
      catwalkOccupant: null,
      inwardOccupant: null,
      standbyOccupant: null,
      outwardOccupant: null,
    },
    5: {
      slotNumber: 5,
      ingredient: 'hops',
      ingredientName: 'Hops',
      tokenYield: 2,
      outerCard: breweryMarket[4] || null,
      catwalkOccupant: null,
      inwardOccupant: null,
      standbyOccupant: null,
      outwardOccupant: null,
    },
    6: {
      slotNumber: 6,
      ingredient: 'grain',
      ingredientName: 'Grain',
      tokenYield: 2,
      outerCard: breweryMarket[5] || null,
      catwalkOccupant: null,
      inwardOccupant: null,
      standbyOccupant: null,
      outwardOccupant: null,
    },
    7: {
      slotNumber: 7,
      ingredient: 'grain',
      ingredientName: 'Brewhouse Pantry',
      tokenYield: 1,
      outerCard: null,
      catwalkOccupant: null,
      inwardOccupant: null,
      standbyOccupant: null,
      outwardOccupant: null,
    },
  };

  // The Rotary Board starts completely empty on Round 1.
  // All Head Brewer meeples start off-board in each player's standby supply.
  // Standby Bays 1-6 are populated when workers slide inward at the end of each shift.
  const standby_bays = ([1, 2, 3, 4, 5, 6] as RotarySlotNumber[]).map((id) => ({
    id,
    occupants: [],
  }));

  return {
    slots,
    centerSpaceOccupant: null,
    pantryOccupants: {},
    centerRingHotSeat: null,
    hotSeatPlayerId: null,
    evictedFromStation: null,
    turnOrder: players.map((p) => p.id),
    standby_bays,
  } as any;
}

export function createInitialGameState(config: {
  playerCount: number;
  humanCount?: number;
  playerNames?: string[];
  seed?: number;
  enableDepartments?: boolean;
}): GameState {
  const playerCount = Math.max(1, Math.min(6, config.playerCount));
  const humanCount = config.humanCount ?? 1;
  const rng = createRng(config.seed);

  const allZoneCards = createAssemblyLineCards(6);
  let ingredientDeck = shuffleArray(createIngredientDeck(), rng);
  let tier3Deck = shuffleArray(createTierRecipeDeck(3), rng);
  let tier4Deck = shuffleArray(createTierRecipeDeck(4), rng);
  let tier5Deck = shuffleArray(createTierRecipeDeck(5), rng);
  let tier6Deck = shuffleArray(createTierRecipeDeck(6), rng);
  let tier3Discard: RecipeCard[] = [];
  let tier4Discard: RecipeCard[] = [];
  let tier5Discard: RecipeCard[] = [];
  let tier6Discard: RecipeCard[] = [];

  let equipmentDeck = shuffleArray(createEquipmentDeck(), rng);
  let equipmentDiscard: UpgradeCard[] = [];
  let staffDeck = shuffleArray(createStaffDeck(), rng);
  let staffDiscard: UpgradeCard[] = [];
  let upgradeDeck = [...equipmentDeck, ...staffDeck];
  let upgradeDiscard: UpgradeCard[] = [];

  // Dedicated Outer Shelf card distribution (Layout A: Stations 3-6 match Tiers 3-6):
  // Location 1: Dedicated Equipment Deck (Station #1 Market • Hardware Infrastructure)
  // Location 2: Dedicated Staff Deck (Station #2 Market • Brewery Floor Staff)
  // Location 3: Dedicated Tier 3 Recipe Deck (Station #3 Market • Fruit Hopper • Legends & Heavyweights)
  // Location 4: Dedicated Tier 4 Recipe Deck (Station #4 Market • Yeast Hopper • Heritage & Dark Ales)
  // Location 5: Dedicated Tier 5 Recipe Deck (Station #5 Market • Hops Hopper • Pints & IPAs)
  // Location 6: Dedicated Tier 6 Recipe Deck (Station #6 Market • Grain Hopper • Core Crushers)
  const slot1Card = equipmentDeck.shift()!;
  const slot2Card = staffDeck.shift()!;
  const slot3Card = tier3Deck.shift()!;
  const slot4Card = tier4Deck.shift()!;
  const slot5Card = tier5Deck.shift()!;
  const slot6Card = tier6Deck.shift()!;

  const recipeDeck = [...tier3Deck, ...tier4Deck, ...tier5Deck, ...tier6Deck];
  const recipeDiscard: RecipeCard[] = [];

  const breweryMarket: (RecipeCard | UpgradeCard)[] = [
    slot1Card,
    slot2Card,
    slot3Card,
    slot4Card,
    slot5Card,
    slot6Card,
  ];

  let breweryDeck: (RecipeCard | UpgradeCard)[] = shuffleArray([...equipmentDeck, ...staffDeck, ...recipeDeck], rng);
  const breweryDiscard: (RecipeCard | UpgradeCard)[] = [];

  const players: PlayerState[] = [];

  for (let i = 0; i < playerCount; i++) {
    const isAI = i >= humanCount;
    const defaultName = isAI
      ? AI_NAMES[i % AI_NAMES.length]
      : humanCount > 1
      ? `Brewer ${i + 1}`
      : 'You (Head Brewer)';
    const name = config.playerNames?.[i]?.trim() || defaultName;

    const playerZoneCards = allZoneCards.filter((z) => z.playerIndex === i);
    const zones: Record<ZoneId, ZoneState> = {
      1: {
        zoneId: 1,
        zoneCard: playerZoneCards.find((z) => z.zoneId === 1)!,
        equipment: [],
        staff: [],
        recipes: [],
      },
      2: {
        zoneId: 2,
        zoneCard: playerZoneCards.find((z) => z.zoneId === 2)!,
        equipment: [],
        staff: [],
        recipes: [],
      },
      3: {
        zoneId: 3,
        zoneCard: playerZoneCards.find((z) => z.zoneId === 3)!,
        equipment: [],
        staff: [],
        recipes: [],
      },
      4: {
        zoneId: 4,
        zoneCard: playerZoneCards.find((z) => z.zoneId === 4)!,
        equipment: [],
        staff: [],
        recipes: [],
      },
      5: {
        zoneId: 5,
        zoneCard: playerZoneCards.find((z) => z.zoneId === 5)!,
        equipment: [],
        staff: [],
        recipes: [],
      },
    };

    // Deal 4 starting ingredients to each player
    const hand: IngredientCard[] = []; // Zero-Hand Invariant: Players never hold cards in hand

    const newPlayer: PlayerState = {
      id: `player_${i + 1}`,
      name,
      isAI,
      aiPersona: isAI ? AI_PERSONAS[i % AI_PERSONAS.length] : undefined,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      tokens: {
        grain: 1,
        hops: 1,
        yeast: 1,
        chocolate: 0,
        spices: 0,
        fruit: 0,
      },
      hand,
      hand_cards: hand,
      actionsTakenThisShift: 0,
      actions_taken_this_shift: 0,
      isClockedIn: false,
      lastOccupiedStation: null,
      zones,
      leftWing: [],
      rightWing: [],
      mixerPacks: [],
      completedBatches: [],
      score: 0,
      scoreBreakdown: {
        recipeBaseVp: 0,
        recipeBonusVp: 0,
        upgradeTriggeredVp: 0,
        upgradeStaticVp: 0,
        mixerPackVp: 0,
      },
    };
    updatePlayerMat(newPlayer);
    players.push(newPlayer);
  }

  // The 6 Dedicated Ingredient Market Stations (Worker Placement Depot)
  const ingredientStations = createInitialIngredientStations(
    undefined,
    (arr) => shuffleArray(arr, rng)
  );

  const stationOrder: IngredientStationId[] = [
    'grain',
    'hops',
    'yeast',
    'chocolate',
    'spices',
    'fruit',
  ];

  // Row 1: 6-card Market Conveyor (mirrors the 6 stations' primary face-up cards for compatibility)
  const conveyorMarket: ConveyorSlot[] = stationOrder.map((sId) => ({
    ingredient: ingredientStations[sId].faceUpCards[0] || ingredientDeck[0],
    skippedCards: [],
  }));

  // Synchronized compatibility views
  const pubMarket = breweryMarket.filter((c): c is RecipeCard => c.deckType === 'recipe');
  const shopMarket = breweryMarket.filter((c): c is UpgradeCard => c.deckType === 'upgrade');
  const taproomMarket: TaproomCard[] = [...breweryMarket];
  const taproomDeck: TaproomCard[] = [...breweryDeck];
  const taproomDiscard: TaproomCard[] = [];

  // Deck 3: 8-Card Mixer Pack Bonus Deck (Set Collection / Public Race)
  // Deal 4 cards face-up alongside the Master Recipe offer row; remaining 4 form the draw deck
  const allMixerCards = shuffleArray(createMixerPackDeck(), rng);
  const mixerMarket: MixerPackCard[] = allMixerCards.splice(0, 4);
  const mixerDeck: MixerPackCard[] = allMixerCards;
  const mixerDiscard: MixerPackCard[] = [];

  // Deck 4: 10-Card Brewery Department Deck (Deal 1 unique department to each player if module enabled)
  const enableDepartments = config.enableDepartments !== false;
  let departmentDeck = shuffleArray(createDepartmentDeck(), rng);
  const departmentDiscard: BreweryDepartmentCard[] = [];
  if (enableDepartments) {
    for (let pIdx = 0; pIdx < players.length; pIdx++) {
      if (departmentDeck.length > 0) {
        players[pIdx].departmentCard = departmentDeck.shift()!;
        players[pIdx].departmentOccupant = null;
        players[pIdx].lastOccupiedDepartment = false;
      }
    }
  } else {
    for (let pIdx = 0; pIdx < players.length; pIdx++) {
      players[pIdx].departmentCard = undefined;
      players[pIdx].departmentOccupant = null;
      players[pIdx].lastOccupiedDepartment = false;
    }
  }

  const targetBatches = getTargetBatchesForPlayerCount(playerCount);

  const initialState: GameState = {
    players,
    currentPlayerIndex: 0,
    turnNumber: 1,
    roundNumber: 1,
    phase: 'PHASE_2_CATWALK_PLACEMENT',
    shiftPhase: 'PHASE_2_CATWALK_PLACEMENT',
    targetBatchesToTriggerEnd: targetBatches,
    endgameTriggeredByPlayerId: null,
    isFinalRound: false,
    winnerIds: [],
    ingredientStations,
    ingredientDeck,
    ingredientDiscard: [],
    conveyorMarket,
    breweryDeck,
    breweryDiscard,
    breweryMarket,
    mixerDeck,
    mixerMarket,
    mixerDiscard,
    departmentDeck,
    departmentDiscard,
    enableDepartments,
    lastMixerClaimEvent: null,
    recipeDeck,
    recipeDiscard,
    recipeTierDecks: {
      3: tier3Deck,
      4: tier4Deck,
      5: tier5Deck,
      6: tier6Deck,
    },
    recipeTierDiscards: {
      3: tier3Discard,
      4: tier4Discard,
      5: tier5Discard,
      6: tier6Discard,
    },
    pubMarket,
    equipmentDeck,
    equipmentDiscard,
    staffDeck,
    staffDiscard,
    upgradeDeck,
    upgradeDiscard,
    shopMarket,
    taproomDeck,
    taproomDiscard,
    taproomMarket,
    centralHoppers: {
      grain: TOTAL_TOKEN_POOL.grain - playerCount * 1,
      hops: TOTAL_TOKEN_POOL.hops - playerCount * 1,
      yeast: TOTAL_TOKEN_POOL.yeast - playerCount * 1,
      fruit: TOTAL_TOKEN_POOL.fruit,
      spices: TOTAL_TOKEN_POOL.spices,
      chocolate: TOTAL_TOKEN_POOL.chocolate,
    },
    kettlePool: {
      grain: 0,
      hops: 0,
      yeast: 0,
      fruit: 0,
      spices: 0,
      chocolate: 0,
    },
    rotaryBoard: createInitialRotaryBoard(breweryMarket, players),
    lastMarketFlushEvent: null,
    lastMorningShiftEvents: [],
    logs: [
      {
        id: 'log_init',
        turn: 1,
        playerId: players[0].id,
        playerName: players[0].name,
        phase: 'PHASE_2_CATWALK_PLACEMENT',
        message: `Welcome to House of Hoyne! 81-Card Master Deck & 11.5" Rotary Board online — race to ${targetBatches} completed recipes begins. Core Trinity (1 Grain, 1 Hops, 1 Yeast) loaded!`,
        timestamp: Date.now(),
      },
    ],
  };

  // Phase 1 Market Refresh & Gridlock Check on initial market
  const refreshedState = executePhase1MarketRefresh(initialState, rng);
  refreshedState.phase = 'PHASE_2_CATWALK_PLACEMENT';
  refreshedState.shiftPhase = 'PHASE_2_CATWALK_PLACEMENT';
  return refreshedState;
}

function clonePlayer(player: PlayerState): PlayerState {
  const p: PlayerState = {
    ...player,
    tokens: {
      grain: player.tokens?.grain ?? 0,
      hops: player.tokens?.hops ?? 0,
      yeast: player.tokens?.yeast ?? 0,
      chocolate: player.tokens?.chocolate ?? 0,
      spices: player.tokens?.spices ?? 0,
      fruit: player.tokens?.fruit ?? 0,
    },
    hand: [...player.hand],
    hand_cards: [...(player.hand_cards || player.hand)],
    actionsTakenThisShift: player.actionsTakenThisShift ?? 0,
    actions_taken_this_shift: player.actions_taken_this_shift ?? player.actionsTakenThisShift ?? 0,
    isClockedIn: player.isClockedIn ?? false,
    leftWing: [...(player.leftWing || [])],
    rightWing: [...(player.rightWing || [])],
    mixerPacks: [...(player.mixerPacks || [])],
    completedBatches: [...(player.completedBatches || [])],
    placedWorkerStationId: player.placedWorkerStationId ?? null,
    lastOccupiedDepartment: player.lastOccupiedDepartment ?? false,
    departmentCard: player.departmentCard ? { ...player.departmentCard } : null,
    departmentOccupant: player.departmentOccupant ? { ...player.departmentOccupant } : null,
    scoreBreakdown: { ...player.scoreBreakdown },
    zones: {
      1: {
        ...player.zones[1],
        equipment: [...player.zones[1].equipment],
        staff: [...player.zones[1].staff],
        recipes: [...player.zones[1].recipes],
      },
      2: {
        ...player.zones[2],
        equipment: [...player.zones[2].equipment],
        staff: [...player.zones[2].staff],
        recipes: [...player.zones[2].recipes],
      },
      3: {
        ...player.zones[3],
        equipment: [...player.zones[3].equipment],
        staff: [...player.zones[3].staff],
        recipes: [...player.zones[3].recipes],
      },
      4: {
        ...player.zones[4],
        equipment: [...player.zones[4].equipment],
        staff: [...player.zones[4].staff],
        recipes: [...player.zones[4].recipes],
      },
      5: {
        ...player.zones[5],
        equipment: [...player.zones[5].equipment],
        staff: [...player.zones[5].staff],
        recipes: [...player.zones[5].recipes],
      },
    },
  };
  updatePlayerMat(p);
  return p;
}

/**
 * PHASE 1: MORNING SHIFT
 * 1. Fermented beer in Zone 3 (Glass Carboy) moves to Zone 4 (Loading Dock) and scores!
 * 2. Wort in Zone 2 (Brew Kettle) moves to Zone 3 (Glass Carboy) up to Carboy capacity.
 * 3. Transitions phase to 'WORK_DAY'.
 */
export function executeMorningShift(state: GameState): GameState {
  if (state.phase === 'GAME_OVER') return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];

  // Mandatory Warehouse Capacity Enforcement: Human players cannot advance morning shift while over capacity
  if (!player.isAI) {
    const totalTokens = Object.values(player.tokens || {}).reduce((sum, v) => sum + (v || 0), 0);
    const cap = getWarehouseCapacity(player);
    if (totalTokens > cap) {
      return state;
    }
  }

  let ingredientDeck = [...state.ingredientDeck];
  let ingredientDiscard = [...state.ingredientDiscard];
  let centralHoppers = state.centralHoppers ? { ...state.centralHoppers } : undefined;
  let logs = [...state.logs];
  const events: MorningShiftEvent[] = [];

  // Step 1: Deliver & Ship batches from Zone 5 (Packaging & Canning Lines) -> Completed Batches (Trophy Rack)
  const completingRecipes = [...player.zones[5].recipes];
  player.zones[5].recipes = [];

  for (const recipe of completingRecipes) {
    (recipe as any).scored = true;
    if (!player.completedBatches) player.completedBatches = [];
    player.completedBatches.push(recipe);

    const baseVp = recipe.vp;
    const bonusVp = recipe.completionEffect?.bonusVp ?? 0;

    // Calculate Zone 4 upgrade triggers (Legacy compatibility; zero flat VP on modern upgrades)
    let upgradeTriggeredVp = 0;
    const tacoBarCount = countUpgradeEffect(player, 'taco_bar_tasting_room');
    if (tacoBarCount > 0) {
      const perTaco = recipe.tier === 6 ? 3 : 2;
      upgradeTriggeredVp += tacoBarCount * perTaco;
    }
    const dockPlus1Count = countUpgradeEffect(player, 'loading_dock_vp_plus_1');
    if (dockPlus1Count > 0) {
      upgradeTriggeredVp += dockPlus1Count * 1;
    }
    const seanCount = countUpgradeEffect(player, 'sean_hoyne_master_brewer');
    if (seanCount > 0 && (recipe.tier === 3 || recipe.tier === 4)) {
      upgradeTriggeredVp += seanCount * 2;
    }
    const adjunctSpecCount = countUpgradeEffect(player, 'adjunct_specialist');
    if (adjunctSpecCount > 0) {
      const usesDarkOrAdjunct = recipe.requiredIngredients.some(
        (sub) =>
          sub === 'dark_roasted_malt' ||
          sub === 'fresh_wet_hops' ||
          sub === 'winter_spices' ||
          sub === 'local_raspberries'
      );
      if (usesDarkOrAdjunct) {
        upgradeTriggeredVp += adjunctSpecCount * 3;
      }
    }

    const totalBatchVp = baseVp + bonusVp + upgradeTriggeredVp;
    player.scoreBreakdown.recipeBaseVp += baseVp;
    player.scoreBreakdown.recipeBonusVp += bonusVp;
    player.scoreBreakdown.upgradeTriggeredVp += upgradeTriggeredVp;
    player.score += totalBatchVp;

    // Output Engine Draws: Recipe completion + Canning/Delivery/Distribution Hub
    const drawCount =
      (recipe.completionEffect?.drawIngredients ?? 0) +
      countUpgradeEffect(player, 'shift_supervisor') +
      countUpgradeEffect(player, 'dock_draw_2') * 2 +
      countUpgradeEffect(player, 'dock_draw_1') * 1 +
      countUpgradeEffect(player, 'wing_distribution_hub') * 2;

    for (let d = 0; d < drawCount; d++) {
      const drawn = drawFromIngredientDeck(ingredientDeck, ingredientDiscard);
      ingredientDeck = drawn.deck;
      ingredientDiscard = drawn.discard;
      if (drawn.card) {
        player.hand.push(drawn.card);
      }
    }

    // Keg Washing Station: Reclaim 1 spent ingredient back to hand
    const refunds = countUpgradeEffect(player, 'dock_refund_1');
    for (let r = 0; r < refunds && ingredientDiscard.length > 0; r++) {
      const reclaimed = ingredientDiscard.pop();
      if (reclaimed) {
        player.hand.push(reclaimed);
      }
    }

    // Fermentation Tech / Yeast Propagator: Draw 1 House Yeast
    const yeastRecycles = countUpgradeEffect(player, 'yeast_recycle');
    for (let y = 0; y < yeastRecycles; y++) {
      const discardYeastIdx = ingredientDiscard.findIndex((c) => c.subtype === 'house_yeast');
      if (discardYeastIdx !== -1) {
        player.hand.push(ingredientDiscard.splice(discardYeastIdx, 1)[0]);
      } else {
        const drawn = drawFromIngredientDeck(ingredientDeck, ingredientDiscard);
        ingredientDeck = drawn.deck;
        ingredientDiscard = drawn.discard;
        if (drawn.card) {
          player.hand.push(drawn.card);
        }
      }
    }

    // Cold Freight Wing: Fast-track oldest Brewhouse batch to Fermentation Cellar
    const coldFreight = countUpgradeEffect(player, 'wing_cold_freight');
    const currentCarboyCap = getPlayerCarboyCapacity(player);
    if (
      coldFreight > 0 &&
      player.zones[2].recipes.length > 0 &&
      player.zones[3].recipes.length < currentCarboyCap
    ) {
      const fastBatch = player.zones[2].recipes.shift()!;
      player.zones[3].recipes.push(fastBatch);
      events.push({
        recipeId: fastBatch.id,
        recipeName: fastBatch.name,
        fromZone: 2,
        toZone: 3,
      });
    }

    // Dual-Purpose Upgrade Triggers: Delivery Paydays (Zone 5 -> Trophy Rack)

    // 3. Taproom Lead: Take 1 Spices from the Market
    const taproomLeadCount = countUpgradeEffect(player, 'delivery_take_spices') + countUpgradeEffect(player, 'delivery_take_pantry_token');
    for (let t = 0; t < taproomLeadCount; t++) {
      const pantryChoice: IngredientTaxonomy = (centralHoppers?.spices ?? 0) > 0 ? 'spices' : ((centralHoppers?.grain ?? 0) > 0 ? 'grain' : 'hops');
      if (centralHoppers && (centralHoppers[pantryChoice] ?? 0) > 0) {
        centralHoppers[pantryChoice] = Math.max(0, centralHoppers[pantryChoice] - 1);
      }
      player.tokens[pantryChoice] = (player.tokens[pantryChoice] || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Taproom Lead delivery bonus: +1 ${pantryChoice.toUpperCase()} token.`);
    }

    // 4. Automated Keg Racker: Take 1 Grain and 1 Yeast when delivering to Trophy Rack
    const kegRackerCount = countUpgradeEffect(player, 'delivery_take_grain_and_yeast');
    for (let k = 0; k < kegRackerCount; k++) {
      if (centralHoppers && (centralHoppers.grain ?? 0) > 0) {
        centralHoppers.grain = Math.max(0, centralHoppers.grain - 1);
      }
      player.tokens.grain = (player.tokens.grain || 0) + 1;
      if (centralHoppers && (centralHoppers.yeast ?? 0) > 0) {
        centralHoppers.yeast = Math.max(0, centralHoppers.yeast - 1);
      }
      player.tokens.yeast = (player.tokens.yeast || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Automated Keg Racker delivery: +1 GRAIN & +1 YEAST tokens.`);
    }

    // 5. Pallet Stretch Wrapper: Retain 1 spent Grain when delivering a recipe
    const stretchWrapperCount = countUpgradeEffect(player, 'delivery_retain_spent_grain') + countUpgradeEffect(player, 'delivery_retain_spent_token');
    for (let s = 0; s < stretchWrapperCount; s++) {
      player.tokens.grain = (player.tokens.grain || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Pallet Stretch Wrapper: Retained 1 spent GRAIN token.`);
    }

    // QA & Packaging Lead: Retain 1 spent Hops
    const qaLeadCount = countUpgradeEffect(player, 'delivery_retain_spent_hops');
    for (let q = 0; q < qaLeadCount; q++) {
      player.tokens.hops = (player.tokens.hops || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `QA & Packaging Lead: Retained 1 spent HOPS token.`);
    }

    // Case Packer & Date Coder: Take 1 Hops from the Market
    const casePackerCount = countUpgradeEffect(player, 'delivery_take_hops');
    for (let c = 0; c < casePackerCount; c++) {
      if (centralHoppers && (centralHoppers.hops ?? 0) > 0) {
        centralHoppers.hops = Math.max(0, centralHoppers.hops - 1);
      }
      player.tokens.hops = (player.tokens.hops || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Case Packer delivery bonus: +1 HOPS token.`);
    }

    // 6. Dock Expediter: Take 1 token of any type from central kettle when delivering to Trophy Rack
    const dockExpediterCount = countUpgradeEffect(player, 'delivery_take_kettle_token');
    for (let d = 0; d < dockExpediterCount; d++) {
      const availableTax = ((Object.keys(centralHoppers || {}) as IngredientTaxonomy[]).find(
        (tax) => (centralHoppers?.[tax] ?? 0) > 0
      ) || 'grain') as IngredientTaxonomy;
      if (centralHoppers && (centralHoppers[availableTax] ?? 0) > 0) {
        centralHoppers[availableTax] = Math.max(0, centralHoppers[availableTax] - 1);
      }
      player.tokens[availableTax] = (player.tokens[availableTax] || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Dock Expediter delivery bonus: +1 ${availableTax.toUpperCase()} token.`);
    }

    // 7. Brand Ambassador: Take 1 token of any type from Market upon delivering to Trophy Rack
    const ambassadorCount = countUpgradeEffect(player, 'delivery_take_market_token');
    for (let a = 0; a < ambassadorCount; a++) {
      const priorityOrder: IngredientTaxonomy[] = ['fruit', 'spices', 'chocolate', 'hops', 'yeast', 'grain'];
      const availableTax = priorityOrder.find((t) => (centralHoppers?.[t] ?? 0) > 0) || 'grain';
      if (centralHoppers && (centralHoppers[availableTax] ?? 0) > 0) {
        centralHoppers[availableTax] = Math.max(0, centralHoppers[availableTax] - 1);
      }
      player.tokens[availableTax] = (player.tokens[availableTax] || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Brand Ambassador: Took 1 ${availableTax.toUpperCase()} token from the Market upon delivery.`);
    }

    // Legacy Brand Ambassador fallback
    const legacyAmbassadorCount = countUpgradeEffect(player, 'delivery_score_bonus_vp');
    for (let a = 0; a < legacyAmbassadorCount; a++) {
      player.scoreBreakdown.upgradeStaticVp += 1;
      player.score += 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Brand Ambassador: Scored +1 bonus Victory Point on delivery.`);
    }

    events.push({
      recipeId: recipe.id,
      recipeName: recipe.name,
      fromZone: 5,
      toZone: 5,
      vpEarned: totalBatchVp,
    });

    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'MORNING_SHIFT',
      `Delivered & shipped ${recipe.name} from Zone 5 (Packaging) to Trophy Rack for +${totalBatchVp} VP!${
        drawCount > 0 ? ` Drew ${drawCount} Ingredient(s).` : ''
      }`
    );
  }

  // Step 2: Move batches from Zone 4 (Conditioning & Lagering) -> Zone 5 (Packaging & Canning Lines)
  const packagingCap = 1;
  while (
    player.zones[4].recipes.length > 0 &&
    player.zones[5].recipes.length < packagingCap
  ) {
    const packagingRecipe = player.zones[4].recipes.shift()!;
    player.zones[5].recipes.push(packagingRecipe);
    events.push({
      recipeId: packagingRecipe.id,
      recipeName: packagingRecipe.name,
      fromZone: 4,
      toZone: 5,
    });
    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'MORNING_SHIFT',
      `Transferred ${packagingRecipe.name} from Conditioning & Lagering (Zone 4) to Packaging & Canning Lines (Zone 5).`
    );

    // Route Driver: Take 1 Grain from the Market when packaging a beer
    const routeDriverCount = countUpgradeEffect(player, 'package_beer_take_grain') + countUpgradeEffect(player, 'package_beer_take_kettle_token');
    for (let r = 0; r < routeDriverCount; r++) {
      const availableTax: IngredientTaxonomy = ((centralHoppers?.grain ?? 0) > 0) ? 'grain' : 'hops';
      if (centralHoppers && (centralHoppers[availableTax] ?? 0) > 0) {
        centralHoppers[availableTax] = Math.max(0, centralHoppers[availableTax] - 1);
      }
      player.tokens[availableTax] = (player.tokens[availableTax] || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Route Driver packaging perk: +1 ${availableTax.toUpperCase()} token from the Market as ${packagingRecipe.name} enters Packaging.`);
    }
  }

  // Step 3: Move batches from Zone 3 (Fermentation Cellar) -> Zone 4 (Conditioning & Lagering)
  const conditioningCap = 1;
  while (
    player.zones[3].recipes.length > 0 &&
    player.zones[4].recipes.length < conditioningCap
  ) {
    const maturingRecipe = player.zones[3].recipes.shift()!;
    player.zones[4].recipes.push(maturingRecipe);
    events.push({
      recipeId: maturingRecipe.id,
      recipeName: maturingRecipe.name,
      fromZone: 3,
      toZone: 4,
    });

    // Dual-Purpose Upgrade Triggers: Fermentation -> Conditioning Kickbacks
    // Bright Conditioning Rig: When a beer advances into Conditioning, take 1 Yeast
    const brightRigCount = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_yeast');
    for (let b = 0; b < brightRigCount; b++) {
      if (centralHoppers && (centralHoppers.yeast ?? 0) > 0) {
        centralHoppers.yeast = Math.max(0, centralHoppers.yeast - 1);
      }
      player.tokens.yeast = (player.tokens.yeast || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Bright Conditioning Rig kickback: +1 YEAST token.`);
    }

    // Horizontal Lagering Tank: When a beer advances into Conditioning, take 1 Grain
    const lageringTankCount = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_grain');
    for (let l = 0; l < lageringTankCount; l++) {
      if (centralHoppers && (centralHoppers.grain ?? 0) > 0) {
        centralHoppers.grain = Math.max(0, centralHoppers.grain - 1);
      }
      player.tokens.grain = (player.tokens.grain || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Horizontal Lagering Tank kickback: +1 GRAIN token.`);
    }

    // Centrifuge Clarifier & Dry-Hop Lead: When a beer advances into Conditioning, take 1 Hops
    const clarifierCount = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_hops');
    for (let c = 0; c < clarifierCount; c++) {
      if (centralHoppers && (centralHoppers.hops ?? 0) > 0) {
        centralHoppers.hops = Math.max(0, centralHoppers.hops - 1);
      }
      player.tokens.hops = (player.tokens.hops || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Conditioning advance kickback: +1 HOPS token.`);
    }

    // Plate Heat Exchanger: When a beer advances into Conditioning, take 1 Yeast
    const plateHeatCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_yeast');
    for (let p = 0; p < plateHeatCount; p++) {
      if (centralHoppers && (centralHoppers.yeast ?? 0) > 0) {
        centralHoppers.yeast = Math.max(0, centralHoppers.yeast - 1);
      }
      player.tokens.yeast = (player.tokens.yeast || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Plate Heat Exchanger kickback: +1 YEAST token.`);
    }

    // Glycol Cooling Jacket: When a beer advances into Conditioning, take 1 Grain
    const glycolCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_grain');
    for (let g = 0; g < glycolCount; g++) {
      if (centralHoppers && (centralHoppers.grain ?? 0) > 0) {
        centralHoppers.grain = Math.max(0, centralHoppers.grain - 1);
      }
      player.tokens.grain = (player.tokens.grain || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Glycol Cooling Jacket kickback: +1 GRAIN token.`);
    }

    // Conical Unitank: When a beer advances into Conditioning, take 1 Hops
    const unitankCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_hops');
    for (let u = 0; u < unitankCount; u++) {
      if (centralHoppers && (centralHoppers.hops ?? 0) > 0) {
        centralHoppers.hops = Math.max(0, centralHoppers.hops - 1);
      }
      player.tokens.hops = (player.tokens.hops || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Conical Unitank kickback: +1 HOPS token.`);
    }

    // Oak Aging Foeder & Barrel Master: When a beer advances into Conditioning, take 1 Spices
    const foederCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_spices') + countUpgradeEffect(player, 'advance_cellar_to_pack_take_spice_or_fruit');
    for (let f = 0; f < foederCount; f++) {
      const pref: IngredientTaxonomy = (centralHoppers?.spices ?? 0) > 0 ? 'spices' : 'fruit';
      if (centralHoppers && (centralHoppers[pref] ?? 0) > 0) {
        centralHoppers[pref] = Math.max(0, centralHoppers[pref] - 1);
      }
      player.tokens[pref] = (player.tokens[pref] || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, 'MORNING_SHIFT', `Oak Aging Foeder kickback: +1 ${pref.toUpperCase()} token.`);
    }

    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'MORNING_SHIFT',
      `Transferred ${maturingRecipe.name} from Fermentation Cellar (Zone 3) to Conditioning & Lagering (Zone 4).`
    );
  }

  // Step 3: Move batches from Zone 2 (Brewhouse) -> Zone 3 (Fermentation Cellar) if space available
  const carboyCap = getPlayerCarboyCapacity(player);
  while (
    player.zones[2].recipes.length > 0 &&
    player.zones[3].recipes.length < carboyCap
  ) {
    const movingRecipe = player.zones[2].recipes.shift()!;
    player.zones[3].recipes.push(movingRecipe);
    events.push({
      recipeId: movingRecipe.id,
      recipeName: movingRecipe.name,
      fromZone: 2,
      toZone: 3,
    });

    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'MORNING_SHIFT',
      `Transferred ${movingRecipe.name} from Brewhouse (Zone 2) to Fermentation Cellar (Zone 3).`
    );
  }

  if (player.zones[2].recipes.length > 0 && player.zones[3].recipes.length >= carboyCap) {
    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'MORNING_SHIFT',
      `Bottleneck! ${player.zones[2].recipes[0].name} remains in Brewhouse because Fermentation Cellar is full.`
    );
  }

  // Step 4: Move batches from Zone 1 (Warehouse) -> Zone 2 (Brewhouse) if space available
  const kettleCap = 1;
  while (
    player.zones[1].recipes.length > 0 &&
    player.zones[2].recipes.length < kettleCap
  ) {
    const stagingRecipe = player.zones[1].recipes.shift()!;
    player.zones[2].recipes.push(stagingRecipe);
    events.push({
      recipeId: stagingRecipe.id,
      recipeName: stagingRecipe.name,
      fromZone: 1,
      toZone: 2,
    });

    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'MORNING_SHIFT',
      `Transferred ${stagingRecipe.name} from Warehouse Staging (Zone 1) to Brewhouse Kettle (Zone 2).`
    );
  }

  if (player.zones[1].recipes.length > 0 && player.zones[2].recipes.length >= kettleCap) {
    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'MORNING_SHIFT',
      `Bottleneck! ${player.zones[1].recipes[0].name} remains in Warehouse staging because Brewhouse Kettle is full.`
    );
  }

  // Check if endgame batch threshold reached
  let endgameTriggeredByPlayerId = state.endgameTriggeredByPlayerId;
  let isFinalRound = state.isFinalRound;

  if (
    !isFinalRound &&
    player.zones[5].recipes.length >= state.targetBatchesToTriggerEnd
  ) {
    isFinalRound = true;
    endgameTriggeredByPlayerId = player.id;
    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'MORNING_SHIFT',
      `🔔 LAST CALL! ${player.name} reached ${player.zones[5].recipes.length} completed batches! Finishing the current round.`
    );
  }

  // Mandatory Warehouse Capacity Enforcement: AI automatically returns excess kickback tokens
  if (player.isAI && centralHoppers) {
    logs = enforceAiWarehouseCapacity(player, centralHoppers, logs, state.turnNumber);
  }

  const shiftResult: GameState = {
    ...state,
    players,
    centralHoppers: centralHoppers || state.centralHoppers,
    ingredientDeck,
    ingredientDiscard,
    phase: 'WORK_DAY',
    endgameTriggeredByPlayerId,
    isFinalRound,
    lastMorningShiftEvents: events,
    logs,
  };

  // Check and claim any completed Mixer Pack set bounties
  const mixerCheck = checkAndClaimMixerPacks(shiftResult, state.currentPlayerIndex);
  return mixerCheck.state;
}

/**
 * Evaluates whether a player has completed all 4 required recipes in their off-mat Trophy Stack (Zone 4)
 * to claim any of the face-up Mixer Pack cards currently in mixerMarket.
 * First player to fulfill the 4-recipe set claims the card for immediate bonus VP.
 * If claimed, the card is removed from mixerMarket and replaced from mixerDeck (if any remain).
 */
export function checkAndClaimMixerPacks(
  state: GameState,
  playerIndex: number
): {
  state: GameState;
  claimedCards: MixerPackCard[];
} {
  const players = state.players.map(clonePlayer);
  const player = players[playerIndex];
  let mixerMarket = [...(state.mixerMarket || [])];
  let mixerDeck = [...(state.mixerDeck || [])];
  let logs = [...state.logs];
  const claimedCards: MixerPackCard[] = [];
  let lastClaimEvent = state.lastMixerClaimEvent ?? null;

  // Completed recipes in Trophy Rack / completed batches & Zone 5
  const completedRecipes = [
    ...(player.completedBatches || []),
    ...(player.zones[5]?.recipes || []),
  ];

  // Helper function: counts how many distinct sets of the 4 required recipes the player has brewed
  const countCompletedSets = (requirements: string[]): number => {
    const available = completedRecipes.filter(Boolean).map((r) => r.name);
    let sets = 0;
    while (true) {
      let matchedAll = true;
      for (const req of requirements) {
        const matchIdx = available.findIndex((availName) =>
          matchRecipeToMixerRequirement(availName, req)
        );
        if (matchIdx === -1) {
          matchedAll = false;
          break;
        }
        available.splice(matchIdx, 1);
      }
      if (matchedAll) {
        sets++;
      } else {
        break;
      }
    }
    return sets;
  };

  let i = 0;
  while (i < mixerMarket.length) {
    const card = mixerMarket[i];
    const sets = countCompletedSets(card.requiredRecipes);
    const alreadyClaimedCount = player.mixerPacks.filter((p) => p.name === card.name).length;

    if (sets > alreadyClaimedCount) {
      // Claim the card!
      const claimedCard: MixerPackCard = {
        ...card,
        claimedByPlayerId: player.id,
        claimedByPlayerName: player.name,
      };
      player.mixerPacks.push(claimedCard);
      player.scoreBreakdown.mixerPackVp =
        (player.scoreBreakdown.mixerPackVp || 0) + card.vp;
      player.score += card.vp;
      claimedCards.push(claimedCard);

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        state.phase,
        `🏆 MIXER PACK CLAIMED! ${player.name} claimed "${card.name}" (+${card.vp} VP) by completing [${card.requiredRecipes.join(', ')}]!`
      );

      lastClaimEvent = {
        playerId: player.id,
        playerName: player.name,
        cardName: card.name,
        vp: card.vp,
        timestamp: Date.now(),
      };

      // Remove from face-up market
      mixerMarket.splice(i, 1);

      // Refill from mixerDeck if available (keeping 4 cards face-up while deck lasts)
      if (mixerDeck.length > 0) {
        mixerMarket.push(mixerDeck.shift()!);
      }
    } else {
      i++;
    }
  }

  return {
    state: {
      ...state,
      players,
      mixerMarket,
      mixerDeck,
      logs,
      lastMixerClaimEvent: lastClaimEvent,
    },
    claimedCards,
  };
}

/**
 * Checks whether a player can draft a specific slot on the 6-card Conveyor Market.
 * Index 0 is the oldest card and costs 0 skips.
 * Index k requires skipping k cards (minus getPlayerFreeSkips(player)), paid from player's hand.
 */
export function canDraftConveyorSlot(
  state: GameState,
  player: PlayerState,
  slotIndex: number,
  handIdsAlreadyCommitted: string[] = []
): { canDraft: boolean; skipsRequired: number; reason?: string } {
  if (slotIndex < 0 || slotIndex >= state.conveyorMarket.length) {
    return { canDraft: false, skipsRequired: 0, reason: 'Invalid conveyor slot index.' };
  }

  const freeSkips = getPlayerFreeSkips(player);
  const skipsRequired = Math.max(0, slotIndex - freeSkips);
  const availableHandCards = player.hand.filter(
    (c) => !handIdsAlreadyCommitted.includes(c.id)
  );

  if (availableHandCards.length < skipsRequired) {
    return {
      canDraft: false,
      skipsRequired,
      reason: `Need ${skipsRequired} card(s) in hand to Pay to Skip to slot #${slotIndex + 1}.`,
    };
  }

  return { canDraft: true, skipsRequired };
}

/**
 * Executes a single Source pick (either 'deck' or 'conveyor') without ending the turn.
 * Useful both for interactive step-by-step UI picking and batch `performSourceAction`.
 */
export function performSourceSinglePick(
  state: GameState,
  choice: SourcePickChoice
): GameState {
  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];

  // Mandatory Warehouse Capacity Enforcement: Human players cannot draft ingredients while over capacity
  if (!player.isAI) {
    const totalTokens = Object.values(player.tokens || {}).reduce((sum, v) => sum + (v || 0), 0);
    const cap = getWarehouseCapacity(player);
    if (totalTokens > cap) {
      return state;
    }
  }

  let ingredientDeck = [...state.ingredientDeck];
  let ingredientDiscard = [...state.ingredientDiscard];
  const conveyorMarket: ConveyorSlot[] = state.conveyorMarket.map((slot) => ({
    ingredient: slot.ingredient,
    skippedCards: [...slot.skippedCards],
  }));
  let logs = [...state.logs];

  if (choice.type === 'deck') {
    const drawn = drawFromIngredientDeck(ingredientDeck, ingredientDiscard);
    ingredientDeck = drawn.deck;
    ingredientDiscard = drawn.discard;
    if (drawn.card) {
      player.hand.push(drawn.card);
      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'WORK_DAY',
        `Sourced 1 blind Ingredient (${drawn.card.name}) from the supply deck.`
      );
    }
  } else if (choice.type === 'conveyor') {
    const slotIndex = choice.conveyorIndex ?? 0;
    const validation = canDraftConveyorSlot(state, player, slotIndex);
    if (!validation.canDraft) {
      return state;
    }

    const skipsRequired = validation.skipsRequired;

    // Determine which cards from player's hand are used to pay for skipped slots
    let paidIds = choice.paidHandCardIds ? [...choice.paidHandCardIds] : [];
    if (paidIds.length < skipsRequired) {
      // Auto-pick from hand if caller didn't specify enough IDs
      for (const hCard of player.hand) {
        if (!paidIds.includes(hCard.id) && paidIds.length < skipsRequired) {
          paidIds.push(hCard.id);
        }
      }
    } else if (paidIds.length > skipsRequired) {
      paidIds = paidIds.slice(0, skipsRequired);
    }

    const paidCards: IngredientCard[] = [];
    for (const id of paidIds) {
      const idx = player.hand.findIndex((c) => c.id === id);
      if (idx !== -1) {
        paidCards.push(player.hand.splice(idx, 1)[0]);
      }
    }

    // Place 1 paid card onto each skipped slot before slotIndex
    for (let s = 0; s < paidCards.length && s < slotIndex; s++) {
      conveyorMarket[s].skippedCards.push(paidCards[s]);
    }

    // Draft the target slot's base ingredient AND any accumulated skippedCards on it!
    const draftedSlot = conveyorMarket[slotIndex];
    player.hand.push(draftedSlot.ingredient, ...draftedSlot.skippedCards);

    const bonusCount = draftedSlot.skippedCards.length;
    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'WORK_DAY',
      `Drafted ${draftedSlot.ingredient.name} from Conveyor Slot #${slotIndex + 1}${
        bonusCount > 0 ? ` (+${bonusCount} stacked skip bonus card(s)!)` : ''
      }${paidCards.length > 0 ? ` [Paid ${paidCards.length} card(s) to skip]` : ''}.`
    );

    // Remove drafted slot and shift conveyor left, replenish at end (index 5)
    conveyorMarket.splice(slotIndex, 1);
    const replenish = drawFromIngredientDeck(ingredientDeck, ingredientDiscard);
    ingredientDeck = replenish.deck;
    ingredientDiscard = replenish.discard;
    if (replenish.card) {
      conveyorMarket.push({
        ingredient: replenish.card,
        skippedCards: [],
      });
    }
  }

  return {
    ...state,
    players,
    ingredientDeck,
    ingredientDiscard,
    conveyorMarket,
    logs,
  };
}

/**
 * Checks whether a player can place their Brewer worker piece at an ingredient station.
 * Exclusive worker placement: Only 1 player piece per pile per round.
 */
export function canPlaceWorkerAtStation(
  state: GameState,
  player: PlayerState,
  stationId: IngredientStationId
): { canPlace: boolean; reason?: string } {
  if (!state.ingredientStations || !state.ingredientStations[stationId]) {
    return { canPlace: false, reason: 'Invalid ingredient station.' };
  }

  const station = state.ingredientStations[stationId];

  // Exclusive Worker Placement Check:
  // If occupied by someone else, check if player has bypass upgrades (e.g. Conveyor Belting / Grist Intake)
  if (station.occupiedByPlayerId && station.occupiedByPlayerId !== player.id) {
    const hasBypass =
      countUpgradeEffect(player, 'free_skip_conveyor') > 0 ||
      countUpgradeEffect(player, 'free_skips_plus_2') > 0;

    if (!hasBypass) {
      return {
        canPlace: false,
        reason: `${station.name} is occupied by ${station.occupiedByPlayerName || 'another player'} this round (Exclusive Worker Placement: 1 player per pile).`,
      };
    }
  }

  // Check if station has cards available to draft
  const totalCards = station.faceUpCards.length + station.deck.length + station.discard.length;
  if (totalCards === 0) {
    return { canPlace: false, reason: `${station.name} is currently out of stock.` };
  }

  return { canPlace: true };
}

/**
 * Action A: Source Raw Ingredients via Worker Placement
 * Places player's Brewer piece at `stationId` (exclusive per round) and drafts
 * `getPlayerSourceDrawCount(player)` cards (default 2) from the station's face-up cards (or top of deck).
 */
export function performWorkerSourceAction(
  state: GameState,
  stationId: IngredientStationId,
  selectedDraftCardIds?: string[]
): GameState {
  if (state.phase !== 'WORK_DAY') return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];

  const check = canPlaceWorkerAtStation(state, player, stationId);
  if (!check.canPlace) return state;

  // Clone stations
  const stations: Record<IngredientStationId, IngredientStationState> = {
    ...state.ingredientStations,
  };
  const targetStation: IngredientStationState = {
    ...stations[stationId],
    faceUpCards: [...stations[stationId].faceUpCards],
    deck: [...stations[stationId].deck],
    discard: [...stations[stationId].discard],
  };

  // Occupy station with Brewer piece
  targetStation.occupiedByPlayerId = player.id;
  targetStation.occupiedByPlayerName = player.name;
  targetStation.occupiedByPlayerColor = player.color;
  player.placedWorkerStationId = stationId;

  // Determine how many cards to draft (Grain/Hops/Yeast draw 2, Chocolate/Spices/Fruit draw 1, plus upgrades)
  const stationBase =
    targetStation.baseDrawCount ??
    (['grain', 'hops', 'yeast'].includes(stationId) ? 2 : 1);
  const extraDraw =
    countUpgradeEffect(player, 'extra_source_draw') +
    countUpgradeEffect(player, 'wing_sourcing_master');
  const drawCount = stationBase + extraDraw;
  const draftedCards: IngredientCard[] = [];

  // 1. Draft explicitly selected face-up cards if provided
  if (selectedDraftCardIds && selectedDraftCardIds.length > 0) {
    for (const cardId of selectedDraftCardIds) {
      if (draftedCards.length >= drawCount) break;
      const fIdx = targetStation.faceUpCards.findIndex((c) => c.id === cardId);
      if (fIdx !== -1) {
        draftedCards.push(targetStation.faceUpCards.splice(fIdx, 1)[0]);
      }
    }
  }

  // 2. Draft from remaining face-up cards or station deck
  while (draftedCards.length < drawCount) {
    if (targetStation.faceUpCards.length > 0) {
      draftedCards.push(targetStation.faceUpCards.shift()!);
    } else if (targetStation.deck.length > 0) {
      draftedCards.push(targetStation.deck.shift()!);
    } else if (targetStation.discard.length > 0) {
      // Reshuffle discard into deck
      targetStation.deck = [...targetStation.discard];
      targetStation.discard = [];
      draftedCards.push(targetStation.deck.shift()!);
    } else {
      break;
    }
  }

  // 3. Replenish face-up card on top of stack back up to 1
  while (targetStation.faceUpCards.length < 1) {
    if (targetStation.deck.length > 0) {
      targetStation.faceUpCards.push(targetStation.deck.shift()!);
    } else if (targetStation.discard.length > 0) {
      targetStation.deck = [...targetStation.discard];
      targetStation.discard = [];
      targetStation.faceUpCards.push(targetStation.deck.shift()!);
    } else {
      break;
    }
  }

  // Add drafted cards to player hand
  player.hand.push(...draftedCards);
  stations[stationId] = targetStation;

  // Keep conveyor synchronized with the 6 stations' primary cards
  const stationOrder: IngredientStationId[] = [
    'grain',
    'hops',
    'yeast',
    'chocolate',
    'spices',
    'fruit',
  ];
  const conveyorMarket: ConveyorSlot[] = stationOrder.map((sId) => ({
    ingredient: stations[sId]?.faceUpCards[0] || state.conveyorMarket[0]?.ingredient || player.hand[0],
    skippedCards: [],
  }));

  const cardNames = draftedCards.map((c) => c.name).join(', ');
  const logs = addLog(
    state.logs,
    state.turnNumber,
    player,
    'WORK_DAY',
    `Placed Brewer at ${targetStation.name} and collected ${draftedCards.length} card(s): [${cardNames}]. Station locked for Round ${state.roundNumber}!`
  );

  return finishWorkDayAction({
    ...state,
    players,
    ingredientStations: stations,
    conveyorMarket,
    logs,
  });
}

/**
 * Action A: Source Raw Ingredients
 * Drafts `getPlayerSourceDrawCount(player)` ingredients (default 2, or more with Malt Mill)
 * and transitions to DISCARD (if hand limit exceeded) or advances turn.
 */
export function performSourceAction(
  state: GameState,
  choices: SourcePickChoice[]
): GameState {
  if (state.phase !== 'WORK_DAY') return state;

  if (choices.length > 0 && choices[0].stationId) {
    return performWorkerSourceAction(
      state,
      choices[0].stationId,
      choices[0].draftCardIds
    );
  }

  let nextState = state;
  const maxPicks = getPlayerSourceDrawCount(state.players[state.currentPlayerIndex]);
  const effectiveChoices = choices.slice(0, maxPicks);

  for (const choice of effectiveChoices) {
    nextState = performSourceSinglePick(nextState, choice);
  }

  return finishWorkDayAction(nextState);
}

/**
 * Checks whether an upgrade slot/location on the player board is already occupied.
 * Each location (Zone 1-4 Top/Equipment, Zone 1-4 Bottom/Staff, Left Wing, Right Wing)
 * can hold at most ONE upgrade.
 */
export function isUpgradeLocationOccupied(
  player: PlayerState,
  location: 'equipment' | 'staff' | 'leftWing' | 'rightWing',
  targetZoneId: ZoneId = 1
): boolean {
  if (location === 'leftWing') {
    return Boolean(player.leftWing && player.leftWing.length >= 1);
  }
  if (location === 'rightWing') {
    return Boolean(player.rightWing && player.rightWing.length >= 1);
  }
  if (location === 'equipment') {
    return Boolean(player.zones[targetZoneId]?.equipment?.length >= 1);
  }
  if (location === 'staff') {
    return Boolean(player.zones[targetZoneId]?.staff?.length >= 1);
  }
  return false;
}

/**
 * Checks if a player can afford an UpgradeCard using ingredients in their hand.
 * Supports choosing between top/bottom (equipment/staff) or left/right (universal wings).
 */
export function canAffordUpgrade(
  player: PlayerState,
  upgrade: UpgradeCard,
  selectedHandCardIds?: string[],
  chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing'
): {
  canAfford: boolean;
  validHandCardIds: string[];
  reason?: string;
  chosenHalf?: 'equipment' | 'staff' | 'leftWing' | 'rightWing';
} {
  if (!upgrade) {
    return {
      canAfford: false,
      validHandCardIds: [],
      reason: 'No upgrade card provided.',
      chosenHalf: chosenOption || 'equipment',
    };
  }

  // Dedicated equipment and staff cards require specific ingredient tokens matching the card
  const isDedicatedStaff = upgrade.cardKind === 'staff' || upgrade.type === 'staff';
  const isDedicatedEquipment = upgrade.cardKind === 'equipment' || upgrade.type === 'equipment';
  const isDedicated = isDedicatedStaff || isDedicatedEquipment;
  if (isDedicated) {
    if (isDedicatedStaff && chosenOption && chosenOption !== 'staff') {
      return {
        canAfford: false,
        validHandCardIds: [],
        reason: 'Staff cards must be hired into the Staff slot under the board.',
        chosenHalf: 'staff',
      };
    }
    if (isDedicatedEquipment && chosenOption && chosenOption !== 'equipment') {
      return {
        canAfford: false,
        validHandCardIds: [],
        reason: 'Equipment cards must be installed into the Equipment slot on top of the board.',
        chosenHalf: 'equipment',
      };
    }
    const tokens = player.tokens || { grain: 0, hops: 0, yeast: 0, chocolate: 0, spices: 0, fruit: 0 };
    const totalTokens = Object.values(tokens).reduce((sum, n) => sum + (n || 0), 0);
    const chosenHalf: 'equipment' | 'staff' = isDedicatedStaff ? 'staff' : 'equipment';
    const targetZone: ZoneId = (
      chosenHalf === 'equipment'
        ? (upgrade.equipment?.targetZone ?? upgrade.targetZone ?? 1)
        : (upgrade.staff?.targetZone ?? upgrade.targetZone ?? 1)
    ) as ZoneId;

    if (isUpgradeLocationOccupied(player, chosenHalf, targetZone)) {
      const zoneName =
        targetZone === 1
          ? 'Warehouse'
          : targetZone === 2
          ? 'Brewhouse Kettle'
          : targetZone === 3
          ? 'Cellar'
          : targetZone === 4
          ? 'Packaging / Taproom'
          : targetZone === 5
          ? 'Loading Dock'
          : `Zone ${targetZone}`;
      const slotLabel = chosenHalf === 'equipment' ? 'Equipment' : 'Staff';
      return {
        canAfford: false,
        validHandCardIds: [],
        reason: `Zone ${targetZone} (${zoneName}) already has ${chosenHalf === 'equipment' ? 'an' : 'a'} ${slotLabel} upgrade (1 max per area).`,
        chosenHalf,
      };
    }

    const required: Partial<Record<IngredientTaxonomy, number>> = {};
    if (upgrade.installTokens) {
      for (const [k, v] of Object.entries(upgrade.installTokens)) {
        if (k !== 'any' && (v || 0) > 0) {
          required[k as IngredientTaxonomy] = v;
        }
      }
    }

    // Equipment discount: Rotary Canning Line saves 1 Grain when installing Equipment
    if (
      chosenHalf === 'equipment' &&
      (hasUpgradeInstalled(player, 'Rotary Canning Line') ||
        hasUpgradeInstalled(player, 'pay_1_less_grain_install_equipment'))
    ) {
      if (required.grain && required.grain > 0) {
        required.grain = Math.max(0, required.grain - 1);
      }
    }

    if (Object.keys(required).length > 0) {
      for (const [tax, count] of Object.entries(required)) {
        const needed = count || 0;
        const available = tokens[tax as IngredientTaxonomy] || 0;
        if (available < needed) {
          return {
            canAfford: false,
            validHandCardIds: [],
            reason: `Requires ${needed} ${tax.toUpperCase()} (have ${available}).`,
            chosenHalf,
          };
        }
      }
    } else {
      const anyCount = upgrade.installTokens?.any || 1;
      if (totalTokens < anyCount) {
        return {
          canAfford: false,
          validHandCardIds: [],
          reason: `Requires at least ${anyCount} ingredient token${anyCount > 1 ? 's' : ''} to build/hire.`,
          chosenHalf,
        };
      }
    }

    return {
      canAfford: true,
      validHandCardIds: [],
      chosenHalf,
    };
  }
  const doesCardMatchSubtype = (
    card: IngredientCard,
    subtype: IngredientSubtype
  ): boolean => {
    return doesCardMatchRequirement(card, subtype);
  };

  const doesCardMatchCategory = (
    card: IngredientCard,
    cat: IngredientCategory
  ): boolean => {
    if (card.category === cat) return true;
    if (cat === 'malt' && (card.taxonomy === 'grain' || card.subtype === 'base_malt' || card.subtype === 'specialty_grain')) return true;
    if (cat === 'hops' && (card.taxonomy === 'hops' || card.category === 'hops')) return true;
    if (cat === 'yeast' && (card.taxonomy === 'yeast' || card.category === 'yeast')) return true;
    if (card.isWildcard) return true;
    return false;
  };

  function findMatchingSubtypeAssignment(
    reqs: IngredientSubtype[],
    pool: IngredientCard[]
  ): string[] | null {
    if (reqs.length === 0) return [];
    const [firstReq, ...restReqs] = reqs;

    const sortedPool = [...pool].sort((a, b) => {
      const aWild = a.isWildcard ? 1 : 0;
      const bWild = b.isWildcard ? 1 : 0;
      return aWild - bWild;
    });

    for (let i = 0; i < sortedPool.length; i++) {
      const candidate = sortedPool[i];
      if (doesCardMatchSubtype(candidate, firstReq)) {
        const remainingPool = sortedPool.filter((_, idx) => idx !== i);
        const subResult = findMatchingSubtypeAssignment(restReqs, remainingPool);
        if (subResult !== null) {
          return [candidate.id, ...subResult];
        }
      }
    }
    return null;
  }

  function findMatchingCategoryAssignment(
    reqs: IngredientCategory[],
    pool: IngredientCard[]
  ): string[] | null {
    if (reqs.length === 0) return [];
    const [firstReq, ...restReqs] = reqs;

    const sortedPool = [...pool].sort((a, b) => {
      const aWild = a.isWildcard ? 1 : 0;
      const bWild = b.isWildcard ? 1 : 0;
      return aWild - bWild;
    });

    for (let i = 0; i < sortedPool.length; i++) {
      const candidate = sortedPool[i];
      if (doesCardMatchCategory(candidate, firstReq)) {
        const remainingPool = sortedPool.filter((_, idx) => idx !== i);
        const subResult = findMatchingCategoryAssignment(restReqs, remainingPool);
        if (subResult !== null) {
          return [candidate.id, ...subResult];
        }
      }
    }
    return null;
  }

  const upgradeDiscount = countUpgradeEffect(player, 'upgrade_cost_discount_1');

  // If a specific half was chosen, validate that half
  if (chosenOption) {
    const opt =
      chosenOption === 'equipment'
        ? upgrade.equipment
        : chosenOption === 'staff'
        ? upgrade.staff
        : chosenOption === 'leftWing'
        ? upgrade.leftWing
        : upgrade.rightWing;

    const targetZone: ZoneId = (opt?.targetZone ?? upgrade.targetZone ?? 1) as ZoneId;

    // RULE: Only 1 upgrade may be built in any location (Zone 1-4 Top/Bottom, Left/Right Wing)
    if (isUpgradeLocationOccupied(player, chosenOption, targetZone)) {
      const locationLabel =
        chosenOption === 'leftWing'
          ? 'Left Wing (Operations)'
          : chosenOption === 'rightWing'
          ? 'Right Wing (Distribution)'
          : chosenOption === 'equipment'
          ? `Zone ${targetZone} Equipment (Top)`
          : `Zone ${targetZone} Staff (Bottom)`;
      return {
        canAfford: false,
        validHandCardIds: [],
        reason: `${locationLabel} is already occupied (1 upgrade per location).`,
        chosenHalf: chosenOption,
      };
    }

    const costSubtypes = opt?.costSubtypes || upgrade.costSubtypes;
    let reqSubtypes = costSubtypes ? [...costSubtypes] : undefined;
    let reqCategories = opt?.costCategories ? [...opt.costCategories] : upgrade.costCategories ? [...upgrade.costCategories] : [];

    // Apply upgrade_cost_discount_1: discount by 1 ingredient
    if (upgradeDiscount > 0) {
      if (reqSubtypes && reqSubtypes.length > 0) {
        reqSubtypes = reqSubtypes.slice(0, Math.max(0, reqSubtypes.length - upgradeDiscount));
      } else if (reqCategories.length > 0) {
        reqCategories = reqCategories.slice(0, Math.max(0, reqCategories.length - upgradeDiscount));
      }
    }

    if (selectedHandCardIds && selectedHandCardIds.length > 0) {
      const selectedCards = selectedHandCardIds
        .map((id) => player.hand.find((c) => c.id === id))
        .filter((c): c is IngredientCard => Boolean(c));

      const reqLen = reqSubtypes ? reqSubtypes.length : reqCategories.length;
      if (selectedCards.length < reqLen) {
        return {
          canAfford: false,
          validHandCardIds: [],
          reason: `Select ${reqLen} matching cards.`,
          chosenHalf: chosenOption,
        };
      }

      const match = reqSubtypes
        ? findMatchingSubtypeAssignment(reqSubtypes, selectedCards)
        : findMatchingCategoryAssignment(reqCategories, selectedCards);

      if (!match) {
        return {
          canAfford: false,
          validHandCardIds: [],
          reason: `Selected cards do not match required cost.`,
          chosenHalf: chosenOption,
        };
      }

      return { canAfford: true, validHandCardIds: match, chosenHalf: chosenOption };
    }

    const autoMatch = reqSubtypes
      ? findMatchingSubtypeAssignment(reqSubtypes, player.hand)
      : findMatchingCategoryAssignment(reqCategories, player.hand);

    if (!autoMatch) {
      const reqLabels = reqSubtypes ? reqSubtypes.join(', ') : reqCategories.join(', ');
      return {
        canAfford: false,
        validHandCardIds: [],
        reason: `Insufficient ingredients in hand (Requires: ${reqLabels}).`,
        chosenHalf: chosenOption,
      };
    }

    return { canAfford: true, validHandCardIds: autoMatch, chosenHalf: chosenOption };
  }

  // If chosenOption was not explicitly specified, try available halves whose locations are not occupied
  if (upgrade.isUniversalWing) {
    let leftRes: ReturnType<typeof canAffordUpgrade> | undefined;
    let rightRes: ReturnType<typeof canAffordUpgrade> | undefined;

    if (upgrade.leftWing) {
      leftRes = canAffordUpgrade(player, upgrade, selectedHandCardIds, 'leftWing');
      if (leftRes.canAfford) return leftRes;
    }
    if (upgrade.rightWing) {
      rightRes = canAffordUpgrade(player, upgrade, selectedHandCardIds, 'rightWing');
      if (rightRes.canAfford) return rightRes;
    }
    return {
      canAfford: false,
      validHandCardIds: [],
      reason: leftRes?.reason || rightRes?.reason || 'Wing locations are already occupied (1 upgrade per location).',
    };
  }

  if (upgrade.equipment || upgrade.staff) {
    let eqRes: ReturnType<typeof canAffordUpgrade> | undefined;
    let stRes: ReturnType<typeof canAffordUpgrade> | undefined;

    if (upgrade.equipment) {
      eqRes = canAffordUpgrade(player, upgrade, selectedHandCardIds, 'equipment');
      if (eqRes.canAfford) return eqRes;
    }
    if (upgrade.staff) {
      stRes = canAffordUpgrade(player, upgrade, selectedHandCardIds, 'staff');
      if (stRes.canAfford) return stRes;
    }
    return {
      canAfford: false,
      validHandCardIds: [],
      reason: eqRes?.reason || stRes?.reason || 'Upgrade locations are already occupied (1 upgrade per location).',
    };
  }

  // Legacy fallback
  const costSubtypes = upgrade.costSubtypes;
  let reqSubtypes = costSubtypes ? [...costSubtypes] : undefined;
  let reqCategories = upgrade.costCategories ? [...upgrade.costCategories] : [];
  if (upgradeDiscount > 0) {
    if (reqSubtypes && reqSubtypes.length > 0) {
      reqSubtypes = reqSubtypes.slice(0, Math.max(0, reqSubtypes.length - upgradeDiscount));
    } else if (reqCategories.length > 0) {
      reqCategories = reqCategories.slice(0, Math.max(0, reqCategories.length - upgradeDiscount));
    }
  }

  const autoMatch = reqSubtypes
    ? findMatchingSubtypeAssignment(reqSubtypes, player.hand)
    : findMatchingCategoryAssignment(reqCategories, player.hand);

  if (!autoMatch) {
    return {
      canAfford: false,
      validHandCardIds: [],
      reason: `Insufficient ingredients in hand.`,
    };
  }
  return { canAfford: true, validHandCardIds: autoMatch };
}

function refillTaproomSlotAndCheckFlush(
  taproomMarket: TaproomCard[],
  taproomDeck: TaproomCard[],
  taproomDiscard: TaproomCard[],
  draftedSlotIndex: number,
  turnNumber: number,
  player: PlayerState,
  logs: LogEntry[]
): {
  taproomMarket: TaproomCard[];
  taproomDeck: TaproomCard[];
  taproomDiscard: TaproomCard[];
  lastMarketFlushEvent: MarketFlushEvent | null;
  recipeDeck: RecipeCard[];
  pubMarket: RecipeCard[];
  upgradeDeck: UpgradeCard[];
  shopMarket: UpgradeCard[];
  logs: LogEntry[];
} {
  let nextMarket = [...taproomMarket];
  let nextDeck = [...taproomDeck];
  let nextDiscard = [...taproomDiscard];
  let nextLogs = [...logs];

  nextMarket.splice(draftedSlotIndex, 1);
  const drawn = drawFromTaproomDeck(nextDeck, nextDiscard);
  nextDeck = drawn.deck;
  nextDiscard = drawn.discard;
  if (drawn.card) {
    nextMarket.splice(draftedSlotIndex, 0, drawn.card);
  }

  const flushResult = checkAndExecuteTaproomFlush(
    nextMarket,
    nextDeck,
    nextDiscard,
    turnNumber
  );

  if (flushResult.flushEvent) {
    const reasonLabel =
      flushResult.flushEvent.reason === 'NO_RECIPES'
        ? '0 Recipes on Tap'
        : '0 Upgrades on Offer';
    nextLogs = addLog(
      nextLogs,
      turnNumber,
      player,
      'WORK_DAY',
      `🔄 TAPROOM MARKET FLUSH (${reasonLabel})! Discarded 6 monochrome cards and dealt 6 fresh Taproom Offers.`
    );
  }

  const derived = deriveFilteredTaproomArrays(
    flushResult.taproomDeck,
    flushResult.taproomMarket
  );

  return {
    taproomMarket: flushResult.taproomMarket,
    taproomDeck: flushResult.taproomDeck,
    taproomDiscard: flushResult.taproomDiscard,
    lastMarketFlushEvent: flushResult.flushEvent,
    ...derived,
    logs: nextLogs,
  };
}

/**
 * Action B: Invest in Brewery (Buy Equipment, Hire Staff, or Extend Universal Wings)
 * - Equipment is mounted ON TOP of Zone (1-4) (1.25" tuck)
 * - Staff is tucked UNDER Zone (1-4) (1.25" tuck)
 * - Left Wing is tucked UNDER Zone 1 Left Edge (1.25" tuck)
 * - Right Wing is tucked UNDER Zone 4 Right Edge (1.25" tuck)
 * Zero mid-game VP tracking (pure engine building acceleration!).
 */
export function performInvestAction(
  state: GameState,
  marketIndex: number,
  paymentHandCardIds?: string[],
  installAs?: 'equipment' | 'staff' | 'leftWing' | 'rightWing'
): GameState {
  if (state.phase !== 'WORK_DAY') return state;

  // Resolve upgrade card from breweryMarket, shopMarket, or taproomMarket
  let upgrade: UpgradeCard | undefined;
  let slotInBreweryMarket = -1;

  if (state.breweryMarket && state.breweryMarket[marketIndex]?.deckType === 'upgrade') {
    upgrade = state.breweryMarket[marketIndex] as UpgradeCard;
    slotInBreweryMarket = marketIndex;
  } else if (state.shopMarket && state.shopMarket[marketIndex]) {
    upgrade = state.shopMarket[marketIndex];
    if (state.breweryMarket) {
      slotInBreweryMarket = state.breweryMarket.findIndex((c) => c.id === upgrade?.id);
    }
  } else if (state.taproomMarket && state.taproomMarket[marketIndex]?.deckType === 'upgrade') {
    upgrade = state.taproomMarket[marketIndex] as UpgradeCard;
    if (state.breweryMarket) {
      slotInBreweryMarket = state.breweryMarket.findIndex((c) => c.id === upgrade?.id);
    }
  }

  if (!upgrade) return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];

  const check = canAffordUpgrade(player, upgrade, paymentHandCardIds, installAs);
  if (!check.canAfford) return state;

  const finalInstallAs: 'equipment' | 'staff' | 'leftWing' | 'rightWing' =
    upgrade.cardKind === 'staff' || upgrade.type === 'staff'
      ? 'staff'
      : upgrade.cardKind === 'equipment' || upgrade.type === 'equipment'
      ? 'equipment'
      : installAs || check.chosenHalf || (upgrade.isUniversalWing ? 'leftWing' : 'equipment');

  // Hard safety check: ensure the location is not already occupied (1 upgrade per location)
  const targetZoneCheck: ZoneId = (
    finalInstallAs === 'equipment'
      ? (upgrade.equipment?.targetZone ?? upgrade.targetZone ?? 1)
      : finalInstallAs === 'staff'
      ? (upgrade.staff?.targetZone ?? upgrade.targetZone ?? 1)
      : 1
  ) as ZoneId;

  if (isUpgradeLocationOccupied(player, finalInstallAs, targetZoneCheck)) {
    return state;
  }

  const ingredientDiscard = [...state.ingredientDiscard];
  for (const cardId of check.validHandCardIds) {
    const idx = player.hand.findIndex((c) => c.id === cardId);
    if (idx !== -1) {
      ingredientDiscard.push(player.hand.splice(idx, 1)[0]);
    }
  }

  // Clone installed upgrade card with chosen half and VP
  const vpAward = upgrade.bonusEndgameVp || (Object.values(upgrade.installTokens || {}).reduce((s, n) => s + (n || 0), 0) >= 2 ? 2 : 1);
  const installedCard: UpgradeCard = {
    ...upgrade,
    installedAs: finalInstallAs,
    bonusEndgameVp: vpAward,
  };

  let placementLabel = '';

  if (finalInstallAs === 'leftWing') {
    installedCard.installedOption = upgrade.leftWing;
    installedCard.effectKey = upgrade.leftWing?.effectKey;
    installedCard.effectText = upgrade.leftWing?.effectText;
    if (!player.leftWing) player.leftWing = [];
    player.leftWing.push(installedCard);
    placementLabel = `installed Operations Wing under Zone 1 Left Edge`;
  } else if (finalInstallAs === 'rightWing') {
    installedCard.installedOption = upgrade.rightWing;
    installedCard.effectKey = upgrade.rightWing?.effectKey;
    installedCard.effectText = upgrade.rightWing?.effectText;
    if (!player.rightWing) player.rightWing = [];
    player.rightWing.push(installedCard);
    placementLabel = `installed Distribution Wing under Zone 4 Right Edge`;
  } else if (finalInstallAs === 'equipment') {
    const targetZone = upgrade.equipment?.targetZone ?? upgrade.targetZone ?? 1;
    installedCard.installedOption = upgrade.equipment;
    installedCard.effectKey = upgrade.equipment?.effectKey ?? upgrade.effectKey;
    installedCard.effectText = upgrade.equipment?.effectText ?? upgrade.effectText;
    player.zones[targetZone].equipment.push(installedCard);
    placementLabel = `installed Equipment ON TOP of Zone ${targetZone}`;
  } else {
    const targetZone = upgrade.staff?.targetZone ?? upgrade.targetZone ?? 1;
    installedCard.installedOption = upgrade.staff;
    installedCard.effectKey = upgrade.staff?.effectKey ?? upgrade.effectKey;
    installedCard.effectText = upgrade.staff?.effectText ?? upgrade.effectText;
    player.zones[targetZone].staff.push(installedCard);
    placementLabel = `hired Staff tucked UNDER Zone ${targetZone}`;
  }

  // Award static VP upon installing/hiring upgrade
  player.scoreBreakdown.upgradeStaticVp += vpAward;
  player.score += vpAward;

  const logsWithInvest = addLog(
    state.logs,
    state.turnNumber,
    player,
    'WORK_DAY',
    `Invested in ${upgrade.name} (${placementLabel}).`
  );

  // Refill master brewery market (Row 2: 6 slots) and check for market flush
  const refill = refillTaproomSlotAndCheckFlush(
    state.breweryMarket?.length ? state.breweryMarket : state.taproomMarket,
    state.breweryDeck?.length ? state.breweryDeck : state.taproomDeck,
    state.breweryDiscard || state.taproomDiscard || [],
    slotInBreweryMarket !== -1 ? slotInBreweryMarket : marketIndex,
    state.turnNumber,
    player,
    logsWithInvest
  );

  return finishWorkDayAction({
    ...state,
    players,
    ingredientDiscard,
    breweryDeck: refill.taproomDeck,
    breweryDiscard: refill.taproomDiscard,
    breweryMarket: refill.taproomMarket,
    shopMarket: refill.shopMarket,
    pubMarket: refill.pubMarket,
    taproomMarket: refill.taproomMarket,
    taproomDeck: refill.taproomDeck,
    taproomDiscard: refill.taproomDiscard,
    lastMarketFlushEvent: refill.lastMarketFlushEvent ?? state.lastMarketFlushEvent,
    logs: refill.logs,
  });
}

/**
 * Checks whether an ingredient card in hand satisfies a recipe or upgrade requirement.
 * Fully supports the Master 6-Color System (Grain, Hops, Yeast, Fruit, Spices, Chocolate)
 * and specific botanical subtypes.
 */
export function doesCardMatchRequirement(
  card: IngredientCard,
  req: IngredientSubtype
): boolean {
  if (card.isWildcard) return true;
  if (card.subtype === req) return true;
  if (card.taxonomy && card.taxonomy === req) return true;

  // 6-Color System taxonomy mappings (Staples & Specialties):
  if (req === 'grain' || req === 'base_malt' || req === 'specialty_grain') {
    return (
      card.subtype === 'base_malt' ||
      card.subtype === 'specialty_grain' ||
      card.subtype === 'grain' ||
      card.taxonomy === 'grain' ||
      (card.category === 'malt' && card.subtype !== 'dark_roasted_malt' && card.taxonomy !== 'chocolate')
    );
  }
  if (
    req === 'hops' ||
    req === 'bittering_hops' ||
    req === 'aroma_hops' ||
    req === 'noble_hops' ||
    req === 'fresh_wet_hops'
  ) {
    return (
      card.subtype === 'bittering_hops' ||
      card.subtype === 'aroma_hops' ||
      card.subtype === 'noble_hops' ||
      card.subtype === 'fresh_wet_hops' ||
      card.subtype === 'hops' ||
      card.taxonomy === 'hops' ||
      card.category === 'hops'
    );
  }
  if (req === 'yeast' || req === 'house_yeast') {
    return (
      card.subtype === 'house_yeast' ||
      card.subtype === 'yeast' ||
      card.taxonomy === 'yeast' ||
      card.category === 'yeast'
    );
  }
  if (req === 'fruit' || req === 'local_raspberries') {
    return (
      card.subtype === 'local_raspberries' ||
      card.subtype === 'fruit' ||
      card.taxonomy === 'fruit'
    );
  }
  if (req === 'spices' || req === 'winter_spices') {
    return (
      card.subtype === 'winter_spices' ||
      card.subtype === 'spices' ||
      card.taxonomy === 'spices'
    );
  }
  if (req === 'chocolate' || req === 'dark_roasted_malt') {
    return (
      card.subtype === 'dark_roasted_malt' ||
      card.subtype === 'chocolate' ||
      card.taxonomy === 'chocolate'
    );
  }

  return false;
}

/**
 * Computes effective required ingredient subtypes for a Recipe after applying a player's Zone 2/3 discounts.
 */
export function getEffectiveRecipeRequirements(
  player: PlayerState,
  recipe: RecipeCard
): {
  effectiveSubtypes: IngredientSubtype[];
  wildcardSubstitutionsAllowed: number;
} {
  const reqs = [...recipe.requiredIngredients];

  // 1. Copper Mash Tun: reduce recipe cost by 1 Grain
  // Rule: "When brewing a recipe requiring 2 or more Grain, reduce the Grain cost by 1 (minimum 1 paid)."
  const maltDiscounts = countUpgradeEffect(player, 'kettle_discount_malt');
  for (let i = 0; i < maltDiscounts; i++) {
    const grainCount = reqs.filter(
      (r) => r === 'grain' || r === 'base_malt' || r === 'specialty_grain'
    ).length;
    if (grainCount >= 2) {
      const idx = reqs.findIndex(
        (r) => r === 'grain' || r === 'base_malt' || r === 'specialty_grain'
      );
      if (idx !== -1) {
        reqs.splice(idx, 1);
      }
    }
  }

  // 2. Plate Heat Exchanger / Yeast discount:
  // Rule: "When brewing a recipe requiring 2 or more Yeast, reduce the Yeast cost by 1 (minimum 1 paid)."
  const yeastDiscounts =
    countUpgradeEffect(player, 'kettle_discount_yeast') +
    countUpgradeEffect(player, 'yeast_propagation');
  for (let i = 0; i < yeastDiscounts; i++) {
    const yeastCount = reqs.filter((r) => r === 'yeast' || r === 'house_yeast').length;
    if (yeastCount >= 2) {
      const idx = reqs.findIndex((r) => r === 'yeast' || r === 'house_yeast');
      if (idx !== -1) {
        reqs.splice(idx, 1);
      }
    }
  }

  // 3. Stainless Hop Back:
  // Rule: "When brewing a recipe requiring 2 or more Hops, reduce the Hops cost by 1 (minimum 1 paid)."
  const hopDiscounts = countUpgradeEffect(player, 'kettle_discount_hops');
  const hopSubtypes: IngredientSubtype[] = [
    'hops',
    'bittering_hops',
    'aroma_hops',
    'noble_hops',
    'fresh_wet_hops',
  ];
  for (let i = 0; i < hopDiscounts; i++) {
    const hopCount = reqs.filter((r) => hopSubtypes.includes(r)).length;
    if (hopCount >= 2) {
      let hopIdx = reqs.findIndex(
        (r) =>
          hopSubtypes.includes(r) && !player.hand.some((h) => doesCardMatchRequirement(h, r))
      );
      if (hopIdx === -1) {
        hopIdx = reqs.findIndex((r) => hopSubtypes.includes(r));
      }
      if (hopIdx !== -1) {
        reqs.splice(hopIdx, 1);
      }
    }
  }

  const wildcardSubstitutionsAllowed = countUpgradeEffect(
    player,
    'sean_hoyne_master_brewer'
  );

  return {
    effectiveSubtypes: reqs,
    wildcardSubstitutionsAllowed,
  };
}

/**
 * Checks whether a player can brew a RecipeCard right now (Kettle/Carboy capacity + Ingredients in hand).
 */
export function canAffordRecipe(
  player: PlayerState,
  recipe: RecipeCard,
  selectedHandCardIds?: string[]
): { canAfford: boolean; validHandCardIds: string[]; reason?: string } {
  const kettleCap = getPlayerKettleCapacity(player);
  const carboyCap = getPlayerCarboyCapacity(player);
  const hasFastFerment =
    recipe.tier === 6 && countUpgradeEffect(player, 'fast_ferment') > 0;

  const canEnterWarehouse = player.zones[1].recipes.length < 1;
  const canEnterCarboyDirect =
    hasFastFerment && player.zones[3].recipes.length < carboyCap;

  if (!canEnterWarehouse && !canEnterCarboyDirect) {
    return {
      canAfford: false,
      validHandCardIds: [],
      reason: 'Zone 1 (Warehouse Staging) is full! Wait for Shift Slide to advance batches.',
    };
  }

  const { effectiveSubtypes, wildcardSubstitutionsAllowed } =
    getEffectiveRecipeRequirements(player, recipe);

  const candidatePool =
    selectedHandCardIds && selectedHandCardIds.length > 0
      ? selectedHandCardIds
          .map((id) => player.hand.find((c) => c.id === id))
          .filter((c): c is IngredientCard => Boolean(c))
      : [...player.hand];

  if (candidatePool.length < effectiveSubtypes.length) {
    return {
      canAfford: false,
      validHandCardIds: [],
      reason: `Need ${effectiveSubtypes.length} ingredients to brew ${recipe.name}.`,
    };
  }

  // Match ingredients using the 6-Color System & Taxonomy
  const remainingReqs = [...effectiveSubtypes];
  const remainingCards = [...candidatePool];
  const chosenIds: string[] = [];

  // Pass 1: Match exact non-wildcard cards
  for (let i = remainingReqs.length - 1; i >= 0; i--) {
    const reqSubtype = remainingReqs[i];
    const cardIdx = remainingCards.findIndex(
      (c) => doesCardMatchRequirement(c, reqSubtype) && !c.isWildcard
    );
    if (cardIdx !== -1) {
      chosenIds.push(remainingCards[cardIdx].id);
      remainingCards.splice(cardIdx, 1);
      remainingReqs.splice(i, 1);
    }
  }

  // Pass 2: Allow explicit wildcards (if any) to satisfy remaining requirements
  for (let i = remainingReqs.length - 1; i >= 0; i--) {
    const wildCardIdx = remainingCards.findIndex((c) => c.isWildcard);
    if (wildCardIdx !== -1) {
      chosenIds.push(remainingCards[wildCardIdx].id);
      remainingCards.splice(wildCardIdx, 1);
      remainingReqs.splice(i, 1);
    }
  }

  // Pass 3: Any remaining unmatched requirements can be covered by Sean Hoyne Master Brewer wildcards
  if (remainingReqs.length > wildcardSubstitutionsAllowed) {
    return {
      canAfford: false,
      validHandCardIds: [],
      reason: `Missing required ingredients: ${remainingReqs.join(', ')}.`,
    };
  }

  if (remainingCards.length < remainingReqs.length) {
    return {
      canAfford: false,
      validHandCardIds: [],
      reason: 'Not enough cards in hand to substitute for missing ingredients.',
    };
  }

  // Pick common staple cards first (1 VP) when using Sean Hoyne wildcard substitution
  remainingCards.sort((a, b) => {
    const aVal = a.vpValue ?? 1;
    const bVal = b.vpValue ?? 1;
    return aVal - bVal;
  });

  for (let i = 0; i < remainingReqs.length; i++) {
    chosenIds.push(remainingCards[i].id);
  }

  return {
    canAfford: true,
    validHandCardIds: chosenIds,
  };
}

/**
 * Action C: Brew a Recipe
 * Spends required ingredients, places recipe in Zone 2 (or Zone 3 if Fast Ferment applies),
 * triggers Assistant Brewer draw if applicable, and refills Taproom Market (with Market Flush check).
 */
export function performBrewAction(
  state: GameState,
  pubIndex: number,
  paymentHandCardIds?: string[]
): GameState {
  if (state.phase !== 'WORK_DAY') return state;

  let recipe: RecipeCard | undefined;
  let slotInBreweryMarket = -1;

  if (state.breweryMarket && state.breweryMarket[pubIndex]?.deckType === 'recipe') {
    recipe = state.breweryMarket[pubIndex] as RecipeCard;
    slotInBreweryMarket = pubIndex;
  } else if (state.pubMarket && state.pubMarket[pubIndex]) {
    recipe = state.pubMarket[pubIndex];
    if (state.breweryMarket) {
      slotInBreweryMarket = state.breweryMarket.findIndex((c) => c.id === recipe?.id);
    }
  } else if (state.taproomMarket && state.taproomMarket[pubIndex]?.deckType === 'recipe') {
    recipe = state.taproomMarket[pubIndex] as RecipeCard;
    if (state.breweryMarket) {
      slotInBreweryMarket = state.breweryMarket.findIndex((c) => c.id === recipe?.id);
    }
  }

  if (!recipe) return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];

  const check = canAffordRecipe(player, recipe, paymentHandCardIds);
  if (!check.canAfford) return state;

  let ingredientDeck = [...state.ingredientDeck];
  let ingredientDiscard = [...state.ingredientDiscard];

  // Spend ingredients from hand
  for (const id of check.validHandCardIds) {
    const idx = player.hand.findIndex((c) => c.id === id);
    if (idx !== -1) {
      ingredientDiscard.push(player.hand.splice(idx, 1)[0]);
    }
  }

  // Determine destination zone (Zone 3 if Tier 1 + Fast Ferment + Carboy space, else Zone 2)
  const carboyCap = getPlayerCarboyCapacity(player);
  const goDirectToCarboy =
    recipe.tier === 6 &&
    countUpgradeEffect(player, 'fast_ferment') > 0 &&
    player.zones[3].recipes.length < carboyCap;

  const targetZoneId: ZoneId = goDirectToCarboy ? 3 : 1;
  player.zones[targetZoneId].recipes.push(recipe);

  // Trigger Assistant Brewer ('source_on_brew')
  const brewDrawCount = countUpgradeEffect(player, 'source_on_brew');
  for (let i = 0; i < brewDrawCount; i++) {
    const drawn = drawFromIngredientDeck(ingredientDeck, ingredientDiscard);
    ingredientDeck = drawn.deck;
    ingredientDiscard = drawn.discard;
    if (drawn.card) {
      player.hand.push(drawn.card);
    }
  }

  const logsWithBrew = addLog(
    state.logs,
    state.turnNumber,
    player,
    'WORK_DAY',
    `Brewed ${recipe.name} (${recipe.tierName}, ${recipe.vp} VP) into Zone ${targetZoneId}${
      goDirectToCarboy ? ' (Fast Ferment!)' : ''
    }${brewDrawCount > 0 ? ` and drew ${brewDrawCount} card(s)` : ''}.`
  );

  // Refill master brewery market (Row 2: 6 slots) and check for market flush
  const refill = refillTaproomSlotAndCheckFlush(
    state.breweryMarket?.length ? state.breweryMarket : state.taproomMarket,
    state.breweryDeck?.length ? state.breweryDeck : state.taproomDeck,
    state.breweryDiscard || state.taproomDiscard || [],
    slotInBreweryMarket !== -1 ? slotInBreweryMarket : pubIndex,
    state.turnNumber,
    player,
    logsWithBrew
  );

  return finishWorkDayAction({
    ...state,
    players,
    ingredientDeck,
    ingredientDiscard,
    breweryDeck: refill.taproomDeck,
    breweryDiscard: refill.taproomDiscard,
    breweryMarket: refill.taproomMarket,
    pubMarket: refill.pubMarket,
    shopMarket: refill.shopMarket,
    taproomMarket: refill.taproomMarket,
    taproomDeck: refill.taproomDeck,
    taproomDiscard: refill.taproomDiscard,
    lastMarketFlushEvent: refill.lastMarketFlushEvent ?? state.lastMarketFlushEvent,
    logs: refill.logs,
  });
}

/**
 * Unified Row 2 Brewery Action (Action B/C):
 * Drafts 1 card at `taproomIndex` (0..5) from the 6-card `breweryMarket` / `taproomMarket`:
 *   - If RecipeCard: Pays matching ingredients and brews into Zone 2 (or Zone 3).
 *   - If UpgradeCard: Installs Equipment (top), hires Staff (bottom), or extends Universal Wings (sides).
 */
export function performTaproomAction(
  state: GameState,
  taproomIndex: number,
  paymentHandCardIds?: string[],
  installAs?: 'equipment' | 'staff' | 'leftWing' | 'rightWing'
): GameState {
  if (state.phase !== 'WORK_DAY') return state;
  const market = state.breweryMarket?.length ? state.breweryMarket : state.taproomMarket;
  if (taproomIndex < 0 || taproomIndex >= market.length) return state;

  const targetCard = market[taproomIndex];
  if (targetCard.deckType === 'recipe') {
    return performBrewAction(state, taproomIndex, paymentHandCardIds);
  } else {
    return performInvestAction(state, taproomIndex, paymentHandCardIds, installAs);
  }
}

/**
 * Action: Flush & Sweep Taproom Offers (Market Row 2)
 * Sweeps all 6 stale cards to discard and deals 6 fresh cards from the Taproom deck.
 * Can be triggered for free if player cannot afford any of the 6 offers, or by discarding 1 hand card.
 */
export function performManualTaproomFlush(
  state: GameState,
  costHandCardId?: string
): GameState {
  if (state.phase !== 'WORK_DAY') return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];
  const ingredientDiscard = [...state.ingredientDiscard];

  if (costHandCardId) {
    const idx = player.hand.findIndex((c) => c.id === costHandCardId);
    if (idx !== -1) {
      ingredientDiscard.push(player.hand.splice(idx, 1)[0]);
    }
  }

  const oldBreweryMarket = state.breweryMarket?.length
    ? state.breweryMarket
    : state.taproomMarket?.length
    ? state.taproomMarket
    : [...state.pubMarket, ...state.shopMarket];

  let breweryDeck = [...(state.breweryDeck || state.taproomDeck || [])];
  let breweryDiscard = [...(state.breweryDiscard || state.taproomDiscard || []), ...oldBreweryMarket];
  let upgradeDeck = [...(state.upgradeDeck || [])];
  let upgradeDiscard = [...(state.upgradeDiscard || [])];
  let recipeDeck = [...(state.recipeDeck || [])];
  let recipeDiscard = [...(state.recipeDiscard || [])];
  let rotaryBoard = state.rotaryBoard ? { ...state.rotaryBoard, slots: { ...state.rotaryBoard.slots } } : undefined;

  let newBreweryMarket: TaproomCard[] = [];

  if (rotaryBoard) {
    // Dedicated slot segregation: Slots 1 & 2 Upgrades; Slots 3-6 Recipes
    for (const s of [1, 2, 3, 4, 5, 6] as RotarySlotNumber[]) {
      if (rotaryBoard.slots[s]?.outerCard) {
        const c = rotaryBoard.slots[s].outerCard!;
        if (c.deckType === 'upgrade') upgradeDiscard.push(c);
        else recipeDiscard.push(c);
      }
    }
    const d1 = drawFromUpgradeDeck(upgradeDeck, upgradeDiscard);
    upgradeDeck = d1.deck; upgradeDiscard = d1.discard;
    rotaryBoard.slots[1] = { ...rotaryBoard.slots[1], outerCard: d1.card || null };

    const d2 = drawFromUpgradeDeck(upgradeDeck, upgradeDiscard);
    upgradeDeck = d2.deck; upgradeDiscard = d2.discard;
    rotaryBoard.slots[2] = { ...rotaryBoard.slots[2], outerCard: d2.card || null };

    for (const s of [3, 4, 5, 6] as RotarySlotNumber[]) {
      const dr = drawFromRecipeDeck(recipeDeck, recipeDiscard);
      recipeDeck = dr.deck; recipeDiscard = dr.discard;
      rotaryBoard.slots[s] = { ...rotaryBoard.slots[s], outerCard: dr.card || null };
    }

    newBreweryMarket = ([1, 2, 3, 4, 5, 6] as RotarySlotNumber[])
      .map((s) => rotaryBoard!.slots[s].outerCard)
      .filter((c): c is RecipeCard | UpgradeCard => c !== null);
    breweryDeck = [...upgradeDeck, ...recipeDeck];
    breweryDiscard = [...upgradeDiscard, ...recipeDiscard];
  } else {
    for (let i = 0; i < 6; i++) {
      const drawn = drawFromTaproomDeck(breweryDeck, breweryDiscard);
      breweryDeck = drawn.deck;
      breweryDiscard = drawn.discard;
      if (drawn.card) {
        newBreweryMarket.push(drawn.card);
      }
    }
  }

  const pubMarket = newBreweryMarket.filter((c): c is RecipeCard => c.deckType === 'recipe');
  const shopMarket = newBreweryMarket.filter((c): c is UpgradeCard => c.deckType === 'upgrade');

  const flushedCardNames = oldBreweryMarket.map((c) => c.name);

  const flushEvent: MarketFlushEvent = {
    id: `flush_manual_${state.turnNumber}_${Date.now()}`,
    turn: state.turnNumber,
    reason: 'MANUAL_SWEEP',
    flushedCardNames,
    timestamp: Date.now(),
  };

  const logs = addLog(
    state.logs,
    state.turnNumber,
    player,
    'WORK_DAY',
    `🔄 Flushed Market Offers! Swept stale offers to discard and dealt 6 fresh Brewery offers.`
  );

  return {
    ...state,
    rotaryBoard: rotaryBoard || state.rotaryBoard,
    upgradeDeck,
    upgradeDiscard,
    recipeDeck,
    recipeDiscard,
    players,
    ingredientDiscard,
    breweryMarket: newBreweryMarket,
    breweryDeck,
    breweryDiscard,
    pubMarket,
    shopMarket,
    taproomMarket: newBreweryMarket,
    taproomDeck: breweryDeck,
    taproomDiscard: breweryDiscard,
    lastMarketFlushEvent: flushEvent,
    logs,
  };
}

/**
 * Shifts the conveyor by discarding the oldest slot (#1) and feeding a new ingredient from the deck.
 * Helps prevent conveyor stagnation when players don't need any of the current face-up cards.
 */
export function performConveyorSlide(state: GameState): GameState {
  if (state.phase !== 'WORK_DAY') return state;

  const conveyorMarket = state.conveyorMarket.map((slot) => ({
    ingredient: slot.ingredient,
    skippedCards: [...slot.skippedCards],
  }));
  let ingredientDeck = [...state.ingredientDeck];
  let ingredientDiscard = [...state.ingredientDiscard];

  if (conveyorMarket.length > 0) {
    const oldest = conveyorMarket.shift()!;
    ingredientDiscard.push(oldest.ingredient, ...oldest.skippedCards);

    const replenish = drawFromIngredientDeck(ingredientDeck, ingredientDiscard);
    ingredientDeck = replenish.deck;
    ingredientDiscard = replenish.discard;
    if (replenish.card) {
      conveyorMarket.push({
        ingredient: replenish.card,
        skippedCards: [],
      });
    }
  }

  const player = state.players[state.currentPlayerIndex];
  const logs = addLog(
    state.logs,
    state.turnNumber,
    player,
    'WORK_DAY',
    `🔄 Shifted the Conveyor! Discarded oldest ingredient and fed a fresh card from the deck.`
  );

  return {
    ...state,
    conveyorMarket,
    ingredientDeck,
    ingredientDiscard,
    logs,
  };
}


function finishWorkDayAction(state: GameState): GameState {
  const player = state.players[state.currentPlayerIndex];
  const handLimit = getPlayerHandLimit(player);

  if (player.hand.length > handLimit) {
    const excess = player.hand.length - handLimit;
    const logs = addLog(
      state.logs,
      state.turnNumber,
      player,
      'DISCARD',
      `${player.name} has ${player.hand.length} ingredients (Zone 1 limit: ${handLimit}). Must discard ${excess} card(s).`
    );
    return {
      ...state,
      phase: 'DISCARD',
      logs,
    };
  }

  return advanceTurn(state);
}

/**
 * Enforces Zone 1 Grain Room storage limit by discarding excess cards and advancing the turn.
 */
export function performDiscardExcess(
  state: GameState,
  discardHandCardIds: string[]
): GameState {
  if (state.phase !== 'DISCARD') return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];
  const ingredientDiscard = [...state.ingredientDiscard];
  const handLimit = getPlayerHandLimit(player);

  if (player.hand.length <= handLimit) {
    return advanceTurn(state);
  }

  for (const id of discardHandCardIds) {
    if (player.hand.length <= handLimit) break;
    const idx = player.hand.findIndex((c) => c.id === id);
    if (idx !== -1) {
      ingredientDiscard.push(player.hand.splice(idx, 1)[0]);
    }
  }

  // If still above handLimit, discard from the front until compliant
  while (player.hand.length > handLimit) {
    ingredientDiscard.push(player.hand.shift()!);
  }

  const logs = addLog(
    state.logs,
    state.turnNumber,
    player,
    'DISCARD',
    `Discarded down to Zone 1 Hand Limit (${handLimit} cards).`
  );

  return advanceTurn({
    ...state,
    players,
    ingredientDiscard,
    logs,
  });
}

function computeWinners(players: PlayerState[]): string[] {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.zones[5].recipes.length !== a.zones[5].recipes.length) {
      return b.zones[5].recipes.length - a.zones[5].recipes.length;
    }
    return b.hand.length - a.hand.length;
  });

  const top = sorted[0];
  return sorted
    .filter(
      (p) =>
        p.score === top.score &&
        p.zones[5].recipes.length === top.zones[5].recipes.length &&
        p.hand.length === top.hand.length
    )
    .map((p) => p.id);
}

/**
 * Advances to the next player's turn.
 * If wrapping back to Player 0 and `isFinalRound` is true, ends the game and determines winners.
 */
export function advanceTurn(state: GameState): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];

  // Mandatory Warehouse Capacity Enforcement: Human players cannot advance turn while over capacity
  if (!currentPlayer.isAI) {
    const totalTokens = Object.values(currentPlayer.tokens || {}).reduce((sum, v) => sum + (v || 0), 0);
    const cap = getWarehouseCapacity(currentPlayer);
    if (totalTokens > cap) {
      return state;
    }
  }

  let isFinalRound = state.isFinalRound;
  let endgameTriggeredByPlayerId = state.endgameTriggeredByPlayerId;
  let logs = [...state.logs];

  if (
    !isFinalRound &&
    currentPlayer.zones[5].recipes.length >= state.targetBatchesToTriggerEnd
  ) {
    isFinalRound = true;
    endgameTriggeredByPlayerId = currentPlayer.id;
  }

  // Determine next player in standard clockwise rotation
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

  const wrappingToFirstPlayer = nextPlayerIndex === 0;
  const nextTurnNumber = state.turnNumber + 1;
  const nextRoundNumber = wrappingToFirstPlayer
    ? state.roundNumber + 1
    : state.roundNumber;

  if (isFinalRound && wrappingToFirstPlayer) {
    const winnerIds = computeWinners(state.players);
    const winnerNames = state.players
      .filter((p) => winnerIds.includes(p.id))
      .map((p) => `${p.name} (${p.score} VP)`)
      .join(', ');

    logs = addLog(
      logs,
      state.turnNumber,
      currentPlayer,
      'GAME_OVER',
      `🏆 CHEERS! Game Over — Winner: ${winnerNames}!`
    );

    return {
      ...state,
      phase: 'GAME_OVER',
      isFinalRound,
      endgameTriggeredByPlayerId,
      winnerIds,
      logs,
    };
  }

  // Worker Placement Round Reset: Recall all Brewer worker pieces when round rolls over
  let nextStations = state.ingredientStations;
  let nextPlayers = state.players;

  if (wrappingToFirstPlayer && state.ingredientStations) {
    const updatedStations = { ...state.ingredientStations };
    for (const key of Object.keys(updatedStations) as IngredientStationId[]) {
      updatedStations[key] = {
        ...updatedStations[key],
        occupiedByPlayerId: null,
        occupiedByPlayerName: null,
        occupiedByPlayerColor: null,
      };
    }
    nextStations = updatedStations;

    nextPlayers = state.players.map((p) => ({
      ...p,
      placedWorkerStationId: null,
    }));

    logs = addLog(
      logs,
      state.turnNumber,
      currentPlayer,
      'MORNING_SHIFT',
      `🔔 Round ${nextRoundNumber} Begins: All Brewer worker pieces recalled from the 6 ingredient stations!`
    );
  }

  return {
    ...state,
    players: nextPlayers,
    ingredientStations: nextStations,
    rotaryBoard: state.rotaryBoard,
    currentPlayerIndex: nextPlayerIndex,
    turnNumber: nextTurnNumber,
    roundNumber: nextRoundNumber,
    phase: state.phase === 'PHASE_1_WORKER_DRAFT' ? 'PHASE_1_WORKER_DRAFT' : 'MORNING_SHIFT',
    isFinalRound,
    endgameTriggeredByPlayerId,
    lastMorningShiftEvents: [],
    logs,
  };
}

// ============================================================================
// 11.5" ROTARY BOARD: WOODEN TOKEN & DISPLACEMENT RELAY MECHANICS
// ============================================================================

/**
 * Converts a recipe's effective ingredient requirements into wooden token quantities.
 */
export function getRecipeTokenRequirements(
  player: PlayerState,
  recipe: RecipeCard
): Record<IngredientTaxonomy, number> {
  const { effectiveSubtypes } = getEffectiveRecipeRequirements(player, recipe);
  const needed: Record<IngredientTaxonomy, number> = {
    grain: 0,
    hops: 0,
    yeast: 0,
    chocolate: 0,
    spices: 0,
    fruit: 0,
  };

  for (const st of effectiveSubtypes) {
    if (st === 'grain' || st === 'base_malt' || st === 'specialty_grain') {
      needed.grain += 1;
    } else if (
      st === 'hops' ||
      st === 'bittering_hops' ||
      st === 'aroma_hops' ||
      st === 'noble_hops' ||
      st === 'fresh_wet_hops'
    ) {
      needed.hops += 1;
    } else if (st === 'yeast' || st === 'house_yeast') {
      needed.yeast += 1;
    } else if (st === 'chocolate' || st === 'dark_roasted_malt') {
      needed.chocolate += 1;
    } else if (st === 'spices' || st === 'winter_spices') {
      needed.spices += 1;
    } else if (st === 'fruit' || st === 'local_raspberries') {
      needed.fruit += 1;
    }
  }

  return needed;
}

/**
 * Evaluates whether a player can afford to immediately brew a RecipeCard with their wooden tokens.
 */
export function canAffordRecipeWithTokens(
  player: PlayerState,
  recipe: RecipeCard
): {
  canAfford: boolean;
  reason?: string;
  tokenCost: Record<IngredientTaxonomy, number>;
} {
  // Batch Cap: Column 1 (Warehouse Staging) holds strictly 1 recipe card at a time (1 BBL)
  if (player.zones[1].recipes.length >= 1) {
    return {
      canAfford: false,
      reason: `Warehouse Staging is full (Batch Cap: 1 BBL). Column 1 must be empty to start a new recipe.`,
      tokenCost: { grain: 0, hops: 0, yeast: 0, chocolate: 0, spices: 0, fruit: 0 },
    };
  }

  const cost = getRecipeTokenRequirements(player, recipe);
  const wildcardAllowed = countUpgradeEffect(player, 'sean_hoyne_master_brewer');
  const tokens = player.tokens || {
    grain: 0,
    hops: 0,
    yeast: 0,
    chocolate: 0,
    spices: 0,
    fruit: 0,
  };

  let totalDeficit = 0;
  const missingParts: string[] = [];
  (Object.keys(cost) as IngredientTaxonomy[]).forEach((tax) => {
    const diff = cost[tax] - (tokens[tax] || 0);
    if (diff > 0) {
      totalDeficit += diff;
      missingParts.push(`${diff} ${tax}`);
    }
  });

  if (totalDeficit > 0) {
    let availableSurplus = 0;
    (Object.keys(cost) as IngredientTaxonomy[]).forEach((tax) => {
      const surplus = (tokens[tax] || 0) - cost[tax];
      if (surplus > 0) availableSurplus += surplus;
    });

    if (totalDeficit <= wildcardAllowed && totalDeficit <= availableSurplus) {
      // Build effective token cost: charge what player has for non-deficit items, plus surplus tokens to cover deficit
      const actualTokenCost = { ...cost };
      const surplusList: IngredientTaxonomy[] = [];
      (Object.keys(cost) as IngredientTaxonomy[]).forEach((tax) => {
        const surplus = (tokens[tax] || 0) - cost[tax];
        for (let s = 0; s < surplus; s++) {
          surplusList.push(tax);
        }
      });
      (Object.keys(cost) as IngredientTaxonomy[]).forEach((tax) => {
        const diff = cost[tax] - (tokens[tax] || 0);
        if (diff > 0) {
          actualTokenCost[tax] = (tokens[tax] || 0);
        }
      });
      for (let i = 0; i < totalDeficit; i++) {
        const subTax = surplusList[i];
        actualTokenCost[subTax] = (actualTokenCost[subTax] || 0) + 1;
      }
      return { canAfford: true, tokenCost: actualTokenCost };
    }

    return {
      canAfford: false,
      reason: `Missing wooden tokens: ${missingParts.join(', ')}.`,
      tokenCost: cost,
    };
  }

  return { canAfford: true, tokenCost: cost };
}

/**
 * Converts an upgrade's cost requirements into wooden token quantities.
 */
export function getUpgradeTokenRequirements(
  player: PlayerState,
  upgrade: UpgradeCard,
  chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing'
): Record<IngredientTaxonomy, number> {
  const effectiveOption =
    chosenOption ||
    (upgrade.cardKind === 'staff'
      ? 'staff'
      : upgrade.cardKind === 'equipment'
      ? 'equipment'
      : upgrade.isUniversalWing
      ? 'leftWing'
      : 'equipment');

  const opt =
    effectiveOption === 'equipment'
      ? upgrade.equipment
      : effectiveOption === 'staff'
      ? upgrade.staff
      : effectiveOption === 'leftWing'
      ? upgrade.leftWing
      : upgrade.rightWing;

  const needed: Record<IngredientTaxonomy, number> = {
    grain: 0,
    hops: 0,
    yeast: 0,
    chocolate: 0,
    spices: 0,
    fruit: 0,
  };

  if (upgrade.installTokens) {
    for (const [k, v] of Object.entries(upgrade.installTokens)) {
      needed[k as IngredientTaxonomy] = v || 0;
    }
    if (
      effectiveOption === 'equipment' &&
      (hasUpgradeInstalled(player, 'Rotary Canning Line') ||
        hasUpgradeInstalled(player, 'pay_1_less_grain_install_equipment'))
    ) {
      needed.grain = Math.max(0, needed.grain - 1);
    }
    return needed;
  }

  const costCategories = opt?.costCategories || upgrade.costCategories || [];
  const costSubtypes = opt?.costSubtypes || upgrade.costSubtypes;
  const upgradeDiscount = countUpgradeEffect(player, 'upgrade_cost_discount_1');

  if (costSubtypes && costSubtypes.length > 0) {
    let list = [...costSubtypes];
    if (upgradeDiscount > 0)
      list = list.slice(0, Math.max(0, list.length - upgradeDiscount));
    for (const st of list) {
      if (st === 'grain' || st === 'base_malt' || st === 'specialty_grain')
        needed.grain += 1;
      else if (
        st === 'hops' ||
        st === 'bittering_hops' ||
        st === 'aroma_hops' ||
        st === 'noble_hops' ||
        st === 'fresh_wet_hops'
      )
        needed.hops += 1;
      else if (st === 'yeast' || st === 'house_yeast') needed.yeast += 1;
      else if (st === 'chocolate' || st === 'dark_roasted_malt')
        needed.chocolate += 1;
      else if (st === 'spices' || st === 'winter_spices') needed.spices += 1;
      else if (st === 'fruit' || st === 'local_raspberries') needed.fruit += 1;
    }
  } else if (costCategories.length > 0) {
    let list = [...costCategories];
    if (upgradeDiscount > 0)
      list = list.slice(0, Math.max(0, list.length - upgradeDiscount));
    for (const cat of list) {
      if (cat === 'malt') needed.grain += 1;
      else if (cat === 'hops') needed.hops += 1;
      else if (cat === 'yeast') needed.yeast += 1;
      else if (cat === 'adjunct') needed.fruit += 1;
    }
  }

  return needed;
}

/**
 * Evaluates whether a player can afford to immediately install an UpgradeCard with their wooden tokens.
 */
export function canAffordUpgradeWithTokens(
  player: PlayerState,
  upgrade: UpgradeCard,
  chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing',
  chosenPaymentTokens?: Partial<Record<IngredientTaxonomy, number>>
): {
  canAfford: boolean;
  reason?: string;
  tokenCost: Record<IngredientTaxonomy, number>;
  chosenHalf: 'equipment' | 'staff' | 'leftWing' | 'rightWing';
} {
  const isDedicatedStaff = upgrade.cardKind === 'staff' || upgrade.type === 'staff';
  const isDedicatedEquipment = upgrade.cardKind === 'equipment' || upgrade.type === 'equipment';

  // Strictly enforce card type: Staff cards can ONLY be hired into Staff (bottom), and Equipment cards can ONLY be installed into Equipment (top)
  if (isDedicatedStaff && chosenOption && chosenOption !== 'staff') {
    return {
      canAfford: false,
      reason: 'Staff cards must be hired into the Staff slot under the board.',
      tokenCost: { grain: 0, hops: 0, yeast: 0, chocolate: 0, spices: 0, fruit: 0 },
      chosenHalf: 'staff',
    };
  }
  if (isDedicatedEquipment && chosenOption && chosenOption !== 'equipment') {
    return {
      canAfford: false,
      reason: 'Equipment cards must be installed into the Equipment slot on top of the board.',
      tokenCost: { grain: 0, hops: 0, yeast: 0, chocolate: 0, spices: 0, fruit: 0 },
      chosenHalf: 'equipment',
    };
  }

  const chosenHalf: 'equipment' | 'staff' | 'leftWing' | 'rightWing' =
    isDedicatedStaff
      ? 'staff'
      : isDedicatedEquipment
      ? 'equipment'
      : upgrade.isUniversalWing
      ? (chosenOption === 'rightWing' ? 'rightWing' : 'leftWing')
      : (chosenOption || 'equipment');
  const targetZone: ZoneId = (
    chosenHalf === 'equipment'
      ? (upgrade.equipment?.targetZone ?? upgrade.targetZone ?? 1)
      : chosenHalf === 'staff'
      ? (upgrade.staff?.targetZone ?? upgrade.targetZone ?? 1)
      : 1
  ) as ZoneId;

  const isDedicatedUpgrade = isDedicatedStaff || isDedicatedEquipment;
  if (isUpgradeLocationOccupied(player, chosenHalf, targetZone)) {
    const zoneName =
      targetZone === 1
        ? 'Warehouse'
        : targetZone === 2
        ? 'Brewhouse Kettle'
        : targetZone === 3
        ? 'Cellar'
        : targetZone === 4
        ? 'Packaging / Taproom'
        : targetZone === 5
        ? 'Loading Dock'
        : `Zone ${targetZone}`;
    const slotLabel = chosenHalf === 'equipment' ? 'Equipment' : chosenHalf === 'staff' ? 'Staff' : chosenHalf;
    return {
      canAfford: false,
      reason: `Zone ${targetZone} (${zoneName}) already has ${chosenHalf === 'equipment' ? 'an' : 'a'} ${slotLabel} upgrade (1 max per area).`,
      tokenCost: { grain: 0, hops: 0, yeast: 0, chocolate: 0, spices: 0, fruit: 0 },
      chosenHalf,
    };
  }

  const tokens = player.tokens || {
    grain: 0,
    hops: 0,
    yeast: 0,
    chocolate: 0,
    spices: 0,
    fruit: 0,
  };

  const cost: Record<IngredientTaxonomy, number> = {
    grain: 0,
    hops: 0,
    yeast: 0,
    chocolate: 0,
    spices: 0,
    fruit: 0,
  };

  // Dedicated equipment and staff cards with specific ingredient requirements
  if (isDedicatedUpgrade) {
    const specificReqs: Partial<Record<IngredientTaxonomy, number>> = {};
    if (upgrade.installTokens) {
      for (const [k, v] of Object.entries(upgrade.installTokens)) {
        if (k !== 'any' && (v || 0) > 0) {
          specificReqs[k as IngredientTaxonomy] = v;
        }
      }
    }

    // Equipment discount: Rotary Canning Line saves 1 Grain when installing Equipment
    if (
      chosenHalf === 'equipment' &&
      (hasUpgradeInstalled(player, 'Rotary Canning Line') ||
        hasUpgradeInstalled(player, 'pay_1_less_grain_install_equipment'))
    ) {
      if (specificReqs.grain && specificReqs.grain > 0) {
        specificReqs.grain = Math.max(0, specificReqs.grain - 1);
      }
    }

    // If specific non-wildcard tokens are required and no custom override was submitted:
    if (!chosenPaymentTokens && Object.keys(specificReqs).length > 0 && !upgrade.installTokens?.any) {
      for (const [tax, count] of Object.entries(specificReqs)) {
        const taxonomy = tax as IngredientTaxonomy;
        const needed = count || 0;
        const available = tokens[taxonomy] || 0;
        if (available < needed) {
          return {
            canAfford: false,
            reason: `Requires ${needed} ${taxonomy.toUpperCase()} from your warehouse (have ${available}).`,
            tokenCost: cost,
            chosenHalf,
          };
        }
        cost[taxonomy] = needed;
      }
      return { canAfford: true, tokenCost: cost, chosenHalf };
    }

    const requiredTokenCount =
      Object.values(specificReqs).reduce((sum, n) => sum + (n || 0), 0) ||
      Object.values(upgrade.installTokens || {}).reduce((sum, n) => sum + (n || 0), 0) ||
      (upgrade.storageSlots && upgrade.storageSlots >= 2 ? 2 : 1);

    const totalTokens = Object.values(tokens).reduce((sum, n) => sum + (n || 0), 0);
    if (totalTokens < requiredTokenCount) {
      return {
        canAfford: false,
        reason: `Requires at least ${requiredTokenCount} ingredient token${requiredTokenCount > 1 ? 's' : ''} to build/hire.`,
        tokenCost: cost,
        chosenHalf,
      };
    }

    // If player explicitly specified which ingredient tokens to spend:
    if (chosenPaymentTokens) {
      const chosenTotal = Object.values(chosenPaymentTokens).reduce((sum, n) => sum + (n || 0), 0);
      if (chosenTotal !== requiredTokenCount) {
        return {
          canAfford: false,
          reason: `Requires exactly ${requiredTokenCount} token${requiredTokenCount > 1 ? 's' : ''} (selected ${chosenTotal}).`,
          tokenCost: cost,
          chosenHalf,
        };
      }
      if (Object.keys(specificReqs).length > 0 && !upgrade.installTokens?.any) {
        for (const [reqTax, reqNeeded] of Object.entries(specificReqs)) {
          const supplied = chosenPaymentTokens[reqTax as IngredientTaxonomy] || 0;
          if (supplied < (reqNeeded || 0)) {
            return {
              canAfford: false,
              reason: `Requires ${reqNeeded} ${reqTax.toUpperCase()} (selected ${supplied}).`,
              tokenCost: cost,
              chosenHalf,
            };
          }
        }
      }
      for (const [tax, count] of Object.entries(chosenPaymentTokens)) {
        const taxonomy = tax as IngredientTaxonomy;
        const needed = count || 0;
        if (needed > 0) {
          if ((tokens[taxonomy] || 0) < needed) {
            return {
              canAfford: false,
              reason: `Not enough ${taxonomy} in warehouse (need ${needed}, have ${tokens[taxonomy] || 0}).`,
              tokenCost: cost,
              chosenHalf,
            };
          }
          cost[taxonomy] = needed;
        }
      }
      return { canAfford: true, tokenCost: cost, chosenHalf };
    }

    let remainingToPay = requiredTokenCount;
    const tempTokens = { ...tokens };

    // 1. Pay with preferred installTokens first if available (skipping wildcard 'any')
    if (upgrade.installTokens) {
      for (const [tax, count] of Object.entries(upgrade.installTokens)) {
        if (tax === 'any') continue;
        const taxonomy = tax as IngredientTaxonomy;
        const needed = count || 0;
        const available = tempTokens[taxonomy] || 0;
        const pay = Math.min(needed, available, remainingToPay);
        if (pay > 0) {
          cost[taxonomy] = (cost[taxonomy] || 0) + pay;
          tempTokens[taxonomy] -= pay;
          remainingToPay -= pay;
        }
      }
    }

    // 2. Pay remaining with any available player tokens
    const tokenOrder: IngredientTaxonomy[] = ['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'];
    for (const t of tokenOrder) {
      if (remainingToPay <= 0) break;
      const available = tempTokens[t] || 0;
      if (available > 0) {
        const pay = Math.min(available, remainingToPay);
        cost[t] = (cost[t] || 0) + pay;
        tempTokens[t] -= pay;
        remainingToPay -= pay;
      }
    }

    return { canAfford: true, tokenCost: cost, chosenHalf };
  }

  const missing: string[] = [];
  (Object.keys(cost) as IngredientTaxonomy[]).forEach((tax) => {
    if ((tokens[tax] || 0) < cost[tax]) {
      missing.push(`${cost[tax] - (tokens[tax] || 0)} ${tax}`);
    }
  });

  if (missing.length > 0) {
    return {
      canAfford: false,
      reason: `Missing wooden tokens: ${missing.join(', ')}.`,
      tokenCost: cost,
      chosenHalf,
    };
  }

  return { canAfford: true, tokenCost: cost, chosenHalf };
}

/**
 * Gridlock Wipe Rule:
 * If all six active market slots display the exact same card type (6 Upgrades OR 6 Recipes),
 * immediately sweep all six cards to the discard pile and simultaneously deal six new cards before proceeding.
 * Outer Shelf Layout: Locations 1 & 2 are dedicated Upgrades; Locations 3, 4, 5, 6 are dedicated Recipes.
 */
export function checkAndExecuteGridlockWipe(
  slots: Record<RotarySlotNumber, RotarySlotState>,
  deck: (RecipeCard | UpgradeCard)[],
  discard: (RecipeCard | UpgradeCard)[],
  turn: number,
  rng: () => number = Math.random,
  upgradeDeck?: UpgradeCard[],
  upgradeDiscard?: UpgradeCard[],
  recipeDeck?: RecipeCard[],
  recipeDiscard?: RecipeCard[]
): {
  slots: Record<RotarySlotNumber, RotarySlotState>;
  deck: (RecipeCard | UpgradeCard)[];
  discard: (RecipeCard | UpgradeCard)[];
  upgradeDeck: UpgradeCard[];
  upgradeDiscard: UpgradeCard[];
  recipeDeck: RecipeCard[];
  recipeDiscard: RecipeCard[];
  wipeEvent: MarketFlushEvent | null;
} {
  const currentSlots: Record<RotarySlotNumber, RotarySlotState> = {
    1: { ...slots[1] },
    2: { ...slots[2] },
    3: { ...slots[3] },
    4: { ...slots[4] },
    5: { ...slots[5] },
    6: { ...slots[6] },
    7: { ...slots[7] },
  };

  let curUpgradeDeck = upgradeDeck ? [...upgradeDeck] : deck.filter((c): c is UpgradeCard => c.deckType === 'upgrade');
  let curUpgradeDiscard = upgradeDiscard ? [...upgradeDiscard] : discard.filter((c): c is UpgradeCard => c.deckType === 'upgrade');
  let curRecipeDeck = recipeDeck ? [...recipeDeck] : deck.filter((c): c is RecipeCard => c.deckType === 'recipe');
  let curRecipeDiscard = recipeDiscard ? [...recipeDiscard] : discard.filter((c): c is RecipeCard => c.deckType === 'recipe');
  let currentDeck = [...deck];
  let currentDiscard = [...discard];
  let wipeEvent: MarketFlushEvent | null = null;

  let safetyAttempts = 0;
  while (safetyAttempts < 5) {
    const activeCards: (RecipeCard | UpgradeCard)[] = [];
    for (const s of [1, 2, 3, 4, 5, 6] as RotarySlotNumber[]) {
      if (currentSlots[s].outerCard) {
        activeCards.push(currentSlots[s].outerCard!);
      }
    }

    if (activeCards.length !== 6) break;

    const recipeCount = activeCards.filter((c) => c.deckType === 'recipe').length;
    const upgradeCount = activeCards.filter((c) => c.deckType === 'upgrade').length;

    // Gridlock only occurs if all 6 are Recipes (upgradeCount === 0) OR all 6 are Upgrades (recipeCount === 0)
    if (recipeCount > 0 && upgradeCount > 0) {
      break;
    }

    // Ensure there are cards of the missing type available in deck + discard
    const poolHasRecipes =
      curRecipeDeck.length > 0 ||
      curRecipeDiscard.length > 0 ||
      currentDeck.some((c) => c.deckType === 'recipe') ||
      currentDiscard.some((c) => c.deckType === 'recipe');
    const poolHasUpgrades =
      curUpgradeDeck.length > 0 ||
      curUpgradeDiscard.length > 0 ||
      currentDeck.some((c) => c.deckType === 'upgrade') ||
      currentDiscard.some((c) => c.deckType === 'upgrade');

    if ((recipeCount === 0 && !poolHasRecipes) || (upgradeCount === 0 && !poolHasUpgrades)) {
      break;
    }

    safetyAttempts++;
    const reason: 'NO_RECIPES' | 'NO_UPGRADES' = recipeCount === 0 ? 'NO_RECIPES' : 'NO_UPGRADES';
    const flushedCardNames = activeCards.map((c) => c.name);

    // 1. Immediately sweep all six cards to the discard pile
    currentDiscard.push(...activeCards);
    for (const card of activeCards) {
      if (card.deckType === 'upgrade') {
        curUpgradeDiscard.push(card);
      } else {
        curRecipeDiscard.push(card);
      }
    }
    for (const s of [1, 2, 3, 4, 5, 6] as RotarySlotNumber[]) {
      currentSlots[s].outerCard = null;
    }

    // 2. Simultaneously deal six new cards: Slots 1 & 2 get Upgrades, Slots 3-6 get Recipes
    for (const s of [1, 2, 3, 4, 5, 6] as RotarySlotNumber[]) {
      if (s === 1 || s === 2) {
        const drawn = drawFromUpgradeDeck(curUpgradeDeck, curUpgradeDiscard, rng);
        curUpgradeDeck = drawn.deck;
        curUpgradeDiscard = drawn.discard;
        currentSlots[s].outerCard = drawn.card || null;
      } else {
        const drawn = drawFromRecipeDeck(curRecipeDeck, curRecipeDiscard, rng);
        curRecipeDeck = drawn.deck;
        curRecipeDiscard = drawn.discard;
        currentSlots[s].outerCard = drawn.card || null;
      }
    }

    currentDeck = [...curUpgradeDeck, ...curRecipeDeck];

    wipeEvent = {
      id: `gridlock_wipe_${turn}_${safetyAttempts}_${Date.now()}`,
      turn,
      reason,
      flushedCardNames,
      timestamp: Date.now(),
    };
  }

  return {
    slots: currentSlots,
    deck: currentDeck,
    discard: currentDiscard,
    upgradeDeck: curUpgradeDeck,
    upgradeDiscard: curUpgradeDiscard,
    recipeDeck: curRecipeDeck,
    recipeDiscard: curRecipeDiscard,
    wipeEvent,
  };
}

/**
 * Phase 1: Market Refresh & Gridlock Check
 * Refill: Simultaneously populate all empty outer card shelves from their dedicated decks at the start of the shift:
 * - Locations 1 & 2: Dedicated Upgrade Locations (Equipment / Staff Upgrades)
 * - Locations 3, 4, 5, 6: Dedicated Recipe Locations (Beer Recipes)
 * Gridlock Wipe Rule: If all six active market slots display the exact same card type,
 * immediately sweep all six cards to the discard pile and simultaneously deal fresh segregated cards before proceeding.
 */
export function executePhase1MarketRefresh(
  state: GameState,
  rng: () => number = Math.random
): GameState {
  if (!state.rotaryBoard) return state;

  const currentSlots: Record<RotarySlotNumber, RotarySlotState> = {
    1: { ...state.rotaryBoard.slots[1] },
    2: { ...state.rotaryBoard.slots[2] },
    3: { ...state.rotaryBoard.slots[3] },
    4: { ...state.rotaryBoard.slots[4] },
    5: { ...state.rotaryBoard.slots[5] },
    6: { ...state.rotaryBoard.slots[6] },
    7: { ...state.rotaryBoard.slots[7] },
  };

  let currentEquipmentDeck = [...(state.equipmentDeck || [])];
  let currentEquipmentDiscard = [...(state.equipmentDiscard || [])];
  let currentStaffDeck = [...(state.staffDeck || [])];
  let currentStaffDiscard = [...(state.staffDiscard || [])];

  let recipeTierDecks: Record<RecipeTier, RecipeCard[]> = {
    3: [...(state.recipeTierDecks?.[3] || [])],
    4: [...(state.recipeTierDecks?.[4] || [])],
    5: [...(state.recipeTierDecks?.[5] || [])],
    6: [...(state.recipeTierDecks?.[6] || [])],
  };
  let recipeTierDiscards: Record<RecipeTier, RecipeCard[]> = {
    3: [...(state.recipeTierDiscards?.[3] || [])],
    4: [...(state.recipeTierDiscards?.[4] || [])],
    5: [...(state.recipeTierDiscards?.[5] || [])],
    6: [...(state.recipeTierDiscards?.[6] || [])],
  };

  // Fallbacks if decks are uninitialized
  if (currentEquipmentDeck.length === 0 && currentEquipmentDiscard.length === 0) {
    currentEquipmentDeck = shuffleArray(createEquipmentDeck(), rng);
  }
  if (currentStaffDeck.length === 0 && currentStaffDiscard.length === 0) {
    currentStaffDeck = shuffleArray(createStaffDeck(), rng);
  }
  ([3, 4, 5, 6] as RecipeTier[]).forEach((tier) => {
    if (recipeTierDecks[tier].length === 0 && recipeTierDiscards[tier].length === 0) {
      recipeTierDecks[tier] = shuffleArray(createTierRecipeDeck(tier), rng);
    }
  });

  let currentRecipeDeck = [
    ...recipeTierDecks[3],
    ...recipeTierDecks[4],
    ...recipeTierDecks[5],
    ...recipeTierDecks[6],
  ];
  let currentRecipeDiscard = [
    ...recipeTierDiscards[3],
    ...recipeTierDiscards[4],
    ...recipeTierDiscards[5],
    ...recipeTierDiscards[6],
  ];

  let currentUpgradeDeck = [...currentEquipmentDeck, ...currentStaffDeck];
  let currentUpgradeDiscard = [...currentEquipmentDiscard, ...currentStaffDiscard];

  let logs = [...state.logs];

  // 1. Simultaneously populate all empty outer card shelves from dedicated decks:
  // - Station #1: Dedicated Equipment Deck
  // - Station #2: Dedicated Staff Deck
  // - Station #3: Dedicated Tier 3 Recipe Deck (Fruit Hopper • Legends & Heavyweights)
  // - Station #4: Dedicated Tier 4 Recipe Deck (Yeast Hopper • Heritage & Dark Ales)
  // - Station #5: Dedicated Tier 5 Recipe Deck (Hops Hopper • Pints & IPAs)
  // - Station #6: Dedicated Tier 6 Recipe Deck (Grain Hopper • Core Crushers)
  const emptySlots = ([1, 2, 3, 4, 5, 6] as RotarySlotNumber[]).filter(
    (s) => currentSlots[s].outerCard === null
  );

  for (const s of emptySlots) {
    if (s === 1) {
      const drawn = drawFromEquipmentDeck(currentEquipmentDeck, currentEquipmentDiscard, rng);
      currentEquipmentDeck = drawn.deck;
      currentEquipmentDiscard = drawn.discard;
      currentSlots[s].outerCard = drawn.card || null;
    } else if (s === 2) {
      const drawn = drawFromStaffDeck(currentStaffDeck, currentStaffDiscard, rng);
      currentStaffDeck = drawn.deck;
      currentStaffDiscard = drawn.discard;
      currentSlots[s].outerCard = drawn.card || null;
    } else {
      const tier = s as RecipeTier;
      const drawn = drawFromTierRecipeDeck(tier, recipeTierDecks[tier], recipeTierDiscards[tier], rng);
      recipeTierDecks[tier] = drawn.deck;
      recipeTierDiscards[tier] = drawn.discard;
      currentSlots[s].outerCard = drawn.card || null;
    }
  }

  // 2. Gridlock Wipe Rule
  let currentDeck = [...(state.breweryDeck || [])];
  let currentDiscard = [...(state.breweryDiscard || [])];
  const gridlockResult = checkAndExecuteGridlockWipe(
    currentSlots,
    currentDeck,
    currentDiscard,
    state.turnNumber,
    rng,
    currentUpgradeDeck,
    currentUpgradeDiscard,
    currentRecipeDeck,
    currentRecipeDiscard
  );
  const updatedSlots = gridlockResult.slots;
  currentDeck = gridlockResult.deck;
  currentDiscard = gridlockResult.discard;
  currentUpgradeDeck = gridlockResult.upgradeDeck;
  currentUpgradeDiscard = gridlockResult.upgradeDiscard;
  currentRecipeDeck = gridlockResult.recipeDeck;
  currentRecipeDiscard = gridlockResult.recipeDiscard;

  const activePlayer = state.players[state.currentPlayerIndex] || state.players[0];

  if (gridlockResult.wipeEvent) {
    logs = addLog(
      logs,
      state.turnNumber,
      activePlayer,
      'PHASE_1_MARKET_REFRESH',
      `⚡ GRIDLOCK WIPE RULE: All 6 active market slots were ${gridlockResult.wipeEvent.reason === 'NO_UPGRADES' ? 'Recipes' : 'Upgrades'}! Swept all 6 cards to discard and simultaneously dealt fresh Upgrades to Slots 1-2 and fresh Recipes to Slots 3-6.`
    );
  } else if (emptySlots.length > 0) {
    const upgradedCount = emptySlots.filter((s) => s === 1 || s === 2).length;
    const recipeCount = emptySlots.filter((s) => s >= 3 && s <= 6).length;
    const details = [
      upgradedCount > 0 ? `${upgradedCount} Upgrade(s) at Slots 1-2` : null,
      recipeCount > 0 ? `${recipeCount} Recipe(s) at Slots 3-6` : null,
    ].filter(Boolean).join(', ');
    logs = addLog(
      logs,
      state.turnNumber,
      activePlayer,
      'PHASE_1_MARKET_REFRESH',
      `🔄 Market Refresh: Refilled outer shelves (${details}).`
    );
  }

  const updatedMarket = ([1, 2, 3, 4, 5, 6] as RotarySlotNumber[])
    .map((s) => updatedSlots[s].outerCard)
    .filter((c): c is RecipeCard | UpgradeCard => c !== null);

  const rotaryBoard: RotaryBoardState = {
    ...state.rotaryBoard,
    slots: updatedSlots,
  };

  return {
    ...state,
    rotaryBoard,
    equipmentDeck: currentEquipmentDeck,
    equipmentDiscard: currentEquipmentDiscard,
    staffDeck: currentStaffDeck,
    staffDiscard: currentStaffDiscard,
    upgradeDeck: [...currentEquipmentDeck, ...currentStaffDeck],
    upgradeDiscard: [...currentEquipmentDiscard, ...currentStaffDiscard],
    recipeDeck: currentRecipeDeck,
    recipeDiscard: currentRecipeDiscard,
    recipeTierDecks,
    recipeTierDiscards,
    breweryDeck: currentDeck,
    breweryDiscard: currentDiscard,
    breweryMarket: updatedMarket,
    pubMarket: updatedMarket.filter((c): c is RecipeCard => c.deckType === 'recipe'),
    shopMarket: updatedMarket.filter((c): c is UpgradeCard => c.deckType === 'upgrade'),
    taproomMarket: updatedMarket,
    phase: 'PHASE_2_CATWALK_PLACEMENT',
    shiftPhase: 'PHASE_2_CATWALK_PLACEMENT',
    lastMarketFlushEvent: gridlockResult.wipeEvent || state.lastMarketFlushEvent,
    logs,
  };
}

/**
 * Phase 2: Catwalk Placement & Initiative
 * Placement: Players move their meeple onto an available Catwalk space.
 * Forced Movement Rule: A player must vacate their previous station and cannot select the Catwalk of the wedge they occupied on the previous shift.
 * Turn Order: The physical positions of the meeples on the Catwalks strictly establish the new turn order for the remainder of the shift (resolving sequentially from Catwalk 1 through 6).
 */
export function performCatwalkPlacement(
  state: GameState,
  slotNumber: RotarySlotNumber
): GameState {
  if (
    state.phase !== 'PHASE_2_CATWALK_PLACEMENT' &&
    state.phase !== 'PHASE_1_WORKER_DRAFT' &&
    state.phase !== 'WORK_DAY'
  ) {
    return state;
  }
  if (!state.rotaryBoard) return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];
  if (!player) return state;

  const rotaryBoard: RotaryBoardState = {
    ...state.rotaryBoard,
    slots: {
      1: { ...state.rotaryBoard.slots[1] },
      2: { ...state.rotaryBoard.slots[2] },
      3: { ...state.rotaryBoard.slots[3] },
      4: { ...state.rotaryBoard.slots[4] },
      5: { ...state.rotaryBoard.slots[5] },
      6: { ...state.rotaryBoard.slots[6] },
      7: { ...state.rotaryBoard.slots[7] },
    },
    pantryOccupants: { ...(state.rotaryBoard?.pantryOccupants || {}) },
  };

  const slot = rotaryBoard.slots[slotNumber];
  if (!slot) return state;

  // 1. Forced Movement Rule: Cannot select the Catwalk of the station occupied on previous shift
  if (player.lastOccupiedStation === slotNumber) {
    return state; // Blocked: Must vacate previous station!
  }

  // 2. Exclusive Catwalk Placement: No player bumping!
  // If this catwalk station is already occupied by another player, action is blocked.
  if (slot.catwalkOccupant && slot.catwalkOccupant.playerId !== player.id) {
    return state; // Blocked: Station is already occupied!
  }

  // 3. Pick up active player's meeple from their previous location (if on board from previous shift)
  for (const s of [1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]) {
    if (rotaryBoard.slots[s].inwardOccupant?.playerId === player.id) {
      rotaryBoard.slots[s].inwardOccupant = null;
    }
    if (rotaryBoard.slots[s].outwardOccupant?.playerId === player.id) {
      rotaryBoard.slots[s].outwardOccupant = null;
    }
    if (rotaryBoard.slots[s].catwalkOccupant?.playerId === player.id) {
      rotaryBoard.slots[s].catwalkOccupant = null;
    }
    if (rotaryBoard.slots[s].standbyOccupant?.playerId === player.id) {
      rotaryBoard.slots[s].standbyOccupant = null;
    }
  }
  if (rotaryBoard.pantryOccupants) {
    for (const ing of Object.keys(rotaryBoard.pantryOccupants) as IngredientTaxonomy[]) {
      if (rotaryBoard.pantryOccupants[ing]?.playerId === player.id) {
        delete rotaryBoard.pantryOccupants[ing];
      }
    }
  }
  if (rotaryBoard.centerSpaceOccupant?.playerId === player.id) {
    rotaryBoard.centerSpaceOccupant = null;
  }
  rotaryBoard.centerRingHotSeat = null;
  rotaryBoard.hotSeatPlayerId = null;
  rotaryBoard.evictedFromStation = null;

  // 4. Place active player on Catwalk
  slot.catwalkOccupant = {
    playerId: player.id,
    playerName: player.name,
    playerColor: player.color,
  };

  if (slotNumber === 7) {
    rotaryBoard.centerSpaceOccupant = {
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
      chosenIngredient: null,
    };
  }

  let logs = addLog(
    state.logs,
    state.turnNumber,
    player,
    'PHASE_2_CATWALK_PLACEMENT',
    `${player.name} moved meeple onto Catwalk #${slotNumber} (${slot.ingredientName})!`
  );

  // 3b. Also clear meeple from personal department if previously stationed there
  player.departmentOccupant = null;

  // Check if all active players have placed (Catwalks 1-7 + Personal Brewery Departments #1-10)
  const catwalkMeeples = ([1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[])
    .filter((s) => rotaryBoard.slots[s]?.catwalkOccupant !== null && rotaryBoard.slots[s]?.catwalkOccupant !== undefined)
    .map((s) => ({ slotNumber: s, occupant: rotaryBoard.slots[s].catwalkOccupant! }));

  const deptMeeples = players
    .filter((p) => p.departmentOccupant !== null && p.departmentOccupant !== undefined && p.departmentCard)
    .map((p) => ({
      departmentNumber: p.departmentCard!.departmentNumber,
      playerId: p.departmentOccupant!.playerId,
      name: p.name,
    }));

  const totalPlacedCount = catwalkMeeples.length + deptMeeples.length;

  if (totalPlacedCount >= players.length) {
    // Two-tier initiative: Public Catwalks 1-7 resolve first; personal departments resolve second in #1-#10 order
    const catwalkOrder = catwalkMeeples
      .sort((a, b) => a.slotNumber - b.slotNumber)
      .map((item) => item.occupant.playerId);

    const deptOrder = deptMeeples
      .sort((a, b) => a.departmentNumber - b.departmentNumber)
      .map((item) => item.playerId);

    const sortedOrder = [...catwalkOrder, ...deptOrder];
    rotaryBoard.turnOrder = sortedOrder;
    const firstPlayerId = sortedOrder[0];
    const firstPlayerIndex = Math.max(0, players.findIndex((p) => p.id === firstPlayerId));

    logs = addLog(
      logs,
      state.turnNumber,
      players[firstPlayerIndex],
      'PHASE_3_STATION_COMMITMENT',
      `🎯 INITIATIVE ESTABLISHED! Shift turn order: Catwalks (${catwalkOrder.length}) ➔ Departments (${deptOrder.length}): ${sortedOrder
        .map((id) => players.find((p) => p.id === id)?.name)
        .join(' ➔ ')}. ${players[firstPlayerIndex].name} acts first!`
    );

    return {
      ...state,
      players,
      rotaryBoard,
      currentPlayerIndex: firstPlayerIndex,
      phase: 'PHASE_3_STATION_COMMITMENT',
      shiftPhase: 'PHASE_3_STATION_COMMITMENT',
      logs,
    };
  }

  // Advance to next player in regular clockwise order who has not placed yet
  let nextIdx = (state.currentPlayerIndex + 1) % players.length;
  let safety = 0;
  while (safety < players.length) {
    const nextPlayer = players[nextIdx];
    const alreadyOnCatwalk = ([1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]).some(
      (s) => rotaryBoard.slots[s]?.catwalkOccupant?.playerId === nextPlayer.id
    );
    const alreadyInDept = !!nextPlayer.departmentOccupant;
    if (!alreadyOnCatwalk && !alreadyInDept) break;
    nextIdx = (nextIdx + 1) % players.length;
    safety++;
  }

  return {
    ...state,
    players,
    rotaryBoard,
    currentPlayerIndex: nextIdx,
    logs,
  };
}

/**
 * Phase 3: Station Commitment & Action Execution
 * Commitment: Operating in the newly established turn order, each player moves their meeple
 * from the Catwalk directly into one of the two active zones of their station:
 *   - Inner Hopper: Commits to a resource token draft.
 *   - Outer Shelf: Commits to a card draft (paying the required tokens).
 * Lockout: The moment a meeple occupies either zone, that entire 1/6th station slice is strictly locked.
 * No other player may interact with that station's hopper or card shelf for the remainder of the phase.
 * Execution: The player immediately completes their single transaction (take the token or pay for/take the card).
 * The meeple remains in this zone until Phase 2 of the next shift.
 */
export function performStationCommitment(
  state: GameState,
  slotNumber: RotarySlotNumber,
  commitment: 'inward' | 'outward',
  chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing',
  chosenPantryIngredient?: IngredientTaxonomy,
  chosenPaymentTokens?: Partial<Record<IngredientTaxonomy, number>>
): GameState {
  if (
    state.phase !== 'PHASE_3_STATION_COMMITMENT' &&
    state.phase !== 'WORK_DAY' &&
    state.phase !== 'PHASE_1_WORKER_DRAFT'
  ) {
    return state;
  }
  if (!state.rotaryBoard) return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];
  if (!player) return state;

  const rotaryBoard: RotaryBoardState = {
    ...state.rotaryBoard,
    slots: {
      1: { ...state.rotaryBoard.slots[1] },
      2: { ...state.rotaryBoard.slots[2] },
      3: { ...state.rotaryBoard.slots[3] },
      4: { ...state.rotaryBoard.slots[4] },
      5: { ...state.rotaryBoard.slots[5] },
      6: { ...state.rotaryBoard.slots[6] },
      7: { ...state.rotaryBoard.slots[7] },
    },
  };

  const slot = rotaryBoard.slots[slotNumber];
  if (!slot) return state;

  // In Phase 3, verify player is stationed at this Catwalk
  if (state.phase === 'PHASE_3_STATION_COMMITMENT') {
    const isAtThisCatwalk = slot.catwalkOccupant?.playerId === player.id;
    if (!isAtThisCatwalk) return state; // Must commit at the station where meeple placed during Phase 2
  }

  // Lockout check: if station already locked by another meeple
  if (slot.inwardOccupant && slot.inwardOccupant.playerId !== player.id) return state;
  if (slot.outwardOccupant && slot.outwardOccupant.playerId !== player.id) return state;

  let centralHoppers = { ...(state.centralHoppers || TOTAL_TOKEN_POOL) };
  let kettlePool = { ...(state.kettlePool || { grain: 0, hops: 0, yeast: 0, fruit: 0, spices: 0, chocolate: 0 }) };
  let logs = [...state.logs];
  let nextBreweryDeck = [...(state.breweryDeck || [])];
  let nextBreweryDiscard = [...(state.breweryDiscard || [])];
  let isFinalRound = state.isFinalRound;
  let endgameTriggeredByPlayerId = state.endgameTriggeredByPlayerId;

  // 1. Inner Hopper: Commits to a resource token draft
  if (commitment === 'inward') {
    const effectiveIngredient: IngredientTaxonomy =
      slotNumber === 7
        ? (chosenPantryIngredient || rotaryBoard.centerSpaceOccupant?.chosenIngredient || 'grain')
        : slot.ingredient;

    let yieldCount = slot.tokenYield;
    // Upgrade bonuses
    if (slotNumber === 5 && hasUpgradeInstalled(player, 'draft_bonus_station_5_hops')) yieldCount += 1;
    if (slotNumber === 6 && hasUpgradeInstalled(player, 'draft_bonus_station_6_grain')) yieldCount += 1;
    if (slotNumber === 2 && hasUpgradeInstalled(player, 'draft_bonus_station_2_spices')) yieldCount += 1;
    if (slotNumber === 1 && hasUpgradeInstalled(player, 'draft_bonus_station_1_chocolate')) yieldCount += 1;
    if (slotNumber === 4 && hasUpgradeInstalled(player, 'draft_bonus_station_4_yeast')) yieldCount += 1;
    if (slotNumber === 3 && hasUpgradeInstalled(player, 'draft_bonus_station_3_fruit')) yieldCount += 1;

    const availableInHopper = centralHoppers[effectiveIngredient] ?? yieldCount;
    const actualTokensTaken = Math.min(yieldCount, availableInHopper);

    centralHoppers[effectiveIngredient] = Math.max(0, (centralHoppers[effectiveIngredient] || 0) - actualTokensTaken);
    player.tokens[effectiveIngredient] = (player.tokens[effectiveIngredient] || 0) + actualTokensTaken;

    // Market Purchasing Perks (e.g. Freight Lead: +1 Grain when buying Grain at Market)
    const staffDraftTaxonomies: IngredientTaxonomy[] = ['grain', 'hops', 'yeast', 'chocolate', 'spices', 'fruit'];
    for (const tax of staffDraftTaxonomies) {
      const specificBonus = countUpgradeEffect(player, `market_plus_1_${tax}` as UpgradeEffectKey);
      const legacyBonus = countUpgradeEffect(player, `draft_bonus_${tax}` as UpgradeEffectKey);
      const bonus = legacyBonus + (effectiveIngredient === tax ? specificBonus : 0);
      if (bonus > 0) {
        const avail = centralHoppers[tax] ?? bonus;
        const takeBonus = Math.min(bonus, avail);
        if (takeBonus > 0) {
          centralHoppers[tax] = Math.max(0, (centralHoppers[tax] || 0) - takeBonus);
          player.tokens[tax] = (player.tokens[tax] || 0) + takeBonus;
          logs = addLog(
            logs,
            state.turnNumber,
            player,
            'PHASE_3_STATION_COMMITMENT',
            `Staff market perk: +${takeBonus} ${tax.toUpperCase()} token(s) when buying ${tax.toUpperCase()} at the Market.`
          );
        }
      }
    }

    if (slotNumber === 7) {
      // Station 7 (Brewhouse Pantry): Player moves out into one of the 6 interior locations around inside location 7
      if (!rotaryBoard.pantryOccupants) {
        rotaryBoard.pantryOccupants = {};
      }

      // Meeple moves into this interior location
      rotaryBoard.pantryOccupants[effectiveIngredient] = {
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
      };

      // Clear the very middle porthole so it is unblocked for future placement
      slot.catwalkOccupant = null;
      slot.inwardOccupant = null;
      rotaryBoard.centerSpaceOccupant = {
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
        chosenIngredient: effectiveIngredient,
      };
    } else {
      // Meeple moves from Catwalk directly into Inner Hopper
      slot.inwardOccupant = slot.catwalkOccupant || {
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
      };
      slot.catwalkOccupant = null;
    }
    player.lastOccupiedStation = slotNumber;
    player.actionsTakenThisShift = 1;

    const newWarehouseCount = Object.values(player.tokens).reduce((sum, v) => sum + (v || 0), 0);
    const capacity = getWarehouseCapacity(player);
    const isOverCap = newWarehouseCount > capacity;

    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'PHASE_3_STATION_COMMITMENT',
      slotNumber === 7
        ? `🔒 Catwalk Station #7 Resolved! ${player.name} moved into the ${effectiveIngredient.toUpperCase()} interior pantry location (+1 ${effectiveIngredient.toUpperCase()} token into Warehouse, ${newWarehouseCount}/${capacity}${isOverCap ? ' - Over storage capacity' : ''}).`
        : `🔒 Inner Hopper Committed! ${player.name} drafted ${actualTokensTaken} ${slot.ingredient.toUpperCase()} token(s) into Warehouse (${newWarehouseCount}/${capacity}${isOverCap ? ' - Over storage capacity' : ''}).`
    );

    // Mandatory Warehouse Capacity Enforcement: AI automatically returns excess tokens down to capacity
    if (player.isAI) {
      logs = enforceAiWarehouseCapacity(player, centralHoppers, logs, state.turnNumber);
    }
  }

  // 2. Outer Shelf: Commits to a card draft (paying required tokens)
  else if (commitment === 'outward') {
    const card = slot.outerCard;
    if (!card) return state;

    if (card.deckType === 'recipe') {
      const afford = canAffordRecipeWithTokens(player, card);
      if (!afford.canAfford) return state;

      // Deduct tokens with spent token retention perks
      (Object.keys(afford.tokenCost) as IngredientTaxonomy[]).forEach((tax) => {
        let spent = afford.tokenCost[tax] || 0;
        if (tax === 'grain' && spent > 0) {
          const retain = countUpgradeEffect(player, 'retain_spent_grain_on_brew');
          if (retain > 0) {
            const retained = Math.min(spent, retain);
            spent -= retained;
            logs = addLog(
              logs,
              state.turnNumber,
              player,
              'PHASE_3_STATION_COMMITMENT',
              `Retained ${retained} spent Grain token(s) in warehouse when brewing.`
            );
          }
        } else if (tax === 'hops' && spent > 0) {
          const retain = countUpgradeEffect(player, 'retain_spent_hops_on_brew');
          if (retain > 0) {
            const retained = Math.min(spent, retain);
            spent -= retained;
            logs = addLog(
              logs,
              state.turnNumber,
              player,
              'PHASE_3_STATION_COMMITMENT',
              `Retained ${retained} spent Hops token(s) in warehouse when brewing.`
            );
          }
        } else if (tax === 'yeast' && spent > 0) {
          const retain = countUpgradeEffect(player, 'retain_spent_yeast_on_brew');
          if (retain > 0) {
            const retained = Math.min(spent, retain);
            spent -= retained;
            logs = addLog(
              logs,
              state.turnNumber,
              player,
              'PHASE_3_STATION_COMMITMENT',
              `Retained ${retained} spent Yeast token(s) in warehouse when brewing.`
            );
          }
        } else if ((tax === 'chocolate' || tax === 'spices' || tax === 'fruit') && spent > 0) {
          const retain = countUpgradeEffect(player, 'retain_spent_adjunct_on_brew');
          if (retain > 0) {
            const retained = Math.min(spent, retain);
            spent -= retained;
            logs = addLog(
              logs,
              state.turnNumber,
              player,
              'PHASE_3_STATION_COMMITMENT',
              `Retained ${retained} spent Specialty (${tax}) token(s) in warehouse when brewing.`
            );
          }
        }
        player.tokens[tax] = Math.max(0, (player.tokens[tax] || 0) - spent);
        centralHoppers[tax] = (centralHoppers[tax] || 0) + spent;
      });

      player.zones[1].recipes.push(card);

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_3_STATION_COMMITMENT',
        `🔒 Outer Shelf Committed! ${player.name} paid required tokens and started brewing ${card.name} in Zone 1 (Warehouse). Station #${slotNumber} is locked.`
      );
    } else if (card.deckType === 'upgrade') {
      const afford = canAffordUpgradeWithTokens(player, card, chosenOption, chosenPaymentTokens);
      if (!afford.canAfford) return state;

      (Object.keys(afford.tokenCost) as IngredientTaxonomy[]).forEach((tax) => {
        const spent = afford.tokenCost[tax] || 0;
        player.tokens[tax] = Math.max(0, (player.tokens[tax] || 0) - spent);
        centralHoppers[tax] = (centralHoppers[tax] || 0) + spent;
      });

      const finalInstallAs: 'equipment' | 'staff' | 'leftWing' | 'rightWing' =
        card.cardKind === 'staff' || card.type === 'staff'
          ? 'staff'
          : card.cardKind === 'equipment' || card.type === 'equipment'
          ? 'equipment'
          : afford.chosenHalf;
      const vpAward = card.bonusEndgameVp || (Object.values(card.installTokens || {}).reduce((s, n) => s + (n || 0), 0) >= 2 ? 2 : 1);
      const installedCard: UpgradeCard = {
        ...card,
        installedAs: finalInstallAs,
        bonusEndgameVp: vpAward,
      };

      const targetZone = (
        finalInstallAs === 'equipment'
          ? (card.equipment?.targetZone ?? card.targetZone ?? 1)
          : (card.staff?.targetZone ?? card.targetZone ?? 1)
      ) as ZoneId;

      if (isUpgradeLocationOccupied(player, finalInstallAs, targetZone)) {
        return state;
      }

      if (finalInstallAs === 'equipment') {
        installedCard.installedOption = card.equipment;
        player.zones[targetZone].equipment.push(installedCard);
      } else {
        installedCard.installedOption = card.staff;
        player.zones[targetZone].staff.push(installedCard);
      }

      player.scoreBreakdown.upgradeStaticVp += vpAward;
      player.score += vpAward;

      const spentSummary = (Object.keys(afford.tokenCost) as IngredientTaxonomy[])
        .filter((tax) => afford.tokenCost[tax] > 0)
        .map((tax) => `${afford.tokenCost[tax]} ${tax.toUpperCase()}`)
        .join(', ');

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_3_STATION_COMMITMENT',
        `🔒 Outer Shelf Committed! ${player.name} paid [${spentSummary || '0 tokens'}] and installed ${card.name} into Zone ${targetZone} as ${finalInstallAs}. Station #${slotNumber} is locked.`
      );
    }

    // Move meeple from Catwalk directly into Outer Shelf
    slot.outwardOccupant = slot.catwalkOccupant || {
      playerId: player.id,
      playerName: player.name,
      playerColor: player.color,
    };
    slot.catwalkOccupant = null;
    // Outer shelf is now empty for remainder of phase (no mid-phase refill!)
    slot.outerCard = null;
    player.lastOccupiedStation = slotNumber;
    player.actionsTakenThisShift = 1;
    player.lastOccupiedStation = slotNumber;
    player.lastOccupiedDepartment = false;
  }

  updatePlayerMat(player);

  // Rule 5 Endgame Trigger Check: Check if any player has completed & delivered their target number of recipes (Zone 5)
  for (const p of players) {
    const scoredCount = p.rightWing?.filter((r: any) => r.deckType === 'recipe').length || 0;
    const deliveredCount = scoredCount + (p.completedBatches?.length || 0);
    if (deliveredCount >= state.targetBatchesToTriggerEnd && !isFinalRound) {
      isFinalRound = true;
      endgameTriggeredByPlayerId = p.id;
      logs = addLog(
        logs,
        state.turnNumber,
        p,
        'PHASE_3_STATION_COMMITMENT',
        `🏆 ENDGAME TRIGGERED! ${p.name} has delivered ${deliveredCount} completed recipes to the Loading Dock (Target: ${state.targetBatchesToTriggerEnd})! Finishing current shift so all players receive equal turns.`
      );
      break;
    }
  }

  const updatedMarket = ([1, 2, 3, 4, 5, 6] as RotarySlotNumber[])
    .map((s) => rotaryBoard.slots[s].outerCard)
    .filter((c): c is RecipeCard | UpgradeCard => c !== null);

  // Check if more players in initiative order still need to act this shift
  const turnOrder = rotaryBoard.turnOrder || players.map((p) => p.id);
  const currentIdxInTurnOrder = turnOrder.indexOf(player.id);
  const isShiftComplete = currentIdxInTurnOrder === -1 || currentIdxInTurnOrder >= turnOrder.length - 1;

  if (!isShiftComplete) {
    const nextPlayerId = turnOrder[currentIdxInTurnOrder + 1];
    const nextPlayerIndex = Math.max(0, players.findIndex((p) => p.id === nextPlayerId));

    return {
      ...state,
      players,
      rotaryBoard,
      centralHoppers,
      kettlePool,
      breweryDeck: nextBreweryDeck,
      breweryDiscard: nextBreweryDiscard,
      breweryMarket: updatedMarket,
      pubMarket: updatedMarket.filter((c): c is RecipeCard => c.deckType === 'recipe'),
      shopMarket: updatedMarket.filter((c): c is UpgradeCard => c.deckType === 'upgrade'),
      currentPlayerIndex: nextPlayerIndex,
      isFinalRound,
      endgameTriggeredByPlayerId,
      logs,
    };
  }

  // Shift is Complete!
  // Rule 5: Check if endgame was triggered during this shift
  if (isFinalRound) {
    for (const p of players) {
      updatePlayerMat(p);
    }
    const winnerIds = computeWinners(players);
    const maxScore = Math.max(...players.map((p) => p.score));

    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'GAME_OVER',
      `🏁 GAME OVER! The shift has finished so all players received equal turns. Winner: ${winnerIds.map((id) => players.find((p) => p.id === id)?.name).join(', ')} with ${maxScore} VP!`
    );

    return {
      ...state,
      players,
      rotaryBoard,
      centralHoppers,
      kettlePool,
      breweryDeck: nextBreweryDeck,
      breweryDiscard: nextBreweryDiscard,
      breweryMarket: updatedMarket,
      isFinalRound,
      endgameTriggeredByPlayerId,
      winnerIds,
      phase: 'GAME_OVER',
      shiftPhase: 'GAME_OVER',
      logs,
    };
  }

  // Run Morning Shift conveyor slide (Zone 2 -> 3 -> 4)
  let afterSlideState: GameState = {
    ...state,
    players,
    rotaryBoard,
    centralHoppers,
    kettlePool,
    breweryDeck: nextBreweryDeck,
    breweryDiscard: nextBreweryDiscard,
    breweryMarket: updatedMarket,
    isFinalRound,
    endgameTriggeredByPlayerId,
    logs,
  };

  afterSlideState = executePhase2ConveyorOperations(afterSlideState);

  // If conveyor operations completed the game (a player reached the target in Zone 4, or final round completed)
  if (afterSlideState.phase === 'GAME_OVER') {
    return afterSlideState;
  }

  // Meeples stay in their inward hopper / outward shelf locations until Phase 3!
  // This provides a continuous visual cue of who acted and who occupied each station.
  // When a player moves to a new Catwalk in Phase 2, they pick up their meeple, or evict anyone still in that station!
  for (const s of [1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]) {
    afterSlideState.rotaryBoard!.slots[s].catwalkOccupant = null;
  }
  for (const p of afterSlideState.players) {
    p.departmentOccupant = null;
  }

  // Calculate new initiative turn order for next shift based on occupied stations 1-7
  const newTurnOrder: string[] = [];
  ([1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]).forEach((slotNum) => {
    const slot = afterSlideState.rotaryBoard!.slots[slotNum];
    const occupant = slot.inwardOccupant || slot.outwardOccupant;
    const playerIdAtStation = occupant?.playerId || afterSlideState.players.find((p) => p.lastOccupiedStation === slotNum)?.id;
    if (playerIdAtStation && !newTurnOrder.includes(playerIdAtStation)) {
      newTurnOrder.push(playerIdAtStation);
    }
  });

  if (newTurnOrder.length > 0) {
    afterSlideState.rotaryBoard!.turnOrder = newTurnOrder;
  }
  const firstPlayerId = newTurnOrder.length > 0 ? newTurnOrder[0] : afterSlideState.players[0].id;
  const firstPlayerIndex = Math.max(0, afterSlideState.players.findIndex((p) => p.id === firstPlayerId));
  afterSlideState.currentPlayerIndex = firstPlayerIndex;

  for (const p of afterSlideState.players) {
    p.actionsTakenThisShift = 0;
  }

  afterSlideState.turnNumber += 1;
  afterSlideState.roundNumber += 1;
  afterSlideState.phase = 'PHASE_2_CATWALK_PLACEMENT';
  afterSlideState.shiftPhase = 'PHASE_2_CATWALK_PLACEMENT';

  // Execute Phase 1: Market Refresh & Gridlock Check for next shift!
  return executePhase1MarketRefresh(afterSlideState);
}

/**
 * 11.5" Rotary Board Catwalk Action Dispatcher:
 * Supports Phase 2 (Catwalk Placement) and Phase 3 (Station Commitment).
 */
export function performRotaryAction(
  state: GameState,
  slotNumber: RotarySlotNumber,
  actionType: RotaryCatwalkAction,
  chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing',
  chosenPaymentTokens?: Partial<Record<IngredientTaxonomy, number>>
): GameState {
  if (state.phase === 'PHASE_2_CATWALK_PLACEMENT') {
    return performCatwalkPlacement(state, slotNumber);
  }
  if (state.phase === 'PHASE_3_STATION_COMMITMENT') {
    if (actionType === 'inward') {
      return performStationCommitment(state, slotNumber, 'inward');
    }
    if (actionType === 'outward') {
      return performStationCommitment(state, slotNumber, 'outward', chosenOption, undefined, chosenPaymentTokens);
    }
  }
  // Fallback / legacy support:
  if (actionType === 'standby') {
    return performCatwalkPlacement(state, slotNumber);
  }
  if (actionType === 'inward') {
    const s1 = performCatwalkPlacement(state, slotNumber);
    return performStationCommitment(s1, slotNumber, 'inward');
  }
  if (actionType === 'outward') {
    const s1 = performCatwalkPlacement(state, slotNumber);
    return performStationCommitment(s1, slotNumber, 'outward', chosenOption, undefined, chosenPaymentTokens);
  }
  return state;
}

/**
 * Center Pantry Action:
 * Player places their Head Brewer meeple in the Center Space of the board (Catwalk Station #7)
 * and collects 1 wooden ingredient token of any type (Grain, Hops, Yeast, Fruit, Spices, Chocolate).
 */
export function performCenterPantryAction(
  state: GameState,
  chosenIngredient: IngredientTaxonomy
): GameState {
  if (!state.rotaryBoard) return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];
  if (!player) return state;

  // In Phase 3, forward directly to performStationCommitment for Station #7 (Resolves in numerical initiative order)
  if (state.phase === 'PHASE_3_STATION_COMMITMENT') {
    return performStationCommitment(state, 7, 'inward', undefined, chosenIngredient);
  }

  // In Phase 2, forward directly to performCatwalkPlacement for Station #7 (Meeple placed in standby, no immediate draft)
  if (state.phase === 'PHASE_2_CATWALK_PLACEMENT' || state.phase === 'PHASE_1_WORKER_DRAFT') {
    return performCatwalkPlacement(state, 7);
  }

  return state;
}


/**
 * End-of-Shift Slide:
 * When all meeples occupy Left or Right wings, players simultaneously complete their turns
 * and slide their meeples sideways into that station's Center Bay (Standby),
 * instantly resetting turn priority for the next round!
 */
export function performEndOfShiftSlide(state: GameState): GameState {
  if (!state.rotaryBoard) return state;

  // Mandatory Warehouse Capacity Enforcement: Human players cannot complete shift slide while over capacity
  const humanPlayer = state.players.find((p) => !p.isAI);
  if (humanPlayer) {
    const totalTokens = Object.values(humanPlayer.tokens || {}).reduce((sum, v) => sum + (v || 0), 0);
    const cap = getWarehouseCapacity(humanPlayer);
    if (totalTokens > cap) {
      return state;
    }
  }

  const rotaryBoard: RotaryBoardState = {
    ...state.rotaryBoard,
    slots: {
      1: { ...state.rotaryBoard.slots[1] },
      2: { ...state.rotaryBoard.slots[2] },
      3: { ...state.rotaryBoard.slots[3] },
      4: { ...state.rotaryBoard.slots[4] },
      5: { ...state.rotaryBoard.slots[5] },
      6: { ...state.rotaryBoard.slots[6] },
      7: { ...state.rotaryBoard.slots[7] },
    },
    pantryOccupants: { ...(state.rotaryBoard.pantryOccupants || {}) },
    centerSpaceOccupant: null,
    centerRingHotSeat: null,
    hotSeatPlayerId: null,
    evictedFromStation: null,
  };

  const newTurnOrder: string[] = [];

  ([1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]).forEach((slotNum) => {
    const slot = rotaryBoard.slots[slotNum];
    // Meeples persist in their inward hoppers / outer shelves until Phase 3 of the next shift
    const occupant = slot.inwardOccupant || slot.outwardOccupant || slot.catwalkOccupant;
    const playerIdAtStation = occupant?.playerId || state.players.find((p) => p.lastOccupiedStation === slotNum)?.id;
    if (occupant) {
      slot.standbyOccupant = occupant;
    }
    if (playerIdAtStation && !newTurnOrder.includes(playerIdAtStation)) {
      newTurnOrder.push(playerIdAtStation);
    }
  });

  if (newTurnOrder.length > 0) {
    rotaryBoard.turnOrder = newTurnOrder;
  }

  const logs = addLog(
    state.logs,
    state.turnNumber,
    state.players[state.currentPlayerIndex],
    state.phase,
    '🔄 END-OF-SHIFT SLIDE! All meeples slid sideways into Center Bays. Turn priority reset for next shift!'
  );

  return {
    ...state,
    rotaryBoard,
    logs,
  };
}


export function executePhase2ConveyorOperations(state: GameState): GameState {
  const players = state.players.map(clonePlayer);
  let logs = [...state.logs];
  let centralHoppers = { ...(state.centralHoppers || TOTAL_TOKEN_POOL) };
  let kettlePool = { ...(state.kettlePool || { grain: 0, hops: 0, yeast: 0, fruit: 0, spices: 0, chocolate: 0 }) };
  let endgameTriggeredByPlayerId = state.endgameTriggeredByPlayerId;
  let isFinalRound = state.isFinalRound;

  for (const player of players) {
    // 1. Deliver & Score: Column 5 (Packaging / Canning Lines) -> Completed Trophy Rack (After packaging!)
    while (player.zones[5].recipes.length > 0) {
      const delivered = player.zones[5].recipes.shift()!;
      (delivered as any).scored = true;
      if (!player.completedBatches) player.completedBatches = [];
      player.completedBatches.push(delivered);
      player.score += delivered.vp;
      player.scoreBreakdown.recipeBaseVp += delivered.vp;

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_2_CONVEYOR_OPERATIONS',
        `🍺 DELIVERED & SCORED: ${delivered.name} (+${delivered.vp} Prestige VP) completed packaging in Zone 5 and delivered to Trophy Rack! Total delivered: ${player.completedBatches.length}/${state.targetBatchesToTriggerEnd}`
      );

      // Automated Keg Racker: take 1 Grain and 1 Yeast from central hoppers
      const kegRackerCount = countUpgradeEffect(player, 'delivery_take_grain_and_yeast');
      for (let k = 0; k < kegRackerCount; k++) {
        if (centralHoppers.grain > 0) {
          centralHoppers.grain -= 1;
          player.tokens.grain = (player.tokens.grain || 0) + 1;
        }
        if (centralHoppers.yeast > 0) {
          centralHoppers.yeast -= 1;
          player.tokens.yeast = (player.tokens.yeast || 0) + 1;
        }
        logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `⚙️ Automated Keg Racker delivery: +1 GRAIN & +1 YEAST tokens.`);
      }

      // Taproom Lead: Take 1 Spices from the Market
      const taproomLeadCount = countUpgradeEffect(player, 'delivery_take_spices') + countUpgradeEffect(player, 'delivery_take_pantry_token');
      for (let t = 0; t < taproomLeadCount; t++) {
        const spiceChoice: IngredientTaxonomy = (centralHoppers.spices > 0) ? 'spices' : (centralHoppers.grain > 0 ? 'grain' : 'hops');
        if (centralHoppers[spiceChoice] > 0) {
          centralHoppers[spiceChoice] -= 1;
          player.tokens[spiceChoice] = (player.tokens[spiceChoice] || 0) + 1;
          logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `🍺 Taproom Lead delivery bonus: +1 ${spiceChoice.toUpperCase()} token from the Market.`);
        }
      }

      // Case Packer & Date Coder: Take 1 Hops from the Market
      const casePackerCount = countUpgradeEffect(player, 'delivery_take_hops');
      for (let c = 0; c < casePackerCount; c++) {
        if (centralHoppers.hops > 0) {
          centralHoppers.hops -= 1;
          player.tokens.hops = (player.tokens.hops || 0) + 1;
          logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `📦 Case Packer delivery bonus: +1 HOPS token from the Market.`);
        }
      }

      // Pallet Stretch Wrapper: Retain 1 spent Grain
      const stretchGrainCount = countUpgradeEffect(player, 'delivery_retain_spent_grain') + countUpgradeEffect(player, 'delivery_retain_spent_token');
      for (let s = 0; s < stretchGrainCount; s++) {
        player.tokens.grain = (player.tokens.grain || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `📦 Pallet Stretch Wrapper: Retained 1 spent GRAIN token.`);
      }

      // QA & Packaging Lead: Retain 1 spent Hops
      const qaHopsCount = countUpgradeEffect(player, 'delivery_retain_spent_hops');
      for (let q = 0; q < qaHopsCount; q++) {
        player.tokens.hops = (player.tokens.hops || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `🔬 QA & Packaging Lead: Retained 1 spent HOPS token.`);
      }

      // Dock Expediter & Delivery Driver: Take 1 token of any available type
      const dockExpediterCount = countUpgradeEffect(player, 'delivery_take_kettle_token');
      for (let d = 0; d < dockExpediterCount; d++) {
        const availableTax = ((Object.keys(centralHoppers) as IngredientTaxonomy[]).find(
          (tax) => (centralHoppers[tax] ?? 0) > 0
        ) || 'grain');
        if (centralHoppers[availableTax] > 0) {
          centralHoppers[availableTax] -= 1;
          player.tokens[availableTax] = (player.tokens[availableTax] || 0) + 1;
          logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `🚚 Dock Expediter / Driver delivery bonus: +1 ${availableTax.toUpperCase()} token.`);
        }
      }

      // Brand Ambassador: Take 1 token of any available type from Market upon delivering to Trophy Rack
      const ambassadorCount = countUpgradeEffect(player, 'delivery_take_market_token');
      for (let a = 0; a < ambassadorCount; a++) {
        const priorityOrder: IngredientTaxonomy[] = ['fruit', 'spices', 'chocolate', 'hops', 'yeast', 'grain'];
        const availableTax = priorityOrder.find((t) => (centralHoppers[t] ?? 0) > 0) || 'grain';
        if (centralHoppers[availableTax] > 0) {
          centralHoppers[availableTax] -= 1;
          player.tokens[availableTax] = (player.tokens[availableTax] || 0) + 1;
          logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `⭐ Brand Ambassador: Took 1 ${availableTax.toUpperCase()} token from the Market upon delivery.`);
        }
      }

      // Legacy Brand Ambassador fallback
      const legacyAmbassadorCount = countUpgradeEffect(player, 'delivery_score_bonus_vp');
      for (let a = 0; a < legacyAmbassadorCount; a++) {
        player.scoreBreakdown.upgradeTriggeredVp += 1;
        player.score += 1;
        logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `⭐ Brand Ambassador: Scored +1 bonus Victory Point on delivery.`);
      }
    }

    // 2. Advance to Packaging: Column 4 (Conditioning) -> Column 5 (Packaging & Canning Lines)
    const packagingCap = 1;
    while (player.zones[5].recipes.length < packagingCap && player.zones[4].recipes.length > 0) {
      const packaging = player.zones[4].recipes.shift()!;
      player.zones[5].recipes.push(packaging);

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_2_CONVEYOR_OPERATIONS',
        `📦 ADVANCED: ${packaging.name} moved from Conditioning & Lagering into Column 5 (Packaging & Canning Lines).`
      );

      // Route Driver: Take 1 Grain from the Market when packaging a beer
      const routeDriverCount = countUpgradeEffect(player, 'package_beer_take_grain') + countUpgradeEffect(player, 'package_beer_take_kettle_token');
      for (let r = 0; r < routeDriverCount; r++) {
        const availableTax: IngredientTaxonomy = (centralHoppers.grain > 0) ? 'grain' : 'hops';
        if (centralHoppers[availableTax] > 0) {
          centralHoppers[availableTax] -= 1;
          player.tokens[availableTax] = (player.tokens[availableTax] || 0) + 1;
          logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `🚛 Route Driver packaging perk: +1 ${availableTax.toUpperCase()} token from the Market as ${packaging.name} enters Packaging.`);
        }
      }
    }

    // 3. Advance to Conditioning: Column 3 (Cellar) -> Column 4 (Conditioning & Lagering)
    const conditioningCap = 1;
    while (player.zones[4].recipes.length < conditioningCap && player.zones[3].recipes.length > 0) {
      const conditioning = player.zones[3].recipes.shift()!;
      player.zones[4].recipes.push(conditioning);
      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_2_CONVEYOR_OPERATIONS',
        `🧪 ADVANCED: ${conditioning.name} moved from Fermentation Cellar into Column 4 (Conditioning & Lagering).`
      );

      // Kickback 1: Conical Unitank: Take 1 Hops from the hopper
      const unitankCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_hops');
      for (let u = 0; u < unitankCount; u++) {
        if (centralHoppers.hops > 0) {
          centralHoppers.hops -= 1;
          player.tokens.hops = (player.tokens.hops || 0) + 1;
          logs = addLog(
            logs,
            state.turnNumber,
            player,
            'PHASE_2_CONVEYOR_OPERATIONS',
            `⚗️ Conical Unitank kickback: +1 HOPS token as ${conditioning.name} advances into Conditioning.`
          );
        }
      }

      // Kickback 2: Plate Heat Exchanger: Take 1 Yeast from the hopper
      const heatExchangerCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_yeast');
      for (let h = 0; h < heatExchangerCount; h++) {
        if (centralHoppers.yeast > 0) {
          centralHoppers.yeast -= 1;
          player.tokens.yeast = (player.tokens.yeast || 0) + 1;
          logs = addLog(
            logs,
            state.turnNumber,
            player,
            'PHASE_2_CONVEYOR_OPERATIONS',
            `❄️ Plate Heat Exchanger kickback: +1 YEAST token as ${conditioning.name} advances into Conditioning.`
          );
        }
      }

      // Kickback 3: Glycol Cooling Jacket: Take 1 Grain from the hopper
      const glycolCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_grain');
      for (let g = 0; g < glycolCount; g++) {
        if (centralHoppers.grain > 0) {
          centralHoppers.grain -= 1;
          player.tokens.grain = (player.tokens.grain || 0) + 1;
          logs = addLog(
            logs,
            state.turnNumber,
            player,
            'PHASE_2_CONVEYOR_OPERATIONS',
            `❄️ Glycol Cooling Jacket kickback: +1 GRAIN token as ${conditioning.name} advances into Conditioning.`
          );
        }
      }

      // Kickback 4: Oak Aging Foeder & Barrel Master: Take 1 Spice from the hopper
      const foederCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_spices') + countUpgradeEffect(player, 'advance_cellar_to_pack_take_spice_or_fruit');
      for (let f = 0; f < foederCount; f++) {
        const pref: IngredientTaxonomy = (centralHoppers.spices > 0) ? 'spices' : 'fruit';
        if (centralHoppers[pref] > 0) {
          centralHoppers[pref] -= 1;
          player.tokens[pref] = (player.tokens[pref] || 0) + 1;
          logs = addLog(
            logs,
            state.turnNumber,
            player,
            'PHASE_2_CONVEYOR_OPERATIONS',
            `🪵 Oak Aging Foeder / Barrel Master kickback: +1 ${pref.toUpperCase()} token as ${conditioning.name} advances into Conditioning.`
          );
        }
      }

      // Kickback 5: Centrifuge Clarifier & Dry-Hop Lead: Take 1 Hops from the hopper
      const hopKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_hops');
      for (let c = 0; c < hopKickbacks; c++) {
        if (centralHoppers.hops > 0) {
          centralHoppers.hops -= 1;
          player.tokens.hops = (player.tokens.hops || 0) + 1;
          logs = addLog(
            logs,
            state.turnNumber,
            player,
            'PHASE_2_CONVEYOR_OPERATIONS',
            `🌿 Conditioning kickback: +1 HOPS token as ${conditioning.name} advances into Conditioning.`
          );
        }
      }

      // Kickback 6: Bright Conditioning Rig & Cellar Apprentice: Take 1 Yeast from the hopper
      const yeastKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_yeast');
      for (let b = 0; b < yeastKickbacks; b++) {
        if (centralHoppers.yeast > 0) {
          centralHoppers.yeast -= 1;
          player.tokens.yeast = (player.tokens.yeast || 0) + 1;
          logs = addLog(
            logs,
            state.turnNumber,
            player,
            'PHASE_2_CONVEYOR_OPERATIONS',
            `🧪 Conditioning kickback: +1 YEAST token as ${conditioning.name} advances into Conditioning.`
          );
        }
      }

      // Kickback 7: Lagering Tank: Take 1 Grain from the hopper
      const grainKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_grain');
      for (let l = 0; l < grainKickbacks; l++) {
        if (centralHoppers.grain > 0) {
          centralHoppers.grain -= 1;
          player.tokens.grain = (player.tokens.grain || 0) + 1;
          logs = addLog(
            logs,
            state.turnNumber,
            player,
            'PHASE_2_CONVEYOR_OPERATIONS',
            `🌾 Lagering Tank kickback: +1 GRAIN token as ${conditioning.name} advances into Conditioning.`
          );
        }
      }
    }

    // Migrate any recipes in rightWing from earlier turns back to zones[5].recipes
    if (player.rightWing && player.rightWing.length > 0) {
      const recipeWings = player.rightWing.filter((r: any) => r.deckType === 'recipe');
      for (const rw of recipeWings) {
        if (!player.zones[5].recipes.some((r) => r.id === rw.id)) {
          (rw as any).scored = true;
          player.zones[5].recipes.push(rw as any);
        }
      }
      player.rightWing = player.rightWing.filter((r: any) => r.deckType !== 'recipe');
    }

    // Check win condition using targetBatchesToTriggerEnd (Batches delivered to Trophy Rack after moving through all 5 zones)
    const completedCount = player.completedBatches?.length || 0;
    if (completedCount >= state.targetBatchesToTriggerEnd && !isFinalRound) {
      endgameTriggeredByPlayerId = player.id;
      isFinalRound = true;
      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_2_CONVEYOR_OPERATIONS',
        `🏆 WIN CONDITION MET! ${player.name} has delivered ${completedCount} batches to the Trophy Rack (Target: ${state.targetBatchesToTriggerEnd})!`
      );
    }

    // 4. Advance to Fermentation: Column 2 (Brewhouse) -> Column 3 (Cellar)
    const cellarCap =
      hasUpgradeInstalled(player, 'Glycol') ||
      countUpgradeEffect(player, 'advance_cellar_to_pack_take_grain') > 0 ||
      countUpgradeEffect(player, 'carboy_capacity_plus_1') > 0
        ? 2
        : 1;
    if (player.zones[3].recipes.length < cellarCap && player.zones[2].recipes.length > 0) {
      const fermenting = player.zones[2].recipes.shift()!;
      player.zones[3].recipes.push(fermenting);
      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_2_CONVEYOR_OPERATIONS',
        `🔥 ADVANCED: ${fermenting.name} moved from Brewhouse into Column 3 (Fermentation Cellar).`
      );

      // Kickback: Centrifuge Clarifier & Cellar Apprentice: +1 Hops
      const hopCellarKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_hops');
      for (let c = 0; c < hopCellarKickbacks; c++) {
        if (centralHoppers.hops > 0) {
          centralHoppers.hops -= 1;
          player.tokens.hops = (player.tokens.hops || 0) + 1;
          logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `🌿 Cellar advance kickback: +1 HOPS token as ${fermenting.name} enters Fermentation Cellar.`);
        }
      }
      // Kickback: Lagering Tank & Racking Specialist: +1 Grain
      const grainCellarKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_grain');
      for (let l = 0; l < grainCellarKickbacks; l++) {
        if (centralHoppers.grain > 0) {
          centralHoppers.grain -= 1;
          player.tokens.grain = (player.tokens.grain || 0) + 1;
          logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `🌾 Cellar advance kickback: +1 GRAIN token as ${fermenting.name} enters Fermentation Cellar.`);
        }
      }
      // Kickback: Bright Conditioning Rig & Lead Cellarman: +1 Yeast
      const yeastCellarKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_yeast');
      for (let y = 0; y < yeastCellarKickbacks; y++) {
        if (centralHoppers.yeast > 0) {
          centralHoppers.yeast -= 1;
          player.tokens.yeast = (player.tokens.yeast || 0) + 1;
          logs = addLog(logs, state.turnNumber, player, 'PHASE_2_CONVEYOR_OPERATIONS', `🧪 Cellar advance kickback: +1 YEAST token as ${fermenting.name} enters Fermentation Cellar.`);
        }
      }
    }

    // 5. Advance to Brewhouse: Column 1 (Warehouse) -> Column 2 (Brewhouse Kettle)
    const brewhouseCap = 1;
    if (player.zones[2].recipes.length < brewhouseCap && player.zones[1].recipes.length > 0) {
      const boiling = player.zones[1].recipes.shift()!;
      player.zones[2].recipes.push(boiling);
      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_2_CONVEYOR_OPERATIONS',
        `🔥 ADVANCED: ${boiling.name} moved from Warehouse Staging into Column 2 (Brewhouse Kettle).`
      );
    }

    updatePlayerMat(player);
    if (player.isAI) {
      logs = enforceAiWarehouseCapacity(player, centralHoppers, logs, state.turnNumber);
    }
  }

  const nextPhase: TurnPhase = isFinalRound && endgameTriggeredByPlayerId ? 'GAME_OVER' : 'PHASE_3_SHIFT_RESET';
  let winnerIds = state.winnerIds || [];
  if (nextPhase === 'GAME_OVER') {
    const maxScore = Math.max(...players.map((p) => p.score));
    winnerIds = players.filter((p) => p.score === maxScore).map((p) => p.id);
  }

  let stateWithMixers: GameState = {
    ...state,
    players,
    phase: nextPhase,
    shiftPhase: nextPhase === 'GAME_OVER' ? 'GAME_OVER' : 'PHASE_3_SHIFT_RESET',
    centralHoppers,
    kettlePool,
    endgameTriggeredByPlayerId,
    isFinalRound,
    winnerIds,
    logs,
  };

  // Evaluate and claim any Mixer Pack set bounties for each player
  for (let pIdx = 0; pIdx < stateWithMixers.players.length; pIdx++) {
    const claimRes = checkAndClaimMixerPacks(stateWithMixers, pIdx);
    stateWithMixers = claimRes.state;
  }

  return stateWithMixers;
}

export function executePhase3ShiftReset(state: GameState): GameState {
  if (state.phase === 'GAME_OVER') return state;

  const rotaryBoard: RotaryBoardState = {
    ...state.rotaryBoard!,
    slots: {
      1: { ...state.rotaryBoard!.slots[1] },
      2: { ...state.rotaryBoard!.slots[2] },
      3: { ...state.rotaryBoard!.slots[3] },
      4: { ...state.rotaryBoard!.slots[4] },
      5: { ...state.rotaryBoard!.slots[5] },
      6: { ...state.rotaryBoard!.slots[6] },
      7: { ...state.rotaryBoard!.slots[7] },
    },
    pantryOccupants: { ...(state.rotaryBoard!.pantryOccupants || {}) },
    centerSpaceOccupant: null,
    centerRingHotSeat: null,
    hotSeatPlayerId: null,
    evictedFromStation: null,
  };

  const newTurnOrder: string[] = [];

  // Meeples persist in their hoppers & shelves across shifts until their turn in Phase 2/3
  ([1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]).forEach((slotNum) => {
    const slot = rotaryBoard.slots[slotNum];
    const occupant = slot.inwardOccupant || slot.outwardOccupant || slot.catwalkOccupant;
    if (occupant) {
      slot.standbyOccupant = occupant;
      if (!newTurnOrder.includes(occupant.playerId)) {
        newTurnOrder.push(occupant.playerId);
      }
    }
  });

  rotaryBoard.turnOrder = newTurnOrder.length > 0 ? newTurnOrder : state.rotaryBoard?.turnOrder || state.players.map((p) => p.id);
  rotaryBoard.standby_bays = ([1, 2, 3, 4, 5, 6] as RotarySlotNumber[]).map((id) => ({
    id,
    occupants: rotaryBoard.slots[id].standbyOccupant ? [rotaryBoard.slots[id].standbyOccupant!] : [],
  }));

  const players = state.players.map((p) => {
    const cp = clonePlayer(p);
    cp.actionsTakenThisShift = 0;
    cp.actions_taken_this_shift = 0;
    cp.isClockedIn = false;
    updatePlayerMat(cp);
    return cp;
  });

  const firstPlayerId = newTurnOrder[0] || players[0].id;
  const firstPlayerIndex = Math.max(0, players.findIndex((p) => p.id === firstPlayerId));

  let logs = addLog(
    state.logs,
    state.turnNumber + 1,
    players[firstPlayerIndex],
    'PHASE_1_WORKER_DRAFT',
    `🔄 SHIFT RESET: Workers slid sideways into Center Standby Bays. Priority #1 goes to ${players[firstPlayerIndex].name} in lowest occupied bay!`
  );

  const resetState: GameState = {
    ...state,
    players,
    rotaryBoard,
    currentPlayerIndex: firstPlayerIndex,
    turnNumber: state.turnNumber + 1,
    roundNumber: state.roundNumber + 1,
    phase: 'PHASE_2_CATWALK_PLACEMENT',
    shiftPhase: 'PHASE_2_CATWALK_PLACEMENT',
    logs,
  };

  return executePhase1MarketRefresh(resetState);
}

/**
 * Returns/discards 1 token of a given taxonomy from player warehouse back into central hoppers.
 * Enables cycling storage when full or whenever desired.
 */
export function performDiscardToken(
  state: GameState,
  playerId: string,
  taxonomy: IngredientTaxonomy
): GameState {
  const players = state.players.map(clonePlayer);
  const player = players.find((p) => p.id === playerId);
  if (!player) return state;

  if ((player.tokens[taxonomy] || 0) <= 0) return state;

  player.tokens[taxonomy] -= 1;
  const centralHoppers = { ...(state.centralHoppers || TOTAL_TOKEN_POOL) };
  centralHoppers[taxonomy] = (centralHoppers[taxonomy] || 0) + 1;

  let logs = [...state.logs];
  const cap = getWarehouseCapacity(player);
  const cur = Object.values(player.tokens).reduce((s, v) => s + (v || 0), 0);
  logs = addLog(
    logs,
    state.turnNumber,
    player,
    'WORK_DAY',
    `♻️ CYCLED / RETURNED: ${player.name} returned 1 ${taxonomy.toUpperCase()} token to the central hopper (${cur}/${cap} stored).`
  );

  return {
    ...state,
    players,
    centralHoppers,
    logs,
  };
}

/**
 * Automatically enforces warehouse capacity for AI players by returning excess
 * tokens back to central hoppers. AI prioritizes returning tokens with the highest
 * stored counts.
 */
export function enforceAiWarehouseCapacity(
  player: PlayerState,
  centralHoppers: Record<IngredientTaxonomy, number>,
  logs: LogEntry[],
  turnNumber: number
): LogEntry[] {
  if (!player.isAI) return logs;
  const cap = getWarehouseCapacity(player);
  let total = Object.values(player.tokens).reduce((sum, v) => sum + (v || 0), 0);
  if (total <= cap) return logs;

  let nextLogs = logs;
  const excess = total - cap;
  const taxOrder: IngredientTaxonomy[] = ['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'];
  for (let i = 0; i < excess; i++) {
    const available = taxOrder.filter((t) => (player.tokens[t] || 0) > 0);
    if (available.length === 0) break;
    available.sort((a, b) => (player.tokens[b] || 0) - (player.tokens[a] || 0));
    const chosenTax = available[0];
    player.tokens[chosenTax] -= 1;
    centralHoppers[chosenTax] = (centralHoppers[chosenTax] || 0) + 1;
    nextLogs = addLog(
      nextLogs,
      turnNumber,
      player,
      'WORK_DAY',
      `♻️ WAREHOUSE RETURN: ${player.name} returned 1 ${chosenTax.toUpperCase()} token to Central Hoppers to meet Warehouse Capacity (${cap}).`
    );
  }
  return nextLogs;
}


/**
 * Advances a single player's brewery conveyor pipeline rightward (1->2->3->4->5->Trophy Rack).
 * Reusable by both Phase 2 global conveyor operations and Department #1 (The Night Shift).
 */
export function advanceSinglePlayerPipeline(
  player: PlayerState,
  state: GameState,
  centralHoppers: Record<IngredientTaxonomy, number>,
  logs: LogEntry[],
  phaseTag: TurnPhase = 'PHASE_2_CONVEYOR_OPERATIONS'
): { logs: LogEntry[]; isFinalRound: boolean; endgameTriggeredByPlayerId: string | null } {
  let isFinalRound = state.isFinalRound;
  let endgameTriggeredByPlayerId = state.endgameTriggeredByPlayerId;

  // 1. Deliver & Score: Column 5 (Packaging / Canning Lines) -> Completed Trophy Rack (After packaging!)
  while (player.zones[5].recipes.length > 0) {
    const delivered = player.zones[5].recipes.shift()!;
    (delivered as any).scored = true;
    if (!player.completedBatches) player.completedBatches = [];
    player.completedBatches.push(delivered);
    player.score += delivered.vp;
    player.scoreBreakdown.recipeBaseVp += delivered.vp;

    logs = addLog(
      logs,
      state.turnNumber,
      player,
      phaseTag,
      `🍺 DELIVERED & SCORED: ${delivered.name} (+${delivered.vp} Prestige VP) completed packaging in Zone 5 and delivered to Trophy Rack! Total delivered: ${player.completedBatches.length}/${state.targetBatchesToTriggerEnd}`
    );

    // Automated Keg Racker: take 1 Grain and 1 Yeast from central hoppers
    const kegRackerCount = countUpgradeEffect(player, 'delivery_take_grain_and_yeast');
    for (let k = 0; k < kegRackerCount; k++) {
      if (centralHoppers.grain > 0) {
        centralHoppers.grain -= 1;
        player.tokens.grain = (player.tokens.grain || 0) + 1;
      }
      if (centralHoppers.yeast > 0) {
        centralHoppers.yeast -= 1;
        player.tokens.yeast = (player.tokens.yeast || 0) + 1;
      }
      logs = addLog(logs, state.turnNumber, player, phaseTag, `⚙️ Automated Keg Racker delivery: +1 GRAIN & +1 YEAST tokens.`);
    }

    // Taproom Lead: Take 1 Spices from the Market
    const taproomLeadCount = countUpgradeEffect(player, 'delivery_take_spices') + countUpgradeEffect(player, 'delivery_take_pantry_token');
    for (let t = 0; t < taproomLeadCount; t++) {
      const spiceChoice: IngredientTaxonomy = (centralHoppers.spices > 0) ? 'spices' : (centralHoppers.grain > 0 ? 'grain' : 'hops');
      if (centralHoppers[spiceChoice] > 0) {
        centralHoppers[spiceChoice] -= 1;
        player.tokens[spiceChoice] = (player.tokens[spiceChoice] || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, phaseTag, `🍺 Taproom Lead delivery bonus: +1 ${spiceChoice.toUpperCase()} token from the Market.`);
      }
    }

    // Case Packer & Date Coder: Take 1 Hops from the Market
    const casePackerCount = countUpgradeEffect(player, 'delivery_take_hops');
    for (let c = 0; c < casePackerCount; c++) {
      if (centralHoppers.hops > 0) {
        centralHoppers.hops -= 1;
        player.tokens.hops = (player.tokens.hops || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, phaseTag, `📦 Case Packer delivery bonus: +1 HOPS token from the Market.`);
      }
    }

    // Pallet Stretch Wrapper: Retain 1 spent Grain
    const stretchGrainCount = countUpgradeEffect(player, 'delivery_retain_spent_grain') + countUpgradeEffect(player, 'delivery_retain_spent_token');
    for (let s = 0; s < stretchGrainCount; s++) {
      player.tokens.grain = (player.tokens.grain || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, phaseTag, `📦 Pallet Stretch Wrapper: Retained 1 spent GRAIN token.`);
    }

    // QA & Packaging Lead: Retain 1 spent Hops
    const qaHopsCount = countUpgradeEffect(player, 'delivery_retain_spent_hops');
    for (let q = 0; q < qaHopsCount; q++) {
      player.tokens.hops = (player.tokens.hops || 0) + 1;
      logs = addLog(logs, state.turnNumber, player, phaseTag, `🔬 QA & Packaging Lead: Retained 1 spent HOPS token.`);
    }

    // Dock Expediter & Delivery Driver: Take 1 token of any available type
    const dockExpediterCount = countUpgradeEffect(player, 'delivery_take_kettle_token');
    for (let d = 0; d < dockExpediterCount; d++) {
      const availableTax = ((Object.keys(centralHoppers) as IngredientTaxonomy[]).find(
        (tax) => (centralHoppers[tax] ?? 0) > 0
      ) || 'grain');
      if (centralHoppers[availableTax] > 0) {
        centralHoppers[availableTax] -= 1;
        player.tokens[availableTax] = (player.tokens[availableTax] || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, phaseTag, `🚚 Dock Expediter / Driver delivery bonus: +1 ${availableTax.toUpperCase()} token.`);
      }
    }

    // Brand Ambassador: Take 1 token of any available type from Market upon delivering to Trophy Rack
    const ambassadorCount = countUpgradeEffect(player, 'delivery_take_market_token');
    for (let a = 0; a < ambassadorCount; a++) {
      const priorityOrder: IngredientTaxonomy[] = ['fruit', 'spices', 'chocolate', 'hops', 'yeast', 'grain'];
      const availableTax = priorityOrder.find((t) => (centralHoppers[t] ?? 0) > 0) || 'grain';
      if (centralHoppers[availableTax] > 0) {
        centralHoppers[availableTax] -= 1;
        player.tokens[availableTax] = (player.tokens[availableTax] || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, phaseTag, `⭐ Brand Ambassador: Took 1 ${availableTax.toUpperCase()} token from the Market upon delivery.`);
      }
    }

    // Legacy Brand Ambassador fallback
    const legacyAmbassadorCount = countUpgradeEffect(player, 'delivery_score_bonus_vp');
    for (let a = 0; a < legacyAmbassadorCount; a++) {
      player.scoreBreakdown.upgradeTriggeredVp += 1;
      player.score += 1;
      logs = addLog(logs, state.turnNumber, player, phaseTag, `⭐ Brand Ambassador: Scored +1 bonus Victory Point on delivery.`);
    }
  }

  // 2. Advance to Packaging: Column 4 (Conditioning) -> Column 5 (Packaging & Canning Lines)
  const packagingCap = 1;
  while (player.zones[5].recipes.length < packagingCap && player.zones[4].recipes.length > 0) {
    const packaging = player.zones[4].recipes.shift()!;
    player.zones[5].recipes.push(packaging);

    logs = addLog(
      logs,
      state.turnNumber,
      player,
      phaseTag,
      `📦 ADVANCED: ${packaging.name} moved from Conditioning & Lagering into Column 5 (Packaging & Canning Lines).`
    );

    // Route Driver kickback
    const routeDriverCount = countUpgradeEffect(player, 'package_beer_take_grain') + countUpgradeEffect(player, 'package_beer_take_kettle_token');
    for (let r = 0; r < routeDriverCount; r++) {
      const availableTax: IngredientTaxonomy = (centralHoppers.grain > 0) ? 'grain' : 'hops';
      if (centralHoppers[availableTax] > 0) {
        centralHoppers[availableTax] -= 1;
        player.tokens[availableTax] = (player.tokens[availableTax] || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, phaseTag, `🚛 Route Driver packaging perk: +1 ${availableTax.toUpperCase()} token from the Market as ${packaging.name} enters Packaging.`);
      }
    }
  }

  // 3. Advance to Conditioning: Column 3 (Cellar) -> Column 4 (Conditioning & Lagering)
  const conditioningCap = 1;
  while (player.zones[4].recipes.length < conditioningCap && player.zones[3].recipes.length > 0) {
    const conditioning = player.zones[3].recipes.shift()!;
    player.zones[4].recipes.push(conditioning);
    logs = addLog(
      logs,
      state.turnNumber,
      player,
      phaseTag,
      `🧪 ADVANCED: ${conditioning.name} moved from Fermentation Cellar into Column 4 (Conditioning & Lagering).`
    );

    // Kickback 1: Conical Unitank: Take 1 Hops from the hopper
    const unitankCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_hops');
    for (let u = 0; u < unitankCount; u++) {
      if (centralHoppers.hops > 0) {
        centralHoppers.hops -= 1;
        player.tokens.hops = (player.tokens.hops || 0) + 1;
        logs = addLog(
          logs,
          state.turnNumber,
          player,
          phaseTag,
          `⚗️ Conical Unitank kickback: +1 HOPS token as ${conditioning.name} advances into Conditioning.`
        );
      }
    }

    // Kickback 2: Plate Heat Exchanger: Take 1 Yeast from the hopper
    const heatExchangerCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_yeast');
    for (let h = 0; h < heatExchangerCount; h++) {
      if (centralHoppers.yeast > 0) {
        centralHoppers.yeast -= 1;
        player.tokens.yeast = (player.tokens.yeast || 0) + 1;
        logs = addLog(
          logs,
          state.turnNumber,
          player,
          phaseTag,
          `❄️ Plate Heat Exchanger kickback: +1 YEAST token as ${conditioning.name} advances into Conditioning.`
        );
      }
    }

    // Kickback 3: Glycol Cooling Jacket: Take 1 Grain from the hopper
    const glycolCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_grain');
    for (let g = 0; g < glycolCount; g++) {
      if (centralHoppers.grain > 0) {
        centralHoppers.grain -= 1;
        player.tokens.grain = (player.tokens.grain || 0) + 1;
        logs = addLog(
          logs,
          state.turnNumber,
          player,
          phaseTag,
          `❄️ Glycol Cooling Jacket kickback: +1 GRAIN token as ${conditioning.name} advances into Conditioning.`
        );
      }
    }

    // Kickback 4: Oak Aging Foeder & Barrel Master: Take 1 Spice from the hopper
    const foederCount = countUpgradeEffect(player, 'advance_cellar_to_pack_take_spices') + countUpgradeEffect(player, 'advance_cellar_to_pack_take_spice_or_fruit');
    for (let f = 0; f < foederCount; f++) {
      const pref: IngredientTaxonomy = (centralHoppers.spices > 0) ? 'spices' : 'fruit';
      if (centralHoppers[pref] > 0) {
        centralHoppers[pref] -= 1;
        player.tokens[pref] = (player.tokens[pref] || 0) + 1;
        logs = addLog(
          logs,
          state.turnNumber,
          player,
          phaseTag,
          `🪵 Oak Aging Foeder / Barrel Master kickback: +1 ${pref.toUpperCase()} token as ${conditioning.name} advances into Conditioning.`
        );
      }
    }

    // Kickback 5: Centrifuge Clarifier & Dry-Hop Lead: Take 1 Hops from the hopper
    const hopKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_hops');
    for (let c = 0; c < hopKickbacks; c++) {
      if (centralHoppers.hops > 0) {
        centralHoppers.hops -= 1;
        player.tokens.hops = (player.tokens.hops || 0) + 1;
        logs = addLog(
          logs,
          state.turnNumber,
          player,
          phaseTag,
          `🌿 Conditioning kickback: +1 HOPS token as ${conditioning.name} advances into Conditioning.`
        );
      }
    }

    // Kickback 6: Bright Conditioning Rig & Cellar Apprentice: Take 1 Yeast from the hopper
    const yeastKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_yeast');
    for (let b = 0; b < yeastKickbacks; b++) {
      if (centralHoppers.yeast > 0) {
        centralHoppers.yeast -= 1;
        player.tokens.yeast = (player.tokens.yeast || 0) + 1;
        logs = addLog(
          logs,
          state.turnNumber,
          player,
          phaseTag,
          `🧪 Conditioning kickback: +1 YEAST token as ${conditioning.name} advances into Conditioning.`
        );
      }
    }

    // Kickback 7: Lagering Tank: Take 1 Grain from the hopper
    const grainKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_grain');
    for (let l = 0; l < grainKickbacks; l++) {
      if (centralHoppers.grain > 0) {
        centralHoppers.grain -= 1;
        player.tokens.grain = (player.tokens.grain || 0) + 1;
        logs = addLog(
          logs,
          state.turnNumber,
          player,
          phaseTag,
          `🌾 Lagering Tank kickback: +1 GRAIN token as ${conditioning.name} advances into Conditioning.`
        );
      }
    }
  }

  // Migrate any recipes in rightWing from earlier turns back to zones[5].recipes
  if (player.rightWing && player.rightWing.length > 0) {
    const recipeWings = player.rightWing.filter((r: any) => r.deckType === 'recipe');
    for (const rw of recipeWings) {
      if (!player.zones[5].recipes.some((r) => r.id === rw.id)) {
        (rw as any).scored = true;
        player.zones[5].recipes.push(rw as any);
      }
    }
    player.rightWing = player.rightWing.filter((r: any) => r.deckType !== 'recipe');
  }

  // Check win condition using targetBatchesToTriggerEnd
  const completedCount = player.completedBatches?.length || 0;
  if (completedCount >= state.targetBatchesToTriggerEnd && !isFinalRound) {
    endgameTriggeredByPlayerId = player.id;
    isFinalRound = true;
    logs = addLog(
      logs,
      state.turnNumber,
      player,
      phaseTag,
      `🏆 WIN CONDITION MET! ${player.name} has delivered ${completedCount} batches to the Trophy Rack (Target: ${state.targetBatchesToTriggerEnd})!`
    );
  }

  // 4. Advance to Fermentation: Column 2 (Brewhouse) -> Column 3 (Cellar)
  const cellarCap =
    hasUpgradeInstalled(player, 'Glycol') ||
    countUpgradeEffect(player, 'advance_cellar_to_pack_take_grain') > 0 ||
    countUpgradeEffect(player, 'carboy_capacity_plus_1') > 0
      ? 2
      : 1;
  if (player.zones[3].recipes.length < cellarCap && player.zones[2].recipes.length > 0) {
    const fermenting = player.zones[2].recipes.shift()!;
    player.zones[3].recipes.push(fermenting);
    logs = addLog(
      logs,
      state.turnNumber,
      player,
      phaseTag,
      `🔥 ADVANCED: ${fermenting.name} moved from Brewhouse into Column 3 (Fermentation Cellar).`
    );

    // Kickbacks into Fermentation
    const hopCellarKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_hops');
    for (let c = 0; c < hopCellarKickbacks; c++) {
      if (centralHoppers.hops > 0) {
        centralHoppers.hops -= 1;
        player.tokens.hops = (player.tokens.hops || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, phaseTag, `🌿 Cellar advance kickback: +1 HOPS token as ${fermenting.name} enters Fermentation Cellar.`);
      }
    }
    const grainCellarKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_grain');
    for (let l = 0; l < grainCellarKickbacks; l++) {
      if (centralHoppers.grain > 0) {
        centralHoppers.grain -= 1;
        player.tokens.grain = (player.tokens.grain || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, phaseTag, `🌾 Cellar advance kickback: +1 GRAIN token as ${fermenting.name} enters Fermentation Cellar.`);
      }
    }
    const yeastCellarKickbacks = countUpgradeEffect(player, 'advance_brewhouse_to_cellar_take_yeast');
    for (let y = 0; y < yeastCellarKickbacks; y++) {
      if (centralHoppers.yeast > 0) {
        centralHoppers.yeast -= 1;
        player.tokens.yeast = (player.tokens.yeast || 0) + 1;
        logs = addLog(logs, state.turnNumber, player, phaseTag, `🧪 Cellar advance kickback: +1 YEAST token as ${fermenting.name} enters Fermentation Cellar.`);
      }
    }
  }

  // 5. Advance Staged Recipes: Column 1 (Warehouse) -> Column 2 (Brewhouse)
  const brewhouseCap = 1;
  if (player.zones[2].recipes.length < brewhouseCap && player.zones[1].recipes.length > 0) {
    const staged = player.zones[1].recipes.shift()!;
    player.zones[2].recipes.push(staged);
    logs = addLog(
      logs,
      state.turnNumber,
      player,
      phaseTag,
      `📦 ADVANCED: ${staged.name} moved from Warehouse Staging into Column 2 (Brewhouse Kettle).`
    );
  }

  updatePlayerMat(player);
  return { logs, isFinalRound, endgameTriggeredByPlayerId };
}



/**
 * Phase 2: Personal Brewery Department Placement
 * Players may choose to place their meeple onto their personal brewery department
 * instead of a public Catwalk (1-7).
 * Mandatory Movement Rule: Cannot visit personal department two shifts in a row.
 * Turn Order: Public Catwalks (1-7) always resolve first; personal departments
 * resolve second, strictly in numerical order (#1 through #10).
 */
export function performDepartmentPlacement(
  state: GameState,
  playerId?: string
): GameState {
  if (
    state.phase !== 'PHASE_2_CATWALK_PLACEMENT' &&
    state.phase !== 'PHASE_1_WORKER_DRAFT' &&
    state.phase !== 'WORK_DAY'
  ) {
    return state;
  }
  if (!state.rotaryBoard) return state;

  const players = state.players.map(clonePlayer);
  const targetId = playerId || players[state.currentPlayerIndex]?.id;
  const playerIndex = players.findIndex((p) => p.id === targetId);
  const player = players[playerIndex];
  if (!player || !player.departmentCard) return state;

  // 1. Mandatory Movement Rule: Cannot visit personal department two shifts in a row
  if (player.lastOccupiedDepartment) {
    return state; // Blocked: Must place on a public Catwalk this shift!
  }

  // 2. Already occupied check
  if (player.departmentOccupant && player.departmentOccupant.playerId === player.id) {
    return state; // Already placed on department
  }

  const rotaryBoard: RotaryBoardState = {
    ...state.rotaryBoard,
    slots: {
      1: { ...state.rotaryBoard.slots[1] },
      2: { ...state.rotaryBoard.slots[2] },
      3: { ...state.rotaryBoard.slots[3] },
      4: { ...state.rotaryBoard.slots[4] },
      5: { ...state.rotaryBoard.slots[5] },
      6: { ...state.rotaryBoard.slots[6] },
      7: { ...state.rotaryBoard.slots[7] },
    },
  };

  // 3. Remove meeple from any catwalk 1..7 (if previously stationed there)
  for (const s of [1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]) {
    if (rotaryBoard.slots[s].catwalkOccupant?.playerId === player.id) {
      rotaryBoard.slots[s].catwalkOccupant = null;
    }
    if (rotaryBoard.slots[s].inwardOccupant?.playerId === player.id) {
      rotaryBoard.slots[s].inwardOccupant = null;
    }
    if (rotaryBoard.slots[s].outwardOccupant?.playerId === player.id) {
      rotaryBoard.slots[s].outwardOccupant = null;
    }
    if (rotaryBoard.slots[s].standbyOccupant?.playerId === player.id) {
      rotaryBoard.slots[s].standbyOccupant = null;
    }
  }
  if (rotaryBoard.centerSpaceOccupant?.playerId === player.id) {
    rotaryBoard.centerSpaceOccupant = null;
  }

  // 4. Place active player on personal department
  player.departmentOccupant = {
    playerId: player.id,
    playerName: player.name,
    playerColor: player.color,
  };

  let logs = addLog(
    state.logs,
    state.turnNumber,
    player,
    'PHASE_2_CATWALK_PLACEMENT',
    `${player.name} moved meeple into personal Department #${player.departmentCard.departmentNumber}: ${player.departmentCard.name}!`
  );

  // 5. Check if all active players have placed
  const catwalkMeeples = ([1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[])
    .filter((s) => rotaryBoard.slots[s]?.catwalkOccupant !== null && rotaryBoard.slots[s]?.catwalkOccupant !== undefined)
    .map((s) => ({ slotNumber: s, occupant: rotaryBoard.slots[s].catwalkOccupant! }));

  const deptMeeples = players
    .filter((p) => p.departmentOccupant !== null && p.departmentOccupant !== undefined && p.departmentCard)
    .map((p) => ({
      departmentNumber: p.departmentCard!.departmentNumber,
      playerId: p.departmentOccupant!.playerId,
      name: p.name,
    }));

  const totalPlacedCount = catwalkMeeples.length + deptMeeples.length;

  if (totalPlacedCount >= players.length) {
    const catwalkOrder = catwalkMeeples
      .sort((a, b) => a.slotNumber - b.slotNumber)
      .map((item) => item.occupant.playerId);

    const deptOrder = deptMeeples
      .sort((a, b) => a.departmentNumber - b.departmentNumber)
      .map((item) => item.playerId);

    const sortedOrder = [...catwalkOrder, ...deptOrder];
    rotaryBoard.turnOrder = sortedOrder;
    const firstPlayerId = sortedOrder[0];
    const firstPlayerIndex = Math.max(0, players.findIndex((p) => p.id === firstPlayerId));

    logs = addLog(
      logs,
      state.turnNumber,
      players[firstPlayerIndex],
      'PHASE_3_STATION_COMMITMENT',
      `🎯 INITIATIVE ESTABLISHED! Shift turn order: Catwalks (${catwalkOrder.length}) ➔ Departments (${deptOrder.length}): ${sortedOrder
        .map((id) => players.find((p) => p.id === id)?.name)
        .join(' ➔ ')}. ${players[firstPlayerIndex].name} acts first!`
    );

    return {
      ...state,
      players,
      rotaryBoard,
      currentPlayerIndex: firstPlayerIndex,
      phase: 'PHASE_3_STATION_COMMITMENT',
      shiftPhase: 'PHASE_3_STATION_COMMITMENT',
      logs,
    };
  }

  // Advance to next unplaced player
  let nextIdx = (state.currentPlayerIndex + 1) % players.length;
  let safety = 0;
  while (safety < players.length) {
    const nextPlayer = players[nextIdx];
    const alreadyOnCatwalk = ([1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]).some(
      (s) => rotaryBoard.slots[s]?.catwalkOccupant?.playerId === nextPlayer.id
    );
    const alreadyInDept = !!nextPlayer.departmentOccupant;
    if (!alreadyOnCatwalk && !alreadyInDept) break;
    nextIdx = (nextIdx + 1) % players.length;
    safety++;
  }

  return {
    ...state,
    players,
    rotaryBoard,
    currentPlayerIndex: nextIdx,
    logs,
  };
}

export interface DepartmentActionPayload {
  chosenToken?: IngredientTaxonomy;
  secondToken?: IngredientTaxonomy;
  discardToken?: IngredientTaxonomy;
  swapTokenOut?: IngredientTaxonomy;
  swapTokenIn?: IngredientTaxonomy;
  chosenCardId?: string;
  chosenUpgradeOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing';
  targetZoneId?: ZoneId;
}

/**
 * Phase 3: Personal Brewery Department Action Execution
 * Executed when a player who placed their meeple on their personal department resolves their turn.
 */
export function performDepartmentAction(
  state: GameState,
  payload?: DepartmentActionPayload
): GameState {
  if (
    state.phase !== 'PHASE_3_STATION_COMMITMENT' &&
    state.phase !== 'WORK_DAY' &&
    state.phase !== 'PHASE_1_WORKER_DRAFT'
  ) {
    return state;
  }
  if (!state.rotaryBoard) return state;

  const players = state.players.map(clonePlayer);
  const player = players[state.currentPlayerIndex];
  if (!player || !player.departmentCard) return state;

  // Must be stationed at their department
  if (!player.departmentOccupant || player.departmentOccupant.playerId !== player.id) {
    return state;
  }

  const dept = player.departmentCard;
  let centralHoppers = { ...(state.centralHoppers || TOTAL_TOKEN_POOL) };
  let kettlePool = { ...(state.kettlePool || { grain: 0, hops: 0, yeast: 0, fruit: 0, spices: 0, chocolate: 0 }) };
  let logs = [...state.logs];
  let isFinalRound = state.isFinalRound;
  let endgameTriggeredByPlayerId = state.endgameTriggeredByPlayerId;
  let nextBreweryDeck = [...(state.breweryDeck || [])];
  let nextBreweryDiscard = [...(state.breweryDiscard || [])];
  let nextStaffDeck = [...(state.staffDeck || [])];
  let nextStaffDiscard = [...(state.staffDiscard || [])];
  let nextEquipmentDeck = [...(state.equipmentDeck || [])];
  let nextEquipmentDiscard = [...(state.equipmentDiscard || [])];

  switch (dept.actionEffect.type) {
    case 'advance_pipeline': {
      // #1: The Night Shift - Full pipeline rightward advance
      const advanceRes = advanceSinglePlayerPipeline(player, state, centralHoppers, logs, 'PHASE_3_STATION_COMMITMENT');
      logs = advanceRes.logs;
      if (advanceRes.isFinalRound) {
        isFinalRound = true;
        endgameTriggeredByPlayerId = advanceRes.endgameTriggeredByPlayerId;
      }
      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_3_STATION_COMMITMENT',
        `🌙 THE NIGHT SHIFT: ${player.name} ran overnight transfers! All brewery pipeline batches moved rightward; Zone 5 packaged & scored!`
      );
      break;
    }

    case 'taproom_direct_sale': {
      // #2: The Taproom - Move 1 beer from Zone 4 directly to Trophy Rack (skip Zone 5)
      if (player.zones[4].recipes.length > 0) {
        const poured = player.zones[4].recipes.shift()!;
        (poured as any).scored = true;
        if (!player.completedBatches) player.completedBatches = [];
        player.completedBatches.push(poured);
        player.score += poured.vp;
        player.scoreBreakdown.recipeBaseVp += poured.vp;

        logs = addLog(
          logs,
          state.turnNumber,
          player,
          'PHASE_3_STATION_COMMITMENT',
          `🍻 THE TAPROOM: Direct-to-Consumer Draft! ${player.name} poured ${poured.name} (+${poured.vp} VP) straight from Cold Room (Zone 4) to Trophy Rack, skipping Packaging entirely!`
        );

        if (player.completedBatches.length >= state.targetBatchesToTriggerEnd && !isFinalRound) {
          isFinalRound = true;
          endgameTriggeredByPlayerId = player.id;
          logs = addLog(
            logs,
            state.turnNumber,
            player,
            'PHASE_3_STATION_COMMITMENT',
            `🏆 ENDGAME TRIGGERED! ${player.name} has poured ${player.completedBatches.length} batches to reach target (${state.targetBatchesToTriggerEnd})!`
          );
        }
      } else {
        logs = addLog(
          logs,
          state.turnNumber,
          player,
          'PHASE_3_STATION_COMMITMENT',
          `🍻 THE TAPROOM: ${player.name} opened the taps, but had no conditioned beer resting in Zone 4 (Cold Room).`
        );
      }
      break;
    }

    case 'draft_staff_top3': {
      // #3: HR Office - Look at top 3 staff, hire 1, 2 on bottom
      const top3 = nextStaffDeck.slice(0, 3);
      const chosenCard = payload?.chosenCardId
        ? top3.find((c) => c.id === payload.chosenCardId || c.name === payload.chosenCardId) || top3[0]
        : top3[0];

      if (chosenCard) {
        const targetZoneId: ZoneId = (payload?.targetZoneId || chosenCard.targetZone || 1) as ZoneId;
        const targetZone = player.zones[targetZoneId];
        // Deduct cost if possible
        const reqs = chosenCard.installTokens || { grain: 1 };
        for (const [tax, count] of Object.entries(reqs) as [IngredientTaxonomy, number][]) {
          player.tokens[tax] = Math.max(0, (player.tokens[tax] || 0) - count);
        }
        targetZone.staff.push(chosenCard);
        // Remove chosen card and move other 2 to bottom
        nextStaffDeck = nextStaffDeck.filter((c) => c.id !== chosenCard.id);
        const remainingTop = top3.filter((c) => c.id !== chosenCard.id);
        nextStaffDeck = nextStaffDeck.filter((c) => !remainingTop.some((r) => r.id === c.id));
        nextStaffDeck.push(...remainingTop);

        logs = addLog(
          logs,
          state.turnNumber,
          player,
          'PHASE_3_STATION_COMMITMENT',
          `👥 HR OFFICE: ${player.name} interviewed candidates and hired ${chosenCard.name} into Zone ${targetZoneId}!`
        );
      }
      break;
    }

    case 'draft_equipment_top3': {
      // #4: Maintenance Shop - Look at top 3 equipment, install 1, 2 on bottom
      const top3 = nextEquipmentDeck.slice(0, 3);
      const chosenCard = payload?.chosenCardId
        ? top3.find((c) => c.id === payload.chosenCardId || c.name === payload.chosenCardId) || top3[0]
        : top3[0];

      if (chosenCard) {
        const targetZoneId: ZoneId = (payload?.targetZoneId || chosenCard.targetZone || 1) as ZoneId;
        const targetZone = player.zones[targetZoneId];
        const reqs = chosenCard.installTokens || { grain: 1 };
        for (const [tax, count] of Object.entries(reqs) as [IngredientTaxonomy, number][]) {
          player.tokens[tax] = Math.max(0, (player.tokens[tax] || 0) - count);
        }
        targetZone.equipment.push(chosenCard);
        nextEquipmentDeck = nextEquipmentDeck.filter((c) => c.id !== chosenCard.id);
        const remainingTop = top3.filter((c) => c.id !== chosenCard.id);
        nextEquipmentDeck = nextEquipmentDeck.filter((c) => !remainingTop.some((r) => r.id === c.id));
        nextEquipmentDeck.push(...remainingTop);

        logs = addLog(
          logs,
          state.turnNumber,
          player,
          'PHASE_3_STATION_COMMITMENT',
          `🔧 MAINTENANCE SHOP: ${player.name} overhauled hardware and installed ${chosenCard.name} into Zone ${targetZoneId}!`
        );
      }
      break;
    }

    case 'draft_recipe_top3': {
      // #5: R&D Desk - Look at top 3 recipes, brew 1 into Zone 1 with -1 token discount, 2 on bottom
      const topRecipes = nextBreweryDeck.filter((c): c is RecipeCard => c.deckType === 'recipe').slice(0, 3);
      const chosenRecipe = payload?.chosenCardId
        ? topRecipes.find((c) => c.id === payload.chosenCardId || c.name === payload.chosenCardId) || topRecipes[0]
        : topRecipes[0];

      if (chosenRecipe) {
        const reqs = getRecipeTokenRequirements(player, chosenRecipe);
        // Waive 1 token as discount
        let waived = false;
        for (const tax of ['grain', 'hops', 'yeast', 'chocolate', 'spices', 'fruit'] as IngredientTaxonomy[]) {
          if ((reqs[tax] || 0) > 0 && !waived) {
            reqs[tax] = Math.max(0, reqs[tax] - 1);
            waived = true;
          }
          const toPay = reqs[tax] || 0;
          player.tokens[tax] = Math.max(0, (player.tokens[tax] || 0) - toPay);
        }
        player.zones[1].recipes.push(chosenRecipe);
        nextBreweryDeck = nextBreweryDeck.filter((c) => c.id !== chosenRecipe.id);
        const remainingTop = topRecipes.filter((c) => c.id !== chosenRecipe.id);
        nextBreweryDeck = nextBreweryDeck.filter((c) => !remainingTop.some((r) => r.id === c.id));
        nextBreweryDeck.push(...remainingTop);

        logs = addLog(
          logs,
          state.turnNumber,
          player,
          'PHASE_3_STATION_COMMITMENT',
          `📓 R&D DESK: ${player.name} formulated pilot batch of ${chosenRecipe.name} into Zone 1 Warehouse with -1 Token Discount!`
        );
      }
      break;
    }

    case 'gain_grain': {
      // #6: Silo & Mill - Take 2 Grain
      const takeAmount = Math.min(2, centralHoppers.grain || 0);
      centralHoppers.grain = Math.max(0, (centralHoppers.grain || 0) - takeAmount);
      player.tokens.grain = (player.tokens.grain || 0) + takeAmount;

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_3_STATION_COMMITMENT',
        `🌾 GRAIN SILO & MILL: ${player.name} milled grist and drafted ${takeAmount} Grain tokens into Warehouse!`
      );
      break;
    }

    case 'gain_hops_wild': {
      // #7: Hop Cold Locker - Take 1 Hops + 1 Wild
      if (centralHoppers.hops > 0) {
        centralHoppers.hops -= 1;
        player.tokens.hops = (player.tokens.hops || 0) + 1;
      }
      const wildTax = payload?.chosenToken || (['fruit', 'spices', 'yeast', 'grain'] as IngredientTaxonomy[]).find((t) => (centralHoppers[t] || 0) > 0) || 'grain';
      if ((centralHoppers[wildTax] || 0) > 0) {
        centralHoppers[wildTax] -= 1;
        player.tokens[wildTax] = (player.tokens[wildTax] || 0) + 1;
      }

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_3_STATION_COMMITMENT',
        `❄️ HOP COLD LOCKER: ${player.name} drafted 1 Hops and 1 ${wildTax.toUpperCase()} token into Warehouse!`
      );
      break;
    }

    case 'gain_two_distinct': {
      // #8: Sourcing Desk - Take any 2 tokens of different types
      const t1 = payload?.chosenToken || (Object.keys(centralHoppers) as IngredientTaxonomy[]).find((t) => (centralHoppers[t] || 0) > 0) || 'grain';
      const t2 = payload?.secondToken || (Object.keys(centralHoppers) as IngredientTaxonomy[]).find((t) => t !== t1 && (centralHoppers[t] || 0) > 0) || 'hops';

      if ((centralHoppers[t1] || 0) > 0) {
        centralHoppers[t1] -= 1;
        player.tokens[t1] = (player.tokens[t1] || 0) + 1;
      }
      if ((centralHoppers[t2] || 0) > 0 && t1 !== t2) {
        centralHoppers[t2] -= 1;
        player.tokens[t2] = (player.tokens[t2] || 0) + 1;
      }

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_3_STATION_COMMITMENT',
        `📋 SOURCING DESK: ${player.name} direct-ordered 1 ${t1.toUpperCase()} and 1 ${t2.toUpperCase()} tokens into Warehouse!`
      );
      break;
    }

    case 'farm_swap': {
      // #9: Farm Swap - Discard 1 token -> Take any 2 tokens
      const disc = payload?.discardToken || (Object.keys(player.tokens) as IngredientTaxonomy[]).find((t) => (player.tokens[t] || 0) > 0) || 'grain';
      if ((player.tokens[disc] || 0) > 0) {
        player.tokens[disc] -= 1;
        centralHoppers[disc] = (centralHoppers[disc] || 0) + 1;
      }
      const g1 = payload?.chosenToken || (Object.keys(centralHoppers) as IngredientTaxonomy[]).find((t) => (centralHoppers[t] || 0) > 0) || 'grain';
      if ((centralHoppers[g1] || 0) > 0) {
        centralHoppers[g1] -= 1;
        player.tokens[g1] = (player.tokens[g1] || 0) + 1;
      }
      const g2 = payload?.secondToken || (Object.keys(centralHoppers) as IngredientTaxonomy[]).find((t) => (centralHoppers[t] || 0) > 0) || 'hops';
      if ((centralHoppers[g2] || 0) > 0) {
        centralHoppers[g2] -= 1;
        player.tokens[g2] = (player.tokens[g2] || 0) + 1;
      }

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_3_STATION_COMMITMENT',
        `🔄 SPENT GRAIN FARM SWAP: ${player.name} traded 1 ${disc.toUpperCase()} for 1 ${g1.toUpperCase()} & 1 ${g2.toUpperCase()} (Net +1)!`
      );
      break;
    }

    case 'yeast_swap': {
      // #10: Yeast Bank - Take 1 Yeast + optional swap 1
      if ((centralHoppers.yeast || 0) > 0) {
        centralHoppers.yeast -= 1;
        player.tokens.yeast = (player.tokens.yeast || 0) + 1;
      }
      if (payload?.swapTokenOut && payload?.swapTokenIn && (player.tokens[payload.swapTokenOut] || 0) > 0 && (centralHoppers[payload.swapTokenIn] || 0) > 0) {
        player.tokens[payload.swapTokenOut] -= 1;
        centralHoppers[payload.swapTokenOut] = (centralHoppers[payload.swapTokenOut] || 0) + 1;
        centralHoppers[payload.swapTokenIn] -= 1;
        player.tokens[payload.swapTokenIn] = (player.tokens[payload.swapTokenIn] || 0) + 1;
      }

      logs = addLog(
        logs,
        state.turnNumber,
        player,
        'PHASE_3_STATION_COMMITMENT',
        `🧬 YEAST PROPAGATION BANK: ${player.name} cultured 1 Yeast token and maintained pure strains!`
      );
      break;
    }
  }

  // Mark completion of shift action
  player.actionsTakenThisShift = 1;
  player.lastOccupiedDepartment = true;
  player.lastOccupiedStation = null;
  updatePlayerMat(player);

  const turnOrder = state.rotaryBoard.turnOrder || players.map((p) => p.id);
  const currentIdxInTurnOrder = turnOrder.indexOf(player.id);
  const isShiftComplete = currentIdxInTurnOrder === -1 || currentIdxInTurnOrder >= turnOrder.length - 1;

  if (!isShiftComplete) {
    const nextPlayerId = turnOrder[currentIdxInTurnOrder + 1];
    const nextPlayerIndex = Math.max(0, players.findIndex((p) => p.id === nextPlayerId));

    return {
      ...state,
      players,
      centralHoppers,
      kettlePool,
      breweryDeck: nextBreweryDeck,
      breweryDiscard: nextBreweryDiscard,
      staffDeck: nextStaffDeck,
      staffDiscard: nextStaffDiscard,
      equipmentDeck: nextEquipmentDeck,
      equipmentDiscard: nextEquipmentDiscard,
      currentPlayerIndex: nextPlayerIndex,
      isFinalRound,
      endgameTriggeredByPlayerId,
      logs,
    };
  }

  // Shift is complete! Run Morning Shift conveyor slide and reset
  if (isFinalRound) {
    for (const p of players) {
      updatePlayerMat(p);
    }
    const winnerIds = computeWinners(players);
    const maxScore = Math.max(...players.map((p) => p.score));

    logs = addLog(
      logs,
      state.turnNumber,
      player,
      'GAME_OVER',
      `🏁 GAME OVER! Shift complete. Winner: ${winnerIds.map((id) => players.find((p) => p.id === id)?.name).join(', ')} with ${maxScore} VP!`
    );

    return {
      ...state,
      players,
      centralHoppers,
      kettlePool,
      breweryDeck: nextBreweryDeck,
      breweryDiscard: nextBreweryDiscard,
      staffDeck: nextStaffDeck,
      staffDiscard: nextStaffDiscard,
      equipmentDeck: nextEquipmentDeck,
      equipmentDiscard: nextEquipmentDiscard,
      isFinalRound,
      endgameTriggeredByPlayerId,
      winnerIds,
      phase: 'GAME_OVER',
      shiftPhase: 'GAME_OVER',
      logs,
    };
  }

  let afterSlideState: GameState = {
    ...state,
    players,
    centralHoppers,
    kettlePool,
    breweryDeck: nextBreweryDeck,
    breweryDiscard: nextBreweryDiscard,
    staffDeck: nextStaffDeck,
    staffDiscard: nextStaffDiscard,
    equipmentDeck: nextEquipmentDeck,
    equipmentDiscard: nextEquipmentDiscard,
    isFinalRound,
    endgameTriggeredByPlayerId,
    logs,
  };

  afterSlideState = executePhase2ConveyorOperations(afterSlideState);
  if (afterSlideState.phase === 'GAME_OVER') {
    return afterSlideState;
  }

  for (const s of [1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]) {
    afterSlideState.rotaryBoard!.slots[s].catwalkOccupant = null;
  }
  for (const p of afterSlideState.players) {
    p.departmentOccupant = null;
    p.actionsTakenThisShift = 0;
  }

  afterSlideState.turnNumber += 1;
  afterSlideState.roundNumber += 1;
  afterSlideState.phase = 'PHASE_2_CATWALK_PLACEMENT';
  afterSlideState.shiftPhase = 'PHASE_2_CATWALK_PLACEMENT';

  return executePhase1MarketRefresh(afterSlideState);
}
