import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import {
  generateMealPlan,
  replaceIngredientInMealPlan,
  buildShoppingListFromPlan,
  getIngredientSubstitutesForDish,
  getShelfAlternativesForProduct,
} from '../services/mealPlanEngine';

describe('Silnik Jadłospisu i Listy Zakupów Moja Biedronka', () => {
  it('generuje 4 posiłki dziennie (Śniadanie, Obiad, Kolacja, Przekąska) zgodnie z parametrami ankiety', () => {
    const plan = generateMealPlan({
      peopleCount: 2,
      daysCount: 3,
      budgetPln: 160,
      dietType: 'vege',
      excludedProductIds: ['pieczarki_swieze'],
    });

    expect(plan.days).toHaveLength(3);
    plan.days.forEach((day) => {
      expect(day.meals).toHaveLength(4);
      const slotIds = day.meals.map((m) => m.slotId);
      expect(slotIds).toEqual(['sniadanie', 'obiad', 'kolacja', 'przekaska']);

      // Żaden posiłek nie powinien zawierać wykluczonych pieczarek
      day.meals.forEach((meal) => {
        const productIds = meal.ingredients.map((i) => i.productId);
        expect(productIds).not.toContain('pieczarki_swieze');
      });
    });
  });

  it('skutecznie wyklucza pomidory i wszelkie produkty pochodne z jadłospisu, zamienników oraz listy zakupów', () => {
    const plan = generateMealPlan({
      peopleCount: 2,
      daysCount: 3,
      budgetPln: 140,
      dietType: 'nie_vege',
      targetCalories: 2000,
      excludedProductIds: ['pomidor'],
    });

    const tomatoKeywords = ['pomidor', 'pomidory', 'pomidorki'];
    const tomatoProductIds = ['pomidory_malinowe', 'pomidory_koktajlowe_promo', 'pomidory_rzymskie'];

    // 1. Sprawdź, czy żaden posiłek i żaden składnik nie zawiera pomidorów
    plan.days.forEach((day) => {
      day.meals.forEach((meal) => {
        meal.ingredients.forEach((ing) => {
          expect(tomatoProductIds).not.toContain(ing.productId);
        });
        const titleLower = meal.title.toLowerCase();
        tomatoKeywords.forEach((kw) => {
          expect(titleLower).not.toContain(kw);
        });
      });
    });

    // 2. Sprawdź listę zakupów
    const shoppingList = buildShoppingListFromPlan(plan);
    shoppingList.sections.forEach((sec) => {
      sec.items.forEach((item) => {
        expect(tomatoProductIds).not.toContain(item.product.id);
        const nameLower = item.product.name.toLowerCase();
        expect(nameLower).not.toContain('pomidor');
      });
    });

    // 3. Sprawdź zamienniki składników
    const subs = getIngredientSubstitutesForDish(
      'papryka_czerwona_fit',
      100,
      2,
      'nie_vege',
      ['pomidor']
    );
    subs.forEach((sub) => {
      expect(tomatoProductIds).not.toContain(sub.product.id);
    });
  });

  it('nigdy nie generuje planu droższego niż wybrany budżet i różnicuje warianty Ekonomiczny / Standardowy / Swobodny', () => {
    const testCases = [
      { people: 1, days: 1, budget: 28 },
      { people: 2, days: 3, budget: 168 },
      { people: 2, days: 3, budget: 216 },
      { people: 2, days: 3, budget: 288 },
      { people: 6, days: 3, budget: 504 },
      { people: 6, days: 3, budget: 648 },
    ];

    testCases.forEach(({ people, days, budget }) => {
      const plan = generateMealPlan({
        peopleCount: people,
        daysCount: days,
        budgetPln: budget,
        dietType: 'nie_vege',
        targetCalories: 2100,
      });
      const basket = buildShoppingListFromPlan(plan);

      expect(plan.totalCostPln).toBeLessThanOrEqual(budget);
      expect(basket.totalBasketCostPln).toBeLessThanOrEqual(budget);
    });

    // Wariant Ekonomiczny < Standardowy < Swobodny
    const ecoPlan = generateMealPlan({
      peopleCount: 2,
      daysCount: 3,
      budgetPln: 168,
      dietType: 'nie_vege',
      targetCalories: 2100,
    });
    const stdPlan = generateMealPlan({
      peopleCount: 2,
      daysCount: 3,
      budgetPln: 216,
      dietType: 'nie_vege',
      targetCalories: 2100,
    });
    const freePlan = generateMealPlan({
      peopleCount: 2,
      daysCount: 3,
      budgetPln: 288,
      dietType: 'nie_vege',
      targetCalories: 2100,
    });

    expect(ecoPlan.totalCostPln).toBeLessThan(stdPlan.totalCostPln);
    expect(stdPlan.totalCostPln).toBeLessThan(freePlan.totalCostPln);
  });

  it('ściśle przestrzega limitu kalorycznego (np. 2100 kcal, 1600 kcal, 2400 kcal) w każdym dniu i każdej diecie', () => {
    const diets = ['nie_vege', 'vege', 'bez_glutenu', 'bez_laktozy'];
    const limits = [1600, 1800, 2100, 2400];

    for (const dietType of diets) {
      for (const targetCalories of limits) {
        const plan = generateMealPlan({
          peopleCount: 2,
          daysCount: 3,
          budgetPln: 216,
          dietType,
          targetCalories,
          excludedProductIds: [],
        });

        expect(plan.avgDailyKcalPerPerson).toBeLessThanOrEqual(targetCalories);
        expect(plan.avgDailyKcalPerPerson).toBeGreaterThanOrEqual(targetCalories - 90);

        plan.days.forEach((day) => {
          expect(day.dayKcalPerPerson).toBeLessThanOrEqual(targetCalories);
          expect(day.dayKcalPerPerson).toBeGreaterThanOrEqual(targetCalories - 100);
        });
      }
    }
  });

  it('skutecznie wyklucza całe działy (np. pieczywo, ryby, tofu) oraz pojedyncze produkty we wszystkich dietach', () => {
    const diets = ['nie_vege', 'vege', 'bez_glutenu', 'bez_laktozy'];

    for (const dietType of diets) {
      const plan = generateMealPlan({
        peopleCount: 2,
        daysCount: 3,
        budgetPln: 190,
        dietType,
        targetCalories: 2100,
        excludedProductIds: ['pieczywo', 'ryby', 'tunczyk_w_sosie_wlasnym_fit', 'tofu'],
      });

      const forbiddenIds = [
        'chleb_zytni_fit',
        'bulki_kajzerki_promo',
        'chleb_proteinowy_fit',
        'tortilla_pszenna_promo',
        'wafle_ryzowe_bg_fit',
        'chleb_bezglutenowy_fit',
        'tunczyk_w_sosie_wlasnym_fit',
        'losos_wedzony_marinero_fit',
        'tofu_wedzone_govege_fit',
        'tofu_naturalne_govege_fit',
      ];

      plan.days.forEach((day) => {
        expect(day.dayKcalPerPerson).toBeLessThanOrEqual(2100);
        day.meals.forEach((meal) => {
          meal.ingredients.forEach((ing) => {
            expect(forbiddenIds).not.toContain(ing.productId);
          });
        });
      });

      const basket = buildShoppingListFromPlan(plan);
      basket.sections.forEach((sec) => {
        sec.items.forEach((item) => {
          expect(forbiddenIds).not.toContain(item.productId);
        });
      });
    }
  });

  it('zwraca zamienniki (produkty z gazetki żółte oraz produkty Fit) dla kwadratu składnika i przelicza cenę oraz makro', () => {
    const plan = generateMealPlan({
      peopleCount: 2,
      daysCount: 1,
      budgetPln: 90,
      dietType: 'nie_vege',
      excludedProductIds: [],
    });

    const firstMeal = plan.days[0].meals[0];
    const firstIngredient = firstMeal.ingredients[0];

    const substitutes = getIngredientSubstitutesForDish(
      firstIngredient.productId,
      firstIngredient.portionGrams,
      plan.peopleCount,
      plan.dietType,
      plan.excludedProductIds
    );

    expect(substitutes.length).toBeGreaterThan(0);

    const newSubId = substitutes[0].product.id;
    const updatedPlan = replaceIngredientInMealPlan(
      plan,
      1,
      firstMeal.slotId,
      0,
      newSubId
    );

    expect(updatedPlan.days[0].meals[0].ingredients[0].productId).toBe(newSubId);
    expect(updatedPlan.totalCostPln).toBeGreaterThan(0);
  });

  it('porządkuje listę zakupów według działów w sklepie (Owoce i warzywa pierwsze) i obsługuje Alternatywy przy "Brak produktu"', () => {
    const plan = generateMealPlan({
      peopleCount: 2,
      daysCount: 2,
      budgetPln: 150,
      dietType: 'nie_vege',
      excludedProductIds: [],
    });

    const shoppingList = buildShoppingListFromPlan(plan);
    expect(shoppingList.sections.length).toBeGreaterThan(0);

    // Pierwszą sekcją zawsze muszą być Owoce i warzywa (order = 1)
    expect(shoppingList.sections[0].id).toBe('owoce_warzywa');
    expect(shoppingList.sections[0].name).toBe('Owoce i warzywa');

    // Sprawdź czy sekcje są posortowane rosnąco według kolejności działów w sklepie
    for (let i = 1; i < shoppingList.sections.length; i++) {
      expect(shoppingList.sections[i].order).toBeGreaterThan(
        shoppingList.sections[i - 1].order
      );
    }

    // Sprawdź dostępność ogólnych Alternatyw przy "Brak produktu"
    const sampleItem = shoppingList.sections[0].items[0];
    const alternatives = getShelfAlternativesForProduct(
      sampleItem.productId,
      plan.dietType,
      []
    );
    expect(alternatives.length).toBeGreaterThan(0);

    const chosenAlternativeId = alternatives[0].product.id;
    const updatedList = buildShoppingListFromPlan(
      plan,
      {},
      { [sampleItem.originalProductId]: chosenAlternativeId }
    );

    const allProductIds = updatedList.sections.flatMap((s) =>
      s.items.map((item) => item.productId)
    );
    expect(allProductIds).toContain(chosenAlternativeId);
  });
});

