import React, { useEffect, useRef } from 'react';
import {
  IngredientCategory,
  IngredientSubtype,
  RecipeCard,
  RecipeTier,
  UpgradeEffectKey,
  UpgradeType,
  ZoneId,
} from '../engine/types';

export interface HoyneBrandPalette {
  key: string;
  primaryBg: string;
  secondaryBg: string;
  borderAccent: string;
  foilAccent: string;
  textLight: string;
  badgeBg: string;
  labelImageSrc: string;
  vesselImageSrc: string;
  canvasBgHex: string;
  patternType:
    | 'crest'
    | 'cosmos'
    | 'winter_sunburst'
    | 'fiesta'
    | 'coastal'
    | 'polar_star'
    | 'solar_rays'
    | 'west_coast_hop'
    | 'bohemian_crown'
    | 'italian_arch'
    | 'british_cask'
    | 'tavern_sign'
    | 'celtic_harp'
    | 'redwood_peaks'
    | 'wolf_vines'
    | 'raspberry_botanical';
  tagline: string;
  objectPosition?: string;
}

/**
 * Returns the authentic Hoyne Brewing Co. bottle/can label palette & official artwork paths
 * for all 16 Hoyne beers across Tiers 1–4 (43 Recipe cards total).
 */
export function getHoyneBrandPalette(
  recipeName: string,
  tier: RecipeTier = 6
): HoyneBrandPalette {
  const n = recipeName.toLowerCase();

  // Emerald (#0B6E4F): Hoyne Pilsner
  if (n.includes('hoyne pilsner')) {
    return {
      key: 'hoyne_pilsner',
      primaryBg: '#0B6E4F',
      secondaryBg: '#064E3B',
      borderAccent: '#D4AF37',
      foilAccent: '#FDE68A',
      textLight: '#F0FDF4',
      badgeBg: '#042f22',
      labelImageSrc: '/labels/hoyne-pilsner-label.jpg',
      vesselImageSrc: '/labels/hoyne-pilsner-vessel.png',
      canvasBgHex: '#F3DF99',
      patternType: 'crest',
      tagline: 'European Heritage Pilsner',
    };
  }
  // Cosmic Black (#0B1210 / #1C2826): Dark Matter
  if (n.includes('dark matter')) {
    return {
      key: 'dark_matter',
      primaryBg: '#121C1A',
      secondaryBg: '#070B0A',
      borderAccent: '#D4AF37',
      foilAccent: '#FDE68A',
      textLight: '#F8FAFC',
      badgeBg: '#050807',
      labelImageSrc: '/labels/dark-matter-label.jpg',
      vesselImageSrc: '/labels/dark-matter-vessel.png',
      canvasBgHex: '#050807',
      patternType: 'cosmos',
      tagline: 'Victoria Cosmic Dark Ale',
    };
  }
  // Royal Crimson/Gold (#8B0000): Gratitude Winter Ale
  if (n.includes('gratitude')) {
    return {
      key: 'gratitude',
      primaryBg: '#8B0000',
      secondaryBg: '#5C0000',
      borderAccent: '#D4AF37',
      foilAccent: '#FDE68A',
      textLight: '#FEF2F2',
      badgeBg: '#3B0000',
      labelImageSrc: '/labels/gratitude-label.jpg',
      vesselImageSrc: '/labels/gratitude-vessel.png',
      canvasBgHex: '#9E0B1C',
      patternType: 'winter_sunburst',
      tagline: 'Holiday Vintage Winter Warmer',
    };
  }
  // Terracotta/Red (#C84B31): Por Favor Mexican Style Lager
  if (n.includes('por favor')) {
    return {
      key: 'por_favor',
      primaryBg: '#C84B31',
      secondaryBg: '#99341E',
      borderAccent: '#D4AF37',
      foilAccent: '#FDE68A',
      textLight: '#FFF7ED',
      badgeBg: '#5C1C0E',
      labelImageSrc: '/labels/por-favor-label.jpg',
      vesselImageSrc: '/labels/por-favor-vessel.png',
      canvasBgHex: '#F2F0EB',
      patternType: 'fiesta',
      tagline: 'Cerveza Artesanal • Victoria',
    };
  }
  // Coastal Deep Teal (#0D4C68): Down Easy Pale Ale
  if (n.includes('down easy')) {
    return {
      key: 'down_easy',
      primaryBg: '#0D4C68',
      secondaryBg: '#083346',
      borderAccent: '#D4AF37',
      foilAccent: '#FEF08A',
      textLight: '#F0F9FF',
      badgeBg: '#062230',
      labelImageSrc: '/labels/down-easy-label.jpg',
      vesselImageSrc: '/labels/down-easy-vessel.png',
      canvasBgHex: '#D8EEF5',
      patternType: 'coastal',
      tagline: 'Island Session Pale Ale',
    };
  }
  // Borealis Navy (#162A4A): North Star Canadian Lager
  if (n.includes('north star')) {
    return {
      key: 'north_star',
      primaryBg: '#162A4A',
      secondaryBg: '#0F172A',
      borderAccent: '#D4AF37',
      foilAccent: '#FEF9C3',
      textLight: '#F8FAFC',
      badgeBg: '#090D16',
      labelImageSrc: '/labels/north-star-label.jpg',
      vesselImageSrc: '/labels/north-star-vessel.png',
      canvasBgHex: '#FFFFFF',
      patternType: 'polar_star',
      tagline: 'Crisp Canadian Golden Lager',
      objectPosition: 'center 28%',
    };
  }
  // Rich Gold (#B47B18 / #D4AF37): Helios Dortmunder Golden Lager
  if (n.includes('helios')) {
    return {
      key: 'helios',
      primaryBg: '#B47B18',
      secondaryBg: '#78500D',
      borderAccent: '#FDE68A',
      foilAccent: '#FFFBEB',
      textLight: '#FFFBEB',
      badgeBg: '#422B05',
      labelImageSrc: '/labels/helios-label.jpg',
      vesselImageSrc: '/labels/helios-vessel.png',
      canvasBgHex: '#0E0D0C',
      patternType: 'solar_rays',
      tagline: 'Dortmunder Sun God Lager',
      objectPosition: 'center 32%',
    };
  }
  // Sunburst Amber (#C25E1A): Shine On Hazy IPA
  if (n.includes('shine on')) {
    return {
      key: 'shine_on',
      primaryBg: '#C25E1A',
      secondaryBg: '#8C3914',
      borderAccent: '#D4AF37',
      foilAccent: '#FED7AA',
      textLight: '#FFF7ED',
      badgeBg: '#4A1C08',
      labelImageSrc: '/labels/shine-on-label.jpg',
      vesselImageSrc: '/labels/shine-on-vessel.png',
      canvasBgHex: '#FFF6E5',
      patternType: 'west_coast_hop',
      tagline: 'Radiant Hazy India Pale Ale',
    };
  }
  // Bohemian Half-Dark Obsidian/Crimson (#18181B): Švec Czech Half Dark Lager
  if (n.includes('svec') || n.includes('švec')) {
    return {
      key: 'svec',
      primaryBg: '#1F191A',
      secondaryBg: '#120E0F',
      borderAccent: '#D4AF37',
      foilAccent: '#FDE68A',
      textLight: '#F8FAFC',
      badgeBg: '#090708',
      labelImageSrc: '/labels/svec-label.jpg',
      vesselImageSrc: '/labels/svec-vessel.png',
      canvasBgHex: '#0A0A0A',
      patternType: 'bohemian_crown',
      tagline: 'Bohemian Polotmavý Half Dark Lager',
      objectPosition: 'center 35%',
    };
  }
  // Emerald Teal (#0B6E4F): Che Bello Italian Pilsner
  if (n.includes('che bello')) {
    return {
      key: 'che_bello',
      primaryBg: '#0B6E4F',
      secondaryBg: '#074F38',
      borderAccent: '#D4AF37',
      foilAccent: '#FDE68A',
      textLight: '#F0FDF4',
      badgeBg: '#042E20',
      labelImageSrc: '/labels/che-bello-label.png',
      vesselImageSrc: '/labels/che-bello-vessel.png',
      canvasBgHex: '#FFFFFF',
      patternType: 'italian_arch',
      tagline: 'Dry-Hopped Birra Tipo Pils',
    };
  }
  // British Black/Burgundy (#261C1A): Appleton's Finest ESB
  if (n.includes('appleton')) {
    return {
      key: 'appletons_finest',
      primaryBg: '#291D1A',
      secondaryBg: '#17100E',
      borderAccent: '#D4AF37',
      foilAccent: '#FDE68A',
      textLight: '#FFF1F2',
      badgeBg: '#0E0908',
      labelImageSrc: '/labels/appletons-finest-label.jpg',
      vesselImageSrc: '/labels/appletons-finest-vessel.png',
      canvasBgHex: '#E8DEC8',
      patternType: 'british_cask',
      tagline: 'Pioneer Extra Special Bitter',
      objectPosition: 'center 38%',
    };
  }
  // Tavern Rust/Mahogany (#8C3419): Pub Lunch BC Brown Ale
  if (n.includes('pub lunch')) {
    return {
      key: 'pub_lunch',
      primaryBg: '#8C3419',
      secondaryBg: '#5C200E',
      borderAccent: '#D4AF37',
      foilAccent: '#FEF3C7',
      textLight: '#FFFBEB',
      badgeBg: '#331207',
      labelImageSrc: '/labels/pub-lunch-label.jpg',
      vesselImageSrc: '/labels/pub-lunch-vessel.png',
      canvasBgHex: '#FBF5E6',
      patternType: 'tavern_sign',
      tagline: 'Traditional BC Brown Ale',
      objectPosition: 'center 32%',
    };
  }
  // Celtic Emerald & Stout Black (#14532D): Finnegans Irish Stout
  if (n.includes('finnegan')) {
    return {
      key: 'finnegans',
      primaryBg: '#14532D',
      secondaryBg: '#0B2E19',
      borderAccent: '#D4AF37',
      foilAccent: '#FDE68A',
      textLight: '#ECFDF5',
      badgeBg: '#061A0E',
      labelImageSrc: '/labels/finnegans-label.jpg',
      vesselImageSrc: '/labels/finnegans-vessel.png',
      canvasBgHex: '#09090B',
      patternType: 'celtic_harp',
      tagline: 'Classic Dry Irish Stout',
    };
  }
  // Old-Growth Forest Green (#1E3A1E): Among Giants West Coast IPA
  if (n.includes('among giants')) {
    return {
      key: 'among_giants',
      primaryBg: '#1E3A1E',
      secondaryBg: '#132613',
      borderAccent: '#D4AF37',
      foilAccent: '#ECFCCB',
      textLight: '#F7FEE7',
      badgeBg: '#0B170B',
      labelImageSrc: '/labels/among-giants-label.jpg',
      vesselImageSrc: '/labels/among-giants-vessel.png',
      canvasBgHex: '#182616',
      patternType: 'redwood_peaks',
      tagline: 'Pacific NW West Coast IPA',
    };
  }
  // Lupulin Forest Emerald (#142818): Wolf Vine Wet Hop Pale Ale
  if (n.includes('wolf vine')) {
    return {
      key: 'wolf_vine',
      primaryBg: '#1B3B22',
      secondaryBg: '#112616',
      borderAccent: '#D4AF37',
      foilAccent: '#ECFCCB',
      textLight: '#F7FEE7',
      badgeBg: '#0A170D',
      labelImageSrc: '/labels/wolf-vine-label.jpg',
      vesselImageSrc: '/labels/wolf-vine-vessel.png',
      canvasBgHex: '#E5DEC9',
      patternType: 'wolf_vines',
      tagline: 'Fresh Sartori Wet Hopped Pale Ale',
    };
  }
  // Raspberry Ruby (#9D174D): Framboozle Raspberry Wheat
  if (n.includes('framboozle')) {
    return {
      key: 'framboozle',
      primaryBg: '#9D174D',
      secondaryBg: '#6B0F34',
      borderAccent: '#D4AF37',
      foilAccent: '#FCE7F3',
      textLight: '#FDF2F8',
      badgeBg: '#3D071D',
      labelImageSrc: '/labels/framboozle-label.jpg',
      vesselImageSrc: '/labels/framboozle-vessel.png',
      canvasBgHex: '#FFFFFF',
      patternType: 'raspberry_botanical',
      tagline: 'Saanich Raspberry Wheat Ale',
      objectPosition: 'center 35%',
    };
  }

  const tierDefaults: Record<RecipeTier, HoyneBrandPalette> = {
    6: {
      key: 'default_t6',
      primaryBg: '#0B6E4F',
      secondaryBg: '#074c36',
      borderAccent: '#D4AF37',
      foilAccent: '#FDE68A',
      textLight: '#ECFDF5',
      badgeBg: '#042e20',
      labelImageSrc: '/labels/hoyne-pilsner-label.jpg',
      vesselImageSrc: '/labels/hoyne-pilsner-vessel.png',
      canvasBgHex: '#F3DF99',
      patternType: 'crest',
      tagline: 'Hoyne Core Crusher',
    },
    5: {
      key: 'default_t5',
      primaryBg: '#B47B18',
      secondaryBg: '#78500D',
      borderAccent: '#FEF08A',
      foilAccent: '#FFFBEB',
      textLight: '#FFFBEB',
      badgeBg: '#422B05',
      labelImageSrc: '/labels/helios-label.jpg',
      vesselImageSrc: '/labels/helios-vessel.png',
      canvasBgHex: '#0E0D0C',
      patternType: 'solar_rays',
      tagline: 'Hoyne Premium Pint',
    },
    4: {
      key: 'default_t4',
      primaryBg: '#5C381E',
      secondaryBg: '#3D2413',
      borderAccent: '#D4AF37',
      foilAccent: '#E2E8F0',
      textLight: '#F8FAFC',
      badgeBg: '#27170C',
      labelImageSrc: '/labels/appletons-finest-label.jpg',
      vesselImageSrc: '/labels/appletons-finest-vessel.png',
      canvasBgHex: '#1B140E',
      patternType: 'british_cask',
      tagline: 'Hoyne Heritage Ale',
    },
    3: {
      key: 'default_t3',
      primaryBg: '#121C1A',
      secondaryBg: '#070B0A',
      borderAccent: '#D4AF37',
      foilAccent: '#E2E8F0',
      textLight: '#F8FAFC',
      badgeBg: '#050807',
      labelImageSrc: '/labels/dark-matter-label.jpg',
      vesselImageSrc: '/labels/dark-matter-vessel.png',
      canvasBgHex: '#050807',
      patternType: 'cosmos',
      tagline: 'Hoyne Heavyweight',
    },
  };

  return tierDefaults[tier];
}

/**
 * Official-Style "HOUSE OF HOYNE" Vintage Brewery Crest Emblem for the Top Header Bar
 */
export const HoyneCrestLogoSVG: React.FC<{ className?: string }> = ({
  className = 'w-11 h-11',
}) => (
  <svg viewBox="0 0 64 64" className={className} fill="none">
    <defs>
      <linearGradient id="hoyne-crest-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#9A7B1C" />
      </linearGradient>
      <linearGradient id="hoyne-crest-bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0B6E4F" />
        <stop offset="100%" stopColor="#052e20" />
      </linearGradient>
    </defs>
    {/* Outer Heraldic Shield */}
    <path
      d="M10 8 H54 V30 C54 46 32 58 32 58 C32 58 10 46 10 30 Z"
      fill="url(#hoyne-crest-bg)"
      stroke="url(#hoyne-crest-gold)"
      strokeWidth="3"
    />
    {/* Inner Filigree Shield */}
    <path
      d="M15 13 H49 V29 C49 42 32 52 32 52 C32 52 15 42 15 29 Z"
      fill="none"
      stroke="#FDE68A"
      strokeWidth="1"
      strokeDasharray="3 2"
      opacity="0.75"
    />
    {/* Crown & Hop Garland */}
    <path
      d="M23 19 L27 24 L32 17 L37 24 L41 19"
      stroke="url(#hoyne-crest-gold)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Monogram 'H' */}
    <path
      d="M24 27 V41 M40 27 V41 M24 34 H40"
      stroke="#FFFBEB"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    {/* Barley Stars */}
    <circle cx="20" cy="34" r="1.8" fill="#D4AF37" />
    <circle cx="44" cy="34" r="1.8" fill="#D4AF37" />
  </svg>
);

/**
 * Stylized Top Bottle Label Header Band for Recipe Cards
 */
