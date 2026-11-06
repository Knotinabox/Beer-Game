import React from 'react';
import { IngredientTaxonomy } from '../engine/types';

interface WoodenTokenProps {
  type: IngredientTaxonomy;
  size?: number;
  count?: number;
  showCount?: boolean;
  className?: string;
}

export const WOODEN_TOKEN_COLORS: Record<
  IngredientTaxonomy,
  { label: string; woodBg: string; woodBorder: string; accent: string; textColor: string; description: string }
> = {
  grain: {
    label: 'Grain',
    woodBg: 'from-[#D99E26] via-[#B87B14] to-[#784A04]',
    woodBorder: '#E5A93C',
    accent: '#FDE68A',
    textColor: '#FEF3C7',
    description: 'Golden-yellow teardrop / barley seed kernel with natural horizontal grain',
  },
  hops: {
    label: 'Hops',
    woodBg: 'from-[#277F32] via-[#1E6827] to-[#0D3814]',
    woodBorder: '#34D399',
    accent: '#86EFAC',
    textColor: '#DCFCE7',
    description: 'Carved forest-green hop cone with routed overlapping scales and top stem',
  },
  yeast: {
    label: 'Yeast',
    woodBg: 'from-[#EFE7D3] via-[#D8C9A7] to-[#A89874]',
    woodBorder: '#E5D6B5',
    accent: '#FFFBEB',
    textColor: '#FEF9C3',
    description: 'Natural blonde birch/maple Erlenmeyer science laboratory flask',
  },
  chocolate: {
    label: 'Chocolate',
    woodBg: 'from-[#7E4322] via-[#5E2F14] to-[#3E1D0A]',
    woodBorder: '#9C5229',
    accent: '#FBBF24',
    textColor: '#FDE68A',
    description: 'Dark roasted espresso chocolate bar brick with central beveled dividing groove',
  },
  spices: {
    label: 'Spices',
    woodBg: 'from-[#EA580C] via-[#C2410C] to-[#7C2D12]',
    woodBorder: '#F97316',
    accent: '#FB923C',
    textColor: '#FFEDD5',
    description: 'Warm cinnamon stick quills tied with natural raffia twine',
  },
  fruit: {
    label: 'Fruit',
    woodBg: 'from-[#7C3AED] via-[#5B21B6] to-[#2E1065]',
    woodBorder: '#A855F7',
    accent: '#C084FC',
    textColor: '#F3E8FF',
    description: 'Deep royal purple blackberry cluster with emerald green calyx leaf',
  },
};

/**
 * Authentic Custom Wooden Token Component.
 * Faithfully reproduces the tactile, physical wooden game pieces:
 * - Grain: Golden teardrop barley seed
 * - Hops: Carved green hop cone with overlapping bract scales
 * - Yeast: Natural birch Erlenmeyer lab flask
 * - Spices: Terracotta 8-pointed star anise
 * - Chocolate: Beveled split 2-pip chocolate brick
 * - Fruit: Hand-carved wild raspberry/blackberry cluster
 */
