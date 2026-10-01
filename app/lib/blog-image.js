// Imágenes del blog optimizadas.
//
// Las originales son JPEG de Wikimedia de ~400-990 KB servidos a 1920px que se
// mostraban en tarjetas de ~350px: el blog llegaba a pesar 5,9 MB. Aquí se
// guardan versiones WebP en Supabase Storage:
//   480px  ~19-46 KB   (tarjeta en pantallas normales)
//   768px  ~47-114 KB  (tarjeta en pantallas retina)
//   1280px ~116-302 KB (portada del artículo a pantalla completa)
//
// El mapa se genera con scripts/blog_img_optimize.py. Si un artículo nuevo no
// está en el mapa se usa Wikimedia como respaldo (solo acepta 960/1280/1920),
// así el blog nunca se rompe cuando el cron publica un post nuevo.

const SUPABASE =
  'https://rattwfjkxgqvxmxlybcz.supabase.co/storage/v1/object/public/whatsapp-images/blog';

/** URL original de Wikimedia -> nombre del archivo optimizado. */
const OPTIMIZED = {
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Cows_shading_under_a_tree_on_Pen-y-crug.jpg/1920px-Cows_shading_under_a_tree_on_Pen-y-crug.jpg':
    'cows-shading-under-a-tree-on-pen-y-crug-9f9ac3',
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Grass_Track_descending_over_Green_Scar_Pasture_-_geograph.org.uk_-_5355406.jpg/1920px-Grass_Track_descending_over_Green_Scar_Pasture_-_geograph.org.uk_-_5355406.jpg':
    'grass-track-descending-over-green-scar-pasture-geograph-org--ea572d',
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Cattle_inspected_for_ticks.jpg/1920px-Cattle_inspected_for_ticks.jpg':
    'cattle-inspected-for-ticks-cc5c58',
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/92/Rough_pasture_at_Leorin_with_cattle_-_geograph.org.uk_-_3983705.jpg/1920px-Rough_pasture_at_Leorin_with_cattle_-_geograph.org.uk_-_3983705.jpg':
    'rough-pasture-at-leorin-with-cattle-geograph-org-uk-3983705-6b29f6',
  'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/Savanna_Grasslands_%28199168845%29.jpeg/1920px-Savanna_Grasslands_%28199168845%29.jpeg':
    'savanna-grasslands-28199168845-29-1b4ed5',
  'https://upload.wikimedia.org/wikipedia/commons/4/46/Cattle_in_corral_waiting_to_be_weighed_before_being_trailed_to_railroad%2C1a35023v.jpg':
    'cattle-in-corral-waiting-to-be-weighed-before-being-trailed--551c2c',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Drought_on_a_Montana_cattle_ranch%2C_May_2022.jpg/1920px-Drought_on_a_Montana_cattle_ranch%2C_May_2022.jpg':
    'drought-on-a-montana-cattle-ranch-2c-may-2022-9ac4c7',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Montana_drought%2C_aerial_view%2C_cattle_ranch_in_Fallon_County%2C_MT._June_2021.jpg/1920px-Montana_drought%2C_aerial_view%2C_cattle_ranch_in_Fallon_County%2C_MT._June_2021.jpg':
    'montana-drought-2c-aerial-view-2c-cattle-ranch-in-fallon-cou-acbbd0',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/A_dry%2C_sandy_range_in_New_Mexico_%2830472766780%29.jpg/1920px-A_dry%2C_sandy_range_in_New_Mexico_%2830472766780%29.jpg':
    'a-dry-2c-sandy-range-in-new-mexico-2830472766780-29-1bde41',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Cattle_in_Dam_Drinking_Water_in_Northern_Ghana.jpg/1920px-Cattle_in_Dam_Drinking_Water_in_Northern_Ghana.jpg':
    'cattle-in-dam-drinking-water-in-northern-ghana-fcf9b1',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Round_hay_bales_on_a_field%2C_with_hawkweed_in_the_foreground%2C_near_Durnal%2C_Yvoir%2C_2025.jpg/1920px-Round_hay_bales_on_a_field%2C_with_hawkweed_in_the_foreground%2C_near_Durnal%2C_Yvoir%2C_2025.jpg':
    'round-hay-bales-on-a-field-2c-with-hawkweed-in-the-foregroun-2bb76c',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Cross_fencing_installed_in_pastureland_field_and_is_being_utilized_in_a_rotational_grazing_system_%2825090222296%29.jpg/1920px-Cross_fencing_installed_in_pastureland_field_and_is_being_utilized_in_a_rotational_grazing_system_%2825090222296%29.jpg':
    'cross-fencing-installed-in-pastureland-field-and-is-being-ut-4200b5',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Harvest_Straw_Bales_in_Schleswig-Holstein.jpg/1920px-Harvest_Straw_Bales_in_Schleswig-Holstein.jpg':
    'harvest-straw-bales-in-schleswig-holstein-9d37e6',
};

/** Tamaños que Wikimedia acepta en sus miniaturas (el resto da HTTP 400). */
const WIKI_WIDTHS = [960, 1280, 1920];

/** Nombre del archivo original a partir de una URL de Wikimedia. */
function wikiName(url) {
  const thumb = url.match(/\/thumb\/\w\/\w\w\/([^/]+)\/\d+px-/);
  if (thumb) return thumb[1];
  return url.split('/').pop() || '';
}

/** Convierte una URL de Wikimedia a la miniatura del ancho pedido. */
function wikiThumb(url, width) {
  const name = wikiName(url);
  if (!name) return url;
  if (url.includes('/thumb/')) {
    return url.replace(/\/\d+px-.+$/, `/${width}px-${name}`);
  }
  const m = url.match(/\/commons\/(\w)\/(\w\w)\//);
  if (!m) return url;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${name}/${width}px-${name}`;
}

/** URL única (respaldo para el atributo src si el navegador ignora srcset). */
export function blogImageUrl(url, width = 480) {
  if (!url) return url;
  const slug = OPTIMIZED[url];
  if (slug) {
    const w = width >= 900 ? 1280 : width >= 600 ? 768 : 480;
    return `${SUPABASE}/${slug}-${w}.webp`;
  }
  return wikiThumb(url, width >= 900 ? 1280 : 960);
}

/** srcset de tarjeta: hasta 768px (el móvil retina se queda ahí, no en 1280). */
export function blogCardSrcSet(url) {
  if (!url) return undefined;
  const slug = OPTIMIZED[url];
  if (slug) {
    return `${SUPABASE}/${slug}-480.webp 480w, ${SUPABASE}/${slug}-768.webp 768w`;
  }
  return [960, 1280].map((w) => `${wikiThumb(url, w)} ${w}w`).join(', ');
}

/** srcset de la portada del artículo. */
export function blogHeroSrcSet(url) {
  if (!url) return undefined;
  const slug = OPTIMIZED[url];
  if (slug) {
    return (
      `${SUPABASE}/${slug}-480.webp 480w, ` +
      `${SUPABASE}/${slug}-768.webp 768w, ` +
      `${SUPABASE}/${slug}-1280.webp 1280w`
    );
  }
  return WIKI_WIDTHS.map((w) => `${wikiThumb(url, w)} ${w}w`).join(', ');
}
