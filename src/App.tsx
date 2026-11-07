import React, { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  SourcePickChoice,
  IngredientStationId,
  RotarySlotNumber,
  RotaryCatwalkAction,
  IngredientTaxonomy,
  ZoneId,
} from './engine/types';
import {
  createInitialGameState,
  executeMorningShift,
  performSourceAction,
  performWorkerSourceAction,
  performInvestAction,
  performBrewAction,
  performDiscardExcess,
  performDiscardToken,
  advanceTurn,
  getPlayerHandLimit,
  getWarehouseCapacity,
  getTargetBatchesForPlayerCount,
  performManualTaproomFlush,
  performConveyorSlide,
  performRotaryAction,
  performDepartmentPlacement,
  performDepartmentAction,
  DepartmentActionPayload,
  performCenterPantryAction,
  performEndOfShiftSlide,
  executePhase2ConveyorOperations,
} from './engine/gameEngine';
import { executeAITurn } from './engine/ai';
import { VisualRulebookModal } from './components/VisualRulebookModal';
import { RotaryBoard } from './components/RotaryBoard';
import { MixerPackCardView } from './components/CardComponents';
import { AssemblyLine } from './components/AssemblyLine';
import { TrophyRack, BrewedRecipePileCard } from './components/TrophyRack';
import { BreweryLocationsModal } from './components/BreweryLocationsModal';
import { TableSideColumn } from './components/TableSideColumn';
import { CardGalleryModal } from './components/CardGalleryModal';
import { CardInspectorModal } from './components/CardInspectorModal';
import { PdfExportModal } from './components/PdfExportModal';
import { PdfExportType } from './utils/pdfExport';
import { CardInspectorProvider, useCardInspector } from './context/CardInspectorContext';
import {
  Play,
  FastForward,
  Settings,
  Trophy,
  Sparkles,
  ScrollText,
  ArrowRight,
  RotateCcw,
  Users,
  BookOpen,
  X,
  ZoomIn,
  Package,
  PackageCheck,
  Building2,
  User,
  Printer,
  Bot,
  Compass,
  Warehouse,
} from 'lucide-react';

