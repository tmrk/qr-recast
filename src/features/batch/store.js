import { useCallback, useEffect, useState } from 'react';

export const batchStorageKey = 'qr-recast:batch:v1';
export const batchSchemaVersion = 1;
export const batchNameMaxLength = 64;
export const batchResumeEvent = 'qr-recast:batch-resume-requested';

const batchChangeEvent = 'qr-recast:batch-changed';
const emptyBatch = Object.freeze({
  items: [],
  updatedAt: '',
  version: batchSchemaVersion,
});

export function readBatch() {
  if (typeof window === 'undefined') {
    return emptyBatch;
  }

  try {
    const storedValue = window.localStorage.getItem(batchStorageKey);

    if (!storedValue) {
      return emptyBatch;
    }

    return migrateBatch(JSON.parse(storedValue));
  } catch {
    return emptyBatch;
  }
}

export async function createBatchItem(
  payload,
  { brandingEnabled = true, name, position = 1, version, exactSvg } = {},
) {
  const { detectQrType } = await import('../../lib/qr-types/index.js');
  const now = new Date().toISOString();
  const qrType = detectQrType(payload);
  const itemName = normaliseBatchName(name, `${stringsSafeDefaultName()} ${position}`);
  const safeVersion =
    Number.isInteger(version) && version >= 1 && version <= 40 ? version : undefined;
  const safeExact =
    typeof exactSvg === 'string' && exactSvg.includes('<svg') ? exactSvg : undefined;

  return {
    id: createId(),
    name: itemName,
    payload,
    version: safeVersion,
    exactSvg: safeExact,
    type: serialiseQrType(qrType),
    branding: {
      enabled: Boolean(brandingEnabled),
      kind: qrType.branding?.kind ?? qrType.type,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function normaliseBatchName(value, fallback) {
  const trimmedValue = String(value ?? '').trim();
  const safeValue = trimmedValue || fallback || stringsSafeDefaultName();

  return Array.from(safeValue).slice(0, batchNameMaxLength).join('');
}

export function useBatchStore() {
  const [batch, setBatch] = useState(() => readBatch());
  const [persistenceError, setPersistenceError] = useState(false);

  const saveBatch = useCallback((nextBatch) => {
    setBatch(nextBatch);
    setPersistenceError(!writeBatch(nextBatch));
  }, []);

  const addPayload = useCallback(
    async (payload, { brandingEnabled, version, exactSvg } = {}) => {
      const duplicate = batch.items.some((item) => item.payload === payload);
      const item = await createBatchItem(payload, {
        brandingEnabled,
        position: batch.items.length + 1,
        version,
        exactSvg,
      });
      const nextBatch = stampBatch({
        ...batch,
        items: [...batch.items, item],
      });

      saveBatch(nextBatch);

      return { duplicate, item };
    },
    [batch, saveBatch],
  );

  const renameItem = useCallback(
    (itemId, name) => {
      const currentItem = batch.items.find((item) => item.id === itemId);

      if (!currentItem) {
        return;
      }

      const nextBatch = stampBatch({
        ...batch,
        items: batch.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                name: normaliseBatchName(name, currentItem.name),
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      });

      saveBatch(nextBatch);
    },
    [batch, saveBatch],
  );

  const removeItem = useCallback(
    (itemId) => {
      const itemIndex = batch.items.findIndex((item) => item.id === itemId);

      if (itemIndex < 0) {
        return null;
      }

      const [item] = batch.items.slice(itemIndex, itemIndex + 1);
      const nextBatch = stampBatch({
        ...batch,
        items: batch.items.filter((candidate) => candidate.id !== itemId),
      });

      saveBatch(nextBatch);

      return { item, itemIndex };
    },
    [batch, saveBatch],
  );

  const restoreItem = useCallback(
    (item, itemIndex) => {
      const nextItems = [...batch.items];
      const insertIndex = Math.min(Math.max(itemIndex, 0), nextItems.length);

      nextItems.splice(insertIndex, 0, item);
      saveBatch(stampBatch({ ...batch, items: nextItems }));
    },
    [batch, saveBatch],
  );

  const moveItem = useCallback(
    (itemId, targetIndex) => {
      const itemIndex = batch.items.findIndex((item) => item.id === itemId);

      if (itemIndex < 0) {
        return;
      }

      const nextItems = [...batch.items];
      const [item] = nextItems.splice(itemIndex, 1);
      const insertIndex = Math.min(Math.max(targetIndex, 0), nextItems.length);

      nextItems.splice(insertIndex, 0, {
        ...item,
        updatedAt: new Date().toISOString(),
      });
      saveBatch(stampBatch({ ...batch, items: nextItems }));
    },
    [batch, saveBatch],
  );

  const clearBatch = useCallback(() => {
    saveBatch(stampBatch({ ...emptyBatch, items: [] }));
  }, [saveBatch]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    function syncBatch(event) {
      if (event instanceof CustomEvent) {
        setBatch(event.detail);
        return;
      }

      setBatch(readBatch());
    }

    function syncStorage(event) {
      if (event.key === batchStorageKey) {
        setBatch(readBatch());
      }
    }

    window.addEventListener(batchChangeEvent, syncBatch);
    window.addEventListener('storage', syncStorage);

    return () => {
      window.removeEventListener(batchChangeEvent, syncBatch);
      window.removeEventListener('storage', syncStorage);
    };
  }, []);

  return {
    addPayload,
    batch,
    clearBatch,
    moveItem,
    persistenceError,
    removeItem,
    renameItem,
    restoreItem,
  };
}

export function requestBatchResume() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(batchResumeEvent));
}

