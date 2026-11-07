import React, { useState } from 'react';
import { Trophy, Truck, PackageCheck, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlayerState, RecipeCard } from '../engine/types';
import { useCardInspector } from '../context/CardInspectorContext';
import { RecipeLabelCanvas } from './HoyneAssets';

export interface BrewedRecipePileCardProps {
  player: PlayerState;
  targetBatches: number;
  layoutVariant?: 'landscape' | 'portrait';
}

/**
 * ============================================================================
 * BREWED RECIPE PILE CARD (5th Card Slot in Tabletop Row)
 * Actual card size matching Mixer Pack cards. Supports authentic horizontal
 * 'landscape' mode to sit flush with landscape mixer pack bounties!
 * ============================================================================
 */
export const BrewedRecipePileCard: React.FC<BrewedRecipePileCardProps> = ({
  player,
  targetBatches,
  layoutVariant = 'landscape',
}) => {
  const { inspectCard } = useCardInspector();
  const deliveredRecipes: RecipeCard[] =
    player.completedBatches && player.completedBatches.length > 0
      ? player.completedBatches
      : player.zones[5]?.recipes || [];
  const totalRecipeVp = deliveredRecipes.reduce((acc, r) => acc + (r.vp || 0), 0);
  const [viewIdx, setViewIdx] = useState<number>(0);

  // Keep index within bounds as recipes are added
  const curIdx = Math.min(viewIdx, Math.max(0, deliveredRecipes.length - 1));
  const activeRecipe = deliveredRecipes[curIdx];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deliveredRecipes.length <= 1) return;
    setViewIdx((prev) => (prev - 1 + deliveredRecipes.length) % deliveredRecipes.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deliveredRecipes.length <= 1) return;
    setViewIdx((prev) => (prev + 1) % deliveredRecipes.length);
  };

  const handleInspect = () => {
    if (!activeRecipe) return;
    inspectCard({
      type: 'recipe',
      card: activeRecipe,
      activePlayer: player,
      canBrew: false,
    });
  };

  // 1. EMPTY PILE STATE: Card-sized tactile drop slot
  if (deliveredRecipes.length === 0) {
    if (layoutVariant === 'landscape') {
      return (
        <div
          data-card-type="brewed-recipe-pile"
          className="rounded-2xl border-2 border-dashed border-amber-600/50 bg-gradient-to-r from-[#18100A]/95 via-[#120B07] to-[#0A0704] p-2 flex flex-row items-stretch select-none relative shadow-xl overflow-hidden min-h-[100px] sm:min-h-[108px] max-h-[125px] w-full"
        >
          {/* Left: Empty Slot Visual */}
          <div className="w-[70px] sm:w-[80px] shrink-0 rounded-xl border border-dashed border-amber-500/30 bg-black/45 flex flex-col items-center justify-center text-center p-1.5 shadow-inner">
            <div className="w-8 h-8 rounded-full border border-dashed border-amber-400/40 flex items-center justify-center bg-amber-950/40 mb-1">
              <Truck className="w-4 h-4 text-emerald-400/80" />
            </div>
            <span className="text-[7.5px] font-mono text-stone-400">Empty Slot</span>
          </div>

          {/* Right: Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between pl-2">
            <div>
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/40 text-[7.5px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5 text-amber-400" />
                  <span>Trophy Pile</span>
                </span>
                <span className="font-mono font-black text-[10px] text-amber-300">
                  0/{targetBatches} Batches
                </span>
              </div>
              <h3 className="font-serif font-black text-xs text-amber-200/90 tracking-wide truncate">
                Delivered Brews Pile
              </h3>
            </div>
            <p className="text-[8px] font-mono text-stone-400 leading-tight">
              Completed brews slide off Zone 5 Packaging &amp; collect here to score Prestige VP.
            </p>
            <div className="pt-0.5 border-t border-amber-900/40 flex items-center justify-between text-[8px] font-mono text-stone-400">
              <span>Prestige VP</span>
              <span className="text-amber-300 font-bold">+0 VP</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        data-card-type="brewed-recipe-pile"
        className="rounded-2xl border-2 border-dashed border-amber-600/50 bg-gradient-to-b from-[#18100A]/95 via-[#120B07] to-[#0A0704] p-2 sm:p-2.5 flex flex-col justify-between select-none relative shadow-xl overflow-hidden min-h-[220px] w-full"
      >
        {/* Top Header */}
        <div className="relative z-10 pb-1 border-b border-amber-900/40 flex items-center justify-between gap-1">
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/40 text-[8.5px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5 text-amber-400" />
            <span>Trophy Pile</span>
          </span>

          <div
            className="flex items-center gap-1 px-1.5 py-0.2 rounded-lg border border-amber-500/30 bg-black/60 shadow"
          >
            <span className="font-mono font-black text-[11px] text-amber-300">
              0/{targetBatches}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="pt-0.5">
          <h3 className="font-serif font-black text-xs sm:text-[13px] text-amber-200/90 tracking-wide truncate">
            Delivered Brews Pile
          </h3>
        </div>

        {/* Center Empty Slot Canvas */}
        <div className="my-1.5 flex-1 rounded-xl border border-dashed border-amber-500/30 bg-black/45 p-2 flex flex-col items-center justify-center text-center gap-1.5 shadow-inner">
          <div className="w-9 h-9 rounded-full border border-dashed border-amber-400/40 flex items-center justify-center bg-amber-950/40">
            <Truck className="w-4 h-4 text-emerald-400/80" />
          </div>
          <div className="font-serif font-black text-[11px] text-amber-200 uppercase tracking-wide">
            Trophy Pile Empty
          </div>
          <p className="text-[7.5px] font-mono text-stone-400 leading-tight px-0.5">
            Completed brews slide off Zone 5 &amp; collect here to score
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-1 border-t border-amber-900/40 flex items-center justify-between text-[8.5px] font-mono text-stone-400">
          <span>Prestige VP</span>
          <span className="text-amber-300 font-bold">+0 VP</span>
        </div>
      </div>
    );
  }

  // 2. POPULATED PILE STATE: Realistic 3D Tabletop Card Stack
  if (layoutVariant === 'landscape') {
    return (
      <div className="relative w-full min-h-[100px] sm:min-h-[108px] max-h-[125px] select-none group">
        {/* 3D Stack Layer 2 (Shadow card behind if 2+ batches) */}
        {deliveredRecipes.length > 1 && (
          <div className="absolute inset-0 translate-x-1.5 translate-y-1 rounded-2xl bg-amber-950/80 border border-amber-700/50 shadow-md pointer-events-none -rotate-0.5" />
        )}

        <div
          data-card-type="brewed-recipe-pile"
          onClick={handleInspect}
          className="relative z-10 w-full h-full rounded-2xl border-2 border-amber-400/90 bg-gradient-to-r from-[#24170D] via-[#1A110A] to-[#0E0906] p-2 flex flex-row items-stretch cursor-pointer shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-amber-500/25"
          title={`${activeRecipe.name} (+${activeRecipe.vp} VP) - Click to inspect Tasting Dossier`}
        >
          {/* Left: Hero Can Artwork */}
          <div className="relative w-[70px] sm:w-[80px] shrink-0 rounded-xl overflow-hidden bg-black/60 border border-amber-900/50 flex items-center justify-center p-1 shadow-inner">
            <img
              src={activeRecipe.imagePath || activeRecipe.canArtPath}
              alt={activeRecipe.name}
              className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]"
              loading="lazy"
            />
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-black/85 border border-amber-400/50 text-[7px] font-mono text-amber-200 font-bold whitespace-nowrap shadow">
              #{curIdx + 1}/{deliveredRecipes.length}
            </span>
          </div>

          {/* Right: Info and Navigation */}
          <div className="flex-1 min-w-0 flex flex-col justify-between pl-2">
            <div>
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-[7.5px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5 text-amber-400" />
                  <span>Delivered</span>
                </span>
                <div
                  className="flex items-center gap-1 px-1.5 py-0.2 rounded-lg border border-amber-200/90 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <Trophy className="w-2.5 h-2.5 text-stone-950 fill-stone-950 shrink-0" />
                  <span className="font-serif font-black text-[10px] text-stone-950 tracking-wider whitespace-nowrap">
                    +{activeRecipe.vp} VP
                  </span>
                </div>
              </div>

              <h3 className="font-serif font-black text-xs text-amber-100 tracking-wide truncate group-hover:text-amber-200 transition-colors">
                {activeRecipe.name}
              </h3>
              <div className="text-[7.5px] font-mono text-stone-400">
                Tier {activeRecipe.tier} • {activeRecipe.style}
              </div>
            </div>

            {/* Footer with Navigation & Action */}
            <div className="pt-0.5 border-t border-amber-900/40 flex items-center justify-between text-[7.5px]">
              {deliveredRecipes.length > 1 ? (
                <div
                  className="flex items-center gap-0.5 bg-black/80 px-1.5 py-0.5 rounded border border-amber-500/40 text-[7.5px] font-mono text-amber-200 shadow"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="hover:text-amber-400 p-0.5 cursor-pointer"
                    title="Previous Brew"
                  >
                    <ChevronLeft className="w-2.5 h-2.5" />
                  </button>
                  <span className="font-bold px-0.5">
                    {curIdx + 1}/{deliveredRecipes.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="hover:text-amber-400 p-0.5 cursor-pointer"
                    title="Next Brew"
                  >
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <span className="text-amber-300 font-mono font-bold">1 Delivered</span>
              )}
              <span className="text-amber-400 font-sans font-bold flex items-center gap-0.5">
                <span>Dossier</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[220px] select-none group">
      {/* 3D Stack Layer 2 (Shadow card behind if 2+ batches) */}
      {deliveredRecipes.length > 1 && (
        <div className="absolute inset-0 translate-x-1.5 translate-y-1 rounded-2xl bg-amber-950/80 border border-amber-700/50 shadow-md pointer-events-none -rotate-1" />
      )}
      {/* 3D Stack Layer 3 (Shadow card behind if 3+ batches) */}
      {deliveredRecipes.length > 2 && (
        <div className="absolute inset-0 translate-x-2.5 translate-y-2 rounded-2xl bg-[#0E0A07] border border-amber-900/60 shadow-lg pointer-events-none rotate-1" />
      )}

      {/* Main Top Delivered Recipe Card */}
      <div
        data-card-type="brewed-recipe-pile"
        onClick={handleInspect}
        className="relative z-10 w-full h-full rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-[#24170D] via-[#1A110A] to-[#0E0906] p-2 sm:p-2.5 flex flex-col justify-between cursor-pointer shadow-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-amber-500/25"
        title={`${activeRecipe.name} (+${activeRecipe.vp} VP) - Click to inspect Tasting Dossier`}
      >
        {/* Top Header: Badge, Navigator & Embossed VP Shield */}
        <div className="pb-1 border-b border-amber-900/50">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-[8.5px] font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
              <Trophy className="w-2.5 h-2.5 text-amber-400" />
              <span>Delivered</span>
            </span>

            {/* Embossed Gold VP Shield */}
            <div
              className="flex items-center gap-1 px-1.5 py-0.2 rounded-lg border border-amber-200/90 shadow-md"
              style={{
                background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Trophy className="w-2.5 h-2.5 text-stone-950 fill-stone-950 shrink-0" />
              <span className="font-serif font-black text-[11px] text-stone-950 tracking-wider whitespace-nowrap">
                +{activeRecipe.vp} VP
              </span>
            </div>
          </div>

          {/* Title & Multi-Batch Selector */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            <h3 className="font-serif font-black text-xs sm:text-[13px] text-amber-100 tracking-wide truncate group-hover:text-amber-200 transition-colors">
              {activeRecipe.name}
            </h3>

            {deliveredRecipes.length > 1 && (
              <div
                className="flex items-center gap-0.5 bg-black/80 px-1 py-0.2 rounded border border-amber-500/40 text-[8px] font-mono text-amber-200 shadow shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handlePrev}
                  className="hover:text-amber-400 p-0.5 cursor-pointer"
                  title="Previous Delivered Brew"
                >
                  <ChevronLeft className="w-2.5 h-2.5" />
                </button>
                <span className="font-bold px-0.5">
                  {curIdx + 1}/{deliveredRecipes.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="hover:text-amber-400 p-0.5 cursor-pointer"
                  title="Next Delivered Brew"
                >
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Can Artwork Canvas */}
        <div className="my-1.5 relative z-10 w-full h-[110px] sm:h-[120px] rounded-xl overflow-hidden bg-black/60 border border-amber-900/50 flex items-center justify-center p-1 group/art shadow-inner">
          <RecipeLabelCanvas recipe={activeRecipe} className="w-full h-full" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/95 text-stone-950 text-[9px] font-sans font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Inspect</span>
            </span>
          </div>
        </div>

        {/* Footer: Pile Tally & Score */}
        <div className="relative z-10 pt-1 border-t border-amber-900/50 flex items-center justify-between gap-1 text-[8.5px] font-mono">
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold truncate">
            {deliveredRecipes.length}/{targetBatches} Batches
          </span>
          <span className="text-amber-300 font-bold whitespace-nowrap">
            +{totalRecipeVp} Total VP
          </span>
        </div>
      </div>
    </div>
  );
};

export const TrophyRack: React.FC<BrewedRecipePileCardProps> = BrewedRecipePileCard;
