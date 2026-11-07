import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Globe,
  Share2,
  Sparkles,
  Bot,
  UserCheck,
  AlertCircle,
  Play,
  X,
  Radio,
  Wifi,
  Crown,
} from 'lucide-react';
import {
  multiplayerService,
  NetworkLobbyState,
} from '../engine/multiplayer';

export interface OnlineMultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnlineGame: (lobby: NetworkLobbyState) => void;
  initialRoomCode?: string | null;
}

export const OnlineMultiplayerModal: React.FC<OnlineMultiplayerModalProps> = ({
  isOpen,
  onClose,
  onStartOnlineGame,
  initialRoomCode,
}) => {
  const [activeTab, setActiveTab] = useState<'host' | 'join'>(initialRoomCode ? 'join' : 'host');
  const [hostName, setHostName] = useState('Head Brewer');
  const [joinName, setJoinName] = useState('Guest Brewer');
  const [joinRoomCode, setJoinRoomCode] = useState(initialRoomCode || '');
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [enableDepartments, setEnableDepartments] = useState<boolean>(false);

  const [lobby, setLobby] = useState<NetworkLobbyState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (initialRoomCode) {
      setJoinRoomCode(initialRoomCode);
      setActiveTab('join');
    }
  }, [initialRoomCode]);

  useEffect(() => {
    multiplayerService.setCallbacks({
      onLobbyUpdate: (newLobby) => {
        setLobby({ ...newLobby });
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsConnecting(false);
      },
      onStatusChange: (status) => {
        if (status === 'connecting') setIsConnecting(true);
        if (status === 'connected') {
          setIsConnecting(false);
          setErrorMessage(null);
        }
        if (status === 'error' || status === 'disconnected') setIsConnecting(false);
      },
      onGameStart: () => {
        if (lobby) {
          onStartOnlineGame(lobby);
        }
      },
    });

    return () => {
      // Don't auto-disconnect if game started
    };
  }, [lobby, onStartOnlineGame]);

  if (!isOpen) return null;

  const handleCreateHost = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const code = await multiplayerService.hostRoom(hostName, playerCount, enableDepartments);
      setJoinRoomCode(code);
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to create room');
      setIsConnecting(false);
    }
  };

  const handleJoinHost = async () => {
    if (!joinRoomCode.trim()) {
      setErrorMessage('Please enter a 4-letter/number Room Code.');
      return;
    }
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const lobbyState = await multiplayerService.joinRoom(joinRoomCode, joinName);
      setLobby(lobbyState);
    } catch (e: any) {
      setErrorMessage(e.message || 'Could not connect to room. Check code and try again.');
      setIsConnecting(false);
    }
  };

  const getInviteUrl = () => {
    const code = lobby?.roomCode || joinRoomCode;
    const base = window.location.origin + window.location.pathname;
    return `${base}?room=${encodeURIComponent(code)}`;
  };

  const handleCopyLink = () => {
    const url = getInviteUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    const code = lobby?.roomCode || joinRoomCode;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleToggleSlotAI = (slotIndex: number) => {
    if (!lobby || !multiplayerService.isHost) return;
    const slot = lobby.slots[slotIndex];
    if (slot) {
      multiplayerService.setSlotAI(slotIndex, !slot.isAI);
    }
  };

  const handleToggleDepartments = () => {
    if (!multiplayerService.isHost) return;
    const next = !enableDepartments;
    setEnableDepartments(next);
    multiplayerService.setDepartmentsToggle(next);
  };

  const handleStartGame = () => {
    if (!lobby) return;
    onStartOnlineGame(lobby);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="stout-panel rounded-3xl border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)] max-w-2xl w-full p-5 sm:p-6 text-hoyne-cream relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center shadow-inner">
              <Globe className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif font-black text-xl text-amber-200 tracking-wide flex items-center gap-2">
                <span>Play Online with Friends</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                  P2P Multiplayer
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Serverless peer-to-peer multiplayer powered by encrypted WebRTC.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector (When not in an active lobby) */}
        {!lobby && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('host')}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                activeTab === 'host'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-300 text-stone-950 shadow-lg'
                  : 'bg-stone-900/80 border-stone-700 text-stone-300 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Host a Room</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('join')}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                activeTab === 'join'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 border-amber-300 text-stone-950 shadow-lg'
                  : 'bg-stone-900/80 border-stone-700 text-stone-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Join Friend&apos;s Room</span>
            </button>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-sans font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ===================================================================
            VIEW A: SETUP / JOIN FORM (Before connecting)
            =================================================================== */}
        {!lobby ? (
          activeTab === 'host' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold uppercase tracking-wider text-amber-300">
                  Your Brewer Name (Host)
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Head Brewer Sean"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-hoyne-copper/60 text-sm font-sans text-white focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-bold uppercase tracking-wider text-amber-300">
                    Player Count
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[2, 3, 4].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setPlayerCount(cnt)}
                        className={`py-2 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                          playerCount === cnt
                            ? 'bg-amber-500 text-stone-950 border-amber-300 shadow'
                            : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-500/50'
                        }`}
                      >
                        {cnt}P
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-bold uppercase tracking-wider text-amber-300">
                    Optional Personal Departments
                  </label>
                  <button
                    type="button"
                    onClick={() => setEnableDepartments(!enableDepartments)}
                    className={`w-full py-2 px-3 rounded-xl font-sans font-bold text-xs border transition flex items-center justify-between cursor-pointer ${
                      enableDepartments
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow'
                        : 'bg-stone-900 text-stone-400 border-stone-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{enableDepartments ? 'Enabled' : 'Disabled (Standard)'}</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase">
                      {enableDepartments ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateHost}
                disabled={isConnecting}
                className="w-full py-3.5 rounded-xl copper-bevel-btn font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Radio className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Creating Secure P2P Room...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 text-stone-950" />
                    <span>Create Room &amp; Open Lobby</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold uppercase tracking-wider text-amber-300">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. HOYNE-4829"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-hoyne-copper/60 text-base font-mono font-bold uppercase text-amber-300 tracking-widest text-center focus:outline-none focus:border-amber-400 shadow-inner"
                />
                <p className="text-[11px] text-stone-400">
                  Ask your friend who hosted the match for their 4-digit Room Code or Invite Link.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold uppercase tracking-wider text-amber-300">
                  Your Brewer Name
                </label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="e.g. Nicola"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-hoyne-copper/60 text-sm font-sans text-white focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <button
                type="button"
                onClick={handleJoinHost}
                disabled={isConnecting || !joinRoomCode.trim()}
                className="w-full py-3.5 rounded-xl copper-bevel-btn font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Wifi className="w-4 h-4 animate-pulse text-amber-300" />
                    <span>Connecting to Friend&apos;s Room...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-stone-950" />
                    <span>Connect &amp; Enter Lobby</span>
                  </>
                )}
              </button>
            </div>
          )
        ) : (
          /* ===================================================================
              VIEW B: ACTIVE ROOM LOBBY
              =================================================================== */
          <div className="space-y-4">
            {/* Room Code Banner & Share Controls */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border-2 border-amber-500/70 shadow-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Room Invite Code
                </span>
                <div className="text-2xl font-mono font-black text-amber-200 tracking-widest">
                  {lobby.roomCode}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-500/50 hover:border-amber-400 text-amber-200 font-sans font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-sans font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md hover:scale-105 active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                </button>
              </div>
            </div>

            {/* Lobby Player Seats List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans font-bold uppercase tracking-wider text-amber-300">
                <span>Brewery Seats ({lobby.slots.filter((s) => s.assignedPlayer).length}/{lobby.playerCount} Joined)</span>
                <span className="text-[10px] font-mono text-stone-400">
                  Target: {lobby.targetBatches} Batches
                </span>
              </div>

              <div className="space-y-2">
                {lobby.slots.map((slot) => {
                  const isYou =
                    slot.assignedPlayer &&
                    slot.assignedPlayer.playerIndex === multiplayerService.localSlot;

                  return (
                    <div
                      key={slot.slotIndex}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        slot.assignedPlayer
                          ? 'bg-stone-900/90 border-amber-500/60 shadow-md'
                          : slot.isAI
                          ? 'bg-stone-950/80 border-stone-800'
                          : 'bg-black/40 border-dashed border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-4 rounded-full border-2 border-amber-300 shadow"
                          style={{ backgroundColor: slot.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-hoyne-cream">
                              {slot.assignedPlayer
                                ? slot.assignedPlayer.name
                                : slot.isAI
                                ? `${slot.defaultName} (AI Bot)`
                                : `Seat #${slot.slotIndex + 1} (Waiting for friend...)`}
                            </span>
                            {slot.assignedPlayer?.isHost && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-mono font-bold uppercase">
                                Host
                              </span>
                            )}
                            {isYou && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9px] font-mono font-bold uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-stone-400">
                            {slot.assignedPlayer
                              ? 'Connected via WebRTC'
                              : slot.isAI
                              ? 'Automated Brewhouse AI'
                              : 'Send friend the Invite Link to take this seat'}
                          </span>
                        </div>
                      </div>

                      {/* Seat Action (Host can toggle AI for empty seats) */}
                      {multiplayerService.isHost && slot.slotIndex !== 0 && !slot.assignedPlayer && (
                        <button
                          type="button"
                          onClick={() => handleToggleSlotAI(slot.slotIndex)}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-600 text-xs font-sans text-stone-300 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Bot className="w-3.5 h-3.5 text-amber-400" />
                          <span>{slot.isAI ? 'Switch to Human' : 'Fill with AI'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Cards Option (Host controls) */}
            {multiplayerService.isHost ? (
              <div className="p-3 rounded-xl bg-stone-900 border border-hoyne-copper/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="font-sans font-bold text-xs text-amber-200">
                    Optional Personal Brewery Departments
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleDepartments}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                    lobby.enableDepartments
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                  }`}
                >
                  {lobby.enableDepartments ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            ) : (
              <div className="text-[11px] font-mono text-stone-400 text-center">
                Departments Expansion:{' '}
                <span className="text-amber-300 font-bold">
                  {lobby.enableDepartments ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            )}

            {/* Launch Game Button */}
            {multiplayerService.isHost ? (
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full py-3.5 rounded-xl copper-bevel-btn font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Play className="w-4 h-4 fill-stone-950 text-stone-950" />
                <span>Start Online Game for All Players</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-600/50 text-center space-y-1">
                <div className="text-xs font-sans font-bold text-amber-200 flex items-center justify-center gap-2 animate-pulse">
                  <Wifi className="w-4 h-4 text-amber-400" />
                  <span>Waiting for Host ({lobby.hostName}) to start the match...</span>
                </div>
                <p className="text-[10px] text-stone-400">
                  Keep this window open. The match will automatically load on your screen as soon as the host begins!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
