// ============================================================================
// HOUSE OF HOYNE: THE CARD GAME — SHARED ENGINE & UI TYPES
// Total Component Spec:
//   - 30 Assembly Line Zone Cards (6 players x 5 zones)
//   - 100 Ingredient Cards
//   - 57 Recipe Cards
//   - 40 Dedicated Upgrades (20 Equipment at Station #1, 20 Staff at Station #2)
//   - 4 Mixer Pack Bounties
// ============================================================================

export type ZoneId = 1 | 2 | 3 | 4 | 5;

export interface ZoneTheme {
  zoneId: ZoneId;
  name: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  glowColor: string;
  accentHex: string;
}

export const ZONE_THEMES: Record<ZoneId, ZoneTheme> = {
  1: {
    zoneId: 1,
    name: 'Warehouse',
    badgeBg: 'rgba(28, 21, 8, 0.94)',
    badgeBorder: '#d97706',
    textColor: '#fef08a',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    accentHex: '#f59e0b',
  },
  2: {
    zoneId: 2,
    name: 'Brewhouse',
    badgeBg: 'rgba(38, 19, 8, 0.94)',
    badgeBorder: '#ea580c',
    textColor: '#fed7aa',
    glowColor: 'rgba(249, 115, 22, 0.35)',
    accentHex: '#f97316',
  },
  3: {
    zoneId: 3,
    name: 'Cellar',
    badgeBg: 'rgba(8, 26, 40, 0.94)',
    badgeBorder: '#0284c7',
    textColor: '#bae6fd',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    accentHex: '#38bdf8',
  },
  4: {
    zoneId: 4,
    name: 'Cold Room',
    badgeBg: 'rgba(8, 32, 38, 0.94)',
    badgeBorder: '#0891b2',
    textColor: '#a5f3fc',
    glowColor: 'rgba(34, 211, 238, 0.35)',
    accentHex: '#22d3ee',
  },
  5: {
    zoneId: 5,
    name: 'Packaging',
    badgeBg: 'rgba(7, 32, 22, 0.94)',
    badgeBorder: '#059669',
    textColor: '#a7f3d0',
    glowColor: 'rgba(16, 185, 129, 0.35)',
    accentHex: '#10b981',
  },
};

export type IngredientCategory = 'malt' | 'hops' | 'yeast' | 'adjunct';

/**
 * Master 6-Color Ingredient Taxonomy (Pure VP & Math Engine):
 * - Core Staples (1 VP): Grain (Gold), Hops (Green), Yeast (Cream)
 * - Specialties (2 VP): Fruit (Purple), Spices (Red), Chocolate (Dark Brown)
 */
export type IngredientTaxonomy =
  | 'grain'
  | 'hops'
  | 'yeast'
  | 'fruit'
  | 'spices'
  | 'chocolate';

/** The 6 Dedicated Ingredient Market Stations */
export type IngredientStationId =
  | 'grain'      // Grain Silo (Base Malt & Specialty Grain)
  | 'hops'       // Hop Yard (Bittering, Aroma, Noble & Wet Hops)
  | 'yeast'      // Yeast Lab (House Yeast)
  | 'chocolate'  // Roastery (Dark Roasted Malt)
  | 'spices'     // Spice Bins (Winter Spices)
  | 'fruit';     // Berry Patch (Local Raspberries)

export interface IngredientStationState {
  id: IngredientStationId;
  name: string;
  subtitle: string;
  category: IngredientCategory;
  taxonomy: IngredientTaxonomy;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  /** Player ID currently occupying this station with their Brewer piece (exclusive per round) */
  occupiedByPlayerId?: string | null;
  /** Player name occupying this station */
  occupiedByPlayerName?: string | null;
  /** Player color occupying this station */
  occupiedByPlayerColor?: string | null;
  /** Base number of cards drawn when worker is placed (first 3 stations draw 2, last 3 draw 1) */
  baseDrawCount?: number;
  /** Face-up card displayed on top of the stack (single stack model) */
  faceUpCards: IngredientCard[];
  /** Draw deck specific to this station's ingredients */
  deck: IngredientCard[];
  /** Discard pile specific to this station */
  discard: IngredientCard[];
}

