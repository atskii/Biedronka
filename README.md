# Moja Biedronka – Moduł „Twój Jadłospis & Smart Koszyk” 🐞

Moduł planowania posiłków i szybkich zakupów dla aplikacji **Moja Biedronka**, pozwalający jeść **tanio, zdrowo i szybko** dzięki dynamicznym cenom i promocjom z gazetki Biedronki.

## Główne Funkcjonalności

1. **Ankieta do planu (5 kroków):**
   - Na ile osób? (1–6)
   - Ile dni? (1–7 dni, po **4 posiłki dziennie**: Śniadanie, Obiad, Kolacja + Przekąska)
   - Jaki budżet? (Suwak PLN z przelicznikiem na dzień/osobę)
   - Jaka dieta? (`Nie vege` / `Vege` / `Bez glutenu` / `Bez laktozy`)
   - Czy chcesz wykluczyć jakieś produkty? (`Tak` -> wyszukiwarka wykluczeń, `Nie` -> generowanie planu)
2. **Wygenerowany Plan, Filtry i Modyfikacja w Kwadratach:**
   - **Filtry:** Budżet, Dieta, Kalorie, Składniki.
   - **Karta dania:** Cena (najważniejsza!), Kalorie, Makra (Węgle, Białko, Tłuszcze), Czas przygotowania (`15m`, `30m`, `2h`).
   - **Modyfikacja potrawy:** Po kliknięciu w danie składniki wyświetlane są w **kwadratach**. Kliknięcie w kwadrat otwiera zamienniki do wyboru (**produkty z gazetki na żółto** oraz **produkty Fit**).
3. **Lista Zakupów wg Działów w Sklepie:**
   - Sekcje ułożone zgodnie ze ścieżką w sklepie Biedronka: **1. Owoce i warzywa** (pierwsze), **2. Pieczywo**, **3. Nabiał**, **4. Wędliny**, **5. Mięso**, **6. Ryby**, **7. Napoje**, **8. Napoje alkoholowe**.
   - **Brak produktu -> Alternatywy:** Możliwość kliknięcia „Brak produktu” i wyboru dostępnej alternatywy z półki.
   - **Pasek postępu na dole** z licznikiem czasu zakupów i sumą koszyka.
4. **Skaner Karty Moja Biedronka & Czas Zakupów w stylu InPost:**
   - Wirtualna karta Moja Biedronka z kodem kreskowym.
   - Po płatności wyświetla powiadomienie z konfetti pokazujące, **ile czasu zajęły zakupy** (jak w InPost) oraz ile zaoszczędzono dzięki promocjom z gazetki.

## Techstack

- **Frontend:** React 19, Vite, JavaScript (ES Modules)
- **Stylowanie & Animacje:** Tailwind CSS v4, Lucide React, Framer Motion, Canvas Confetti
- **Backend / Baza Danych:** Supabase (`@supabase/supabase-js`, schemat PostgreSQL w `supabase/schema.sql`)
- **Testy:** Vitest, React Testing Library, Jest DOM

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

### Testy i Build

```bash
npm test
npm run build
```
