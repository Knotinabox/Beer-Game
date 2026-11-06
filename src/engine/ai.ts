import {
  canAffordRecipe,
  canAffordUpgrade,
  canAffordRecipeWithTokens,
  canAffordUpgradeWithTokens,
  isUpgradeLocationOccupied,
  canDraftConveyorSlot,
  canPlaceWorkerAtStation,
  countUpgradeEffect,
  doesCardMatchRequirement,
  executeMorningShift,
  executePhase1MarketRefresh,
  performCatwalkPlacement,
  performStationCommitment,
  performCenterPantryAction,
  getEffectiveRecipeRequirements,
  getRecipeTokenRequirements,
  getWarehouseCapacity,
  getPlayerHandLimit,
  getPlayerSourceDrawCount,
  getPlayerUpgrades,
  performBrewAction,
  performDiscardExcess,
  performInvestAction,
  performSourceSinglePick,
  performSourceAction,
  performWorkerSourceAction,
  performManualTaproomFlush,
  performRotaryAction,
  executePhase2ConveyorOperations,
  executePhase3ShiftReset,
} from './gameEngine';
import { matchRecipeToMixerRequirement } from './cards';
import {
  GameState,
  IngredientCard,
  IngredientSubtype,
  IngredientStationId,
  PlayerState,
  RecipeCard,
  SourcePickChoice,
  UpgradeCard,
  RotarySlotNumber,
  IngredientTaxonomy,
  ZoneId,
} from './types';

/**
 * Computes which ingredient subtypes the player most wants in order to complete recipes in the Pub Market.
 */
function getWantedSubtypesMap(
  player: PlayerState,
  pubMarket: RecipeCard[]
): Map<IngredientSubtype, number> {
  const weights = new Map<IngredientSubtype, number>();

  for (const recipe of pubMarket) {
    const { effectiveSubtypes } = getEffectiveRecipeRequirements(player, recipe);
    const handCopy = [...player.hand];
    const missing: IngredientSubtype[] = [];

    for (const req of effectiveSubtypes) {
      const idx = handCopy.findIndex((c) => doesCardMatchRequirement(c, req));
      if (idx !== -1) {
        handCopy.splice(idx, 1);
      } else {
        missing.push(req);
      }
    }

    // Recipes that are only 1 or 2 ingredients away get much higher priority weight
    const closenessMultiplier =
      missing.length === 1 ? 6 : missing.length === 2 ? 3 : 1;
    const tierBonus = recipe.vp * 0.4;

    for (const sub of missing) {
      const prev = weights.get(sub) ?? 0;
      weights.set(sub, prev + closenessMultiplier + tierBonus);
    }
  }

  return weights;
}

/**
 * Scores how expendable a card in hand is (lower score = better to discard or use to Pay to Skip).
 */
function scoreCardKeepValue(
  card: IngredientCard,
  wantedMap: Map<IngredientSubtype, number>,
  hand: IngredientCard[]
): number {
  let value = 1;
  for (const [wantedReq, weight] of wantedMap.entries()) {
    if (doesCardMatchRequirement(card, wantedReq)) {
      value += weight;
    }
  }

  // Specialty ingredients (Fruit, Spices, Chocolate) are high-value 2 VP components
  if (card.vpValue === 2 || card.category === 'adjunct' || card.isWildcard) {
    value += 8;
  }

  // House yeast and base malt are universally useful, unless we have duplicates
  const duplicateCount = hand.filter((c) => c.subtype === card.subtype).length;
  if (duplicateCount > 2) {
    value -= (duplicateCount - 2) * 3;
  }

  return value;
}

