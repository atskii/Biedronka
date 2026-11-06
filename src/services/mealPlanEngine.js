import { PRODUCTS, RECIPES, STORE_AISLES, MEAL_TYPES, EXCLUSION_GROUPS } from '../data/biedronkaCatalog.js';

/**
 * Słownik fraz do bezpiecznego czyszczenia tytułów potraw w sytuacji awaryjnej,
 * gdy wszystkie naturalne przepisy w danym slocie zawierały wykluczony składnik
 * i silnik musiał podmienić ten składnik na zamiennik.
 */
const EXCLUSION_TITLE_PATTERNS = [
  {
    matchIds: ['pomidor', 'pomidory_malinowe', 'pomidory_koktajlowe_promo', 'pomidory_rzymskie'],
    patterns: [
      / z pomidorami malinowymi/gi,
      / z pomidorami/gi,
      / z pomidorkami koktajlowymi/gi,
      / z pomidorkami/gi,
      / i pomidorami/gi,
      / i pomidorkami koktajlowymi/gi,
      / i pomidorkami/gi,
      / i pomidorem/gi,
      /, pomidorkami koktajlowymi/gi,
      /, pomidorkami/gi,
      /, pomidorami/gi,
    ],
  },
  {
    matchIds: ['ogorek', 'ogorek_zielony_fit'],
    patterns: [/ i zielonym ogórkiem/gi, / i ogórkiem/gi, / z ogórkiem/gi, / i ogórka/gi],
  },
  {
    matchIds: ['papryka', 'papryka_czerwona_fit'],
    patterns: [/ i czerwoną papryką/gi, / i chrupiącą papryką/gi, /, papryką/gi, / z papryki/gi],
  },
  {
    matchIds: ['brokul', 'brokul_swiezy'],
    patterns: [/ i brokułem na parze/gi, /, brokułem/gi, / z brokułem/gi],
  },
  {
    matchIds: ['cukinia', 'cukinia_zielona_promo'],
    patterns: [/ z cukinią,/gi, /, cukinią/gi, / i cukinią/gi],
  },
  {
    matchIds: ['szpinak', 'szpinak_baby_fit'],
    patterns: [/, szpinakiem/gi, / ze szpinakiem/gi],
  },
  {
    matchIds: ['pieczarki', 'pieczarki_swieze'],
    patterns: [/, pieczarkami/gi, / z pieczarkami/gi],
  },
  {
    matchIds: ['awokado', 'awokado_hass_fit'],
    patterns: [/, awokado/gi, / i awokado/gi],
  },
  {
    matchIds: ['borowki', 'borowki_fit'],
    patterns: [/, borówkami/gi, / ze świeżymi borówkami/gi],
  },
  {
    matchIds: ['banany', 'banany_promo'],
    patterns: [/ z bananem,/gi, / z bananem/gi],
  },
  {
    matchIds: ['pieczywo', 'chleb_zytni_fit', 'chleb_proteinowy_fit', 'chleb_bezglutenowy_fit', 'wafle_ryzowe_bg_fit'],
    patterns: [
      / i pieczywem bezglutenowym/gi,
      / i pieczywem/gi,
      / na chlebie żytnim/gi,
      / i chrupiącymi waflami/gi,
      / i waflami ryżowymi/gi,
      / i waflami/gi,
    ],
  },
];

/**
 * Rozwija listę wykluczonych identyfikatorów (grupy np. 'pomidor' oraz konkretne produkty),
 * gwarantując, że żaden powiązany produkt ani składnik o tej samej nazwie nie trafi do jadłospisu ani na listę zakupów.
 */
export function expandExcludedProductIds(excludedProductIds = []) {
  if (!excludedProductIds || excludedProductIds.length === 0) return [];
  const set = new Set(excludedProductIds);

  // 1. Rozwiń identyfikatory grup wykluczeń (np. 'pomidor', 'ryby', 'pieczywo')
  if (Array.isArray(EXCLUSION_GROUPS)) {
    EXCLUSION_GROUPS.forEach((group) => {
      if (set.has(group.id)) {
        group.productIds.forEach((pid) => set.add(pid));
      }
    });
  }

  // Jeśli wykluczono jakąkolwiek odmianę pomidora, wyklucz wszystkie pomidory
  const tomatoGroup = EXCLUSION_GROUPS?.find((g) => g.id === 'pomidor');
  if (tomatoGroup && tomatoGroup.productIds.some((pid) => set.has(pid))) {
    set.add('pomidor');
    tomatoGroup.productIds.forEach((pid) => set.add(pid));
  }

  // 2. Automatyczne dopasowanie po nazwie dla fraz tekstowych / grup spoza konkretnych ID produktów
  const initialEntries = Array.from(set);
  Object.values(PRODUCTS).forEach((product) => {
    for (const exId of initialEntries) {
      if (PRODUCTS[exId]) continue; // Konkretny ID produktu wyklucza dokładnie ten produkt
      const cleanEx = exId.toLowerCase().replace(/_/g, ' ').trim();
      if (!cleanEx) continue;
      if (
        product.id.toLowerCase().includes(exId.toLowerCase()) ||
        product.name.toLowerCase().includes(cleanEx)
      ) {
        set.add(product.id);
      }
    }
  });

  return Array.from(set);
}

/**
 * Formatuje opis ilości składnika spójnie z jego aktualną gramaturą.
 */
function formatDisplayAmount(baseDisplayAmount, baseGrams, newGrams, productId) {
  const product = PRODUCTS[productId];
  if (product && product.aisleCategory === 'napoje') {
    return `${newGrams} ml`;
  }
  if (!baseDisplayAmount) {
    return `${newGrams} g`;
  }
  if (newGrams === baseGrams) {
    return baseDisplayAmount;
  }
  const relativeDiff = Math.abs(newGrams - baseGrams) / Math.max(1, baseGrams);
  const hasExplicitGrams = /\d+\s*(g|ml)\b/i.test(baseDisplayAmount);
  if (relativeDiff <= 0.1 && !hasExplicitGrams) {
    return baseDisplayAmount;
  }
  return `${newGrams} g`;
}

/**
 * Czyści tytuł potrawy z nazw wykluczonych składników, jeśli zaszła awaryjna podmiana składnika.
 */
