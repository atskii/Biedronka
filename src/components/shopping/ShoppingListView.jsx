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
} from 'lucide-react';
import ProductAlternativesModal from './ProductAlternativesModal';

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Interaktywna lista zakupów:
 * - Podział na sekcje według działów w sklepie Biedronka:
 *   1. Owoce i warzywa (pierwsze!)
 *   2. Pieczywo
 *   3. Nabiał
 *   4. Wędliny
 *   5. Mięso
 *   6. Ryby
 *   7. Napoje
 *   8. Napoje alkoholowe
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
      {/* Górny pasek informacyjny z licznikiem czasu i podsumowaniem makro */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={onBackToPlan}
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Wróć do jadłospisu</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-300 text-neutral-900 text-xs font-black">
            <Timer className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>Czas zakupów: {formatDuration(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-black text-neutral-900">
              Lista zakupów wg działów w sklepie
            </h1>
            <p className="text-xs text-neutral-600 mt-0.5">
              Ułożona zgodnie z alejkami w Biedronce – zaczynasz od owoców i warzyw przy wejściu!
            </p>
          </div>

          <button
            type="button"
            onClick={onCheckAllItems}
            className="shrink-0 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-extrabold flex items-center gap-1 transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zaznacz wszystko</span>
          </button>
        </div>

        {/* Podsumowanie makro całego koszyka */}
        <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-4 gap-2 text-center">
          <div className="bg-neutral-50 rounded-xl p-2">
            <span className="text-[10px] font-bold uppercase text-neutral-500 flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 text-orange-500" /> Łącznie kcal
            </span>
            <p className="text-xs font-black text-neutral-900">
              {shoppingList.totalMacros.kcal} kcal
            </p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-2">
            <span className="text-[10px] font-bold uppercase text-amber-700">
              Węgle
            </span>
            <p className="text-xs font-black text-neutral-900">
              {shoppingList.totalMacros.carbs} g
            </p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-2">
            <span className="text-[10px] font-bold uppercase text-emerald-700">
              Białko
            </span>
            <p className="text-xs font-black text-neutral-900">
              {shoppingList.totalMacros.protein} g
            </p>
          </div>
          <div className="bg-neutral-50 rounded-xl p-2">
            <span className="text-[10px] font-bold uppercase text-sky-700">
              Tłuszcze
            </span>
            <p className="text-xs font-black text-neutral-900">
              {shoppingList.totalMacros.fat} g
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
              className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xs"
            >
              {/* Nagłówek działu sklepowego */}
              <div
                className={`px-4 py-3 flex items-center justify-between border-b ${
                  allSectionDone
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-neutral-900 text-white border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{section.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          allSectionDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-yellow-300 text-neutral-900'
                        }`}
                      >
                        Dział #{section.order}
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
                      item.isChecked ? 'bg-neutral-50/80 opacity-65' : 'bg-white'
                    }`}
                  >
                    {/* Lewa strona: Checkbox + Nazwa + Makro */}
                    <button
                      type="button"
                      onClick={() => onToggleItemCheck(item.productId)}
                      className="flex items-start gap-3 text-left flex-1 min-w-0"
                    >
                      <div className="mt-0.5 shrink-0 text-red-600">
                        {item.isChecked ? (
                          <CheckSquare className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <Square className="w-6 h-6 text-neutral-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-lg">{item.product.emoji}</span>
                          <span
                            className={`text-sm font-black ${
                              item.isChecked
                                ? 'line-through text-neutral-500'
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
                        </div>

                        <p className="text-xs text-neutral-600 font-semibold mt-0.5">
                          Potrzebujesz: <strong>{item.totalGrams} g</strong> ({item.packagesNeeded}x{' '}
                          {item.product.unitLabel})
                        </p>

                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {item.totalKcal} kcal • W: {item.totalCarbs}g • B:{' '}
                          {item.totalProtein}g • T: {item.totalFat}g
                        </p>
                      </div>
                    </button>

                    {/* Prawa strona: Cena + Przycisk "Brak produktu" -> "Alternatywy" */}
                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <span className="text-base font-black text-red-600">
                        {item.totalCostPln.toFixed(2)} zł
                      </span>

                      <button
                        type="button"
                        onClick={() => setMissingModalItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-extrabold transition"
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

      {/* PASEK POSTĘPU NA DOLE + PRZYCISK SKANOWANIA KARTY MOJA BIEDRONKA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-neutral-200 p-3 shadow-2xl">
        <div className="max-w-lg mx-auto space-y-2.5">
          {/* Pasek postępu */}
          <div>
            <div className="flex items-center justify-between text-xs font-extrabold mb-1">
              <span className="text-neutral-700">
                Postęp koszyka: {shoppingList.checkedItemsCount} z{' '}
                {shoppingList.totalItemsCount} produktów (
                {shoppingList.progressPercent}%)
              </span>
              <span className="text-red-600 font-black">
                Suma: {shoppingList.totalBasketCostPln.toFixed(2)} zł
              </span>
            </div>

            <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-yellow-400 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${shoppingList.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Przycisk Skanuj kartę Moja Biedronka */}
          <button
            type="button"
            onClick={onOpenCardScanner}
            className="w-full py-3.5 px-5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-5 h-5 text-yellow-300" />
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

