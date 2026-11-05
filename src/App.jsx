import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  UtensilsCrossed,
  ShoppingBasket,
  QrCode,
  Sparkles,
} from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      {/* Górny pasek aplikacji Moja Biedronka */}
      <header className="sticky top-0 z-30 bg-red-600 text-white shadow-md">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-yellow-300 flex items-center justify-center text-xl shadow-xs border border-red-800/20">
              🐞
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight leading-none">
                  Moja Biedronka
                </span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-300 text-neutral-900 text-[10px] font-black uppercase">
                  Jadłospis
                </span>
              </div>
              <p className="text-[11px] text-red-100 font-medium">
                Tanie i zdrowe posiłki • Dynamiczne ceny z gazetki
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCardModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <QrCode className="w-4 h-4 text-red-600" />
            <span>Karta</span>
          </button>
        </div>

        {/* Pasek szybkiego podglądu etapów */}
        <div className="bg-red-700/90 border-t border-red-500/40">
          <div className="max-w-lg mx-auto px-3 py-1.5 grid grid-cols-4 gap-1 text-[11px] font-extrabold">
            <button
              type="button"
              onClick={() => setStage('survey')}
              className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition ${
                stage === 'survey'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-red-100 hover:bg-red-600/60'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>1. Ankieta</span>
            </button>

            <button
              type="button"
              onClick={() => setStage('plan')}
              className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition ${
                stage === 'plan'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-red-100 hover:bg-red-600/60'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>2. Plan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isTimerRunning && elapsedSeconds === 0) {
                  setElapsedSeconds(1);
                  setIsTimerRunning(true);
                }
                setStage('shopping');
              }}
              className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition ${
                stage === 'shopping'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-red-100 hover:bg-red-600/60'
              }`}
            >
              <ShoppingBasket className="w-3.5 h-3.5" />
              <span>3. Zakupy</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!completedSession) {
                  setCompletedSession({
                    durationSeconds: Math.max(195, elapsedSeconds),
                    finalCostPln: shoppingList.totalBasketCostPln,
                    savedPln: shoppingList.totalBasketSavedPln,
                    loyaltyCardNumber: '6391 0482 9104 7721',
                  });
                }
                setStage('summary');
              }}
              className={`py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 transition ${
                stage === 'summary'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-red-100 hover:bg-red-600/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>4. Czas</span>
            </button>
          </div>
        </div>
      </header>

      {/* Główny kontener mobilny */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-10">
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
  );
}

