import Peer, { DataConnection } from 'peerjs';
import { GameState, RotarySlotNumber, RotaryCatwalkAction, IngredientTaxonomy } from './types';

export interface NetworkPlayerInfo {
  peerId: string;
  name: string;
  playerIndex: number;
  color: string;
  isHost: boolean;
  pingMs?: number;
}

export interface NetworkLobbyState {
  roomCode: string;
  hostName: string;
  targetBatches: number;
  enableDepartments: boolean;
  playerCount: number;
  slots: Array<{
    slotIndex: number;
    assignedPlayer: NetworkPlayerInfo | null;
    isAI: boolean;
    color: string;
    defaultName: string;
  }>;
  isGameStarted: boolean;
}

export type NetworkMessage =
  | { type: 'JOIN_REQUEST'; playerName: string; preferredSlot?: number }
  | { type: 'JOIN_ACCEPTED'; yourSlot: number; lobby: NetworkLobbyState }
  | { type: 'JOIN_REJECTED'; reason: string }
  | { type: 'LOBBY_UPDATE'; lobby: NetworkLobbyState }
  | { type: 'START_GAME'; gameState: GameState; assignedSlot: number }
  | { type: 'GAME_ACTION'; actionType: string; payload: any; fromSlot: number }
  | { type: 'STATE_SYNC'; gameState: GameState }
  | { type: 'CHAT'; sender: string; text: string; time: string }
  | { type: 'PING'; timestamp: number }
  | { type: 'PONG'; timestamp: number };

const DEFAULT_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4'];
const DEFAULT_NAMES = ['Head Brewer', 'Cellar Master', 'Lead Chemist', 'Packaging Lead', 'Cask Foreman', 'Taproom Lead'];