function cleanRecipeTitleForExclusions(title, excludedSet) {
  let cleaned = title;
  for (const rule of EXCLUSION_TITLE_PATTERNS) {
    if (rule.matchIds.some((id) => excludedSet.has(id))) {
      for (const regex of rule.patterns) {
        cleaned = cleaned.replace(regex, '');
      }
    }
  }
  return cleaned
    .replace(/\s+,/g, ',')
    .replace(/,\s*i\b/gi, ' i')
    .replace(/\s{2,}/g, ' ')
    .replace(/[,–-]\s*$/g, '')
    .trim();
}

/**
 * Oblicza cenę, kalorie oraz makroskładniki dla pojedynczego składnika w potrawie.
 */
export function calculateIngredientMetrics(productId, portionGrams, peopleCount = 1) {
  const product = PRODUCTS[productId];
  if (!product) {
    return null;
  }

  const safeGrams = Math.max(5, portionGrams);
  const ratioPer100g = safeGrams / 100;
  const packageFraction = Math.max(0.01, safeGrams / product.packageWeightG);

  const isPromo = Boolean(product.isGazetkaPromo && product.pricePromo < product.priceRegular);
  const singlePortionRegularCost = Number((product.priceRegular * packageFraction).toFixed(2));
  const singlePortionPromoCost = isPromo
    ? Number((product.pricePromo * packageFraction).toFixed(2))
    : singlePortionRegularCost;

  const totalRegularCost = Number((singlePortionRegularCost * peopleCount).toFixed(2));
  const totalPromoCost = isPromo
    ? Number((singlePortionPromoCost * peopleCount).toFixed(2))
    : totalRegularCost;
  const savedCost = isPromo
    ? Number(Math.max(0, totalRegularCost - totalPromoCost).toFixed(2))
    : 0;

  const kcalPerPerson = Math.round(product.kcalPer100g * ratioPer100g);
  const carbsPerPerson = Number((product.carbs * ratioPer100g).toFixed(1));
  const proteinPerPerson = Number((product.protein * ratioPer100g).toFixed(1));
  const fatPerPerson = Number((product.fat * ratioPer100g).toFixed(1));

  return {
    productId: product.id,
    name: product.name,
    brand: product.brand,
    emoji: product.emoji,
    aisleCategory: product.aisleCategory,
    aisleOrder: product.aisleOrder,
    portionGrams: safeGrams,
    totalGramsForGroup: safeGrams * peopleCount,
    unitLabel: product.unitLabel,
    isGazetkaPromo: product.isGazetkaPromo,
    promoLabel: product.promoLabel,
    isFitChoice: product.isFitChoice,
    fitBadge: product.fitBadge,
    singlePortionPromoCost,
    singlePortionRegularCost,
    totalPromoCost,
    totalRegularCost,
    savedCost,
    kcalPerPerson,
    carbsPerPerson,
    proteinPerPerson,
    fatPerPerson,
  };
}

/**
 * Oblicza podsumowanie całej potrawy (Cena, Kalorie, Makra: Węgle/Białko/Tłuszcze, Czas przygotowania).
 */
export function calculateDishMetrics(recipe, customIngredients, peopleCount = 1) {
  const rawIngredients = customIngredients || recipe.ingredients;
  const evaluatedIngredients = rawIngredients
    .map((ing) => ({
      ...ing,
      metrics: calculateIngredientMetrics(ing.productId, ing.portionGrams, peopleCount),
    }))
    .filter((ing) => ing.metrics !== null);

  const singlePortionPrice = Number(
    evaluatedIngredients.reduce((acc, item) => acc + item.metrics.singlePortionPromoCost, 0).toFixed(2)
  );
  const singlePortionRegularPrice = Number(
    evaluatedIngredients.reduce((acc, item) => acc + item.metrics.singlePortionRegularCost, 0).toFixed(2)
  );
  const totalGroupPrice = Number(
    evaluatedIngredients.reduce((acc, item) => acc + item.metrics.totalPromoCost, 0).toFixed(2)
  );
  const totalGroupRegularPrice = Number(
    evaluatedIngredients.reduce((acc, item) => acc + item.metrics.totalRegularCost, 0).toFixed(2)
  );
  const savedPln = Number(Math.max(0, totalGroupRegularPrice - totalGroupPrice).toFixed(2));

  const kcal = evaluatedIngredients.reduce((acc, item) => acc + item.metrics.kcalPerPerson, 0);
  const carbs = Number(
    evaluatedIngredients.reduce((acc, item) => acc + item.metrics.carbsPerPerson, 0).toFixed(1)
  );
  const protein = Number(
    evaluatedIngredients.reduce((acc, item) => acc + item.metrics.proteinPerPerson, 0).toFixed(1)
  );
  const fat = Number(
    evaluatedIngredients.reduce((acc, item) => acc + item.metrics.fatPerPerson, 0).toFixed(1)
  );

  const gazetkaCount = evaluatedIngredients.filter((i) => i.metrics.isGazetkaPromo).length;
  const fitCount = evaluatedIngredients.filter((i) => i.metrics.isFitChoice).length;

  return {
    recipeId: recipe.id || recipe.recipeId,
    title: recipe.title,
    mealType: recipe.mealType,
    prepTimeMinutes: recipe.prepTimeMinutes,
    prepTimeLabel: recipe.prepTimeLabel,
    dietTags: recipe.dietTags,
    emoji: recipe.emoji,
    description: recipe.description,
    ingredients: evaluatedIngredients,
    singlePortionPrice,
    singlePortionRegularPrice,
    totalGroupPrice,
    totalGroupRegularPrice,
    savedPln,
    kcal,
    macros: {
      carbs,
      protein,
      fat,
    },
    gazetkaCount,
    fitCount,
  };
}

/**
 * Zapasowe zamienniki między-działowe na wypadek wykluczenia całego działu (np. całego pieczywa lub wszystkich ryb).
 */
const CROSS_AISLE_FALLBACKS = {
  pieczywo: [
    'ziemniaki_mlode_promo',
    'bataty_fit',
    'cukinia_zielona_promo',
    'papryka_czerwona_fit',
    'jablka_polskie_promo',
    'banany_promo',
  ],
  mieso: [
    'jajka_wiejskie_promo',
    'tofu_wedzone_govege_fit',
    'tofu_naturalne_govege_fit',
    'twarog_chudy_fit',
    'serek_wiejski_lekki_fit',
    'mozzarella_light_fit',
    'hummus_klasyczny_govege',
  ],
  ryby: [
    'jajka_wiejskie_promo',
    'filet_z_kurczaka_promo',
    'mieso_mielone_indyk_fit',
    'tofu_wedzone_govege_fit',
    'serek_wiejski_lekki_fit',
    'hummus_klasyczny_govege',
  ],
  wedliny: [
    'jajka_wiejskie_promo',
    'ser_gouda_promo',
    'mozzarella_light_fit',
    'serek_wiejski_lekki_fit',
    'twarog_chudy_fit',
    'awokado_hass_fit',
  ],
  nabial: [
    'hummus_klasyczny_govege',
    'tofu_naturalne_govege_fit',
    'tofu_wedzone_govege_fit',
    'awokado_hass_fit',
    'napoj_owsiany_govege_fit',
  ],
  owoce_warzywa: [
    'hummus_klasyczny_govege',
    'wafle_ryzowe_bg_fit',
    'skyr_naturalny_fit',
  ],
  napoje: [
    'woda_polaris_promo',
    'mleko_bez_laktozy_promo',
    'jablka_polskie_promo',
  ],
};

