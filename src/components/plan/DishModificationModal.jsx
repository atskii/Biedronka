import React, { useState } from 'react';
import { X, Tag, Sparkles, Clock, Flame, Check, RefreshCw, ArrowLeft, ArrowRightLeft } from 'lucide-react';
import { getIngredientSubstitutesForDish } from '../../services/mealPlanEngine.js';
import FoodIcon from '../common/FoodIcon';
import ProductImage from '../common/ProductImage';
import DishImage from '../common/DishImage';

/**
 * Modal modyfikacji potrawy z intuicyjnym, 2-krokowym przepływem:
 * Krok 1: Przejrzysty podgląd składników potrawy (brak natłoku tekstu).
 * Krok 2: Po kliknięciu "Podmień" na konkretnym składniku, otwiera się dedykowany widok zamienników (Gazetka / Fit).
 */
export default function DishModificationModal({
  dish,
  dayNumber,
  peopleCount,
  dietType,
  excludedProductIds,
  onClose,
  onReplaceIngredient,
}) {
  // Indeks aktualnie edytowanego składnika (null = widok składników potrawy)
  const [editingIngredientIndex, setEditingIngredientIndex] = useState(null);

  if (!dish) return null;

  const activeIngredient =
    editingIngredientIndex !== null ? dish.ingredients[editingIngredientIndex] : null;

  const substitutes = activeIngredient
    ? getIngredientSubstitutesForDish(
        activeIngredient.productId,
        activeIngredient.portionGrams,
        peopleCount,
        dietType,
        excludedProductIds
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200">
        
        {/* ========================================================
            WIDOK 2: WYBÓR ZAMIENNIKA DLA WYBRANEGO SKŁADNIKA
           ======================================================== */}
        {editingIngredientIndex !== null && activeIngredient ? (
          <>
            {/* Pasek nawigacyjny powrotu */}
            <div className="p-3.5 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
              <button
                type="button"
                onClick={() => setEditingIngredientIndex(null)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-neutral-200 hover:text-white transition py-1 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-amber-300" />
                <span>Wróć do składników</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                aria-label="Zamknij"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {/* Podsumowanie wymienianego składnika */}
              <div className="p-3.5 rounded-2xl bg-neutral-100 border border-neutral-200/90 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ProductImage
                    productId={activeIngredient.productId}
                    name={activeIngredient.metrics.name}
                    category={activeIngredient.metrics.product?.category || ''}
                    className="w-12 h-12 rounded-xl shrink-0"
                    tone={
                      activeIngredient.metrics.isGazetkaPromo
                        ? 'promo'
                        : activeIngredient.metrics.isFitChoice
                        ? 'fit'
                        : 'default'
                    }
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Aktualny składnik w potrawie:
                    </span>
                    <p className="text-sm font-black text-neutral-900 truncate">
                      {activeIngredient.metrics.name}
                    </p>
                    <p className="text-xs text-neutral-600 font-semibold mt-0.5">
                      {activeIngredient.displayAmount} ({activeIngredient.portionGrams}g) •{' '}
                      {activeIngredient.metrics.kcalPerPerson} kcal
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-red-700">
                    {activeIngredient.metrics.totalPromoCost.toFixed(2)} zł
                  </span>
                </div>
              </div>

              {/* Tytuł sekcji zamienników */}
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-red-600" />
                  <span>Dostępne zamienniki w Biedronce:</span>
                </h3>
              </div>

              {/* Subtelna legenda */}
              <div className="flex flex-wrap gap-2 text-[10px] font-extrabold">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-300 text-neutral-900 border border-amber-400">
                  <Tag className="w-3 h-3 text-red-700" />
                  Żółte = Gazetka (Promocja)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  Zielone = Fit (Zdrowy wybór)
                </span>
              </div>

              {/* Lista zamienników */}
              {substitutes.length === 0 ? (
                <div className="text-xs text-neutral-500 p-6 rounded-2xl bg-neutral-50 border border-neutral-200 text-center">
                  Brak innych zamienników spełniających obecne kryteria diety.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {substitutes.map((sub) => {
                    const isPromo = sub.isGazetkaPromo;
                    const isFit = sub.isFitChoice;

                    return (
                      <button
                        key={sub.product.id}
                        type="button"
                        onClick={() => {
                          onReplaceIngredient(
                            dayNumber,
                            dish.slotId,
                            editingIngredientIndex,
                            sub.product.id
                          );
                          setEditingIngredientIndex(null);
                        }}
                        className={`w-full p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between gap-3 ${
                          isPromo
                            ? 'bg-amber-100/90 border-amber-400 hover:bg-amber-200/90 shadow-xs'
                            : isFit
                            ? 'bg-emerald-50 border-emerald-400 hover:bg-emerald-100/80'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <ProductImage
                            productId={sub.product.id}
                            name={sub.product.name}
                            category={sub.product.category}
                            className="w-11 h-11 rounded-xl mt-0.5 shrink-0"
                            tone={isPromo ? 'promo' : isFit ? 'fit' : 'default'}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              {isPromo && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-400 border border-red-600 text-red-700 text-[10px] font-black uppercase">
                                  {sub.product.promoLabel || 'PRODUKT Z GAZETKI'}
                                </span>
                              )}
                              {isFit && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                                  FIT • {sub.product.fitBadge || 'LEPSZE MAKRO'}
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-black text-neutral-900 truncate">
                              {sub.product.name}
                            </p>
                            <p className="text-xs text-neutral-700 font-semibold mt-0.5">
                              {sub.metrics.kcalPerPerson} kcal • W: {sub.metrics.carbsPerPerson}g • B:{' '}
                              {sub.metrics.proteinPerPerson}g • T: {sub.metrics.fatPerPerson}g
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-base font-black text-red-700">
                            {sub.metrics.totalPromoCost.toFixed(2)} zł
                          </p>
                          <p
                            className={`text-[11px] font-extrabold ${
                              sub.priceDiffGroup <= 0
                                ? 'text-emerald-800'
                                : 'text-neutral-700'
                            }`}
                          >
                            {sub.priceDiffGroup <= 0
                              ? `${sub.priceDiffGroup.toFixed(2)} zł (Taniej!)`
                              : `+${sub.priceDiffGroup.toFixed(2)} zł`}
                          </p>
                          <span className="inline-block mt-1 px-3 py-1 rounded-xl bg-neutral-900 text-white text-xs font-bold shadow-2xs">
                            Wybierz
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* ========================================================
             WIDOK 1: CZYSTE, PRZEJRZYSTE SKŁADNIKI POTRAWY
             ======================================================== */
          <>
            {/* Nagłówek modala ze zdjęciem potrawy */}
            <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-neutral-900 shrink-0">
              <DishImage
                recipeId={dish.recipeId}
                mealType={dish.slotId || dish.mealType}
                title={dish.title}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-black/30 pointer-events-none" />

              <button
                type="button"
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white transition z-10"
                aria-label="Zamknij modyfikację potrawy"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <FoodIcon category={dish.slotId} className="w-3.5 h-3.5" />
                    Dzień {dayNumber} • {dish.slotLabel}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-white">
                    <Clock className="w-3.5 h-3.5 text-amber-300" /> {dish.prepTimeLabel}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black leading-snug drop-shadow-xs">
                  {dish.title}
                </h2>
              </div>
            </div>

            {/* Pasek podsumowania Ceny i Makro potrawy */}
            <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-amber-300 border border-amber-400 text-red-800 font-black text-base shadow-xs">
                  {dish.totalGroupPrice.toFixed(2)} zł
                </div>
                <div className="text-xs">
                  <p className="font-extrabold text-neutral-900 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {dish.kcal} kcal / os.
                  </p>
                  <p className="text-neutral-600 font-medium">
                    W: {dish.macros.carbs}g • B: {dish.macros.protein}g • T: {dish.macros.fat}g
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-neutral-500 text-right">
                {dish.ingredients.length} składniki
              </span>
            </div>

            {/* Treść przewijana: Składniki potrawy */}
            <div className="p-4 overflow-y-auto space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700">
                Składniki potrawy:
              </h3>

              {/* Siatka składników – klikalne karty z dużym zdjęciem produktu */}
              <div className="grid grid-cols-2 gap-2.5">
                {dish.ingredients.map((ing, idx) => {
                  const isPromo = ing.metrics.isGazetkaPromo;
                  const isFit = ing.metrics.isFitChoice;

                  return (
                    <button
                      key={`${ing.productId}_${idx}`}
                      type="button"
                      onClick={() => setEditingIngredientIndex(idx)}
                      className={`rounded-2xl p-2.5 flex flex-col justify-between text-left border-2 transition relative shadow-2xs group hover:border-red-600 hover:shadow-md active:scale-98 cursor-pointer ${
                        isPromo
                          ? 'bg-amber-50/90 border-amber-300'
                          : isFit
                          ? 'bg-emerald-50/90 border-emerald-300'
                          : 'bg-white border-neutral-200'
                      }`}
                    >
                      {/* Duże zdjęcie produktu z nakładką plakietki */}
                      <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden mb-2 bg-neutral-100 shrink-0">
                        <ProductImage
                          productId={ing.productId}
                          name={ing.metrics.name}
                          category={ing.metrics.product?.category || ''}
                          className="w-full h-full rounded-xl"
                          tone={isPromo ? 'promo' : isFit ? 'fit' : 'default'}
                        />

                        {isPromo ? (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-amber-300 border border-amber-400 text-[9px] font-black text-neutral-900 uppercase shadow-xs">
                            GAZETKA
                          </span>
                        ) : isFit ? (
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-emerald-600 text-[9px] font-black text-white uppercase shadow-xs">
                            FIT
                          </span>
                        ) : null}
                      </div>

                      {/* Nazwa i gramatura */}
                      <div className="mb-2">
                        <p className="text-xs font-black text-neutral-900 line-clamp-2 leading-tight group-hover:text-red-700 transition">
                          {ing.metrics.name}
                        </p>
                        <p className="text-[11px] text-neutral-600 font-semibold mt-0.5">
                          {ing.displayAmount} ({ing.portionGrams}g)
                        </p>
                      </div>

                      {/* Cena + Kalorie + wskaźnik Zmień */}
                      <div className="pt-2 border-t border-black/10 flex items-center justify-between gap-1 w-full">
                        <div>
                          <span className="block text-xs font-black text-red-700 leading-tight">
                            {ing.metrics.totalPromoCost.toFixed(2)} zł
                          </span>
                          <span className="block text-[10px] font-bold text-neutral-600 leading-tight">
                            {ing.metrics.kcalPerPerson} kcal
                          </span>
                        </div>

                        <span className="text-[11px] font-extrabold text-neutral-400 group-hover:text-red-700 transition flex items-center gap-0.5">
                          Zmień <ArrowRightLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stopka modala */}
            <div className="p-4 border-t border-neutral-200 bg-white shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-sm"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Gotowe</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

