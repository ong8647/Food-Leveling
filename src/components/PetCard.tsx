
import React from 'react';
import { PetType } from '../types';
import { Icons } from '../constants';

interface PetCardProps {
  type: PetType;
  selected?: boolean;
  onClick?: () => void;
  imageSrc: string;
}

export const PetCard: React.FC<PetCardProps> = ({ type, selected, onClick, imageSrc }) => {
  const getPetVisuals = () => {
    switch (type) {
      case 'Cat':
        return {
          bg: 'bg-green-100',
          border: 'border-green-400',
          desc: 'Gentle spirit of the forest.',
          specialty: 'Balanced / Recovery',
          icon: <Icons.Heart className="w-4 h-4" />
        };
      case 'Panda':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-400',
          desc: 'Energetic spark of passion.',
          specialty: 'High Speed / Critical',
          icon: <Icons.Zap className="w-4 h-4" />
        };
      case 'Turtle':
        return {
          bg: 'bg-stone-200',
          border: 'border-stone-400',
          desc: 'Sturdy guardian of health.',
          specialty: 'High Defense / HP',
          icon: <Icons.Shield className="w-4 h-4" />
        };
    }
  };

  const visuals = getPetVisuals();

  return (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer relative overflow-hidden rounded-3xl p-6 transition-all duration-300
        ${visuals.bg} border-4 
        ${selected ? `${visuals.border} scale-105 shadow-xl` : 'border-transparent shadow-sm hover:shadow-md'}
      `}
    >
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 mb-4 animate-bounce-gentle filter drop-shadow-md">
            <img 
                src={imageSrc} 
                alt={type} 
                className="w-full h-full object-contain"
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    if ((e.target as HTMLImageElement).parentElement) {
                         (e.target as HTMLImageElement).parentElement!.innerText = '🐾';
                    }
                }}
            />
        </div>
        <h3 className="text-xl font-display font-bold text-ghibli-dark">{type}</h3>
        <p className="text-sm text-gray-600 text-center mt-2 font-sans italic">"{visuals.desc}"</p>
        
        {/* Specialty Badge */}
        <div className="mt-4 flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full text-xs font-bold text-gray-700 uppercase tracking-wide">
            {visuals.icon}
            {visuals.specialty}
        </div>
      </div>
      
      {selected && (
        <div className="absolute top-3 right-3 text-green-600">
          <Icons.Heart className="w-6 h-6 fill-current" />
        </div>
      )}
    </div>
  );
};
