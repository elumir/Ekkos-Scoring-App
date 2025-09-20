import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { PlayerScore } from '../types';
import ConfirmationModal from './ConfirmationModal';

const FieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
        <rect x=".75" y=".75" width="22.5" height="22.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M4.09,4.19c1.77,0,3.51-.71,5.27-.71s3.55,1.41,5.27,1.41,3.48-.71,5.27-.71" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M4.09,8.1c1.77,0,3.51-.71,5.27-.71s3.55,1.41,5.27,1.41,3.48-.71,5.27-.71" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M4.09,12c1.77,0,3.51-.7,5.27-.7s3.55,1.41,5.27,1.41,3.48-.7,5.27-.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M4.09,15.9c1.77,0,3.51-.7,5.27-.7s3.55,1.41,5.27,1.41,3.48-.7,5.27-.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        <path d="M4.09,19.81c1.77,0,3.51-.71,5.27-.71s3.55,1.41,5.27,1.41,3.48-.71,5.27-.71" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
    </svg>
);

const PastureIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
        <line x1="2.457" y1="2.442" x2="17.284" y2="2.442" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="3"/>
        <line x1="21.734" y1="2.442" x2="22.089" y2="17.793" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="3"/>
        <line x1="22.103" y1="21.97" x2="5.878" y2="21.97" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="3"/>
        <line x1="2.406" y1="6.295" x2="1.878" y2="21.97" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="3"/>
    </svg>
);

const GrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M20.478,3.419c-1.286.668-3.881,6.538-2.631,7.755.31.302.949.833.949.833s-.487.717-.88,1.255c-1.7,2.328,1.541,7.326,2.563,7.333-6.131,2.845-11.755,2.845-16.871,0,1.087.168,4.421-5.803,2.657-7.471-.413-.39-.904-1.118-.904-1.118s.417-.812.912-1.061c2.321-1.171-.794-6.611-2.665-7.527C9.31.645,14.938.466,20.478,3.419Z" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2"/>
    </svg>
);

const VegetableIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M10.176,1.253c1.131-1.241,3.373,6.195,2.6,6.675-.398-.353,3.202-1.201,3.929.514,0,0,2.642-.627,4.044.449,1.402,1.076,2.165,3.256,2.165,5.623,0,2.702-.553,5.788-2.298,6.845-1.745,1.057-4.654.595-4.654.595,0,0-1.144,1.067-3.807.84-3.082-.263-4.005-1.311-4.005-1.311,0,0-2.606,1.162-4.767-.376-2.161-1.538-2.218-5.512-2.218-6.78,0-2.367.46-4.645,2.165-5.623,1.704-.979,3.493-.357,3.493-.357,1.376-1.79,4.18-.361,3.882-.071.823-3.401.371-5.45-.529-7.024Z" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth="2"/>
    </svg>
);

const SheepIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M15.395,6.678c-.196.002-.924.516-.918.635-.9-1.262-2.106-1.349-3.565-.459-1.52-.946-2.905-.78-4.094.988-1.976-.847-4.553,1.835-2.506,4.158-.216,2.841,1.01,4.055,4.271,2.972,1.298,1.197,2.569,1.25,3.812,0,2.967.622,4.59-.107,4.376-2.682" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="6.289" y1="17.372" x2="6.289" y2="15.346" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="8.16" y1="18.289" x2="8.16" y2="15.07" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12.778" y1="17.513" x2="12.778" y2="15.07" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="14.866" y1="18.289" x2="14.866" y2="15.346" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21.908,10.574c0,.974-2.813,1.426-2.813,1.426,0,0-2.813.529-2.813-1.426,0-.341.086-.607.227-.813.294-.428-.081-2.069.58-1.813s1.094.282,2.006,1.2h0s2.813.452,2.813,1.426Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.048"/>
    </svg>
);

const WildBoarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6">
        <path d="M11.972,22.672l.6-3.465h6.776l.882,3.465h1.659c.804-3.984,1.129-7.519.847-10.488-1.413-1.955-4.835-3.214-8.929-4.24-1.149.059-4.341,1.346-4.341,1.346,0,0-.415-.242-.988-.882-.082.282-5.616,5.971-7.588,5.753l1.906,2.4,1.376-.459c-.174-.546-.126-1.14.071-1.765-.187-.001.526,1.646,1.2,1.482l.318.776-2.365.671.6.706,3.282-.459c1.204-.163,1.986.246,2.365,1.2l.776,3.959h1.553Z" fill="currentColor"/>
    </svg>
);


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
  cardPoints: number;
  bonusPoints: number;
}

const initialPlayerScore: AgricolaPlayerScore = {
  fields: 0, pastures: 0, grain: 0, vegetables: 0,
  sheep: 0, wildBoar: 0, cattle: 0,
  unusedSpaces: 0, fencedStables: 0,
  clayRooms: 0, stoneRooms: 0,
  familyMembers: 2, beggingCards: 0, cardPoints: 0, bonusPoints: 0,
};

type Category = keyof AgricolaPlayerScore;

