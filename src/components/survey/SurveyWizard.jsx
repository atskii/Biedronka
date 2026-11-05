import React, { useState, useRef } from 'react';
import {
  Users,
  User,
  Calendar,
  Wallet,
  Salad,
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Check,
  Tag,
} from 'lucide-react';
import { DIET_OPTIONS } from '../../data/biedronkaCatalog';
import ExclusionSearch from './ExclusionSearch';
import FoodIcon from '../common/FoodIcon';

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

  const handleTouchEnd = (e) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 25) {
      handleNext();
    } else if (diff < -25) {
      handlePrev();
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 flex items-center justify-center gap-4 shadow-xs">
      <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 select-none">
        {label}
      </span>

      {/* Roller góra-dół */}
      <div className="flex flex-col items-center">
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
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-16 h-[144px] overflow-hidden select-none outline-none focus:ring-2 focus:ring-red-700/20 rounded-2xl"
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
  const [budgetPln, setBudgetPln] = useState(initialValues?.budgetPln || 140);
  const [dietType, setDietType] = useState(initialValues?.dietType || 'nie_vege');
  const [excludedProductIds, setExcludedProductIds] = useState(
    initialValues?.excludedProductIds || []
  );

  const dailyPerPerson = Number(
    (budgetPln / Math.max(1, peopleCount * daysCount)).toFixed(2)
  );

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
    <div className="flex flex-col justify-between min-h-[calc(100vh-150px)]">
      <div>
        {/* Pasek postępu ankiety 1..5 w stylu Stitch */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-500 mb-2">
            <span className="text-red-700 uppercase tracking-wider font-extrabold">
              Ankieta do planu • Krok {step} z 5
            </span>
            <span className="font-extrabold text-neutral-800">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-700 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* KROK 1: Na ile osób? */}
        {step === 1 && (
          <div className="space-y-6 pt-1">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              1) Na ile osób przygotować plan?
            </h1>

            <RollerPicker
              label="Liczba osób:"
              value={peopleCount}
              onChange={setPeopleCount}
              min={1}
              max={6}
            />
          </div>
        )}

        {/* KROK 2: Ile dni? */}
        {step === 2 && (
          <div className="space-y-6 pt-1">
            <div>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                2) Na ile dni chcesz zaplanować posiłki?
              </h1>
              <p className="text-sm text-neutral-600 mt-2">
                Na każdy dzień znajdziemy dla Ciebie 4 posiłki: śniadanie, obiad, kolacje i przekąskę.
              </p>
            </div>

            <RollerPicker
              label="Liczba dni:"
              value={daysCount}
              onChange={(d) => {
                setDaysCount(d);
                setBudgetPln(Math.round(d * peopleCount * 22));
              }}
              min={1}
              max={7}
            />
          </div>
        )}

        {/* KROK 3: Jaki budżet? */}
        {step === 3 && (
          <div className="space-y-6 pt-1">
            <div>
              <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                3) Jaki budżet chcesz przeznaczyć?
              </h1>
              <p className="text-sm text-neutral-600 mt-2">
                Dobierzemy produkty z aktualnej oferty promocyjnej Biedronki tak, aby zmieścić się w wybranej kwocie.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-sm">
              <span className="text-xs sm:text-sm font-extrabold text-neutral-600 block mb-1">
                Całkowity budżet na {daysCount} {daysCount === 1 ? 'dzień' : 'dni'} dla {peopleCount} os.
              </span>

              <div className="text-3xl sm:text-4xl font-black text-red-700 my-2 tracking-tight">
                {budgetPln} zł
              </div>

              <p className="text-xs font-semibold text-neutral-600 mb-4">
                To około <strong className="text-neutral-900">{dailyPerPerson} zł</strong> dziennie na osobę
              </p>

              <input
                type="range"
                min={Math.max(25, peopleCount * daysCount * 12)}
                max={Math.max(200, peopleCount * daysCount * 55)}
                step={5}
                value={budgetPln}
                onChange={(e) => setBudgetPln(Number(e.target.value))}
                className="w-full accent-red-700 cursor-pointer h-2 bg-neutral-200 rounded-lg"
              />

              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  {
                    label: 'Oszczędny',
                    multiplier: 16,
                  },
                  {
                    label: 'Optymalny',
                    multiplier: 23,
                  },
                  {
                    label: 'Swobodny',
                    multiplier: 32,
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
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* KROK 4: Jaka dieta? */}
        {step === 4 && (
          <div className="space-y-6 pt-1">
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
              4) Jaka dieta Cię interesuje?
            </h1>

            <div className="space-y-2.5 pt-1">
              {DIET_OPTIONS.map((option) => {
                const active = dietType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDietType(option.id)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between text-left transition active:scale-98 ${
                      active
                        ? 'border-red-600 bg-red-50/70 shadow-sm'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <FoodIcon
                        category={option.id}
                        className="w-5 h-5 text-neutral-800"
                        withContainer
                        containerClassName="w-11 h-11 rounded-xl shrink-0"
                        tone={active ? 'crimson' : 'default'}
                      />
                      <div>
                        <p className="text-base font-extrabold text-neutral-900">
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
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-2 ${
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

        {/* KROK 5: Czy chcesz wykluczyć jakieś produkty? */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-extrabold border border-red-200">
              <Search className="w-3.5 h-3.5" />
              <span>Pytanie 5 z 5</span>
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              5) Czy chcesz wykluczyć jakieś produkty?
            </h1>
            <p className="text-sm text-neutral-600">
              Jeśli nie chcesz widzieć wybranych składników w swoich posiłkach, przejdź do wyszukiwarki lub od razu wygeneruj plan.
            </p>

            {/* Podsumowanie wybranych parametrów 1..4 */}
            <div className="p-4 rounded-2xl bg-white border border-neutral-200 grid grid-cols-2 gap-3 text-xs shadow-2xs">
              <div>
                <span className="text-neutral-500 font-medium">Liczba osób:</span>
                <p className="font-extrabold text-neutral-900 text-sm">
                  {peopleCount} {peopleCount === 1 ? 'osoba' : 'os.'}
                </p>
              </div>
              <div>
                <span className="text-neutral-500 font-medium">Czas planu:</span>
                <p className="font-extrabold text-neutral-900 text-sm">
                  {daysCount} {daysCount === 1 ? 'dzień' : 'dni'} (4 posiłki/dzień)
                </p>
              </div>
              <div>
                <span className="text-neutral-500 font-medium">Budżet:</span>
                <p className="font-extrabold text-red-700 text-sm">{budgetPln} zł</p>
              </div>
              <div>
                <span className="text-neutral-500 font-medium">Dieta:</span>
                <p className="font-extrabold text-neutral-900 text-sm">
                  {DIET_OPTIONS.find((d) => d.id === dietType)?.shortLabel}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {/* TAK -> Idzie do wyszukiwarki */}
              <button
                type="button"
                onClick={() => setShowExclusionSearch(true)}
                className="w-full p-4 rounded-2xl border-2 border-neutral-900 bg-white hover:bg-neutral-50 text-left flex items-center justify-between transition group active:scale-98 shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-900 group-hover:bg-neutral-200 transition">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-neutral-900">
                      TAK – przejdź do wyszukiwarki składników
                    </p>
                    <p className="text-xs text-neutral-600">
                      Wybierz produkty, które mają zostać pominięte w przepisach
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-0.5 transition" />
              </button>

              {/* NIE -> Idzie bezpośrednio do generowania */}
              <button
                type="button"
                onClick={() => triggerGeneration([])}
                className="w-full p-4 rounded-2xl bg-red-700 hover:bg-red-800 text-white text-left flex items-center justify-between shadow-md transition active:scale-98"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold">
                      NIE – od razu wygeneruj mój jadłospis
                    </p>
                    <p className="text-xs text-red-100">
                      Uwzględnij wszystkie produkty pasujące do wybranej diety i budżetu
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nawigacja Wstecz / Dalej dla kroków 1..4 */}
      <div className="pt-4 mt-5 border-t border-neutral-200/80 flex items-center gap-2.5">
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

        {step < 5 && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 py-3 px-5 sm:px-6 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <span>Dalej</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
