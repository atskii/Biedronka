import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Zap,
  Trophy,
  Clock,
  CheckCircle2,
  Flame,
  RotateCcw,
  ArrowLeft,
  BellRing,
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
 * Powiadomienie po zeskanowaniu karty Biedronka i płatności pokazujące,
 * ile czasu zajęły zakupy – dokładnie w stylu powiadomień InPost po odbiorze paczki!
 * Zastąpienie surowych emotek wektorowymi ikonami i nowoczesnym stylem Stitch.
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
  const speedPercentile =
    durationSeconds < 180 ? 98 : durationSeconds < 420 ? 94 : 88;

  return (
    <div className="space-y-4 pb-12">
      {/* BANER POWIADOMIENIA PUSH W STYLU INPOST */}
      <div className="bg-neutral-950 text-white rounded-3xl p-4 border border-amber-400 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 font-black">
            <BellRing className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                POWIADOMIENIE MOJA BIEDRONKA • TERAZ
              </span>
              <span className="text-[10px] text-neutral-400">Kasa Samoobsługowa</span>
            </div>
            <p className="text-sm font-extrabold mt-1 leading-snug flex items-center gap-1.5 flex-wrap">
              <Zap className="w-4 h-4 text-amber-400 inline-block fill-amber-400 shrink-0" />
              <span>
                Zakupy opłacone! Całe zakupy z listą zajęły Ci tylko{' '}
                <span className="text-amber-400 underline font-black">{readableTime}</span>!
              </span>
            </p>
            <p className="text-xs text-neutral-300 mt-1">
              To szybciej niż {speedPercentile}% kupujących w tym tygodniu. Zero błądzenia między alejkami!
            </p>
          </div>
        </div>
      </div>

      {/* GŁÓWNA KARTA WYNIKU CZASOWEGO (STYL INPOST + MOJA BIEDRONKA) */}
      <div className="bg-gradient-to-b from-amber-300 via-amber-300 to-yellow-400 rounded-3xl border border-amber-400 p-6 text-neutral-950 shadow-md text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 text-amber-300 text-xs font-black uppercase mb-3 shadow-2xs">
          <Zap className="w-3.5 h-3.5 fill-amber-300" />
          <span>Twój Czas Zakupów</span>
        </div>

        <h1 className="text-2xl font-black leading-tight tracking-tight">
          Ekspresowe zakupy zakończone!
        </h1>
        <p className="text-xs font-bold text-neutral-800 mt-1">
          Karta Moja Biedronka ({loyaltyCardNumber}) została zeskanowana
        </p>

        {/* Wielki zegar wyniku */}
        <div className="my-5 p-5 rounded-3xl bg-white border border-neutral-300 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-red-700" /> Czas od wejścia na listę do płatności
          </span>
          <div
            className="text-4xl sm:text-5xl font-black text-red-700 my-2 tracking-tight"
            data-testid="inpost-time-value"
          >
            {readableTime}
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 text-xs font-extrabold border border-emerald-300">
            <Trophy className="w-3.5 h-3.5 text-emerald-700" />
            <span>Status: Mistrz Szybkich Alejek (Top {100 - speedPercentile}%)</span>
          </div>
        </div>

        {/* Podsumowanie oszczędności i budżetu */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-neutral-300/80 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-neutral-500">
              Zapłacono łącznie
            </span>
            <p className="text-xl font-black text-neutral-950 mt-0.5">
              {shoppingList.totalBasketCostPln.toFixed(2)} zł
            </p>
            <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
              Budżet: {plan.budgetPln} zł
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-700 text-white shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-amber-200">
              Zaoszczędzono z Gazetką
            </span>
            <p className="text-xl font-black text-amber-300 mt-0.5">
              {shoppingList.totalBasketSavedPln.toFixed(2)} zł
            </p>
            <span className="text-[11px] text-red-100 block mt-0.5">
              Dzięki karcie Moja Biedronka
            </span>
          </div>
        </div>
      </div>

      {/* Podsumowanie zakupionych wartości odżywczych */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 p-4 shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>
            Zakupione makroskładniki ({plan.daysCount}{' '}
            {plan.daysCount === 1 ? 'dzień' : 'dni'} • {plan.peopleCount}{' '}
            {plan.peopleCount === 1 ? 'osoba' : 'os.'})
          </span>
        </h2>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
            <span className="text-[10px] font-bold uppercase text-neutral-500">
              Kalorie
            </span>
            <p className="text-sm font-black text-neutral-900">
              {shoppingList.totalMacros.kcal} kcal
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
            <span className="text-[10px] font-bold uppercase text-neutral-600">
              Węgle
            </span>
            <p className="text-sm font-black text-neutral-900">
              {shoppingList.totalMacros.carbs}g
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase text-emerald-800">
              Białko
            </span>
            <p className="text-sm font-black text-emerald-800">
              {shoppingList.totalMacros.protein}g
            </p>
          </div>
          <div className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
            <span className="text-[10px] font-bold uppercase text-neutral-600">
              Tłuszcze
            </span>
            <p className="text-sm font-black text-neutral-900">
              {shoppingList.totalMacros.fat}g
            </p>
          </div>
        </div>
      </div>

      {/* Przyciski akcji końcowych */}
      <div className="flex flex-col sm:flex-row gap-2.5">
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