function evaluateUpgradePriority(
  player: PlayerState,
  upgrade: UpgradeCard,
  roundNumber: number
): number {
  let score = (upgrade.bonusEndgameVp ?? 0) * 2;
  const currentUpgrades = getPlayerUpgrades(player).length;

  // Earlier in the game, engine-building upgrades are worth much more
  const earlyGameFactor = Math.max(1, 10 - roundNumber);

  // Check effectKeys on active option or either equipment/staff half
  const candidateKeys = [
    upgrade.installedOption?.effectKey,
    upgrade.effectKey,
    upgrade.equipment?.effectKey,
    upgrade.staff?.effectKey,
    upgrade.leftWing?.effectKey,
    upgrade.rightWing?.effectKey,
  ].filter(Boolean);

  let maxEffectScore = 8 + earlyGameFactor * 0.5;

  for (const activeKey of candidateKeys) {
    let keyScore = 0;
    switch (activeKey) {
      case 'hand_limit_plus_3':
      case 'hand_limit_plus_2':
        // Crucial for enabling hand capacity (6 base -> 9 upgraded)
        keyScore = (getPlayerHandLimit(player) <= 6 ? 18 : 12) + earlyGameFactor;
        break;
      case 'sean_hoyne_master_brewer':
        keyScore = 16 + earlyGameFactor;
        break;
      case 'extra_workday_action':
        keyScore = 15 + earlyGameFactor;
        break;
      case 'taco_bar_tasting_room':
        keyScore = 14 + earlyGameFactor;
        break;
      case 'upgrade_cost_discount_1':
      case 'kettle_discount_malt':
      case 'kettle_discount_hops':
      case 'yeast_propagation':
        keyScore = 13 + earlyGameFactor * 0.8;
        break;
      case 'carboy_capacity_plus_1':
      case 'kettle_double_batch':
        keyScore = 12 + earlyGameFactor * 0.8;
        break;
      case 'extra_source_draw':
      case 'wing_sourcing_master':
        keyScore = 12 + earlyGameFactor;
        break;
      case 'fast_ferment':
      case 'cellar_master_advance':
      case 'skip_ferment_to_dock':
      case 'free_ship_action':
        keyScore = 11 + earlyGameFactor * 0.7;
        break;
      case 'ship_all_zone4':
      case 'hopper_malt_exchange':
      case 'free_conveyor_flush':
      case 'fleet_delivery_bonus':
      case 'unlimited_dock_capacity':
      case 'dock_capacity_plus_1':
      case 'dock_draw_1':
      case 'dock_draw_2':
      case 'yeast_on_cellar_entry':
        keyScore = 10 + earlyGameFactor * 0.6;
        break;
      default:
        keyScore = 8 + earlyGameFactor * 0.5;
        break;
    }
    if (keyScore > maxEffectScore) {
      maxEffectScore = keyScore;
    }
  }

  score += maxEffectScore;

  // Diminishing returns if player already owns many upgrades
  if (currentUpgrades >= 5) {
    score -= (currentUpgrades - 4) * 4;
  }

  return score;
}

function chooseSingleSourcePickForAI(state: GameState): SourcePickChoice {
  const player = state.players[state.currentPlayerIndex];
  const wantedMap = getWantedSubtypesMap(player, state.pubMarket);

  // Rank hand cards from least valuable to most valuable (for paying skip costs)
  const handRankedToSpend = [...player.hand].sort(
    (a, b) =>
      scoreCardKeepValue(a, wantedMap, player.hand) -
      scoreCardKeepValue(b, wantedMap, player.hand)
  );

  let bestSlotIndex = -1;
  let bestSlotNetScore = 3.5; // Baseline threshold vs drawing blind from deck
  let bestPaidIds: string[] = [];

  for (let idx = 0; idx < state.conveyorMarket.length; idx++) {
    const check = canDraftConveyorSlot(state, player, idx);
    if (!check.canDraft) continue;

    const slot = state.conveyorMarket[idx];
    let wantedGain = 2;
    for (const [wantedReq, weight] of wantedMap.entries()) {
      if (doesCardMatchRequirement(slot.ingredient, wantedReq)) {
        wantedGain += weight;
      }
    }
    const baseGain = wantedGain + (slot.ingredient.category === 'adjunct' || slot.ingredient.isWildcard ? 5 : 0);

    // Accumulated skipped cards on a slot are a massive windfall!
    let bonusGain = 0;
    for (const bonusCard of slot.skippedCards) {
      let bGain = 2.5;
      for (const [wantedReq, weight] of wantedMap.entries()) {
        if (doesCardMatchRequirement(bonusCard, wantedReq)) {
          bGain += weight;
        }
      }
      bonusGain += bGain + 3.5;
    }

    // Cost of spending hand cards to skip
    const cardsToPay = handRankedToSpend.slice(0, check.skipsRequired);
    let skipCostPenalty = 0;
    for (const c of cardsToPay) {
      skipCostPenalty += Math.max(2, scoreCardKeepValue(c, wantedMap, player.hand) * 0.75);
    }

    const netScore = baseGain + bonusGain - skipCostPenalty;
    if (netScore > bestSlotNetScore) {
      bestSlotNetScore = netScore;
      bestSlotIndex = idx;
      bestPaidIds = cardsToPay.map((c) => c.id);
    }
  }

  if (bestSlotIndex !== -1) {
    return {
      type: 'conveyor',
      conveyorIndex: bestSlotIndex,
      paidHandCardIds: bestPaidIds,
    };
  }

  // Otherwise take slot 0 for free if deck is empty, or draw from deck
  if (state.ingredientDeck.length === 0 && state.conveyorMarket.length > 0) {
    return {
      type: 'conveyor',
      conveyorIndex: 0,
      paidHandCardIds: [],
    };
  }

  return { type: 'deck' };
}

