const { Pool } = require("pg");

let pgConnectionPool;

/**
 * @class DB
 * Class responsible for manage the Database Connection.
 * Singleton
 */
module.exports = class DB {
  /**
   * Connects the API with the database, returning the connection pool and
   * making it available for other modules
   * @param {String} host The host of the Database Server.
   * @param {String} username The username of the Database.
   * @param {String} password The password of the User.
   * @param {String} defaultDatabase The selected database to connect with.
   * @param {String} port (optional) The port of the Database Server (default: 5432).
   * @returns {Object} The connection Pool.
   */
  static async connect(host, username, password, defaultDatabase, port = 5432) {
    if (pgConnectionPool) return pgConnectionPool.connect();

    const pool = new Pool({
      connectionString: `postgres://${username}:${password}@${host}:${port}/${defaultDatabase}`,
    });

    // Testing Connection
    const client = await pool.connect();
    console.log("PostgreSQL connection pool created.");

    const now = await client.query("SELECT NOW()");
    console.log(now.rows[0]);
    client.release();

    pgConnectionPool = pool;

    return pool.connect();
  }

  /**
   * Returns the current connection pool to the modules
   * @returns {Object} The connection Pool.
   */
  static getPostgres() {
    return pgConnectionPool;
  }
};
