import React from 'react';

// Using SVG paths directly to avoid dependency on lucide-react in this generated environment
export const Icons = {
  Heart: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  ),
  Sword: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m14.5 17.5-5-5"/><path d="m11.5 14.5 7 7 1.5-1.5-7-7"/><path d="M8.5 11.5 3 17.5 4.5 19l6-5.5"/><path d="M16 3h5v5"/><path d="M21 3 8 16"/></svg>
  ),
  Shield: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  Zap: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Scan: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
  ),
  ChevronLeft: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
  ),
  Star: (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  )
};

export const INITIAL_STATS = {
  hp: 25,
  maxHp: 25,
  attack: 15,
  defense: 5,
  speed: 6,
  special: 5
};

// VITE ASSET RESOLUTION (RELATIVE TO THIS FILE)
// This file is in /src/constants.tsx
// Images are in /src/images/
// Path: ./images/name.png
export const ASSETS = {
    pets: {
        Cat: '/images/cat main.png',
        Panda: '/images/panda main.png',
        Turtle: '/images/turtle main.png'
    },
    bosses: {
        "cheese_boss": '/images/cheese boss.png',
        "heart_boss": '/images/heart boss.png',
        "ultimate_boss": '/images/ultimate boss.png'
    }
};

export const BOSS_DATA = [
  {
    name: "The Evil Cheese",
    description: "An evil cheese fulls of fats! One bite and you're done for sure.",
    hp: 80,
    maxHp: 80,
    weakness: "Speed",
    imageColor: "bg-white",
    environmentTheme: "The Salt Mines",
    bgGradient: "bg-gradient-to-b from-blue-100 to-white",
    img: "cheese_boss"
  },
  {
    name: "Heart Attack",
    description: "The Malignant Heart of Chaos! A towering behemoth of saturated fats",
    hp: 120,
    maxHp: 120,
    weakness: "Attack",
    imageColor: "bg-yellow-200",
    environmentTheme: "The Greasy Caverns",
    bgGradient: "bg-gradient-to-br from-yellow-50 to-orange-100",
    img: "heart_boss"
  },
  {
    name: "Attack on Junk Titan",
    description: "One more bite won’t hurt… or WILL it?",
    hp: 180,
    maxHp: 180,
    weakness: "Balanced Stats",
    imageColor: "bg-purple-900",
    environmentTheme: "The Void of Stress",
    bgGradient: "bg-gradient-to-t from-gray-900 via-purple-900 to-gray-800",
    img: "ultimate_boss"
  }
];
