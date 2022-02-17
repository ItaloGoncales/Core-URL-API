const { Pool } = require("pg");

let pgConnectionPool;

module.exports = class PostgreSQL {
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

  static getPostgres() {
    return pgConnectionPool;
  }
};
