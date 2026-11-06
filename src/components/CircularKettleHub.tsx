import React, { useState } from 'react';
import {
  IngredientStationId,
  GameState,
  PlayerState,
} from '../engine/types';
import { INGREDIENT_STATION_METADATA } from '../engine/cards';
import { canPlaceWorkerAtStation } from '../engine/gameEngine';
import { IngredientCardView } from './CardComponents';
import { BrewerMeepleSVG } from './CenterMarket';
import { Lock, Disc, LayoutGrid, RotateCw, Waves, ShieldAlert } from 'lucide-react';

export interface CircularKettleHubProps {
  gameState: GameState;
  activePlayer: PlayerState;
  isWorkDay: boolean;
  onPerformWorkerSource: (stationId: IngredientStationId, draftCardIds?: string[]) => void;
  totalSourceDraws: number;
}

interface SectorCoord {
  id: IngredientStationId;
  leftPercent: number;
  topPercent: number;
  angleDeg: number;
  clockLabel: string;
}

// 6 Symmetrical Sectors rotated by 30° so each station sits inside its corresponding hopper wedge (radius R = 33%)
const SECTOR_COORDS: SectorCoord[] = [
  { id: 'grain', leftPercent: 66.5, topPercent: 21.5, angleDeg: 30, clockLabel: '1 o’clock • Grain Silo' },
  { id: 'hops', leftPercent: 83.0, topPercent: 50.0, angleDeg: 90, clockLabel: '3 o’clock • Hop Yard' },
  { id: 'yeast', leftPercent: 66.5, topPercent: 78.5, angleDeg: 150, clockLabel: '5 o’clock • Yeast Lab' },
  { id: 'chocolate', leftPercent: 33.5, topPercent: 78.5, angleDeg: 210, clockLabel: '7 o’clock • Roastery' },
  { id: 'spices', leftPercent: 17.0, topPercent: 50.0, angleDeg: 270, clockLabel: '9 o’clock • Spice Bins' },
  { id: 'fruit', leftPercent: 33.5, topPercent: 21.5, angleDeg: 330, clockLabel: '11 o’clock • Berry Patch' },
];

