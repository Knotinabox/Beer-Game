import React, { useState } from 'react';
import {
  X,
  Printer,
  Compass,
  Building2,
  Layers,
  Clock,
  Trophy,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  FlaskConical,
  Snowflake,
  Truck,
  Warehouse,
  Info,
  Package,
} from 'lucide-react';
import { RecipeCardView, UpgradeCardView } from './CardComponents';
import { RotaryBoard } from './RotaryBoard';
import { AssemblyLine } from './AssemblyLine';
import { createInitialGameState } from '../engine/gameEngine';
import { GameState, PlayerState } from '../engine/types';
import { createRecipeDeck, createEquipmentDeck, createStaffDeck } from '../engine/cards';

export interface VisualRulebookModalProps {
  isOpen: boolean;
  gameState?: GameState;
  activePlayer?: PlayerState;
  onClose: () => void;
  onOpenPdfExport?: () => void;
}

type RulebookTab = 'dial' | 'board' | 'cards' | 'flow' | 'scoring';

export const VisualRulebookModal: React.FC<VisualRulebookModalProps> = ({
  isOpen,
  gameState,
  activePlayer,
  onClose,
  onOpenPdfExport,
}) => {
  const displayGameState = gameState || createInitialGameState({ playerCount: 4 });
  const displayActivePlayer = activePlayer || displayGameState.players[0];
  const [activeTab, setActiveTab] = useState<RulebookTab>('dial');

  if (!isOpen) return null;

  // Sample cards for visual anatomy showcase
  const sampleRecipe = createRecipeDeck().find((r) => r.name.toLowerCase().includes('dark matter')) || createRecipeDeck()[0];
  const sampleEquipment = createEquipmentDeck().find((e) => e.cardKind === 'equipment') || createEquipmentDeck()[0];
  const sampleStaff = createStaffDeck().find((s) => s.cardKind === 'staff') || createStaffDeck()[0];

  return (
    <div
      role="dialog"
      aria-labelledby="rulebook-title"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl bg-[#140f0c] border-2 border-hoyne-copper/80 rounded-3xl shadow-2xl overflow-hidden text-hoyne-cream max-h-[92vh] flex flex-col">
        {/* TOP BAR */}
        <div className="px-5 py-3.5 border-b border-hoyne-copper/40 flex items-center justify-between bg-stone-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-black uppercase tracking-widest text-amber-400">
                  Visual Operations Manual &amp; Tabletop Guide
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/50 text-[9px] font-mono text-amber-300 font-bold">
                  9.25″ Rotary Dial
                </span>
              </div>
              <h2 id="rulebook-title" className="font-serif font-bold text-lg sm:text-2xl text-hoyne-cream">
                House of Hoyne: Brewhouse Operations
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPdfExport && (
              <button
                type="button"
                onClick={onOpenPdfExport}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Generate printable PDF Rulebook"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Make PDF</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-stone-800 bg-stone-950/60 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('dial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'dial'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/70 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Rotary Market &amp; Turn Order</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'board'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/70 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Brewery Board &amp; Pipeline</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'cards'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/70 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Card Anatomy &amp; Icons</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'flow'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/70 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>4. Turn Flow (Always / Possibly / Admin)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scoring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === 'scoring'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-400/70 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>5. Mixer Packs &amp; Scoring</span>
          </button>
        </div>

        {/* TAB BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-stone-300">
          {/* =========================================================================
              TAB 1: ROTARY MARKET & TURN ORDER
          ========================================================================= */}
          {activeTab === 'dial' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    The 9.25″ Rotary Brewhouse Dial &amp; Market Segregation
                  </h3>
                  <p className="text-stone-300 text-xs mt-1">
                    The centerpiece dial coordinates ingredient harvesting, exclusive catwalk worker placement, segregated card markets, and shift turn initiative.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950/80 border border-amber-500/50 shrink-0">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-400">Shift Initiative:</span>
                  <span className="text-xs font-bold text-amber-200 font-mono">Catwalk 1 ➔ 7</span>
                </div>
              </div>

              {/* Graphic Showcase: THE REAL ROTARY BOARD WITH SURROUNDING CARDS */}
              <div className="p-5 rounded-2xl bg-stone-950/90 border border-stone-800 space-y-6">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    The Complete Rotary Brewhouse Tabletop Board
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-amber-300 font-bold">• Station 1: Equipment</span>
                    <span className="text-emerald-300 font-bold">• Station 2: Staff</span>
                    <span className="text-cyan-300 font-bold">• Stations 3–6: Beer Recipes</span>
                  </div>
                </div>

                {/* Real Rotary Board Component */}
                <div className="w-full flex justify-center py-2 overflow-x-auto overflow-y-visible">
                  <div className="w-full max-w-[620px] pointer-events-none select-none">
                    <RotaryBoard
                      gameState={displayGameState}
                      activePlayer={displayActivePlayer}
                      isWorkDay={false}
                      onPerformRotaryAction={() => {}}
                      onPerformCenterPantryAction={() => {}}
                      onPerformEndOfShiftSlide={() => {}}
                    />
                  </div>
                </div>

                {/* 4 Concentric Rings Key (Sanctuary Callout Format) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-600/40 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-bold font-mono text-[10px] flex items-center justify-center border border-amber-400 shrink-0">
                        1
                      </div>
                      <div className="font-bold text-amber-300 text-xs">Inner Hoppers (1–6)</div>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-1 leading-snug">
                      6 ingredient token bays: <strong>Chocolate (+1)</strong>, <strong>Spices (+1)</strong>, <strong>Fruit (+1)</strong>, <strong>Yeast (+2)</strong>, <strong>Hops (+2)</strong>, <strong>Grain (+2)</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-cyan-600/40 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/30 text-cyan-300 font-bold font-mono text-[10px] flex items-center justify-center border border-cyan-400 shrink-0">
                        2
                      </div>
                      <div className="font-bold text-cyan-300 text-xs">Catwalks (1–7)</div>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-1 leading-snug">
                      Exclusive worker portholes. <strong>No bumping!</strong> Your catwalk number sets your exact turn initiative order (1 ➔ 7) in Phase 3.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-emerald-600/40 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold font-mono text-[10px] flex items-center justify-center border border-emerald-400 shrink-0">
                        3
                      </div>
                      <div className="font-bold text-emerald-300 text-xs">Perimeter Shelves</div>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-1 leading-snug">
                      Segregated cards around dial: <strong>#1 Equipment</strong> (top), <strong>#2 Staff</strong> (top right), and <strong>#3–6 Beer Recipes</strong> (perimeter).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-purple-600/40 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 font-bold font-mono text-[10px] flex items-center justify-center border border-purple-400 shrink-0">
                        4
                      </div>
                      <div className="font-bold text-purple-300 text-xs">Center Pantry (#7)</div>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-1 leading-snug">
                      Central wild pantry porthole. Harvest <strong>1 of ANY ingredient token</strong>. Always resolves <strong>last (#7)</strong> in shift turn order.
                    </p>
                  </div>
                </div>

                {/* Turn Order Flowchart Box */}
                <div className="p-4 rounded-xl bg-stone-900/80 border border-hoyne-copper/40 space-y-3">
                  <div className="font-display font-bold text-amber-200 text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    How Turn Order Works (Phase 2 &amp; Phase 3)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800 space-y-1">
                      <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">Step 1 • Placement</div>
                      <div className="font-bold text-white text-xs">Catwalk OR Private Dept</div>
                      <p className="text-[11px] text-stone-400">
                        In clockwise order, place your 1 Brewer Meeple on any open public Catwalk (1–7) OR on your personal Brewery Department (#1–#10). Mandatory Movement: cannot stay in the same place two shifts in a row.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-stone-950/70 border border-amber-600/50 space-y-1">
                      <div className="text-[10px] font-mono text-amber-300 font-bold uppercase">Step 2 • Resolution</div>
                      <div className="font-bold text-amber-200 text-xs">Two-Tier Turn Order</div>
                      <p className="text-[11px] text-stone-400">
                        Public Catwalks resolve first in <strong>1 ➔ 7 order</strong>. Then, players stationed at personal Brewery Departments resolve second in <strong>#1 ➔ #10 numerical order</strong>!
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-stone-950/70 border border-stone-800 space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Step 3 • Shift Slide</div>
                      <div className="font-bold text-white text-xs">Clockwise Conveyor Slide</div>
                      <p className="text-[11px] text-stone-400">
                        At the end of the shift, the inner dial rotates 2 positions clockwise, moving ingredient hoppers to new stations while outer card shelves remain aligned.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: BREWERY BOARD & 5-ZONE PIPELINE
          ========================================================================= */}
          {activeTab === 'board' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40">
                <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  The 5-Zone Brewery Assembly Line (Zero-Hand Engine)
                </h3>
                <p className="text-stone-300 text-xs mt-1">
                  You have no hand of cards! All recipe batches in production travel directly across your 5-column assembly line from left to right, maturing at each stage.
                </p>
              </div>

              {/* Mat Architecture Showcase: Live Real Assembly Line */}
              <div className="p-4 rounded-2xl bg-stone-950/90 border border-stone-800 space-y-4">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between border-b border-stone-800 pb-2">
                  <span>The Live Player Brewery Board (5 Operational Zones)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Conveyor Throughput: Left ➔ Right (1 ➔ 5)</span>
                </div>

                {/* Real Live Assembly Line Component */}
                <div className="w-full flex justify-center py-2 overflow-x-auto pointer-events-none select-none">
                  <div className="w-full min-w-[700px]">
                    <AssemblyLine
                      gameState={displayGameState}
                      inspectedPlayerIndex={0}
                      onSelectPlayerIndex={() => {}}
                      onPerformDiscardExcess={() => {}}
                    />
                  </div>
                </div>

                {/* Dedicated Personal Brewery Departments Feature Block */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border-2 border-amber-500/60 space-y-3 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/40 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center font-serif shadow">
                        #
                      </span>
                      <h4 className="font-serif font-black text-sm text-amber-200 tracking-wide uppercase">
                        Personal Brewery Department Cards (#1 – #10) • Docked Flush Left of Zone 1
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-[10px] font-mono text-emerald-300 font-bold">
                      Private Worker Action Bay
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    Each player is dealt 1 unique 2.25″ × 3.5″ Personal Department card docked flush to the left of their Zone 1 Warehouse.
                    This card provides an exclusive worker porthole numbered #1 to #10 that only you can visit, featuring unique strategic powers:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-[10px]">
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-amber-300">#1 The Night Shift</div>
                      <p className="text-stone-400">Full pipeline advance: all batches slide rightward (1➔2, 2➔3, 3➔4, 4➔5); Zone 5 scores immediately!</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-amber-300">#2 The Taproom</div>
                      <p className="text-stone-400">Direct-to-Consumer Draft: pour 1 beer from Zone 4 (Cold Room) straight to Trophy Rack (skip Zone 5)!</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-amber-300">#3 HR Office</div>
                      <p className="text-stone-400">Look at top 3 Staff cards, hire 1 into open slot, 2 to bottom.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-amber-300">#4 Maintenance Shop</div>
                      <p className="text-stone-400">Look at top 3 Equipment cards, install 1 into open slot, 2 to bottom.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-amber-300">#5 R&D Desk</div>
                      <p className="text-stone-400">Look at top 3 Recipes, brew 1 into Zone 1 with -1 Token Discount, 2 to bottom.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-emerald-300">#6 Grain Silo & Mill</div>
                      <p className="text-stone-400">Passive: +1 Grain Buffer. Action: Take 2 Grain tokens from hoppers.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-emerald-300">#7 Hop Cold Locker</div>
                      <p className="text-stone-400">Passive: +1 Hops Buffer. Action: Take 1 Hops + 1 Wild token from hoppers.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-amber-300">#8 Sourcing Desk</div>
                      <p className="text-stone-400">Take any 2 tokens from hoppers, but must be two DIFFERENT ingredient types.</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-amber-300">#9 Farm Swap</div>
                      <p className="text-stone-400">Barter: Return 1 token to hoppers ➔ Take any 2 tokens of your choice (Net +1).</p>
                    </div>
                    <div className="p-2 rounded-xl bg-black/60 border border-amber-900/60 space-y-0.5">
                      <div className="font-bold text-emerald-300">#10 Yeast Bank</div>
                      <p className="text-stone-400">Passive: +1 Yeast Buffer. Action: Take 1 Yeast token + optional 1-for-1 swap.</p>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-amber-400/90 pt-1 border-t border-amber-900/40 flex items-center justify-between">
                    <span>Mandatory Movement: Cannot visit your personal department two shifts in a row.</span>
                    <span>Two-Tier Initiative: Public Catwalks (1–7) resolve first; Departments (#1–#10) resolve second.</span>
                  </div>
                </div>

                {/* 5-Zone Visual Strips with Actual Zone Graphics */}
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-center font-bold text-xs">
                    ▲ TOP ROW: Dedicated Equipment Slots (Hardware Blueprints installed ON TOP of mat)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                    {/* Zone 1 */}
                    <div className="rounded-2xl border border-amber-700/50 overflow-hidden bg-stone-900 flex flex-col">
                      <div className="h-24 relative overflow-hidden">
                        <img src="/zones/zone-1-grain-warehouse.jpg" alt="Zone 1" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase">
                          <Warehouse className="w-3.5 h-3.5" />
                          <span>Zone 1: Warehouse</span>
                        </div>
                      </div>
                      <div className="p-2.5 text-[10px] text-stone-300 space-y-1">
                        <div className="font-bold text-white">Ingredient Silos</div>
                        <p className="text-stone-400 leading-snug">
                          Holds raw tokens in storage (max 8). New recipes begin planning here!
                        </p>
                      </div>
                    </div>

                    {/* Zone 2 */}
                    <div className="rounded-2xl border border-orange-700/50 overflow-hidden bg-stone-900 flex flex-col">
                      <div className="h-24 relative overflow-hidden">
                        <img src="/zones/zone-2-brewhouse.jpg" alt="Zone 2" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-orange-300 font-bold text-xs uppercase">
                          <Flame className="w-3.5 h-3.5" />
                          <span>Zone 2: Brewhouse</span>
                        </div>
                      </div>
                      <div className="p-2.5 text-[10px] text-stone-300 space-y-1">
                        <div className="font-bold text-white">Boiling Wort Kettle</div>
                        <p className="text-stone-400 leading-snug">
                          Mash tun &amp; brew kettle boiling active wort. Mash tenders recover spent tokens.
                        </p>
                      </div>
                    </div>

                    {/* Zone 3 */}
                    <div className="rounded-2xl border border-cyan-700/50 overflow-hidden bg-stone-900 flex flex-col">
                      <div className="h-24 relative overflow-hidden">
                        <img src="/zones/zone-3-cellar.jpg" alt="Zone 3" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-cyan-300 font-bold text-xs uppercase">
                          <FlaskConical className="w-3.5 h-3.5" />
                          <span>Zone 3: Cellar</span>
                        </div>
                      </div>
                      <div className="p-2.5 text-[10px] text-stone-300 space-y-1">
                        <div className="font-bold text-white">Fermentation Unitanks</div>
                        <p className="text-stone-400 leading-snug">
                          Jacketed fermenters. Yeast converts sugars into rich craft alcohol.
                        </p>
                      </div>
                    </div>

                    {/* Zone 4 */}
                    <div className="rounded-2xl border border-blue-700/50 overflow-hidden bg-stone-900 flex flex-col">
                      <div className="h-24 relative overflow-hidden">
                        <img src="/zones/zone-4-conditioning.jpg" alt="Zone 4" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-blue-300 font-bold text-xs uppercase">
                          <Snowflake className="w-3.5 h-3.5" />
                          <span>Zone 4: Cold Room</span>
                        </div>
                      </div>
                      <div className="p-2.5 text-[10px] text-stone-300 space-y-1">
                        <div className="font-bold text-white">Lagering Tanks</div>
                        <p className="text-stone-400 leading-snug">
                          Cold conditioning maturation tanks. Delicate lagers achieve peak clarity.
                        </p>
                      </div>
                    </div>

                    {/* Zone 5 */}
                    <div className="rounded-2xl border border-emerald-700/50 overflow-hidden bg-stone-900 flex flex-col">
                      <div className="h-24 relative overflow-hidden">
                        <img src="/zones/zone-5-dock.jpg" alt="Zone 5" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-emerald-300 font-bold text-xs uppercase">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Zone 5: Packaging</span>
                        </div>
                      </div>
                      <div className="p-2.5 text-[10px] text-stone-300 space-y-1">
                        <div className="font-bold text-white">Canning Line &amp; Dock</div>
                        <p className="text-stone-400 leading-snug">
                          Finished beer packaged for delivery. Scores VP and triggers endgame!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-600/40 text-emerald-200 text-center font-bold text-xs">
                    ▼ BOTTOM ROW: Dedicated Staff Slots (Personnel tucked UNDERNEATH mat)
                  </div>
                </div>

                {/* Strict Placement Rules Callout */}
                <div className="p-3.5 rounded-xl bg-stone-900 border border-amber-600/40 space-y-1.5">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Strict Placement Rules: Equipment vs. Staff
                  </div>
                  <ul className="space-y-1 text-stone-300 text-[11px] list-disc list-inside">
                    <li>
                      <strong className="text-amber-200">Hardware (Equipment)</strong>: Only installs in its matching zone's <strong>Top Equipment Slot</strong>. Max 1 Equipment per zone.
                    </li>
                    <li>
                      <strong className="text-emerald-200">Personnel (Staff)</strong>: Only installs in its matching zone's <strong>Bottom Staff Slot</strong>. Max 1 Staff per zone.
                    </li>
                    <li>
                      <strong>Neither Human nor AI</strong> may place cards in arbitrary slots or switch equipment with staff.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: CARD ANATOMY & ICON LEGEND
          ========================================================================= */}
          {activeTab === 'cards' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40">
                <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Component Anatomy &amp; Icon Glossary
                </h3>
                <p className="text-stone-300 text-xs mt-1">
                  Understanding the visual indicators on Beer Recipe cans, Equipment blueprints, Staff personnel, and Wooden Tokens.
                </p>
              </div>

              {/* Anatomy Cards with Actual Rendered Card Previews */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Recipe Card Anatomy */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2">
                    <div className="font-bold text-amber-300 text-xs uppercase tracking-wider">
                      Beer Recipe Card
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-200 font-bold border border-amber-600/40">
                      57 Cards
                    </span>
                  </div>

                  {/* Card Container Preview */}
                  <div className="w-44 py-2 flex justify-center">
                    <RecipeCardView recipe={sampleRecipe} disableInspectTrigger={true} />
                  </div>

                  <div className="w-full space-y-1.5 text-[11px]">
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-0.5">
                      <span className="font-bold text-white">① Can Artwork:</span>
                      <p className="text-stone-400">Authentic Hoyne Brewing can art and style color palette.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-0.5">
                      <span className="font-bold text-white">② Tier &amp; VP Banner:</span>
                      <p className="text-stone-400">Tier 1 Core (4 VP), Tier 2 Showstopper (5–7 VP), or Tier 3 Seasonal (7–8 VP).</p>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-0.5">
                      <span className="font-bold text-white">③ Token Cost Ribbons:</span>
                      <p className="text-stone-400">Ingredient tokens required to brew into Zone 1 Warehouse.</p>
                    </div>
                  </div>
                </div>

                {/* 2. Equipment Card Anatomy */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2">
                    <div className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                      Equipment Machinery
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-200 font-bold border border-amber-600/40">
                      20 Cards
                    </span>
                  </div>

                  {/* Card Container Preview */}
                  <div className="w-44 py-2 flex justify-center">
                    <UpgradeCardView upgrade={sampleEquipment} disableInspectTrigger={true} />
                  </div>

                  <div className="w-full space-y-1.5 text-[11px]">
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-0.5">
                      <span className="font-bold text-amber-300">① Top Mounting Tab:</span>
                      <p className="text-stone-400">Mounts exclusively in the top slot above its matching zone.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-0.5">
                      <span className="font-bold text-amber-300">② Department Badge:</span>
                      <p className="text-stone-400">Specifies matching Zone 1, 2, 3, 4, or 5.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-0.5">
                      <span className="font-bold text-amber-300">③ Passive Machine Perk:</span>
                      <p className="text-stone-400">Continuous ongoing ability (-1 brew cost, +storage, etc.).</p>
                    </div>
                  </div>
                </div>

                {/* 3. Staff Card Anatomy */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2">
                    <div className="font-bold text-emerald-400 text-xs uppercase tracking-wider">
                      Staff Personnel
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-200 font-bold border border-emerald-600/40">
                      20 Cards
                    </span>
                  </div>

                  {/* Card Container Preview */}
                  <div className="w-44 py-2 flex justify-center">
                    <UpgradeCardView upgrade={sampleStaff} disableInspectTrigger={true} />
                  </div>

                  <div className="w-full space-y-1.5 text-[11px]">
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-0.5">
                      <span className="font-bold text-emerald-300">① Bottom Tuck Tab:</span>
                      <p className="text-stone-400">Tucks exclusively under the bottom slot below its matching zone.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-0.5">
                      <span className="font-bold text-emerald-300">② Job Title &amp; Department:</span>
                      <p className="text-stone-400">Floor workers: Kettle Operator, Head Cellarman, etc.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-0.5">
                      <span className="font-bold text-emerald-300">③ Labor Ability:</span>
                      <p className="text-stone-400">Active spent-ingredient recovery and delivery bonuses.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wooden Token Gallery with 3D Pieces */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tactile Wooden Ingredient Tokens (6 Taxonomies)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/30 text-center space-y-2 flex flex-col items-center">
                    <img src="/tokens/grain-wood-piece.png" alt="Grain" className="w-10 h-10 object-contain drop-shadow" />
                    <div>
                      <div className="font-bold text-amber-200 text-xs">Grain</div>
                      <div className="text-[10px] text-stone-400">Base malt • #6 (+2)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-emerald-500/30 text-center space-y-2 flex flex-col items-center">
                    <img src="/tokens/hops-wood-piece.png" alt="Hops" className="w-10 h-10 object-contain drop-shadow" />
                    <div>
                      <div className="font-bold text-emerald-200 text-xs">Hops</div>
                      <div className="text-[10px] text-stone-400">Bitter &amp; aroma • #5 (+2)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-stone-500/30 text-center space-y-2 flex flex-col items-center">
                    <img src="/tokens/yeast-wood-piece.png" alt="Yeast" className="w-10 h-10 object-contain drop-shadow" />
                    <div>
                      <div className="font-bold text-stone-200 text-xs">Yeast</div>
                      <div className="text-[10px] text-stone-400">Fermentation • #4 (+2)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-purple-500/30 text-center space-y-2 flex flex-col items-center">
                    <img src="/tokens/fruit-wood-piece.png" alt="Fruit" className="w-10 h-10 object-contain drop-shadow" />
                    <div>
                      <div className="font-bold text-purple-200 text-xs">Fruit</div>
                      <div className="text-[10px] text-stone-400">Raspberries • #3 (+1)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-orange-500/30 text-center space-y-2 flex flex-col items-center">
                    <img src="/tokens/spices-wood-piece.png" alt="Spices" className="w-10 h-10 object-contain drop-shadow" />
                    <div>
                      <div className="font-bold text-orange-200 text-xs">Spices</div>
                      <div className="text-[10px] text-stone-400">Winter aromatics • #2 (+1)</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-800/40 text-center space-y-2 flex flex-col items-center">
                    <img src="/tokens/chocolate-wood-piece.png" alt="Chocolate" className="w-10 h-10 object-contain drop-shadow" />
                    <div>
                      <div className="font-bold text-amber-300 text-xs">Chocolate</div>
                      <div className="text-[10px] text-stone-400">Roasted malts • #1 (+1)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: TURN FLOW (ALWAYS / POSSIBLY / ADMIN)
          ========================================================================= */}
          {activeTab === 'flow' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40">
                <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Turn Structure: The Tri-Color Framework
                </h3>
                <p className="text-stone-300 text-xs mt-1">
                  Like modern Eurogame masterpieces (Ark Nova / Sanctuary), every shift divides cleanly into mandatory steps, optional plays, and end-of-shift administration.
                </p>
              </div>

              {/* Tri-Color Action Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. GREEN: ALWAYS (Mandatory) */}
                <div className="p-4 rounded-2xl bg-stone-950 border-2 border-emerald-500/60 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-display font-black text-xs uppercase tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>1. ALWAYS (Mandatory)</span>
                  </div>

                  <div className="space-y-3 text-[11px] text-stone-300">
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-bold font-mono">1</span>
                        Place Brewer Meeple
                      </div>
                      <p className="text-stone-400">
                        In clockwise order, place your 1 Brewer Meeple on an open public Catwalk (1–7) OR on your personal Brewery Department (#1–#10). Mandatory Movement: cannot stay in the same place two shifts in a row.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-bold font-mono">2</span>
                        Two-Tier Turn Resolution
                      </div>
                      <p className="text-stone-400">
                        <strong>Tier 1</strong>: Catwalks resolve first in <strong>1 ➔ 7 order</strong> (Option A: Take Hopper tokens; Option B: Draft Outer Shelf card; Option C: Pantry Wild token).
                        <br /><strong>Tier 2</strong>: Personal Departments resolve second in <strong>#1 ➔ #10 order</strong> (execute unique department shift action!).
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. BLUE: POSSIBLY (Optional Plays) */}
                <div className="p-4 rounded-2xl bg-stone-950 border-2 border-cyan-500/60 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-display font-black text-xs uppercase tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-cyan-500" />
                    <span>2. POSSIBLY (Optional)</span>
                  </div>

                  <div className="space-y-2 text-[11px] text-stone-300">
                    <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
                      <div className="font-bold text-cyan-200">• Brew a Craft Recipe</div>
                      <p className="text-stone-400">
                        Spend matching wooden tokens from your warehouse to place a drafted recipe into Zone 1 Warehouse.
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
                      <div className="font-bold text-cyan-200">• Install Equipment</div>
                      <p className="text-stone-400">
                        Spend tokens to install machinery into its matching zone's top slot (max 1 per zone).
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
                      <div className="font-bold text-cyan-200">• Hire Staff Personnel</div>
                      <p className="text-stone-400">
                        Spend tokens to tuck personnel under their matching zone's bottom slot (max 1 per zone).
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
                      <div className="font-bold text-cyan-200">• Claim a Mixer Pack</div>
                      <p className="text-stone-400">
                        Claim bonus VP immediately if your delivered beers match an open public bounty.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. YELLOW: ADMINISTRATION (End of Shift) */}
                <div className="p-4 rounded-2xl bg-stone-950 border-2 border-amber-500/60 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-display font-black text-xs uppercase tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>3. ADMINISTRATION</span>
                  </div>

                  <div className="space-y-2 text-[11px] text-stone-300">
                    <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
                      <div className="font-bold text-amber-200">1. Pipeline Conveyor Advance</div>
                      <p className="text-stone-400">
                        Active batches advance 1 zone rightward: 4➔5, 3➔4, 2➔3, 1➔2.
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
                      <div className="font-bold text-amber-200">2. Warehouse Limit Check</div>
                      <p className="text-stone-400">
                        Discard excess raw tokens down to warehouse capacity (base 8).
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
                      <div className="font-bold text-amber-200">3. Dial Conveyor Shift</div>
                      <p className="text-stone-400">
                        The rotary dial shifts 2 steps clockwise, aligning hoppers to new stations.
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-0.5">
                      <div className="font-bold text-amber-200">4. Shelf Refill &amp; Endgame Check</div>
                      <p className="text-stone-400">
                        Refill empty cards. If any player reached their target batches in Zone 5, trigger the Final Shift!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 5: MIXER PACKS & SCORING
          ========================================================================= */}
          {activeTab === 'scoring' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40">
                <h3 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Mixer Pack Bounties, Batch Targets &amp; Scoring
                </h3>
                <p className="text-stone-300 text-xs mt-1">
                  Delivering beer batches to Zone 5 Packaging earns direct Victory Points (VP). The first player to deliver their target batch count triggers Last Call!
                </p>
              </div>

              {/* Batch Targets Table */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Target Batches to Trigger Endgame by Player Count
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <div className="text-stone-400 text-[10px] uppercase font-mono">1 Player</div>
                    <div className="font-bold text-amber-200 text-base mt-0.5">8 Batches</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <div className="text-stone-400 text-[10px] uppercase font-mono">2 Players</div>
                    <div className="font-bold text-amber-200 text-base mt-0.5">8 Batches</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <div className="text-stone-400 text-[10px] uppercase font-mono">3 Players</div>
                    <div className="font-bold text-amber-200 text-base mt-0.5">8 Batches</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <div className="text-stone-400 text-[10px] uppercase font-mono">4 Players</div>
                    <div className="font-bold text-amber-200 text-base mt-0.5">7 Batches</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <div className="text-stone-400 text-[10px] uppercase font-mono">5 Players</div>
                    <div className="font-bold text-amber-200 text-base mt-0.5">6 Batches</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <div className="text-stone-400 text-[10px] uppercase font-mono">6 Players</div>
                    <div className="font-bold text-amber-200 text-base mt-0.5">5 Batches</div>
                  </div>
                </div>
              </div>

              {/* 4 Public Mixer Pack Bounties */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  The 4 Public Mixer Pack Bounties (First-to-Claim Race)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-600/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200 text-xs">In Good Time</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">4 VP</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Deliver 4 core easy-drinking session ales.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-600/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200 text-xs">Four Fine Friends</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">5 VP</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Deliver 4 signature flagship brews.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-600/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200 text-xs">Hello Sunshine</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">6 VP</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Deliver 4 refreshing wheat, fruit &amp; pilsner beers.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900 border border-amber-600/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200 text-xs">Hello Darkness</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">7 VP</span>
                    </div>
                    <p className="text-[11px] text-stone-400">Deliver 4 rich stouts, porters, and dark winter ales.</p>
                  </div>
                </div>
              </div>

              {/* Final Score Rubric */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/50 space-y-2">
                <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Final Prestige Victory Point (VP) Calculation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800">
                    <strong className="text-white">Delivered Beers:</strong>
                    <div className="text-stone-400 mt-0.5">VPs on all cans successfully delivered to Zone 5.</div>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800">
                    <strong className="text-white">Equipment Blueprints:</strong>
                    <div className="text-stone-400 mt-0.5">VPs printed on all hardware cards in your top slots.</div>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800">
                    <strong className="text-white">Staff Personnel:</strong>
                    <div className="text-stone-400 mt-0.5">VPs printed on all staff cards in your bottom slots.</div>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800">
                    <strong className="text-white">Mixer Pack Bounties:</strong>
                    <div className="text-stone-400 mt-0.5">Bonus VPs on any claimed public mixer packs.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-hoyne-copper/40 bg-stone-950/90 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-stone-400">
            Crafted for <strong className="text-amber-300">Hoyne Brewing Company</strong> • Victoria, BC Tabletop Edition
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-bold transition cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