export const WoodenToken: React.FC<WoodenTokenProps> = ({
  type,
  size = 32,
  count,
  showCount = false,
  className = '',
}) => {
  const meta = WOODEN_TOKEN_COLORS[type];
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title={`${meta.label} Wooden Token — ${meta.description}`}
    >
      {!imgError ? (
        <img
          src={`/tokens/${type}-wood-piece.png`}
          alt={`${meta.label} Wooden Token`}
          className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] pointer-events-none"
          loading="eager"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.dataset.triedRelative) {
              target.dataset.triedRelative = 'true';
              target.src = `./tokens/${type}-wood-piece.png`;
            } else {
              setImgError(true);
            }
          }}
        />
      ) : (
        <svg
          viewBox="0 0 28 28"
          className="w-full h-full overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)]"
        >
          <defs>
          {/* Subtle woodgrain pattern overlay */}
          <pattern id={`woodGrain-${type}`} width="28" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="2" x2="28" y2="2" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
            <line x1="0" y1="4.5" x2="28" y2="5" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
          </pattern>

          {/* Grain Teardrop Gradients */}
          <linearGradient id="grainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5A82D" />
            <stop offset="45%" stopColor="#C98A19" />
            <stop offset="100%" stopColor="#8C5708" />
          </linearGradient>

          {/* Hops Cone Gradients */}
          <linearGradient id="hopsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E8B3A" />
            <stop offset="50%" stopColor="#1E6B28" />
            <stop offset="100%" stopColor="#0F3F16" />
          </linearGradient>

          {/* Yeast Flask Gradients (Natural Blonde Wood) */}
          <linearGradient id="yeastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5EFE1" />
            <stop offset="40%" stopColor="#E2D4B7" />
            <stop offset="100%" stopColor="#B8A57E" />
          </linearGradient>

          {/* Spices Cinnamon Sticks Gradients (Warm Amber Orange) */}
          <linearGradient id="spicesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="40%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>

          {/* Chocolate Brick Gradients (Rich Roasted Artisan Cocoa) */}
          <linearGradient id="chocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7E4322" />
            <stop offset="50%" stopColor="#5E2F14" />
            <stop offset="100%" stopColor="#3E1D0A" />
          </linearGradient>

          {/* Fruit Cluster Gradients (Deep Royal Purple / Blackberry) */}
          <linearGradient id="fruitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="45%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>
        </defs>

        {/* -------------------------------------------------------------
            1. GRAIN: Golden-Yellow Teardrop Seed Kernel
            ------------------------------------------------------------- */}
        {type === 'grain' && (
          <g>
            {/* 3D Bottom Edge / Thickness bevel */}
            <path
              d="M 14 3.5 C 19 8.5 24 14 24 18.5 A 10 10 0 0 1 4 18.5 C 4 14 9 8.5 14 3.5 Z"
              transform="translate(0, 1.8)"
              fill="#5C3603"
            />
            {/* Top Face */}
            <path
              d="M 14 3.5 C 19 8.5 24 14 24 18.5 A 10 10 0 0 1 4 18.5 C 4 14 9 8.5 14 3.5 Z"
              fill="url(#grainGrad)"
              stroke="#F6C358"
              strokeWidth="0.8"
            />
            {/* Woodgrain Overlay */}
            <path
              d="M 14 3.5 C 19 8.5 24 14 24 18.5 A 10 10 0 0 1 4 18.5 C 4 14 9 8.5 14 3.5 Z"
              fill={`url(#woodGrain-${type})`}
            />
            {/* Subtle Carved Barley Center Furrow / Crease */}
            <path
              d="M 14 6 C 14.5 11 15 15 14 21"
              stroke="rgba(92, 54, 3, 0.55)"
              strokeWidth="1.1"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 13.6 6 C 14.1 11 14.6 15 13.6 21"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="0.6"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* -------------------------------------------------------------
            2. HOPS: Forest-Green Carved Hop Cone with Scales & Stem
            ------------------------------------------------------------- */}
        {type === 'hops' && (
          <g>
            {/* 3D Under-Shadow Profile */}
            <path
              d="M 12.5 1.5 H 15.5 V 4.5 C 19.5 5 23 8.5 24 13 C 24.8 17 21 21 14 26 C 7 21 3.2 17 4 13 C 5 8.5 8.5 5 12.5 4.5 V 1.5 Z"
              transform="translate(0, 1.8)"
              fill="#08230D"
            />
            {/* Hop Cone Silhouette Base */}
            <path
              d="M 12.5 1.5 H 15.5 V 4.5 C 19.5 5 23 8.5 24 13 C 24.8 17 21 21 14 26 C 7 21 3.2 17 4 13 C 5 8.5 8.5 5 12.5 4.5 V 1.5 Z"
              fill="url(#hopsGrad)"
              stroke="#34D399"
              strokeWidth="0.8"
            />
            {/* Woodgrain Overlay */}
            <path
              d="M 12.5 1.5 H 15.5 V 4.5 C 19.5 5 23 8.5 24 13 C 24.8 17 21 21 14 26 C 7 21 3.2 17 4 13 C 5 8.5 8.5 5 12.5 4.5 V 1.5 Z"
              fill={`url(#woodGrain-${type})`}
            />
            {/* Carved Overlapping Hop Bract Scales (V-grooves like physical piece) */}
            <path
              d="M 7.5 9.5 Q 14 12 20.5 9.5"
              stroke="#08230D"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 6.5 14 Q 14 17 21.5 14"
              stroke="#08230D"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 8.5 18.5 Q 14 21.5 19.5 18.5"
              stroke="#08230D"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Vertical scale clefts */}
            <path
              d="M 14 4.5 V 9.5 M 10.5 9.5 L 10 14 M 17.5 9.5 L 18 14 M 14 14 V 19"
              stroke="#08230D"
              strokeWidth="1.0"
              fill="none"
            />
            {/* Scale Highlight Edges */}
            <path
              d="M 7.5 10.2 Q 14 12.7 20.5 10.2"
              stroke="rgba(134, 239, 172, 0.45)"
              strokeWidth="0.6"
              fill="none"
            />
            <path
              d="M 6.5 14.7 Q 14 17.7 21.5 14.7"
              stroke="rgba(134, 239, 172, 0.45)"
              strokeWidth="0.6"
              fill="none"
            />
          </g>
        )}

        {/* -------------------------------------------------------------
            3. YEAST: Natural Blonde Birch Erlenmeyer Laboratory Flask
            ------------------------------------------------------------- */}
        {type === 'yeast' && (
          <g>
            {/* 3D Under-Shadow Profile */}
            <path
              d="M 10 2 H 18 C 18.8 2 18.8 3.8 18 3.8 H 16 V 8 L 23.5 20.5 C 24.3 22 23 24 21 24 H 7 C 5 24 3.7 22 4.5 20.5 L 12 8 V 3.8 H 10 C 9.2 3.8 9.2 2 10 2 Z"
              transform="translate(0, 1.8)"
              fill="#6B5C3B"
            />
            {/* Top Face */}
            <path
              d="M 10 2 H 18 C 18.8 2 18.8 3.8 18 3.8 H 16 V 8 L 23.5 20.5 C 24.3 22 23 24 21 24 H 7 C 5 24 3.7 22 4.5 20.5 L 12 8 V 3.8 H 10 C 9.2 3.8 9.2 2 10 2 Z"
              fill="url(#yeastGrad)"
              stroke="#FAF4E8"
              strokeWidth="0.8"
            />
            {/* Woodgrain Overlay */}
            <path
              d="M 10 2 H 18 C 18.8 2 18.8 3.8 18 3.8 H 16 V 8 L 23.5 20.5 C 24.3 22 23 24 21 24 H 7 C 5 24 3.7 22 4.5 20.5 L 12 8 V 3.8 H 10 C 9.2 3.8 9.2 2 10 2 Z"
              fill={`url(#woodGrain-${type})`}
            />
            {/* Carved Neck Contour Line */}
            <line x1="12" y1="8" x2="16" y2="8" stroke="rgba(107, 92, 59, 0.45)" strokeWidth="0.8" />
            {/* Measurement Graduation Lines */}
            <line x1="9" y1="18" x2="12" y2="18" stroke="rgba(107, 92, 59, 0.6)" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="10.5" y1="15" x2="13" y2="15" stroke="rgba(107, 92, 59, 0.6)" strokeWidth="0.9" strokeLinecap="round" />
            <line x1="12" y1="12" x2="14" y2="12" stroke="rgba(107, 92, 59, 0.6)" strokeWidth="0.9" strokeLinecap="round" />
            {/* Specular White Bevel */}
            <path
              d="M 6.5 20.5 L 12.5 9.5"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* -------------------------------------------------------------
            4. SPICES: Carved Wooden Cinnamon Sticks Bundle (Warm Amber)
            ------------------------------------------------------------- */}
        {type === 'spices' && (
          <g transform="rotate(-24, 14, 14)">
            {/* 3D Under-Shadow Profile */}
            <path
              d="M 5 9 L 23 9 C 24.5 9 25 11 25 13 C 25 15 24.5 17 23 17 L 5 17 Z"
              transform="translate(1, 4.5)"
              fill="#3D1204"
            />
            {/* Bottom Stick */}
            <g transform="translate(1.5, 3.5)">
              <path d="M 5 10 L 23 10 C 24.5 10 25 11.5 25 13 C 25 14.5 24.5 16 23 16 L 5 16 Z" fill="url(#spicesGrad)" stroke="#5A1C06" strokeWidth="0.6" />
              <ellipse cx="5" cy="13" rx="1.8" ry="2.6" fill="#431407" stroke="#7C2D12" strokeWidth="0.5" />
            </g>
            {/* Top Stick */}
            <g transform="translate(0, -1)">
              <path d="M 4 9 L 22 9 C 23.5 9 24.5 10.5 24.5 12 C 24.5 13.5 23.5 15 22 15 L 4 15 Z" fill="url(#spicesGrad)" stroke="#5A1C06" strokeWidth="0.7" />
              <path d="M 5 9.8 L 22 9.8" stroke="#FED7AA" strokeWidth="0.5" opacity="0.7" />
              <ellipse cx="4" cy="12" rx="2" ry="2.8" fill="#431407" stroke="#EA580C" strokeWidth="0.6" />
              <circle cx="4" cy="12" r="0.7" fill="#FED7AA" />
            </g>
            {/* Raffia Twine Tie Band */}
            <rect x="12" y="7.5" width="2.5" height="11.5" rx="0.6" fill="#F59E0B" stroke="#451A03" strokeWidth="0.4" />
            <circle cx="13.2" cy="13.2" r="1.1" fill="#FEF3C7" stroke="#78350F" strokeWidth="0.4" />
          </g>
        )}

        {/* -------------------------------------------------------------
            5. CHOCOLATE: Dark Roasted Split 2-Pip Chocolate Bar Brick
            ------------------------------------------------------------- */}
        {type === 'chocolate' && (
          <g>
            {/* 3D Under-Shadow Profile */}
            <rect
              x="2.5"
              y="5"
              width="23"
              height="16"
              rx="3.5"
              transform="translate(0, 1.8)"
              fill="#0F0602"
            />
            {/* Top Face Silhouette */}
            <rect
              x="2.5"
              y="5"
              width="23"
              height="16"
              rx="3.5"
              fill="url(#chocGrad)"
              stroke="#9C5229"
              strokeWidth="0.8"
            />
            {/* Woodgrain Overlay */}
            <rect
              x="2.5"
              y="5"
              width="23"
              height="16"
              rx="3.5"
              fill={`url(#woodGrain-${type})`}
            />
            {/* Left Pip Cushion Bevel */}
            <rect
              x="4.5"
              y="6.8"
              width="8.5"
              height="12.4"
              rx="2.2"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.8"
            />
            {/* Right Pip Cushion Bevel */}
            <rect
              x="15"
              y="6.8"
              width="8.5"
              height="12.4"
              rx="2.2"
              fill="none"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.8"
            />
            {/* Deep Central Dividing Trench (The Split) */}
            <line x1="14" y1="5" x2="14" y2="21" stroke="#0F0602" strokeWidth="1.6" />
            <line x1="14.6" y1="5" x2="14.6" y2="21" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="0.6" />
          </g>
        )}

        {/* -------------------------------------------------------------
            6. FRUIT: Carved Royal Purple Blackberry with Emerald Green Leaf Calyx
            ------------------------------------------------------------- */}
        {type === 'fruit' && (
          <g>
            {/* 3D Under-Shadow Profile */}
            <g transform="translate(0, 1.8)" fill="#18042B">
              <circle cx="14" cy="10" r="4.2" />
              <circle cx="9.5" cy="14" r="4.2" />
              <circle cx="18.5" cy="14" r="4.2" />
              <circle cx="11.5" cy="19.5" r="4" />
              <circle cx="16.5" cy="19.5" r="4" />
              <circle cx="14" cy="23.5" r="3.2" />
            </g>
            {/* Fruit Drupelets Base */}
            <g fill="url(#fruitGrad)" stroke="#3B0764" strokeWidth="0.7">
              <circle cx="14" cy="10" r="4.2" />
              <circle cx="9.5" cy="14" r="4.2" />
              <circle cx="18.5" cy="14" r="4.2" />
              <circle cx="11.5" cy="19.5" r="4" />
              <circle cx="16.5" cy="19.5" r="4" />
              <circle cx="14" cy="23.5" r="3.2" />
              {/* Center Highlight Core */}
              <circle cx="14" cy="15" r="3.6" fill="#A855F7" />
              <circle cx="13.2" cy="14.2" r="1.1" fill="#FFFFFF" opacity="0.8" />
            </g>
            {/* Top Calyx Leaf Accent (Bright Emerald Green Leaf) */}
            <g transform="translate(0, -1)">
              <path
                d="M 14 4 C 11 5 8 5 6 7 C 8 8 11 8 14 7 C 17 8 20 8 22 7 C 20 5 17 5 14 4 Z"
                fill="#22C55E"
                stroke="#052E16"
                strokeWidth="0.5"
              />
              <circle cx="14" cy="6" r="1.2" fill="#15803D" stroke="#052E16" strokeWidth="0.4" />
              <path d="M 14 4 L 14 2" stroke="#15803D" strokeWidth="0.8" strokeLinecap="round" />
            </g>
          </g>
        )}
      </svg>
      )}

      {/* Floating Count Badge */}
      {showCount && typeof count === 'number' && (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-stone-950 text-white border font-mono font-black text-[10px] flex items-center justify-center shadow-lg pointer-events-none"
          style={{ borderColor: meta.woodBorder, color: meta.textColor }}
        >
          {count}
        </span>
      )}
    </div>
  );
};

