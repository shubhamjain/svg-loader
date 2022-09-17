"use strict";
const localforage = require("localforage");

let storage = null;

const getAvailableStorage = async (name) => {
  localforage.config({ name });
  storage = localforage;
  return storage;
}


const getStorage = async (name) => {
  return storage || await getAvailableStorage(name)
}

module.exports = {
  getStorage,
}