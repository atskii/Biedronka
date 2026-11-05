import React from 'react';
import { Clock, Flame, Tag, Sparkles, Edit3, ArrowRight } from 'lucide-react';
import FoodIcon from '../common/FoodIcon';
import ProductImage from '../common/ProductImage';
import DishImage from '../common/DishImage';

/**
 * Karta produktów (dań) według designu Stitch (Modern Tactile Retail):
 * - Zdjęcie potrawy (apetyczne, wysokiej jakości)
 * - Cena (najważniejsza!)
 * - Kalorie
 * - Makra (węgle, białko i tłuszcze)
 * - Czas przygotowania (np. 15m, 30m, 2h)
 * - Składniki w kwadratach (zastępuje emotki zdjęciami produktów i ikonami)
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
      className="bg-white rounded-3xl border border-neutral-200/90 hover:border-red-600 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* Zdjęcie potrawy z nakładkami statusu i czasem przygotowania */}
      <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden mb-3 border border-neutral-100/90 shadow-2xs">
        <DishImage
          recipeId={dish.recipeId}
          mealType={dish.slotId || dish.mealType}
          title={dish.title}
          className="w-full h-full"
        />

        {/* Delikatny gradient dla kontrastu nakładek */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35 pointer-events-none" />

        {/* Plakietki na zdjęciu: Slot posiłku + Czas przygotowania */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-neutral-900 text-[11px] font-extrabold shadow-xs">
            <FoodIcon category={dish.slotId} className="w-3.5 h-3.5 text-neutral-700" />
            <span>{dish.slotLabel}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-950/85 backdrop-blur-xs text-white text-[11px] font-bold shadow-xs">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{dish.prepTimeLabel}</span>
          </span>
        </div>

        {/* Plakietka Gazetki na zdjęciu */}
        {dish.gazetkaCount > 0 && (
          <div className="absolute top-2.5 right-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black uppercase tracking-tight shadow-xs border border-amber-500/30">
              <Tag className="w-3 h-3 text-red-700" />
              <span>{dish.gazetkaCount} z Gazetki</span>
            </span>
          </div>
        )}
      </div>

      {/* Tytuł dania + Najważniejsza Cena w żółtym boksie Biedronki */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-extrabold text-neutral-900 group-hover:text-red-700 transition leading-snug flex-1">
          {dish.title}
        </h3>

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
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl text-xs font-bold border whitespace-nowrap shadow-2xs ${
                ing.metrics.isGazetkaPromo
                  ? 'bg-amber-100 border-amber-300 text-amber-950'
                  : ing.metrics.isFitChoice
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-white border-neutral-200 text-neutral-800'
              }`}
            >
              <ProductImage
                productId={ing.productId}
                name={ing.metrics.name}
                category={ing.metrics.product?.category || ''}
                className="w-4 h-4 rounded-full"
                tone={ing.metrics.isGazetkaPromo ? 'promo' : ing.metrics.isFitChoice ? 'fit' : 'default'}
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