describe('Pełny przepływ użytkownika w interfejsie Moja Biedronka', () => {
  it('przechodzi przez 5 kroków ankiety, modyfikację potrawy w kwadratach, listę zakupów z Alternatywami i skanowanie karty', () => {
    render(<App />);

    // Krok 1: Na ile osób? - roller wyboru (1-6)
    expect(
      screen.getByText(/1\.\s*Na ile osób przygotować plan\?/i)
    ).toBeInTheDocument();
    const roller = screen.getByRole('spinbutton');
    expect(roller).toBeInTheDocument();
    expect(roller).toHaveAttribute('aria-valuenow', '2');
    
    // Test rollera: zmiana na 4 osoby za pomocą kliknięcia opcji na rolce
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(roller).toHaveAttribute('aria-valuenow', '4');

    fireEvent.click(screen.getByText('Dalej'));

    // Krok 2: Ile dni? - roller wyboru (1-7)
    expect(
      screen.getByText(/2\.\s*Na ile dni chcesz zaplanować posiłki\?/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Na każdy dzień znajdziemy dla Ciebie 4 posiłki/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText('Liczba dni:')).toBeInTheDocument();
    const daysRoller = screen.getByRole('spinbutton', { name: /Liczba dni/i });
    expect(daysRoller).toBeInTheDocument();
    expect(daysRoller).toHaveAttribute('aria-valuenow', '3');

    // Test rollera: zmiana na 5 dni za pomocą kliknięcia
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    expect(daysRoller).toHaveAttribute('aria-valuenow', '5');

    fireEvent.click(screen.getByText('Dalej'));

    // Krok 3: Jaki budżet?
    expect(
      screen.getByText(/3\.\s*Jaki budżet chcesz przeznaczyć\?/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Dobierzemy produkty z aktualnej oferty promocyjnej Biedronki/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Całkowity budżet na 5 dni dla 4 os\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/dziennie na osobę/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dalej'));

    // Krok 4: Jaka dieta?
    expect(
      screen.getByText(/4\.\s*Jaka dieta Cię interesuje\?/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Klasyczna')).toBeInTheDocument();
    expect(screen.getByText('Wegetariańska')).toBeInTheDocument();
    expect(screen.getByText('Bez mięsa')).toBeInTheDocument();
    expect(screen.getByText('Bez glutenu')).toBeInTheDocument();
    expect(screen.getByText('Wyklucza pszenicę, żyto i jęczmień')).toBeInTheDocument();
    expect(screen.getByText('Bez laktozy')).toBeInTheDocument();
    expect(screen.getByText('Wybór produktów w wariancie bez laktozy lub roślinnych alternatyw')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dalej'));

    // Krok 5: Jaki cel kaloryczny?
    expect(
      screen.getByText(/5\.\s*Jaki jest Twój dzienny cel kaloryczny\?/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText('2000 kcal').length).toBeGreaterThan(0);
    expect(screen.getByText(/Bez liczenia kalorii/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dalej'));

    // Krok 6: Czy chcesz wykluczyć jakieś produkty? -> Sprawdź kafelki i kliknij Stwórz plan
    expect(
      screen.getByText(/6\.\s*Czy chcesz wykluczyć jakieś produkty\?/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Jeśli chcesz wykluczyć dane składniki w swoich posiłkach, zaznacz je tutaj\./i)
    ).not.toBeInTheDocument();
    expect(screen.getByText('Tak')).toBeInTheDocument();
    expect(screen.getByText('Nie')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Wyszukaj składnik\.\.\./i);
    expect(searchInput).toBeInTheDocument();
    fireEvent.click(searchInput);

    // Sprawdź czy kategorie składników są widoczne (np. Pomidor, Twaróg, Mleko)
    expect(screen.getByText('Pomidor')).toBeInTheDocument();
    expect(screen.getByText('Twaróg')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Stwórz plan'));

    // Widok wygenerowanego planu (4 posiłki: Śniadanie, Obiad, Kolacja, Przekąska)
    expect(
      screen.getByText(/Twój jadłospis/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Śniadanie')).toBeInTheDocument();
    expect(screen.getByText('Obiad')).toBeInTheDocument();
    expect(screen.getByText('Kolacja')).toBeInTheDocument();
    expect(screen.getByText('Przekąska')).toBeInTheDocument();

    // Kliknij Akceptuj i przejdź do listy zakupów
    fireEvent.click(screen.getByText(/Akceptuj i przejdź do listy zakupów/i));

    expect(
      screen.getByText(/Lista zakupów wg działów w sklepie/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Owoce i warzywa')).toBeInTheDocument();

    // Test przycisku Zaznacz wszystko / Odznacz wszystko
    const toggleCheckAllBtn = screen.getByRole('button', { name: /Zaznacz wszystko/i });
    expect(toggleCheckAllBtn).toBeInTheDocument();
    fireEvent.click(toggleCheckAllBtn);

    // Po zaznaczeniu wszystkich przycisk powinien zmienić się na "Odznacz wszystko"
    expect(screen.getByRole('button', { name: /Odznacz wszystko/i })).toBeInTheDocument();

    // Kliknięcie odznacza wszystkie produkty
    fireEvent.click(screen.getByRole('button', { name: /Odznacz wszystko/i }));
    expect(screen.getByRole('button', { name: /Zaznacz wszystko/i })).toBeInTheDocument();

    // Kliknij "Brak produktu", aby otworzyć "Alternatywy"
    const missingButtons = screen.getAllByText('Brak produktu');
    fireEvent.click(missingButtons[0]);
    expect(
      screen.getByText(/Dostępne alternatywy w sklepie/i)
    ).toBeInTheDocument();
  });
});

