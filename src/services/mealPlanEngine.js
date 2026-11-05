import { PRODUCTS, RECIPES, STORE_AISLES, MEAL_TYPES, EXCLUSION_GROUPS } from '../data/biedronkaCatalog.js';

/**
 * Rozwija listę wykluczonych identyfikatorów (grupy np. 'pomidor' oraz konkretne produkty),
 * gwarantując, że żaden powiązany produkt ani składnik o tej samej nazwie nie trafi do jadłospisu ani na listę zakupów.
 */
export function expandExcludedProductIds(excludedProductIds = []) {
  if (!excludedProductIds || excludedProductIds.length === 0) return [];
  const set = new Set(excludedProductIds);

  // 1. Rozwiń identyfikatory grup wykluczeń (np. 'pomidor' -> wszystkie odmiany pomidorów z gazetki i oferty)
  if (Array.isArray(EXCLUSION_GROUPS)) {
    EXCLUSION_GROUPS.forEach((group) => {
      if (set.has(group.id) || group.productIds.some((pid) => set.has(pid))) {
        set.add(group.id);
        group.productIds.forEach((pid) => set.add(pid));
      }
    });
  }

  // 2. Automatyczne dopasowanie po nazwie i identyfikatorze w katalogu PRODUCTS
  Object.values(PRODUCTS).forEach((product) => {
    for (const exId of Array.from(set)) {
      const cleanEx = exId.toLowerCase().replace(/_/g, ' ');
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
 * Oblicza cenę, kalorie oraz makroskładniki dla pojedynczego składnika w potrawie.
 */
export function calculateIngredientMetrics(productId, portionGrams, peopleCount = 1) {
  const product = PRODUCTS[productId];
  if (!product) {
    return null;
  }

  const ratioPer100g = portionGrams / 100;
  const packageFraction = Math.max(0.15, portionGrams / product.packageWeightG);

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
    portionGrams,
    totalGramsForGroup: portionGrams * peopleCount,
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
    recipeId: recipe.id,
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
 * Zwraca zamienniki dla danego składnika w widoku Modyfikacji Potrawy (kliknięcie na kwadrat składnika).
 * Wyróżnia produkty z gazetki (żółte) oraz produkty Fit.
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

  // Zbierz dedykowane zamienniki kulinarne oraz alternatywy
  const candidateIds = new Set([
    ...(currentProduct.substitutes || []),
    ...(currentProduct.alternatives || []),
  ]);

  // Tylko w sytuacji awaryjnej (gdy produkt nie ma zdefiniowanych zamienników), sięgaj do tego samego działu
  if (candidateIds.size === 0) {
    Object.values(PRODUCTS).forEach((prod) => {
      if (prod.aisleCategory === currentProduct.aisleCategory && prod.id !== currentProductId) {
        candidateIds.add(prod.id);
      }
    });
  }

  const substitutes = [];
  candidateIds.forEach((candId) => {
    if (candId === currentProductId || excludedSet.has(candId)) return;
    const candidate = PRODUCTS[candId];
    if (!candidate) return;

    // Sprawdź zgodność z dietą
    if (dietType && dietType !== 'nie_vege' && !candidate.dietTags.includes(dietType)) {
      return;
    }

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
      const rawIngredients = meal.ingredients.map((ing) => ({
        productId: ing.productId,
        portionGrams: ing.portionGrams,
        displayAmount: ing.displayAmount,
      }));
      const refreshedDish = calculateDishMetrics(baseRecipe, rawIngredients, plan.peopleCount);

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
 * Generuje kompletny jadłospis (4 posiłki dziennie: Śniadanie, Obiad, Kolacja + Przekąska)
 * dopasowany do liczby osób, liczby dni, budżetu, diety i wykluczonych produktów.
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

  const recipeHasExcludedIngredient = (recipe) => {
    return recipe.ingredients.some((ing) => excludedSet.has(ing.productId));
  };

  // Pomocnicza funkcja podmieniająca wykluczone składniki w przepisie
  const sanitizeRecipeIngredients = (recipe) => {
    return recipe.ingredients.map((ing) => {
      const prod = PRODUCTS[ing.productId];
      const isExcluded = excludedSet.has(ing.productId);
      const isDietIncompatible =
        dietType !== 'nie_vege' && prod && !prod.dietTags.includes(dietType);

      if (!isExcluded && !isDietIncompatible) {
        return { ...ing };
      }

      // Znajdź bezpieczny zamiennik
      const subs = getIngredientSubstitutesForDish(
        ing.productId,
        ing.portionGrams,
        peopleCount,
        dietType,
        allExcludedIds
      );
      if (subs.length > 0) {
        return {
          ...ing,
          productId: subs[0].product.id,
        };
      }
      return { ...ing };
    });
  };

  const days = [];
  const usedRecipeIdsBySlot = {};
  MEAL_TYPES.forEach((m) => {
    usedRecipeIdsBySlot[m.id] = new Set();
  });

  for (let d = 0; d < daysCount; d++) {
    const dayMeals = MEAL_TYPES.map((mealSlot) => {
      // Filtruj przepisy dla danego posiłku i diety
      let matchingRecipes = RECIPES.filter(
        (r) =>
          r.mealType === mealSlot.id &&
          (dietType === 'nie_vege' || r.dietTags.includes(dietType))
      );

      if (matchingRecipes.length === 0) {
        matchingRecipes = RECIPES.filter((r) => r.mealType === mealSlot.id);
      }

      // ZAWSZE preferuj przepisy w 100% wolne od wykluczonych składników
      const cleanRecipes = matchingRecipes.filter(
        (r) => !recipeHasExcludedIngredient(r)
      );

      const pool = cleanRecipes.length > 0 ? cleanRecipes : matchingRecipes;

      const dailyBudget = budgetPln / Math.max(1, daysCount);
      const slotBudgetRatios = {
        sniadanie: 0.25,
        obiad: 0.38,
        kolacja: 0.23,
        przekaska: 0.14,
      };
      const slotBudget = dailyBudget * (slotBudgetRatios[mealSlot.id] || 0.25);
      const slotTargetKcal =
        typeof targetCalories === 'number' && targetCalories > 0
          ? targetCalories * (slotBudgetRatios[mealSlot.id] || 0.25)
          : null;

      // Oceń kandydatów pod kątem budżetu posiłku i celu kalorycznego
      const evaluatedCandidates = pool.map((candidateRecipe) => {
        const sanitized = sanitizeRecipeIngredients(candidateRecipe);
        let forMetrics = candidateRecipe;
        if (recipeHasExcludedIngredient(candidateRecipe)) {
          let cleanTitle = candidateRecipe.title
            .replace(/ z pomidorami.*?(i\b|$)/gi, ' $1')
            .replace(/ z pomidorkami.*?(i\b|$)/gi, ' $1')
            .replace(/ i pomidorami.*?(i\b|$)/gi, ' $1')
            .replace(/ i pomidorkami.*?(i\b|$)/gi, ' $1')
            .replace(/, pomidorkami/gi, '')
            .replace(/, pomidorami/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
          forMetrics = { ...candidateRecipe, title: cleanTitle };
        }
        const metrics = calculateDishMetrics(forMetrics, sanitized, peopleCount);
        return {
          recipe: candidateRecipe,
          dishMetrics: metrics,
          cost: metrics.totalGroupPrice,
          kcal: metrics.kcal,
        };
      });

      // Sortuj: priorytet mają dania mieszczące się w budżecie danego slotu (z zapasem elastyczności)
      evaluatedCandidates.sort((a, b) => {
        const fitsA = a.cost <= slotBudget * 1.25;
        const fitsB = b.cost <= slotBudget * 1.25;
        if (fitsA && !fitsB) return -1;
        if (!fitsA && fitsB) return 1;

        if (fitsA && fitsB) {
          if (slotTargetKcal !== null) {
            return Math.abs(a.kcal - slotTargetKcal) - Math.abs(b.kcal - slotTargetKcal);
          }
          return a.cost - b.cost;
        }

        // Gdy żaden nie mieści się w budżecie: wybierz najtańsze
        return a.cost - b.cost;
      });

      // Zadbaj o pełną różnorodność: wybierz danie, które jeszcze nie wystąpiło w poprzednich dniach
      const usedSet = usedRecipeIdsBySlot[mealSlot.id];
      let unusedCandidates = evaluatedCandidates.filter((c) => !usedSet.has(c.recipe.id));
      if (unusedCandidates.length === 0) {
        usedSet.clear();
        unusedCandidates = evaluatedCandidates;
      }

      const chosen = unusedCandidates[0] || evaluatedCandidates[d % evaluatedCandidates.length];
      usedSet.add(chosen.recipe.id);

      return {
        ...chosen.dishMetrics,
        slotId: mealSlot.id,
        slotLabel: mealSlot.label,
        slotEmoji: mealSlot.emoji,
      };
    });

    days.push({
      dayNumber: d + 1,
      label: `Dzień ${d + 1}`,
      meals: dayMeals,
    });
  }

  // Gwarancja braku przekroczenia budżetu: jeśli łączny koszt przewyższa limit, podmień najdroższe dania na tańsze (zachowując różnorodność)
  let currentTotalCost = days.reduce(
    (sum, day) => sum + day.meals.reduce((mSum, m) => mSum + m.totalGroupPrice, 0),
    0
  );

  if (currentTotalCost > budgetPln) {
    for (let day of days) {
      for (let mIdx = 0; mIdx < day.meals.length; mIdx++) {
        if (currentTotalCost <= budgetPln) break;
        const currentMeal = day.meals[mIdx];
        const slot = currentMeal.slotId;
        const otherDaysRecipeIds = new Set(
          days
            .filter((otherD) => otherD.dayNumber !== day.dayNumber)
            .map((otherD) => otherD.meals[mIdx]?.recipeId)
        );

        const matchingClean = RECIPES.filter(
          (r) =>
            r.mealType === slot &&
            (dietType === 'nie_vege' || r.dietTags.includes(dietType)) &&
            !recipeHasExcludedIngredient(r)
        );

        const cheaperOptions = matchingClean
          .map((r) => {
            const san = sanitizeRecipeIngredients(r);
            return calculateDishMetrics(r, san, peopleCount);
          })
          .filter((opt) => opt.totalGroupPrice < currentMeal.totalGroupPrice)
          .sort((a, b) => {
            const aUnused = !otherDaysRecipeIds.has(a.recipeId);
            const bUnused = !otherDaysRecipeIds.has(b.recipeId);
            if (aUnused && !bUnused) return -1;
            if (!aUnused && bUnused) return 1;
            return a.totalGroupPrice - b.totalGroupPrice;
          });

        if (cheaperOptions.length > 0) {
          const replacement = cheaperOptions[0];
          currentTotalCost -= currentMeal.totalGroupPrice - replacement.totalGroupPrice;
          day.meals[mIdx] = {
            ...replacement,
            slotId: currentMeal.slotId,
            slotLabel: currentMeal.slotLabel,
            slotEmoji: currentMeal.slotEmoji,
          };
        }
      }
    }
  }

  let initialPlan = recalculatePlanTotals({
    peopleCount,
    daysCount,
    budgetPln,
    dietType,
    targetCalories,
    excludedProductIds: allExcludedIds,
    days,
  });

  return initialPlan;
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
          displayAmount: ing.displayAmount,
        };
      });

      const baseRecipe = RECIPES.find((r) => r.id === meal.recipeId) || meal;
      const recalculated = calculateDishMetrics(
        baseRecipe,
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

  // Pogrupuj w sekcje według kolejności działów w sklepie (1..8)
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

