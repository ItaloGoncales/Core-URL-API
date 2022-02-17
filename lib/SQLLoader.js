const fs = require("fs"),
  path = require("path");

const QUERIES_DIR = fs.realpathSync("db/postgresql/queries/");

let instance;
/**
 * @class SQLLoader
 * Class responsible for loading sql queries from the disk.
 * Singleton
 */
class SQLLoader {
  constructor() {
    if (!instance) instance = this;
    return instance;
  }

  static getInstance() {
    return new SQLLoader();
  }

  loadQueries() {
    let self = this;
    self.queries = {};

    return new Promise((resolve, reject) => {
      readQueries(QUERIES_DIR)
        .then((queries) => {
          queries.forEach((query) => {
            self.queries[path.basename(query.filename, ".sql")] = query.content;
          });
          resolve(self.queries);
        })
        .catch(reject);
    });
  }

  /**
   * Sync function, loads the query from the memory, falls back to disk if not found.
   * @param {String} queryName The uniqueName of the query requested.
   * @throws {Error} Will thrown an error if the query isn't found in memory and if it's also not found in disk.
   * @returns {String} query - The query requested.
   */
  load(queryName) {
    if (!this.queries[queryName]) this.loadQuerySync(queryName);
    return this.queries[queryName];
  }

  loadQuerySync(queryName) {
    try {
      let query = readQuerySync(QUERIES_DIR, queryName + ".sql");
      this.queries[query.filename.replace(/\.sql$/, "")] = query.content;
    } catch (err) {
      throw new Error(
        `Can't find query "${queryName}.sql" in the queries folder (${QUERIES_DIR})`
      );
    }
  }
}

function readQuerySync(dirname, filename) {
  let content = fs.readFileSync(dirname + "/" + filename, "utf-8");
  return { filename: filename, content: content };
}

function readQuery(dirname, filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(dirname + "/" + filename, "utf-8", (err, content) => {
      if (err) return reject(err);
      resolve({ filename: filename, content: content });
    });
  });
}

function readQueries(dirname) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirname, (err, filenames) => {
      if (err) return reject(err);
      let promises = [];
      filenames.forEach((filename) => {
        if (filename.endsWith(".sql")) {
          promises.push(readQuery(dirname, filename));
        }
      });
      Promise.all(promises).then(resolve).catch(reject);
    });
  });
}

module.exports = SQLLoader.getInstance();
