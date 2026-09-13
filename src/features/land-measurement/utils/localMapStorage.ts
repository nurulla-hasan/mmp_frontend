const DB_NAME = 'mmp-land-measurement';
const DB_VERSION = 1;
const MAP_STORE = 'maps';
const DRAFT_STORE = 'drafts';
const DRAFT_KEY = 'current';

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
  if (draft.version !== 1 || typeof draft.savedAt !== 'number' || !Array.isArray(draft.plots) || !Array.isArray(draft.plotPoints)) return null;
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