export type IngredientSubtype =
  | IngredientTaxonomy
  // Malts / Grains (44)
  | 'base_malt'          // 24
  | 'specialty_grain'    // 12
  | 'dark_roasted_malt'  // 8 (Chocolate)
  // Hops (30)
  | 'bittering_hops'     // 12
  | 'aroma_hops'         // 10
  | 'noble_hops'         // 8
  // Yeast (18)
  | 'house_yeast'        // 18
  // Specialties / Epic Adjuncts (8)
  | 'fresh_wet_hops'     // 3 (Hops / Wildcard)
  | 'winter_spices'      // 3 (Spices)
  | 'local_raspberries'; // 2 (Fruit)

export type RecipeTier = 3 | 4 | 5 | 6;

export type RecipeTierName =
  | 'Core Crusher'
  | 'Pints & IPAs'
  | 'Heritage & Dark Ale'
  | 'Legend & Heavyweight'
  | 'Premium Pint'
  | 'Showstopper'
  | 'Heavyweight'
  | 'Seasonal & Special Release';

export type BreweryDepartmentId =
  | 'dept_night_shift'
  | 'dept_taproom'
  | 'dept_hr_office'
  | 'dept_maintenance_shop'
  | 'dept_rd_desk'
  | 'dept_grain_silo'
  | 'dept_hop_locker'
  | 'dept_sourcing_desk'
  | 'dept_farm_swap'
  | 'dept_yeast_bank';

export type BreweryDepartmentActionType =
  | 'advance_pipeline'
  | 'taproom_direct_sale'
  | 'draft_staff_top3'
  | 'draft_equipment_top3'
  | 'draft_recipe_top3'
  | 'gain_grain'
  | 'gain_hops_wild'
  | 'gain_two_distinct'
  | 'farm_swap'
  | 'yeast_swap';

export interface BreweryDepartmentCard {
  id: BreweryDepartmentId;
  departmentNumber: number; // 1 to 10
  name: string;
  subtitle: string;
  category: 'logistics' | 'commercial' | 'personnel' | 'engineering' | 'production' | 'sourcing';
  flavorText: string;
  imagePath?: string;
  iconName: string;
  passiveEffect?: {
    type: 'grain_buffer' | 'hops_buffer' | 'yeast_buffer';
    description: string;
    extraCapacityToken?: IngredientTaxonomy;
    extraCapacityAmount?: number;
  };
  actionEffect: {
    type: BreweryDepartmentActionType;
    description: string;
  };
}

export type UpgradeType = 'equipment' | 'staff';

export interface BaseCard {
  id: string;
  name: string;
  deckType: 'zone' | 'ingredient' | 'recipe' | 'upgrade';
}

export interface ZoneCard extends BaseCard {
  deckType: 'zone';
  playerIndex: number; // 0 to 5
  zoneId: ZoneId;
  title: string;
  subtitle: string;
  description: string;
}

export interface IngredientCard extends BaseCard {
  deckType: 'ingredient';
  category: IngredientCategory;
  subtype: IngredientSubtype;
  taxonomy?: IngredientTaxonomy;
  vpValue?: 1 | 2;
  description: string;
  flavorText: string;
  isWildcard?: boolean;
}

export interface RecipeCard extends BaseCard {
  deckType: 'recipe';
  tier: RecipeTier;
  tierName: RecipeTierName;
  style: string;
  abv: string;
  vp: number;
  /** Exact ingredient subtypes required to brew this recipe */
  requiredIngredients: IngredientSubtype[];
  /** Bonus effect triggered when the recipe reaches Zone 4 (Loading Dock) */
  completionBonusText: string;
  completionEffect?: {
    bonusVp?: number;
    drawIngredients?: number;
    bonusVpPerTier?: { tier: RecipeTier; vp: number };
    bonusVpPerUniqueStyle?: number;
  };
  flavorText: string;
  colorAccent: string;
}

