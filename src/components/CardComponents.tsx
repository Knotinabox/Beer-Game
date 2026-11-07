import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import {
  RecipeCard,
  UpgradeCard,
  IngredientCard,
  IngredientSubtype,
  IngredientCategory,
  IngredientTaxonomy,
  MixerPackCard,
  PlayerState,
  ZoneId,
  ZONE_THEMES,
} from '../engine/types';
import {
  INGREDIENT_METADATA,
  CATEGORY_METADATA,
  TAXONOMY_METADATA,
  matchRecipeToMixerRequirement,
} from '../engine/cards';
import { canAffordUpgrade, doesCardMatchRequirement } from '../engine/gameEngine';
import { useCardInspector } from '../context/CardInspectorContext';
import { WoodenToken, WOODEN_TOKEN_COLORS } from './WoodenTokens';
import {
  getHoyneBrandPalette,
  RecipeTopBorderSVG,
  RecipeLabelCanvas,
  IngredientVectorIcon,
  getBotanicalIngredientTheme,
  BotanicalIngredientArtSVG,
  EquipmentBlueprintArtSVG,
  StaffPortraitPolaroidSVG,
  FullBleedBrewerySceneSVG,
  getUpgradeImageSrc,
  UpgradeArtworkFrame,
} from './HoyneAssets';
import {
  Wheat,
  Hop,
  FlaskConical,
  Snowflake,
  Sparkles,
  Wrench,
  UserCheck,
  Check,
  Beer,
  ArrowUpFromLine,
  ArrowDownToLine,
  Warehouse,
  Flame,
  Truck,
  Package,
  Trophy,
  CheckCircle2,
  Circle,
  Maximize2,
  ZoomIn,
  Eye,
  ChevronRight,
} from 'lucide-react';

export const ZONE_NAMES: Record<ZoneId, string> = {
  1: 'Zone 1: Warehouse',
  2: 'Zone 2: Brewhouse',
  3: 'Zone 3: Fermentation',
  4: 'Zone 4: Conditioning',
  5: 'Zone 5: Packaging',
};

export function CategoryIcon({
  category,
  className = 'w-3.5 h-3.5',
}: {
  category: IngredientCategory;
  className?: string;
}) {
  switch (category) {
    case 'malt':
      return <Wheat className={className} />;
    case 'hops':
      return <Hop className={className} />;
    case 'yeast':
      return <FlaskConical className={className} />;
    case 'adjunct':
      return <Sparkles className={className} />;
  }
}

