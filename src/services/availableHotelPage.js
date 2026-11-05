// Skip unavailable catalog pages without dropping the chosen location/type.
export async function findAvailableHotelPage({ location, offset = 0, listCatalog, readRates, hasOffers, maxPages = 5 }) {
  let catalog, rates, nextOffset = offset, hasMore = false;
  for (let page = 0; page < maxPages; page += 1) {
    catalog = await listCatalog({ ...location, limit: 20, offset: nextOffset });
    const raw = catalog?.hotelIds;
    const ids = (Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split(',').filter(Boolean) : (catalog?.data || []).map(hotel => hotel.id)).slice(0, 20);
    if (!ids.length) return { catalog, rates: null, nextOffset, hasMore: false };
    nextOffset += ids.length;
    hasMore = nextOffset < Number(catalog.total || 0);
    rates = await readRates(ids);
    if (hasOffers(rates) || !hasMore) break;
  }
  return { catalog, rates, nextOffset, hasMore };
}