export type UpgradeEffectKey =
  | 'hand_limit_plus_3'          // Grain Silo Expansion (+3 hand limit)
  | 'hand_limit_plus_2'          // Grain Silo (+2 hand limit)
  | 'extra_source_draw'          // Storage Tech / Mill (draw +1 card when Sourcing)
  | 'free_skip_conveyor'         // Conveyor Belting (ignore 1 skip cost when Sourcing)
  | 'free_skips_plus_2'          // Grist Intake (ignore 2 skip costs when Sourcing)
  | 'hopper_malt_exchange'       // High-Capacity Hopper (Discard 1 Malt to draft any 2 Malts from Conveyor)
  | 'free_conveyor_flush'        // Operations Lead (1 free Conveyor flush once per turn)
  | 'kettle_discount_malt'       // Steam-Jacketed Mash Tun (reduce recipe cost by 1 base_malt)
  | 'kettle_discount_hops'       // Hop Back Filter (reduce recipe cost by 1 hop)
  | 'kettle_discount_yeast'      // Plate Heat Exchanger (reduce recipe cost by 1 yeast)
  | 'kettle_double_batch'        // Rapid Wort Chiller / Dual Kettle (Brewhouse capacity +1)
  | 'skip_ferment_to_dock'       // Brew Technician (Move recipe directly from Zone 2 to Zone 4 if Zone 3 is full)
  | 'carboy_capacity_plus_1'     // Lager Tank Array / Extra Carboy (Zone 3 fermentation capacity +1)
  | 'fast_ferment'               // Dual-Stage Glycol Chiller (Tier 1 recipes can go straight to Zone 3 if open)
  | 'yeast_on_cellar_entry'      // Lab Specialist (Draw 1 House Yeast whenever a recipe enters Zone 3)
  | 'cellar_master_advance'      // Cellar Master (Free action: Advance 1 Recipe from Zone 3 to Zone 4)
  | 'sean_hoyne_master_brewer'   // Sean Hoyne - Master Brewer (May substitute ANY 1 ingredient in a Recipe)
  | 'source_on_brew'             // Brewmaster Assistant (Draw 1 Ingredient from deck whenever you Brew)
  | 'yeast_propagation'          // Lab Technician (House Yeast discount)
  | 'yeast_recycle'              // Fermentation Tech (Draw 1 House Yeast on finish)
  | 'wildcard_hops'              // Hop Master Specialist
  | 'dock_draw_2'                // Rotary Canning Line
  | 'dock_draw_1'                // Depalletizer & Stacker (Draw 1 Ingredient when recipe packaged into Zone 4)
  | 'dock_capacity_plus_1'       // Automated Canning Line (Dock capacity +1 slot)
  | 'ship_all_zone4'             // Freight Dispatch Supervisor (Deliver & Ship moves ALL Zone 4 recipes in 1 action)
  | 'free_ship_action'           // Logistics Lead (1 free Deliver & Ship action at end of turn)
  | 'dock_refund_1'              // Keg Washing Station (Reclaim 1 spent ingredient to hand upon packaging)
  | 'packaging_brew_discount'    // Delivery Expediter (Next brew costs 1 fewer ingredient after packaging)
  | 'upgrade_cost_discount_1'    // Central Automation Panel (Pay 1 less ingredient on all Upgrades in market)
  | 'extra_workday_action'       // Operations Manager (+1 extra action on turn; 3 actions total)
  | 'unlimited_dock_capacity'    // Cold Storage Vault (Unlimited storage capacity in Zone 4)
  | 'fleet_delivery_bonus'       // Fleet Supervisor (Deliveries to Trophy Stack trigger drawing 1 free Epic Adjunct or Specialty Malt)
  | 'wing_sourcing_master'       // Operations Command (Legacy/Compat)
  | 'wing_distribution_hub'      // Distribution Wing (Legacy/Compat)
  | 'wing_grist_exchange'        // Operations Command (Legacy/Compat)
  | 'wing_cold_freight'          // Distribution Wing (Legacy/Compat)
  | 'taco_bar_tasting_room'      // Legacy/Compat
  | 'loading_dock_vp_plus_1'     // Legacy/Compat
  | 'adjunct_specialist'         // Legacy/Compat
  | 'shift_supervisor'          // Legacy/Compat
  | (string & {});

