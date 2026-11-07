import {
  IngredientCategory,
  IngredientCard,
  IngredientSubtype,
  IngredientTaxonomy,
  IngredientStationId,
  IngredientStationState,
  RecipeCard,
  RecipeTier,
  RecipeTierName,
  UpgradeCard,
  ZoneCard,
  ZoneId,
  MixerPackCard,
  RotarySlotNumber,
  BreweryDepartmentCard,
  DoubleSidedDepartmentCard,
} from './types';

export interface RotarySlotDefinition {
  slotNumber: RotarySlotNumber;
  name: string;
  ingredient: IngredientTaxonomy;
  tokenYield: number;
  angleDeg: number; // Clock angle (0=Top, 60=Upper Right, 120=Lower Right, 180=Bottom, 240=Lower Left, 300=Upper Left)
  vectorDeg: number; // Mathematical radial vector (90=Top, 30=Upper Right, 330=Lower Right, 270=Bottom, 210=Lower Left, 150=Upper Left)
  color: string;
  badgeBg: string;
  textColor: string;
  accent: string;
  cardType?: 'upgrade' | 'recipe';
}

export const ROTARY_SLOT_DEFS: Record<RotarySlotNumber, RotarySlotDefinition> = {
  1: {
    slotNumber: 1,
    name: 'Chocolate',
    ingredient: 'chocolate',
    tokenYield: 1,
    angleDeg: 0,   // Top
    vectorDeg: 90, // Vector 90° (Top)
    color: '#c48859',
    accent: '#c48859',
    badgeBg: '#3a2012',
    textColor: '#f5d5ba',
    cardType: 'upgrade',
  },
  2: {
    slotNumber: 2,
    name: 'Spices',
    ingredient: 'spices',
    tokenYield: 1,
    angleDeg: 60,  // Upper Right
    vectorDeg: 30, // Vector 30° (Upper Right)
    color: '#ea580c',
    accent: '#ea580c',
    badgeBg: '#431407',
    textColor: '#ffedd5',
    cardType: 'upgrade',
  },
  3: {
    slotNumber: 3,
    name: 'Fruit',
    ingredient: 'fruit',
    tokenYield: 1,
    angleDeg: 120,  // Lower Right
    vectorDeg: 330, // Vector 330° (Lower Right)
    color: '#7c3aed',
    accent: '#a855f7',
    badgeBg: '#2e1065',
    textColor: '#f3e8ff',
    cardType: 'recipe',
  },
  4: {
    slotNumber: 4,
    name: 'Yeast',
    ingredient: 'yeast',
    tokenYield: 2,
    angleDeg: 180,  // Bottom
    vectorDeg: 270, // Vector 270° (Bottom)
    color: '#f39c12',
    accent: '#f39c12',
    badgeBg: '#593806',
    textColor: '#fef08a',
    cardType: 'recipe',
  },
  5: {
    slotNumber: 5,
    name: 'Hops',
    ingredient: 'hops',
    tokenYield: 2,
    angleDeg: 240,  // Lower Left
    vectorDeg: 210, // Vector 210° (Lower Left)
    color: '#2ecc71',
    accent: '#2ecc71',
    badgeBg: '#0e4424',
    textColor: '#bbf7d0',
    cardType: 'recipe',
  },
  6: {
    slotNumber: 6,
    name: 'Grain',
    ingredient: 'grain',
    tokenYield: 2,
    angleDeg: 300,  // Upper Left
    vectorDeg: 150, // Vector 150° (Upper Left)
    color: '#f1c40f',
    accent: '#f1c40f',
    badgeBg: '#544405',
    textColor: '#fef9c3',
    cardType: 'recipe',
  },
  7: {
    slotNumber: 7,
    name: 'Brewhouse Pantry',
    ingredient: 'grain',
    tokenYield: 1,
    angleDeg: 0,
    vectorDeg: 0,
    color: '#e5b85c',
    accent: '#f59e0b',
    badgeBg: '#2a150c',
    textColor: '#fef08a',
  },
};

export const CATEGORY_METADATA: Record<
  IngredientCategory,
  { label: string; color: string }
> = {
  malt: { label: 'Malt', color: '#D97706' },
  hops: { label: 'Hops', color: '#16A34A' },
  yeast: { label: 'Yeast', color: '#CA8A04' },
  adjunct: { label: 'Epic Adjunct', color: '#9333EA' },
};

export const TAXONOMY_METADATA: Record<
  IngredientTaxonomy,
  {
    label: string;
    type: 'staple' | 'specialty';
    vp: number;
    color: string;
    bgClass: string;
    borderClass: string;
    badgeBg: string;
    textColor: string;
  }
> = {
  grain: {
    label: 'Grain',
    type: 'staple',
    vp: 1,
    color: '#EAB308',
    bgClass: 'bg-amber-500/20',
    borderClass: 'border-amber-500/50',
    badgeBg: '#78350F',
    textColor: '#FDE68A',
  },
  hops: {
    label: 'Hops',
    type: 'staple',
    vp: 1,
    color: '#22C55E',
    bgClass: 'bg-emerald-500/20',
    borderClass: 'border-emerald-500/50',
    badgeBg: '#14532D',
    textColor: '#A7F3D0',
  },
  yeast: {
    label: 'Yeast',
    type: 'staple',
    vp: 1,
    color: '#FDE68A',
    bgClass: 'bg-amber-100/20',
    borderClass: 'border-amber-200/50',
    badgeBg: '#451A03',
    textColor: '#FEF3C7',
  },
  fruit: {
    label: 'Fruit',
    type: 'specialty',
    vp: 2,
    color: '#A855F7',
    bgClass: 'bg-purple-500/20',
    borderClass: 'border-purple-500/50',
    badgeBg: '#581C87',
    textColor: '#E9D5FF',
  },
  spices: {
    label: 'Spices',
    type: 'specialty',
    vp: 2,
    color: '#EF4444',
    bgClass: 'bg-rose-500/20',
    borderClass: 'border-rose-500/50',
    badgeBg: '#881337',
    textColor: '#FECDD3',
  },
  chocolate: {
    label: 'Chocolate',
    type: 'specialty',
    vp: 2,
    color: '#78350F',
    bgClass: 'bg-amber-950/40',
    borderClass: 'border-amber-800/60',
    badgeBg: '#271206',
    textColor: '#FCD34D',
  },
};

export const INGREDIENT_STATION_METADATA: Record<
  IngredientStationId,
  {
    name: string;
    subtitle: string;
    category: IngredientCategory;
    taxonomy: IngredientTaxonomy;
    color: string;
    badgeBg: string;
    badgeBorder: string;
    description: string;
    /** Number of cards drawn when placing a worker at this stack */
    baseDrawCount: number;
  }
> = {
  grain: {
    name: 'Grain Silo',
    subtitle: 'Base Malt & Crystal Grains',
    category: 'malt',
    taxonomy: 'grain',
    color: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeBorder: '#D97706',
    description: 'Canadian 2-row barley & specialty grains for malt-forward foundations (1 VP).',
    baseDrawCount: 2,
  },
  hops: {
    name: 'Hop Yard',
    subtitle: 'Bittering, Aroma & Noble Hops',
    category: 'hops',
    taxonomy: 'hops',
    color: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: '#059669',
    description: 'Resinous bines, bittering cones, and floral European noble hops (1 VP).',
    baseDrawCount: 2,
  },
  yeast: {
    name: 'Yeast Lab',
    subtitle: 'Pure House Yeast Pitch',
    category: 'yeast',
    taxonomy: 'yeast',
    color: '#94A3B8',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    badgeBorder: '#64748B',
    description: 'Vital Saccharomyces strains cultured in Rock Bay (1 VP).',
    baseDrawCount: 2,
  },
  chocolate: {
    name: 'Roastery',
    subtitle: 'Dark Roasted Chocolate Malt',
    category: 'malt',
    taxonomy: 'chocolate',
    color: '#92400E',
    badgeBg: 'rgba(146, 64, 14, 0.25)',
    badgeBorder: '#78350F',
    description: 'Deep espresso roast malt for Dark Matter, stouts, and winter warmers (2 VP).',
    baseDrawCount: 1,
  },
  spices: {
    name: 'Spice Bins',
    subtitle: 'Solstice Winter Spices',
    category: 'adjunct',
    taxonomy: 'spices',
    color: '#DC2626',
    badgeBg: 'rgba(220, 38, 38, 0.2)',
    badgeBorder: '#B91C1C',
    description: 'Star anise, cinnamon & holiday botanicals for Gratitude (2 VP).',
    baseDrawCount: 1,
  },
  fruit: {
    name: 'Berry Patch',
    subtitle: 'Saanich Local Raspberries',
    category: 'adjunct',
    taxonomy: 'fruit',
    color: '#D946EF',
    badgeBg: 'rgba(217, 70, 239, 0.2)',
    badgeBorder: '#C026D3',
    description: 'Ruby island raspberries for Framboozle & summer releases (2 VP).',
    baseDrawCount: 1,
  },
};

export const INGREDIENT_METADATA: Record<
  IngredientSubtype,
  {
    label: string;
    shortLabel: string;
    category: IngredientCategory;
    color: string;
    bgClass: string;
  }
> = {
  // 6-Color System Taxonomy entries
  grain: {
    label: 'Grain (Core Staple)',
    shortLabel: 'Grain',
    category: 'malt',
    color: '#EAB308',
    bgClass: 'bg-amber-600/25 border-amber-500/60 text-amber-200',
  },
  hops: {
    label: 'Hops (Core Staple)',
    shortLabel: 'Hops',
    category: 'hops',
    color: '#22C55E',
    bgClass: 'bg-green-700/25 border-green-500/60 text-green-200',
  },
  yeast: {
    label: 'Yeast (Universal Core Staple)',
    shortLabel: 'Yeast',
    category: 'yeast',
    color: '#FDE68A',
    bgClass: 'bg-yellow-600/25 border-yellow-400/60 text-yellow-200',
  },
  fruit: {
    label: 'Fruit (Specialty)',
    shortLabel: 'Fruit',
    category: 'adjunct',
    color: '#A855F7',
    bgClass: 'bg-purple-600/30 border-purple-400/80 text-purple-200',
  },
  spices: {
    label: 'Spices (Specialty)',
    shortLabel: 'Spices',
    category: 'adjunct',
    color: '#EF4444',
    bgClass: 'bg-rose-600/30 border-rose-400/80 text-rose-200',
  },
  chocolate: {
    label: 'Chocolate (Specialty)',
    shortLabel: 'Chocolate',
    category: 'malt',
    color: '#78350F',
    bgClass: 'bg-amber-950/70 border-amber-800/80 text-amber-300',
  },
  base_malt: {
    label: '2-Row Base Malt',
    shortLabel: 'Base Malt',
    category: 'malt',
    color: '#F59E0B',
    bgClass: 'bg-amber-600/25 border-amber-500/60 text-amber-200',
  },
  specialty_grain: {
    label: 'Specialty Crystal Grain',
    shortLabel: 'Specialty Grain',
    category: 'malt',
    color: '#D97706',
    bgClass: 'bg-orange-600/25 border-orange-500/60 text-orange-200',
  },
  dark_roasted_malt: {
    label: 'Dark Roasted Chocolate Malt',
    shortLabel: 'Dark Malt',
    category: 'malt',
    color: '#78350F',
    bgClass: 'bg-stone-800/70 border-amber-800/80 text-amber-300',
  },
  bittering_hops: {
    label: 'Kettle Bittering Hops',
    shortLabel: 'Bittering Hops',
    category: 'hops',
    color: '#15803D',
    bgClass: 'bg-green-700/25 border-green-500/60 text-green-200',
  },
  aroma_hops: {
    label: 'Late-Addition Aroma Hops',
    shortLabel: 'Aroma Hops',
    category: 'hops',
    color: '#22C55E',
    bgClass: 'bg-emerald-600/25 border-emerald-400/60 text-emerald-200',
  },
  noble_hops: {
    label: 'European Noble Hops',
    shortLabel: 'Noble Hops',
    category: 'hops',
    color: '#0D9488',
    bgClass: 'bg-teal-600/25 border-teal-400/60 text-teal-200',
  },
  house_yeast: {
    label: 'Hoyne House Yeast Strain',
    shortLabel: 'House Yeast',
    category: 'yeast',
    color: '#EAB308',
    bgClass: 'bg-yellow-600/25 border-yellow-400/60 text-yellow-200',
  },
  fresh_wet_hops: {
    label: 'Fresh Sartori Wet Hops',
    shortLabel: 'Wet Hops',
    category: 'adjunct',
    color: '#84CC16',
    bgClass: 'bg-lime-600/30 border-lime-400/80 text-lime-200',
  },
  winter_spices: {
    label: 'Cinnamon & Winter Spices',
    shortLabel: 'Spices',
    category: 'adjunct',
    color: '#EA580C',
    bgClass: 'bg-orange-600/30 border-orange-400/80 text-orange-200',
  },
  local_raspberries: {
    label: 'Saanich Blackberries & Fruit',
    shortLabel: 'Fruit',
    category: 'adjunct',
    color: '#7C3AED',
    bgClass: 'bg-purple-600/30 border-purple-400/80 text-purple-200',
  },
};

