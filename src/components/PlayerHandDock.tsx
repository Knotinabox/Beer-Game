import React, { useState, useEffect } from 'react';
import {
  GameState,
  PlayerState,
  IngredientTaxonomy,
} from '../engine/types';
import { getPlayerHandLimit } from '../engine/gameEngine';
import { PlayerTokenCacheBar } from './WoodenTokens';
import {
  Warehouse,
  Trash2,
  AlertTriangle,
  ArrowLeftRight,
  Layers,
  Sparkles,
  User,
  Bot,
} from 'lucide-react';

export interface PlayerHandDockProps {
  gameState: GameState;
  inspectedPlayerIndex: number;
  onSelectPlayerIndex: (index: number) => void;
  onPerformDiscardExcess: (discardIds: string[]) => void;
}

export const PlayerHandDock: React.FC<PlayerHandDockProps> = ({
  gameState,
  inspectedPlayerIndex,
  onSelectPlayerIndex,
  onPerformDiscardExcess,
}) => {
  const activePlayer = gameState.players[gameState.currentPlayerIndex];
  const humanPlayerIndex = gameState.players.findIndex((p) => !p.isAI);
  const humanPlayer = humanPlayerIndex !== -1 ? gameState.players[humanPlayerIndex] : activePlayer;
  const inspectedPlayer = gameState.players[inspectedPlayerIndex] || activePlayer;
  const isInspectingSelf = inspectedPlayer.id === humanPlayer.id;

  const displayPlayer = isInspectingSelf ? humanPlayer : inspectedPlayer;
  const handLimit = getPlayerHandLimit(displayPlayer);

  // Discard Phase Logic
  const activeHandLimit = getPlayerHandLimit(activePlayer);
  const excessCount = Math.max(0, activePlayer.hand.length - activeHandLimit);
  const isDiscardPhase =
    gameState.phase === 'DISCARD' && !activePlayer.isAI && excessCount > 0;

  const [selectedDiscardIds, setSelectedDiscardIds] = useState<string[]>([]);

  useEffect(() => {
    if (isDiscardPhase) {
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

  return (
    <footer
      aria-label="Player Hand & Wooden Token Reserve Dock"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#140D08]/95 backdrop-blur-md border-t-2 border-amber-500/70 shadow-[0_-12px_35px_rgba(0,0,0,0.85)] px-3 sm:px-6 py-2 select-none"
    >
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* LEFT: Player Identity & Tactile Wooden Token Reserve */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 pr-2 border-r border-amber-700/40">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/60 shadow"
              style={{ backgroundColor: displayPlayer.color }}
            />
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-display font-black text-xs uppercase tracking-wider text-amber-200">
                  {isInspectingSelf ? 'Your Token Reserve' : `${displayPlayer.name} Reserve`}
                </span>
              </div>
              <span className="text-[10px] font-sans text-stone-400">
                {isInspectingSelf ? 'Head Brewer' : 'Brewery Opponent'}
              </span>
            </div>
          </div>

          {/* Authentic Tactile Wooden Token Reserve Bar */}
          <PlayerTokenCacheBar tokens={displayPlayer.tokens} compact />

          {/* Jump-back to human player if inspecting opponent */}
          {!isInspectingSelf && humanPlayerIndex !== -1 && (
            <button
              type="button"
              onClick={() => onSelectPlayerIndex(humanPlayerIndex)}
              className="ml-2 px-2.5 py-1 rounded-lg bg-amber-950/90 hover:bg-amber-900 border border-amber-500/50 text-[10px] font-sans font-bold text-amber-200 flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              title="Return to inspect your own brewery board"
            >
              <ArrowLeftRight className="w-3 h-3 text-amber-400" />
              <span>Back to Your Board</span>
            </button>
          )}
        </div>

        {/* RIGHT: Storage Limit, Hand Cards / Discard Phase Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Storage Capacity Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-stone-950/80 border border-amber-700/40 text-xs font-sans">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-stone-300">
              Zone 1 Storage:{' '}
              <strong className="text-amber-200 font-mono">
                {displayPlayer.hand.length}/{handLimit}
              </strong>{' '}
              Cards
            </span>
          </div>

          {/* Discard Excess Action (When in DISCARD Phase) */}
          {isDiscardPhase ? (
            <div className="flex items-center gap-2 bg-red-950/90 border border-red-500/80 px-3 py-1 rounded-xl animate-pulse shadow-md">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-xs text-amber-100 font-bold">
                Storage Exceeded! ({activePlayer.hand.length}/{activeHandLimit})
              </span>
              <button
                type="button"
                disabled={selectedDiscardIds.length !== excessCount}
                onClick={() => onPerformDiscardExcess(selectedDiscardIds)}
                className="ml-1 px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-sans font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Discard {selectedDiscardIds.length}/{excessCount} &amp; End Turn
              </button>
            </div>
          ) : (
            <div className="text-[11px] font-sans text-stone-400 hidden md:block">
              <span className="text-emerald-400 font-semibold">✓ Brewhouse Reserve Online</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