export interface StandbyBay {
  id: number;
  occupants: RotaryOccupant[];
}

export interface UpgradeOption {
  name: string;
  type: 'equipment' | 'staff' | 'wing_operations' | 'wing_distribution';
  costCategories: IngredientCategory[];
  costSubtypes?: IngredientSubtype[];
  effectKey: UpgradeEffectKey;
  effectText: string;
  flavorText?: string;
  targetZone?: ZoneId;
  bonusEndgameVp?: number; // 0 (zero flat VP)
  badge?: string; // Concise summary badge e.g. "+2 Grain Storage", "+1 Hops on Draft"
}

export interface UpgradeCard extends BaseCard {
  deckType: 'upgrade';
  cardKind?: 'equipment' | 'staff' | 'universal_wing';
  isUniversalWing?: boolean;
  targetZone?: ZoneId;

  // Single Unified Acquisition Cost (paid once upon drafting from market)
  costSubtypes?: IngredientSubtype[];
  costCategories?: IngredientCategory[];
  installTokens?: Partial<Record<IngredientTaxonomy | 'any', number>>;
  cardNumber?: number;

  headerBadge?: string; // Concise equipment badge e.g. "+2 Grain Storage" (shows in top header & tuck)
  footerBadge?: string; // Concise staff badge e.g. "+1 Hops on Draft" (shows in bottom footer & tuck)

  // Dedicated token storage on card (e.g., printed storage circles on equipment cards)
  storageSlots?: number;
  storageAllowedToken?: IngredientTaxonomy | 'any';
  storedTokens?: IngredientTaxonomy[];
  imagePath?: string;
  flavorText?: string;

  // Dual-Purpose Zone Card halves (compatibility)
  equipment?: UpgradeOption; // Top half: Slides 1.25" under TOP EDGE of Zone
  staff?: UpgradeOption;     // Bottom half: Slides 1.25" under BOTTOM EDGE of Zone

  // Universal Wing Card halves (8 cards)
  leftWing?: UpgradeOption;  // Left half: Slides 1.25" under LEFT EDGE of Zone 1 (Operations Command)
  rightWing?: UpgradeOption; // Right half: Slides 1.25" under RIGHT EDGE of Zone 4 (Distribution & Storage)

  // When installed on a player board, which half was chosen:
  installedAs?: 'equipment' | 'staff' | 'leftWing' | 'rightWing';
  installedOption?: UpgradeOption;

  // Compatibility / default properties
  upgradeType?: UpgradeType;
  effectKey?: UpgradeEffectKey;
  effectText?: string;
  bonusEndgameVp?: number; // 0
}

export interface MixerPackCard {
  id: string;
  key: 'in_good_time' | 'four_fine_friends' | 'hello_sunshine' | 'hello_darkness';
  name: string;
  vp: number; // 4, 5, 6, 7
  requiredRecipes: string[]; // 4 exact recipe names
  imagePath: string;
  flavorText: string;
  claimedByPlayerId?: string;
  claimedByPlayerName?: string;
}

export type TaproomCard = RecipeCard | UpgradeCard;

export type Card = ZoneCard | IngredientCard | RecipeCard | UpgradeCard | MixerPackCard;

