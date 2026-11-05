import React from 'react';
import {
  ClipboardList,
  UtensilsCrossed,
  ShoppingBasket,
  Sparkles,
} from 'lucide-react';

/**
 * Prawdziwe, natywne dolne menu nawigacyjne dla widoku mobilnego (Bottom Navigation Bar)
 * Zgodne ze standardami aplikacji Moja Biedronka i designem Stitch.
 */
export default function BottomNavBar({
  stage,
  onSelectStage,
  basketItemsCount = 0,
}) {
  const tabs = [
    {
      id: 'survey',
      label: '1. Ankieta',
      shortLabel: 'Ankieta',
      icon: ClipboardList,
    },
    {
      id: 'plan',
      label: '2. Plan',
      shortLabel: 'Plan',
      icon: UtensilsCrossed,
    },
    {
      id: 'shopping',
      label: '3. Zakupy',
      shortLabel: 'Zakupy',
      icon: ShoppingBasket,
      badge: basketItemsCount > 0 ? basketItemsCount : null,
    },
    {
      id: 'summary',
      label: '4. Czas',
      shortLabel: 'Czas',
      icon: Sparkles,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-neutral-200/90 py-1.5 px-3 flex justify-around items-center shadow-lg"
      aria-label="Nawigacja główna aplikacji"
    >
      {tabs.map((tab) => {
        const isActive = stage === tab.id;
        const IconComponent = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectStage(tab.id)}
            className={`relative flex flex-col items-center justify-center min-w-[68px] py-1 px-2.5 rounded-2xl transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-red-700 text-white shadow-xs font-black'
                : 'text-neutral-500 hover:text-neutral-900 font-bold'
            }`}
          >
            <div className="relative">
              <IconComponent
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-105' : 'text-neutral-500'
                }`}
              />
              {tab.badge && !isActive && (
                <span className="absolute -top-1.5 -right-2 bg-amber-400 text-neutral-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-2xs">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-none whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

