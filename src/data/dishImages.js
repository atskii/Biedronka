/**
 * Mapowanie identyfikatorów przepisów (dań) z katalogu Biedronki na apetyczne zdjęcia gotowych potraw.
 * Zoptymalizowane pod kątem wyświetlania na kartach posiłków oraz w modalu modyfikacji potrawy.
 */
export const DISH_IMAGES = {
  // Śniadania (100% z grafikami AI na ceramicznym talerzu z góry)
  sniadanie_jajecznica_malinowe: '/images/dishes/sniadanie_jajecznica_malinowe.jpg',
  sniadanie_bowl_skyr_owoce: '/images/dishes/sniadanie_bowl_skyr_owoce.jpg',
  sniadanie_kanapki_indyk_warzywa: '/images/dishes/sniadanie_kanapki_indyk_warzywa.jpg',
  sniadanie_tofucznica_awokado: '/images/dishes/sniadanie_tofucznica_awokado.jpg',
  sniadanie_omlet_twarog_papryka: '/images/dishes/sniadanie_omlet_twarog_papryka.jpg',
  sniadanie_tofucznica_cukinia_szpinak: '/images/dishes/sniadanie_tofucznica_cukinia_szpinak.jpg',
  sniadanie_kanapki_hummus_ogorek: '/images/dishes/sniadanie_kanapki_hummus_ogorek.jpg',

  // Obiady (100% z grafikami AI na ceramicznym talerzu z góry)
  obiad_zapiekanka_ziemniaki_mieso_dluga: '/images/dishes/obiad_zapiekanka_ziemniaki_mieso_dluga.jpg',
  obiad_vege_tofu_bataty_cukinia: '/images/dishes/obiad_vege_tofu_bataty_cukinia.jpg',
  obiad_tunczyk_bowl_ziemniaki: '/images/dishes/obiad_tunczyk_bowl_ziemniaki.jpg',

  // Kolacje (100% z grafikami AI na ceramicznym talerzu z góry)
  kolacja_tortilla_mozzarella_szpinak: '/images/dishes/kolacja_tortilla_mozzarella_szpinak.jpg',
  kolacja_talerz_hummus_warzywa_tofu: '/images/dishes/kolacja_talerz_hummus_warzywa_tofu.jpg',
  kolacja_serek_wiejski_pomidory_chleb: '/images/dishes/kolacja_serek_wiejski_pomidory_chleb.jpg',

  // Przekąski (100% z grafikami AI na ceramicznym talerzu z góry)
  przekaska_skyr_jablko_wafle: '/images/dishes/przekaska_skyr_jablko_wafle.jpg',
  przekaska_kokosowy_jogurt_borowki: '/images/dishes/przekaska_kokosowy_jogurt_borowki.jpg',
  przekaska_hummus_warzywne_slupki: '/images/dishes/przekaska_hummus_warzywne_slupki.jpg',
  przekaska_kabanosy_pomidorki_sok: '/images/dishes/przekaska_kabanosy_pomidorki_sok.jpg',
};

/**
 * Zwraca URL zdjęcia potrawy na podstawie recipeId lub typu posiłku.
 */
export function getDishImageUrl(recipeId, mealType) {
  if (recipeId && DISH_IMAGES[recipeId]) {
    return DISH_IMAGES[recipeId];
  }
  if (mealType === 'sniadanie') return DISH_IMAGES.sniadanie_jajecznica_malinowe;
  if (mealType === 'obiad') return DISH_IMAGES.obiad_zapiekanka_ziemniaki_mieso_dluga;
  if (mealType === 'kolacja') return DISH_IMAGES.kolacja_tortilla_mozzarella_szpinak;
  return DISH_IMAGES.przekaska_hummus_warzywne_slupki;
}