export interface ConveyorSlot {
  ingredient: IngredientCard;
  /** Ingredients placed on this slot via "Pay to Skip" by previous players */
  skippedCards: IngredientCard[];
}

export interface ZoneState {
  zoneId: ZoneId;
  zoneCard: ZoneCard;
  /** Equipment cards placed ON TOP of this zone (1.25" tuck) */
  equipment: UpgradeCard[];
  /** Staff cards tucked UNDER this zone (1.25" tuck) */
  staff: UpgradeCard[];
  /** Active recipes currently in this zone (Zone 2 Brewhouse, Zone 3 Cellar, or Zone 4 Packaging) */
  recipes: RecipeCard[];
}

export type RotarySlotNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type RotaryCatwalkAction = 'inward' | 'standby' | 'outward';

export interface RotaryOccupant {
  playerId: string;
  playerName: string;
  playerColor: string;
  chosenIngredient?: IngredientTaxonomy | null;
}

export interface RotarySlotState {
  slotNumber: RotarySlotNumber;
  ingredient: IngredientTaxonomy; // 1: chocolate, 2: spices, 3: fruit, 4: yeast, 5: hops, 6: grain
  ingredientName: string;
  tokenYield: number; // 1 or 2
  outerCard: (RecipeCard | UpgradeCard) | null;
  catwalkOccupant?: RotaryOccupant | null; // Designated Catwalk space (Initiative)
  inwardOccupant: RotaryOccupant | null;   // Inner Hopper: Draft Tokens (Inward)
  standbyOccupant: RotaryOccupant | null; // Center: Standby Slot (#1-6)
  outwardOccupant: RotaryOccupant | null; // Outer Shelf: Draft Card (Outward: Immediate Brew/Install)
}

export interface RotaryCenterOccupant extends RotaryOccupant {
  chosenIngredient?: IngredientTaxonomy | null;
}

export interface RotaryBoardState {
  slots: Record<RotarySlotNumber, RotarySlotState>;
  /** The Center Space: Worker action spot where a player can collect 1 of any type ingredient */
  centerSpaceOccupant?: RotaryCenterOccupant | null;
  /** The 6 interior locations around inside location 7 (Brewhouse Pantry detents) */
  pantryOccupants?: Partial<Record<IngredientTaxonomy, RotaryOccupant>> | null;
  /** The Center Ring "Hot Seat": Displaced player lands here and takes the very next turn! */
  centerRingHotSeat: RotaryOccupant | null;
  /** Player ID forced to act next due to being displaced into the Hot Seat */
  hotSeatPlayerId: string | null;
  /** Station number from which the hot seat player was evicted (single eviction restriction) */
  evictedFromStation?: RotarySlotNumber | null;
  /** Normal turn order sequence of player IDs (Slots 1-6) */
  turnOrder: string[];
  /** Standby Bays 1-6 for Standby Priority Invariant verification */
  standby_bays?: StandbyBay[];
}

export interface PlayerMatColumn {
  batches: RecipeCard[];
}

export interface PlayerMat {
  columns: Record<number, PlayerMatColumn>;
  warehouse_token_count: number;
}

export interface PlayerState {
  id: string;
  name: string;
  isAI: boolean;
  aiPersona?: string;
  color: string;
  /** Tactile wooden ingredient tokens in player's inventory */
  tokens: Record<IngredientTaxonomy, number>;
  /** Hand cards - strictly empty under Zero-Hand Invariant */
  hand: IngredientCard[];
  hand_cards?: IngredientCard[];
  zones: Record<ZoneId, ZoneState>;

  /** Player Mat architecture with Columns 1-4 and warehouse token count */
  mat?: PlayerMat;

  /** Shift Action Economy tracking (strictly 1 action per shift) */
  actionsTakenThisShift: number;
  actions_taken_this_shift?: number;
  isClockedIn?: boolean;
  /** Station wedge occupied on previous shift (Forced Movement Rule: cannot select this Catwalk) */
  lastOccupiedStation?: RotarySlotNumber | null;
  /** Mandatory Movement tracking: Did player occupy their personal department on previous shift? */
  lastOccupiedDepartment?: boolean;