const SCORING_CATEGORIES: { id: Category; label: string; color: string; textColor: string; icon?: React.ReactNode; }[] = [
    { id: 'fields', label: 'Fields', color: '#D2B48C', textColor: 'text-black/80', icon: <FieldIcon /> },
    { id: 'pastures', label: 'Pastures', color: '#2E8B57', textColor: 'text-white', icon: <PastureIcon /> },
    { id: 'grain', label: 'Grain', color: '#F0E68C', textColor: 'text-black/80', icon: <GrainIcon /> },
    { id: 'vegetables', label: 'Vegetables', color: '#E67E22', textColor: 'text-white', icon: <VegetableIcon /> },
    { id: 'sheep', label: 'Sheep', color: '#DCDCDC', textColor: 'text-black/80', icon: <SheepIcon /> },
    { id: 'wildBoar', label: 'Wild Boar', color: '#696969', textColor: 'text-white', icon: <WildBoarIcon /> },
    { id: 'cattle', label: 'Cattle', color: '#8B4513', textColor: 'text-white' },
    { id: 'unusedSpaces', label: 'Unused Spaces', color: '#556B2F', textColor: 'text-white' },
    { id: 'fencedStables', label: 'Fenced Stables', color: '#A0522D', textColor: 'text-white' },
    { id: 'clayRooms', label: 'Clay Rooms', color: '#CD5C5C', textColor: 'text-white' },
    { id: 'stoneRooms', label: 'Stone Rooms', color: '#B0C4DE', textColor: 'text-black/80' },
    { id: 'familyMembers', label: 'Family Members', color: '#4682B4', textColor: 'text-white' },
    { id: 'beggingCards', label: 'Begging Cards', color: '#B22222', textColor: 'text-white' },
    { id: 'cardPoints', label: 'Card Points', color: '#DAA520', textColor: 'text-white' },
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

    // Card Points: 1pt per point
    pts.cardPoints = scores.cardPoints;

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
  categoryDisplay: 'icons' | 'text' | 'both';
}

const AgricolaScorer: React.FC<AgricolaScorerProps> = ({ players, onUpdatePlayerName, categoryDisplay }) => {
    const [scores, setScores] = useState<Record<number, AgricolaPlayerScore>>({});
    const [editingPlayerName, setEditingPlayerName] = useState<{ id: number; name: string } | null>(null);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

    useEffect(() => {
        setScores(prevScores => {
            const newScoresState = { ...prevScores };
            let needsUpdate = false;

            const currentPlayerIds = new Set(players.map(p => p.id));

            // Add scores for new players
            for (const player of players) {
                if (!newScoresState[player.id]) {
                    newScoresState[player.id] = { ...initialPlayerScore };
                    needsUpdate = true;
                }
            }

            // Remove scores for players who have left
            for (const playerId in newScoresState) {
                if (!currentPlayerIds.has(Number(playerId))) {
                    delete newScoresState[playerId];
                    needsUpdate = true;
                }
            }

            return needsUpdate ? newScoresState : prevScores;
        });
    }, [players]);

    const handleScoreChange = (playerId: number, category: Category, value: number) => {
        const isNegativeAllowed = category === 'bonusPoints' || category === 'cardPoints';
        const newValue = isNegativeAllowed ? value : Math.max(0, value);

        setScores(prev => ({
            ...prev,
            [playerId]: { ...(prev[playerId] || initialPlayerScore), [category]: newValue }
        }));
    };

    const handleReset = () => {
        const initialScores = players.reduce((acc, p) => {
            acc[p.id] = { ...initialPlayerScore };
            return acc;
        }, {} as Record<number, AgricolaPlayerScore>);
        setScores(initialScores);
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
                <div className="p-3 text-center h-16 flex items-center justify-center border-b-2 border-slate-600 flex-shrink-0">
                    <h2 className="text-lg font-bold">Category</h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {SCORING_CATEGORIES.map(cat => {
                        const showIcon = (categoryDisplay === 'icons' || categoryDisplay === 'both') && cat.icon;
                        const showText = categoryDisplay === 'text' || categoryDisplay === 'both' || (categoryDisplay === 'icons' && !cat.icon);
                        
                        return (
                            <div 
                                key={cat.id} 
                                className={`h-14 flex items-center justify-center text-center p-2 border-b border-black/20 font-semibold ${cat.textColor}`}
                                style={{ backgroundColor: cat.color }}
                                title={cat.label}
                            >
                               <div className="flex items-center justify-center gap-2">
                                    {showIcon && cat.icon}
                                    {showText && <span className="text-sm">{cat.label}</span>}
                               </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-3 text-center h-20 flex flex-col items-center justify-center border-t-2 border-slate-700 bg-black/20 flex-shrink-0">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total</p>
                    <button 
                        onClick={() => setIsResetConfirmOpen(true)} 
                        className="px-4 py-1 bg-yellow-600/80 hover:bg-yellow-600 text-white text-xs font-semibold rounded-full shadow-md transition-transform transform hover:scale-105"
                        aria-label="Reset all Agricola scores"
                    >
                        Reset
                    </button>
                </div>
            </div>
            <div className="flex-grow w-full flex overflow-x-auto">
                <div className="flex flex-nowrap space-x-2 px-2 pb-2">
                    {players.map(player => (
                        <div key={player.id} className="w-40 flex-shrink-0 bg-slate-800 rounded-lg flex flex-col border border-slate-700 shadow-lg overflow-hidden">
                            <div className={`p-3 text-center border-b-2 ${player.color.border} h-16 flex items-center justify-center flex-shrink-0`}>
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
                            <div className="flex-grow overflow-y-auto">
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
                            <div className="p-3 text-center border-t-2 border-slate-700 bg-black/20 h-20 flex flex-col justify-center flex-shrink-0">
                                <p className="text-4xl font-bold font-mono">{totals[player.id] ?? 0}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
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