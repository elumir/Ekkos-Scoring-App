import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { PlayerScore } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface AgricolaPlayerScore {
  fields: number;
  pastures: number;
  grain: number;
  vegetables: number;
  sheep: number;
  wildBoar: number;
  cattle: number;
  unusedSpaces: number;
  fencedStables: number;
  clayRooms: number;
  stoneRooms: number;
  familyMembers: number;
  beggingCards: number;
  bonusPoints: number;
}

const initialPlayerScore: AgricolaPlayerScore = {
  fields: 0, pastures: 0, grain: 0, vegetables: 0,
  sheep: 0, wildBoar: 0, cattle: 0,
  unusedSpaces: 0, fencedStables: 0,
  clayRooms: 0, stoneRooms: 0,
  familyMembers: 2, beggingCards: 0, bonusPoints: 0,
};

type Category = keyof AgricolaPlayerScore;

const SCORING_CATEGORIES: { id: Category; label: string; color: string; textColor: string; }[] = [
    { id: 'fields', label: 'Fields', color: '#D2B48C', textColor: 'text-black/80' },
    { id: 'pastures', label: 'Pastures', color: '#2E8B57', textColor: 'text-white' },
    { id: 'grain', label: 'Grain', color: '#F0E68C', textColor: 'text-black/80' },
    { id: 'vegetables', label: 'Vegetables', color: '#E67E22', textColor: 'text-white' },
    { id: 'sheep', label: 'Sheep', color: '#DCDCDC', textColor: 'text-black/80' },
    { id: 'wildBoar', label: 'Wild Boar', color: '#696969', textColor: 'text-white' },
    { id: 'cattle', label: 'Cattle', color: '#8B4513', textColor: 'text-white' },
    { id: 'unusedSpaces', label: 'Unused Spaces', color: '#556B2F', textColor: 'text-white' },
    { id: 'fencedStables', label: 'Fenced Stables', color: '#A0522D', textColor: 'text-white' },
    { id: 'clayRooms', label: 'Clay Rooms', color: '#CD5C5C', textColor: 'text-white' },
    { id: 'stoneRooms', label: 'Stone Rooms', color: '#B0C4DE', textColor: 'text-black/80' },
    { id: 'familyMembers', label: 'Family Members', color: '#4682B4', textColor: 'text-white' },
    { id: 'beggingCards', label: 'Begging Cards', color: '#B22222', textColor: 'text-white' },
    { id: 'bonusPoints', label: 'Bonus Points', color: '#B8860B', textColor: 'text-white' },
];