function chooseBestStationForAI(
  state: GameState,
  player: PlayerState
): IngredientStationId | null {
  const stationOrder: IngredientStationId[] = [
    'grain',
    'hops',
    'yeast',
    'chocolate',
    'spices',
    'fruit',
  ];

  // Filter stations that are available for this player
  const availableStations = stationOrder.filter(
    (sId) => canPlaceWorkerAtStation(state, player, sId).canPlace
  );

  if (availableStations.length === 0) return null;

  const wantedMap = getWantedSubtypesMap(player, state.pubMarket);

  let bestStation: IngredientStationId = availableStations[0];
  let bestScore = -100;

  for (const sId of availableStations) {
    const station = state.ingredientStations[sId];
    let stationScore = 2; // base score for taking ingredients

    // Evaluate face-up cards at this station
    for (const card of station.faceUpCards) {
      let cardScore = 1.5;
      for (const [wantedReq, weight] of wantedMap.entries()) {
        if (doesCardMatchRequirement(card, wantedReq)) {
          cardScore += weight * 3;
        }
      }
      if (
        card.category === 'adjunct' ||
        card.taxonomy === 'chocolate' ||
        card.taxonomy === 'spices' ||
        card.taxonomy === 'fruit'
      ) {
        cardScore += 4;
      }
      stationScore += cardScore;
    }

    if (stationScore > bestScore) {
      bestScore = stationScore;
      bestStation = sId;
    }
  }

  return bestStation;
}

/**
 * Chooses and executes a single phase step for the current AI player.
 */
