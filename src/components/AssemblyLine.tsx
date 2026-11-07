import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GameState,
  PlayerState,
  ZoneId,
  IngredientTaxonomy,
  ZONE_THEMES,
} from '../engine/types';
import {
  getPlayerHandLimit,
  getPlayerKettleCapacity,
  getPlayerCarboyCapacity,
  getPlayerFreeSkips,
  getPlayerSourceDrawCount,
  getWarehouseCapacity,
  allocatePlayerStorage,
} from '../engine/gameEngine';
import {
  RecipeCardView,
  UpgradeCardView,
  IngredientCardView,
  ZoneCardView,
} from './CardComponents';
import { WOODEN_TOKEN_COLORS } from './WoodenTokens';
import { DepartmentCardView } from './DepartmentCardView';
import { DepartmentActionPayload } from '../engine/gameEngine';
import {
  Warehouse,
  Flame,
  FlaskConical,
  Snowflake,
  Truck,
  Wrench,
  UserCheck,
  Trophy,
  AlertTriangle,
  Bot,
  User,
  Trash2,
  Wheat,
  Sparkles,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface AssemblyLineProps {
  gameState: GameState;
  inspectedPlayerIndex: number;
  onSelectPlayerIndex: (index: number) => void;
  onPerformDiscardExcess: (discardIds: string[]) => void;
  onDiscardToken?: (taxonomy: IngredientTaxonomy) => void;
  onInspectZone?: (zoneId: ZoneId) => void;
  onPlaceDepartment?: (playerId: string) => void;
  onExecuteDepartmentAction?: (payload?: DepartmentActionPayload) => void;
}

/**
 * Thematic Painted Factory Floor Wayfinding Arrow
 * Directs flow between steps: 1. DRAFT -> 2. BREW -> 3. FERMENT -> 4. DELIVER
 */
export const FactoryFloorWayfindingArrow: React.FC<{
  color?: string;
  className?: string;
}> = ({ color = '#F59E0B', className = '' }) => (
  <div className={`flex items-center justify-center shrink-0 ${className}`}>
    <svg
      viewBox="0 0 28 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-3.5 sm:w-6 sm:h-4 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
      aria-hidden="true"
    >
      <path
        d="M3 2.5L9.5 9L3 15.5M10.5 2.5L17 9L10.5 15.5M18 2.5L24.5 9L18 15.5"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

/**
 * Heavy Directional Exit Arrow Exiting Zone 4
 * Points entirely off the mat to the right, indicating the "Deliver to Trophy Stack" action.
 */
export const HeavyTrophyExitArrow: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div
    className={`flex items-center shrink-0 pl-1 ${className}`}
    title="Final Action: Deliver & Ship packaged recipes to Trophy Stack to score VP!"
  >
    <svg
      viewBox="0 0 32 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-7 h-4 shrink-0 drop-shadow-[0_0_10px_rgba(245,158,11,0.9)] animate-pulse"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heavy-trophy-exit-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>
      </defs>
      <path
        d="M2 9H22M15 2.5L22 9L15 15.5M23 2.5L30 9L23 15.5"
        stroke="url(#heavy-trophy-exit-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const ZONE_ICONS: Record<ZoneId, React.ReactNode> = {
  1: <Warehouse className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0" />,
  2: <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-300 shrink-0" />,
  3: <FlaskConical className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300 shrink-0" />,
  4: <Snowflake className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300 shrink-0" />,
  5: <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 shrink-0" />,
};

export const ZONE_DEPARTMENT_SPECS: Record<
  ZoneId,
  {
    colName: string;
    department: string;
    role: string;
    equipmentGuide: string;
    staffGuide: string;
  }
> = {
  1: {
    colName: 'Column 1',
    department: 'Zone 1 — Warehouse',
    role: 'Ingredient Storage & Staging',
    equipmentGuide: 'Storage Silos',
    staffGuide: 'Warehouse Staff',
  },
  2: {
    colName: 'Column 2',
    department: 'Zone 2 — Brewhouse',
    role: 'Hot Side & Active Brewing',
    equipmentGuide: 'Mash Tuns',
    staffGuide: 'Head Brewers',
  },
  3: {
    colName: 'Column 3',
    department: 'Zone 3 — Cellar',
    role: 'Primary Liquid Stage',
    equipmentGuide: 'Unitank Fermenters',
    staffGuide: 'Yeast Propagators',
  },
  4: {
    colName: 'Column 4',
    department: 'Zone 4 — Cold Room',
    role: 'Resting, Clearing & Chilling',
    equipmentGuide: 'Conditioning Tanks',
    staffGuide: 'Cellar Masters',
  },
  5: {
    colName: 'Column 5',
    department: 'Zone 5 — Packaging',
    role: 'Final Assembly & Scoring Target',
    equipmentGuide: 'Canning Lines',
    staffGuide: 'Delivery Drivers',
  },
};

const ZONE_PLAYMAT_TITLES: Record<ZoneId, string> = {
  1: 'Warehouse',
  2: 'Brewhouse',
  3: 'Cellar',
  4: 'Cold Room',
  5: 'Packaging',
};

export const PlayerRosterSidebar: React.FC<{
  gameState: GameState;
  inspectedPlayerIndex: number;
  onSelectPlayerIndex: (index: number) => void;
}> = ({ gameState, inspectedPlayerIndex, onSelectPlayerIndex }) => {
  return (
    <aside
      aria-label="Brewery Assembly Lines Player Roster"
      className="stout-panel rounded-2xl p-3 flex flex-col gap-2.5 border-hoyne-copper/70 shadow-2xl"
    >
      <div className="border-b border-hoyne-copper/30 pb-2 px-0.5 space-y-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className="text-[11px] font-sans font-black uppercase tracking-wider text-hoyne-copper">
            Brewers ({gameState.players.length}P)
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-400/40 text-[10px] font-sans font-bold text-amber-300">
            Goal: {gameState.targetBatchesToTriggerEnd} BBL
          </span>
        </div>
        <p className="text-[10px] text-hoyne-cream/65 leading-tight">
          Click any Brewer to inspect their 5-Zone Assembly Line &amp; Hand
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {gameState.players.map((p, idx) => {
          const isCurrentTurn = idx === gameState.currentPlayerIndex;
          const isInspected = idx === inspectedPlayerIndex;
          const pHandLimit = getPlayerHandLimit(p);
          const z2Count = p.zones[2]?.recipes?.length || 0;
          const z3Count = p.zones[3]?.recipes?.length || 0;
          const z4Count = p.zones[4]?.recipes?.length || 0;
          const z5Count = p.zones[5]?.recipes?.length || 0;
          const totalUpgrades = ([1, 2, 3, 4, 5] as ZoneId[]).reduce(
            (acc, zId) =>
              acc + (p.zones[zId]?.equipment?.length || 0) + (p.zones[zId]?.staff?.length || 0),
            0
          );

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPlayerIndex(idx)}
              className={`w-full text-left rounded-xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                isInspected
                  ? 'bg-amber-950/85 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                  : isCurrentTurn
                  ? 'bg-stone-900/95 border-hoyne-copper'
                  : 'bg-stone-950/75 border-stone-800 hover:border-hoyne-copper/50'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="font-serif font-bold text-xs text-hoyne-cream truncate">
                    {p.name}
                  </span>
                  {p.isAI ? (
                    <Bot className="w-3 h-3 text-sky-400 shrink-0" />
                  ) : (
                    <User className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                </div>
                <span className="brass-badge px-1.5 py-0.5 rounded text-[10px] font-sans font-black shrink-0">
                  {p.score} VP
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-sans text-hoyne-cream/80">
                <span>
                  Hand: <strong>{p.hand.length}/{pHandLimit}</strong>
                </span>
                <span>
                  Upgrades: <strong>{totalUpgrades}</strong>
                </span>
                {isCurrentTurn && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[9px]">
                    Active
                  </span>
                )}
              </div>

              {/* Mini Pipeline Occupancy Indicator */}
              <div className="grid grid-cols-4 gap-1 pt-1 border-t border-white/10 text-[8.5px] font-sans font-bold text-center">
                <div
                  className={`rounded py-0.5 ${
                    z2Count > 0
                      ? 'bg-orange-950 text-orange-300 border border-orange-500/40'
                      : 'bg-stone-900 text-stone-500'
                  }`}
                >
                  Z2 Brew: {z2Count}
                </div>
                <div
                  className={`rounded py-0.5 ${
                    z3Count > 0
                      ? 'bg-sky-950 text-sky-300 border border-sky-500/40'
                      : 'bg-stone-900 text-stone-500'
                  }`}
                >
                  Z3 Cellar: {z3Count}
                </div>
                <div
                  className={`rounded py-0.5 ${
                    z4Count > 0
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      : 'bg-stone-900 text-stone-500'
                  }`}
                >
                  Z4 Cond: {z4Count}
                </div>
                <div
                  className={`rounded py-0.5 ${
                    z5Count > 0
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-stone-900 text-stone-500'
                  }`}
                >
                  Z5 Dock: {z5Count}/{gameState.targetBatchesToTriggerEnd}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export const AssemblyLine: React.FC<AssemblyLineProps> = ({
  gameState,
  inspectedPlayerIndex,
  onPerformDiscardExcess,
  onDiscardToken,
  onInspectZone,
  onPlaceDepartment,
  onExecuteDepartmentAction,
}) => {
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const inspectedPlayer =
    gameState.players[inspectedPlayerIndex] || activePlayer;

  const isActivePlayerInspected =
    inspectedPlayer.id === activePlayer.id;

  const handLimit = getPlayerHandLimit(inspectedPlayer);
  const kettleCap = getPlayerKettleCapacity(inspectedPlayer);
  const carboyCap = getPlayerCarboyCapacity(inspectedPlayer);
  const freeSkips = getPlayerFreeSkips(inspectedPlayer);
  const sourceDraws = getPlayerSourceDrawCount(inspectedPlayer);
  const warehouseCap = getWarehouseCapacity(inspectedPlayer);
  const storageAllocation = allocatePlayerStorage(inspectedPlayer);
  const warehouseTokens = storageAllocation.warehouseTokens;
  const cardTokensMap = storageAllocation.cardTokens;
  const currentWarehouseCount = storageAllocation.totalStoredTokens;
  const excessTokens = storageAllocation.excessTokens.length;
  const isTokenExcess = excessTokens > 0;
  const TAX_ORDER: IngredientTaxonomy[] = ['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'];
  const totalStoredTokens = currentWarehouseCount;

  // Discard phase selection state for active human player
  const activeHandLimit = getPlayerHandLimit(activePlayer);
  const excessCount = Math.max(0, activePlayer.hand.length - activeHandLimit);
  const isDiscardPhase =
    gameState.phase === 'DISCARD' && !activePlayer.isAI && excessCount > 0;

  const [selectedDiscardIds, setSelectedDiscardIds] = useState<string[]>([]);

  useEffect(() => {
    if (isDiscardPhase) {
      // Pre-select the last `excessCount` cards for convenience
      setSelectedDiscardIds(
        activePlayer.hand.slice(-excessCount).map((c) => c.id)
      );
    } else {
      setSelectedDiscardIds([]);
    }
  }, [isDiscardPhase, excessCount, activePlayer.hand, gameState.turnNumber]);

  const toggleDiscardCard = (cardId: string) => {
    if (!isDiscardPhase) return;
    if (selectedDiscardIds.includes(cardId)) {
      setSelectedDiscardIds(selectedDiscardIds.filter((id) => id !== cardId));
    } else {
      if (selectedDiscardIds.length >= excessCount) {
        setSelectedDiscardIds([...selectedDiscardIds.slice(1), cardId]);
      } else {
        setSelectedDiscardIds([...selectedDiscardIds, cardId]);
      }
    }
  };

  // Batch pagination state for inspecting multi-batch zones
  const [inspectedBatchIndices, setInspectedBatchIndices] = useState<Record<ZoneId, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });

  // Delivered recipes in Trophy Rack (Completed after packaging)
  const deliveredRecipes = inspectedPlayer.completedBatches || [];

  const cycleBatch = (zoneId: ZoneId, dir: -1 | 1, total: number) => {
    if (total <= 1) return;
    setInspectedBatchIndices((prev) => {
      const cur = prev[zoneId] ?? 0;
      const next = (cur + dir + total) % total;
      return { ...prev, [zoneId]: next };
    });
  };

  return (
    <section id="player-assembly-line" className="space-y-4" aria-label="Brewery Assembly Line">
      {/* ===================================================================
          EXCESS HAND DISCARD BANNER (When Phase === 'DISCARD')
      =================================================================== */}
      {isDiscardPhase && (
        <div className="bg-red-950/90 border-2 border-amber-400 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Zone 1 Grain Room Storage Limit Exceeded! ({activePlayer.hand.length} / {activeHandLimit} Cards)
                </h3>
                <p className="text-xs text-amber-200/90">
                  Select <strong>{excessCount}</strong> Ingredient card(s) to discard down to your Zone 1 Hand Limit of {activeHandLimit}.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={selectedDiscardIds.length !== excessCount}
              onClick={() => onPerformDiscardExcess(selectedDiscardIds)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-sans font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Discard {selectedDiscardIds.length}/{excessCount} Selected & End Turn
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          MANDATORY WAREHOUSE STORAGE ENFORCEMENT BANNER (Strict Action Required)
      =================================================================== */}
      {isTokenExcess && (
        <div className="bg-gradient-to-r from-red-950/95 via-stone-900/95 to-red-950/95 border-2 border-red-500/90 rounded-2xl p-3.5 shadow-2xl ring-2 ring-red-500/40 flex flex-wrap items-center justify-between gap-3 animate-pulse-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/25 border border-red-400/70 flex items-center justify-center shrink-0 shadow-inner">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-xs text-red-200 tracking-wide uppercase">
                  Action Required: Warehouse Over Capacity
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 border border-red-400/70 font-mono text-[10px] font-black tracking-wider">
                  {currentWarehouseCount} / {warehouseCap} Tokens (+{excessTokens} over)
                </span>
              </div>
              <p className="text-[11px] text-red-100/90 mt-0.5">
                Action Required: Return <strong className="text-amber-300 font-bold">{excessTokens}</strong> token{excessTokens > 1 ? 's' : ''} to Central Hoppers to meet Warehouse Capacity ({warehouseCap}) before continuing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TAX_ORDER.filter((tax) => (inspectedPlayer.tokens[tax] || 0) > 0).map((tax) => {
              const count = inspectedPlayer.tokens[tax] || 0;
              const meta = WOODEN_TOKEN_COLORS[tax];
              return (
                <button
                  key={`discard-token-btn-${tax}`}
                  type="button"
                  onClick={() => onDiscardToken && onDiscardToken(tax)}
                  className="px-3 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-900 border-2 border-red-400/80 hover:border-amber-300 text-stone-100 hover:text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ring-1 ring-red-500/40 group active:scale-95"
                  title={`Return 1 ${meta.label} back to Central Hopper (${excessTokens} more return${excessTokens > 1 ? 's' : ''} required)`}
                >
                  <img src={`/tokens/${tax}-wood-piece.png`} alt={tax} className="w-4 h-4 object-contain group-hover:scale-110 transition-transform" />
                  <span>Return {meta.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/60 border border-red-400/50 text-amber-300 font-mono font-bold">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          4-ZONE MODULAR ASSEMBLY LINE (LEFT-TO-RIGHT)
      =================================================================== */}
      {/* ===================================================================
          11.5" x 5.75" SINGLE-PIECE PLAYER BOARD (4 COLUMNS @ 2.875" EACH)
          Continuous industrial craft brewery player board with dedicated
          8-slot tuck system (4 Top Equipment, 4 Bottom Staff)
      =================================================================== */}
      <div
        data-board-format="11.5x5.75-single-piece"
        className="rounded-3xl p-4 lg:p-5 space-y-4 border-4 shadow-2xl relative select-none w-full"
        style={{
          backgroundColor: '#16100B',
          backgroundImage: `
            radial-gradient(ellipse at 50% 0%, rgba(200, 125, 50, 0.12) 0%, transparent 65%),
            repeating-linear-gradient(0deg, rgba(35, 20, 12, 0.6) 0px, rgba(35, 20, 12, 0.6) 1px, transparent 1px, transparent 4px),
            linear-gradient(180deg, #221710 0%, #17100B 50%, #0E0A07 100%)
          `,
          borderColor: '#4A2C14',
          boxShadow:
            'inset 0 1px 0 rgba(254, 240, 138, 0.2), inset 0 0 0 1.5px rgba(200, 125, 50, 0.35), 0 18px 40px rgba(0,0,0,0.9)',
        }}
      >
        {/* Single-Piece Board Hardware Badge & Player Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-900/50 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full border-2 border-amber-200/60 shadow-sm"
              style={{ backgroundColor: inspectedPlayer.color }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif font-black text-xl text-amber-100 tracking-wide">
                  {inspectedPlayer.name}&apos;s Brewery Board
                </h2>
                {isActivePlayerInspected && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-sans font-extrabold uppercase tracking-wider">
                    Current Active Turn
                  </span>
                )}
                {inspectedPlayer.aiPersona && (
                  <span className="px-2 py-0.5 rounded bg-stone-900 text-amber-200/90 border border-amber-800/50 text-xs font-mono">
                    {inspectedPlayer.aiPersona}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Clean Total VP Badge & Completed Batches Target - Positioned Top & Right */}
          <div className="flex items-center gap-2.5 ml-auto">
            <span className="px-3 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-sans font-bold text-xs flex items-center gap-1.5 shadow-md">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {deliveredRecipes.length}/{gameState.targetBatchesToTriggerEnd} BBL Completed
              </span>
            </span>
            <span className="brass-badge px-3.5 py-1 rounded-xl font-black text-sm flex items-center gap-1.5 shadow-md">
              <Trophy className="w-4 h-4 text-stone-950 fill-amber-300" /> {inspectedPlayer.score} VP
            </span>
          </div>
        </div>

        {/* 11.5" x 5.75" BOARD & DOCKED PERSONAL BREWERY DEPARTMENT (#1 - #10) */}
        <div className="w-full flex flex-col xl:flex-row items-stretch gap-4">
          {/* DOCKED PERSONAL BREWERY DEPARTMENT (2.25" x 3.5" Card flush to left of Zone 1 Warehouse) */}
          {inspectedPlayer.departmentCard && (
            <div className="shrink-0 flex flex-col justify-center items-center relative">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] font-sans font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Private Department
                </span>
                <span className="text-[9px] font-mono text-stone-400">
                  (Left of Zone 1)
                </span>
              </div>
              <div className="relative">
                <DepartmentCardView
                  department={inspectedPlayer.departmentCard}
                  player={inspectedPlayer}
                  activePlayer={activePlayer}
                  isCurrentTurn={isActivePlayerInspected}
                  phase={gameState.phase}
                  canPlaceMeeple={
                    isActivePlayerInspected &&
                    gameState.phase === 'PHASE_2_CATWALK_PLACEMENT' &&
                    !inspectedPlayer.lastOccupiedDepartment &&
                    !inspectedPlayer.departmentOccupant
                  }
                  onPlaceMeeple={() => onPlaceDepartment?.(inspectedPlayer.id)}
                  canExecuteAction={
                    isActivePlayerInspected &&
                    gameState.phase === 'PHASE_3_STATION_COMMITMENT' &&
                    inspectedPlayer.departmentOccupant?.playerId === inspectedPlayer.id
                  }
                  onExecuteAction={onExecuteDepartmentAction}
                />
                {/* Visual Brass Docking Bracket joining Department Card to Zone 1 */}
                <div
                  className="hidden xl:flex absolute -right-3 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-0.5"
                  title="Industrial Brass Clamp docking Department Card flush to Zone 1 Warehouse"
                >
                  <div className="w-3.5 h-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-sm border border-amber-300/80 shadow-lg flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-900 border border-amber-300" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN BREWERY SECTION: TOP TUCK RAIL + PANORAMIC MAT + BOTTOM TUCK RAIL + INTEGRATED PIPELINE */}
          <div className="flex-1 min-w-0 flex flex-col relative">

              {/* =============================================================
                  1. TOP EDGE: EQUIPMENT UPGRADE TUCK RAIL
                  Cards slide UNDER the top margin of the player board canvas.
                  Lower z-index (z-0) and negative bottom margin (-mb-2) so the bottom
                  edge of the tucked card slips under the board's top rim (z-10).
              ============================================================= */}
              <div className="grid grid-cols-5 gap-2 px-2.5 relative z-0 -mb-2">
                {([1, 2, 3, 4, 5] as ZoneId[]).map((zoneId) => {
                  const equipmentList = inspectedPlayer.zones[zoneId]?.equipment || [];
                  const spec = ZONE_DEPARTMENT_SPECS[zoneId];
                  if (equipmentList.length > 0) {
                    return (
                      <div key={`top-eq-${zoneId}`} className="w-full flex flex-col gap-1 items-end">
                        {equipmentList.map((eq, eqIdx) => (
                          <div
                            key={eq.id || `eq-${zoneId}-${eqIdx}`}
                            className="w-full transform hover:-translate-y-2 transition-transform duration-200 cursor-pointer shadow-lg"
                            title={`${eq.name}: ${eq.effectText}`}
                          >
                            <UpgradeCardView upgrade={eq} tuckEdge="top" activePlayer={inspectedPlayer} storedTokens={cardTokensMap[eq.id || eq.name]} onDiscardToken={onDiscardToken} />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  const zoneTheme = ZONE_THEMES[zoneId];
                  return (
                    <div
                      key={`top-empty-${zoneId}`}
                      className="w-full h-6 rounded-t-lg bg-black/75 border border-b-0 border-dashed flex items-center justify-center opacity-70 hover:opacity-100 transition-all cursor-pointer group shadow"
                      style={{
                        borderColor: `${zoneTheme.badgeBorder}70`,
                      }}
                      title={`Top Equipment Slot: ${spec.equipmentGuide}. Equipment cards slide under the top edge.`}
                    >
                      <div
                        className="flex items-center gap-1 text-[7.5px] font-mono font-bold uppercase tracking-wider truncate px-1"
                        style={{ color: zoneTheme.textColor }}
                      >
                        <Wrench className="w-2.5 h-2.5" style={{ color: zoneTheme.accentHex }} />
                        <span>+ {spec.equipmentGuide}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* =============================================================
                  2. THE SEAMLESS 5-ZONE PANORAMIC BREWERY MAT (z-10)
                  Natural panoramic aspect ratio (1024 / 430).
                  The artwork takes up most of the space and is never cropped by future card slots!
              ============================================================= */}
              <div
                data-player-mat="11.5x5.75-borderless-canvas"
                className="w-full aspect-[1024/430] min-h-[220px] sm:min-h-[250px] lg:min-h-[280px] flex flex-col justify-between rounded-2xl relative shadow-2xl border-2 border-amber-600/70 overflow-hidden bg-[#140E0A] z-10"
              >
                {/* THE SEAMLESS 5-ZONE PANORAMIC BREWERY MAT BACKGROUND */}
                <img
                  src="/board/player-mat-panorama.jpg"
                  alt="Connected Brewery Floor Mat"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.triedRelative) {
                      target.dataset.triedRelative = 'true';
                      target.src = './board/player-mat-panorama.jpg';
                    }
                  }}
                />

                {/* Atmospheric Vignette & Contrast Overlays: Subtle at edges so brewery artwork is crisp */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none z-0" />
                <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/20 rounded-2xl pointer-events-none z-0" />

                {/* 5-COLUMN CONNECTED HORIZONTAL PIPELINE ZONES */}
                <div className="grid grid-cols-5 divide-x divide-amber-900/40 p-2 items-stretch flex-1 relative z-10">
                  {([1, 2, 3, 4, 5] as ZoneId[]).map((zoneId) => {
                    const spec = ZONE_DEPARTMENT_SPECS[zoneId];
                    const zoneState = inspectedPlayer.zones[zoneId] || { recipes: [], equipment: [], staff: [] };
                    const recipesInZone = zoneState.recipes;
                    const currentBatchIdx = Math.min(
                      inspectedBatchIndices[zoneId] ?? 0,
                      Math.max(0, recipesInZone.length - 1)
                    );
                    const currentRecipe = recipesInZone[currentBatchIdx];
                    const hasRecipe = recipesInZone.length > 0 && currentRecipe;

                    return (
                      <div
                        key={zoneId}
                        data-zone-id={zoneId}
                        className="flex flex-col justify-between w-full relative px-1.5 py-1 min-w-0"
                      >
                        {/* Top Zone Canonical Header Badge directly on board */}
                        <div className="w-full flex justify-center mb-1.5 shrink-0 z-20">
                          <button
                            type="button"
                            onClick={() => onInspectZone && onInspectZone(zoneId)}
                            className="px-2.5 py-1 rounded-lg backdrop-blur-sm border font-display font-black tracking-wider text-[9px] sm:text-[10px] uppercase shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
                            style={{
                              backgroundColor: ZONE_THEMES[zoneId].badgeBg,
                              borderColor: ZONE_THEMES[zoneId].badgeBorder,
                              color: ZONE_THEMES[zoneId].textColor,
                              boxShadow: `0 2px 8px ${ZONE_THEMES[zoneId].glowColor}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                            }}
                            title={`Inspect ${ZONE_THEMES[zoneId].name} (Click to view details & upgrades)`}
                          >
                            {ZONE_ICONS[zoneId]}
                            <span>{ZONE_THEMES[zoneId].name}</span>
                          </button>
                        </div>
                        {/* STATION MAIN CANVAS CONTENT */}
                        {zoneId === 1 ? (
                          /* ZONE 1: Raw Materials Wooden Token Detent Rack + Staged Recipe */
                          <div className="flex-1 flex flex-col justify-between pb-0.5 pt-0.5 w-full max-w-[190px] mx-auto z-10 gap-1">
                            {hasRecipe ? (
                              <div className="w-full flex flex-col justify-center items-center relative flex-1 min-h-0">
                                {recipesInZone.length > 1 && (
                                  <div className="absolute top-0 inset-x-1 z-30 flex items-center justify-between px-1.5 py-0.5 bg-black/85 backdrop-blur-sm rounded border border-amber-500/40 text-[8px] font-mono text-amber-200 shadow">
                                    <button
                                      type="button"
                                      onClick={() => cycleBatch(zoneId, -1, recipesInZone.length)}
                                      className="hover:text-amber-400 p-0.5 cursor-pointer"
                                    >
                                      <ChevronLeft className="w-2.5 h-2.5" />
                                    </button>
                                    <span>
                                      Batch {currentBatchIdx + 1}/{recipesInZone.length}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => cycleBatch(zoneId, 1, recipesInZone.length)}
                                      className="hover:text-amber-400 p-0.5 cursor-pointer"
                                    >
                                      <ChevronRight className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                )}
                                <div className="w-full max-w-[100px] aspect-[9/14] max-h-[130px]">
                                  <RecipeCardView
                                    recipe={currentRecipe}
                                    compact={true}
                                    zoneBadge="STAGED"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 w-full pointer-events-none" />
                            )}
                            <div className="p-1 rounded-xl bg-black/70 backdrop-blur-[2px] border border-amber-500/40 shadow-inner shrink-0">
                              <div className="grid grid-cols-3 grid-rows-2 gap-1 items-center justify-items-center">
                                {Array.from({ length: 6 }).map((_, idx) => {
                                  const tokenType = idx < warehouseTokens.length ? warehouseTokens[idx] : null;

                                  if (tokenType) {
                                    const tokenMeta = WOODEN_TOKEN_COLORS[tokenType];
                                    return (
                                      <div
                                        key={`z1-token-${idx}`}
                                        onClick={(e) => {
                                          if (onDiscardToken) {
                                            e.stopPropagation();
                                            onDiscardToken(tokenType);
                                          }
                                        }}
                                        className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-amber-950/70 via-stone-900 to-black/90 border shadow flex items-center justify-center p-0.5 transition-transform hover:scale-110 cursor-pointer ${
                                          isTokenExcess
                                            ? 'border-red-400/90 ring-2 ring-red-400/60 animate-pulse'
                                            : 'border-amber-500/60 hover:border-amber-300'
                                        }`}
                                        title={
                                          isTokenExcess
                                            ? `${tokenMeta.label} Wooden Piece. Action Required: Click to return to Central Hopper (${excessTokens} excess)`
                                            : `${tokenMeta.label} Wooden Piece. Click to return to Central Hopper`
                                        }
                                      >
                                        <img
                                          src={`/tokens/${tokenType}-wood-piece.png`}
                                          alt={tokenMeta.label}
                                          className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] pointer-events-none"
                                        />
                                      </div>
                                    );
                                  }

                                  return (
                                    <div
                                      key={`z1-empty-${idx}`}
                                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-dashed border-amber-500/30 bg-black/40 flex items-center justify-center shadow-inner"
                                      title={`Warehouse Storage Space (${idx + 1}/6)`}
                                    >
                                      <div className="w-2 h-2 rounded-full border border-dashed border-amber-400/35 flex items-center justify-center">
                                        <div className="w-0.5 h-0.5 rounded-full bg-amber-400/25" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Unstored / Excess Tokens (when tokens exceed available physical slots - twice the size for clarity) */}
                              {storageAllocation.excessTokens.length > 0 && (
                                <div className="mt-2 p-1.5 rounded-xl bg-gradient-to-r from-red-950/95 via-stone-900/95 to-red-950/95 border-2 border-red-500/90 flex items-center justify-between gap-2 shadow-lg ring-1 ring-red-500/40">
                                  <div className="flex flex-col">
                                    <span className="text-[8.5px] font-serif font-black text-red-200 tracking-wider uppercase leading-none">
                                      UNSTORED (+{storageAllocation.excessTokens.length})
                                    </span>
                                    <span className="text-[7px] text-red-300/80 leading-none mt-0.5">
                                      Click to discard
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    {storageAllocation.excessTokens.map((tax, idx) => (
                                      <div
                                        key={`excess-token-${idx}`}
                                        onClick={(e) => {
                                          if (onDiscardToken) {
                                            e.stopPropagation();
                                            onDiscardToken(tax);
                                          }
                                        }}
                                        className="w-8 h-8 rounded-lg bg-black/80 border-2 border-red-400 flex items-center justify-center p-0.5 hover:scale-115 cursor-pointer transition-all shadow-md active:scale-95 group"
                                        title={`Unstored ${tax}: Exceeds available physical storage slots. Click to return to Hopper`}
                                      >
                                        <img src={`/tokens/${tax}-wood-piece.png`} alt={tax} className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (zoneId === 2 || zoneId === 3 || zoneId === 4 || zoneId === 5) && hasRecipe ? (
                          /* ZONES 2, 3, 4 & 5: Active Boiling, Fermenting, Conditioning or Packaging Recipe Card */
                          <div className="flex-1 w-full flex flex-col justify-center items-center py-1 relative z-10">
                            {recipesInZone.length > 1 && (
                              <div className="absolute top-0 inset-x-1 z-30 flex items-center justify-between px-1.5 py-0.5 bg-black/85 backdrop-blur-sm rounded border border-amber-500/40 text-[8px] font-mono text-amber-200 shadow">
                                <button
                                  type="button"
                                  onClick={() => cycleBatch(zoneId, -1, recipesInZone.length)}
                                  className="hover:text-amber-400 p-0.5 cursor-pointer"
                                >
                                  <ChevronLeft className="w-2.5 h-2.5" />
                                </button>
                                <span>
                                  Batch {currentBatchIdx + 1}/{recipesInZone.length}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => cycleBatch(zoneId, 1, recipesInZone.length)}
                                  className="hover:text-amber-400 p-0.5 cursor-pointer"
                                >
                                  <ChevronRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                            <div className="w-full max-w-[110px] aspect-[9/14] max-h-[145px]">
                              <RecipeCardView
                                recipe={currentRecipe}
                                compact={true}
                                zoneBadge={
                                  zoneId === 2
                                    ? 'BOILING'
                                    : zoneId === 3
                                    ? 'FERMENTING'
                                    : zoneId === 4
                                    ? 'CONDITIONING'
                                    : 'PACKAGING'
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          /* Clean Idle Station: Zero visual clutter so the artwork is 100% visible */
                          <div className="flex-1 w-full pointer-events-none" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* =============================================================
                  3. BOTTOM EDGE: STAFF UPGRADE TUCK RAIL
                  Cards slide UNDER the bottom margin of the player board canvas.
                  Lower z-index (z-0) and negative top margin (-mt-2) so the top
                  edge of the tucked card slips under the board's bottom rim (z-10).
              ============================================================= */}
              <div className="grid grid-cols-5 gap-2 px-2.5 relative z-0 -mt-2">
                {([1, 2, 3, 4, 5] as ZoneId[]).map((zoneId) => {
                  const staffList = inspectedPlayer.zones[zoneId]?.staff || [];
                  const spec = ZONE_DEPARTMENT_SPECS[zoneId];
                  if (staffList.length > 0) {
                    return (
                      <div key={`bottom-st-${zoneId}`} className="w-full flex flex-col gap-1 items-start">
                        {staffList.map((st, stIdx) => (
                          <div
                            key={st.id || `st-${zoneId}-${stIdx}`}
                            className="w-full transform hover:translate-y-2 transition-transform duration-200 cursor-pointer shadow-lg"
                            title={`${st.name}: ${st.effectText}`}
                          >
                            <UpgradeCardView upgrade={st} tuckEdge="bottom" activePlayer={inspectedPlayer} storedTokens={cardTokensMap[st.id || st.name]} onDiscardToken={onDiscardToken} />
                          </div>
                        ))}
                      </div>
                    );
                  }
                  const zoneTheme = ZONE_THEMES[zoneId];
                  return (
                    <div
                      key={`bottom-empty-${zoneId}`}
                      className="w-full h-6 rounded-b-lg bg-black/75 border border-t-0 border-dashed flex items-center justify-center opacity-70 hover:opacity-100 transition-all cursor-pointer group shadow"
                      style={{
                        borderColor: `${zoneTheme.badgeBorder}70`,
                      }}
                      title={`Bottom Staff Slot: ${spec.staffGuide}. Staff cards slide under the bottom edge.`}
                    >
                      <div
                        className="flex items-center gap-1 text-[7.5px] font-mono font-bold uppercase tracking-wider truncate px-1"
                        style={{ color: zoneTheme.textColor }}
                      >
                        <UserCheck className="w-2.5 h-2.5" style={{ color: zoneTheme.accentHex }} />
                        <span>+ {spec.staffGuide}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};
