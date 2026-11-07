import React, { useState, useEffect } from 'react';
import {
  GameState,
  PlayerState,
  RotarySlotNumber,
  RotaryCatwalkAction,
  IngredientTaxonomy,
  RecipeCard,
  UpgradeCard,
  RotaryOccupant,
} from '../engine/types';
import { ROTARY_SLOT_DEFS, RotarySlotDefinition } from '../engine/cards';
import {
  canAffordRecipeWithTokens,
  canAffordUpgradeWithTokens,
  getWarehouseCapacity,
} from '../engine/gameEngine';
import { WoodenToken, PlayerTokenCacheBar, WoodenTokenDefs, WoodenTokenPieceSVG } from './WoodenTokens';
import { getHoyneBrandPalette } from './HoyneAssets';
import { useCardInspector } from '../context/CardInspectorContext';
import { RecipeCardView, UpgradeCardView } from './CardComponents';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Flame,
  Compass,
  RotateCw,
  Beer,
  Wrench,
  AlertTriangle,
  Award,
  Sparkles,
  Scale,
  Columns2,
  Plus,
} from 'lucide-react';

export const PANTRY_OPTIONS: Array<{
  type: IngredientTaxonomy;
  name: string;
  desc: string;
  badgeBg: string;
}> = [
  { type: 'grain', name: 'Grain', desc: '2-Row Base Malt', badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { type: 'hops', name: 'Hops', desc: 'Noble & Aroma Hops', badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { type: 'yeast', name: 'Yeast', desc: 'Hoyne House Strain', badgeBg: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40' },
  { type: 'fruit', name: 'Fruit', desc: 'Saanich Blackberries', badgeBg: 'bg-purple-600/25 text-purple-300 border-purple-500/50' },
  { type: 'spices', name: 'Spices', desc: 'Cinnamon & Winter Spices', badgeBg: 'bg-orange-500/25 text-orange-300 border-orange-500/50' },
  { type: 'chocolate', name: 'Chocolate', desc: 'Dark Roasted Malt', badgeBg: 'bg-amber-900/40 text-amber-200 border-amber-700/50' },
];

/**
 * Pure SVG Brewer Meeple rendered inside the 11.5" Dial's native SVG coordinate space.
 * Eliminates all <foreignObject> dimension/clipping glitches and renders crisp, authentic 3D woodgrain meeples.
 */
export const BrewerMeepleInDial: React.FC<{
  x?: number;
  y?: number;
  color: string;
  sizeInInches?: number;
}> = ({ x = 0, y = 0, color, sizeInInches = 0.38 }) => {
  const scale = sizeInInches / 100;
  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale}) translate(-50, -50)`}
      className="pointer-events-none"
    >
      {/* Soft drop shadow */}
      <ellipse cx="50" cy="94" rx="36" ry="8" fill="rgba(0,0,0,0.85)" />
      {/* Meeple head & upper torso */}
      <path
        d="M50 8 C42 8 36 14 36 22 C36 28 40 32 43 34 C31 38 23 48 20 60 C19 64 23 68 27 68 C31 68 34 64 36 59 C38 53 43 49 50 49 C57 49 62 53 64 59 C66 64 69 68 73 68 C77 68 81 64 80 60 C77 48 69 38 57 34 C60 32 64 28 64 22 C64 14 58 8 50 8 Z"
        fill={color}
        stroke="#0d0805"
        strokeWidth="4"
      />
      {/* Meeple legs */}
      <path
        d="M37 50 L34 88 C34 92 37 94 41 94 L46 94 C48 94 49 92 49 89 L49 70 L51 70 L51 89 C51 92 52 94 54 94 L59 94 C63 94 66 92 66 88 L63 50"
        fill={color}
        stroke="#0d0805"
        strokeWidth="4"
      />
      {/* Tactile wood sheen highlight */}
      <path
        d="M44 14 C46 12 50 12 54 13"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M26 62 C27 50 32 42 42 36"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};

/**
 * Committed Brewer Meeple Badge for Outer Shelf Cards (and Card Stacks).
 * Renders the EXACT same circular detent badge (solid gold rim, player-colored dashed inner ring)
 * and meeple size as the Inner Hopper ingredient side, with ZERO text underneath.
 */
export const CommittedBrewerMeepleBadge: React.FC<{
  playerColor: string;
  className?: string;
}> = ({ playerColor, className = '' }) => (
  <div className={`relative flex items-center justify-center pointer-events-none drop-shadow-2xl ${className}`}>
    <svg
      viewBox="0 0 52 52"
      className="w-12 h-12 sm:w-[50px] sm:h-[50px] overflow-visible"
    >
      <defs>
        <filter id="meepleCardDrop" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.9" />
        </filter>
      </defs>
      {/* Outer solid gold ring & dark circular detent backing */}
      <circle
        cx="26"
        cy="26"
        r="23"
        fill="rgba(20, 10, 5, 0.95)"
        stroke="#f59e0b"
        strokeWidth="1.8"
        filter="url(#meepleCardDrop)"
      />
      {/* Inner dashed ring matching player's color */}
      <circle
        cx="26"
        cy="26"
        r="20"
        fill="none"
        stroke={playerColor}
        strokeWidth="1.4"
        strokeDasharray="3.5, 2.5"
      />
      {/* Authentic 3D woodgrain meeple scaled identically to the ingredient hopper */}
      <g transform="translate(26, 26) scale(0.42) translate(-50, -50)">
        {/* Soft drop shadow */}
        <ellipse cx="50" cy="94" rx="36" ry="8" fill="rgba(0,0,0,0.85)" />
        {/* Head & upper torso */}
        <path
          d="M50 8 C42 8 36 14 36 22 C36 28 40 32 43 34 C31 38 23 48 20 60 C19 64 23 68 27 68 C31 68 34 64 36 59 C38 53 43 49 50 49 C57 49 62 53 64 59 C66 64 69 68 73 68 C77 68 81 64 80 60 C77 48 69 38 57 34 C60 32 64 28 64 22 C64 14 58 8 50 8 Z"
          fill={playerColor}
          stroke="#0d0805"
          strokeWidth="4"
        />
        {/* Legs */}
        <path
          d="M37 50 L34 88 C34 92 37 94 41 94 L46 94 C48 94 49 92 49 89 L49 70 L51 70 L51 89 C51 92 52 94 54 94 L59 94 C63 94 66 92 66 88 L63 50"
          fill={playerColor}
          stroke="#0d0805"
          strokeWidth="4"
        />
        {/* Tactile wood sheen highlight */}
        <path d="M44 14 C46 12 50 12 54 13" stroke="rgba(255,255,255,0.8)" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 62 C27 50 32 42 42 36" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  </div>
);

/**
 * Standalone 3D Wooden Brewer Meeple for standard HTML DOM containers
 * (such as outer shelf cards, player boards, and inventory badges).
 */
export const StandaloneMeepleSVG: React.FC<{
  color: string;
  size?: number;
  className?: string;
}> = ({ color, size = 36, className = '' }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={`drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)] filter overflow-visible pointer-events-none ${className}`}
  >
    {/* Soft drop shadow */}
    <ellipse cx="50" cy="94" rx="36" ry="8" fill="rgba(0,0,0,0.85)" />
    {/* Meeple head & upper torso */}
    <path
      d="M50 8 C42 8 36 14 36 22 C36 28 40 32 43 34 C31 38 23 48 20 60 C19 64 23 68 27 68 C31 68 34 64 36 59 C38 53 43 49 50 49 C57 49 62 53 64 59 C66 64 69 68 73 68 C77 68 81 64 80 60 C77 48 69 38 57 34 C60 32 64 28 64 22 C64 14 58 8 50 8 Z"
      fill={color}
      stroke="#0d0805"
      strokeWidth="4"
    />
    {/* Meeple legs */}
    <path
      d="M37 50 L34 88 C34 92 37 94 41 94 L46 94 C48 94 49 92 49 89 L49 70 L51 70 L51 89 C51 92 52 94 54 94 L59 94 C63 94 66 92 66 88 L63 50"
      fill={color}
      stroke="#0d0805"
      strokeWidth="4"
    />
    {/* Tactile wood sheen highlight */}
    <path
      d="M44 14 C46 12 50 12 54 13"
      stroke="rgba(255,255,255,0.8)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M26 62 C27 50 32 42 42 36"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export interface RotaryBoardProps {
  gameState: GameState;
  activePlayer: PlayerState;
  isWorkDay: boolean;
  onPerformRotaryAction: (
    slotNumber: RotarySlotNumber,
    actionType: RotaryCatwalkAction,
    chosenOption?: 'equipment' | 'staff' | 'leftWing' | 'rightWing',
    chosenPaymentTokens?: Partial<Record<IngredientTaxonomy, number>>
  ) => void;
  onPerformCenterPantryAction?: (ingredient: IngredientTaxonomy) => void;
  onPerformEndOfShiftSlide?: () => void;
}

export const RotaryBoard: React.FC<RotaryBoardProps> = ({
  gameState,
  activePlayer,
  isWorkDay,
  onPerformRotaryAction,
  onPerformCenterPantryAction,
  onPerformEndOfShiftSlide,
}) => {
  const rotary = gameState.rotaryBoard;
  const { inspectCard } = useCardInspector();
  const showCADOverlay = false;
  const is1to1Scale = true;
  const cardLayout = 'side-ledger';
  const [hoveredSlot, setHoveredSlot] = useState<RotarySlotNumber | null>(null);
  const [hoveredAction, setHoveredAction] = useState<RotaryCatwalkAction | null>(null);
  const [evictionToast, setEvictionToast] = useState<string | null>(null);

  const humanPlayer = gameState.players.find((p) => !p.isAI) || activePlayer;
  const humanWarehouseCap = getWarehouseCapacity(humanPlayer);
  const humanWarehouseCount = Object.values(humanPlayer.tokens || {}).reduce((s, v) => s + (v || 0), 0);
  const humanExcessTokens = Math.max(0, humanWarehouseCount - humanWarehouseCap);
  const isHumanWarehouseOverCap = humanExcessTokens > 0;

  if (!rotary) return null;

  const hotSeatOccupant = rotary.centerRingHotSeat;
  const isHotSeatActive = Boolean(hotSeatOccupant);
  const evictedFromStation = rotary.evictedFromStation;
  const sectorSlots: RotarySlotNumber[] = [1, 2, 3, 4, 5, 6];

  // Helper: Polar to Cartesian conversion with (0,0) at circle origin
  // In SVG viewBox: -5.750 -5.750 11.500 11.500 (origin is 0,0, radius is 5.750")
  // mathAngleDeg: 90° = Top (-Y), 0° = Right (+X), 270° = Bottom (+Y), 180° = Left (-X)
  const polarToCartesian = (radius: number, mathAngleDeg: number) => {
    const rad = (mathAngleDeg * Math.PI) / 180;
    return {
      x: radius * Math.cos(rad),
      y: -radius * Math.sin(rad),
    };
  };

  // Safe wedge path generator for central ingredient hoppers
  const getHopperWedgePath = (innerR: number, outerR: number, mathAngleDeg: number) => {
    const a1 = mathAngleDeg + 27;
    const a2 = mathAngleDeg - 27;
    const p1 = polarToCartesian(outerR, a1);
    const p2 = polarToCartesian(outerR, a2);
    const p3 = polarToCartesian(innerR, a2);
    const p4 = polarToCartesian(innerR, a1);

    return `M ${p1.x} ${p1.y} A ${outerR} ${outerR} 0 0 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${innerR} ${innerR} 0 0 1 ${p4.x} ${p4.y} Z`;
  };

  // Helper for HTML card placement in percentage of board diameter
  // clockAngleDeg: 0° = 12 o'clock (Top), 60° = 2 o'clock, 120° = 4 o'clock, etc.
  const getHtmlCoords = (radiusPercent: number, clockAngleDeg: number) => {
    const rad = (clockAngleDeg - 90) * (Math.PI / 180);
    return {
      x: 50 + radiusPercent * Math.cos(rad),
      y: 50 + radiusPercent * Math.sin(rad),
    };
  };

  // Count placed meeples on Left/Right wings to indicate End-of-Shift readiness
  const totalWingMeeples = sectorSlots.reduce((count, s) => {
    const slot = rotary.slots[s];
    return count + (slot.inwardOccupant ? 1 : 0) + (slot.outwardOccupant ? 1 : 0);
  }, 0);

  const activePlayerStandbySlot = sectorSlots.find(
    (s) => rotary.slots[s].standbyOccupant?.playerId === activePlayer.id
  );
  const activePlayerCatwalkSlot = ([1, 2, 3, 4, 5, 6, 7] as RotarySlotNumber[]).find(
    (s) => rotary.slots[s]?.catwalkOccupant?.playerId === activePlayer.id
  );

  const centerOccupant = rotary.slots[7]?.catwalkOccupant || null;
  const isCenterOccupied = Boolean(rotary.slots[7]?.catwalkOccupant);
  const isCenterStandby = Boolean(rotary.slots[7]?.catwalkOccupant);
  const isStation7Available = gameState.phase === 'PHASE_2_CATWALK_PLACEMENT' &&
    activePlayer.lastOccupiedStation !== 7 &&
    !isCenterOccupied;
  const isStation7ActiveInPhase3 = gameState.phase === 'PHASE_3_STATION_COMMITMENT' &&
    activePlayerCatwalkSlot === 7;

  const handleStation7Click = () => {
    // 1. Phase 2: Catwalk Placement & Initiative (Places meeple in standby in middle porthole)
    if (gameState.phase === 'PHASE_2_CATWALK_PLACEMENT') {
      if (activePlayer.lastOccupiedStation === 7) {
        setEvictionToast(
          'Forced Movement Rule: You occupied Station #7 on the previous shift! You must deploy to a different station on the Catwalk.'
        );
        setTimeout(() => setEvictionToast(null), 3500);
        return;
      }
      if (isCenterOccupied) {
        setEvictionToast(
          `Catwalk Station #7 is already occupied by ${centerOccupant?.playerName}!`
        );
        setTimeout(() => setEvictionToast(null), 3500);
        return;
      }
      // Place meeple on Catwalk #7 in standby in the very middle porthole
      onPerformRotaryAction(7, 'standby');
      return;
    }

    // 2. Phase 3: Station Commitment & Action Execution (Resolves in numerical initiative order #7)
    if (gameState.phase === 'PHASE_3_STATION_COMMITMENT') {
      if (activePlayerCatwalkSlot !== 7) {
        setEvictionToast(
          `Station Commitment: You are stationed at Catwalk #${activePlayerCatwalkSlot} and must resolve your action at Station #${activePlayerCatwalkSlot}!`
        );
        setTimeout(() => setEvictionToast(null), 3500);
        return;
      }
      setEvictionToast('Pantry Active: Click any of the 6 ingredient spaces around the central kettle to take that token!');
      setTimeout(() => setEvictionToast(null), 3500);
      return;
    }

    if (isCenterOccupied) {
      setEvictionToast(
        `Catwalk Station #7 is occupied by ${centerOccupant?.playerName}!`
      );
      setTimeout(() => setEvictionToast(null), 3500);
      return;
    }

    onPerformRotaryAction(7, 'standby');
  };

  const handleActionClick = (slotNum: RotarySlotNumber, action: RotaryCatwalkAction) => {
    // 1. Phase 2: Catwalk Placement & Initiative
    if (gameState.phase === 'PHASE_2_CATWALK_PLACEMENT' || action === 'standby') {
      if (activePlayer.lastOccupiedStation === slotNum) {
        setEvictionToast(
          `Forced Movement Rule: You occupied Station #${slotNum} on the previous shift! You must deploy to a different station on the Catwalk.`
        );
        setTimeout(() => setEvictionToast(null), 3500);
        return;
      }
      if (rotary.slots[slotNum]?.catwalkOccupant) {
        setEvictionToast(
          `Catwalk #${slotNum} is already occupied by ${rotary.slots[slotNum].catwalkOccupant?.playerName}!`
        );
        setTimeout(() => setEvictionToast(null), 3500);
        return;
      }
      onPerformRotaryAction(slotNum, 'standby');
      return;
    }

    // 2. Phase 3: Station Commitment & Action Execution
    if (gameState.phase === 'PHASE_3_STATION_COMMITMENT') {
      if (activePlayerCatwalkSlot !== undefined && activePlayerCatwalkSlot !== slotNum) {
        setEvictionToast(
          `Station Commitment: You are stationed at Catwalk #${activePlayerCatwalkSlot} and must choose between Inner Hopper (IN) or Outer Shelf (OUT) at Station #${activePlayerCatwalkSlot}!`
        );
        setTimeout(() => setEvictionToast(null), 3500);
        return;
      }

      // Lockout check
      const slot = rotary.slots[slotNum];
      if (slot.inwardOccupant && slot.inwardOccupant.playerId !== activePlayer.id) {
        setEvictionToast(`Station #${slotNum} is locked by ${slot.inwardOccupant.playerName}!`);
        setTimeout(() => setEvictionToast(null), 3500);
        return;
      }
      if (slot.outwardOccupant && slot.outwardOccupant.playerId !== activePlayer.id) {
        setEvictionToast(`Station #${slotNum} is locked by ${slot.outwardOccupant.playerName}!`);
        setTimeout(() => setEvictionToast(null), 3500);
        return;
      }
    }

    // 3. Outward Card Affordability check
    if (action === 'outward') {
      const card = rotary.slots[slotNum]?.outerCard;
      if (card) {
        let afford = false;
        let reason = '';
        if (card.deckType === 'recipe') {
          const check = canAffordRecipeWithTokens(activePlayer, card);
          afford = check.canAfford;
          reason = check.reason || 'Missing required ingredient tokens';
        } else if (card.deckType === 'upgrade') {
          const check = canAffordUpgradeWithTokens(activePlayer, card);
          afford = check.canAfford;
          reason = check.reason || 'Missing required tokens or column full';
        }
        if (!afford) {
          setEvictionToast(
            `Cannot draft Outer Shelf at Station #${slotNum}: ${reason}!`
          );
          setTimeout(() => setEvictionToast(null), 3500);
          return;
        }

        // Upgrades now deduct their specific required warehouse tokens directly with no modal
      }
    }

    onPerformRotaryAction(slotNum, action);
  };

  return (
    <div className="h-full flex flex-col justify-between font-sans select-none flex-1">

      {/* Eviction Restriction Toast */}
      {evictionToast && (
        <div className="p-2.5 rounded-xl bg-red-950/95 border-2 border-red-500 text-red-200 text-xs font-bold flex items-center gap-2 animate-bounce shadow-xl">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{evictionToast}</span>
        </div>
      )}


      {/* =====================================================================
          MAIN BOARD WRAPPER: CIRCULAR 11.500" DIAL WITH OVERHANGING CARDS
          Generous padding ensures upright poker cards in regular format never clip
          ===================================================================== */}
      <div className="relative w-full max-w-[620px] 2xl:max-w-[660px] mx-auto py-2 px-1 flex-1 flex items-center justify-center select-none overflow-visible">
        {/* Main 11.500" Circular Board Base — Expanded Prominent Scale */}
        <div className="relative w-full aspect-square max-w-[400px] sm:max-w-[425px] lg:max-w-[445px] xl:max-w-[465px] 2xl:max-w-[485px] rounded-full">
          {/* =================================================================
              LAYER 1: CENTRAL SVG ROTARY BREWHOUSE DIAL (R = 5.750")
              ================================================================= */}
          <svg
            viewBox="-4.625 -4.625 9.250 9.250"
            className="absolute inset-0 w-full h-full drop-shadow-2xl overflow-visible"
            style={{ filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.85))' }}
          >
            <defs>
              {/* Charcoal Dial Base Gradient */}
              <radialGradient id="charcoalDialGrad" cx="0" cy="0" r="4.625" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#181c22" />
                <stop offset="60%" stopColor="#20252b" />
                <stop offset="92%" stopColor="#14181d" />
                <stop offset="100%" stopColor="#0d1013" />
              </radialGradient>

              {/* Center Pantry Kettle Hub Gradient */}
              <radialGradient id="centerPantryGrad" cx="0" cy="0" r="0.750" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3d2214" />
                <stop offset="45%" stopColor="#281308" />
                <stop offset="85%" stopColor="#1a0c06" />
                <stop offset="100%" stopColor="#100502" />
              </radialGradient>

              {/* Catwalk Bronze Grating Gradient */}
              <radialGradient id="catwalkRingGrad" cx="0" cy="0" r="3.750" gradientUnits="userSpaceOnUse">
                <stop offset="78%" stopColor="#241b12" />
                <stop offset="85%" stopColor="#3d2a19" />
                <stop offset="92%" stopColor="#1e150d" />
                <stop offset="100%" stopColor="#2c1e12" />
              </radialGradient>

              <filter id="hopperShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0.04" stdDeviation="0.06" floodColor="#000" floodOpacity="0.8" />
              </filter>
              <filter id="detentDrop" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="0.02" stdDeviation="0.03" floodColor="#000" floodOpacity="0.9" />
              </filter>
              <WoodenTokenDefs />
            </defs>

            {/* =================================================================
                1. MASTER 11.500" CIRCULAR BASE RIM (R = 5.750") WITH HIGH-RES ARTWORK
                ================================================================= */}
            <clipPath id="boardRimClip">
              <circle cx="0" cy="0" r="4.625" />
            </clipPath>

            {/* Dial Base Charcoal Rim */}
            <circle cx="0" cy="0" r="4.625" fill="url(#charcoalDialGrad)" stroke="#e5b85c" strokeWidth="0.04" />

            {/* Authentic Photorealistic Brewery Rotary Board Artwork */}
            <image
              href="./board/rotary-dial-artwork.png"
              x="-4.625"
              y="-4.625"
              width="9.250"
              height="9.250"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#boardRimClip)"
            />

            {/* Polished Brass Outer Bezel Rim */}
            <circle cx="0" cy="0" r="4.615" fill="none" stroke="#d97706" strokeWidth="0.03" opacity="0.8" />
            <circle cx="0" cy="0" r="4.590" fill="none" stroke="#2a323d" strokeWidth="0.02" opacity="0.6" />

            {/* 2. ZONE 1: HOPPER INTERACTIVE HOVER HIGHLIGHTS & DIRECT PANTRY PICKING */}
            {sectorSlots.map((slotNum) => {
              const def = ROTARY_SLOT_DEFS[slotNum];
              const wedgePath = getHopperWedgePath(1.100, 2.900, def.vectorDeg);
              const isHovered = hoveredSlot === slotNum;
              const isPantryTarget = isStation7ActiveInPhase3 && !activePlayer.isAI;

              return (
                <path
                  key={`hopper-path-${slotNum}`}
                  d={wedgePath}
                  fill={def.color}
                  fillOpacity={
                    isPantryTarget
                      ? isHovered ? 0.45 : 0.20
                      : isHovered ? 0.35 : 0
                  }
                  stroke={
                    isPantryTarget
                      ? isHovered ? '#38bdf8' : '#f59e0b'
                      : isHovered ? '#f59e0b' : 'none'
                  }
                  strokeWidth={isPantryTarget ? (isHovered ? '0.045' : '0.035') : '0.02'}
                  strokeDasharray={isPantryTarget ? '0.08, 0.04' : undefined}
                  className={`transition-all duration-200 cursor-pointer ${isPantryTarget ? 'animate-pulse' : ''}`}
                  onClick={() => {
                    if (isPantryTarget) {
                      if (onPerformCenterPantryAction) {
                        onPerformCenterPantryAction(def.ingredient);
                      }
                      return;
                    }
                    if (isWorkDay) {
                      handleActionClick(slotNum, 'inward');
                    }
                  }}
                  onMouseEnter={() => setHoveredSlot(slotNum)}
                  onMouseLeave={() => setHoveredSlot(null)}
                />
              );
            })}

            {/* 3. SPOKE DIVIDER ACCENTS (R = 1.350" TO 3.350") */}
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const pInner = polarToCartesian(1.100, deg);
              const pOuter = polarToCartesian(2.900, deg);
              return (
                <line
                  key={`spoke-line-${deg}`}
                  x1={pInner.x}
                  y1={pInner.y}
                  x2={pOuter.x}
                  y2={pOuter.y}
                  stroke="#e5b85c"
                  strokeWidth="0.015"
                  opacity="0.4"
                />
              );
            })}

            {/* 4. THE CENTER SPACE: CATWALK STATION #7 — BREWHOUSE PANTRY (CENTER HUB R = 0.450") */}
            <g
              className="cursor-pointer"
              onClick={handleStation7Click}
              onMouseEnter={() => {
                setHoveredSlot(7);
                setHoveredAction('standby');
              }}
              onMouseLeave={() => {
                setHoveredSlot(null);
                setHoveredAction(null);
              }}
            >
              {/* Interactive Porthole Detent (Identical size and style to Detents 1-6) */}
              <circle
                cx="0"
                cy="0"
                r="0.450"
                fill={
                  isCenterOccupied
                    ? 'rgba(45, 20, 8, 0.90)'
                    : isStation7ActiveInPhase3
                    ? 'rgba(245, 158, 11, 0.35)'
                    : isStation7Available
                    ? 'rgba(56, 189, 248, 0.20)'
                    : (hoveredSlot === 7 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(18, 14, 11, 0.75)')
                }
                stroke={
                  isStation7ActiveInPhase3
                    ? '#f59e0b'
                    : isCenterOccupied
                    ? '#e5b85c'
                    : isStation7Available
                    ? (hoveredSlot === 7 ? '#38bdf8' : '#f59e0b')
                    : (hoveredSlot === 7 ? '#f59e0b' : 'rgba(217, 119, 6, 0.65)')
                }
                strokeWidth={isStation7Available || isStation7ActiveInPhase3 ? '0.040' : '0.030'}
                strokeDasharray={isStation7Available || isStation7ActiveInPhase3 ? '0.08, 0.04' : undefined}
                filter="url(#detentDrop)"
              />

              {/* Pulsing ring when active in Phase 3 initiative */}
              {isStation7ActiveInPhase3 && (
                <circle
                  cx="0"
                  cy="0"
                  r="0.510"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="0.025"
                  strokeDasharray="0.06, 0.04"
                />
              )}

              {/* Inset Concentric Brass Ring with Rivet Detail */}
              <circle
                cx="0"
                cy="0"
                r="0.400"
                fill="none"
                stroke="#8c6239"
                strokeWidth="0.010"
                strokeDasharray="0.03, 0.02"
              />

              {/* When occupied by Meeple, show Station 7 Badge above meeple */}
              {isCenterStandby && (
                <text
                  x="0"
                  y="-0.26"
                  textAnchor="middle"
                  fill="#fef08a"
                  fontSize="0.22"
                  fontWeight="900"
                  fontFamily="Cinzel, serif"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 0 6px rgba(234, 179, 8, 0.7))',
                    letterSpacing: '0.02em',
                  }}
                >
                  7
                </text>
              )}

              {/* Occupied State (Standby only, before an ingredient space is picked) */}
              {isCenterStandby && (
                <g>
                  {/* Dark circular base for Meeple */}
                  <circle cx="0" cy="0.08" r="0.32" fill="#140807" stroke="#e5b85c" strokeWidth="0.02" opacity="0.9" />
                  <BrewerMeepleInDial x={0} y={0.08} color={centerOccupant?.playerColor || '#f59e0b'} sizeInInches={0.65} />

                  {/* Pill at bottom showing player name */}
                  <g transform="translate(0, 0.38)">
                    <rect
                      x="-0.44"
                      y="-0.10"
                      width="0.88"
                      height="0.20"
                      rx="0.10"
                      fill="#181311"
                      stroke="#e5b85c"
                      strokeWidth="0.015"
                    />
                    <text
                      x="0"
                      y={0.035}
                      textAnchor="middle"
                      fill="#fef08a"
                      fontSize="0.075"
                      fontWeight="bold"
                      fontFamily="Cinzel, serif"
                    >
                      {centerOccupant?.playerName}
                    </text>
                  </g>
                </g>
              )}

              {/* Small subtle PANTRY indicator when empty / after meeple moves to chosen space */}
              {!isCenterStandby && (
                <g transform="translate(0, 0.30)">
                  <rect
                    x="-0.26"
                    y="-0.055"
                    width="0.52"
                    height="0.11"
                    rx="0.055"
                    fill="#180e09"
                    stroke="#d97706"
                    strokeWidth="0.009"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="0.022"
                    textAnchor="middle"
                    fill={isStation7ActiveInPhase3 ? "#38bdf8" : "#fef08a"}
                    fontSize="0.050"
                    fontWeight="bold"
                    fontFamily="Cinzel, serif"
                    letterSpacing="0.05em"
                  >
                    {isStation7ActiveInPhase3 ? "PICK 1 OF 6" : "PANTRY"}
                  </text>
                </g>
              )}
            </g>

            {/* 5. THE 6 DEDICATED PANTRY SPACES INSIDE THE CENTRAL CIRCLE (R = 0.90") */}
            {sectorSlots.map((slotNum) => {
              const def = ROTARY_SLOT_DEFS[slotNum];
              const pSlot = polarToCartesian(0.90, def.vectorDeg);
              const isHovered = hoveredSlot === 70 + slotNum;
              const isPantryTarget = isStation7ActiveInPhase3 && !activePlayer.isAI;
              const pantryOccupant = rotary.pantryOccupants?.[def.ingredient] ||
                (rotary.centerSpaceOccupant?.chosenIngredient === def.ingredient ? rotary.centerSpaceOccupant : null);
              const hasPantryMeepleHere = Boolean(pantryOccupant);

              return (
                <g
                  key={`pantry-subslot-${slotNum}`}
                  transform={`translate(${pSlot.x}, ${pSlot.y})`}
                  className={isPantryTarget ? 'cursor-pointer group' : undefined}
                  onClick={() => {
                    if (isPantryTarget && onPerformCenterPantryAction) {
                      onPerformCenterPantryAction(def.ingredient);
                    }
                  }}
                  onMouseEnter={() => isPantryTarget && setHoveredSlot((70 + slotNum) as any)}
                  onMouseLeave={() => isPantryTarget && setHoveredSlot(null)}
                >
                  {/* Circular Socket Detent */}
                  <circle
                    cx="0"
                    cy="0"
                    r="0.26"
                    fill={
                      hasPantryMeepleHere
                        ? 'rgba(24, 12, 6, 0.95)'
                        : isPantryTarget
                        ? (isHovered ? 'rgba(56, 189, 248, 0.35)' : 'rgba(245, 158, 11, 0.22)')
                        : 'rgba(18, 14, 11, 0.82)'
                    }
                    stroke={
                      hasPantryMeepleHere
                        ? '#e5b85c'
                        : isPantryTarget
                        ? (isHovered ? '#38bdf8' : '#f59e0b')
                        : 'rgba(217, 119, 6, 0.50)'
                    }
                    strokeWidth={hasPantryMeepleHere ? '0.025' : isPantryTarget ? (isHovered ? '0.035' : '0.025') : '0.018'}
                    strokeDasharray={!hasPantryMeepleHere && isPantryTarget ? '0.05, 0.03' : undefined}
                    filter="url(#detentDrop)"
                  />

                  {/* Concentric Accent Ring */}
                  <circle
                    cx="0"
                    cy="0"
                    r="0.22"
                    fill="none"
                    stroke={hasPantryMeepleHere ? (pantryOccupant?.playerColor || def.accent) : def.accent}
                    strokeWidth="0.010"
                    opacity={0.7}
                  />

                  {/* Tactile Wooden Token Icon (Always clearly visible in all 6 pantry positions) */}
                  <g transform="translate(0, -0.01)">
                    <WoodenTokenPieceSVG type={def.ingredient} x={0} y={0} size={0.24} />
                  </g>

                  {/* Meeple resting on this interior location */}
                  {hasPantryMeepleHere && (
                    <g>
                      <BrewerMeepleInDial
                        x={0}
                        y={0}
                        color={pantryOccupant?.playerColor || '#f59e0b'}
                        sizeInInches={0.48}
                      />
                      {/* Name label pill */}
                      <g transform="translate(0, 0.22)" className="pointer-events-none">
                        <rect
                          x="-0.26"
                          y="-0.045"
                          width="0.52"
                          height="0.09"
                          rx="0.045"
                          fill="rgba(18, 14, 11, 0.92)"
                          stroke="#e5b85c"
                          strokeWidth="0.008"
                        />
                        <text
                          x="0"
                          y="0.02"
                          textAnchor="middle"
                          fill="#fef08a"
                          fontSize="0.038"
                          fontWeight="bold"
                          fontFamily="Cinzel, serif"
                        >
                          {pantryOccupant?.playerName}
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Hover Draft Prompt when Station 7 is active */}
                  {isPantryTarget && (
                    <g transform="translate(0, 0.34)" className="pointer-events-none">
                      <rect
                        x={hasPantryMeepleHere && isHovered ? "-0.46" : "-0.32"}
                        y="-0.07"
                        width={hasPantryMeepleHere && isHovered ? "0.92" : "0.64"}
                        height="0.14"
                        rx="0.07"
                        fill="rgba(14, 10, 8, 0.95)"
                        stroke={isHovered ? '#38bdf8' : '#f59e0b'}
                        strokeWidth="0.012"
                      />
                      <text
                        x="0"
                        y="0.025"
                        textAnchor="middle"
                        fill={isHovered ? '#38bdf8' : '#fef08a'}
                        fontSize="0.050"
                        fontWeight="900"
                        fontFamily="Cinzel, serif"
                      >
                        {`+1 ${def.name.toUpperCase()}`}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* 6. INGREDIENT HOPPER TOKENS & COMMITTED MEEPLES (R = 2.100" in inner hopper bay) */}
            {sectorSlots.map((slotNum) => {
              const def = ROTARY_SLOT_DEFS[slotNum];
              const slotState = rotary.slots[slotNum];
              const pContent = polarToCartesian(1.700, def.vectorDeg);
              const pMeeple = polarToCartesian(2.400, def.vectorDeg);
              const isPantryTarget = isStation7ActiveInPhase3 && !activePlayer.isAI;
              const isHovered = hoveredSlot === slotNum;

              return (
                <g key={`hopper-content-${slotNum}`}>
                  {/* Subtle Translucent Dark Backplate Pill */}
                  <g
                    transform={`translate(${pContent.x}, ${pContent.y})`}
                    className={isPantryTarget ? 'cursor-pointer group' : 'pointer-events-none'}
                    onClick={() => {
                      if (isPantryTarget && onPerformCenterPantryAction) {
                        onPerformCenterPantryAction(def.ingredient);
                      }
                    }}
                    onMouseEnter={() => isPantryTarget && setHoveredSlot(slotNum)}
                    onMouseLeave={() => isPantryTarget && setHoveredSlot(null)}
                  >
                    <rect
                      x="-0.56"
                      y="-0.26"
                      width="1.12"
                      height="0.52"
                      rx="0.14"
                      fill={isPantryTarget ? (isHovered ? 'rgba(28, 16, 10, 0.95)' : 'rgba(20, 12, 8, 0.92)') : 'rgba(14, 11, 9, 0.90)'}
                      stroke={isPantryTarget ? (isHovered ? '#38bdf8' : '#f59e0b') : def.accent}
                      strokeWidth={isPantryTarget ? '0.025' : '0.018'}
                      strokeDasharray={isPantryTarget ? '0.06, 0.03' : undefined}
                      filter="url(#detentDrop)"
                    />
                    {/* Tactile Wooden Tokens in Hopper (Authentic Custom Carved Pieces) */}
                    <g transform="translate(0, -0.06)">
                      {def.tokenYield === 1 ? (
                        <WoodenTokenPieceSVG type={def.ingredient} x={0} y={0} size={0.30} />
                      ) : (
                        <g>
                          <WoodenTokenPieceSVG type={def.ingredient} x={-0.16} y={0} size={0.26} />
                          <WoodenTokenPieceSVG type={def.ingredient} x={0.16} y={0} size={0.26} />
                        </g>
                      )}
                    </g>
                    <text
                      x="0"
                      y="0.17"
                      textAnchor="middle"
                      fill="#fef3c7"
                      fontSize="0.085"
                      fontWeight="900"
                      fontFamily="Cinzel, serif"
                      letterSpacing="0.02"
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.95))' }}
                    >
                      {isPantryTarget ? `TAKE +1 ${def.name.toUpperCase()}` : `${def.name.toUpperCase()} • +${def.tokenYield}`}
                    </text>
                  </g>

                  {/* Committed Worker Meeple in Inner Hopper (Station 1-6 worker) */}
                  {slotState?.inwardOccupant && (
                    <g
                      transform={`translate(${pMeeple.x}, ${pMeeple.y})`}
                      className="pointer-events-none drop-shadow-2xl"
                    >
                      <circle
                        cx="0"
                        cy="0"
                        r="0.48"
                        fill="rgba(20, 10, 5, 0.95)"
                        stroke="#f59e0b"
                        strokeWidth="0.03"
                        filter="url(#detentDrop)"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="0.42"
                        fill="none"
                        stroke={slotState.inwardOccupant.playerColor}
                        strokeWidth="0.02"
                        strokeDasharray="0.08, 0.05"
                      />
                      <BrewerMeepleInDial
                        x={0}
                        y={0}
                        color={slotState.inwardOccupant.playerColor}
                        sizeInInches={0.82}
                      />
                    </g>
                  )}
                </g>
              );
            })}

            {/* 7. CATWALK DETENT SOCKETS (CLEAN SINGLE NUMBERED PORTHOLES 1-6 — REDUNDANT ARROWS REMOVED) */}
            {sectorSlots.map((slotNum) => {
              const slotState = rotary.slots[slotNum];
              if (!slotState) return null;

              // Centerline of the Catwalk Grating in artwork (R = 3.975", aligning exactly with the printed bronze portholes)
              const EXACT_CATWALK_PORTS: Record<RotarySlotNumber, { x: number; y: number }> = {
                1: { x: 0.090, y: -4.191 }, // Button 1 disc center (522, 48)
                2: { x: 3.658, y: -2.186 }, // Button 2 disc center (917, 270)
                3: { x: 3.713, y: 1.969 },  // Button 3 disc center (923, 730)
                4: { x: -0.126, y: 4.173 }, // Button 4 disc center (498, 974)
                5: { x: -3.839, y: 1.861 }, // Button 5 disc center (87, 718)
                6: { x: -3.586, y: -2.240 }, // Button 6 disc center (115, 264)
                7: { x: 0.000, y: 0.000 },  // Center Kettle Hub
              };

              const port = EXACT_CATWALK_PORTS[slotNum];

              const hasStandbyMeeple = Boolean(slotState.standbyOccupant || slotState.catwalkOccupant);
              const catwalkMeeple = slotState.catwalkOccupant || slotState.standbyOccupant;
              const isPortholeAvailable = gameState.phase === 'PHASE_2_CATWALK_PLACEMENT' &&
                !slotState.catwalkOccupant &&
                activePlayer.lastOccupiedStation !== slotNum;

              return (
                <g key={`catwalk-detents-${slotNum}`}>
                  {/* Dedicated Porthole on the Catwalk */}
                  <g
                    data-testid={`catwalk-porthole-${slotNum}`}
                    transform={`translate(${port.x}, ${port.y})`}
                    className="cursor-pointer"
                    onClick={() => isWorkDay && handleActionClick(slotNum, 'standby')}
                    onMouseEnter={() => {
                      setHoveredSlot(slotNum);
                      setHoveredAction('standby');
                    }}
                    onMouseLeave={() => {
                      setHoveredSlot(null);
                      setHoveredAction(null);
                    }}
                  >
                    {/* Interactive Porthole Detent */}
                    <circle
                      cx="0"
                      cy="0"
                      r="0.450"
                      fill={hasStandbyMeeple ? 'rgba(45, 20, 8, 0.85)' : isPortholeAvailable ? 'rgba(56, 189, 248, 0.20)' : 'rgba(15, 12, 10, 0.40)'}
                      stroke={hasStandbyMeeple ? '#e5b85c' : isPortholeAvailable ? (hoveredSlot === slotNum ? '#38bdf8' : '#f59e0b') : (hoveredSlot === slotNum && hoveredAction === 'standby' ? '#f59e0b' : 'rgba(217, 119, 6, 0.45)')}
                      strokeWidth={isPortholeAvailable ? "0.040" : "0.030"}
                      strokeDasharray={isPortholeAvailable ? "0.08, 0.04" : undefined}
                      filter="url(#detentDrop)"
                    />
                    {/* When occupied by Meeple, show Station Badge above meeple so station number stays readable */}
                    {hasStandbyMeeple && (
                      <text
                        x="0"
                        y="-0.26"
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="0.22"
                        fontWeight="900"
                        fontFamily="Cinzel, serif"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 0 6px rgba(234, 179, 8, 0.7))',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {slotNum}
                      </text>
                    )}
                    {hasStandbyMeeple && catwalkMeeple && (
                      <g>
                        {catwalkMeeple.playerId === activePlayer.id && isWorkDay && (
                          <circle
                            cx="0"
                            cy="0.08"
                            r="0.36"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="0.035"
                            strokeDasharray="0.08, 0.05"
                            opacity="0.95"
                          />
                        )}
                        <BrewerMeepleInDial
                          x={0}
                          y={0.08}
                          color={catwalkMeeple.playerColor}
                          sizeInInches={0.72}
                        />
                      </g>
                    )}
                  </g>
                </g>
              );
            })}

            {/* 8. CAD DIMENSION OVERLAY (TOGGLEABLE) */}
            {showCADOverlay && (
              <g className="pointer-events-none">
                <circle cx="0" cy="0" r="4.625" fill="none" stroke="#38bdf8" strokeWidth="0.015" strokeDasharray="0.1, 0.08" opacity="0.6" />
                <line x1="-4.625" y1="0" x2="-5.150" y2="0" stroke="#38bdf8" strokeWidth="0.015" />
                <text x="-6.40" y="-0.06" textAnchor="end" fill="#38bdf8" fontSize="0.14" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
                  &Oslash; 9.250&Prime; (234.95 mm)
                </text>
                <text x="-6.40" y="0.10" textAnchor="end" fill="#94a3b8" fontSize="0.10" fontFamily="JetBrains Mono, monospace">
                  Board Rim R=4.625&Prime;
                </text>

                <line x1="2.12" y1="-2.12" x2="4.00" y2="-4.00" stroke="#fbbf24" strokeWidth="0.015" />
                <circle cx="2.38" cy="-2.38" r="0.04" fill="#fbbf24" />
                <text x="4.10" y="-4.10" textAnchor="start" fill="#fbbf24" fontSize="0.13" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
                  Zone 2: Catwalk (0.750&Prime; Width)
                </text>
                <text x="4.10" y="-3.95" textAnchor="start" fill="#fef3c7" fontSize="0.10" fontFamily="JetBrains Mono, monospace">
                  R=3.000&Prime; &rarr; 3.750&Prime; (Midline R=3.375&Prime;)
                </text>
              </g>
            )}
          </svg>

          {/* =================================================================
              LAYER 2: 6 DOCKED CARDS (ACTUAL AUTHENTIC RecipeCardView & UpgradeCardView)
              - 100% authentic expanded card design (with tall Hoyne can & required ingredient pills)
              - Mounted at each of the 6 radial stations around the 11.500″ Rotary Dial
              - Tangentially aligned with carved outer wooden perimeter shelves
              ================================================================= */}
          {sectorSlots.map((slotNum) => {
            const def: RotarySlotDefinition = ROTARY_SLOT_DEFS[slotNum];
            const slotState = rotary.slots[slotNum];
            const card = slotState?.outerCard;
            const isUpgradeSlot = slotNum === 1 || slotNum === 2;

            // Center of card: Tangentially docked onto outer perimeter shelf (moved out so cards don't cover the catwalk)
            const cardRadiusPercent = 64.2;
            const pos = getHtmlCoords(cardRadiusPercent, def.angleDeg);

            if (!card) {
              return (
                <div
                  key={`docked-card-slot-${slotNum}`}
                  className="absolute z-10 transition-all duration-300 pointer-events-none"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: is1to1Scale ? '24.32%' : undefined,
                    transform: `translate(-50%, -50%) rotate(${def.angleDeg + 90}deg)`,
                  }}
                >
                  <div
                    className={`${
                      is1to1Scale
                        ? 'w-full'
                        : 'w-[135px] sm:w-[145px] lg:w-[155px] xl:w-[160px]'
                    } aspect-[9/14] rounded-xl sm:rounded-2xl relative border-2 ${
                      isUpgradeSlot
                        ? 'border-[#b8862d] bg-gradient-to-b from-[#221811] via-[#140e0a] to-[#0a0705] shadow-[inset_0_2px_8px_rgba(0,0,0,0.85),0_8px_20px_rgba(0,0,0,0.85)]'
                        : 'border-emerald-600/70 bg-gradient-to-b from-[#0e241b] via-[#081812] to-[#040e0a] shadow-[inset_0_2px_8px_rgba(0,0,0,0.85),0_8px_20px_rgba(0,0,0,0.85)]'
                    } flex flex-col items-center justify-between p-2.5 text-center drop-shadow-md select-none overflow-hidden`}
                  >
                    {/* Top Pill: Card Stack Identifier */}
                    <div
                      className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider shadow-md ${
                        isUpgradeSlot
                          ? 'bg-amber-950/90 border-amber-500/70 text-amber-300'
                          : 'bg-emerald-950/90 border-emerald-500/70 text-emerald-300'
                      }`}
                    >
                      {slotNum === 1
                        ? 'Equipment Stack'
                        : slotNum === 2
                        ? 'Staff Stack'
                        : 'Recipe Stack'}
                    </div>

                    {/* Committed Worker Meeple in Dead Center of Card Stack (Identical size to ingredient side, zero text) */}
                    {slotState?.outwardOccupant && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none drop-shadow-2xl">
                        <CommittedBrewerMeepleBadge
                          playerColor={slotState.outwardOccupant.playerColor}
                        />
                      </div>
                    )}

                    {/* Bottom Status Note */}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[9px] font-mono font-bold text-stone-300">
                        Card Drafted
                      </span>
                      <span className="text-[7.5px] font-mono text-stone-400">
                        Refills Next Shift
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            let canAfford = false;
            let affordReason: string | undefined;

            if (card.deckType === 'recipe') {
              const check = canAffordRecipeWithTokens(activePlayer, card);
              canAfford = check.canAfford;
              affordReason = check.reason;
            } else if (card.deckType === 'upgrade') {
              const check = canAffordUpgradeWithTokens(activePlayer, card);
              canAfford = check.canAfford;
              affordReason = check.reason;
            }

            const isCardHovered = hoveredSlot === slotNum;

            return (
              <div
                key={`docked-card-slot-${slotNum}`}
                data-station-slot={slotNum}
                className="absolute z-20 transition-all duration-300"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: is1to1Scale ? '24.32%' : undefined,
                  transform: `translate(-50%, -50%) rotate(${def.angleDeg + 90}deg)`,
                }}
                onMouseEnter={() => setHoveredSlot(slotNum)}
                onMouseLeave={() => setHoveredSlot(null)}
              >
                {/* 2.25" x 3.5" Standard Bridge Card Container (aspect 9/14) — 1:1 Scale relative to 11.5″ Dial */}
                <div
                  data-testid={`rotary-outer-card-${slotNum}`}
                  className={`${
                    is1to1Scale
                      ? 'w-full'
                      : 'w-[135px] sm:w-[145px] lg:w-[155px] xl:w-[160px]'
                  } aspect-[9/14] rounded-xl sm:rounded-2xl relative transition-transform duration-200 select-none drop-shadow-2xl ${
                    isCardHovered ? 'scale-105 z-30' : ''
                  }`}
                >
                  {/* Committed Worker Meeple on Outer Shelf Card (Identical size to ingredient side, zero text) */}
                  {slotState.outwardOccupant && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none drop-shadow-2xl">
                      <CommittedBrewerMeepleBadge
                        playerColor={slotState.outwardOccupant.playerColor}
                      />
                    </div>
                  )}
                  {card.deckType === 'recipe' ? (
                    <RecipeCardView
                      recipe={card as RecipeCard}
                      activePlayer={activePlayer}
                      canBrew={canAfford}
                      brewDisabledReason={affordReason}
                      onBrew={() => handleActionClick(slotNum, 'outward')}
                      isWorkDay={isWorkDay}
                      compact={is1to1Scale}
                      layoutVariant={cardLayout}
                    />
                  ) : (
                    <UpgradeCardView
                      upgrade={card as UpgradeCard}
                      activePlayer={activePlayer}
                      canInvest={canAfford}
                      investDisabledReason={affordReason}
                      onInvest={(chosenOption) => {
                        onPerformRotaryAction(slotNum, 'outward', chosenOption);
                      }}
                      isWorkDay={isWorkDay}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
