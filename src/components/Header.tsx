import React from 'react';
import { GameState } from '../types';

interface HeaderProps {
  gameState: GameState;
  onBack: () => void;
  onSaveAndQuit: () => void;
}

export const Header: React.FC<HeaderProps> = ({ gameState, onBack, onSaveAndQuit }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md p-4 flex-none z-10 border-b border-gray-100 flex justify-between items-center h-16">
      <div>
         <h1 className="font-display font-bold text-lg text-ghibli-black">Food Leveling</h1>
         <p className="text-xs text-gray-500">
             {gameState.currentView === 'BATTLE' ? 'Combat Mode' : `Level 1 • ${gameState.petName || 'Hero'}`}
          </p>
      </div>
      <div className="flex gap-2 items-center">
          {/* Tokens Display */}
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span>💰</span>
              <span>{gameState.tokens || 0}</span>
          </div>

          {(gameState.currentView === 'MAP' || gameState.currentView === 'SCAN' || gameState.currentView === 'STORE') && (
               <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-xs font-bold px-3">
                  Back
               </button>
          )}
          {gameState.currentView === 'HUB' && (
               <button onClick={onSaveAndQuit} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 text-xs font-bold px-3">
                  Save & Quit
               </button>
          )}
      </div>
    </header>
  );
};