/**
 * 24 Assembly Line Cards (6 player sets of 4 zones)
 */
export function createAssemblyLineCards(playerCount: number = 6): ZoneCard[] {
  const zones: ZoneCard[] = [];
  const zoneTemplates: Array<{
    zoneId: ZoneId;
    title: string;
    subtitle: string;
    description: string;
  }> = [
    {
      zoneId: 1,
      title: 'Zone 1: Warehouse',
      subtitle: 'Ingredient Hand & Sourcing',
      description:
        'Holds your raw Ingredients and wooden token detent racks. Upgrades here expand storage detents and grant drafting bonuses.',
    },
    {
      zoneId: 2,
      title: 'Zone 2: Brewhouse',
      subtitle: 'Active Brew & Mashing',
      description:
        'Newly brewed Recipes start here in the mash tun and kettle. During shift conveyor operations, wort advances to Primary Fermentation.',
    },
    {
      zoneId: 3,
      title: 'Zone 3: Cellar',
      subtitle: 'Primary Fermentation',
      description:
        'Active wort ferments in stainless unitanks. During shift conveyor operations, green beer advances to Cold Conditioning & Lagering.',
    },
    {
      zoneId: 4,
      title: 'Zone 4: Cold Room',
      subtitle: 'Cold Maturation & Brite Tanks',
      description:
        'Fermented beer matures, clarifies, and carbonates in horizontal lagering and brite tanks before final packaging.',
    },
    {
      zoneId: 5,
      title: 'Zone 5: Packaging',
      subtitle: 'Canning, Kegging & Scoring',
      description:
        'Completed batches arrive here at the canning and keg lines, scoring full Victory Points and advancing toward the endgame target.',
    },
  ];

  for (let p = 0; p < playerCount; p++) {
    for (const z of zoneTemplates) {
      zones.push({
        id: `zone_p${p + 1}_z${z.zoneId}`,
        name: z.title,
        deckType: 'zone',
        playerIndex: p,
        zoneId: z.zoneId,
        title: z.title,
        subtitle: z.subtitle,
        description: z.description,
      });
    }
  }
  return zones;
}

/**
 * 100 Ingredient Cards
 * - Malts (44): 24 base_malt, 12 specialty_grain, 8 dark_roasted_malt
 * - Hops (30): 12 bittering_hops, 10 aroma_hops, 8 noble_hops
 * - Yeast (18): 18 house_yeast
 * - Epic Adjuncts (8): 3 fresh_wet_hops, 3 winter_spices, 2 local_raspberries
 */
export function createIngredientDeck(): IngredientCard[] {
  const specs: Array<{
    subtype: IngredientSubtype;
    taxonomy: IngredientTaxonomy;
    vpValue: 1 | 2;
    count: number;
    name: string;
    category: IngredientCategory;
    description: string;
    flavorText: string;
    isWildcard?: boolean;
  }> = [
    {
      subtype: 'base_malt',
      taxonomy: 'grain',
      vpValue: 1,
      count: 24,
      name: '2-Row Base Malt',
      category: 'malt',
      description: 'Essential foundation grain required by nearly every Hoyne recipe.',
      flavorText: 'Crisp Canadian prairie barley, milled fresh every morning at Rock Bay.',
    },
    {
      subtype: 'specialty_grain',
      taxonomy: 'grain',
      vpValue: 1,
      count: 12,
      name: 'Specialty Crystal Grain',
      category: 'malt',
      description: 'Adds golden-amber color, caramel sweetness, and rich body.',
      flavorText: 'Kilned to perfection for that signature malt-forward backbone.',
    },
    {
      subtype: 'dark_roasted_malt',
      taxonomy: 'chocolate',
      vpValue: 2,
      count: 8,
      name: 'Dark Roasted Chocolate Malt',
      category: 'malt',
      description: 'Deeply roasted barley for Dark Matter, stouts, and winter warmers.',
      flavorText: 'Notes of espresso, dark cocoa, and mystery.',
    },
    {
      subtype: 'bittering_hops',
      taxonomy: 'hops',
      vpValue: 1,
      count: 12,
      name: 'Kettle Bittering Hops',
      category: 'hops',
      description: 'Added early in the boil for clean, balanced bitterness.',
      flavorText: 'Resinous cones that keep the malt sweetness in check.',
    },
    {
      subtype: 'aroma_hops',
      taxonomy: 'hops',
      vpValue: 1,
      count: 10,
      name: 'Late-Addition Aroma Hops',
      category: 'hops',
      description: 'Added in the whirlpool or dry-hop for vibrant citrus and pine notes.',
      flavorText: 'Big Pacific Northwest aromatics bursting from the kettle.',
    },
    {
      subtype: 'noble_hops',
      taxonomy: 'hops',
      vpValue: 1,
      count: 8,
      name: 'European Noble Hops',
      category: 'hops',
      description: 'Delicate Saaz and Hallertau hops for authentic pilsners and lagers.',
      flavorText: 'Floral, herbal elegance straight from Old World hop gardens.',
    },
    {
      subtype: 'house_yeast',
      taxonomy: 'yeast',
      vpValue: 1,
      count: 18,
      name: 'Hoyne House Yeast Strain',
      category: 'yeast',
      description: 'Pure pitch yeast culture that transforms sweet wort into fine beer.',
      flavorText: 'Brewers make wort; yeast makes beer.',
    },
    {
      subtype: 'fresh_wet_hops',
      taxonomy: 'hops',
      vpValue: 1,
      count: 3,
      name: 'Fresh Sartori Wet Hops',
      category: 'hops',
      description: 'Pacific Northwest wet hops harvested fresh from the bine for harvest ales.',
      flavorText: 'Picked in Chilliwack in the morning, swimming in our kettle by dusk.',
    },
    {
      subtype: 'winter_spices',
      taxonomy: 'spices',
      vpValue: 2,
      count: 3,
      name: 'Solstice Winter Spices',
      category: 'adjunct',
      description: 'Specialty Spices required for Gratitude Winter Ale, Dark Matter, and spiced craft ales.',
      flavorText: 'A warming toast to good friends and long Victoria nights.',
    },
    {
      subtype: 'local_raspberries',
      taxonomy: 'fruit',
      vpValue: 2,
      count: 2,
      name: 'Saanich Peninsula Raspberries',
      category: 'adjunct',
      description: 'Specialty Fruit required for Framboozle Raspberry Ale and Shine On Hazy IPA.',
      flavorText: 'Hundreds of pounds of ruby-red island fruit in every batch.',
    },
  ];

  const deck: IngredientCard[] = [];
  for (const spec of specs) {
    for (let i = 1; i <= spec.count; i++) {
      deck.push({
        id: `ing_${spec.subtype}_${i}`,
        name: spec.name,
        deckType: 'ingredient',
        category: spec.category,
        subtype: spec.subtype,
        taxonomy: spec.taxonomy,
        vpValue: spec.vpValue,
        description: spec.description,
        flavorText: spec.flavorText,
        isWildcard: spec.isWildcard,
      });
    }
  }
  return deck;
}

/**
 * Creates the 6 Dedicated Ingredient Market Stations, partitioning the 100 ingredients
 * into their respective categories, dealing 2 face-up cards per station, with draw decks ready.
 */
export function createInitialIngredientStations(
  allIngredients?: IngredientCard[],
  shuffleFn?: <T>(arr: T[]) => T[]
): Record<IngredientStationId, IngredientStationState> {
  const ingredients = allIngredients ? [...allIngredients] : createIngredientDeck();
  const shuffle =
    shuffleFn ||
    (<T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });

  const stationIds: IngredientStationId[] = [
    'grain',
    'hops',
    'yeast',
    'chocolate',
    'spices',
    'fruit',
  ];

  const stations: Partial<Record<IngredientStationId, IngredientStationState>> = {};

  for (const sId of stationIds) {
    const meta = INGREDIENT_STATION_METADATA[sId];
    // Filter ingredients belonging to this station
    const stationCards = ingredients.filter((c) => {
      if (sId === 'grain')
        return (
          c.taxonomy === 'grain' ||
          c.subtype === 'base_malt' ||
          c.subtype === 'specialty_grain'
        );
      if (sId === 'hops')
        return c.taxonomy === 'hops' || c.category === 'hops';
      if (sId === 'yeast')
        return c.taxonomy === 'yeast' || c.subtype === 'house_yeast';
      if (sId === 'chocolate')
        return (
          c.taxonomy === 'chocolate' || c.subtype === 'dark_roasted_malt'
        );
      if (sId === 'spices')
        return c.taxonomy === 'spices' || c.subtype === 'winter_spices';
      if (sId === 'fruit')
        return c.taxonomy === 'fruit' || c.subtype === 'local_raspberries';
      return false;
    });

    const shuffled = shuffle(stationCards);
    const faceUpCards = shuffled.slice(0, 1);
    const deck = shuffled.slice(1);

    stations[sId] = {
      id: sId,
      name: meta.name,
      subtitle: meta.subtitle,
      category: meta.category,
      taxonomy: meta.taxonomy,
      color: meta.color,
      badgeBg: meta.badgeBg,
      badgeBorder: meta.badgeBorder,
      baseDrawCount: meta.baseDrawCount,
      occupiedByPlayerId: null,
      occupiedByPlayerName: null,
      occupiedByPlayerColor: null,
      faceUpCards,
      deck,
      discard: [],
    };
  }

  return stations as Record<IngredientStationId, IngredientStationState>;
}

export const REBALANCED_HOYNE_RECIPES = [
  // Tier 1: Core Crushers (4 Staples = 4 VP)
  { name: 'North Star Canadian Lager', tier: 1, vp: 4, ingredientsRequired: 4 },
  { name: 'Down Easy Pale Ale', tier: 1, vp: 4, ingredientsRequired: 4 },
  { name: 'Hoyne Pilsner', tier: 1, vp: 4, ingredientsRequired: 4 },
  { name: 'Por Favor Mexican Style Lager', tier: 1, vp: 4, ingredientsRequired: 4 },

  // Tier 2: Showstoppers (5 Ingredients = 5-7 VP)
  { name: 'Among Giants', tier: 2, vp: 5, ingredientsRequired: 5 },
  { name: 'Che Bello', tier: 2, vp: 5, ingredientsRequired: 5 },
  { name: 'Helios Dortmunder Golden Lager', tier: 2, vp: 5, ingredientsRequired: 5 },
  { name: 'Shine On Hazy IPA', tier: 2, vp: 6, ingredientsRequired: 5 },
  { name: "Appleton's Finest", tier: 2, vp: 6, ingredientsRequired: 5 },
  { name: 'Pub Lunch', tier: 2, vp: 6, ingredientsRequired: 5 },
  { name: 'Švec Czech Half Dark Lager', tier: 2, vp: 6, ingredientsRequired: 5 },
  { name: 'Finnegans Irish Stout', tier: 2, vp: 6, ingredientsRequired: 5 },
  { name: 'Dark Matter', tier: 2, vp: 7, ingredientsRequired: 5 },

  // Tier 3: Seasonals & Special Releases (6 Ingredients = 7-8 VP)
  { name: 'Wolf Vine Wet Hop Pale Ale', tier: 3, vp: 7, ingredientsRequired: 6 },
  { name: 'Gratitude Winter Ale', tier: 3, vp: 8, ingredientsRequired: 6 },
  { name: 'Framboozle Raspberry Ale', tier: 3, vp: 8, ingredientsRequired: 6 },
];

export const REBALANCED_HOYNE_UPGRADES = [
  // Standard Upgrades: +1 VP
  { name: 'Warehouse Forklift Ace', type: 'Staff', vp: 1, zoneTarget: 1 },
  { name: 'Glycol Chiller', type: 'Equipment', vp: 1, zoneTarget: 3 },

  // Specialty / Signature Upgrades: +2 VP Max
  { name: 'Sean Hoyne - Master Brewer', type: 'Staff', vp: 2, zoneTarget: 2 },
  { name: 'Taco Bar Tasting Room', type: 'Equipment', vp: 2, zoneTarget: 4 },
  { name: 'Hoyne Delivery Crew', type: 'Staff', vp: 2, zoneTarget: 4 },
];

