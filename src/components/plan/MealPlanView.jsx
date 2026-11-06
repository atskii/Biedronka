import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import DishCard from './DishCard';
import DishModificationModal from './DishModificationModal';

export default function MealPlanView({
  plan,
  onReplaceIngredient,
  onAcceptPlan,
  onRestartSurvey,
}) {
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [editingModalTarget, setEditingModalTarget] = useState(null);

  const activeDay = useMemo(() => {
    return (
      plan.days.find((d) => d.dayNumber === selectedDayNumber) || plan.days[0]
    );
  }, [plan.days, selectedDayNumber]);

  const mealsToDisplay = activeDay ? activeDay.meals : [];

  // Aktualnie edytowana potrawa w modalu (zawsze ze świeżymi przeliczeniami)
  const currentlyEditedDish = useMemo(() => {
    if (!editingModalTarget) return null;
    const dayObj = plan.days.find(
      (d) => d.dayNumber === editingModalTarget.dayNumber
    );
    if (!dayObj) return null;
    return dayObj.meals.find((m) => m.slotId === editingModalTarget.slotId);
  }, [plan.days, editingModalTarget]);

  return (
    <div className="pb-36">
      {/* Minimalistyczna karta podsumowania jadłospisu */}
      <div className="bg-red-700 text-white rounded-3xl p-4 shadow-sm mb-4">
        {/* Nagłówek: Tylko tytuł "Twój jadłospis" + powrót do ankiety */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <h1 className="text-xl font-black tracking-tight">
            Twój jadłospis
          </h1>

          <button
            type="button"
            onClick={onRestartSurvey}
            className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ankieta</span>
          </button>
        </div>

        {/* 2 główne kwoty: Łączna cena i Oszczędzasz (nigdy nie łamią linii) */}
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-100/80 block">
              Łączna cena
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-300 leading-tight mt-0.5 whitespace-nowrap">
              {plan.totalCostPln.toFixed(2)} zł
            </p>
            {plan.budgetPln && (
              <span className="text-[10px] font-bold text-amber-200/90 block mt-0.5 truncate">
                Budżet: {plan.budgetPln} zł
              </span>
            )}
          </div>

          <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-100/80 block">
              Oszczędzasz
            </span>
            <p className="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5 whitespace-nowrap">
              {plan.totalSavedPln.toFixed(2)} zł
            </p>
          </div>
        </div>

        {/* Pasek makro per dzień - pełna szerokość, responsywny na każdym telefonie */}
        <div className="bg-black/20 rounded-2xl p-2.5 px-3 border border-white/10 flex items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-red-100/80 block leading-tight">
              Średnio / dzień{' '}
              {typeof plan.targetCalories === 'number'
                ? `• Limit: ${plan.targetCalories} kcal`
                : '• Bez limitu kcal'}
            </span>
            <p className="text-sm font-black text-white leading-tight mt-0.5">
              {plan.avgDailyKcalPerPerson} kcal
            </p>
          </div>
          <div className="text-right text-[11px] font-bold text-red-100/90 flex items-center gap-1.5 flex-wrap justify-end">
            <span>W: {plan.avgDailyMacros.carbs}g</span>
            <span className="opacity-50">•</span>
            <span>B: {plan.avgDailyMacros.protein}g</span>
            <span className="opacity-50">•</span>
            <span>T: {plan.avgDailyMacros.fat}g</span>
          </div>
        </div>
      </div>

      {/* Przełącznik dni planu */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
        {plan.days.map((day) => {
          const active = day.dayNumber === selectedDayNumber;
          return (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition shadow-2xs ${active
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

      {/* Lista 4 posiłków wybranego dnia (Śniadanie, Obiad, Kolacja, Przekąska) */}
      <div className="space-y-3">
        {mealsToDisplay.map((meal) => (
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
        ))}
      </div>

      {/* Przyklejony nad dolnym menu pasek akcji (sam guzik na całej szerokości) */}
      <aside className="fixed bottom-16 left-0 right-0 z-40 max-w-md mx-auto px-3 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-2xl p-2.5 sm:p-3 shadow-xl">
          <button
            type="button"
            onClick={onAcceptPlan}
            className="w-full py-3.5 px-4 rounded-xl bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
            <span>Akceptuj i przejdź do listy zakupów</span>
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
