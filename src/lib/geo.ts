import type { CitySlug } from './seo/slugs';
import { getSelectedCity } from './city-utils';

export async function getGeoCity(): Promise<CitySlug> {
  return getSelectedCity();
  // + IPAPI в будущем
}
