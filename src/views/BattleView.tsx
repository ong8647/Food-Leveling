import React, { useState, useRef, useEffect } from 'react';
import { GameState, PetType } from '../types';
import { BOSS_DATA, Icons, ASSETS } from '../constants';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface DamagePopup {
  id: number;
  value: string | number;
  color: string;
  target: 'boss' | 'player';
  timestamp: number;
}

interface BattleViewProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    saveGame: (state: GameState) => void;
}

export const BattleView: React.FC<BattleViewProps> = ({ gameState, setGameState, saveGame }) => {
  const [bossVfx, setBossVfx] = useState<string>('');
  const [playerVfx, setPlayerVfx] = useState<string>('');
  const [activeMicroPetAnim, setActiveMicroPetAnim] = useState<{index: number, type: string} | null>(null);
  const [turnAction, setTurnAction] = useState<'IDLE' | 'ATTACK' | 'DEFEND' | 'HIT'>('IDLE');
  const [showMainAttackVfx, setShowMainAttackVfx] = useState(false);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  
  const narrativeEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    narrativeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.narrativeHistory]);

  const bossBgClass = gameState.currentBoss?.bgGradient || "bg-battle-grid";

  const triggerVfx = (target: 'player' | 'boss', type: string) => {
    if (target === 'boss') {
        setBossVfx(type); 
        setTimeout(() => setBossVfx(''), 600);
    } else {
        setPlayerVfx(type);
        setTimeout(() => setPlayerVfx(''), 600);
    }
  };

  const addDamagePopup = (value: string | number, color: string, target: 'boss' | 'player') => {
      const id = Date.now() + Math.random();
      setDamagePopups(prev => [...prev, { id, value, color, target, timestamp: Date.now() }]);
      setTimeout(() => {
          setDamagePopups(prev => prev.filter(p => p.id !== id));
      }, 1000);
  };

  const getDamageColor = (type: string) => {
      const t = type.toLowerCase();
      if (t.includes('heal') || t.includes('carbi')) return 'text-green-500 font-bold';
      if (t.includes('recoil') || t.includes('fatling') || t.includes('fat')) return 'text-purple-600 font-bold';
      if (t.includes('proteon') || t.includes('protein')) return 'text-red-500 font-bold';
      if (t.includes('fiber')) return 'text-blue-500 font-bold';
      return 'text-white';
  };

  const getAnimationFor = (petName: string) => {
    if (petName.includes('Carbi')) return 'animate-zoom-attack';
    if (petName.includes('Proteon')) return 'animate-punch-attack';
    if (petName.includes('Fiber')) return 'animate-shield-pulse';
    return 'animate-flash-white';
  };
  
  const getMicroPetEmoji = (name: string) => {
    if (name.includes('Carbi')) return '/images/carbi-pet.png';
    if (name.includes('Proteon')) return '/images/proteon-pet.png';
    if (name.includes('Fiber')) return '/images/fiber-pet.png';
    if (name.includes('Fatling')) return '/images/fatling-pet.png';
    return '✨';
  }

  const renderHpBar = (current: number, max: number, color: string = "bg-green-500") => (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300 relative">
        <div 
           className={`h-full ${color} transition-all duration-500 ease-out`} 
           style={{width: `${Math.max(0, (current / max) * 100)}%`}}
        />
    </div>
  );

  const renderMainPetVfx = () => {
      if (!showMainAttackVfx) return null;
      if (gameState.petName === 'Cat') {
          return <div className="absolute left-10 bottom-10 z-50 animate-leaf-slash"><div className="w-12 h-12 bg-green-400 rounded-full blur-sm opacity-80" style={{boxShadow: '-4px -4px 0 4px #22c55e'}}></div></div>;
      }
      if (gameState.petName === 'Panda') {
          return <div className="absolute left-10 bottom-20 z-50 animate-thunder-strike"><Icons.Zap className="w-24 h-24 text-yellow-400 fill-yellow-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" /></div>;
      }
      if (gameState.petName === 'Turtle') {
           return <div className="absolute left-10 bottom-10 z-50 animate-rock-throw"><div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-gray-400 shadow-xl"></div></div>;
      }
      return null;
  };

  const handleVictory = (finalBossHp: number) => {
       setGameState(prev => {
            if (!prev.currentBoss) return prev;
            
            const currentBossIndex = BOSS_DATA.findIndex(b => b.name === prev.currentBoss?.name);
            let nextUnlockedIndex = prev.unlockedBossIndex;
            
            if (currentBossIndex === prev.unlockedBossIndex && prev.unlockedBossIndex < BOSS_DATA.length - 1) {
                nextUnlockedIndex = prev.unlockedBossIndex + 1;
            }

            const nextState = {
                ...prev,
                currentBoss: { ...prev.currentBoss, hp: 0 },
                currentView: 'VICTORY' as const,
                unlockedBossIndex: nextUnlockedIndex,
                tokens: (prev.tokens || 0) + 1, 
                isLoading: false
            };
            saveGame(nextState);
            return nextState;
       });
       setTurnAction('IDLE');
  };

  const handleDefeat = () => {
      setGameState(prev => ({
           ...prev,
           currentView: 'DEFEAT' as const,
           isLoading: false
      }));
      setTurnAction('IDLE');
  };
  
  const fleeBattle = () => {
      setGameState(prev => ({
          ...prev,
          currentView: 'HUB',
          currentBoss: null,
          narrativeHistory: [...prev.narrativeHistory, { speaker: 'Narrator', text: "You fled safely to the Hub." }]
      }));
  };

  const executeBattleTurn = async (actionType: 'ATTACK' | 'DEFEND') => {
    if (!gameState.currentBoss || !gameState.petName) return;

    setTurnAction(actionType);
    setGameState(prev => ({ ...prev, isLoading: true }));

    let simulatedBossHp = gameState.currentBoss.hp;
    let simulatedPlayerHp = gameState.stats.hp; 

    try {
        const isAttack = actionType === 'ATTACK';
        
        // --- 1. MAIN PET ACTION ---
        const mainDamage = isAttack 
            ? Math.floor(gameState.stats.attack * (0.9 + Math.random() * 0.4)) 
            : 0;

        if (isAttack) {
            setShowMainAttackVfx(true);
            setTimeout(() => setShowMainAttackVfx(false), 700);
            await wait(600);
            
            simulatedBossHp -= mainDamage; 

            if (mainDamage > 0) {
                triggerVfx('boss', 'animate-shake animate-flash-red');
                addDamagePopup(mainDamage, "text-white text-4xl", 'boss');
            } else {
                 addDamagePopup("Miss", "text-gray-400", 'boss');
            }

            setGameState(prev => ({
                 ...prev,
                 narrativeHistory: [...prev.narrativeHistory, { speaker: 'Narrator', text: `${gameState.petName} attacks!` }],
                 currentBoss: prev.currentBoss ? { ...prev.currentBoss, hp: Math.max(0, simulatedBossHp) } : null
            }));
            
            if (simulatedBossHp <= 0) { await wait(500); handleVictory(simulatedBossHp); return; }
            await wait(1000); 
        } else {
             triggerVfx('player', 'animate-shield-bloom');
             setGameState(prev => ({
                 ...prev,
                 narrativeHistory: [...prev.narrativeHistory, { speaker: 'Narrator', text: `${gameState.petName} defends!` }]
             }));
             await wait(1000);
        }

        setTurnAction('IDLE'); 

        // --- PHASE 2: MICRO PETS ---
        const activeMicroPets = isAttack ? gameState.microPets : [];
        
        if (activeMicroPets.length > 0) {
            await wait(500);

            for (let i = 0; i < activeMicroPets.length; i++) {
                 const mpObject = activeMicroPets[i];
                 
                 setActiveMicroPetAnim({ index: i, type: getAnimationFor(mpObject.name) });
                 
                 let actionText = "";
                 let value = 0;
                 let type: 'damage' | 'heal' | 'recoil' = 'damage';

                 if (mpObject.name.includes('Proteon')) {
                     value = Math.max(2, Math.floor((gameState.stats.attack + gameState.stats.hp) * 0.2));
                     actionText = "strikes hard!";
                     type = 'damage';
                 } 
                 else if (mpObject.name.includes('Fiberling')) {
                     value = Math.max(2, Math.floor(gameState.stats.defense * 0.5));
                     actionText = "bashes!";
                     type = 'damage';
                 }
                 else if (mpObject.name.includes('Carbi')) {
                     value = Math.max(2, Math.floor(gameState.stats.speed * 0.5));
                     actionText = "heals you!";
                     type = 'heal';
                 }
                 else if (mpObject.name.includes('Fatling')) {
                     value = Math.max(4, Math.floor(gameState.stats.special * 1.5));
                     actionText = "goes berserk!";
                     type = 'recoil';
                 }
                 else {
                     value = 2; 
                     actionText = "helps out!";
                 }

                 setGameState(prev => ({
                     ...prev,
                     narrativeHistory: [...prev.narrativeHistory, { speaker: 'System', text: `${mpObject.name} ${actionText}` }]
                 }));

                 await wait(600);

                 if (type === 'damage') {
                     simulatedBossHp -= value;
                     triggerVfx('boss', 'animate-shake animate-flash-white');
                     addDamagePopup(value, getDamageColor(mpObject.name), 'boss');
                     setGameState(prev => ({ ...prev, currentBoss: prev.currentBoss ? { ...prev.currentBoss, hp: Math.max(0, simulatedBossHp) } : null }));
                 } 
                 else if (type === 'heal') {
                     const healAmount = value;
                     simulatedPlayerHp = Math.min(gameState.stats.maxHp, simulatedPlayerHp + healAmount);
                     triggerVfx('player', 'animate-flash-white');
                     addDamagePopup(`+${healAmount}`, getDamageColor('heal'), 'player');
                     setGameState(prev => ({ ...prev, stats: { ...prev.stats, hp: simulatedPlayerHp } }));
                 }
                 else if (type === 'recoil') {
                     simulatedBossHp -= value;
                     triggerVfx('boss', 'animate-shake animate-flash-red');
                     addDamagePopup(value, getDamageColor('fatling'), 'boss');
                     setGameState(prev => ({ ...prev, currentBoss: prev.currentBoss ? { ...prev.currentBoss, hp: Math.max(0, simulatedBossHp) } : null }));
                     
                     const recoilDmg = Math.max(1, Math.floor(value * 0.2)); 
                     simulatedPlayerHp -= recoilDmg;
                     await wait(300);
                     addDamagePopup(`-${recoilDmg}`, getDamageColor('recoil'), 'player');
                     triggerVfx('player', 'animate-shake');
                     setGameState(prev => ({ ...prev, stats: { ...prev.stats, hp: simulatedPlayerHp } }));
                 }

                 await wait(200);
                 setActiveMicroPetAnim(null);

                 if (simulatedBossHp <= 0) { await wait(500); handleVictory(simulatedBossHp); return; }
                 if (simulatedPlayerHp <= 0) { await wait(500); handleDefeat(); return; }

                 await wait(1000);
            }
        }
        
        // --- PHASE 3: BOSS ATTACK ---
        const bossBaseDmg = 4 + (gameState.unlockedBossIndex * 2); 
        const playerMitigation = gameState.stats.defense * 0.1;
        const playerDamage = actionType === 'DEFEND' 
            ? Math.max(1, Math.floor((bossBaseDmg - playerMitigation) / 2)) 
            : Math.max(1, Math.floor(bossBaseDmg - playerMitigation));

        setGameState(prev => ({
             ...prev,
             narrativeHistory: [...prev.narrativeHistory, { speaker: 'Boss', text: `${gameState.currentBoss?.name} retaliates!` }]
        }));
        
        await wait(500);
        
        triggerVfx('player', 'animate-shake animate-flash-red');
        addDamagePopup(playerDamage, "text-red-600 font-bold text-4xl", 'player');

        simulatedPlayerHp -= playerDamage;
        
        setGameState(prev => {
            return {
                ...prev,
                stats: { ...prev.stats, hp: Math.max(0, simulatedPlayerHp) },
                narrativeHistory: [...prev.narrativeHistory, { speaker: 'System', text: `You took ${playerDamage} damage!` }]
            };
        });

         if (simulatedPlayerHp <= 0) { await wait(500); handleDefeat(); return; }
         
         await wait(1000);
         setGameState(prev => ({ ...prev, isLoading: false }));

    } catch (e) {
         console.error(e);
         setGameState(prev => ({ 
             ...prev, 
             isLoading: false,
             narrativeHistory: [...prev.narrativeHistory, { speaker: 'System', text: "Critical failure. Turn skipped." }]
         }));
         setTurnAction('IDLE');
    }
  };

  if (!gameState.currentBoss) return null;

  return (
    <div className={`absolute inset-0 z-20 flex flex-col ${bossBgClass}`}
        style={{
                    backgroundImage: "url('/images/game-background-1.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}
    >
                
        {/* VICTORY/DEFEAT OVERLAY */}
        {(gameState.currentView === 'VICTORY' || gameState.currentView === 'DEFEAT') && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in">
                {gameState.currentView === 'VICTORY' ? (
                    <>
                        <div className="text-8xl animate-bounce-gentle mb-4">🏆</div>
                        <h2 className="text-4xl font-display font-bold text-yellow-400 mb-2 text-center">VICTORY!</h2>
                        <p className="text-white/80 text-center mb-8">The {gameState.currentBoss.name} has been purified!</p>
                        <div className="flex flex-col items-center gap-2 mb-8 animate-pop-in-stay">
                            <span className="text-sm text-yellow-200 uppercase font-bold tracking-widest">Reward</span>
                            <div className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                                <span>💰</span>
                                <span>+1 Token</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setGameState(prev => ({...prev, currentView: 'MAP'}))}
                            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-bold rounded-full shadow-lg transform transition hover:scale-105"
                        >
                            Return to Map
                        </button>
                    </>
                ) : (
                    <>
                        <div className="text-8xl animate-shake mb-4">💔</div>
                        <h2 className="text-4xl font-display font-bold text-red-400 mb-2 text-center">DEFEATED</h2>
                        <p className="text-white/80 text-center mb-8">Don't give up! Eat healthy and rest to try again.</p>
                        <button 
                            onClick={() => setGameState(prev => ({...prev, currentView: 'HUB'}))}
                            className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-full shadow-lg transform transition hover:scale-105"
                        >
                            Back to Hub
                        </button>
                    </>
                )}
            </div>
        )}

        {/* 1. The Arena */}
        <div className="flex-1 relative overflow-hidden">
            
            {/* Floating Damage Numbers */}
            {damagePopups.map(p => (
                <div 
                    key={p.id}
                    className={`absolute font-black text-4xl z-50 pointer-events-none animate-damage-float ${p.color}`}
                    style={{ 
                        top: p.target === 'boss' ? '25%' : '65%', 
                        left: p.target === 'boss' ? '70%' : '30%',
                        textShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                    }}
                >
                    {typeof p.value === 'number' && p.value > 0 ? `-${p.value}` : p.value}
                </div>
            ))}

            {/* BOSS */}
            <div className="absolute top-8 right-6 flex flex-col items-end w-40 animate-float z-10">
                <div className="bg-white/90 p-2 rounded-lg shadow-md mb-2 w-full border border-gray-200">
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                            <span>{gameState.currentBoss.name}</span>
                            <span>Lv. {BOSS_DATA.findIndex(b => b.name === gameState.currentBoss?.name) + 1}</span>
                        </div>
                        {renderHpBar(gameState.currentBoss.hp, gameState.currentBoss.maxHp, "bg-red-500")}
                        <div className="text-right text-[10px] text-gray-500 mt-1 font-mono">
                            {gameState.currentBoss.hp}/{gameState.currentBoss.maxHp}
                        </div>
                </div>
                <div className={`relative ${bossVfx}`}>
                    <div className={`w-32 h-32 rounded-full ${gameState.currentBoss.imageColor} flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden`}>
                        <img 
                            src={ASSETS.bosses[gameState.currentBoss.img as keyof typeof ASSETS.bosses]} 
                            alt={gameState.currentBoss.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerText = '👹';
                            }}
                        />
                    </div>
                    {bossVfx && <div className="absolute inset-0 bg-white opacity-50 rounded-full animate-ping"></div>}
                </div>
                <div className="w-32 h-8 bg-black/10 rounded-[100%] blur-md -mt-4 transform scale-x-110"></div>
            </div>

            {/* PLAYER SIDE */}
            <div className="absolute bottom-4 left-6 flex flex-col items-start w-40 z-20">
                
                {/* Wrapper to isolate Main Pet Animation from Micro Pets */}
                <div className="relative">
                    
                    {/* 1. MAIN PET Container */}
                    <div className={`relative ${playerVfx} ${turnAction === 'ATTACK' ? 'animate-tackle' : turnAction === 'DEFEND' ? 'animate-defend-stance' : 'animate-float'}`}>
                        {renderMainPetVfx()}
                        
                        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-green-100 z-10 relative overflow-hidden">
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
                        <div className="w-28 h-6 bg-black/10 rounded-[100%] blur-md -mt-2 z-0"></div>
                    </div>

                    {/* 2. MICRO PETS Container */}
                    <div className="absolute bottom-2 left-[6.5rem] grid grid-cols-2 gap-1 z-20 w-24 pointer-events-none">
                        {gameState.microPets.map((mp, i) => (
                            <div 
                                key={i} 
                                className={`text-2xl transition-all ${activeMicroPetAnim?.index === i ? activeMicroPetAnim.type : 'animate-bounce-gentle'}`} 
                                style={{animationDelay: activeMicroPetAnim?.index === i ? '0s' : `${i * 0.2}s`}}
                            >
                                <img src={getMicroPetEmoji(mp.name)} alt={mp.name} className="w-8 h-8 object-contain" />
                            </div>
                        ))}
                        </div>
                        
                </div>

                {/* Player HUD */}
                <div className="bg-white/90 p-2 rounded-lg shadow-md mt-4 w-48 border border-green-200">
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                            <span>{gameState.petName}</span>
                            <span>HP {gameState.stats.hp}/{gameState.stats.maxHp}</span>
                        </div>
                        {renderHpBar(gameState.stats.hp, gameState.stats.maxHp, "bg-green-500")}
                        <div className="flex gap-1 mt-1 text-[10px] text-gray-400">
                            <span className="bg-gray-100 px-1 rounded">ATK {gameState.stats.attack}</span>
                            <span className="bg-gray-100 px-1 rounded">DEF {gameState.stats.defense}</span>
                        </div>
                </div>
            </div>
        </div>

        {/* 2. Dialogue */}
        <div className="h-48 flex-none bg-ghibli-dark text-white p-1 flex flex-col border-t-4 border-yellow-500 z-30">
            <div className="flex-1 bg-white/10 rounded-lg p-4 flex gap-4 overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-2">
                            {gameState.narrativeHistory.slice(-2).map((entry, idx) => (
                                <div key={idx} className="animate-fade-in">
                                    <span className={`font-bold mr-2 ${entry.speaker === 'Boss' ? 'text-red-400' : 'text-green-400'}`}>
                                        {entry.speaker}:
                                    </span>
                                    <span className="text-gray-100">{entry.text}</span>
                                </div>
                            ))}
                            {gameState.isLoading && <div className="text-yellow-400 animate-pulse">Thinking...</div>}
                            <div ref={narrativeEndRef} />
                        </div>
                    </div>

                    <div className="w-1/3 flex flex-col gap-2 border-l border-white/20 pl-4 justify-center">
                    <button 
                        onClick={() => executeBattleTurn('ATTACK')}
                        disabled={gameState.isLoading || gameState.currentView !== 'BATTLE'}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-2 rounded-lg shadow-lg active:transform active:scale-95 transition-all text-left border-b-4 border-red-800 text-sm disabled:opacity-50 disabled:grayscale"
                    >
                        ⚔️ FIGHT
                    </button>
                        <button 
                        onClick={() => executeBattleTurn('DEFEND')}
                        disabled={gameState.isLoading || gameState.currentView !== 'BATTLE'}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-2 rounded-lg shadow-lg active:transform active:scale-95 transition-all text-left border-b-4 border-blue-800 text-sm disabled:opacity-50 disabled:grayscale"
                    >
                        🛡️ DEFEND
                    </button>
                    <button 
                        onClick={fleeBattle}
                        disabled={gameState.isLoading || gameState.currentView !== 'BATTLE'}
                        className="bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-bold py-2 px-2 rounded-lg text-left text-sm border-b-4 border-yellow-700 disabled:opacity-50 disabled:grayscale shadow-lg active:transform active:scale-95 transition-all"
                    >
                        🏳️ FLEE
                    </button>
                    </div>
            </div>
            <div className="h-6 bg-black/20 text-xs text-center flex items-center justify-center text-white/30">
                {gameState.isLoading ? 'Processing Turn...' : 'Waiting for command...'}
            </div>
        </div>
    </div>
  );
};
