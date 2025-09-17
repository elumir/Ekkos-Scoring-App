import React, { useState, useMemo, useEffect } from 'react';
import MultiSelectModal from './MultiSelectModal';
import ConfirmationModal from './ConfirmationModal';

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
  { id: 'FIRST_WAITRESS', label: 'First Waitress Played', description: '+$2 bonus per waitress' },
  { id: 'FIRST_WAITRESS_USED', label: 'First Waitress Used', description: 'Reduces salaries to $3 each' },
  { id: 'FIRST_TO_TRAIN', label: 'First to Train Someone', description: 'First $15 of salaries do not count.' },
  { id: 'HAVE_100', label: 'First to Have $100', description: '+50% to cash earned' },
  { id: 'FIRST_MARKETEER_USED', label: 'First Marketeer Used', description: '+$5 per good marketed (after 50% bonus).' },
];

const EMPLOYEES = [
  { id: 'DISCOUNT', label: 'Discount Manager (–$1)', description: 'Reduces unit price by $1 per manager.' },
  { id: 'PRICING', label: 'Pricing Manager (–$3)', description: 'Reduces unit price by $3 per manager.' },
  { id: 'LUXURY_MANAGER', label: 'Luxury Manager (+$10)', description: 'Increases unit price by $10. Limit one.' },
  { id: 'WAITRESS', label: 'Waitress (+$3)', description: 'Adds a flat $3 to total revenue per waitress.' },
  { id: 'FRY_CHEF', label: 'Fry Chef (+$10/house)', description: 'Adds $10 per house served to total revenue, per fry chef.' },
  { id: 'CFO', label: 'CFO (+50%)', description: 'Adds 50% to total revenue. Cannot be used with $100 milestone.' },
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
type EmployeeType = 'DISCOUNT' | 'PRICING' | 'WAITRESS' | 'FRY_CHEF';

const initialFoodItemsState = { pizzas: 0, burgers: 0, drinks: 0, coffee: 0, noodles: 0, kimchi: 0, sushi: 0 };
const initialItemsState = {
    base: { ...initialFoodItemsState },
    garden: { ...initialFoodItemsState },
    park: { ...initialFoodItemsState },
};
const initialEmployeeCountsState = { DISCOUNT: 0, PRICING: 0, WAITRESS: 0, FRY_CHEF: 0 };


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
  const [baseUnitPrice, setBaseUnitPrice] = useState(10);
  const [items, setItems] = useState<Record<HouseType, FoodItems>>(initialItemsState);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [employeeCounts, setEmployeeCounts] = useState(initialEmployeeCountsState);
  const [salariesCount, setSalariesCount] = useState(0);
  const [fryChefHouses, setFryChefHouses] = useState(0);
  const [goodsMarketed, setGoodsMarketed] = useState(0);

  const [revenueHistory, setRevenueHistory] = useState<number[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isNewGameConfirmOpen, setIsNewGameConfirmOpen] = useState(false);
  
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
        if (!selectedEmployees.has('WAITRESS') && newCounts.WAITRESS > 0) {
            newCounts.WAITRESS = 0;
            countsChanged = true;
        }
        if (!selectedEmployees.has('FRY_CHEF') && newCounts.FRY_CHEF > 0) {
            newCounts.FRY_CHEF = 0;
            countsChanged = true;
        }
        return countsChanged ? newCounts : currentCounts;
    });

    if (!selectedEmployees.has('FRY_CHEF')) {
      setFryChefHouses(0);
    }
  }, [selectedEmployees]);

  useEffect(() => {
    if (selectedMilestones.has('HAVE_100')) {
      setSelectedEmployees(prev => {
        if (prev.has('CFO')) {
          const newSet = new Set(prev);
          newSet.delete('CFO');
          return newSet;
        }
        return prev;
      });
    }
  }, [selectedMilestones]);

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
    const isCurrentlySelected = selectedEmployees.has(employeeId);

    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (isCurrentlySelected) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });

    if (!isCurrentlySelected && (employeeId === 'DISCOUNT' || employeeId === 'PRICING' || employeeId === 'WAITRESS' || employeeId === 'FRY_CHEF')) {
      setEmployeeCounts(prevCounts => ({
        ...prevCounts,
        [employeeId as EmployeeType]: 1,
      }));
    }
  };

  const handleEmployeeCountChange = (employeeId: EmployeeType, change: number) => {
    setEmployeeCounts(prev => ({
      ...prev,
      [employeeId]: Math.max(0, prev[employeeId] + change)
    }));
  };
  
  const handleFryChefHousesChange = (change: number) => {
    setFryChefHouses(prev => Math.max(0, prev + change));
  };

  const handleSalariesChange = (change: number) => {
    setSalariesCount(prev => Math.max(0, prev + change));
  };
  
  const handleGoodsMarketedChange = (change: number) => {
    setGoodsMarketed(prev => Math.max(0, prev + change));
  };

  const handleReserveSelect = (price: number) => {
    setBaseUnitPrice(price);
    setIsReserveModalOpen(false);
  };

  const handleResetDinner = () => {
    setItems(initialItemsState);
    setSelectedEmployees(new Set());
    setEmployeeCounts(initialEmployeeCountsState);
    setFryChefHouses(0);
    setGoodsMarketed(0);
  };
  
  const handleRecordAndResetDinner = () => {
    setRevenueHistory(prev => [...prev, dinnerRevenue]);
    handleResetDinner();
  };

  const handleResetAll = () => {
    handleResetDinner();
    setSalariesCount(0);
    setBaseUnitPrice(10);
    setSelectedModules(new Set());
    setSelectedMilestones(new Set());
    setRevenueHistory([]);
  };

  const handleConfirmNewGame = () => {
    handleResetAll();
    setIsNewGameConfirmOpen(false);
  };

  const { totals, dinnerRevenue, effectiveUnitPrice, employeeDeduction, flatEmployeeBonus, waitressBonus, salariesCost, trainingDiscount, salaryPerEmployee, marketeerBonus } = useMemo(() => {
    const hasLowerPrices = selectedMilestones.has('LOWER_PRICES');
    const employeeDeduction = (employeeCounts.DISCOUNT * 1) + (employeeCounts.PRICING * 3);
    const luxuryBonus = selectedEmployees.has('LUXURY_MANAGER') ? 10 : 0;
    const effectiveUnitPrice = Math.max(0, baseUnitPrice + luxuryBonus - (hasLowerPrices ? 1 : 0) - employeeDeduction);

    const pizzaBonus = selectedMilestones.has('PIZZA_MARKETED') ? 5 : 0;
    const burgerBonus = selectedMilestones.has('BURGER_MARKETED') ? 5 : 0;
    const drinkBonus = selectedMilestones.has('DRINK_MARKETED') ? 5 : 0;

    const waitressBonus = 3 + (selectedMilestones.has('FIRST_WAITRESS') ? 2 : 0);
    const fryChefBonus = employeeCounts.FRY_CHEF * fryChefHouses * 10;
    const flatEmployeeBonus = (employeeCounts.WAITRESS * waitressBonus) + fryChefBonus;

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

    const preBonusTotal = baseTotal + gardenTotal + parkTotal + flatEmployeeBonus;

    const has100Milestone = selectedMilestones.has('HAVE_100');
    const hasCFO = selectedEmployees.has('CFO');
    const has50PercentBonus = has100Milestone || hasCFO;
    const totalAfterBonus = has50PercentBonus ? Math.floor(preBonusTotal * 1.5) : preBonusTotal;

    const hasMarketeerMilestone = selectedMilestones.has('FIRST_MARKETEER_USED');
    const marketeerBonus = hasMarketeerMilestone ? goodsMarketed * 5 : 0;
    
    const hasFirstWaitressUsed = selectedMilestones.has('FIRST_WAITRESS_USED');
    const salaryPerEmployee = hasFirstWaitressUsed ? 3 : 5;
    const salariesCost = salariesCount * salaryPerEmployee;

    const hasFirstToTrain = selectedMilestones.has('FIRST_TO_TRAIN');
    const trainingDiscount = hasFirstToTrain ? Math.min(salariesCost, 15) : 0;
    const netSalariesCost = salariesCost - trainingDiscount;

    const finalGrandTotal = totalAfterBonus + marketeerBonus - netSalariesCost;

    return {
      totals: {
        base: baseTotal,
        garden: gardenTotal,
        park: parkTotal,
      },
      dinnerRevenue: finalGrandTotal,
      effectiveUnitPrice,
      employeeDeduction,
      flatEmployeeBonus,
      waitressBonus,
      salariesCost,
      trainingDiscount,
      salaryPerEmployee,
      marketeerBonus,
    };
  }, [items, selectedMilestones, selectedModules, employeeCounts, selectedEmployees, baseUnitPrice, salariesCount, fryChefHouses, goodsMarketed]);

  const availableEmployees = useMemo(() => {
    if (selectedMilestones.has('HAVE_100')) {
        return EMPLOYEES.filter(emp => emp.id !== 'CFO');
    }
    return EMPLOYEES;
  }, [selectedMilestones]);

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
  
  const countableEmployees = EMPLOYEES.filter(emp =>
    selectedEmployees.has(emp.id) && (emp.id === 'DISCOUNT' || emp.id === 'PRICING' || emp.id === 'WAITRESS' || emp.id === 'FRY_CHEF')
  );

  const fryChefBonus = employeeCounts.FRY_CHEF * fryChefHouses * 10;
  const totalBank = revenueHistory.reduce((acc, val) => acc + val, 0);

  return (
    <div className="flex-grow w-full flex flex-col items-center p-4 space-y-4 overflow-y-auto">
      <h1 className="text-3xl font-bold text-slate-100">Food Chain Magnate Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-5xl mb-4 flex-shrink-0">
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => setIsReserveModalOpen(true)}
                className="bg-slate-800 p-4 rounded-lg w-full border border-slate-700 shadow-lg flex flex-col items-center justify-center text-left hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="Change base unit price"
              >
                <label className="block text-base font-semibold text-slate-300 text-center cursor-pointer">
                    Effective Unit Price
                </label>
                <p className="text-xs text-slate-500 mb-1">(Click for Reserve)</p>
                <p className="text-5xl font-mono text-sky-400 font-bold">${effectiveUnitPrice}</p>
                <p className="text-center text-xs text-slate-400 mt-1 space-x-2">
                  <span>Base: ${baseUnitPrice}</span>
                  {selectedEmployees.has('LUXURY_MANAGER') && <span className="text-green-400"> +${10}</span>}
                  {selectedMilestones.has('LOWER_PRICES') && <span className="text-red-400"> -${1}</span>}
                  {employeeDeduction > 0 && <span className="text-red-400"> -${employeeDeduction}</span>}
                </p>
            </button>
            <div className="bg-slate-800 p-4 rounded-lg w-full border border-slate-700 shadow-lg flex flex-col items-center justify-center">
                <label className="block text-base font-semibold text-slate-300 mb-1 text-center">
                    Flat Employee Bonus
                </label>
                <p className="text-5xl font-mono text-green-400 font-bold">+${flatEmployeeBonus}</p>
                <p className="text-center text-xs text-slate-400 mt-1 space-x-2">
                  {employeeCounts.WAITRESS > 0 && <span>Waitress: ${employeeCounts.WAITRESS * waitressBonus}</span>}
                  {employeeCounts.FRY_CHEF > 0 && <span>Fry Chef: ${fryChefBonus}</span>}
                </p>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-800 p-3 rounded-lg w-full border border-slate-700 shadow-lg flex flex-col justify-center">
            <label className="block text-sm font-semibold text-slate-300 mb-1 text-center">Modules Used</label>
            <button onClick={() => setIsModuleModalOpen(true)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"><span className="truncate">{getSelectedLabel(MODULES, selectedModules, 'Select Modules', 'Module', 'Modules Selected')}</span><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg w-full border border-slate-700 shadow-lg flex flex-col justify-center">
            <label className="block text-sm font-semibold text-slate-300 mb-1 text-center">Milestones</label>
            <button onClick={() => setIsMilestoneModalOpen(true)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"><span className="truncate">{getSelectedLabel(MILESTONES, selectedMilestones, 'Select Milestones', 'Milestone', 'Milestones Selected')}</span><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg w-full border border-slate-700 shadow-lg flex flex-col justify-center">
            <label className="block text-sm font-semibold text-slate-300 mb-1 text-center">Employees Working</label>
            <button onClick={() => setIsEmployeeModalOpen(true)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"><span className="truncate">{getSelectedLabel(EMPLOYEES, selectedEmployees, 'Select Employees', 'Employee', 'Employees Selected')}</span><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
          </div>
        </div>
      </div>

      {countableEmployees.length > 0 && (
        <div className="w-full max-w-4xl p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-300 mb-3 text-center">Employee Counts</h3>
          <div className="flex justify-center flex-wrap gap-4">
            {countableEmployees.map(emp => (
              emp.id === 'FRY_CHEF' ? (
                <div key={emp.id} className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-slate-700/50 min-w-[240px]">
                  <p className="text-slate-300 text-sm font-semibold truncate" title={emp.label}>{emp.label}</p>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center space-y-1">
                      <p className="text-xs text-slate-400">Chefs</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEmployeeCountChange(emp.id as EmployeeType, -1)} className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none" aria-label={`Decrease ${emp.label}`}>-</button>
                        <span className="text-2xl font-mono w-10 text-center select-none">{employeeCounts[emp.id as EmployeeType]}</span>
                        <button onClick={() => handleEmployeeCountChange(emp.id as EmployeeType, 1)} className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none" aria-label={`Increase ${emp.label}`}>+</button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <p className="text-xs text-slate-400">Houses Served</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleFryChefHousesChange(-1)} className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none" aria-label="Decrease Houses Served">-</button>
                        <span className="text-2xl font-mono w-10 text-center select-none">{fryChefHouses}</span>
                        <button onClick={() => handleFryChefHousesChange(1)} className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none" aria-label="Increase Houses Served">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={emp.id} className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-slate-700/50 min-w-[180px]">
                  <p className="text-slate-300 text-sm font-semibold truncate" title={emp.label}>{emp.label}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEmployeeCountChange(emp.id as EmployeeType, -1)} className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none" aria-label={`Decrease ${emp.label}`}>-</button>
                    <span className="text-2xl font-mono w-10 text-center select-none">{employeeCounts[emp.id as EmployeeType]}</span>
                    <button onClick={() => handleEmployeeCountChange(emp.id as EmployeeType, 1)} className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none" aria-label={`Increase ${emp.label}`}>+</button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <main className="w-full flex flex-col items-center">
        <div className={`grid grid-cols-1 ${gridColsClass} gap-4 w-full max-w-5xl`}>
          {visibleHouseTypes.map(house => (
            <div key={house.id} className="w-full flex-shrink-0 bg-slate-800 rounded-lg flex flex-col border border-slate-700 shadow-lg">
              <div className="p-3 border-b-2 border-slate-600 h-16 flex items-center justify-between">
                <div className="text-left">
                    <h2 className="text-lg font-bold truncate">{house.label}</h2>
                    <p className="text-xs text-slate-400">{house.bonusInfo}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Subtotal</p>
                    <p className="text-2xl font-bold font-mono">${totals[house.id]}</p>
                </div>
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

            </div>
          ))}
        </div>

        <div className="w-full max-w-5xl mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-300">Salaries</h3>
          <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-slate-700/50 min-w-[240px]">
            <p className="text-slate-300 text-sm font-semibold">Number of Employees to Pay (${salaryPerEmployee} each)</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSalariesChange(-1)}
                className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none"
                aria-label="Decrease Salaries"
              >
                -
              </button>
              <span className="text-2xl font-mono w-10 text-center select-none">{salariesCount}</span>
              <button
                onClick={() => handleSalariesChange(1)}
                className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none"
                aria-label="Increase Salaries"
              >
                +
              </button>
            </div>
            <p className="text-sm text-red-400 font-mono">Total Salary Cost: -${salariesCost}</p>
            {trainingDiscount > 0 && (
              <p className="text-sm text-green-400 font-mono">'First to Train' Discount: +${trainingDiscount}</p>
            )}
          </div>
        </div>

        {selectedMilestones.has('FIRST_MARKETEER_USED') && (
          <div className="w-full max-w-5xl mt-2 p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg flex flex-col items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-300">Marketeer Bonus</h3>
            <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-slate-700/50 min-w-[240px]">
              <p className="text-slate-300 text-sm font-semibold">Number of Goods Marketed (+$5 each)</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGoodsMarketedChange(-1)}
                  className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none"
                  aria-label="Decrease Goods Marketed"
                >
                  -
                </button>
                <span className="text-2xl font-mono w-10 text-center select-none">{goodsMarketed}</span>
                <button
                  onClick={() => handleGoodsMarketedChange(1)}
                  className="w-7 h-7 text-lg rounded-full bg-slate-600 hover:bg-slate-500 transition-colors flex items-center justify-center leading-none"
                  aria-label="Increase Goods Marketed"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-green-400 font-mono">Total Marketeer Bonus: +${marketeerBonus}</p>
            </div>
          </div>
        )}
        
        <div className="w-full max-w-5xl mt-2 p-4 bg-slate-800 border border-sky-500 rounded-lg shadow-lg flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold">Dinner Revenue</h2>
            <p className="text-4xl font-bold font-mono text-sky-400">${dinnerRevenue}</p>
        </div>
        
        <div className="w-full max-w-5xl mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg flex flex-col flex-shrink-0">
          <button
            onClick={() => setIsHistoryVisible(prev => !prev)}
            className="p-4 flex items-center justify-between w-full text-left hover:bg-slate-700/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold">Total Bank</h2>
              <p className="text-2xl font-bold font-mono text-green-400">${totalBank}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isHistoryVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isHistoryVisible && (
            <div className="p-4 border-t border-slate-600 animate-fade-in">
              <h3 className="text-lg font-semibold mb-2 text-slate-300">Revenue History</h3>
              {revenueHistory.length > 0 ? (
                <ul className="space-y-1 max-h-40 overflow-y-auto pr-2">
                  {revenueHistory.map((revenue, index) => (
                    <li key={index} className="flex justify-between items-center text-slate-300 font-mono text-lg p-1 rounded bg-slate-700/50">
                      <span>Dinner {index + 1}:</span>
                      <span>${revenue}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 italic">No dinners recorded yet.</p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-5xl mt-4 flex items-center justify-center gap-4 flex-shrink-0">
        <button
          onClick={() => setIsNewGameConfirmOpen(true)}
          className="px-6 py-2 bg-yellow-500/80 hover:bg-yellow-500 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          New Game
        </button>
        <button
          onClick={handleRecordAndResetDinner}
          className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Record Dinner &amp; Reset
        </button>
      </footer>

      {isReserveModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setIsReserveModalOpen(false)}
        >
          <div
            className="bg-slate-800 rounded-lg shadow-xl p-6 m-4 w-full max-w-sm border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Reserve Card</h2>
              <button
                onClick={() => setIsReserveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Close"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
            </div>
            <p className="text-slate-300 mb-6">Select a unit price from the reserve card.</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleReserveSelect(5)}
                className="w-full px-4 py-3 bg-sky-600 rounded text-white font-semibold hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                $5 Unit Price
              </button>
              <button
                onClick={() => handleReserveSelect(10)}
                className="w-full px-4 py-3 bg-sky-600 rounded text-white font-semibold hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                $10 Unit Price
              </button>
              <button
                onClick={() => handleReserveSelect(20)}
                className="w-full px-4 py-3 bg-sky-600 rounded text-white font-semibold hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                $20 Unit Price
              </button>
            </div>
          </div>
        </div>
      )}

      <MultiSelectModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        title="Select Modules"
        options={MODULES}
        selectedIds={selectedModules}
        onToggle={handleModuleToggle}
      />

      <MultiSelectModal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        title="Select Milestones"
        options={MILESTONES}
        selectedIds={selectedMilestones}
        onToggle={handleMilestoneToggle}
      />
      
      <MultiSelectModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title="Select Employees"
        options={availableEmployees}
        selectedIds={selectedEmployees}
        onToggle={handleEmployeeToggle}
      />

      <ConfirmationModal
        isOpen={isNewGameConfirmOpen}
        onClose={() => setIsNewGameConfirmOpen(false)}
        onConfirm={handleConfirmNewGame}
        title="Start New Game"
        message="Are you sure you want to start a new game? This will reset the entire calculator, including all revenue history."
        confirmButtonText="New Game"
        confirmButtonClass="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
      />

    </div>
  );
};

export default FCMDinnerCalc;