const DB_NAME = 'mmp-land-measurement';
const DB_VERSION = 2;
const MAP_STORE = 'maps';
const DRAFT_STORE = 'drafts';
const THUMBNAIL_STORE = 'thumbnails';
const DRAFT_KEY = 'current';
const THUMBNAIL_MAX_WIDTH = 360;
const THUMBNAIL_MAX_HEIGHT = 240;

export type LandMeasurementDraft = {
  version: 1;
  savedAt: number;
  mapName: string;
  scale: number | null;
  plots: unknown[];
  plotPoints: unknown[];
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MAP_STORE)) db.createObjectStore(MAP_STORE);
      if (!db.objectStoreNames.contains(DRAFT_STORE)) db.createObjectStore(DRAFT_STORE);
      if (!db.objectStoreNames.contains(THUMBNAIL_STORE)) db.createObjectStore(THUMBNAIL_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB could not be opened'));
  });
}

async function transact<T>(
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const request = action(tx.objectStore(storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
      tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
    });
  } finally {
    db.close();
  }
}

export async function saveLocalCalculationMap(calculationId: string, file: File): Promise<void> {
  await transact(MAP_STORE, 'readwrite', (store) => store.put(file, calculationId));
}

export async function getLocalCalculationMap(calculationId: string): Promise<File | null> {
  const value = await transact<unknown>(MAP_STORE, 'readonly', (store) => store.get(calculationId));
  if (value instanceof File) return value;
  if (value instanceof Blob) return new File([value], 'mouza-map', { type: value.type });
  return null;
}

export async function deleteLocalCalculationMap(calculationId: string): Promise<void> {
  await transact(MAP_STORE, 'readwrite', (store) => store.delete(calculationId));
}

export async function saveLocalCalculationThumbnail(
  calculationId: string,
  thumbnail: Blob,
): Promise<void> {
  await transact(THUMBNAIL_STORE, 'readwrite', (store) => store.put(thumbnail, calculationId));
}

export async function getLocalCalculationThumbnail(calculationId: string): Promise<Blob | null> {
  const value = await transact<unknown>(THUMBNAIL_STORE, 'readonly', (store) => store.get(calculationId));
  return value instanceof Blob ? value : null;
}

export async function deleteLocalCalculationThumbnail(calculationId: string): Promise<void> {
  await transact(THUMBNAIL_STORE, 'readwrite', (store) => store.delete(calculationId));
}

function createThumbnailBlob(image: HTMLImageElement): Promise<Blob | null> {
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  if (!sourceWidth || !sourceHeight) return Promise.resolve(null);

  const ratio = Math.min(
    THUMBNAIL_MAX_WIDTH / sourceWidth,
    THUMBNAIL_MAX_HEIGHT / sourceHeight,
    1,
  );
  const width = Math.max(1, Math.round(sourceWidth * ratio));
  const height = Math.max(1, Math.round(sourceHeight * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return Promise.resolve(null);

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.78);
  });
}

export async function saveLocalCalculationThumbnailFromImage(
  calculationId: string,
  image: HTMLImageElement,
): Promise<void> {
  const blob = await createThumbnailBlob(image);
  if (!blob) return;
  await saveLocalCalculationThumbnail(calculationId, blob);
}

export async function deleteLocalCalculationAssets(calculationId: string): Promise<void> {
  await Promise.all([
    deleteLocalCalculationMap(calculationId),
    deleteLocalCalculationThumbnail(calculationId),
  ]);
}

export async function saveDraftMap(file: File): Promise<void> {
  await transact(MAP_STORE, 'readwrite', (store) => store.put(file, DRAFT_KEY));
}

export async function getDraftMap(): Promise<File | null> {
  const value = await transact<unknown>(MAP_STORE, 'readonly', (store) => store.get(DRAFT_KEY));
  if (value instanceof File) return value;
  if (value instanceof Blob) return new File([value], 'mouza-map', { type: value.type });
  return null;
}

export async function saveLandMeasurementDraft(draft: LandMeasurementDraft): Promise<void> {
  await transact(DRAFT_STORE, 'readwrite', (store) => store.put(draft, DRAFT_KEY));
}

export async function getLandMeasurementDraft(): Promise<LandMeasurementDraft | null> {
  const value = await transact<unknown>(DRAFT_STORE, 'readonly', (store) => store.get(DRAFT_KEY));
  if (!value || typeof value !== 'object') return null;
  const draft = value as Partial<LandMeasurementDraft>;
  if (
    draft.version !== 1 ||
    typeof draft.savedAt !== 'number' ||
    !Array.isArray(draft.plots) ||
    !Array.isArray(draft.plotPoints)
  ) {
    return null;
  }
  return draft as LandMeasurementDraft;
}

export async function clearLandMeasurementDraft(): Promise<void> {
  const db = await openDb();
  try {
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(DRAFT_STORE, 'readwrite');
        const request = tx.objectStore(DRAFT_STORE).delete(DRAFT_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(MAP_STORE, 'readwrite');
        const request = tx.objectStore(MAP_STORE).delete(DRAFT_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
    ]);
  } finally {
    db.close();
  }
}
