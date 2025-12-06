
export type PetType = 'Cat' | 'Panda' | 'Turtle';

export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  special: number;
}

export interface StatContribution {
  source: string;
  stats: Partial<Stats>;
  timestamp: number;
}

export interface MicroPet {
  name: string; // "Carbi", "Fiberling", etc.
  description: string;
  level: number;
  contributions: StatContribution[];
}

export interface GameState {
  currentView: 'INTRO' | 'HUB' | 'SCAN' | 'MAP' | 'BATTLE' | 'VICTORY' | 'DEFEAT' | 'STORE';
  petName: PetType | null;
  stats: Stats;
  microPets: MicroPet[];
  currentBoss: Boss | null;
  narrativeHistory: NarrativeEntry[];
  isLoading: boolean;
  unlockedBossIndex: number; // 0 = First boss unlocked, 1 = Second, etc.
  tokens: number;
}

export interface Boss {
  name: string;
  description: string;
  hp: number;
  maxHp: number;
  weakness: string;
  imageColor: string;
  environmentTheme?: string;
  bgGradient?: string;
  img?: string;
}

export interface NarrativeEntry {
  speaker: 'Narrator' | 'Boss' | 'Pet' | 'System';
  text: string;
  effectTag?: string;
}

// Gemini Response Schemas
export interface MicroPetAction {
  name: string;
  attackMessage: string;
  effectTag: string;
}

export interface NarrativeResponse {
  type: string;
  stats?: Partial<Stats>;
  petEvolution?: string;
  mainPetMessage?: string;
  bossMessage?: string;
  microPets?: MicroPetAction[];
  storyEvent: string;
  damageDealtToBoss?: number;
  damageDealtToPlayer?: number;
  battleStatus?: 'ongoing' | 'victory' | 'defeat';
}
