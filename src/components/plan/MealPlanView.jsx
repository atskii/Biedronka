import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Tag,
  Flame,
  ShoppingBag,
  RotateCcw,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import FilterBar from './FilterBar';
import DishCard from './DishCard';
import DishModificationModal from './DishModificationModal';

export default function MealPlanView({
  plan,
  onUpdateBudgetFilter,
  onUpdateDietFilter,
  onReplaceIngredient,
  onAcceptPlan,
  onRestartSurvey,
}) {
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [maxCaloriesFilter, setMaxCaloriesFilter] = useState(2000);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [editingModalTarget, setEditingModalTarget] = useState(null);

  const activeDay = useMemo(() => {
    return (
      plan.days.find((d) => d.dayNumber === selectedDayNumber) || plan.days[0]
    );
  }, [plan.days, selectedDayNumber]);

  const filteredMeals = useMemo(() => {
    if (!activeDay) return [];
    return activeDay.meals.filter((meal) => {
      const fitsCalories = meal.kcal <= maxCaloriesFilter;
      const q = ingredientSearchQuery.trim().toLowerCase();
      const fitsSearch =
        !q ||
        meal.title.toLowerCase().includes(q) ||
        meal.ingredients.some((i) =>
          i.metrics.name.toLowerCase().includes(q)
        );
      return fitsCalories && fitsSearch;
    });
  }, [activeDay, maxCaloriesFilter, ingredientSearchQuery]);

  // Aktualnie edytowana potrawa w modalu (zawsze ze świeżymi przeliczeniami)
  const currentlyEditedDish = useMemo(() => {
    if (!editingModalTarget) return null;
    const dayObj = plan.days.find(
      (d) => d.dayNumber === editingModalTarget.dayNumber
    );
    if (!dayObj) return null;
    return dayObj.meals.find((m) => m.slotId === editingModalTarget.slotId);
  }, [plan.days, editingModalTarget]);

  const isWithinBudget = plan.totalCostPln <= plan.budgetPln;

  return (
    <div className="pb-36">
      {/* Karta podsumowania wygenerowanego planu w barwach Biedronki */}
      <div className="bg-gradient-to-br from-red-700 via-red-700 to-red-800 text-white rounded-3xl p-4 shadow-md mb-4 border border-red-800">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-300 text-neutral-950 text-[10px] font-black uppercase tracking-wider">
              <Tag className="w-3 h-3 text-red-700" /> Ceny dynamiczne z Gazetki
            </span>
            <h1 className="text-xl font-extrabold mt-1.5 tracking-tight">
              Twój wygenerowany jadłospis
            </h1>
            <p className="text-xs text-red-100 flex items-center gap-3 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {plan.peopleCount}{' '}
                {plan.peopleCount === 1 ? 'osoba' : 'os.'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {plan.daysCount}{' '}
                {plan.daysCount === 1 ? 'dzień' : 'dni'} (4 posiłki/dzień)
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onRestartSurvey}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ankieta</span>
          </button>
        </div>

        {/* Główne liczniki: Koszt całkowity vs Budżet, Oszczędność z Gazetką, Średnie Makro */}
        <div className="grid grid-cols-3 gap-2 bg-black/25 backdrop-blur-xs rounded-2xl p-3 border border-white/10">
          <div>
            <span className="text-[10px] font-bold uppercase text-red-100">
              Koszt planu
            </span>
            <p className="text-xl font-black text-amber-300 leading-tight">
              {plan.totalCostPln.toFixed(2)} zł
            </p>
            <span className="text-[10px] text-red-100 flex items-center gap-1 mt-0.5">
              Budżet: {plan.budgetPln} zł{' '}
              {isWithinBudget ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-300 font-bold">
                  <Check className="w-3 h-3" /> OK
                </span>
              ) : (
                <span className="text-amber-200 font-bold">(Przekroczono)</span>
              )}
            </span>
          </div>

          <div className="border-x border-white/15 px-2">
            <span className="text-[10px] font-bold uppercase text-red-100">
              Oszczędzasz
            </span>
            <p className="text-lg font-black text-white leading-tight">
              {plan.totalSavedPln.toFixed(2)} zł
            </p>
            <span className="text-[10px] text-amber-300 font-bold">
              Z kartą Biedronki
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-red-100">
              Średnio / dzień
            </span>
            <p className="text-base font-black text-white leading-tight">
              {plan.avgDailyKcalPerPerson} kcal
            </p>
            <span className="text-[10px] text-red-100">
              W:{plan.avgDailyMacros.carbs}g B:{plan.avgDailyMacros.protein}g T:{plan.avgDailyMacros.fat}g
            </span>
          </div>
        </div>
      </div>

      {/* Pasek 4 wymaganych filtrów: Budżet, Dieta, Kalorie, Składniki */}
      <FilterBar
        budgetPln={plan.budgetPln}
        totalCostPln={plan.totalCostPln}
        dietType={plan.dietType}
        maxCaloriesFilter={maxCaloriesFilter}
        ingredientSearchQuery={ingredientSearchQuery}
        onChangeBudget={onUpdateBudgetFilter}
        onChangeDiet={onUpdateDietFilter}
        onChangeMaxCalories={setMaxCaloriesFilter}
        onChangeIngredientSearch={setIngredientSearchQuery}
      />

      {/* Przełącznik dni planu */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
        {plan.days.map((day) => {
          const active = day.dayNumber === selectedDayNumber;
          return (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition shadow-2xs ${
                active
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200/90 hover:border-neutral-300'
              }`}
            >
              <span>{day.label}</span>
              <span className="ml-1.5 text-[11px] opacity-80">
                ({day.dayCostPln.toFixed(2)} zł • {day.dayKcalPerPerson} kcal)
              </span>
            </button>
          );
        })}
      </div>

      {/* Wskazówka o modyfikacji w kwadratach */}
      <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs font-semibold text-neutral-800">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Kliknij na dowolną potrawę, aby zobaczyć składniki w kwadratach i wymienić je na zamienniki z gazetki (żółte) lub Fit!
        </span>
      </div>

      {/* Lista 4 posiłków wybranego dnia (Śniadanie, Obiad, Kolacja, Przekąska) */}
      <div className="space-y-3">
        {filteredMeals.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-neutral-200 text-center">
            <p className="text-sm font-bold text-neutral-700">
              Brak posiłków spełniających wybrane kryteria filtra.
            </p>
            <button
              type="button"
              onClick={() => {
                setMaxCaloriesFilter(2000);
                setIngredientSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-red-700 text-white text-xs font-bold"
            >
              Pokaż wszystkie posiłki
            </button>
          </div>
        ) : (
          filteredMeals.map((meal) => (
            <DishCard
              key={`${activeDay.dayNumber}_${meal.slotId}`}
              dish={meal}
              peopleCount={plan.peopleCount}
              onSelectDish={(clickedDish) =>
                setEditingModalTarget({
                  dayNumber: activeDay.dayNumber,
                  slotId: clickedDish.slotId,
                })
              }
            />
          ))
        )}
      </div>

      {/* Przyklejony nad dolnym menu pasek akcji (Stitch Floating Action Tray) */}
      <aside className="fixed bottom-16 left-0 right-0 z-40 max-w-md mx-auto px-3 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl p-2.5 sm:p-3 shadow-xl flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-neutral-500 block truncate">
              Razem ({plan.daysCount} {plan.daysCount === 1 ? 'dzień' : 'dni'}):
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-red-700">
                {plan.totalCostPln.toFixed(2)} zł
              </span>
              {plan.totalSavedPln > 0 && (
                <span className="text-[10px] font-extrabold text-emerald-700 truncate">
                  (-{plan.totalSavedPln.toFixed(2)} zł)
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onAcceptPlan}
            className="flex-1 py-3 px-3 sm:px-4 rounded-xl bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="truncate">Akceptuj i przejdź do listy zakupów</span>
          </button>
        </div>
      </aside>

      {/* Modal modyfikacji składników w kwadratach */}
      {currentlyEditedDish && (
        <DishModificationModal
          dish={currentlyEditedDish}
          dayNumber={editingModalTarget.dayNumber}
          peopleCount={plan.peopleCount}
          dietType={plan.dietType}
          excludedProductIds={plan.excludedProductIds}
          onClose={() => setEditingModalTarget(null)}
          onReplaceIngredient={onReplaceIngredient}
        />
      )}
    </div>
  );
}
