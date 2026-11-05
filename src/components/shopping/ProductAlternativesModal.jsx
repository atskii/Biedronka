import React from 'react';
import { X, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { getShelfAlternativesForProduct } from '../../services/mealPlanEngine';

/**
 * Modal wyświetlający ogólne "Alternatywy" na półce po kliknięciu przycisku "Brak produktu" na liście zakupów.
 */
export default function ProductAlternativesModal({
  missingItem,
  dietType,
  excludedProductIds,
  onClose,
  onSelectAlternative,
}) {
  if (!missingItem) return null;

  const alternatives = getShelfAlternativesForProduct(
    missingItem.productId,
    dietType,
    excludedProductIds
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Nagłówek */}
        <div className="p-4 bg-neutral-900 text-white flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-yellow-300">
              <RefreshCw className="w-3.5 h-3.5" /> Brak produktu na półce • Alternatywy
            </span>
            <h2 className="text-lg font-black mt-1">
              Wybierz alternatywę dla: {missingItem.product.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Zamknij wybór alternatyw"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informacja o brakującym produkcie */}
        <div className="px-4 py-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">{missingItem.product.emoji}</span>
            <div>
              <p className="font-bold text-neutral-900">
                Brakujący artykuł: {missingItem.product.name}
              </p>
              <p className="text-neutral-500">
                Cena bazowa: {missingItem.product.pricePromo.toFixed(2)} zł /{' '}
                {missingItem.product.unitLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Lista dostępnych alternatyw */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Dostępne alternatywy w sklepie ({alternatives.length}):
          </p>

          {alternatives.length === 0 ? (
            <div className="p-6 rounded-2xl bg-neutral-50 text-center text-xs text-neutral-500">
              Brak innych alternatyw w tym dziale dla wybranych wykluczeń.
            </div>
          ) : (
            alternatives.map((alt) => (
              <button
                key={alt.product.id}
                type="button"
                onClick={() =>
                  onSelectAlternative(
                    missingItem.originalProductId || missingItem.productId,
                    alt.product.id
                  )
                }
                className="w-full p-3.5 rounded-2xl border-2 border-neutral-200 hover:border-red-600 bg-white hover:bg-red-50/30 text-left flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl shrink-0 mt-0.5">
                    {alt.product.emoji}
                  </span>
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-extrabold uppercase mb-1">
                      <ArrowRightLeft className="w-3 h-3 text-red-600" />
                      Alternatywa • {alt.product.brand}
                    </span>
                    <p className="text-sm font-black text-neutral-900 truncate">
                      {alt.product.name}
                    </p>
                    <p className="text-xs text-neutral-600 font-medium mt-0.5">
                      Opakowanie: {alt.product.unitLabel} • {alt.product.kcalPer100g} kcal/100g
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      W: {alt.product.carbs}g • B: {alt.product.protein}g • T:{' '}
                      {alt.product.fat}g (na 100g)
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-base font-black text-red-600">
                    {alt.product.pricePromo.toFixed(2)} zł
                  </p>
                  <p className="text-[11px] font-bold text-neutral-500">
                    {alt.priceDiff === 0
                      ? 'Ta sama cena'
                      : alt.priceDiff < 0
                      ? `${alt.priceDiff.toFixed(2)} zł`
                      : `+${alt.priceDiff.toFixed(2)} zł`}
                  </p>
                  <span className="inline-block mt-1.5 px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-extrabold">
                    Wybierz alternatywę
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

