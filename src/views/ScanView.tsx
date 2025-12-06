import React, { useState, useRef, useEffect } from 'react';
import { GameState, Stats, NarrativeEntry, MicroPet } from '../types';
import { generateGameContent } from '../services/geminiService';
import { Icons } from '../constants';

const QUICK_FOODS = [
  { label: "🍎 Apple", value: "Apple" },
  { label: "🥩 Steak", value: "Steak" },
  { label: "🥑 Avocado", value: "Avocado" },
  { label: "🍰 Cake", value: "Chocolate Cake" },
];

interface ScanViewProps {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    setStatDiffs: React.Dispatch<React.SetStateAction<Partial<Stats>>>;
    saveGame: (state: GameState) => void;
}

export const ScanView: React.FC<ScanViewProps> = ({ gameState, setGameState, setStatDiffs, saveGame }) => {
    const [scanInput, setScanInput] = useState('');
    const [scanError, setScanError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startCamera = async () => {
        try {
          setIsCameraActive(true);
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setScanError("Could not access camera. Try simulation mode.");
          setIsCameraActive(false);
        }
    };
    
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    };
    
    const captureImage = (): string | null => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                return canvasRef.current.toDataURL('image/jpeg');
            }
        }
        return null;
    };
    
    useEffect(() => {
          return () => stopCamera();
    }, []);

    const handleScanFood = async (manualInput?: string, imageBase64?: string) => {
        const inputToUse = manualInput || scanInput;
        if ((!inputToUse.trim() && !imageBase64) || !gameState.petName) return;
    
        setGameState(prev => ({ ...prev, isLoading: true }));
        setScanError(null);
        setStatDiffs({});
        stopCamera();
        
        try {
            const result = await generateGameContent(
              'foodScan',
              gameState.petName,
              gameState.stats,
              gameState.microPets,
              null,
              inputToUse || null,
              imageBase64 || null,
              null
            );
    
            if (result.type === 'error') throw new Error(result.storyEvent);
    
            setGameState(prev => {
              const incomingStats = result.stats || {};
              const newStats = { ...prev.stats };
              const diffs: Partial<Stats> = {};
    
              (Object.keys(prev.stats) as Array<keyof Stats>).forEach(key => {
                 if (incomingStats[key] !== undefined) {
                     if (incomingStats[key] && incomingStats[key] !== prev.stats[key]) {
                          const boost = incomingStats[key] as number;
                          newStats[key] = prev.stats[key] + boost;
                          diffs[key] = boost;
                     }
                 }
              });
              
              setStatDiffs(diffs);
    
              const newMicroPets = [...prev.microPets];
              if (result.microPets) {
                result.microPets.forEach(mp => {
                    const cleanName = mp.name.replace(/[^\w\s]/gi, '').trim();
                    const existingIndex = newMicroPets.findIndex(p => p.name.toLowerCase() === cleanName.toLowerCase());
                    const contribution = {
                        source: imageBase64 ? 'Scanned Meal' : (inputToUse || 'Food'),
                        stats: diffs,
                        timestamp: Date.now()
                    };
    
                    if (existingIndex >= 0) {
                        newMicroPets[existingIndex] = {
                            ...newMicroPets[existingIndex],
                            level: newMicroPets[existingIndex].level + 1,
                            contributions: [contribution, ...newMicroPets[existingIndex].contributions]
                        };
                    } else {
                        newMicroPets.push({
                            name: cleanName,
                            description: 'A helpful food spirit.',
                            level: 1,
                            contributions: [contribution]
                        });
                    }
                });
              }
    
              const nextState = {
                ...prev,
                stats: newStats,
                microPets: newMicroPets,
                narrativeHistory: [
                  ...prev.narrativeHistory,
                  { speaker: 'System', text: imageBase64 ? 'Scanned Image' : `Scanned: ${inputToUse}` } as NarrativeEntry,
                  { speaker: 'Narrator', text: result.storyEvent } as NarrativeEntry,
                  ...(result.mainPetMessage ? [{ speaker: 'Pet', text: result.mainPetMessage } as NarrativeEntry] : [])
                ],
                currentView: 'HUB' as const
              };
              saveGame(nextState);
              return nextState;
            });
        } catch (e: any) {
            setScanError(e.message || "Connection failed. Please try again.");
        } finally {
            setGameState(prev => ({...prev, isLoading: false}));
            setScanInput('');
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 overflow-y-auto relative">
            {gameState.isLoading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
                    <div className="text-6xl animate-bounce-gentle mb-4">🔮</div>
                    <h3 className="text-xl font-bold text-ghibli-blue">Analyzing Nutrition...</h3>
                    <p className="text-sm text-gray-500 mt-2">Summoning spirits...</p>
                </div>
            )}

            <div className="w-full aspect-square bg-gray-800 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl">
                {!isCameraActive ? (
                    <>
                        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600&auto=format&fit=crop')] bg-cover"></div>
                        <div className="text-white/50 text-center p-6 relative z-10">
                            <Icons.Scan className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                            <button 
                                onClick={startCamera}
                                className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-lg text-white font-bold border border-white/50 transition-all"
                            >
                                Use Camera
                            </button>
                            <p className="text-xs mt-2 opacity-70">or use manual input below</p>
                        </div>
                    </>
                ) : (
                    <div className="relative w-full h-full">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                            <button 
                                onClick={() => {
                                    const img = captureImage();
                                    if (img) handleScanFood(undefined, img);
                                }}
                                className="w-16 h-16 rounded-full bg-white border-4 border-ghibli-green shadow-lg animate-pulse"
                            ></button>
                            <button 
                                onClick={stopCamera}
                                className="px-4 py-2 bg-red-500 text-white rounded-full text-xs font-bold shadow-md"
                            >
                                Stop
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {scanError && (
                <div className="w-full bg-red-100 border border-red-300 text-red-700 p-3 rounded-xl text-sm text-center animate-shake">
                    {scanError}
                </div>
            )}
            
            {!isCameraActive && (
                <div className="w-full space-y-4 animate-fade-in">
                    <label className="block text-sm font-bold text-gray-600">Quick Scan (Simulation)</label>
                    <div className="grid grid-cols-2 gap-2">
                        {QUICK_FOODS.map((food) => (
                            <button
                                key={food.label}
                                type="button"
                                onClick={() => handleScanFood(food.value)}
                                disabled={gameState.isLoading}
                                className="bg-white border border-ghibli-blue text-ghibli-blue font-bold py-2 px-4 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 text-sm active:bg-blue-200"
                            >
                                {food.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 border-t pt-4">
                        <input 
                            type="text" 
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            placeholder="Type custom food..."
                            className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ghibli-green"
                            onKeyDown={(e) => e.key === 'Enter' && handleScanFood()}
                        />
                        <button 
                            onClick={() => handleScanFood()}
                            disabled={gameState.isLoading}
                            className="bg-ghibli-green text-white p-3 rounded-xl font-bold disabled:opacity-50 shadow-md"
                        >
                            Scan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