/**
 * Shared SVG Gradients and Filters for the 6 Wooden Ingredient Pieces.
 * Can be placed into any parent <defs> so both HTML and native board SVG can render them.
 */
export const WoodenTokenDefs: React.FC = () => (
  <>
    {/* Grain Teardrop Gradients */}
    <linearGradient id="grainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#E5A82D" />
      <stop offset="45%" stopColor="#C98A19" />
      <stop offset="100%" stopColor="#8C5708" />
    </linearGradient>

    {/* Hops Cone Gradients */}
    <linearGradient id="hopsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#2E8B3A" />
      <stop offset="50%" stopColor="#1E6B28" />
      <stop offset="100%" stopColor="#0F3F16" />
    </linearGradient>

    {/* Yeast Flask Gradients (Natural Blonde Wood) */}
    <linearGradient id="yeastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F5EFE1" />
      <stop offset="40%" stopColor="#E2D4B7" />
      <stop offset="100%" stopColor="#B8A57E" />
    </linearGradient>

    {/* Spices Star Anise Gradients */}
    <linearGradient id="spicesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#C9562E" />
      <stop offset="50%" stopColor="#A23F1C" />
      <stop offset="100%" stopColor="#69210B" />
    </linearGradient>

    {/* Chocolate Brick Gradients (Rich Roasted Artisan Cocoa) */}
    <linearGradient id="chocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#7E4322" />
      <stop offset="50%" stopColor="#5E2F14" />
      <stop offset="100%" stopColor="#3E1D0A" />
    </linearGradient>

    {/* Fruit Cluster Gradients */}
    <linearGradient id="fruitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#A32B5B" />
      <stop offset="50%" stopColor="#7B193F" />
      <stop offset="100%" stopColor="#42081E" />
    </linearGradient>
  </>
);