/**
 * 57 Recipe Cards across 3 Tiers (~59% draw probability in 97-card Master Deck):
 * - Tier 1: Core Crushers (24 Cards • 4 VP Each) — 6 Copies per Recipe
 *   * 6x Hoyne Pilsner, 6x Por Favor, 6x Down Easy, 6x North Star
 * - Tier 2: Showstoppers (27 Cards • 6-7 VP Each) — 3 Copies per Recipe
 *   * 3x Helios (6 VP), 3x Shine On (6 VP), 3x Švec (6 VP), 3x Che Bello (6 VP)
 *   * 3x Appleton's Finest (6 VP), 3x Pub Lunch (6 VP)
 *   * 3x Dark Matter (6 VP), 3x Finnegans (6 VP), 3x Among Giants (7 VP)
 * - Tier 3: Seasonals & Special Releases (6 Cards • 8 VP Each) — 2 Copies per Recipe
 *   * 2x Wolf Vine (8 VP • Requires Fresh Sartori Wet Hops)
 *   * 2x Gratitude (8 VP • Requires Solstice Winter Spices)
 *   * 2x Framboozle (8 VP • Requires Saanich Raspberries)
 */
export function createRecipeDeck(): RecipeCard[] {
  const templates: Array<{
    key: string;
    count: number;
    name: string;
    tier: RecipeTier;
    tierName: RecipeTierName;
    style: string;
    abv: string;
    vp: number;
    requiredIngredients: IngredientSubtype[];
    completionBonusText: string;
    completionEffect?: RecipeCard['completionEffect'];
    flavorText: string;
    colorAccent: string;
  }> = [
    // ========================================================================
    // TIER 6: CORE CRUSHERS (Station #6 Grain Hopper • 16 Cards • 4 VP Each)
    // 4 Recipes (4 Copies Each)
    // ========================================================================
    {
      key: 'north_star',
      count: 4,
      name: 'North Star Canadian Lager',
      tier: 6,
      tierName: 'Core Crusher',
      style: 'Canadian Lager',
      abv: '4.2%',
      vp: 4,
      requiredIngredients: ['yeast', 'grain', 'grain', 'grain'],
      completionBonusText: '',
      flavorText: 'Crisp, balanced, and light on its feet—a guiding light in Victoria craft beer.',
      colorAccent: '#A8A29E',
    },
    {
      key: 'down_easy',
      count: 4,
      name: 'Down Easy Pale Ale',
      tier: 6,
      tierName: 'Core Crusher',
      style: 'Pale Ale',
      abv: '4.5%',
      vp: 4,
      requiredIngredients: ['yeast', 'grain', 'hops', 'hops'],
      completionBonusText: '',
      flavorText: 'Smooth pale malt and lively Pacific Northwest hop character.',
      colorAccent: '#FB923C',
    },
    {
      key: 'hoyne_pilsner',
      count: 4,
      name: 'Hoyne Pilsner',
      tier: 6,
      tierName: 'Core Crusher',
      style: 'Bohemian Pilsner',
      abv: '5.3%',
      vp: 4,
      requiredIngredients: ['yeast', 'yeast', 'grain', 'hops'],
      completionBonusText: '',
      flavorText: 'Bright gold, crisp Saaz hop snap, and a clean lagering finish.',
      colorAccent: '#FACC15',
    },
    {
      key: 'por_favor',
      count: 4,
      name: 'Por Favor Mexican Style Lager',
      tier: 6,
      tierName: 'Core Crusher',
      style: 'Mexican Style Lager',
      abv: '4.7%',
      vp: 4,
      requiredIngredients: ['yeast', 'grain', 'grain', 'hops'],
      completionBonusText: '',
      flavorText: 'Clean, sunny, and dangerously crushable next to a plate of street tacos.',
      colorAccent: '#38BDF8',
    },

    // ========================================================================
    // TIER 5: PINTS & IPAS (Station #5 Hops Hopper • 16 Cards • 5-6 VP Each)
    // 4 Recipes (4 Copies Each)
    // ========================================================================
    {
      key: 'among_giants',
      count: 4,
      name: 'Among Giants',
      tier: 5,
      tierName: 'Pints & IPAs',
      style: 'West Coast Double IPA',
      abv: '7.8%',
      vp: 5,
      requiredIngredients: ['yeast', 'grain', 'hops', 'hops', 'hops'],
      completionBonusText: '',
      flavorText: 'Towering Douglas firs of resinous hop character and bold malt.',
      colorAccent: '#16A34A',
    },
    {
      key: 'che_bello',
      count: 4,
      name: 'Che Bello',
      tier: 5,
      tierName: 'Pints & IPAs',
      style: 'Italian Pilsner',
      abv: '5.0%',
      vp: 5,
      requiredIngredients: ['yeast', 'grain', 'grain', 'hops', 'hops'],
      completionBonusText: '',
      flavorText: 'Dry-hopped with European cultivars for an aromatic, snappy finish.',
      colorAccent: '#2DD4BF',
    },
    {
      key: 'helios',
      count: 4,
      name: 'Helios Dortmunder Golden Lager',
      tier: 5,
      tierName: 'Pints & IPAs',
      style: 'Dortmunder Golden Lager',
      abv: '5.5%',
      vp: 5,
      requiredIngredients: ['yeast', 'grain', 'grain', 'grain', 'hops'],
      completionBonusText: '',
      flavorText: 'Named for the sun god—radiant malt richness balanced by noble hops.',
      colorAccent: '#F59E0B',
    },
    {
      key: 'shine_on',
      count: 4,
      name: 'Shine On Hazy IPA',
      tier: 5,
      tierName: 'Pints & IPAs',
      style: 'Hazy IPA',
      abv: '4.4%',
      vp: 6,
      requiredIngredients: ['yeast', 'grain', 'hops', 'hops', 'fruit'],
      completionBonusText: '',
      flavorText: 'All the tropical hop brilliance of an IPA without weighing down your afternoon.',
      colorAccent: '#4ADE80',
    },

    // ========================================================================
    // TIER 4: HERITAGE & DARK ALES (Station #4 Yeast Hopper • 16 Cards • 6 VP Each)
    // 4 Recipes (4 Copies Each)
    // ========================================================================
    {
      key: 'appletons_finest',
      count: 4,
      name: "Appleton's Finest",
      tier: 4,
      tierName: 'Heritage & Dark Ale',
      style: 'British Bitter / ESB',
      abv: '5.2%',
      vp: 6,
      requiredIngredients: ['yeast', 'grain', 'grain', 'hops', 'spices'],
      completionBonusText: '',
      flavorText: 'A nod to Frank Appleton and the pioneers of Canadian craft brewing.',
      colorAccent: '#EA580C',
    },
    {
      key: 'pub_lunch',
      count: 4,
      name: 'Pub Lunch',
      tier: 4,
      tierName: 'Heritage & Dark Ale',
      style: 'Traditional English Ale',
      abv: '4.6%',
      vp: 6,
      requiredIngredients: ['yeast', 'grain', 'grain', 'grain', 'spices'],
      completionBonusText: '',
      flavorText: 'Biscuity malt and earthy hops—best enjoyed at a corner booth.',
      colorAccent: '#B45309',
    },
    {
      key: 'svec',
      count: 4,
      name: 'Švec Czech Half Dark Lager',
      tier: 4,
      tierName: 'Heritage & Dark Ale',
      style: 'Czech Half Dark Lager',
      abv: '5.0%',
      vp: 6,
      requiredIngredients: ['yeast', 'grain', 'grain', 'hops', 'chocolate'],
      completionBonusText: '',
      flavorText: 'Amber Polotmavý lager honoring Czech brewing craftsmanship—roasty dark malts meet crisp Saaz hops.',
      colorAccent: '#D97706',
    },
    {
      key: 'finnegans',
      count: 4,
      name: 'Finnegans Irish Stout',
      tier: 4,
      tierName: 'Heritage & Dark Ale',
      style: 'Dry Irish Stout',
      abv: '4.9%',
      vp: 6,
      requiredIngredients: ['yeast', 'grain', 'grain', 'grain', 'chocolate'],
      completionBonusText: '',
      flavorText: 'Creamy head, roasted barley bite, and pure pub soul.',
      colorAccent: '#57534E',
    },

    // ========================================================================
    // TIER 3: LEGENDS & HEAVYWEIGHTS (Station #3 Fruit Hopper • 16 Cards • 7-8 VP Each)
    // 4 Recipes (4 Copies Each)
    // ========================================================================
    {
      key: 'dark_matter',
      count: 4,
      name: 'Dark Matter',
      tier: 3,
      tierName: 'Legend & Heavyweight',
      style: 'Iconic Dark Ale',
      abv: '5.3%',
      vp: 7,
      requiredIngredients: ['yeast', 'grain', 'grain', 'spices', 'chocolate'],
      completionBonusText: '',
      flavorText: 'Not quite a stout, not quite a porter—100% Victoria legend.',
      colorAccent: '#9333EA',
    },
    {
      key: 'wolf_vine',
      count: 4,
      name: 'Wolf Vine Wet Hop Pale Ale',
      tier: 3,
      tierName: 'Legend & Heavyweight',
      style: 'Harvest Wet Hop Ale',
      abv: '5.4%',
      vp: 7,
      requiredIngredients: ['yeast', 'grain', 'hops', 'hops', 'hops', 'fruit'],
      completionBonusText: '',
      flavorText: 'Humulus lupulus—the Wolf Vine—rushed straight from the bines to the brew kettle.',
      colorAccent: '#84CC16',
    },
    {
      key: 'gratitude',
      count: 4,
      name: 'Gratitude Winter Ale',
      tier: 3,
      tierName: 'Legend & Heavyweight',
      style: 'Spiced Strong Winter Ale',
      abv: '9.0%',
      vp: 8,
      requiredIngredients: ['yeast', 'grain', 'grain', 'hops', 'spices', 'chocolate'],
      completionBonusText: '',
      flavorText: 'Rich, warming, and brewed in heartfelt appreciation for our community.',
      colorAccent: '#C084FC',
    },
    {
      key: 'framboozle',
      count: 4,
      name: 'Framboozle Raspberry Ale',
      tier: 3,
      tierName: 'Legend & Heavyweight',
      style: 'Belgian-Style Raspberry Ale',
      abv: '6.5%',
      vp: 8,
      requiredIngredients: ['yeast', 'grain', 'grain', 'hops', 'fruit', 'fruit'],
      completionBonusText: '',
      flavorText: 'Effervescent, ruby-red, and brimming with fresh Saanich Peninsula raspberries.',
      colorAccent: '#F472B6',
    },
  ];

  const deck: RecipeCard[] = [];
  for (const t of templates) {
    for (let i = 1; i <= t.count; i++) {
      deck.push({
        id: `rec_${t.key}_${i}`,
        name: t.name,
        deckType: 'recipe',
        tier: t.tier,
        tierName: t.tierName,
        style: t.style,
        abv: t.abv,
        vp: t.vp,
        requiredIngredients: [...t.requiredIngredients],
        completionBonusText: t.completionBonusText,
        completionEffect: t.completionEffect ? { ...t.completionEffect } : undefined,
        flavorText: t.flavorText,
        colorAccent: t.colorAccent,
      });
    }
  }
  return deck;
}

/**
 * Creates a dedicated deck of recipe cards for a specific Tier (1, 2, 3, or 4).
 * Station 3: Tier 1 (Core Crushers)
 * Station 4: Tier 2 (Pints & IPAs)
 * Station 5: Tier 3 (Heritage & Dark Ales)
 * Station 6: Tier 4 (Legends & Heavyweights)
 */
export function createTierRecipeDeck(tier: RecipeTier): RecipeCard[] {
  return createRecipeDeck().filter((c) => c.tier === tier);
}

/**
 * 40 Dual-Purpose & Universal Wing Upgrade Cards (Zero Mid-Game VP Engine!):
 * - 32 Dual-Purpose Zone Upgrades (8 per Zone, 4 types x 2 duplicates)
 *   * Top Half (Equipment): Slides 1.25" under TOP EDGE of Zone (1-4).
 *   * Bottom Half (Staff): Slides 1.25" under BOTTOM EDGE of Zone (1-4).
 * - 8 Universal Wing Upgrades (2 types x 4 duplicates)
 *   * Left Half (Operations Command): Slides 1.25" under LEFT EDGE of Zone 1.
 *   * Right Half (Distribution & Storage): Slides 1.25" under RIGHT EDGE of Zone 4.
 */
