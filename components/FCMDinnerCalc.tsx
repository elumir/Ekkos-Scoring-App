import React, { useState, useMemo, useRef, useEffect } from 'react';

const MILESTONES = [
  { id: 'LOWER_PRICES', label: 'First to Lower Prices', description: '-$1 to unit price' },
  { id: 'PIZZA_MARKETED', label: 'First Pizza Marketed', description: '+$5 bonus per pizza' },
  { id: 'BURGER_MARKETED', label: 'First Burger Marketed', description: '+$5 bonus per burger' },
  { id: 'DRINK_MARKETED', label: 'First Drink Marketed', description: '+$5 bonus per drink' },
];

type FoodType = 'pizzas' | 'burgers' | 'drinks';
interface FoodItems {
  pizzas: number;
  burgers: number;
  drinks: number;
}
type HouseType = 'base' | 'garden' | 'park';

const FoodItemCounter: React.FC<{
  label: string,
  type: FoodType,
  count: number,
  onItemChange: (type: FoodType, change: number) => void
}> = ({ label, type, count, onItemChange }) => (
  <div className="flex flex-col items-center space-y-2 p-2 rounded-lg bg-slate-700/50 w-full">
    <p className="text-slate-300 text-sm font-semibold">{label}</p>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onItemChange(type, -1)}
        className="w-8 h-8 text-xl rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none"
        aria-label={`Decrease ${label}`}
      >
        -
      </button>
      <span className="text-3xl font-mono w-12 text-center select-none">{count}</span>
      <button
        onClick={() => onItemChange(type, 1)}
        className="w-8 h-8 text-xl rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  </div>
);

