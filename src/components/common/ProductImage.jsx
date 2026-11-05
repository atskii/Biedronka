import React, { useState } from 'react';
import { getProductImageUrl } from '../../data/productImages';
import FoodIcon from './FoodIcon';

/**
 * Komponent wyświetlający realistyczne zdjęcie produktu spożywczego.
 * Pobiera dedykowany URL zdjęcia z productImages.js na podstawie productId.
 * Jeśli zdjęcie nie istnieje lub wystąpi błąd ładowania (np. brak sieci),
 * automatycznie i bez zakłóceń przełącza się na profesjonalną ikonę wektorową FoodIcon.
 */
export default function ProductImage({
  productId,
  name,
  category,
  className = 'w-10 h-10',
  imgClassName = '',
  tone = 'default',
  alt,
}) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = productId ? getProductImageUrl(productId) : null;

  if (!imageUrl || hasError) {
    return (
      <FoodIcon
        category={category}
        subType={name}
        className="w-5 h-5 text-neutral-800"
        withContainer
        containerClassName={`${className} rounded-xl`}
        tone={tone}
      />
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-neutral-200/80 bg-neutral-100 flex items-center justify-center shrink-0 shadow-2xs ${className}`}
    >
      <img
        src={imageUrl}
        alt={alt || name || 'Produkt Biedronka'}
        loading="lazy"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${imgClassName}`}
      />
    </div>
  );
}

