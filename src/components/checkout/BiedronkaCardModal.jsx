import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * Ekran skanowania karty lojalnościowej Moja Biedronka przy kasie oraz symulacji płatności.
 */
export default function BiedronkaCardModal({
  shoppingList,
  elapsedSeconds,
  onClose,
  onConfirmPayment,
}) {
  const [isScanning, setIsScanning] = useState(false);
  const cardNumber = '6391 0482 9104 7721';

  const handlePayClick = () => {
    setIsScanning(true);
    setTimeout(() => {
      onConfirmPayment(cardNumber);
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
        {/* Górny pasek Moja Biedronka */}
        <div className="bg-red-600 text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition"
            aria-label="Zamknij kartę"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🐞</span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-yellow-300 block">
                Kasa Samoobsługowa / Tradycyjna
              </span>
              <h2 className="text-xl font-black">Twoja Karta Moja Biedronka</h2>
            </div>
          </div>
        </div>

        {/* Wirtualna karta z kodem kreskowym */}
        <div className="p-5 space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-yellow-300 via-yellow-300 to-amber-300 border-2 border-red-600 p-5 shadow-md text-neutral-900">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-red-700">
                MOJA BIEDRONKA • SMART KOSZYK
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                RABATY AKTYWNE
              </span>
            </div>

            {/* Wizualizacja kodu kreskowego */}
            <div className="bg-white rounded-2xl p-4 text-center border border-neutral-200">
              <div
                className="h-16 w-full mx-auto flex items-stretch justify-center gap-[2px] overflow-hidden"
                aria-hidden="true"
              >
                {[
                  3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 2, 3, 1, 2, 1, 3, 4, 1,
                  2, 1, 2, 3, 1, 4, 1, 2, 3, 1, 2,
                ].map((width, idx) => (
                  <div
                    key={idx}
                    className={`${
                      idx % 2 === 0 ? 'bg-neutral-950' : 'bg-transparent'
                    }`}
                    style={{ width: `${width * 3}px` }}
                  />
                ))}
              </div>
              <p className="font-mono text-sm font-black tracking-widest text-neutral-900 mt-2">
                {cardNumber}
              </p>
            </div>
          </div>

          {/* Podsumowanie kwoty i naliczonych promocji */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 font-semibold">
                Wartość koszyka z promocjami:
              </span>
              <span className="text-lg font-black text-neutral-900">
                {shoppingList.totalBasketCostPln.toFixed(2)} zł
              </span>
            </div>
            <div className="flex items-center justify-between text-emerald-700 font-extrabold text-xs">
              <span>Oszczędność z kartą Moja Biedronka:</span>
              <span>-{shoppingList.totalBasketSavedPln.toFixed(2)} zł</span>
            </div>
          </div>

          {/* Przycisk symulacji zeskanowania i płatności */}
          <button
            type="button"
            disabled={isScanning}
            onClick={handlePayClick}
            className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white font-black text-base shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition"
          >
            {isScanning ? (
              <>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
                <span>Przetwarzanie płatności...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 text-yellow-300" />
                <span>Zeskanuj kartę i zapłać</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-neutral-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Po płatności otrzymasz powiadomienie z czasem zakupów!
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

