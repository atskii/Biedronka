import React, { useState, useRef, useMemo } from 'react';
import {
  Users,
  User,
  Calendar,
  Wallet,
  Salad,
  Flame,
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Check,
  Tag,
  X,
  Apple,
  Carrot,
  LeafyGreen,
  Leaf,
  Milk,
  Egg,
  Drumstick,
  Beef,
  Fish,
  Croissant,
} from 'lucide-react';
import { DIET_OPTIONS, PRODUCTS, EXCLUSION_GROUPS } from '../../data/biedronkaCatalog';
import ExclusionSearch from './ExclusionSearch';
import FoodIcon from '../common/FoodIcon';
import ProductImage from '../common/ProductImage';

export { EXCLUSION_GROUPS };

export const CALORIE_PRESETS = [
  {
    id: 1600,
    label: '1600 kcal – Redukcja',
    description: 'Lekki deficyt, idealny do zrzucenia zbędnych kilogramów',
    badge: 'Redukcja',
  },
  {
    id: 1800,
    label: '1800 kcal – Umiarkowany',
    description: 'Dla osób o umiarkowanej aktywności w ciągu dnia',
    badge: 'Fit',
  },
  {
    id: 2000,
    label: '2000 kcal – Standardowy',
    description: 'Klasyczny, optymalnie zbilansowany poziom energii',
    badge: 'Rekomendowany',
  },
  {
    id: 2400,
    label: '2400 kcal – Aktywny',
    description: 'Dla osób trenujących, uprawiających sport i aktywnych',
    badge: 'Energia',
  },
  {
    id: 'dowolny',
    label: 'Bez liczenia kalorii',
    description: 'Pełnowartościowe dania bez restrykcji kalorycznych',
    badge: 'Swobodny',
  },
];

