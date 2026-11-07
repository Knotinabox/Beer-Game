import React, { useState } from 'react';
import {
  Globe,
  Share2,
  Check,
  Users,
  Beer,
  LogOut,
  Radio,
  Sparkles,
} from 'lucide-react';
import { multiplayerService, NetworkLobbyState } from '../engine/multiplayer';
import { GameState } from '../engine/types';

export interface OnlineHUDProps {
  lobby: NetworkLobbyState | null;
  gameState: GameState;
  onLeaveOnlineMatch: () => void;
}

export const OnlineHUD: React.FC<OnlineHUDProps> = ({
  lobby,
  gameState,
  onLeaveOnlineMatch,
}) => {
  const [copied, setCopied] = useState(false);
  const [cheersToast, setCheersToast] = useState<string | null>(null);

  if (!lobby) return null;

  const currentActivePlayer = gameState.players[gameState.currentPlayerIndex];
  const localPlayer = gameState.players[multiplayerService.localSlot] || gameState.players[0];
  const isMyTurn = gameState.currentPlayerIndex === multiplayerService.localSlot;

  const handleCopyInvite = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(lobby.roomCode)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendCheers = () => {
    multiplayerService.sendChat('Cheers! 🍻 Prost!');
    setCheersToast('You sent Cheers! 🍻');
    setTimeout(() => setCheersToast(null), 3000);
  };

  return (
    <div className="mb-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-[#20150D] via-[#160E08] to-[#20150D] border-2 border-amber-500/80 shadow-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs select-none">
      {/* Left: Online Room Tag & Player Identity */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 shadow-inner">
          <Globe className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-mono font-bold text-amber-300 tracking-wider">
            ROOM: {lobby.roomCode}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-xl border border-stone-700">
          <span
            className="w-2.5 h-2.5 rounded-full border border-white/60 shadow"
            style={{ backgroundColor: localPlayer?.color || '#f59e0b' }}
          />
          <span className="font-serif font-bold text-hoyne-cream">
            You: {localPlayer?.name || multiplayerService.localName} (Seat #{multiplayerService.localSlot + 1})
          </span>
          {multiplayerService.isHost && (
            <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-200 text-[9px] font-mono font-bold uppercase">
              Host
            </span>
          )}
        </div>
      </div>

      {/* Center: Live Turn Status Banner */}
      <div className="flex items-center gap-2">
        {isMyTurn ? (
          <div className="px-3 py-1 rounded-xl bg-amber-500 text-stone-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
            <span>Your Turn! Deploy Meeple or Take Action</span>
          </div>
        ) : (
          <div className="px-3 py-1 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 font-sans font-semibold text-xs flex items-center gap-1.5 shadow-inner">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>
              Waiting for <strong>{currentActivePlayer?.name || 'opponent'}</strong> to play...
            </span>
          </div>
        )}
      </div>

      {/* Right: Social & Match Controls */}
      <div className="flex items-center gap-2">
        {cheersToast && (
          <span className="text-[11px] font-bold text-amber-300 animate-fade-in">
            {cheersToast}
          </span>
        )}

        <button
          type="button"
          onClick={handleSendCheers}
          className="px-2.5 py-1 rounded-xl bg-amber-950/70 border border-amber-500/50 hover:border-amber-400 text-amber-200 font-sans font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow"
          title="Send Cheers emote to all players"
        >
          <Beer className="w-3.5 h-3.5 text-yellow-400" />
          <span>Cheers!</span>
        </button>

        <button
          type="button"
          onClick={handleCopyInvite}
          className="px-2.5 py-1 rounded-xl bg-stone-900 border border-stone-700 hover:border-amber-400 text-stone-200 font-sans font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow"
          title="Copy match invite URL to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
          <span>{copied ? 'Copied!' : 'Invite'}</span>
        </button>

        <button
          type="button"
          onClick={onLeaveOnlineMatch}
          className="px-2.5 py-1 rounded-xl bg-red-950/60 border border-red-500/40 hover:border-red-400 text-red-200 font-sans font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow"
          title="Disconnect from online room"
        >
          <LogOut className="w-3 h-3 text-red-400" />
          <span>Exit</span>
        </button>
      </div>
    </div>
  );
};
