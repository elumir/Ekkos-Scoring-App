import React, { useState } from 'react';
import type { PlayerScore } from '../types';
import NumberPadModal from './NumberPadModal';
import ConfirmationModal from './ConfirmationModal';

interface ScoreboardProps {
  players: PlayerScore[];
  onScoreChange: (playerId: number, value: number) => void;
  onResetScores: () => void;
  onExit: () => void;
  onUpdatePlayerName: (playerId: number, newName: string) => void;
  onRemoveLastScore: (playerId: number) => void;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players, onScoreChange, onResetScores, onExit, onUpdatePlayerName, onRemoveLastScore }) => {
  const [editingPlayerName, setEditingPlayerName] = useState<{ id: number; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePlayer, setActivePlayer] = useState<PlayerScore | null>(null);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<number | null>(null);

  const handleAddScoreClick = (player: PlayerScore) => {
    setActivePlayer(player);
    setIsModalOpen(true);
  };

  const handleModalConfirm = (value: number) => {
    if (activePlayer) {
      onScoreChange(activePlayer.id, value);
    }
    setIsModalOpen(false);
    setActivePlayer(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setActivePlayer(null);
  };

  const handleNameEditStart = (player: PlayerScore) => {
    setEditingPlayerName({ id: player.id, name: player.name });
  };

  const handleNameEditConfirm = () => {
    if (editingPlayerName && editingPlayerName.name.trim() !== '') {
      onUpdatePlayerName(editingPlayerName.id, editingPlayerName.name.trim());
    }
    setEditingPlayerName(null);
  };
  
  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleNameEditConfirm();
    }
    if (event.key === 'Escape') {
      setEditingPlayerName(null);
    }
  };

  const handleRemoveClick = (playerId: number) => {
    setPlayerToDelete(playerId);
    setIsRemoveConfirmOpen(true);
  };

  const handleConfirmRemove = () => {
    if (playerToDelete !== null) {
      onRemoveLastScore(playerToDelete);
    }
    setIsRemoveConfirmOpen(false);
    setPlayerToDelete(null);
  };

  const handleConfirmReset = () => {
    onResetScores();
    setIsResetConfirmOpen(false);
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
        <h1 className="text-2xl md:text-3xl font-bold">Scoreboard</h1>
        <div className="w-28"></div>
      </header>

      <main className="flex-grow w-full flex overflow-x-auto p-2 pb-4">
        <div className="flex flex-nowrap space-x-2 mx-auto">
          {players.map((player) => {
            const totalScore = player.scores.reduce((acc, val) => acc + val, 0);

            return (
              <div key={player.id} className="w-40 flex-shrink-0 bg-slate-800 rounded-lg flex flex-col border border-slate-700 shadow-lg">
                {/* Player Name */}
                <div className={`p-3 text-center border-b-2 ${player.color.border} h-16 flex items-center justify-center`}>
                  {editingPlayerName?.id === player.id ? (
                     <input
                        type="text"
                        value={editingPlayerName.name}
                        onChange={(e) => setEditingPlayerName({ ...editingPlayerName, name: e.target.value })}
                        onBlur={handleNameEditConfirm}
                        onKeyDown={handleNameKeyDown}
                        className="w-full bg-slate-700 text-white text-center rounded p-1 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                        autoFocus
                     />
                  ) : (
                    <h2 
                        className="text-lg font-bold truncate cursor-pointer p-1"
                        onClick={() => handleNameEditStart(player)}
                        title="Click to edit name"
                    >
                        {player.name}
                    </h2>
                  )}
                </div>
                
                {/* Score List */}
                <div className="flex-grow w-full p-2 overflow-y-auto flex flex-col-reverse min-h-[10rem]">
                  <div className="w-full">
                    {player.scores.length === 0 ? (
                      <p className="text-slate-500 text-center mt-8">No scores yet</p>
                    ) : (
                      player.scores.slice().reverse().map((score, i) => (
                        <div key={i} className="flex items-center justify-between py-1 border-b border-slate-700/50 last:border-b-0">
                            <div className="w-8 h-6"></div>
                            <p className="text-center text-xl font-mono">
                                {score}
                            </p>
                            <div className="w-8 h-6 flex items-center justify-center">
                                {i === 0 && (
                                    <button
                                        onClick={() => handleRemoveClick(player.id)}
                                        className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                                        aria-label="Remove last score"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Total Score */}
                <div className="p-3 text-center border-t-2 border-slate-700 bg-black/20">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="text-4xl font-bold font-mono">{totalScore}</p>
                </div>
                
                {/* Add Score Button */}
                <div className="p-2 border-t border-slate-700 bg-slate-800/50">
                    <button
                        onClick={() => handleAddScoreClick(player)}
                        className="w-full px-4 py-3 bg-sky-600 rounded text-white font-semibold hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                        Add Score
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="w-full p-4 flex-shrink-0 flex justify-center bg-slate-900/80 backdrop-blur-sm z-10 border-t border-slate-700">
        <button 
            onClick={() => setIsResetConfirmOpen(true)} 
            className="px-6 py-3 bg-yellow-500/80 hover:bg-yellow-500 text-white font-bold text-xl rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Reset Scores
        </button>
      </footer>

      {isModalOpen && activePlayer && (
        <NumberPadModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          playerName={activePlayer.name}
          playerColor={activePlayer.color}
        />
      )}

      <ConfirmationModal
        isOpen={isRemoveConfirmOpen}
        onClose={() => setIsRemoveConfirmOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remove Score"
        message="Are you sure you want to remove the last score? This action cannot be undone."
      />

      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Scores"
        message="Are you sure you want to reset scores for all players? This action cannot be undone."
        confirmButtonText="Reset"
        confirmButtonClass="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
      />
    </div>
  );
};

export default Scoreboard;