function MainAppContent() {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState({ playerCount: 4, humanCount: 1 })
  );
  const [inspectedPlayerIndex, setInspectedPlayerIndex] = useState<number>(0);
  useEffect(() => {
    (window as any).__gameState = gameState;
    (window as any).__setGameState = setGameState;
  }, [gameState]);
  const [autoMorningShift, setAutoMorningShift] = useState<boolean>(false);
  const [autoPlayAI, setAutoPlayAI] = useState<boolean>(true);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showLocationsModal, setShowLocationsModal] = useState<boolean>(false);
  const [selectedLocationId, setSelectedLocationId] = useState<ZoneId | null>(null);
  const [galleryTab, setGalleryTab] = useState<'recipes' | 'upgrades' | 'equipment' | 'staff' | null>(null);
  const [pdfExportType, setPdfExportType] = useState<PdfExportType | null>(null);
  const [dismissedGameOver, setDismissedGameOver] = useState<boolean>(false);

  const { hoverZoomEnabled, setHoverZoomEnabled } = useCardInspector();

  // Setup Modal Form State
  const [setupPlayerCount, setSetupPlayerCount] = useState<number>(4);
  const [setupHumanCount, setSetupHumanCount] = useState<number>(1);
  const [setupEnableDepartments, setSetupEnableDepartments] = useState<boolean>(true);

  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = !activePlayer.isAI && gameState.phase !== 'GAME_OVER';

  // Keep inspected player synced to active human player when turn changes to a human
  useEffect(() => {
    if (!activePlayer.isAI) {
      setInspectedPlayerIndex(gameState.currentPlayerIndex);
    }
  }, [gameState.currentPlayerIndex, activePlayer.isAI]);

  // Reset dismissedGameOver when starting a new game
  useEffect(() => {
    if (gameState.phase !== 'GAME_OVER') {
      setDismissedGameOver(false);
    }
  }, [gameState.phase]);

  // Dev state bridge for testing / verification
  useEffect(() => {
    (window as any).__gameState = gameState;
    (window as any).__setGameState = setGameState;
    (window as any).__executePhase2ConveyorOperations = () => {
      setGameState((prev) => executePhase2ConveyorOperations(prev));
    };
  }, [gameState]);

  // Optional Auto-Run Morning Shift for Human Player
  useEffect(() => {
    (window as any).__gameState = gameState;
    (window as any).__setGameState = setGameState;
  }, [gameState]);

  useEffect(() => {
    if (
      autoMorningShift &&
      isHumanTurn &&
      gameState.phase === 'MORNING_SHIFT'
    ) {
      const timer = setTimeout(() => {
        setGameState((prev) => executeMorningShift(prev));
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [autoMorningShift, isHumanTurn, gameState.phase]);

  // Auto-advance AI turns when autoPlayAI is enabled
  useEffect(() => {
    if (
      autoPlayAI &&
      activePlayer.isAI &&
      gameState.phase !== 'GAME_OVER'
    ) {
      const timer = setTimeout(() => {
        setGameState((prev) => executeAITurn(prev));
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [autoPlayAI, activePlayer.isAI, gameState.phase, gameState.turnNumber, gameState.currentPlayerIndex]);

  // Auto-advance / self-heal DISCARD phase if active player's hand is within their hand limit
  useEffect(() => {
    if (gameState.phase === 'DISCARD') {
      const player = gameState.players[gameState.currentPlayerIndex];
      const limit = getPlayerHandLimit(player);
      if (player.hand.length <= limit) {
        setGameState((prev) => advanceTurn(prev));
      }
    }
  }, [gameState.phase, gameState.currentPlayerIndex, gameState.players]);

  const handleStartNewGame = useCallback(
    (playerCount: number, humanCount: number, enableDepartments?: boolean) => {
      const nextState = createInitialGameState({
        playerCount,
        humanCount: Math.min(humanCount, playerCount),
        enableDepartments: enableDepartments ?? setupEnableDepartments,
      });
      setGameState(nextState);
      setInspectedPlayerIndex(0);
      setShowSetupModal(false);
      setDismissedGameOver(false);
    },
    [setupEnableDepartments]
  );

  const handleRunMorningShift = () => {
    if (gameState.phase !== 'MORNING_SHIFT') return;
    const humanPlayer = gameState.players.find((p) => !p.isAI) || gameState.players[gameState.currentPlayerIndex];
    const totalTokens = Object.values(humanPlayer.tokens || {}).reduce((s, v) => s + (v || 0), 0);
    const cap = getWarehouseCapacity(humanPlayer);
    if (totalTokens > cap) return; // Strict enforcement: must return excess tokens down to capacity first
    setGameState((prev) => executeMorningShift(prev));
  };

  const handleStepAI = () => {
    if (gameState.phase === 'GAME_OVER') return;
    if (activePlayer.isAI) {
      setGameState((prev) => executeAITurn(prev));
    }
  };

  const handleFastForwardToHumanOrEnd = () => {
    setGameState((prev) => {
      let current = prev;
      let safety = 0;
      while (
        current.phase !== 'GAME_OVER' &&
        current.players[current.currentPlayerIndex].isAI &&
        safety < 100
      ) {
        current = executeAITurn(current);
        safety++;
      }
      return current;
    });
  };

  const handleSource = (choices: SourcePickChoice[]) => {
    setGameState((prev) => performSourceAction(prev, choices));
  };

  const handleWorkerSource = (stationId: IngredientStationId, draftCardIds?: string[]) => {
    setGameState((prev) => performWorkerSourceAction(prev, stationId, draftCardIds));
  };

  const handleInvest = (
    shopIndex: number,
    chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing'
  ) => {
    setGameState((prev) => performInvestAction(prev, shopIndex, undefined, chosenOption));
  };

  const handleBrew = (pubIndex: number) => {
    setGameState((prev) => performBrewAction(prev, pubIndex));
  };

  const handleDiscardExcess = (discardIds: string[]) => {
    setGameState((prev) => performDiscardExcess(prev, discardIds));
  };

  const handleDiscardToken = (taxonomy: IngredientTaxonomy) => {
    const targetPlayer = gameState.players[inspectedPlayerIndex] || gameState.players[gameState.currentPlayerIndex];
    setGameState((prev) => performDiscardToken(prev, targetPlayer.id, taxonomy));
  };

  const handleManualFlush = () => {
    setGameState((prev) => performManualTaproomFlush(prev));
  };

  const handleConveyorSlide = () => {
    setGameState((prev) => performConveyorSlide(prev));
  };

  const handleRotaryAction = (
    slotNumber: RotarySlotNumber,
    actionType: RotaryCatwalkAction,
    chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing',
    chosenPaymentTokens?: Partial<Record<IngredientTaxonomy, number>>
  ) => {
    setGameState((prev) =>
      performRotaryAction(prev, slotNumber, actionType, chosenOption, chosenPaymentTokens)
    );
  };

  const handleEndOfShiftSlide = () => {
    const humanPlayer = gameState.players.find((p) => !p.isAI) || gameState.players[gameState.currentPlayerIndex];
    const totalTokens = Object.values(humanPlayer.tokens || {}).reduce((s, v) => s + (v || 0), 0);
    const cap = getWarehouseCapacity(humanPlayer);
    if (totalTokens > cap) return; // Strict enforcement: cannot end shift while over warehouse capacity
    setGameState((prev) => performEndOfShiftSlide(prev));
  };

  const handleCenterPantryAction = (ingredient: IngredientTaxonomy) => {
    setGameState((prev) => performCenterPantryAction(prev, ingredient));
  };

  const handlePlaceDepartment = (playerId: string) => {
    setGameState((prev) => performDepartmentPlacement(prev, playerId));
  };

  const handleExecuteDepartmentAction = (payload?: DepartmentActionPayload) => {
    setGameState((prev) => performDepartmentAction(prev, payload));
  };

  // Ranked players for scoreboard
  const rankedPlayers = [...gameState.players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDelivered = (a.completedBatches?.length || 0) + (a.zones[5]?.recipes?.length || 0);
    const bDelivered = (b.completedBatches?.length || 0) + (b.zones[5]?.recipes?.length || 0);
    return bDelivered - aDelivered;
  });

  return (
    <div className="min-h-screen flex flex-col bg-brewery-table text-hoyne-cream">
      {/* ===================================================================
          STREAMLINED NO-HEADER TABLETOP LAYOUT
          LEFT: TableSideColumn (Turn, Players, Token Reserve, Controls)
          CENTER: The Rotary Brewhouse Dial (Gameboard)
          RIGHT: The Brewery Board + Mixer Pack Bounties
          ZERO VERTICAL SCROLLING!
      =================================================================== */}
      <main className="flex-1 w-full max-w-[2560px] mx-auto p-2 sm:p-3 overflow-hidden">
        {/* Final Round in Progress Banner (Rule 5: Equal Turns) */}
        {gameState.isFinalRound && gameState.phase !== 'GAME_OVER' && (
          <div className="mb-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-950/95 via-yellow-950/90 to-amber-950/95 border-2 border-amber-400 shadow-xl flex items-center justify-between gap-3 text-xs animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔔</span>
              <div>
                <span className="font-display font-black tracking-wide text-amber-300 text-sm uppercase">
                  Final Round in Progress!
                </span>
                <span className="ml-2 font-sans text-amber-100">
                  {gameState.players.find((p) => p.id === gameState.endgameTriggeredByPlayerId)?.name || 'A player'} reached the target {gameState.targetBatchesToTriggerEnd} packaged batches! Under <strong>Rule 5 (Equal Turns)</strong>, all players complete this round so everyone has an equal number of turns before final scoring.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/30 border border-amber-300 text-amber-200 font-display font-bold text-[11px] shrink-0 uppercase tracking-wider">
              Equal Turns Active
            </span>
          </div>
        )}

        {/* Slide / Claim Toasts (When Active) */}
        {(gameState.lastMorningShiftEvents.length > 0 || gameState.lastMixerClaimEvent) && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 flex flex-wrap items-center gap-2 text-xs">
            {gameState.lastMorningShiftEvents.map((ev, idx) => (
              <span
                key={`${ev.recipeId}-${idx}`}
                className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-100 text-[11px] font-sans font-semibold"
              >
                {ev.recipeName}: Zone {ev.fromZone} → Zone {ev.toZone}
                {ev.vpEarned ? ` (+${ev.vpEarned} VP!)` : ''}
              </span>
            ))}
            {gameState.lastMixerClaimEvent && (
              <span className="px-2.5 py-0.5 rounded-xl bg-amber-500/25 border border-amber-400/80 text-amber-200 text-xs font-sans font-bold flex items-center gap-1.5 shadow">
                <Trophy className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>
                  <strong>{gameState.lastMixerClaimEvent.playerName}</strong> claimed{' '}
                  <strong>{gameState.lastMixerClaimEvent.cardName}</strong> (+{gameState.lastMixerClaimEvent.vp} VP)!
                </span>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-stretch gap-3 w-full">
          {/* COLUMN 1 (LEFT): THE GAMEBOARD (Rotary Brewhouse Dial - Moved to Far Left) */}
          <div className="w-full lg:w-[740px] xl:w-[800px] 2xl:w-[840px] shrink-0 flex flex-col">
            <div className="stout-panel rounded-2xl p-2 sm:p-2.5 border-hoyne-copper/70 shadow-2xl w-full h-full flex flex-col justify-between">
              {gameState.rotaryBoard ? (
                <RotaryBoard
                  gameState={gameState}
                  activePlayer={activePlayer}
                  isWorkDay={
                    isHumanTurn &&
                    (gameState.phase === 'WORK_DAY' ||
                      gameState.phase === 'PHASE_1_WORKER_DRAFT' ||
                      gameState.phase === 'PHASE_2_CATWALK_PLACEMENT' ||
                      gameState.phase === 'PHASE_3_STATION_COMMITMENT' ||
                      gameState.phase === 'PHASE_2_CONVEYOR_OPERATIONS')
                  }
                  onPerformRotaryAction={handleRotaryAction}
                  onPerformCenterPantryAction={handleCenterPantryAction}
                  onPerformEndOfShiftSlide={handleEndOfShiftSlide}
                />
              ) : null}
            </div>
          </div>

          {/* COLUMN 2 (RIGHT): DASHBOARD, PUBLIC BOUNTIES & EXPANDED BREWERY BOARD */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5 h-full">
            {/* TOP RIGHT: Side Dashboard (Turn, Players, Reference, Controls) + Public Bounties */}
            <div className="flex flex-col xl:flex-row items-stretch gap-2.5 w-full">
              {/* Table Side Dashboard */}
              <TableSideColumn
                className="w-full xl:w-[410px] 2xl:w-[440px] shrink-0"
                gameState={gameState}
                inspectedPlayerIndex={inspectedPlayerIndex}
                onSelectPlayerIndex={setInspectedPlayerIndex}
                autoPlayAI={autoPlayAI}
                setAutoPlayAI={setAutoPlayAI}
                onStepAI={handleStepAI}
                onSkipAI={handleFastForwardToHumanOrEnd}
                onOpenRules={() => setShowRulesModal(true)}
                onOpenRecipeGallery={() => setGalleryTab('recipes')}
                onOpenUpgradeGallery={() => setGalleryTab('upgrades')}
                onOpenPdfExport={(type) => setPdfExportType(type || 'all')}
                onOpenSetup={() => setShowSetupModal(true)}
                onRunMorningShift={handleRunMorningShift}
                onDiscardToken={handleDiscardToken}
                onOpenLocationsModal={() => setShowLocationsModal(true)}
              />

              {/* Public Bounties & Brewed Recipe Pile (5 Cards) */}
              <div className="flex-1 min-w-0 stout-panel rounded-2xl p-2.5 border-2 border-amber-500/70 shadow-2xl bg-gradient-to-br from-[#1C130B] via-[#160E08] to-[#0D0805] flex flex-col justify-between">
                {/* Unified Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hoyne-copper/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-display font-black uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>Public Bounties &amp; Trophy Pile</span>
                    </span>
                    <h2 className="font-display font-bold text-sm text-hoyne-cream flex items-center gap-2 tracking-wide">
                      Mixer Pack Bounties (4) &amp; Brewed Recipe Pile (1)
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-black/60 border border-amber-500/40 rounded-xl px-2.5 py-1 shadow-inner">
                      <Package className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-mono font-bold text-amber-200">
                        {gameState.mixerDeck?.length ?? 0} in Deck
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl px-2.5 py-1 shadow-inner">
                      <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-emerald-300">
                        {((gameState.players[inspectedPlayerIndex]?.completedBatches || []).length + (gameState.players[inspectedPlayerIndex]?.zones[5]?.recipes || []).length)}/{gameState.targetBatchesToTriggerEnd} Batches
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5 Cards Row (Actual Size: 4 Mixer Packs + 1 Brewed Recipe Pile) */}
                <div className="grid grid-cols-5 gap-2 items-stretch w-full mt-2">
                  {/* 4 Active Mixer Pack Offers */}
                  {(gameState.mixerMarket || []).slice(0, 4).map((mixerCard) => (
                    <MixerPackCardView
                      key={mixerCard.id}
                      card={mixerCard}
                      completedRecipeNames={[
                        ...(gameState.players[inspectedPlayerIndex]?.completedBatches || []),
                        ...(gameState.players[inspectedPlayerIndex]?.zones[5]?.recipes || []),
                      ].map((r) => r.name)}
                      activePlayer={gameState.players[inspectedPlayerIndex] || gameState.players[0]}
                      compact={true}
                    />
                  ))}

                  {/* 5th Card: Brewed Recipe Pile (Delivered Beers Stack) */}
                  <BrewedRecipePileCard
                    player={gameState.players[inspectedPlayerIndex] || gameState.players[0]}
                    targetBatches={gameState.targetBatchesToTriggerEnd}
                  />
                </div>
              </div>
            </div>

            {/* BOTTOM RIGHT: THE BREWERY (5-Zone Assembly Line - Stretched Wide!) */}
            <div className="w-full">
              <AssemblyLine
                gameState={gameState}
                inspectedPlayerIndex={inspectedPlayerIndex}
                onSelectPlayerIndex={setInspectedPlayerIndex}
                onPerformDiscardExcess={handleDiscardExcess}
                onDiscardToken={handleDiscardToken}
                onInspectZone={(zoneId) => {
                  setSelectedLocationId(zoneId);
                  setShowLocationsModal(true);
                }}
                onPlaceDepartment={handlePlaceDepartment}
                onExecuteDepartmentAction={handleExecuteDepartmentAction}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ===================================================================
          NEW GAME / TABLE SETUP MODAL (1 TO 6 PLAYERS)
      =================================================================== */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="stout-panel rounded-2xl max-w-lg w-full p-6 space-y-5 border-2 border-hoyne-copper shadow-2xl">
            <div className="flex items-center justify-between border-b border-hoyne-copper/30 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-hoyne-copper" />
                <h2 className="font-serif font-bold text-xl text-hoyne-cream">
                  New Brewery Game Setup (1–6 Players)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <div className="text-xs font-sans font-bold uppercase tracking-wider text-amber-300">
                Quick-Start Presets
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStartNewGame(4, 1)}
                  className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/60 text-left transition-all cursor-pointer"
                >
                  <div className="font-serif font-bold text-sm text-amber-200">
                    4-Player Table (Standard)
                  </div>
                  <div className="text-[11px] text-hoyne-cream/75">
                    1 Human vs 3 AI • Target: 6 Batches
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartNewGame(2, 1)}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-hoyne-copper/40 text-left transition-all cursor-pointer"
                >
                  <div className="font-serif font-bold text-sm text-hoyne-cream">
                    2-Player Duel
                  </div>
                  <div className="text-[11px] text-hoyne-cream/75">
                    1 Human vs 1 AI • Target: 8 Batches
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartNewGame(6, 1)}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-hoyne-copper/40 text-left transition-all cursor-pointer"
                >
                  <div className="font-serif font-bold text-sm text-hoyne-cream">
                    6-Player Full House
                  </div>
                  <div className="text-[11px] text-hoyne-cream/75">
                    1 Human vs 5 AI • Target: 4 Batches
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleStartNewGame(1, 1)}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-hoyne-copper/40 text-left transition-all cursor-pointer"
                >
                  <div className="font-serif font-bold text-sm text-hoyne-cream">
                    Solo Brewmaster
                  </div>
                  <div className="text-[11px] text-hoyne-cream/75">
                    1 Human Solo Optimization • Target: 8 Batches
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Player Count & Human Seat Configuration */}
            <div className="space-y-3 pt-2 border-t border-hoyne-copper/25">
              {/* Optional Personal Brewery Departments Toggle */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3 shadow-inner">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-serif font-bold text-sm text-amber-200">
                      Personal Brewery Departments (#1–#10)
                    </span>
                  </div>
                  <p className="text-[11px] text-hoyne-cream/70 leading-snug">
                    Each player receives a unique private department card docked to Zone 1 Warehouse with Tier 2 shift actions and passive buffers.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={setupEnableDepartments}
                    onChange={(e) => setSetupEnableDepartments(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-sm"></div>
                </label>
              </div>
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-hoyne-cream/80 mb-1.5">
                  Total Players (1 to 6): {setupPlayerCount} Players (Endgame Target:{' '}
                  {getTargetBatchesForPlayerCount(setupPlayerCount)} Batches)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => {
                        setSetupPlayerCount(cnt);
                        if (setupHumanCount > cnt) setSetupHumanCount(cnt);
                      }}
                      className={`flex-1 py-2 rounded-lg font-sans font-bold text-sm border ${
                        setupPlayerCount === cnt
                          ? 'bg-hoyne-copper text-stone-950 border-amber-300'
                          : 'bg-stone-900 text-hoyne-cream border-stone-700'
                      }`}
                    >
                      {cnt}P
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-hoyne-cream/80 mb-1.5">
                  Human Seats: {setupHumanCount} Human / {setupPlayerCount - setupHumanCount} AI
                </label>
                <div className="flex gap-2">
                  {Array.from({ length: setupPlayerCount + 1 }, (_, i) => i).map((hCnt) => (
                    <button
                      key={hCnt}
                      type="button"
                      onClick={() => setSetupHumanCount(hCnt)}
                      className={`flex-1 py-1.5 rounded-lg font-sans font-bold text-xs border ${
                        setupHumanCount === hCnt
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-stone-900 text-hoyne-cream border-stone-700'
                      }`}
                    >
                      {hCnt} Human
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSetupModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-sans font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStartNewGame(setupPlayerCount, setupHumanCount)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-hoyne-copper to-amber-500 text-stone-950 font-sans font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Start Custom Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MASTER CARD GALLERY COMPENDIUM (RECIPES & UPGRADES)
      =================================================================== */}
      <CardGalleryModal
        isOpen={galleryTab !== null}
        initialTab={galleryTab || 'recipes'}
        onOpenPdfExport={(type) => setPdfExportType(type || 'all')}
        onClose={() => setGalleryTab(null)}
      />

      {/* ===================================================================
          PDF EXPORT & PRINTABLE DOSSIER MODAL
      =================================================================== */}
      <PdfExportModal
        isOpen={pdfExportType !== null}
        initialType={pdfExportType || 'all'}
        onClose={() => setPdfExportType(null)}
      />

      {/* ===================================================================
          BREWERY LOCATIONS & TURN OPERATIONS GUIDE MODAL
      =================================================================== */}
      <BreweryLocationsModal
        isOpen={showLocationsModal}
        initialLocationId={selectedLocationId}
        onClose={() => setShowLocationsModal(false)}
      />

      {/* ===================================================================
          VISUAL RULEBOOK & COMPONENT OPERATIONS MANUAL (MODERN EUROGAME FORMAT)
      =================================================================== */}
      <VisualRulebookModal
        isOpen={showRulesModal}
        gameState={gameState}
        activePlayer={activePlayer}
        onClose={() => setShowRulesModal(false)}
        onOpenPdfExport={() => setPdfExportType('rules')}
      />

      {/* ===================================================================
          GAME OVER TAPROOM FINALE MODAL
      =================================================================== */}
      {gameState.phase === 'GAME_OVER' && !dismissedGameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="stout-panel rounded-3xl max-w-3xl w-full p-6 space-y-5 border-2 border-amber-400 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hoyne-copper/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl brass-badge flex items-center justify-center shadow-lg">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-sans font-black uppercase tracking-widest text-amber-400">
                    Victoria, BC Taproom Finale
                  </span>
                  <h2 className="font-serif font-bold text-2xl text-hoyne-cream">
                    Master Brewer Standings — Shift Complete!
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedGameOver(true)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {rankedPlayers.map((p, rankIdx) => {
                const isWinner = gameState.winnerIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-3 ${
                      isWinner
                        ? 'bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/60 border-amber-400 ring-2 ring-amber-400/40'
                        : 'bg-stone-900/90 border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-xl font-sans font-black text-sm flex items-center justify-center ${
                          isWinner
                            ? 'brass-badge'
                            : 'bg-stone-800 text-stone-300 border border-stone-600'
                        }`}
                      >
                        #{rankIdx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-lg text-hoyne-cream">
                            {p.name}
                          </span>
                          {isWinner && (
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-sans font-black text-[10px] uppercase">
                              Master of Hoyne
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-hoyne-cream/75">
                          Packaged Batches: <strong>{((p.completedBatches || []).length + (p.zones[5]?.recipes || []).length)}</strong> •{' '}
                          {[...(p.completedBatches || []), ...(p.zones[5]?.recipes || [])].map((r) => r.name).join(', ') || 'None'}
                          {p.mixerPacks && p.mixerPacks.length > 0 && (
                            <span className="text-amber-300 ml-1.5 font-semibold">
                              • Mixers: {p.mixerPacks.map((m) => m.name).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                        Base Recipes: <strong>{p.scoreBreakdown.recipeBaseVp}</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                        Dock Bonuses: <strong>+{p.scoreBreakdown.recipeBonusVp}</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                        Taco Bar / Triggers: <strong>+{p.scoreBreakdown.upgradeTriggeredVp}</strong>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
                        Upgrades: <strong>+{p.scoreBreakdown.upgradeStaticVp}</strong>
                      </div>
                      {p.scoreBreakdown.mixerPackVp > 0 && (
                        <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-200">
                          Mixer Packs: <strong>+{p.scoreBreakdown.mixerPackVp}</strong>
                        </div>
                      )}
                      <div className="brass-badge px-3.5 py-1.5 rounded-xl font-black text-base">
                        {p.score} VP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDismissedGameOver(true)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-hoyne-cream font-sans font-bold text-xs cursor-pointer"
              >
                Inspect Final Board
              </button>
              <button
                type="button"
                onClick={() =>
                  handleStartNewGame(
                    gameState.players.length,
                    gameState.players.filter((p) => !p.isAI).length
                  )
                }
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-hoyne-copper to-amber-400 text-stone-950 font-sans font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Brew Another Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <CardInspectorProvider>
      <MainAppContent />
      <CardInspectorModal />
    </CardInspectorProvider>
  );
}

export default App;
