import React, { useEffect } from 'react';
import { useCardInspector } from '../context/CardInspectorContext';
import {
  RecipeCardView,
  UpgradeCardView,
  IngredientCardView,
  MixerPackCardView,
} from './CardComponents';
import { X, Beer, Wrench, UserCheck } from 'lucide-react';

export const CardInspectorModal: React.FC = () => {
  const { inspectedCard, inspectCard } = useCardInspector();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectedCard) {
        inspectCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedCard, inspectCard]);

  if (!inspectedCard) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => inspectCard(null)}
      className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 cursor-zoom-out animate-in fade-in duration-200 select-none overflow-y-auto"
    >
      {/* Floating Close Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          inspectCard(null);
        }}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[10010] w-10 h-10 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-all border border-amber-500/50 shadow-2xl cursor-pointer"
        title="Close (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Pure Enlarged Card Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[320px] sm:w-[350px] aspect-[9/14] filter drop-shadow-[0_20px_60px_rgba(0,0,0,0.95)] cursor-default animate-in zoom-in-95 duration-200 flex flex-col items-center shrink-0"
      >
        {inspectedCard.type === 'recipe' && (
          <RecipeCardView
            recipe={inspectedCard.card}
            activePlayer={inspectedCard.activePlayer}
            canBrew={inspectedCard.canBrew}
            onBrew={inspectedCard.onBrew}
            brewDisabledReason={inspectedCard.brewDisabledReason}
            isWorkDay={true}
            disableInspectTrigger
            isEnlarged={true}
          />
        )}
        {inspectedCard.type === 'upgrade' && (
          <UpgradeCardView
            upgrade={inspectedCard.card}
            activePlayer={inspectedCard.activePlayer}
            canInvest={inspectedCard.canInvest}
            onInvest={inspectedCard.onInvest}
            investDisabledReason={inspectedCard.investDisabledReason}
            isWorkDay={true}
            disableInspectTrigger
          />
        )}
        {inspectedCard.type === 'ingredient' && (
          <IngredientCardView
            card={inspectedCard.card}
            disableInspectTrigger
          />
        )}
        {inspectedCard.type === 'mixer' && (
          <MixerPackCardView
            card={inspectedCard.card}
            completedRecipeNames={inspectedCard.completedRecipeNames}
            activePlayer={inspectedCard.activePlayer}
            disableInspectTrigger
          />
        )}
      </div>

      {/* Optional In-Zoom Action Button & Dismissal Instructions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-3.5 flex flex-col items-center gap-2 pointer-events-auto shrink-0"
      >
        {inspectedCard.type === 'recipe' && inspectedCard.onBrew && (
          <button
            type="button"
            data-testid="inspector-brew-btn"
            disabled={!inspectedCard.canBrew}
            onClick={() => {
              inspectedCard.onBrew?.();
              inspectCard(null);
            }}
            className={`py-2 px-6 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
              inspectedCard.canBrew
                ? 'copper-bevel-btn ring-2 ring-amber-300 hover:scale-[1.02]'
                : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
            }`}
          >
            <Beer className="w-3.5 h-3.5" />
            <span>
              {inspectedCard.canBrew
                ? `Brew ${inspectedCard.card.name}`
                : inspectedCard.brewDisabledReason || 'Missing Required Ingredients'}
            </span>
          </button>
        )}

        {inspectedCard.type === 'upgrade' && inspectedCard.onInvest && (
          <button
            type="button"
            disabled={!inspectedCard.canInvest}
            onClick={() => {
              inspectedCard.onInvest?.(inspectedCard.card.cardKind === 'staff' ? 'staff' : 'equipment');
              inspectCard(null);
            }}
            className={`py-2 px-6 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
              inspectedCard.canInvest
                ? 'copper-bevel-btn ring-2 ring-amber-300 hover:scale-[1.02]'
                : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
            }`}
          >
            {inspectedCard.card.cardKind === 'staff' ? (
              <UserCheck className="w-3.5 h-3.5" />
            ) : (
              <Wrench className="w-3.5 h-3.5" />
            )}
            <span>
              {inspectedCard.canInvest
                ? `${inspectedCard.card.cardKind === 'staff' ? 'Hire' : 'Install'} ${inspectedCard.card.name}`
                : inspectedCard.investDisabledReason || 'Need Tokens to Build'}
            </span>
          </button>
        )}

        <p className="text-[11px] text-stone-400 font-serif italic flex items-center gap-1.5 select-none opacity-80">
          <span>Click outside or press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-200 font-mono text-[10px] border border-stone-600 not-italic">
            Esc
          </kbd>
          <span>to close</span>
        </p>
      </div>
    </div>
  );
};
