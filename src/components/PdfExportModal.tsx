import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  BookOpen,
  Beer,
  Wrench,
  Sparkles,
  Download,
  Sun,
  Moon,
} from 'lucide-react';
import { generateAndPrintPdf, PdfExportType, PdfTheme } from '../utils/pdfExport';

export interface PdfExportModalProps {
  isOpen: boolean;
  initialType?: PdfExportType;
  onClose: () => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  initialType = 'all',
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState<PdfExportType>(initialType);
  const [selectedTheme, setSelectedTheme] = useState<PdfTheme>('dark');

  if (!isOpen) return null;

  const handleExport = () => {
    generateAndPrintPdf({
      type: selectedType,
      theme: selectedTheme,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-stone-900 border-2 border-hoyne-copper/70 rounded-3xl shadow-2xl overflow-hidden text-hoyne-cream"
        style={{
          backgroundImage: `
            radial-gradient(circle at top right, rgba(217, 119, 6, 0.15) 0%, transparent 60%),
            linear-gradient(180deg, #1C1510 0%, #120D0A 100%)
          `,
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-hoyne-copper/40 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-black text-base uppercase tracking-wider text-amber-200 flex items-center gap-2">
                Make a PDF &bull; Printable Dossier
              </h2>
              <p className="text-[11px] text-stone-400">
                Generate high-resolution printable rulebooks and card catalogs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition border border-stone-600/50 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* 1. Scope Selection */}
          <div className="space-y-2">
            <label className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-300">
              Select Document Scope:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {/* Option 1: Complete Dossier */}
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedType === 'all'
                    ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-sm text-amber-100">
                      Complete Master Dossier
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Rulebook + 16 Recipes (57 cards) + 20 Equipment + 20 Staff (40 Upgrades)
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold">
                  Recommended
                </span>
              </button>

              {/* Option 2: Tabletop Rules Only */}
              <button
                type="button"
                onClick={() => setSelectedType('rules')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedType === 'rules'
                    ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-300">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-sm text-amber-100">
                      Tabletop Rulebook Only
                    </div>
                    <div className="text-[11px] text-stone-400">
                      3-Phase Shift Flow, Dial Station Specs &amp; Board Invariants
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 3: Recipe Cards Catalog */}
              <button
                type="button"
                onClick={() => setSelectedType('recipes')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedType === 'recipes'
                    ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                    <Beer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-sm text-amber-100">
                      Recipe Cards Compendium
                    </div>
                    <div className="text-[11px] text-stone-400">
                      16 Authentic Formulas with token costs, ABV, and tasting notes
                    </div>
                  </div>
                </div>
              </button>

              {/* Option 4: Upgrade Blueprints Catalog */}
              <button
                type="button"
                onClick={() => setSelectedType('upgrades')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  selectedType === 'upgrades'
                    ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-serif font-bold text-sm text-amber-100">
                      Equipment &amp; Staff Compendium
                    </div>
                    <div className="text-[11px] text-stone-400">
                      20 Hardware Cards (Station #1) &bull; 20 Staff Cards (Station #2)
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Theme Selection */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-300">
              Print Styling &amp; Ink Economy:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTheme('dark')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  selectedTheme === 'dark'
                    ? 'bg-amber-950/70 border-amber-400 text-amber-100'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Moon className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Craft Dark Edition</div>
                  <div className="text-[9.5px] text-stone-400">Rich tabletop aesthetic</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTheme('light')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                  selectedTheme === 'light'
                    ? 'bg-amber-950/70 border-amber-400 text-amber-100'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sun className="w-4 h-4 text-yellow-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold">Ink-Friendly Light</div>
                  <div className="text-[9.5px] text-stone-400">Clean white paper printing</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-hoyne-copper/40 bg-stone-950/90 flex items-center justify-between gap-3">
          <p className="text-[10.5px] text-stone-400">
            Tip: In the print dialog, choose <strong className="text-amber-300">Destination: Save as PDF</strong>.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-amber-900/40 cursor-pointer transition"
            >
              <Printer className="w-4 h-4" />
              <span>Generate &amp; Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
