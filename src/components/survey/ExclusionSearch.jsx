import React, { useState, useMemo } from 'react';
import { Search, X, CheckCircle2, ArrowLeft, Sparkles, Ban } from 'lucide-react';
import { PRODUCTS, STORE_AISLES } from '../../data/biedronkaCatalog';
import FoodIcon from '../common/FoodIcon';
import ProductImage from '../common/ProductImage';

export default function ExclusionSearch({
  excludedProductIds = [],
  onToggleExclude,
  onBack,
  onConfirmAndGenerate,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAisle, setSelectedAisle] = useState('all');

  const allProducts = useMemo(() => Object.values(PRODUCTS), []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesAisle =
        selectedAisle === 'all' || product.aisleCategory === selectedAisle;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q);
      return matchesAisle && matchesQuery;
    });
  }, [allProducts, searchQuery, selectedAisle]);

  const popularExclusions = [
    'pieczarki_swieze',
    'tunczyk_w_sosie_wlasnym_fit',
    'losos_wedzony_marinero_fit',
    'papryka_czerwona_fit',
    'brokul_swiezy',
    'tofu_wedzone_govege_fit',
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] justify-between">
      <div>
        {/* Nagłówek wyszukiwarki wykluczeń */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition active:scale-95 shadow-2xs"
            aria-label="Wróć do ankiety"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-700">
              Krok 5 z 5 • Wykluczenia
            </span>
            <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
              Wyszukaj produkty do wykluczenia
            </h2>
          </div>
        </div>

        <p className="text-sm text-neutral-600 mb-4">
          Zaznacz składniki, których nie lubisz lub chcesz uniknąć. Automatycznie zastąpimy je innymi produktami w Twoim jadłospisie.
        </p>

        {/* Pasek wyszukiwania */}
        <div className="relative mb-4">
          <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Wpisz nazwę produktu (np. pieczarki, tuńczyk, brokuł)..."
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-neutral-300 rounded-2xl text-sm font-medium focus:outline-none focus:border-red-600 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Szybkie popularne wykluczenia */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Najczęściej wykluczane:
          </p>
          <div className="flex flex-wrap gap-2">
            {popularExclusions.map((prodId) => {
              const prod = PRODUCTS[prodId];
              if (!prod) return null;
              const isExcluded = excludedProductIds.includes(prodId);
              return (
                <button
                  key={prodId}
                  type="button"
                  onClick={() => onToggleExclude(prodId)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                    isExcluded
                      ? 'bg-red-700 text-white border-red-700 shadow-sm'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-red-300'
                  }`}
                >
                  <ProductImage
                    productId={prodId}
                    name={prod.name}
                    category={prod.category}
                    className="w-4 h-4 rounded-md shrink-0"
                  />
                  <span>{prod.name.split(' ')[0]}</span>
                  {isExcluded && <X className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtr po działach sklepowych */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
          <button
            type="button"
            onClick={() => setSelectedAisle('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedAisle === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            Wszystkie działy
          </button>
          {STORE_AISLES.map((aisle) => (
            <button
              key={aisle.id}
              type="button"
              onClick={() => setSelectedAisle(aisle.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedAisle === aisle.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200'
              }`}
            >
              <FoodIcon category={aisle.id} className="w-3.5 h-3.5" />
              <span>{aisle.name}</span>
            </button>
          ))}
        </div>

        {/* Wybrane wykluczenia - podsumowanie */}
        {excludedProductIds.length > 0 && (
          <div className="mb-3 p-3 rounded-2xl bg-red-50 border border-red-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-red-800">
                Wykluczone produkty ({excludedProductIds.length}):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {excludedProductIds.map((id) => {
                const p = PRODUCTS[id];
                if (!p) return null;
                return (
                  <span
                    key={id}
                    onClick={() => onToggleExclude(id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-red-300 text-xs font-semibold text-red-700 cursor-pointer hover:bg-red-100 transition"
                  >
                    <FoodIcon category={p.category} subType={p.name} className="w-3.5 h-3.5" />
                    <span>{p.name}</span>
                    <X className="w-3.5 h-3.5 text-red-600" />
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista produktów z katalogu Biedronki */}
        <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
          {filteredProducts.map((product) => {
            const isExcluded = excludedProductIds.includes(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onToggleExclude(product.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition ${
                  isExcluded
                    ? 'bg-red-50/90 border-red-500 ring-1 ring-red-500'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ProductImage
                    productId={product.id}
                    name={product.name}
                    category={product.category}
                    className="w-10 h-10 rounded-xl shrink-0"
                    tone={isExcluded ? 'crimson' : 'default'}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold truncate ${
                        isExcluded ? 'line-through text-red-700' : 'text-neutral-900'
                      }`}
                    >
                      {product.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {product.brand} • {product.pricePromo.toFixed(2)} zł
                    </p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  {isExcluded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-700 text-white text-xs font-bold">
                      <Ban className="w-3.5 h-3.5" /> Wykluczono
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold">
                      Wyklucz
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dolny przycisk generowania planu */}
      <div className="pt-4 mt-4 border-t border-neutral-200">
        <button
          type="button"
          onClick={onConfirmAndGenerate}
          className="w-full py-4 px-6 rounded-2xl bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>
            Generuj jadłospis{' '}
            {excludedProductIds.length > 0
              ? `(bez ${excludedProductIds.length} prod.)`
              : ''}
          </span>
        </button>
      </div>
    </div>
  );
}
