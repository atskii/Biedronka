import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Zapisuje wygenerowany/zaakceptowany plan w Supabase lub w localStorage (fallback offline).
 */
export async function saveUserPlanRecord(planSummary) {
  const record = {
    id: `plan_${Date.now()}`,
    ...planSummary,
    created_at: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem('mb_saved_plans') || '[]');
    localStorage.setItem('mb_saved_plans', JSON.stringify([record, ...existing.slice(0, 19)]));
  } catch {
    // Ignore storage errors in restricted environments
  }

  if (supabase) {
    try {
      await supabase.from('user_plans').insert([
        {
          people_count: planSummary.peopleCount,
          days_count: planSummary.daysCount,
          budget_pln: planSummary.budgetPln,
          diet_type: planSummary.dietType,
          excluded_product_ids: planSummary.excludedProductIds || [],
          total_cost_pln: planSummary.totalCostPln,
          total_saved_pln: planSummary.totalSavedPln,
        },
      ]);
    } catch {
      // Fallback already persisted locally
    }
  }

  return record;
}

/**
 * Zapisuje ukończoną sesję zakupową wraz z czasem trwania zakupów (powiadomienie w stylu InPost).
 */
export async function saveShoppingSessionRecord(sessionData) {
  const record = {
    id: `session_${Date.now()}`,
    ...sessionData,
    completed_at: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem('mb_shopping_sessions') || '[]');
    localStorage.setItem('mb_shopping_sessions', JSON.stringify([record, ...existing.slice(0, 19)]));
  } catch {
    // Ignore storage errors
  }

  if (supabase) {
    try {
      await supabase.from('shopping_sessions').insert([
        {
          duration_seconds: sessionData.durationSeconds,
          final_cost_pln: sessionData.finalCostPln,
          saved_pln: sessionData.savedPln,
          loyalty_card_number: sessionData.loyaltyCardNumber,
        },
      ]);
    } catch {
      // Fallback already persisted locally
    }
  }

  return record;
}