export function generateRoomCode(): string {
  const WORDS = ['HOYNE', 'DARK', 'SUN', 'PILS', 'MALT', 'HOPS', 'CASK', 'BREW'];
  const prefix = WORDS[Math.floor(Math.random() * WORDS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

export function formatPeerId(roomCode: string): string {
  return `hoyne-table-${roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

export class MultiplayerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConnection: DataConnection | null = null;
  public isHost: boolean = false;
  public roomCode: string | null = null;
  public localSlot: number = 0;
  public localName: string = 'You';

  private onLobbyUpdateCb?: (lobby: NetworkLobbyState) => void;
  private onGameStartCb?: (gameState: GameState, yourSlot: number) => void;
  private onStateSyncCb?: (gameState: GameState) => void;
  private onActionReceivedCb?: (actionType: string, payload: any, fromSlot: number) => void;
  private onChatCb?: (chat: { sender: string; text: string; time: string }) => void;
  private onErrorCb?: (error: string) => void;
  private onStatusChangeCb?: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;

  public lobbyState: NetworkLobbyState | null = null;

  constructor() {}

  public setCallbacks(cbs: {
    onLobbyUpdate?: (lobby: NetworkLobbyState) => void;
    onGameStart?: (gameState: GameState, yourSlot: number) => void;
    onStateSync?: (gameState: GameState) => void;
    onActionReceived?: (actionType: string, payload: any, fromSlot: number) => void;
    onChat?: (chat: { sender: string; text: string; time: string }) => void;
    onError?: (error: string) => void;
    onStatusChange?: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  }) {
    this.onLobbyUpdateCb = cbs.onLobbyUpdate;
    this.onGameStartCb = cbs.onGameStart;
    this.onStateSyncCb = cbs.onStateSync;
    this.onActionReceivedCb = cbs.onActionReceived;
    this.onChatCb = cbs.onChat;
    this.onErrorCb = cbs.onError;
    this.onStatusChangeCb = cbs.onStatusChange;
  }

  /**
   * Host a new multiplayer room
   */
  public async hostRoom(
    hostName: string,
    playerCount: number = 4,
    enableDepartments: boolean = false,
    customRoomCode?: string
  ): Promise<string> {
    this.disconnect();
    this.isHost = true;
    this.localName = hostName || 'Head Brewer';
    this.localSlot = 0;
    this.roomCode = (customRoomCode || generateRoomCode()).toUpperCase();
    const peerId = formatPeerId(this.roomCode);

    this.onStatusChangeCb?.('connecting');

    this.lobbyState = {
      roomCode: this.roomCode,
      hostName: this.localName,
      targetBatches: playerCount === 2 ? 8 : playerCount === 3 ? 7 : 6,
      enableDepartments,
      playerCount,
      slots: Array.from({ length: playerCount }, (_, idx) => ({
        slotIndex: idx,
        assignedPlayer:
          idx === 0
            ? {
                peerId,
                name: this.localName,
                playerIndex: 0,
                color: DEFAULT_COLORS[0],
                isHost: true,
              }
            : null,
        isAI: false,
        color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        defaultName: DEFAULT_NAMES[idx % DEFAULT_NAMES.length],
      })),
      isGameStarted: false,
    };

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', (id) => {
          this.onStatusChangeCb?.('connected');
          this.onLobbyUpdateCb?.(this.lobbyState!);
          resolve(this.roomCode!);
        });

        this.peer.on('connection', (conn) => {
          this.handleIncomingConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.warn('[Multiplayer Host Error]:', err);
          // If room ID is taken, try with unique suffix
          if (err.type === 'unavailable-id') {
            const fallbackCode = `${this.roomCode}-${Math.floor(10 + Math.random() * 90)}`;
            this.hostRoom(hostName, playerCount, enableDepartments, fallbackCode)
              .then(resolve)
              .catch(reject);
            return;
          }
          this.onErrorCb?.(err.message || 'Network error hosting room');
          this.onStatusChangeCb?.('error');
          reject(err);
        });
      } catch (err: any) {
        this.onErrorCb?.(err.message || 'Failed to initialize P2P host');
        reject(err);
      }
    });
  }

  /**
   * Join an existing multiplayer room by Room Code
   */
  public async joinRoom(roomCode: string, playerName: string): Promise<NetworkLobbyState> {
    this.disconnect();
    this.isHost = false;
    this.localName = playerName || 'Guest Brewer';
    this.roomCode = roomCode.trim().toUpperCase();
    const hostPeerId = formatPeerId(this.roomCode);

    this.onStatusChangeCb?.('connecting');

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer({
          debug: 1,
        });

        this.peer.on('open', (myPeerId) => {
          const conn = this.peer!.connect(hostPeerId, {
            reliable: true,
          });

          this.hostConnection = conn;

          conn.on('open', () => {
            this.onStatusChangeCb?.('connected');
            // Send join request
            const joinReq: NetworkMessage = {
              type: 'JOIN_REQUEST',
              playerName: this.localName,
            };
            conn.send(joinReq);
          });

          conn.on('data', (raw: any) => {
            const msg = raw as NetworkMessage;
            if (msg.type === 'JOIN_ACCEPTED') {
              this.localSlot = msg.yourSlot;
              this.lobbyState = msg.lobby;
              this.onLobbyUpdateCb?.(msg.lobby);
              resolve(msg.lobby);
            } else if (msg.type === 'JOIN_REJECTED') {
              this.onErrorCb?.(msg.reason);
              this.onStatusChangeCb?.('error');
              reject(new Error(msg.reason));
            } else if (msg.type === 'LOBBY_UPDATE') {
              this.lobbyState = msg.lobby;
              this.onLobbyUpdateCb?.(msg.lobby);
            } else if (msg.type === 'START_GAME') {
              this.localSlot = msg.assignedSlot;
              this.onGameStartCb?.(msg.gameState, msg.assignedSlot);
            } else if (msg.type === 'STATE_SYNC') {
              this.onStateSyncCb?.(msg.gameState);
            } else if (msg.type === 'CHAT') {
              this.onChatCb?.({ sender: msg.sender, text: msg.text, time: msg.time });
            } else if (msg.type === 'PING') {
              conn.send({ type: 'PONG', timestamp: msg.timestamp });
            }
          });

          conn.on('close', () => {
            this.onStatusChangeCb?.('disconnected');
            this.onErrorCb?.('Disconnected from host.');
          });

          conn.on('error', (err) => {
            this.onErrorCb?.(`Connection error: ${err.message}`);
            this.onStatusChangeCb?.('error');
            reject(err);
          });
        });

        this.peer.on('error', (err) => {
          this.onErrorCb?.(err.message || 'Failed to connect to host');
          this.onStatusChangeCb?.('error');
          reject(err);
        });
      } catch (err: any) {
        this.onErrorCb?.(err.message || 'Failed to initialize peer client');
        reject(err);
      }
    });
  }

  private handleIncomingConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
    });

    conn.on('data', (raw: any) => {
      const msg = raw as NetworkMessage;

      if (msg.type === 'JOIN_REQUEST') {
        if (!this.lobbyState) return;

        // Find open slot
        const openSlot = this.lobbyState.slots.find((s) => !s.assignedPlayer && !s.isAI);
        if (!openSlot || this.lobbyState.isGameStarted) {
          conn.send({
            type: 'JOIN_REJECTED',
            reason: this.lobbyState.isGameStarted ? 'Match already in progress' : 'Room is full',
          } as NetworkMessage);
          return;
        }

        const playerInfo: NetworkPlayerInfo = {
          peerId: conn.peer,
          name: msg.playerName || openSlot.defaultName,
          playerIndex: openSlot.slotIndex,
          color: openSlot.color,
          isHost: false,
        };

        openSlot.assignedPlayer = playerInfo;

        conn.send({
          type: 'JOIN_ACCEPTED',
          yourSlot: openSlot.slotIndex,
          lobby: this.lobbyState,
        } as NetworkMessage);

        this.broadcastLobby();
      } else if (msg.type === 'GAME_ACTION') {
        this.onActionReceivedCb?.(msg.actionType, msg.payload, msg.fromSlot);
      } else if (msg.type === 'CHAT') {
        this.broadcast(msg);
        this.onChatCb?.({ sender: msg.sender, text: msg.text, time: msg.time });
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      if (this.lobbyState) {
        const slot = this.lobbyState.slots.find((s) => s.assignedPlayer?.peerId === conn.peer);
        if (slot) {
          slot.assignedPlayer = null;
          this.broadcastLobby();
        }
      }
    });
  }

  public setSlotAI(slotIndex: number, isAI: boolean) {
    if (!this.isHost || !this.lobbyState) return;
    const slot = this.lobbyState.slots[slotIndex];
    if (slot && slotIndex !== 0) {
      slot.isAI = isAI;
      if (isAI) {
        slot.assignedPlayer = null;
      }
      this.broadcastLobby();
    }
  }

  public setDepartmentsToggle(enabled: boolean) {
    if (!this.isHost || !this.lobbyState) return;
    this.lobbyState.enableDepartments = enabled;
    this.broadcastLobby();
  }

  public setTargetBatches(batches: number) {
    if (!this.isHost || !this.lobbyState) return;
    this.lobbyState.targetBatches = batches;
    this.broadcastLobby();
  }

  public broadcastLobby() {
    if (!this.isHost || !this.lobbyState) return;
    this.onLobbyUpdateCb?.(this.lobbyState);
    this.broadcast({
      type: 'LOBBY_UPDATE',
      lobby: this.lobbyState,
    });
  }

  public broadcastGameStart(gameState: GameState) {
    if (!this.isHost || !this.lobbyState) return;
    this.lobbyState.isGameStarted = true;
    for (const [peerId, conn] of this.connections.entries()) {
      const slot = this.lobbyState.slots.find((s) => s.assignedPlayer?.peerId === peerId);
      const slotIdx = slot ? slot.slotIndex : 1;
      conn.send({
        type: 'START_GAME',
        gameState,
        assignedSlot: slotIdx,
      } as NetworkMessage);
    }
  }

  public broadcastStateSync(gameState: GameState) {
    if (!this.isHost) return;
    this.broadcast({
      type: 'STATE_SYNC',
      gameState,
    });
  }

  public sendAction(actionType: string, payload?: any) {
    if (this.isHost) {
      // Host executes locally
      this.onActionReceivedCb?.(actionType, payload, this.localSlot);
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send({
        type: 'GAME_ACTION',
        actionType,
        payload,
        fromSlot: this.localSlot,
      } as NetworkMessage);
    }
  }

  public sendChat(text: string) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const chatMsg: NetworkMessage = {
      type: 'CHAT',
      sender: this.localName,
      text,
      time,
    };
    if (this.isHost) {
      this.broadcast(chatMsg);
      this.onChatCb?.({ sender: this.localName, text, time });
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(chatMsg);
      this.onChatCb?.({ sender: this.localName, text, time });
    }
  }

  private broadcast(msg: NetworkMessage) {
    for (const conn of this.connections.values()) {
      if (conn.open) {
        conn.send(msg);
      }
    }
  }

  public disconnect() {
    for (const conn of this.connections.values()) {
      conn.close();
    }
    this.connections.clear();
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.roomCode = null;
    this.isHost = false;
    this.lobbyState = null;
    this.onStatusChangeCb?.('disconnected');
  }
}

export const multiplayerService = new MultiplayerService();
