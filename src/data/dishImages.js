/**
 * Mapowanie identyfikatorów przepisów (dań) z katalogu Biedronki na apetyczne zdjęcia gotowych potraw.
 * Zoptymalizowane pod kątem wyświetlania na kartach posiłków oraz w modalu modyfikacji potrawy.
 */
export const DISH_IMAGES = {
  // Śniadania
  sniadanie_jajecznica_malinowe:
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=640&h=360&q=80',
  sniadanie_bowl_skyr_owoce:
    'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=640&h=360&q=80',
  sniadanie_kanapki_indyk_warzywa:
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=640&h=360&q=80',
  sniadanie_tofucznica_awokado:
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=640&h=360&q=80',
  sniadanie_omlet_twarog_papryka:
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=640&h=360&q=80',

  // Obiady
  obiad_kurczak_pieczone_ziemniaki_brokul:
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=640&h=360&q=80',
  obiad_tortilla_indyk_warzywa:
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=640&h=360&q=80',
  obiad_zapiekanka_ziemniaki_mieso_dluga:
    'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=640&h=360&q=80',
  obiad_vege_tofu_bataty_cukinia:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=640&h=360&q=80',
  obiad_tunczyk_bowl_ziemniaki:
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=640&h=360&q=80',
  obiad_vege_zapiekanka_warzywna_2h:
    'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=640&h=360&q=80',

  // Kolacje
  kolacja_salatka_losos_awokado:
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=640&h=360&q=80',
  kolacja_tortilla_mozzarella_szpinak:
    'https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=640&h=360&q=80',
  kolacja_talerz_hummus_warzywa_tofu:
    'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=640&h=360&q=80',
  kolacja_serek_wiejski_pomidory_chleb:
    'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?auto=format&fit=crop&w=640&h=360&q=80',

  // Przekąski
  przekaska_skyr_jablko_wafle:
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=640&h=360&q=80',
  przekaska_kokosowy_jogurt_borowki:
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=640&h=360&q=80',
  przekaska_hummus_warzywne_slupki:
    'https://images.unsplash.com/photo-1607532941433-304659e8198a?auto=format&fit=crop&w=640&h=360&q=80',
  przekaska_kabanosy_pomidorki_sok:
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=640&h=360&q=80',
};

/**
 * Zwraca URL zdjęcia potrawy na podstawie recipeId lub typu posiłku.
 */
export function getDishImageUrl(recipeId, mealType) {
  if (recipeId && DISH_IMAGES[recipeId]) {
    return DISH_IMAGES[recipeId];
  }
  if (mealType === 'sniadanie') return DISH_IMAGES.sniadanie_jajecznica_malinowe;
  if (mealType === 'obiad') return DISH_IMAGES.obiad_kurczak_pieczone_ziemniaki_brokul;
  if (mealType === 'kolacja') return DISH_IMAGES.kolacja_salatka_losos_awokado;
  return DISH_IMAGES.przekaska_skyr_jablko_wafle;
}