function RollerPicker({
  label,
  value,
  onChange,
  min = 1,
  max = 6,
}) {
  const touchStartY = useRef(0);
  const ITEM_HEIGHT = 48; // px

  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const handlePrev = () => {
    onChange(Math.max(min, value - 1));
  };

  const handleNext = () => {
    onChange(Math.min(max, value + 1));
  };

  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) < 15) return;
    if (e.deltaY > 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;
    if (diff > 30) {
      handleNext();
      touchStartY.current = currentY;
    } else if (diff < -30) {
      handlePrev();
      touchStartY.current = currentY;
    }
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (diff > 15) {
        handleNext();
      } else if (diff < -15) {
        handlePrev();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  const currentIndex = items.indexOf(value);
  const offsetIndex = currentIndex !== -1 ? currentIndex : 0;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="bg-white rounded-3xl p-6 sm:p-8 flex items-center justify-center gap-4 shadow-xs touch-none select-none"
    >
      <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 select-none pointer-events-none">
        {label}
      </span>

      {/* Roller góra-dół */}
      <div className="flex flex-col items-center touch-none">
        <button
          type="button"
          onClick={handlePrev}
          disabled={value <= min}
          className="p-1 text-neutral-400 hover:text-red-700 disabled:opacity-15 disabled:pointer-events-none transition cursor-pointer active:scale-90"
          aria-label="Przewiń w górę (mniej)"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div
          tabIndex={0}
          role="spinbutton"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={label.replace(':', '').trim()}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          className="relative w-16 h-[144px] overflow-hidden select-none outline-none focus:ring-2 focus:ring-red-700/20 rounded-2xl touch-none"
        >
          {/* Taśma rollera */}
          <div
            className="transition-transform duration-250 ease-out will-change-transform"
            style={{
              transform: `translateY(${(1 - offsetIndex) * ITEM_HEIGHT}px)`,
            }}
          >
            {items.map((num) => {
              const isSelected = num === value;
              return (
                <button
                  type="button"
                  key={num}
                  onClick={() => onChange(num)}
                  className={`w-full h-12 flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'text-4xl font-black text-red-700'
                      : 'text-lg font-bold text-neutral-300 hover:text-neutral-500'
                  }`}
                  aria-label={`${num}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={value >= max}
          className="p-1 text-neutral-400 hover:text-red-700 disabled:opacity-15 disabled:pointer-events-none transition cursor-pointer active:scale-90"
          aria-label="Przewiń w dół (więcej)"
        >
          <ChevronDown className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

export default function SurveyWizard({ initialValues, onCompleteSurvey }) {
  const [step, setStep] = useState(1);
  const [showExclusionSearch, setShowExclusionSearch] = useState(false);

  const [peopleCount, setPeopleCount] = useState(initialValues?.peopleCount || 2);
  const [daysCount, setDaysCount] = useState(initialValues?.daysCount || 3);
  const [budgetPln, setBudgetPln] = useState(
    initialValues?.budgetPln || (initialValues?.peopleCount || 2) * (initialValues?.daysCount || 3) * 36
  );
  const [dietType, setDietType] = useState(initialValues?.dietType || 'nie_vege');
  const [targetCalories, setTargetCalories] = useState(
    initialValues?.targetCalories !== undefined ? initialValues.targetCalories : 2000
  );
  const [excludedProductIds, setExcludedProductIds] = useState(
    initialValues?.excludedProductIds || []
  );
  const [exclusionMode, setExclusionMode] = useState(
    initialValues?.excludedProductIds?.length > 0 ? 'tak' : 'nie'
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return EXCLUSION_GROUPS;
    }
    return EXCLUSION_GROUPS.filter((g) =>
      g.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedGroups = useMemo(() => {
    return EXCLUSION_GROUPS.filter(
      (g) =>
        excludedProductIds.includes(g.id) ||
        g.productIds.some((pid) => excludedProductIds.includes(pid))
    );
  }, [excludedProductIds]);

  const dailyPerPerson = Number(
    (budgetPln / Math.max(1, peopleCount * daysCount)).toFixed(2)
  );

  const handleToggleGroup = (group) => {
    const isAllExcluded =
      excludedProductIds.includes(group.id) ||
      group.productIds.every((pid) => excludedProductIds.includes(pid));
    if (isAllExcluded) {
      setExcludedProductIds((prev) =>
        prev.filter((pid) => !group.productIds.includes(pid) && pid !== group.id)
      );
    } else {
      setExcludedProductIds((prev) => [
        ...prev,
        group.id,
        ...group.productIds.filter((pid) => !prev.includes(pid)),
      ]);
    }
  };

  const handleToggleExclude = (productId) => {
    setExcludedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const triggerGeneration = (customExcluded = excludedProductIds) => {
    onCompleteSurvey({
      peopleCount,
      daysCount,
      budgetPln,
      dietType,
      targetCalories,
      excludedProductIds: customExcluded,
    });
  };

  if (showExclusionSearch) {
    return (
      <ExclusionSearch
        excludedProductIds={excludedProductIds}
        onToggleExclude={handleToggleExclude}
        onBack={() => setShowExclusionSearch(false)}
        onConfirmAndGenerate={() => triggerGeneration(excludedProductIds)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between h-full min-h-0">
      {/* Pasek postępu ankiety 1..6 w stylu Stitch */}
      <div className="shrink-0 mb-3 sm:mb-4">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-500 mb-2">
          <span className="text-red-700 uppercase tracking-wider font-extrabold">
            Krok {step} z 6
          </span>
          <span className="font-extrabold text-neutral-800">{Math.round((step / 6) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-700 rounded-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Przewijany obszar pytania z opcjami (zawsze zostawia miejsce na przyciski na dole) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-0.5 space-y-4">
        {/* KROK 1: Na ile osób? */}
        {step === 1 && (
          <div className="space-y-4 pt-1">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              1. Na ile osób przygotować plan?
            </h1>

            <RollerPicker
              label="Liczba osób:"
              value={peopleCount}
              onChange={(p) => {
                setPeopleCount(p);
                setBudgetPln(Math.round(daysCount * p * 36));
              }}
              min={1}
              max={6}
            />
          </div>
        )}

        {/* KROK 2: Ile dni? */}
        {step === 2 && (
          <div className="space-y-4 pt-1">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              2. Na ile dni chcesz zaplanować posiłki?
            </h1>

            <RollerPicker
              label="Liczba dni:"
              value={daysCount}
              onChange={(d) => {
                setDaysCount(d);
                setBudgetPln(Math.round(d * peopleCount * 36));
              }}
              min={1}
              max={7}
            />
          </div>
        )}

        {/* KROK 3: Jaki budżet? */}
        {step === 3 && (
          <div className="space-y-4 pt-1">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              3. Jaki budżet chcesz przeznaczyć?
            </h1>

            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-sm">
              <span className="text-xs sm:text-sm font-extrabold text-neutral-600 block mb-1">
                Całkowity budżet na {daysCount} {daysCount === 1 ? 'dzień' : 'dni'} dla {peopleCount} os.
              </span>

              <div className="text-3xl sm:text-4xl font-black text-red-700 my-2 tracking-tight">
                {budgetPln} zł
              </div>

              <p className="text-xs font-semibold text-neutral-600 mb-4">
                To około <strong className="text-neutral-900">{dailyPerPerson} zł</strong> dziennie na osobę (~{Number((dailyPerPerson / 4).toFixed(2))} zł za posiłek)
              </p>

              <input
                type="range"
                min={Math.max(50, peopleCount * daysCount * 25)}
                max={Math.max(200, peopleCount * daysCount * 60)}
                step={peopleCount * daysCount > 8 ? 10 : 5}
                value={budgetPln}
                onChange={(e) => setBudgetPln(Number(e.target.value))}
                className="w-full accent-red-700 cursor-pointer h-2 bg-neutral-200 rounded-lg"
              />

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  {
                    label: 'Oszczędny',
                    multiplier: 28,
                    hint: '~7 zł / posiłek',
                  },
                  {
                    label: 'Optymalny',
                    multiplier: 36,
                    hint: '~9 zł / posiłek',
                  },
                  {
                    label: 'Swobodny',
                    multiplier: 48,
                    hint: '~12 zł / posiłek',
                  },
                ].map((preset) => {
                  const val = Math.round(peopleCount * daysCount * preset.multiplier);
                  const isSelected = Math.abs(budgetPln - val) <= 5;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBudgetPln(val)}
                      className={`py-2.5 px-2 rounded-xl border text-center transition ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <p className="text-xs font-extrabold truncate">{preset.label}</p>
                      <p className="text-xs sm:text-sm font-black mt-0.5">{val} zł</p>
                      <p className="text-[10px] text-neutral-500 font-medium">{preset.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* KROK 4: Jaka dieta? */}
        {step === 4 && (
          <div className="space-y-3 pt-1">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              4. Jaka dieta Cię interesuje?
            </h1>

            <div className="space-y-2 pt-1">
              {DIET_OPTIONS.map((option) => {
                const active = dietType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDietType(option.id)}
                    className={`w-full p-3 sm:p-3.5 rounded-2xl border-2 flex items-center justify-between text-left transition active:scale-98 ${
                      active
                        ? 'border-red-600 bg-red-50/70 shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FoodIcon
                        category={option.id}
                        className="w-5 h-5 text-neutral-800"
                        withContainer
                        containerClassName="w-10 h-10 rounded-xl shrink-0"
                        tone={active ? 'crimson' : 'default'}
                      />
                      <div>
                        <p className="text-sm sm:text-base font-extrabold text-neutral-900">
                          {option.label}
                        </p>
                        {option.description && (
                          <p className="text-xs text-neutral-600 mt-0.5">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 ${
                        active
                          ? 'bg-red-700 text-white shadow-2xs'
                          : 'border-2 border-neutral-300'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* KROK 5: Jaki cel kaloryczny? - Suwak z 2000 kcal na środku, bez etykiet oceniających */}
        {step === 5 && (
          <div className="space-y-4 pt-1">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              5. Jaki jest Twój dzienny cel kaloryczny?
            </h1>

            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-sm">
              <span className="text-xs sm:text-sm font-extrabold text-neutral-500 block mb-1">
                Liczba kalorii dziennie na osobę:
              </span>

              <div className="text-3xl sm:text-4xl font-black text-red-700 my-2 tracking-tight">
                {targetCalories === 'dowolny' ? 'Bez liczenia kalorii' : `${targetCalories || 2000} kcal`}
              </div>

              {/* Suwak z 2000 kcal na samym środku (1400 .. 2000 .. 2600) */}
              <div className="pt-2 pb-1">
                <input
                  type="range"
                  min={1400}
                  max={2600}
                  step={50}
                  value={typeof targetCalories === 'number' ? targetCalories : 2000}
                  onChange={(e) => setTargetCalories(Number(e.target.value))}
                  className="w-full accent-red-700 cursor-pointer h-2 bg-neutral-200 rounded-lg"
                />

                {/* Stopnie kaloryczne na suwaku - 2000 na środku, tylko wartości kcal */}
                <div className="flex justify-between text-[11px] font-bold text-neutral-500 mt-2 px-0.5">
                  <span>1400 kcal</span>
                  <span>1600 kcal</span>
                  <span className="font-black text-red-700">2000 kcal</span>
                  <span>2400 kcal</span>
                  <span>2600 kcal</span>
                </div>
              </div>

              {/* Przyciski stopni kalorycznych - tylko wartości kcal */}
              <div className="grid grid-cols-4 gap-1.5 mt-4">
                {[1600, 1800, 2000, 2400].map((val) => {
                  const isSelected = targetCalories === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTargetCalories(val)}
                      className={`py-2 px-1 rounded-xl border text-center transition ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-700 font-black'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100 font-bold'
                      }`}
                    >
                      <p className="text-xs">{val} kcal</p>
                    </button>
                  );
                })}
              </div>

              {/* Przycisk: Bez liczenia kalorii */}
              <button
                type="button"
                onClick={() => setTargetCalories(targetCalories === 'dowolny' ? 2000 : 'dowolny')}
                className={`w-full mt-3 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  targetCalories === 'dowolny'
                    ? 'border-red-600 bg-red-50 text-red-700 font-black'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                <span>Bez liczenia kalorii</span>
              </button>
            </div>
          </div>
        )}

        {/* KROK 6: Czy chcesz wykluczyć jakieś produkty? */}
        {step === 6 && (
          <div className="space-y-4 pt-1">
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              6. Czy chcesz wykluczyć jakieś produkty?
            </h1>

            <div className="space-y-3">
              {/* Kafelek 1: Tak z wyszukiwarką */}
              <div
                className={`w-full p-4 rounded-2xl border-2 transition ${
                  exclusionMode === 'tak'
                    ? 'border-red-600 bg-white shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div
                  onClick={() => {
                    setExclusionMode('tak');
                    setIsSearchOpen(true);
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        exclusionMode === 'tak'
                          ? 'bg-red-700 text-white shadow-2xs'
                          : 'border-2 border-neutral-300'
                      }`}
                    >
                      {exclusionMode === 'tak' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-base font-extrabold text-neutral-900">Tak</span>
                  </div>
                  {selectedGroups.length > 0 && (
                    <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                      Wykluczono: {selectedGroups.length}
                    </span>
                  )}
                </div>

                {/* Wyszukiwarka z lupą */}
                <div className="mt-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onFocus={() => {
                        setExclusionMode('tak');
                        setIsSearchOpen(true);
                      }}
                      onClick={() => {
                        setExclusionMode('tak');
                        setIsSearchOpen(true);
                      }}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setExclusionMode('tak');
                        setIsSearchOpen(true);
                      }}
                      placeholder="Wyszukaj składnik..."
                      className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-red-600 focus:bg-white transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600"
                        aria-label="Wyczyść wyszukiwanie"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rozwijana lista wyników po kliknięciu w wyszukiwarkę */}
                {(isSearchOpen || exclusionMode === 'tak') && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-neutral-100">
                    {selectedGroups.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                          Wykluczone:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedGroups.map((group) => {
                            return (
                              <button
                                key={group.id}
                                type="button"
                                onClick={() => handleToggleGroup(group)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-2xs"
                              >
                                <ProductImage
                                  productId={group.productIds[0]}
                                  name={group.name}
                                  className="w-4 h-4 rounded-md shrink-0"
                                />
                                <span>{group.name}</span>
                                <X className="w-3.5 h-3.5 ml-0.5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                      {filteredGroups.map((group) => {
                        const isExcluded =
                          excludedProductIds.includes(group.id) ||
                          group.productIds.every((pid) =>
                            excludedProductIds.includes(pid)
                          );
                        return (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => handleToggleGroup(group)}
                            className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-left transition text-xs font-bold ${
                              isExcluded
                                ? 'bg-red-50/90 text-red-700 border border-red-300 ring-1 ring-red-400'
                                : 'bg-neutral-50/80 text-neutral-800 hover:bg-neutral-100 border border-neutral-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <ProductImage
                                productId={group.productIds[0]}
                                name={group.name}
                                className="w-9 h-9 rounded-xl shrink-0"
                              />
                              <span className="truncate text-sm font-bold text-neutral-900">{group.name}</span>
                            </div>
                            <span
                              className={`text-[11px] px-2.5 py-1 rounded-lg shrink-0 ml-2 font-black transition ${
                                isExcluded
                                  ? 'bg-red-600 text-white shadow-2xs'
                                  : 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300'
                              }`}
                            >
                              {isExcluded ? 'Wykluczono' : 'Wyklucz'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Kafelek 2: Nie */}
              <button
                type="button"
                onClick={() => {
                  setExclusionMode('nie');
                  setExcludedProductIds([]);
                  setIsSearchOpen(false);
                }}
                className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition active:scale-98 ${
                  exclusionMode === 'nie'
                    ? 'border-red-600 bg-red-50/70 shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      exclusionMode === 'nie'
                        ? 'bg-red-700 text-white shadow-2xs'
                        : 'border-2 border-neutral-300'
                    }`}
                  >
                    {exclusionMode === 'nie' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-base font-extrabold text-neutral-900">Nie</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nawigacja Wstecz / Dalej dla kroków 1..5 oraz Wstecz / Stwórz plan dla kroku 6 */}
      <div className="shrink-0 pt-2.5 pb-1 border-t border-neutral-200/80 flex items-center gap-2.5 bg-[#FBFBF7]">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-white border border-neutral-300 text-neutral-800 font-bold text-sm flex items-center gap-1.5 hover:bg-neutral-50 transition active:scale-95 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Wstecz</span>
          </button>
        )}

        {step < 6 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 py-3 px-5 sm:px-6 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <span>Dalej</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              triggerGeneration(exclusionMode === 'nie' ? [] : excludedProductIds)
            }
            className="flex-1 py-3.5 px-5 sm:px-6 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <span>Stwórz plan</span>
          </button>
        )}
      </div>
    </div>
  );
}
