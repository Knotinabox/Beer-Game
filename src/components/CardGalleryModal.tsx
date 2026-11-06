import React, { useState, useEffect, useMemo } from 'react';
import { RecipeCard, UpgradeCard, RecipeTier } from '../engine/types';
import { createRecipeDeck, createEquipmentDeck, createStaffDeck } from '../engine/cards';
import { RecipeCardView, UpgradeCardView } from './CardComponents';
import { useCardInspector } from '../context/CardInspectorContext';
import {
  X,
  Beer,
  Wrench,
  Users,
  Search,
  Filter,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  Info,
  Printer,
} from 'lucide-react';
import { generateAndPrintPdf } from '../utils/pdfExport';

export interface CardGalleryModalProps {
  isOpen: boolean;
  initialTab?: 'recipes' | 'upgrades' | 'equipment' | 'staff';
  onOpenPdfExport?: (type?: 'all' | 'rules' | 'recipes' | 'upgrades') => void;
  onClose: () => void;
}

export const CardGalleryModal: React.FC<CardGalleryModalProps> = ({
  isOpen,
  initialTab = 'recipes',
  onOpenPdfExport,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'equipment' | 'staff'>(() => {
    if (initialTab === 'staff') return 'staff';
    if (initialTab === 'equipment' || initialTab === 'upgrades') return 'equipment';
    return 'recipes';
  });
  const [recipeTierFilter, setRecipeTierFilter] = useState<'all' | RecipeTier>('all');
  const [equipmentZoneFilter, setEquipmentZoneFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [staffZoneFilter, setStaffZoneFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { inspectedCard, inspectCard } = useCardInspector();

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      if (initialTab === 'staff') setActiveTab('staff');
      else if (initialTab === 'equipment' || initialTab === 'upgrades') setActiveTab('equipment');
      else setActiveTab('recipes');
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  // Close on Escape key press (only if not inspecting an individual card dossier)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !inspectedCard) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, inspectedCard]);

  // Master unique card datasets
  const { uniqueRecipes, equipmentCards, staffCards } = useMemo(() => {
    const allRecipes = createRecipeDeck();
    const recipeMap = new Map<string, RecipeCard>();
    for (const r of allRecipes) {
      if (!recipeMap.has(r.name)) {
        recipeMap.set(r.name, r);
      }
    }

    const equipmentCards = createEquipmentDeck();
    const staffCards = createStaffDeck();

    return {
      uniqueRecipes: Array.from(recipeMap.values()),
      equipmentCards,
      staffCards,
    };
  }, []);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return uniqueRecipes.filter((r) => {
      if (recipeTierFilter !== 'all' && r.tier !== recipeTierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.style.toLowerCase().includes(q) ||
          r.tierName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [uniqueRecipes, recipeTierFilter, searchQuery]);

  // Filtered equipment cards
  const filteredEquipment = useMemo(() => {
    return equipmentCards.filter((u) => {
      if (equipmentZoneFilter !== 'all' && u.targetZone !== equipmentZoneFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          (u.equipment?.name && u.equipment.name.toLowerCase().includes(q)) ||
          (u.equipment?.badge && u.equipment.badge.toLowerCase().includes(q)) ||
          (u.equipment?.effectText && u.equipment.effectText.toLowerCase().includes(q)) ||
          (u.flavorText && u.flavorText.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [equipmentCards, equipmentZoneFilter, searchQuery]);

  // Filtered staff cards
  const filteredStaff = useMemo(() => {
    return staffCards.filter((s) => {
      if (staffZoneFilter !== 'all' && s.targetZone !== staffZoneFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          (s.staff?.name && s.staff.name.toLowerCase().includes(q)) ||
          (s.staff?.badge && s.staff.badge.toLowerCase().includes(q)) ||
          (s.staff?.effectText && s.staff.effectText.toLowerCase().includes(q)) ||
          (s.flavorText && s.flavorText.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [staffCards, staffZoneFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[9000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] bg-stone-900 border-2 border-hoyne-copper/70 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-hoyne-cream"
        style={{
          backgroundImage: `
            radial-gradient(circle at top right, rgba(217, 119, 6, 0.10) 0%, transparent 60%),
            radial-gradient(circle at bottom left, rgba(147, 51, 234, 0.08) 0%, transparent 60%),
            linear-gradient(180deg, #1C1510 0%, #120D0A 100%)
          `,
        }}
      >
        {/* ===================================================================
            HEADER BAR & SEARCH
            =================================================================== */}
        <div className="px-5 py-3.5 border-b border-hoyne-copper/40 flex flex-wrap items-center justify-between gap-3 bg-stone-950/90">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
            <div>
              <h2 className="font-display font-black text-base sm:text-lg uppercase tracking-wider text-amber-200 flex items-center gap-2">
                House of Hoyne &bull; Card Compendium
              </h2>
              <p className="text-[11px] text-stone-400">
                Master archive of 16 recipe formulas (64 cards), 20 Hardware Equipment cards (Station #1), and 20 Brewery Staff cards (Station #2)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Make PDF Button */}
            <button
              type="button"
              onClick={() => onOpenPdfExport ? onOpenPdfExport(activeTab === 'recipes' ? 'recipes' : 'upgrades') : generateAndPrintPdf({ type: activeTab === 'recipes' ? 'recipes' : 'upgrades' })}
              className="px-2.5 py-1 text-xs rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              title={`Make a PDF of ${activeTab === 'recipes' ? 'Recipe Formulas' : activeTab === 'equipment' ? 'Equipment Deck' : 'Staff Deck'}`}
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Make PDF</span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 transition w-36 sm:w-48"
              />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-all border border-stone-600/50 cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===================================================================
            PRIMARY TABS (RECIPES VS EQUIPMENT VS STAFF)
            =================================================================== */}
        <div className="px-5 pt-3 pb-2 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-stone-950/50">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('recipes')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                activeTab === 'recipes'
                  ? 'bg-amber-500 text-stone-950 border border-amber-400 ring-2 ring-amber-500/30'
                  : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700'
              }`}
            >
              <Beer className="w-3.5 h-3.5" />
              <span>Recipe Deck ({uniqueRecipes.length} Formulas &bull; 64 Cards)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('equipment')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                activeTab === 'equipment'
                  ? 'bg-amber-500 text-stone-950 border border-amber-400 ring-2 ring-amber-500/30'
                  : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Equipment Deck ({equipmentCards.length} Hardware &bull; Station #1)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                activeTab === 'staff'
                  ? 'bg-amber-500 text-stone-950 border border-amber-400 ring-2 ring-amber-500/30'
                  : 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff Deck ({staffCards.length} Personnel &bull; Station #2)</span>
            </button>
          </div>

          {/* Sub-Filters */}
          {activeTab === 'recipes' ? (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-400" /> Tier:
              </span>
              {(['all', 6, 5, 4, 3] as const).map((tier) => (
                <button
                  key={`tier-filter-${tier}`}
                  type="button"
                  onClick={() => setRecipeTierFilter(tier)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    recipeTierFilter === tier
                      ? 'bg-amber-500/30 border border-amber-400 text-amber-200'
                      : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {tier === 'all'
                    ? 'All (16)'
                    : tier === 6
                    ? 'T6: Core (4)'
                    : tier === 5
                    ? 'T5: Pints (4)'
                    : tier === 4
                    ? 'T4: Heritage (4)'
                    : 'T3: Legends (4)'}
                </button>
              ))}
            </div>
          ) : activeTab === 'equipment' ? (
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-400" /> Zone:
              </span>
              {([
                { key: 'all' as const, label: `All (${equipmentCards.length})` },
                { key: 1 as const, label: `Z1 Warehouse (${equipmentCards.filter((c) => c.targetZone === 1).length})` },
                { key: 2 as const, label: `Z2 Brewhouse (${equipmentCards.filter((c) => c.targetZone === 2).length})` },
                { key: 3 as const, label: `Z3 Cellar (${equipmentCards.filter((c) => c.targetZone === 3).length})` },
                { key: 4 as const, label: `Z4 Cold Room (${equipmentCards.filter((c) => c.targetZone === 4).length})` },
                { key: 5 as const, label: `Z5 Packaging (${equipmentCards.filter((c) => c.targetZone === 5).length})` },
              ]).map((z) => (
                <button
                  key={`equip-zone-filter-${z.key}`}
                  type="button"
                  onClick={() => setEquipmentZoneFilter(z.key)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    equipmentZoneFilter === z.key
                      ? 'bg-amber-500/30 border border-amber-400 text-amber-200'
                      : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-400" /> Zone:
              </span>
              {([
                { key: 'all' as const, label: `All (${staffCards.length})` },
                { key: 1 as const, label: `Z1 Warehouse (${staffCards.filter((c) => c.targetZone === 1).length})` },
                { key: 2 as const, label: `Z2 Brewhouse (${staffCards.filter((c) => c.targetZone === 2).length})` },
                { key: 3 as const, label: `Z3 Cellar (${staffCards.filter((c) => c.targetZone === 3).length})` },
                { key: 4 as const, label: `Z4 Cold Room (${staffCards.filter((c) => c.targetZone === 4).length})` },
                { key: 5 as const, label: `Z5 Packaging (${staffCards.filter((c) => c.targetZone === 5).length})` },
              ]).map((z) => (
                <button
                  key={`staff-zone-filter-${z.key}`}
                  type="button"
                  onClick={() => setStaffZoneFilter(z.key)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    staffZoneFilter === z.key
                      ? 'bg-amber-500/30 border border-amber-400 text-amber-200'
                      : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===================================================================
            INFO CALLOUT BANNER
            =================================================================== */}
        <div className="px-5 py-2 bg-amber-950/40 border-b border-amber-900/30 flex items-center justify-between text-[11px] text-amber-200/90">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Click any card to inspect its full <strong>Tasting Dossier / Hardware Blueprint / Personnel File</strong>.
            </span>
          </span>
          <span className="font-mono text-stone-400 text-[10px]">
            {activeTab === 'recipes'
              ? `Showing ${filteredRecipes.length} of ${uniqueRecipes.length} recipes`
              : activeTab === 'equipment'
              ? `Showing ${filteredEquipment.length} of ${equipmentCards.length} equipment cards`
              : `Showing ${filteredStaff.length} of ${staffCards.length} staff cards`}
          </span>
        </div>

        {/* ===================================================================
            MAIN CARD GRID
            =================================================================== */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-stone-950/30">
          {activeTab === 'recipes' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRecipes.map((recipe) => {
                const copiesInDeck = 4;
                return (
                  <div
                    key={recipe.id}
                    className="flex flex-col items-center p-3 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-400/80 hover:bg-stone-850 transition-all group shadow-xl hover:shadow-amber-500/10"
                  >
                    {/* Card container */}
                    <div className="w-full max-w-[210px] aspect-[9/14] transition-transform duration-200 group-hover:scale-[1.03]">
                      <RecipeCardView
                        recipe={recipe}
                        layoutVariant="side-ledger"
                        disableInspectTrigger={false}
                      />
                    </div>

                    {/* Metadata Strip */}
                    <div className="w-full mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-300 font-bold">
                        Tier {recipe.tier} &bull; {recipe.vp} VP
                      </span>
                      <span className="text-stone-400">
                        {copiesInDeck}x Copies
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'equipment' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredEquipment.map((equipment) => {
                return (
                  <div
                    key={equipment.id}
                    className="flex flex-col items-center p-3 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-400/80 hover:bg-stone-850 transition-all group shadow-xl hover:shadow-amber-500/10"
                  >
                    {/* Card container */}
                    <div className="w-full max-w-[210px] aspect-[9/14] transition-transform duration-200 group-hover:scale-[1.03]">
                      <UpgradeCardView
                        upgrade={equipment}
                        disableInspectTrigger={false}
                      />
                    </div>

                    {/* Metadata Strip */}
                    <div className="w-full mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-amber-400" />
                        Zone {equipment.targetZone} &bull; Hardware
                      </span>
                      <span className="text-stone-400">
                        Station #1
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredStaff.map((staff) => {
                return (
                  <div
                    key={staff.id}
                    className="flex flex-col items-center p-3 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-400/80 hover:bg-stone-850 transition-all group shadow-xl hover:shadow-amber-500/10"
                  >
                    {/* Card container */}
                    <div className="w-full max-w-[210px] aspect-[9/14] transition-transform duration-200 group-hover:scale-[1.03]">
                      <UpgradeCardView
                        upgrade={staff}
                        disableInspectTrigger={false}
                      />
                    </div>

                    {/* Metadata Strip */}
                    <div className="w-full mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-400" />
                        Zone {staff.targetZone} &bull; Staff
                      </span>
                      <span className="text-stone-400">
                        Station #2
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================================================================
            FOOTER BAR
            =================================================================== */}
        <div className="px-5 py-2.5 bg-stone-950/95 border-t border-hoyne-copper/40 flex items-center justify-between text-xs text-stone-400">
          <span className="font-serif italic text-[11px]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-200 font-mono text-[10px] border border-stone-600">Esc</kbd> or click outside to return to tabletop
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition cursor-pointer text-xs"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
};
