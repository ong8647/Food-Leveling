import React from 'react';
import { GameState, PetType } from '../types';
import { ASSETS } from '../constants';
import { PetCard } from '../components/PetCard';

interface IntroViewProps {
    hasSaveData: boolean;
    isNewGameSelection: boolean;
    gameState: GameState;
    onContinue: () => void;
    onStartNewGameFlow: () => void;
    onBackToMenu: () => void;
    onSelectPet: (pet: PetType) => void;
    onConfirmPet: () => void;
}

export const IntroView: React.FC<IntroViewProps> = ({ 
    hasSaveData, isNewGameSelection, gameState, 
    onContinue, onStartNewGameFlow, onBackToMenu, onSelectPet, onConfirmPet 
}) => {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-ghibli-cream to-green-50"
        style={{
            backgroundImage: "url('/images/home-page.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
            }}
        >
        
        <h1 className="text-4xl md:text-5xl font-display font-bold text-ghibli-black mb-2 text-center">Food Leveling</h1>
        <h2 className="text-xl text-ghibli-black mb-8 font-sans font-semibold tracking-widest text-center">by Ong Shi Hoong</h2>
        
        {hasSaveData && !isNewGameSelection && (
            <div className="flex flex-col gap-4 w-full max-w-sm">
                <button 
                    onClick={onContinue}
                    className="w-full px-8 py-4 bg-ghibli-blue text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-600 transition-colors animate-pulse-slow"
                >
                    Continue Journey
                </button>
                <button 
                    onClick={onStartNewGameFlow}
                    className="w-full px-8 py-4 bg-white text-ghibli-green border-2 border-ghibli-green rounded-2xl font-bold text-lg shadow-lg hover:bg-green-50 transition-colors"
                >
                    Start New Game
                </button>
            </div>
        )}

        {(!hasSaveData || isNewGameSelection) && (
            <>
                {isNewGameSelection && hasSaveData && (
                    <button 
                        onClick={onBackToMenu} 
                        className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 font-bold"
                    >
                        ← Back
                    </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
                  {(['Cat', 'Panda', 'Turtle'] as PetType[]).map(pet => (
                    <PetCard 
                      key={pet}
                      type={pet} 
                      selected={gameState.petName === pet}
                      onClick={() => onSelectPet(pet)}
                      imageSrc={ASSETS.pets[pet]}
                    />
                  ))}
                </div>
                
                {gameState.petName ? (
                    <div className="col-span-1 md:col-span-3 flex justify-center mt-6">
                        <button 
                            onClick={onConfirmPet}
                            className="px-8 py-3 bg-ghibli-green text-white rounded-full font-bold text-lg shadow-lg hover:bg-green-600 transition-colors animate-bounce-gentle"
                        >
                            Start Journey
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 text-gray-500 italic animate-pulse">Choose your main adventurer to begin...</div>
                )}
            </>
        )}
      </div>
    );
};
