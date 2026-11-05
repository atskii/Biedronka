/**
 * Mapowanie identyfikatorów produktów z katalogu Biedronki na lokalne zdjęcia produktowe.
 * Wszystkie zdjęcia są zapisane lokalnie w public/images/products/.
 */
export const PRODUCT_IMAGES = {
  // Warzywa i owoce
  pomidory_malinowe: '/images/products/pomidory_malinowe.jpg',
  pomidory_koktajlowe_promo: '/images/products/pomidory_koktajlowe_promo.jpg',
  pomidory_rzymskie: '/images/products/pomidory_rzymskie.jpg',
  papryka_czerwona_fit: '/images/products/papryka_czerwona_fit.jpg',
  ogorek_zielony_fit: '/images/products/ogorek_zielony_fit.jpg',
  brokul_swiezy: '/images/products/brokul_swiezy.jpg',
  cukinia_zielona_promo: '/images/products/cukinia_zielona_promo.jpg',
  szpinak_baby_fit: '/images/products/szpinak_baby_fit.jpg',
  mix_salat_fit: '/images/products/mix_salat_fit.jpg',
  ziemniaki_mlode_promo: '/images/products/ziemniaki_mlode_promo.jpg',
  bataty_fit: '/images/products/bataty_fit.jpg',
  banany_promo: '/images/products/banany_promo.jpg',
  borowki_fit: '/images/products/borowki_fit.jpg',
  jablka_polskie_promo: '/images/products/jablka_polskie_promo.jpg',
  awokado_hass_fit: '/images/products/awokado_hass_fit.jpg',
  pieczarki_swieze: '/images/products/pieczarki_swieze.jpg',

  // Pieczywo
  chleb_zytni_fit: '/images/products/chleb_zytni_fit.jpg',
  bulki_kajzerki_promo: '/images/products/bulki_kajzerki_promo.jpg',
  chleb_proteinowy_fit: '/images/products/chleb_proteinowy_fit.jpg',
  tortilla_pszenna_promo: '/images/products/tortilla_pszenna_promo.jpg',
  wafle_ryzowe_bg_fit: '/images/products/wafle_ryzowe_bg_fit.jpg',
  chleb_bezglutenowy_fit: '/images/products/chleb_bezglutenowy_fit.jpg',

  // Nabiał
  skyr_naturalny_fit: '/images/products/skyr_naturalny_fit.jpg',
  jogurt_grecki_promo: '/images/products/jogurt_grecki_promo.jpg',
  jogurt_kokosowy_govege_fit: '/images/products/jogurt_kokosowy_govege_fit.jpg',
  twarog_chudy_fit: '/images/products/twarog_chudy_fit.jpg',
  serek_wiejski_lekki_fit: '/images/products/serek_wiejski_lekki_fit.jpg',
  mozzarella_light_fit: '/images/products/mozzarella_light_fit.jpg',
  ser_gouda_promo: '/images/products/ser_gouda_promo.jpg',
  jajka_wiejskie_promo: '/images/products/jajka_wiejskie_promo.jpg',
  mleko_bez_laktozy_promo: '/images/products/mleko_bez_laktozy_promo.jpg',

  // Wędliny i roślinne
  szynka_z_indyka_fit: '/images/products/szynka_z_indyka_fit.jpg',
  szynka_konserwowa_promo: '/images/products/szynka_konserwowa_promo.jpg',
  kabanosy_drobiowe_promo: '/images/products/kabanosy_drobiowe_promo.jpg',
  tofu_wedzone_govege_fit: '/images/products/tofu_wedzone_govege_fit.jpg',
  tofu_naturalne_govege_fit: '/images/products/tofu_naturalne_govege_fit.jpg',
  hummus_klasyczny_govege: '/images/products/hummus_klasyczny_govege.jpg',

  // Mięso
  filet_z_kurczaka_promo: '/images/products/filet_z_kurczaka_promo.jpg',
  mieso_mielone_indyk_fit: '/images/products/mieso_mielone_indyk_fit.jpg',
  mieso_mielone_lopatka_promo: '/images/products/mieso_mielone_lopatka_promo.jpg',
  polędwiczki_z_kurczaka_fit: '/images/products/polędwiczki_z_kurczaka_fit.jpg',

  // Ryby
  tunczyk_w_sosie_wlasnym_fit: '/images/products/tunczyk_w_sosie_wlasnym_fit.jpg',
  losos_wedzony_marinero_fit: '/images/products/losos_wedzony_marinero_fit.jpg',
  makrela_wedzona_promo: '/images/products/makrela_wedzona_promo.jpg',

  // Napoje
  woda_polaris_promo: '/images/products/woda_polaris_promo.jpg',
  napoj_owsiany_govege_fit: '/images/products/napoj_owsiany_govege_fit.jpg',
  sok_pomaranczowy_riviva_promo: '/images/products/sok_pomaranczowy_riviva_promo.jpg',
};

/**
 * Zwraca URL zdjęcia dla danego produktu lub null, jeśli brak zdjęcia w bazie.
 */
export function getProductImageUrl(productId) {
  return PRODUCT_IMAGES[productId] || (productId ? `/images/products/${productId}.jpg` : null);
}

