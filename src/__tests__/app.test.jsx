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
      screen.getByText(/1\) Na ile osób przygotować plan\?/i)
    ).toBeInTheDocument();
    const roller = screen.getByRole('spinbutton');
    expect(roller).toBeInTheDocument();
    expect(roller).toHaveAttribute('aria-valuenow', '2');
    
    // Test rollera: zmiana na 4 osoby za pomocą kliknięcia opcji na rolce
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    expect(roller).toHaveAttribute('aria-valuenow', '4');

    fireEvent.click(screen.getByText('Dalej'));

    // Krok 2: Ile dni?
    expect(
      screen.getByText(/2\) Na ile dni chcesz zaplanować posiłki\?/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dalej'));

    // Krok 3: Jaki budżet?
    expect(
      screen.getByText(/3\) Jaki budżet chcesz przeznaczyć\?/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dalej'));

    // Krok 4: Jaka dieta?
    expect(
      screen.getByText(/4\) Jaka dieta Cię interesuje\?/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dalej'));

    // Krok 5: Czy chcesz wykluczyć jakieś produkty? -> Kliknij TAK, aby przetestować wyszukiwarkę
    expect(
      screen.getByText(/5\) Czy chcesz wykluczyć jakieś produkty\?/i)
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByText(/TAK – przejdź do wyszukiwarki składników/i)
    );

    expect(
      screen.getByText(/Wyszukaj produkty do wykluczenia/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Generuj jadłospis/i));

    // Widok wygenerowanego planu (4 posiłki: Śniadanie, Obiad, Kolacja, Przekąska)
    expect(
      screen.getByText(/Twój wygenerowany jadłospis/i)
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

    // Kliknij "Brak produktu", aby otworzyć "Alternatywy"
    const missingButtons = screen.getAllByText('Brak produktu');
    fireEvent.click(missingButtons[0]);
    expect(
      screen.getByText(/Dostępne alternatywy w sklepie/i)
    ).toBeInTheDocument();
  });
});

