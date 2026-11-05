import React, { useState } from 'react';
import { X, Tag, Sparkles, Clock, Flame, Check, RefreshCw } from 'lucide-react';
import { getIngredientSubstitutesForDish } from '../../services/mealPlanEngine';
import FoodIcon from '../common/FoodIcon';

/**
 * Modal modyfikacji potrawy w stylu Stitch:
 * - Wyświetla składniki potrawy w KWADRATACH ("klikamy na potrawę mamy w kwadratach jakieś składniki").
 * - Po kliknięciu na kwadrat składnika wyświetla zamienniki do wyboru:
 *   - Produkty z gazetki na ŻÓŁTO
 *   - Produkty FIT na ZIELONO
 * - Brak surowych emotek – czysta, profesjonalna wektorowa identyfikacja.
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
  const [selectedSquareIndex, setSelectedSquareIndex] = useState(0);

  if (!dish) return null;

  const activeIngredient = dish.ingredients[selectedSquareIndex] || dish.ingredients[0];

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
        {/* Nagłówek modala z ceną, czasem i makro potrawy */}
        <div className="p-4 bg-neutral-900 text-white flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
              <span className="inline-flex items-center gap-1.5">
                <FoodIcon category={dish.slotId} className="w-3.5 h-3.5" />
                Dzień {dayNumber} • {dish.slotLabel}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {dish.prepTimeLabel}
              </span>
            </div>
            <h2 className="text-lg font-black leading-snug">
              {dish.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Zamknij modyfikację potrawy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pasek podsumowania Ceny (najważniejsza) i Makro potrawy */}
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between gap-2">
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
            Wybierz kwadrat składnika
          </span>
        </div>

        {/* Treść przewijana */}
        <div className="p-4 overflow-y-auto space-y-5">
          {/* SIATKA SKŁADNIKÓW W KWADRATACH */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-600">
                1. Składniki potrawy (kliknij kwadrat, aby podmienić):
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {dish.ingredients.map((ing, idx) => {
                const isSelected = idx === selectedSquareIndex;
                const isPromo = ing.metrics.isGazetkaPromo;
                const isFit = ing.metrics.isFitChoice;

                return (
                  <button
                    key={`${ing.productId}_${idx}`}
                    type="button"
                    onClick={() => setSelectedSquareIndex(idx)}
                    className={`aspect-square rounded-2xl p-3 flex flex-col justify-between text-left border-2 transition relative ${
                      isSelected
                        ? 'border-red-600 ring-2 ring-red-600/30 shadow-md'
                        : isPromo
                        ? 'border-amber-400'
                        : isFit
                        ? 'border-emerald-400'
                        : 'border-neutral-200'
                    } ${
                      isPromo
                        ? 'bg-amber-100/90'
                        : isFit
                        ? 'bg-emerald-50/80'
                        : 'bg-white'
                    }`}
                  >
                    {/* Odznaki Gazetka (żółto) / Fit (zielono) na kwadracie */}
                    <div className="flex items-center justify-between w-full gap-1">
                      <FoodIcon
                        category={ing.metrics.product?.category || ''}
                        subType={ing.metrics.name}
                        className="w-5 h-5 text-neutral-800"
                        withContainer
                        containerClassName="w-8 h-8 rounded-lg"
                        tone={isPromo ? 'promo' : isFit ? 'fit' : 'default'}
                      />
                      {isPromo ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-300 border border-amber-400 text-[9px] font-black text-neutral-900 uppercase">
                          GAZETKA
                        </span>
                      ) : isFit ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-[9px] font-black text-white uppercase">
                          FIT
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xs font-black text-neutral-900 line-clamp-2 leading-tight">
                        {ing.metrics.name}
                      </p>
                      <p className="text-[11px] text-neutral-600 font-semibold mt-0.5">
                        {ing.displayAmount} ({ing.portionGrams}g)
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-black/10">
                      <span className="text-xs font-black text-red-700">
                        {ing.metrics.totalPromoCost.toFixed(2)} zł
                      </span>
                      <span className="text-[10px] font-bold text-neutral-700">
                        {ing.metrics.kcalPerPerson} kcal
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LISTA ZAMIENNIKÓW DLA WYBRANEGO KWADRATU (GAZETKA ŻÓŁTO vs FIT ZIELONO) */}
          {activeIngredient && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-red-600" />
                  <span>
                    2. Zamienniki dla: <strong className="text-red-600">{activeIngredient.metrics.name}</strong>
                  </span>
                </h3>
              </div>

              {/* Legenda kolorów zamienników */}
              <div className="flex flex-wrap gap-2 mb-3 text-[11px] font-extrabold">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-300 text-neutral-900 border border-amber-400">
                  <Tag className="w-3 h-3 text-red-700" />
                  Żółte = Produkty z gazetki (Promocja)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  Zielone = Produkty Fit (Lepsze makro)
                </span>
              </div>

              {substitutes.length === 0 ? (
                <p className="text-xs text-neutral-500 p-4 rounded-2xl bg-neutral-50 text-center">
                  Brak innych zamienników spełniających obecne kryteria diety.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {substitutes.map((sub) => {
                    const isPromo = sub.isGazetkaPromo;
                    const isFit = sub.isFitChoice;

                    return (
                      <button
                        key={sub.product.id}
                        type="button"
                        onClick={() =>
                          onReplaceIngredient(
                            dayNumber,
                            dish.slotId,
                            selectedSquareIndex,
                            sub.product.id
                          )
                        }
                        className={`w-full p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between gap-3 ${
                          isPromo
                            ? 'bg-amber-100/90 border-amber-400 hover:bg-amber-200/90 shadow-xs'
                            : isFit
                            ? 'bg-emerald-50 border-emerald-400 hover:bg-emerald-100/80'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <FoodIcon
                            category={sub.product.category}
                            subType={sub.product.name}
                            className="w-5 h-5 text-neutral-800"
                            withContainer
                            containerClassName="w-10 h-10 rounded-xl mt-0.5"
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
                          <span className="inline-block mt-1 px-2.5 py-1 rounded-lg bg-neutral-900 text-white text-[11px] font-bold">
                            Wybierz
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stopka modala */}
        <div className="p-4 border-t border-neutral-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Gotowe – zapisz zmiany w potrawie</span>
          </button>
        </div>
      </div>
    </div>
  );
}
