import React from 'react';
import { Clock, Flame, Tag, Sparkles, Edit3 } from 'lucide-react';

/**
 * Karta produktów (dań):
 * - Cena (najważniejsza!)
 * - Kalorie
 * - Makra (węgle, białko i tłuszcze)
 * - Czas przygotowania (np. 2h albo 30m)
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
      className="bg-white rounded-3xl border-2 border-neutral-200 hover:border-red-500 p-4 shadow-sm hover:shadow-md transition cursor-pointer group"
    >
      {/* Górny wiersz: Typ posiłku + Czas przygotowania + NAJWAŻNIEJSZA CENA */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-extrabold">
              <span>{dish.slotEmoji}</span>
              <span>{dish.slotLabel}</span>
            </span>

            {/* Czas przygotowania (np. 30m albo 2h) */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-extrabold">
              <Clock className="w-3.5 h-3.5 text-yellow-300" />
              <span>{dish.prepTimeLabel}</span>
            </span>

            {dish.gazetkaCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-300 text-neutral-900 text-[11px] font-black">
                <Tag className="w-3 h-3 text-red-600" />
                <span>{dish.gazetkaCount} z Gazetki</span>
              </span>
            )}
          </div>

          <h3 className="text-base font-black text-neutral-900 mt-2 group-hover:text-red-600 transition leading-snug">
            {dish.emoji} {dish.title}
          </h3>
        </div>

        {/* CENA - NAJWAŻNIEJSZY ELEMENT KARTY */}
        <div className="shrink-0 text-right bg-yellow-300 border-2 border-red-600 rounded-2xl px-3 py-2 shadow-sm">
          <span className="block text-[10px] font-black uppercase tracking-wider text-red-700">
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

      {/* Kalorie oraz Makra (Węgle, Białko, Tłuszcze) */}
      <div className="grid grid-cols-4 gap-2 p-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 mb-3">
        <div className="text-center border-r border-neutral-200 pr-1">
          <span className="text-[10px] font-bold uppercase text-neutral-500 flex items-center justify-center gap-0.5">
            <Flame className="w-3 h-3 text-orange-500" /> Kalorie
          </span>
          <p className="text-sm font-black text-neutral-900">{dish.kcal} kcal</p>
        </div>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase text-amber-700">
            Węgle
          </span>
          <p className="text-sm font-extrabold text-neutral-900">
            {dish.macros.carbs} g
          </p>
        </div>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase text-emerald-700">
            Białko
          </span>
          <p className="text-sm font-extrabold text-neutral-900">
            {dish.macros.protein} g
          </p>
        </div>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase text-sky-700">
            Tłuszcze
          </span>
          <p className="text-sm font-extrabold text-neutral-900">
            {dish.macros.fat} g
          </p>
        </div>
      </div>

      {/* Podgląd składników w kwadratach + zachęta do modyfikacji */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {dish.ingredients.map((ing, idx) => (
            <span
              key={`${ing.productId}_${idx}`}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border whitespace-nowrap ${
                ing.metrics.isGazetkaPromo
                  ? 'bg-yellow-200/90 border-yellow-400 text-neutral-900'
                  : ing.metrics.isFitChoice
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-white border-neutral-200 text-neutral-700'
              }`}
            >
              <span>{ing.metrics.emoji}</span>
              <span className="truncate max-w-[105px]">{ing.metrics.name.split(' ')[0]}</span>
            </span>
          ))}
        </div>

        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-red-600 group-hover:translate-x-0.5 transition">
          <Edit3 className="w-3.5 h-3.5" />
          <span>Modyfikuj</span>
        </span>
      </div>
    </div>
  );
}

