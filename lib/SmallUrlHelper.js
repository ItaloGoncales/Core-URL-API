const btoa = require("btoa"),
  { v4: uuidv4 } = require("uuid");

module.exports = class SmallUrlHelper {
  static getUniqueHash(url) {
    return btoa(`${url}_${uuidv4()}`).replace(/=/, "").slice(-7);
  }
};
