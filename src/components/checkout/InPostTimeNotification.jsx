import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Zap,
  Clock,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';

export function formatReadableDuration(seconds) {
  const safeSecs = Math.max(1, seconds);
  const mins = Math.floor(safeSecs / 60);
  const secs = safeSecs % 60;
  if (mins === 0) {
    return `${secs} sek.`;
  }
  return `${mins} min ${secs} sek.`;
}

/**
 * Minimalistyczne podsumowanie po zakończeniu zakupów:
 * - Czas zakupów (ile czasu zajęły)
 * - Kwota zapłacona łącznie
 * - Kwota zaoszczędzona z gazetką
 */
export default function InPostTimeNotification({
  durationSeconds,
  shoppingList,
  plan,
  loyaltyCardNumber,
  onBackToShoppingList,
  onCreateNewPlan,
}) {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore canvas errors in headless/test environments
    }
  }, []);

  const readableTime = formatReadableDuration(durationSeconds);

  return (
    <div className="space-y-4 pb-12">
      {/* KARTA POWIADOMIENIA: EKSPRESOWE ZAKUPY ZAKOŃCZONE */}
      <div className="bg-gradient-to-b from-amber-300 via-amber-300 to-yellow-400 rounded-3xl border border-amber-400 p-6 text-neutral-950 shadow-md text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-neutral-950 text-amber-300 text-xs font-black uppercase mb-3 shadow-2xs">
          <Zap className="w-3.5 h-3.5 fill-amber-300" />
          <span>Czas zakupów</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
          Ekspresowe zakupy zakończone!
        </h1>

        {/* Czas zakupów */}
        <div className="my-5 p-5 rounded-3xl bg-white border border-neutral-300/80 shadow-sm">
          <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 flex items-center justify-center gap-1">
            <Clock className="w-4 h-4 text-red-700" /> Czas zakupów
          </span>
          <div
            className="text-4xl sm:text-5xl font-black text-red-700 mt-2 tracking-tight"
            data-testid="inpost-time-value"
          >
            {readableTime}
          </div>
        </div>

        {/* 2 kafelki: Zapłacono łącznie & Zaoszczędzono z gazetką */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-white border border-neutral-300/80 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">
              Zapłacono łącznie
            </span>
            <p className="text-xl sm:text-2xl font-black text-neutral-950 mt-1 whitespace-nowrap">
              {shoppingList.totalBasketCostPln.toFixed(2)} zł
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-700 text-white shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-200 block">
              Zaoszczędzono z gazetką
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-300 mt-1 whitespace-nowrap">
              {shoppingList.totalBasketSavedPln.toFixed(2)} zł
            </p>
          </div>
        </div>
      </div>

      {/* Przyciski nawigacji */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          onClick={onBackToShoppingList}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-white border border-neutral-300 text-neutral-800 font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-neutral-50 transition active:scale-95 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Wróć do listy zakupów</span>
        </button>

        <button
          type="button"
          onClick={onCreateNewPlan}
          className="flex-1 py-3.5 px-5 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Stwórz nowy jadłospis</span>
        </button>
      </div>
    </div>
  );
}
