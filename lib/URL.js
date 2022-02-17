const DB = require("./DB"),
  SQLLoader = require("./SQLLoader");
const SmallUrlHelper = require("./SmallUrlHelper");

module.exports = class URL {
  static async isValid(url) {
    return url.match(
      /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|\/|\?)*)?$/i
    );
  }
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

  static async createSmallUrl(url, expirationDays) {
    let conn = DB.getPostgres();

    let queryString = SQLLoader.load("url/create-small-url");
    let data = [SmallUrlHelper.getUniqueHash(url), url];

    if (expirationDays) {
      let expirationDate = new Date();

      expirationDate.setDate(
        expirationDate.getDate() + parseInt(expirationDays)
      );

      queryString = SQLLoader.load("url/create-small-url-expiration");

      data.push(
        expirationDate
          .toISOString()
          .replace(/T/, " ")
          .replace(/\.\d+Z/i, "")
      );
    }

    let result = await conn.query(queryString, data);

    return await this.liteSmallUrl(result.rows[0].hash);
  }
};
