import React, { useState, useMemo, useRef, useEffect } from 'react';

const MODULES = [
  { id: 'LOBBYIST', label: 'LOBBYIST - Add parks', description: 'Enables houses with parks (3x price).' },
  { id: 'COFFEE', label: 'Coffee', description: 'Enables coffee.' },
  { id: 'NOODLES', label: 'Noodles', description: 'Enables noodles.' },
  { id: 'KIMCHI', label: 'Kimchi', description: 'Enables kimchi.' },
  { id: 'SUSHI', label: 'Sushi', description: 'Enables sushi.' },
];

const MILESTONES = [
  { id: 'LOWER_PRICES', label: 'First to Lower Prices', description: '-$1 to unit price' },
  { id: 'PIZZA_MARKETED', label: 'First Pizza Marketed', description: '+$5 bonus per pizza' },
  { id: 'BURGER_MARKETED', label: 'First Burger Marketed', description: '+$5 bonus per burger' },
  { id: 'DRINK_MARKETED', label: 'First Drink Marketed', description: '+$5 bonus per drink' },
  { id: 'HAVE_100', label: 'First to Have $100', description: '+50% to cash earned' },
];

const EMPLOYEES = [
  { id: 'DISCOUNT', label: 'Discount Manager (–$1)', description: 'Reduces unit price by $1 per manager.' },
  { id: 'PRICING', label: 'Pricing Manager (–$3)', description: 'Reduces unit price by $3 per manager.' },
];

type FoodType = 'pizzas' | 'burgers' | 'drinks' | 'coffee' | 'noodles' | 'kimchi' | 'sushi';
interface FoodItems {
  pizzas: number;
  burgers: number;
  drinks: number;
  coffee: number;
  noodles: number;
  kimchi: number;
  sushi: number;
}
type HouseType = 'base' | 'garden' | 'park';
type EmployeeType = 'DISCOUNT' | 'PRICING';

