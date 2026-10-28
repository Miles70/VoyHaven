// Zero pieces is used by some suppliers for a weight-based allowance.
// Keep the positive weight without inventing a piece count or hiding it.
export function baggageText(bag, labels, language = 'en') {
 if (!bag || typeof bag !== 'object') return '';
 const kind = labels[bag.bagType] || (typeof bag.description === 'string' ? bag.description : labels.unspecified);
 const positive = value => value !== null && value !== '' && Number.isFinite(Number(value)) && Number(value) > 0;
 const quantity = [];
 if (positive(bag.pieces)) quantity.push(`${new Intl.NumberFormat(language).format(Number(bag.pieces))} ${labels.pieces}`);
 if (positive(bag.weightKg)) quantity.push(`${new Intl.NumberFormat(language).format(Number(bag.weightKg))} kg`);
 const description = typeof bag.description === 'string' && /\d/.test(bag.description) ? ` · ${bag.description}` : '';
 return `${kind}: ${quantity.join(' · ') || labels.unspecified}${description}`;
}
export function baggageRows(value) {
 return Array.isArray(value) ? value.filter(bag => bag && typeof bag === 'object') : [];
}
