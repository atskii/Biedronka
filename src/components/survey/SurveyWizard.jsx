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

const ROLLER_PEOPLE_OPTIONS = [
  { count: 1, label: '1 osoba', desc: 'Singiel • porcje indywidualne' },
  { count: 2, label: '2 osoby', desc: 'Dla pary lub 2 współlokatorów' },
  { count: 3, label: '3 osoby', desc: 'Trzyosobowe gospodarstwo' },
  { count: 4, label: '4 osoby', desc: 'Pełny obiad dla 4 osób' },
  { count: 5, label: '5 osób', desc: 'Większa grupa (5 osób)' },
  { count: 6, label: '6 osób', desc: 'Duża grupa (6 osób)' },
];

function PeopleRollerPicker({ value, onChange }) {
  const touchStartY = useRef(0);
  const ITEM_HEIGHT = 56; // wysokość slotu w px

  const handlePrev = () => {
    onChange(Math.max(1, value - 1));
  };

  const handleNext = () => {
    onChange(Math.min(6, value + 1));
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

  const activeOption =
    ROLLER_PEOPLE_OPTIONS.find((o) => o.count === value) || ROLLER_PEOPLE_OPTIONS[1];

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/90 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">
          Wybór liczby osób (1–6)
        </span>
        <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Roller góra-dół
        </span>
      </div>

      {/* Kontener pola wyboru typu roller */}
      <div
        tabIndex={0}
        role="spinbutton"
        aria-valuenow={value}
        aria-valuemin={1}
        aria-valuemax={6}
        aria-label="Pole wyboru liczby osób od 1 do 6"
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative select-none outline-none focus:ring-2 focus:ring-red-600/30 rounded-2xl"
      >
        {/* Przycisk góra */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={value <= 1}
          className="w-full py-1.5 flex items-center justify-center text-neutral-400 hover:text-red-700 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer active:scale-95"
          aria-label="Przewiń w górę (mniej osób)"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Okno wizjera rollera */}
        <div className="relative h-[168px] overflow-hidden my-0.5">
          {/* Aktywny wskaźnik wyboru w centrum */}
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-14 rounded-2xl bg-red-50/85 border-2 border-red-600 pointer-events-none z-10 shadow-xs" />

          {/* Gradienty cylindryczne góra i dół */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-20" />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20" />

          {/* Przesuwna taśma rollera */}
          <div
            className="transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translateY(${(1 - (value - 1)) * ITEM_HEIGHT}px)`,
            }}
          >
            {ROLLER_PEOPLE_OPTIONS.map((item) => {
              const isSelected = item.count === value;
              const IconComp = item.count === 1 ? User : Users;
              return (
                <button
                  type="button"
                  key={item.count}
                  onClick={() => onChange(item.count)}
                  className={`w-full h-14 flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'text-red-700 font-black scale-100 opacity-100 z-10'
                      : 'text-neutral-400 font-bold scale-90 opacity-40 hover:opacity-75'
                  }`}
                  aria-label={`${item.label}`}
                >
                  <IconComp
                    className={`w-5 h-5 ${
                      isSelected ? 'text-red-700 stroke-[2.5]' : 'text-neutral-400'
                    }`}
                  />
                  <span
                    className={`tracking-tight ${
                      isSelected ? 'text-2xl font-black' : 'text-lg font-bold'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Przycisk dół */}
        <button
          type="button"
          onClick={handleNext}
          disabled={value >= 6}
          className="w-full py-1.5 flex items-center justify-center text-neutral-400 hover:text-red-700 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer active:scale-95"
          aria-label="Przewiń w dół (więcej osób)"
        >
          <ChevronDown className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Podsumowanie wybranego wariantu */}
      <div className="mt-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-300 text-neutral-950 flex items-center justify-center font-black text-lg shadow-xs">
            {value}
          </div>
          <div>
            <p className="text-sm font-extrabold text-neutral-900">
              {activeOption.label}
            </p>
            <p className="text-xs text-neutral-500 font-medium">
              {activeOption.desc}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          Rolka 1–6
        </span>
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
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-extrabold border border-red-200">
              <Users className="w-3.5 h-3.5" />
              <span>Pytanie 1 z 5</span>
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              1) Na ile osób przygotować plan?
            </h1>
            <p className="text-sm text-neutral-600">
              Automatycznie dopasujemy gramatury przepisów oraz liczbę opakowań na liście zakupów.
            </p>

            <PeopleRollerPicker
              value={peopleCount}
              onChange={setPeopleCount}
            />
          </div>
        )}

        {/* KROK 2: Ile dni? */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-extrabold border border-red-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>Pytanie 2 z 5</span>
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              2) Na ile dni chcesz zaplanować posiłki?
            </h1>
            <p className="text-sm text-neutral-600">
              Na każdy dzień wygenerujemy 4 zbilansowane posiłki: Śniadanie, Obiad, Kolację oraz Przekąskę.
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {[1, 2, 3, 4, 5, 7].map((d) => {
                const active = daysCount === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDaysCount(d);
                      setBudgetPln(Math.round(d * peopleCount * 22));
                    }}
                    className={`p-4 rounded-2xl border-2 text-center transition active:scale-98 ${
                      active
                        ? 'border-red-600 bg-red-50/70 font-black text-red-700 shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                    }`}
                  >
                    <p className="text-2xl font-black">{d}</p>
                    <p className="text-xs font-bold mt-0.5">
                      {d === 1 ? 'dzień' : 'dni'}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {d * 4} posiłków
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* KROK 3: Jaki budżet? */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-extrabold border border-red-200">
              <Wallet className="w-3.5 h-3.5" />
              <span>Pytanie 3 z 5</span>
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              3) Jaki budżet chcesz przeznaczyć?
            </h1>
            <p className="text-sm text-neutral-600">
              Dobierzemy produkty z aktualnej oferty promocyjnej Biedronki tak, aby zmieścić się w wybranej kwocie.
            </p>

            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-neutral-200/90 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase text-neutral-500">
                  Całkowity budżet na {daysCount} {daysCount === 1 ? 'dzień' : 'dni'} ({peopleCount}{' '}
                  {peopleCount === 1 ? 'os.' : 'os.'})
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-300 text-neutral-950 text-[10px] font-black shrink-0">
                  <Tag className="w-3 h-3 text-red-700" /> Gazetka Biedronki
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black text-red-700 my-2 tracking-tight">
                {budgetPln} zł
              </div>

              <p className="text-xs font-semibold text-neutral-600 mb-4">
                To około <strong className="text-neutral-900">{dailyPerPerson} zł</strong> dziennie na osobę (za 4 posiłki!)
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

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-4">
                {[
                  {
                    label: 'Oszczędny',
                    multiplier: 16,
                    badge: 'Max Gazetka',
                  },
                  {
                    label: 'Optymalny',
                    multiplier: 23,
                    badge: 'Polecany',
                  },
                  {
                    label: 'Swobodny',
                    multiplier: 32,
                    badge: 'Więcej Fit',
                  },
                ].map((preset) => {
                  const val = Math.round(peopleCount * daysCount * preset.multiplier);
                  const isSelected = Math.abs(budgetPln - val) <= 5;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBudgetPln(val)}
                      className={`p-2 sm:p-2.5 rounded-xl border text-center transition ${
                        isSelected
                          ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <p className="text-[11px] sm:text-xs font-extrabold truncate">{preset.label}</p>
                      <p className="text-xs sm:text-sm font-black mt-0.5">{val} zł</p>
                      <p className="text-[9px] sm:text-[10px] text-neutral-500 truncate">{preset.badge}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* KROK 4: Jaka dieta? */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-extrabold border border-red-200">
              <Salad className="w-3.5 h-3.5" />
              <span>Pytanie 4 z 5</span>
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              4) Jaka dieta Cię interesuje?
            </h1>
            <p className="text-sm text-neutral-600">
              Wybierz preferowany styl odżywiania – w każdej chwili zmienisz go także z poziomu filtrów planu.
            </p>

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
                        <p className="text-xs text-neutral-600 mt-0.5">
                          {option.description}
                        </p>
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
