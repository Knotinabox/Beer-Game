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
      className="w-full sm:w-[230px] 2xl:w-[245px] shrink-0 flex flex-col justify-between gap-2.5 select-none"
    >
      {/* 2. PLAYERS TABLE ROSTER */}
      <div className="stout-panel rounded-2xl p-2.5 border-hoyne-copper/60 shadow-lg space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-display font-black uppercase tracking-wider text-amber-300 px-0.5">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-amber-400" />
            Brewers Table
          </span>
          <span className="text-[9px] font-mono text-stone-400">
            Goal: {gameState.targetBatchesToTriggerEnd}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {gameState.players.map((p, idx) => {
            const isCurrent = idx === gameState.currentPlayerIndex;
            const isInspected = idx === inspectedPlayerIndex;
            const z4Count = (p.completedBatches?.length || 0) + (p.zones[5]?.recipes?.length || 0);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPlayerIndex(idx)}
                className={`w-full px-2 py-1 rounded-xl border flex items-center justify-between gap-1 transition-all cursor-pointer text-xs ${
                  isInspected
                    ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                    : isCurrent
                    ? 'bg-stone-900 border-hoyne-copper/80'
                    : 'bg-stone-950/70 border-stone-800/80 hover:border-hoyne-copper/40'
                }`}
                title={`Click to inspect ${p.name}'s brewery board`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="font-serif font-bold text-[11px] text-hoyne-cream truncate">
                    {p.name}
                  </span>
                  {p.isAI ? (
                    <Bot className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                  ) : (
                    <User className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="brass-badge px-1.5 py-0.2 rounded text-[9.5px] font-black">
                    {p.score} VP
                  </span>
                  <span className="text-[9px] font-mono text-amber-300/80">
                    {z4Count}/{gameState.targetBatchesToTriggerEnd}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. RULES & CARD COMPENDIUM ARCHIVE */}
      <div className="stout-panel rounded-2xl p-2.5 border-hoyne-copper/60 shadow-lg space-y-2">
        <div className="flex items-center justify-between text-[10px] font-display font-black uppercase tracking-wider text-amber-300 px-0.5">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-hoyne-copper" />
            Rules &amp; Card Archive
          </span>
          <span className="text-[9px] font-mono text-stone-400">Reference</span>
        </div>

        {/* 3 Reference Buttons: Rules, Recipe Cards, Upgrade Cards */}
        <div className="flex flex-col gap-1.5">
          {/* Rules Guide Button */}
          <button
            type="button"
            onClick={onOpenRules}
            className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-stone-900 border border-amber-500/50 hover:border-amber-400 hover:from-amber-900/90 hover:to-stone-850 text-amber-100 font-display font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold tracking-wide">Tabletop Rules</div>
                <div className="text-[9px] font-sans text-stone-400">Turn guide &amp; dial rules</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Recipe Cards Compendium Button */}
          <button
            type="button"
            onClick={onOpenRecipeGallery}
            className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-stone-900 border border-amber-600/40 hover:border-amber-400 hover:from-amber-900/80 hover:to-stone-850 text-amber-100 font-display font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300 group-hover:scale-110 transition-transform">
                <Beer className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold tracking-wide">Recipe Cards</div>
                <div className="text-[9px] font-sans text-stone-400">16 formulas &bull; 60 cards</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Upgrade Cards Compendium Button */}
          <button
            type="button"
            onClick={onOpenUpgradeGallery}
            className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-stone-950 to-stone-900 border border-stone-700/80 hover:border-amber-400/70 hover:from-stone-900 hover:to-amber-950/40 text-stone-200 font-display font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-md group"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-300 group-hover:scale-110 transition-transform">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold tracking-wide">Equipment &amp; Staff</div>
                <div className="text-[9px] font-sans text-stone-400">20 Hardware &bull; 20 Staff cards</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

                    {/* Brewery Zones Guide Button */}
          {onOpenLocationsModal && (
            <button
              type="button"
              onClick={onOpenLocationsModal}
              className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-stone-900 border border-amber-600/40 hover:border-amber-400 hover:from-amber-900/80 hover:to-stone-850 text-amber-100 font-display font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-md group"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold tracking-wide">Brewery Zones</div>
                  <div className="text-[9px] font-sans text-stone-400">Warehouse, Brewhouse, Cellar...</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          {/* Make a PDF Button */}
          {onOpenPdfExport && (
            <button
              type="button"
              onClick={() => onOpenPdfExport('all')}
              className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border border-amber-400/50 hover:border-amber-300 hover:from-amber-900/90 hover:to-stone-800 text-amber-100 font-display font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-md group mt-0.5"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold tracking-wide flex items-center gap-1.5">
                    <span>Make a PDF</span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                      Print
                    </span>
                  </div>
                  <div className="text-[9px] font-sans text-stone-400">Rules &amp; card compendium</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* 4. GAME CONTROLS */}
      <div className="stout-panel rounded-2xl p-2.5 border-hoyne-copper/40 shadow-md flex flex-col gap-2 text-xs">
        <label className="flex items-center gap-2 text-[11px] font-sans text-hoyne-cream/90 bg-stone-900/90 px-2.5 py-1.5 rounded-xl border border-hoyne-copper/30 cursor-pointer hover:border-amber-400/60 transition">
          <input
            type="checkbox"
            checked={autoPlayAI}
            onChange={(e) => setAutoPlayAI(e.target.checked)}
            className="accent-amber-500 w-3.5 h-3.5 rounded"
          />
          <span className="font-semibold">Auto AI Turns</span>
        </label>

        {activePlayer.isAI && gameState.phase !== 'GAME_OVER' && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onStepAI}
              className="flex-1 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-sans font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition shadow"
            >
              <Play className="w-3 h-3" /> Step AI
            </button>
            <button
              type="button"
              onClick={onSkipAI}
              className="flex-1 py-1.5 rounded-xl copper-bevel-btn font-display font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer shadow"
              title="Fast-forward through AI turns"
            >
              <FastForward className="w-3 h-3" /> Skip AI
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenSetup}
          className="w-full py-2 rounded-xl copper-bevel-btn font-display font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
        >
          <Settings className="w-3.5 h-3.5" /> New Game (1–6P)
        </button>
      </div>

      {/* 5. TURN INFORMATION & SHIFT GUIDE ("WHAT TO DO NOW") */}
      <div className="stout-panel rounded-2xl p-2.5 border-amber-500/70 shadow-xl space-y-2 bg-gradient-to-br from-[#1C130B] via-[#150E09] to-[#0D0805] flex-1 flex flex-col justify-between">
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
          <div className="space-y-1.5 text-[11px] leading-snug">
            {gameState.phase === 'MORNING_SHIFT' && (
              <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/60 space-y-1.5">
                <div className="font-display font-bold text-amber-200 text-xs flex items-center gap-1">
                  <Play className="w-3 h-3 text-amber-400" />
                  <span>Phase 1: Morning Shift</span>
                </div>
                <p className="text-stone-300 text-[10px]">
                  Advance your brewery pipeline! Wort in your Brewhouse slides to Cellar, and fermented beer moves to Packaging to score VP!
                </p>
                {isHumanWarehouseOverCap && (
                  <div className="p-2 rounded-lg bg-red-950/90 border border-red-500/80 text-red-200 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Action Required: Return {humanExcessTokens} excess token{humanExcessTokens > 1 ? 's' : ''} to meet Warehouse Capacity ({humanWarehouseCap}) before running shift slide!</span>
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
                  title={
                    isHumanWarehouseOverCap
                      ? `Action Required: Return ${humanExcessTokens} excess token${humanExcessTokens > 1 ? 's' : ''} in Warehouse before continuing`
                      : 'Run Morning Shift conveyor advance'
                  }
                >
                  <Play className="w-3.5 h-3.5 fill-stone-950" />
                  Run Shift Slide
                </button>
              </div>
            )}

            {(gameState.phase === 'PHASE_2_CATWALK_PLACEMENT' || gameState.phase === 'PHASE_1_WORKER_DRAFT') && (
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/60 space-y-2">
                <div className="font-display font-bold text-amber-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>Step 1: Deploy Brewer</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono text-[9px]">
                    1 Worker / Shift
                  </span>
                </div>

                {activePlayer.lastOccupiedStation ? (
                  <div className="px-2 py-1 rounded-lg bg-stone-950/90 border border-amber-500/50 text-amber-200 text-[10px] space-y-0.5">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="text-amber-400">Previous Station: #{activePlayer.lastOccupiedStation}</span>
                      <span className="text-red-400 uppercase text-[8.5px]">Locked Out</span>
                    </div>
                    <div className="text-[9.5px] text-stone-300">
                      Forced Movement: Station #{activePlayer.lastOccupiedStation} cannot be re-selected this shift.
                    </div>
                  </div>
                ) : (
                  <div className="px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono text-[9.5px]">
                    Shift 1: Board starts empty • Select ANY Catwalk 1–7
                  </div>
                )}

                <p className="text-stone-200 text-[10.5px]">
                  Click any brass <strong className="text-amber-300">Catwalk Porthole (1–7)</strong> or the <strong className="text-amber-300">Center Pantry (#7)</strong> to position your worker.
                </p>
                <div className="text-[9.5px] text-stone-400 border-t border-amber-900/40 pt-1 space-y-0.5">
                  <div>• Lower numbers act earlier in the shift; Station #7 (Pantry) acts last.</div>
                  <div>• Mandatory Movement: You must move to a different station after every turn (cannot stay on #7 consecutively).</div>
                  <div>• Contesting an occupied spot knocks that brewer out to immediately place onto a different catwalk!</div>
                </div>
              </div>
            )}

            {gameState.phase === 'PHASE_3_STATION_COMMITMENT' && (
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-500/60 space-y-2">
                <div className="font-display font-bold text-amber-200 text-xs flex items-center justify-between">
                  <span>Step 2: Choose Station Action</span>
                  {activeCatwalkSlot && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[9.5px] border border-amber-400/40">
                      Station #{activeCatwalkSlot}
                    </span>
                  )}
                </div>

                {rotary?.turnOrder && rotary.turnOrder.length > 0 && (
                  <div className="px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[9px] truncate">
                    <span className="text-emerald-400 font-bold">Initiative: </span>
                    {rotary.turnOrder.map((id) => gameState.players.find((p) => p.id === id)?.name).join(' ➔ ')}
                  </div>
                )}

                {activeCatwalkSlot === 7 ? (
                  <div className="p-2 rounded-lg bg-amber-900/60 border border-amber-400 text-amber-100 text-[10.5px] space-y-1">
                    <div className="font-bold text-amber-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-black text-[9px] flex items-center justify-center">7</span>
                      <span>Brewhouse Pantry Active</span>
                    </div>
                    <div className="text-amber-100/90 leading-tight">
                      Click any of the <strong>6 spaces around the central kettle</strong> (Grain, Hops, Yeast, Fruit, Spices, Chocolate) directly on the dial to take that token!
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-stone-200 text-[10.5px]">
                      Choose 1 action at your assigned station:
                    </p>
                    <div className="space-y-1 text-[10px]">
                      <div className="p-1.5 rounded-lg bg-black/40 border border-amber-500/30 flex items-start gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 mt-0.5 text-stone-950 font-black text-[8px] flex items-center justify-center">IN</span>
                        <div>
                          <strong className="text-amber-300">Inner Hopper</strong>: Click to harvest raw wooden tokens into your reserve.
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-black/40 border border-emerald-500/30 flex items-start gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0 mt-0.5 text-stone-950 font-black text-[8px] flex items-center justify-center">OUT</span>
                        <div>
                          <strong className="text-emerald-300">Outer Shelf Card</strong>: Station #1 offers <span className="text-amber-300 font-semibold">Equipment Hardware</span>; Station #2 offers <span className="text-amber-300 font-semibold">Brewery Staff</span>; Stations 3–6 offer <span className="text-emerald-300 font-semibold">Beer Recipes</span>.
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {gameState.phase === 'WORK_DAY' && (
              <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/60 space-y-1.5">
                <div className="font-display font-bold text-amber-200 text-xs">
                  Brewhouse Work Day
                </div>
                <p className="text-stone-200 text-[10.5px]">
                  Click an <strong className="text-amber-300">Inner Hopper</strong> to harvest tokens, or click an <strong className="text-emerald-300">Outer Shelf Card</strong> to brew or invest.
                </p>
              </div>
            )}

            {gameState.phase === 'DISCARD' && (
              <div className="p-2 rounded-xl bg-red-950/90 border border-red-500/70 space-y-1">
                <div className="font-display font-bold text-red-200 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>Card Hand Limit Check</span>
                </div>
                <p className="text-red-300 text-[10.5px]">
                  Your cards in hand exceed limit. Select card(s) to discard. (Warehouse ingredient tokens are exempt from forced discards).
                </p>
              </div>
            )}
          </div>
        ) : gameState.phase === 'GAME_OVER' ? (
          <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-[10.5px] text-stone-300">
            Shift complete! Inspect final VP standings on the scoreboard modal.
          </div>
        ) : (
          /* AI Turn View */
          <div className="space-y-1.5 text-[10.5px]">
            <p className="text-stone-300">
              <strong className="text-sky-300">{activePlayer.name}</strong> is evaluating brewhouse options and deploying their brewer meeple.
            </p>
            {!autoPlayAI && (
              <p className="text-[10px] text-amber-300/80">
                Use <strong>Step AI</strong> or <strong>Skip AI</strong> in Game Controls above to advance turns.
              </p>
            )}
          </div>
        )}

        {/* Quick Icon Reference */}
        <div className="border-t border-hoyne-copper/20 pt-1.5 grid grid-cols-2 gap-1 text-[9px] text-stone-400 font-sans">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Hopper: Tokens</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Shelf: Brew/Upgrade</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Center: Collect 1 Any</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-300" />
            <span>Mixer: Bonus VP</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
