Kontekst: 

Problem : Studenci chcą jeść tanio, zdrowo, szybko jednak brakuje wiedzy co jest zdrowe, oraz przede wszystkim co ile kosztuje, nie chca tracic czasu na zakupy 

Rozwiązanie : moduł w appce biedronki od jadłospisu wraz z dynamicznymi cenami i promocjami, biedronki z filtrami produktów ,cenami , (budżet), dodawanie do listy zakupow wraz z makro

Filtry: Budżet, Dieta, Kalorii, Składniki

Funkcjonalności:

Ankieta do planu

1) Na ile osób?  
2) Ile dni?  
3) Jaki budżet?  
4) Jaka dieta (vege/nie vege/bez glutenu/bez laktozy?)  
5) Czy chcesz wykluczyć jakies produkty? (Tak \- idzie do wyszukiwarki, Nie \- idzie do generowania)

Generowanie

Plan do zaakceptowania albo modyfikacja, jeżeli modyfikacja to klikamy na potrawę mamy w kwadratach jakies skladniki i klikamy na kwadrat i mamy zamienniki do wyboru  (produkty z gazetki zolto, a produkty fit)

Karta produktów (dań): 

Cena (najwazniejsza) Kalorie, Makra (wegle bialko i tluaszcze)  Czas przygorwqania (np. 2h albo 30m)

Akceptuj

Lista zakupów:

Podział na sekcje (ze względu na działy w sklepie \- nabiał, wędliny, (pierwsze owoce i warzywa), potem pieczywo, mięso, ryby, napoje, napoje alkoholowe ) , pasek postępu na dole, mozliwosc klikniecia (brak produktu i wtedy ponownie wychodza zamienniki)

Skanujemy karte biedornka i po płatności dostajemy powiadomienie ile nam to zajelo jak w inpost 

Techstack:

React

### **1\. Frontend & Core**

* **React 19** (`^19.2.4`) – główna biblioteka do budowy interfejsu użytkownika (z komponentami funkcyjnymi i hookami).  
* **Vite 8** (`^8.0.10`) – nowoczesny, szybki bundler i środowisko deweloperskie (zastąpił wcześniejszą konfigurację Create React App).  
* **JavaScript (ES Modules)** – modułowy kod JS (`type: "module"`).

### **2\. Stylowanie & UI**

* **Tailwind CSS v4** (`@tailwindcss/postcss`, `tailwindcss ^4.2.4`) – utility-first framework CSS do responsywnego stylowania.  
* **PostCSS & Autoprefixer** – pipeline procesowania CSS.  
* **Lucide React** (`lucide-react`) – biblioteka ikon wektorowych.  
* **Framer Motion** (`framer-motion ^12.42.2`) – zaawansowane animacje i przejścia komponentów.  
* **Canvas Confetti** (`canvas-confetti`) – efekty wizualne nagród/sukcesu.  
* **Mobile Drag Drop** (`mobile-drag-drop`) – polyfill obsługi przeciągania elementów na ekranach dotykowych.

### **3\. Backend & Baza Danych (BaaS)**

* **Supabase** (`@supabase/supabase-js ^2.105.1`) – platforma backendowa (baza danych PostgreSQL, autentykacja użytkowników, RLS, storage).

### **4\. Hosting, Analityka & Narzędzia**

* **Vercel** (`@vercel/analytics`, konfiguracja vercel.json) – platforma wdrożeniowa i analityka ruchu.  
* **Web Vitals** – monitoring metryk wydajnościowych (Core Web Vitals).  
* **Concurrently** – uruchamianie wielu podserwerów deweloperskich jednocześnie (aplikacja główna \+ panele `analytics` i `users`).

**5\. Testowanie & Audyt**

* **React Testing Library & Jest DOM** (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`).