export function chooseAIAction(state: GameState): {
  actionDescription: string;
  nextState: GameState;
} {
  const player = state.players[state.currentPlayerIndex];

  if (state.phase === 'MORNING_SHIFT') {
    const nextState = executeMorningShift(state);
    return {
      actionDescription: `${player.name} ran Morning Shift conveyor.`,
      nextState,
    };
  }

  if (state.phase === 'PHASE_2_CONVEYOR_OPERATIONS') {
    const afterPhase2 = executePhase2ConveyorOperations(state);
    const nextState = afterPhase2.phase === 'GAME_OVER' ? afterPhase2 : executePhase3ShiftReset(afterPhase2);
    return {
      actionDescription: `${player.name} resolved simultaneous Phase 2 operations.`,
      nextState,
    };
  }

  if (state.phase === 'PHASE_3_SHIFT_RESET') {
    const nextState = executePhase3ShiftReset(state);
    return {
      actionDescription: `${player.name} reset shift Priority.`,
      nextState,
    };
  }

  if (state.phase === 'DISCARD') {
    const handLimit = getPlayerHandLimit(player);
    const excessCount = Math.max(0, player.hand.length - handLimit);
    const availableRecipes = (state.breweryMarket || state.pubMarket || []).filter(
      (c): c is RecipeCard => c.deckType === 'recipe'
    );
    const wantedMap = getWantedSubtypesMap(player, availableRecipes);

    const sortedToDiscard = [...player.hand]
      .sort(
        (a, b) =>
          scoreCardKeepValue(a, wantedMap, player.hand) -
          scoreCardKeepValue(b, wantedMap, player.hand)
      )
      .slice(0, excessCount)
      .map((c) => c.id);

    const nextState = performDiscardExcess(state, sortedToDiscard);
    return {
      actionDescription: `${player.name} discarded ${excessCount} excess ingredient(s).`,
      nextState,
    };
  }

  if (state.phase === 'PHASE_1_MARKET_REFRESH') {
    const nextState = executePhase1MarketRefresh(state);
    return {
      actionDescription: `${player.name} simultaneously refilled outer shelves from 81-card Master Deck.`,
      nextState,
    };
  }

  if (state.phase === 'PHASE_2_CATWALK_PLACEMENT' && state.rotaryBoard) {
    const slots = state.rotaryBoard.slots;
    const allCandidateSlots: RotarySlotNumber[] = [1, 2, 3, 4, 5, 6, 7];
    const isSlotAvailable = (s: RotarySlotNumber) => {
      return slots[s]?.catwalkOccupant === null;
    };
    const validSlots = allCandidateSlots.filter(
      (s) => isSlotAvailable(s) && player.lastOccupiedStation !== s
    );
    const candidateSlots = validSlots.length > 0
      ? validSlots
      : allCandidateSlots.filter((s) => isSlotAvailable(s));

    let bestSlot: RotarySlotNumber = candidateSlots[0] || 1;
    let bestScore = -999999;
    const tokens = player.tokens || { grain: 0, hops: 0, yeast: 0, chocolate: 0, spices: 0, fruit: 0 };
    const hoppers = state.centralHoppers || { grain: 24, hops: 20, yeast: 20, fruit: 14, spices: 12, chocolate: 12 };

    for (const slotNum of candidateSlots) {
      const slot = slots[slotNum];
      if (!slot) continue;
      let slotScore = 0;

      // Special Catwalk #7 (Pantry): Wild ingredient flex
      if (slotNum === 7) {
        slotScore += 25; // Base flexibility score
        for (let s2 = 1; s2 <= 6; s2++) {
          const c = slots[s2 as RotarySlotNumber]?.outerCard;
          if (c && c.deckType === 'recipe') {
            const reqs = getRecipeTokenRequirements(player, c);
            for (const tax of ['chocolate', 'spices', 'fruit', 'yeast', 'hops', 'grain'] as IngredientTaxonomy[]) {
              const needed = reqs[tax] || 0;
              const have = tokens[tax] || 0;
              if (needed > have && (hoppers[tax] || 0) > 0) {
                slotScore += (needed - have) * 15;
              }
            }
          }
        }
        // Catwalk 7 resolves last (initiative #7)
        slotScore += (8 - slotNum) * 2;
        if (slotScore > bestScore) {
          bestScore = slotScore;
          bestSlot = slotNum;
        }
        continue;
      }

      // 1. Outer Card potential: High priority to draft and brew affordable cards!
      const card = slot.outerCard;
      if (card) {
        if (card.deckType === 'recipe') {
          const afford = canAffordRecipeWithTokens(player, card);
          if (afford.canAfford) {
            slotScore += 500 + card.vp * 25;
          } else {
            const reqs = getRecipeTokenRequirements(player, card);
            let missing = 0;
            (Object.keys(reqs) as IngredientTaxonomy[]).forEach((tax) => {
              missing += Math.max(0, reqs[tax] - (tokens[tax] || 0));
            });
            if (missing === 1) slotScore += 40;
            else if (missing === 2) slotScore += 15;
          }
        } else if (card.deckType === 'upgrade') {
          const options: ('equipment' | 'staff' | 'leftWing' | 'rightWing')[] =
            card.isUniversalWing ? ['leftWing', 'rightWing'] : ['equipment', 'staff'];
          for (const opt of options) {
            const afford = canAffordUpgradeWithTokens(player, card, opt);
            if (afford.canAfford) {
              const uScore = evaluateUpgradePriority(player, card, state.roundNumber);
              slotScore = Math.max(slotScore, 200 + uScore);
            }
          }
        }
      }

      // 2. Inner Hopper tokens (resource draft)
      const ing = slot.ingredient;
      const availableInHopper = hoppers[ing] || 0;
      if (availableInHopper > 0) {
        slotScore += slot.tokenYield * 10;
        for (let s2 = 1; s2 <= 6; s2++) {
          const c = slots[s2 as RotarySlotNumber]?.outerCard;
          if (c && c.deckType === 'recipe') {
            const reqs = getRecipeTokenRequirements(player, c);
            const needed = reqs[ing] || 0;
            const have = tokens[ing] || 0;
            if (needed > have) {
              slotScore += (needed - have) * 20;
            }
          }
        }
      }

      // Catwalk 1..7 Initiative bonus: earlier catwalks resolve first!
      slotScore += (8 - slotNum) * 2;

      if (slotScore > bestScore) {
        bestScore = slotScore;
        bestSlot = slotNum;
      }
    }

    const nextState = performCatwalkPlacement(state, bestSlot);
    return {
      actionDescription: `${player.name} moved meeple onto Catwalk #${bestSlot} (${slots[bestSlot].ingredientName})!`,
      nextState,
    };
  }

  if (state.phase === 'PHASE_3_STATION_COMMITMENT' && state.rotaryBoard) {
    const slots = state.rotaryBoard.slots;
    let committedSlot: RotarySlotNumber | null = null;
    for (let s = 1; s <= 7; s++) {
      const slotNum = s as RotarySlotNumber;
      if (slots[slotNum]?.catwalkOccupant?.playerId === player.id) {
        committedSlot = slotNum;
        break;
      }
    }
    if (committedSlot === null) {
      committedSlot = (player.lastOccupiedStation as RotarySlotNumber) || 1;
    }

    // Special Catwalk #7 (Pantry) resolution in Phase 3
    if (committedSlot === 7) {
      const tokens = player.tokens || { grain: 0, hops: 0, yeast: 0, chocolate: 0, spices: 0, fruit: 0 };
      const hoppers = state.centralHoppers || { grain: 24, hops: 20, yeast: 20, fruit: 14, spices: 12, chocolate: 12 };
      let bestTax: IngredientTaxonomy = 'grain';
      let highestNeed = -1;
      const allTax: IngredientTaxonomy[] = ['chocolate', 'spices', 'fruit', 'yeast', 'hops', 'grain'];
      for (const tax of allTax) {
        if ((hoppers[tax] || 0) <= 0) continue;
        let need = 0;
        for (let s2 = 1; s2 <= 6; s2++) {
          const c = slots[s2 as RotarySlotNumber]?.outerCard;
          if (c && c.deckType === 'recipe') {
            const reqs = getRecipeTokenRequirements(player, c);
            need += Math.max(0, (reqs[tax] || 0) - (tokens[tax] || 0));
          }
        }
        if (need > highestNeed) {
          highestNeed = need;
          bestTax = tax;
        }
      }
      const nextState = performCenterPantryAction(state, bestTax);
      return {
        actionDescription: `${player.name} committed to Catwalk Station #7 (Pantry) and collected 1 ${bestTax.toUpperCase()} token!`,
        nextState,
      };
    }

    const slot = slots[committedSlot];
    const card = slot?.outerCard;
    let commitment: 'inward' | 'outward' = 'inward';
    let bestUpgradeOpt: 'equipment' | 'staff' | 'leftWing' | 'rightWing' | undefined;

    if (card) {
      if (card.deckType === 'recipe') {
        const afford = canAffordRecipeWithTokens(player, card);
        if (afford.canAfford) {
          commitment = 'outward';
        }
      } else if (card.deckType === 'upgrade') {
        const options: ('equipment' | 'staff' | 'leftWing' | 'rightWing')[] =
          card.isUniversalWing ? ['leftWing', 'rightWing'] : ['equipment', 'staff'];
        for (const opt of options) {
          const afford = canAffordUpgradeWithTokens(player, card, opt);
          if (afford.canAfford) {
            commitment = 'outward';
            bestUpgradeOpt = opt;
            break;
          }
        }
      }
    }

    const nextState = performStationCommitment(state, committedSlot, commitment, bestUpgradeOpt);
    const actionDesc = commitment === 'outward'
      ? `${player.name} committed to Outer Shelf and drafted ${card?.name || 'Card'} at Station #${committedSlot}!`
      : `${player.name} committed to Inner Hopper and drafted ${slot.ingredientName} tokens at Station #${committedSlot}!`;

    return {
      actionDescription: actionDesc,
      nextState,
    };
  }

  if (state.phase === 'WORK_DAY' || state.phase === 'PHASE_1_WORKER_DRAFT' || (state.phase as string) === 'MORNING_SHIFT') {
    // 0. If 11.5" Rotary Board is active, execute Rotary Catwalk Action (Tokens vs Cards)
    if (state.rotaryBoard) {
      const slots = state.rotaryBoard.slots;
      const restrictedStation =
        state.rotaryBoard.centerRingHotSeat?.playerId === player.id
          ? state.rotaryBoard.evictedFromStation
          : null;
      const currentStandbyBay = Object.values(slots).find(
        (sl) => sl.standbyOccupant?.playerId === player.id
      )?.slotNumber;

      let bestCardSlot: RotarySlotNumber | null = null;
      let bestCardScore = -1;
      let bestUpgradeOpt: 'equipment' | 'staff' | 'leftWing' | 'rightWing' | undefined;

      for (let s = 1; s <= 6; s++) {
        const slotNum = s as RotarySlotNumber;
        if (slotNum === restrictedStation) continue; // Single Eviction Restriction!
        if (slotNum === currentStandbyBay && !state.rotaryBoard.centerRingHotSeat) continue; // Mandatory departure!

        const slot = slots[slotNum];
        const card = slot?.outerCard;
        if (!card) continue;

        if (card.deckType === 'recipe') {
          const afford = canAffordRecipeWithTokens(player, card);
          if (afford.canAfford) {
            const score = card.vp * 2;
            if (score > bestCardScore) {
              bestCardScore = score;
              bestCardSlot = slotNum;
            }
          }
        } else if (card.deckType === 'upgrade') {
          const options: ('equipment' | 'staff' | 'leftWing' | 'rightWing')[] =
            card.isUniversalWing ? ['leftWing', 'rightWing'] : ['equipment', 'staff'];
          for (const opt of options) {
            const afford = canAffordUpgradeWithTokens(player, card, opt);
            if (afford.canAfford) {
              const score = evaluateUpgradePriority(player, card, state.roundNumber);
              if (score > bestCardScore) {
                bestCardScore = score;
                bestCardSlot = slotNum;
                bestUpgradeOpt = opt;
              }
            }
          }
        }
      }

      // If an affordable recipe or upgrade is available and beneficial, draft Outward!
      if (bestCardSlot !== null && bestCardScore > 0) {
        const cardName = slots[bestCardSlot].outerCard?.name || 'Card';
        const nextState = performRotaryAction(state, bestCardSlot, 'outward', bestUpgradeOpt);
        return {
          actionDescription: `${player.name} drafted & immediately built ${cardName} from Rotary Slot #${bestCardSlot}!`,
          nextState,
        };
      }

      // Otherwise, draft Inward Wooden Tokens!
      // 1. Analyze what ingredients are missing for available outer shelf recipes & upgrades
      const tokens = player.tokens || { grain: 0, hops: 0, yeast: 0, chocolate: 0, spices: 0, fruit: 0 };
      const hoppers = state.centralHoppers || { grain: 24, hops: 20, yeast: 20, fruit: 14, spices: 12, chocolate: 12 };
      const ingredientWeights: Record<IngredientTaxonomy, number> = {
        grain: 1,
        hops: 1,
        yeast: 1,
        chocolate: 0.5,
        spices: 0.5,
        fruit: 0.5,
      };

      for (let s = 1; s <= 6; s++) {
        const slot = slots[s as RotarySlotNumber];
        const card = slot?.outerCard;
        if (!card) continue;

        if (card.deckType === 'recipe') {
          const reqs = getRecipeTokenRequirements(player, card);
          let missingCount = 0;
          const missingTaxa: IngredientTaxonomy[] = [];
          (Object.keys(reqs) as IngredientTaxonomy[]).forEach((tax) => {
            const diff = reqs[tax] - (tokens[tax] || 0);
            if (diff > 0) {
              missingCount += diff;
              for (let d = 0; d < diff; d++) missingTaxa.push(tax);
            }
          });
          const closenessMultiplier = missingCount === 1 ? 25 : missingCount === 2 ? 15 : missingCount === 3 ? 8 : 2;
          const valueMultiplier = card.vp;
          for (const tax of missingTaxa) {
            ingredientWeights[tax] = (ingredientWeights[tax] || 0) + closenessMultiplier * valueMultiplier;
          }
        } else if (card.deckType === 'upgrade') {
          const options: ('equipment' | 'staff' | 'leftWing' | 'rightWing')[] =
            card.isUniversalWing
              ? ['leftWing', 'rightWing']
              : card.cardKind === 'staff'
              ? ['staff']
              : card.cardKind === 'equipment'
              ? ['equipment']
              : ['equipment', 'staff'];
          const hasAvailableSlot = options.some((opt) => {
            const targetZone = (
              opt === 'equipment'
                ? (card.equipment?.targetZone ?? card.targetZone ?? 1)
                : opt === 'staff'
                ? (card.staff?.targetZone ?? card.targetZone ?? 1)
                : 1
            ) as ZoneId;
            return !isUpgradeLocationOccupied(player, opt, targetZone);
          });
          if (hasAvailableSlot) {
            const installReqs = card.installTokens || {};
            (Object.keys(installReqs) as IngredientTaxonomy[]).forEach((req) => {
              if ((tokens[req] || 0) < (installReqs[req] || 0)) {
                ingredientWeights[req] = (ingredientWeights[req] || 0) + 5;
              }
            });
          }
        }
      }

      // 2. Select the valid station wedge that yields the most desired available tokens
      let bestTokenSlot: RotarySlotNumber | null = null;
      let bestWeight = -1;

      for (let s = 1; s <= 6; s++) {
        const slotNum = s as RotarySlotNumber;
        if (slotNum === restrictedStation) continue; // Single Eviction Restriction!
        if (slotNum === currentStandbyBay && !state.rotaryBoard.centerRingHotSeat) continue; // Mandatory departure!

        const slot = slots[slotNum];
        const ing = slot.ingredient;
        const availableInHopper = hoppers[ing] || 0;
        if (availableInHopper <= 0) continue; // Hopper is empty

        const weight = ingredientWeights[ing] || 0;
        if (weight > bestWeight) {
          bestWeight = weight;
          bestTokenSlot = slotNum;
        }
      }

      // Fallback if no station found with positive weight
      if (bestTokenSlot === null) {
        const priorityOrder: RotarySlotNumber[] = [6, 5, 4, 1, 2, 3];
        for (const slotNum of priorityOrder) {
          if (slotNum === restrictedStation) continue;
          if (slotNum === currentStandbyBay && !state.rotaryBoard.centerRingHotSeat) continue;
          bestTokenSlot = slotNum;
          break;
        }
      }
      bestTokenSlot = bestTokenSlot || 6;

      let nextState = performRotaryAction(state, bestTokenSlot, 'inward');
      const ingName = slots[bestTokenSlot].ingredientName;
      return {
        actionDescription: `${player.name} drafted wooden ${ingName} tokens from Wedge #${bestTokenSlot}!`,
        nextState,
      };
    }

    const market = state.breweryMarket && state.breweryMarket.length > 0
      ? state.breweryMarket
      : [...(state.pubMarket || []), ...(state.shopMarket || [])];

    // 1. Check all affordable recipes in Brewery Market
    let bestRecipeIdx = -1;
    let bestRecipeScore = -1;
    let bestRecipePayment: string[] = [];

    // 2. Check if an Upgrade is affordable
    let bestUpgradeIdx = -1;
    let bestUpgradeScore = -100;
    let bestUpgradePayment: string[] = [];
    let bestUpgradeOption: 'equipment' | 'staff' | 'leftWing' | 'rightWing' | undefined;

    const ownedUpgrades = getPlayerUpgrades(player).length;

    for (let i = 0; i < market.length; i++) {
      const card = market[i];
      if (card.deckType === 'recipe') {
        const check = canAffordRecipe(player, card);
        if (check.canAfford) {
          const tacoBonus =
            countUpgradeEffect(player, 'taco_bar_tasting_room') *
            (card.tier === 6 ? 3 : 2);

          // Mixer Pack Race evaluation bonus
          let mixerBonus = 0;
          if (state.mixerMarket) {
            for (const mixer of state.mixerMarket) {
              const needed = mixer.requiredRecipes.some((req) =>
                matchRecipeToMixerRequirement(card.name, req)
              );
              if (needed) {
                mixerBonus += mixer.vp * 0.45;
              }
            }
          }

          const totalExpectedVp = card.vp + tacoBonus + mixerBonus;
          if (totalExpectedVp > bestRecipeScore) {
            bestRecipeScore = totalExpectedVp;
            bestRecipeIdx = i;
            bestRecipePayment = check.validHandCardIds;
          }
        }
      } else if (card.deckType === 'upgrade') {
        if (ownedUpgrades < 10 && !state.isFinalRound) {
          const options: ('equipment' | 'staff' | 'leftWing' | 'rightWing')[] =
            card.isUniversalWing ? ['leftWing', 'rightWing'] : ['equipment', 'staff'];

          for (const opt of options) {
            const check = canAffordUpgrade(player, card, undefined, opt);
            if (check.canAfford) {
              const uScore = evaluateUpgradePriority(
                player,
                card,
                state.roundNumber
              );
              if (uScore > bestUpgradeScore) {
                bestUpgradeScore = uScore;
                bestUpgradeIdx = i;
                bestUpgradePayment = check.validHandCardIds;
                bestUpgradeOption = opt;
              }
            }
          }
        }
      }
    }

    if (bestRecipeIdx !== -1) {
      const recipe = market[bestRecipeIdx] as RecipeCard;
      const nextState = performBrewAction(state, bestRecipeIdx, bestRecipePayment);
      return {
        actionDescription: `${player.name} brewed ${recipe.name} (${recipe.vp} VP)!`,
        nextState,
      };
    }

    if (bestUpgradeIdx !== -1 && (bestUpgradeScore > 0 || bestRecipeIdx === -1)) {
      const upgrade = market[bestUpgradeIdx] as UpgradeCard;
      const nextState = performInvestAction(
        state,
        bestUpgradeIdx,
        bestUpgradePayment,
        bestUpgradeOption
      );
      return {
        actionDescription: `${player.name} invested in ${upgrade.name}.`,
        nextState,
      };
    }

    // 2.5 Market Gridlock Resolution: If hand is full or nearly full and nothing in Market is affordable, sweep market
    const canAffordAnything = market.some((c) =>
      c.deckType === 'recipe'
        ? canAffordRecipe(player, c).canAfford
        : canAffordUpgrade(player, c).canAfford
    );

    if (
      !canAffordAnything &&
      player.hand.length >= getPlayerHandLimit(player) &&
      state.lastMarketFlushEvent?.turn !== state.turnNumber
    ) {
      const flushedState = performManualTaproomFlush(state);
      return chooseAIAction(flushedState);
    }

    // 3. Otherwise, take Action A: Source Ingredients via 6-Station Worker Placement
    if (state.ingredientStations) {
      const bestStationId = chooseBestStationForAI(state, player);
      if (bestStationId) {
        const nextState = performWorkerSourceAction(state, bestStationId);
        const stationName = state.ingredientStations[bestStationId]?.name || bestStationId;
        return {
          actionDescription: `${player.name} sent Brewer to ${stationName} and sourced ingredients.`,
          nextState,
        };
      }
    }

    // Fallback legacy conveyor sourcing
    const drawCount = getPlayerSourceDrawCount(player);
    let tempState = state;
    const picksMade: SourcePickChoice[] = [];

    for (let p = 0; p < drawCount; p++) {
      const pick = chooseSingleSourcePickForAI(tempState);
      picksMade.push(pick);
      tempState = performSourceSinglePick(tempState, pick);
    }

    const nextState = performSourceAction(tempState, []);
    return {
      actionDescription: `${player.name} sourced ${drawCount} ingredients.`,
      nextState,
    };
  }

  return {
    actionDescription: `${player.name} is idle.`,
    nextState: state,
  };
}

/**
 * Executes a complete AI turn (Morning Shift -> Work Day -> optional Discard)
 * and returns the resulting GameState.
 */
export function executeAITurn(state: GameState): GameState {
  if (state.phase === 'GAME_OVER') return state;

  const startingPlayerIndex = state.currentPlayerIndex;
  const startingTurnNumber = state.turnNumber;
  let current = state;
  let safetyCounter = 0;

  while (
    current.phase !== 'GAME_OVER' &&
    current.currentPlayerIndex === startingPlayerIndex &&
    current.turnNumber === startingTurnNumber &&
    safetyCounter < 10
  ) {
    safetyCounter++;
    const step = chooseAIAction(current);
    current = step.nextState;
  }

  return current;
}
