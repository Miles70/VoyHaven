function requestCoordinates(geolocation, options) {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        reject(new Error('Invalid device coordinates.'));
        return;
      }
      resolve({ latitude, longitude });
    }, reject, options);
  });
}

export async function getCurrentCoordinates(geolocation = globalThis.navigator?.geolocation) {
  if (!geolocation) throw new Error('Geolocation is unavailable.');
  try {
    return await requestCoordinates(geolocation, {
      enableHighAccuracy: true, timeout: 12000, maximumAge: 60000,
    });
  } catch (error) {
    // Retry temporary acquisition failures using the browser's standard provider.
    // A denied permission needs a user action and must not trigger another request.
    if (error.code !== 2 && error.code !== 3) throw error;
    return requestCoordinates(geolocation, {
      enableHighAccuracy: false, timeout: 15000, maximumAge: 60000,
    });
  }
}
