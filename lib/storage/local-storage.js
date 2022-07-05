module.exports = {
  getStorage: () => {
    return ({
      get(key) {
        return JSON.parse(localStorage.getItem(key));
      },
      set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
      },
      del(key) {
        localStorage.removeItem(key);
      },
    });
  },
  hasStorage: async () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }

  },
};