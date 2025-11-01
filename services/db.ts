import { openDB, DBSchema, IDBPTransaction } from 'idb';
import { StoredReport, User } from '../types';

const DB_NAME = 'VendorThreatDB';
const DB_VERSION = 3; 
const REPORTS_STORE_NAME = 'reports';
const USERS_STORE_NAME = 'users';

interface VendorDB extends DBSchema {
  [REPORTS_STORE_NAME]: {
    key: number;
    value: StoredReport;
    indexes: { 'domain': string; 'by_userId': number };
  };
  [USERS_STORE_NAME]: {
    key: number;
    value: User;
    indexes: { 'email': string };
  }
}

async function getDB() {
  return openDB<VendorDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 2) {
          // Handled in previous versions
      }
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(REPORTS_STORE_NAME)) {
            const reportStore = db.createObjectStore(REPORTS_STORE_NAME, { 
                keyPath: 'id', 
                autoIncrement: true 
            });
            reportStore.createIndex('domain', 'domain');
        }
        // FIX: Use the transaction object provided by the upgrade callback to get the object store.
        const reportStore = transaction.objectStore(REPORTS_STORE_NAME);
        if (!reportStore.indexNames.contains('by_userId')) {
            reportStore.createIndex('by_userId', 'userId');
        }
        
        if (!db.objectStoreNames.contains(USERS_STORE_NAME)) {
            const userStore = db.createObjectStore(USERS_STORE_NAME, {
                keyPath: 'id',
                autoIncrement: true,
            });
            userStore.createIndex('email', 'email', { unique: true });
        }
      }
    },
  });
}

// User Functions
export async function addUser(user: Omit<User, 'id'>): Promise<User> {
    const db = await getDB();
    const id = await db.add(USERS_STORE_NAME, user as User);
    return { ...user, id };
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    const db = await getDB();
    return db.getFromIndex(USERS_STORE_NAME, 'email', email);
}

export async function getUserById(id: number): Promise<User | undefined> {
    const db = await getDB();
    return db.get(USERS_STORE_NAME, id);
}


// Report Functions
export async function saveReport(report: StoredReport): Promise<StoredReport> {
  const db = await getDB();
  const id = await db.put(REPORTS_STORE_NAME, report);
  return { ...report, id };
}

export async function getReportById(id: number): Promise<StoredReport | undefined> {
    const db = await getDB();
    return db.get(REPORTS_STORE_NAME, id);
}

export async function getAllReports(userId: number): Promise<StoredReport[]> {
  const db = await getDB();
  const reports = await db.getAllFromIndex(REPORTS_STORE_NAME, 'by_userId', userId);
  return reports.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteReport(id: number): Promise<void> {
    const db = await getDB();
    await db.delete(REPORTS_STORE_NAME, id);
}

export async function clearAllReports(userId: number): Promise<void> {
  const db = await getDB();
  const keys = await db.getAllKeysFromIndex(REPORTS_STORE_NAME, 'by_userId', userId);
  const tx = db.transaction(REPORTS_STORE_NAME, 'readwrite');
  await Promise.all([...keys.map(key => tx.store.delete(key)), tx.done]);
}