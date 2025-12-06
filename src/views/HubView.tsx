import React, { useState } from 'react';
import { GameState, Stats, MicroPet } from '../types';
import { Icons, ASSETS } from '../constants';

interface HubViewProps {
    gameState: GameState;
    statDiffs: Partial<Stats>;
    onNavigate: (view: GameState['currentView']) => void;
}

export const HubView: React.FC<HubViewProps> = ({ gameState, statDiffs, onNavigate }) => {
    const [selectedMicroPet, setSelectedMicroPet] = useState<MicroPet | null>(null);


    const getMicroPetEmoji = (name: string) => {
        if (name.includes('Carbi')) return '/images/carbi-pet.png';
        if (name.includes('Proteon')) return '/images/proteon-pet.png';
        if (name.includes('Fiber')) return '/images/fiber-pet.png';
        if (name.includes('Fatling')) return '/images/fatling-pet.png';
        return '✨';
    }

    const renderStats = () => (
        <div className="grid grid-cols-3 gap-2 text-sm bg-white/50 p-3 rounded-xl border border-ghibli-blue/20">
          {[
              { key: 'hp', icon: Icons.Heart, color: 'text-red-600', max: gameState.stats.maxHp },
              { key: 'attack', icon: Icons.Sword, color: 'text-orange-600' },
              { key: 'defense', icon: Icons.Shield, color: 'text-blue-600' },
              { key: 'speed', icon: Icons.Zap, color: 'text-yellow-600' },
              { key: 'special', icon: Icons.Star, color: 'text-purple-600' },
          ].map((s) => {
              const currentVal = gameState.stats[s.key as keyof Stats];
              const diff = statDiffs[s.key as keyof Stats];
              return (
                <div key={s.key} className={`flex items-center ${s.color} relative`}>
                    <s.icon className="w-4 h-4 mr-1" /> 
                    <span>{currentVal}{s.max ? `/${s.max}` : ''}</span>
                    {diff && diff > 0 && (
                        <span className="absolute -top-4 right-0 text-green-600 font-bold animate-pop-in-stay text-xs bg-white px-1 rounded-full shadow-sm z-10">
                            +{diff}
                        </span>
                    )}
                </div>
              );
          })}
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="bg-gradient-to-br from-green-100 to-blue-50 rounded-3xl p-6 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative z-10">
                    <div className="w-32 h-32 mx-auto animate-bounce-gentle mb-2 drop-shadow-lg">
                            <img 
                            src={ASSETS.pets[gameState.petName!]}
                            alt={gameState.petName || 'Pet'}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerText = '🐾';
                            }}
                            />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-gray-700">{gameState.petName}</h2>
                    <div className="mt-4">
                        {renderStats()}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-gray-600 mb-2 px-1">Food Spirits</h3>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {gameState.microPets.map((mp, i) => (
                        <button 
                        key={i} 
                        onClick={() => setSelectedMicroPet(mp)}
                        className="flex flex-col items-center bg-white p-2 rounded-full shadow-sm min-w-[60px] animate-float hover:scale-110 transition-transform relative" 
                        style={{animationDelay: `${i*0.5}s`}}
                        >
                        <div className="text-xl">
                            <img src={getMicroPetEmoji(mp.name)} alt={mp.name} className="w-8 h-8 object-contain" />
                        </div>
                        <div className="text-[10px] font-bold text-gray-600 truncate w-full text-center">{mp.name}</div>
                        {mp.level > 1 && (
                            <div className="absolute -top-1 -right-1 bg-ghibli-gold text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white">
                                {mp.level}
                            </div>
                        )}
                        </button>
                    ))}
                    {gameState.microPets.length === 0 && (
                        <div className="text-xs text-gray-400 italic mt-2">No food spirits yet. Scan food!</div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                    <button 
                    onClick={() => onNavigate('SCAN')}
                    className="bg-white p-4 rounded-2xl shadow-sm border-2 border-dashed border-ghibli-blue hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                    <Icons.Scan className="w-8 h-8 text-ghibli-blue" />
                    <span className="font-bold text-ghibli-blue">Scan Food</span>
                    </button>
                    <button 
                    onClick={() => onNavigate('MAP')}
                    className="bg-gradient-to-br from-orange-100 to-yellow-100 p-4 rounded-2xl shadow-sm border border-orange-200 flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                    <div className="text-2xl">🗺️</div>
                    <div className="text-center">
                            <h3 className="font-bold text-gray-800">Adventure Map</h3>
                            <p className="text-[10px] text-gray-500">Battle Bosses</p>
                    </div>
                </button>
                {/* STORE BUTTON */}
                <button 
                    onClick={() => onNavigate('STORE')}
                    className="col-span-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                >
                    <span className="text-xl">🏪</span>
                    <span className="font-bold text-gray-600">Item Store</span>
                </button>
            </div>

             {/* DETAILS MODAL */}
            {selectedMicroPet && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in relative">
                        <button 
                            onClick={() => setSelectedMicroPet(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
                        >
                            ✕
                        </button>
                        <div className="flex flex-col items-center mb-4">
                            <div className="text-6xl mb-2">
                                <img src={getMicroPetEmoji(selectedMicroPet.name)} alt={selectedMicroPet.name} className="w-16 h-16 object-contain" />
                            </div>
                            <h3 className="text-2xl font-bold text-ghibli-dark">{selectedMicroPet.name}</h3>
                            <div className="bg-ghibli-gold text-white px-3 py-1 rounded-full text-xs font-bold mt-1">
                                Level {selectedMicroPet.level}
                            </div>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Power Source History</h4>
                            <div className="space-y-2">
                                {selectedMicroPet.contributions.map((c, i) => (
                                    <div key={i} className="bg-gray-50 p-3 rounded-xl text-sm flex justify-between items-center">
                                        <span className="font-bold text-gray-700">{c.source}</span>
                                        <div className="flex gap-1">
                                            {Object.entries(c.stats).map(([k, v]) => (
                                                <span key={k} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    +{v} {k.slice(0,3)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