  /** Personal Brewery Department card (2.25" x 3.5" standard card docked flush left of Zone 1) */
  departmentCard?: BreweryDepartmentCard | null;
  /** Meeple placed on personal brewery department during Phase 2 */
  departmentOccupant?: {
    playerId: string;
    playerName: string;
    playerColor: string;
  } | null;

  // Universal Wings (extend 1.25" on left and right edges of the 11.5" x 5.75" board)
  leftWing: UpgradeCard[];  // Operations Command (Zone 1 left edge)
  rightWing: UpgradeCard[]; // Distribution & Storage (Zone 4 right edge)

  // Claimed Mixer Pack Cards (Set Collection / Public Race)
  mixerPacks: MixerPackCard[];

  /** Finished and packaged recipes delivered off the assembly line into the Trophy Rack */
  completedBatches?: RecipeCard[];

  /** Has the player placed their Brewer worker meeple this round at an ingredient station? */
  placedWorkerStationId?: IngredientStationId | null;

  /** Total VP accumulated strictly from completed packaged recipes (Zero mid-game VP bookkeeping!) */
  score: number;
  /** Breakdown of score for UI tooltips */
  scoreBreakdown: {
    recipeBaseVp: number;
    recipeBonusVp: number;
    upgradeTriggeredVp: number;
    upgradeStaticVp: number;
    mixerPackVp: number;
  };
}

export type ShiftPhase =
  | 'PHASE_1_MARKET_REFRESH'
  | 'PHASE_2_CATWALK_PLACEMENT'
  | 'PHASE_3_STATION_COMMITMENT'
  | 'PHASE_1_WORKER_DRAFT'
  | 'PHASE_2_CONVEYOR_OPERATIONS'
  | 'PHASE_3_SHIFT_RESET'
  | 'GAME_OVER';

export type TurnPhase =
  | 'PHASE_1_MARKET_REFRESH'
  | 'PHASE_2_CATWALK_PLACEMENT'
  | 'PHASE_3_STATION_COMMITMENT'
  | 'PHASE_1_WORKER_DRAFT'
  | 'PHASE_2_CONVEYOR_OPERATIONS'
  | 'PHASE_3_SHIFT_RESET'
  | 'MORNING_SHIFT' // Automatic conveyor movement (Zone 2 -> 3 -> 4)
  | 'WORK_DAY'      // Choose 1 Action: Source, Invest, or Brew
  | 'DISCARD'       // Enforce Zone 1 Grain Room hand limit if exceeded
  | 'GAME_OVER';

export interface LogEntry {
  id: string;
  turn: number;
  playerId: string;
  playerName: string;
  phase: TurnPhase;
  message: string;
  timestamp: number;
}

export interface MorningShiftEvent {
  recipeId: string;
  recipeName: string;
  fromZone: ZoneId;
  toZone: ZoneId;
  vpEarned?: number;
}

export interface MarketFlushEvent {
  id: string;
  turn: number;
  reason: 'NO_RECIPES' | 'NO_UPGRADES' | 'MANUAL_SWEEP';
  flushedCardNames: string[];
  timestamp: number;
}

export interface GameState {
  players: PlayerState[];
  currentPlayerIndex: number;
  turnNumber: number;
  roundNumber: number;
  phase: TurnPhase;
  shiftPhase?: ShiftPhase;

  /** Closed-Loop 108 Wooden Token Pool: 28 Grain, 24 Hops, 20 Yeast, 12 Fruit, 12 Spices, 12 Chocolate */
  centralHoppers: Record<IngredientTaxonomy, number>;
  /** Spent brew tokens cycling back to hoppers */
  kettlePool: Record<IngredientTaxonomy, number>;
  targetBatchesToTriggerEnd: number;
  endgameTriggeredByPlayerId: string | null;
  isFinalRound: boolean;
  winnerIds: string[];

