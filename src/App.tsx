import React, { useState, useEffect } from 'react';
import { GameState, PetType, Stats } from './types';
import { INITIAL_STATS } from './constants';
import { Header } from './components/Header';

// Views
import { IntroView } from './views/IntroView';
import { HubView } from './views/HubView';
import { MapView } from './views/MapView';
import { ScanView } from './views/ScanView';
import { StoreView } from './views/StoreView';
import { BattleView } from './views/BattleView';

const SAVE_KEY = 'pet_quest_save_data';

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentView: 'INTRO',
    petName: null,
    stats: { ...INITIAL_STATS },
    microPets: [],
    currentBoss: null,
    narrativeHistory: [],
    isLoading: false,
    unlockedBossIndex: 0,
    tokens: 0,
  });

  const [hasSaveData, setHasSaveData] = useState(false);
  const [isNewGameSelection, setIsNewGameSelection] = useState(false); 
  const [statDiffs, setStatDiffs] = useState<Partial<Stats>>({});

  // Check for save data on mount
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        setHasSaveData(true);
    }
  }, []);

  // Clear Stat Diffs only when changing views
  useEffect(() => {
    if (Object.keys(statDiffs).length > 0) {
        if (gameState.currentView !== 'HUB' && gameState.currentView !== 'SCAN') {
            setStatDiffs({});
        }
    }
  }, [gameState.currentView]);

  // -- Save/Load Functions --
  const saveGame = (currentState: GameState) => {
      localStorage.setItem(SAVE_KEY, JSON.stringify(currentState));
      setHasSaveData(true);
  };

  const loadGame = () => {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              if (parsed.currentView === 'INTRO') {
                  parsed.currentView = 'HUB';
              }
              if (parsed.tokens === undefined) parsed.tokens = 0;
              setGameState(parsed);
          } catch (e) {
              console.error("Failed to load save", e);
              localStorage.removeItem(SAVE_KEY);
              setHasSaveData(false);
          }
      }
  };

  const saveAndQuit = () => {
      saveGame({...gameState, currentView: 'INTRO'});
      setGameState(prev => ({...prev, currentView: 'INTRO'}));
      setIsNewGameSelection(false);
  };

  const startNewGameFlow = () => {
      setIsNewGameSelection(true);
      setGameState({
        currentView: 'INTRO',
        petName: null,
        stats: { ...INITIAL_STATS },
        microPets: [],
        currentBoss: null,
        narrativeHistory: [],
        isLoading: false,
        unlockedBossIndex: 0,
        tokens: 0
     });
  };

  const selectPet = (pet: PetType) => {
    setGameState({
      ...gameState,
      petName: pet,
      narrativeHistory: []
    });
  };

  const confirmPetSelection = () => {
    if (gameState.petName) {
      const nextState: GameState = { ...gameState, currentView: 'HUB' };
      setGameState(nextState);
      saveGame(nextState); 
      setIsNewGameSelection(false); 
    }
  };

  if (gameState.currentView === 'INTRO') {
      return (
          <IntroView 
              hasSaveData={hasSaveData}
              isNewGameSelection={isNewGameSelection}
              gameState={gameState}
              onContinue={loadGame}
              onStartNewGameFlow={startNewGameFlow}
              onBackToMenu={() => {
                  setIsNewGameSelection(false);
                  loadGame(); 
              }}
              onSelectPet={selectPet}
              onConfirmPet={confirmPetSelection}
          />
      );
  }

  return (
    <div className="h-screen bg-ghibli-cream font-sans text-ghibli-dark max-w-md mx-auto relative shadow-2xl overflow-hidden flex flex-col">
      <Header 
          gameState={gameState} 
          onBack={() => setGameState(prev => ({...prev, currentView: 'HUB'}))}
          onSaveAndQuit={saveAndQuit}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {gameState.currentView === 'HUB' && (
            <HubView 
                gameState={gameState} 
                statDiffs={statDiffs} 
                onNavigate={(view) => setGameState(prev => ({...prev, currentView: view}))} 
            />
        )}

        {gameState.currentView === 'MAP' && (
            <MapView 
                gameState={gameState}
                setGameState={setGameState}
            />
        )}

        {gameState.currentView === 'SCAN' && (
            <ScanView 
                gameState={gameState}
                setGameState={setGameState}
                setStatDiffs={setStatDiffs}
                saveGame={saveGame}
            />
        )}

        {gameState.currentView === 'STORE' && (
            <StoreView gameState={gameState} />
        )}

        {(gameState.currentView === 'BATTLE' || gameState.currentView === 'VICTORY' || gameState.currentView === 'DEFEAT') && (
            <BattleView 
                gameState={gameState}
                setGameState={setGameState}
                saveGame={saveGame}
            />
        )}
      </main>
    </div>
  );
}