export const RecipeTopBorderSVG: React.FC<{
  recipeName: string;
  tier: RecipeTier;
  compact?: boolean;
}> = ({ recipeName, tier, compact = false }) => {
  const palette = getHoyneBrandPalette(recipeName, tier);

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${
        compact ? 'h-2.5' : 'h-3.5'
      }`}
      style={{
        background: `linear-gradient(90deg, ${palette.secondaryBg} 0%, ${palette.primaryBg} 50%, ${palette.secondaryBg} 100%)`,
        borderBottom: `1.5px solid ${palette.borderAccent}`,
      }}
    >
      <svg
        viewBox="0 0 320 14"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="2.5"
          x2="320"
          y2="2.5"
          stroke={palette.foilAccent}
          strokeWidth="0.9"
          opacity="0.75"
        />
        <line
          x1="8"
          y1="11"
          x2="312"
          y2="11"
          stroke={palette.borderAccent}
          strokeWidth="0.7"
          strokeDasharray="4 2"
          opacity="0.75"
        />
      </svg>
    </div>
  );
};

/**
 * Authentic Hoyne 3D Can Vessel Illustration Center Canvas Window.
 * Renders the high-resolution, transparent 3D Hoyne can vessel render
 * 100% uniformly in the center window of all Recipe cards, ensuring
 * identical vertical aspect ratios and authentic branding.
 */
export const RecipeLabelCanvas: React.FC<{
  recipe: RecipeCard;
  className?: string;
  canClassName?: string;
  children?: React.ReactNode;
}> = ({ recipe, className = '', canClassName = '', children }) => {
  const palette = getHoyneBrandPalette(recipe.name, recipe.tier);

  return (
    <div
      data-label-key={palette.key}
      className={`relative w-full h-full min-h-0 flex flex-col justify-between items-center rounded-xl overflow-hidden select-none ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 42%, ${palette.primaryBg} 0%, ${palette.secondaryBg} 65%, #0c0a09 100%)`,
        border: `1.5px solid ${palette.borderAccent}80`,
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), 0 3px 10px rgba(0,0,0,0.3)',
      }}
    >
      {/* Ambient subtle warm glow behind the can */}
      <div
        className="absolute w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-35"
        style={{ backgroundColor: palette.foilAccent }}
      />

      {/* Atmospheric branded texture rings */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${palette.foilAccent} 1px, transparent 1px)`,
          backgroundSize: '14px 14px',
        }}
      />

      {/* Official 3D Hoyne Vessel Can Artwork — Centered in its own branded frame */}
      <div className="relative z-10 w-full flex-1 min-h-0 flex items-center justify-center p-1">
        <img
          src={palette.vesselImageSrc}
          alt={`${recipe.name} Official Can`}
          loading="eager"
          className={`h-full max-h-[95%] w-auto max-w-[92%] object-contain pointer-events-none filter drop-shadow-[0_5px_12px_rgba(0,0,0,0.75)] transition-transform duration-300 ${canClassName}`}
        />
      </div>

      {/* Subtle Gold Foil Inner Border */}
      <div
        className="absolute inset-1 rounded-[8px] pointer-events-none z-20"
        style={{
          border: `1px solid ${palette.borderAccent}40`,
        }}
      />

      {/* Dedicated Bottom Elements (e.g. Dedicated VP Area) */}
      {children}
    </div>
  );
};

/**
 * Vector Emblem Artwork inside each Recipe's Center Medallion
 */
const RecipeEmblemSVG: React.FC<{
  patternType: HoyneBrandPalette['patternType'];
  palette: HoyneBrandPalette;
}> = ({ patternType, palette }) => {
  const { foilAccent, borderAccent } = palette;

  switch (patternType) {
    case 'cosmos':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <circle cx="20" cy="20" r="12" fill={borderAccent} opacity="0.22" />
          <ellipse
            cx="20"
            cy="20"
            rx="15"
            ry="6"
            transform="rotate(-25 20 20)"
            fill="none"
            stroke={foilAccent}
            strokeWidth="1.3"
          />
          <circle cx="18" cy="20" r="8" fill="#05070d" stroke={foilAccent} strokeWidth="1.5" />
          <circle cx="25" cy="14" r="2" fill={foilAccent} />
          <path d="M10 10 L11 13 L14 14 L11 15 L10 18 L9 15 L6 14 L9 13 Z" fill={foilAccent} />
        </svg>
      );
    case 'winter_sunburst':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <polygon
            points="20,4 23,14 33,10 26,18 36,20 26,22 33,30 23,26 20,36 17,26 7,30 14,22 4,20 14,18 7,10 17,14"
            fill={borderAccent}
            stroke={foilAccent}
            strokeWidth="1"
          />
          <circle cx="20" cy="20" r="5" fill={foilAccent} />
        </svg>
      );
    case 'fiesta':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <path
            d="M8 26 L12 14 L20 21 L28 14 L32 26 Z"
            fill={borderAccent}
            stroke={foilAccent}
            strokeWidth="1.4"
          />
          <circle cx="20" cy="12" r="2.5" fill={foilAccent} />
          <path d="M8 29 H32" stroke={foilAccent} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'coastal':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <circle cx="20" cy="15" r="6" fill={foilAccent} />
          <path
            d="M6 25 Q13 21 20 25 T34 25"
            fill="none"
            stroke={foilAccent}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M8 30 Q14 26 20 30 T32 30"
            fill="none"
            stroke={borderAccent}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'polar_star':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <polygon
            points="20,3 23,16 37,20 23,24 20,37 17,24 3,20 17,16"
            fill={foilAccent}
          />
          <polygon
            points="20,10 22,18 30,20 22,22 20,30 18,22 10,20 18,18"
            fill={borderAccent}
          />
        </svg>
      );
    case 'solar_rays':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <circle cx="20" cy="20" r="8" fill={foilAccent} />
          <circle
            cx="20"
            cy="20"
            r="12"
            fill="none"
            stroke={foilAccent}
            strokeWidth="2.5"
            strokeDasharray="3 3"
          />
        </svg>
      );
    case 'west_coast_hop':
    case 'wolf_vines':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <path
            d="M20 6 C13 10 11 18 14 27 C17 32 23 32 26 27 C29 18 27 10 20 6 Z"
            fill={borderAccent}
            stroke={foilAccent}
            strokeWidth="1.4"
          />
          <path
            d="M14 15 Q20 20 26 15 M13 21 Q20 26 27 21"
            fill="none"
            stroke={foilAccent}
            strokeWidth="1.3"
          />
          <circle cx="20" cy="11" r="2" fill={foilAccent} />
        </svg>
      );
    case 'bohemian_crown':
    case 'crest':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <path
            d="M10 10 H30 V22 C30 29 20 34 20 34 C20 34 10 29 10 22 Z"
            fill={borderAccent}
            stroke={foilAccent}
            strokeWidth="1.5"
          />
          <path d="M14 16 L17 22 L20 15 L23 22 L26 16" fill="none" stroke={foilAccent} strokeWidth="1.6" />
        </svg>
      );
    case 'italian_arch':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <path
            d="M10 32 V18 A10 10 0 0 1 30 18 V32"
            fill="none"
            stroke={foilAccent}
            strokeWidth="2"
          />
          <circle cx="20" cy="19" r="4.5" fill={borderAccent} stroke={foilAccent} strokeWidth="1.2" />
        </svg>
      );
    case 'british_cask':
    case 'tavern_sign':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <ellipse cx="20" cy="20" rx="11" ry="13" fill={borderAccent} stroke={foilAccent} strokeWidth="1.5" />
          <path d="M10 15 H30 M10 25 H30" stroke={foilAccent} strokeWidth="1.5" />
          <circle cx="20" cy="20" r="2.5" fill={foilAccent} />
        </svg>
      );
    case 'celtic_harp':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <path
            d="M13 8 C24 8 28 14 26 30 L15 32 L13 8 Z"
            fill="none"
            stroke={foilAccent}
            strokeWidth="2"
          />
          <line x1="17" y1="11" x2="17" y2="30" stroke={borderAccent} strokeWidth="1.2" />
          <line x1="20" y1="12" x2="20" y2="29" stroke={borderAccent} strokeWidth="1.2" />
          <line x1="23" y1="14" x2="23" y2="28" stroke={borderAccent} strokeWidth="1.2" />
        </svg>
      );
    case 'redwood_peaks':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <polygon points="8,30 17,13 25,30" fill={borderAccent} stroke={foilAccent} strokeWidth="1.2" />
          <polygon points="17,30 25,10 33,30" fill={foilAccent} opacity="0.9" />
        </svg>
      );
    case 'raspberry_botanical':
      return (
        <svg viewBox="0 0 40 40" className="w-10 h-10">
          <circle cx="17" cy="17" r="4" fill={borderAccent} stroke={foilAccent} strokeWidth="1" />
          <circle cx="23" cy="17" r="4" fill={borderAccent} stroke={foilAccent} strokeWidth="1" />
          <circle cx="15" cy="23" r="4" fill={borderAccent} stroke={foilAccent} strokeWidth="1" />
          <circle cx="25" cy="23" r="4" fill={borderAccent} stroke={foilAccent} strokeWidth="1" />
          <circle cx="20" cy="21" r="4.2" fill={foilAccent} />
          <circle cx="20" cy="27" r="4" fill={borderAccent} stroke={foilAccent} strokeWidth="1" />
          <path d="M16 11 Q20 6 24 11" fill="none" stroke="#4ade80" strokeWidth="2" />
        </svg>
      );
  }
};

/**
 * Physical Crimped Metallic Bottle Cap & Wooden Brewery Token for Conveyor Skip Counters
 */
export const BottleCapTokenSVG: React.FC<{
  label: string;
  sublabel?: string;
  variant?: 'free' | 'skip_cost' | 'bonus_loot';
}> = ({ label, sublabel, variant = 'skip_cost' }) => {
  const colors =
    variant === 'free'
      ? {
          outer: '#0B6E4F',
          inner: '#064E3B',
          rim: '#6EE7B7',
          text: '#ECFDF5',
        }
      : variant === 'bonus_loot'
      ? {
          outer: '#D4AF37',
          inner: '#78350F',
          rim: '#FEF08A',
          text: '#FFFBEB',
        }
      : {
          outer: '#C84B31',
          inner: '#5C1C0E',
          rim: '#FDE68A',
          text: '#FFF7ED',
        };

  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full shadow-md select-none"
      style={{
        background: `linear-gradient(135deg, ${colors.outer} 0%, ${colors.inner} 100%)`,
        border: `1.5px dashed ${colors.rim}`,
        boxShadow: '0 3px 6px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.35)',
      }}
    >
      {/* Crimped Bottle Cap Crown Icon */}
      <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0">
        <circle
          cx="10"
          cy="10"
          r="8"
          fill={colors.outer}
          stroke={colors.rim}
          strokeWidth="1.8"
          strokeDasharray="2 1.2"
        />
        <circle cx="10" cy="10" r="5.2" fill={colors.inner} stroke={colors.rim} strokeWidth="0.8" />
        <text
          x="10"
          y="12.5"
          textAnchor="middle"
          fontSize="7"
          fontWeight="bold"
          fill={colors.rim}
          fontFamily="serif"
        >
          H
        </text>
      </svg>
      <span
        className="text-[9px] font-sans font-black uppercase tracking-wider leading-none"
        style={{ color: colors.text }}
      >
        {label}
      </span>
      {sublabel && (
        <span
          className="text-[8px] font-mono font-bold opacity-90"
          style={{ color: colors.rim }}
        >
          {sublabel}
        </span>
      )}
    </div>
  );
};

/**
 * 3D Stacked Ingredient Blind Deck (Upright Portrait Format: 5 : 7 | 2.5" x 3.5")
 */
export const HoyneCardBackDeckSVG: React.FC<{
  deckCount: number;
  discardCount: number;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ deckCount, discardCount, disabled = false, onClick }) => {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      title={
        disabled
          ? 'Wait for Work Day turn to draw'
          : 'Click to draw 1 blind Ingredient card from the deck'
      }
      className={`relative w-full aspect-[5/7] select-none transition-transform duration-150 ${
        !disabled && onClick
          ? 'cursor-pointer hover:-translate-y-1 active:translate-y-0.5'
          : 'opacity-75 cursor-not-allowed'
      }`}
    >
      {/* 3D Stacked Card Layer 3 (Bottom of Stack) */}
      <div
        className="absolute inset-x-1.5 top-2 bottom-0 rounded-xl border border-amber-500/40"
        style={{
          backgroundColor: '#1a110b',
          boxShadow: '0 6px 14px rgba(0,0,0,0.75)',
        }}
      />
      {/* 3D Stacked Card Layer 2 (Middle of Stack) */}
      <div
        className="absolute inset-x-1 top-1 bottom-1 rounded-xl border border-amber-400/50"
        style={{
          backgroundColor: '#241810',
        }}
      />
      {/* Top Card-Back Face ("HOUSE OF HOYNE" Upright Botanical Deck Crest) */}
      <div
        className="absolute inset-x-0 top-0 bottom-1.5 rounded-xl overflow-hidden flex flex-col items-center justify-between p-2 text-center"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, #0B6E4F 0%, #063727 62%, #041f16 100%)',
          border: '2px solid #D4AF37',
          boxShadow:
            'inset 0 0 0 2px #041f16, inset 0 0 0 3px rgba(212, 175, 55, 0.55)',
        }}
      >
        <div className="w-full border-b border-amber-400/35 pb-1">
          <span className="text-[7.5px] font-display font-black tracking-[0.16em] text-amber-200 uppercase block leading-tight">
            HOUSE OF HOYNE
          </span>
          <span className="text-[6.5px] font-sans font-bold tracking-widest text-emerald-200/80 uppercase block">
            RAW INGREDIENTS
          </span>
        </div>

        {/* Center Vintage Upright Crest Medallion */}
        <div className="relative flex-1 flex items-center justify-center my-1">
          <svg viewBox="0 0 80 96" className="w-16 h-20 drop-shadow-md">
            {/* Outer Filigree Frame */}
            <rect
              x="6"
              y="6"
              width="68"
              height="84"
              rx="8"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              opacity="0.7"
            />
            {/* Crossed Barley Stems */}
            <path
              d="M20 76 Q40 48 60 20 M60 76 Q40 48 20 20"
              stroke="#FDE68A"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            {/* Center Heraldic Shield */}
            <circle
              cx="40"
              cy="48"
              r="24"
              fill="#041f16"
              stroke="#D4AF37"
              strokeWidth="2.2"
            />
            <circle
              cx="40"
              cy="48"
              r="19"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <path
              d="M31 38 L35 43 L40 35 L45 43 L49 38"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <text
              x="40"
              y="57"
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill="#FFFBEB"
              fontFamily="Cinzel, Playfair Display, serif"
            >
              {deckCount}
            </text>
          </svg>
        </div>

        <div className="w-full flex items-center justify-between px-1 text-[7.5px] font-mono text-amber-200/95 border-t border-amber-400/35 pt-1">
          <span>DECK: {deckCount}</span>
          <span>DISC: {discardCount}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Shared "THE TAPROOM" Custom Poker Card-Back Draw Pile (Poker Size 5 : 7 | 2.5" x 3.5")
 * Used by all 73 combined Recipe (43) & Upgrade (30) cards when face-down in the Taproom Draw Pile.
 */
export const TaproomCardBackDeckSVG: React.FC<{
  deckCount: number;
  discardCount: number;
  compact?: boolean;
}> = ({ deckCount, discardCount, compact = false }) => {
  return (
    <div
      className={`relative select-none ${
        compact ? 'w-14 aspect-[5/7]' : 'w-full aspect-[5/7]'
      }`}
      title='Shared "The Taproom" Poker Deck Back (2.5" × 3.5" | 5:7 Aspect Ratio — 73 Cards)'
    >
      {/* 3D Stacked Layer 2 */}
      <div
        className="absolute inset-x-1 top-1.5 bottom-0 rounded-lg border border-amber-500/45"
        style={{
          backgroundColor: '#1a110b',
          boxShadow: '0 4px 10px rgba(0,0,0,0.75)',
        }}
      />
      {/* Top Poker Card-Back Face ("THE TAPROOM") */}
      <div
        className="absolute inset-x-0 top-0 bottom-1 rounded-lg overflow-hidden flex flex-col items-center justify-between p-1.5 text-center"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, #3b1c0e 0%, #1c0f08 68%, #0f0805 100%)',
          border: '1.8px solid #D4AF37',
          boxShadow:
            'inset 0 0 0 1.5px #140b07, inset 0 0 0 2.5px rgba(212, 175, 55, 0.5)',
        }}
      >
        <span className="text-[6.5px] font-display font-black tracking-[0.16em] text-amber-300 uppercase leading-none">
          THE TAPROOM
        </span>

        <svg viewBox="0 0 44 56" className="w-7 h-9 shrink-0">
          <rect
            x="3"
            y="3"
            width="38"
            height="50"
            rx="4"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeDasharray="3 1.5"
          />
          <circle
            cx="22"
            cy="28"
            r="13"
            fill="#140b07"
            stroke="#FDE68A"
            strokeWidth="1.4"
          />
          <text
            x="22"
            y="31.5"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#FEF08A"
            fontFamily="Cinzel, Playfair Display, serif"
          >
            {deckCount}
          </text>
        </svg>

        <span className="text-[6px] font-mono text-amber-200/85 uppercase leading-none">
          2.25&quot;×3.5&quot; • D:{discardCount}
        </span>
      </div>
    </div>
  );
};

/**
 * Dedicated "HOYNE RECIPES" Poker Card-Back Draw Pile (Poker Size 5 : 7 | 2.5" x 3.5")
 * Used by the 43 Recipe cards in the dedicated Recipe Market (Row 2).
 */
export const RecipeCardBackDeckSVG: React.FC<{
  deckCount: number;
  discardCount: number;
  compact?: boolean;
}> = ({ deckCount, discardCount, compact = false }) => {
  return (
    <div
      className={`relative select-none ${
        compact ? 'w-14 aspect-[5/7]' : 'w-full aspect-[5/7]'
      }`}
      title='Dedicated Recipe Poker Deck Back (2.5" × 3.5" | 43 Cards)'
    >
      <div
        className="absolute inset-x-1 top-1.5 bottom-0 rounded-lg border border-emerald-500/45"
        style={{
          backgroundColor: '#071d15',
          boxShadow: '0 4px 10px rgba(0,0,0,0.75)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 bottom-1 rounded-lg overflow-hidden flex flex-col items-center justify-between p-1.5 text-center"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, #064e3b 0%, #063124 68%, #031a13 100%)',
          border: '1.8px solid #D4AF37',
          boxShadow:
            'inset 0 0 0 1.5px #02120d, inset 0 0 0 2.5px rgba(212, 175, 55, 0.5)',
        }}
      >
        <span className="text-[6.5px] font-display font-black tracking-[0.16em] text-amber-300 uppercase leading-none">
          RECIPES
        </span>

        <svg viewBox="0 0 44 56" className="w-7 h-9 shrink-0">
          <rect
            x="3"
            y="3"
            width="38"
            height="50"
            rx="4"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeDasharray="3 1.5"
          />
          <circle
            cx="22"
            cy="28"
            r="13"
            fill="#031a13"
            stroke="#FDE68A"
            strokeWidth="1.4"
          />
          <text
            x="22"
            y="31.5"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#FEF08A"
            fontFamily="Cinzel, Playfair Display, serif"
          >
            {deckCount}
          </text>
        </svg>

        <span className="text-[6px] font-mono text-emerald-200/85 uppercase leading-none">
          43 POKER • D:{discardCount}
        </span>
      </div>
    </div>
  );
};

/**
 * Dedicated "BREWERY UPGRADES" Poker Card-Back Draw Pile (Poker Size 5 : 7 | 2.5" x 3.5")
 * Used by the 30 Equipment & Staff upgrade cards in the dedicated Upgrade Market (Row 3).
 */
export const UpgradeCardBackDeckSVG: React.FC<{
  deckCount: number;
  discardCount: number;
  compact?: boolean;
}> = ({ deckCount, discardCount, compact = false }) => {
  return (
    <div
      className={`relative select-none ${
        compact ? 'w-14 aspect-[5/7]' : 'w-full aspect-[5/7]'
      }`}
      title='Dedicated Upgrade Poker Deck Back (2.5" × 3.5" | 30 Cards)'
    >
      <div
        className="absolute inset-x-1 top-1.5 bottom-0 rounded-lg border border-sky-500/45"
        style={{
          backgroundColor: '#0c1a24',
          boxShadow: '0 4px 10px rgba(0,0,0,0.75)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 bottom-1 rounded-lg overflow-hidden flex flex-col items-center justify-between p-1.5 text-center"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, #1e293b 0%, #0f172a 68%, #020617 100%)',
          border: '1.8px solid #D4AF37',
          boxShadow:
            'inset 0 0 0 1.5px #020617, inset 0 0 0 2.5px rgba(212, 175, 55, 0.5)',
        }}
      >
        <span className="text-[6.5px] font-display font-black tracking-[0.16em] text-amber-300 uppercase leading-none">
          UPGRADES
        </span>

        <svg viewBox="0 0 44 56" className="w-7 h-9 shrink-0">
          <rect
            x="3"
            y="3"
            width="38"
            height="50"
            rx="4"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeDasharray="3 1.5"
          />
          <circle
            cx="22"
            cy="28"
            r="13"
            fill="#020617"
            stroke="#FDE68A"
            strokeWidth="1.4"
          />
          <text
            x="22"
            y="31.5"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#FEF08A"
            fontFamily="Cinzel, Playfair Display, serif"
          >
            {deckCount}
          </text>
        </svg>

        <span className="text-[6px] font-mono text-sky-200/85 uppercase leading-none">
          30 POKER • D:{discardCount}
        </span>
      </div>
    </div>
  );
};

/**
 * Custom Multi-Layered Minimalist Vector Iconography for all 10 Ingredient Subtypes
 */
export const IngredientVectorIcon: React.FC<{
  subtype: IngredientSubtype;
  className?: string;
}> = ({ subtype, className = 'w-5 h-5' }) => {
  switch (subtype) {
    case 'grain':
    case 'base_malt':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M12 21V5" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 4L11 8M16 4L13 8" stroke="#FDE68A" strokeWidth="1.3" strokeLinecap="round" />
          <ellipse cx="9.5" cy="10" rx="2" ry="3" transform="rotate(-25 9.5 10)" fill="#F59E0B" />
          <ellipse cx="14.5" cy="10" rx="2" ry="3" transform="rotate(25 14.5 10)" fill="#F59E0B" />
          <ellipse cx="9.5" cy="15" rx="2" ry="3" transform="rotate(-25 9.5 15)" fill="#FBBF24" />
          <ellipse cx="14.5" cy="15" rx="2" ry="3" transform="rotate(25 14.5 15)" fill="#FBBF24" />
        </svg>
      );

    case 'specialty_grain':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M7 9C7 7.5 9 6 12 6C15 6 17 7.5 17 9L18.5 18C18.7 19.5 17.5 21 16 21H8C6.5 21 5.3 19.5 5.5 18L7 9Z"
            fill="#D97706"
            stroke="#FDE68A"
            strokeWidth="1.4"
          />
          <path d="M9 4L12 6L15 4" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" />
          <polygon points="12,10 14.5,13.5 12,17 9.5,13.5" fill="#FEF3C7" />
        </svg>
      );

    case 'chocolate':
    case 'dark_roasted_malt':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M8 6C8 4.5 10 4 10 2.5M15 6C15 4.5 17 4 17 2.5"
            stroke="#D6D3D1"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <ellipse
            cx="10"
            cy="14"
            rx="4.5"
            ry="6"
            transform="rotate(-18 10 14)"
            fill="#451A03"
            stroke="#F59E0B"
            strokeWidth="1.4"
          />
          <path d="M8.5 10C10.5 13 9.5 15 11 18" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse
            cx="15.5"
            cy="15"
            rx="3.8"
            ry="5"
            transform="rotate(20 15.5 15)"
            fill="#292524"
            stroke="#D97706"
            strokeWidth="1.3"
          />
        </svg>
      );

    case 'hops':
    case 'bittering_hops':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M12 3C7.5 6 6 12 8.5 18.5C10.5 21.5 13.5 21.5 15.5 18.5C18 12 16.5 6 12 3Z"
            fill="#15803D"
            stroke="#86EFAC"
            strokeWidth="1.4"
          />
          <path d="M8 10L12 13L16 10M7.5 14.5L12 17.5L16.5 14.5" stroke="#BBF7D0" strokeWidth="1.3" />
          <circle cx="12" cy="8.5" r="2" fill="#FACC15" />
        </svg>
      );

    case 'aroma_hops':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="9" stroke="#4ADE80" strokeWidth="1" strokeDasharray="2 2" />
          <path
            d="M9.5 6C6.5 8 5.5 13 7.5 17.5C9 19.5 11 19.5 12.5 17.5C14 13 13 8 9.5 6Z"
            fill="#16A34A"
            stroke="#BBF7D0"
            strokeWidth="1.3"
          />
          <path
            d="M15.5 8C13 9.5 12.5 13.5 14 17.5C15 19 17 19 18 17.5C19.5 13.5 18.5 9.5 15.5 8Z"
            fill="#22C55E"
            stroke="#FEF08A"
            strokeWidth="1.3"
          />
          <circle cx="16" cy="5" r="1.5" fill="#FDE047" />
        </svg>
      );

    case 'noble_hops':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M5 6H19V13C19 17.5 12 21 12 21C12 21 5 17.5 5 13V6Z"
            fill="#0F766E"
            stroke="#5EEAD4"
            strokeWidth="1.4"
          />
          <path
            d="M12 8C9.5 10 9 13.5 10.5 16.5C11.5 18 12.5 18 13.5 16.5C15 13.5 14.5 10 12 8Z"
            fill="#2DD4BF"
            stroke="#FEF9C3"
            strokeWidth="1.2"
          />
          <path d="M9 4L12 6L15 4" stroke="#FACC15" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'yeast':
    case 'house_yeast':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M9 3H15M10 3V8L5.5 17.5C4.8 19 5.8 20.5 7.5 20.5H16.5C18.2 20.5 19.2 19 18.5 17.5L14 8V3"
            stroke="#FDE047"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.8 15.5Q12 13.5 17.2 15.5L18.2 18C18.5 19 17.8 20 16.5 20H7.5C6.2 20 5.5 19 5.8 18L6.8 15.5Z"
            fill="#EAB308"
          />
          <circle cx="10.5" cy="17.5" r="1.4" fill="#FEF9C3" />
          <circle cx="14" cy="17" r="1.1" fill="#FEF9C3" />
          <circle cx="12.5" cy="11.5" r="1.2" fill="#FDE047" />
        </svg>
      );

    case 'fresh_wet_hops':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path
            d="M11 3C7 6 6 11.5 8.5 17.5C10 20 12.5 20 14 17.5C16.5 11.5 15 6 11 3Z"
            fill="#65A30D"
            stroke="#D9F99D"
            strokeWidth="1.4"
          />
          <path
            d="M18 11C18 11 15.5 14.5 15.5 16.5C15.5 18 16.6 19 18 19C19.4 19 20.5 18 20.5 16.5C20.5 14.5 18 11 18 11Z"
            fill="#38BDF8"
            stroke="#E0F2FE"
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'spices':
    case 'winter_spices':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <polygon
            points="12,2 14,8.5 20.5,6.5 16,12 20.5,17.5 14,15.5 12,22 10,15.5 3.5,17.5 8,12 3.5,6.5 10,8.5"
            fill="#EF4444"
            stroke="#FEE2E2"
            strokeWidth="1.2"
          />
          <circle cx="12" cy="12" r="2.5" fill="#FBBF24" />
        </svg>
      );

    case 'fruit':
    case 'local_raspberries':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M8 6Q12 2 16 6" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9.5" cy="10" r="3" fill="#A855F7" stroke="#E9D5FF" strokeWidth="1" />
          <circle cx="14.5" cy="10" r="3" fill="#A855F7" stroke="#E9D5FF" strokeWidth="1" />
          <circle cx="8.5" cy="14.5" r="3" fill="#9333EA" stroke="#E9D5FF" strokeWidth="1" />
          <circle cx="15.5" cy="14.5" r="3" fill="#9333EA" stroke="#E9D5FF" strokeWidth="1" />
          <circle cx="12" cy="13" r="3.2" fill="#C084FC" stroke="#F3E8FF" strokeWidth="1" />
          <circle cx="12" cy="18" r="3" fill="#A855F7" stroke="#E9D5FF" strokeWidth="1" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="8" fill="#F59E0B" />
        </svg>
      );
  }
};

/**
 * Industrial Brushed Stainless Steel Header & Pressure Gauge Dial for Assembly Line Zones
 */
export const ZoneIndustrialHeaderSVG: React.FC<{
  zoneId: ZoneId;
  occupancyRatio: number;
}> = ({ zoneId, occupancyRatio }) => {
  const clamped = Math.min(1, Math.max(0, occupancyRatio));
  const needleAngle = -60 + clamped * 120;

  const zoneMetricLabel: Record<ZoneId, string> = {
    1: 'SILO CAP',
    2: 'BOIL PSI',
    3: 'FERM °C',
    4: 'LAGER °C',
    5: 'DOCK BBL',
  };

  const accentColor: Record<ZoneId, string> = {
    1: '#f59e0b',
    2: '#f97316',
    3: '#38bdf8',
    4: '#06b6d4',
    5: '#10b981',
  };

  return (
    <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 border border-stone-500/50 shadow-inner">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-stone-400 border border-stone-900 shadow-inner" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-stone-200">
          SS-304 • Z0{zoneId}
        </span>
      </div>

      <div className="flex-1 mx-2.5 h-2 rounded-full bg-stone-950 border border-stone-600 overflow-hidden p-0.5">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.max(8, Math.round(clamped * 100))}%`,
            backgroundColor: accentColor[zoneId],
            boxShadow: `0 0 6px ${accentColor[zoneId]}`,
          }}
        />
      </div>

      <div className="flex items-center gap-1">
        <span className="text-[8px] font-mono text-stone-300 uppercase">
          {zoneMetricLabel[zoneId]}
        </span>
        <svg viewBox="0 0 28 28" className="w-6 h-6 shrink-0">
          <circle
            cx="14"
            cy="14"
            r="12"
            fill="#1c1917"
            stroke="#d6d3d1"
            strokeWidth="1.8"
          />
          <path
            d="M 6 19 A 9 9 0 1 1 22 19"
            fill="none"
            stroke={accentColor[zoneId]}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <g transform={`rotate(${needleAngle} 14 14)`}>
            <line
              x1="14"
              y1="14"
              x2="14"
              y2="5.5"
              stroke="#fde047"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>
          <circle cx="14" cy="14" r="2" fill="#c87d32" />
        </svg>
      </div>
    </div>
  );
};