/**
 * Pure SVG Wooden Ingredient Piece for Dial Hoppers and Vector Gameboards.
 * Displays the authentic carved 3D physical piece geometry.
 */
export const WoodenTokenPieceSVG: React.FC<{
  type: IngredientTaxonomy;
  x?: number;
  y?: number;
  size?: number;
}> = ({ type, x = 0, y = 0, size = 28 }) => {
  const scale = size / 28;
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale}) translate(-14, -14)`} className="pointer-events-none">
      <image
        href={`/tokens/${type}-wood-piece.png`}
        x="0"
        y="0"
        width="28"
        height="28"
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.85))' }}
      />
    </g>
  );
};

/**
 * Player Wooden Token Cache summary pill row.
 */
export const PlayerTokenCacheBar: React.FC<{
  tokens: Record<IngredientTaxonomy, number>;
  compact?: boolean;
}> = ({ tokens, compact = false }) => {
  const taxonomies: IngredientTaxonomy[] = [
    'grain',
    'hops',
    'yeast',
    'chocolate',
    'spices',
    'fruit',
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {taxonomies.map((tax) => {
        const count = tokens[tax] || 0;
        const meta = WOODEN_TOKEN_COLORS[tax];
        return (
          <div
            key={tax}
            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-stone-950/90 border transition-all ${
              count > 0 ? 'border-amber-600/70 shadow-md ring-1 ring-amber-500/20' : 'border-stone-800/80 opacity-60'
            }`}
          >
            <WoodenToken type={tax} size={compact ? 22 : 28} />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-stone-400">
                {meta.label}
              </span>
              <span
                className="font-mono font-black text-sm"
                style={{ color: count > 0 ? meta.textColor : '#777' }}
              >
                {count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