const calculatePoints = (scores: AgricolaPlayerScore): Record<Category, number> => {
    const pts: Partial<Record<Category, number>> = {};

    // Fields: -1 for 0-1, then 1/2/3/4 for 2/3/4/5+
    if (scores.fields <= 1) pts.fields = -1;
    else if (scores.fields === 2) pts.fields = 1;
    else if (scores.fields === 3) pts.fields = 2;
    else if (scores.fields === 4) pts.fields = 3;
    else pts.fields = 4; // 5+

    // Pastures: -1 for 0, then 1/2/3/4 for 1/2/3/4+
    if (scores.pastures === 0) pts.pastures = -1;
    else if (scores.pastures === 1) pts.pastures = 1;
    else if (scores.pastures === 2) pts.pastures = 2;
    else if (scores.pastures === 3) pts.pastures = 3;
    else pts.pastures = 4; // 4+

    // Grain: -1 for 0, then 1/2/3/4 for 1-3/4-5/6-7/8+
    if (scores.grain === 0) pts.grain = -1;
    else if (scores.grain <= 3) pts.grain = 1;
    else if (scores.grain <= 5) pts.grain = 2;
    else if (scores.grain <= 7) pts.grain = 3;
    else pts.grain = 4; // 8+

    // Vegetables: -1 for 0, then 1pt per veg up to 4
    if (scores.vegetables === 0) pts.vegetables = -1;
    else pts.vegetables = Math.min(scores.vegetables, 4);

    // Sheep: -1 for 0, then 1/2/3/4 for 1-3/4-5/6-7/8+
    if (scores.sheep === 0) pts.sheep = -1;
    else if (scores.sheep <= 3) pts.sheep = 1;
    else if (scores.sheep <= 5) pts.sheep = 2;
    else if (scores.sheep <= 7) pts.sheep = 3;
    else pts.sheep = 4; // 8+

    // Wild Boar: -1 for 0, then 1/2/3/4 for 1-2/3-4/5-6/7+
    if (scores.wildBoar === 0) pts.wildBoar = -1;
    else if (scores.wildBoar <= 2) pts.wildBoar = 1;
    else if (scores.wildBoar <= 4) pts.wildBoar = 2;
    else if (scores.wildBoar <= 6) pts.wildBoar = 3;
    else pts.wildBoar = 4; // 7+

    // Cattle: -1 for 0, then 1/2/3/4 for 1/2-3/4-5/6+
    if (scores.cattle === 0) pts.cattle = -1;
    else if (scores.cattle === 1) pts.cattle = 1;
    else if (scores.cattle <= 3) pts.cattle = 2;
    else if (scores.cattle <= 5) pts.cattle = 3;
    else pts.cattle = 4; // 6+

    // Unused Spaces: -1pt per space
    pts.unusedSpaces = -scores.unusedSpaces;

    // Fenced Stables: 1pt per stable
    pts.fencedStables = scores.fencedStables;

    // Rooms: 1 for clay, 2 for stone
    pts.clayRooms = scores.clayRooms;
    pts.stoneRooms = scores.stoneRooms * 2;

    // Family Members: 3pts per member
    pts.familyMembers = scores.familyMembers * 3;

    // Begging Cards: -3pts per card
    pts.beggingCards = scores.beggingCards * -3;

    // Bonus Points: 1pt per point
    pts.bonusPoints = scores.bonusPoints;

    return pts as Record<Category, number>;
};

const calculateTotal = (points: Record<Category, number>): number => Object.values(points).reduce((sum, p) => sum + p, 0);

const ScoreInput: React.FC<{ value: number, onChange: (newValue: number) => void }> = ({ value, onChange }) => (
    <div className="flex items-center justify-between w-full">
        <button onClick={() => onChange(value - 1)} className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-500 text-white font-bold">-</button>
        <span className="font-mono text-lg">{value}</span>
        <button onClick={() => onChange(value + 1)} className="px-2 py-1 rounded bg-slate-600 hover:bg-slate-500 text-white font-bold">+</button>
    </div>
);

interface AgricolaScorerProps {
  players: PlayerScore[];
  onUpdatePlayerName: (playerId: number, newName: string) => void;
}

