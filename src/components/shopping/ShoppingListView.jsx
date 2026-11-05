import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  AlertCircle,
  QrCode,
  Timer,
  ArrowLeft,
  Flame,
  CheckCheck,
  RefreshCw,
  Navigation,
  MapPin,
  Check,
  Sparkles,
} from 'lucide-react';
import ProductAlternativesModal from './ProductAlternativesModal';
import FoodIcon from '../common/FoodIcon';

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Interaktywna lista zakupów w stylu Stitch (In-Store Express Route):
 * - Podział na sekcje według działów w sklepie Biedronka:
 *   1. Owoce i warzywa (pierwsze!)
 *   2. Pieczywo
 *   3. Nabiał
 *   4. Wędliny
 *   5. Mięso
 *   6. Ryby
 *   7. Napoje
 *   8. Napoje alkoholowe
 * - Zastąpienie emotek wektorowymi ikonami kategorii i produktów
 * - Przycisk "Brak produktu" otwierający dostępne "Alternatywy"
 * - Pasek postępu na dole wraz z przyciskiem skanowania karty Moja Biedronka
 */
export default function ShoppingListView({
  shoppingList,
  plan,
  elapsedSeconds,
  onToggleItemCheck,
  onCheckAllItems,
  onReplaceWithAlternative,
  onOpenCardScanner,
  onBackToPlan,
}) {
  const [missingModalItem, setMissingModalItem] = useState(null);

  return (
    <div className="pb-36">
      {/* Telemetria trasy w sklepie w stylu Stitch Screen 2 */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={onBackToPlan}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-neutral-600 hover:text-neutral-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Wróć do jadłospisu</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-300 text-neutral-950 text-xs font-black shadow-2xs">
            <Timer className="w-3.5 h-3.5 text-red-700 animate-pulse" />
            <span>Czas zakupów: {formatDuration(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mb-1 border border-emerald-200">
              <Navigation className="w-3 h-3 text-emerald-700" />
              <span>Optymalna trasa bez nawracania</span>
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">
              Lista zakupów wg działów w sklepie
            </h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              Ułożona zgodnie z kolejnością półek w Biedronce – zaczynasz od owoców i warzyw przy wejściu!
            </p>
          </div>

          <button
            type="button"
            onClick={onCheckAllItems}
            className="shrink-0 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Zaznacz wszystko</span>
          </button>
        </div>

        {/* Podsumowanie makro całego koszyka */}
        <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-4 gap-2 text-center">
          <div className="bg-neutral-50/80 rounded-xl p-2 border border-neutral-100">
            <span className="text-[10px] font-bold uppercase text-neutral-500 flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-orange-500" /> Łącznie kcal
            </span>
            <p className="text-xs font-black text-neutral-900">
              {shoppingList.totalMacros.kcal} kcal
            </p>
          </div>
          <div className="bg-neutral-50/80 rounded-xl p-2 border border-neutral-100">
            <span className="text-[10px] font-bold uppercase text-neutral-500">
              Węgle
            </span>
            <p className="text-xs font-black text-neutral-900">
              {shoppingList.totalMacros.carbs}g
            </p>
          </div>
          <div className="bg-neutral-50/80 rounded-xl p-2 border border-neutral-100">
            <span className="text-[10px] font-bold uppercase text-emerald-700">
              Białko
            </span>
            <p className="text-xs font-black text-emerald-700">
              {shoppingList.totalMacros.protein}g
            </p>
          </div>
          <div className="bg-neutral-50/80 rounded-xl p-2 border border-neutral-100">
            <span className="text-[10px] font-bold uppercase text-neutral-500">
              Tłuszcze
            </span>
            <p className="text-xs font-black text-neutral-900">
              {shoppingList.totalMacros.fat}g
            </p>
          </div>
        </div>
      </div>

      {/* Sekcje odpowiadające kolejności działów w Biedronce */}
      <div className="space-y-4">
        {shoppingList.sections.map((section) => {
          const allSectionDone =
            section.checkedCount === section.totalCount && section.totalCount > 0;

          return (
            <div
              key={section.id}
              className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs transition-shadow hover:shadow-sm"
            >
              {/* Nagłówek działu sklepowego z profesjonalną ikoną */}
              <div
                className={`px-4 py-3 flex items-center justify-between border-b transition-colors ${
                  allSectionDone
                    ? 'bg-emerald-50/80 border-emerald-200'
                    : 'bg-neutral-900 text-white border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FoodIcon
                    category={section.id}
                    className={`w-5 h-5 ${allSectionDone ? 'text-emerald-700' : 'text-amber-300'}`}
                    withContainer
                    containerClassName={`w-9 h-9 rounded-xl ${allSectionDone ? 'bg-emerald-100 border-emerald-200' : 'bg-neutral-800 border-neutral-700'}`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          allSectionDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-300 text-neutral-950'
                        }`}
                      >
                        Alejka #{section.order}
                      </span>
                      <h2
                        className={`text-sm font-black ${
                          allSectionDone ? 'text-emerald-950' : 'text-white'
                        }`}
                      >
                        {section.name}
                      </h2>
                    </div>
                    <p
                      className={`text-[11px] ${
                        allSectionDone ? 'text-emerald-700' : 'text-neutral-300'
                      }`}
                    >
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full ${
                    allSectionDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/15 text-white'
                  }`}
                >
                  {section.checkedCount} / {section.totalCount}
                </span>
              </div>

              {/* Lista produktów w danym dziale */}
              <div className="divide-y divide-neutral-100">
                {section.items.map((item) => (
                  <div
                    key={item.productId}
                    className={`p-3.5 flex items-center justify-between gap-3 transition ${
                      item.isChecked ? 'bg-neutral-50/70 opacity-65' : 'bg-white'
                    }`}
                  >
                    {/* Lewa strona: Checkbox + Nazwa + Makro */}
                    <button
                      type="button"
                      onClick={() => onToggleItemCheck(item.productId)}
                      className="flex items-start gap-3 text-left flex-1 min-w-0"
                    >
                      <div className="mt-1 shrink-0 text-red-600">
                        {item.isChecked ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg border-2 border-neutral-300 hover:border-red-600 transition" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <FoodIcon
                            category={item.product.category}
                            subType={item.product.name}
                            className="w-4 h-4 text-neutral-700"
                            withContainer
                            containerClassName="w-7 h-7 rounded-lg"
                            tone={item.product.isGazetkaPromo ? 'promo' : item.product.isFit ? 'fit' : 'default'}
                          />
                          <span
                            className={`text-sm font-black ${
                              item.isChecked
                                ? 'line-through text-neutral-400'
                                : 'text-neutral-900'
                            }`}
                          >
                            {item.product.name}
                          </span>
                          {item.wasReplacedOnShelf && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-extrabold">
                              Wybrana alternatywa
                            </span>
                          )}
                          {item.product.isGazetkaPromo && !item.isChecked && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-300 text-neutral-950 text-[9px] font-black uppercase">
                              Gazetka
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-600 font-semibold mt-1">
                          Potrzebujesz: <strong>{item.totalGrams} g</strong> ({item.packagesNeeded}x{' '}
                          {item.product.unitLabel})
                        </p>

                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {item.totalKcal} kcal • W: {item.totalCarbs}g • B:{' '}
                          <span className="text-emerald-700 font-bold">{item.totalProtein}g</span> • T: {item.totalFat}g
                        </p>
                      </div>
                    </button>

                    {/* Prawa strona: Cena + Przycisk "Brak produktu" -> "Alternatywy" */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-base font-black text-red-700">
                        {item.totalCostPln.toFixed(2)} zł
                      </span>

                      <button
                        type="button"
                        onClick={() => setMissingModalItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold transition active:scale-95"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Brak produktu</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* PASEK POSTĘPU NA DOLE (Stitch Checkout Tray) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 p-3 shadow-2xl">
        <div className="max-w-lg mx-auto space-y-2.5">
          {/* Pasek postępu */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-neutral-700">
                Postęp koszyka: <strong>{shoppingList.checkedItemsCount} z{' '}
                {shoppingList.totalItemsCount} produktów</strong> (
                {shoppingList.progressPercent}%)
              </span>
              <span className="text-red-700 font-black">
                Suma: {shoppingList.totalBasketCostPln.toFixed(2)} zł
              </span>
            </div>

            <div className="w-full h-2.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${shoppingList.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Przycisk Skanuj kartę Moja Biedronka */}
          <button
            type="button"
            onClick={onOpenCardScanner}
            className="w-full py-3.5 px-5 rounded-2xl bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-5 h-5 text-amber-300" />
            <span>Skanuj kartę Moja Biedronka i zakończ zakupy</span>
          </button>
        </div>
      </div>

      {/* Modal wyboru Alternatyw po kliknięciu "Brak produktu" */}
      {missingModalItem && (
        <ProductAlternativesModal
          missingItem={missingModalItem}
          dietType={plan.dietType}
          excludedProductIds={plan.excludedProductIds}
          onClose={() => setMissingModalItem(null)}
          onSelectAlternative={(originalProdId, newAltProdId) => {
            onReplaceWithAlternative(originalProdId, newAltProdId);
            setMissingModalItem(null);
          }}
        />
      )}
    </div>
  );
}
