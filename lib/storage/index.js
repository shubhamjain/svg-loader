"use strict";
const localStorage = require("./local-storage");
const indexedDB = require("./indexed-db");
const mockStorage = require("./mock-storage");

let storage = null;

const getAvailableStorage = async (name) => {
  if (await indexedDB.hasStorage(name)) {
    return indexedDB.getStorage(name)
  }
  else if (await localStorage.hasStorage()) {
    return localStorage.getStorage(name)
  }
  return mockStorage.getStorage()
}


const getStorage = async (name) => {
  return storage || await getAvailableStorage(name)
}

module.exports = {
  getStorage,
}