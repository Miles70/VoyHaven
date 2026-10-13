// Migrate existing sessions and preferences without signing users out.
function legacyKey(key) {
  return key.replace(/^voyhaven_/, 'rotavoy_');
}

export function readBrandedStorage(storage, key) {
  const current = storage.getItem(key);
  const previousKey = legacyKey(key);
  if (current !== null || previousKey === key) return current;
  const previous = storage.getItem(previousKey);
  if (previous === null) return null;
  try {
    storage.setItem(key, previous);
    storage.removeItem(previousKey);
  } catch { /* A full or restricted store must not discard an existing session. */ }
  return previous;
}

export function writeBrandedStorage(storage, key, value) {
  storage.setItem(key, value);
  const previousKey = legacyKey(key);
  if (previousKey !== key) storage.removeItem(previousKey);
}

export function removeBrandedStorage(storage, key) {
  storage.removeItem(key);
  const previousKey = legacyKey(key);
  if (previousKey !== key) storage.removeItem(previousKey);
}
