// LiteAPI property classifications; do not infer a type from a property's name.
export const accommodationTypeIds = [204, 219, 201, 213, 220, 216, 208, 203, 206, 222, 228, 257, 250, 225, 274];
export function normalizeAccommodationType(value) {
  if (value === undefined || value === null || value === '') return '';
  const text = String(value);
  return /^\d+$/.test(text) && accommodationTypeIds.includes(Number(text)) ? String(Number(text)) : '';
}
export function attachAccommodationTypes(hotels, catalog) {
  const types = new Map((catalog?.data || []).map(hotel => [hotel.id || hotel.hotelId, hotel.hotelTypeId]));
  return hotels.map(hotel => ({ ...hotel, hotelTypeId: types.get(hotel.hotelId) ?? hotel.hotelTypeId }));
}
