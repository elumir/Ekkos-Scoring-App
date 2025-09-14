import React from 'react';
import type { Finger, SelectionMode } from '../types';
import { GameState } from '../types';
import { GROUP_COLORS } from '../constants';

interface FingerCircleProps {
  finger: Finger;
  isWinner: boolean;
  selectionMode: SelectionMode;
  gameState: GameState;
}

const FingerCircle: React.FC<FingerCircleProps> = ({ finger, isWinner, selectionMode, gameState }) => {
  let extraClasses = 'z-10';
  let bgColor = finger.color.bg;
  let borderColor = finger.color.border;

  if (isWinner && selectionMode === 1) {
    extraClasses = 'scale-150 shadow-2xl shadow-yellow-400 z-20 ring-8 ring-yellow-300 ring-offset-4 ring-offset-slate-900';
  } else if (selectionMode > 1) {
    if (gameState === GameState.CHOOSING) {
      bgColor = 'bg-slate-600';
      borderColor = 'border-slate-400';
    } else if (gameState === GameState.RESULT && finger.groupId !== null) {
      const groupColor = GROUP_COLORS[finger.groupId % GROUP_COLORS.length];
      bgColor = groupColor.bg;
      borderColor = groupColor.border;
      extraClasses = `z-20 scale-110 shadow-lg`;
    }
  }
  
  return (
    <div
      className={`absolute w-32 h-32 rounded-full border-8 flex items-center justify-center transition-all duration-500 ease-in-out ${bgColor} ${borderColor} ${extraClasses}`}
      style={{
        left: `${finger.x}px`,
        top: `${finger.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

export default FingerCircle;