const FoodItemCounter: React.FC<{
  label: string,
  type: FoodType,
  count: number,
  onItemChange: (type: FoodType, change: number) => void
}> = ({ label, type, count, onItemChange }) => (
  <div className="flex flex-col items-center space-y-1 p-1 rounded-lg bg-slate-700/50">
    <p className="text-slate-300 text-xs font-semibold">{label}</p>
    <div className="flex items-center gap-1">
      <button
        onClick={() => onItemChange(type, -1)}
        className="w-6 h-6 text-base rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none"
        aria-label={`Decrease ${label}`}
      >
        -
      </button>
      <span className="text-xl font-mono w-8 text-center select-none">{count}</span>
      <button
        onClick={() => onItemChange(type, 1)}
        className="w-6 h-6 text-base rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none"
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
    base: { pizzas: 0, burgers: 0, drinks: 0, coffee: 0, noodles: 0, kimchi: 0, sushi: 0 },
    garden: { pizzas: 0, burgers: 0, drinks: 0, coffee: 0, noodles: 0, kimchi: 0, sushi: 0 },
    park: { pizzas: 0, burgers: 0, drinks: 0, coffee: 0, noodles: 0, kimchi: 0, sushi: 0 },
  });
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [employeeCounts, setEmployeeCounts] = useState({ DISCOUNT: 0, PRICING: 0 });

  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const [isMilestoneDropdownOpen, setIsMilestoneDropdownOpen] = useState(false);
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  
  const moduleDropdownRef = useRef<HTMLDivElement>(null);
  const milestoneDropdownRef = useRef<HTMLDivElement>(null);
  const employeeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(event.target as Node)) {
        setIsModuleDropdownOpen(false);
      }
      if (milestoneDropdownRef.current && !milestoneDropdownRef.current.contains(event.target as Node)) {
        setIsMilestoneDropdownOpen(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const foodModuleMapping: { [key: string]: FoodType } = {
        COFFEE: 'coffee',
        NOODLES: 'noodles',
        KIMCHI: 'kimchi',
        SUSHI: 'sushi',
    };

    setItems(currentItems => {
        let itemsChanged = false;
        const newItems: Record<HouseType, FoodItems> = JSON.parse(JSON.stringify(currentItems));

        if (!selectedModules.has('LOBBYIST')) {
            const parkItems = newItems.park;
            if (Object.values(parkItems).some(count => count > 0)) {
                newItems.park = { pizzas: 0, burgers: 0, drinks: 0, coffee: 0, noodles: 0, kimchi: 0, sushi: 0 };
                itemsChanged = true;
            }
        }

        Object.entries(foodModuleMapping).forEach(([moduleId, foodType]) => {
            if (!selectedModules.has(moduleId)) {
                if (newItems.base[foodType] > 0 || newItems.garden[foodType] > 0 || newItems.park[foodType] > 0) {
                    newItems.base[foodType] = 0;
                    newItems.garden[foodType] = 0;
                    newItems.park[foodType] = 0;
                    itemsChanged = true;
                }
            }
        });
        
        return itemsChanged ? newItems : currentItems;
    });
  }, [selectedModules]);

  useEffect(() => {
    setEmployeeCounts(currentCounts => {
        let countsChanged = false;
        const newCounts = { ...currentCounts };
        if (!selectedEmployees.has('DISCOUNT') && newCounts.DISCOUNT > 0) {
            newCounts.DISCOUNT = 0;
            countsChanged = true;
        }
        if (!selectedEmployees.has('PRICING') && newCounts.PRICING > 0) {
            newCounts.PRICING = 0;
            countsChanged = true;
        }
        return countsChanged ? newCounts : currentCounts;
    });
  }, [selectedEmployees]);

  const handleItemChange = (houseType: HouseType, foodType: FoodType, change: number) => {
    setItems(prev => ({
      ...prev,
      [houseType]: {
        ...prev[houseType],
        [foodType]: Math.max(0, prev[houseType][foodType] + change)
      }
    }));
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
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

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleEmployeeCountChange = (employeeId: EmployeeType, change: number) => {
    setEmployeeCounts(prev => ({
      ...prev,
      [employeeId]: Math.max(0, prev[employeeId] + change)
    }));
  };

  const { totals, grandTotal, effectiveUnitPrice } = useMemo(() => {
    const hasLowerPrices = selectedMilestones.has('LOWER_PRICES');
    const employeeDeduction = (employeeCounts.DISCOUNT * 1) + (employeeCounts.PRICING * 3);
    const effectiveUnitPrice = Math.max(0, baseUnitPrice - (hasLowerPrices ? 1 : 0) - employeeDeduction);

    const pizzaBonus = selectedMilestones.has('PIZZA_MARKETED') ? 5 : 0;
    const burgerBonus = selectedMilestones.has('BURGER_MARKETED') ? 5 : 0;
    const drinkBonus = selectedMilestones.has('DRINK_MARKETED') ? 5 : 0;

    const calculateSubtotal = (foodItems: FoodItems, priceMultiplier: number) => {
      const pizzaTotal = foodItems.pizzas * (effectiveUnitPrice * priceMultiplier + pizzaBonus);
      const burgerTotal = foodItems.burgers * (effectiveUnitPrice * priceMultiplier + burgerBonus);
      const drinkTotal = foodItems.drinks * (effectiveUnitPrice * priceMultiplier + drinkBonus);
      const coffeeTotal = foodItems.coffee * (effectiveUnitPrice * priceMultiplier);
      const noodlesTotal = foodItems.noodles * (effectiveUnitPrice * priceMultiplier);
      const kimchiTotal = foodItems.kimchi * (effectiveUnitPrice * priceMultiplier);
      const sushiTotal = foodItems.sushi * (effectiveUnitPrice * priceMultiplier);
      return pizzaTotal + burgerTotal + drinkTotal + coffeeTotal + noodlesTotal + kimchiTotal + sushiTotal;
    };

    const isLobbyistEnabled = selectedModules.has('LOBBYIST');
    const baseTotal = calculateSubtotal(items.base, 1);
    const gardenTotal = calculateSubtotal(items.garden, 2);
    const parkTotal = isLobbyistEnabled ? calculateSubtotal(items.park, 3) : 0;

    const preBonusTotal = baseTotal + gardenTotal + parkTotal;
    const has100Milestone = selectedMilestones.has('HAVE_100');
    const finalGrandTotal = has100Milestone ? Math.floor(preBonusTotal * 1.5) : preBonusTotal;

    return {
      totals: {
        base: baseTotal,
        garden: gardenTotal,
        park: parkTotal,
      },
      grandTotal: finalGrandTotal,
      effectiveUnitPrice,
    };
  }, [items, baseUnitPrice, selectedMilestones, selectedModules, employeeCounts]);

  const getSelectedLabel = (items: any[], selectedIds: Set<string>, defaultText: string, singularText: string, pluralText: string) => {
    if (selectedIds.size === 0) return defaultText;
    if (selectedIds.size === 1) {
      const id = selectedIds.values().next().value;
      return items.find(m => m.id === id)?.label || defaultText;
    }
    return `${selectedIds.size} ${pluralText}`;
  };

  const houseTypes: { id: HouseType, label: string, bonusInfo: string }[] = [
    { id: 'base', label: 'Base House', bonusInfo: '1x Price' },
    { id: 'garden', label: 'House + (Garden / Park)', bonusInfo: '2x Price' },
    { id: 'park', label: 'House, Garden, & Park', bonusInfo: '3x Price' },
  ];

  const isLobbyistEnabled = selectedModules.has('LOBBYIST');
  const visibleHouseTypes = houseTypes.filter(house => house.id !== 'park' || isLobbyistEnabled);
  const gridColsClass = visibleHouseTypes.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';
  const visibleEmployees = EMPLOYEES.filter(emp => selectedEmployees.has(emp.id));

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
        <div className="grid grid-cols-1 gap-4">
          <div ref={moduleDropdownRef} className="relative bg-slate-800 p-3 rounded-lg w-full border border-slate-700 shadow-lg flex flex-col justify-center">
            <label className="block text-sm font-semibold text-slate-300 mb-1 text-center">Modules Used</label>
            <button onClick={() => setIsModuleDropdownOpen(p => !p)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"><span className="truncate">{getSelectedLabel(MODULES, selectedModules, 'Select Modules', 'Module', 'Modules Selected')}</span><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isModuleDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
            {isModuleDropdownOpen && (<div className="absolute top-full right-0 mt-2 w-full bg-slate-700 rounded-md shadow-lg z-50 overflow-hidden border border-slate-600 max-h-48 overflow-y-auto">{MODULES.map(module => (<label key={module.id} className="flex items-center w-full text-left px-4 py-3 text-sm transition-colors text-slate-200 hover:bg-slate-600 cursor-pointer"><input type="checkbox" checked={selectedModules.has(module.id)} onChange={() => handleModuleToggle(module.id)} className="h-4 w-4 rounded bg-slate-800 border-slate-500 text-sky-500 focus:ring-sky-500" /><div className="ml-3"><p className="font-semibold">{module.label}</p><p className="text-xs text-slate-400">{module.description}</p></div></label>))}</div>)}
          </div>
          <div ref={milestoneDropdownRef} className="relative bg-slate-800 p-3 rounded-lg w-full border border-slate-700 shadow-lg flex flex-col justify-center">
            <label className="block text-sm font-semibold text-slate-300 mb-1 text-center">Milestones</label>
            <button onClick={() => setIsMilestoneDropdownOpen(p => !p)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"><span className="truncate">{getSelectedLabel(MILESTONES, selectedMilestones, 'Select Milestones', 'Milestone', 'Milestones Selected')}</span><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isMilestoneDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
            {isMilestoneDropdownOpen && (<div className="absolute top-full right-0 mt-2 w-full bg-slate-700 rounded-md shadow-lg z-50 overflow-hidden border border-slate-600 max-h-48 overflow-y-auto">{MILESTONES.map(milestone => (<label key={milestone.id} className="flex items-center w-full text-left px-4 py-3 text-sm transition-colors text-slate-200 hover:bg-slate-600 cursor-pointer"><input type="checkbox" checked={selectedMilestones.has(milestone.id)} onChange={() => handleMilestoneToggle(milestone.id)} className="h-4 w-4 rounded bg-slate-800 border-slate-500 text-sky-500 focus:ring-sky-500" /><div className="ml-3"><p className="font-semibold">{milestone.label}</p><p className="text-xs text-slate-400">{milestone.description}</p></div></label>))}</div>)}
          </div>
          <div ref={employeeDropdownRef} className="relative bg-slate-800 p-3 rounded-lg w-full border border-slate-700 shadow-lg flex flex-col justify-center">
            <label className="block text-sm font-semibold text-slate-300 mb-1 text-center">Employees Working</label>
            <button onClick={() => setIsEmployeeDropdownOpen(p => !p)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"><span className="truncate">{getSelectedLabel(EMPLOYEES, selectedEmployees, 'Select Employees', 'Employee', 'Employees Selected')}</span><svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isEmployeeDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
            {isEmployeeDropdownOpen && (<div className="absolute top-full right-0 mt-2 w-full bg-slate-700 rounded-md shadow-lg z-50 overflow-hidden border border-slate-600 max-h-48 overflow-y-auto">{EMPLOYEES.map(emp => (<label key={emp.id} className="flex items-center w-full text-left px-4 py-3 text-sm transition-colors text-slate-200 hover:bg-slate-600 cursor-pointer"><input type="checkbox" checked={selectedEmployees.has(emp.id)} onChange={() => handleEmployeeToggle(emp.id)} className="h-4 w-4 rounded bg-slate-800 border-slate-500 text-sky-500 focus:ring-sky-500" /><div className="ml-3"><p className="font-semibold">{emp.label}</p><p className="text-xs text-slate-400">{emp.description}</p></div></label>))}</div>)}
          </div>
        </div>
      </div>

      {visibleEmployees.length > 0 && (
        <div className="w-full max-w-xl p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-300 mb-3 text-center">Employee Counts</h3>
          <div className="flex justify-center flex-wrap gap-4">
            {visibleEmployees.map(emp => (
              <div key={emp.id} className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-slate-700/50 min-w-[180px]">
                <p className="text-slate-300 text-sm font-semibold truncate" title={emp.label}>{emp.label}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEmployeeCountChange(emp.id as EmployeeType, -1)} className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none" aria-label={`Decrease ${emp.label}`}>-</button>
                  <span className="text-2xl font-mono w-10 text-center select-none">{employeeCounts[emp.id as EmployeeType]}</span>
                  <button onClick={() => handleEmployeeCountChange(emp.id as EmployeeType, 1)} className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none" aria-label={`Increase ${emp.label}`}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="w-full flex flex-col items-center">
        <div className={`grid grid-cols-1 ${gridColsClass} gap-4 w-full max-w-5xl`}>
          {visibleHouseTypes.map(house => (
            <div key={house.id} className="w-full flex-shrink-0 bg-slate-800 rounded-lg flex flex-col border border-slate-700 shadow-lg">
              <div className="p-3 text-center border-b-2 border-slate-600 h-16 flex flex-col items-center justify-center">
                <h2 className="text-lg font-bold truncate">{house.label}</h2>
                <p className="text-xs text-slate-400">{house.bonusInfo}</p>
              </div>
              
              <div className="flex-grow p-2">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  <FoodItemCounter label="Pizzas" type="pizzas" count={items[house.id].pizzas} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />
                  <FoodItemCounter label="Burgers" type="burgers" count={items[house.id].burgers} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />
                  <FoodItemCounter label="Drinks" type="drinks" count={items[house.id].drinks} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />
                  {selectedModules.has('COFFEE') && (<FoodItemCounter label="Coffee" type="coffee" count={items[house.id].coffee} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />)}
                  {selectedModules.has('NOODLES') && (<FoodItemCounter label="Noodles" type="noodles" count={items[house.id].noodles} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />)}
                  {selectedModules.has('KIMCHI') && (<FoodItemCounter label="Kimchi" type="kimchi" count={items[house.id].kimchi} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />)}
                  {selectedModules.has('SUSHI') && house.id !== 'base' && (<FoodItemCounter label="Sushi" type="sushi" count={items[house.id].sushi} onItemChange={(type, change) => handleItemChange(house.id, type, change)} />)}
                </div>
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
