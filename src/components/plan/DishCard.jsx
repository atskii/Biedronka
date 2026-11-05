import React from 'react';
import { Clock, Flame, Tag, Sparkles, Edit3, ArrowRight } from 'lucide-react';
import FoodIcon from '../common/FoodIcon';

/**
 * Karta produktów (dań) według designu Stitch (Modern Tactile Retail):
 * - Cena (najważniejsza!)
 * - Kalorie
 * - Makra (węgle, białko i tłuszcze)
 * - Czas przygotowania (np. 15m, 30m, 2h)
 * - Składniki w kwadratach (zastępuje emotki wektorowymi ikonami)
 */
export default function DishCard({ dish, peopleCount, onSelectDish }) {
  return (
    <div
      onClick={() => onSelectDish(dish)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectDish(dish);
        }
      }}
      className="bg-white rounded-3xl border border-neutral-200/90 hover:border-red-600 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Górny wiersz: Typ posiłku + Czas przygotowania + NAJWAŻNIEJSZA CENA */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Slot Posiłku z wektorową ikoną */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-bold">
              <FoodIcon category={dish.slotId} className="w-3.5 h-3.5 text-neutral-600" />
              <span>{dish.slotLabel}</span>
            </span>

            {/* Czas przygotowania */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-bold">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>{dish.prepTimeLabel}</span>
            </span>

            {dish.gazetkaCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-300 text-neutral-950 text-[10px] font-black uppercase tracking-tight">
                <Tag className="w-3 h-3 text-red-700" />
                <span>{dish.gazetkaCount} z Gazetki</span>
              </span>
            )}
          </div>

          <h3 className="text-base font-extrabold text-neutral-900 mt-2 group-hover:text-red-700 transition leading-snug">
            {dish.title}
          </h3>
        </div>

        {/* CENA - NAJWAŻNIEJSZY ELEMENT KARTY (Wyróżnienie Biedronka) */}
        <div className="shrink-0 text-right bg-amber-300/90 border border-amber-400 rounded-2xl px-3 py-2 shadow-xs">
          <span className="block text-[9px] font-black uppercase tracking-wider text-red-800">
            CENA ({peopleCount} {peopleCount === 1 ? 'os.' : 'os.'})
          </span>
          <span className="block text-xl font-black text-red-700 leading-none mt-0.5">
            {dish.totalGroupPrice.toFixed(2)} zł
          </span>
          {dish.savedPln > 0 && (
            <span className="block text-[10px] font-bold text-neutral-700 line-through mt-0.5">
              {dish.totalGroupRegularPrice.toFixed(2)} zł
            </span>
          )}
          {peopleCount > 1 && (
            <span className="block text-[10px] font-extrabold text-neutral-900 mt-0.5">
              {dish.singlePortionPrice.toFixed(2)} zł / porcja
            </span>
          )}
        </div>
      </div>

      {/* Kalorie oraz Makra (Węgle, Białko, Tłuszcze) w stylu Stitch */}
      <div className="grid grid-cols-4 gap-2 p-2.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/80 mb-3 text-center">
        <div className="border-r border-neutral-200 pr-1">
          <span className="text-[10px] font-bold uppercase text-neutral-500 flex items-center justify-center gap-0.5">
            <Flame className="w-3 h-3 text-orange-500" /> Kcal
          </span>
          <p className="text-sm font-black text-neutral-900">{dish.kcal}</p>
        </div>

        <div className="border-r border-neutral-200 pr-1">
          <span className="text-[10px] font-bold uppercase text-neutral-500">
            Węgle
          </span>
          <p className="text-sm font-extrabold text-neutral-900">
            {dish.macros.carbs}g
          </p>
        </div>

        <div className="border-r border-neutral-200 pr-1">
          <span className="text-[10px] font-bold uppercase text-emerald-700">
            Białko
          </span>
          <p className="text-sm font-extrabold text-emerald-700">
            {dish.macros.protein}g
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase text-neutral-500">
            Tłuszcz
          </span>
          <p className="text-sm font-extrabold text-neutral-900">
            {dish.macros.fat}g
          </p>
        </div>
      </div>

      {/* Podgląd składników w kwadratach + zachęta do modyfikacji */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {dish.ingredients.map((ing, idx) => (
            <span
              key={`${ing.productId}_${idx}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border whitespace-nowrap shadow-2xs ${
                ing.metrics.isGazetkaPromo
                  ? 'bg-amber-100 border-amber-300 text-amber-950'
                  : ing.metrics.isFitChoice
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-white border-neutral-200 text-neutral-800'
              }`}
            >
              <FoodIcon
                category={ing.metrics.product?.category || ''}
                subType={ing.metrics.name}
                className="w-3.5 h-3.5 opacity-80"
              />
              <span className="truncate max-w-[105px]">
                {ing.metrics.name.split(' ')[0]}
              </span>
            </span>
          ))}
        </div>

        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-red-700 group-hover:translate-x-0.5 transition">
          <Edit3 className="w-3.5 h-3.5" />
          <span>Modyfikuj</span>
        </span>
      </div>
    </div>
  );
}
