// ================================================
// PERMANENT BROWSER STORAGE FOR NETFLIXX BYPASS
// ================================================

const DB = "netflixxBypassDB";
const STORE = "titles";
const DB_VERSION = 1;

let db;

function openDB() {
  return new Promise((resolve, reject) => {

    const request = indexedDB.open(DB, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, {
          keyPath: "id"
        });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error);
    };

  });
}


// ================================================
// SAVE UPLOADED MOVIE PERMANENTLY
// ================================================

function saveTitle(item) {
  return new Promise((resolve, reject) => {

    const transaction = db.transaction(
      STORE,
      "readwrite"
    );

    transaction.objectStore(STORE).put(item);

    transaction.oncomplete = () => resolve(true);

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.onabort = () => {
      reject(transaction.error);
    };

  });
}


// ================================================
// LOAD ALL PREVIOUSLY UPLOADED VIDEOS
// ================================================

function getAll() {
  return new Promise((resolve, reject) => {

    const transaction = db.transaction(STORE, "readonly");

    const request = transaction.objectStore(STORE).getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };

  });
}


// ================================================
// ADMIN-ONLY DELETE FUNCTION
// ================================================

function deleteTitle(id) {
  return new Promise((resolve, reject) => {

    const transaction = db.transaction(
      STORE,
      "readwrite"
    );

    transaction.objectStore(STORE).delete(id);

    transaction.oncomplete = () => resolve(true);

    transaction.onerror = () => {
      reject(transaction.error);
    };

  });
}