let db = null;

/**
 * Work around Safari 14 IndexedDB open bug.
 *
 * Safari has a horrible bug where IDB requests can hang while the browser is starting up. https://bugs.webkit.org/show_bug.cgi?id=226547
 * The only solution is to keep nudging it until it's awake.
 */
const idbReady = () => {
  const isSafari =
    !navigator.userAgentData &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrom(e|ium)\//.test(navigator.userAgent);

  // No point putting other browsers or older versions of Safari through this mess.
  if (!isSafari || !indexedDB.databases) return Promise.resolve();

  let intervalId;

  return new Promise((resolve) => {
    const tryIdb = () => indexedDB.databases().finally(resolve);
    intervalId = setInterval(tryIdb, 100);
    tryIdb();
  }).finally(() => clearInterval(intervalId));
}

const openDBConnection = async (name) => {
  try {
    await idbReady(name);
    return createStore(name);
  }
  catch (e) {
    console.log("cannot create store");
  }
}

const getObjectStore = async (name, mode = "readonly") => {
  db = db || await openDBConnection(name);
  const transaction = await db.transaction([name], mode);
  return transaction.objectStore(name);
}

const createStore = (name) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(name);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const transaction = async (name, method, mode, value, key) => {
  const objectStore = await getObjectStore(name, mode)
  return new Promise((resolve, reject) => {
    const request = objectStore[method](value, key)
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}


module.exports = {
  getStorage: (name) => {
    return ({
      async get(key) {
        return transaction(name, "get", "readonly", key);
      },
      async set(key, value) {
        return transaction(name, "put", "readwrite", value, key)
      },
      async del(key) {
        return transaction(name, "delete", "readwrite", key);
      },

    })
  },
  hasStorage: async (name) => {
    if (indexedDB) {
      try {
        await getObjectStore(name)
        return true;
      }
      catch { }
    }
    return false;
  },
};