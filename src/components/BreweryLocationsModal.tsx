import React, { useState } from 'react';
import {
  X,
  Building2,
  Warehouse,
  Flame,
  FlaskConical,
  Snowflake,
  Truck,
  ArrowRight,
  Sparkles,
  Trophy,
  PackageCheck,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ZoneId } from '../engine/types';

export interface BreweryLocationsModalProps {
  isOpen: boolean;
  initialLocationId?: ZoneId | null;
  onClose: () => void;
}

interface LocationDetail {
  zoneId: ZoneId;
  name: string;
  subtitle: string;
  operationVerb: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  tagColor: string;
  capacityText: string;
  summary: string;
  howItWorks: string[];
  keyUpgrades: { equipment: string; staff: string };
  shiftFlow: string;
}

const LOCATION_DETAILS: Record<ZoneId, LocationDetail> = {
  1: {
    zoneId: 1,
    name: 'Warehouse',
    subtitle: 'Starting Storage & 8-Token Limit',
    operationVerb: '1. DRAFT / SOURCE',
    icon: Warehouse,
    accentColor: '#F59E0B',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-500/60',
    tagColor: 'text-amber-300',
    capacityText: 'Standard: 8 Tokens • Upgrades expand dedicated detents',
    summary:
      'The starting storage space where your 8-token limit applies. Upgrades here expand storage capacity with dedicated detents outside the 8-token warehouse cap.',
    howItWorks: [
      'Take Inner Hopper actions at Catwalk Stations 1–6 or Pantry #7 to claim raw ingredient tokens into your warehouse.',
      'Draft Recipe cards from Outer Shelves #3–6 or Upgrade cards from Shelves #1–2 into your brewer hand.',
      'Mandatory storage limits apply at the end of every shift: discard down to 6 cards and 6 tokens unless expanded by silos.',
    ],
    keyUpgrades: {
      equipment: 'Malt Silos, High-Capacity Hopper, Cryo-Hop Storage (+2 to +3 token storage capacity)',
      staff: 'Maltsters, Sourcing Brokers (draft discounts and token harvest multipliers)',
    },
    shiftFlow:
      'Ingredients drafted here are spent in Zone 2 (Kettle) to brew craft beer recipes.',
  },
  2: {
    zoneId: 2,
    name: 'Brewhouse',
    subtitle: 'Mashing, Lautering & Wort Boiling',
    operationVerb: '2. BREW / COMMIT',
    icon: Flame,
    accentColor: '#EA580C',
    badgeBg: 'bg-orange-950/80',
    badgeBorder: 'border-orange-500/60',
    tagColor: 'text-orange-300',
    capacityText: 'Standard: 1 Active Boil (Expandable to 2 with Mash Tuns)',
    summary:
      'Where the magic begins. Copper mash tuns and kettles mix grain and boiling water to extract fermentable sugars, boiling hops for bitterness and aroma.',
    howItWorks: [
      'Choose Station Option B (OUT) at Recipe Stations #3–6 to spend required tokens and commit a recipe card to the boil.',
      'Alternatively, play a recipe directly from your hand into the kettle by paying matching ingredient tokens from your warehouse.',
      'During the Morning Shift conveyor slide, boiling wort advances into Zone 3 (Cellar) if cellar tank capacity is available.',
    ],
    keyUpgrades: {
      equipment: 'Copper Mash Tun (expands kettle capacity to 2), Spent Grain Collector (spent token refunds)',
      staff: 'Head Brewers, Mash Hustlers (reduces grain/hop brew costs)',
    },
    shiftFlow:
      'Advances to Zone 3 (Fermentation Cellar) during the next Morning Shift.',
  },
  3: {
    zoneId: 3,
    name: 'Cellar',
    subtitle: 'Primary Fermentation in Conical Unitanks',
    operationVerb: '3. CELLAR',
    icon: FlaskConical,
    accentColor: '#38BDF8',
    badgeBg: 'bg-sky-950/80',
    badgeBorder: 'border-sky-500/60',
    tagColor: 'text-sky-300',
    capacityText: 'Standard: 1 Active Unitank (Expandable to 2 with Conical Fermenters)',
    summary:
      'The cold steel cellar where active yeast metabolizes wort sugars into crisp alcohol and carbon dioxide, developing the unique flavor profile of each beer style.',
    howItWorks: [
      'Boiling wort slides from Zone 2 into Zone 3 during Phase 1 (The Morning Shift).',
      'Bottleneck Warning: If Zone 3 is already at full capacity when a new batch tries to slide in, the wort remains trapped in the kettle until cellar space opens up!',
      'In the subsequent Morning Shift, fermented beer automatically advances into Zone 4 (Conditioning).',
    ],
    keyUpgrades: {
      equipment: 'Conical Unitank (expands cellar capacity to 2 batches), Plate Heat Exchanger (cool down speed)',
      staff: 'Yeast Propagators, Cellar Hands (yeast recycling and attenuation bonuses)',
    },
    shiftFlow:
      'Advances to Zone 4 (Conditioning & Lagering) during the next Morning Shift.',
  },
  4: {
    zoneId: 4,
    name: 'Cold Room',
    subtitle: 'Cold Maturation & Clarification',
    operationVerb: '4. COLD ROOM',
    icon: Snowflake,
    accentColor: '#06B6D4',
    badgeBg: 'bg-cyan-950/80',
    badgeBorder: 'border-cyan-500/60',
    tagColor: 'text-cyan-300',
    capacityText: 'Capacity: 1 Maturation Tank',
    summary:
      'Horizontal lagering vessels and brite tanks hold cold beer near freezing temperature, dropping out sediment and perfecting carbonation and aroma before packaging.',
    howItWorks: [
      'Fermented beer slides from Zone 3 into Zone 4 during Phase 1 (The Morning Shift).',
      'This critical aging step ensures high clarity and authentic flavor development across all Hoyne beer styles.',
      'In the next Morning Shift, mature beer completes its tank cycle and advances into Zone 5 (Packaging & Dock)!',
    ],
    keyUpgrades: {
      equipment: 'Horizontal Lagering Tank, Oak Aging Foeder (prestige flavor conditioning bonuses)',
      staff: 'Cellar Masters, Brite Technicians (flavor stability and bonus score triggers)',
    },
    shiftFlow:
      'Advances to Zone 5 (Packaging & Dock) to score VP and trigger delivery bonuses!',
  },
  5: {
    zoneId: 5,
    name: 'Packaging',
    subtitle: 'Final Assembly Line & Scoring',
    operationVerb: '5. DELIVER / SCORE',
    icon: Truck,
    accentColor: '#10B981',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-500/60',
    tagColor: 'text-emerald-300',
    capacityText: 'Continuous Packaging Flow (Brews slide directly into Trophy Pile)',
    summary:
      'The high-speed canning line seams fresh cans into 4-packs and racks wooden kegs. Finished beer is dispatched for delivery, instantly scoring VP and locking into the endgame race!',
    howItWorks: [
      'Upon sliding into Zone 5 during the Morning Shift, the recipe immediately scores its full Base Prestige VP.',
      'Triggers all unique Recipe Completion Bonuses (e.g. +VP per tier, extra ingredient draws, style multipliers).',
      'The finished recipe card slides directly off the mat into your Brewed Recipe Pile (Trophy Pile), advancing you toward the endgame target batches!',
      'Check the 4 active Mixer Pack Bounties: completed brews in your trophy pile contribute to claiming bonus packs (+4 to +8 VP)!',
    ],
    keyUpgrades: {
      equipment: 'Rotary Canning Line (equipment discounts), Automated Keg Racker, Pallet Stretch Wrapper (retains spent tokens)',
      staff: 'Delivery Drivers, Logistics Coordinators (bonus shipping VP and endgame multipliers)',
    },
    shiftFlow:
      'Completed recipes tuck into the Brewed Recipe Pile (Trophy Pile) to permanently count toward your victory!',
  },
};