function migrateBatch(value) {
  if (value?.version !== batchSchemaVersion || !Array.isArray(value.items)) {
    return emptyBatch;
  }

  return {
    version: batchSchemaVersion,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : '',
    items: value.items.map(normaliseStoredItem).filter(Boolean),
  };
}

function normaliseStoredItem(item) {
  if (!item?.id || typeof item.payload !== 'string') {
    return null;
  }

  const qrType = item.type?.type ? item.type : createFallbackQrType();
  const fallbackName = `${stringsSafeDefaultName()} 1`;
  const safeVersion =
    Number.isInteger(item.version) && item.version >= 1 && item.version <= 40
      ? item.version
      : undefined;

  return {
    id: String(item.id),
    name: normaliseBatchName(item.name, fallbackName),
    payload: item.payload,
    version: safeVersion,
    exactSvg:
      typeof item.exactSvg === 'string' && item.exactSvg.includes('<svg')
        ? item.exactSvg
        : undefined,
    type: serialiseQrType(qrType),
    branding: {
      enabled: item.branding?.enabled !== false,
      kind: item.branding?.kind ?? qrType.type,
    },
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
  };
}

function serialiseQrType(qrType) {
  return {
    branding: qrType.branding ?? { kind: qrType.type },
    confidence: Number(qrType.confidence) || 0,
    fields: Array.isArray(qrType.fields) ? qrType.fields : [],
    icon: qrType.icon ?? qrType.type,
    label: qrType.label ?? qrType.type,
    type: qrType.type ?? 'plain-text',
  };
}

function createFallbackQrType() {
  return {
    branding: { kind: 'plain-text' },
    confidence: 0,
    fields: [],
    icon: 'plain-text',
    label: 'Plain text',
    type: 'plain-text',
  };
}

function stampBatch(batch) {
  return {
    ...batch,
    updatedAt: new Date().toISOString(),
    version: batchSchemaVersion,
  };
}

function writeBatch(batch) {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    window.localStorage.setItem(batchStorageKey, JSON.stringify(batch));
    window.dispatchEvent(new CustomEvent(batchChangeEvent, { detail: batch }));
    return true;
  } catch {
    return false;
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function stringsSafeDefaultName() {
  return 'QR';
}
