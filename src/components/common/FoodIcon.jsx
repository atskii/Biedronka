import React from 'react';
import {
  Apple,
  Carrot,
  Salad,
  Wheat,
  Croissant,
  Milk,
  Beef,
  Fish,
  CupSoda,
  Beer,
  Wine,
  Sunrise,
  Utensils,
  Moon,
  Cookie,
  Flame,
  Leaf,
  Layers,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

/**
 * Zwraca profesjonalną ikonę Lucide zamiast emoji.
 */
export function getFoodIconComponent(typeOrCategory, subType) {
  const key = String(typeOrCategory || '').toLowerCase();
  const sub = String(subType || '').toLowerCase();

  // Poszczególne działy sklepowe
  if (key === 'owoce_warzywa') return Apple;
  if (key === 'pieczywo') return Croissant;
  if (key === 'nabial') return Milk;
  if (key === 'wedliny') return Beef;
  if (key === 'mieso') return Beef;
  if (key === 'ryby') return Fish;
  if (key === 'napoje') return CupSoda;
  if (key === 'alkohole') return Beer;

  // Posiłki (sloty)
  if (key === 'sniadanie') return Sunrise;
  if (key === 'obiad') return Utensils;
  if (key === 'kolacja') return Moon;
  if (key === 'przekaska') return Apple;

  // Diety
  if (key === 'vege') return Leaf;
  if (key === 'nie_vege') return Beef;
  if (key === 'bez_glutenu') return Wheat;
  if (key === 'bez_laktozy') return Milk;

  // Wyszukiwanie po nazwach produktów lub podkategoriach
  if (sub.includes('chleb') || sub.includes('bułk') || sub.includes('bagiet') || sub.includes('tortill')) return Croissant;
  if (sub.includes('mleko') || sub.includes('jogurt') || sub.includes('ser') || sub.includes('twaróg')) return Milk;
  if (sub.includes('jabłk') || sub.includes('banan') || sub.includes('owoc') || sub.includes('pomidor')) return Apple;
  if (sub.includes('marchew') || sub.includes('brokuł') || sub.includes('warzyw') || sub.includes('ogórek')) return Carrot;
  if (sub.includes('łosoś') || sub.includes('tuńczyk') || sub.includes('ryb')) return Fish;
  if (sub.includes('kurczak') || sub.includes('indyk') || sub.includes('mięs') || sub.includes('szynk')) return Beef;
  if (sub.includes('woda') || sub.includes('sok') || sub.includes('napój')) return CupSoda;
  if (sub.includes('piwo') || sub.includes('wino')) return Wine;
  if (sub.includes('tofu') || sub.includes('vege') || sub.includes('sałat')) return Salad;

  return ShoppingBag;
}

export default function FoodIcon({
  category,
  subType = '',
  className = 'w-4 h-4',
  containerClassName = '',
  withContainer = false,
  tone = 'default', // 'default' | 'promo' | 'fit' | 'dark'
}) {
  const Icon = getFoodIconComponent(category, subType);

  if (!withContainer) {
    return <Icon className={className} />;
  }

  const toneStyles = {
    default: 'bg-neutral-100 text-neutral-700 border-neutral-200/80',
    promo: 'bg-yellow-100 text-amber-800 border-yellow-300',
    fit: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dark: 'bg-neutral-900 text-yellow-300 border-neutral-800',
    crimson: 'bg-red-50 text-red-700 border-red-200',
  };

  const currentTone = toneStyles[tone] || toneStyles.default;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl border shrink-0 ${currentTone} ${containerClassName}`}
    >
      <Icon className={className} />
    </div>
  );
}