export const BreweryLocationsModal: React.FC<BreweryLocationsModalProps> = ({
  isOpen,
  initialLocationId = null,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ZoneId>(initialLocationId || 1);

  if (!isOpen) return null;

  const loc = LOCATION_DETAILS[activeTab];
  const IconComponent = loc.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-fade-in">
      <div
        className="stout-panel rounded-3xl max-w-3xl w-full border-2 border-amber-500 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(254, 240, 138, 0.25)',
        }}
      >
        {/* ===================================================================
            MODAL HEADER: Title, Badge & Close Button
        =================================================================== */}
        <div className="p-4 sm:p-5 border-b border-hoyne-copper/40 flex items-center justify-between gap-3 bg-gradient-to-r from-[#1C120A] via-[#140D07] to-[#0E0905]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shadow-inner">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-lg sm:text-xl text-amber-100 tracking-wide">
                  The 5 Brewery Locations
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Operations Guide
                </span>
              </div>
              <p className="text-xs text-hoyne-cream/75 font-sans mt-0.5">
                How beer flows through the 5 production zones of your brewery assembly line
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-400 text-stone-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ===================================================================
            LOCATION SELECTOR TABS (5 STATIONS)
        =================================================================== */}
        <div className="px-4 pt-3 pb-2 bg-[#120B07] border-b border-amber-900/40 grid grid-cols-5 gap-1.5 sm:gap-2">
          {([1, 2, 3, 4, 5] as ZoneId[]).map((zId) => {
            const tabMeta = LOCATION_DETAILS[zId];
            const TabIcon = tabMeta.icon;
            const isSelected = activeTab === zId;

            return (
              <button
                key={zId}
                type="button"
                onClick={() => setActiveTab(zId)}
                className={`py-2 px-1 sm:px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-102'
                    : 'bg-black/60 border-stone-800 hover:border-amber-600/60 hover:bg-black/80 opacity-75 hover:opacity-100'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shadow-inner"
                  style={{
                    backgroundColor: isSelected ? `${tabMeta.accentColor}30` : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <TabIcon
                    className="w-3.5 h-3.5"
                    style={{ color: isSelected ? tabMeta.accentColor : '#a8a29e' }}
                  />
                </div>
                <div className="text-[10px] sm:text-[11px] font-serif font-bold text-amber-100 truncate w-full leading-tight">
                  {zId}. {tabMeta.name.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* ===================================================================
            MAIN ACTIVE LOCATION CONTENT (Rich Details)
        =================================================================== */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-gradient-to-b from-[#160E08] to-[#0D0805]">
          {/* Header Card for Active Location */}
          <div
            className="rounded-2xl p-4 border shadow-xl flex flex-wrap items-center justify-between gap-3"
            style={{
              backgroundColor: '#19100A',
              borderColor: `${loc.accentColor}80`,
              boxShadow: `0 8px 24px ${loc.accentColor}15, inset 0 1px 0 rgba(254, 240, 138, 0.2)`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 border"
                style={{
                  backgroundColor: `${loc.accentColor}25`,
                  borderColor: `${loc.accentColor}60`,
                }}
              >
                <IconComponent className="w-6 h-6" style={{ color: loc.accentColor }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black uppercase tracking-wider text-amber-400">
                    Zone {loc.zoneId}
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: loc.accentColor }}>
                    {loc.operationVerb}
                  </span>
                </div>
                <h3 className="font-serif font-black text-xl text-white tracking-wide">
                  {loc.name}
                </h3>
                <p className="text-xs text-amber-200/80 font-sans mt-0.5">
                  {loc.subtitle}
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 text-xs font-mono font-bold text-amber-200 shadow-inner">
              {loc.capacityText}
            </div>
          </div>

          {/* Description & Core Mechanics */}
          <div className="rounded-2xl p-4 bg-black/50 border border-amber-900/40 space-y-3 shadow-inner">
            <h4 className="font-serif font-black text-sm text-amber-200 tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Location Function &amp; Shift Operations</span>
            </h4>
            <p className="text-xs text-stone-200 font-sans leading-relaxed">
              {loc.summary}
            </p>

            <div className="pt-2 border-t border-amber-900/40 space-y-2">
              <div className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                How It Operates:
              </div>
              <ul className="space-y-1.5 text-xs text-stone-300">
                {loc.howItWorks.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Upgrades & Conveyor Advance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Key Upgrades */}
            <div className="rounded-2xl p-3.5 bg-black/50 border border-amber-900/40 space-y-2 shadow-inner">
              <h4 className="font-serif font-black text-xs text-amber-300 tracking-wide uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Dedicated Upgrades</span>
              </h4>
              <div className="text-xs space-y-1.5 text-stone-300">
                <div>
                  <strong className="text-amber-200">Hardware (Top Edge):</strong>{' '}
                  <span className="text-stone-300">{loc.keyUpgrades.equipment}</span>
                </div>
                <div>
                  <strong className="text-amber-200">Staff (Bottom Edge):</strong>{' '}
                  <span className="text-stone-300">{loc.keyUpgrades.staff}</span>
                </div>
              </div>
            </div>

            {/* Conveyor Shift Flow */}
            <div className="rounded-2xl p-3.5 bg-black/50 border border-amber-900/40 space-y-2 shadow-inner">
              <h4 className="font-serif font-black text-xs text-amber-300 tracking-wide uppercase flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Conveyor Slide Direction</span>
              </h4>
              <p className="text-xs text-stone-300 font-sans leading-relaxed">
                {loc.shiftFlow}
              </p>
            </div>
          </div>

          {/* 5-Step Pipeline Flow Strip Overview */}
          <div className="rounded-2xl p-3 bg-gradient-to-r from-amber-950/40 via-black/60 to-emerald-950/40 border border-amber-500/30">
            <div className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider mb-2 text-center">
              The Connected 5-Zone Brewing Pipeline:
            </div>
            <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
              <span className={`px-2 py-1 rounded-lg border ${activeTab === 1 ? 'bg-amber-500 text-stone-950 font-black border-amber-300' : 'bg-black/60 text-amber-200 border-amber-900/50'}`}>
                1. Warehouse
              </span>
              <span className="text-amber-500 font-black">➔</span>
              <span className={`px-2 py-1 rounded-lg border ${activeTab === 2 ? 'bg-orange-500 text-stone-950 font-black border-orange-300' : 'bg-black/60 text-orange-200 border-orange-900/50'}`}>
                2. Brewhouse
              </span>
              <span className="text-orange-500 font-black">➔</span>
              <span className={`px-2 py-1 rounded-lg border ${activeTab === 3 ? 'bg-sky-500 text-stone-950 font-black border-sky-300' : 'bg-black/60 text-sky-200 border-sky-900/50'}`}>
                3. Cellar
              </span>
              <span className="text-sky-500 font-black">➔</span>
              <span className={`px-2 py-1 rounded-lg border ${activeTab === 4 ? 'bg-cyan-500 text-stone-950 font-black border-cyan-300' : 'bg-black/60 text-cyan-200 border-cyan-900/50'}`}>
                4. Cold Room
              </span>
              <span className="text-cyan-500 font-black">➔</span>
              <span className={`px-2 py-1 rounded-lg border ${activeTab === 5 ? 'bg-emerald-500 text-stone-950 font-black border-emerald-300' : 'bg-black/60 text-emerald-200 border-emerald-900/50'}`}>
                5. Packaging (Score VP)
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            MODAL FOOTER: Close Button
        =================================================================== */}
        <div className="p-3 sm:p-4 border-t border-hoyne-copper/30 bg-[#120B07] flex items-center justify-between">
          <span className="text-[11px] font-mono text-stone-400">
            Click any tab above or press Escape to close
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-hoyne-copper to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-sans font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
