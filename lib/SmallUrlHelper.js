const btoa = require("btoa"),
  { v4: uuidv4 } = require("uuid");

/**
 * @class SmallUrlHelper
 * Class responsible to generate the unique hash of the Small Url.
 */
module.exports = class SmallUrlHelper {
  /**
   * Returns the unique hash based on the url and an UUID.
   * @param {String} url The original URL to be hashed.
   * @returns {String} The URL hash.
   */
  static getUniqueHash(url) {
    return btoa(`${url}_${uuidv4()}`).replace(/=/, "").slice(-7);
  }
};
