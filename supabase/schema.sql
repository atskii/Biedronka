-- Schemat Bazy Danych Supabase (PostgreSQL) dla modułu "Twój Jadłospis & Smart Koszyk" w aplikacji Moja Biedronka

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela produktów Biedronki przypisanych do działów sklepowych
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'Biedronka',
    aisle_category TEXT NOT NULL CHECK (
        aisle_category IN (
            'owoce_warzywa',
            'pieczywo',
            'nabial',
            'wedliny',
            'mieso',
            'ryby',
            'napoje',
            'alkohole'
        )
    ),
    aisle_order INTEGER NOT NULL CHECK (aisle_order BETWEEN 1 AND 8),
    price_regular NUMERIC(8,2) NOT NULL,
    price_promo NUMERIC(8,2),
    is_gazetka_promo BOOLEAN NOT NULL DEFAULT FALSE,
    is_fit_choice BOOLEAN NOT NULL DEFAULT FALSE,
    fit_badge TEXT,
    promo_label TEXT,
    kcal_per_100g INTEGER NOT NULL,
    carbs_g NUMERIC(6,1) NOT NULL,
    protein_g NUMERIC(6,1) NOT NULL,
    fat_g NUMERIC(6,1) NOT NULL,
    package_weight_g INTEGER NOT NULL DEFAULT 100,
    unit_label TEXT NOT NULL DEFAULT 'opak.',
    diet_tags TEXT[] NOT NULL DEFAULT ARRAY['nie_vege', 'vege', 'bez_glutenu', 'bez_laktozy'],
    emoji TEXT NOT NULL DEFAULT '🛒',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Relacja zamienników do przepisów (Gazetka / Fit) oraz alternatyw na półce ("Brak produktu")
CREATE TABLE IF NOT EXISTS public.product_substitutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    target_product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    context_type TEXT NOT NULL CHECK (context_type IN ('gazetka', 'fit', 'alternative')),
    reason_label TEXT
);

-- 3. Tabela przepisów (Śniadanie, Obiad, Kolacja, Przekąska)
CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('sniadanie', 'obiad', 'kolacja', 'przekaska')),
    prep_time_minutes INTEGER NOT NULL,
    prep_time_label TEXT NOT NULL,
    diet_tags TEXT[] NOT NULL,
    description TEXT,
    emoji TEXT NOT NULL DEFAULT '🍽️',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Składniki przepisów
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id TEXT NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    amount_grams INTEGER NOT NULL,
    display_amount TEXT NOT NULL
);

-- 5. Zapisane plany żywieniowe użytkowników
CREATE TABLE IF NOT EXISTS public.user_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    people_count INTEGER NOT NULL DEFAULT 1,
    days_count INTEGER NOT NULL DEFAULT 3,
    budget_pln NUMERIC(8,2) NOT NULL,
    diet_type TEXT NOT NULL,
    excluded_product_ids TEXT[] NOT NULL DEFAULT '{}',
    total_cost_pln NUMERIC(8,2) NOT NULL,
    total_saved_pln NUMERIC(8,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Sesje zakupowe i czas trwania zakupów (powiadomienie w stylu InPost)
CREATE TABLE IF NOT EXISTS public.shopping_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES public.user_plans(id) ON DELETE SET NULL,
    duration_seconds INTEGER NOT NULL,
    final_cost_pln NUMERIC(8,2) NOT NULL,
    saved_pln NUMERIC(8,2) NOT NULL DEFAULT 0,
    loyalty_card_number TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publiczny odczyt produktów" ON public.products FOR SELECT USING (true);
CREATE POLICY "Publiczny odczyt przepisów" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Zapisywanie planów użytkowników" ON public.user_plans FOR ALL USING (true);
CREATE POLICY "Zapisywanie sesji zakupowych" ON public.shopping_sessions FOR ALL USING (true);

