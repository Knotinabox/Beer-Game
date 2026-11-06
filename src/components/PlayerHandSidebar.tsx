import React from 'react';
import {
  GameState,
  PlayerState,
  IngredientTaxonomy,
} from '../engine/types';
import { WOODEN_TOKEN_COLORS, WoodenToken } from './WoodenTokens';
import {
  Warehouse,
  ArrowLeftRight,
  Sparkles,
  Beer,
  Wrench,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export interface PlayerHandSidebarProps {
  gameState: GameState;
  inspectedPlayerIndex: number;
  onSelectPlayerIndex: (index: number) => void;
  onPerformDiscardExcess: (discardCardIds: string[]) => void;
}

export const PlayerHandSidebar: React.FC<PlayerHandSidebarProps> = ({
  gameState,
  inspectedPlayerIndex,
  onSelectPlayerIndex,
}) => {
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const inspectedPlayer = gameState.players[inspectedPlayerIndex] || activePlayer;
  const humanPlayerIndex = gameState.players.findIndex((p) => !p.isAI);
  const humanPlayer = humanPlayerIndex !== -1 ? gameState.players[humanPlayerIndex] : activePlayer;
  const isInspectingSelf = inspectedPlayer.id === humanPlayer.id;

  const tokens = inspectedPlayer.tokens || {
    grain: 0,
    hops: 0,
    yeast: 0,
    chocolate: 0,
    spices: 0,
    fruit: 0,
  };

  const totalTokens = (Object.values(tokens) as number[]).reduce((a, b) => a + b, 0);

  const tokenList: IngredientTaxonomy[] = [
    'grain',
    'hops',
    'yeast',
    'chocolate',
    'spices',
    'fruit',
  ];

  // Active batches & upgrades in player's zones
  const kettleBatches = inspectedPlayer.zones[2]?.recipes || [];
  const cellarBatches = inspectedPlayer.zones[3]?.recipes || [];
  const conditioningBatches = inspectedPlayer.zones[4]?.recipes || [];
  const packagingBatches = inspectedPlayer.zones[5]?.recipes || [];
  const completedBatches =
    inspectedPlayer.completedBatches && inspectedPlayer.completedBatches.length > 0
      ? inspectedPlayer.completedBatches
      : [];

  const equipmentCount = [1, 2, 3, 4, 5].reduce(
    (acc, z) => acc + (inspectedPlayer.zones[z as 1 | 2 | 3 | 4 | 5]?.equipment.length || 0),
    0
  );
  const staffCount = [1, 2, 3, 4, 5].reduce(
    (acc, z) => acc + (inspectedPlayer.zones[z as 1 | 2 | 3 | 4 | 5]?.staff.length || 0),
    0
  );
  const wingsCount =
    (inspectedPlayer.leftWing?.length || 0) + (inspectedPlayer.rightWing?.length || 0);
  const totalUpgrades = equipmentCount + staffCount + wingsCount;

  return (
    <aside
      aria-label="Player Brewery Supply Sidebar"
      className="stout-panel rounded-2xl p-3.5 flex flex-col gap-3 border-hoyne-copper/70 shadow-2xl max-h-[calc(100vh-90px)] overflow-hidden"
    >
      {/* Header with Title & Token Counter */}
      <div className="border-b border-hoyne-copper/30 pb-2.5 px-0.5 space-y-1.5 shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Warehouse className="w-4 h-4 text-hoyne-copper shrink-0" />
            <h2 className="font-serif font-black text-sm text-hoyne-cream tracking-wide truncate">
              {isInspectingSelf ? 'Your Brewery Supply' : `${inspectedPlayer.name}'s Supply`}
            </h2>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-black bg-amber-950 text-amber-300 border border-amber-500/60 shadow-sm">
              {totalTokens} Tokens
            </span>
          </div>
        </div>

        {/* If inspecting an AI opponent, jump back button */}
        {!isInspectingSelf && humanPlayerIndex !== -1 && (
          <button
            type="button"
            onClick={() => onSelectPlayerIndex(humanPlayerIndex)}
            className="w-full py-1 px-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-[10px] font-sans font-bold text-amber-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <ArrowLeftRight className="w-3 h-3 text-amber-400" />
            <span>Switch to Your Board ({humanPlayer.name})</span>
          </button>
        )}
      </div>

      {/* Main Content Area: Tactile Wooden Tokens Supply Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-display font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Wooden Ingredient Tokens
            </span>
            <span className="text-[9px] font-mono text-stone-400">Rotary Stock</span>
          </div>

          {/* 6 Wooden Token Category Tiles */}
          <div className="grid grid-cols-2 gap-2">
            {tokenList.map((tax) => {
              const meta = WOODEN_TOKEN_COLORS[tax];
              const count = tokens[tax] || 0;

              return (
                <div
                  key={`supply-token-${tax}`}
                  className={`rounded-xl p-2.5 flex items-center gap-2 border transition-all ${
                    count > 0
                      ? 'bg-gradient-to-br from-stone-900/90 to-stone-950 border-amber-600/50 shadow-md'
                      : 'bg-stone-950/70 border-stone-800/80 opacity-60'
                  }`}
                >
                  <WoodenToken type={tax} size={30} count={count} />
                  <div className="flex flex-col text-left leading-none min-w-0">
                    <span className="font-display font-black text-xs text-hoyne-cream truncate">
                      {meta.label}
                    </span>
                    <span
                      className="font-mono font-black text-sm mt-0.5"
                      style={{ color: count > 0 ? meta.textColor : '#777' }}
                    >
                      {count} <span className="text-[9px] font-sans font-normal opacity-75">in cache</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brewery Production Summary */}
        <div className="space-y-2 pt-2 border-t border-amber-900/40 text-xs">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-display font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Beer className="w-3 h-3 text-amber-400" />
              Active Brewery Production
            </span>
            <span className="text-[9px] font-mono text-amber-400 font-bold">
              {inspectedPlayer.score} VP Scored
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            {/* Zones 2-4 Pipeline */}
            <div className="rounded-xl p-2 bg-stone-950/80 border border-stone-800">
              <div className="text-[8.5px] uppercase font-bold text-stone-400">Brew &amp; Cellar</div>
              <div className="font-mono font-black text-amber-200 text-sm">
                {kettleBatches.length + cellarBatches.length + conditioningBatches.length}
              </div>
              <div className="text-[8px] text-stone-400 truncate">Zones 2–4</div>
            </div>

            {/* Zone 5 Packaging */}
            <div className="rounded-xl p-2 bg-stone-950/80 border border-stone-800">
              <div className="text-[8.5px] uppercase font-bold text-stone-400">Zone 5</div>
              <div className="font-mono font-black text-amber-300 text-sm">
                {packagingBatches.length}/1
              </div>
              <div className="text-[8px] text-stone-400 truncate">Packaging</div>
            </div>

            {/* Trophy Rack Delivered */}
            <div className="rounded-xl p-2 bg-stone-950/80 border border-stone-800">
              <div className="text-[8.5px] uppercase font-bold text-stone-400">Trophy Rack</div>
              <div className="font-mono font-black text-emerald-300 text-sm">
                {completedBatches.length}/{gameState.targetBatchesToTriggerEnd}
              </div>
              <div className="text-[8px] text-stone-400 truncate">Delivered</div>
            </div>
          </div>

          {/* Installed Upgrades Badge */}
          <div className="rounded-xl p-2 bg-stone-950/80 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-300">
              <Wrench className="w-3 h-3 text-sky-400" />
              <span>Installed Upgrades &amp; Staff:</span>
            </div>
            <span className="font-mono font-black text-xs text-sky-300">
              {totalUpgrades} Installed
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