const AgricolaScorer: React.FC<AgricolaScorerProps> = ({ players, onUpdatePlayerName }) => {
    const [scores, setScores] = useState<Record<number, AgricolaPlayerScore>>({});
    const [editingPlayerName, setEditingPlayerName] = useState<{ id: number; name: string } | null>(null);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    const initializeScores = useCallback(() => {
        const initialScores = players.reduce((acc, p) => {
            acc[p.id] = { ...initialPlayerScore };
            return acc;
        }, {} as Record<number, AgricolaPlayerScore>);
        setScores(initialScores);
    }, [players]);
    
    useEffect(() => {
        initializeScores();
    }, [initializeScores]);

    const handleScoreChange = (playerId: number, category: Category, value: number) => {
        const isNegativeAllowed = category === 'bonusPoints';
        const newValue = isNegativeAllowed ? value : Math.max(0, value);

        setScores(prev => ({
            ...prev,
            [playerId]: { ...(prev[playerId] || initialPlayerScore), [category]: newValue }
        }));
    };

    const handleReset = () => {
        initializeScores();
        setIsResetConfirmOpen(false);
    }
    
    // When a player's score is not yet available, we calculate points based
    // on `initialPlayerScore` as a sensible default.
    const points = useMemo(() => Object.fromEntries(
        players.map(p => [p.id, calculatePoints(scores[p.id] || initialPlayerScore)])
    ), [scores, players]);

    const totals = useMemo(() => Object.fromEntries(
        players.map(p => [p.id, points[p.id] ? calculateTotal(points[p.id]) : 0])
    ), [points, players]);

    const handleNameEditStart = (player: PlayerScore) => setEditingPlayerName({ id: player.id, name: player.name });
    const handleNameEditConfirm = () => {
        if (editingPlayerName && editingPlayerName.name.trim() !== '') {
            onUpdatePlayerName(editingPlayerName.id, editingPlayerName.name.trim());
        }
        setEditingPlayerName(null);
    };
    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleNameEditConfirm();
        if (e.key === 'Escape') setEditingPlayerName(null);
    };

    return (
        <div className="flex-grow w-full flex flex-col">
        <main className="flex-grow w-full flex overflow-hidden">
            <div className="w-40 flex-shrink-0 bg-slate-800/50 flex flex-col border-r border-slate-700">
                <div className="p-3 text-center h-16 flex items-center justify-center border-b-2 border-slate-600">
                    <h2 className="text-lg font-bold">Category</h2>
                </div>
                <div className="p-3 text-center h-20 flex flex-col justify-center border-b-2 border-slate-700 bg-black/20">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Total</p>
                </div>
                {SCORING_CATEGORIES.map(cat => (
                    <div 
                        key={cat.id} 
                        className={`h-14 flex items-center justify-center text-center p-2 border-b border-black/20 font-semibold ${cat.textColor}`}
                        style={{ backgroundColor: cat.color }}
                    >
                       <span className="text-sm">{cat.label}</span>
                    </div>
                ))}
            </div>
            <div className="flex-grow w-full flex overflow-x-auto">
                <div className="flex flex-nowrap space-x-2 p-2">
                    {players.map(player => (
                        <div key={player.id} className="w-40 flex-shrink-0 bg-slate-800 rounded-lg flex flex-col border border-slate-700 shadow-lg overflow-hidden">
                            <div className={`p-3 text-center border-b-2 ${player.color.border} h-16 flex items-center justify-center`}>
                                {editingPlayerName?.id === player.id ? (
                                    <input type="text" value={editingPlayerName.name}
                                        onChange={(e) => setEditingPlayerName({ ...editingPlayerName, name: e.target.value })}
                                        onBlur={handleNameEditConfirm} onKeyDown={handleNameKeyDown}
                                        className="w-full bg-slate-700 text-white text-center rounded p-1 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-500"
                                        autoFocus
                                    />
                                ) : (
                                    <h2 className="text-lg font-bold truncate cursor-pointer p-1" onClick={() => handleNameEditStart(player)} title="Click to edit name">
                                        {player.name}
                                    </h2>
                                )}
                            </div>
                            <div className="p-3 text-center border-b-2 border-slate-700 bg-black/20 h-20">
                                <p className="text-4xl font-bold font-mono">{totals[player.id] ?? 0}</p>
                            </div>
                            {scores[player.id] && SCORING_CATEGORIES.map(cat => (
                                <div 
                                    key={cat.id} 
                                    className="h-14 flex items-center justify-between p-2 border-b border-slate-800 last:border-b-0"
                                    style={{ backgroundColor: `${cat.color}33`}}
                                >
                                    <ScoreInput 
                                        value={scores[player.id][cat.id]} 
                                        onChange={val => handleScoreChange(player.id, cat.id, val)} 
                                    />
                                    <span className="text-xs text-slate-300 w-6 text-right font-mono">
                                        ({points[player.id]?.[cat.id] ?? 0})
                                    </span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </main>
        <footer className="w-full p-4 flex-shrink-0 flex justify-center bg-slate-900/80 backdrop-blur-sm z-10 border-t border-slate-700">
            <button onClick={() => setIsResetConfirmOpen(true)} className="px-6 py-3 bg-yellow-500/80 hover:bg-yellow-500 text-white font-bold text-xl rounded-full shadow-lg transition-transform transform hover:scale-105">
                Reset Agricola Scores
            </button>
        </footer>
        <ConfirmationModal
            isOpen={isResetConfirmOpen}
            onClose={() => setIsResetConfirmOpen(false)}
            onConfirm={handleReset}
            title="Reset Agricola Scores"
            message="Are you sure you want to reset all scores for Agricola? This action cannot be undone."
            confirmButtonText="Reset"
            confirmButtonClass="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
        />
        </div>
    );
};

export default AgricolaScorer;