  // Deck 1: The 6 Dedicated Ingredient Market Stations (Worker Placement Depot)
  ingredientStations: Record<IngredientStationId, IngredientStationState>;

  // Deck 1 Legacy compatibility: Ingredient Deck (100 Cards) & Row 1: 6-Card Conveyor
  ingredientDeck: IngredientCard[];
  ingredientDiscard: IngredientCard[];
  /** Row 1: 6-card Market Conveyor (index 0 = oldest/free to take, index 5 = newest/requires skipping 0..4) */
  conveyorMarket: ConveyorSlot[];

  // Master 97-Card Brewery Deck (57 Recipes + 40 Upgrades) & Row 2: 6-Slot Brewery Market
  breweryDeck: (RecipeCard | UpgradeCard)[];
  breweryDiscard: (RecipeCard | UpgradeCard)[];
  /** Single Unified Market Offer Row: 6 open slots parallel to the 6-slot Ingredient Conveyor */
  breweryMarket: (RecipeCard | UpgradeCard)[];

  /** 11.5" Rotary Board State (Triple-Split Catwalk & Active Center Ring "Hot Seat") */
  rotaryBoard?: RotaryBoardState;

  // Dedicated Station #1 Equipment Deck & Station #2 Staff Deck
  equipmentDeck: UpgradeCard[];
  equipmentDiscard: UpgradeCard[];
  staffDeck: UpgradeCard[];
  staffDiscard: UpgradeCard[];

  // Dedicated Tiered Recipe Decks (Station 3: Tier 1, Station 4: Tier 2, Station 5: Tier 3, Station 6: Tier 4)
  recipeTierDecks?: Record<RecipeTier, RecipeCard[]>;
  recipeTierDiscards?: Record<RecipeTier, RecipeCard[]>;

  // Legacy / Deck views for compatibility
  recipeDeck: RecipeCard[];
  recipeDiscard: RecipeCard[];
  pubMarket: RecipeCard[];
  upgradeDeck: UpgradeCard[];
  upgradeDiscard: UpgradeCard[];
  shopMarket: UpgradeCard[];
  taproomDeck: TaproomCard[];
  taproomDiscard: TaproomCard[];
  taproomMarket: TaproomCard[];
  /** Most recent Market Flush event for UI banner/animation */
  lastMarketFlushEvent?: MarketFlushEvent | null;

  // Deck 3: Mixer Pack Bonus Deck (8 Cards - 4 Face-Up Public Race)
  mixerDeck: MixerPackCard[];
  mixerMarket: MixerPackCard[];
  mixerDiscard: MixerPackCard[];

  // Deck 4: Personal Brewery Department Deck (10 Cards)
  departmentDeck?: BreweryDepartmentCard[];
  departmentDiscard?: BreweryDepartmentCard[];
  lastMixerClaimEvent?: {
    playerId: string;
    playerName: string;
    cardName: string;
    vp: number;
    timestamp: number;
  } | null;

  /** Recent shift events for animating Morning Shift slides */
  lastMorningShiftEvents: MorningShiftEvent[];
  logs: LogEntry[];
}

export interface SourcePickChoice {
  type: 'deck' | 'conveyor' | 'station';
  /** Dedicated Station ID to place worker ('grain' | 'hops' | 'yeast' | 'chocolate' | 'spices' | 'fruit') */
  stationId?: IngredientStationId;
  /** Specific card IDs to draft from the station's face-up cards */
  draftCardIds?: string[];
  /** Required when type === 'conveyor' (0 to conveyorMarket.length - 1) */
  conveyorIndex?: number;
  /** Hand card IDs used to pay for skipped slots (1 card per skipped slot before conveyorIndex, minus free skips) */
  paidHandCardIds?: string[];
}

