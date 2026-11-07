import React from 'react';
import { GameState, IngredientTaxonomy, RotarySlotNumber } from '../engine/types';
import { getPlayerHandLimit, getWarehouseCapacity } from '../engine/gameEngine';
import { WoodenToken, WOODEN_TOKEN_COLORS } from './WoodenTokens';
import {
  Users,
  Play,
  FastForward,
  Settings,
  BookOpen,
  Trophy,
  Warehouse,
  Layers,
  Bot,
  User,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  Beer,
  Wrench,
  ArrowRight,
  Printer,
  Building2,
} from 'lucide-react';

export interface TableSideColumnProps {
  gameState: GameState;
  inspectedPlayerIndex: number;
  onSelectPlayerIndex: (index: number) => void;
  autoPlayAI: boolean;
  setAutoPlayAI: (val: boolean) => void;
  onStepAI: () => void;
  onSkipAI: () => void;
  onOpenRules: () => void;
  onOpenRecipeGallery: () => void;
  onOpenUpgradeGallery: () => void;
  onOpenPdfExport?: (type?: 'all' | 'rules' | 'recipes' | 'upgrades') => void;
  onOpenSetup: () => void;
  onRunMorningShift: () => void;
  onDiscardToken?: (taxonomy: IngredientTaxonomy) => void;
  onOpenLocationsModal?: () => void;
  onToggleDepartments?: (enabled: boolean) => void;
  className?: string;
}

const TAXONOMIES: IngredientTaxonomy[] = [
  'grain',
  'hops',
  'yeast',
  'chocolate',
  'spices',
  'fruit',
];

