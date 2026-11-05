import React, { useState } from 'react';
import { Wallet, Salad, Flame, Search, SlidersHorizontal, X } from 'lucide-react';
import { DIET_OPTIONS } from '../../data/biedronkaCatalog';

export default function FilterBar({
  budgetPln,
  totalCostPln,
  dietType,
  maxCaloriesFilter,
  ingredientSearchQuery,
  onChangeBudget,
  onChangeDiet,
  onChangeMaxCalories,
  onChangeIngredientSearch,
}) {
  const [activeTab, setActiveTab] = useState(null);

  const toggleTab = (tabName) => {
    setActiveTab((prev) => (prev === tabName ? null : tabName));
  };

  const currentDietLabel =
    DIET_OPTIONS.find((d) => d.id === dietType)?.shortLabel || 'Dieta';

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-3 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-neutral-500">
          <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
          <span>Filtry planu: Budżet • Dieta • Kalorie • Składniki</span>
        </div>
        {(maxCaloriesFilter < 2000 || ingredientSearchQuery) && (
          <button
            type="button"
            onClick={() => {
              onChangeMaxCalories(2000);
              onChangeIngredientSearch('');
            }}
            className="text-[11px] font-bold text-red-600 hover:underline"
          >
            Resetuj filtry
          </button>
        )}
      </div>

      {/* 4 główne przyciski filtrów: Budżet, Dieta, Kalorie, Składniki */}
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => toggleTab('budget')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${
            activeTab === 'budget'
              ? 'border-red-600 bg-red-50 text-red-700'
              : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          <Wallet className="w-4 h-4 mb-0.5 text-red-600" />
          <span>Budżet</span>
          <span className="text-[10px] font-extrabold text-neutral-500">
            {budgetPln} zł
          </span>
        </button>

        <button
          type="button"
          onClick={() => toggleTab('diet')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${
            activeTab === 'diet'
              ? 'border-red-600 bg-red-50 text-red-700'
              : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          <Salad className="w-4 h-4 mb-0.5 text-emerald-600" />
          <span>Dieta</span>
          <span className="text-[10px] font-extrabold text-neutral-500 truncate max-w-full">
            {currentDietLabel}
          </span>
        </button>

        <button
          type="button"
          onClick={() => toggleTab('calories')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${
            activeTab === 'calories' || maxCaloriesFilter < 2000
              ? 'border-red-600 bg-red-50 text-red-700'
              : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          <Flame className="w-4 h-4 mb-0.5 text-orange-500" />
          <span>Kalorie</span>
          <span className="text-[10px] font-extrabold text-neutral-500">
            {maxCaloriesFilter < 2000 ? `≤ ${maxCaloriesFilter}` : 'Wszystkie'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => toggleTab('ingredients')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${
            activeTab === 'ingredients' || Boolean(ingredientSearchQuery)
              ? 'border-red-600 bg-red-50 text-red-700'
              : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          <Search className="w-4 h-4 mb-0.5 text-neutral-700" />
          <span>Składniki</span>
          <span className="text-[10px] font-extrabold text-neutral-500 truncate max-w-full">
            {ingredientSearchQuery || 'Szukaj'}
          </span>
        </button>
      </div>

      {/* Rozwijane panele dla każdego z 4 filtrów */}
      {activeTab === 'budget' && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span>Limit budżetu: {budgetPln} zł</span>
            <span
              className={
                totalCostPln <= budgetPln ? 'text-emerald-700' : 'text-red-600'
              }
            >
              Koszt planu: {totalCostPln.toFixed(2)} zł
            </span>
          </div>
          <input
            type="range"
            min={30}
            max={600}
            step={5}
            value={budgetPln}
            onChange={(e) => onChangeBudget(Number(e.target.value))}
            className="w-full accent-red-600 cursor-pointer"
          />
        </div>
      )}

      {activeTab === 'diet' && (
        <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-1.5">
          {DIET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onChangeDiet(opt.id);
                setActiveTab(null);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border text-left flex items-center gap-2 transition ${
                dietType === opt.id
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              <span>{opt.emoji}</span>
              <span>{opt.shortLabel}</span>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'calories' && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <p className="text-xs font-bold text-neutral-600 mb-2">
            Maksymalna kaloryczność pojedynczego dania:
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'Wszystkie', value: 2000 },
              { label: '≤ 400 kcal', value: 400 },
              { label: '≤ 600 kcal', value: 600 },
              { label: '≤ 800 kcal', value: 800 },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onChangeMaxCalories(item.value)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                  maxCaloriesFilter === item.value
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ingredients' && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ingredientSearchQuery}
              onChange={(e) => onChangeIngredientSearch(e.target.value)}
              placeholder="Filtruj po składniku (np. kurczak, skyr, tofu, ziemniaki)..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-red-600"
            />
            {ingredientSearchQuery && (
              <button
                type="button"
                onClick={() => onChangeIngredientSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

