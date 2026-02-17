import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'azur-os-pwa';
const DB_VERSION = 1;

export interface PWAData {
  meetings: any[];
  pendingActions: {
    id: string;
    type: 'ACCEPT_TASK' | 'REJECT_TASK';
    payload: any;
    timestamp: number;
  }[];
}

export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('meetings')) {
        db.createObjectStore('meetings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('config')) {
        db.createObjectStore('config');
      }
    },
  });
}

// Meetings Logic
export async function saveMeetingsToLocal(meetings: any[]) {
  const db = await getDB();
  const tx = db.transaction('meetings', 'readwrite');
  await tx.objectStore('meetings').clear();
  for (const meeting of meetings) {
    await tx.objectStore('meetings').put(meeting);
  }
  await tx.done;
}

export async function getLocalMeetings() {
  const db = await getDB();
  return db.getAll('meetings');
}

// Sync Queue Logic
export async function queueAction(type: 'ACCEPT_TASK' | 'REJECT_TASK', payload: any) {
  const db = await getDB();
  const id = crypto.randomUUID();
  await db.put('pending-actions', {
    id,
    type,
    payload,
    timestamp: Date.now(),
  });
  
  // Register sync if service worker is available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    try {
      await (registration as any).sync.register('sync-actions');
      console.log('Background sync registered');
    } catch (err) {
      console.error('Background sync registration failed:', err);
    }
  }
}

export async function getPendingActions() {
  const db = await getDB();
  return db.getAll('pending-actions');
}

export async function clearAction(id: string) {
  const db = await getDB();
  await db.delete('pending-actions', id);
}

export async function clearAllLocalData() {
  const db = await getDB();
  const tx = db.transaction(['meetings', 'pending-actions'], 'readwrite');
  await tx.objectStore('meetings').clear();
  await tx.objectStore('pending-actions').clear();
  await tx.done;
}