export const TableSideColumn: React.FC<TableSideColumnProps> = ({
  gameState,
  inspectedPlayerIndex,
  onSelectPlayerIndex,
  autoPlayAI,
  setAutoPlayAI,
  onStepAI,
  onSkipAI,
  onOpenRules,
  onOpenRecipeGallery,
  onOpenUpgradeGallery,
  onOpenPdfExport,
  onOpenSetup,
  onRunMorningShift,
  onDiscardToken,
  onOpenLocationsModal,
  onToggleDepartments,
  className = "",
}) => {
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const humanPlayer = gameState.players.find((p) => !p.isAI) || activePlayer;
  const isHumanTurn = !activePlayer.isAI && gameState.phase !== 'GAME_OVER';
  const handLimit = getPlayerHandLimit(humanPlayer);

  const humanWarehouseCap = getWarehouseCapacity(humanPlayer);
  const humanWarehouseCount = Object.values(humanPlayer.tokens || {}).reduce(
    (sum, v) => sum + (v || 0),
    0
  );
  const humanExcessTokens = Math.max(0, humanWarehouseCount - humanWarehouseCap);
  const isHumanWarehouseOverCap = humanExcessTokens > 0;

  const rotary = gameState.rotaryBoard;
  const activeCatwalkSlot = ([1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]).find(
    (s) => rotary?.slots[s]?.catwalkOccupant?.playerId === activePlayer.id
  );

    return (
    <aside
      aria-label="Table Side Dashboard"
      className={`select-none flex flex-col justify-between gap-2 ${className || "w-full sm:w-[230px] 2xl:w-[245px] shrink-0"}`}
    >
      {/* 2-COLUMN DASHBOARD GRID FOR TOP-ROW DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
        {/* SUBCOLUMN A: TURN INFORMATION & BREWERS ROSTER */}
        <div className="flex flex-col justify-between gap-2">
          {/* TURN INFORMATION & SHIFT GUIDE */}
          <div className="stout-panel rounded-2xl p-2.5 border-amber-500/70 shadow-lg bg-gradient-to-br from-[#1C130B] via-[#150E09] to-[#0D0805] flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-hoyne-copper/30 pb-1.5">
              <span className="font-display font-black text-[10.5px] uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                Turn Guide
              </span>
              {isHumanTurn ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/80 text-emerald-300 text-[9px] font-sans font-bold uppercase tracking-wide animate-pulse">
                  Your Turn
                </span>
              ) : gameState.phase === 'GAME_OVER' ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/80 text-amber-300 text-[9px] font-sans font-bold uppercase tracking-wide">
                  Complete
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/60 text-sky-300 text-[9px] font-sans font-bold uppercase tracking-wide">
                  AI Thinking
                </span>
              )}
            </div>

            {/* Dynamic Action Instructions */}
            {isHumanTurn ? (
              <div className="space-y-1.5 text-[10.5px] leading-snug my-1">
                {gameState.phase === 'MORNING_SHIFT' && (
                  <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/60 space-y-1.5">
                    <div className="font-display font-bold text-amber-200 text-xs flex items-center gap-1">
                      <Play className="w-3 h-3 text-amber-400" />
                      <span>Phase 1: Morning Shift</span>
                    </div>
                    <p className="text-stone-300 text-[9.5px]">
                      Advance your brewery pipeline! Wort slides to Cellar, and fermented beer moves to Packaging to score VP!
                    </p>
                    {isHumanWarehouseOverCap && (
                      <div className="p-1.5 rounded-lg bg-red-950/90 border border-red-500/80 text-red-200 text-[9.5px] font-bold flex items-center gap-1.5 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>Return {humanExcessTokens} excess token{humanExcessTokens > 1 ? 's' : ''} to meet Warehouse Cap ({humanWarehouseCap})!</span>
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={isHumanWarehouseOverCap}
                      onClick={onRunMorningShift}
                      className={`w-full py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow ${
                        isHumanWarehouseOverCap
                          ? 'bg-stone-900 border border-red-500/60 text-stone-500 cursor-not-allowed opacity-60'
                          : 'copper-bevel-btn cursor-pointer'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-stone-950" />
                      Run Shift Slide
                    </button>
                  </div>
                )}

                {(gameState.phase === 'PHASE_2_CATWALK_PLACEMENT' || gameState.phase === 'PHASE_1_WORKER_DRAFT') && (
                  <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/60 space-y-1">
                    <div className="font-display font-bold text-amber-200 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        <span>Step 1: Deploy Brewer</span>
                      </div>
                      <span className="px-1 py-0.2 rounded bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono text-[8px]">
                        1 Worker
                      </span>
                    </div>
                    <p className="text-stone-200 text-[9.5px]">
                      {gameState.enableDepartments !== false ? (
                      <>Click any <strong className="text-amber-300">Catwalk (1–7)</strong>, <strong className="text-amber-300">Center Pantry (#7)</strong>, or your <strong className="text-amber-300">Private Dept</strong> to place meeple.</>
                    ) : (
                      <>Click any <strong className="text-amber-300">Catwalk (1–7)</strong> or the <strong className="text-amber-300">Center Pantry (#7)</strong> to place meeple.</>
                    )}
                    </p>
                  </div>
                )}

                {gameState.phase === 'PHASE_3_STATION_COMMITMENT' && (
                  <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/60 space-y-1">
                    <div className="font-display font-bold text-amber-200 text-[11px] flex items-center justify-between">
                      <span>Step 2: Choose Station Action</span>
                      {activeCatwalkSlot && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[8.5px] border border-amber-400/40">
                          Station #{activeCatwalkSlot}
                        </span>
                      )}
                    </div>
                    <p className="text-stone-200 text-[9.5px]">
                      Take <strong className="text-amber-300">Inner Hopper</strong> tokens, or draft <strong className="text-emerald-300">Outer Shelf Card</strong>!
                    </p>
                  </div>
                )}

                {gameState.phase === 'WORK_DAY' && (
                  <div className="p-1.5 rounded-xl bg-amber-950/80 border border-amber-500/60 text-[9.5px] text-stone-200">
                    Click an <strong className="text-amber-300">Inner Hopper</strong> to harvest, or <strong className="text-emerald-300">Outer Shelf</strong> to brew.
                  </div>
                )}

                {gameState.phase === 'DISCARD' && (
                  <div className="p-1.5 rounded-xl bg-red-950/90 border border-red-500/70 text-[9.5px] text-red-200">
                    Hand limit exceeded. Select cards to discard.
                  </div>
                )}
              </div>
            ) : gameState.phase === 'GAME_OVER' ? (
              <div className="p-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-[9.5px] text-stone-300">
                Shift complete! Inspect final VP standings.
              </div>
            ) : (
              <div className="p-1.5 text-[9.5px] text-stone-300 space-y-1">
                <p><strong className="text-sky-300">{activePlayer.name}</strong> is evaluating options and deploying meeple.</p>
              </div>
            )}
          </div>

          {/* PLAYERS TABLE ROSTER */}
          <div className="stout-panel rounded-2xl p-2 border-hoyne-copper/60 shadow-lg space-y-1">
            <div className="flex items-center justify-between text-[9.5px] font-display font-black uppercase tracking-wider text-amber-300 px-0.5">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-400" />
                Brewers Table
              </span>
              <span className="text-[8.5px] font-mono text-stone-400">
                Goal: {gameState.targetBatchesToTriggerEnd} BBL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1">
              {gameState.players.map((p, idx) => {
                const isCurrent = idx === gameState.currentPlayerIndex;
                const isInspected = idx === inspectedPlayerIndex;
                const z4Count = (p.completedBatches?.length || 0) + (p.zones[5]?.recipes?.length || 0);

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPlayerIndex(idx)}
                    className={`w-full px-1.5 py-0.8 rounded-lg border flex items-center justify-between gap-1 transition-all cursor-pointer text-xs ${
                      isInspected
                        ? 'bg-amber-950/90 border-amber-400 ring-1 ring-amber-400/50 shadow-sm'
                        : isCurrent
                        ? 'bg-stone-900 border-hoyne-copper/80'
                        : 'bg-stone-950/70 border-stone-800/80 hover:border-hoyne-copper/40'
                    }`}
                    title={`Click to inspect ${p.name}'s brewery board`}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="font-serif font-bold text-[10px] text-hoyne-cream truncate">
                        {p.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="brass-badge px-1 py-0.2 rounded text-[8.5px] font-black">
                        {p.score} VP
                      </span>
                      <span className="text-[8px] font-mono text-amber-300/80">
                        {z4Count}/{gameState.targetBatchesToTriggerEnd}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SUBCOLUMN B: REFERENCE BUTTONS & GAME CONTROLS */}
        <div className="flex flex-col justify-between gap-2">
          {/* REFERENCE ARCHIVE */}
          <div className="stout-panel rounded-2xl p-2 border-hoyne-copper/60 shadow-lg space-y-1.5">
            <div className="flex items-center justify-between text-[9.5px] font-display font-black uppercase tracking-wider text-amber-300 px-0.5">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-hoyne-copper" />
                Compendium Archive
              </span>
              <span className="text-[8.5px] font-mono text-stone-400">Reference</span>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={onOpenRules}
                className="py-1 px-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 hover:border-amber-400 text-amber-100 font-display font-bold text-[9.5px] flex items-center justify-between transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center gap-1 truncate">
                  <BookOpen className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">Rules Guide</span>
                </div>
                <ArrowRight className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={onOpenRecipeGallery}
                className="py-1 px-1.5 rounded-lg bg-amber-950/50 border border-amber-600/40 hover:border-amber-400 text-amber-100 font-display font-bold text-[9.5px] flex items-center justify-between transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center gap-1 truncate">
                  <Beer className="w-3 h-3 text-yellow-400 shrink-0" />
                  <span className="truncate">Recipe Cards</span>
                </div>
                <ArrowRight className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={onOpenUpgradeGallery}
                className="py-1 px-1.5 rounded-lg bg-stone-900 border border-stone-700/80 hover:border-amber-400 text-stone-200 font-display font-bold text-[9.5px] flex items-center justify-between transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center gap-1 truncate">
                  <Wrench className="w-3 h-3 text-orange-400 shrink-0" />
                  <span className="truncate">Hardware/Staff</span>
                </div>
                <ArrowRight className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              </button>

              {onOpenLocationsModal && (
                <button
                  type="button"
                  onClick={onOpenLocationsModal}
                  className="py-1 px-1.5 rounded-lg bg-amber-950/50 border border-amber-600/40 hover:border-amber-400 text-amber-100 font-display font-bold text-[9.5px] flex items-center justify-between transition-all cursor-pointer shadow-sm group"
                >
                  <div className="flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">5 Zones</span>
                  </div>
                  <ArrowRight className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                </button>
              )}

              {onOpenPdfExport && (
                <button
                  type="button"
                  onClick={() => onOpenPdfExport('all')}
                  className="col-span-2 py-1 px-2 rounded-lg bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border border-amber-400/50 hover:border-amber-300 text-amber-100 font-display font-bold text-[9.5px] flex items-center justify-between transition-all cursor-pointer shadow-sm group"
                >
                  <div className="flex items-center gap-1.5">
                    <Printer className="w-3 h-3 text-amber-400" />
                    <span>Make a PDF Print Sheet</span>
                  </div>
                  <ArrowRight className="w-2.5 h-2.5 text-amber-400" />
                </button>
              )}
            </div>
          </div>

          {/* GAME CONTROLS */}
          <div className="stout-panel rounded-2xl p-2 border-hoyne-copper/40 shadow-md flex flex-col gap-1.5 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <label className="flex-1 flex items-center gap-1.5 text-[10px] font-sans text-hoyne-cream/90 bg-stone-900/90 px-2 py-1 rounded-lg border border-hoyne-copper/30 cursor-pointer hover:border-amber-400/60 transition">
                <input
                  type="checkbox"
                  checked={autoPlayAI}
                  onChange={(e) => setAutoPlayAI(e.target.checked)}
                  className="accent-amber-500 w-3 h-3 rounded"
                />
                <span className="font-semibold">Auto AI</span>
              </label>

              {onToggleDepartments && (
                <label className="flex-1 flex items-center gap-1.5 text-[10px] font-sans text-hoyne-cream/90 bg-stone-900/90 px-2 py-1 rounded-lg border border-hoyne-copper/30 cursor-pointer hover:border-amber-400/60 transition" title="Toggle Personal Brewery Department Cards (#1–#10) on/off">
                  <input
                    type="checkbox"
                    checked={gameState.enableDepartments !== false}
                    onChange={(e) => onToggleDepartments(e.target.checked)}
                    className="accent-amber-500 w-3 h-3 rounded"
                  />
                  <span className="font-semibold flex items-center gap-1 text-amber-300">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    <span>Depts</span>
                  </span>
                </label>
              )}

              {activePlayer.isAI && gameState.phase !== 'GAME_OVER' && (
                <div className="flex items-center gap-1 flex-1">
                  <button
                    type="button"
                    onClick={onStepAI}
                    className="flex-1 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-sans font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer transition shadow"
                  >
                    <Play className="w-2.5 h-2.5" /> Step
                  </button>
                  <button
                    type="button"
                    onClick={onSkipAI}
                    className="flex-1 py-1 rounded-lg copper-bevel-btn font-display font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer shadow"
                    title="Fast-forward through AI turns"
                  >
                    <FastForward className="w-2.5 h-2.5" /> Skip
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenSetup}
              className="w-full py-1.5 rounded-xl copper-bevel-btn font-display font-black text-[10.5px] flex items-center justify-center gap-1.5 cursor-pointer shadow"
            >
              <Settings className="w-3 h-3" /> New Game Setup (1–6P)
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};