/**
 * Animated Copper & Stainless Connecting Pipe between Assembly Line Zones (1 -> 2 -> 3 -> 4)
 */
export const BreweryPipeConnector: React.FC<{
  fromZone: ZoneId;
  activeFlow?: boolean;
}> = ({ fromZone, activeFlow = false }) => {
  const flowColor =
    fromZone === 1
      ? '#f59e0b'
      : fromZone === 2
      ? '#f97316'
      : '#10b981';

  return (
    <div
      className="hidden lg:flex items-center justify-center absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-10 pointer-events-none"
      title={`Morning Shift Transfer Pipe: Zone ${fromZone} → Zone ${fromZone + 1}`}
    >
      <svg viewBox="0 0 44 40" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id={`pipe-grad-${fromZone}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="45%" stopColor="#c87d32" />
            <stop offset="100%" stopColor="#431407" />
          </linearGradient>
        </defs>

        <rect
          x="2"
          y="13"
          width="40"
          height="14"
          rx="3"
          fill={`url(#pipe-grad-${fromZone})`}
          stroke="#292524"
          strokeWidth="1.2"
        />

        <rect x="4" y="10" width="5" height="20" rx="1.5" fill="#78716c" stroke="#1c1917" strokeWidth="1" />
        <rect x="35" y="10" width="5" height="20" rx="1.5" fill="#78716c" stroke="#1c1917" strokeWidth="1" />

        <rect
          x="12"
          y="16"
          width="20"
          height="8"
          rx="4"
          fill="#0c0a09"
          stroke="#fde68a"
          strokeWidth="0.8"
        />

        <line
          x1="14"
          y1="20"
          x2="30"
          y2="20"
          stroke={flowColor}
          strokeWidth="3"
          strokeDasharray="4 3"
          className={activeFlow ? 'animate-pulse' : 'opacity-60'}
        />

        <polygon points="24,17 30,20 24,23" fill="#fef08a" />
      </svg>
    </div>
  );
};

/**
 * Upgrade Blueprint (Equipment) & Brass ID Badge (Staff) Decorative Corner Frame
 */
export const UpgradeFrameAccent: React.FC<{
  upgradeType: UpgradeType;
  isIconic?: boolean;
}> = ({ upgradeType, isIconic = false }) => {
  const stroke = isIconic
    ? '#fbbf24'
    : upgradeType === 'equipment'
    ? '#c87d32'
    : '#38bdf8';

  return (
    <svg
      viewBox="0 0 200 16"
      className="w-full h-3 opacity-75 pointer-events-none select-none"
      preserveAspectRatio="none"
    >
      <line x1="0" y1="8" x2="200" y2="8" stroke={stroke} strokeWidth="0.75" strokeDasharray="3 3" />
      <circle cx="8" cy="8" r="2.5" fill={stroke} />
      <circle cx="192" cy="8" r="2.5" fill={stroke} />
      <rect x="85" y="4" width="30" height="8" rx="2" fill="#140f0b" stroke={stroke} strokeWidth="1" />
    </svg>
  );
};

/**
 * Official vintage artwork mapping for brewery upgrade cards.
 * Returns the authentic 19th-century copperplate engraving / patent illustration
 * for each department, equipment item, and staff role.
 */
export function getUpgradeImageSrc(
  zoneId: ZoneId,
  role: 'equipment' | 'staff' | 'leftWing' | 'rightWing',
  cardNameOrKey?: string
): string {
  if (role === 'leftWing' || role === 'rightWing') {
    return '/upgrades/wing-expansion.jpg';
  }

  const norm = (cardNameOrKey || '').toLowerCase();

  // Specific Equipment Illustrations
  if (role === 'equipment') {
    if (norm.includes('high-capacity hopper') || norm.includes('hopper')) {
      return '/upgrades/high-capacity-hopper.jpg';
    }
    if (norm.includes('cryo-hop') || norm.includes('cryo')) {
      return '/upgrades/cryo-hop-storage.jpg';
    }
    if (norm.includes('roasted malt bin') || norm.includes('roasted')) {
      return '/upgrades/roasted-malt-bin.jpg';
    }
    if (norm.includes('inventory vault') || norm.includes('vault')) {
      return '/upgrades/inventory-vault.jpg';
    }
    if (norm.includes('copper mash tun') || norm.includes('mash tun')) {
      return '/upgrades/copper-mash-tun.jpg';
    }
    if (norm.includes('stainless hop back') || norm.includes('hop back')) {
      return '/upgrades/stainless-hop-back.jpg';
    }
    if (norm.includes('plate heat exchanger') || norm.includes('heat exchanger')) {
      return '/upgrades/plate-heat-exchanger.jpg';
    }
    if (norm.includes('spent grain collector') || norm.includes('spent grain')) {
      return '/upgrades/spent-grain-collector.jpg';
    }
    if (norm.includes('oak aging foeder') || norm.includes('foeder')) {
      return '/upgrades/oak-aging-foeder.jpg';
    }
    if (norm.includes('bright conditioning rig') || norm.includes('bright') || norm.includes('conditioning')) {
      return '/upgrades/bright-conditioning-rig.jpg';
    }
    if (norm.includes('conical unitank') || norm.includes('unitank')) {
      return '/upgrades/conical-unitank.jpg';
    }
    if (norm.includes('horizontal lagering tank') || norm.includes('lagering')) {
      return '/upgrades/horizontal-lagering-tank.jpg';
    }
    if (norm.includes('cold distribution vault') || norm.includes('distribution vault')) {
      return '/upgrades/cold-distribution-vault.jpg';
    }
    if (norm.includes('keg racker') || norm.includes('stretch wrapper') || norm.includes('canning line')) {
      return '/upgrades/packaging-equipment.jpg';
    }

    switch (zoneId) {
      case 1:
        return '/upgrades/grain-equipment.jpg';
      case 2:
        return '/upgrades/brewhouse-equipment.jpg';
      case 3:
        return '/upgrades/cellar-equipment.jpg';
      case 4:
        return '/upgrades/packaging-equipment.jpg';
      default:
        return '/upgrades/brewhouse-equipment.jpg';
    }
  }

  // role === 'staff'
  switch (zoneId) {
    case 1:
      return '/upgrades/staff-warehouse.jpg';
    case 2:
      return '/upgrades/staff-brewhouse.jpg';
    case 3:
      return '/upgrades/staff-cellar.jpg';
    case 4:
      return '/upgrades/staff-packaging.jpg';
    default:
      return '/upgrades/staff-brewhouse.jpg';
  }
}

/**
 * Authentic Vintage Upgrade Artwork Frame
 * Displays the high-resolution 19th-century copperplate engraving
 * with delicate botanical/blueprint corner filigree on warm linen cardstock.
 */
export const UpgradeArtworkFrame: React.FC<{
  imageSrc: string;
  alt: string;
  role: 'equipment' | 'staff' | 'leftWing' | 'rightWing';
  className?: string;
}> = ({ imageSrc, alt, role, className = '' }) => {
  const isEquip = role === 'equipment' || role === 'leftWing';

  return (
    <div
      className={`relative rounded-lg overflow-hidden flex items-center justify-center select-none shadow-md ${className}`}
      style={{
        backgroundColor: '#F8F5EE',
        border: isEquip ? '1.5px solid #85581A' : '1.5px solid #C4A476',
        boxShadow: isEquip
          ? 'inset 0 0 0 1px rgba(212, 175, 55, 0.4), 0 2px 6px rgba(0,0,0,0.5)'
          : 'inset 0 0 0 1px rgba(255, 255, 255, 0.8), 0 2px 6px rgba(30,20,10,0.15)',
      }}
    >
      {/* Background warm linen texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(133, 88, 26, 0.15) 0%, transparent 80%)',
        }}
      />

      {/* High-Resolution Vintage Illustration */}
      <img
        src={imageSrc}
        alt={alt}
        loading="eager"
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />

      {/* Vintage Botanical/Blueprint Corner Filigree Accents */}
      <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-amber-600/70 pointer-events-none" />
      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-amber-600/70 pointer-events-none" />
      <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-amber-600/70 pointer-events-none" />
      <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-amber-600/70 pointer-events-none" />
    </div>
  );
};

// ============================================================================
// DECK 2: REALISTIC & TACTILE BOTANICAL INGREDIENT ART (100 CARDS)
// Warm Heavyweight Off-White Linen Paper (#F8F5EE) + Hand-Rendered Botanical Engravings
// ============================================================================

export interface BotanicalIngredientTheme {
  borderHex: string;
  secondaryBorderHex: string;
  foilHex: string;
  inkHex: string;
  mutedInkHex: string;
  foilBadgeGradient: string;
  foilBadgeBorderHex: string;
  foilBadgeTextHex: string;
  imageSrc: string;
  latinName: string;
  apothecaryGrade: string;
}

const INGREDIENT_BOTANICAL_IMAGES: Record<IngredientSubtype, {
  imageSrc: string;
  latinName: string;
  apothecaryGrade: string;
}> = {
  base_malt: {
    imageSrc: './ingredients/base-malt.jpg',
    latinName: 'Hordeum vulgare • 2-Row Pale',
    apothecaryGrade: 'No. 01 • Base Grist',
  },
  specialty_grain: {
    imageSrc: './ingredients/specialty-grain.jpg',
    latinName: 'Hordeum vulgare • Crystal 60L',
    apothecaryGrade: 'No. 02 • Kilned Malt',
  },
  dark_roasted_malt: {
    imageSrc: './ingredients/dark-roasted-malt.jpg',
    latinName: 'Hordeum vulgare • Roast 500L',
    apothecaryGrade: 'No. 03 • Drum Roasted',
  },
  bittering_hops: {
    imageSrc: './ingredients/bittering-hops.jpg',
    latinName: 'Humulus lupulus • Kettle Alpha',
    apothecaryGrade: 'No. 04 • Whole Cone',
  },
  aroma_hops: {
    imageSrc: './ingredients/aroma-hops.jpg',
    latinName: 'Humulus lupulus • Lupulin Oil',
    apothecaryGrade: 'No. 05 • Late Addition',
  },
  noble_hops: {
    imageSrc: './ingredients/noble-hops.jpg',
    latinName: 'Humulus lupulus • Saaz & Hallertau',
    apothecaryGrade: 'No. 06 • Bohemian',
  },
  house_yeast: {
    imageSrc: './ingredients/house-yeast.jpg',
    latinName: 'Saccharomyces cerevisiae',
    apothecaryGrade: 'No. 07 • Pure Culture',
  },
  fresh_wet_hops: {
    imageSrc: './ingredients/fresh-wet-hops.jpg',
    latinName: 'Humulus lupulus • Sartori Bine',
    apothecaryGrade: '★ Wild Reserve • Harvest',
  },
  winter_spices: {
    imageSrc: './ingredients/winter-spices.jpg',
    latinName: 'Illicium verum & Cinnamomum',
    apothecaryGrade: '★ Wild Reserve • Botanical',
  },
  local_raspberries: {
    imageSrc: './ingredients/local-raspberries.jpg',
    latinName: 'Rubus idaeus • Saanich Berry',
    apothecaryGrade: '★ Wild Reserve • Estate',
  },
  // 6-Color System Taxonomy Mappings
  grain: {
    imageSrc: './ingredients/base-malt.jpg',
    latinName: 'Hordeum vulgare • 2-Row Grist',
    apothecaryGrade: 'Core Staple • 1 VP',
  },
  hops: {
    imageSrc: './ingredients/bittering-hops.jpg',
    latinName: 'Humulus lupulus • Whole Cone',
    apothecaryGrade: 'Core Staple • 1 VP',
  },
  yeast: {
    imageSrc: './ingredients/house-yeast.jpg',
    latinName: 'Saccharomyces cerevisiae • Pure Slurry',
    apothecaryGrade: 'Universal Staple • 1 VP',
  },
  fruit: {
    imageSrc: './ingredients/local-raspberries.jpg',
    latinName: 'Rubus idaeus • Estate Fruit',
    apothecaryGrade: 'Specialty • 2 VP',
  },
  spices: {
    imageSrc: './ingredients/winter-spices.jpg',
    latinName: 'Illicium verum & Cinnamomum',
    apothecaryGrade: 'Specialty • 2 VP',
  },
  chocolate: {
    imageSrc: './ingredients/dark-roasted-malt.jpg',
    latinName: 'Hordeum vulgare • Roast 500L',
    apothecaryGrade: 'Specialty • 2 VP',
  },
};

export function getBotanicalIngredientTheme(
  category: IngredientCategory,
  subtype: IngredientSubtype = 'base_malt'
): BotanicalIngredientTheme {
  const art = INGREDIENT_BOTANICAL_IMAGES[subtype] || INGREDIENT_BOTANICAL_IMAGES.base_malt;

  switch (category) {
    case 'malt':
      // Malts: Amber / Toasted Copper Border (#B86B35)
      return {
        borderHex: '#B86B35',
        secondaryBorderHex: '#7C3F16',
        foilHex: '#D4AF37',
        inkHex: '#2C180B',
        mutedInkHex: '#6B4226',
        foilBadgeGradient:
          'linear-gradient(135deg, #FBF4E2 0%, #E7CE9A 48%, #C89B54 100%)',
        foilBadgeBorderHex: '#9A6324',
        foilBadgeTextHex: '#3E1F0B',
        ...art,
      };
    case 'hops':
      // Hops: Cedar Green Border (#2D5A27)
      return {
        borderHex: '#2D5A27',
        secondaryBorderHex: '#1B3B17',
        foilHex: '#C5A03F',
        inkHex: '#132A10',
        mutedInkHex: '#335C2D',
        foilBadgeGradient:
          'linear-gradient(135deg, #F4F8EC 0%, #D4E4C3 48%, #A3C18A 100%)',
        foilBadgeBorderHex: '#2D5A27',
        foilBadgeTextHex: '#132A10',
        ...art,
      };
    case 'yeast':
      // House Yeast: Brass Border (#D4AF37)
      return {
        borderHex: '#C59B27',
        secondaryBorderHex: '#856210',
        foilHex: '#D4AF37',
        inkHex: '#2E1E05',
        mutedInkHex: '#6E4E12',
        foilBadgeGradient:
          'linear-gradient(135deg, #FFFBEB 0%, #F3DC8B 48%, #C9A033 100%)',
        foilBadgeBorderHex: '#8E6A12',
        foilBadgeTextHex: '#2E1E05',
        ...art,
      };
    case 'adjunct':
      // Epic Adjuncts: Royal Purple & Gold Foil Border (#5C246E)
      return {
        borderHex: '#5C246E',
        secondaryBorderHex: '#D4AF37',
        foilHex: '#D4AF37',
        inkHex: '#2B0D38',
        mutedInkHex: '#5C246E',
        foilBadgeGradient:
          'linear-gradient(135deg, #FAF0FF 0%, #E5C8F5 45%, #D4AF37 100%)',
        foilBadgeBorderHex: '#5C246E',
        foilBadgeTextHex: '#2B0D38',
        ...art,
      };
  }
}

/**
 * Realistic Hand-Rendered Botanical Engraving & Macro Illustration Plate
 * on Warm Heavyweight Off-White Linen Paper (#F8F5EE) with Gold-Foil Hot-Stamping.
 */
export const BotanicalIngredientArtSVG: React.FC<{
  subtype: IngredientSubtype;
  category: IngredientCategory;
  compact?: boolean;
}> = ({ subtype, category }) => {
  const theme = getBotanicalIngredientTheme(category, subtype);

  return (
    <div
      data-ingredient-art={subtype}
      className="relative w-full min-h-0 flex-1 rounded-md overflow-hidden flex flex-col items-center justify-between select-none"
      style={{
        backgroundColor: '#F8F5EE',
        border: `1px solid ${theme.borderHex}88`,
        boxShadow:
          'inset 0 0 0 1.5px rgba(212, 175, 55, 0.35), inset 0 2px 6px rgba(44, 24, 11, 0.1)',
      }}
    >
      {/* Realistic Hand-Rendered Botanical Engraving / Macro Illustration */}
      <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden p-0.5">
        <img
          src={theme.imageSrc}
          alt={theme.latinName}
          loading="eager"
          className="w-full h-full object-cover rounded-[3px] pointer-events-none"
          style={{
            filter: 'contrast(1.03) saturate(1.04)',
          }}
        />

        {/* Subtle Gold-Foil Hot-Stamped Apothecary Corner Filigree Overlay */}
        <svg
          viewBox="0 0 160 160"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          <rect
            x="4"
            y="4"
            width="152"
            height="152"
            rx="3"
            fill="none"
            stroke={theme.foilHex}
            strokeWidth="0.9"
            opacity="0.7"
          />
          <path
            d="M4 14 L14 4 M146 4 L156 14 M4 146 L14 156 M146 156 L156 146"
            stroke={theme.borderHex}
            strokeWidth="1.2"
            opacity="0.85"
          />
        </svg>
      </div>

      {/* Bottom Vintage Serif Botanical Taxonomy Plate */}
      <div
        className="w-full px-1.5 py-0.5 text-center shrink-0"
        style={{
          backgroundColor: '#F3EFE4',
          borderTop: `1px solid ${theme.borderHex}55`,
        }}
      >
        <span
          className="block font-serif italic text-[7.5px] leading-tight truncate"
          style={{ color: theme.mutedInkHex }}
        >
          {theme.latinName}
        </span>
      </div>
    </div>
  );
};

/**
 * Realistic 3D Brushed Stainless Steel Rail with Multi-Stop Metallic Specular Highlights
 * and 3D Radial-Gradient Brass Rivets along the Top & Bottom Conveyor Edges.
 */
export const ContinuousSteelRailEdgeSVG: React.FC<{
  position: 'top' | 'bottom';
  accentHex?: string;
}> = ({ position }) => {
  const gradId = `ss304-rail-${position}`;
  const rivetId = `brass-rivet-${position}`;

  return (
    <div
      className="w-full h-4 overflow-hidden select-none shrink-0 relative"
      style={{
        boxShadow:
          position === 'top'
            ? '0 2px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.45)'
            : '0 -2px 4px rgba(0,0,0,0.45), inset 0 -1px 0 rgba(255,255,255,0.35)',
      }}
    >
      <svg viewBox="0 0 240 16" preserveAspectRatio="none" className="w-full h-full block">
        <defs>
          {/* Realistic 3D Brushed 304 Stainless Steel Cylinder Gradient */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="18%" stopColor="#a1a1aa" />
            <stop offset="36%" stopColor="#f4f4f5" />
            <stop offset="50%" stopColor="#71717a" />
            <stop offset="68%" stopColor="#d4d4d8" />
            <stop offset="85%" stopColor="#52525b" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>
          {/* 3D Domed Brass Rivet Radial Gradient */}
          <radialGradient id={rivetId} cx="35%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="35%" stopColor="#FDE047" />
            <stop offset="70%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#422006" />
          </radialGradient>
        </defs>

        {/* Brushed Stainless Steel Base Plate */}
        <rect x="0" y="0" width="240" height="16" fill={`url(#${gradId})`} />

        {/* Recessed Dark Industrial Channel Groove */}
        <rect x="0" y="6" width="240" height="4" fill="#18181b" opacity="0.78" />
        <line x1="0" y1="6" x2="240" y2="6" stroke="#09090b" strokeWidth="0.9" />
        <line x1="0" y1="10" x2="240" y2="10" stroke="#f4f4f5" strokeWidth="0.7" opacity="0.75" />

        {/* Top & Bottom Specular Steel Rail Lips */}
        <line x1="0" y1="2" x2="240" y2="2" stroke="#ffffff" strokeWidth="0.9" opacity="0.7" />
        <line x1="0" y1="14" x2="240" y2="14" stroke="#e4e4e7" strokeWidth="0.8" opacity="0.6" />

        {/* Steel Cross-Flanges & 3D Domed Brass Rivets */}
        {[15, 45, 75, 105, 135, 165, 195, 225].map((x) => (
          <g key={x}>
            <rect
              x={x - 4}
              y="1"
              width="8"
              height="14"
              rx="1.5"
              fill="#3f3f46"
              stroke="#18181b"
              strokeWidth="0.7"
            />
            <line
              x1={x - 3}
              y1="2"
              x2={x - 3}
              y2="14"
              stroke="#d4d4d8"
              strokeWidth="0.6"
              opacity="0.6"
            />
            {/* Top Domed Brass Rivet */}
            <circle cx={x + 0.4} cy="4.9" r="2.1" fill="#09090b" opacity="0.55" />
            <circle cx={x} cy="4.5" r="2" fill={`url(#${rivetId})`} stroke="#422006" strokeWidth="0.4" />
            {/* Bottom Domed Brass Rivet */}
            <circle cx={x + 0.4} cy="11.9" r="2.1" fill="#09090b" opacity="0.55" />
            <circle cx={x} cy="11.5" r="2" fill={`url(#${rivetId})`} stroke="#422006" strokeWidth="0.4" />
          </g>
        ))}
      </svg>
    </div>
  );
};

/**
 * Physical Wooden Bottle-Cap & Oak Barrel Penalty Token resting with 3D Depth on the Conveyor Rail Track
 */
export const WoodenBarrelRailTokenSVG: React.FC<{
  label: string;
  sublabel?: string;
  variant?: 'free' | 'skip_cost' | 'bonus_loot' | 'rivet_joint';
}> = ({ label, sublabel, variant = 'skip_cost' }) => {
  const isFree = variant === 'free';
  const isLoot = variant === 'bonus_loot';

  const capRimColor = isFree ? '#6EE7B7' : isLoot ? '#FDE68A' : '#E5C158';
  const woodCoreGradient = isFree
    ? 'radial-gradient(circle at 35% 30%, #115E42 0%, #064E3B 60%, #022C22 100%)'
    : isLoot
    ? 'radial-gradient(circle at 35% 30%, #B45309 0%, #78350F 65%, #3B1604 100%)'
    : 'radial-gradient(circle at 35% 30%, #8C4A27 0%, #5C2C14 65%, #2E1306 100%)';

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full select-none"
      style={{
        background: woodCoreGradient,
        border: `1.5px solid ${capRimColor}`,
        boxShadow:
          '0 4px 10px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9), inset 0 1px 1.5px rgba(255,255,255,0.35)',
      }}
    >
      {/* Tactile 3D Crimped Bottle-Cap & Turned Oak Token Icon */}
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 drop-shadow">
        {/* Crimped Metallic Crown Teeth */}
        <circle
          cx="12"
          cy="12"
          r="10.5"
          fill="#27130A"
          stroke={capRimColor}
          strokeWidth="1.8"
          strokeDasharray="2.2 1.2"
        />
        {/* Turned Walnut / Oak Wood Inner Disc */}
        <circle
          cx="12"
          cy="12"
          r="8"
          fill={isFree ? '#065F46' : '#78350F'}
          stroke="#FDE68A"
          strokeWidth="0.9"
        />
        {/* Subtle Wood Grain Rings & Center Brass Rivet */}
        <circle
          cx="12"
          cy="12"
          r="5.2"
          fill="none"
          stroke="#FDE68A"
          strokeWidth="0.6"
          strokeDasharray="3 2"
          opacity="0.7"
        />
        <circle cx="12" cy="12" r="2.2" fill="#FDE047" stroke="#422006" strokeWidth="0.7" />
      </svg>

      <span className="text-[8.5px] font-serif font-bold uppercase tracking-wider text-amber-50 leading-none whitespace-nowrap drop-shadow-sm">
        {label}
      </span>
      {sublabel && (
        <span className="text-[7.5px] font-serif italic font-semibold text-amber-200 leading-none whitespace-nowrap">
          {sublabel}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// DECK 3: DARK WOOD & BRASS ISOMETRIC MACHINERY (15 EQUIPMENT UPGRADES)
// Dark Walnut / Burnished Brass Background (#1A120B) + 3D Isometric Machinery (No Grids)
// ============================================================================

export const EquipmentBlueprintArtSVG: React.FC<{
  effectKey: UpgradeEffectKey;
  targetZone: ZoneId;
  compact?: boolean;
}> = ({ effectKey, targetZone, compact = false }) => {
  const patentSpecCode: Partial<Record<UpgradeEffectKey, { code: string; subtitle: string }>> = {
    hand_limit_plus_3: { code: 'EQUIP. Z01-SILO', subtitle: 'Twin Bulk Malt Silos & Elevator' },
    hand_limit_plus_2: { code: 'EQUIP. Z01-SILO', subtitle: 'Grain Silo Expansion (+2 Hand Limit)' },
    extra_source_draw: { code: 'EQUIP. Z01-MILL', subtitle: '4-Roller Fluted Malt Mill' },
    hopper_malt_exchange: { code: 'EQUIP. Z01-HOPR', subtitle: 'High-Capacity Grist Hopper' },
    free_conveyor_flush: { code: 'EQUIP. Z01-FLSH', subtitle: 'Pneumatic Conveyor Flush Gate' },
    free_skip_conveyor: { code: 'EQUIP. Z01-DIV', subtitle: 'Pneumatic Conveyor Diverter Gate' },
    free_skips_plus_2: { code: 'EQUIP. Z01-FAST', subtitle: 'Automated Grist Intake Gate' },
    kettle_discount_malt: { code: 'EQUIP. Z02-MASH', subtitle: 'Steam-Jacketed Copper Mash Tun' },
    kettle_discount_hops: { code: 'EQUIP. Z02-WHIRL', subtitle: 'Tangential Whirlpool Hop-Back' },
    kettle_double_batch: { code: 'EQUIP. Z02-DUAL', subtitle: 'Rapid Wort Chiller (+1 Capacity)' },
    skip_ferment_to_dock: { code: 'EQUIP. Z02-SKIP', subtitle: 'Direct Transfer Bypass Manifold' },
    wildcard_hops: { code: 'EQUIP. Z02-CANN', subtitle: 'Pressurized Hop Dosing Cannon' },
    carboy_capacity_plus_1: { code: 'EQUIP. Z03-TANK', subtitle: 'Horizontal Lager Tank Array (+1)' },
    fast_ferment: { code: 'EQUIP. Z03-GLYC', subtitle: 'Dual-Stage Glycol Chiller Unit' },
    yeast_on_cellar_entry: { code: 'EQUIP. Z03-PROP', subtitle: 'Active Yeast Propagation Brink' },
    cellar_master_advance: { code: 'EQUIP. Z03-RACK', subtitle: 'Gravity Racking Arm Assembly' },
    yeast_propagation: { code: 'EQUIP. Z03-PROP', subtitle: 'Pure Culture Karlsberg Vessel' },
    yeast_recycle: { code: 'EQUIP. Z03-RECY', subtitle: 'Yeast Brink & Harvesting Manifold' },
    dock_draw_2: { code: 'EQUIP. Z04-CANN', subtitle: 'Automated Rotary Canning Line' },
    dock_draw_1: { code: 'EQUIP. Z04-STCK', subtitle: 'Depalletizer & In-Line Stacker' },
    dock_capacity_plus_1: { code: 'EQUIP. Z04-LINE', subtitle: 'Automated Canning Line (+1 Dock)' },
    ship_all_zone4: { code: 'EQUIP. Z04-DISP', subtitle: 'High-Volume Freight Dispatch Dock' },
    free_ship_action: { code: 'EQUIP. Z04-LOGS', subtitle: 'Automated Loading Bay Stager' },
    dock_refund_1: { code: 'EQUIP. Z04-WASH', subtitle: 'Keg Washing & Sanitizing Station' },
    packaging_brew_discount: { code: 'EQUIP. Z04-EXPD', subtitle: 'High-Speed Outbound Pallet Stager' },
    upgrade_cost_discount_1: { code: 'WING. W01-AUTO', subtitle: 'Central Automation Touchscreen Panel' },
    extra_workday_action: { code: 'WING. W01-OPSM', subtitle: 'Operations Command Console' },
    unlimited_dock_capacity: { code: 'WING. W04-VAUL', subtitle: 'Sub-Zero Cold Storage Vault' },
    fleet_delivery_bonus: { code: 'WING. W04-FLEE', subtitle: 'Direct Island Distribution Fleet' },
    wing_sourcing_master: { code: 'WING. W01-SRCE', subtitle: 'Operations Sourcing Command Console' },
    wing_distribution_hub: { code: 'WING. W04-DIST', subtitle: 'Direct-to-Pub Distribution Pipeline' },
    wing_grist_exchange: { code: 'WING. W01-GRST', subtitle: 'Bulk Grist Silo Matrix Controller' },
    wing_cold_freight: { code: 'WING. W04-COLD', subtitle: 'Cold-Chain Refrigerated Freight Depot' },
    taco_bar_tasting_room: { code: 'EQUIP. Z04-TACO', subtitle: '8-Tap Brass Tower & Taco Bar' },
    shift_supervisor: { code: 'EQUIP. Z01-SUP', subtitle: 'Grain Inventory Ledger Desk' },
    sean_hoyne_master_brewer: { code: 'EQUIP. Z02-MSTR', subtitle: 'Master Brewer Sampling Station' },
    source_on_brew: { code: 'EQUIP. Z02-ASST', subtitle: 'Continuous Copper Wort Grant' },
    adjunct_specialist: { code: 'EQUIP. Z04-INFU', subtitle: 'Botanical Hop & Berry Infuser' },
    loading_dock_vp_plus_1: { code: 'EQUIP. Z04-KEG', subtitle: 'Hydraulic Keg Palletizer' },
  };

  const spec = patentSpecCode[effectKey] || {
    code: `EQUIP. Z0${targetZone}-MACH`,
    subtitle: 'Victoria Brewhouse Machinery',
  };

  return (
    <div
      data-upgrade-art={`equipment-${effectKey}`}
      className={`relative w-full flex-1 min-h-0 rounded-md overflow-hidden flex flex-col justify-between select-none ${
        compact ? 'h-14' : ''
      }`}
      style={{
        backgroundColor: '#1A120B',
        backgroundImage: `
          radial-gradient(ellipse at 50% 35%, rgba(217, 119, 6, 0.22) 0%, rgba(133, 88, 26, 0.08) 60%, transparent 85%),
          linear-gradient(180deg, #251B12 0%, #1A130D 50%, #120D08 100%)
        `,
        border: '1.5px solid #85581A',
        boxShadow:
          'inset 0 0 0 1px rgba(212, 175, 55, 0.35), inset 0 2px 8px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Warm 3D Isometric Machinery Canvas (No Grid) */}
      <div className="relative w-full flex-1 min-h-0 flex items-center justify-center p-1">
        <svg viewBox="0 0 240 120" className="w-full h-full">
          <defs>
            <linearGradient id="eq-copper" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="20%" stopColor="#F59E0B" />
              <stop offset="55%" stopColor="#C87D32" />
              <stop offset="85%" stopColor="#8C4A19" />
              <stop offset="100%" stopColor="#3D1B05" />
            </linearGradient>
            <linearGradient id="eq-steel" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#F1F5F9" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="75%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="eq-brass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDEB" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="60%" stopColor="#D4AF37" />
              <stop offset="85%" stopColor="#92400E" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
            <linearGradient id="eq-iron" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="40%" stopColor="#334155" />
              <stop offset="80%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="eq-wood-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A2E1B" />
              <stop offset="40%" stopColor="#321D10" />
              <stop offset="80%" stopColor="#1E1108" />
              <stop offset="100%" stopColor="#100803" />
            </linearGradient>
            <linearGradient id="eq-amber-wort" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="eq-glycol-blue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="40%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <radialGradient id="eq-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#D97706" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Brewhouse Machinery Warm Glow */}
          <ellipse cx="120" cy="65" rx="90" ry="38" fill="url(#eq-glow)" />

          {/* Heavy Machine Pedestal Base (Dark Walnut with Brass Inlay Edge) */}
          <ellipse cx="120" cy="102" rx="94" ry="14" fill="#0C0704" opacity="0.6" />
          <ellipse cx="120" cy="100" rx="90" ry="12" fill="url(#eq-wood-base)" stroke="#5C3A1E" strokeWidth="1.2" />
          <ellipse cx="120" cy="98" rx="86" ry="10" fill="none" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.5" />

          {/* ================================================================ */}
          {/* 1. GRAIN SILO EXPANSION (hand_limit_plus_3 / hand_limit_plus_2) */}
          {/* Symmetrical bulk silos, pneumatic auger, central elevator tower */}
          {/* ================================================================ */}
          {(effectKey === 'hand_limit_plus_3' || effectKey === 'hand_limit_plus_2') && (
            <g>
              {/* Foundation Concrete Footing */}
              <polygon points="40,96 200,96 190,104 50,104" fill="#334155" stroke="#1E293B" strokeWidth="1" />
              
              {/* Left Silo: Corrugated Hammered Copper Bulk Storage */}
              <ellipse cx="68" cy="22" rx="24" ry="8" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.2" />
              <path d="M44 22 V72 C44 82 92 82 92 72 V22" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.2" />
              <path d="M44 72 L68 94 L92 72" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="1.2" />
              {/* Corrugation Strakes */}
              {[32, 42, 52, 62].map((y) => (
                <path key={y} d={`M44 ${y} C44 ${y + 6} 92 ${y + 6} 92 ${y}`} fill="none" stroke="#FEF08A" strokeWidth="0.7" strokeOpacity="0.45" />
              ))}
              {/* Specular Highlight */}
              <path d="M52 24 V70" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.6" />
              {/* Bottom Shut-Off Gate */}
              <rect x="64" y="90" width="8" height="6" fill="#1E293B" stroke="#0F172A" strokeWidth="0.8" />
              <circle cx="68" cy="93" r="1.5" fill="#FDE047" />

              {/* Right Silo: Brushed 304 Sanitary Stainless Steel */}
              <ellipse cx="172" cy="22" rx="24" ry="8" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              <path d="M148 22 V72 C148 82 196 82 196 72 V22" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              <path d="M148 72 L172 94 L196 72" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              {[32, 42, 52, 62].map((y) => (
                <path key={y} d={`M148 ${y} C148 ${y + 6} 196 ${y + 6} 196 ${y}`} fill="none" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.5" />
              ))}
              <path d="M156 24 V70" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />
              {/* Bottom Shut-Off Gate */}
              <rect x="168" y="90" width="8" height="6" fill="#1E293B" stroke="#0F172A" strokeWidth="0.8" />
              <circle cx="172" cy="93" r="1.5" fill="#D4AF37" />

              {/* Central Grain Bucket Elevator Tower */}
              <rect x="110" y="14" width="20" height="82" rx="2" fill="url(#eq-iron)" stroke="#0F172A" strokeWidth="1.2" />
              <ellipse cx="120" cy="14" rx="10" ry="4" fill="url(#eq-brass)" stroke="#0F172A" strokeWidth="1" />
              {/* Inspection Windows */}
              <rect x="115" y="32" width="10" height="12" rx="1" fill="#FEF08A" fillOpacity="0.7" stroke="#0F172A" strokeWidth="0.8" />
              <rect x="115" y="54" width="10" height="12" rx="1" fill="#FEF08A" fillOpacity="0.7" stroke="#0F172A" strokeWidth="0.8" />

              {/* Swept Overhead Transfer Augers */}
              <path d="M68 20 C90 14 110 16 110 20" fill="none" stroke="url(#eq-brass)" strokeWidth="3" />
              <path d="M172 20 C150 14 130 16 130 20" fill="none" stroke="url(#eq-brass)" strokeWidth="3" />

              {/* External Caged Safety Ladder on Left Silo */}
              <line x1="42" y1="26" x2="42" y2="92" stroke="#64748B" strokeWidth="1.2" />
              <line x1="39" y1="26" x2="39" y2="92" stroke="#64748B" strokeWidth="1.2" />
              {[32, 42, 52, 62, 72, 82].map((ly) => (
                <line key={ly} x1="39" y1={ly} x2="42" y2={ly} stroke="#D4AF37" strokeWidth="1" />
              ))}
            </g>
          )}

          {/* ================================================================ */}
          {/* 2. PRECISION 4-ROLLER MALT MILL (extra_source_draw) */}
          {/* Heavy cast-iron mill, copper hopper, fluted rollers, flywheel */}
          {/* ================================================================ */}
          {effectKey === 'extra_source_draw' && (
            <g>
              {/* Upper Copper Grain Inlet Hopper with Viewing Glass */}
              <polygon points="70,14 170,14 146,42 94,42" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.5" />
              <polygon points="80,18 160,18 140,38 100,38" fill="url(#eq-copper)" opacity="0.8" />
              <line x1="82" y1="20" x2="158" y2="20" stroke="#FFFBEB" strokeWidth="1.2" strokeOpacity="0.6" />
              {/* Hopper Sight Glass */}
              <rect x="112" y="24" width="16" height="12" rx="1" fill="#FEF08A" fillOpacity="0.55" stroke="#78350F" strokeWidth="0.8" />
              <line x1="114" y1="30" x2="126" y2="30" stroke="#B45309" strokeWidth="1" />

              {/* Heavy Cast-Iron Mill Enclosure (Dark Slate) */}
              <rect x="74" y="42" width="92" height="54" rx="4" fill="url(#eq-iron)" stroke="#0F172A" strokeWidth="1.5" />
              {/* Brass Builder's Plaque */}
              <rect x="94" y="45" width="52" height="8" rx="1.5" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="0.8" />
              <text x="120" y="51" fill="#1A0D06" fontSize="4.2" fontFamily="Cinzel, serif" fontWeight="black" textAnchor="middle">HOYNE PRECISION 4-ROLLER</text>

              {/* Cutaway Inspection Window with 4 Fluted Hardened Steel Rollers */}
              <rect x="84" y="55" width="72" height="36" rx="2" fill="#090D16" stroke="#475569" strokeWidth="1" />
              
              {/* Top Pair: Coarse Cracking Rollers */}
              <g>
                <circle cx="104" cy="65" r="9" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1" />
                <circle cx="136" cy="65" r="9" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1" />
                {/* Fluted Serrations */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                  <line
                    key={ang}
                    x1={104 + Math.cos((ang * Math.PI) / 180) * 5}
                    y1={65 + Math.sin((ang * Math.PI) / 180) * 5}
                    x2={104 + Math.cos((ang * Math.PI) / 180) * 9}
                    y2={65 + Math.sin((ang * Math.PI) / 180) * 9}
                    stroke="#1E293B"
                    strokeWidth="0.8"
                  />
                ))}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                  <line
                    key={ang}
                    x1={136 + Math.cos((ang * Math.PI) / 180) * 5}
                    y1={65 + Math.sin((ang * Math.PI) / 180) * 5}
                    x2={136 + Math.cos((ang * Math.PI) / 180) * 9}
                    y2={65 + Math.sin((ang * Math.PI) / 180) * 9}
                    stroke="#1E293B"
                    strokeWidth="0.8"
                  />
                ))}
                <circle cx="104" cy="65" r="3.5" fill="#D4AF37" stroke="#1E293B" strokeWidth="0.7" />
                <circle cx="136" cy="65" r="3.5" fill="#D4AF37" stroke="#1E293B" strokeWidth="0.7" />
              </g>

              {/* Bottom Pair: Fine Milling Rollers */}
              <g>
                <circle cx="104" cy="81" r="8" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1" />
                <circle cx="136" cy="81" r="8" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1" />
                <circle cx="104" cy="81" r="3" fill="#D4AF37" stroke="#1A0D06" strokeWidth="0.6" />
                <circle cx="136" cy="81" r="3" fill="#D4AF37" stroke="#1A0D06" strokeWidth="0.6" />
              </g>

              {/* Left Side 12-Spoke Drive Flywheel & Flat Belt */}
              <g>
                <circle cx="56" cy="70" r="20" fill="none" stroke="url(#eq-iron)" strokeWidth="3.5" />
                <circle cx="56" cy="70" r="18" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
                <circle cx="56" cy="70" r="5" fill="#D4AF37" stroke="#1A0D06" strokeWidth="1" />
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1={56 + Math.cos((deg * Math.PI) / 180) * 5}
                    y1={70 + Math.sin((deg * Math.PI) / 180) * 5}
                    x2={56 + Math.cos((deg * Math.PI) / 180) * 18}
                    y2={70 + Math.sin((deg * Math.PI) / 180) * 18}
                    stroke="#D4AF37"
                    strokeWidth="1"
                  />
                ))}
                {/* Crowned Leather Flat Belt */}
                <path d="M56 50 L84 58 M56 90 L84 84" stroke="#B45309" strokeWidth="2.5" />
              </g>

              {/* Right Knurled Brass Micrometer Gap Handwheels */}
              <g>
                <circle cx="178" cy="65" r="5" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="0.8" />
                <rect x="171" y="63" width="14" height="4" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="0.6" />
                <circle cx="178" cy="81" r="4.5" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="0.8" />
                <rect x="172" y="79" width="12" height="4" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="0.6" />
              </g>
            </g>
          )}

          {/* ================================================================ */}
          {/* 3. AUTOMATED CONVEYOR DIVERTER (free_skip_conveyor) */}
          {/* Roller track, pneumatic sweep arm, malt sack, signal tower */}
          {/* ================================================================ */}
          {effectKey === 'free_skip_conveyor' && (
            <g>
              {/* Heavy Stainless Steel C-Channel Conveyor Bed */}
              <polygon points="20,74 210,74 220,88 30,88" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              <polygon points="20,74 210,74 210,68 20,68" fill="#475569" stroke="#0F172A" strokeWidth="1" />
              
              {/* Precision Skate Rollers */}
              {[36, 56, 76, 96, 116, 136, 156, 176, 196].map((rx) => (
                <g key={rx}>
                  <ellipse cx={rx} cy="71" rx="6" ry="12" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="0.8" />
                  <ellipse cx={rx} cy="71" rx="2" ry="4" fill="#D4AF37" />
                </g>
              ))}

              {/* Burlap Jute Malt Sack in Transit */}
              <g transform="translate(62, 40)">
                <ellipse cx="28" cy="24" rx="22" ry="12" fill="#EAB308" stroke="#713F12" strokeWidth="1.2" />
                <path d="M8 20 C8 10 48 10 48 20 C48 34 8 34 8 20 Z" fill="#FDE047" stroke="#713F12" strokeWidth="1.2" />
                {/* Tied Twine Neck */}
                <ellipse cx="48" cy="18" rx="4" ry="6" fill="#A16207" stroke="#451A03" strokeWidth="0.8" />
                <line x1="44" y1="18" x2="52" y2="18" stroke="#FEF08A" strokeWidth="1.5" />
                {/* Hoyne 2-Row Stencil */}
                <text x="26" y="22" fill="#78350F" fontSize="4.5" fontFamily="monospace" fontWeight="black" textAnchor="middle">HOYNE 2-ROW</text>
              </g>

              {/* Articulating Pneumatic Sweep Diverter Gate */}
              <g>
                {/* Pneumatic Cylinder */}
                <rect x="130" y="24" width="48" height="12" rx="3" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1" />
                <rect x="126" y="27" width="6" height="6" fill="#D4AF37" />
                {/* Stainless Piston Rod */}
                <rect x="104" y="28" width="24" height="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
                {/* Coiled Polyurethane Air Line */}
                <path d="M174 28 C180 20 186 28 192 20 C198 28 204 20 206 28" fill="none" stroke="#F97316" strokeWidth="1.5" />
                {/* Heavy Sweeper Paddle with Rubber Face */}
                <polygon points="106,24 154,58 150,64 100,28" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="1.2" />
                <line x1="104" y1="28" x2="152" y2="62" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Industrial 3-Tier Signal Stack Light (Right) */}
              <g transform="translate(198, 20)">
                <line x1="12" y1="16" x2="12" y2="52" stroke="#64748B" strokeWidth="2.5" />
                <rect x="7" y="4" width="10" height="7" rx="1.5" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.6" />
                <rect x="7" y="12" width="10" height="7" rx="1.5" fill="#F59E0B" stroke="#78350F" strokeWidth="0.6" />
                <rect x="7" y="20" width="10" height="7" rx="1.5" fill="#22C55E" stroke="#14532D" strokeWidth="0.6" filter="drop-shadow(0 0 3px #4ADE80)" />
              </g>
            </g>
          )}

          {/* ================================================================ */}
          {/* 4. STEAM-JACKETED MASH TUN (kettle_discount_malt) */}
          {/* Hammered copper vessel, motorized rake drive, manway, steam gauge */}
          {/* ================================================================ */}
          {effectKey === 'kettle_discount_malt' && (
            <g>
              {/* Domed Mash Tun Vessel */}
              <ellipse cx="120" cy="38" rx="64" ry="18" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.6" />
              <path d="M56 38 V78 C56 96 184 96 184 78 V38" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.6" />
              
              {/* Dimpled Steam Jacket Lower Section */}
              <path d="M60 58 V78 C60 92 180 92 180 78 V58 Z" fill="url(#eq-iron)" stroke="#1A0D06" strokeWidth="1.2" opacity="0.85" />
              {/* Riveted Jacket Band */}
              <ellipse cx="120" cy="58" rx="60" ry="12" fill="none" stroke="url(#eq-brass)" strokeWidth="2.5" />
              {[68, 88, 108, 132, 152, 172].map((bx) => (
                <circle key={bx} cx={bx} cy={58 + Math.sin(((bx - 60) / 120) * Math.PI) * 3} r="1.5" fill="#FEF08A" stroke="#1A0D06" strokeWidth="0.5" />
              ))}

              {/* Specular High-Polish Dome Sheen */}
              <ellipse cx="120" cy="35" rx="52" ry="11" fill="none" stroke="#FFFBEB" strokeWidth="1.5" strokeOpacity="0.5" />

              {/* Top Overhead Motorized Rake Drive & Gearbox */}
              <rect x="108" y="10" width="24" height="20" rx="3" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              <rect x="114" y="6" width="12" height="6" rx="1.5" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="0.8" />
              <line x1="120" y1="28" x2="120" y2="76" stroke="#0F172A" strokeWidth="3" />
              {/* Stainless Internal Rake Arms & Plow Blades */}
              <line x1="78" y1="68" x2="162" y2="68" stroke="#FFFFFF" strokeWidth="2.2" />
              {[84, 100, 116, 132, 148, 158].map((rx) => (
                <line key={rx} x1={rx} y1="68" x2={rx} y2="82" stroke="url(#eq-brass)" strokeWidth="1.8" />
              ))}

              {/* Front Oval Cleanout Manway Door with Brass Handwheels */}
              <ellipse cx="120" cy="80" rx="22" ry="10" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              <line x1="104" y1="80" x2="136" y2="80" stroke="url(#eq-brass)" strokeWidth="3" />
              <circle cx="112" cy="80" r="3" fill="#D4AF37" stroke="#1A0D06" strokeWidth="0.8" />
              <circle cx="128" cy="80" r="3" fill="#D4AF37" stroke="#1A0D06" strokeWidth="0.8" />

              {/* Pyrex Liquid Sight-Glass Column (Left) */}
              <rect x="44" y="44" width="8" height="38" rx="2" fill="#38BDF8" fillOpacity="0.5" stroke="url(#eq-brass)" strokeWidth="1.2" />
              <rect x="46" y="58" width="4" height="22" fill="url(#eq-amber-wort)" />
              <line x1="44" y1="52" x2="52" y2="52" stroke="#FFFBEB" strokeWidth="1" />
              <line x1="44" y1="64" x2="52" y2="64" stroke="#FFFBEB" strokeWidth="1" />

              {/* Analog Bimetallic Dial Thermometer (Right, reading 65°C) */}
              <circle cx="192" cy="54" r="8" fill="#FFFBEB" stroke="url(#eq-brass)" strokeWidth="1.5" />
              <circle cx="192" cy="54" r="6" fill="#FFFFFF" />
              <line x1="192" y1="54" x2="196" y2="50" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}

          {/* ================================================================ */}
          {/* 5. WHIRLPOOL HOP-BACK (kettle_discount_hops) */}
          {/* Tangential inlet vortex, hop basket, whole hop cones, trub cone */}
          {/* ================================================================ */}
          {effectKey === 'kettle_discount_hops' && (
            <g>
              {/* Cylindrical Copper Vessel with Conical Bottom */}
              <ellipse cx="120" cy="30" rx="54" ry="14" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.5" />
              <path d="M66 30 V72 L120 96 L174 72 V30" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.5" />

              {/* Stainless Steel Perforated Hop Infusion Basket Inside */}
              <ellipse cx="120" cy="36" rx="42" ry="10" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1" />
              <path d="M78 36 V62 C78 74 162 74 162 62 V36" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1" opacity="0.85" />
              
              {/* Cyclonic Liquid Vortex Swirling Golden Wort */}
              <ellipse cx="120" cy="48" rx="36" ry="8" fill="url(#eq-amber-wort)" opacity="0.9" />
              <path d="M96 46 C114 42 138 42 144 48 C144 54 114 54 104 50" fill="none" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />

              {/* Whole Fresh Botanical Hop Cones (Humulus lupulus) in Basket */}
              {[92, 106, 120, 134, 146].map((hx, idx) => (
                <g key={hx} transform={`translate(${hx}, ${52 + (idx % 2) * 4}) rotate(${idx * 15 - 30})`}>
                  <ellipse cx="0" cy="0" rx="5" ry="7" fill="#65A30D" stroke="#365314" strokeWidth="0.8" />
                  <path d="M-3 -2 C0 2 3 -2 0 4 Z" fill="#84CC16" />
                </g>
              ))}

              {/* High-Velocity Tangential Wort Inlet Pipe (Left) */}
              <path d="M28 32 H76" stroke="url(#eq-brass)" strokeWidth="5" strokeLinecap="round" />
              <circle cx="76" cy="32" r="4.5" fill="#D4AF37" stroke="#1A0D06" strokeWidth="1" />

              {/* Trub Discharge Cone Bottom Valve */}
              <rect x="114" y="94" width="12" height="12" rx="2" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="1" />
              <line x1="108" y1="100" x2="132" y2="100" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />

              {/* Polished Pyrex Sight-Glass (Right) */}
              <rect x="180" y="40" width="8" height="34" rx="2" fill="#38BDF8" fillOpacity="0.6" stroke="url(#eq-brass)" strokeWidth="1" />
              <rect x="182" y="48" width="4" height="24" fill="url(#eq-amber-wort)" />
            </g>
          )}

          {/* ================================================================ */}
          {/* 6. DUAL COPPER BREW KETTLE (kettle_double_batch) */}
          {/* Twin onion-domed kettles, central vapor manifold, rolling boil */}
          {/* ================================================================ */}
          {effectKey === 'kettle_double_batch' && (
            <g>
              {/* Left Kettle: Gleaming Hammered Copper */}
              <ellipse cx="72" cy="38" rx="36" ry="12" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.5" />
              <path d="M36 38 V80 C36 94 108 94 108 80 V38" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.5" />
              {/* Bavarian Onion Dome Top */}
              <path d="M48 34 C48 16 72 12 72 8 C72 12 96 16 96 34 Z" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.2" />
              <circle cx="72" cy="8" r="3" fill="#D4AF37" stroke="#1A0D06" strokeWidth="0.8" />
              {/* Circular Boil Inspection Port */}
              <circle cx="72" cy="54" r="10" fill="#090D16" stroke="url(#eq-brass)" strokeWidth="1.5" />
              <circle cx="72" cy="54" r="8" fill="url(#eq-amber-wort)" />
              <circle cx="70" cy="52" r="2" fill="#FFFFFF" opacity="0.8" />

              {/* Right Kettle: Symmetrical Twin Boil Vessel */}
              <ellipse cx="168" cy="38" rx="36" ry="12" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.5" />
              <path d="M132 38 V80 C132 94 204 94 204 80 V38" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.5" />
              <path d="M144 34 C144 16 168 12 168 8 C168 12 192 16 192 34 Z" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.2" />
              <circle cx="168" cy="8" r="3" fill="#D4AF37" stroke="#1A0D06" strokeWidth="0.8" />
              <circle cx="168" cy="54" r="10" fill="#090D16" stroke="url(#eq-brass)" strokeWidth="1.5" />
              <circle cx="168" cy="54" r="8" fill="url(#eq-amber-wort)" />
              <circle cx="166" cy="52" r="2" fill="#FFFFFF" opacity="0.8" />

              {/* Interconnecting Vapor Stack Flue Manifold */}
              <path d="M72 16 C96 22 144 22 168 16" fill="none" stroke="url(#eq-brass)" strokeWidth="4.5" />
              <path d="M120 20 V6" stroke="url(#eq-brass)" strokeWidth="5" />
              <ellipse cx="120" cy="6" rx="5" ry="2" fill="#FEF08A" />

              {/* Dual Pressure & Temperature Gauges */}
              <circle cx="108" cy="46" r="5" fill="#FFFBEB" stroke="#1A0D06" strokeWidth="1" />
              <line x1="108" y1="46" x2="111" y2="44" stroke="#DC2626" strokeWidth="1" />
              <circle cx="132" cy="46" r="5" fill="#FFFBEB" stroke="#1A0D06" strokeWidth="1" />
              <line x1="132" y1="46" x2="135" y2="44" stroke="#DC2626" strokeWidth="1" />
            </g>
          )}

          {/* ================================================================ */}
          {/* 7. GLYCOL CHILLER (carboy_capacity_plus_1) */}
          {/* Dual jacketed conicals, refrigeration cabinet, digital -2.0°C */}
          {/* ================================================================ */}
          {effectKey === 'carboy_capacity_plus_1' && (
            <g>
              {/* Left Conical Fermenter */}
              <ellipse cx="60" cy="22" rx="20" ry="7" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              <path d="M40 22 V56 L60 88 L80 56 V22" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              {/* Royal-Blue Insulated Glycol Cooling Jacket */}
              <path d="M42 32 V54 L60 80 L78 54 V32 Z" fill="url(#eq-glycol-blue)" stroke="#0369A1" strokeWidth="1" opacity="0.9" />
              {/* Spunding Pressure Gauge on Top */}
              <circle cx="60" cy="14" r="4.5" fill="#FFFBEB" stroke="#0F172A" strokeWidth="0.8" />
              <line x1="60" y1="14" x2="63" y2="12" stroke="#16A34A" strokeWidth="1" />

              {/* Right Conical Fermenter */}
              <ellipse cx="112" cy="22" rx="20" ry="7" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              <path d="M92 22 V56 L112 88 L132 56 V22" fill="url(#eq-steel)" stroke="#0F172A" strokeWidth="1.2" />
              <path d="M94 32 V54 L112 80 L130 54 V32 Z" fill="url(#eq-glycol-blue)" stroke="#0369A1" strokeWidth="1" opacity="0.9" />
              <circle cx="112" cy="14" r="4.5" fill="#FFFBEB" stroke="#0F172A" strokeWidth="0.8" />
              <line x1="112" y1="14" x2="115" y2="12" stroke="#16A34A" strokeWidth="1" />

              {/* Heavy Industrial Glycol Chiller Cabinet (Right) */}
              <rect x="150" y="24" width="64" height="66" rx="4" fill="url(#eq-iron)" stroke="#0F172A" strokeWidth="1.5" />
              {/* Dual Condenser Fan Cowls */}
              <circle cx="170" cy="42" r="12" fill="#090D16" stroke="url(#eq-steel)" strokeWidth="1.2" />
              <circle cx="170" cy="42" r="4" fill="#64748B" />
              <circle cx="196" cy="42" r="12" fill="#090D16" stroke="url(#eq-steel)" strokeWidth="1.2" />
              <circle cx="196" cy="42" r="4" fill="#64748B" />

              {/* Digital LED Temperature Display Reading -2.0°C */}
              <rect x="160" y="60" width="44" height="12" rx="2" fill="#020617" stroke="#334155" strokeWidth="1" />
              <text x="182" y="69" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="black" textAnchor="middle" filter="drop-shadow(0 0 2px #38BDF8)">-2.0°C</text>

              {/* Braided Stainless Insulated Supply/Return Glycol Lines */}
              <path d="M60 44 C80 36 120 38 150 48" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
              <path d="M112 44 C124 38 136 42 150 54" fill="none" stroke="#0284C7" strokeWidth="2.5" />
            </g>
          )}

          {/* ================================================================ */}
          {/* 8. TACO BAR TASTING ROOM (taco_bar_tasting_room) */}
          {/* Walnut bar top, 8-tap solid brass tower, fresh pints, street tacos */}
          {/* ================================================================ */}
          {effectKey === 'taco_bar_tasting_room' && (
            <g>
              {/* Overhead Festoon Canopy with Glowing Edison Bulbs */}
              <path d="M24 16 Q120 28 216 16" fill="none" stroke="#451A03" strokeWidth="1.5" />
              {[40, 72, 104, 136, 168, 200].map((bx) => (
                <g key={bx}>
                  <circle cx={bx} cy={16 + Math.sin(((bx - 24) / 192) * Math.PI) * 9} r="4" fill="#FEF08A" filter="drop-shadow(0 0 4px #F59E0B)" />
                  <circle cx={bx} cy={16 + Math.sin(((bx - 24) / 192) * Math.PI) * 9} r="2" fill="#FFFFFF" />
                </g>
              ))}

              {/* Solid Polished Brass 8-Tap Bridge Draft Tower */}
              <path d="M84 62 V38 H156 V62" fill="none" stroke="url(#eq-brass)" strokeWidth="6" strokeLinecap="square" />
              <rect x="80" y="35" width="80" height="6" rx="1.5" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="0.8" />
              {/* 8 Swan-Neck Draft Faucets with Handles */}
              {[88, 96, 104, 112, 128, 136, 144, 152].map((tx) => (
                <g key={tx}>
                  <line x1={tx} y1="35" x2={tx} y2="24" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                  <circle cx={tx} cy="23" r="1.5" fill="#D4AF37" />
                  <line x1={tx} y1="41" x2={tx} y2="48" stroke="url(#eq-brass)" strokeWidth="1.8" strokeLinecap="round" />
                </g>
              ))}

              {/* Live-Edge Dark Walnut Bar Top with Amber Gloss Reflection */}
              <polygon points="16,62 224,62 216,92 24,92" fill="url(#eq-wood-base)" stroke="#5C3A1E" strokeWidth="1.5" />
              <line x1="20" y1="63" x2="220" y2="63" stroke="#FEF3C7" strokeWidth="1.8" strokeOpacity="0.4" />

              {/* Left: Freshly Poured Stemmed Tulip Pint Glasses */}
              <g transform="translate(36, 52)">
                <ellipse cx="10" cy="18" rx="7" ry="2" fill="#0C0704" opacity="0.5" />
                {/* Tulip Glass 1 */}
                <path d="M5 8 C3 14 6 18 10 18 C14 18 17 14 15 8 Z" fill="url(#eq-amber-wort)" stroke="#FFFBEB" strokeWidth="0.8" />
                {/* Velvety Domed Foam Head */}
                <ellipse cx="10" cy="8" rx="5.5" ry="3" fill="#FFFFFF" stroke="#FEF08A" strokeWidth="0.6" />
                {/* Tulip Glass 2 */}
                <path d="M19 10 C17 16 20 20 24 20 C28 20 31 16 29 10 Z" fill="url(#eq-amber-wort)" stroke="#FFFBEB" strokeWidth="0.8" />
                <ellipse cx="24" cy="10" rx="5.5" ry="3" fill="#FFFFFF" stroke="#FEF08A" strokeWidth="0.6" />
              </g>

              {/* Right: Black Slate Serving Platter with 2 Authentic Street Tacos */}
              <g transform="translate(162, 58)">
                <ellipse cx="24" cy="16" rx="26" ry="9" fill="#0F172A" stroke="#475569" strokeWidth="1" />
                {/* Taco 1: Folded Charred Corn Tortilla */}
                <path d="M8 14 C12 8 20 8 24 14" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
                <ellipse cx="16" cy="12" rx="6" ry="2.5" fill="#78350F" />
                <circle cx="14" cy="11" r="1.5" fill="#22C55E" />
                <circle cx="18" cy="11" r="1.5" fill="#EF4444" />
                {/* Taco 2 */}
                <path d="M22 15 C26 9 34 9 38 15" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />
                <ellipse cx="30" cy="13" rx="6" ry="2.5" fill="#78350F" />
                <circle cx="28" cy="12" r="1.5" fill="#22C55E" />
                {/* Lime Wedge */}
                <path d="M38 18 Q44 14 42 20 Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="0.8" />
              </g>
            </g>
          )}

          {/* Fallback Machinery for Any Other Keys */}
          {![
            'hand_limit_plus_3',
            'hand_limit_plus_2',
            'extra_source_draw',
            'free_skip_conveyor',
            'kettle_discount_malt',
            'kettle_discount_hops',
            'kettle_double_batch',
            'carboy_capacity_plus_1',
            'taco_bar_tasting_room',
          ].includes(effectKey) && (
            <g>
              <ellipse cx="120" cy="40" rx="54" ry="16" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.5" />
              <path d="M66 40 V82 C66 98 174 98 174 82 V40" fill="url(#eq-copper)" stroke="#1A0D06" strokeWidth="1.5" />
              <circle cx="120" cy="64" r="16" fill="url(#eq-brass)" stroke="#1A0D06" strokeWidth="1.2" />
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Specification Strip on Dark Brass */}
      {!compact && (
        <div
          className="w-full px-2 py-0.5 flex items-center justify-between text-[7.5px] font-mono shrink-0"
          style={{
            background: 'linear-gradient(90deg, #24170E 0%, #3B2718 50%, #24170E 100%)',
            borderTop: '1px solid #784E1A',
            color: '#FEF3C7',
          }}
        >
          <span className="font-bold truncate text-amber-200">{spec.subtitle}</span>
          <span className="text-amber-400 font-extrabold shrink-0">REV. 2011</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DECK 4: POLAROID-STYLE STAFF IN ACTION PORTRAITS (15 STAFF CARDS)
// Light Pine Frame + Off-White Linen Mat (#FAF7F0) + Dedicated Character/Crew Illustration SVGs
// No beer label art or raw ingredient graphics are re-used.
// ============================================================================

export const StaffPortraitPolaroidSVG: React.FC<{
  effectKey: UpgradeEffectKey;
  name: string;
  compact?: boolean;
}> = ({ effectKey, name, compact = false }) => {
  const staffCaptions: Partial<
    Record<
      UpgradeEffectKey,
      {
        actionTitle: string;
        caption: string;
      }
    >
  > = {
    sean_hoyne_master_brewer: {
      actionTitle: 'Founder & Master Brewer • Victoria, BC',
      caption: 'Sean Hoyne • Brewhouse Master Tasting',
    },
    fast_ferment: {
      actionTitle: 'Cold Cellar & Spunding Specialist',
      caption: 'Head Cellar Master • Valve Calibration',
    },
    loading_dock_vp_plus_1: {
      actionTitle: 'Island Draught & Keg Route Driver',
      caption: 'Hoyne Delivery Crew • Keg Loading',
    },
    yeast_propagation: {
      actionTitle: 'Pure Culture Zymurgy Lab Director',
      caption: 'Yeast Lab Microbiologist • Microscopic Strain Prop',
    },
    free_skip_conveyor: {
      actionTitle: 'Warehouse Logistics & Malt Handling',
      caption: 'Warehouse Forklift Ace • Pallet Routing',
    },
    shift_supervisor: {
      actionTitle: 'Head Maltster & Inventory Steward',
      caption: 'Grain Room Shift Supervisor • Grist Sampling',
    },
    source_on_brew: {
      actionTitle: 'Brewhouse Mash Floor Operator',
      caption: 'Assistant Brewer • Mash Tun Stirring',
    },
    adjunct_specialist: {
      actionTitle: 'Wild Harvest & Botanical Forager',
      caption: 'Seasonal Adjunct Specialist • Wet Hops & Berries',
    },
    hand_limit_plus_3: {
      actionTitle: 'Grain Room Operations',
      caption: 'Silo Specialist • Grain Routing',
    },
    hand_limit_plus_2: {
      actionTitle: 'Grain Room Operations',
      caption: 'Silo Specialist • Grain Routing',
    },
    extra_source_draw: {
      actionTitle: 'Warehouse Storage Tech & Grain Buyer',
      caption: 'Storage Tech • Direct Farm Sourcing',
    },
    hopper_malt_exchange: {
      actionTitle: 'High-Capacity Hopper Operator',
      caption: 'Mill Tech • Continuous Grist Feed',
    },
    free_conveyor_flush: {
      actionTitle: 'Warehouse Operations Lead',
      caption: 'Operations Lead • Rapid Intake Rotation',
    },
    kettle_discount_malt: {
      actionTitle: 'Brewhouse Mash Operations',
      caption: 'Mash Operator • Temperature Control',
    },
    kettle_discount_hops: {
      actionTitle: 'Brewhouse Hop Specialist',
      caption: 'Hop Specialist • Lupulin Dose',
    },
    kettle_double_batch: {
      actionTitle: 'Brewhouse Lead Operator',
      caption: 'Brewmaster • Dual Kettle Boil',
    },
    skip_ferment_to_dock: {
      actionTitle: 'Brew Technician',
      caption: 'Brew Tech • Express Dock Transfer',
    },
    carboy_capacity_plus_1: {
      actionTitle: 'Cellar Refrigeration Technician',
      caption: 'Cellar Tech • Glycol Manifold',
    },
    yeast_on_cellar_entry: {
      actionTitle: 'Microbiology Lab Specialist',
      caption: 'Lab Specialist • Active Krausen Slurry',
    },
    cellar_master_advance: {
      actionTitle: 'Head Cellar Master',
      caption: 'Cellar Master • Rapid Gravity Transfer',
    },
    taco_bar_tasting_room: {
      actionTitle: 'Taproom Hospitality Crew',
      caption: 'Taproom Lead • Pints & Tacos',
    },
    free_skips_plus_2: {
      actionTitle: 'Conveyor Optimization Crew',
      caption: 'Pneumatic Tech • Direct Conveyor Line',
    },
    yeast_recycle: {
      actionTitle: 'Cellar Fermentation Technician',
      caption: 'Yeast Tech • Harvest & Slurry Viability',
    },
    wildcard_hops: {
      actionTitle: 'Hop Master Specialist',
      caption: 'Hop Artisan • Cultivar Selection & Dosing',
    },
    dock_draw_2: {
      actionTitle: 'Rotary Packaging Technician',
      caption: 'Packaging Pro • 120 Cans Per Minute',
    },
    dock_draw_1: {
      actionTitle: 'Depalletizer & Stacker Operator',
      caption: 'Stacker Tech • Packaging Supply Stream',
    },
    dock_capacity_plus_1: {
      actionTitle: 'Automated Packaging Technician',
      caption: 'Packaging Tech • Dual Dock Staging',
    },
    ship_all_zone4: {
      actionTitle: 'Freight Dispatch Supervisor',
      caption: 'Dispatch Supervisor • Regional Fleet Manifest',
    },
    free_ship_action: {
      actionTitle: 'Packaging Logistics Lead',
      caption: 'Logistics Lead • Continuous Turnaround',
    },
    dock_refund_1: {
      actionTitle: 'Taproom Cellar Hand',
      caption: 'Taproom Hand • Keg Sanitization & Return',
    },
    packaging_brew_discount: {
      actionTitle: 'Dock Freight Expediter',
      caption: 'Logistics Lead • Brewhouse Turn Dispatch',
    },
    upgrade_cost_discount_1: {
      actionTitle: 'Brewhouse Automation Specialist',
      caption: 'Automation Tech • Unified Touchscreen PLC',
    },
    extra_workday_action: {
      actionTitle: 'Operations Manager',
      caption: 'Ops Manager • Victoria Brewhouse Efficiency',
    },
    unlimited_dock_capacity: {
      actionTitle: 'Cold Storage Vault Supervisor',
      caption: 'Cold Vault Lead • High-Density Inventory',
    },
    fleet_delivery_bonus: {
      actionTitle: 'Distribution Fleet Supervisor',
      caption: 'Fleet Supervisor • Direct Draught Distribution',
    },
    wing_sourcing_master: {
      actionTitle: 'Operations Command Director',
      caption: 'Supply Officer • Sourcing Hub Control',
    },
    wing_distribution_hub: {
      actionTitle: 'Regional Distribution Director',
      caption: 'Fleet Director • Direct-to-Pub Line',
    },
    wing_grist_exchange: {
      actionTitle: 'Grist & Silo Commander',
      caption: 'Grain Master • Silo Inventory Matrix',
    },
    wing_cold_freight: {
      actionTitle: 'Cold-Chain Freight Dispatcher',
      caption: 'Cold-Chain Lead • Express Cellar Rail',
    },
  };

  const info = staffCaptions[effectKey] || {
    actionTitle: 'Brewery Staff Specialist',
    caption: `${name} • Hoyne Brewery Operations`,
  };

  return (
    <div
      data-upgrade-art={`staff-${effectKey}`}
      className={`relative w-full flex-1 min-h-0 rounded-md overflow-hidden flex flex-col justify-between select-none ${
        compact ? 'h-14' : ''
      }`}
      style={{
        backgroundColor: '#FAF7F0',
        backgroundImage: 'linear-gradient(175deg, #FFFDF8 0%, #FAF6EE 70%, #F2EBDC 100%)',
        border: '1.5px solid #C4A476',
        boxShadow:
          '0 3px 8px rgba(30, 20, 10, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.85)',
      }}
    >
      {/* Full-Width Polaroid Photo Canvas of Brewery Staff in Action */}
      <div className="relative w-full flex-1 min-h-0 p-1 flex flex-col items-center justify-center overflow-hidden">
        <div
          className="relative w-full h-full rounded-[3px] overflow-hidden flex items-center justify-center bg-stone-900 shadow-inner"
        >
          <svg viewBox="0 0 240 180" className="w-full h-full object-cover">
            <defs>
              <linearGradient id="st-skin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDDEC0" />
                <stop offset="40%" stopColor="#F7C49D" />
                <stop offset="75%" stopColor="#E29A6B" />
                <stop offset="100%" stopColor="#B86A41" />
              </linearGradient>
              <linearGradient id="st-skin-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E29A6B" />
                <stop offset="50%" stopColor="#B86A41" />
                <stop offset="100%" stopColor="#7C3B1E" />
              </linearGradient>
              <linearGradient id="st-navy-work" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="40%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id="st-beer-glass" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="35%" stopColor="#FBBF24" />
                <stop offset="70%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="st-copper-wall" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9A4515" />
                <stop offset="45%" stopColor="#5E2207" />
                <stop offset="85%" stopColor="#2C1204" />
                <stop offset="100%" stopColor="#150802" />
              </linearGradient>
              <linearGradient id="st-tank-steel" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#E2E8F0" />
                <stop offset="55%" stopColor="#94A3B8" />
                <stop offset="85%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
              <linearGradient id="st-amber-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#D97706" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0F0804" stopOpacity="0.65" />
              </linearGradient>
              <radialGradient id="st-warm-light" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#78350F" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0F0804" stopOpacity="0.6" />
              </radialGradient>
            </defs>

            {/* ============================================================== */}
            {/* 1. SEAN HOYNE - MASTER BREWER (Zone 2) */}
            {/* Authentic hand-drawn portrait holding a pint in the brewery */}
            {/* ============================================================== */}
            {effectKey === 'sean_hoyne_master_brewer' && (
              <g>
                {/* Brewhouse Interior Background with Arched Brick & Copper Kettles */}
                <rect width="240" height="180" fill="url(#st-copper-wall)" />
                {/* Massive Hammered Copper Kettle in Background */}
                <ellipse cx="65" cy="115" rx="60" ry="75" fill="#782E0C" stroke="#3E1505" strokeWidth="2" opacity="0.75" />
                <ellipse cx="65" cy="45" rx="38" ry="12" fill="#B45309" stroke="#3E1505" strokeWidth="1" opacity="0.6" />
                <path d="M50 45 V125" stroke="#FDE68A" strokeWidth="2" strokeOpacity="0.35" />
                {/* Steam Vapor Wisp */}
                <path d="M65 35 Q55 15 75 0" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.25" />

                {/* Sean Hoyne Upper Body (Navy Button-Down Brewery Work Shirt) */}
                <path d="M68 180 L86 122 C94 112 114 108 144 108 C174 108 194 112 202 122 L224 180 Z" fill="url(#st-navy-work)" stroke="#0F172A" strokeWidth="1.5" />
                {/* Shirt Collar, Buttons & Chest Pocket */}
                <path d="M126 108 L144 138 L162 108" fill="#1E293B" stroke="#334155" strokeWidth="1.2" />
                <line x1="144" y1="138" x2="144" y2="180" stroke="#334155" strokeWidth="1.5" />
                <circle cx="144" cy="150" r="1.5" fill="#D4AF37" />
                <circle cx="144" cy="165" r="1.5" fill="#D4AF37" />
                {/* Embroidered Hoyne Gold Crown Crest over Pocket */}
                <rect x="168" y="132" width="22" height="18" rx="2" fill="#1E293B" stroke="#334155" strokeWidth="1" />
                <polygon points="174,142 179,136 184,142 179,144" fill="#FDE047" stroke="#78350F" strokeWidth="0.5" />

                {/* Neck & Realistic Collarbone Shading */}
                <path d="M132 94 L132 116 C138 120 150 120 156 116 L156 94 Z" fill="url(#st-skin-shadow)" />

                {/* Anatomical Head & Expressive Facial Features */}
                <ellipse cx="144" cy="72" rx="23" ry="27" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />
                {/* Cheekbone & Jaw Contour */}
                <path d="M125 72 C125 90 134 98 144 98 C154 98 163 90 163 72" fill="none" stroke="#B86A41" strokeWidth="1.2" />

                {/* Silver-White & Ash Brown Wavy Hair */}
                <path d="M121 64 C118 40 134 30 154 32 C170 34 172 46 168 64 C163 56 156 46 144 46 C132 46 125 54 121 64 Z" fill="#64748B" stroke="#334155" strokeWidth="0.8" />
                <path d="M126 50 C136 40 152 40 164 48" stroke="#E2E8F0" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M122 58 C130 52 142 50 150 50" stroke="#CBD5E1" strokeWidth="1.2" fill="none" />

                {/* Ears */}
                <ellipse cx="120" cy="74" rx="4" ry="7" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="0.8" />
                <ellipse cx="168" cy="74" rx="4" ry="7" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="0.8" />

                {/* Salt-and-Pepper Distinguished Beard & Mustache */}
                <path d="M127 76 C127 96 138 103 144 103 C150 103 161 96 161 76 C155 82 149 84 144 84 C139 84 133 82 127 76 Z" fill="#64748B" stroke="#475569" strokeWidth="1" />
                <path d="M132 80 C138 86 150 86 156 80" stroke="#E2E8F0" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                {/* Warm Smiling Mouth */}
                <path d="M136 84 Q144 90 152 84" fill="none" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" />

                {/* Expressive Eyes & Gold Wire-Rim Glasses */}
                <rect x="129" y="62" width="12" height="9" rx="3" fill="none" stroke="#D4AF37" strokeWidth="1.3" />
                <rect x="147" y="62" width="12" height="9" rx="3" fill="none" stroke="#D4AF37" strokeWidth="1.3" />
                <line x1="141" y1="66" x2="147" y2="66" stroke="#D4AF37" strokeWidth="1.3" />
                <ellipse cx="135" cy="66" rx="2" ry="2.2" fill="#1E293B" />
                <ellipse cx="153" cy="66" rx="2" ry="2.2" fill="#1E293B" />
                <circle cx="136" cy="65" r="0.8" fill="#FFFFFF" />
                <circle cx="154" cy="65" r="0.8" fill="#FFFFFF" />
                {/* Laugh Lines & Eyebrows */}
                <path d="M127 60 Q135 57 141 60" fill="none" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M147 60 Q153 57 161 60" fill="none" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M125 67 C123 69 123 71 125 73" stroke="#B86A41" strokeWidth="1" fill="none" />
                <path d="M163 67 C165 69 165 71 163 73" stroke="#B86A41" strokeWidth="1" fill="none" />

                {/* Right Arm & Hand Raising Golden Pint Glass */}
                <path d="M80 172 L58 124 L74 114 L96 150 Z" fill="url(#st-navy-work)" stroke="#0F172A" strokeWidth="1.2" />
                {/* Hand Gripping Pint Glass */}
                <path d="M48 114 C48 108 58 108 64 114 C68 118 68 126 64 130 L52 130 Z" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />
                <ellipse cx="50" cy="116" rx="3.5" ry="3" fill="#F7C49D" />
                <ellipse cx="50" cy="122" rx="3.5" ry="3" fill="#F7C49D" />

                {/* Real English Pint Glass with Effervescent Golden Craft Beer */}
                <polygon points="42,74 66,74 61,126 47,126" fill="url(#st-beer-glass)" stroke="#FFFBEB" strokeWidth="1.4" />
                {/* Creamy Domed Foam Head */}
                <ellipse cx="54" cy="74" rx="12.5" ry="5.5" fill="#FFFFFF" stroke="#FEF3C7" strokeWidth="1" />
                <ellipse cx="54" cy="71" rx="10" ry="3.5" fill="#FFFDF5" />
                {/* Specular Light Reflection & Carbonation Beads */}
                <line x1="45" y1="78" x2="48" y2="122" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.8" />
                <circle cx="54" cy="90" r="1" fill="#FFFFFF" opacity="0.7" />
                <circle cx="56" cy="100" r="1" fill="#FFFFFF" opacity="0.7" />
                <circle cx="52" cy="110" r="1" fill="#FFFFFF" opacity="0.7" />
              </g>
            )}

            {/* ============================================================== */}
            {/* 2. HEAD CELLAR MASTER (Zone 3 - fast_ferment / carboy) */}
            {/* Cellar worker in rubber boots and overalls operating tank valve */}
            {/* ============================================================== */}
            {(effectKey === 'fast_ferment' || effectKey === 'carboy_capacity_plus_1') && (
              <g>
                {/* Industrial Cold Cellar Background */}
                <rect width="240" height="180" fill="#090D16" />
                {/* Tiled Wet Cellar Floor with Quarry Grid */}
                <polygon points="0,132 240,132 240,180 0,180" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
                {[30, 75, 120, 165, 210].map((gx) => (
                  <line key={gx} x1={gx} y1="132" x2={gx - 35} y2="180" stroke="#334155" strokeWidth="1.2" />
                ))}
                {/* Floor Drain with Circular Grate */}
                <ellipse cx="55" cy="158" rx="16" ry="5" fill="#020617" stroke="#475569" strokeWidth="1.2" />
                <line x1="43" y1="158" x2="67" y2="158" stroke="#475569" strokeWidth="1.2" />

                {/* Massive 304 Stainless Steel Conical Bright Tank (Right) */}
                <ellipse cx="196" cy="24" rx="48" ry="15" fill="url(#st-tank-steel)" stroke="#090D16" strokeWidth="1.8" />
                <path d="M148 24 V84 L196 142 L244 84 V24" fill="url(#st-tank-steel)" stroke="#090D16" strokeWidth="1.8" />
                {/* Frosty Condensation Beads & Specular Sheen */}
                <path d="M168 30 V105" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.6" strokeLinecap="round" />
                <path d="M174 28 V100" stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.4" />
                {/* Pressure Gauge Dial (15 PSI Green Zone) */}
                <circle cx="162" cy="58" r="8" fill="#FFFFFF" stroke="#090D16" strokeWidth="1.5" />
                <path d="M158 54 A5 5 0 0 1 166 54" stroke="#16A34A" strokeWidth="1.8" fill="none" />
                <line x1="162" y1="58" x2="165" y2="54" stroke="#090D16" strokeWidth="1.5" />

                {/* Polished Brass Tri-Clamp Butterfly Valve Assembly */}
                <rect x="188" y="136" width="16" height="16" rx="2" fill="url(#eq-brass)" stroke="#090D16" strokeWidth="1.2" />
                {/* Heavy Red Valve Lever Handle being gripped */}
                <line x1="180" y1="140" x2="216" y2="140" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
                <circle cx="216" cy="140" r="3" fill="#991B1B" />

                {/* Cellar Master Figure: Yellow Rubber Boots */}
                <g>
                  {/* Left Boot */}
                  <path d="M84 136 L92 168 L76 172 L72 144 Z" fill="#EAB308" stroke="#713F12" strokeWidth="1.4" />
                  <ellipse cx="78" cy="170" rx="9" ry="3.5" fill="#CA8A04" />
                  {/* Right Boot */}
                  <path d="M116 132 L124 164 L140 166 L130 138 Z" fill="#EAB308" stroke="#713F12" strokeWidth="1.4" />
                  <ellipse cx="134" cy="165" rx="9" ry="3.5" fill="#CA8A04" />
                </g>

                {/* Waterproof Heavy Royal-Blue Cellar Overalls */}
                <path d="M74 140 L84 94 L132 90 L128 138 L110 138 L104 112 L96 140 Z" fill="url(#st-navy-work)" stroke="#0F172A" strokeWidth="1.4" />
                {/* Heavy Brass Buckles */}
                <rect x="90" y="96" width="6" height="5" fill="#D4AF37" stroke="#1A0D06" strokeWidth="0.8" />
                <rect x="118" y="94" width="6" height="5" fill="#D4AF37" stroke="#1A0D06" strokeWidth="0.8" />

                {/* Torso & Arms Reaching to Valve */}
                <path d="M84 98 L108 68 L144 68 L152 98 Z" fill="#0284C7" stroke="#075985" strokeWidth="1.2" />
                {/* Neoprene Gauntlets Gripping Valve */}
                <path d="M136 76 L174 108 L188 138" fill="none" stroke="#1E293B" strokeWidth="11" strokeLinecap="round" />
                <circle cx="188" cy="140" r="6.5" fill="#0F172A" stroke="#334155" strokeWidth="1" />

                {/* Head with Fisherman's Dark Beanie */}
                <ellipse cx="128" cy="50" rx="14" ry="17" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />
                <path d="M113 46 C113 30 126 26 141 26 C152 26 153 35 149 46 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
                <line x1="113" y1="46" x2="149" y2="46" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
                {/* Focused Profile Expression */}
                <circle cx="136" cy="48" r="2" fill="#090D16" />
                <path d="M132 44 L142 45" stroke="#451A03" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M135 56 Q139 59 144 56" stroke="#7C2D12" strokeWidth="1.4" fill="none" />
              </g>
            )}

            {/* ============================================================== */}
            {/* 3. HOYNE DELIVERY CREW (Zone 4 - loading_dock_vp_plus_1) */}
            {/* Candid illustration of two workers loading kegs into truck */}
            {/* ============================================================== */}
            {effectKey === 'loading_dock_vp_plus_1' && (
              <g>
                {/* Twilight Sky & Warehouse Bay Doors */}
                <rect width="240" height="180" fill="#1E293B" />
                {/* Royal-Blue Hoyne Delivery Truck Rear Cargo Bay */}
                <rect x="65" y="12" width="165" height="138" rx="4" fill="#0B132B" stroke="#334155" strokeWidth="2" />
                <rect x="210" y="8" width="24" height="146" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="1.5" />
                <text x="218" y="72" fill="#FEF08A" fontSize="7.5" fontFamily="Cinzel, serif" fontWeight="black" letterSpacing="0.1em" transform="rotate(90, 218, 72)">HOYNE</text>

                {/* Weathered Heavy Timber Loading Dock Planks */}
                <polygon points="0,140 240,140 240,180 0,180" fill="#3B2314" stroke="#1A0D06" strokeWidth="1.5" />
                {[25, 75, 125, 175, 225].map((dx) => (
                  <line key={dx} x1={dx} y1="140" x2={dx - 20} y2="180" stroke="#1F1109" strokeWidth="2" />
                ))}

                {/* Secondary Crew Member Inside Cargo Bed (Staging Silver Kegs) */}
                <g>
                  {/* Inside Kegs */}
                  <ellipse cx="135" cy="80" rx="14" ry="5" fill="url(#st-tank-steel)" stroke="#090D16" />
                  <rect x="121" y="80" width="28" height="34" fill="url(#st-tank-steel)" stroke="#090D16" />
                  <ellipse cx="170" cy="80" rx="14" ry="5" fill="url(#st-tank-steel)" stroke="#090D16" />
                  <rect x="156" y="80" width="28" height="34" fill="url(#st-tank-steel)" stroke="#090D16" />
                  {/* Worker 2 */}
                  <circle cx="152" cy="52" r="9" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="0.8" />
                  <path d="M143 50 C143 40 153 36 163 36 C170 36 172 42 172 50 Z" fill="#1E3A8A" />
                  <path d="M140 64 L148 58 L168 58 L174 86 L138 86 Z" fill="#2563EB" />
                </g>

                {/* Primary Crew Worker in Foreground (Loading Aluminum Keg onto Dock) */}
                {/* Heavy Work Boots */}
                <ellipse cx="48" cy="172" rx="8" ry="3.5" fill="#0F172A" />
                <ellipse cx="78" cy="170" rx="8" ry="3.5" fill="#0F172A" />
                <path d="M46 138 L46 170 M74 136 L76 168" stroke="#334155" strokeWidth="10" strokeLinecap="round" />

                {/* Worker Body: Hoyne Safety Charcoal Jacket with High-Vis Orange Yoke */}
                <path d="M38 136 L52 88 L88 88 L84 136 Z" fill="#334155" stroke="#0F172A" strokeWidth="1.4" />
                <polygon points="52,88 88,88 84,106 50,106" fill="#EA580C" stroke="#C2410C" strokeWidth="1" />
                <rect x="52" y="104" width="34" height="6" fill="#FDE047" opacity="0.9" />

                {/* Arms Rolling Aluminum Keg with Leather Gloves */}
                <path d="M52 94 L82 118 L98 126" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
                <circle cx="98" cy="126" r="6" fill="#78350F" stroke="#451A03" strokeWidth="1" />

                {/* Head with Hoyne Ballcap */}
                <ellipse cx="68" cy="70" rx="13" ry="15" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />
                <path d="M55 68 C55 54 68 50 82 50 C92 50 96 56 96 68 Z" fill="#1E3A8A" stroke="#0F172A" strokeWidth="1.2" />
                <polygon points="76,60 102,62 96,68 74,66" fill="#1E3A8A" stroke="#0F172A" strokeWidth="1" />
                <circle cx="74" cy="68" r="1.8" fill="#090D16" />

                {/* Foreground Aluminum Half-Barrel Keg on Timber Dock */}
                <g transform="translate(102, 116)">
                  <ellipse cx="18" cy="10" rx="18" ry="7" fill="url(#st-tank-steel)" stroke="#090D16" strokeWidth="1.4" />
                  <path d="M0 10 V46 C0 54 36 54 36 46 V10" fill="url(#st-tank-steel)" stroke="#090D16" strokeWidth="1.4" />
                  {/* Rolling Chimes / Ribs */}
                  <ellipse cx="18" cy="22" rx="18" ry="4" fill="none" stroke="#0284C7" strokeWidth="3" />
                  <ellipse cx="18" cy="34" rx="18" ry="4" fill="none" stroke="#0284C7" strokeWidth="3" />
                  <ellipse cx="18" cy="46" rx="18" ry="7" fill="url(#st-tank-steel)" stroke="#090D16" strokeWidth="1.4" />
                  {/* Center Bung */}
                  <circle cx="18" cy="22" r="2.5" fill="#475569" />
                </g>
              </g>
            )}

            {/* ============================================================== */}
            {/* 4. YEAST LAB MICROBIOLOGIST (Zone 3 - yeast_propagation) */}
            {/* Scientist examining yeast cultures under brass microscope */}
            {/* ============================================================== */}
            {effectKey === 'yeast_propagation' && (
              <g>
                {/* Laboratory Background with Warm Task Lighting */}
                <rect width="240" height="180" fill="#0B132B" />
                {/* Reagent Shelves with Test Tubes & Petri Dishes */}
                <rect x="18" y="18" width="135" height="5" rx="1" fill="#475569" stroke="#1E293B" strokeWidth="0.8" />
                {[32, 46, 60, 74].map((tx) => (
                  <g key={tx}>
                    <rect x={tx} y="6" width="6" height="18" rx="2" fill="#38BDF8" fillOpacity="0.65" stroke="#0284C7" strokeWidth="0.8" />
                    <rect x={tx + 1} y="14" width="4" height="9" fill="#0D9488" />
                  </g>
                ))}
                {/* Culture Petri Dish on Shelf */}
                <ellipse cx="112" cy="18" rx="12" ry="4" fill="#FEF08A" fillOpacity="0.8" stroke="#CA8A04" strokeWidth="1" />

                {/* Polished Stainless Steel Laboratory Countertop */}
                <polygon points="0,122 240,122 240,180 0,180" fill="url(#st-tank-steel)" stroke="#334155" strokeWidth="1.5" />
                <line x1="0" y1="123" x2="240" y2="123" stroke="#FFFFFF" strokeWidth="1.8" />

                {/* Erlenmeyer Flask with Glowing Active Yeast Starter Krausen */}
                <g transform="translate(36, 92)">
                  <polygon points="12,12 22,12 36,46 0,46" fill="#FEF08A" fillOpacity="0.5" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path d="M2 44 Q18 36 34 44" fill="#F59E0B" />
                  {/* Active CO2 Bubbles & Krausen Foam */}
                  <ellipse cx="17" cy="38" rx="12" ry="4" fill="#FFFFFF" opacity="0.9" />
                  <circle cx="14" cy="42" r="1.5" fill="#FEF08A" />
                  <circle cx="20" cy="41" r="1.2" fill="#FEF08A" />
                </g>

                {/* Heavy Antique Brass & Blackened-Steel Compound Microscope */}
                <g transform="translate(100, 48)">
                  {/* Heavy Cast U-Base */}
                  <ellipse cx="20" cy="84" rx="22" ry="7" fill="#090D16" stroke="url(#eq-brass)" strokeWidth="1.5" />
                  {/* Main Limb / Curved Arm */}
                  <path d="M20 84 V50 C20 28 46 28 50 14" fill="none" stroke="#090D16" strokeWidth="7" strokeLinecap="round" />
                  {/* Mechanical Stage & Substage Condenser */}
                  <rect x="6" y="60" width="30" height="5" rx="1" fill="#090D16" stroke="url(#eq-brass)" strokeWidth="1" />
                  {/* Dual Revolving Brass Objectives */}
                  <rect x="14" y="44" width="14" height="16" fill="url(#eq-brass)" stroke="#090D16" strokeWidth="1" />
                  {/* Angled Dual Binocular Eyepieces */}
                  <path d="M44 16 L62 0" stroke="url(#eq-brass)" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="34" cy="66" r="4.5" fill="#D4AF37" stroke="#1A0D06" strokeWidth="1" />
                </g>

                {/* Microbiologist (White Lab Coat, Safety Spectacles, Leaning Forward) */}
                {/* Torso in Crisp White Lab Coat with Collar & Pocket */}
                <path d="M174 90 L150 114 L168 180 L228 180 L218 110 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.4" />
                <polygon points="176,112 184,136 198,112" fill="#0D9488" stroke="#047857" strokeWidth="0.8" />
                <line x1="184" y1="136" x2="184" y2="180" stroke="#CBD5E1" strokeWidth="1.2" />

                {/* Arm Fine-Tuning the Knurled Brass Micrometer Knob */}
                <path d="M184 100 L154 118 L134 114" fill="none" stroke="#F8FAFC" strokeWidth="10" strokeLinecap="round" />
                <circle cx="134" cy="114" r="5.5" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />

                {/* Head Leaning Forward into Eyepiece */}
                <ellipse cx="166" cy="50" rx="15" ry="17" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />
                {/* Dark Hair in Tidy Professional Lab Bun */}
                <path d="M162 38 C158 32 170 28 180 34 C188 40 186 50 180 56 Z" fill="#451A03" stroke="#270F02" strokeWidth="1" />
                <circle cx="188" cy="36" r="7" fill="#451A03" stroke="#270F02" strokeWidth="1" />

                {/* Protective Lab Safety Glasses & Focused Gaze */}
                <rect x="150" y="44" width="13" height="8" rx="2.5" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
                <circle cx="156" cy="48" r="2" fill="#090D16" />
                <path d="M152 42 L162 43" stroke="#270F02" strokeWidth="1.4" strokeLinecap="round" />
              </g>
            )}

            {/* ============================================================== */}
            {/* 5. WAREHOUSE FORKLIFT ACE (Zone 1 - free_skip_conveyor) */}
            {/* Driver in safety vest maneuvering forklift with pallet of grain */}
            {/* ============================================================== */}
            {effectKey === 'free_skip_conveyor' && (
              <g>
                {/* Warehouse High-Bay Pallet Racking Background */}
                <rect width="240" height="180" fill="#0F172A" />
                {/* Orange Steel Uprights */}
                <line x1="20" y1="0" x2="20" y2="148" stroke="#EA580C" strokeWidth="4.5" />
                <line x1="220" y1="0" x2="220" y2="148" stroke="#EA580C" strokeWidth="4.5" />
                <line x1="20" y1="36" x2="220" y2="36" stroke="#EA580C" strokeWidth="3" />
                <line x1="20" y1="84" x2="220" y2="84" stroke="#EA580C" strokeWidth="3" />
                {/* Concrete Floor with Tire Marks */}
                <polygon points="0,144 240,144 240,180 0,180" fill="#334155" />
                <line x1="0" y1="144" x2="240" y2="144" stroke="#475569" strokeWidth="1.5" />

                {/* Heavy Industrial Yellow Forklift */}
                <rect x="118" y="92" width="72" height="54" rx="6" fill="#EAB308" stroke="#713F12" strokeWidth="1.8" />
                {/* Heavy Lug Tires */}
                <circle cx="134" cy="154" r="15" fill="#090D16" stroke="#475569" strokeWidth="2.5" />
                <circle cx="134" cy="154" r="6" fill="#64748B" />
                <circle cx="184" cy="154" r="13" fill="#090D16" stroke="#475569" strokeWidth="2.5" />
                <circle cx="184" cy="154" r="5" fill="#64748B" />

                {/* Protective Steel Overhead Roll Cage */}
                <path d="M130 92 L138 42 H178 L186 92" fill="none" stroke="#1E293B" strokeWidth="4.5" strokeLinejoin="round" />
                <line x1="138" y1="42" x2="178" y2="42" stroke="#EAB308" strokeWidth="3" />

                {/* Driver in Safety Vest Looking Back */}
                <ellipse cx="160" cy="58" rx="11" ry="13" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />
                <path d="M148 54 C148 44 158 40 169 40 C176 40 178 46 178 54 Z" fill="#1E3A8A" />
                <circle cx="157" cy="56" r="1.6" fill="#090D16" />
                {/* High-Vis Orange Safety Vest with Silver Reflective Stripe */}
                <rect x="148" y="70" width="24" height="28" rx="3" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
                <line x1="148" y1="80" x2="172" y2="80" stroke="#FFFFFF" strokeWidth="2.5" />

                {/* Hydraulic Mast & Raised Pallet of Canadian Malt Sacks */}
                <line x1="110" y1="30" x2="110" y2="150" stroke="#475569" strokeWidth="6" />
                <line x1="106" y1="30" x2="106" y2="150" stroke="#64748B" strokeWidth="3.5" />
                {/* Forks */}
                <path d="M110 102 H44 V98" stroke="#090D16" strokeWidth="4" strokeLinecap="square" />

                {/* Wooden Pallet with Stacked 2-Row Malt Sacks */}
                <rect x="42" y="96" width="66" height="8" fill="#854D0E" stroke="#451A03" strokeWidth="1" />
                <rect x="46" y="78" width="28" height="18" rx="3" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
                <rect x="76" y="78" width="28" height="18" rx="3" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
                <rect x="60" y="62" width="30" height="16" rx="3" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
                <text x="64" y="73" fill="#78350F" fontSize="5" fontFamily="monospace" fontWeight="bold">MALT</text>
              </g>
            )}

            {/* ============================================================== */}
            {/* 6. GRAIN ROOM SHIFT SUPERVISOR (Zone 1 - shift_supervisor) */}
            {/* Veteran maltster with clipboard, cupping barley grain */}
            {/* ============================================================== */}
            {(effectKey === 'shift_supervisor' || effectKey === 'hand_limit_plus_3' || effectKey === 'hand_limit_plus_2') && (
              <g>
                {/* Grain Room Warehouse with Timber Posts & Ambient Sunbeam */}
                <rect width="240" height="180" fill="#241408" />
                <polygon points="170,0 215,0 150,180 105,180" fill="#FEF3C7" fillOpacity="0.12" />
                <ellipse cx="205" cy="45" rx="35" ry="75" fill="#78350F" opacity="0.45" />

                {/* Supervisor Body: Red-and-Black Plaid Flannel & Suspenders */}
                <path d="M58 180 L76 112 L132 112 L146 180 Z" fill="#991B1B" stroke="#450A0A" strokeWidth="1.5" />
                {/* Plaid Cross-Hatch Pattern */}
                <line x1="76" y1="135" x2="138" y2="135" stroke="#1C1917" strokeWidth="2" strokeOpacity="0.6" />
                <line x1="70" y1="155" x2="142" y2="155" stroke="#1C1917" strokeWidth="2" strokeOpacity="0.6" />
                <line x1="95" y1="112" x2="95" y2="180" stroke="#1C1917" strokeWidth="2" strokeOpacity="0.6" />
                <line x1="115" y1="112" x2="115" y2="180" stroke="#1C1917" strokeWidth="2" strokeOpacity="0.6" />
                {/* Leather Suspenders with Brass Buckles */}
                <line x1="86" y1="112" x2="90" y2="180" stroke="#451A03" strokeWidth="3.5" />
                <line x1="122" y1="112" x2="118" y2="180" stroke="#451A03" strokeWidth="3.5" />
                <rect x="84" y="130" width="5" height="4" fill="#D4AF37" />
                <rect x="120" y="130" width="5" height="4" fill="#D4AF37" />

                {/* Weathered Friendly Head with Mustache & Pencil Behind Ear */}
                <ellipse cx="104" cy="72" rx="17" ry="19" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />
                <path d="M87 66 C87 46 102 42 120 44 C126 46 126 55 122 66 Z" fill="#451A03" stroke="#270F02" strokeWidth="1" />
                {/* Yellow Pencil Tucked Behind Right Ear */}
                <line x1="120" y1="60" x2="130" y2="52" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="130" cy="52" r="1" fill="#DC2626" />
                {/* Walrus Mustache & Smile */}
                <path d="M94 80 Q104 86 114 80 Q104 76 94 80 Z" fill="#78350F" stroke="#451A03" strokeWidth="1" />
                <circle cx="98" cy="68" r="1.8" fill="#090D16" />
                <circle cx="110" cy="68" r="1.8" fill="#090D16" />

                {/* Left Arm Holding Wooden Inspection Clipboard */}
                <path d="M76 118 L50 140 L64 160" fill="none" stroke="#991B1B" strokeWidth="11" strokeLinecap="round" />
                <rect x="34" y="126" width="30" height="42" rx="2" fill="#78350F" stroke="#3E2718" strokeWidth="1.4" transform="rotate(-12, 34, 126)" />
                <rect x="38" y="130" width="22" height="32" fill="#FFFBEB" transform="rotate(-12, 38, 130)" />
                <rect x="45" y="125" width="10" height="4" fill="#D4AF37" transform="rotate(-12, 45, 125)" />

                {/* Right Arm Presenting Cupped Hand of Golden Barley Grains */}
                <path d="M128 118 L156 132 L176 122" fill="none" stroke="#991B1B" strokeWidth="11" strokeLinecap="round" />
                {/* Brass Sample Bowl */}
                <ellipse cx="182" cy="128" rx="18" ry="7" fill="url(#eq-brass)" stroke="#78350F" strokeWidth="1.2" />
                <ellipse cx="182" cy="126" rx="15" ry="5" fill="#FDE68A" />
                {/* Cupped Hand Inspecting Grain */}
                <circle cx="172" cy="116" r="6.5" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="0.8" />
                {[166, 172, 178].map((bx) => (
                  <ellipse key={bx} cx={bx} cy={110} rx="2.5" ry="4" fill="#F59E0B" stroke="#92400E" strokeWidth="0.6" />
                ))}
              </g>
            )}

            {/* ============================================================== */}
            {/* 7. ASSISTANT BREWER (Zone 2 - source_on_brew) */}
            {/* Mash floor operator stirring steaming copper mash with paddle */}
            {/* ============================================================== */}
            {(effectKey === 'source_on_brew' ||
              effectKey === 'extra_source_draw' ||
              effectKey === 'kettle_discount_malt' ||
              effectKey === 'kettle_discount_hops' ||
              effectKey === 'kettle_double_batch') && (
              <g>
                {/* Brewhouse Mash Floor Background */}
                <rect width="240" height="180" fill="url(#st-copper-wall)" />

                {/* Massive Open Copper Mash Tun in Foreground */}
                <ellipse cx="140" cy="130" rx="76" ry="26" fill="url(#eq-copper)" stroke="#3E1705" strokeWidth="2.2" />
                {/* Steaming Golden Mash Wort Surface with Ripples */}
                <ellipse cx="140" cy="128" rx="70" ry="22" fill="#D97706" />
                <ellipse cx="140" cy="127" rx="60" ry="17" fill="#F59E0B" />
                <path d="M106 126 Q140 136 174 126" stroke="#FEF08A" strokeWidth="2.2" fill="none" opacity="0.75" />

                {/* Billowing Translucent Steam Clouds Rising */}
                <path d="M118 108 Q105 75 128 45 Q150 15 138 -5" stroke="#FFFFFF" strokeWidth="10" fill="none" opacity="0.35" strokeLinecap="round" />
                <path d="M152 112 Q168 80 150 55 Q132 30 156 5" stroke="#FFFFFF" strokeWidth="12" fill="none" opacity="0.28" strokeLinecap="round" />

                {/* Brewer Figure on Catwalk with Heavy Apron */}
                <line x1="16" y1="122" x2="84" y2="122" stroke="#64748B" strokeWidth="3" />
                <path d="M44 172 L56 100 L94 100 L100 172 Z" fill="#78350F" stroke="#3E1A05" strokeWidth="1.2" />
                {/* Heavy Black Rubber Apron */}
                <polygon points="54,102 96,102 90,158 60,158" fill="#1C1917" stroke="#090D16" strokeWidth="1" />

                {/* Head with Red Bandana */}
                <ellipse cx="76" cy="72" rx="15" ry="17" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />
                <path d="M63 66 C63 50 74 46 89 46 C95 46 95 54 93 66 Z" fill="#1E293B" />
                <line x1="62" y1="68" x2="92" y2="68" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="82" cy="70" r="1.8" fill="#090D16" />

                {/* Traditional Handcrafted Wooden Mash Paddle */}
                <line x1="66" y1="50" x2="152" y2="146" stroke="#854D0E" strokeWidth="5" strokeLinecap="round" />
                {/* Paddle Perforated Blade with Holes */}
                <g transform="translate(140, 132) rotate(45)">
                  <rect x="-8" y="-12" width="16" height="26" rx="2.5" fill="#A16207" stroke="#451A03" strokeWidth="1.2" />
                  <circle cx="0" cy="-4" r="2" fill="#D97706" />
                  <circle cx="0" cy="4" r="2" fill="#D97706" />
                </g>

                {/* Arms Plunging and Stirring */}
                <path d="M62 102 L80 90 L96 86" fill="none" stroke="#78350F" strokeWidth="9" strokeLinecap="round" />
                <circle cx="86" cy="76" r="5.5" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="0.8" />
                <circle cx="108" cy="98" r="5.5" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="0.8" />
              </g>
            )}

            {/* ============================================================== */}
            {/* 8. SEASONAL ADJUNCT SPECIALIST (Zone 4 - adjunct_specialist) */}
            {/* Forager with apron, basket of wet hops & raspberries */}
            {/* ============================================================== */}
            {(effectKey === 'adjunct_specialist' || effectKey === 'taco_bar_tasting_room') && (
              <g>
                {/* Botanical Blending Room with Charred Oak Barrels */}
                <rect width="240" height="180" fill="#1A1008" />
                {/* Oak Aging Cask (Right) */}
                <ellipse cx="204" cy="48" rx="32" ry="44" fill="#5C2E0B" stroke="#2C1404" strokeWidth="1.8" />
                <line x1="174" y1="36" x2="234" y2="36" stroke="#1C0F05" strokeWidth="3" />
                <line x1="174" y1="60" x2="234" y2="60" stroke="#1C0F05" strokeWidth="3" />
                {/* Timber Prep Counter */}
                <polygon points="0,134 240,134 240,180 0,180" fill="#382012" stroke="#1A0D06" strokeWidth="1.5" />

                {/* Whole Star Anise Pods & Ceylon Cinnamon on Bench */}
                <circle cx="34" cy="152" r="6" fill="#78350F" stroke="#451A03" strokeWidth="1" />
                <line x1="46" y1="148" x2="66" y2="158" stroke="#9A3412" strokeWidth="3.5" strokeLinecap="round" />

                {/* Forager Figure in Forest-Green Canvas Apron */}
                <path d="M72 180 L86 110 L140 110 L152 180 Z" fill="#065F46" stroke="#022C22" strokeWidth="1.4" />
                <polygon points="84,112 142,112 136,170 90,170" fill="#D97706" opacity="0.75" />

                {/* Head with Appreciative Expression */}
                <ellipse cx="114" cy="70" rx="16" ry="18" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="1" />
                <path d="M99 62 C97 46 111 38 127 40 C135 42 135 50 131 62 Z" fill="#451A03" stroke="#270F02" strokeWidth="1" />
                <circle cx="108" cy="68" r="1.8" fill="#090D16" />
                <circle cx="120" cy="68" r="1.8" fill="#090D16" />
                <path d="M110 78 Q116 83 122 78" stroke="#7C2D12" strokeWidth="1.6" fill="none" strokeLinecap="round" />

                {/* Rustic Handcrafted Willow Basket of Wet Hops & Raspberries */}
                <ellipse cx="114" cy="132" rx="38" ry="18" fill="#854D0E" stroke="#451A03" strokeWidth="1.8" />
                <ellipse cx="114" cy="130" rx="34" ry="14" fill="#58310C" />

                {/* Plump Dewy Whole Green Wet Hops (Sartori harvest) */}
                {[92, 102, 114, 126, 136].map((hx, i) => (
                  <ellipse key={hx} cx={hx} cy={124 + (i % 2) * 5} rx="6.5" ry="9" fill="#65A30D" stroke="#365314" strokeWidth="1" />
                ))}
                {/* Ripe Saanich Raspberries */}
                {[98, 108, 120, 130].map((rx, i) => (
                  <circle key={rx} cx={rx} cy={132 - (i % 2) * 4} r="5.5" fill="#BE123C" stroke="#881337" strokeWidth="1" />
                ))}

                {/* Supporting Hands on Basket Rim */}
                <ellipse cx="78" cy="130" rx="7" ry="5.5" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="0.8" />
                <ellipse cx="150" cy="130" rx="7" ry="5.5" fill="url(#st-skin)" stroke="#9A4C22" strokeWidth="0.8" />
              </g>
            )}

            {/* Warm Sunlight & Ambient Brewhouse Shading Overlay */}
            <rect width="240" height="180" fill="url(#st-amber-glow)" pointerEvents="none" />
          </svg>
        </div>
      </div>

      {/* Polaroid Bottom Margin with Typewriter/Handwritten Caption */}
      {!compact && (
        <div className="w-full px-2 py-0.5 text-center shrink-0 bg-[#FAF7F0] border-t border-[#E8DFCE]">
          <span
            className="block font-mono text-[8px] font-bold text-stone-800 tracking-tight truncate"
          >
            {info.caption}
          </span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DECK 5: FULL-BLEED ENVIRONMENTAL BREWERY SCENES (PHYSICAL VERTICAL PLAYMATS)
// Heavy Punch-Board Frame + Full-Bleed Hand-Illustrated Brewery Scenes (No Clip-Art)
// ============================================================================

export const FullBleedBrewerySceneSVG: React.FC<{
  zoneId: ZoneId;
}> = ({ zoneId }) => {
  return (
    <div
      data-zone-scene={`zone-${zoneId}`}
      className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
    >
      <svg
        viewBox="0 0 520 300"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* ================================================================ */}
          {/* ZONE 1 GRADIENTS: Rustic Grain Room */}
          {/* ================================================================ */}
          <linearGradient id="z1-wall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B1007" />
            <stop offset="50%" stopColor="#2E1B0F" />
            <stop offset="100%" stopColor="#150C05" />
          </linearGradient>
          <linearGradient id="z1-sunlight" x1="0%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#F59E0B" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="z1-jute" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#D97706" />
            <stop offset="80%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="z1-mill-wood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#451A03" />
            <stop offset="50%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#3E1705" />
          </linearGradient>

          {/* ================================================================ */}
          {/* ZONE 2 GRADIENTS: Polished Copper Brewhouse Kettles */}
          {/* ================================================================ */}
          <linearGradient id="z2-brick" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1C0D05" />
            <stop offset="60%" stopColor="#351608" />
            <stop offset="100%" stopColor="#180903" />
          </linearGradient>
          <linearGradient id="z2-kettle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="18%" stopColor="#FDE047" />
            <stop offset="45%" stopColor="#EA580C" />
            <stop offset="75%" stopColor="#C87D32" />
            <stop offset="100%" stopColor="#4A1804" />
          </linearGradient>
          <linearGradient id="z2-steam" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#FEF3C7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* ================================================================ */}
          {/* ZONE 3 GRADIENTS: Cool Industrial Cellar & Glass Carboy */}
          {/* ================================================================ */}
          <linearGradient id="z3-wall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A0F1A" />
            <stop offset="50%" stopColor="#121D2F" />
            <stop offset="100%" stopColor="#090E18" />
          </linearGradient>
          <linearGradient id="z3-steel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#E2E8F0" />
            <stop offset="60%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="z3-wort" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="85%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
          <linearGradient id="z3-glycol" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* ================================================================ */}
          {/* ZONE 4 GRADIENTS: Bustling Loading Dock & Taproom */}
          {/* ================================================================ */}
          <linearGradient id="z4-sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0A101C" />
            <stop offset="50%" stopColor="#1A2538" />
            <stop offset="100%" stopColor="#2D3B4F" />
          </linearGradient>
          <linearGradient id="z4-barrel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#451A03" />
            <stop offset="45%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#2E1002" />
          </linearGradient>
          <linearGradient id="z4-keg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="70%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        {/* ================================================================ */}
        {/* ZONE 1: COZY, RUSTIC GRAIN ROOM */}
        {/* Jute sacks of malted barley, vintage wooden mill, warm ambient sunlight */}
        {/* ================================================================ */}
        {zoneId === 1 && (
          <g>
            {/* Dark Oak Timber Wall Background */}
            <rect width="520" height="300" fill="url(#z1-wall)" />
            {/* Vertical Wood Plank Seams */}
            {[38, 82, 126, 170, 214, 258, 302, 346, 390, 434, 478].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="255" stroke="#0E0803" strokeWidth="1.6" opacity="0.65" />
            ))}

            {/* High Warehouse Window (Upper Left) */}
            <polygon points="12,0 78,0 88,58 2,58" fill="#0C1420" stroke="#78350F" strokeWidth="2" />
            <polygon points="12,0 78,0 88,58 2,58" fill="#FEF9C3" fillOpacity="0.65" />
            <line x1="45" y1="0" x2="45" y2="58" stroke="#451A03" strokeWidth="2" />
            <line x1="7" y1="29" x2="83" y2="29" stroke="#451A03" strokeWidth="2" />

            {/* Diagonal Warm Ambient Sunbeam */}
            <polygon points="12,0 88,0 380,300 130,300" fill="url(#z1-sunlight)" />

            {/* Bulk Silo Grain Auger Chute (Upper Right) */}
            <rect x="395" y="0" width="46" height="210" fill="#2E1C11" stroke="#140B05" strokeWidth="2" />
            <path d="M441 35 L505 115 V215 H441 Z" fill="#21140B" stroke="#140B05" strokeWidth="2" />
            <ellipse cx="418" cy="70" rx="12" ry="5" fill="#D4AF37" stroke="#78350F" strokeWidth="1" />

            {/* Stacks of Jute Sacks of Malted Barley (Left & Center) */}
            <g>
              {/* Pallet Base */}
              <rect x="22" y="240" width="136" height="12" fill="#78350F" stroke="#2B1507" strokeWidth="1.5" />
              <rect x="36" y="252" width="14" height="10" fill="#451A03" />
              <rect x="84" y="252" width="14" height="10" fill="#451A03" />
              <rect x="132" y="252" width="14" height="10" fill="#451A03" />

              {/* Bottom Layer Sacks */}
              <rect x="18" y="198" width="62" height="44" rx="10" fill="url(#z1-jute)" stroke="#451A03" strokeWidth="1.5" />
              <rect x="76" y="198" width="62" height="44" rx="10" fill="url(#z1-jute)" stroke="#451A03" strokeWidth="1.5" />
              {/* Middle Layer */}
              <rect x="26" y="160" width="60" height="42" rx="10" fill="url(#z1-jute)" stroke="#451A03" strokeWidth="1.5" />
              <rect x="82" y="160" width="60" height="42" rx="10" fill="url(#z1-jute)" stroke="#451A03" strokeWidth="1.5" />
              {/* Top Layer */}
              <rect x="42" y="122" width="68" height="40" rx="10" fill="url(#z1-jute)" stroke="#451A03" strokeWidth="1.5" />

              {/* Stencils & Twine */}
              <text x="54" y="145" fill="#451A03" fontSize="6.5" fontFamily="Cinzel, serif" fontWeight="bold" letterSpacing="0.1em">HOYNE</text>
              <text x="56" y="153" fill="#78350F" fontSize="4.5" fontFamily="Cinzel, serif">2-ROW MALT</text>
              <ellipse cx="46" cy="142" rx="3" ry="14" fill="none" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="3 1" />
              <ellipse cx="106" cy="142" rx="3" ry="14" fill="none" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="3 1" />
            </g>

            {/* Vintage Wooden Malt Mill (Right) */}
            <g>
              <rect x="255" y="168" width="100" height="88" rx="4" fill="url(#z1-mill-wood)" stroke="#1A0A02" strokeWidth="2" />
              <polygon points="264,168 346,168 332,118 278,118" fill="url(#eq-brass)" stroke="#451A03" strokeWidth="2" />
              <ellipse cx="305" cy="118" rx="27" ry="6" fill="#FDE047" stroke="#78350F" />
              <circle cx="365" cy="195" r="22" fill="none" stroke="#1E293B" strokeWidth="3" />
              <circle cx="365" cy="195" r="6" fill="#D4AF37" stroke="#1E293B" strokeWidth="1.5" />
              <line x1="365" y1="173" x2="365" y2="217" stroke="#1E293B" strokeWidth="2.5" />
              <line x1="343" y1="195" x2="387" y2="195" stroke="#1E293B" strokeWidth="2.5" />
              <circle cx="380" cy="182" r="3.5" fill="#B45309" stroke="#1A0A02" />
            </g>

            {/* Floor with Spilled Golden Barley Grains */}
            <polygon points="0,255 520,255 520,300 0,300" fill="#180F07" />
            <line x1="0" y1="255" x2="520" y2="255" stroke="#451A03" strokeWidth="2" />
            {[45, 70, 95, 120, 150, 180, 215, 250, 280, 315, 365, 425, 475].map((x, i) => (
              <ellipse
                key={x}
                cx={x}
                cy={264 + (i % 3) * 8}
                rx="3.5"
                ry="1.8"
                fill="#FBBF24"
                stroke="#92400E"
                strokeWidth="0.5"
                transform={`rotate(${(i * 35) % 90}, ${x}, ${264 + (i % 3) * 8})`}
              />
            ))}
          </g>
        )}

        {/* ================================================================ */}
        {/* ZONE 2: GLOWING, POLISHED COPPER BREWHOUSE KETTLES */}
        {/* Rising steam, hammered copper kettle, brass pressure gauges */}
        {/* ================================================================ */}
        {zoneId === 2 && (
          <g>
            <rect width="520" height="300" fill="url(#z2-brick)" />
            {/* Arched Vault Brick Curves */}
            <path d="M40 0 C40 120 180 120 180 0" stroke="#5E260E" strokeWidth="3" fill="none" opacity="0.6" />
            <path d="M220 0 C220 120 360 120 360 0" stroke="#5E260E" strokeWidth="3" fill="none" opacity="0.6" />
            <path d="M380 0 C380 120 500 120 500 0" stroke="#5E260E" strokeWidth="3" fill="none" opacity="0.6" />

            {/* Amber Heating Element Glow */}
            <ellipse cx="260" cy="265" rx="180" ry="25" fill="#EA580C" fillOpacity="0.28" />
            <ellipse cx="140" cy="265" rx="90" ry="20" fill="#F59E0B" fillOpacity="0.32" />

            {/* Main Boil Kettle (Center-Left) */}
            <g>
              <ellipse cx="140" cy="95" rx="85" ry="32" fill="url(#z2-kettle)" stroke="#2B0E03" strokeWidth="2.5" />
              <path d="M55 95 V225 C55 260 225 260 225 225 V95" fill="url(#z2-kettle)" stroke="#2B0E03" strokeWidth="2.5" />
              {/* Specular Highlights */}
              <path d="M75 105 V215" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
              <path d="M85 102 V218" stroke="#FEF08A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

              {/* Riveted Brass Girth Band */}
              <ellipse cx="140" cy="165" rx="84" ry="14" fill="none" stroke="#D4AF37" strokeWidth="4" />
              {[62, 85, 110, 140, 170, 195, 218].map((rx) => (
                <circle
                  key={rx}
                  cx={rx}
                  cy={165 + Math.sin(((rx - 55) / 170) * Math.PI) * 4}
                  r="2"
                  fill="#FDE047"
                  stroke="#2B0E03"
                  strokeWidth="0.8"
                />
              ))}

              {/* Steam Stack Chimney */}
              <path d="M125 70 V15 H155 V70" fill="url(#z2-kettle)" stroke="#2B0E03" strokeWidth="2" />
              <ellipse cx="140" cy="15" rx="15" ry="5" fill="#D4AF37" stroke="#2B0E03" strokeWidth="1.5" />

              {/* Brass Pressure Gauge with Pointer */}
              <circle cx="215" cy="120" r="14" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="2.5" />
              <circle cx="215" cy="120" r="11" fill="none" stroke="#78350F" strokeWidth="0.8" strokeDasharray="2 1" />
              <line x1="215" y1="120" x2="222" y2="114" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
              <circle cx="215" cy="120" r="2.5" fill="#2B0E03" />

              {/* Sight Glass Tube with Boiling Golden Wort */}
              <rect x="210" y="145" width="8" height="52" rx="4" fill="#FEF08A" fillOpacity="0.75" stroke="#D4AF37" strokeWidth="1.5" />
              <circle cx="214" cy="160" r="1.5" fill="#FFFFFF" />
              <circle cx="214" cy="175" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Secondary Mash Tun (Right) */}
            <g>
              <ellipse cx="390" cy="115" rx="75" ry="28" fill="url(#z2-kettle)" stroke="#2B0E03" strokeWidth="2" />
              <path d="M315 115 V230 C315 258 465 258 465 230 V115" fill="url(#z2-kettle)" stroke="#2B0E03" strokeWidth="2" />
              <rect x="375" y="75" width="30" height="25" rx="3" fill="#D4AF37" stroke="#2B0E03" strokeWidth="1.5" />
              <line x1="390" y1="100" x2="390" y2="150" stroke="#2B0E03" strokeWidth="3" />
            </g>

            {/* Translucent Brewhouse Steam Swirls */}
            <path d="M140 60 Q105 25 130 5 Q160 0 140 0" stroke="url(#z2-steam)" strokeWidth="24" fill="none" strokeLinecap="round" />
            <path d="M150 70 Q185 35 160 10" stroke="url(#z2-steam)" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M390 85 Q420 40 380 15" stroke="url(#z2-steam)" strokeWidth="20" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* ================================================================ */}
        {/* ZONE 3: COOL INDUSTRIAL FERMENTATION CELLAR */}
        {/* Stainless steel conical tanks, active bubbling glass carboys, glycol lines */}
        {/* ================================================================ */}
        {zoneId === 3 && (
          <g>
            <rect width="520" height="300" fill="url(#z3-wall)" />
            {/* Cellar Ceiling Vault Arches */}
            <path d="M0 80 Q130 30 260 80 Q390 30 520 80" stroke="#1E293B" strokeWidth="4" fill="none" opacity="0.6" />

            {/* Overhead Glycol Pipe Manifold */}
            <rect x="0" y="24" width="520" height="12" fill="url(#z3-glycol)" stroke="#0C4A6E" strokeWidth="1.5" />
            <ellipse cx="130" cy="30" rx="6" ry="8" fill="#D4AF37" />
            <ellipse cx="380" cy="30" rx="6" ry="8" fill="#D4AF37" />

            {/* Left Stainless Conical Fermenter */}
            <g>
              <ellipse cx="95" cy="65" rx="55" ry="18" fill="url(#z3-steel)" stroke="#0F172A" strokeWidth="2" />
              <path d="M40 65 V175 L95 240 L150 175 V65" fill="url(#z3-steel)" stroke="#0F172A" strokeWidth="2" />
              <rect x="44" y="95" width="102" height="60" fill="url(#z3-glycol)" fillOpacity="0.75" stroke="#0284C7" strokeWidth="1.5" />
              <text x="56" y="130" fill="#E0F2FE" fontSize="6.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold">GLYCOL -2°C</text>
              <rect x="90" y="240" width="10" height="14" fill="#D4AF37" stroke="#0F172A" />
              <line x1="84" y1="247" x2="106" y2="247" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Giant 5-Gallon Glass Carboy (Center) */}
            <g>
              <polygon points="215,268 305,268 315,280 205,280" fill="#451A03" stroke="#1A0A02" strokeWidth="1.5" />
              <ellipse cx="260" cy="180" rx="42" ry="46" fill="#F59E0B" fillOpacity="0.25" />

              {/* Carboy Body */}
              <path
                d="M250 82 H270 V105 C270 115 305 130 305 180 C305 235 215 235 215 180 C215 130 250 115 250 105 Z"
                fill="url(#z3-wort)"
                stroke="#CBD5E1"
                strokeWidth="2.5"
              />
              <path d="M225 150 C220 180 230 215 250 225" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.65" />

              {/* Krausen Foam Head */}
              <ellipse cx="260" cy="148" rx="38" ry="10" fill="#FFFDF5" stroke="#FEF08A" strokeWidth="1.5" />
              <ellipse cx="250" cy="144" rx="12" ry="5" fill="#FFFFFF" />
              <ellipse cx="272" cy="145" rx="14" ry="6" fill="#FFFFFF" />

              {/* Rising CO2 Bubbles */}
              {[238, 246, 255, 263, 274, 282].map((bx, i) => (
                <circle key={bx} cx={bx} cy={165 + ((i * 11) % 50)} r={1.5 + (i % 2)} fill="#FFFBEB" opacity="0.8" />
              ))}

              {/* Fermentation Airlock */}
              <rect x="254" y="60" width="12" height="22" rx="2" fill="#E2E8F0" fillOpacity="0.8" stroke="#64748B" strokeWidth="1.2" />
              <circle cx="260" cy="68" r="4" fill="#38BDF8" fillOpacity="0.6" />
            </g>

            {/* Right Stainless Conical Fermenter */}
            <g>
              <ellipse cx="425" cy="65" rx="55" ry="18" fill="url(#z3-steel)" stroke="#0F172A" strokeWidth="2" />
              <path d="M370 65 V175 L425 240 L480 175 V65" fill="url(#z3-steel)" stroke="#0F172A" strokeWidth="2" />
              <rect x="374" y="95" width="102" height="60" fill="url(#z3-glycol)" fillOpacity="0.75" stroke="#0284C7" strokeWidth="1.5" />
            </g>

            {/* Cellar Floor with Trench Drain */}
            <polygon points="0,270 520,270 520,300 0,300" fill="#0F172A" />
            <rect x="180" y="278" width="160" height="6" fill="#1E293B" stroke="#475569" strokeWidth="1" />
          </g>
        )}

        {/* ================================================================ */}
        {/* ZONE 4: BUSTLING LOADING DOCK & TAPROOM */}
        {/* Stacked wooden kegs, Hoyne delivery truck, neon taproom lighting */}
        {/* ================================================================ */}
        {zoneId === 4 && (
          <g>
            <rect width="520" height="300" fill="url(#z4-sky)" />
            {/* Roll-up Dock Door Frame */}
            <rect x="140" y="10" width="240" height="230" fill="#020617" stroke="#475569" strokeWidth="3" />
            <line x1="140" y1="35" x2="380" y2="35" stroke="#64748B" strokeWidth="2" />
            <line x1="140" y1="55" x2="380" y2="55" stroke="#64748B" strokeWidth="2" />

            {/* Royal Blue Hoyne Delivery Truck */}
            <rect x="195" y="65" width="130" height="150" rx="4" fill="#1D4ED8" stroke="#0F172A" strokeWidth="2.5" />
            <rect x="205" y="80" width="110" height="120" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />
            {[95, 110, 125, 140, 155, 170, 185].map((y) => (
              <line key={y} x1="205" y1={y} x2="315" y2={y} stroke="#64748B" strokeWidth="1.5" />
            ))}
            <text x="225" y="105" fill="#1E3A8A" fontSize="12" fontFamily="Cinzel, serif" fontWeight="bold" letterSpacing="0.12em">
              HOYNE
            </text>

            {/* Neon Taproom Sign & Festoon Lighting */}
            <g>
              <text
                x="20"
                y="42"
                fill="#F43F5E"
                fontSize="18"
                fontFamily="Playfair Display, serif"
                fontWeight="bold"
                fontStyle="italic"
                filter="drop-shadow(0 0 6px #F43F5E)"
              >
                TAPROOM
              </text>
              <text x="20" y="42" fill="#FFE4E6" fontSize="18" fontFamily="Playfair Display, serif" fontWeight="bold" fontStyle="italic">
                TAPROOM
              </text>
              <path d="M0 55 Q70 70 140 55" stroke="#78350F" strokeWidth="1.2" fill="none" />
              {[20, 50, 80, 110].map((lx) => (
                <g key={lx}>
                  <circle cx={lx} cy={60} r="4" fill="#FEF08A" filter="drop-shadow(0 0 4px #F59E0B)" />
                  <circle cx={lx} cy={60} r="2" fill="#FFFFFF" />
                </g>
              ))}
            </g>

            {/* Dock Timber Floor with Steel Angle */}
            <polygon points="0,235 520,235 520,300 0,300" fill="#382013" />
            <line x1="0" y1="235" x2="520" y2="235" stroke="#64748B" strokeWidth="4" />
            {[50, 120, 200, 290, 380, 460].map((dx) => (
              <line key={dx} x1={dx} y1="235" x2={dx - 20} y2="300" stroke="#22130A" strokeWidth="2.5" />
            ))}

            {/* Stacked Wooden Oak Barrels (Left) */}
            <g>
              <ellipse cx="65" cy="180" rx="34" ry="12" fill="url(#z4-barrel)" stroke="#1A0A02" strokeWidth="1.5" />
              <path d="M31 180 V240 C31 254 99 254 99 240 V180" fill="url(#z4-barrel)" stroke="#1A0A02" strokeWidth="1.5" />
              <ellipse cx="65" cy="195" rx="33" ry="8" fill="none" stroke="#0F172A" strokeWidth="3" />
              <ellipse cx="65" cy="225" rx="33" ry="8" fill="none" stroke="#0F172A" strokeWidth="3" />
              <circle cx="65" cy="210" r="3" fill="#D4AF37" stroke="#1A0A02" />
            </g>

            {/* Aluminum Hoyne Kegs (Right) */}
            <g>
              <ellipse cx="445" cy="185" rx="28" ry="10" fill="url(#z4-keg)" stroke="#0F172A" strokeWidth="1.5" />
              <path d="M417 185 V250 C417 262 473 262 473 250 V185" fill="url(#z4-keg)" stroke="#0F172A" strokeWidth="1.5" />
              <ellipse cx="445" cy="202" rx="28" ry="6" fill="none" stroke="#1D4ED8" strokeWidth="3.5" />
              <ellipse cx="445" cy="235" rx="28" ry="6" fill="none" stroke="#1D4ED8" strokeWidth="3.5" />
              <ellipse cx="445" cy="250" rx="28" ry="10" fill="url(#z4-keg)" stroke="#0F172A" strokeWidth="1.5" />
            </g>
          </g>
        )}
      </svg>

      {/* Atmospheric Dark Vignette Overlay for High Contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(15, 10, 6, 0.45) 0%, rgba(10, 6, 3, 0.72) 100%)',
        }}
      />
    </div>
  );
};

/**
 * Backward-compatible ZoneInteriorTileSVG wrapper using FullBleedBrewerySceneSVG.
 */
export const ZoneInteriorTileSVG: React.FC<{
  zoneId: ZoneId;
}> = ({ zoneId }) => {
  return <FullBleedBrewerySceneSVG zoneId={zoneId} />;
};

/**
 * Vertical Brewhouse Connecting Pipe running between vertically stacked Zone Tiles.
 */
export const VerticalBreweryPipeConnector: React.FC<{
  fromZone: ZoneId;
  activeFlow?: boolean;
}> = ({ fromZone, activeFlow = false }) => {
  const flowColor =
    fromZone === 1 ? '#F59E0B' : fromZone === 2 ? '#EA580C' : '#047857';

  return (
    <div
      className="flex flex-col items-center justify-center my-1 relative z-20 pointer-events-none select-none"
      title={`Brewhouse Flow Pipe: Zone ${fromZone} → Zone ${fromZone + 1}`}
    >
      <svg viewBox="0 0 48 40" className="w-12 h-10 drop-shadow-lg">
        <defs>
          <linearGradient id={`vpipe-grad-${fromZone}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5C2607" />
            <stop offset="30%" stopColor="#FDE68A" />
            <stop offset="60%" stopColor="#C87D32" />
            <stop offset="100%" stopColor="#4A1D05" />
          </linearGradient>
          <linearGradient id={`vpipe-brass-${fromZone}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="50%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>

        {/* Top Brass Flange */}
        <rect x="8" y="0" width="32" height="6" rx="2" fill={`url(#vpipe-brass-${fromZone})`} stroke="#1C0F06" strokeWidth="1" />
        <circle cx="13" cy="3" r="1.5" fill="#451A03" />
        <circle cx="24" cy="3" r="1.5" fill="#451A03" />
        <circle cx="35" cy="3" r="1.5" fill="#451A03" />

        {/* Vertical Copper Pipe Body */}
        <rect x="15" y="4" width="18" height="32" fill={`url(#vpipe-grad-${fromZone})`} stroke="#1C0F06" strokeWidth="1.2" />

        {/* Central Pyrex Sight Glass */}
        <rect x="17" y="12" width="14" height="16" rx="3" fill="#1C1917" stroke="#D4AF37" strokeWidth="1" />
        <line
          x1="24"
          y1="14"
          x2="24"
          y2="26"
          stroke={flowColor}
          strokeWidth="3.5"
          strokeDasharray="4 2"
          className={activeFlow ? 'animate-pulse' : 'opacity-65'}
        />
        {/* Downward Direction Arrow */}
        <polygon points="21,21 24,26 27,21" fill="#FEF08A" />

        {/* Bottom Brass Flange */}
        <rect x="8" y="34" width="32" height="6" rx="2" fill={`url(#vpipe-brass-${fromZone})`} stroke="#1C0F06" strokeWidth="1" />
        <circle cx="13" cy="37" r="1.5" fill="#451A03" />
        <circle cx="24" cy="37" r="1.5" fill="#451A03" />
        <circle cx="35" cy="37" r="1.5" fill="#451A03" />
      </svg>
    </div>
  );
};

/**
 * Backward-compatible edge pipes shim.
 */
export const ZoneSeamlessEdgePipesSVG: React.FC<{
  zoneId: ZoneId;
}> = () => null;




