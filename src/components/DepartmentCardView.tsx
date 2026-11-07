import React, { useState } from 'react';
import {
  BreweryDepartmentCard,
  PlayerState,
  TurnPhase,
  IngredientTaxonomy,
} from '../engine/types';
import { DepartmentActionPayload } from '../engine/gameEngine';
import { BrewerMeepleSVG } from './CenterMarket';
import { WOODEN_TOKEN_COLORS } from './WoodenTokens';
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
  Clock,
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
  compact?: boolean;
  className?: string;
}

const CATEGORY_STYLES: Record<
  BreweryDepartmentCard['category'],
  { label: string; bg: string; text: string; border: string; iconColor: string }
> = {
  production: {
    label: 'Production',
    bg: 'bg-orange-950/80',
    text: 'text-orange-200',
    border: 'border-orange-500/60',
    iconColor: '#f97316',
  },
  commercial: {
    label: 'Commercial',
    bg: 'bg-amber-950/80',
    text: 'text-amber-200',
    border: 'border-amber-500/60',
    iconColor: '#f59e0b',
  },
  personnel: {
    label: 'Personnel',
    bg: 'bg-purple-950/80',
    text: 'text-purple-200',
    border: 'border-purple-500/60',
    iconColor: '#c084fc',
  },
  engineering: {
    label: 'Engineering',
    bg: 'bg-blue-950/80',
    text: 'text-blue-200',
    border: 'border-blue-500/60',
    iconColor: '#60a5fa',
  },
  logistics: {
    label: 'Logistics',
    bg: 'bg-yellow-950/80',
    text: 'text-yellow-200',
    border: 'border-yellow-500/60',
    iconColor: '#eab308',
  },
  sourcing: {
    label: 'Sourcing',
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-200',
    border: 'border-emerald-500/60',
    iconColor: '#34d399',
  },
};

