import React, { useState, useEffect, useMemo } from 'react';
import {
  GameState,
  PlayerState,
  SourcePickChoice,
  IngredientStationId,
  IngredientStationState,
  RotarySlotNumber,
  RotaryCatwalkAction,
  IngredientTaxonomy,
} from '../engine/types';
import {
  canDraftConveyorSlot,
  canPlaceWorkerAtStation,
  canAffordRecipe,
  canAffordUpgrade,
  getPlayerSourceDrawCount,
  getPlayerFreeSkips,
  performSourceSinglePick,
} from '../engine/gameEngine';
import { INGREDIENT_METADATA, INGREDIENT_STATION_METADATA } from '../engine/cards';
import {
  RecipeCardView,
  UpgradeCardView,
  IngredientCardView,
  MixerPackCardView,
} from './CardComponents';
import { CircularKettleHub } from './CircularKettleHub';
import { RotaryBoard } from './RotaryBoard';
import {
  BottleCapTokenSVG,
  HoyneCardBackDeckSVG,
  TaproomCardBackDeckSVG,
  RecipeCardBackDeckSVG,
  UpgradeCardBackDeckSVG,
  WoodenBarrelRailTokenSVG,
} from './HoyneAssets';
import {
  PackageOpen,
  Wrench,
  Beer,
  ArrowLeft,
  Layers,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Hand,
  AlertTriangle,
  Package,
  Trophy,
  UserCheck,
  Lock,
  Wheat,
} from 'lucide-react';

