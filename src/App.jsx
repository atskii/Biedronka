import React, { useState, useEffect, useMemo } from 'react';
import BottomNavBar from './components/common/BottomNavBar';
import SurveyWizard from './components/survey/SurveyWizard';
import MealPlanView from './components/plan/MealPlanView';
import ShoppingListView from './components/shopping/ShoppingListView';
import BiedronkaCardModal from './components/checkout/BiedronkaCardModal';
import InPostTimeNotification from './components/checkout/InPostTimeNotification';
import {
  generateMealPlan,
  replaceIngredientInMealPlan,
  buildShoppingListFromPlan,
} from './services/mealPlanEngine';
import {
  saveUserPlanRecord,
  saveShoppingSessionRecord,
} from './services/supabaseClient';

export default function App() {
  const [stage, setStage] = useState('survey'); // 'survey' | 'plan' | 'shopping' | 'summary'
  const [surveyParams, setSurveyParams] = useState({
    peopleCount: 2,
    daysCount: 3,
    budgetPln: 140,
    dietType: 'nie_vege',
    excludedProductIds: [],
  });

  const [mealPlan, setMealPlan] = useState(() =>
    generateMealPlan({
      peopleCount: 2,
      daysCount: 3,
      budgetPln: 140,
      dietType: 'nie_vege',
      excludedProductIds: [],
    })
  );

  // Stan listy zakupów
  const [checkedItemsMap, setCheckedItemsMap] = useState({});
  const [shelfAlternativesMap, setShelfAlternativesMap] = useState({});
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Stoper czasu zakupów (do powiadomienia w stylu InPost)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSession, setCompletedSession] = useState(null);

  useEffect(() => {
    if (!isTimerRunning) return undefined;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Wyliczona lista zakupów z podziałem na działy w sklepie
  const shoppingList = useMemo(
    () =>
      buildShoppingListFromPlan(
        mealPlan,
        checkedItemsMap,
        shelfAlternativesMap
      ),
    [mealPlan, checkedItemsMap, shelfAlternativesMap]
  );

  // Zakończenie ankiety i wygenerowanie planu
  const handleCompleteSurvey = (params) => {
    setSurveyParams(params);
    const newPlan = generateMealPlan(params);
    setMealPlan(newPlan);
    setCheckedItemsMap({});
    setShelfAlternativesMap({});
    setStage('plan');
  };

  // Aktualizacja filtra budżetu na widoku planu
  const handleUpdateBudgetFilter = (newBudget) => {
    const updatedParams = { ...surveyParams, budgetPln: newBudget };
    setSurveyParams(updatedParams);
    setMealPlan((prev) => ({
      ...prev,
      budgetPln: newBudget,
    }));
  };

  // Aktualizacja filtra diety na widoku planu
  const handleUpdateDietFilter = (newDiet) => {
    const updatedParams = { ...surveyParams, dietType: newDiet };
    setSurveyParams(updatedParams);
    const regenerated = generateMealPlan({
      ...mealPlan,
      dietType: newDiet,
    });
    setMealPlan(regenerated);
  };

  // Podmiana składnika (kwadratu) w potrawie na zamiennik z gazetki (żółty) lub Fit
  const handleReplaceIngredient = (
    dayNumber,
    slotId,
    ingredientIndex,
    newProductId
  ) => {
    setMealPlan((prevPlan) =>
      replaceIngredientInMealPlan(
        prevPlan,
        dayNumber,
        slotId,
        ingredientIndex,
        newProductId
      )
    );
  };

  // Akceptacja planu -> przejście do listy zakupów i start licznika czasu
  const handleAcceptPlan = () => {
    saveUserPlanRecord({
      peopleCount: mealPlan.peopleCount,
      daysCount: mealPlan.daysCount,
      budgetPln: mealPlan.budgetPln,
      dietType: mealPlan.dietType,
      excludedProductIds: mealPlan.excludedProductIds,
      totalCostPln: mealPlan.totalCostPln,
      totalSavedPln: mealPlan.totalSavedPln,
    });
    setElapsedSeconds((prev) => (prev > 0 ? prev : 1));
    setIsTimerRunning(true);
    setStage('shopping');
  };

  // Odhaczenie produktu na liście zakupów
  const handleToggleItemCheck = (productId) => {
    setCheckedItemsMap((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Zaznaczenie / odznaczenie wszystkich produktów na liście
  const handleCheckAllItems = () => {
    const isAllChecked =
      shoppingList.checkedItemsCount === shoppingList.totalItemsCount &&
      shoppingList.totalItemsCount > 0;

    if (isAllChecked) {
      setCheckedItemsMap({});
    } else {
      const nextMap = {};
      shoppingList.sections.forEach((sec) => {
        sec.items.forEach((item) => {
          nextMap[item.productId] = true;
        });
      });
      setCheckedItemsMap(nextMap);
    }
  };

  // Podmiana brakującego produktu w sklepie na wybraną "Alternatywę"
  const handleReplaceWithAlternative = (originalProductId, alternativeProductId) => {
    setShelfAlternativesMap((prev) => ({
      ...prev,
      [originalProductId]: alternativeProductId,
    }));
  };

  // Zeskanowanie karty Moja Biedronka i potwierdzenie płatności
  const handleConfirmPayment = (cardNumber) => {
    setIsTimerRunning(false);
    setIsCardModalOpen(false);
    const finalSeconds = Math.max(1, elapsedSeconds);

    const sessionPayload = {
      durationSeconds: finalSeconds,
      finalCostPln: shoppingList.totalBasketCostPln,
      savedPln: shoppingList.totalBasketSavedPln,
      loyaltyCardNumber: cardNumber,
    };

    saveShoppingSessionRecord(sessionPayload);
    setCompletedSession(sessionPayload);
    setStage('summary');
  };

  const handleSelectStage = (targetStage) => {
    if (targetStage === 'shopping' && !isTimerRunning && elapsedSeconds === 0) {
      setElapsedSeconds(1);
      setIsTimerRunning(true);
    }
    if (targetStage === 'summary' && !completedSession) {
      setCompletedSession({
        durationSeconds: Math.max(195, elapsedSeconds),
        finalCostPln: shoppingList.totalBasketCostPln,
        savedPln: shoppingList.totalBasketSavedPln,
        loyaltyCardNumber: '6391 0482 9104 7721',
      });
    }
    setStage(targetStage);
  };

  return (
    <div className="min-h-screen bg-neutral-200/50 text-neutral-900 font-sans flex justify-center">
      {/* Kontener mobilny o szerokości dopasowanej do smartfona (max-w-md = 448px) */}
      <div className="w-full max-w-md min-h-screen bg-[#FBFBF7] relative flex flex-col shadow-2xl">
        {/* Kompaktowy pasek górny (TopAppBar) */}
        <header className="sticky top-0 z-30 bg-red-700 text-white shadow-sm border-b border-red-800 relative overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between relative z-10">
            <span className="font-black text-lg sm:text-xl tracking-tight text-white">
              Biedronka
            </span>
          </div>

          {/* Czarne kropki biedronki o różnych wielkościach wychodzące poza ekran */}
          <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none select-none overflow-hidden" aria-hidden="true">
            <span className="absolute -right-4 -top-4 w-12 h-12 rounded-full bg-neutral-950/90 shadow-2xs" />
            <span className="absolute -right-2 -bottom-4 w-9 h-9 rounded-full bg-neutral-950/90 shadow-2xs" />
            <span className="absolute right-10 top-1.5 w-6 h-6 rounded-full bg-neutral-950/90 shadow-2xs" />
            <span className="absolute right-18 bottom-1 w-4 h-4 rounded-full bg-neutral-950/90 shadow-2xs" />
            <span className="absolute right-26 top-3.5 w-2.5 h-2.5 rounded-full bg-neutral-950/90 shadow-2xs" />
          </div>
        </header>

        {/* Główna zawartość mobilna */}
        <main className="flex-1 px-3 sm:px-4 pt-3 sm:pt-4 pb-20">
          {stage === 'survey' && (
            <SurveyWizard
              initialValues={surveyParams}
              onCompleteSurvey={handleCompleteSurvey}
            />
          )}

          {stage === 'plan' && (
            <MealPlanView
              plan={mealPlan}
              onUpdateBudgetFilter={handleUpdateBudgetFilter}
              onUpdateDietFilter={handleUpdateDietFilter}
              onReplaceIngredient={handleReplaceIngredient}
              onAcceptPlan={handleAcceptPlan}
              onRestartSurvey={() => setStage('survey')}
            />
          )}

          {stage === 'shopping' && (
            <ShoppingListView
              shoppingList={shoppingList}
              plan={mealPlan}
              elapsedSeconds={elapsedSeconds}
              onToggleItemCheck={handleToggleItemCheck}
              onCheckAllItems={handleCheckAllItems}
              onReplaceWithAlternative={handleReplaceWithAlternative}
              onOpenCardScanner={() => setIsCardModalOpen(true)}
              onBackToPlan={() => setStage('plan')}
            />
          )}

          {stage === 'summary' && (
            <InPostTimeNotification
              durationSeconds={
                completedSession?.durationSeconds || Math.max(1, elapsedSeconds)
              }
              shoppingList={shoppingList}
              plan={mealPlan}
              loyaltyCardNumber={
                completedSession?.loyaltyCardNumber || '6391 0482 9104 7721'
              }
              onBackToShoppingList={() => setStage('shopping')}
              onCreateNewPlan={() => {
                setElapsedSeconds(0);
                setIsTimerRunning(false);
                setCompletedSession(null);
                setStage('survey');
              }}
            />
          )}
        </main>

        {/* Dolne mobilne menu (Bottom Navigation Bar) */}
        <BottomNavBar
          stage={stage}
          onSelectStage={handleSelectStage}
          basketItemsCount={shoppingList.totalItemsCount}
        />

        {/* Modal skanowania karty Moja Biedronka */}
        {isCardModalOpen && (
          <BiedronkaCardModal
            shoppingList={shoppingList}
            elapsedSeconds={elapsedSeconds}
            onClose={() => setIsCardModalOpen(false)}
            onConfirmPayment={handleConfirmPayment}
          />
        )}
      </div>
    </div>
  );
}