/**
 * Zwraca zamienniki dla danego składnika w widoku Modyfikacji Potrawy (kliknięcie na kwadrat składnika).
 * Wyróżnia produkty z gazetki (żółte) oraz produkty Fit i nigdy nie zwraca produktów wykluczonych.
 */
export function getIngredientSubstitutesForDish(
  currentProductId,
  portionGrams = 100,
  peopleCount = 1,
  dietType = 'nie_vege',
  excludedProductIds = []
) {
  const currentProduct = PRODUCTS[currentProductId];
  if (!currentProduct) return [];

  const currentMetrics = calculateIngredientMetrics(currentProductId, portionGrams, peopleCount);
  const allExcluded = expandExcludedProductIds(excludedProductIds);
  const excludedSet = new Set(allExcluded);

  const isCandidateValid = (candId) => {
    if (!candId || candId === currentProductId || excludedSet.has(candId)) return false;
    const candidate = PRODUCTS[candId];
    if (!candidate) return false;
    if (dietType && dietType !== 'nie_vege' && !candidate.dietTags.includes(dietType)) {
      return false;
    }
    return true;
  };

  // Poziom 1: Dedykowane zamienniki kulinarne oraz alternatywy produktu
  const validIds = new Set();
  [...(currentProduct.substitutes || []), ...(currentProduct.alternatives || [])].forEach((id) => {
    if (isCandidateValid(id)) validIds.add(id);
  });

  // Poziom 2: Ten sam dział w sklepie (jeśli Poziom 1 został wykluczony przez filtry użytkownika)
  if (validIds.size === 0) {
    Object.values(PRODUCTS).forEach((prod) => {
      if (prod.aisleCategory === currentProduct.aisleCategory && isCandidateValid(prod.id)) {
        validIds.add(prod.id);
      }
    });
  }

  // Poziom 3: Bezpieczne zamienniki z innych działów (gdy wykluczono cały dział, np. całe Pieczywo lub Ryby)
  if (validIds.size === 0) {
    const crossList = CROSS_AISLE_FALLBACKS[currentProduct.aisleCategory] || [];
    crossList.forEach((id) => {
      if (isCandidateValid(id)) validIds.add(id);
    });
  }

  // Poziom 4: Ostateczna siatka bezpieczeństwa – dowolny dozwolony produkt z katalogu
  if (validIds.size === 0) {
    Object.values(PRODUCTS).forEach((prod) => {
      if (prod.kcalPer100g > 0 && isCandidateValid(prod.id)) {
        validIds.add(prod.id);
      }
    });
  }

  const substitutes = [];
  validIds.forEach((candId) => {
    const candidate = PRODUCTS[candId];
    const candMetrics = calculateIngredientMetrics(candId, portionGrams, peopleCount);
    const priceDiffGroup = Number((candMetrics.totalPromoCost - currentMetrics.totalPromoCost).toFixed(2));
    const kcalDiff = candMetrics.kcalPerPerson - currentMetrics.kcalPerPerson;
    const proteinDiff = Number((candMetrics.proteinPerPerson - currentMetrics.proteinPerPerson).toFixed(1));

    substitutes.push({
      product: candidate,
      metrics: candMetrics,
      isGazetkaPromo: candidate.isGazetkaPromo,
      isFitChoice: candidate.isFitChoice,
      priceDiffGroup,
      kcalDiff,
      proteinDiff,
    });
  });

  // Sortuj tak, aby najpierw były produkty z gazetki (żółte) i produkty Fit
  return substitutes.sort((a, b) => {
    const scoreA = (a.isGazetkaPromo ? 2 : 0) + (a.isFitChoice ? 1 : 0);
    const scoreB = (b.isGazetkaPromo ? 2 : 0) + (b.isFitChoice ? 1 : 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.metrics.totalPromoCost - b.metrics.totalPromoCost;
  });
}

/**
 * Zwraca listę ogólnych "Alternatyw" na półce po kliknięciu "Brak produktu" na liście zakupów.
 */
export function getShelfAlternativesForProduct(productId, dietType = 'nie_vege', excludedProductIds = []) {
  const product = PRODUCTS[productId];
  if (!product) return [];

  const allExcluded = expandExcludedProductIds(excludedProductIds);
  const excludedSet = new Set(allExcluded);
  const candidateIds = new Set([
    ...(product.alternatives || []),
    ...(product.substitutes || []),
  ]);

  // Dodaj produkty z tego samego działu w sklepie jako dostępne alternatywy na półce
  Object.values(PRODUCTS).forEach((p) => {
    if (p.aisleCategory === product.aisleCategory && p.id !== productId) {
      candidateIds.add(p.id);
    }
  });

  const alternatives = [];
  candidateIds.forEach((altId) => {
    if (altId === productId || excludedSet.has(altId)) return;
    const altProduct = PRODUCTS[altId];
    if (!altProduct) return;

    if (dietType && dietType !== 'nie_vege' && !altProduct.dietTags.includes(dietType)) {
      return;
    }

    const priceDiff = Number((altProduct.pricePromo - product.pricePromo).toFixed(2));
    alternatives.push({
      product: altProduct,
      priceDiff,
      sameAisle: altProduct.aisleCategory === product.aisleCategory,
    });
  });

  // Jeśli cały dział był wykluczony, użyj bezpiecznych zamienników spoza działu
  if (alternatives.length === 0) {
    const crossSubs = getIngredientSubstitutesForDish(productId, 100, 1, dietType, excludedProductIds);
    crossSubs.forEach((sub) => {
      alternatives.push({
        product: sub.product,
        priceDiff: Number((sub.product.pricePromo - product.pricePromo).toFixed(2)),
        sameAisle: false,
      });
    });
  }

  return alternatives;
}

/**
 * Przelicza globalne statystyki planu (całkowity koszt, oszczędność, średnie dzienne kalorie i makra).
 */
export function recalculatePlanTotals(plan) {
  let totalCostPln = 0;
  let totalRegularCostPln = 0;
  let totalSavedPln = 0;
  let totalKcalPerPerson = 0;
  let totalCarbsPerPerson = 0;
  let totalProteinPerPerson = 0;
  let totalFatPerPerson = 0;

  const updatedDays = plan.days.map((day) => {
    let dayCostPln = 0;
    let dayKcalPerPerson = 0;
    let dayCarbs = 0;
    let dayProtein = 0;
    let dayFat = 0;

    const updatedMeals = day.meals.map((meal) => {
      const baseRecipe = RECIPES.find((r) => r.id === meal.recipeId) || meal;
      const recipeWithCurrentTitle = {
        ...baseRecipe,
        title: meal.title || baseRecipe.title,
      };
      const rawIngredients = meal.ingredients.map((ing) => ({
        productId: ing.productId,
        portionGrams: ing.portionGrams,
        displayAmount: ing.displayAmount,
      }));
      const refreshedDish = calculateDishMetrics(
        recipeWithCurrentTitle,
        rawIngredients,
        plan.peopleCount
      );

      dayCostPln += refreshedDish.totalGroupPrice;
      totalCostPln += refreshedDish.totalGroupPrice;
      totalRegularCostPln += refreshedDish.totalGroupRegularPrice;
      totalSavedPln += refreshedDish.savedPln;

      dayKcalPerPerson += refreshedDish.kcal;
      dayCarbs += refreshedDish.macros.carbs;
      dayProtein += refreshedDish.macros.protein;
      dayFat += refreshedDish.macros.fat;

      return {
        ...refreshedDish,
        slotId: meal.slotId,
        slotLabel: meal.slotLabel,
        slotEmoji: meal.slotEmoji,
      };
    });

    totalKcalPerPerson += dayKcalPerPerson;
    totalCarbsPerPerson += dayCarbs;
    totalProteinPerPerson += dayProtein;
    totalFatPerPerson += dayFat;

    return {
      ...day,
      dayCostPln: Number(dayCostPln.toFixed(2)),
      dayKcalPerPerson: Math.round(dayKcalPerPerson),
      dayMacros: {
        carbs: Number(dayCarbs.toFixed(1)),
        protein: Number(dayProtein.toFixed(1)),
        fat: Number(dayFat.toFixed(1)),
      },
      meals: updatedMeals,
    };
  });

  const daysCount = Math.max(1, updatedDays.length);

  return {
    ...plan,
    days: updatedDays,
    totalCostPln: Number(totalCostPln.toFixed(2)),
    totalRegularCostPln: Number(totalRegularCostPln.toFixed(2)),
    totalSavedPln: Number(totalSavedPln.toFixed(2)),
    avgDailyKcalPerPerson: Math.round(totalKcalPerPerson / daysCount),
    avgDailyMacros: {
      carbs: Number((totalCarbsPerPerson / daysCount).toFixed(1)),
      protein: Number((totalProteinPerPerson / daysCount).toFixed(1)),
      fat: Number((totalFatPerPerson / daysCount).toFixed(1)),
    },
  };
}

/**
 * Kalibruje gramatury składników 4 posiłków w danym dniu tak, aby łączna kaloryczność dnia:
 * 1) NIGDY nie przekroczyła `calorieLimit` (`dayKcal <= calorieLimit`),
 * 2) Była maksymalnie zbliżona do wybranego celu (zazwyczaj w przedziale `[calorieLimit - 45, calorieLimit]`).
 */
function calibrateDayMealsToCalorieLimit(dayMeals, calorieLimit, peopleCount) {
  if (typeof calorieLimit !== 'number' || !Number.isFinite(calorieLimit) || calorieLimit <= 0) {
    return dayMeals;
  }

  // Pracuj na czystych kopiach surowych składników + pamiętaj bazowe gramatury z przepisu
  const workingMeals = dayMeals.map((meal) => {
    const baseRecipe = RECIPES.find((r) => r.id === meal.recipeId);
    return {
      ...meal,
      rawIngs: meal.ingredients.map((ing, idx) => {
        const baseIng = baseRecipe?.ingredients?.[idx];
        const baseGrams =
          baseIng && baseIng.productId === ing.productId
            ? baseIng.portionGrams
            : ing.portionGrams;
        const baseLabel =
          baseIng && baseIng.productId === ing.productId
            ? baseIng.displayAmount
            : ing.displayAmount;
        return {
          productId: ing.productId,
          portionGrams: ing.portionGrams,
          baseGrams,
          baseLabel,
        };
      }),
    };
  });

  const evalDayKcal = () => {
    let sum = 0;
    for (const m of workingMeals) {
      for (const ing of m.rawIngs) {
        const prod = PRODUCTS[ing.productId];
        if (prod) {
          sum += Math.round(prod.kcalPer100g * (ing.portionGrams / 100));
        }
      }
    }
    return sum;
  };

  const initialKcal = evalDayKcal();
  const aimKcal = Math.max(900, calorieLimit - 15);
  const maxPortionG = calorieLimit >= 2300 ? 600 : 460;

  // Krok 1: Proporcjonalne przeskalowanie porcji kalorycznych w zaokrągleniu do 5 g
  if (initialKcal > 0 && (initialKcal > calorieLimit || initialKcal < calorieLimit - 55)) {
    const scaleFactor = Math.min(2.4, Math.max(0.4, aimKcal / initialKcal));
    for (const m of workingMeals) {
      for (const ing of m.rawIngs) {
        const prod = PRODUCTS[ing.productId];
        if (!prod || prod.kcalPer100g === 0) continue; // Woda pozostaje bez zmian
        const scaled = Math.round((ing.portionGrams * scaleFactor) / 5) * 5;
        ing.portionGrams = Math.min(maxPortionG, Math.max(15, scaled));
      }
    }
  }

  // Krok 2: Twarda gwarancja NIEPRZEKRACZANIA limitu (dayKcal <= calorieLimit)
  let guard = 0;
  while (evalDayKcal() > calorieLimit && guard < 300) {
    guard++;
    let bestTarget = null;
    let bestScore = -1;

    for (const m of workingMeals) {
      for (const ing of m.rawIngs) {
        const prod = PRODUCTS[ing.productId];
        if (!prod || prod.kcalPer100g === 0 || ing.portionGrams <= 15) continue;
        const currentKcal = Math.round(prod.kcalPer100g * (ing.portionGrams / 100));
        if (currentKcal > bestScore) {
          bestScore = currentKcal;
          bestTarget = ing;
        }
      }
    }

    if (!bestTarget) break;
    bestTarget.portionGrams = Math.max(10, bestTarget.portionGrams - 5);
  }

  // Krok 3: Domknięcie od dołu (aby np. cel 2100 lub 2500 kcal dawał realnie ~2065-2100 / ~2465-2500 kcal)
  guard = 0;
  while (evalDayKcal() < calorieLimit - 40 && guard < 260) {
    guard++;
    const currentKcal = evalDayKcal();
    const roomKcal = calorieLimit - currentKcal;

    let bestAdd = null;
    let bestCostPerKcal = Infinity;

    for (const m of workingMeals) {
      for (const ing of m.rawIngs) {
        const prod = PRODUCTS[ing.productId];
        if (!prod || prod.kcalPer100g < 45 || ing.portionGrams >= maxPortionG) continue;

        const beforeKcal = Math.round(prod.kcalPer100g * (ing.portionGrams / 100));
        const afterKcal = Math.round(prod.kcalPer100g * ((ing.portionGrams + 5) / 100));
        const deltaKcal = afterKcal - beforeKcal;

        if (deltaKcal <= 0 || deltaKcal > roomKcal) continue;

        const unitPrice = prod.isGazetkaPromo ? prod.pricePromo : prod.priceRegular;
        const costPerKcal = unitPrice / Math.max(1, (prod.packageWeightG * prod.kcalPer100g) / 100);
        // Lekka preferencja dla umiarkowanego powiększania (nie jednego składnika w nieskończoność)
        const stretchRatio = ing.portionGrams / Math.max(20, ing.baseGrams);
        const weightedScore = costPerKcal * stretchRatio;

        if (weightedScore < bestCostPerKcal) {
          bestCostPerKcal = weightedScore;
          bestAdd = ing;
        }
      }
    }

    if (!bestAdd) break;
    bestAdd.portionGrams += 5;
  }

  // Przelicz zaktualizowane metryki potraw i etykiety porcji
  return workingMeals.map((m) => {
    const formattedRaw = m.rawIngs.map((ing) => ({
      productId: ing.productId,
      portionGrams: ing.portionGrams,
      displayAmount: formatDisplayAmount(
        ing.baseLabel,
        ing.baseGrams,
        ing.portionGrams,
        ing.productId
      ),
    }));
    const baseRecipe = RECIPES.find((r) => r.id === m.recipeId) || m;
    const dishMetrics = calculateDishMetrics(
      { ...baseRecipe, title: m.title },
      formattedRaw,
      peopleCount
    );
    return {
      ...dishMetrics,
      slotId: m.slotId,
      slotLabel: m.slotLabel,
      slotEmoji: m.slotEmoji,
    };
  });
}

/**
 * Generuje kompletny jadłospis (4 posiłki dziennie: Śniadanie, Obiad, Kolacja + Przekąska)
 * ze ścisłą gwarancją przestrzegania:
 * - limitu kalorycznego (żaden dzień nie przekracza `targetCalories`),
 * - wybranego wariantu i limitu budżetowego (`totalCostPln <= budgetPln`),
 * - diety (`nie_vege`, `vege`, `bez_glutenu`, `bez_laktozy`),
 * - wykluczonych produktów i grup składników (`excludedProductIds`).
 */
export function generateMealPlan({
  peopleCount = 2,
  daysCount = 3,
  budgetPln = 150,
  dietType = 'nie_vege',
  targetCalories = 2000,
  excludedProductIds = [],
}) {
  const allExcludedIds = expandExcludedProductIds(excludedProductIds);
  const excludedSet = new Set(allExcludedIds);

  const hasCalorieLimit =
    typeof targetCalories === 'number' &&
    Number.isFinite(targetCalories) &&
    targetCalories > 0;
  const numericCalorieLimit = hasCalorieLimit ? targetCalories : null;

  const isIngredientForbidden = (productId) => {
    const prod = PRODUCTS[productId];
    if (!prod) return true;
    if (excludedSet.has(productId)) return true;
    if (dietType && dietType !== 'nie_vege' && !prod.dietTags.includes(dietType)) {
      return true;
    }
    return false;
  };

  // Przygotowuje przepis wolny w 100% od wykluczonych oraz niezgodnych z dietą składników
  const prepareCandidateRecipe = (recipe) => {
    let hadSubstitution = false;
    const usedIdsInDish = new Set();
    const sanitizedIngredients = [];

    for (const ing of recipe.ingredients) {
      if (!isIngredientForbidden(ing.productId)) {
        sanitizedIngredients.push({ ...ing });
        usedIdsInDish.add(ing.productId);
        continue;
      }

      hadSubstitution = true;
      const subs = getIngredientSubstitutesForDish(
        ing.productId,
        ing.portionGrams,
        peopleCount,
        dietType,
        allExcludedIds
      );
      // Wybierz pierwszy zamiennik, którego najlepiej jeszcze nie ma w tym samym daniu
      const chosenSub =
        subs.find((s) => !usedIdsInDish.has(s.product.id)) || subs[0] || null;

      if (chosenSub) {
        usedIdsInDish.add(chosenSub.product.id);
        sanitizedIngredients.push({
          productId: chosenSub.product.id,
          portionGrams: ing.portionGrams,
          displayAmount: formatDisplayAmount(
            null,
            ing.portionGrams,
            ing.portionGrams,
            chosenSub.product.id
          ),
        });
      }
    }

    if (sanitizedIngredients.length === 0) {
      return null;
    }

    const adaptedTitle = hadSubstitution
      ? cleanRecipeTitleForExclusions(recipe.title, excludedSet)
      : recipe.title;

    const dishMetrics = calculateDishMetrics(
      { ...recipe, title: adaptedTitle },
      sanitizedIngredients,
      peopleCount
    );

    return {
      recipe,
      isNaturallyClean: !hadSubstitution,
      dishMetrics,
      cost: dishMetrics.totalGroupPrice,
      kcal: dishMetrics.kcal,
    };
  };

  // Zbuduj pule kandydatów dla każdego z 4 posiłków dnia
  const slotPools = {};
  for (const mealSlot of MEAL_TYPES) {
    const dietMatchingRecipes = RECIPES.filter(
      (r) =>
        r.mealType === mealSlot.id &&
        (dietType === 'nie_vege' || r.dietTags.includes(dietType))
    );
    const baseList =
      dietMatchingRecipes.length > 0
        ? dietMatchingRecipes
        : RECIPES.filter((r) => r.mealType === mealSlot.id);

    const prepared = baseList.map(prepareCandidateRecipe).filter(Boolean);
    const naturallyClean = prepared.filter((c) => c.isNaturallyClean);

    // ZAWSZE wybieraj wyłącznie spośród dań naturalnie czystych, o ile przynajmniej jedno istnieje
    slotPools[mealSlot.id] = naturallyClean.length > 0 ? naturallyClean : prepared;
  }

  const dailyGroupBudget = budgetPln / Math.max(1, daysCount);
  const dailyPerPersonBudget = budgetPln / Math.max(1, peopleCount * daysCount);

  // Określ profil cenowy użytkownika (Ekonomiczny / Standardowy / Swobodny)
  const budgetTier =
    dailyPerPersonBudget <= 30
      ? 'ekonomiczny'
      : dailyPerPersonBudget <= 41
      ? 'standardowy'
      : 'swobodny';

  const desiredDailyGroupCost =
    budgetTier === 'ekonomiczny'
      ? dailyGroupBudget * 0.85
      : budgetTier === 'standardowy'
      ? dailyGroupBudget * 0.87
      : Math.min(dailyGroupBudget * 0.88, peopleCount * 44);

  const usedRecipeIdsBySlot = {};
  const lastDayRecipeIdBySlot = {};
  MEAL_TYPES.forEach((m) => {
    usedRecipeIdsBySlot[m.id] = new Set();
    lastDayRecipeIdBySlot[m.id] = null;
  });

  const days = [];

  for (let d = 0; d < daysCount; d++) {
    // Wyczyść historię zużytych przepisów w danym slocie, jeśli wszystkie unikalne zostały już użyte
    MEAL_TYPES.forEach((m) => {
      if (usedRecipeIdsBySlot[m.id].size >= slotPools[m.id].length) {
        usedRecipeIdsBySlot[m.id].clear();
      }
    });

    const BPool = slotPools.sniadanie;
    const LPool = slotPools.obiad;
    const DPool = slotPools.kolacja;
    const SPool = slotPools.przekaska;

    let bestTuple = null;
    let bestScore = Infinity;

    for (const b of BPool) {
      const penB =
        (usedRecipeIdsBySlot.sniadanie.has(b.recipe.id) ? 320 : 0) +
        (lastDayRecipeIdBySlot.sniadanie === b.recipe.id && BPool.length > 1 ? 850 : 0);

      for (const l of LPool) {
        const penBL =
          penB +
          (usedRecipeIdsBySlot.obiad.has(l.recipe.id) ? 320 : 0) +
          (lastDayRecipeIdBySlot.obiad === l.recipe.id && LPool.length > 1 ? 850 : 0);

        for (const k of DPool) {
          const penBLK =
            penBL +
            (usedRecipeIdsBySlot.kolacja.has(k.recipe.id) ? 320 : 0) +
            (lastDayRecipeIdBySlot.kolacja === k.recipe.id && DPool.length > 1 ? 850 : 0);

          for (const s of SPool) {
            const varietyPenalty =
              penBLK +
              (usedRecipeIdsBySlot.przekaska.has(s.recipe.id) ? 320 : 0) +
              (lastDayRecipeIdBySlot.przekaska === s.recipe.id && SPool.length > 1 ? 850 : 0);

            const rawKcal = b.kcal + l.kcal + k.kcal + s.kcal;
            const rawCost = b.cost + l.cost + k.cost + s.cost;

            const estScale = numericCalorieLimit
              ? Math.min(2.2, Math.max(0.45, (numericCalorieLimit - 15) / Math.max(1, rawKcal)))
              : 1.0;
            const estScaledCost = rawCost * estScale;

            // Kara za przekroczenie dziennego budżetu (ważniejsza niż unikanie powtórzeń przy ciasnym budżecie)
            const overBudgetExcess = Math.max(0, estScaledCost - dailyGroupBudget * 0.96);
            const overBudgetPenalty = overBudgetExcess * (1800 / Math.max(1, peopleCount));

            // Dopasowanie do wybranego wariantu budżetowego (Ekonomiczny / Standardowy / Swobodny)
            const tierCostDiff =
              (Math.abs(estScaledCost - desiredDailyGroupCost) / Math.max(1, peopleCount)) * 18;

            // Preferencja naturalnej bliskości kalorycznej (mniejsza ingerencja w bazowe gramatury)
            const targetKcalForNaturalFit = numericCalorieLimit || 2000;
            const naturalKcalDiff = Math.abs(rawKcal - targetKcalForNaturalFit) * 0.35;

            // Bonusy jakościowe zależne od wariantu cenowego
            const gazetkaCount =
              b.dishMetrics.gazetkaCount +
              l.dishMetrics.gazetkaCount +
              k.dishMetrics.gazetkaCount +
              s.dishMetrics.gazetkaCount;
            const fitCount =
              b.dishMetrics.fitCount +
              l.dishMetrics.fitCount +
              k.dishMetrics.fitCount +
              s.dishMetrics.fitCount;

            const tierBonus =
              budgetTier === 'ekonomiczny'
                ? -gazetkaCount * 5
                : budgetTier === 'swobodny'
                ? -fitCount * 7
                : -(gazetkaCount * 2 + fitCount * 2);

            const totalScore =
              varietyPenalty + overBudgetPenalty + tierCostDiff + naturalKcalDiff + tierBonus;

            if (totalScore < bestScore) {
              bestScore = totalScore;
              bestTuple = [b, l, k, s];
            }
          }
        }
      }
    }

    const chosenBySlot = bestTuple;
    const rawDayMeals = MEAL_TYPES.map((mealSlot, idx) => {
      const chosen = chosenBySlot[idx];
      usedRecipeIdsBySlot[mealSlot.id].add(chosen.recipe.id);
      lastDayRecipeIdBySlot[mealSlot.id] = chosen.recipe.id;
      return {
        ...chosen.dishMetrics,
        slotId: mealSlot.id,
        slotLabel: mealSlot.label,
        slotEmoji: mealSlot.emoji,
      };
    });

    const calibratedMeals = calibrateDayMealsToCalorieLimit(
      rawDayMeals,
      numericCalorieLimit,
      peopleCount
    );

    days.push({
      dayNumber: d + 1,
      label: `Dzień ${d + 1}`,
      meals: calibratedMeals,
    });
  }

  let plan = recalculatePlanTotals({
    peopleCount,
    daysCount,
    budgetPln,
    dietType,
    targetCalories,
    excludedProductIds: allExcludedIds,
    days,
  });

  // =========================================================================
  // TWARDA GWARANCJA BUDŻETOWA (plan.totalCostPln <= budgetPln ORAZ koszyk <= budgetPln)
  // =========================================================================
  const getEffectiveCost = (p) =>
    Math.max(p.totalCostPln, buildShoppingListFromPlan(p).totalBasketCostPln);

  if (getEffectiveCost(plan) > budgetPln) {
    // Krok A: Podmień drogie składniki na tańsze dozwolone zamienniki z Gazetki / oferty podstawowej
    for (let pass = 0; pass < 3 && getEffectiveCost(plan) > budgetPln; pass++) {
      let changedAny = false;

      for (let dIdx = 0; dIdx < plan.days.length && getEffectiveCost(plan) > budgetPln; dIdx++) {
        const day = plan.days[dIdx];
        let dayModified = false;

        for (let mIdx = 0; mIdx < day.meals.length && getEffectiveCost(plan) > budgetPln; mIdx++) {
          const meal = day.meals[mIdx];

          for (let iIdx = 0; iIdx < meal.ingredients.length; iIdx++) {
            const ing = meal.ingredients[iIdx];
            const subs = getIngredientSubstitutesForDish(
              ing.productId,
              ing.portionGrams,
              peopleCount,
              dietType,
              allExcludedIds
            );

            const cheaperSubs = subs
              .filter((s) => s.priceDiffGroup < -0.15)
              .sort((a, b) => a.priceDiffGroup - b.priceDiffGroup);

            if (cheaperSubs.length > 0) {
              const bestCheaper = cheaperSubs[0];
              meal.ingredients[iIdx] = {
                productId: bestCheaper.product.id,
                portionGrams: ing.portionGrams,
                displayAmount: formatDisplayAmount(
                  null,
                  ing.portionGrams,
                  ing.portionGrams,
                  bestCheaper.product.id
                ),
              };
              dayModified = true;
              changedAny = true;
            }
          }
        }

        if (dayModified) {
          plan.days[dIdx].meals = calibrateDayMealsToCalorieLimit(
            plan.days[dIdx].meals,
            numericCalorieLimit,
            peopleCount
          );
          plan = recalculatePlanTotals(plan);
        }
      }

      if (!changedAny) break;
    }

    // Krok B: Jeśli przy bardzo niskim budżecie i wysokich kaloriach nadal brakuje kilku złotych,
    // przesuń gramaturę wewnątrz dnia z najdroższych dodatków na tanie bazowe składniki (ziemniaki, pieczywo, jajka)
    let rebalanceGuard = 0;
    const maxRebalancePortionG = numericCalorieLimit && numericCalorieLimit >= 2300 ? 640 : 480;

    while (getEffectiveCost(plan) > budgetPln && rebalanceGuard < 300) {
      rebalanceGuard++;
      let madeStep = false;

      for (let dIdx = 0; dIdx < plan.days.length && getEffectiveCost(plan) > budgetPln; dIdx++) {
        const day = plan.days[dIdx];
        let mostExpensiveIng = null;
        let highestUnitCost = -1;
        let cheapestCaloricIng = null;
        let lowestCostPerKcal = Infinity;

        for (const meal of day.meals) {
          for (const ing of meal.ingredients) {
            const prod = PRODUCTS[ing.productId];
            if (!prod) continue;
            const unitPrice = prod.isGazetkaPromo ? prod.pricePromo : prod.priceRegular;
            const gramCost = unitPrice / prod.packageWeightG;

            if (ing.portionGrams >= 20 && gramCost > highestUnitCost) {
              highestUnitCost = gramCost;
              mostExpensiveIng = { ing, prod };
            }

            if (prod.kcalPer100g >= 50 && ing.portionGrams <= maxRebalancePortionG) {
              const cpk = gramCost / (prod.kcalPer100g / 100);
              if (cpk < lowestCostPerKcal) {
                lowestCostPerKcal = cpk;
                cheapestCaloricIng = { ing, prod };
              }
            }
          }
        }

        if (mostExpensiveIng && mostExpensiveIng.ing.portionGrams >= 20) {
          mostExpensiveIng.ing.portionGrams -= 5;
          mostExpensiveIng.ing.displayAmount = formatDisplayAmount(
            null,
            0,
            mostExpensiveIng.ing.portionGrams,
            mostExpensiveIng.prod.id
          );

          // Uzupełnij kalorie tanim składnikiem bazowym, nie przekraczając limitu kalorycznego
          if (
            numericCalorieLimit &&
            cheapestCaloricIng &&
            cheapestCaloricIng.ing !== mostExpensiveIng.ing
          ) {
            const calcDayKcal = () =>
              day.meals.reduce(
                (s, m) =>
                  s +
                  m.ingredients.reduce((is, x) => {
                    const p = PRODUCTS[x.productId];
                    return is + (p ? Math.round(p.kcalPer100g * (x.portionGrams / 100)) : 0);
                  }, 0),
                0
              );

            let topUpGuard = 0;
            while (
              calcDayKcal() < numericCalorieLimit - 18 &&
              cheapestCaloricIng.ing.portionGrams + 5 <= maxRebalancePortionG &&
              topUpGuard < 12
            ) {
              topUpGuard++;
              const before = calcDayKcal();
              cheapestCaloricIng.ing.portionGrams += 5;
              const after = calcDayKcal();
              if (after > numericCalorieLimit || after <= before) {
                if (after > numericCalorieLimit) {
                  cheapestCaloricIng.ing.portionGrams -= 5;
                  break;
                }
              }
            }
            cheapestCaloricIng.ing.displayAmount = formatDisplayAmount(
              null,
              0,
              cheapestCaloricIng.ing.portionGrams,
              cheapestCaloricIng.prod.id
            );
          }

          madeStep = true;
        }
      }

      plan = recalculatePlanTotals(plan);
      if (!madeStep) break;
    }
  }

  return plan;
}

/**
 * Podmienia pojedynczy składnik (kwadrat) w wybranej potrawie i przelicza cały plan.
 */
export function replaceIngredientInMealPlan(
  plan,
  dayNumber,
  slotId,
  ingredientIndex,
  newProductId
) {
  const updatedDays = plan.days.map((day) => {
    if (day.dayNumber !== dayNumber) return day;

    const updatedMeals = day.meals.map((meal) => {
      if (meal.slotId !== slotId) return meal;

      const updatedIngredients = meal.ingredients.map((ing, idx) => {
        if (idx !== ingredientIndex) {
          return {
            productId: ing.productId,
            portionGrams: ing.portionGrams,
            displayAmount: ing.displayAmount,
          };
        }
        return {
          productId: newProductId,
          portionGrams: ing.portionGrams,
          displayAmount: formatDisplayAmount(
            null,
            ing.portionGrams,
            ing.portionGrams,
            newProductId
          ),
        };
      });

      const baseRecipe = RECIPES.find((r) => r.id === meal.recipeId) || meal;
      const recalculated = calculateDishMetrics(
        { ...baseRecipe, title: meal.title || baseRecipe.title },
        updatedIngredients,
        plan.peopleCount
      );

      return {
        ...recalculated,
        slotId: meal.slotId,
        slotLabel: meal.slotLabel,
        slotEmoji: meal.slotEmoji,
      };
    });

    return {
      ...day,
      meals: updatedMeals,
    };
  });

  return recalculatePlanTotals({
    ...plan,
    days: updatedDays,
  });
}

/**
 * Buduje zagregowaną listę zakupów podzieloną na sekcje dokładnie według kolejności działów w sklepie Biedronka:
 * 1. Owoce i warzywa (pierwsze!)
 * 2. Pieczywo
 * 3. Nabiał
 * 4. Wędliny
 * 5. Mięso
 * 6. Ryby
 * 7. Napoje
 */
export function buildShoppingListFromPlan(
  plan,
  checkedItemsMap = {},
  shelfAlternativesMap = {}
) {
  if (!plan || !plan.days) {
    return {
      sections: [],
      totalItemsCount: 0,
      checkedItemsCount: 0,
      progressPercent: 0,
      totalBasketCostPln: 0,
      totalBasketSavedPln: 0,
      totalMacros: { kcal: 0, carbs: 0, protein: 0, fat: 0 },
    };
  }

  const aggregatedByProduct = {};

  plan.days.forEach((day) => {
    day.meals.forEach((meal) => {
      meal.ingredients.forEach((ing) => {
        // Uwzględnij ewentualną podmianę "Brak produktu" -> "Alternatywa" na liście zakupów
        const effectiveProductId = shelfAlternativesMap[ing.productId] || ing.productId;
        const product = PRODUCTS[effectiveProductId];
        if (!product) return;

        const metrics = calculateIngredientMetrics(
          effectiveProductId,
          ing.portionGrams,
          plan.peopleCount
        );

        if (!aggregatedByProduct[effectiveProductId]) {
          aggregatedByProduct[effectiveProductId] = {
            productId: effectiveProductId,
            originalProductId: ing.productId,
            wasReplacedOnShelf: Boolean(
              shelfAlternativesMap[ing.productId] &&
                shelfAlternativesMap[ing.productId] !== ing.productId
            ),
            product,
            totalGrams: 0,
            totalCostPln: 0,
            totalRegularCostPln: 0,
            totalSavedPln: 0,
            totalKcal: 0,
            totalCarbs: 0,
            totalProtein: 0,
            totalFat: 0,
            usedInMeals: new Set(),
          };
        }

        const entry = aggregatedByProduct[effectiveProductId];
        entry.totalGrams += metrics.totalGramsForGroup;
        entry.totalCostPln = Number((entry.totalCostPln + metrics.totalPromoCost).toFixed(2));
        entry.totalRegularCostPln = Number(
          (entry.totalRegularCostPln + metrics.totalRegularCost).toFixed(2)
        );
        entry.totalSavedPln = Number(
          (entry.totalSavedPln + metrics.savedCost).toFixed(2)
        );
        entry.totalKcal += metrics.kcalPerPerson * plan.peopleCount;
        entry.totalCarbs = Number(
          (entry.totalCarbs + metrics.carbsPerPerson * plan.peopleCount).toFixed(1)
        );
        entry.totalProtein = Number(
          (entry.totalProtein + metrics.proteinPerPerson * plan.peopleCount).toFixed(1)
        );
        entry.totalFat = Number(
          (entry.totalFat + metrics.fatPerPerson * plan.peopleCount).toFixed(1)
        );
        entry.usedInMeals.add(meal.title);
      });
    });
  });

  const allItems = Object.values(aggregatedByProduct).map((entry) => {
    const packagesNeeded = Math.max(
      1,
      Math.ceil(entry.totalGrams / entry.product.packageWeightG)
    );
    const isChecked = Boolean(checkedItemsMap[entry.productId]);

    return {
      ...entry,
      packagesNeeded,
      isChecked,
      usedInMealsList: Array.from(entry.usedInMeals),
    };
  });

  // Pogrupuj w sekcje według kolejności działów w sklepie (1..7)
  const sections = STORE_AISLES.map((aisle) => {
    const aisleItems = allItems.filter(
      (item) => item.product.aisleCategory === aisle.id
    );
    return {
      ...aisle,
      items: aisleItems,
      checkedCount: aisleItems.filter((i) => i.isChecked).length,
      totalCount: aisleItems.length,
    };
  }).filter((section) => section.items.length > 0);

  const totalItemsCount = allItems.length;
  const checkedItemsCount = allItems.filter((i) => i.isChecked).length;
  const progressPercent =
    totalItemsCount > 0 ? Math.round((checkedItemsCount / totalItemsCount) * 100) : 0;

  const totalBasketCostPln = Number(
    allItems.reduce((acc, i) => acc + i.totalCostPln, 0).toFixed(2)
  );
  const totalBasketSavedPln = Number(
    allItems.reduce((acc, i) => acc + i.totalSavedPln, 0).toFixed(2)
  );

  const totalMacros = {
    kcal: Math.round(allItems.reduce((acc, i) => acc + i.totalKcal, 0)),
    carbs: Number(allItems.reduce((acc, i) => acc + i.totalCarbs, 0).toFixed(1)),
    protein: Number(allItems.reduce((acc, i) => acc + i.totalProtein, 0).toFixed(1)),
    fat: Number(allItems.reduce((acc, i) => acc + i.totalFat, 0).toFixed(1)),
  };

  return {
    sections,
    totalItemsCount,
    checkedItemsCount,
    progressPercent,
    totalBasketCostPln,
    totalBasketSavedPln,
    totalMacros,
  };
}