export function TierBadge({ tier, tierName }: { tier: number; tierName: string }) {
  const styles: Record<number, string> = {
    6: 'bg-emerald-950 text-emerald-200 border-emerald-600/70',
    5: 'bg-amber-950 text-amber-200 border-amber-500/75',
    4: 'bg-stone-900 text-purple-200 border-purple-400/75',
    3: 'bg-red-950 text-amber-200 border-amber-400/90',
    1: 'bg-emerald-950 text-emerald-200 border-emerald-600/70',
    2: 'bg-amber-950 text-amber-200 border-amber-500/75',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-sans font-extrabold uppercase tracking-wider border shadow-sm ${
        styles[tier] || styles[6]
      }`}
    >
      T{tier} • {tierName}
    </span>
  );
}

/**
 * Dedicated Subtype Visual & Color Coding for Recipe Cards:
 * Gives all 10 subtypes unmistakably distinct color identities, non-truncated concise labels,
 * and high-contrast borders so players can distinguish required ingredients instantly.
 */
export interface SubtypeVisualSpec {
  shortName: string;
  fullName: string;
  category: IngredientCategory;
  bgGradient: string;
  borderNormal: string;
  borderMatched: string;
  textColor: string;
  accentDot: string;
}

export function subtypeToTaxonomy(subtype: IngredientSubtype): IngredientTaxonomy {
  if (subtype === 'grain' || subtype === 'base_malt' || subtype === 'specialty_grain') return 'grain';
  if (
    subtype === 'hops' ||
    subtype === 'bittering_hops' ||
    subtype === 'aroma_hops' ||
    subtype === 'noble_hops' ||
    subtype === 'fresh_wet_hops'
  )
    return 'hops';
  if (subtype === 'yeast' || subtype === 'house_yeast') return 'yeast';
  if (subtype === 'chocolate' || subtype === 'dark_roasted_malt') return 'chocolate';
  if (subtype === 'spices' || subtype === 'winter_spices') return 'spices';
  if (subtype === 'fruit' || subtype === 'local_raspberries') return 'fruit';
  return 'grain';
}

export const SUBTYPE_VISUALS: Record<IngredientSubtype, SubtypeVisualSpec> = {
  // Master 6-Color Ingredient Taxonomy
  grain: {
    shortName: 'Grain',
    fullName: 'Grain (Core Staple • 1 VP)',
    category: 'malt',
    bgGradient: 'linear-gradient(135deg, #784712 0%, #4D2D0C 100%)',
    borderNormal: '#B45309',
    borderMatched: '#FBBF24',
    textColor: '#FEF3C7',
    accentDot: '#F59E0B',
  },
  hops: {
    shortName: 'Hops',
    fullName: 'Hops (Core Staple • 1 VP)',
    category: 'hops',
    bgGradient: 'linear-gradient(135deg, #14532D 0%, #052E16 100%)',
    borderNormal: '#16A34A',
    borderMatched: '#4ADE80',
    textColor: '#DCFCE7',
    accentDot: '#22C55E',
  },
  yeast: {
    shortName: 'Yeast',
    fullName: 'Yeast (Universal Core Staple • 1 VP)',
    category: 'yeast',
    bgGradient: 'linear-gradient(135deg, #854D0E 0%, #4D2C04 100%)',
    borderNormal: '#CA8A04',
    borderMatched: '#FDE047',
    textColor: '#FEF9C3',
    accentDot: '#EAB308',
  },
  fruit: {
    shortName: 'Fruit',
    fullName: 'Fruit (Specialty • 2 VP)',
    category: 'adjunct',
    bgGradient: 'linear-gradient(135deg, #6B21A8 0%, #4C1D95 100%)',
    borderNormal: '#A855F7',
    borderMatched: '#C084FC',
    textColor: '#F3E8FF',
    accentDot: '#A855F7',
  },
  spices: {
    shortName: 'Spices',
    fullName: 'Spices (Specialty • 2 VP)',
    category: 'adjunct',
    bgGradient: 'linear-gradient(135deg, #C2410C 0%, #7C2D12 100%)',
    borderNormal: '#EA580C',
    borderMatched: '#F97316',
    textColor: '#FFEDD5',
    accentDot: '#FB923C',
  },
  chocolate: {
    shortName: 'Choc',
    fullName: 'Chocolate (Specialty • 2 VP)',
    category: 'malt',
    bgGradient: 'linear-gradient(135deg, #27140B 0%, #150904 100%)',
    borderNormal: '#78350F',
    borderMatched: '#B45309',
    textColor: '#FED7AA',
    accentDot: '#78350F',
  },
  base_malt: {
    shortName: '2-Row',
    fullName: '2-Row Base Malt',
    category: 'malt',
    bgGradient: 'linear-gradient(135deg, #784712 0%, #4D2D0C 100%)',
    borderNormal: '#B45309',
    borderMatched: '#FBBF24',
    textColor: '#FEF3C7',
    accentDot: '#F59E0B',
  },
  specialty_grain: {
    shortName: 'Crystal',
    fullName: 'Specialty Crystal Grain',
    category: 'malt',
    bgGradient: 'linear-gradient(135deg, #9A3412 0%, #612108 100%)',
    borderNormal: '#EA580C',
    borderMatched: '#FB923C',
    textColor: '#FFEDD5',
    accentDot: '#F97316',
  },
  dark_roasted_malt: {
    shortName: 'Roast',
    fullName: 'Dark Roasted Chocolate Malt',
    category: 'malt',
    bgGradient: 'linear-gradient(135deg, #27140B 0%, #150904 100%)',
    borderNormal: '#9A3412',
    borderMatched: '#FB923C',
    textColor: '#FED7AA',
    accentDot: '#C2410C',
  },
  bittering_hops: {
    shortName: 'Bitter',
    fullName: 'Kettle Bittering Hops',
    category: 'hops',
    bgGradient: 'linear-gradient(135deg, #14532D 0%, #052E16 100%)',
    borderNormal: '#16A34A',
    borderMatched: '#4ADE80',
    textColor: '#DCFCE7',
    accentDot: '#22C55E',
  },
  aroma_hops: {
    shortName: 'Aroma',
    fullName: 'Pacific NW Aroma Hops',
    category: 'hops',
    bgGradient: 'linear-gradient(135deg, #3F6212 0%, #1A2E05 100%)',
    borderNormal: '#65A30D',
    borderMatched: '#A3E635',
    textColor: '#ECFCCB',
    accentDot: '#84CC16',
  },
  noble_hops: {
    shortName: 'Noble',
    fullName: 'European Saaz Noble Hops',
    category: 'hops',
    bgGradient: 'linear-gradient(135deg, #115E59 0%, #042F2C 100%)',
    borderNormal: '#0D9488',
    borderMatched: '#2DD4BF',
    textColor: '#CCFBF1',
    accentDot: '#14B8A6',
  },
  house_yeast: {
    shortName: 'Yeast',
    fullName: 'Hoyne House Yeast',
    category: 'yeast',
    bgGradient: 'linear-gradient(135deg, #854D0E 0%, #4D2C04 100%)',
    borderNormal: '#CA8A04',
    borderMatched: '#FDE047',
    textColor: '#FEF9C3',
    accentDot: '#EAB308',
  },
  fresh_wet_hops: {
    shortName: 'Wet Hop',
    fullName: 'Fresh Sartori Wet Hops',
    category: 'adjunct',
    bgGradient: 'linear-gradient(135deg, #4D7C0F 0%, #1E3A06 100%)',
    borderNormal: '#84CC16',
    borderMatched: '#BEF264',
    textColor: '#F7FEE7',
    accentDot: '#A3E635',
  },
  winter_spices: {
    shortName: 'Spice',
    fullName: 'Solstice Winter Spices',
    category: 'adjunct',
    bgGradient: 'linear-gradient(135deg, #C2410C 0%, #7C2D12 100%)',
    borderNormal: '#EA580C',
    borderMatched: '#FB923C',
    textColor: '#FFEDD5',
    accentDot: '#F97316',
  },
  local_raspberries: {
    shortName: 'Fruit',
    fullName: 'Saanich Blackberries & Fruit',
    category: 'adjunct',
    bgGradient: 'linear-gradient(135deg, #6B21A8 0%, #4C1D95 100%)',
    borderNormal: '#A855F7',
    borderMatched: '#C084FC',
    textColor: '#F3E8FF',
    accentDot: '#A855F7',
  },
};

/**
 * Physical Color-Coded Pill Palette for Category Badges (e.g. Upgrades):
 * - Malt = Rich Roasted Brown (#5C3A21 / #78350F)
 * - Hops = Vibrant Hop Green (#15803D / #166534)
 * - Yeast = Golden Amber (#B45309 / #D97706)
 * - Epic Adjunct = Royal Gold/Purple (#6B21A8 / #D4AF37)
 */
function getPhysicalIngredientPillStyle(
  category: IngredientCategory,
  matched: boolean
): React.CSSProperties {
  const baseByCategory: Record<
    IngredientCategory,
    { bg: string; border: string; text: string }
  > = {
    malt: {
      bg: 'linear-gradient(135deg, #5C3A21 0%, #432815 100%)',
      border: '#A16207',
      text: '#FEF3C7',
    },
    hops: {
      bg: 'linear-gradient(135deg, #15803D 0%, #0F5328 100%)',
      border: '#4ADE80',
      text: '#ECFDF5',
    },
    yeast: {
      bg: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
      border: '#FBBF24',
      text: '#FFFBEB',
    },
    adjunct: {
      bg: 'linear-gradient(135deg, #6B21A8 0%, #4C1D95 100%)',
      border: '#D4AF37',
      text: '#FEF08A',
    },
  };

  const c = baseByCategory[category];
  return {
    background: c.bg,
    borderColor: matched ? '#4ADE80' : c.border,
    color: c.text,
    boxShadow: matched
      ? '0 0 0 1.5px #22C55E, 0 2px 5px rgba(0,0,0,0.35)'
      : '0 1px 3px rgba(0,0,0,0.3)',
  };
}

/**
 * Helper to compute which required ingredients the player currently holds in hand
 */
function matchPlayerHandToRecipe(
  required: IngredientSubtype[],
  player?: PlayerState
): { subtype: IngredientSubtype; matched: boolean; note?: string }[] {
  if (!player) {
    return required.map((subtype) => ({ subtype, matched: false }));
  }

  const remainingHand = [...player.hand];
  const installedEffects = new Set<string>();
  ([1, 2, 3, 4] as ZoneId[]).forEach((zId) => {
    player.zones[zId]?.equipment.forEach((u) => {
      const k = u.installedOption?.effectKey ?? u.effectKey;
      if (k) installedEffects.add(k);
    });
    player.zones[zId]?.staff.forEach((u) => {
      const k = u.installedOption?.effectKey ?? u.effectKey;
      if (k) installedEffects.add(k);
    });
  });
  player.leftWing?.forEach((u) => {
    const k = u.installedOption?.effectKey ?? u.effectKey;
    if (k) installedEffects.add(k);
  });
  player.rightWing?.forEach((u) => {
    const k = u.installedOption?.effectKey ?? u.effectKey;
    if (k) installedEffects.add(k);
  });

  let maltDiscountAvailable = installedEffects.has('kettle_discount_malt') ? 1 : 0;
  let hopsDiscountAvailable = installedEffects.has('kettle_discount_hops') ? 1 : 0;
  let yeastDiscountAvailable =
    installedEffects.has('kettle_discount_yeast') || installedEffects.has('yeast_propagation')
      ? 1
      : 0;
  let seanSubstituteAvailable = installedEffects.has('sean_hoyne_master_brewer') ? 1 : 0;

  // Total required in each category to enforce "requiring 2 or more X, reduce cost by 1 (minimum 1 paid)"
  const totalGrainsInRecipe = required.filter(
    (s) => s === 'grain' || s === 'base_malt' || s === 'specialty_grain'
  ).length;
  const totalHopsInRecipe = required.filter(
    (s) =>
      s === 'hops' ||
      s === 'bittering_hops' ||
      s === 'aroma_hops' ||
      s === 'noble_hops' ||
      s === 'fresh_wet_hops'
  ).length;
  const totalYeastInRecipe = required.filter(
    (s) => s === 'yeast' || s === 'house_yeast'
  ).length;

  // Rule: Equipment discount only applies if the recipe requires 2 or more of that ingredient!
  let canApplyMaltDiscount = maltDiscountAvailable > 0 && totalGrainsInRecipe >= 2;
  let canApplyHopsDiscount = hopsDiscountAvailable > 0 && totalHopsInRecipe >= 2;
  let canApplyYeastDiscount = yeastDiscountAvailable > 0 && totalYeastInRecipe >= 2;

  // Pass 1: Match real cards in hand first
  const results: Array<{ subtype: IngredientSubtype; matched: boolean; note?: string }> = required.map((subtype) => {
    const matchIdx = remainingHand.findIndex(
      (c) => doesCardMatchRequirement(c, subtype) && !c.isWildcard
    );
    if (matchIdx !== -1) {
      remainingHand.splice(matchIdx, 1);
      return { subtype, matched: true };
    }
    return { subtype, matched: false };
  });

  // Pass 2: Equipment discounts for remaining unmet requirements (only if recipe requires >= 2)
  results.forEach((item) => {
    if (!item.matched) {
      if (
        (item.subtype === 'grain' || item.subtype === 'base_malt' || item.subtype === 'specialty_grain') &&
        canApplyMaltDiscount
      ) {
        canApplyMaltDiscount = false;
        item.matched = true;
        item.note = 'Mash Tun';
      } else if (
        (item.subtype === 'hops' ||
          item.subtype === 'bittering_hops' ||
          item.subtype === 'aroma_hops' ||
          item.subtype === 'noble_hops' ||
          item.subtype === 'fresh_wet_hops') &&
        canApplyHopsDiscount
      ) {
        canApplyHopsDiscount = false;
        item.matched = true;
        item.note = 'Hop Back';
      } else if (
        (item.subtype === 'yeast' || item.subtype === 'house_yeast') &&
        canApplyYeastDiscount
      ) {
        canApplyYeastDiscount = false;
        item.matched = true;
        item.note = 'Heat Exchanger';
      }
    }
  });

  // Pass 3: Explicit Wildcards and Sean Hoyne substitution from hand
  results.forEach((item) => {
    if (!item.matched) {
      const wildIdx = remainingHand.findIndex((c) => c.isWildcard);
      if (wildIdx !== -1) {
        remainingHand.splice(wildIdx, 1);
        item.matched = true;
        item.note = 'Wild';
      } else if (seanSubstituteAvailable > 0 && remainingHand.length > 0) {
        remainingHand.pop();
        seanSubstituteAvailable--;
        item.matched = true;
        item.note = 'Sean Hoyne';
      }
    }
  });

  // Pass 4: Match tactile wooden tokens if player holds token inventory
  if (player.tokens) {
    const remainingTokens = { ...player.tokens };
    results.forEach((item) => {
      if (!item.matched) {
        let tax: IngredientTaxonomy | null = null;
        if (item.subtype === 'grain' || item.subtype === 'base_malt' || item.subtype === 'specialty_grain') {
          tax = 'grain';
        } else if (
          item.subtype === 'hops' ||
          item.subtype === 'bittering_hops' ||
          item.subtype === 'aroma_hops' ||
          item.subtype === 'noble_hops' ||
          item.subtype === 'fresh_wet_hops'
        ) {
          tax = 'hops';
        } else if (item.subtype === 'yeast' || item.subtype === 'house_yeast') {
          tax = 'yeast';
        } else if (item.subtype === 'chocolate' || item.subtype === 'dark_roasted_malt') {
          tax = 'chocolate';
        } else if (item.subtype === 'spices' || item.subtype === 'winter_spices') {
          tax = 'spices';
        } else if (item.subtype === 'fruit' || item.subtype === 'local_raspberries') {
          tax = 'fruit';
        }

        if (tax && (remainingTokens[tax] || 0) > 0) {
          remainingTokens[tax]--;
          item.matched = true;
          item.note = 'Token';
        }
      }
    });

    // Pass 5: Sean Hoyne wildcard token substitution (spend 1 surplus token for 1 unmet ingredient)
    if (seanSubstituteAvailable > 0) {
      results.forEach((item) => {
        if (!item.matched && seanSubstituteAvailable > 0) {
          const surplusTax = (Object.keys(remainingTokens) as IngredientTaxonomy[]).find(
            (t) => (remainingTokens[t] || 0) > 0
          );
          if (surplusTax) {
            remainingTokens[surplusTax]--;
            seanSubstituteAvailable--;
            item.matched = true;
            item.note = 'Sean Hoyne';
          }
        }
      });
    }
  }

  return results;
}

// ============================================================================
// DECK 1: RECIPE CARDS (43 CARDS) — VINTAGE HOYNE BOTTLE LABEL ON LINEN PAPER
// ============================================================================

export interface RecipeCardViewProps {
  recipe: RecipeCard;
  activePlayer?: PlayerState;
  canBrew?: boolean;
  brewDisabledReason?: string;
  onBrew?: () => void;
  isWorkDay?: boolean;
  compact?: boolean;
  zoneBadge?: string;
  disableInspectTrigger?: boolean;
  layoutVariant?: 'bottom-tray' | 'side-ledger';
  isEnlarged?: boolean;
  targetWidth?: number;
}

// ============================================================================
// CANONICAL PHYSICAL PRINT-READY CARD COORDINATES & UNIFORM SCALER
// Based on Standard 2.25" x 3.5" Bridge Card Ratio (9 : 14)
// Cards are fixed in this exact print-ready layout and scaled uniformly across all UI contexts.
// ============================================================================

export const CANONICAL_CARD_WIDTH = 270;
export const CANONICAL_CARD_HEIGHT = 420;

export interface ScaledCardContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  title?: string;
  targetWidth?: number;
  tuckEdge?: 'top' | 'bottom' | 'left' | 'right';
}

export const ScaledCardContainer: React.FC<ScaledCardContainerProps> = ({
  children,
  className = '',
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  title,
  targetWidth,
  tuckEdge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(() => {
    return targetWidth ? targetWidth / CANONICAL_CARD_WIDTH : 1;
  });

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (targetWidth) {
      setScale(targetWidth / CANONICAL_CARD_WIDTH);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setScale(w / CANONICAL_CARD_WIDTH);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [targetWidth]);

  // Exposed height of the functional modal tab when tucked under the player board rim
  // In canonical card coords: 270px width x 88px exposed height (matches 28.0cqw functional modal + card padding)
  const EXPOSED_TUCK_HEIGHT = 88;

  if (tuckEdge === 'top') {
    return (
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-t-xl shadow-xl transition-all duration-200 cursor-pointer ${className}`}
        style={{
          ...style,
          aspectRatio: `270 / ${EXPOSED_TUCK_HEIGHT}`,
        }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        title={title}
      >
        <div
          style={{
            width: CANONICAL_CARD_WIDTH,
            height: CANONICAL_CARD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (tuckEdge === 'bottom') {
    return (
      <div
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-b-xl shadow-xl transition-all duration-200 cursor-pointer ${className}`}
        style={{
          ...style,
          aspectRatio: `270 / ${EXPOSED_TUCK_HEIGHT}`,
        }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        title={title}
      >
        <div
          style={{
            width: CANONICAL_CARD_WIDTH,
            height: CANONICAL_CARD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            marginTop: -Math.round((CANONICAL_CARD_HEIGHT - EXPOSED_TUCK_HEIGHT) * scale),
            pointerEvents: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[9/14] overflow-hidden ${className}`}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      title={title}
    >
      <div
        style={{
          width: CANONICAL_CARD_WIDTH,
          height: CANONICAL_CARD_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const RecipeCardView: React.FC<RecipeCardViewProps> = ({
  recipe,
  activePlayer,
  canBrew = false,
  brewDisabledReason,
  onBrew,
  isWorkDay = false,
  zoneBadge,
  disableInspectTrigger = false,
  targetWidth,
}) => {
  const ingredientStatuses = matchPlayerHandToRecipe(recipe.requiredIngredients, activePlayer);
  const palette = getHoyneBrandPalette(recipe.name, recipe.tier);
  const { inspectCard, setHoveredCard } = useCardInspector();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleInspect = (e?: React.MouseEvent) => {
    if (disableInspectTrigger) return;
    if (e) e.stopPropagation();
    inspectCard({
      type: 'recipe',
      card: recipe,
      activePlayer,
      canBrew,
      onBrew,
      brewDisabledReason,
    });
  };

  const handleMouseEnter = () => {
    if (disableInspectTrigger || !cardRef.current) return;
    setHoveredCard(
      {
        type: 'recipe',
        card: recipe,
        activePlayer,
        canBrew,
        onBrew,
        brewDisabledReason,
      },
      cardRef.current.getBoundingClientRect()
    );
  };

  const handleMouseLeave = () => {
    if (disableInspectTrigger) return;
    setHoveredCard(null);
  };

  // Canonical Print-Ready Card (270 x 420 px | 2.25" x 3.5" Bridge Format)
  // Rendered identically in all contexts and scaled as a complete unit via ScaledCardContainer
  return (
    <ScaledCardContainer
      targetWidth={targetWidth}
      className={`transition-all duration-200 cursor-pointer shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/80 ${
        canBrew && isWorkDay ? 'ring-2 ring-amber-400 shadow-amber-500/30' : ''
      }`}
      style={{
        borderRadius: 14,
      }}
      onClick={handleInspect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title="Click to expand card (Read lore & full details)"
    >
      <div
        ref={cardRef}
        data-card-format="compact-vertical-2.25x3.5"
        className="parchment-card overflow-hidden flex flex-row relative select-none"
        style={{
          width: CANONICAL_CARD_WIDTH,
          height: CANONICAL_CARD_HEIGHT,
          border: `2px solid ${palette.borderAccent}`,
          borderRadius: 14,
          padding: 4,
          boxShadow:
            canBrew && isWorkDay
              ? `0 0 16px rgba(245, 158, 11, 0.35), 0 6px 20px rgba(0,0,0,0.8)`
              : `0 4px 16px rgba(0,0,0,0.6)`,
        }}
      >
        {/* LEFT COLUMN: Slim 3.5" Vertical Ingredient Ledger Strip (54px wide) */}
        <div
          className="h-full bg-gradient-to-b from-[#2B2F38] via-[#22252C] to-[#1A1D23] border border-stone-600/70 shadow-inner shrink-0 select-none flex flex-col items-center justify-evenly z-20 rounded-xl py-2 px-1"
          style={{ width: 54 }}
          data-side-ledger-tokens="true"
        >
          {ingredientStatuses.map((item, idx) => {
            const tax = subtypeToTaxonomy(item.subtype);
            const tokenMeta = WOODEN_TOKEN_COLORS[tax];
            const tokenSize =
              ingredientStatuses.length <= 4
                ? 36
                : ingredientStatuses.length === 5
                ? 32
                : 28;

            return (
              <div
                key={`${item.subtype}-${idx}`}
                className="flex items-center justify-center w-full"
                title={`${tokenMeta.label} Wooden Token (${item.matched ? 'Ready in Warehouse' : 'Needed to Brew'})`}
              >
                <div className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter shrink-0">
                  <WoodenToken type={tax} size={tokenSize} />
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT AREA: Art Canvas + Dedicated Bottom Tier & VP Modal */}
        <div className="flex-1 h-full relative pl-2 min-w-0 flex flex-col justify-between">
          {/* Centered can vessel inside its own branded frame */}
          <div className="flex-1 w-full min-h-0 relative">
            <RecipeLabelCanvas recipe={recipe} className="w-full h-full">
              {/* Optional Zone Badge (e.g. on Assembly Line) */}
              {zoneBadge && (
                <div className="absolute top-2 right-2 z-30 pointer-events-none">
                  <span className="text-[10px] px-2 py-0.5 font-sans font-black uppercase rounded-md bg-amber-400 text-stone-950 shadow-md">
                    {zoneBadge}
                  </span>
                </div>
              )}
            </RecipeLabelCanvas>
          </div>

          {/* Dedicated Bottom Modal */}
          <div className="relative z-30 w-full mt-2 shrink-0">
            <div
              data-vp-badge={recipe.vp}
              className="w-full h-[44px] rounded-xl px-3 flex items-center justify-between shadow-lg pointer-events-none select-none"
              style={{
                backgroundColor: 'rgba(18, 14, 11, 0.95)',
                border: '1.5px solid rgba(217, 119, 6, 0.85)',
                boxShadow: 'inset 0 1px 0 rgba(254,240,138,0.35), 0 3px 8px rgba(0,0,0,0.8)',
              }}
              title={`Tier ${recipe.tier} Recipe • ${recipe.vp} Victory Points upon Packaging`}
            >
              {/* Tier Marker */}
              <span className="text-[11px] px-2.5 py-1 font-sans font-black uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 leading-none shrink-0 tracking-wider">
                TIER {recipe.tier}
              </span>

              {/* VP Metric (Same Font Size) */}
              <div className="flex items-baseline gap-1 shrink-0 whitespace-nowrap">
                <span className="text-[18px] font-mono font-black leading-none text-amber-200">
                  {recipe.vp}
                </span>
                <span className="text-[18px] font-display font-black uppercase tracking-wider text-amber-300 leading-none">
                  VP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScaledCardContainer>
  );
};

// ============================================================================
// DECK 3 & DECK 4: EQUIPMENT PATENT BLUEPRINTS (15) & STAFF GUILD DOSSIERS (15)
// Unified Vertical Compact Size (9 : 14 | 2.25" x 3.5") alongside Recipes & Ingredients
// ============================================================================

export interface UpgradeVisualToken {
  type: 'grain' | 'hops' | 'yeast' | 'chocolate' | 'spices' | 'fruit' | 'any';
  badge: string; // e.g. "-1", "+1", "RET"
  badgeColor?: string;
}

export interface UpgradeVisualInfo {
  tokens: UpgradeVisualToken[];
  headline: string;
  description: string;
  isStacked?: boolean;
  stackedBadge?: string;
  stackedBadgeColor?: string;
}

export function getUpgradeVisualInfo(upgrade: UpgradeCard): UpgradeVisualInfo {
  const name = upgrade.name.toLowerCase();
  const effect = (upgrade.effectText || upgrade.equipment?.effectText || upgrade.staff?.effectText || '').toLowerCase();
  const badge = (upgrade.headerBadge || upgrade.footerBadge || upgrade.equipment?.badge || upgrade.staff?.badge || '').toLowerCase();

  // 1. Specific Named Hardware & Staff Cards
  if (name.includes('copper mash tun')) {
    return {
      tokens: [{ type: 'grain', badge: '-1', badgeColor: 'bg-rose-600 text-white' }],
      headline: '-1 GRAIN BREW COST',
      description: 'When brewing a recipe requiring 2+ Grain, reduce Grain cost by 1 (minimum 1 paid).',
    };
  }
  if (name.includes('hop back')) {
    return {
      tokens: [{ type: 'hops', badge: '-1', badgeColor: 'bg-rose-600 text-white' }],
      headline: '-1 HOPS BREW COST',
      description: 'When brewing a recipe requiring 2+ Hops, reduce Hops cost by 1 (minimum 1 paid).',
    };
  }
  if (name.includes('heat exchanger')) {
    return {
      tokens: [{ type: 'yeast', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 YEAST KICKBACK',
      description: 'When beer advances into the Cold Room, take 1 Yeast from the Market.',
    };
  }
  if (name.includes('spent grain collector') || name.includes('mash tun tender')) {
    return {
      tokens: [{ type: 'grain', badge: 'RET', badgeColor: 'bg-amber-500 text-stone-950' }],
      headline: 'RETAIN 1 SPENT GRAIN',
      description: 'Whenever you brew a recipe in the Brewhouse, retain 1 spent Grain in your Warehouse.',
    };
  }
  if (name.includes('grist miller')) {
    return {
      tokens: [{ type: 'hops', badge: 'RET', badgeColor: 'bg-amber-500 text-stone-950' }],
      headline: 'RETAIN 1 SPENT HOPS',
      description: 'Whenever you brew a recipe in the Brewhouse, retain 1 spent Hops in your Warehouse.',
    };
  }
  if (name.includes('brewhouse chemist')) {
    return {
      tokens: [{ type: 'yeast', badge: 'RET', badgeColor: 'bg-amber-500 text-stone-950' }],
      headline: 'RETAIN 1 SPENT YEAST',
      description: 'Whenever you brew a recipe in the Brewhouse, retain 1 spent Yeast in your Warehouse.',
    };
  }
  if (name.includes('canning line')) {
    return {
      tokens: [{ type: 'grain', badge: '-1', badgeColor: 'bg-rose-600 text-white' }],
      headline: '-1 GRAIN EQUIP COST',
      description: 'Pay 1 less Grain when installing any other Equipment card.',
    };
  }
  if (name.includes('conical unitank')) {
    return {
      tokens: [{ type: 'hops', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 HOPS KICKBACK',
      description: 'When beer advances to the Cold Room, take 1 Hops from the Market.',
    };
  }
  if (name.includes('aging foeder')) {
    return {
      tokens: [{ type: 'spices', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 SPICES KICKBACK',
      description: 'When beer advances to the Cold Room, take 1 Spices from the Market.',
    };
  }
  if (name.includes('horizontal lagering tank')) {
    return {
      tokens: [{ type: 'grain', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 GRAIN KICKBACK',
      description: 'When beer advances to the Cold Room, take 1 Grain from the Market.',
    };
  }
  if (name.includes('bright conditioning rig')) {
    return {
      tokens: [{ type: 'yeast', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 YEAST KICKBACK',
      description: 'When beer advances to the Cold Room, take 1 Yeast from the Market.',
    };
  }
  if (name.includes('automated keg racker')) {
    return {
      tokens: [
        { type: 'grain', badge: '+1', badgeColor: 'bg-emerald-600 text-white' },
        { type: 'yeast', badge: '+1', badgeColor: 'bg-emerald-600 text-white' },
      ],
      headline: '+1 GRAIN & +1 YEAST',
      description: 'When delivering to Trophy Rack, take 1 Grain & 1 Yeast from the Market.',
    };
  }
  if (name.includes('pallet stretch wrapper')) {
    return {
      tokens: [{ type: 'grain', badge: 'RET', badgeColor: 'bg-amber-500 text-stone-950' }],
      headline: 'RETAIN 1 SPENT GRAIN',
      description: 'When delivering to Trophy Rack, retain 1 spent Grain in your Warehouse.',
    };
  }
  if (name.includes('hop broker')) {
    return {
      tokens: [{ type: 'hops', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 HOPS AT MARKET',
      description: 'When buying Hops at the Market, take +1 Hops.',
    };
  }
  if (name.includes('malt handler') || name.includes('freight lead')) {
    return {
      tokens: [{ type: 'grain', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 GRAIN AT MARKET',
      description: 'When buying Grain at the Market, take +1 Grain.',
    };
  }
  if (name.includes('spice forager') || name.includes('spicemaster')) {
    return {
      tokens: [{ type: 'spices', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 SPICES AT MARKET',
      description: 'When buying Spices at the Market, take +1 Spices.',
    };
  }
  if (name.includes('yeast propagator') || name.includes('head cellarman')) {
    return {
      tokens: [{ type: 'yeast', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 YEAST AT MARKET',
      description: 'When buying Yeast at the Market, take +1 Yeast.',
    };
  }
  if (name.includes('orchard lead')) {
    return {
      tokens: [{ type: 'fruit', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 FRUIT AT MARKET',
      description: 'When buying Fruit at the Market, take +1 Fruit.',
    };
  }
  if (name.includes('dark maltster')) {
    return {
      tokens: [{ type: 'chocolate', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 CHOC AT MARKET',
      description: 'When buying Chocolate at the Market, take +1 Chocolate.',
    };
  }
  if (name.includes('taproom lead')) {
    return {
      tokens: [{ type: 'spices', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: 'DELIVERY: +1 SPICES',
      description: 'When delivering to Trophy Rack, take 1 Spices from the Market.',
    };
  }
  if (name.includes('brand ambassador')) {
    return {
      tokens: [{ type: 'any', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: 'DELIVERY: +1 MARKET TOKEN',
      description: 'When delivering to Trophy Rack, take 1 token of any type from the Market.',
    };
  }
  if (name.includes('route driver')) {
    return {
      tokens: [{ type: 'grain', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: 'PACKAGING: +1 GRAIN',
      description: 'When a recipe moves into Packaging, take 1 Grain from the Market.',
    };
  }
  if (name.includes('dock expediter')) {
    return {
      tokens: [{ type: 'grain', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: 'DELIVERY: +1 GRAIN',
      description: 'When delivering to Trophy Rack, take 1 Grain from the Market.',
    };
  }
  if (name.includes('whirlpool aerator')) {
    return {
      tokens: [{ type: 'yeast', badge: '-1', badgeColor: 'bg-rose-600 text-white' }],
      headline: '-1 YEAST BREW COST',
      description: 'When brewing a recipe requiring 2+ Yeast, reduce Yeast cost by 1 (minimum 1 paid).',
    };
  }
  if (name.includes('glycol cooling jacket')) {
    return {
      tokens: [{ type: 'grain', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 GRAIN KICKBACK',
      description: 'When beer advances into the Cold Room, take 1 Grain from the Market.',
    };
  }
  if (name.includes('centrifuge clarifier')) {
    return {
      tokens: [{ type: 'hops', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 HOPS KICKBACK',
      description: 'When beer advances into the Cold Room, take 1 Hops from the Market.',
    };
  }
  if (name.includes('case packer')) {
    return {
      tokens: [{ type: 'hops', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: 'DELIVERY: +1 HOPS',
      description: 'When delivering to Trophy Rack, take 1 Hops from the Market.',
    };
  }
  if (name.includes('kettle operator')) {
    return {
      tokens: [{ type: 'chocolate', badge: 'RET', badgeColor: 'bg-amber-500 text-stone-950' }],
      headline: 'RETAIN 1 SPENT CHOC',
      description: 'When brewing a recipe in the Brewhouse, retain 1 spent Chocolate in your Warehouse.',
    };
  }
  if (name.includes('cellar apprentice')) {
    return {
      tokens: [{ type: 'yeast', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 YEAST KICKBACK',
      description: 'When beer advances into the Cold Room, take 1 Yeast from the Market.',
    };
  }
  if (name.includes('quality assurance lead')) {
    return {
      tokens: [{ type: 'hops', badge: 'RET', badgeColor: 'bg-amber-500 text-stone-950' }],
      headline: 'DELIVERY: RETAIN HOPS',
      description: 'When delivering a recipe to Trophy Rack, retain 1 spent Hops in your Warehouse.',
    };
  }
  if (name.includes('dry-hop lead') || name.includes('dry-hop specialist')) {
    return {
      tokens: [{ type: 'hops', badge: '+1', badgeColor: 'bg-emerald-600 text-white' }],
      headline: '+1 HOPS KICKBACK',
      description: 'When beer advances into the Cold Room, take 1 Hops from the Market.',
    };
  }

  // 2. Generic / Modular / Fallback Parsing
  let detectedType: 'grain' | 'hops' | 'yeast' | 'chocolate' | 'spices' | 'fruit' | 'any' = 'any';
  if (badge.includes('grain') || effect.includes('grain') || badge.includes('malt') || effect.includes('malt')) {
    detectedType = 'grain';
  } else if (badge.includes('hop') || effect.includes('hop')) {
    detectedType = 'hops';
  } else if (badge.includes('yeast') || effect.includes('yeast')) {
    detectedType = 'yeast';
  } else if (badge.includes('chocolate') || effect.includes('chocolate')) {
    detectedType = 'chocolate';
  } else if (badge.includes('spice') || effect.includes('spice')) {
    detectedType = 'spices';
  } else if (badge.includes('fruit') || effect.includes('fruit')) {
    detectedType = 'fruit';
  }

  let modBadge = '+1';
  let badgeColor = 'bg-emerald-600 text-white';
  if (badge.includes('-1') || effect.includes('reduce') || effect.includes('less') || effect.includes('discount')) {
    modBadge = '-1';
    badgeColor = 'bg-rose-600 text-white';
  } else if (badge.includes('ret') || effect.includes('retain')) {
    modBadge = 'RET';
    badgeColor = 'bg-amber-500 text-stone-950';
  } else if (badge.includes('vp') || effect.includes('vp')) {
    modBadge = '+1 VP';
    badgeColor = 'bg-amber-400 text-stone-950';
  }

  const rawHeadline = upgrade.headerBadge || upgrade.footerBadge || upgrade.equipment?.badge || upgrade.staff?.badge || 'PASSIVE UPGRADE';
  const rawDesc = upgrade.effectText || upgrade.equipment?.effectText || upgrade.staff?.effectText || '';

  return {
    tokens: [{ type: detectedType, badge: modBadge, badgeColor }],
    headline: rawHeadline.toUpperCase(),
    description: rawDesc,
  };
}

export interface UpgradeCardViewProps {
  upgrade: UpgradeCard;
  activePlayer?: PlayerState;
  canInvest?: boolean;
  investDisabledReason?: string;
  onInvest?: (chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing') => void;
  isWorkDay?: boolean;
  compact?: boolean;
  /** Physical tuck orientation when tucked under top/bottom/left/right edge of an Assembly Line Zone tile */
  tuckEdge?: 'top' | 'bottom' | 'left' | 'right';
  disableInspectTrigger?: boolean;
  className?: string;
  storedTokens?: IngredientTaxonomy[];
  onDiscardToken?: (tax: IngredientTaxonomy) => void;
}

export const UpgradeCardView: React.FC<UpgradeCardViewProps> = ({
  upgrade,
  activePlayer,
  canInvest = false,
  investDisabledReason,
  onInvest,
  isWorkDay = false,
  compact = false,
  tuckEdge,
  disableInspectTrigger = false,
  className = '',
  storedTokens,
  onDiscardToken,
}) => {
  const { inspectCard, setHoveredCard } = useCardInspector();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleInspect = (e?: React.MouseEvent) => {
    if (disableInspectTrigger) return;
    if (e) e.stopPropagation();
    inspectCard({
      type: 'upgrade',
      card: upgrade,
      activePlayer,
      canInvest,
      onInvest,
      investDisabledReason,
      targetZone: upgrade.targetZone,
      tuckEdge,
    });
  };

  const handleMouseEnter = () => {
    if (disableInspectTrigger || !cardRef.current) return;
    setHoveredCard(
      {
        type: 'upgrade',
        card: upgrade,
        activePlayer,
        canInvest,
        onInvest,
        investDisabledReason,
        targetZone: upgrade.targetZone,
        tuckEdge,
      },
      cardRef.current.getBoundingClientRect()
    );
  };

  const handleMouseLeave = () => {
    if (disableInspectTrigger) return;
    setHoveredCard(null);
  };

  // If compact (without tuckEdge) or installed as wing, render compact card
  if ((compact && !tuckEdge) || upgrade.installedAs === "leftWing" || upgrade.installedAs === "rightWing") {
    const isLeftWing = upgrade.installedAs === 'leftWing';
    const activeOption = upgrade.installedOption ||
      (upgrade.cardKind === 'equipment' ? upgrade.equipment : upgrade.cardKind === 'staff' ? upgrade.staff : isLeftWing ? upgrade.leftWing : upgrade.rightWing);

    const displayName = activeOption?.name || upgrade.name;
    const displayEffect = activeOption?.effectText || upgrade.effectText || '';

    return (
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleInspect}
        className={`px-2 py-1.5 text-xs flex flex-col justify-between gap-1 shadow-lg relative overflow-hidden ${
          !disableInspectTrigger ? 'cursor-pointer hover:brightness-110' : ''
        } ${
          isLeftWing ? 'rounded-l-xl rounded-r-none pr-3 border-2 border-r-0' : 'rounded-r-xl rounded-l-none pl-3 border-2 border-l-0'
        } ${className}`}
        style={{
          backgroundColor: '#FAF7F0',
          borderColor: '#85581A',
          color: '#2A1808',
        }}
      >
        <span className="font-display font-black text-[9px] truncate">{displayName}</span>
        <span className="text-[8px] font-sans truncate">{displayEffect}</span>
      </div>
    );
  }

  // Helper: Visual Detent and Highlight info for Upgrade / Staff Cards
  const visualInfo = getUpgradeVisualInfo(upgrade);

  // 3. DEDICATED EQUIPMENT CARD (Station #1 Market • 15 Unique Machinery Cards)
  if (upgrade.cardKind === 'equipment' || (upgrade.equipment && !upgrade.staff && !upgrade.isUniversalWing)) {
    const targetZoneId = (upgrade.targetZone || upgrade.equipment?.targetZone || 1) as ZoneId;
    const zoneTheme = ZONE_THEMES[targetZoneId] || ZONE_THEMES[1];
    const equipImg = upgrade.imagePath || getUpgradeImageSrc(targetZoneId, 'equipment', upgrade.name);
    const effectText = upgrade.effectText || upgrade.equipment?.effectText || '';
    const badgeText = upgrade.headerBadge || upgrade.equipment?.badge;
    const flavorText = upgrade.flavorText || upgrade.equipment?.flavorText;
    const vpValue =
      upgrade.bonusEndgameVp ??
      (upgrade.installTokens
        ? Math.min(
            3,
            Object.entries(upgrade.installTokens).reduce((s, [k, v]) => {
              if (!v || k === 'any') return s;
              const weight = (k === 'chocolate' || k === 'spices' || k === 'fruit') ? 2 : 1;
              return s + v * weight;
            }, 0)
          ) || 1
        : 1);

    const departmentName = zoneTheme.name.toUpperCase();

    // Equipment cost: Specific ingredient tokens (tokens only, zero numbers)
    const specificEquipTokens: { taxonomy: IngredientTaxonomy; count: number }[] = [];
    const equipCostTokenList: IngredientTaxonomy[] = [];
    if (upgrade.installTokens) {
      for (const [k, v] of Object.entries(upgrade.installTokens)) {
        if (k !== 'any' && (v || 0) > 0) {
          specificEquipTokens.push({ taxonomy: k as IngredientTaxonomy, count: v as number });
          for (let i = 0; i < (v as number); i++) {
            equipCostTokenList.push(k as IngredientTaxonomy);
          }
        }
      }
    }

    const requiredEquipTokens =
      upgrade.installTokens?.any ||
      (equipCostTokenList.length > 0
        ? equipCostTokenList.length
        : upgrade.storageSlots && upgrade.storageSlots >= 2
        ? 2
        : vpValue);

    const shortEquipTokenLabel = (tax: IngredientTaxonomy): string => {
      switch (tax) {
        case 'grain': return 'GRAIN';
        case 'hops': return 'HOPS';
        case 'yeast': return 'YEAST';
        case 'chocolate': return 'CHOC';
        case 'spices': return 'SPICE';
        case 'fruit': return 'FRUIT';
        default: return (tax as string).toUpperCase();
      }
    };

    const isStorage = Boolean(upgrade.storageSlots && upgrade.storageSlots > 0);

    return (
      <ScaledCardContainer
        tuckEdge={tuckEdge}
        className={`transition-all duration-200 cursor-pointer shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/80 ${
          canInvest && isWorkDay ? 'ring-2 ring-amber-400 shadow-amber-500/30' : ''
        }`}
        style={{ borderRadius: 14 }}
        onClick={handleInspect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Click to inspect card (Full artwork & hardware specs)"
      >
        <div
          ref={cardRef}
          data-card-format="compact-vertical-2.25x3.5"
          className="parchment-card overflow-hidden flex flex-col justify-between p-1.5 sm:p-2 relative select-none"
          style={{
            width: CANONICAL_CARD_WIDTH,
            height: CANONICAL_CARD_HEIGHT,
            border: 'none',
            borderRadius: 14,
            containerType: 'inline-size',
            boxShadow: canInvest && isWorkDay
              ? '0 0 16px rgba(245, 158, 11, 0.35), 0 6px 20px rgba(0,0,0,0.8)'
              : '0 4px 16px rgba(0,0,0,0.6)',
          }}
        >
          {/* UPPER MODAL: FUNCTIONALITY (TOP OF EQUIPMENT) - Exact Symmetrical Proportions with Staff */}
          <div
            className="rounded-xl border border-amber-500/80 bg-gradient-to-b from-[#1E2533] via-[#161B26] to-[#0F131C] shrink-0 z-10 flex items-center shadow-[0_3px_8px_rgba(0,0,0,0.85)] relative overflow-hidden w-full"
            style={{
              minHeight: '28.0cqw',
              padding: '1.6cqw 1.8cqw',
              backgroundColor: 'rgba(18, 14, 11, 0.95)',
              border: `1.5px solid ${zoneTheme.badgeBorder}`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 8px rgba(0,0,0,0.8), 0 0 6px ${zoneTheme.glowColor}`,
            }}
          >
            {isStorage ? (
              /* Storage Upgrade: Detent on FAR LEFT, Detent on FAR RIGHT, Big Bold Storage type in center */
              (() => {
                const isDedicated = Boolean(upgrade.storageAllowedToken && upgrade.storageAllowedToken !== 'any');
                const dedicatedToken = upgrade.storageAllowedToken;
                const hasStored1 = Boolean(storedTokens && storedTokens[0]);
                const hasStored2 = Boolean(storedTokens && storedTokens[1]);

                return (
                  <div className="w-full flex items-center justify-between gap-1.5 px-0.5">
                    {/* Slot 1 on FAR LEFT */}
                    <div
                      className={`rounded-full flex items-center justify-center relative group shrink-0 transition-all ${
                        hasStored1
                          ? 'border-amber-400 bg-gradient-to-br from-amber-950/60 via-stone-900 to-black shadow-[0_0.4cqw_1cqw_rgba(0,0,0,0.7)] cursor-pointer'
                          : 'border-2 border-dashed border-amber-400/50 bg-black/70 shadow-[inset_0_0.6cqw_1.5cqw_rgba(0,0,0,0.95)]'
                      }`}
                      style={{
                        width: '17.0cqw',
                        height: '17.0cqw',
                        borderWidth: hasStored1 ? '0.45cqw' : '0.35cqw',
                      }}
                      title={hasStored1 ? `Stored ${storedTokens[0].toUpperCase()} token (Click to discard)` : isDedicated ? `Empty ${dedicatedToken.toUpperCase()} storage slot (0/2 stored)` : `Empty storage slot 1`}
                      onClick={hasStored1 && onDiscardToken ? (e) => { e.stopPropagation(); onDiscardToken(storedTokens[0]); } : undefined}
                    >
                      {/* When EMPTY: Clean recessed dashed slot with faint watermark */}
                      {!hasStored1 ? (
                        isDedicated ? (
                          <img
                            src={`/tokens/${dedicatedToken}-wood-piece.png`}
                            alt={dedicatedToken}
                            className="w-[66%] h-[66%] object-contain pointer-events-none opacity-20 grayscale brightness-75 select-none"
                          />
                        ) : (
                          <div className="w-3/5 h-3/5 rounded-full border border-dashed border-amber-400/40 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/30" />
                          </div>
                        )
                      ) : (
                        /* When OCCUPIED: Physical 3D wooden token sitting on top */
                        <div className="w-full h-full flex items-center justify-center relative transition-transform group-hover:scale-110 active:scale-95">
                          <img
                            src={`/tokens/${storedTokens[0]}-wood-piece.png`}
                            alt={storedTokens[0]}
                            className="w-[94%] h-[94%] object-contain filter drop-shadow-[0_0.6cqw_1.2cqw_rgba(0,0,0,0.95)]"
                          />
                          <div className="absolute -top-[0.8cqw] -right-[0.8cqw] w-[3.4cqw] h-[3.4cqw] rounded-full bg-emerald-400 border border-black shadow-[0_0_0.4cqw_rgba(52,211,153,0.8)]" title="Stored piece" />
                        </div>
                      )}
                    </div>

                    {/* Center: Large bold storage badge */}
                    <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-[0.5cqw] overflow-hidden">
                      <div
                        className="inline-flex flex-col items-center px-[2.6cqw] py-[0.5cqw] rounded-[0.8cqw] bg-gradient-to-b from-amber-950/90 to-stone-950/90 border border-amber-500/80 font-display font-black text-amber-200 uppercase tracking-wide drop-shadow-md text-center leading-tight max-w-full"
                      >
                        <span className="truncate max-w-full font-black text-amber-200 tracking-wide" style={{ fontSize: '4.8cqw' }}>
                          +2 {upgrade.storageAllowedToken ? upgrade.storageAllowedToken.toUpperCase() : 'ANY'}
                        </span>
                        <span className="font-sans font-black text-amber-400 tracking-widest mt-[0.2cqw]" style={{ fontSize: '3.4cqw', opacity: 0.95 }}>
                          STORAGE
                        </span>
                      </div>
                    </div>

                    {/* Slot 2 on FAR RIGHT */}
                    <div
                      className={`rounded-full flex items-center justify-center relative group shrink-0 transition-all ${
                        hasStored2
                          ? 'border-amber-400 bg-gradient-to-br from-amber-950/60 via-stone-900 to-black shadow-[0_0.4cqw_1cqw_rgba(0,0,0,0.7)] cursor-pointer'
                          : 'border-2 border-dashed border-amber-400/50 bg-black/70 shadow-[inset_0_0.6cqw_1.5cqw_rgba(0,0,0,0.95)]'
                      }`}
                      style={{
                        width: '17.0cqw',
                        height: '17.0cqw',
                        borderWidth: hasStored2 ? '0.45cqw' : '0.35cqw',
                      }}
                      title={hasStored2 ? `Stored ${storedTokens[1].toUpperCase()} token (Click to discard)` : isDedicated ? `Empty ${dedicatedToken.toUpperCase()} storage slot (0/2 stored)` : `Empty storage slot 2`}
                      onClick={hasStored2 && onDiscardToken ? (e) => { e.stopPropagation(); onDiscardToken(storedTokens[1]); } : undefined}
                    >
                      {/* When EMPTY: Clean recessed dashed slot with faint watermark */}
                      {!hasStored2 ? (
                        isDedicated ? (
                          <img
                            src={`/tokens/${dedicatedToken}-wood-piece.png`}
                            alt={dedicatedToken}
                            className="w-[66%] h-[66%] object-contain pointer-events-none opacity-20 grayscale brightness-75 select-none"
                          />
                        ) : (
                          <div className="w-3/5 h-3/5 rounded-full border border-dashed border-amber-400/40 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/30" />
                          </div>
                        )
                      ) : (
                        /* When OCCUPIED: Physical 3D wooden token sitting on top */
                        <div className="w-full h-full flex items-center justify-center relative transition-transform group-hover:scale-110 active:scale-95">
                          <img
                            src={`/tokens/${storedTokens[1]}-wood-piece.png`}
                            alt={storedTokens[1]}
                            className="w-[94%] h-[94%] object-contain filter drop-shadow-[0_0.6cqw_1.2cqw_rgba(0,0,0,0.95)]"
                          />
                          <div className="absolute -top-[0.8cqw] -right-[0.8cqw] w-[3.4cqw] h-[3.4cqw] rounded-full bg-emerald-400 border border-black shadow-[0_0_0.4cqw_rgba(52,211,153,0.8)]" title="Stored piece" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Non-Storage Upgrade: Headline & Rule Text on Left + Token Piece(s) on Right */
              <div className="w-full flex items-center justify-between gap-[1.8cqw] px-[0.5cqw] overflow-hidden">
                {/* Left: Headline & High-Legibility Rule Description */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-[0.35cqw]">
                  <div className="flex items-center">
                    <span
                      className="inline-block px-[1.6cqw] py-[0.35cqw] rounded-[0.6cqw] bg-amber-950/90 border border-amber-500/70 font-display font-black text-amber-300 uppercase drop-shadow-sm leading-none tracking-wide truncate max-w-full"
                      style={{ fontSize: '3.7cqw' }}
                    >
                      {visualInfo.headline}
                    </span>
                  </div>
                  <p
                    className="font-sans font-bold text-stone-100 leading-[1.24] line-clamp-3"
                    style={{ fontSize: '3.8cqw' }}
                    title={visualInfo.description}
                  >
                    {visualInfo.description}
                  </p>
                </div>

                {/* Right: Visual Token Piece(s) */}
                <div className="flex items-center gap-[1.2cqw] shrink-0 justify-end">
                  {visualInfo.isStacked ? (
                    <div
                      className="relative flex flex-col items-center justify-center gap-[0.3cqw] shrink-0 my-auto"
                      style={{ width: '9.0cqw' }}
                      title={visualInfo.tokens.map((t) => t.type.toUpperCase()).join(' OR ')}
                    >
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{ width: '8.2cqw', height: '8.2cqw' }}
                      >
                        <img
                          src={`/tokens/${visualInfo.tokens[0].type}-wood-piece.png`}
                          alt={visualInfo.tokens[0].type}
                          className="w-full h-full object-contain filter drop-shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.85)]"
                        />
                      </div>
                      {visualInfo.tokens[1] && (
                        <div
                          className="flex items-center justify-center shrink-0"
                          style={{ width: '8.2cqw', height: '8.2cqw' }}
                        >
                          <img
                            src={`/tokens/${visualInfo.tokens[1].type}-wood-piece.png`}
                            alt={visualInfo.tokens[1].type}
                            className="w-full h-full object-contain filter drop-shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.85)]"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    visualInfo.tokens.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center shrink-0 my-auto"
                        title={t.type.toUpperCase()}
                        style={{ width: '16.0cqw', height: '16.0cqw' }}
                      >
                        {t.type !== 'any' ? (
                          <img
                            src={`/tokens/${t.type}-wood-piece.png`}
                            alt={t.type}
                            className="w-full h-full object-contain filter drop-shadow-[0_0.4cqw_0.8cqw_rgba(0,0,0,0.9)]"
                          />
                        ) : (
                          <Sparkles
                            className="w-[88%] h-[88%] text-amber-300 filter drop-shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.9)]"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =============================================================
              CENTER CANVAS: HARDWARE MACHINERY ARTWORK
              Stretches cleanly between the top functionality box and bottom header bar
          ============================================================= */}
          <div className="relative w-full flex-1 min-h-0 rounded-xl overflow-hidden border border-amber-500/80 bg-[#0C0E14] shadow-lg my-1.5 flex items-center justify-center group">
            <img
              src={equipImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-sm opacity-35 scale-105 pointer-events-none"
            />
            <img
              src={equipImg}
              alt={upgrade.name}
              className="relative w-full h-full object-cover object-center pointer-events-none transition-transform duration-300 group-hover:scale-102 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] z-10"
            />
            {/* Inner gold foil border */}
            <div className="absolute inset-[0.8cqw] rounded-lg pointer-events-none z-20 border border-amber-400/25" />
          </div>

          {/* =============================================================
              LOWER BAR: COST (LEFT) • NAME & ZONE (CENTER) • VP (RIGHT)
              Anchors the bottom of the card; tokens only, zero numbers.
          ============================================================= */}
          <div
            className="rounded-xl border border-amber-500/80 bg-gradient-to-b from-[#1E2533] via-[#161B26] to-[#0F131C] shrink-0 z-10 flex items-center justify-between shadow-[0_3px_8px_rgba(0,0,0,0.85)] relative overflow-hidden w-full px-[0.8cqw] py-[0.6cqw]"
            style={{
              minHeight: '12.8cqw',
              backgroundColor: 'rgba(18, 14, 11, 0.95)',
              border: '1.5px solid rgba(217, 119, 6, 0.85)',
              boxShadow: 'inset 0 1px 0 rgba(254,240,138,0.35), 0 3px 8px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center justify-between w-full shrink-0 min-h-[14.0cqw] px-[0.4cqw]">
              {/* Left: Specific Ingredient Cost (Tokens ONLY - Zero Numbers) */}
              <div
                title={
                  equipCostTokenList.length > 0
                    ? `Cost: ${equipCostTokenList.map((t) => t.toUpperCase()).join(' + ')}`
                    : `Cost: ${requiredEquipTokens} of ANY ingredient token`
                }
                className="shrink-0"
              >
                {equipCostTokenList.length > 1 ? (
                  /* Multiple tokens side-by-side (NO NUMBERS) */
                  <div className="flex items-center justify-center gap-[0.4cqw] shrink-0">
                    {equipCostTokenList.map((tax, idx) => (
                      <img
                        key={idx}
                        src={`/tokens/${tax}-wood-piece.png`}
                        alt={tax}
                        style={{ width: '5.8cqw', height: '5.8cqw' }}
                        className="object-contain filter drop-shadow-[0_0.25cqw_0.5cqw_rgba(0,0,0,0.95)] shrink-0"
                      />
                    ))}
                  </div>
                ) : equipCostTokenList.length === 1 ? (
                  /* Single token piece (NO NUMBERS) */
                  <div className="flex items-center justify-center shrink-0">
                    <img
                      src={`/tokens/${equipCostTokenList[0]}-wood-piece.png`}
                      alt={equipCostTokenList[0]}
                      style={{ width: '8.4cqw', height: '8.4cqw' }}
                      className="object-contain filter drop-shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.95)] shrink-0"
                    />
                  </div>
                ) : (
                  /* Fallback ANY ingredient (NO NUMBERS) */
                  <div className="flex items-center justify-center gap-[0.4cqw] shrink-0">
                    {Array.from({ length: requiredEquipTokens || 1 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="rounded-full bg-gradient-to-tr from-amber-600 via-emerald-600 to-sky-600 border border-amber-300 flex items-center justify-center shadow-md shrink-0"
                        style={{ width: requiredEquipTokens > 1 ? '5.8cqw' : '8.0cqw', height: requiredEquipTokens > 1 ? '6.4cqw' : '8.0cqw' }}
                      >
                        <Sparkles className="w-[60%] h-[60%] text-white fill-white/40" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Center: Equipment Name & Zone */}
              <div className="flex-1 text-center min-w-0 px-[1.2cqw] flex flex-col items-center justify-center overflow-hidden">
                <span
                  className="font-display font-black text-stone-100 uppercase truncate max-w-full drop-shadow-md leading-tight"
                  style={{
                    fontSize:
                      upgrade.name.length >= 22
                        ? '3.3cqw'
                        : upgrade.name.length >= 18
                        ? '3.7cqw'
                        : upgrade.name.length >= 14
                        ? '4.3cqw'
                        : '5.0cqw',
                    letterSpacing: upgrade.name.length >= 18 ? '0.01em' : '0.035em',
                  }}
                  title={upgrade.name}
                >
                  {upgrade.name}
                </span>
                <span
                  className="inline-flex items-center justify-center font-display font-black uppercase tracking-wider px-[1.5cqw] py-[0.3cqw] rounded-[0.6cqw] border shadow-sm leading-none mt-[0.35cqw] max-w-full truncate"
                  style={{
                    fontSize: '2.8cqw',
                    backgroundColor: zoneTheme.badgeBg,
                    borderColor: zoneTheme.badgeBorder,
                    color: zoneTheme.textColor,
                    boxShadow: `0 1px 3px ${zoneTheme.glowColor}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                  }}
                  title={`Destination Department: ${zoneTheme.name} (Zone ${targetZoneId})`}
                >
                  {departmentName}
                </span>
              </div>

              {/* Right: Victory Points (Enlarged, Cleanly Unboxed, Same Size Font) */}
              <div
                className="flex items-baseline justify-center gap-[0.5cqw] shrink-0 whitespace-nowrap select-none"
                title={`${vpValue} Victory Point${vpValue > 1 ? 's' : ''}`}
              >
                <span
                  className="font-mono font-black leading-none text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontSize: '7.0cqw' }}
                >
                  {vpValue}
                </span>
                <span
                  className="font-display font-black uppercase tracking-wider text-amber-400 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontSize: '7.0cqw' }}
                >
                  VP
                </span>
              </div>
            </div>
          </div>
        </div>
      </ScaledCardContainer>
    );
  }

  // 4. DEDICATED STAFF CARD (Station #2 Market • 15 Unique Brewery Floor Staff Cards)
  if (upgrade.cardKind === 'staff' || (upgrade.staff && !upgrade.equipment && !upgrade.isUniversalWing)) {
    const targetZoneId = (upgrade.targetZone || upgrade.staff?.targetZone || 1) as ZoneId;
    const zoneTheme = ZONE_THEMES[targetZoneId] || ZONE_THEMES[1];
    const staffImg = upgrade.imagePath || getUpgradeImageSrc(targetZoneId, 'staff', upgrade.name);
    const effectText = upgrade.effectText || upgrade.staff?.effectText || '';
    const badgeText = upgrade.footerBadge || upgrade.headerBadge || upgrade.staff?.badge;
    const flavorText = upgrade.flavorText || upgrade.staff?.flavorText;
    const vpValue =
      upgrade.bonusEndgameVp ??
      (upgrade.installTokens
        ? Math.min(
            3,
            Object.entries(upgrade.installTokens).reduce((s, [k, v]) => {
              if (!v || k === 'any') return s;
              const weight = (k === 'chocolate' || k === 'spices' || k === 'fruit') ? 2 : 1;
              return s + v * weight;
            }, 0)
          ) || 1
        : 1);

    const departmentName = zoneTheme.name.toUpperCase();

    // Staff hiring cost: Specific ingredient tokens (tokens only, zero numbers)
    const specificStaffTokens: { taxonomy: IngredientTaxonomy; count: number }[] = [];
    const staffCostTokenList: IngredientTaxonomy[] = [];
    if (upgrade.installTokens) {
      for (const [k, v] of Object.entries(upgrade.installTokens)) {
        if (k !== 'any' && (v || 0) > 0) {
          specificStaffTokens.push({ taxonomy: k as IngredientTaxonomy, count: v as number });
          for (let i = 0; i < (v as number); i++) {
            staffCostTokenList.push(k as IngredientTaxonomy);
          }
        }
      }
    }

    const requiredStaffTokens =
      upgrade.installTokens?.any ||
      (staffCostTokenList.length > 0
        ? staffCostTokenList.length
        : upgrade.storageSlots && upgrade.storageSlots >= 2
        ? 2
        : vpValue);

    const shortStaffTokenLabel = (tax: IngredientTaxonomy): string => {
      switch (tax) {
        case 'grain': return 'GRAIN';
        case 'hops': return 'HOPS';
        case 'yeast': return 'YEAST';
        case 'chocolate': return 'CHOC';
        case 'spices': return 'SPICE';
        case 'fruit': return 'FRUIT';
        default: return (tax as string).toUpperCase();
      }
    };

    return (
      <ScaledCardContainer
        tuckEdge={tuckEdge}
        className={`transition-all duration-200 cursor-pointer shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/80 ${
          canInvest && isWorkDay ? 'ring-2 ring-emerald-400 shadow-emerald-500/30' : ''
        }`}
        style={{ borderRadius: 14 }}
        onClick={handleInspect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Click to inspect card (Full portrait & employee credentials)"
      >
        <div
          ref={cardRef}
          data-card-format="compact-vertical-2.25x3.5"
          className="parchment-card overflow-hidden flex flex-col justify-between p-1.5 sm:p-2 relative select-none"
          style={{
            width: CANONICAL_CARD_WIDTH,
            height: CANONICAL_CARD_HEIGHT,
            border: 'none',
            borderRadius: 14,
            containerType: 'inline-size',
            boxShadow: canInvest && isWorkDay
              ? '0 0 16px rgba(16, 185, 129, 0.35), 0 6px 20px rgba(0,0,0,0.8)'
              : '0 4px 16px rgba(0,0,0,0.6)',
          }}
        >
          {/* =============================================================
              UPPER BAR: COST (LEFT) • NAME & DEPT (CENTER) • VP (RIGHT)
              Sent to the top of staff cards per user request; tokens only, zero numbers.
          ============================================================= */}
          <div
            className="rounded-xl border border-emerald-500/80 bg-gradient-to-b from-[#183325] via-[#10241A] to-[#0A1610] shrink-0 z-10 flex items-center justify-between shadow-[0_3px_8px_rgba(0,0,0,0.85)] relative overflow-hidden w-full px-[0.8cqw] py-[0.6cqw]"
            style={{
              minHeight: '12.8cqw',
              backgroundColor: 'rgba(7, 25, 16, 0.95)',
              border: '1.5px solid rgba(16, 185, 129, 0.85)',
              boxShadow: 'inset 0 1px 0 rgba(167,243,208,0.35), 0 3px 8px rgba(0,0,0,0.8)',
            }}
          >
            <div className="flex items-center justify-between w-full shrink-0 min-h-[14.0cqw] px-[0.4cqw]">
              {/* Left: Specific Ingredient Hiring Cost (Tokens ONLY - Zero Numbers) */}
              <div
                title={
                  staffCostTokenList.length > 0
                    ? `Cost: ${staffCostTokenList.map((t) => t.toUpperCase()).join(' + ')}`
                    : `Cost: ${requiredStaffTokens} of ANY ingredient token`
                }
                className="shrink-0"
              >
                {staffCostTokenList.length > 1 ? (
                  /* Multiple tokens side-by-side (NO NUMBERS) */
                  <div className="flex items-center justify-center gap-[0.4cqw] shrink-0">
                    {staffCostTokenList.map((tax, idx) => (
                      <img
                        key={idx}
                        src={`/tokens/${tax}-wood-piece.png`}
                        alt={tax}
                        style={{ width: '5.8cqw', height: '5.8cqw' }}
                        className="object-contain filter drop-shadow-[0_0.25cqw_0.5cqw_rgba(0,0,0,0.95)] shrink-0"
                      />
                    ))}
                  </div>
                ) : staffCostTokenList.length === 1 ? (
                  /* Single token piece (NO NUMBERS) */
                  <div className="flex items-center justify-center shrink-0">
                    <img
                      src={`/tokens/${staffCostTokenList[0]}-wood-piece.png`}
                      alt={staffCostTokenList[0]}
                      style={{ width: '8.4cqw', height: '8.4cqw' }}
                      className="object-contain filter drop-shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.95)] shrink-0"
                    />
                  </div>
                ) : (
                  /* Fallback ANY ingredient (NO NUMBERS) */
                  <div className="flex items-center justify-center gap-[0.4cqw] shrink-0">
                    {Array.from({ length: requiredStaffTokens || 1 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="rounded-full bg-gradient-to-tr from-amber-600 via-emerald-600 to-sky-600 border border-emerald-300 flex items-center justify-center shadow-md shrink-0"
                        style={{ width: requiredStaffTokens > 1 ? '5.8cqw' : '8.0cqw', height: requiredStaffTokens > 1 ? '6.4cqw' : '8.0cqw' }}
                      >
                        <Sparkles className="w-[60%] h-[60%] text-white fill-white/40" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Center: Combined Staff Name & Department */}
              <div className="flex-1 text-center min-w-0 px-[1.2cqw] flex flex-col items-center justify-center overflow-hidden">
                <span
                  className="font-display font-black text-stone-100 uppercase truncate max-w-full drop-shadow-md leading-tight"
                  style={{
                    fontSize:
                      upgrade.name.length >= 22
                        ? '3.3cqw'
                        : upgrade.name.length >= 18
                        ? '3.7cqw'
                        : upgrade.name.length >= 14
                        ? '4.3cqw'
                        : '5.0cqw',
                    letterSpacing: upgrade.name.length >= 18 ? '0.01em' : '0.035em',
                  }}
                  title={upgrade.name}
                >
                  {upgrade.name}
                </span>
                <span
                  className="inline-flex items-center justify-center font-display font-black uppercase tracking-wider px-[1.5cqw] py-[0.3cqw] rounded-[0.6cqw] border shadow-sm leading-none mt-[0.35cqw] max-w-full truncate"
                  style={{
                    fontSize: '2.8cqw',
                    backgroundColor: zoneTheme.badgeBg,
                    borderColor: zoneTheme.badgeBorder,
                    color: zoneTheme.textColor,
                    boxShadow: `0 1px 3px ${zoneTheme.glowColor}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                  }}
                  title={`Destination Department: ${zoneTheme.name} (Zone ${targetZoneId})`}
                >
                  {departmentName}
                </span>
              </div>

              {/* Right: Victory Points (Enlarged, Cleanly Unboxed, Same Size Font) */}
              <div
                className="flex items-baseline justify-center gap-[0.5cqw] shrink-0 whitespace-nowrap select-none"
                title={`${vpValue} Victory Point${vpValue > 1 ? 's' : ''}`}
              >
                <span
                  className="font-mono font-black leading-none text-emerald-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontSize: '7.0cqw' }}
                >
                  {vpValue}
                </span>
                <span
                  className="font-display font-black uppercase tracking-wider text-emerald-300 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontSize: '7.0cqw' }}
                >
                  VP
                </span>
              </div>
            </div>
          </div>

          {/* =============================================================
              CENTER CANVAS: CHARACTER PORTRAIT ARTWORK
              Stretches cleanly between the top header bar and bottom functionality box
          ============================================================= */}
          <div className="relative w-full flex-1 min-h-0 rounded-xl overflow-hidden border border-emerald-500/80 bg-[#07120B] shadow-lg my-1.5 flex items-center justify-center group">
            <img
              src={staffImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-sm opacity-35 scale-105 pointer-events-none"
            />
            <img
              src={staffImg}
              alt={upgrade.name}
              className="relative w-full h-full object-cover object-top pointer-events-none transition-transform duration-300 group-hover:scale-102 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] z-10"
            />
            {/* Inner emerald foil border */}
            <div className="absolute inset-[0.8cqw] rounded-lg pointer-events-none z-20 border border-emerald-400/25" />
          </div>

          {/* =============================================================
              LOWER MODAL: FUNCTIONALITY (BOTTOM OF STAFF)
              Expanded & roomy container for storage detents or crew bonus effects.
          ============================================================= */}
          <div
            className="rounded-xl border border-emerald-500/80 bg-gradient-to-b from-[#183325] via-[#10241A] to-[#0A1610] shrink-0 z-10 flex items-center shadow-[0_3px_8px_rgba(0,0,0,0.85)] relative overflow-hidden w-full"
            style={{
              minHeight: '28.0cqw',
              padding: '1.6cqw 1.8cqw',
              backgroundColor: 'rgba(7, 25, 16, 0.95)',
              border: '1.5px solid rgba(16, 185, 129, 0.85)',
              boxShadow: 'inset 0 1px 0 rgba(167,243,208,0.35), 0 3px 8px rgba(0,0,0,0.8)',
            }}
          >
            {upgrade.storageSlots && upgrade.storageSlots > 0 ? (
              /* Storage Upgrade: Detent on FAR LEFT, Detent on FAR RIGHT, Big Bold Storage type in center */
              (() => {
                const isDedicated = Boolean(upgrade.storageAllowedToken && upgrade.storageAllowedToken !== 'any');
                const dedicatedToken = upgrade.storageAllowedToken;
                const hasStored1 = Boolean(storedTokens && storedTokens[0]);
                const hasStored2 = Boolean(storedTokens && storedTokens[1]);

                return (
                  <div className="w-full flex items-center justify-between gap-[1.5cqw] px-[0.5cqw] overflow-hidden">
                    {/* Slot 1 on FAR LEFT */}
                    <div
                      className={`rounded-full flex items-center justify-center relative group shrink-0 transition-all ${
                        hasStored1
                          ? 'border-emerald-400 bg-gradient-to-br from-emerald-950/60 via-stone-900 to-black shadow-[0_0.4cqw_1cqw_rgba(0,0,0,0.7)] cursor-pointer'
                          : 'border-2 border-dashed border-emerald-400/50 bg-black/70 shadow-[inset_0_0.6cqw_1.5cqw_rgba(0,0,0,0.95)]'
                      }`}
                      style={{
                        width: '17.0cqw',
                        height: '17.0cqw',
                        borderWidth: hasStored1 ? '0.45cqw' : '0.35cqw',
                      }}
                      title={hasStored1 ? `Stored ${storedTokens[0].toUpperCase()} token (Click to discard)` : isDedicated ? `Empty ${dedicatedToken.toUpperCase()} storage slot (0/2 stored)` : `Empty storage slot 1`}
                      onClick={hasStored1 && onDiscardToken ? (e) => { e.stopPropagation(); onDiscardToken(storedTokens[0]); } : undefined}
                    >
                      {/* When EMPTY: Clean recessed dashed slot with faint watermark */}
                      {!hasStored1 ? (
                        isDedicated ? (
                          <img
                            src={`/tokens/${dedicatedToken}-wood-piece.png`}
                            alt={dedicatedToken}
                            className="w-[66%] h-[66%] object-contain pointer-events-none opacity-20 grayscale brightness-75 select-none"
                          />
                        ) : (
                          <div className="w-3/5 h-3/5 rounded-full border border-dashed border-emerald-400/40 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/30" />
                          </div>
                        )
                      ) : (
                        /* When OCCUPIED: Physical 3D wooden token sitting on top */
                        <div className="w-full h-full flex items-center justify-center relative transition-transform group-hover:scale-110 active:scale-95">
                          <img
                            src={`/tokens/${storedTokens[0]}-wood-piece.png`}
                            alt={storedTokens[0]}
                            className="w-[94%] h-[94%] object-contain filter drop-shadow-[0_0.6cqw_1.2cqw_rgba(0,0,0,0.95)]"
                          />
                          <div className="absolute -top-[0.8cqw] -right-[0.8cqw] w-[3.4cqw] h-[3.4cqw] rounded-full bg-emerald-400 border border-black shadow-[0_0_0.4cqw_rgba(52,211,153,0.8)]" title="Stored piece" />
                        </div>
                      )}
                    </div>

                    {/* Center: Large bold storage badge */}
                    <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-[0.5cqw] overflow-hidden">
                      <div
                        className="inline-flex flex-col items-center px-[2.6cqw] py-[0.5cqw] rounded-[0.8cqw] bg-gradient-to-b from-emerald-950/90 to-stone-950/90 border border-emerald-500/80 font-display font-black text-emerald-200 uppercase tracking-wide drop-shadow-md text-center leading-tight max-w-full"
                      >
                        <span className="truncate max-w-full font-black text-emerald-200 tracking-wide" style={{ fontSize: '4.8cqw' }}>
                          +2 {upgrade.storageAllowedToken ? upgrade.storageAllowedToken.toUpperCase() : 'ANY'}
                        </span>
                        <span className="font-sans font-black text-emerald-400 tracking-widest mt-[0.2cqw]" style={{ fontSize: '3.4cqw', opacity: 0.95 }}>
                          STORAGE
                        </span>
                      </div>
                    </div>

                    {/* Slot 2 on FAR RIGHT */}
                    <div
                      className={`rounded-full flex items-center justify-center relative group shrink-0 transition-all ${
                        hasStored2
                          ? 'border-emerald-400 bg-gradient-to-br from-emerald-950/60 via-stone-900 to-black shadow-[0_0.4cqw_1cqw_rgba(0,0,0,0.7)] cursor-pointer'
                          : 'border-2 border-dashed border-emerald-400/50 bg-black/70 shadow-[inset_0_0.6cqw_1.5cqw_rgba(0,0,0,0.95)]'
                      }`}
                      style={{
                        width: '17.0cqw',
                        height: '17.0cqw',
                        borderWidth: hasStored2 ? '0.45cqw' : '0.35cqw',
                      }}
                      title={hasStored2 ? `Stored ${storedTokens[1].toUpperCase()} token (Click to discard)` : isDedicated ? `Empty ${dedicatedToken.toUpperCase()} storage slot (0/2 stored)` : `Empty storage slot 2`}
                      onClick={hasStored2 && onDiscardToken ? (e) => { e.stopPropagation(); onDiscardToken(storedTokens[1]); } : undefined}
                    >
                      {/* When EMPTY: Clean recessed dashed slot with faint watermark */}
                      {!hasStored2 ? (
                        isDedicated ? (
                          <img
                            src={`/tokens/${dedicatedToken}-wood-piece.png`}
                            alt={dedicatedToken}
                            className="w-[66%] h-[66%] object-contain pointer-events-none opacity-20 grayscale brightness-75 select-none"
                          />
                        ) : (
                          <div className="w-3/5 h-3/5 rounded-full border border-dashed border-emerald-400/40 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/30" />
                          </div>
                        )
                      ) : (
                        /* When OCCUPIED: Physical 3D wooden token sitting on top */
                        <div className="w-full h-full flex items-center justify-center relative transition-transform group-hover:scale-110 active:scale-95">
                          <img
                            src={`/tokens/${storedTokens[1]}-wood-piece.png`}
                            alt={storedTokens[1]}
                            className="w-[94%] h-[94%] object-contain filter drop-shadow-[0_0.6cqw_1.2cqw_rgba(0,0,0,0.95)]"
                          />
                          <div className="absolute -top-[0.8cqw] -right-[0.8cqw] w-[3.4cqw] h-[3.4cqw] rounded-full bg-emerald-400 border border-black shadow-[0_0_0.4cqw_rgba(52,211,153,0.8)]" title="Stored piece" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Crew Bonus: Headline & Rule Text on Left + Token Piece(s) on Right */
              <div className="w-full flex items-center justify-between gap-[1.8cqw] px-[0.5cqw] overflow-hidden">
                {/* Left: Headline & High-Legibility Rule Description */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-[0.35cqw]">
                  <div className="flex items-center">
                    <span
                      className="inline-block px-[1.6cqw] py-[0.35cqw] rounded-[0.6cqw] bg-emerald-950/90 border border-emerald-500/70 font-display font-black text-emerald-300 uppercase drop-shadow-sm leading-none tracking-wide truncate max-w-full"
                      style={{ fontSize: '3.7cqw' }}
                    >
                      {visualInfo.headline}
                    </span>
                  </div>
                  <p
                    className="font-sans font-bold text-stone-100 leading-[1.24] line-clamp-3"
                    style={{ fontSize: '3.8cqw' }}
                    title={visualInfo.description}
                  >
                    {visualInfo.description}
                  </p>
                </div>

                {/* Right: Visual Token Piece(s) */}
                <div className="flex items-center gap-[1.2cqw] shrink-0 justify-end">
                  {visualInfo.isStacked ? (
                    <div
                      className="relative flex flex-col items-center justify-center gap-[0.3cqw] shrink-0 my-auto p-[0.4cqw] rounded-[1cqw] bg-stone-950/80 border border-stone-600/70 shadow-md"
                      style={{ width: '9.0cqw' }}
                      title={visualInfo.tokens.map((t) => t.type.toUpperCase()).join(' OR ')}
                    >
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{ width: '8.2cqw', height: '8.2cqw' }}
                      >
                        <img
                          src={`/tokens/${visualInfo.tokens[0].type}-wood-piece.png`}
                          alt={visualInfo.tokens[0].type}
                          className="w-full h-full object-contain filter drop-shadow-[0_0.2cqw_0.4cqw_rgba(0,0,0,0.8)]"
                        />
                      </div>
                      {visualInfo.tokens[1] && (
                        <div
                          className="flex items-center justify-center shrink-0"
                          style={{ width: '8.2cqw', height: '8.2cqw' }}
                        >
                          <img
                            src={`/tokens/${visualInfo.tokens[1].type}-wood-piece.png`}
                            alt={visualInfo.tokens[1].type}
                            className="w-full h-full object-contain filter drop-shadow-[0_0.2cqw_0.4cqw_rgba(0,0,0,0.8)]"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    visualInfo.tokens.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center shrink-0 my-auto"
                        title={t.type.toUpperCase()}
                        style={{ width: '16.0cqw', height: '16.0cqw' }}
                      >
                        {t.type !== 'any' ? (
                          <img
                            src={`/tokens/${t.type}-wood-piece.png`}
                            alt={t.type}
                            className="w-full h-full object-contain filter drop-shadow-[0_0.4cqw_0.8cqw_rgba(0,0,0,0.9)]"
                          />
                        ) : (
                          <Sparkles
                            className="w-[88%] h-[88%] text-emerald-300 filter drop-shadow-[0_0.3cqw_0.6cqw_rgba(0,0,0,0.9)]"
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScaledCardContainer>
    );
  }

  // 5. Fallback Legacy Layout
  const isEquipment = upgrade.upgradeType === 'equipment';
  const targetZoneId = (upgrade.targetZone || 1) as ZoneId;
  const fallbackZoneTheme = ZONE_THEMES[targetZoneId] || ZONE_THEMES[1];
  const costStatuses = unifiedCostStatuses;

  return (
    <div
      data-card-format="compact-vertical-2.25x3.5"
      className={`rounded-2xl overflow-hidden w-full aspect-[9/14] flex flex-col justify-between transition-all duration-200 relative ${
        canInvest && isWorkDay ? 'ring-3 ring-amber-400 -translate-y-1' : 'hover:-translate-y-0.5'
      }`}
      style={
        isEquipment
          ? {
              backgroundColor: '#1A1E26',
              backgroundImage: 'linear-gradient(175deg, #252A34 0%, #1A1E26 45%, #101318 100%)',
              border: 'none',
            }
          : {
              backgroundColor: '#F7F3EB',
              backgroundImage: 'linear-gradient(165deg, #FFFDF8 0%, #F7F3EB 55%, #EFE7DA 100%)',
              border: 'none',
            }
      }
    >
      <div className="px-2.5 py-1.5 shrink-0 bg-stone-900 border-b border-amber-500/40 flex items-center justify-between">
        <h3 className="font-display font-extrabold text-[12px] text-amber-100 truncate">
          {upgrade.name}
        </h3>
        <span
          className="text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded border"
          style={{
            backgroundColor: fallbackZoneTheme.badgeBg,
            borderColor: fallbackZoneTheme.badgeBorder,
            color: fallbackZoneTheme.textColor,
          }}
        >
          {fallbackZoneTheme.name}
        </span>
      </div>

      <div className="p-2 flex-1 flex flex-col justify-between gap-1">
        <p className="text-[9.5px] font-sans font-bold leading-tight text-stone-200">
          {upgrade.effectText}
        </p>
        <div className="space-y-1 pt-1 border-t border-stone-700">
          <div className="flex flex-wrap gap-1">
            {costStatuses.map((item, idx) => (
              <span key={`fallback-cost-${idx}`} className="text-[7.5px] font-sans font-bold px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                {CATEGORY_METADATA[item.category]?.label || item.category}
              </span>
            ))}
          </div>
          {onInvest && (
            <button
              type="button"
              onClick={() => onInvest(isEquipment ? 'equipment' : 'staff')}
              disabled={!isWorkDay || !canInvest}
              className={`w-full py-1 px-2 rounded font-display font-extrabold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 ${
                isWorkDay && canInvest ? 'copper-bevel-btn' : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>{isWorkDay && canInvest ? 'Invest & Install' : investDisabledReason || 'Need Ingredients'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// ============================================================================
// DECK 2: INGREDIENT CARDS (100 CARDS) — REALISTIC & TACTILE APOTHECARY FORMAT (5 : 7 | 2.5" x 3.5")
// Heavyweight #F8F5EE Linen Paper with Organic Pulp Flecks • Thin Metallic Foil Category Badges
// Realistic Botanical Engravings • Vintage Serif Typography & Gold-Foil Apothecary Labels
// ============================================================================

export interface IngredientCardViewProps {
  card: IngredientCard;
  selected?: boolean;
  selectionBadge?: string;
  disabled?: boolean;
  onClick?: () => void;
  compact?: boolean;
  conveyorRailMode?: boolean;
  disableInspectTrigger?: boolean;
}

export const IngredientCardView: React.FC<IngredientCardViewProps> = ({
  card,
  selected = false,
  selectionBadge,
  disabled = false,
  onClick,
  disableInspectTrigger = false,
}) => {
  const meta = INGREDIENT_METADATA[card.subtype];
  const catMeta = CATEGORY_METADATA[card.category];
  const theme = getBotanicalIngredientTheme(card.category, card.subtype);
  const taxKey = card.taxonomy || (card.category === 'hops' ? 'hops' : card.category === 'yeast' ? 'yeast' : 'grain');
  const taxMeta = TAXONOMY_METADATA[taxKey] || TAXONOMY_METADATA.grain;
  const vpVal = card.vpValue || taxMeta.vp;
  const { inspectCard, setHoveredCard } = useCardInspector();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleInspect = (e?: React.MouseEvent) => {
    if (disableInspectTrigger) return;
    if (e) e.stopPropagation();
    inspectCard({
      type: 'ingredient',
      card,
      selected,
      onSelect: onClick,
    });
  };

  const handleMouseEnter = () => {
    if (disableInspectTrigger || !cardRef.current) return;
    setHoveredCard(
      {
        type: 'ingredient',
        card,
        selected,
        onSelect: onClick,
      },
      cardRef.current.getBoundingClientRect()
    );
  };

  const handleMouseLeave = () => {
    if (disableInspectTrigger) return;
    setHoveredCard(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !disabled) {
      onClick();
    } else if (!disabled && !disableInspectTrigger) {
      handleInspect(e);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-card-format="compact-vertical-2.25x3.5"
      onClick={handleClick}
      className={`relative overflow-hidden transition-all duration-150 select-none flex flex-col justify-between aspect-[9/14] rounded-xl ${
        selected
          ? 'ring-3 ring-amber-400 -translate-y-1 shadow-2xl shadow-amber-500/40 z-10'
          : 'hover:-translate-y-0.5'
      } ${!disabled && (onClick || !disableInspectTrigger) ? 'cursor-pointer' : ''} ${
        disabled ? 'opacity-55 cursor-not-allowed' : ''
      }`}
      style={{
        backgroundColor: '#F8F5EE',
        backgroundImage: `
          radial-gradient(rgba(92, 68, 44, 0.14) 0.75px, transparent 0.75px),
          radial-gradient(rgba(139, 108, 66, 0.1) 0.6px, transparent 0.6px),
          repeating-linear-gradient(0deg, rgba(120, 95, 65, 0.028) 0px, rgba(120, 95, 65, 0.028) 1px, transparent 1px, transparent 3px),
          repeating-linear-gradient(90deg, rgba(120, 95, 65, 0.022) 0px, rgba(120, 95, 65, 0.022) 1px, transparent 1px, transparent 4px),
          linear-gradient(160deg, #FBF9F4 0%, #F8F5EE 52%, #EFE9DC 100%)
        `,
        backgroundSize: '14px 14px, 21px 21px, 100% 3px, 4px 100%, 100% 100%',
        backgroundPosition: '0 0, 7px 9px, 0 0, 0 0, 0 0',
        border: `2px solid ${theme.borderHex}`,
        boxShadow: selected
          ? `0 0 0 2px #FBBF24, 0 12px 24px rgba(0,0,0,0.6)`
          : `inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(92,68,44,0.25), inset 0 0 0 2.5px #F8F5EE, inset 0 0 0 3.5px ${theme.foilHex}85, 0 8px 18px -2px rgba(10,7,5,0.62), 0 3px 6px rgba(0,0,0,0.4)`,
      }}
    >
      {selectionBadge && (
        <div className="absolute top-2 right-1.5 z-20 px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-display font-black text-[8.5px] uppercase tracking-wider shadow-md border border-amber-700">
          {selectionBadge}
        </div>
      )}

      {/* Quick Enlarge / Inspect Button */}
      {!disableInspectTrigger && (
        <button
          type="button"
          onClick={handleInspect}
          className="absolute top-1.5 right-1.5 z-30 w-4 h-4 rounded-full bg-stone-950/70 hover:bg-amber-400 text-stone-300 hover:text-stone-950 border border-amber-500/60 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-70 hover:opacity-100 hover:scale-110"
          title="Click to expand card (Read botanical profile)"
        >
          <Maximize2 className="w-2.5 h-2.5" />
        </button>
      )}

      {/* TOP APOTHECARY HEADER: 6-Color System Taxonomy Badge & Title */}
      <div
        className="px-2 pt-1.5 pb-1 shrink-0 relative"
        style={{
          borderBottom: `1px solid ${theme.foilHex}88`,
          background:
            'linear-gradient(180deg, rgba(255,253,248,0.75) 0%, rgba(244,238,225,0.55) 100%)',
        }}
      >
        {/* Top Row: 6-Color System Taxonomy Badge (Gold Grain, Green Hops, Cream Yeast, Purple Fruit, Red Spices, Dark Brown Chocolate) + VP Seal */}
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[7.5px] font-display font-black uppercase tracking-[0.1em] leading-none shadow-xs"
            style={{
              backgroundColor: taxMeta.badgeBg,
              color: taxMeta.textColor,
              border: `1px solid ${taxMeta.color}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.22)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: taxMeta.color }}
            />
            <span className="truncate">{taxMeta.label}</span>
          </span>

          {/* 1 VP / 2 VP Wax/Brass Seal */}
          <div
            className="px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0"
            style={{
              background:
                vpVal === 2
                  ? 'linear-gradient(135deg, #7E22CE 0%, #4C1D95 100%)'
                  : 'radial-gradient(circle at 32% 32%, #FEF9C3 0%, #D4AF37 58%, #85581A 100%)',
              color: vpVal === 2 ? '#FAF5FF' : '#2A1808',
              border: `1px solid ${vpVal === 2 ? '#C084FC' : theme.borderHex}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.28)',
            }}
            title={`${taxMeta.type === 'specialty' ? 'Specialty Ingredient' : 'Core Staple'} • ${vpVal} VP`}
          >
            <span className="font-mono font-black text-[8px] leading-none">{vpVal}</span>
            <span className="font-display font-black text-[8px] uppercase leading-none opacity-90">VP</span>
          </div>
        </div>

        {/* Classic Vintage Serif Ingredient Name */}
        <h4
          className="font-display font-bold text-[11px] leading-tight truncate tracking-tight"
          style={{
            color: theme.inkHex,
            textShadow: '0 0.5px 0 rgba(255,255,255,0.85)',
          }}
          title={card.name}
        >
          {card.name}
        </h4>
      </div>

      {/* CENTER BOTANICAL ENGRAVING / MACRO ILLUSTRATION PLATE */}
      <div className="px-1.5 py-1 flex-1 min-h-0 flex flex-col justify-between gap-1">
        <BotanicalIngredientArtSVG
          subtype={card.subtype}
          category={card.category}
        />

        {/* BOTTOM REFINED APOTHECARY LABEL PLATE */}
        <div
          className="rounded-sm px-1.5 py-1 flex items-center justify-between gap-1 shrink-0 relative"
          style={{
            background:
              'linear-gradient(180deg, #FBF8F1 0%, #F2EBDC 100%)',
            border: `1px solid ${theme.borderHex}99`,
            boxShadow: `inset 0 0 0 1px ${theme.foilHex}66, 0 1px 2px rgba(42,30,18,0.14)`,
          }}
        >
          <div className="flex items-center gap-1 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: theme.foilBadgeGradient,
                color: theme.borderHex,
                border: `0.75px solid ${theme.foilBadgeBorderHex}`,
              }}
            >
              <IngredientVectorIcon subtype={taxKey} className="w-2.5 h-2.5 shrink-0" />
            </span>
            <div className="min-w-0 leading-none">
              <div
                className="font-display font-bold text-[8px] tracking-wide truncate"
                style={{ color: theme.inkHex }}
              >
                {meta?.shortLabel || card.name}
              </div>
              <div
                className="font-serif italic text-[6.5px] truncate mt-0.5"
                style={{ color: theme.mutedInkHex }}
              >
                {theme.apothecaryGrade}
              </div>
            </div>
          </div>

          <span
            className="px-1.5 py-0.5 rounded text-[7px] font-sans font-black uppercase tracking-wider shrink-0"
            style={{
              background: SUBTYPE_VISUALS[taxKey]?.bgGradient || theme.foilBadgeGradient,
              color: SUBTYPE_VISUALS[taxKey]?.textColor || '#FEF3C7',
              border: `1px solid ${taxMeta.color}80`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
            }}
          >
            Fulfills [{taxMeta.label}]
          </span>
        </div>
      </div>
    </div>
  );
};

export const ZONE_METADATA: Record<
  ZoneId,
  {
    name: string;
    subtitle: string;
    badgeCode: string;
    ruleText: string;
    primaryBg: string;
    secondaryBg: string;
    accentHex: string;
    borderHex: string;
    headerGradient: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  1: {
    name: 'Warehouse',
    subtitle: 'Raw Storage & 8-Token Limit',
    badgeCode: 'ZONE 1',
    ruleText: 'Starting storage space where your 8-token limit applies. Upgrades here boost warehouse capacity and sourcing efficiency.',
    primaryBg: '#2D180A',
    secondaryBg: '#180E06',
    accentHex: '#F59E0B',
    borderHex: '#D97706',
    headerGradient: 'linear-gradient(135deg, #3D2210 0%, #201108 100%)',
    icon: Warehouse,
  },
  2: {
    name: 'Brewhouse',
    subtitle: 'Hot Side & Active Brewing',
    badgeCode: 'ZONE 2',
    ruleText: 'The authentic hot side where tokens are spent and recipes begin. Wort advances during shift conveyor operations.',
    primaryBg: '#351608',
    secondaryBg: '#1D0A03',
    accentHex: '#F97316',
    borderHex: '#EA580C',
    headerGradient: 'linear-gradient(135deg, #441A09 0%, #220B03 100%)',
    icon: Flame,
  },
  3: {
    name: 'Fermentation',
    subtitle: 'Primary Liquid Stage',
    badgeCode: 'ZONE 3',
    ruleText: 'The universally recognized first stage of the liquid brewing process in stainless unitanks. Advances to Conditioning during shift conveyor operations.',
    primaryBg: '#0F1D2F',
    secondaryBg: '#09101B',
    accentHex: '#38BDF8',
    borderHex: '#0284C7',
    headerGradient: 'linear-gradient(135deg, #13243A 0%, #0A1420 100%)',
    icon: FlaskConical,
  },
  4: {
    name: 'Conditioning',
    subtitle: 'Resting, Clearing & Chilling',
    badgeCode: 'ZONE 4',
    ruleText: 'Mechanically resting, clearing, and chilling. Slides to Packaging during shift conveyor operations.',
    primaryBg: '#0C2028',
    secondaryBg: '#061318',
    accentHex: '#06B6D4',
    borderHex: '#0891B2',
    headerGradient: 'linear-gradient(135deg, #0E2A35 0%, #081A20 100%)',
    icon: Snowflake,
  },
  5: {
    name: 'Packaging',
    subtitle: 'Final Assembly & Scoring',
    badgeCode: 'ZONE 5',
    ruleText: 'The clear, satisfying final zone that signals the end of the assembly line and the scoring of victory points.',
    primaryBg: '#0F291E',
    secondaryBg: '#081711',
    accentHex: '#34D399',
    borderHex: '#059669',
    headerGradient: 'linear-gradient(135deg, #143527 0%, #0A1E16 100%)',
    icon: Truck,
  },
};

export interface ZoneCardViewProps {
  zoneId: ZoneId;
  playerIndex?: number;
  playerTokens?: Partial<Record<IngredientTaxonomy, number>>;
  warehouseCapacity?: number;
  stats?: {
    handLimit?: number;
    currentHandCount?: number;
    sourceDraws?: number;
    freeSkips?: number;
    kettleCapacity?: number;
    carboyCapacity?: number;
    currentBatchesCount?: number;
    targetBatches?: number;
  };
  onClick?: () => void;
  onDiscardToken?: (taxonomy: IngredientTaxonomy) => void;
  className?: string;
  panoramicMat?: boolean;
}

export const ZoneCardView: React.FC<ZoneCardViewProps> = ({
  zoneId,
  playerTokens,
  warehouseCapacity: customWarehouseCapacity,
  stats,
  onClick,
  onDiscardToken,
  className = '',
  panoramicMat = false,
}) => {
  const meta = ZONE_METADATA[zoneId];
  const Icon = meta.icon;

  const handLimit = stats?.handLimit ?? 6;
  const currentHandCount = stats?.currentHandCount ?? 0;
  const sourceDraws = stats?.sourceDraws ?? 2;
  const freeSkips = stats?.freeSkips ?? 0;
  const kettleCapacity = stats?.kettleCapacity ?? 1;
  const carboyCapacity = stats?.carboyCapacity ?? 1;
  const currentBatchesCount = stats?.currentBatchesCount ?? 0;
  const targetBatches = stats?.targetBatches ?? 6;

  const warehouseCapacity = customWarehouseCapacity ?? 6;
  const currentTokens = playerTokens ?? { grain: 0, hops: 0, yeast: 0, fruit: 0, spices: 0, chocolate: 0 };

  const TAX_ORDER: IngredientTaxonomy[] = ['grain', 'hops', 'yeast', 'fruit', 'spices', 'chocolate'];
  const expandedTokens: IngredientTaxonomy[] = [];
  for (const tax of TAX_ORDER) {
    const count = currentTokens[tax] || 0;
    for (let i = 0; i < count; i++) {
      expandedTokens.push(tax);
    }
  }
  const totalStoredTokens = expandedTokens.length;

  const imageSrc =
    zoneId === 1
      ? '/zones/zone-1-grain-warehouse.jpg'
      : zoneId === 2
      ? '/zones/zone-2-brewhouse.jpg'
      : zoneId === 3
      ? '/zones/zone-3-cellar.jpg'
      : zoneId === 4
      ? '/zones/zone-4-conditioning.jpg'
      : '/zones/zone-5-dock.jpg';

  return (
    <div
      data-card-format="compact-vertical-2.25x3.5"
      onClick={onClick}
      className={`group relative w-full aspect-[9/14] rounded-2xl overflow-hidden shadow-2xl select-none transition-all duration-200 ${
        panoramicMat
          ? 'border-2 border-dashed border-amber-400/50 bg-black/25 backdrop-blur-[1px] hover:border-amber-300/80 hover:bg-black/15'
          : 'border-2'
      } ${className}`}
      style={{
        backgroundColor: panoramicMat ? 'transparent' : '#1E140E',
        borderColor: panoramicMat ? undefined : meta.borderHex,
        boxShadow: panoramicMat
          ? 'inset 0 0 16px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.5)'
          : `0 8px 24px rgba(0,0,0,0.7), inset 0 0 0 1px ${meta.accentHex}40`,
      }}
    >
      {/* 1. ENVIRONMENTAL BREWERY ARTWORK OR ZONE 1 WAREHOUSE STORAGE FLOOR */}
      {zoneId === 1 ? (
        <div className="absolute inset-x-1.5 top-7 bottom-7 z-10 flex flex-col justify-between py-1">
          {/* Warehouse Detent Shelves (Holds physical wooden 3D tokens) */}
          <div
            className={`grid gap-1 p-1 rounded-xl border bg-black/65 backdrop-blur-[2px] shadow-inner items-center justify-items-center flex-1 ${
              totalStoredTokens > warehouseCapacity
                ? 'border-amber-400/60 shadow-amber-950/30'
                : 'border-amber-500/40'
            } ${
              Math.max(warehouseCapacity, totalStoredTokens) <= 6 ? 'grid-cols-3 grid-rows-2' : 'grid-cols-3 grid-rows-3'
            }`}
          >
            {Array.from({ length: Math.max(warehouseCapacity, totalStoredTokens) }).map((_, idx) => {
              const hasToken = idx < expandedTokens.length;
              const tokenType = hasToken ? expandedTokens[idx] : null;
              const isOverCapSlot = idx >= warehouseCapacity;

              if (tokenType) {
                const tokenMeta = WOODEN_TOKEN_COLORS[tokenType];
                return (
                  <div
                    key={`wh-detent-${idx}`}
                    onClick={(e) => {
                      if (onDiscardToken) {
                        e.stopPropagation();
                        onDiscardToken(tokenType);
                      }
                    }}
                    className={`relative w-full aspect-square max-w-[42px] max-h-[42px] rounded-lg bg-gradient-to-br from-amber-950/70 via-stone-900 to-black/90 border shadow-lg flex items-center justify-center p-0.5 group/piece transition-all hover:scale-105 cursor-pointer ${
                      isOverCapSlot
                        ? 'border-red-400/90 ring-2 ring-red-400/60 animate-pulse'
                        : 'border-amber-500/60 hover:border-amber-300'
                    }`}
                    title={
                      isOverCapSlot
                        ? `${tokenMeta.label} Wooden Piece (${tokenMeta.description}). Action Required: Click to return to Central Hopper`
                        : `${tokenMeta.label} Wooden Piece (${tokenMeta.description}). Click to return to Central Hopper`
                    }
                  >
                    {/* Recessed detent ring */}
                    <div className="absolute inset-0.5 rounded-md border border-amber-400/25 pointer-events-none" />
                    <img
                      src={`/tokens/${tokenType}-wood-piece.png`}
                      alt={tokenMeta.label}
                      className="w-full h-full object-contain filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] pointer-events-none"
                    />
                  </div>
                );
              }

              return (
                <div
                  key={`wh-detent-${idx}`}
                  className="relative w-full aspect-square max-w-[42px] max-h-[42px] rounded-lg border border-dashed border-amber-500/30 bg-black/30 flex flex-col items-center justify-center shadow-inner"
                  title={`Empty Warehouse Storage Detent (${idx + 1}/${warehouseCapacity})`}
                >
                  <div className="w-3.5 h-3.5 rounded-full border border-dashed border-amber-400/35 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-amber-400/25" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact inventory summary chips at bottom */}
          {totalStoredTokens > 0 && (
            <div className="flex items-center justify-center gap-1 mt-1 px-0.5 flex-wrap">
              {TAX_ORDER.filter((tax) => (currentTokens[tax] || 0) > 0).map((tax) => {
                const count = currentTokens[tax] || 0;
                const tokenMeta = WOODEN_TOKEN_COLORS[tax];
                return (
                  <span
                    key={`wh-chip-${tax}`}
                    className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-black/80 border border-amber-500/40 text-[7.5px] font-mono text-amber-200 shadow-sm"
                    title={`${tokenMeta.label}: ${count} stored`}
                  >
                    <img
                      src={`/tokens/${tax}-wood-piece.png`}
                      alt={tax}
                      className="w-2.5 h-2.5 object-contain inline-block"
                    />
                    <span className="font-bold">{count}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ) : !panoramicMat ? (
        <>
          <img
            src={imageSrc}
            alt={meta.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.dataset.triedRelative) {
                target.dataset.triedRelative = 'true';
                target.src = `.${imageSrc}`;
              }
            }}
          />
          {/* Atmospheric Vignette & Contrast Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/15 to-black/85 pointer-events-none" />
          <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/20 rounded-2xl pointer-events-none" />
        </>
      ) : (
        /* Subtle center watermark when transparently framing the panoramic mat */
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity">
          <Icon className="w-12 h-12 text-amber-300 mb-1" />
          <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-amber-200">
            {zoneId === 2 && 'Empty Kettle'}
            {zoneId === 3 && 'Conical Cellar'}
            {zoneId === 4 && 'Dock Staging'}
          </span>
        </div>
      )}

      {/* 4 Corner Brass Rivets with Specular Highlights */}
      <div className="absolute top-1.5 left-1.5 z-30 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 border border-stone-900 shadow-sm flex items-center justify-center pointer-events-none">
        <div className="w-0.5 h-0.5 rounded-full bg-amber-100" />
      </div>
      <div className="absolute top-1.5 right-1.5 z-30 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 border border-stone-900 shadow-sm flex items-center justify-center pointer-events-none">
        <div className="w-0.5 h-0.5 rounded-full bg-amber-100" />
      </div>
      <div className="absolute bottom-1.5 left-1.5 z-30 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 border border-stone-900 shadow-sm flex items-center justify-center pointer-events-none">
        <div className="w-0.5 h-0.5 rounded-full bg-amber-100" />
      </div>
      <div className="absolute bottom-1.5 right-1.5 z-30 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-900 border border-stone-900 shadow-sm flex items-center justify-center pointer-events-none">
        <div className="w-0.5 h-0.5 rounded-full bg-amber-100" />
      </div>

      {/* TOP FLOATING PILL: Station Badge & Live Capacity (Floating cleanly between rivets) */}
      <div className="absolute top-1.5 inset-x-2 z-20 px-1.5 py-0.5 rounded-lg bg-black/90 backdrop-blur-[2px] border border-amber-500/50 shadow-lg flex items-center justify-between gap-1 text-[7.5px] font-mono font-bold pointer-events-none">
        <span
          className="flex items-center gap-1 font-mono font-black text-[7.5px] uppercase tracking-wider shrink-0"
          style={{ color: meta.accentHex }}
        >
          <Icon className="w-2.5 h-2.5 shrink-0" />
          <span>Z{zoneId}</span>
        </span>

        {/* Station Status Chip (Top Right) */}
        <span className="font-mono text-[7px] font-bold text-amber-200 shrink-0 whitespace-nowrap">
          {zoneId === 1 && (
            totalStoredTokens > warehouseCapacity ? (
              <span className="px-1 py-0.2 rounded bg-amber-500/25 border border-amber-400/60 text-amber-300 font-bold">
                {totalStoredTokens}/{warehouseCapacity} (Over Cap)
              </span>
            ) : (
              `${totalStoredTokens}/${warehouseCapacity} Stored`
            )
          )}
          {zoneId === 2 && `Cap: ${kettleCapacity}`}
          {zoneId === 3 && `Cap: ${carboyCapacity}`}
          {zoneId === 4 && `${currentBatchesCount}/${targetBatches} BBL`}
        </span>
      </div>

      {/* BOTTOM FLOATING PILL: Station Name & Pipeline Role (Floating cleanly between rivets) */}
      <div className="absolute bottom-1.5 inset-x-2 z-20 px-1.5 py-0.5 rounded-lg bg-black/90 backdrop-blur-[2px] border border-amber-500/50 shadow-lg flex items-center justify-between gap-1 text-[7.5px] font-mono font-bold pointer-events-none">
        <span className="text-amber-100 uppercase tracking-tight text-[7px] font-bold">
          {zoneId === 1 && 'Warehouse'}
          {zoneId === 2 && 'Brewhouse'}
          {zoneId === 3 && 'Fermentation'}
          {zoneId === 4 && 'Conditioning'}
          {zoneId === 5 && 'Packaging'}
        </span>
        <span
          className="shrink-0 font-mono text-[7px] font-bold whitespace-nowrap"
          style={{ color: meta.accentHex }}
        >
          {zoneId === 1 && `+${sourceDraws} Sourcing`}
          {zoneId === 2 && '→ Fermentation'}
          {zoneId === 3 && '→ Conditioning'}
          {zoneId === 4 && '→ Packaging'}
          {zoneId === 5 && 'Score VP'}
        </span>
      </div>
    </div>
  );
};




/**
 * Metadata and color palette for individual beers within Mixer Packs
 */
export function getMixerBeerMeta(reqName: string) {
  const norm = reqName.toLowerCase().replace(/š/g, 's');
  if (norm.includes('pilsner')) {
    return {
      short: 'Hoyne Pilsner',
      style: 'Bohemian Pilsner',
      color: '#064E3B',
      border: '#10B981',
      textColor: '#A7F3D0',
      vesselImageSrc: '/labels/hoyne-pilsner-vessel.png',
    };
  }
  if (norm.includes('por favor')) {
    return {
      short: 'Por Favor',
      style: 'Mexican Cerveza',
      color: '#0D9488',
      border: '#14B8A6',
      textColor: '#99F6E4',
      vesselImageSrc: '/labels/por-favor-vessel.png',
    };
  }
  if (norm.includes('che bello')) {
    return {
      short: 'Che Bello',
      style: 'Italian Pilsner',
      color: '#B45309',
      border: '#F59E0B',
      textColor: '#FDE68A',
      vesselImageSrc: '/labels/che-bello-vessel.png',
    };
  }
  if (norm.includes('svec')) {
    return {
      short: 'Švec',
      style: 'Czech Dark Lager',
      color: '#15803D',
      border: '#22C55E',
      textColor: '#BBF7D0',
      vesselImageSrc: '/labels/svec-vessel.png',
    };
  }
  if (norm.includes('dark matter')) {
    return {
      short: 'Dark Matter',
      style: 'Cosmic Stout',
      color: '#1E1B4B',
      border: '#6366F1',
      textColor: '#C7D2FE',
      vesselImageSrc: '/labels/dark-matter-vessel.png',
    };
  }
  if (norm.includes('down easy')) {
    return {
      short: 'Down Easy',
      style: 'Pale Ale',
      color: '#0369A1',
      border: '#38BDF8',
      textColor: '#BAE6FD',
      vesselImageSrc: '/labels/down-easy-vessel.png',
    };
  }
  if (norm.includes('helios')) {
    return {
      short: 'Helios',
      style: 'Golden Lager',
      color: '#B45309',
      border: '#FBBF24',
      textColor: '#FEF3C7',
      vesselImageSrc: '/labels/helios-vessel.png',
    };
  }
  if (norm.includes('framboozle')) {
    return {
      short: 'Framboozle',
      style: 'Raspberry Ale',
      color: '#831843',
      border: '#EC4899',
      textColor: '#FBCFE8',
      vesselImageSrc: '/labels/framboozle-vessel.png',
    };
  }
  if (norm.includes('shine on')) {
    return {
      short: 'Shine On',
      style: 'Hazy IPA',
      color: '#C2410C',
      border: '#FB923C',
      textColor: '#FED7AA',
      vesselImageSrc: '/labels/shine-on-vessel.png',
    };
  }
  if (norm.includes('finnegans')) {
    return {
      short: 'Finnegans',
      style: 'Irish Stout',
      color: '#064E3B',
      border: '#34D399',
      textColor: '#A7F3D0',
      vesselImageSrc: '/labels/finnegans-vessel.png',
    };
  }
  if (norm.includes('appleton')) {
    return {
      short: "Appleton's",
      style: 'British ESB',
      color: '#881337',
      border: '#F43F5E',
      textColor: '#FECDD3',
      vesselImageSrc: '/labels/appletons-finest-vessel.png',
    };
  }
  if (norm.includes('giants')) {
    return {
      short: 'Among Giants',
      style: 'Northwest IPA',
      color: '#365314',
      border: '#84CC16',
      textColor: '#D9F99D',
      vesselImageSrc: '/labels/among-giants-vessel.png',
    };
  }
  return {
    short: reqName,
    style: 'Craft Ale',
    color: '#78350F',
    border: '#D97706',
    textColor: '#FDE68A',
    vesselImageSrc: '/labels/hoyne-pilsner-vessel.png',
  };
}

export interface MixerPackCardViewProps {
  card: MixerPackCard;
  /** List of recipe names the active/inspected player has completed in Zone 4 (Trophy Stack) */
  completedRecipeNames?: string[];
  activePlayer?: PlayerState;
  compact?: boolean;
  disableInspectTrigger?: boolean;
  layoutVariant?: 'landscape' | 'portrait';
}

/**
 * ============================================================================
 * MIXER PACK CARD VIEW (Art-Dominant Tabletop Bounty Card)
 * Features large, prominent 3D Hoyne Mixer Pack packaging art with clean 4-pip
 * collection indicators. Supports authentic horizontal 'landscape' mode!
 * ============================================================================
 */
export const MixerPackCardView: React.FC<MixerPackCardViewProps> = ({
  card,
  completedRecipeNames = [],
  activePlayer,
  compact = false,
  disableInspectTrigger = false,
  layoutVariant = 'portrait',
}) => {
  const isClaimed = Boolean(card.claimedByPlayerId);
  const { inspectCard, setHoveredCard } = useCardInspector();
  const cardRef = useRef<HTMLDivElement>(null);

  // Derive all delivered & completed recipe names (from completedRecipeNames, activePlayer.completedBatches, or activePlayer.zones[5])
  const effectiveRecipeNames =
    completedRecipeNames && completedRecipeNames.length > 0
      ? completedRecipeNames
      : [
          ...(activePlayer?.completedBatches || []),
          ...(activePlayer?.zones[5]?.recipes || []),
        ].map((r) => r.name);

  const handleInspect = (e?: React.MouseEvent) => {
    if (disableInspectTrigger) return;
    if (e) e.stopPropagation();
    inspectCard({
      type: 'mixer',
      card,
      completedRecipeNames: effectiveRecipeNames,
      activePlayer,
    });
  };

  const handleMouseEnter = () => {
    if (disableInspectTrigger || !cardRef.current) return;
    setHoveredCard(
      {
        type: 'mixer',
        card,
        completedRecipeNames: effectiveRecipeNames,
        activePlayer,
      },
      cardRef.current.getBoundingClientRect()
    );
  };

  const handleMouseLeave = () => {
    if (disableInspectTrigger) return;
    setHoveredCard(null);
  };

  // Calculate which of the 4 required recipes the player currently possesses in their Trophy Stack
  const recipeChecks = card.requiredRecipes.map((req) => {
    const isDone = effectiveRecipeNames.some((completedName) =>
      matchRecipeToMixerRequirement(completedName, req)
    );
    const meta = getMixerBeerMeta(req);
    return { req, isDone, meta };
  });

  const completedCount = recipeChecks.filter((c) => c.isDone).length;
  const isReadyToClaim = completedCount === 4 && !isClaimed;

  // Compact horizontal view for streamlined tabletop layouts
  if (compact) {
    return (
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleInspect}
        data-card-type="mixer-pack"
        className={`group relative rounded-xl border transition-all select-none overflow-hidden p-2 flex items-center justify-between gap-2.5 ${
          !disableInspectTrigger ? 'cursor-pointer hover:border-amber-400 hover:shadow-lg' : ''
        } ${
          isClaimed
            ? 'bg-stone-950/85 border-stone-800 opacity-75'
            : isReadyToClaim
            ? 'bg-gradient-to-r from-[#2A1A0E] via-[#1E120A] to-[#140C07] border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.45)] ring-1 ring-amber-400'
            : 'bg-gradient-to-r from-[#1A120B] via-[#150E08] to-[#0E0A07] border-amber-600/50 hover:border-amber-400/90 shadow-md'
        }`}
        title="Click to view full recipe requirements and collection status"
      >
        {/* 3D Box Artwork Thumbnail */}
        <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-black/60 border border-amber-900/40 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
          <img
            src={card.imagePath}
            alt={card.name}
            className="w-full h-full object-contain filter drop-shadow-md"
            loading="lazy"
          />
        </div>

        {/* Title & 4-Pip Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-serif font-black text-xs text-amber-100 truncate group-hover:text-amber-300">
              {card.name}
            </h4>
            <span className="brass-badge px-1.5 py-0.2 rounded text-[10px] font-black shrink-0">
              +{card.vp} VP
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-1">
            {/* 4 Pips Progress */}
            <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded-full border border-amber-900/40">
              <div className="flex items-center gap-0.5">
                {recipeChecks.map((check, idx) => (
                  <span
                    key={idx}
                    title={`${check.meta.short}: ${check.isDone ? 'Delivered' : 'Needed'}`}
                    className={`w-2 h-2 rounded-full transition-all ${
                      check.isDone
                        ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.9)] ring-1 ring-emerald-300'
                        : 'bg-stone-800 border border-stone-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono font-bold text-amber-200 ml-0.5">
                {completedCount}/4
              </span>
            </div>

            {/* Status text */}
            {isClaimed ? (
              <span className="text-[9px] font-sans font-bold text-stone-400 truncate">
                Claimed ({card.claimedByPlayerName || 'Opponent'})
              </span>
            ) : isReadyToClaim ? (
              <span className="text-[9px] font-sans font-black text-amber-300 uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Ready!
              </span>
            ) : (
              <span className="text-[9px] font-sans text-stone-400 group-hover:text-amber-200 transition-colors flex items-center gap-0.5">
                <span>Inspect</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Horizontal Landscape Mode for Public Bounties
  if (layoutVariant === 'landscape') {
    return (
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleInspect}
        data-card-type="mixer-pack"
        className={`group relative rounded-2xl border-2 transition-all select-none overflow-hidden flex flex-row items-stretch p-2 w-full min-h-[100px] sm:min-h-[108px] max-h-[125px] ${
          !disableInspectTrigger ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-2xl' : ''
        } ${
          isClaimed
            ? 'bg-stone-950/85 border-stone-800 opacity-75'
            : isReadyToClaim
            ? 'bg-gradient-to-r from-[#24170D] via-[#1E120A] to-[#120B07] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.55)] ring-2 ring-amber-400'
            : 'bg-gradient-to-r from-[#1A120B] via-[#160E08] to-[#0E0A07] border-amber-600/50 hover:border-amber-400/90 shadow-xl'
        }`}
        style={{
          boxShadow: isReadyToClaim
            ? '0 10px 24px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(254, 240, 138, 0.3)'
            : '0 6px 18px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(200, 125, 50, 0.25)',
        }}
        title="Click to view full recipe requirements and collection status"
      >
        {/* Left: 3D Box Hero Art */}
        <div className="relative w-[70px] sm:w-[80px] shrink-0 rounded-xl overflow-hidden bg-black/60 border border-amber-900/50 flex items-center justify-center p-1 shadow-inner group/art">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-300 group-hover/art:opacity-75"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 50% 50%, rgba(245, 158, 11, 0.35) 0%, transparent 70%)',
            }}
          />
          <img
            src={card.imagePath}
            alt={card.name}
            className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)] transition-all duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {!disableInspectTrigger && (
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1 backdrop-blur-[1px]">
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/95 text-stone-950 text-[8px] font-sans font-black uppercase tracking-wider shadow flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5" />
                <span>Inspect</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Info, Requirements, Status */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pl-2">
          {/* Top Line */}
          <div>
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/40 text-[7.5px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Package className="w-2.5 h-2.5 text-amber-400" />
                <span>Bounty</span>
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
                  +{card.vp} VP
                </span>
              </div>
            </div>
            <h3 className="font-serif font-black text-xs text-amber-100 tracking-wide truncate drop-shadow-sm group-hover:text-amber-200 transition-colors">
              {card.name}
            </h3>
          </div>

          {/* 4 Required Beers Grid */}
          <div className="grid grid-cols-2 gap-1 py-0.5">
            {recipeChecks.map((check, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1 px-1 py-0.5 rounded text-[7.5px] font-mono truncate transition-all ${
                  check.isDone
                    ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
                    : 'bg-black/40 border border-stone-800 text-stone-400'
                }`}
                title={`${check.req}: ${check.isDone ? 'Brewed & Delivered' : 'Still Needed'}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    check.isDone
                      ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.9)]'
                      : 'bg-stone-600'
                  }`}
                />
                <span className="truncate">{check.meta.short || check.req}</span>
              </div>
            ))}
          </div>

          {/* Bottom Line */}
          <div className="pt-0.5 border-t border-amber-900/40 flex items-center justify-between text-[7.5px]">
            <span className="font-mono font-bold text-amber-200">
              {completedCount}/4 Brewed
            </span>
            {isClaimed ? (
              <span className="text-stone-400 font-bold truncate">Claimed</span>
            ) : isReadyToClaim ? (
              <span className="text-amber-300 font-black uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Claim!
              </span>
            ) : (
              <span className="text-stone-400 group-hover:text-amber-200 flex items-center gap-0.5">
                <span>Inspect</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleInspect}
      data-card-type="mixer-pack"
      className={`group relative rounded-2xl border-2 transition-all select-none overflow-hidden flex flex-col justify-between ${
        !disableInspectTrigger ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl' : ''
      } ${
        isClaimed
          ? 'bg-stone-950/85 border-stone-800 opacity-75'
          : isReadyToClaim
          ? 'bg-gradient-to-br from-[#24170D] via-[#1E120A] to-[#120B07] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.55)] ring-2 ring-amber-400'
          : 'bg-gradient-to-br from-[#1A120B] via-[#160E08] to-[#0E0A07] border-amber-600/50 hover:border-amber-400/90 shadow-xl'
      } ${compact ? 'p-1.5 w-full text-xs' : 'p-1.5 sm:p-2 w-full h-full aspect-[2.25/3.5]'}`}
      style={{
        boxShadow: isReadyToClaim
          ? '0 14px 32px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(254, 240, 138, 0.3)'
          : '0 8px 24px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(200, 125, 50, 0.25)',
      }}
      title="Click to view full recipe requirements and collection status"
    >
      {/* Background subtle watermark / craft paper grain */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 75% 25%, rgba(245, 158, 11, 0.25) 0%, transparent 60%)',
        }}
      />

      {/* ===================================================================
          1. TOP HEADER: Badge, Embossed Gold VP Shield, & Full-Width Title
      =================================================================== */}
      <div className="relative z-10 pb-1 border-b border-amber-900/40">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-400/40 text-[8px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
            <Package className="w-2.5 h-2.5 text-amber-400" />
            <span>Bounty</span>
          </span>

          {/* Embossed Gold VP Shield */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.2 rounded-lg border border-amber-200/90 shadow-md transform group-hover:scale-105 transition-transform"
            style={{
              background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.4)',
            }}
          >
            <Trophy className="w-2.5 h-2.5 text-stone-950 fill-stone-950 shrink-0" />
            <span className="font-serif font-black text-[10px] text-stone-950 tracking-wider whitespace-nowrap">
              +{card.vp} VP
            </span>
          </div>
        </div>

        <h3 className="font-serif font-black text-xs text-amber-100 tracking-wide truncate drop-shadow-sm group-hover:text-amber-200 transition-colors">
          {card.name}
        </h3>
      </div>

      {/* ===================================================================
          2. DOMINANT HERO ART CANVAS: Authentic 3D Hoyne Mixer Pack Packaging
      =================================================================== */}
      <div className="my-1 relative z-10 w-full flex-1 min-h-0 rounded-xl overflow-hidden bg-gradient-to-b from-black/60 via-[#18110B]/80 to-black/85 border border-amber-900/50 flex items-center justify-center shadow-inner group/art">
        {/* Ambient radial backlight glow behind the box */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-300 group-hover/art:opacity-75"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 50%, rgba(245, 158, 11, 0.35) 0%, transparent 70%)',
          }}
        />

        {/* Hero 3D Box Art Image */}
        <img
          src={card.imagePath}
          alt={card.name}
          className="w-full h-full object-contain p-1.5 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.95)] transition-all duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover Cue Overlay */}
        {!disableInspectTrigger && (
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/95 text-stone-950 text-[9px] font-sans font-black uppercase tracking-wider shadow-lg flex items-center gap-1 transform translate-y-1 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3 h-3" />
              <span>Inspect</span>
            </span>
          </div>
        )}
      </div>

      {/* ===================================================================
          BOTTOM FOOTER: 4-Pip Collection Progress & Inspect Cue
      =================================================================== */}
      <div className="relative z-10 pt-1 border-t border-amber-900/40 space-y-1">
        <div className="flex items-center justify-between gap-1">
          {/* 4 Pips Progress Indicator */}
          <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full border border-amber-900/50 shadow-inner">
            <div className="flex items-center gap-0.5">
              {recipeChecks.map((check, idx) => (
                <span
                  key={idx}
                  title={`${check.meta.short}: ${check.isDone ? 'Delivered' : 'Needed'}`}
                  className={`w-2 h-2 rounded-full transition-all flex items-center justify-center ${
                    check.isDone
                      ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] ring-1 ring-emerald-300'
                      : 'bg-stone-800 border border-stone-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-[9px] font-mono font-black text-amber-200 ml-0.5">
              {completedCount}/4
            </span>
          </div>

          {/* Direct Inspect Prompt */}
          {!disableInspectTrigger && (
            <div className="flex items-center gap-0.5 text-[9.5px] font-sans font-bold text-amber-400 group-hover:text-amber-200 transition-colors">
              <span>View</span>
              <ChevronRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>

        {/* Claim / Race Banner */}
        {isClaimed ? (
          <div className="flex items-center justify-center gap-1 py-0.5 px-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-[8.5px] font-sans font-bold shadow-inner truncate">
            <Trophy className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span className="truncate">Claimed ({card.claimedByPlayerName || 'Opponent'})</span>
          </div>
        ) : isReadyToClaim ? (
          <div className="flex items-center justify-center gap-1 py-0.5 px-1.5 rounded-lg bg-amber-500 text-stone-950 text-[8.5px] font-sans font-black uppercase tracking-wider shadow animate-pulse truncate">
            <Sparkles className="w-2.5 h-2.5 fill-stone-950 shrink-0" />
            <span>Ready to Claim!</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[8px] font-mono text-amber-200/70 leading-tight px-0.5">
            <span>4-Beer Set</span>
            <span className="text-amber-400 font-bold ml-1">1st wins</span>
          </div>
        )}
      </div>
    </div>
  );
};