const DEPARTMENT_ICONS: Record<string, React.ReactNode> = {
  Moon: <Moon className="w-4 h-4 text-amber-300" />,
  Beer: <Beer className="w-4 h-4 text-amber-300" />,
  Users: <Users className="w-4 h-4 text-amber-300" />,
  Wrench: <Wrench className="w-4 h-4 text-amber-300" />,
  FlaskConical: <FlaskConical className="w-4 h-4 text-amber-300" />,
  Wheat: <Wheat className="w-4 h-4 text-amber-300" />,
  Snowflake: <Snowflake className="w-4 h-4 text-cyan-300" />,
  ClipboardCheck: <ClipboardCheck className="w-4 h-4 text-amber-300" />,
  Repeat: <Repeat className="w-4 h-4 text-amber-300" />,
  Dna: <Dna className="w-4 h-4 text-amber-300" />,
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
      department.actionEffect.type === 'farm_swap'
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
      <div
        data-department-card={`dept-${department.departmentNumber}`}
        className={`relative flex flex-col justify-between rounded-2xl overflow-hidden border-2 shadow-2xl transition-all duration-300 select-none group w-full aspect-[2.25/3.5] ${
          canPlaceMeeple
            ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-amber-500/20 hover:scale-[1.02] cursor-pointer'
            : isOccupied
            ? 'border-amber-500/80 shadow-black/80'
            : 'border-amber-800/60 hover:border-amber-600/70'
        } ${className}`}
        style={{
          background: 'linear-gradient(180deg, #1C120C 0%, #120B07 50%, #0A0604 100%)',
          boxShadow: 'inset 0 1px 0 rgba(254, 240, 138, 0.2), inset 0 0 0 1px rgba(200, 125, 50, 0.3), 0 12px 24px rgba(0,0,0,0.85)',
        }}
        onClick={() => {
          if (canPlaceMeeple && onPlaceMeeple) {
            onPlaceMeeple();
          }
        }}
      >
        {/* Subtle authentic paper texture & vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-black/60 pointer-events-none z-0" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none z-0" />

        {/* ===================================================================
            HEADER: Brass Porthole Number (#1-#10) + Category Badge + Title
        =================================================================== */}
        <div className="p-1.5 pb-1 relative z-10 space-y-0.5 border-b border-amber-900/50 bg-black/40">
          <div className="flex items-center justify-between gap-1.5">
            {/* The Brass Porthole Number (#1 - #10) */}
            <div
              className="w-6 h-6 rounded-full border border-amber-400/90 flex items-center justify-center font-display font-black text-[10px] text-stone-950 shadow-md shrink-0 text-stone-950 shadow-md shrink-0"
              style={{
                background: 'radial-gradient(circle, #FDE047 0%, #EAB308 55%, #A16207 100%)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.7)',
              }}
              title={`Department #${department.departmentNumber} (Tier 2 Shift Initiative: Resolves after Catwalks)`}
            >
              #{department.departmentNumber}
            </div>

            {/* Category Tag */}
            <span
              className={`px-2 py-0.5 rounded-full text-[7px] font-sans font-black uppercase tracking-wider px-1.5 py-0.2 border shadow-sm ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
            >
              {catStyle.label}
            </span>
          </div>

          <div>
            <h3 className="font-serif font-black text-[10.5px] sm:text-[11px] text-amber-100 leading-tight tracking-wide truncate">
              {department.name}
            </h3>
            <p className="text-[7px] text-amber-300/70 font-sans tracking-tight truncate">
              {department.subtitle}
            </p>
          </div>
        </div>

        {/* ===================================================================
            CENTER CANVAS: Artwork + Interactive Worker Placement Porthole
        =================================================================== */}
        <div className="relative px-2 py-1.5 flex-1 flex flex-col justify-center items-center z-10 min-h-[46px] py-1 px-1.5">
          {/* Background Illustration Thumbnail */}
          {department.imagePath && (
            <div className="absolute inset-2 rounded-xl overflow-hidden opacity-30 border border-amber-900/40 pointer-events-none">
              <img
                src={department.imagePath}
                alt=""
                className="w-full h-full object-cover filter contrast-125 brightness-90"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120B07] via-transparent to-transparent" />
            </div>
          )}

          {/* Dedicated Worker Placement Porthole */}
          <div className="relative z-20 flex flex-col items-center">
            <div
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                isOccupied
                  ? 'border-amber-400 bg-amber-950/90 shadow-xl'
                  : canPlaceMeeple
                  ? 'border-amber-300 bg-amber-500/25 ring-4 ring-amber-400/50 animate-pulse scale-105 shadow-2xl cursor-pointer'
                  : 'border-amber-800/60 bg-black/75 shadow-inner'
              }`}
              style={{
                boxShadow: isOccupied
                  ? 'inset 0 2px 4px rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.9)'
                  : 'inset 0 2px 5px rgba(0,0,0,0.9)',
              }}
              onClick={(e) => {
                if (canPlaceMeeple && onPlaceMeeple) {
                  e.stopPropagation();
                  onPlaceMeeple();
                }
              }}
            >
              {isOccupied && occupant ? (
                <div className="flex flex-col items-center justify-center animate-fade-in">
                  <BrewerMeepleSVG color={occupant.playerColor} size={20} />
                  <span
                    className="absolute -bottom-1.5 px-1 py-0.2 rounded bg-black/90 border border-amber-400/70 text-[6.5px] font-mono font-bold text-amber-200 tracking-wider truncate max-w-[44px] shadow"
                  >
                    {occupant.playerName.split(' ')[0]}
                  </span>
                </div>
              ) : canPlaceMeeple ? (
                <div className="flex flex-col items-center justify-center gap-0.5 text-center p-1">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="text-[7.5px] font-sans font-black text-amber-200 uppercase tracking-tighter leading-none">
                    Place Meeple
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center opacity-50">
                  {DEPARTMENT_ICONS[department.iconName] || <Clock className="w-4 h-4 text-stone-400" />}
                  <span className="text-[7px] font-mono text-stone-400 uppercase tracking-wider mt-0.5">
                    Shift Bay
                  </span>
                </div>
              )}
            </div>

            {/* Porthole Detent Rim Label */}
            <span className="mt-0.5 text-[6.5px] font-mono uppercase tracking-widest text-amber-400/80 font-bold">
              {isOccupied ? 'OCCUPIED' : canPlaceMeeple ? 'CLICK TO PLACE' : 'PRIVATE DEPT'}
            </span>
          </div>
        </div>

        {/* ===================================================================
            BODY: Passive Buffer (if any) + Shift Action Text + Trigger Button
        =================================================================== */}
        <div className="p-1.5 pt-1 relative z-10 space-y-0.5 bg-black/60 border-t border-amber-900/40">
          {/* Passive Buffer Badge */}
          {department.passiveEffect && (
            <div className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
              <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
              <div className="text-[7px] font-mono text-emerald-200 font-bold leading-tight">
                <span className="text-emerald-300 uppercase tracking-wider">✦ PASSIVE: </span>
                {department.passiveEffect.description}
              </div>
            </div>
          )}

          {/* Action Box */}
          <div className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 flex flex-col gap-0.5 shadow-sm">
            <div className="flex items-center gap-1">
              <span className="text-[7px] font-sans font-black text-amber-300 uppercase tracking-wider">
                ⚡ SHIFT ACTION:
              </span>
            </div>
            <p className="text-[7px] text-amber-100/90 leading-tight">
              {department.actionEffect.description}
            </p>
          </div>

          {/* Phase 3 Action Execution Trigger Button (for active player when occupied) */}
          {canExecuteAction && (
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full mt-0.5 py-1 px-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-sans font-black text-[9px] uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-amber-300"
            >
              <span>Execute Action</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Initiative order reminder footer */}
          <div className="flex items-center justify-between text-[6.5px] font-mono text-stone-400 pt-0.5 border-t border-stone-800/50">
            <span>Tier 2 Turn #{department.departmentNumber}</span>
            <span className="text-amber-400/80">Resolves 2nd</span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MODAL: Action Choice Selection (for Sourcing, Farm Swap, etc.)
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

            {/* First Token Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block">
                {department.actionEffect.type === 'gain_hops_wild'
                  ? 'Select 1 Wild Token to Gain:'
                  : 'Select First Token to Gain:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'] as IngredientTaxonomy[]).map(
                  (tax) => (
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
                  )
                )}
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