export const CircularKettleHub: React.FC<CircularKettleHubProps> = ({
  gameState,
  activePlayer,
  isWorkDay,
  onPerformWorkerSource,
  totalSourceDraws,
}) => {
  const [viewMode, setViewMode] = useState<'circular' | 'grid'>('circular');
  // Default to 'radial' so all cards are rotated to match the hoppers immediately
  const [cardOrientation, setCardOrientation] = useState<'radial' | 'wedge30' | 'upright'>('radial');
  const [hoveredStationId, setHoveredStationId] = useState<IngredientStationId | null>(null);

  const stationIds: IngredientStationId[] = [
    'grain',
    'hops',
    'yeast',
    'chocolate',
    'spices',
    'fruit',
  ];

  return (
    <div className="space-y-3">
      {/* Kettle Hub Subheader & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50" />
          <span className="font-display font-black text-xs uppercase tracking-wider text-amber-200">
            Industrial Brewhouse Kettle Hub • 6 Radial Hoppers &amp; Vortex
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Card Orientation Switcher */}
          {viewMode === 'circular' && (
            <div className="inline-flex rounded-xl p-0.5 bg-stone-950/80 border border-stone-800 shadow-inner">
              <button
                type="button"
                onClick={() => setCardOrientation('radial')}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-display font-bold uppercase tracking-wider transition-all ${
                  cardOrientation === 'radial'
                    ? 'bg-amber-700/80 text-amber-100 font-black shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Cards aligned radially with each hopper wedge (30°, 90°, 150°, 210°, 270°, 330°)"
              >
                Radial (Default)
              </button>
              <button
                type="button"
                onClick={() => setCardOrientation('wedge30')}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-display font-bold uppercase tracking-wider transition-all ${
                  cardOrientation === 'wedge30'
                    ? 'bg-amber-700/80 text-amber-100 font-black shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Cards tilted ±30° matching the hopper spoke angles while upright"
              >
                Wedge (±30°)
              </button>
              <button
                type="button"
                onClick={() => setCardOrientation('upright')}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-display font-bold uppercase tracking-wider transition-all ${
                  cardOrientation === 'upright'
                    ? 'bg-amber-700/80 text-amber-100 font-black shadow'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Upright cards (0° tilt) for clean vertical reading"
              >
                Upright (0°)
              </button>
            </div>
          )}

          {/* View Switcher Toggle */}
          <div className="inline-flex rounded-xl p-0.5 bg-stone-950/80 border border-stone-800 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('circular')}
              className={`px-3 py-1 rounded-lg text-[10px] font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === 'circular'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 shadow-md font-black'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Disc className="w-3 h-3" />
              <span>Circular Kettle</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-[10px] font-display font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-stone-950 shadow-md font-black'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Linear Grid</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'circular' ? (
        /* ===================================================================
           LITERAL CIRCULAR KETTLE HUB (TOP-DOWN 360° TABLETOP BOARD)
           =================================================================== */
        <div className="w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          {/* Outer Tabletop Circular Rim with Heavy Copper Cladding */}
          <div
            className="relative w-full max-w-[840px] aspect-square rounded-full border-[8px] border-[#A0652C] shadow-[0_0_80px_rgba(0,0,0,0.95),inset_0_0_60px_rgba(0,0,0,0.85)] overflow-hidden select-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #201712 0%, #150E09 60%, #080503 100%)',
            }}
          >
            {/* Photorealistic Kettle Hub Background Board Art */}
            <img
              src="./board/brewhouse-kettle-hub.jpg"
              alt="Inside of Industrial Brewing Kettle Board"
              className="absolute inset-0 w-full h-full object-cover opacity-75 mix-blend-luminosity filter contrast-125 pointer-events-none"
            />

            {/* Dark vignette to guarantee readability of cards and meeples */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,7,5,0.45)_0%,rgba(10,7,5,0.75)_65%,rgba(10,7,5,0.92)_100%)] pointer-events-none" />

            {/* Copper Rivet Ring Around Kettle Perimeter */}
            <div className="absolute inset-2 rounded-full border border-dashed border-[#D97706]/30 pointer-events-none" />
            <div className="absolute inset-4 rounded-full border border-[#B45309]/20 pointer-events-none" />

            {/* 6 Radial Symmetrical Divider Lines Radiating from Center */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
              <line x1="50%" y1="50%" x2="50%" y2="0%" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="93.3%" y2="25%" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="93.3%" y2="75%" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="50%" y2="100%" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="6.7%" y2="75%" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="6.7%" y2="25%" stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* ===============================================================
                DEAD CENTER: Recessed Liquid Vortex Core
                =============================================================== */}
            <div
              className="absolute z-20 w-[150px] h-[150px] rounded-full border-4 border-[#C87D32] shadow-[0_0_35px_rgba(0,0,0,0.95),inset_0_0_25px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center p-2 text-center select-none"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle at 50% 50%, #17100B 0%, #0E0906 65%, #050302 100%)',
              }}
            >
              {/* Spinning Turbine Blade SVG */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 animate-[spin_60s_linear_infinite]">
                <RotateCw className="w-24 h-24 text-[#F59E0B]" />
              </div>

              {/* Dead Center Core Label */}
              <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                <Waves className="w-4 h-4 text-amber-400 mb-0.5 animate-pulse" />
                <span className="font-display font-black text-[9px] uppercase tracking-widest text-amber-200 leading-none">
                  KETTLE VORTEX
                </span>
                <span className="text-[7.5px] font-mono text-stone-400 font-bold mt-0.5">
                  ROUND {gameState.roundNumber}
                </span>
              </div>

              {/* Bottom Recessed Straight Track Gauge */}
              <div className="absolute bottom-1 px-2 py-0.5 rounded-full bg-stone-950/90 border border-amber-900/60 text-[6px] font-mono font-bold text-amber-300 tracking-tight shadow">
                MEEPLE RECALL AT ROUND START
              </div>
            </div>

            {/* ===============================================================
                AREAS WRITTEN ON KETTLE HUB (6 RADIAL STATIONS & MEEPLE DOCKS)
                =============================================================== */}
            {SECTOR_COORDS.map((sector) => {
              const station = gameState.ingredientStations?.[sector.id];
              const meta = INGREDIENT_STATION_METADATA[sector.id];
              if (!station || !meta) return null;

              const check = canPlaceWorkerAtStation(gameState, activePlayer, sector.id);
              const isOccupied = Boolean(station.occupiedByPlayerId);
              const isOccupiedByMe = station.occupiedByPlayerId === activePlayer.id;
              const extraEquipment = Math.max(0, totalSourceDraws - 2);
              const stationDrawCount = meta.baseDrawCount + extraEquipment;
              const topCard = station.faceUpCards[0];
              const isHovered = hoveredStationId === sector.id;

              // Radius R = 17.5% from kettle center for Hub Area Plaques
              const rad = (sector.angleDeg - 90) * (Math.PI / 180);
              const hubX = 50 + 17.5 * Math.cos(rad);
              const hubY = 50 + 17.5 * Math.sin(rad);

              return (
                <div
                  key={`hub-area-${sector.id}`}
                  onMouseEnter={() => setHoveredStationId(sector.id)}
                  onMouseLeave={() => setHoveredStationId(null)}
                  className="absolute z-20 transition-all duration-200"
                  style={{
                    left: `${hubX}%`,
                    top: `${hubY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    onClick={() => {
                      if (isWorkDay && check.canPlace) {
                        onPerformWorkerSource(sector.id, topCard ? [topCard.id] : undefined);
                      }
                    }}
                    className={`rounded-xl px-2 py-1.5 flex flex-col items-center justify-center text-center border transition-all duration-200 shadow-xl backdrop-blur-md cursor-pointer min-w-[76px] max-w-[90px] ${
                      isOccupiedByMe
                        ? 'bg-emerald-950/95 border-emerald-500 shadow-emerald-500/20'
                        : isOccupied
                        ? 'bg-stone-950/90 border-stone-800 opacity-90'
                        : isHovered
                        ? 'bg-stone-900/95 border-amber-400 shadow-amber-500/40 scale-105'
                        : 'bg-stone-950/90 border-[#A0652C]/70 hover:border-amber-400 hover:bg-stone-900/90'
                    }`}
                  >
                    {/* Area Name Written Directly on Kettle Hub */}
                    <span className="font-display font-black text-[8.5px] uppercase tracking-wider text-amber-100 leading-tight truncate max-w-full">
                      {meta.name}
                    </span>

                    {/* Draw Rule Badge */}
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className="px-1 py-0.2 rounded text-[6.5px] font-mono font-black"
                        style={{ color: meta.color, backgroundColor: meta.badgeBg }}
                      >
                        {meta.baseDrawCount === 2 ? '⚡ DRAW 2' : '⭐ DRAW 1'}
                      </span>
                    </div>

                    {/* Circular Meeple Docking Socket */}
                    <div
                      className={`mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        isOccupied
                          ? 'border-amber-400 bg-stone-950 shadow-md'
                          : isWorkDay && check.canPlace
                          ? 'border-amber-400/80 bg-amber-950/40 hover:scale-110 hover:border-amber-300 hover:bg-amber-900/60 shadow-inner animate-pulse'
                          : 'border-stone-800 bg-stone-950/80 opacity-60'
                      }`}
                      style={{
                        backgroundColor: isOccupied && station.occupiedByPlayerColor ? `${station.occupiedByPlayerColor}35` : undefined,
                        borderColor: isOccupied && station.occupiedByPlayerColor ? station.occupiedByPlayerColor : undefined,
                      }}
                      title={
                        isOccupied
                          ? `Occupied by ${station.occupiedByPlayerName}`
                          : isWorkDay && check.canPlace
                          ? `Send Brewer Meeple to ${meta.name} (Draws ${stationDrawCount})`
                          : check.reason || meta.name
                      }
                    >
                      {isOccupied ? (
                        <BrewerMeepleSVG color={station.occupiedByPlayerColor || '#F59E0B'} size={16} />
                      ) : (
                        <BrewerMeepleSVG
                          color={isWorkDay && check.canPlace ? activePlayer.color : '#555'}
                          size={13}
                        />
                      )}
                    </div>

                    {/* Occupant Name or Deck Count */}
                    <span className="mt-0.5 text-[6.5px] font-mono font-bold text-stone-300 truncate max-w-[75px]">
                      {isOccupied ? station.occupiedByPlayerName : `${station.deck.length + station.faceUpCards.length} left`}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* ===============================================================
                THE 6 RADIAL INGREDIENT HOPPERS (CLEAN CARDS RESTING IN WEDGES)
                =============================================================== */}
            {SECTOR_COORDS.map((sector) => {
              const station = gameState.ingredientStations?.[sector.id];
              const meta = INGREDIENT_STATION_METADATA[sector.id];
              if (!station || !meta) return null;

              const check = canPlaceWorkerAtStation(gameState, activePlayer, sector.id);
              const isOccupied = Boolean(station.occupiedByPlayerId);
              const extraEquipment = Math.max(0, totalSourceDraws - 2);
              const stationDrawCount = meta.baseDrawCount + extraEquipment;
              const topCard = station.faceUpCards[0];
              const isHovered = hoveredStationId === sector.id;

              // Card rotation calculation
              const getCardRotation = () => {
                if (cardOrientation === 'radial') {
                  // Direct radial spoke rotation matching each sector angle:
                  // Grain: 30°, Hops: 90°, Yeast: 150°, Chocolate: 210°, Spices: 270°, Fruit: 330°
                  return `rotate(${sector.angleDeg}deg)`;
                }
                if (cardOrientation === 'wedge30') {
                  // Symmetrical ±30° tilt matching hopper wedges with upright text
                  switch (sector.id) {
                    case 'grain': return 'rotate(30deg)';
                    case 'fruit': return 'rotate(-30deg)';
                    case 'hops': return 'rotate(90deg)';
                    case 'spices': return 'rotate(-90deg)';
                    case 'yeast': return 'rotate(-30deg)';
                    case 'chocolate': return 'rotate(30deg)';
                    default: return 'rotate(0deg)';
                  }
                }
                return 'rotate(0deg)';
              };

              const cardRotation = getCardRotation();

              return (
                <div
                  key={`hopper-card-${sector.id}`}
                  onMouseEnter={() => setHoveredStationId(sector.id)}
                  onMouseLeave={() => setHoveredStationId(null)}
                  className="absolute z-10 transition-all duration-300"
                  style={{
                    left: `${sector.leftPercent}%`,
                    top: `${sector.topPercent}%`,
                    transform: `translate(-50%, -50%) ${cardRotation}`,
                  }}
                >
                  {/* Clean Physical Card Stack Resting on Wedge Grating */}
                  <div
                    onClick={() => {
                      if (isWorkDay && check.canPlace) {
                        onPerformWorkerSource(sector.id, topCard ? [topCard.id] : undefined);
                      }
                    }}
                    className={`relative group transition-all w-[122px] sm:w-[136px] ${
                      isWorkDay && check.canPlace ? 'cursor-pointer hover:scale-[1.03]' : ''
                    }`}
                    title={
                      isWorkDay && check.canPlace
                        ? `Click to collect ${topCard?.name || meta.name} (Draws ${stationDrawCount}) & send Brewer here`
                        : topCard?.name || meta.name
                    }
                  >
                    {/* 3D Physical Deck Layer 2 */}
                    {station.deck.length >= 2 && (
                      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl bg-[#120e0a] border border-amber-900/40 pointer-events-none shadow" />
                    )}
                    {/* 3D Physical Deck Layer 1 */}
                    {station.deck.length >= 1 && (
                      <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-xl bg-[#18130e] border border-amber-700/50 pointer-events-none shadow" />
                    )}

                    {topCard ? (
                      <div
                        className={`relative rounded-xl overflow-hidden transition-all duration-200 shadow-2xl ${
                          isHovered
                            ? 'ring-2 ring-amber-400 shadow-amber-500/30'
                            : isOccupied
                            ? 'opacity-85'
                            : ''
                        }`}
                      >
                        <IngredientCardView card={topCard} compact />

                        {/* Subtle Hopper Stock Counter in Corner */}
                        <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-stone-950/90 border border-stone-700 text-[6.5px] font-mono text-stone-300 shadow pointer-events-none">
                          {station.deck.length + station.faceUpCards.length} in hopper
                        </div>
                      </div>
                    ) : (
                      <div className="h-28 rounded-xl border-2 border-dashed border-stone-800 bg-stone-950/70 flex flex-col items-center justify-center p-2 text-stone-600 text-[9px] font-mono shadow-inner">
                        <Lock className="w-4 h-4 mb-1 text-stone-700" />
                        Hopper Depleted
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ===================================================================
           LINEAR GRID (ALTERNATIVE 6-COLUMN VIEW)
           =================================================================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {stationIds.map((sId) => {
            const station = gameState.ingredientStations?.[sId];
            const meta = INGREDIENT_STATION_METADATA[sId];
            if (!station || !meta) return null;

            const check = canPlaceWorkerAtStation(gameState, activePlayer, sId);
            const isOccupied = Boolean(station.occupiedByPlayerId);
            const isOccupiedByMe = station.occupiedByPlayerId === activePlayer.id;
            const extraEquipment = Math.max(0, totalSourceDraws - 2);
            const stationDrawCount = meta.baseDrawCount + extraEquipment;
            const topCard = station.faceUpCards[0];

            return (
              <div
                key={sId}
                className={`flex flex-col justify-between rounded-2xl p-2.5 transition-all relative border-2 shadow-xl ${
                  isOccupiedByMe
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-emerald-950/50'
                    : isOccupied
                    ? 'bg-stone-950/80 border-stone-800 opacity-90'
                    : 'bg-gradient-to-b from-stone-950/95 via-[#1a120c]/90 to-stone-950/95 border-amber-600/50 hover:border-amber-400'
                }`}
              >
                {/* Header */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider"
                      style={{
                        backgroundColor: meta.badgeBg,
                        borderColor: meta.badgeBorder,
                        color: meta.color,
                        borderWidth: '1px',
                      }}
                    >
                      [{meta.taxonomy.toUpperCase()}] • {meta.taxonomy === 'grain' || meta.taxonomy === 'hops' || meta.taxonomy === 'yeast' ? '1 VP' : '2 VP'}
                    </span>
                    <span
                      className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded border ${
                        meta.baseDrawCount === 2
                          ? 'bg-amber-950/90 text-amber-300 border-amber-600/70'
                          : 'bg-purple-950/90 text-purple-300 border-purple-600/70'
                      }`}
                    >
                      {meta.baseDrawCount === 2 ? '⚡ DRAWS 2' : '⭐ DRAWS 1'}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-sm text-amber-100 truncate" title={station.name}>
                    {station.name}
                  </h3>
                  <p className="text-[8px] font-mono text-stone-400 truncate" title={station.subtitle}>
                    {station.subtitle}
                  </p>
                </div>

                {/* Meeple Dock */}
                <div className="mb-2.5">
                  {isOccupied ? (
                    <div
                      className="w-full py-1.5 px-2 rounded-xl flex items-center justify-between gap-1.5 border shadow-inner"
                      style={{
                        backgroundColor: `${station.occupiedByPlayerColor || '#F59E0B'}18`,
                        borderColor: station.occupiedByPlayerColor || '#F59E0B',
                      }}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <BrewerMeepleSVG color={station.occupiedByPlayerColor || '#F59E0B'} size={20} />
                        <div className="min-w-0">
                          <div className="text-[8.5px] font-display font-extrabold text-stone-200 truncate">
                            {station.occupiedByPlayerName}
                          </div>
                          <div className="text-[7px] font-mono text-stone-400 flex items-center gap-0.5">
                            <Lock className="w-2 h-2 text-amber-400" />
                            <span>Locked Round {gameState.roundNumber}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[7.5px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-stone-950/80 border border-amber-500/40 text-amber-300 shrink-0">
                        Claimed
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!isWorkDay || !check.canPlace}
                      onClick={() => onPerformWorkerSource(sId, topCard ? [topCard.id] : undefined)}
                      title={check.reason || `Send Brewer Meeple to collect ${stationDrawCount} cards from ${station.name}`}
                      className={`w-full py-1.5 px-2 rounded-xl font-display font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow ${
                        isWorkDay && check.canPlace
                          ? 'copper-bevel-btn cursor-pointer animate-pulse'
                          : 'bg-stone-900 text-stone-500 border border-stone-800 cursor-not-allowed'
                      }`}
                    >
                      <BrewerMeepleSVG
                        color={isWorkDay && check.canPlace ? activePlayer.color : '#555'}
                        size={17}
                      />
                      <span>
                        {!isWorkDay
                          ? 'Wait Turn'
                          : !check.canPlace
                          ? 'Slot Blocked'
                          : `Send Brewer (Draw ${stationDrawCount})`}
                      </span>
                    </button>
                  )}
                </div>

                {/* Stack Top */}
                <div className="flex-1 flex flex-col justify-end">
                  <div className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-amber-300/80 px-0.5 mb-1.5 flex items-center justify-between">
                    <span>Stack Top ({station.deck.length + station.faceUpCards.length} left):</span>
                    <span className="text-stone-400">Click to Collect</span>
                  </div>

                  {topCard ? (
                    <div
                      onClick={() => {
                        if (isWorkDay && check.canPlace) {
                          onPerformWorkerSource(sId, [topCard.id]);
                        }
                      }}
                      className={`relative group transition-all ${
                        isWorkDay && check.canPlace
                          ? 'cursor-pointer hover:scale-[1.02]'
                          : ''
                      }`}
                      title={
                        isWorkDay && check.canPlace
                          ? `Click stack to draft ${topCard.name} (Draws ${stationDrawCount} cards) & send Brewer here`
                          : topCard.name
                      }
                    >
                      {station.deck.length >= 2 && (
                        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl bg-[#120e0a] border border-amber-900/40 pointer-events-none shadow-md" />
                      )}
                      {station.deck.length >= 1 && (
                        <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-xl bg-[#18130e] border border-amber-700/50 pointer-events-none shadow" />
                      )}
                      <div
                        className={`relative rounded-xl overflow-hidden ${
                          isWorkDay && check.canPlace
                            ? 'group-hover:ring-2 group-hover:ring-amber-400'
                            : ''
                        }`}
                      >
                        <IngredientCardView card={topCard} compact />
                        {isWorkDay && check.canPlace && (
                          <span className="absolute bottom-1 right-1 text-[7px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-emerald-950/95 text-emerald-300 border border-emerald-500 shadow pointer-events-none flex items-center gap-0.5">
                            <span>Draw {stationDrawCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl border-2 border-dashed border-stone-800 bg-stone-950/60 flex flex-col items-center justify-center text-center p-2 text-stone-600">
                      <span className="text-[10px] font-display font-bold">Stack Empty</span>
                      <span className="text-[8px] font-mono">Reshuffles on draw</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
