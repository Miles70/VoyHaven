export const defaultHotelFilters = { name: "", stars: "", rating: "", maxPrice: "", sort: "recommended" };

const numeric = (value) => value == null || String(value).trim() === "" ? null : Number.isFinite(Number(value)) ? Number(value) : null;
const searchText = (value) => String(value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();
export function hotelCurrencies(hotels) {
  return [...new Set(hotels.map((hotel) => hotel.offer?.suggestedSellingPrice?.currency).filter(Boolean))];
}

export function filterHotelResults(hotels, filters) {
  const oneCurrency = hotelCurrencies(hotels).length === 1;
  const name = searchText(filters.name).trim();
  const visible = hotels.filter((hotel) => {
    if (name && !searchText(hotel.name).includes(name)) return false;
    if (filters.stars && (numeric(hotel.stars) ?? -1) < Number(filters.stars)) return false;
    if (filters.rating && (numeric(hotel.rating) ?? -1) < Number(filters.rating)) return false;
    const price = numeric(hotel.offer?.suggestedSellingPrice?.amount);
    if (oneCurrency && filters.maxPrice !== "" && (price === null || price > Number(filters.maxPrice))) return false;
    return true;
  });
  if (filters.sort === "rating") visible.sort((a, b) => (numeric(b.rating) ?? -1) - (numeric(a.rating) ?? -1));
  if (oneCurrency && ["priceAsc", "priceDesc"].includes(filters.sort)) {
    const direction = filters.sort === "priceAsc" ? 1 : -1;
    visible.sort((a, b) => {
      const left = numeric(a.offer?.suggestedSellingPrice?.amount);
      const right = numeric(b.offer?.suggestedSellingPrice?.amount);
      if (left === null) return right === null ? 0 : 1;
      if (right === null) return -1;
      return direction * (left - right);
    });
  }
  return visible;
}

export function showcaseDestinations(hotels) {
  const cities = new Map();
  for (const hotel of hotels) {
    const city = hotel.showcaseCity || hotel.city_name;
    const country = hotel.showcaseCountryCode || hotel.countryCode || hotel.country;
    if (!city || city === "Global" || !hotel.main_photo) continue;
    const key = `${String(country || "").toUpperCase()}:${searchText(city)}`;
    if (!cities.has(key)) cities.set(key, { key, city, country, image: hotel.main_photo });
  }
  return [...cities.values()].slice(0, 6);
}
