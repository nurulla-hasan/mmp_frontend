import type { GoogleMapsApi } from '../types';

type GoogleWindow = Window & {
  google?: { maps?: GoogleMapsApi };
  __mouzaGeoMapsReady?: () => void;
};

let loadingPromise: Promise<GoogleMapsApi> | null = null;

export function getLoadedGoogleMaps(): GoogleMapsApi | null {
  if (typeof window === 'undefined') return null;
  return (window as GoogleWindow).google?.maps ?? null;
}

export function loadGoogleMaps(apiKey: string): Promise<GoogleMapsApi> {
  const loaded = getLoadedGoogleMaps();
  if (loaded) return Promise.resolve(loaded);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const googleWindow = window as GoogleWindow;
    const callbackName = '__mouzaGeoMapsReady';
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-mouza-geo-google-maps]',
    );

    googleWindow[callbackName] = () => {
      const maps = getLoadedGoogleMaps();
      delete googleWindow[callbackName];
      if (maps) resolve(maps);
      else reject(new Error('Google Maps API load হয়নি'));
    };

    if (existingScript) return;

    const script = document.createElement('script');
    const params = new URLSearchParams({
      key: apiKey,
      loading: 'async',
      callback: callbackName,
      v: 'weekly',
      language: 'bn',
      region: 'BD',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.dataset.mouzaGeoGoogleMaps = 'true';
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error('Google Maps script load হয়নি'));
    };
    document.head.appendChild(script);
  });

  return loadingPromise;
}