export const BrewerMeepleSVG: React.FC<{
  color: string;
  size?: number;
  className?: string;
}> = ({ color, size = 26, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-md shrink-0 ${className}`}
  >
    {/* Meeple base shadow */}
    <ellipse cx="50" cy="92" rx="34" ry="7" fill="rgba(0,0,0,0.45)" />
    {/* Meeple head & upper torso */}
    <path
      d="M50 8 C42 8 36 14 36 22 C36 28 40 32 43 34 C31 38 23 48 20 60 C19 64 23 68 27 68 C31 68 34 64 36 59 C38 53 43 49 50 49 C57 49 62 53 64 59 C66 64 69 68 73 68 C77 68 81 64 80 60 C77 48 69 38 57 34 C60 32 64 28 64 22 C64 14 58 8 50 8 Z"
      fill={color}
      stroke="#120c08"
      strokeWidth="4"
    />
    {/* Meeple legs */}
    <path
      d="M37 50 L34 88 C34 92 37 94 41 94 L46 94 C48 94 49 92 49 89 L49 70 L51 70 L51 89 C51 92 52 94 54 94 L59 94 C63 94 66 92 66 88 L63 50"
      fill={color}
      stroke="#120c08"
      strokeWidth="4"
    />
    {/* Subtle wood sheen highlight */}
    <path
      d="M44 14 C46 12 50 12 54 13"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);

export interface CenterMarketProps {
  gameState: GameState;
  activePlayer: PlayerState;
  isHumanTurn: boolean;
  onPerformRotaryAction?: (
    slotNumber: RotarySlotNumber,
    actionType: RotaryCatwalkAction,
    chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing',
    chosenPaymentTokens?: Partial<Record<IngredientTaxonomy, number>>
  ) => void;
  onPerformEndOfShiftSlide?: () => void;
  onPerformWorkerSource?: (stationId: IngredientStationId, draftCardIds?: string[]) => void;
  onPerformSource: (choices: SourcePickChoice[]) => void;
  onPerformInvest: (shopIndex: number, chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing') => void;
  onPerformBrew: (pubIndex: number) => void;
  onPerformManualFlush?: () => void;
  onPerformConveyorSlide?: () => void;
}

export const CenterMarket: React.FC<CenterMarketProps> = ({
  gameState,
  activePlayer,
  isHumanTurn,
  onPerformRotaryAction,
  onPerformEndOfShiftSlide,
  onPerformWorkerSource,
  onPerformSource,
  onPerformInvest,
  onPerformBrew,
  onPerformManualFlush,
  onPerformConveyorSlide,
}) => {
  const isWorkDay =
    (gameState.phase === 'WORK_DAY' || gameState.phase === 'PHASE_1_WORKER_DRAFT') &&
    isHumanTurn;
  const totalSourceDraws = getPlayerSourceDrawCount(activePlayer);
  const freeSkips = getPlayerFreeSkips(activePlayer);

  // Staged choices for Action A: Source
  const [stagedChoices, setStagedChoices] = useState<SourcePickChoice[]>([]);
  // Pending conveyor slot index that requires selecting skip payment cards from hand
  const [pendingSlotIndex, setPendingSlotIndex] = useState<number | null>(null);
  const [selectedSkipHandIds, setSelectedSkipHandIds] = useState<string[]>([]);
  const [activeMarketTab, setActiveMarketTab] = useState<'all' | 'conveyor' | 'brewery' | 'mixers'>('all');

  // Reset staging whenever turn/phase changes
  useEffect(() => {
    setStagedChoices([]);
    setPendingSlotIndex(null);
    setSelectedSkipHandIds([]);
  }, [gameState.turnNumber, gameState.phase, gameState.currentPlayerIndex]);

  // Live preview state after applying already-staged picks sequentially
  const previewState = stagedChoices.reduce(
    (st, ch) => performSourceSinglePick(st, ch),
    gameState
  );
  const previewPlayer = previewState.players[previewState.currentPlayerIndex];

  const canAffordAnyTaproomCard = useMemo(() => {
    const market = gameState.breweryMarket || [];
    return market.some((card) => {
      if (card.deckType === 'recipe') {
        return canAffordRecipe(activePlayer, card).canAfford;
      } else {
        return canAffordUpgrade(activePlayer, card).canAfford;
      }
    });
  }, [gameState.breweryMarket, activePlayer]);

  const handleAddDeckPick = () => {
    if (!isWorkDay || stagedChoices.length >= totalSourceDraws) return;
    const next = [...stagedChoices, { type: 'deck' as const }];
    if (next.length === totalSourceDraws) {
      onPerformSource(next);
      setStagedChoices([]);
    } else {
      setStagedChoices(next);
    }
  };

  const handleClickConveyorSlot = (slotIndex: number) => {
    if (!isWorkDay || stagedChoices.length >= totalSourceDraws) return;

    const check = canDraftConveyorSlot(
      previewState,
      previewPlayer,
      slotIndex
    );
    if (!check.canDraft) return;

    if (check.skipsRequired === 0) {
      const nextChoice: SourcePickChoice = {
        type: 'conveyor',
        conveyorIndex: slotIndex,
        paidHandCardIds: [],
      };
      const next = [...stagedChoices, nextChoice];
      if (next.length === totalSourceDraws) {
        onPerformSource(next);
        setStagedChoices([]);
      } else {
        setStagedChoices(next);
      }
    } else {
      setPendingSlotIndex(slotIndex);
      setSelectedSkipHandIds(
        previewPlayer.hand.slice(0, check.skipsRequired).map((c) => c.id)
      );
    }
  };

  const handleConfirmPendingSkipSlot = () => {
    if (pendingSlotIndex === null) return;
    const check = canDraftConveyorSlot(
      previewState,
      previewPlayer,
      pendingSlotIndex
    );
    if (!check.canDraft || selectedSkipHandIds.length < check.skipsRequired) return;

    const nextChoice: SourcePickChoice = {
      type: 'conveyor',
      conveyorIndex: pendingSlotIndex,
      paidHandCardIds: selectedSkipHandIds.slice(0, check.skipsRequired),
    };
    const next = [...stagedChoices, nextChoice];
    setPendingSlotIndex(null);
    setSelectedSkipHandIds([]);

    if (next.length === totalSourceDraws) {
      onPerformSource(next);
      setStagedChoices([]);
    } else {
      setStagedChoices(next);
    }
  };

  const handleQuickSourceFree = () => {
    if (!isWorkDay) return;
    const choices: SourcePickChoice[] = [];
    for (let i = 0; i < totalSourceDraws; i++) {
      if (i < gameState.conveyorMarket.length) {
        choices.push({ type: 'conveyor', conveyorIndex: 0, paidHandCardIds: [] });
      } else {
        choices.push({ type: 'deck' });
      }
    }
    onPerformSource(choices);
  };

  const handlePlaceWorker = (stationId: IngredientStationId, draftCardIds?: string[]) => {
    if (!isWorkDay) return;
    if (onPerformWorkerSource) {
      onPerformWorkerSource(stationId, draftCardIds);
    } else {
      onPerformSource([{ type: 'station', stationId, draftCardIds }]);
    }
  };

  const handleQuickSourceDeck = () => {
    if (!isWorkDay) return;
    const choices: SourcePickChoice[] = Array.from({ length: totalSourceDraws }, () => ({
      type: 'deck',
    }));
    onPerformSource(choices);
  };

  const toggleSkipHandCard = (cardId: string, requiredCount: number) => {
    if (selectedSkipHandIds.includes(cardId)) {
      setSelectedSkipHandIds(selectedSkipHandIds.filter((id) => id !== cardId));
    } else {
      if (selectedSkipHandIds.length >= requiredCount) {
        setSelectedSkipHandIds([...selectedSkipHandIds.slice(1), cardId]);
      } else {
        setSelectedSkipHandIds([...selectedSkipHandIds, cardId]);
      }
    }
  };

  const pendingCheck =
    pendingSlotIndex !== null
      ? canDraftConveyorSlot(previewState, previewPlayer, pendingSlotIndex)
      : null;

  const recipeOfferCount = gameState.pubMarket.length;
  const upgradeOfferCount = gameState.shopMarket.length;

  return (
    <section className="space-y-4">
      {/* Market Section Filter Bar */}
      <div className="stout-panel rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-display font-bold uppercase tracking-widest text-amber-300">
            Dedicated Brewery Market Rows
          </span>
          <span className="text-xs text-hoyne-cream/75 hidden sm:inline">
            • Choose 1 Work Day Action:{' '}
            <strong className="text-amber-300">Conveyor (A)</strong>,{' '}
            <strong className="text-sky-300">Upgrades (B)</strong>, or{' '}
            <strong className="text-emerald-300">Recipes (C)</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'all', label: '6×6 Full Market' },
              { id: 'conveyor', label: 'Row 1: Conveyor (6)' },
              { id: 'brewery', label: 'Row 2: Brewery Market (6)' },
              { id: 'mixers', label: 'Bonus: Mixer Packs (4)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMarketTab(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                activeMarketTab === tab.id
                  ? 'copper-bevel-btn'
                  : 'bg-stone-900/90 text-hoyne-cream/80 hover:text-hoyne-cream border border-hoyne-copper/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================
          THE 11.5" ROTARY BOARD: TRIPLE-SPLIT CATWALK & ACTIVE CENTER RING
          Physical Displacement Relay • Center Ring "Hot Seat" • 3-Action Catwalk Arc
      =================================================================== */}
      {gameState.rotaryBoard && onPerformRotaryAction ? (
        <div className="stout-panel rounded-2xl p-4 space-y-3.5 border-hoyne-copper/70 shadow-2xl">
          <RotaryBoard
            gameState={gameState}
            activePlayer={activePlayer}
            isWorkDay={isWorkDay}
            onPerformRotaryAction={onPerformRotaryAction}
            onPerformEndOfShiftSlide={onPerformEndOfShiftSlide}
          />
        </div>
      ) : (activeMarketTab === 'all' || activeMarketTab === 'conveyor') && (
        <div className="stout-panel rounded-2xl p-4 space-y-3.5 border-hoyne-copper/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hoyne-copper/25 pb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-display font-black uppercase tracking-wider">
                  Row 1 • Action A (Worker Placement)
                </span>
                <h2 className="font-display font-bold text-lg text-hoyne-cream flex items-center gap-2 tracking-wide">
                  <PackageOpen className="w-5 h-5 text-amber-400" />
                  Victoria Brewhouse Supply Depot (6 Dedicated Stations)
                </h2>
                {activePlayer.placedWorkerStationId ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/70 text-emerald-300 text-[10px] font-display font-bold flex items-center gap-1 shadow">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    Brewer Stationed at {gameState.ingredientStations?.[activePlayer.placedWorkerStationId]?.name || activePlayer.placedWorkerStationId}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-200 text-[10px] font-display font-bold flex items-center gap-1.5 shadow">
                    <BrewerMeepleSVG color={activePlayer.color} size={15} />
                    Brewer Meeple Ready: Place at an Open Stack
                  </span>
                )}
              </div>
              <p className="text-xs text-hoyne-cream/70 mt-1">
                <strong>Exclusive Worker Placement (1 Player per Station per Round):</strong> Place your wooden Brewer Meeple at an open stack to collect ingredients (Grain, Hops &amp; Yeast draw <strong className="text-amber-300">2 cards</strong>; Roastery, Spice Bins &amp; Berry Patch draw <strong className="text-purple-300">1 card</strong>). Each station displays 1 physical card stack. All meeples return at the start of each new round.
              </p>
            </div>
          </div>

          {/* CIRCULAR KETTLE HUB (TOP-DOWN TABLETOP VIEW & GRID) */}
          <CircularKettleHub
            gameState={gameState}
            activePlayer={activePlayer}
            isWorkDay={isWorkDay}
            onPerformWorkerSource={handlePlaceWorker}
            totalSourceDraws={totalSourceDraws}
          />
        </div>
      )}

      {/* Market Gridlock Alert Banner */}
      {isWorkDay && !canAffordAnyTaproomCard && (
        <div className="rounded-xl px-3.5 py-2.5 bg-gradient-to-r from-red-950/80 via-amber-950/70 to-stone-950 border-2 border-amber-500/80 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 text-xs font-sans text-amber-100">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-display font-bold text-amber-300 uppercase tracking-wide text-xs">
                Market Gridlock Alert: No Market Offers are Affordable!
              </div>
              <div className="text-hoyne-cream/80 text-[11px]">
                Your hand of {activePlayer.hand.length} ingredient{activePlayer.hand.length === 1 ? '' : 's'} cannot brew any recipe or install any upgrade currently face-up. You can sweep both rows for fresh cards.
              </div>
            </div>
          </div>
          {onPerformManualFlush && (
            <button
              type="button"
              onClick={onPerformManualFlush}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-black text-xs uppercase tracking-wider shadow cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-stone-950" />
              Flush &amp; Deal Fresh Offers
            </button>
          )}
        </div>
      )}

      {/* Market Flush Event Notification Banner */}
      {gameState.lastMarketFlushEvent && (
        <div className="rounded-xl px-3.5 py-2 bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-stone-950 border border-amber-400/70 flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2 text-xs font-sans text-amber-100">
            <RotateCcw className="w-4 h-4 text-amber-300 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            <span>
              <strong className="text-amber-300 uppercase tracking-wider font-display">
                Market Flush Triggered!
              </strong>{' '}
              ({gameState.lastMarketFlushEvent.reason === 'NO_RECIPES'
                ? '0 Recipes were face-up'
                : gameState.lastMarketFlushEvent.reason === 'NO_UPGRADES'
                ? '0 Upgrades were face-up'
                : 'Manual market sweep triggered'}{' '}
              on Turn {gameState.lastMarketFlushEvent.turn}) — swept stale cards to discard and dealt fresh offers.
            </span>
          </div>
        </div>
      )}

      {/* ===================================================================
          ROW 2: UNIFIED BREWERY MARKET (Legacy 6-Slot Offer Row)
          (Only rendered in legacy mode when Rotary Board is not active)
      =================================================================== */}
      {!gameState.rotaryBoard && (activeMarketTab === 'all' || activeMarketTab === 'brewery') && (
        <div className="stout-panel rounded-2xl p-4 space-y-3 border-hoyne-copper/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hoyne-copper/25 pb-2.5">
            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-display font-black uppercase tracking-wider">
                  Row 2 • Action B (Invest) &amp; Action C (Brew)
                </span>
                <h2 className="font-display font-bold text-lg text-hoyne-cream flex items-center gap-2 tracking-wide">
                  <Beer className="w-5 h-5 text-amber-400" />
                  UNIFIED BREWERY MARKET (6 Parallel Slots)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-stone-900 border border-amber-400/40 text-amber-200 text-[10px] font-sans font-bold">
                  {gameState.breweryMarket?.length ?? 6} Offers on Tap
                </span>
                <span className="px-2 py-0.5 rounded-full bg-stone-950 border border-hoyne-copper/40 text-hoyne-cream/80 text-[10px] font-mono">
                  Compact 9 : 14 (2.25&Prime; &times; 3.5&Prime;)
                </span>
              </div>
              <p className="text-xs text-hoyne-cream/70 mt-0.5">
                Single unified offer row parallel to the Ingredient Conveyor. Spend matching ingredients to <strong className="text-emerald-300">Brew Recipes (Action C)</strong> into Zone 2 (Brewhouse) or <strong className="text-sky-300">Install Dual-Purpose Upgrades (Action B)</strong> onto your Zones or Command Wings.
              </p>
            </div>

            {/* Dedicated 97-Card Brewery Master Deck Draw Pile Backing */}
            <div className="flex items-center gap-2.5 bg-stone-950/90 px-3 py-1.5 rounded-xl border border-amber-500/45 shadow-md">
              <div className="w-11 shrink-0" title='97-Card Master Brewery Compact Deck (2.25" x 3.5")'>
                <TaproomCardBackDeckSVG
                  deckCount={gameState.breweryDeck?.length ?? 91}
                  discardCount={gameState.breweryDiscard?.length ?? 0}
                />
              </div>
              <div className="text-xs font-sans">
                <div className="font-display font-bold text-amber-300 uppercase tracking-wider text-[10.5px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Brewery Master Deck
                </div>
                <div className="text-hoyne-cream/90 text-[11px]">
                  Remaining: <strong className="font-mono text-amber-300">{gameState.breweryDeck?.length ?? 91}</strong> / 97
                </div>
                <div className="text-hoyne-cream/55 text-[9.5px]">
                  Discard: {gameState.breweryDiscard?.length ?? 0}
                </div>
              </div>
              {onPerformManualFlush && (
                <button
                  type="button"
                  disabled={!isWorkDay}
                  onClick={onPerformManualFlush}
                  className={`ml-2 px-3 py-1.5 rounded-lg font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow ${
                    isWorkDay
                      ? 'bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/50 cursor-pointer'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  }`}
                  title="Flush and deal fresh offers"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  Flush
                </button>
              )}
            </div>
          </div>

          {/* 6-Card Parallel Master Brewery Market Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start">
            {(gameState.breweryMarket || []).map((card, slotIdx) => {
              if (card.deckType === 'recipe') {
                const afford = canAffordRecipe(activePlayer, card);
                return (
                  <div key={`${card.id}-${slotIdx}`} className="flex flex-col w-full">
                    <div className="flex items-center justify-between px-1 mb-1 text-[10px] font-mono text-amber-300/80">
                      <span>SLOT #{slotIdx + 1} • RECIPE</span>
                      <span className="uppercase font-sans font-bold text-emerald-300">
                        Brew (Action C)
                      </span>
                    </div>
                    <RecipeCardView
                      recipe={card}
                      activePlayer={activePlayer}
                      isWorkDay={isWorkDay}
                      canBrew={afford.canAfford}
                      brewDisabledReason={afford.reason}
                    />

                    {/* Dedicated Brew Action Button Below Card (Keeps Can Art Tall & Unsquished!) */}
                    <div className="pt-2 shrink-0">
                      <button
                        type="button"
                        disabled={!isWorkDay || !afford.canAfford}
                        onClick={() => onPerformBrew(slotIdx)}
                        title={
                          afford.canAfford
                            ? `Spend ingredients to brew ${card.name} into Brewhouse (Zone 2)`
                            : afford.reason || 'Missing required ingredients'
                        }
                        className={`w-full py-1.5 px-2 rounded-xl font-display font-extrabold text-[9.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md ${
                          isWorkDay && afford.canAfford
                            ? 'copper-bevel-btn cursor-pointer ring-1 ring-amber-300 animate-pulse'
                            : 'bg-stone-900/90 text-stone-500 border border-stone-800 cursor-not-allowed'
                        }`}
                      >
                        <Beer className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {!isWorkDay
                            ? 'Wait Turn'
                            : afford.canAfford
                            ? 'Brew Batch (Action C)'
                            : afford.reason || 'Missing Ingredients'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              } else {
                const afford = canAffordUpgrade(activePlayer, card);
                return (
                  <div key={`${card.id}-${slotIdx}`} className="flex flex-col w-full">
                    <div className="flex items-center justify-between px-1 mb-1 text-[10px] font-mono text-amber-300/80">
                      <span>SLOT #{slotIdx + 1} • UPGRADE</span>
                      <span className="uppercase font-sans font-bold text-sky-300">
                        Invest (Action B)
                      </span>
                    </div>
                    <UpgradeCardView
                      upgrade={card}
                      activePlayer={activePlayer}
                      isWorkDay={isWorkDay}
                      canInvest={afford.canAfford}
                      investDisabledReason={afford.reason}
                      onInvest={(chosenOption) => onPerformInvest(slotIdx, chosenOption)}
                    />
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          ROW 3: MIXER PACK BONUS ROW (4 Face-Up Mixer Packs - Public Race)
          Alongside the Master Recipe offer row (8-Card Bonus Deck: 4 face-up, 4 in deck)
      =================================================================== */}
      {(activeMarketTab === 'all' || activeMarketTab === 'mixers') && (
        <div className="stout-panel rounded-2xl p-4 space-y-3.5 border-2 border-amber-500/70 shadow-2xl bg-gradient-to-br from-[#1C130B] via-[#160E08] to-[#0D0805]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hoyne-copper/30 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-display font-black uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>Bonus Deck • Public Race</span>
                </span>
                <h2 className="font-display font-bold text-lg text-hoyne-cream flex items-center gap-2 tracking-wide">
                  <Package className="w-5 h-5 text-amber-400" />
                  Hoyne Mixer Pack Bounties (4 Active Offers)
                </h2>
              </div>
              <p className="text-xs text-hoyne-cream/80 mt-1 max-w-2xl">
                Public set collection race: The first player to have the required 4 Master Recipes in their off-mat Trophy Stack (Zone 4) claims the card for immediate bonus VP!
              </p>
            </div>

            {/* Mixer Pack Draw Deck Backing */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2.5 bg-black/60 border border-amber-500/40 rounded-xl px-3.5 py-2 shadow-inner">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                  <Package className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    Mixer Draw Deck
                  </div>
                  <div className="text-xs font-mono font-black text-amber-100">
                    {gameState.mixerDeck?.length ?? 0} Cards Left
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Face-Up Mixer Pack Cards Grid (Horizontal Landscape Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 items-stretch">
            {(() => {
              const delivered = [
                ...(activePlayer?.completedBatches || []),
                ...(activePlayer?.zones[5]?.recipes || []),
              ];
              const deliveredNames = delivered.map((r) => r.name);

              return (gameState.mixerMarket || []).map((mixerCard) => (
                <MixerPackCardView
                  key={mixerCard.id}
                  card={mixerCard}
                  completedRecipeNames={deliveredNames}
                  activePlayer={activePlayer}
                />
              ));
            })()}
          </div>
        </div>
      )}
    </section>
  );
};

