import React from 'react';
import { GameState } from '../types';

interface StoreViewProps {
    gameState: GameState;
}

export const StoreView: React.FC<StoreViewProps> = ({ gameState }) => {
    return (
        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-yellow-50/50">
                <div className="text-6xl animate-bounce-gentle mb-6">🏪</div>
                <h2 className="text-2xl font-bold text-ghibli-dark mb-2">Item Store</h2>
                <p className="text-gray-500 text-center mb-8">Spend your hard-earned tokens on upgrades!</p>
                
                <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-dashed border-gray-300 w-full text-center">
                    <p className="text-xl font-bold text-gray-400">Coming Soon</p>
                    <p className="text-xs text-gray-400 mt-2">The shopkeeper is currently restocking.</p>
                </div>
                
                <div className="mt-8 flex gap-2">
                    <span className="text-sm font-bold text-gray-600">Your Balance:</span>
                    <span className="bg-yellow-200 text-yellow-800 px-3 py-0.5 rounded-full text-sm font-bold flex items-center gap-1">
                    🪙 {gameState.tokens || 0}
                    </span>
                </div>
        </div>
    );
};
