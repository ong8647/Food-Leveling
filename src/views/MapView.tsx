import React from 'react';
import { GameState } from '../types';
import { BOSS_DATA, ASSETS } from '../constants';
import { generateGameContent } from '../services/geminiService';

interface MapViewProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const MapView: React.FC<MapViewProps> = ({ gameState, setGameState }) => {

    const startBattle = (bossIndex: number) => {
        const boss = BOSS_DATA[bossIndex];
        setGameState(prev => ({
          ...prev,
          currentBoss: { ...boss },
          currentView: 'BATTLE',
          narrativeHistory: [],
          isLoading: true
        }));
    
        // We only call the AI once at the start of battle for the Intro
        generateGameContent('bossIntro', gameState.petName!, gameState.stats, gameState.microPets, boss.name, null, null, null)
          .then(result => {
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                narrativeHistory: [
                    { speaker: 'Narrator', text: result.storyEvent },
                    { speaker: 'Boss', text: result.bossMessage || "..." }
                ]
            }));
          })
          .catch(() => {
            setGameState(prev => ({ 
                ...prev, 
                isLoading: false,
                narrativeHistory: [
                     { speaker: 'Narrator', text: `You encounter the ${boss.name}!` },
                     { speaker: 'Boss', text: "You cannot pass!" }
                ]
            }));
          });
    };

    return (
        <div className="flex-1 bg-ghibli-dark/5 p-6 relative overflow-y-auto"
            style={{
                    backgroundImage: "url('/images/game-background-2.jpg')", 
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
        >
            <h2 className="text-center font-display font-bold text-2xl text-ghibli-dark mb-8">World Map</h2>
            
            <div className="relative flex flex-col items-center gap-12 pb-12">
                    <div className="absolute top-8 bottom-8 left-1/2 w-1 bg-gray-300 -translate-x-1/2 z-0 border-l-2 border-dashed border-gray-400"></div>

                    {BOSS_DATA.map((boss, idx) => {
                        const isUnlocked = idx <= gameState.unlockedBossIndex;
                        const isDefeated = idx < gameState.unlockedBossIndex;
                        const bossImg = ASSETS.bosses[boss.img as keyof typeof ASSETS.bosses];
                        
                        return (
                            <button
                            key={idx}
                            disabled={!isUnlocked}
                            onClick={() => startBattle(idx)}
                            className={`
                                relative z-10 w-full max-w-xs p-4 rounded-2xl transition-all duration-300
                                flex items-center gap-4
                                ${isUnlocked ? 'bg-white shadow-lg scale-100 cursor-pointer' : 'bg-gray-200 grayscale opacity-70 cursor-not-allowed'}
                                ${isDefeated ? 'border-2 border-green-400' : ''}
                            `}
                            >
                                <div className={`
                                w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner overflow-hidden
                                ${isUnlocked ? boss.imageColor : 'bg-gray-300'}
                                `}>
                                    {isUnlocked ? (
                                    <img src={bossImg} alt={boss.name} className="w-full h-full object-cover" 
                                            onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerText = '👹';
                                        }}
                                    />
                                ) : (
                                    '🔒'
                                )}
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="font-bold text-gray-800">{boss.name}</h3>
                                    <p className="text-xs text-gray-500">Stage {idx + 1}</p>
                                    {isDefeated && <span className="text-xs text-green-600 font-bold">CLEARED ✓</span>}
                                </div>
                                {isUnlocked && !isDefeated && (
                                    <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                        FIGHT
                                    </div>
                                )}
                            </button>
                        );
                    })}
            </div>
            <p className="text-center text-black-500 text-sm mt-6">More levels coming soon...</p>
        </div>
    );
};
