import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, AppMode } from './types';
import type { Finger, FingerColor, SelectionMode, PlayerScore, AppSettings } from './types';
import { FINGER_COLORS, GROUP_COLORS } from './constants';
import FingerCircle from './components/FingerCircle';
import Scoreboard from './components/Scoreboard';
import Settings from './components/Settings';

const loadSettingsFromStorage = (): AppSettings => {
  try {
    const storedSettings = localStorage.getItem('fingerChooserSettings');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      if (parsed.defaultPlayerCount && Array.isArray(parsed.defaultPlayerNames)) {
        return {
          defaultPlayerCount: parsed.defaultPlayerCount,
          defaultPlayerNames: parsed.defaultPlayerNames,
          countdownDuration: parsed.countdownDuration || 3,
        };
      }
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage", error);
  }
  return {
    defaultPlayerCount: 4,
    defaultPlayerNames: [],
    countdownDuration: 3,
  };
};

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.CHOOSER);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [fingers, setFingers] = useState<Map<number, Finger>>(new Map());
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(1);
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettingsFromStorage);
  const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement);
  const [isTeamsDropdownOpen, setIsTeamsDropdownOpen] = useState(false);

  const fingersRef = useRef(fingers);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fingersRef.current = fingers;
  }, [fingers]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    
    setIsFullScreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsTeamsDropdownOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };
  
  const handleExitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
      });
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('fingerChooserSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  const handleReset = useCallback(() => {
    setFingers(new Map());
    setWinnerId(null);
    setCountdown(null);
    setGameState(GameState.IDLE);
  }, []);

  const requiredFingers = Math.max(2, selectionMode);

  const handleTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameState === GameState.RESULT) {
      return;
    }
    e.preventDefault();

    const touches = Array.from(e.touches);
    
    if (touches.length === 0 && e.type === 'touchend' && gameState !== GameState.CHOOSING) {
        handleReset();
        return;
    }
    
    if (gameState === GameState.IDLE || gameState === GameState.DETECTING) {
      if (touches.length >= requiredFingers) {
        setGameState(GameState.CHOOSING);
      } else {
        setGameState(GameState.DETECTING);
      }
    }

    setFingers(prevFingers => {
        const newFingers = new Map<number, Finger>();
        const usedColors = new Set<FingerColor>();
        const touchIdentifiers = new Set(touches.map(t => t.identifier));

        prevFingers.forEach((finger, id) => {
          if (touchIdentifiers.has(id)) {
            usedColors.add(finger.color);
          }
        });

        touches.forEach(touch => {
            const existingFinger = prevFingers.get(touch.identifier);
            if (existingFinger) {
                newFingers.set(touch.identifier, {
                    ...existingFinger,
                    x: touch.clientX,
                    y: touch.clientY,
                });
            } else {
                const availableColors = FINGER_COLORS.filter(c => !usedColors.has(c));
                const color = availableColors.length > 0 
                  ? availableColors[Math.floor(Math.random() * availableColors.length)] 
                  : FINGER_COLORS[Math.floor(Math.random() * FINGER_COLORS.length)];
                usedColors.add(color);
                newFingers.set(touch.identifier, {
                    id: touch.identifier,
                    x: touch.clientX,
                    y: touch.clientY,
                    color: color,
                    groupId: null,
                });
            }
        });
        return newFingers;
    });
  };

  useEffect(() => {
    if (gameState === GameState.CHOOSING && fingers.size < requiredFingers) {
      handleReset();
    }
  }, [gameState, fingers.size, handleReset, requiredFingers]);

  useEffect(() => {
    if (gameState !== GameState.CHOOSING) {
      return;
    }

    let selectionTimeout: number | undefined;
    let countdownInterval: number | undefined;
    
    setCountdown(settings.countdownDuration);
    countdownInterval = window.setInterval(() => {
      setCountdown(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);

    selectionTimeout = window.setTimeout(() => {
      if (countdownInterval) clearInterval(countdownInterval);
      
      const fingerArray = Array.from(fingersRef.current.values());
      if (fingerArray.length < requiredFingers) {
        handleReset();
        return;
      }
      
      if (selectionMode === 1) {
        const winnerIndex = Math.floor(Math.random() * fingerArray.length);
        const winner = fingerArray[winnerIndex];
        setWinnerId(winner.id);
      } else {
         for (let i = fingerArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [fingerArray[i], fingerArray[j]] = [fingerArray[j], fingerArray[i]];
        }
        
        const updatedFingers = new Map(fingersRef.current);
        fingerArray.forEach((finger, index) => {
            const updatedFinger = { ...finger, groupId: index % selectionMode };
            updatedFingers.set(finger.id, updatedFinger);
        });

        setFingers(updatedFingers);
        setWinnerId(null);
      }
      setGameState(GameState.RESULT);
    }, settings.countdownDuration * 1000);

    return () => {
      if (selectionTimeout) clearTimeout(selectionTimeout);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [gameState, handleReset, selectionMode, requiredFingers, settings.countdownDuration]);

  const handleStartScoring = () => {
    let newPlayers: PlayerScore[];
    if (gameState === GameState.RESULT && selectionMode > 1) {
      newPlayers = Array.from({ length: selectionMode }).map((_, index) => ({
        id: index,
        name: `Team ${index + 1}`,
        color: GROUP_COLORS[index % GROUP_COLORS.length],
        scores: [],
      }));
    } else if (fingers.size > 0) {
      newPlayers = Array.from(fingers.values()).map((finger, index) => ({
        id: finger.id,
        name: settings.defaultPlayerNames[index] || `Player ${index + 1}`,
        color: finger.color,
        scores: [],
      }));
    } else {
      newPlayers = Array.from({ length: settings.defaultPlayerCount }).map((_, index) => ({
        id: index,
        name: settings.defaultPlayerNames[index] || `Player ${index + 1}`,
        color: FINGER_COLORS[index % FINGER_COLORS.length],
        scores: [],
      }));
    }
    setPlayers(newPlayers);
    setAppMode(AppMode.SCORER);
    handleReset();
  };

  const handleScoreChange = (playerId: number, value: number) => {
    setPlayers(currentPlayers =>
      currentPlayers.map(p =>
        p.id === playerId ? { ...p, scores: [...p.scores, value] } : p
      )
    );
  };
  
  const handleRemoveLastScore = (playerId: number) => {
    setPlayers(currentPlayers =>
      currentPlayers.map(p =>
        p.id === playerId 
          ? { ...p, scores: p.scores.slice(0, -1) }
          : p
      )
    );
  };

  const handleUpdatePlayerName = (playerId: number, newName: string) => {
    setPlayers(currentPlayers =>
      currentPlayers.map(p =>
        p.id === playerId ? { ...p, name: newName } : p
      )
    );
  };

  const handleResetScores = () => {
    setPlayers(currentPlayers =>
      currentPlayers.map(p => ({ ...p, scores: [] }))
    );
  };

  const handleExitScorer = () => {
    setAppMode(AppMode.CHOOSER);
    handleReset();
  };
  
  const handleExitSettings = () => {
    setAppMode(AppMode.CHOOSER);
  };

  const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const renderStatusText = () => {
    const fingerPlural = requiredFingers === 1 ? 'finger' : 'fingers';
    switch (gameState) {
      case GameState.IDLE:
        return `Place ${requiredFingers} or more ${fingerPlural} on the screen`;
      case GameState.DETECTING:
        return `${fingers.size} ${fingers.size === 1 ? 'finger' : 'fingers'} detected...`;
      case GameState.CHOOSING:
        return 'Choosing...';
      default:
        return '';
    }
  };
  
  const dropdownModes: { mode: SelectionMode; label: string }[] = [
    { mode: 3, label: '3 Teams' },
    { mode: 4, label: '4 Teams' },
  ];

  let content;

  if (appMode === AppMode.SETTINGS) {
    content = (
      <Settings
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onExit={handleExitSettings}
      />
    );
  } else if (appMode === AppMode.SCORER) {
    content = (
      <Scoreboard
        players={players}
        onScoreChange={handleScoreChange}
        onResetScores={handleResetScores}
        onExit={handleExitScorer}
        onUpdatePlayerName={handleUpdatePlayerName}
        onRemoveLastScore={handleRemoveLastScore}
      />
    );
  } else {
    const winner = winnerId !== null ? fingers.get(winnerId) : null;
    const backgroundClass = gameState === GameState.RESULT && winner && selectionMode === 1 ? winner.color.bg : 'bg-slate-900';
    const fingersToRender = (gameState === GameState.RESULT && selectionMode === 1 && winner)
      ? [winner]
      : Array.from(fingers.values());
      
    content = (
      <div
        className={`relative h-screen w-screen text-white select-none overflow-hidden flex flex-col justify-center touch-none transition-colors duration-500 ease-in-out ${backgroundClass}`}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouch}
        onTouchCancel={handleTouch}
      >
        {(gameState === GameState.IDLE || gameState === GameState.DETECTING) && (
            <div
                className="absolute top-8 left-1/2 -translate-x-1/2 z-40 bg-slate-800/70 backdrop-blur-sm p-1.5 rounded-full flex items-center gap-1 shadow-lg"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                onTouchCancel={(e) => e.stopPropagation()}
            >
                <button
                  onClick={() => setAppMode(AppMode.SETTINGS)}
                  className="p-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
                  aria-label="Open settings"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                <div className="h-6 w-px bg-slate-600 mx-1"></div>
                
                <button
                    onClick={() => {
                        setSelectionMode(1);
                        setIsTeamsDropdownOpen(false);
                    }}
                    className={`p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 ${
                        selectionMode === 1 ? 'bg-sky-500 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-700'
                    }`}
                    aria-label="Select one winner"
                    title="1 Winner"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 16 16">
                        <g fill="currentColor">
                            <circle cx="8" cy="3.5" r="3.5"></circle>
                            <path d="M8,8.5a7.008,7.008,0,0,0-7,7,.5.5,0,0,0,.5.5h13a.5.5,0,0,0,.5-.5A7.008,7.008,0,0,0,8,8.5Z"></path>
                        </g>
                    </svg>
                </button>
                <button
                    onClick={() => {
                        setSelectionMode(2);
                        setIsTeamsDropdownOpen(false);
                    }}
                    className={`p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 ${
                        selectionMode === 2 ? 'bg-sky-500 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-700'
                    }`}
                    aria-label="Select two teams"
                    title="2 Teams"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"></path>
                    </svg>
                </button>
                
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsTeamsDropdownOpen(prev => !prev)}
                        className={`p-2 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 ${
                            [3, 4].includes(selectionMode) ? 'bg-sky-500 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-700'
                        }`}
                        aria-label="Select more teams"
                        title="More Teams"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24">
                            <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" fill="currentColor"></path>
                        </svg>
                    </button>
                    {isTeamsDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-36 bg-slate-700 rounded-md shadow-lg z-50 overflow-hidden border border-slate-600">
                            {dropdownModes.map(({ mode, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => {
                                        setSelectionMode(mode);
                                        setIsTeamsDropdownOpen(false);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${selectionMode === mode ? 'bg-sky-600 text-white' : 'text-slate-200 hover:bg-slate-600'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-600 mx-1"></div>
                <button
                    onClick={handleStartScoring}
                    className="p-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
                    aria-label="Switch to score mode"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </button>
                {isFullScreen && (
                  <>
                    <div className="h-6 w-px bg-slate-600 mx-1"></div>
                    <button
                      onClick={handleExitFullScreen}
                      className="p-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
                      aria-label="Exit full screen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
                        </svg>
                    </button>
                  </>
                )}
            </div>
        )}

        <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
          {fingersToRender.map(finger => (
            <FingerCircle
              key={finger.id}
              finger={finger}
              isWinner={winnerId === finger.id}
              selectionMode={selectionMode}
              gameState={gameState}
            />
          ))}
        </div>

        {gameState !== GameState.RESULT && (
          <div className="z-30 text-center pointer-events-none mx-auto">
              {gameState === GameState.CHOOSING && countdown !== null && countdown > 0 ? (
                  <h1 className="text-9xl font-bold text-white drop-shadow-xl animate-pulse">{countdown}</h1>
               ) : (
                  <h1 className="text-4xl md:text-6xl font-bold text-slate-200 drop-shadow-lg">
                  {renderStatusText()}
                  </h1>
              )}
          </div>
        )}

        {gameState === GameState.RESULT && (
          <div className="z-40 mt-32 flex flex-col items-center gap-8 mx-auto">
              <button
                  onClick={handleStartScoring}
                  className="p-4 bg-white/20 hover:bg-white/40 border-2 border-white/50 rounded-full shadow-lg transition-transform transform hover:scale-105"
                  aria-label="Go to scoreboard"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
              </button>
              <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-white/20 hover:bg-white/40 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
              >
                  Reset
              </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {!isFullScreen && (
        <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center gap-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">Ekko's Scoring App</h1>
          <button
            onClick={handleFullScreen}
            className="px-8 py-4 bg-sky-500 text-white font-bold text-2xl rounded-lg shadow-lg hover:bg-sky-600 transition-colors transform hover:scale-105"
          >
            Click for Full Screen
          </button>
        </div>
      )}
      {content}
    </>
  );
};

export default App;