const FCMDinnerCalc: React.FC = () => {
  const [baseUnitPrice, setBaseUnitPrice] = useState<number>(10);
  const [items, setItems] = useState<Record<HouseType, FoodItems>>({
    base: { pizzas: 0, burgers: 0, drinks: 0 },
    garden: { pizzas: 0, burgers: 0, drinks: 0 },
    park: { pizzas: 0, burgers: 0, drinks: 0 },
  });
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());
  const [isMilestoneDropdownOpen, setIsMilestoneDropdownOpen] = useState(false);
  const milestoneDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (milestoneDropdownRef.current && !milestoneDropdownRef.current.contains(event.target as Node)) {
        setIsMilestoneDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleItemChange = (houseType: HouseType, foodType: FoodType, change: number) => {
    setItems(prev => ({
      ...prev,
      [houseType]: {
        ...prev[houseType],
        [foodType]: Math.max(0, prev[houseType][foodType] + change)
      }
    }));
  };

  const handleMilestoneToggle = (milestoneId: string) => {
    setSelectedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  };

  const { totals, grandTotal, effectiveUnitPrice } = useMemo(() => {
    const hasLowerPrices = selectedMilestones.has('LOWER_PRICES');
    const effectiveUnitPrice = Math.max(0, baseUnitPrice - (hasLowerPrices ? 1 : 0));
    const pizzaBonus = selectedMilestones.has('PIZZA_MARKETED') ? 5 : 0;
    const burgerBonus = selectedMilestones.has('BURGER_MARKETED') ? 5 : 0;
    const drinkBonus = selectedMilestones.has('DRINK_MARKETED') ? 5 : 0;

    const calculateSubtotal = (foodItems: FoodItems, priceMultiplier: number) => {
      const pizzaTotal = foodItems.pizzas * (effectiveUnitPrice * priceMultiplier + pizzaBonus);
      const burgerTotal = foodItems.burgers * (effectiveUnitPrice * priceMultiplier + burgerBonus);
      const drinkTotal = foodItems.drinks * (effectiveUnitPrice * priceMultiplier + drinkBonus);
      return pizzaTotal + burgerTotal + drinkTotal;
    };

    const baseTotal = calculateSubtotal(items.base, 1);
    const gardenTotal = calculateSubtotal(items.garden, 2);
    const parkTotal = calculateSubtotal(items.park, 3);

    return {
      totals: {
        base: baseTotal,
        garden: gardenTotal,
        park: parkTotal,
      },
      grandTotal: baseTotal + gardenTotal + parkTotal,
      effectiveUnitPrice,
    };
  }, [items, baseUnitPrice, selectedMilestones]);

  const getSelectedMilestonesLabel = () => {
    if (selectedMilestones.size === 0) return 'Select Milestones';
    if (selectedMilestones.size === 1) {
      const id = selectedMilestones.values().next().value;
      return MILESTONES.find(m => m.id === id)?.label || 'Select Milestones';
    }
    return `${selectedMilestones.size} Milestones Selected`;
  };

  const houseTypes: { id: HouseType, label: string, bonusInfo: string }[] = [
    { id: 'base', label: 'Base House', bonusInfo: '1x Price' },
    { id: 'garden', label: 'House + Garden', bonusInfo: '2x Price' },
    { id: 'park', label: 'House, Garden, & Park', bonusInfo: '3x Price' },
  ];

  return (
    <div className="flex-grow w-full flex flex-col items-center p-4 space-y-4 overflow-y-auto">
      <h1 className="text-xl font-bold text-yellow-400 animate-pulse tracking-widest">WORK IN PROGRESS</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl mb-4 flex-shrink-0">
        <div className="bg-slate-800 p-4 rounded-lg w-full border border-slate-700 shadow-lg">
          <label htmlFor="unitPrice" className="block text-lg font-semibold text-slate-300 mb-2 text-center">
            Base Unit Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-2xl font-mono">$</span>
            <input
              id="unitPrice"
              type="number"
              value={baseUnitPrice}
              onChange={(e) => setBaseUnitPrice(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-700 text-white text-2xl font-mono p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 text-center pl-8"
              aria-label="Base unit price for food"
            />
          </div>
          <p className="text-center text-sm text-sky-400 mt-2">Effective Price: ${effectiveUnitPrice}</p>
        </div>
        <div ref={milestoneDropdownRef} className="relative bg-slate-800 p-4 rounded-lg w-full border border-slate-700 shadow-lg flex flex-col justify-center">
          <label className="block text-lg font-semibold text-slate-300 mb-2 text-center">
            Milestones
          </label>
          <button
            onClick={() => setIsMilestoneDropdownOpen(prev => !prev)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
          >
            <span className="truncate">{getSelectedMilestonesLabel()}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${isMilestoneDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isMilestoneDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-full bg-slate-700 rounded-md shadow-lg z-50 overflow-hidden border border-slate-600">
              {MILESTONES.map(milestone => (
                <label key={milestone.id} className="flex items-center w-full text-left px-4 py-3 text-sm transition-colors text-slate-200 hover:bg-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMilestones.has(milestone.id)}
                    onChange={() => handleMilestoneToggle(milestone.id)}
                    className="h-4 w-4 rounded bg-slate-800 border-slate-500 text-sky-500 focus:ring-sky-500"
                  />
                  <div className="ml-3">
                    <p className="font-semibold">{milestone.label}</p>
                    <p className="text-xs text-slate-400">{milestone.description}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="w-full flex flex-col items-center">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-5xl">
          {houseTypes.map(house => (
            <div key={house.id} className="w-full flex-shrink-0 bg-slate-800 rounded-lg flex flex-col border border-slate-700 shadow-lg">
              <div className="p-3 text-center border-b-2 border-slate-600 h-16 flex flex-col items-center justify-center">
                <h2 className="text-lg font-bold truncate">{house.label}</h2>
                <p className="text-xs text-slate-400">{house.bonusInfo}</p>
              </div>
              
              <div className="flex-grow flex flex-col items-center justify-center p-4 space-y-3">
                <FoodItemCounter label="Pizzas" type="pizzas" count={items[house.id].pizzas} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />
                <FoodItemCounter label="Burgers" type="burgers" count={items[house.id].burgers} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />
                <FoodItemCounter label="Drinks" type="drinks" count={items[house.id].drinks} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />
              </div>

              <div className="p-4 text-center border-t-2 border-slate-700 bg-black/20">
                <p className="text-sm text-slate-400">Subtotal</p>
                <p className="text-4xl font-bold font-mono">${totals[house.id]}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full max-w-5xl mt-6 p-4 bg-slate-800 border border-sky-500 rounded-lg shadow-lg flex items-center justify-between flex-shrink-0">
            <h2 className="text-2xl font-bold">Total Revenue</h2>
            <p className="text-5xl font-bold font-mono text-sky-400">${grandTotal}</p>
        </div>
      </main>
    </div>
  );
};

export default FCMDinnerCalc;