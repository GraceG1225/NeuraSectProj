export const DB_NAME = "ml_dashboard_local";
export const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains("datasets")) {
                db.createObjectStore("datasets", { keyPath: "id" });
            }

            if (!db.objectStoreNames.contains("models")) {
                db.createObjectStore("models", { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveFile(store: string, id: string, file: File) {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).put({ id, file });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function getAllFiles(store: string) {
    const db = await initDB();
    return new Promise<any[]>((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function deleteFile(store: string, id: string) {
    const db = await initDB();

    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        tx.objectStore(store).delete(id);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}