// ============================================================================
// MASTER 24-CARD DUAL-PURPOSE UPGRADE DECK (AUTHORITATIVE SPEC)
// 24 Cards Total (Poker Size 2.5" x 3.5") • Zero Flat VP (bonusEndgameVp = 0)
// Col 1 (Grain Warehouse): Cards 01 - 06
// Col 2 (Brewhouse): Cards 07 - 12
// Col 3 (Fermentation Cellar): Cards 13 - 18
// Col 4 (Packaging & Dock): Cards 19 - 24
// ============================================================================

export const MASTER_UPGRADE_DECK_DEFS = [
  // Zone 1: Warehouse & Sourcing (4 Cards)
  {
    cardNumber: 1,
    id: 'upgrade_01',
    name: 'High-Capacity Hopper / Hop Broker',
    installTokens: { grain: 1, hops: 1 },
    targetZone: 1 as const,
    headerBadge: '+2 Grain Storage',
    footerBadge: '+1 Hops on Draft',
    equipment: {
      name: 'High-Capacity Hopper',
      type: 'equipment' as const,
      costCategories: ['malt', 'hops'] as IngredientCategory[],
      badge: '+2 Grain Storage',
      effectKey: 'warehouse_capacity_plus_2_grain' as const,
      effectText: '+2 Grain storage slots (dedicated detents in warehouse).',
      flavorText: 'Expands bulk storage detents dedicated to base grain.',
      targetZone: 1 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Hop Broker',
      type: 'staff' as const,
      costCategories: ['malt', 'hops'] as IngredientCategory[],
      badge: '+1 Hops on Draft',
      effectKey: 'draft_bonus_hops' as const,
      effectText: 'When drafting tokens, take +1 Hops from the Market.',
      flavorText: 'Direct relationships with Yakima growers yield extra cones.',
      targetZone: 1 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 2,
    id: 'upgrade_02',
    name: 'Cryo-Hop Storage / Malt Handler',
    installTokens: { hops: 1, grain: 1 },
    targetZone: 1 as const,
    headerBadge: '+2 Hops Storage',
    footerBadge: '+1 Grain on Draft',
    equipment: {
      name: 'Cryo-Hop Storage',
      type: 'equipment' as const,
      costCategories: ['hops', 'malt'] as IngredientCategory[],
      badge: '+2 Hops Storage',
      effectKey: 'warehouse_capacity_plus_2_hops' as const,
      effectText: '+2 Hops storage slots (dedicated detents in warehouse).',
      flavorText: 'Sub-zero nitrogen conditioning keeps fresh harvest hops potent.',
      targetZone: 1 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Malt Handler',
      type: 'staff' as const,
      costCategories: ['hops', 'malt'] as IngredientCategory[],
      badge: '+1 Grain on Draft',
      effectKey: 'draft_bonus_grain' as const,
      effectText: 'When drafting tokens, take +1 Grain from the Market.',
      flavorText: 'Master of grist handling ensures full bins on every intake.',
      targetZone: 1 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 3,
    id: 'upgrade_03',
    name: 'Roasted Malt Bin / Spice Forager',
    installTokens: { grain: 1, spices: 1 },
    targetZone: 1 as const,
    headerBadge: '+2 Chocolate Storage',
    footerBadge: '+1 Spices on Draft',
    equipment: {
      name: 'Roasted Malt Bin',
      type: 'equipment' as const,
      costCategories: ['malt', 'adjunct'] as IngredientCategory[],
      badge: '+2 Chocolate Storage',
      effectKey: 'warehouse_capacity_plus_2_chocolate' as const,
      effectText: '+2 Chocolate storage slots (dedicated detents in warehouse).',
      flavorText: 'Dedicated dry bins preserve specialty chocolate roast aromatics.',
      targetZone: 1 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Spice Forager',
      type: 'staff' as const,
      costCategories: ['malt', 'adjunct'] as IngredientCategory[],
      badge: '+1 Spices on Draft',
      effectKey: 'draft_bonus_spices' as const,
      effectText: 'When drafting tokens, take +1 Spices from the Market.',
      flavorText: 'Hunts the finest seasonal botanicals and spices.',
      targetZone: 1 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 4,
    id: 'upgrade_04',
    name: 'Inventory Vault / Yeast Propagator',
    installTokens: { yeast: 1, grain: 1 },
    targetZone: 1 as const,
    headerBadge: '+3 Storage Slots',
    footerBadge: '+1 Yeast on Draft',
    equipment: {
      name: 'Inventory Vault',
      type: 'equipment' as const,
      costCategories: ['yeast', 'malt'] as IngredientCategory[],
      badge: '+3 Storage Slots',
      effectKey: 'warehouse_capacity_plus_3_general' as const,
      effectText: '+3 general storage slots (expands warehouse capacity by 3).',
      flavorText: 'Expanded steel mezzanine raises warehouse storage ceiling.',
      targetZone: 1 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Yeast Propagator',
      type: 'staff' as const,
      costCategories: ['yeast', 'malt'] as IngredientCategory[],
      badge: '+1 Yeast on Draft',
      effectKey: 'draft_bonus_yeast' as const,
      effectText: 'When drafting tokens, take +1 Yeast from the Market.',
      flavorText: 'Pure culture propagation doubles vitality on yeast harvest.',
      targetZone: 1 as const,
      bonusEndgameVp: 0,
    },
  },

  // Zone 2: Brewhouse Kettle (4 Cards)
  {
    cardNumber: 5,
    id: 'upgrade_05',
    name: 'Copper Mash Tun / Spicemaster',
    installTokens: { grain: 2 },
    targetZone: 2 as const,
    headerBadge: '-1 Grain Brew Cost',
    footerBadge: '+1 Spices on Draft',
    equipment: {
      name: 'Copper Mash Tun',
      type: 'equipment' as const,
      costCategories: ['malt'] as IngredientCategory[],
      badge: '-1 Grain Brew Cost',
      effectKey: 'kettle_discount_malt' as const,
      effectText: 'Reduces Grain cost by 1 (minimum 1 paid) when brewing.',
      flavorText: 'Hammered copper vessel provides optimal enzymatic starch conversion.',
      targetZone: 2 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Spicemaster',
      type: 'staff' as const,
      costCategories: ['malt'] as IngredientCategory[],
      badge: '+1 Spices on Draft',
      effectKey: 'draft_bonus_spices' as const,
      effectText: 'When drafting tokens, take +1 Spices from the Market.',
      flavorText: 'Expert in delicate spice additions and bitter orange peel.',
      targetZone: 2 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 6,
    id: 'upgrade_06',
    name: 'Stainless Hop Back / Mash Tun Tender',
    installTokens: { hops: 2 },
    targetZone: 2 as const,
    headerBadge: '-1 Hops Brew Cost',
    footerBadge: 'Retain 1 Spent Grain',
    equipment: {
      name: 'Stainless Hop Back',
      type: 'equipment' as const,
      costCategories: ['hops'] as IngredientCategory[],
      badge: '-1 Hops Brew Cost',
      effectKey: 'kettle_discount_hops' as const,
      effectText: 'Reduces Hops cost by 1 (minimum 1 paid) when brewing.',
      flavorText: 'Inline hop filtration extracts volatile oils while using fewer cones.',
      targetZone: 2 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Mash Tun Tender',
      type: 'staff' as const,
      costCategories: ['hops'] as IngredientCategory[],
      badge: 'Retain 1 Spent Grain',
      effectKey: 'retain_spent_grain_on_brew' as const,
      effectText: 'Retain 1 spent Grain in your warehouse when brewing.',
      flavorText: 'Sweeps the mash floor for extra grain when brewing.',
      targetZone: 2 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 7,
    id: 'upgrade_07',
    name: 'Plate Heat Exchanger / Grist Miller',
    installTokens: { yeast: 1, hops: 1 },
    targetZone: 2 as const,
    headerBadge: '-1 Yeast Brew Cost',
    footerBadge: 'Retain 1 Spent Hops',
    equipment: {
      name: 'Plate Heat Exchanger',
      type: 'equipment' as const,
      costCategories: ['yeast', 'hops'] as IngredientCategory[],
      badge: '-1 Yeast Brew Cost',
      effectKey: 'kettle_discount_yeast' as const,
      effectText: 'Reduces Yeast cost by 1 (minimum 1 paid) when brewing.',
      flavorText: 'Rapid counter-current cooling maintains pristine pitch temperature.',
      targetZone: 2 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Grist Miller',
      type: 'staff' as const,
      costCategories: ['yeast', 'hops'] as IngredientCategory[],
      badge: 'Retain 1 Spent Hops',
      effectKey: 'retain_spent_hops_on_brew' as const,
      effectText: 'Retain 1 spent Hops in your warehouse when brewing.',
      flavorText: 'Recovers aromatic hop cones after the boil.',
      targetZone: 2 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 8,
    id: 'upgrade_08',
    name: 'Spent Grain Collector / Brewhouse Chemist',
    installTokens: { grain: 1, chocolate: 1 },
    targetZone: 2 as const,
    headerBadge: 'Retain 1 Spent Grain',
    footerBadge: 'Retain 1 Spent Yeast',
    equipment: {
      name: 'Spent Grain Collector',
      type: 'equipment' as const,
      costCategories: ['malt', 'yeast'] as IngredientCategory[],
      badge: 'Retain 1 Spent Grain',
      effectKey: 'retain_spent_grain_on_brew' as const,
      effectText: 'Retain 1 spent Grain in your warehouse when brewing.',
      flavorText: 'Reclaims high-yield sweet grist before disposal.',
      targetZone: 2 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Brewhouse Chemist',
      type: 'staff' as const,
      costCategories: ['malt', 'yeast'] as IngredientCategory[],
      badge: 'Retain 1 Spent Yeast',
      effectKey: 'retain_spent_yeast_on_brew' as const,
      effectText: 'Retain 1 spent Yeast in your warehouse when brewing.',
      flavorText: 'Harvests thick viable yeast slurry directly from the boil.',
      targetZone: 2 as const,
      bonusEndgameVp: 0,
    },
  },

  // Zone 3: Fermentation Cellar (4 Cards)
  {
    cardNumber: 9,
    id: 'upgrade_09',
    name: 'Oak Aging Foeder / Orchard Lead',
    installTokens: { yeast: 1, fruit: 1 },
    targetZone: 3 as const,
    headerBadge: 'Kickback: +1 Spice/Fruit',
    footerBadge: '+1 Fruit on Draft',
    equipment: {
      name: 'Oak Aging Foeder',
      type: 'equipment' as const,
      costCategories: ['adjunct', 'adjunct'] as IngredientCategory[],
      badge: 'Kickback: +1 Spice/Fruit',
      effectKey: 'advance_cellar_to_pack_take_spice_or_fruit' as const,
      effectText: 'When a beer advances from Cellar to Packaging, take 1 Spice or 1 Fruit.',
      flavorText: 'French oak staves yield complex tannins and bonus flavor botanicals.',
      targetZone: 3 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Orchard Lead',
      type: 'staff' as const,
      costCategories: ['adjunct', 'adjunct'] as IngredientCategory[],
      badge: '+1 Fruit on Draft',
      effectKey: 'draft_bonus_fruit' as const,
      effectText: 'When drafting tokens, take +1 Fruit from the Market.',
      flavorText: 'Direct grower contracts supply pristine harvest berries.',
      targetZone: 3 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 10,
    id: 'upgrade_10',
    name: 'Bright Conditioning Rig / Dark Maltster',
    installTokens: { yeast: 1, chocolate: 1 },
    targetZone: 3 as const,
    headerBadge: 'Kickback: +1 Yeast',
    footerBadge: '+1 Chocolate on Draft',
    equipment: {
      name: 'Bright Conditioning Rig',
      type: 'equipment' as const,
      costCategories: ['yeast', 'malt'] as IngredientCategory[],
      badge: 'Kickback: +1 Yeast',
      effectKey: 'advance_brewhouse_to_cellar_take_yeast' as const,
      effectText: 'When a beer advances from Brewhouse to Cellar, take 1 Yeast.',
      flavorText: 'Carbonation stone and conditioning vessel infuse rich body.',
      targetZone: 3 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Dark Maltster',
      type: 'staff' as const,
      costCategories: ['yeast', 'malt'] as IngredientCategory[],
      badge: '+1 Chocolate on Draft',
      effectKey: 'draft_bonus_chocolate' as const,
      effectText: 'When drafting tokens, take +1 Chocolate from the Market.',
      flavorText: 'Kilns roasted barleys to perfection for dark lagers.',
      targetZone: 3 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 11,
    id: 'upgrade_11',
    name: 'Conical Unitank / Head Cellarman',
    installTokens: { yeast: 1, grain: 1 },
    targetZone: 3 as const,
    headerBadge: 'Kickback: +1 Hops',
    footerBadge: '+1 Yeast on Draft',
    equipment: {
      name: 'Conical Unitank',
      type: 'equipment' as const,
      costCategories: ['yeast', 'malt'] as IngredientCategory[],
      badge: 'Kickback: +1 Hops',
      effectKey: 'advance_cellar_to_pack_take_hops' as const,
      effectText: 'When a beer advances from Cellar to Packaging, take 1 Hops.',
      flavorText: 'Pressurized bottom cone drops yeast rapidly for accelerated transfer.',
      targetZone: 3 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Head Cellarman',
      type: 'staff' as const,
      costCategories: ['yeast', 'malt'] as IngredientCategory[],
      badge: '+1 Yeast on Draft',
      effectKey: 'draft_bonus_yeast' as const,
      effectText: 'When drafting tokens, take +1 Yeast from the Market.',
      flavorText: 'Oversees flawless pitching rates and vigorous attenuation.',
      targetZone: 3 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 12,
    id: 'upgrade_12',
    name: 'Horizontal Lagering Tank / Dry-Hop Lead',
    installTokens: { yeast: 1, hops: 1 },
    targetZone: 3 as const,
    headerBadge: 'Kickback: +1 Grain',
    footerBadge: '+1 Hops on Draft',
    equipment: {
      name: 'Horizontal Lagering Tank',
      type: 'equipment' as const,
      costCategories: ['yeast', 'hops'] as IngredientCategory[],
      badge: 'Kickback: +1 Grain',
      effectKey: 'advance_brewhouse_to_cellar_take_grain' as const,
      effectText: 'When a beer advances from Brewhouse to Cellar, take 1 Grain.',
      flavorText: 'Low hydrostatic pressure allows extended cold maturation.',
      targetZone: 3 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Dry-Hop Lead',
      type: 'staff' as const,
      costCategories: ['yeast', 'hops'] as IngredientCategory[],
      badge: '+1 Hops on Draft',
      effectKey: 'draft_bonus_hops' as const,
      effectText: 'When drafting tokens, take +1 Hops from the Market.',
      flavorText: 'Timing cellar hop additions right at terminal gravity.',
      targetZone: 3 as const,
      bonusEndgameVp: 0,
    },
  },

  // Zone 4: Packaging & Distribution (4 Cards)
  {
    cardNumber: 13,
    id: 'upgrade_13',
    name: 'Cold Distribution Vault / Taproom Lead',
    installTokens: { hops: 1, spices: 1 },
    targetZone: 4 as const,
    headerBadge: '+2 General Storage',
    footerBadge: 'Delivery: +1 Pantry',
    equipment: {
      name: 'Cold Distribution Vault',
      type: 'equipment' as const,
      costCategories: ['hops', 'adjunct'] as IngredientCategory[],
      badge: '+2 General Storage',
      effectKey: 'warehouse_capacity_plus_2_any' as const,
      effectText: '+2 general storage slots (store any tokens in your warehouse).',
      flavorText: 'Walk-in cold storage accommodates overflow pallets of ingredients.',
      targetZone: 4 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Taproom Lead',
      type: 'staff' as const,
      costCategories: ['hops', 'adjunct'] as IngredientCategory[],
      badge: 'Delivery: +1 Pantry',
      effectKey: 'delivery_take_pantry_token' as const,
      effectText: 'Take 1 Pantry token when delivering to the Trophy Rack.',
      flavorText: 'Taproom patrons bring unique ingredient trades on delivery day.',
      targetZone: 4 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 14,
    id: 'upgrade_14',
    name: 'Automated Keg Racker / Freight Lead',
    installTokens: { grain: 1, yeast: 1 },
    targetZone: 4 as const,
    headerBadge: 'Delivery: +1 Grain & +1 Yeast',
    footerBadge: '+1 Grain on Draft',
    equipment: {
      name: 'Automated Keg Racker',
      type: 'equipment' as const,
      costCategories: ['malt', 'yeast'] as IngredientCategory[],
      badge: 'Delivery: +1 Grain & +1 Yeast',
      effectKey: 'delivery_take_grain_and_yeast' as const,
      effectText: 'Take 1 Grain and 1 Yeast when delivering to the Trophy Rack.',
      flavorText: 'Turnkey keg washing and filling system streamlines distributor returns.',
      targetZone: 4 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Freight Lead',
      type: 'staff' as const,
      costCategories: ['malt', 'yeast'] as IngredientCategory[],
      badge: '+1 Grain on Draft',
      effectKey: 'draft_bonus_grain' as const,
      effectText: 'When drafting tokens, take +1 Grain from the Market.',
      flavorText: 'Manages incoming grain freight on the loading dock.',
      targetZone: 4 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 15,
    id: 'upgrade_15',
    name: 'Pallet Stretch Wrapper / Dock Expediter',
    installTokens: { grain: 1, spices: 1 },
    targetZone: 4 as const,
    headerBadge: 'Delivery: Retain 1 Token',
    footerBadge: 'Delivery: +1 Market Token',
    equipment: {
      name: 'Pallet Stretch Wrapper',
      type: 'equipment' as const,
      costCategories: ['malt', 'adjunct'] as IngredientCategory[],
      badge: 'Delivery: Retain 1 Token',
      effectKey: 'delivery_retain_spent_token' as const,
      effectText: 'Retain 1 spent token when delivering a recipe to the Trophy Rack.',
      flavorText: 'Automated turntable wraps full pallets ready for inter-city transport.',
      targetZone: 4 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Dock Expediter',
      type: 'staff' as const,
      costCategories: ['malt', 'adjunct'] as IngredientCategory[],
      badge: 'Delivery: +1 Market Token',
      effectKey: 'delivery_take_kettle_token' as const,
      effectText: 'Take 1 token of any type from the Market when delivering to Trophy Rack.',
      flavorText: 'Secures expedited freight rates and priority depot routing.',
      targetZone: 4 as const,
      bonusEndgameVp: 0,
    },
  },
  {
    cardNumber: 16,
    id: 'upgrade_16',
    name: 'Rotary Canning Line / Route Driver',
    installTokens: { grain: 1, spices: 1 },
    targetZone: 4 as const,
    headerBadge: '-1 Grain Equip Cost',
    footerBadge: 'Packaging: +1 Market Token',
    equipment: {
      name: 'Rotary Canning Line',
      type: 'equipment' as const,
      costCategories: ['malt', 'hops'] as IngredientCategory[],
      badge: '-1 Grain Equip Cost',
      effectKey: 'pay_1_less_grain_install_equipment' as const,
      effectText: 'Pay 1 less Grain when installing Equipment.',
      flavorText: 'High-speed automated seaming frees resources for hardware builds.',
      targetZone: 4 as const,
      bonusEndgameVp: 0,
    },
    staff: {
      name: 'Route Driver',
      type: 'staff' as const,
      costCategories: ['malt', 'hops'] as IngredientCategory[],
      badge: 'Packaging: +1 Market Token',
      effectKey: 'package_beer_take_kettle_token' as const,
      effectText: 'Take 1 token of any type from the Market when packaging a beer.',
      flavorText: 'Returns from island deliveries with surplus keg deposits and tokens.',
      targetZone: 4 as const,
      bonusEndgameVp: 0,
    },
  },
];

// ============================================================================
// DEDICATED EQUIPMENT DECK (Station #1 Market • 20 Unique Cards: 4 per 5 Zones)
// 1 VP cards: 1 Cheap (Grain, Hops, or Yeast)
// 2 VP cards: 2 Cheap OR 1 Expensive (Chocolate, Spices, or Fruit)
// 3 VP cards: 1 Cheap + 1 Expensive
// ============================================================================
export const EQUIPMENT_DECK_DEFS: Omit<UpgradeCard, 'id'>[] = [
  // Zone 1: Warehouse & Storage Expansion (Raw Storage Detents)
  {
    cardNumber: 1,
    name: 'High-Capacity Hopper',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 1,
    costCategories: ['malt'],
    installTokens: { grain: 2 },
    headerBadge: '+2 Grain Storage',
    effectKey: 'warehouse_capacity_plus_2_grain',
    effectText: '+2 Grain storage slots (store on the 2 printed circles on this card).',
    flavorText: 'Expands bulk storage detents dedicated to base grain.',
    imagePath: '/upgrades/high-capacity-hopper.jpg',
    storageSlots: 2,
    storageAllowedToken: 'grain',
    bonusEndgameVp: 2,
  },
  {
    cardNumber: 2,
    name: 'Cryo-Hop Storage',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 1,
    costCategories: ['hops'],
    installTokens: { hops: 2 },
    headerBadge: '+2 Hops Storage',
    effectKey: 'warehouse_capacity_plus_2_hops',
    effectText: '+2 Hops storage slots (store on the 2 printed circles on this card).',
    flavorText: 'Sub-zero nitrogen conditioning keeps fresh harvest hops potent.',
    imagePath: '/upgrades/cryo-hop-storage.jpg',
    storageSlots: 2,
    storageAllowedToken: 'hops',
    bonusEndgameVp: 2,
  },
  {
    cardNumber: 3,
    name: 'Roasted Malt Bin',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 1,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: '+2 Chocolate Storage',
    effectKey: 'warehouse_capacity_plus_2_chocolate',
    effectText: '+2 Chocolate storage slots (store on the 2 printed circles on this card).',
    flavorText: 'Dedicated dry bins preserve specialty chocolate roast aromatics.',
    imagePath: '/upgrades/roasted-malt-bin.jpg',
    storageSlots: 2,
    storageAllowedToken: 'chocolate',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 4,
    name: 'Bulk Pallet Racks',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 1,
    costCategories: ['malt', 'hops'],
    installTokens: { grain: 1, hops: 1 },
    headerBadge: '+2 Any Storage',
    effectKey: 'warehouse_capacity_plus_2_any',
    effectText: '+2 general storage slots for any tokens (store on the 2 printed circles on this card).',
    flavorText: 'Heavy-duty industrial racking holds overflow pallets of any raw ingredient.',
    imagePath: '/upgrades/bulk-pallet-racks.jpg',
    storageSlots: 2,
    storageAllowedToken: 'any',
    bonusEndgameVp: 2,
  },

  // Zone 2: Brewhouse Kettle (Cost Reductions & Spent Recovery)
  {
    cardNumber: 5,
    name: 'Copper Mash Tun',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 2,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: '-1 Grain Brew Cost',
    effectKey: 'kettle_discount_malt',
    effectText: 'When brewing a recipe requiring 2 or more Grain, reduce the Grain cost by 1 (minimum 1 paid).',
    flavorText: 'Hammered copper vessel provides optimal enzymatic starch conversion.',
    imagePath: '/upgrades/copper-mash-tun.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 6,
    name: 'Stainless Hop Back',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 2,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: '-1 Hops Brew Cost',
    effectKey: 'kettle_discount_hops',
    effectText: 'When brewing a recipe requiring 2 or more Hops, reduce the Hops cost by 1 (minimum 1 paid).',
    flavorText: 'Inline hop filtration extracts volatile oils while using fewer cones.',
    imagePath: '/upgrades/stainless-hop-back.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 7,
    name: 'Spent Grain Collector',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 2,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: 'Retain 1 Spent Grain',
    effectKey: 'retain_spent_grain_on_brew',
    effectText: 'Whenever you brew a recipe in the Brewhouse, retain 1 spent Grain in your Warehouse instead of returning it.',
    flavorText: 'Reclaims high-yield sweet grist before disposal.',
    imagePath: '/upgrades/spent-grain-collector.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 8,
    name: 'Whirlpool Aerator',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 2,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: '-1 Yeast Brew Cost',
    effectKey: 'kettle_discount_yeast',
    effectText: 'When brewing a recipe requiring 2 or more Yeast, reduce the Yeast cost by 1 (minimum 1 paid).',
    flavorText: 'High-shear sanitary wort aeration kickstarts pitch viability.',
    imagePath: '/upgrades/whirlpool-aerator.jpg',
    bonusEndgameVp: 1,
  },

  // Zone 3: Fermentation Cellar (Pitch Temperature & Cellar Kickbacks)
  {
    cardNumber: 9,
    name: 'Plate Heat Exchanger',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 3,
    costCategories: ['yeast'],
    installTokens: { yeast: 1 },
    headerBadge: 'Kickback: +1 Yeast',
    effectKey: 'advance_cellar_to_pack_take_yeast',
    effectText: 'When a beer advances from the Cellar into the Cold Room, take 1 Yeast from the Market.',
    flavorText: 'Rapid counter-current cooling maintains pristine pitch temperature.',
    imagePath: '/upgrades/plate-heat-exchanger.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 10,
    name: 'Conical Unitank',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 3,
    costCategories: ['yeast'],
    installTokens: { yeast: 1 },
    headerBadge: 'Kickback: +1 Hops',
    effectKey: 'advance_cellar_to_pack_take_hops',
    effectText: 'When a beer advances from the Cellar into the Cold Room, take 1 Hops from the Market.',
    flavorText: 'Pressurized bottom cone drops yeast rapidly for accelerated transfer.',
    imagePath: '/upgrades/conical-unitank.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 11,
    name: 'Oak Aging Foeder',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 3,
    costCategories: ['yeast'],
    installTokens: { yeast: 1 },
    headerBadge: 'Kickback: +1 Spices',
    effectKey: 'advance_cellar_to_pack_take_spices',
    effectText: 'When a beer advances from the Cellar into the Cold Room, take 1 Spices from the Market.',
    flavorText: 'French oak staves yield complex tannins and rich vanilla/botanical spice aromatics.',
    imagePath: '/upgrades/oak-aging-foeder.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 12,
    name: 'Glycol Cooling Jacket',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 3,
    costCategories: ['yeast'],
    installTokens: { yeast: 1 },
    headerBadge: 'Kickback: +1 Grain',
    effectKey: 'advance_cellar_to_pack_take_grain',
    effectText: 'When a beer advances from the Cellar into the Cold Room, take 1 Grain from the Market.',
    flavorText: 'Precision temp control stabilizes krausen and malt profile.',
    imagePath: '/upgrades/glycol-cooling-jacket.jpg',
    bonusEndgameVp: 1,
  },

  // Zone 4: Conditioning & Lagering (Cold Cellar Kickbacks & Storage)
  {
    cardNumber: 13,
    name: 'Horizontal Lagering Tank',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 4,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: 'Kickback: +1 Grain',
    effectKey: 'advance_brewhouse_to_cellar_take_grain',
    effectText: 'When a beer advances into the Cold Room, take 1 Grain from the Market.',
    flavorText: 'Low hydrostatic pressure allows extended cold maturation.',
    imagePath: '/upgrades/horizontal-lagering-tank.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 14,
    name: 'Bright Conditioning Rig',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 4,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: 'Kickback: +1 Yeast',
    effectKey: 'advance_brewhouse_to_cellar_take_yeast',
    effectText: 'When a beer advances into the Cold Room, take 1 Yeast from the Market.',
    flavorText: 'Carbonation stone and conditioning vessel infuse rich body.',
    imagePath: '/upgrades/bright-conditioning-rig.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 15,
    name: 'Cold Distribution Vault',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 4,
    costCategories: ['hops', 'yeast'],
    installTokens: { hops: 1, yeast: 1 },
    headerBadge: '+2 General Storage',
    effectKey: 'cold_vault_capacity_plus_2_any',
    effectText: '+2 general storage slots for any tokens (store on the 2 printed circles on this card).',
    flavorText: 'Walk-in cold cellar accommodates overflow pallets of ingredients.',
    imagePath: '/upgrades/cold-distribution-vault.jpg',
    storageSlots: 2,
    storageAllowedToken: 'any',
    bonusEndgameVp: 2,
  },
  {
    cardNumber: 16,
    name: 'Centrifuge Clarifier',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 4,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: 'Kickback: +1 Hops',
    effectKey: 'advance_brewhouse_to_cellar_take_hops',
    effectText: 'When a beer advances into the Cold Room, take 1 Hops from the Market.',
    flavorText: 'High-G rotational separation clears hop solids without stripping oils.',
    imagePath: '/upgrades/centrifuge-clarifier.jpg',
    bonusEndgameVp: 1,
  },

  // Zone 5: Packaging & Distribution (Final Paydays & Logistics)
  {
    cardNumber: 17,
    name: 'Automated Keg Racker',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 5,
    costCategories: ['malt', 'adjunct'],
    installTokens: { grain: 1, chocolate: 1 },
    headerBadge: 'Delivery: +1 Grain & +1 Yeast',
    effectKey: 'delivery_take_grain_and_yeast',
    effectText: 'Whenever you deliver a recipe to the Trophy Rack, take 1 Grain and 1 Yeast from the Market.',
    flavorText: 'Turnkey keg washing and filling system streamlines distributor returns.',
    imagePath: '/upgrades/automated-keg-racker.jpg',
    bonusEndgameVp: 3,
  },
  {
    cardNumber: 18,
    name: 'Pallet Stretch Wrapper',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 5,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: 'Delivery: Retain 1 Spent Grain',
    effectKey: 'delivery_retain_spent_grain',
    effectText: 'When delivering a beer to your Trophy Rack, retain 1 spent Grain from that recipe.',
    flavorText: 'Automated turntable wraps full pallets ready for inter-city transport.',
    imagePath: '/upgrades/pallet-stretch-wrapper.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 19,
    name: 'Rotary Canning Line',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 5,
    costCategories: ['malt', 'hops'],
    installTokens: { grain: 1, hops: 1 },
    headerBadge: '-1 Grain Equip Cost',
    effectKey: 'pay_1_less_grain_install_equipment',
    effectText: 'Pay 1 less Grain when installing any other Equipment card.',
    flavorText: 'High-speed automated seaming frees resources for hardware builds.',
    imagePath: '/upgrades/rotary-canning-line.jpg',
    bonusEndgameVp: 2,
  },
  {
    cardNumber: 20,
    name: 'Case Packer & Date Coder',
    deckType: 'upgrade',
    cardKind: 'equipment',
    targetZone: 5,
    costCategories: ['malt', 'hops'],
    installTokens: { grain: 1, hops: 1 },
    headerBadge: 'Delivery: +1 Hops',
    effectKey: 'delivery_take_hops',
    effectText: 'Whenever you deliver a recipe to the Trophy Rack, take 1 Hops from the Market.',
    flavorText: 'Laser batch coding and automated corrugated packing finish the run.',
    imagePath: '/upgrades/case-packer-date-coder.jpg',
    bonusEndgameVp: 2,
  },
];

// ============================================================================
// DEDICATED STAFF DECK (Station #2 Market • 20 Unique Cards: 4 per 5 Zones)
// 1 VP cards: 1 Cheap (Grain, Hops, or Yeast)
// 2 VP cards: 2 Cheap OR 1 Expensive (Chocolate, Spices, or Fruit)
// 3 VP cards: 1 Cheap + 1 Expensive
// ============================================================================
export const STAFF_DECK_DEFS: Omit<UpgradeCard, 'id'>[] = [
  // Zone 1: Warehouse Storage & Sourcing (Raw Detents & Universal Capacity)
  {
    cardNumber: 1,
    name: 'Yeast Lab Tech',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 1,
    costCategories: ['malt'],
    installTokens: { grain: 2 },
    headerBadge: '+2 Yeast Storage',
    footerBadge: '+2 Yeast Storage',
    effectKey: 'warehouse_capacity_plus_2_yeast',
    effectText: '+2 Yeast storage slots (store on the 2 printed circles on this card).',
    flavorText: 'Maintains cryo-bank agar slants and pure pitching cultures.',
    imagePath: '/upgrades/staff-yeast-propagator.jpg',
    storageSlots: 2,
    storageAllowedToken: 'yeast',
    bonusEndgameVp: 2,
  },
  {
    cardNumber: 2,
    name: 'Orchard Expediter',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 1,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: '+2 Fruit Storage',
    footerBadge: '+2 Fruit Storage',
    effectKey: 'warehouse_capacity_plus_2_fruit',
    effectText: '+2 Fruit storage slots (store on the 2 printed circles on this card).',
    flavorText: 'Cold-chain contracts keep freshly picked harvest berries pristine.',
    imagePath: '/upgrades/staff-orchard-expediter.jpg',
    storageSlots: 2,
    storageAllowedToken: 'fruit',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 3,
    name: 'Spice Curator',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 1,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: '+2 Spice Storage',
    footerBadge: '+2 Spice Storage',
    effectKey: 'warehouse_capacity_plus_2_spices',
    effectText: '+2 Spice storage slots (store on the 2 printed circles on this card).',
    flavorText: 'Airtight dry cellar preserves exotic botanicals, peel, and pods.',
    imagePath: '/upgrades/staff-spice-forager.jpg',
    storageSlots: 2,
    storageAllowedToken: 'spices',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 4,
    name: 'Warehouse Foreman',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 1,
    costCategories: ['malt', 'hops'],
    installTokens: { grain: 1, hops: 1 },
    headerBadge: '+2 Any Storage',
    footerBadge: '+2 Any Storage',
    effectKey: 'warehouse_capacity_plus_2_any',
    effectText: '+2 general storage slots for any tokens (store on the 2 printed circles on this card).',
    flavorText: 'Floor master optimizes pallets and detents for total intake flexibility.',
    imagePath: '/upgrades/staff-malt-handler.jpg',
    storageSlots: 2,
    storageAllowedToken: 'any',
    bonusEndgameVp: 2,
  },

  // Zone 2: Brew Floor Hustlers (Recovery & Sourcing)
  {
    cardNumber: 5,
    name: 'Mash Tun Tender',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 2,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: 'Retain 1 Spent Grain',
    footerBadge: 'Retain 1 Spent Grain',
    effectKey: 'retain_spent_grain_on_brew',
    effectText: 'Whenever you brew a recipe in the Brewhouse, retain 1 spent Grain in your Warehouse instead of returning it.',
    flavorText: 'Sweeps the mash floor for extra grain when brewing.',
    imagePath: '/upgrades/staff-mash-tun-tender.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 6,
    name: 'Grist Miller',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 2,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: 'Retain 1 Spent Hops',
    footerBadge: 'Retain 1 Spent Hops',
    effectKey: 'retain_spent_hops_on_brew',
    effectText: 'Whenever you brew a recipe in the Brewhouse, retain 1 spent Hops in your Warehouse instead of returning it.',
    flavorText: 'Recovers aromatic hop cones after the boil.',
    imagePath: '/upgrades/staff-grist-miller.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 7,
    name: 'Spicemaster',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 2,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: '+1 Spices at Market',
    footerBadge: '+1 Spices at Market',
    effectKey: 'draft_bonus_station_2_spices',
    effectText: 'When buying Spices at the Market, take +1 Spices.',
    flavorText: 'Expert in delicate spice additions and bitter orange peel.',
    imagePath: '/upgrades/staff-spicemaster.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 8,
    name: 'Kettle Operator',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 2,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: 'Retain 1 Spent Chocolate',
    footerBadge: 'Retain 1 Spent Chocolate',
    effectKey: 'retain_spent_chocolate_on_brew',
    effectText: 'Whenever you brew a recipe in the Brewhouse, retain 1 spent Chocolate in your Warehouse instead of returning it.',
    flavorText: 'Manages strike water and specialty dark malt roast extraction.',
    imagePath: '/upgrades/staff-kettle-operator.jpg',
    bonusEndgameVp: 1,
  },

  // Zone 3: Fermentation Specialists
  {
    cardNumber: 9,
    name: 'Head Cellarman',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 3,
    costCategories: ['yeast'],
    installTokens: { yeast: 1 },
    headerBadge: '+1 Yeast at Market',
    footerBadge: '+1 Yeast at Market',
    effectKey: 'draft_bonus_station_4_yeast',
    effectText: 'When buying Yeast at the Market, take +1 Yeast.',
    flavorText: 'Oversees flawless pitching rates and vigorous attenuation.',
    imagePath: '/upgrades/staff-head-cellarman.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 10,
    name: 'Brewhouse Chemist',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 3,
    costCategories: ['yeast'],
    installTokens: { yeast: 1 },
    headerBadge: 'Retain 1 Spent Yeast',
    footerBadge: 'Retain 1 Spent Yeast',
    effectKey: 'retain_spent_yeast_on_brew',
    effectText: 'Whenever you brew a recipe in the Brewhouse, retain 1 spent Yeast in your Warehouse instead of returning it.',
    flavorText: 'Harvests thick viable yeast slurry directly from the boil.',
    imagePath: '/upgrades/staff-brewhouse-chemist.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 11,
    name: 'Hop Broker',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 3,
    costCategories: ['yeast'],
    installTokens: { yeast: 1 },
    headerBadge: '+1 Hops at Market',
    footerBadge: '+1 Hops at Market',
    effectKey: 'draft_bonus_station_5_hops',
    effectText: 'When buying Hops at the Market, take +1 Hops.',
    flavorText: 'Direct relationships with Yakima growers yield extra cones on draft.',
    imagePath: '/upgrades/staff-hop-broker.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 12,
    name: 'Cellar Apprentice',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 3,
    costCategories: ['yeast'],
    installTokens: { yeast: 1 },
    headerBadge: 'Kickback: +1 Yeast',
    footerBadge: 'Kickback: +1 Yeast',
    effectKey: 'advance_brewhouse_to_cellar_take_yeast',
    effectText: 'When a beer advances into the Cold Room, take 1 Yeast from the Market.',
    flavorText: 'Eager cellar apprentice monitors fermentation curves day and night.',
    imagePath: '/upgrades/staff-cellar-apprentice.jpg',
    bonusEndgameVp: 1,
  },
  // Zone 4: Conditioning & Lagering Specialists
  {
    cardNumber: 13,
    name: 'Orchard Lead',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 4,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: '+1 Fruit at Market',
    footerBadge: '+1 Fruit at Market',
    effectKey: 'draft_bonus_station_3_fruit',
    effectText: 'When buying Fruit at the Market, take +1 Fruit.',
    flavorText: 'Direct grower contracts supply pristine harvest berries.',
    imagePath: '/upgrades/staff-orchard-lead.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 14,
    name: 'Dark Maltster',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 4,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: '+1 Chocolate at Market',
    footerBadge: '+1 Chocolate at Market',
    effectKey: 'draft_bonus_station_1_chocolate',
    effectText: 'When buying Chocolate at the Market, take +1 Chocolate.',
    flavorText: 'Kilns roasted barleys to perfection for dark lagers.',
    imagePath: '/upgrades/staff-dark-maltster.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 15,
    name: 'Dry-Hop Lead',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 4,
    costCategories: ['hops'],
    installTokens: { hops: 1 },
    headerBadge: 'Kickback: +1 Hops',
    footerBadge: 'Kickback: +1 Hops',
    effectKey: 'advance_brewhouse_to_cellar_take_hops',
    effectText: 'When a beer advances into the Cold Room, take 1 Hops from the Market.',
    flavorText: 'Timing cellar hop additions right at terminal gravity.',
    imagePath: '/upgrades/staff-dry-hop-lead.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 16,
    name: 'Quality Assurance Lead',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 4,
    costCategories: ['hops', 'yeast'],
    installTokens: { hops: 1, yeast: 1 },
    headerBadge: 'Delivery: Retain 1 Spent Hops',
    footerBadge: 'Delivery: Retain 1 Spent Hops',
    effectKey: 'delivery_retain_spent_hops',
    effectText: 'When delivering a beer to your Trophy Rack, retain 1 spent Hops from that recipe.',
    flavorText: 'Sensory and micro testing guarantees world-class clarity and mouthfeel.',
    imagePath: '/upgrades/staff-qa-lead.jpg',
    bonusEndgameVp: 2,
  },
  // Zone 5: Delivery & Logistics (Final Paydays)
  {
    cardNumber: 17,
    name: 'Taproom Lead',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 5,
    costCategories: ['malt', 'adjunct'],
    installTokens: { grain: 1, spices: 1 },
    headerBadge: 'Delivery: +1 Spices',
    footerBadge: 'Delivery: +1 Spices',
    effectKey: 'delivery_take_spices',
    effectText: 'Whenever you deliver a recipe to the Trophy Rack, take 1 Spices from the Market.',
    flavorText: 'Taproom patrons bring unique ingredient trades on delivery day.',
    imagePath: '/upgrades/staff-taproom-lead.jpg',
    bonusEndgameVp: 3,
  },
  {
    cardNumber: 18,
    name: 'Freight Lead',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 5,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: '+1 Grain at Market',
    footerBadge: '+1 Grain at Market',
    effectKey: 'draft_bonus_station_6_grain',
    effectText: 'When buying Grain at the Market, take +1 Grain.',
    flavorText: 'Manages incoming grain freight on the loading dock.',
    imagePath: '/upgrades/staff-freight-lead.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 19,
    name: 'Route Driver',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 5,
    costCategories: ['malt'],
    installTokens: { grain: 1 },
    headerBadge: 'Packaging: +1 Grain',
    footerBadge: 'Packaging: +1 Grain',
    effectKey: 'package_beer_take_grain',
    effectText: 'Whenever you package a beer into Packaging, take 1 Grain from the Market.',
    flavorText: 'Reliable distribution driver keeps the steam truck loaded.',
    imagePath: '/upgrades/staff-route-driver.jpg',
    bonusEndgameVp: 1,
  },
  {
    cardNumber: 20,
    name: 'Brand Ambassador',
    deckType: 'upgrade',
    cardKind: 'staff',
    targetZone: 5,
    costCategories: ['malt', 'adjunct'],
    installTokens: { grain: 1, fruit: 1 },
    headerBadge: 'Delivery: +1 Market Token',
    footerBadge: 'Delivery: +1 Market Token',
    effectKey: 'delivery_take_market_token',
    effectText: 'Whenever you deliver a recipe to the Trophy Rack, take 1 token of any type from the Market.',
    flavorText: 'Champions the brewery across Vancouver Island and BC craft taps.',
    imagePath: '/upgrades/staff-brand-ambassador.jpg',
    bonusEndgameVp: 3,
  },
];

export function createEquipmentDeck(): UpgradeCard[] {
  return EQUIPMENT_DECK_DEFS.map((def) => ({
    ...def,
    id: `equip_${def.cardNumber}`,
    equipment: {
      name: def.name,
      type: 'equipment' as const,
      costCategories: def.costCategories || ['malt'],
      badge: def.headerBadge,
      effectKey: def.effectKey!,
      effectText: def.effectText!,
      flavorText: def.flavorText,
      targetZone: def.targetZone,
      bonusEndgameVp: def.bonusEndgameVp ?? 1,
    },
    bonusEndgameVp: def.bonusEndgameVp ?? 1,
    upgradeType: 'equipment',
  }));
}

export function createStaffDeck(): UpgradeCard[] {
  return STAFF_DECK_DEFS.map((def) => ({
    ...def,
    id: `staff_${def.cardNumber}`,
    staff: {
      name: def.name,
      type: 'staff' as const,
      costCategories: def.costCategories || ['malt'],
      badge: def.footerBadge || def.headerBadge,
      effectKey: def.effectKey!,
      effectText: def.effectText!,
      flavorText: def.flavorText,
      targetZone: def.targetZone,
      bonusEndgameVp: def.bonusEndgameVp ?? 1,
    },
    bonusEndgameVp: def.bonusEndgameVp ?? 1,
    upgradeType: 'staff',
  }));
}

export function createUpgradeDeck(): UpgradeCard[] {
  return MASTER_UPGRADE_DECK_DEFS.map((def) => ({
    ...def,
    bonusEndgameVp: 0,
    deckType: 'upgrade' as const,
  }));
}


/**
 * Master 97-Card Brewery Deck:
 * - 57 Recipe Cards (~59% draw probability)
 * - 40 Dual-Purpose / Universal Wing Upgrade Cards (~41% draw probability)
 */
export function createBreweryDeck(): (RecipeCard | UpgradeCard)[] {
  return [...createRecipeDeck(), ...createUpgradeDeck()];
}

export function createTaproomDeck(): (RecipeCard | UpgradeCard)[] {
  return createBreweryDeck();
}

export interface MixerPackDefinition {
  key: 'in_good_time' | 'four_fine_friends' | 'hello_sunshine' | 'hello_darkness';
  name: string;
  vp: number;
  requiredRecipes: string[];
  imagePath: string;
  flavorText: string;
}

export const MIXER_PACK_DEFINITIONS: MixerPackDefinition[] = [
  {
    key: 'in_good_time',
    name: 'In Good Time',
    vp: 4,
    requiredRecipes: [
      'Švec Czech Half Dark Lager',
      'Por Favor Mexican Style Lager',
      'Che Bello',
      'Hoyne Pilsner',
    ],
    imagePath: '/mixers/in-good-time.png',
    flavorText:
      'An 8-pack celebration of slow-conditioned, patient European and Mexican lager traditions.',
  },
  {
    key: 'four_fine_friends',
    name: 'Four Fine Friends',
    vp: 5,
    requiredRecipes: [
      'Dark Matter',
      'Down Easy Pale Ale',
      'Helios Dortmunder Golden Lager',
      'Hoyne Pilsner',
    ],
    imagePath: '/mixers/four-fine-friends.png',
    flavorText:
      'Hoyne’s flagship 12-pack uniting their four most beloved everyday core standards.',
  },
  {
    key: 'hello_sunshine',
    name: 'Hello Sunshine',
    vp: 6,
    requiredRecipes: [
      'Framboozle Raspberry Ale',
      'Shine On Hazy IPA',
      'Por Favor Mexican Style Lager',
      'Hoyne Pilsner',
    ],
    imagePath: '/mixers/hello-sunshine.png',
    flavorText:
      'A radiant West Coast warm-weather 12-pack featuring bright fruit and refreshing hops.',
  },
  {
    key: 'hello_darkness',
    name: 'Hello Darkness',
    vp: 7,
    requiredRecipes: [
      'Finnegans Irish Stout',
      'Dark Matter',
      "Appleton's Finest English Special Bitter",
      'Among Giants',
    ],
    imagePath: '/mixers/hello-darkness.png',
    flavorText:
      'A hearty fireside winter 12-pack built around roasted malts, rich stouts, and bold Northwest ales.',
  },
];

export function matchRecipeToMixerRequirement(
  recipeName: string,
  requiredName: string
): boolean {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/š/g, 's')
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]/g, '');
  const r1 = clean(recipeName);
  const r2 = clean(requiredName);
  return r1.includes(r2) || r2.includes(r1);
}

/**
 * Creates the 8-card Mixer Pack Bonus Deck (2 copies each of the 4 mixer packs).
 */
export function createMixerPackDeck(): MixerPackCard[] {
  const deck: MixerPackCard[] = [];
  for (const def of MIXER_PACK_DEFINITIONS) {
    for (let copy = 1; copy <= 2; copy++) {
      deck.push({
        id: `mixer_${def.key}_${copy}`,
        key: def.key,
        name: def.name,
        vp: def.vp,
        requiredRecipes: [...def.requiredRecipes],
        imagePath: def.imagePath,
        flavorText: def.flavorText,
      });
    }
  }
  return deck;
}

export function createFullCatalog() {
  const zones = createAssemblyLineCards(6);
  const ingredients = createIngredientDeck();
  const recipes = createRecipeDeck();
  const upgrades = createUpgradeDeck();
  const breweryDeck = createBreweryDeck();
  const mixerDeck = createMixerPackDeck();
  return {
    zones,
    ingredients,
    recipes,
    upgrades,
    breweryDeck,
    taproomDeck: breweryDeck,
    mixerDeck,
    totalCount:
      zones.length + ingredients.length + breweryDeck.length + mixerDeck.length,
  };
}

// ============================================================================
// PERSONAL BREWERY DEPARTMENT DECK (6 Double-Sided Cards • 12 Unique Actions)
// Docks flush to the left of Zone 1 Warehouse.
// Cards are double-sided (Side A / Side B) so players choose their preferred department.
// Numbered 1 to 12 for deterministic Tier 2 shift resolution order!
// ============================================================================
export const BREWERY_DEPARTMENT_DEFINITIONS: BreweryDepartmentCard[] = [
  // --- CARD 1: SHIFT OPERATIONS ---
  {
    id: 'dept_night_shift',
    departmentNumber: 1,
    physicalCardNumber: 1,
    side: 'A',
    flipSideId: 'dept_taproom',
    name: 'Night Shift',
    subtitle: 'Overnight Operations Crew',
    category: 'production',
    flavorText: 'When the city sleeps, the cellar sings. Midnight transfers keep the brewery running 24/7.',
    imagePath: '/zones/zone-2-brewhouse.jpg',
    tokenGraphic: '/tokens/yeast-wood-piece.png',
    iconName: 'Moon',
    actionEffect: {
      type: 'advance_pipeline',
      description: 'Advance all batches rightward; Zone 5 delivers & scores VP!',
    },
  },
  {
    id: 'dept_taproom',
    departmentNumber: 2,
    physicalCardNumber: 1,
    side: 'B',
    flipSideId: 'dept_night_shift',
    name: 'The Taproom',
    subtitle: 'Direct-to-Consumer Draft',
    category: 'commercial',
    flavorText: 'Fresh beer straight from conditioning tanks to the guest glass. No canning line needed.',
    imagePath: '/upgrades/staff-taproom-lead.jpg',
    tokenGraphic: '/tokens/hops-wood-piece.png',
    iconName: 'Beer',
    actionEffect: {
      type: 'taproom_direct_sale',
      description: 'Draft: Move 1 finished beer from Zone 4 directly to Trophy Rack!',
    },
  },

  // --- CARD 2: SOURCING & BARTER ---
  {
    id: 'dept_sourcing_desk',
    departmentNumber: 3,
    physicalCardNumber: 2,
    side: 'A',
    flipSideId: 'dept_farm_swap',
    name: 'Sourcing Desk',
    subtitle: 'Bespoke Purchasing',
    category: 'sourcing',
    flavorText: 'Direct grower relations secure premier lot allocations from the Fraser Valley to Saaz.',
    imagePath: '/board/rotary-dial-artwork.jpg',
    tokenGraphic: '/tokens/hops-wood-piece.png',
    iconName: 'ClipboardCheck',
    actionEffect: {
      type: 'gain_two_distinct',
      description: 'Direct Order: Take 2 tokens of DIFFERENT types from Hoppers.',
    },
  },
  {
    id: 'dept_farm_swap',
    departmentNumber: 4,
    physicalCardNumber: 2,
    side: 'B',
    flipSideId: 'dept_sourcing_desk',
    name: 'Farm Swap',
    subtitle: 'Agricultural Exchange',
    category: 'logistics',
    flavorText: 'Local dairy and hog farmers haul away warm spent mash, trading regional specialties in return.',
    imagePath: '/zones/zone-5-dock.jpg',
    tokenGraphic: '/tokens/grain-wood-piece.png',
    iconName: 'Repeat',
    actionEffect: {
      type: 'farm_swap',
      description: 'Farmer Barter: Trade 1 token from Warehouse for any 2 tokens.',
    },
  },

  // --- CARD 3: RAW BULK INGREDIENTS ---
  {
    id: 'dept_grain_silo',
    departmentNumber: 5,
    physicalCardNumber: 3,
    side: 'A',
    flipSideId: 'dept_hop_locker',
    name: 'Grain Silo',
    subtitle: 'Bulk Malt Storage',
    category: 'logistics',
    flavorText: 'Tonnes of British Columbian two-row malt standing ready for the morning mash-in.',
    imagePath: '/zones/zone-1-grain-warehouse.jpg',
    tokenGraphic: '/tokens/grain-wood-piece.png',
    iconName: 'Wheat',
    passiveEffect: {
      type: 'grain_buffer',
      description: '+1 Grain Buffer: Expands your Warehouse capacity by +1 for Grain tokens.',
      extraCapacityToken: 'grain',
      extraCapacityAmount: 1,
    },
    actionEffect: {
      type: 'gain_grain',
      description: 'Mill Grist: Take 2 Grain tokens from Central Hoppers into Warehouse.',
    },
  },
  {
    id: 'dept_hop_locker',
    departmentNumber: 6,
    physicalCardNumber: 3,
    side: 'B',
    flipSideId: 'dept_grain_silo',
    name: 'Hop Locker',
    subtitle: 'Cryo-Pellet Vault',
    category: 'sourcing',
    flavorText: 'Sub-zero vacuum-sealed nitrogen pouches preserving delicate lupulin oils and volatile aromas.',
    imagePath: '/upgrades/cryo-hop-storage.jpg',
    tokenGraphic: '/tokens/hops-wood-piece.png',
    iconName: 'Snowflake',
    passiveEffect: {
      type: 'hops_buffer',
      description: '+1 Hops Buffer: Expands your Warehouse capacity by +1 for Hops tokens.',
      extraCapacityToken: 'hops',
      extraCapacityAmount: 1,
    },
    actionEffect: {
      type: 'gain_hops_wild',
      description: 'Draft Cryo: Take 1 Hops + 1 Wild token from Central Hoppers.',
    },
  },

  // --- CARD 4: YEAST CULTURE & FORMULATION ---
  {
    id: 'dept_yeast_bank',
    departmentNumber: 7,
    physicalCardNumber: 4,
    side: 'A',
    flipSideId: 'dept_rd_desk',
    name: 'Yeast Bank',
    subtitle: 'Strain Library',
    category: 'sourcing',
    flavorText: 'Cryogenic glycerol stocks preserve pure Saccharomyces and Brettanomyces generations.',
    imagePath: '/upgrades/staff-yeast-propagator.jpg',
    tokenGraphic: '/tokens/yeast-wood-piece.png',
    iconName: 'Dna',
    passiveEffect: {
      type: 'yeast_buffer',
      description: '+1 Yeast Buffer: Expands your Warehouse capacity by +1 for Yeast tokens.',
      extraCapacityToken: 'yeast',
      extraCapacityAmount: 1,
    },
    actionEffect: {
      type: 'yeast_swap',
      description: 'Harvest: Take 1 Yeast token + optional 1:1 token swap.',
    },
  },
  {
    id: 'dept_rd_desk',
    departmentNumber: 8,
    physicalCardNumber: 4,
    side: 'B',
    flipSideId: 'dept_yeast_bank',
    name: 'R&D Lab',
    subtitle: 'Pilot Batch Lab',
    category: 'production',
    flavorText: "Sean Hoyne's formulation notebook: where wild fermentation concepts become flagship ales.",
    imagePath: '/upgrades/staff-brewhouse-chemist.jpg',
    tokenGraphic: '/tokens/yeast-wood-piece.png',
    iconName: 'FlaskConical',
    actionEffect: {
      type: 'draft_recipe_top3',
      description: 'Pilot Lab: Brew top Recipe with -1 Token Discount.',
    },
  },

  // --- CARD 5: INFRASTRUCTURE & TALENT ---
  {
    id: 'dept_maintenance_shop',
    departmentNumber: 9,
    physicalCardNumber: 5,
    side: 'A',
    flipSideId: 'dept_hr_office',
    name: 'Maintenance',
    subtitle: 'Machinery Upgrades',
    category: 'engineering',
    flavorText: 'Steam valves, heat exchangers, and drive belts require obsessive preventive maintenance.',
    imagePath: '/upgrades/rotary-canning-line.jpg',
    tokenGraphic: '/tokens/grain-wood-piece.png',
    iconName: 'Wrench',
    actionEffect: {
      type: 'draft_equipment_top3',
      description: 'Overhaul: Look at top 3 Equipment cards, install 1.',
    },
  },
  {
    id: 'dept_hr_office',
    departmentNumber: 10,
    physicalCardNumber: 5,
    side: 'B',
    flipSideId: 'dept_maintenance_shop',
    name: 'HR Office',
    subtitle: 'Talent Acquisition',
    category: 'personnel',
    flavorText: 'Great beer is brewed by great people. Find the right hands for the cellar floor.',
    imagePath: '/upgrades/staff-brand-ambassador.jpg',
    tokenGraphic: '/tokens/hops-wood-piece.png',
    iconName: 'Users',
    actionEffect: {
      type: 'draft_staff_top3',
      description: 'Recruit: Look at top 3 Staff cards, hire 1.',
    },
  },

  // --- CARD 6: QUALITY ASSURANCE & SPECIALTY CELLARING ---
  {
    id: 'dept_qa_lab',
    departmentNumber: 11,
    physicalCardNumber: 6,
    side: 'A',
    flipSideId: 'dept_oak_cellar',
    name: 'QA Testing',
    subtitle: 'Assay Testing',
    category: 'engineering',
    flavorText: 'Dissolved oxygen assays and microbiological testing guarantee peak cellar freshness and bottle conditioning.',
    imagePath: '/upgrades/staff-qa-lead.jpg',
    tokenGraphic: '/tokens/yeast-wood-piece.png',
    iconName: 'Shield',
    actionEffect: {
      type: 'qa_lab_inspect',
      description: 'QA Assay: Take 1 token + advance 1 batch 1 zone forward.',
    },
  },
  {
    id: 'dept_oak_cellar',
    departmentNumber: 12,
    physicalCardNumber: 6,
    side: 'B',
    flipSideId: 'dept_qa_lab',
    name: 'Oak Cellar',
    subtitle: 'Wild Ale Maturation',
    category: 'production',
    flavorText: 'French oak foudres slowly mature Brettanomyces and wild ales, infusing deep vanilla, tannin, and fruit complexity.',
    imagePath: '/upgrades/oak-aging-foeder.jpg',
    tokenGraphic: '/tokens/chocolate-wood-piece.png',
    iconName: 'Sparkles',
    actionEffect: {
      type: 'oak_cellar_maturation',
      description: 'Maturation: Take 1 Specialty token (Choc/Spice/Fruit).',
    },
  },
];

export const DOUBLE_SIDED_DEPARTMENT_CARDS: DoubleSidedDepartmentCard[] = [
  {
    id: 'dept_card_1',
    cardNumber: 1,
    name: 'Card 1: Shift Operations',
    sideA: BREWERY_DEPARTMENT_DEFINITIONS[0], // #1 The Night Shift
    sideB: BREWERY_DEPARTMENT_DEFINITIONS[1], // #2 The Taproom
    activeSide: 'A',
  },
  {
    id: 'dept_card_2',
    cardNumber: 2,
    name: 'Card 2: Sourcing & Barter',
    sideA: BREWERY_DEPARTMENT_DEFINITIONS[2], // #3 The Sourcing Desk
    sideB: BREWERY_DEPARTMENT_DEFINITIONS[3], // #4 Spent Grain Farm Swap
    activeSide: 'A',
  },
  {
    id: 'dept_card_3',
    cardNumber: 3,
    name: 'Card 3: Raw Ingredients',
    sideA: BREWERY_DEPARTMENT_DEFINITIONS[4], // #5 The Grain Silo & Mill
    sideB: BREWERY_DEPARTMENT_DEFINITIONS[5], // #6 The Hop Cold Locker
    activeSide: 'A',
  },
  {
    id: 'dept_card_4',
    cardNumber: 4,
    name: 'Card 4: Culture & Innovation',
    sideA: BREWERY_DEPARTMENT_DEFINITIONS[6], // #7 Yeast Propagation Bank
    sideB: BREWERY_DEPARTMENT_DEFINITIONS[7], // #8 Master Brewer's R&D Desk
    activeSide: 'A',
  },
  {
    id: 'dept_card_5',
    cardNumber: 5,
    name: 'Card 5: Infrastructure & Talent',
    sideA: BREWERY_DEPARTMENT_DEFINITIONS[8], // #9 Equipment Maintenance Shop
    sideB: BREWERY_DEPARTMENT_DEFINITIONS[9], // #10 Human Resources Office
    activeSide: 'A',
  },
  {
    id: 'dept_card_6',
    cardNumber: 6,
    name: 'Card 6: Quality & Specialty Aging',
    sideA: BREWERY_DEPARTMENT_DEFINITIONS[10], // #11 Quality Assurance Lab
    sideB: BREWERY_DEPARTMENT_DEFINITIONS[11], // #12 Oak Barrel Foeder Cellar
    activeSide: 'A',
  },
];

/**
 * Creates a fresh deep-cloned deck of the 6 physical Double-Sided Department Cards.
 */
export function createDoubleSidedDepartmentDeck(): DoubleSidedDepartmentCard[] {
  return DOUBLE_SIDED_DEPARTMENT_CARDS.map((card) => ({
    ...card,
    sideA: {
      ...card.sideA,
      passiveEffect: card.sideA.passiveEffect ? { ...card.sideA.passiveEffect } : undefined,
      actionEffect: { ...card.sideA.actionEffect },
    },
    sideB: {
      ...card.sideB,
      passiveEffect: card.sideB.passiveEffect ? { ...card.sideB.passiveEffect } : undefined,
      actionEffect: { ...card.sideB.actionEffect },
    },
    activeSide: 'A',
  }));
}

/**
 * Creates a fresh, deep-cloned copy of the Brewery Department Deck.
 */
export function createDepartmentDeck(): BreweryDepartmentCard[] {
  return BREWERY_DEPARTMENT_DEFINITIONS.map((dept) => ({
    ...dept,
    passiveEffect: dept.passiveEffect ? { ...dept.passiveEffect } : undefined,
    actionEffect: { ...dept.actionEffect },
  }));
}
