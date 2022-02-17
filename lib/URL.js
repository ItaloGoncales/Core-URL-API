const DB = require("./DB"),
  SQLLoader = require("./SQLLoader");

module.exports = class URL {
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
};
