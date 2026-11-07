import React, { useState } from 'react';
import {
  BreweryDepartmentCard,
  PlayerState,
  TurnPhase,
  IngredientTaxonomy,
} from '../engine/types';
import { DepartmentActionPayload } from '../engine/gameEngine';
import { BrewerMeepleSVG } from './CenterMarket';
import {
  Moon,
  Beer,
  Users,
  Wrench,
  FlaskConical,
  Wheat,
  Snowflake,
  ClipboardCheck,
  Repeat,
  Dna,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';

export interface DepartmentCardViewProps {
  department: BreweryDepartmentCard;
  player: PlayerState;
  activePlayer: PlayerState;
  isCurrentTurn: boolean;
  phase: TurnPhase;
  canPlaceMeeple?: boolean;
  onPlaceMeeple?: () => void;
  canExecuteAction?: boolean;
  onExecuteAction?: (payload?: DepartmentActionPayload) => void;
  onFlipCard?: () => void;
  compact?: boolean;
  className?: string;
}

const CATEGORY_STYLES: Record<
  BreweryDepartmentCard['category'],
  { label: string; bg: string; text: string; border: string; glow: string }
> = {
  production: {
    label: 'Production',
    bg: 'bg-orange-950/90',
    text: 'text-orange-200',
    border: 'border-orange-500/80',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
  commercial: {
    label: 'Commercial',
    bg: 'bg-amber-950/90',
    text: 'text-amber-200',
    border: 'border-amber-500/80',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  personnel: {
    label: 'Personnel',
    bg: 'bg-purple-950/90',
    text: 'text-purple-200',
    border: 'border-purple-500/80',
    glow: 'rgba(192, 132, 252, 0.4)',
  },
  engineering: {
    label: 'Engineering',
    bg: 'bg-blue-950/90',
    text: 'text-blue-200',
    border: 'border-blue-500/80',
    glow: 'rgba(96, 165, 250, 0.4)',
  },
  logistics: {
    label: 'Logistics',
    bg: 'bg-yellow-950/90',
    text: 'text-yellow-200',
    border: 'border-yellow-500/80',
    glow: 'rgba(234, 179, 8, 0.4)',
  },
  sourcing: {
    label: 'Sourcing',
    bg: 'bg-emerald-950/90',
    text: 'text-emerald-200',
    border: 'border-emerald-500/80',
    glow: 'rgba(52, 211, 153, 0.4)',
  },
};

export const DepartmentCardView: React.FC<DepartmentCardViewProps> = ({
  department,
  player,
  activePlayer,
  isCurrentTurn,
  phase,
  canPlaceMeeple = false,
  onPlaceMeeple,
  canExecuteAction = false,
  onExecuteAction,
  onFlipCard,
  compact = false,
  className = '',
}) => {
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [chosenToken, setChosenToken] = useState<IngredientTaxonomy>('grain');
  const [secondToken, setSecondToken] = useState<IngredientTaxonomy>('hops');
  const [discardToken, setDiscardToken] = useState<IngredientTaxonomy>('grain');

  const catStyle = CATEGORY_STYLES[department.category] || CATEGORY_STYLES.production;
  const isOccupied = !!player.departmentOccupant;
  const occupant = player.departmentOccupant;

  const handleActionClick = () => {
    // If the department requires choices, open dialog
    if (
      department.actionEffect.type === 'gain_hops_wild' ||
      department.actionEffect.type === 'gain_two_distinct' ||
      department.actionEffect.type === 'farm_swap' ||
      department.actionEffect.type === 'qa_lab_inspect' ||
      department.actionEffect.type === 'oak_cellar_maturation'
    ) {
      setShowChoiceModal(true);
    } else {
      onExecuteAction?.();
    }
  };

  const handleConfirmChoices = () => {
    setShowChoiceModal(false);
    onExecuteAction?.({
      chosenToken,
      secondToken,
      discardToken,
    });
  };

  return (
    <>
      {/* ===================================================================
          AUTHENTIC 2.25" x 3.5" PHYSICAL CARD CONTAINER
          Uses identical parchment border, proportions, and detent hierarchy
          as the canonical Staff/Equipment cards.
      =================================================================== */}
      <div
        data-department-card={`dept-${department.departmentNumber}`}
        className={`parchment-card overflow-hidden flex flex-col justify-between p-1.5 sm:p-2 relative select-none w-full aspect-[2.25/3.5] rounded-2xl shadow-2xl transition-all duration-300 ${
          canPlaceMeeple
            ? 'ring-2 ring-amber-400 shadow-amber-500/30 hover:scale-[1.02]'
            : isOccupied
            ? 'ring-1 ring-amber-500/60 shadow-black/80'
            : 'hover:border-amber-600/70'
        } ${className}`}
        style={{
          backgroundColor: '#FAF7F0',
          borderColor: '#85581A',
          boxShadow: isOccupied
            ? '0 6px 20px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(133,88,26,0.4)'
            : canPlaceMeeple
            ? '0 0 16px rgba(245, 158, 11, 0.4), 0 6px 20px rgba(0,0,0,0.7)'
            : '0 4px 16px rgba(0,0,0,0.6)',
        }}
      >
        {/* ===================================================================
            UPPER BAR: MEEPLE SLOT (LEFT) • NAME & CATEGORY (CENTER) • TURN # (RIGHT)
            Slim, elegant header matching canonical Staff / Equipment cards.
        =================================================================== */}
        <div
          className="rounded-lg border border-amber-500/80 bg-gradient-to-b from-[#183325] via-[#10241A] to-[#0A1610] shrink-0 z-10 flex items-center justify-between shadow-[0_2px_6px_rgba(0,0,0,0.85)] relative overflow-hidden w-full px-1 py-0.5 h-[26px] sm:h-[30px]"
          style={{
            backgroundColor: 'rgba(7, 25, 16, 0.95)',
            border: `1px solid ${catStyle.border.replace('border-', '') || '#10b981'}`,
            boxShadow: `inset 0 1px 0 rgba(254,240,138,0.35), 0 2px 6px rgba(0,0,0,0.8), 0 0 4px ${catStyle.glow}`,
          }}
        >
          {/* Left: Interactive Worker Placement Slot / Detent */}
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center relative shrink-0 transition-all ${
              isOccupied
                ? 'border-amber-400 bg-amber-950/90 shadow-md'
                : canPlaceMeeple
                ? 'border-amber-300 bg-amber-500/30 ring-2 ring-amber-400 animate-pulse cursor-pointer hover:scale-110 shadow-lg'
                : 'border-stone-600/70 bg-black/70 shadow-inner'
            }`}
            onClick={(e) => {
              if (canPlaceMeeple && onPlaceMeeple) {
                e.stopPropagation();
                onPlaceMeeple();
              }
            }}
            title={
              isOccupied
                ? `Stationed: ${occupant?.playerName}`
                : canPlaceMeeple
                ? 'Click to place your Brewer Meeple!'
                : 'Meeple Placement Porthole'
            }
          >
            {isOccupied && occupant ? (
              <BrewerMeepleSVG color={occupant.playerColor} size={14} />
            ) : canPlaceMeeple ? (
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            ) : (
              <div className="opacity-30">
                <BrewerMeepleSVG color="#AAA" size={11} />
              </div>
            )}
          </div>

          {/* Center: Department Name & Category Pill Badge */}
          <div className="flex-1 text-center min-w-0 px-0.5 flex flex-col items-center justify-center overflow-hidden">
            <span
              className="font-display font-black text-stone-100 uppercase truncate max-w-full drop-shadow-md leading-none text-[7.5px] sm:text-[8px] tracking-tight"
              title={department.name}
            >
              {department.name}
            </span>
            <span
              className={`inline-flex items-center justify-center font-display font-black uppercase tracking-wider px-1 py-0.1 rounded text-[5px] sm:text-[5.5px] border shadow-sm leading-none mt-0.5 max-w-full truncate ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
              title={`Department Category: ${catStyle.label}`}
            >
              {catStyle.label}
            </span>
          </div>

          {/* Right: Department Initiative Resolution Turn Number (#1 to #12) */}
          <div
            className="flex items-baseline justify-center gap-0.5 shrink-0 whitespace-nowrap select-none px-0.5"
            title={`Tier 2 Shift Initiative #${department.departmentNumber} (Resolves after Public Catwalks 1-7)`}
          >
            <span className="font-mono font-black text-[10px] sm:text-[11px] leading-none text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              #{department.departmentNumber}
            </span>
          </div>
        </div>

        {/* ===================================================================
            CENTER CANVAS: THE LARGE HIGH-RESOLUTION ARTWORK IN THE MIDDLE
            Guaranteed ~52% of total card height, matching Hop Broker character portrait.
        =================================================================== */}
        <div className="relative w-full flex-1 min-h-[75px] sm:min-h-[85px] rounded-lg overflow-hidden border border-amber-500/80 bg-[#07120B] shadow-md my-1 flex items-center justify-center group">
          {department.imagePath ? (
            <>
              <img
                src={department.imagePath}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-sm opacity-35 scale-105 pointer-events-none"
              />
              <img
                src={department.imagePath}
                alt={department.name}
                className="relative w-full h-full object-cover object-center pointer-events-none transition-transform duration-300 group-hover:scale-102 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] z-10"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-950 via-stone-900 to-black flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400/40" />
            </div>
          )}

          {/* Inner metallic foil border */}
          <div className="absolute inset-[2px] rounded border border-amber-400/25 pointer-events-none z-20" />

          {/* Placement Callout Banner if deployable */}
          {canPlaceMeeple && (
            <div className="absolute inset-0 bg-amber-500/10 z-20 flex items-center justify-center pointer-events-none">
              <span className="bg-black/90 text-amber-300 text-[6.5px] font-sans font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border border-amber-400/80 shadow-lg">
                Click Porthole to Deploy
              </span>
            </div>
          )}

          {/* Side Indicator Badge in bottom-left corner of image */}
          {department.side && (
            <div className="absolute bottom-1 left-1 z-20 px-1 py-0.2 rounded bg-black/80 border border-amber-400/60 text-[6px] font-mono font-bold text-amber-200">
              Side {department.side}
            </div>
          )}
        </div>

        {/* ===================================================================
            LOWER BAR: DESCRIPTION AT THE BOTTOM (RULE TEXT & THEMATIC TOKEN)
            Matches exact layout of Hop Broker lower effect box.
        =================================================================== */}
        <div
          className="rounded-lg border border-amber-500/80 bg-gradient-to-b from-[#183325] via-[#10241A] to-[#0A1610] shrink-0 z-10 flex flex-col justify-between shadow-[0_2px_6px_rgba(0,0,0,0.85)] relative overflow-hidden w-full p-1"
          style={{
            backgroundColor: 'rgba(7, 25, 16, 0.95)',
            border: '1px solid rgba(16, 185, 129, 0.85)',
            boxShadow: 'inset 0 1px 0 rgba(167,243,208,0.35), 0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          <div className="w-full flex items-start justify-between gap-1 overflow-hidden">
            {/* Rule / Passive / Action Text */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              {department.passiveEffect && (
                <div className="flex items-center">
                  <span className="font-sans font-black text-emerald-300 uppercase tracking-wide text-[6px] sm:text-[6.5px] leading-tight truncate">
                    ✦ +1 {department.passiveEffect.extraCapacityToken?.toUpperCase() || ''} BUFFER
                  </span>
                </div>
              )}
              <p className="font-sans text-[6px] sm:text-[6.5px] text-stone-200 leading-tight">
                <span className="font-black text-amber-300 uppercase">⚡ </span>
                {department.actionEffect.description}
              </p>
            </div>

            {/* Right: Thematic Token Graphic (matching Hop Broker token piece on right) */}
            <div className="shrink-0 flex items-center justify-center pl-0.5">
              {department.tokenGraphic ? (
                <img
                  src={department.tokenGraphic}
                  alt=""
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                />
              ) : (
                <Sparkles className="w-3 h-3 text-amber-300" />
              )}
            </div>
          </div>

          {/* Execute Action Button (when occupied during Phase 3) */}
          {canExecuteAction && (
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full mt-1 py-0.5 px-1 rounded bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-sans font-black text-[7px] uppercase tracking-wider shadow hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 border border-amber-300"
            >
              <span>Execute Action</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================
          MODAL: Action Choice Selection (for Tokens, Swaps, or QA Lab)
      =================================================================== */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18110B] border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-5 shadow-2xl text-amber-100 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center">
                  #{department.departmentNumber}
                </span>
                <h3 className="font-serif font-black text-base text-amber-200">
                  {department.name} Action
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChoiceModal(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-amber-200/80 leading-relaxed">
              {department.actionEffect.description}
            </p>

            {/* Farm Swap Discard choice */}
            {department.actionEffect.type === 'farm_swap' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
                  Select 1 Token to Discard (Return to Hoppers):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'] as IngredientTaxonomy[])
                    .filter((tax) => (player.tokens[tax] || 0) > 0)
                    .map((tax) => (
                      <button
                        key={`disc-${tax}`}
                        type="button"
                        onClick={() => setDiscardToken(tax)}
                        className={`px-2 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                          discardToken === tax
                            ? 'bg-red-950/80 border-red-400 text-white ring-2 ring-red-400/60'
                            : 'bg-black/40 border-stone-700 text-stone-300 hover:border-amber-400'
                        }`}
                      >
                        <img src={`/tokens/${tax}-wood-piece.png`} alt={tax} className="w-4 h-4 object-contain" />
                        <span className="capitalize">{tax}</span>
                        <span className="text-[10px] text-amber-300 ml-auto">({player.tokens[tax]})</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* First Token Choice (Wild, Distinct, QA Lab, or Oak Foeder) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
                {department.actionEffect.type === 'oak_cellar_maturation'
                  ? 'Select 1 Specialty Token to Gain:'
                  : department.actionEffect.type === 'gain_hops_wild'
                  ? 'Select 1 Wild Token to Gain:'
                  : 'Select First Token to Gain:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(department.actionEffect.type === 'oak_cellar_maturation'
                  ? (['chocolate', 'spices', 'fruit'] as IngredientTaxonomy[])
                  : (['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'] as IngredientTaxonomy[])
                ).map((tax) => (
                  <button
                    key={`g1-${tax}`}
                    type="button"
                    onClick={() => setChosenToken(tax)}
                    className={`px-2 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      chosenToken === tax
                        ? 'bg-amber-500/30 border-amber-400 text-white ring-2 ring-amber-400/60'
                        : 'bg-black/40 border-stone-700 text-stone-300 hover:border-amber-400'
                    }`}
                  >
                    <img src={`/tokens/${tax}-wood-piece.png`} alt={tax} className="w-4 h-4 object-contain" />
                    <span className="capitalize">{tax}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Second Token Choice (for distinct tokens or farm swap) */}
            {(department.actionEffect.type === 'gain_two_distinct' ||
              department.actionEffect.type === 'farm_swap') && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
                  Select Second Token to Gain:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'] as IngredientTaxonomy[])
                    .filter((tax) => department.actionEffect.type !== 'gain_two_distinct' || tax !== chosenToken)
                    .map((tax) => (
                      <button
                        key={`g2-${tax}`}
                        type="button"
                        onClick={() => setSecondToken(tax)}
                        className={`px-2 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                          secondToken === tax
                            ? 'bg-amber-500/30 border-amber-400 text-white ring-2 ring-amber-400/60'
                            : 'bg-black/40 border-stone-700 text-stone-300 hover:border-amber-400'
                        }`}
                      >
                        <img src={`/tokens/${tax}-wood-piece.png`} alt={tax} className="w-4 h-4 object-contain" />
                        <span className="capitalize">{tax}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-900/50">
              <button
                type="button"
                onClick={() => setShowChoiceModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmChoices}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Gain Tokens</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
