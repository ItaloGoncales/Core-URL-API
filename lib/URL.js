const DB = require("./DB"),
  SQLLoader = require("./SQLLoader");
const SmallUrlHelper = require("./SmallUrlHelper");

/**
 * @class URL
 * Class responsible to execute all necessary queries to get,
 * update and insert records on url table.
 * It also validates if the original URL is valid or not.
 */
module.exports = class URL {
  /**
   * Checks if the original URL is valid.
   * @param {String} url The original URL.
   * @returns {Boolean} True for valid, False for invalid.
   */
  static async isValid(url) {
    return url.match(
      /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|\/|\?)*)?$/i
    );
  }

  /**
   * Query the current URL hash and returns the Lite version of the Small URL Object
   * @param {String} code The small URL hash.
   * @throws {null} Returns null if any query error happen
   * @returns {Object} The small URL Lite object.
   */
  static async liteSmallUrl(code) {
    try {
      let {
        id,
        url: original_url,
        smallUrl: shortened_url,
      } = await this.smallUrl(code);

      return {
        id,
        original_url,
        shortened_url,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Query the current URL hash and returns the Small URL Object
   * @param {String} code The small URL hash.
   * @throws {null} Returns null if any query error happen
   * @returns {Object} The small URL Object
   */
  static async smallUrl(code) {
    let conn = DB.getPostgres();

    let result = (await conn.query(SQLLoader.load("url/get-small-url"), [code]))
      .rows;

    if (!result) return [];

    return {
      ...result[0],
      smallUrl: `${process.env.DOMAIN}/${result[0].hash}`,
    };
  }

  /**
   * Calculates the expiration date for the Small URL
   * @param {Number} expirationDays How many days the Small URL will expire
   * @returns {Date} The expiration date
   */
  static getExpirationDate(expirationDays) {
    let expirationDate = new Date();

    expirationDate.setDate(expirationDate.getDate() + parseInt(expirationDays));

    return expirationDate
      .toISOString()
      .replace(/T/, " ")
      .replace(/\.\d+Z/i, "");
  }

  /**
   * Creates a new Small URL on the Database or reuses the hash for an expired URL.
   * @param {String} url The Original URL
   * @param {Number} expirationDays In how many days the Small URL will expire
   * @returns {Object} The Small URL Lite Object
   */
  static async createSmallUrl(url, expirationDays) {
    let conn = DB.getPostgres();

    let queryString = SQLLoader.load("url/create-small-url");
    let data = [SmallUrlHelper.getUniqueHash(url), url];

    if (expirationDays) {
      queryString = SQLLoader.load("url/create-small-url-expiration");

      data.push(this.getExpirationDate(expirationDays));
    }

    let expiredUrl = (await conn.query(SQLLoader.load("url/get-expired-hash")))
      .rows;

    if (expiredUrl.length > 0) {
      queryString = SQLLoader.load("url/update-small-url");
      data = [
        url,
        this.getExpirationDate(expirationDays || 2),
        expiredUrl[0].id,
      ];
    }

    let result = await conn.query(queryString, data);

    return await this.liteSmallUrl(result.rows[0].hash);
  }
};
