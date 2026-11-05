import React, { useState, useEffect, useMemo } from 'react';
import { QrCode } from 'lucide-react';
import BiedronkaLogo from './components/common/BiedronkaLogo';
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

  // Zaznaczenie wszystkich produktów na liście
  const handleCheckAllItems = () => {
    const nextMap = {};
    shoppingList.sections.forEach((sec) => {
      sec.items.forEach((item) => {
        nextMap[item.productId] = true;
      });
    });
    setCheckedItemsMap(nextMap);
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
        {/* Kompaktowy pasek górny (TopAppBar) w stylu natywnej aplikacji Biedronki */}
        <header className="sticky top-0 z-30 bg-red-700 text-white shadow-sm border-b border-red-800">
          <div className="px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <BiedronkaLogo size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white whitespace-nowrap">
                    Moja Biedronka
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-300 text-neutral-950 text-[9px] font-black uppercase tracking-wider whitespace-nowrap">
                    Smart Jadłospis
                  </span>
                </div>
                <p className="text-[10px] text-red-100 font-medium truncate mt-0.5">
                  Szybko • Zdrowo • Tanio
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCardModalOpen(true)}
              className="shrink-0 px-2.5 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-2xs transition active:scale-95 ml-2"
              aria-label="Otwórz kartę Moja Biedronka"
            >
              <QrCode className="w-3.5 h-3.5 text-red-700" />
              <span>Karta</span>
            </button>
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
