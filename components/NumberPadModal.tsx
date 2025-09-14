import React, { useState, useCallback } from 'react';
import type { FingerColor } from '../types';

interface NumberPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  playerName: string;
  playerColor: FingerColor;
}

const NumberPadModal: React.FC<NumberPadModalProps> = ({ isOpen, onClose, onConfirm, playerName, playerColor }) => {
  const [inputValue, setInputValue] = useState('');

  const handleNumberClick = (num: string) => {
    if (inputValue.length < 9) {
      setInputValue(inputValue + num);
    }
  };

  const handleBackspace = () => {
    setInputValue(inputValue.slice(0, -1));
  };
  
  const handleToggleSign = () => {
    if (inputValue && inputValue !== '0') {
      setInputValue(prev => 
        prev.startsWith('-') ? prev.slice(1) : '-' + prev
      );
    }
  };

  const handleConfirm = useCallback(() => {
    const valueToConfirm = inputValue === '' ? 0 : parseInt(inputValue, 10);
    if (!isNaN(valueToConfirm)) {
      onConfirm(valueToConfirm);
    }
    setInputValue('');
  }, [inputValue, onConfirm]);

  if (!isOpen) return null;

  const padButtons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    '',  '0', ''
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex flex-col items-center justify-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-slate-800 rounded-t-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={`relative flex items-center justify-center p-4 rounded-t-2xl border-b-2 ${playerColor.border} ${playerColor.bg}`}>
          <h2 className="text-xl font-bold text-white">Add Score for {playerName}</h2>
          <button 
            onClick={onClose} 
            className="absolute top-1/2 right-4 -translate-y-1/2 p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-4 text-center">
            <p className="h-16 text-6xl font-mono text-white break-all">{inputValue || '0'}</p>
        </div>

        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-900">
          {padButtons.map((val, index) => (
            val ? (
              <button
                key={index}
                onClick={() => handleNumberClick(val)}
                className="py-5 text-3xl font-bold bg-slate-700/50 rounded-lg text-white hover:bg-slate-600 active:bg-slate-500 transition-colors"
              >
                {val}
              </button>
            ) : <div key={index}></div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900">
            <button
                onClick={handleToggleSign}
                className="w-full py-4 text-xl font-semibold bg-slate-600/80 rounded-lg text-white hover:bg-slate-500 active:bg-slate-400 transition-colors"
            >
                +/-
            </button>
            <button
                onClick={handleBackspace}
                className="w-full py-4 text-xl font-semibold bg-red-600/80 rounded-lg text-white hover:bg-red-500 active:bg-red-400 transition-colors"
            >
                Backspace
            </button>
            <button
                onClick={handleConfirm}
                className="w-full py-4 text-xl font-semibold bg-sky-600/80 rounded-lg text-white hover:bg-sky-500 active:bg-sky-400 transition-colors"
            >
                Confirm
            </button>
        </div>
      </div>
    </div>
  );
};

export default NumberPadModal;