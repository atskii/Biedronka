import React, { useState } from 'react';
import { getDishImageUrl } from '../../data/dishImages';
import FoodIcon from './FoodIcon';

/**
 * Komponent wyświetlający apetyczne zdjęcie gotowej potrawy kulinarnej.
 * Posiada automatyczny fallback na ikonę posiłku w razie braku sieci lub błędu ładowania.
 */
export default function DishImage({
  recipeId,
  mealType,
  title,
  className = 'w-full h-40',
  imgClassName = '',
  alt,
}) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getDishImageUrl(recipeId, mealType);

  if (!imageUrl || hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-amber-100 via-amber-50 to-neutral-100 flex items-center justify-center ${className}`}
      >
        <FoodIcon
          category={mealType}
          className="w-8 h-8 text-neutral-400"
          withContainer
          containerClassName="w-14 h-14 rounded-2xl bg-white/80 shadow-xs"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
      <img
        src={imageUrl}
        alt={alt || title || 'Zdjęcie potrawy'}
        loading="lazy"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgClassName}`}
      />
    </div>
  );
}

