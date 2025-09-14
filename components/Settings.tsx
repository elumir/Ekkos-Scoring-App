import React from 'react';
import type { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
  onExit: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, onExit }) => {
  
  const handleCountChange = (count: number) => {
    onSettingsChange({ defaultPlayerCount: count });
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...settings.defaultPlayerNames];
    newNames[index] = name;
    onSettingsChange({ defaultPlayerNames: newNames });
  };
  
  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="w-full flex items-center justify-between p-4 flex-shrink-0 bg-slate-900/80 backdrop-blur-sm z-10 border-b border-slate-700">
        <button 
          onClick={onExit} 
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
          aria-label="Back to chooser mode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Chooser</span>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <div className="w-28"></div>
      </header>

      <main className="flex-grow w-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Default Player Count Setting */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Default Player Count</h2>
            <p className="text-slate-400 mb-4">Set the number of players when starting a new scoreboard without fingers.</p>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 6, 7, 8].map(count => (
                <button
                  key={count}
                  onClick={() => handleCountChange(count)}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                    settings.defaultPlayerCount === count 
                      ? 'bg-sky-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>
          
          {/* Countdown Timer Setting */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Countdown Timer</h2>
            <p className="text-slate-400 mb-4">Set the duration of the countdown before a winner is chosen.</p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(duration => (
                <button
                  key={duration}
                  onClick={() => onSettingsChange({ countdownDuration: duration })}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                    (settings.countdownDuration || 3) === duration
                      ? 'bg-sky-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {duration} Second{duration > 1 ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Default Player Names Setting */}
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">Default Player Names</h2>
            <p className="text-slate-400 mb-4">Set the default names for players. These will be used in order.</p>
            <div className="space-y-3">
              {Array.from({ length: settings.defaultPlayerCount }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <label htmlFor={`player-name-${index}`} className="text-slate-400 w-20">Player {index + 1}</label>
                  <input
                    id={`player-name-${index}`}
                    type="text"
                    value={settings.defaultPlayerNames[index] || ''}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    placeholder={`Enter name ${index + 1}`}
                    className="flex-grow bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
