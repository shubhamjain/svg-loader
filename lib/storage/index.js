"use strict";
const localforage = require("localforage");

let storage = null;

const getAvailableStorage = (name) => {
  localforage.config({ name });
  storage = localforage;
  return storage;
}


const getStorage = (name) => {
  return storage || getAvailableStorage(name)
}

module.exports = {
  getStorage,
}
