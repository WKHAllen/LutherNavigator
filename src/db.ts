/**
 * Database helper.
 * @packageDocumentation
 */

import * as mysql from "mysql";

/**
 * If an error is thrown, provide information on the error.
 */
function logError(stmt: string, params: any[], res: any, err: Error) {
  const msg = `\n\n######### ERROR #########\n\n\nStatement:\n${stmt}\n\nParameters:\n${params}\n\nResponse:\n${res}\n\nError:`;
  console.error(msg);
  throw err;
}

/**
 * Perform a database query asynchronously.
 *
 * @param conn MySQL connection.
 * @param stmt SQL statement.
 * @param params Values to be inserted into the statement.
 * @returns Query results and field information.
 */
async function doQuery(
  conn: mysql.PoolConnection,
  stmt: string,
  params: any[]
): Promise<[any, mysql.FieldInfo[]]> {
  return new Promise((resolve, reject) => {
    conn.query(stmt, params, (err, results, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve([results, fields]);
      }
    });
  });
}

/**
 * Control the database through a single object.
 */
export class DB {
  /**
   * Connection pool.
   */
  private pool: mysql.Pool;
  private conn: DBConnection = null;

  /**
   * Database controller constructor.
   *
   * @param dbURL Database connection URL.
   * @returns Database controller object.
   */
  constructor(dbURL: string) {
    this.pool = mysql.createPool(dbURL);
  }

  /**
   * Execute a SQL query.
   *
   * @param stmt SQL statement.
   * @param params Values to be inserted into the statement.
   * @returns Query results.
   */
  public async execute(stmt: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve) => {
      if (!this.conn) {
        this.pool.query(stmt, params, (err, results, fields) => {
          if (err) {
            logError(stmt, params, results, err);
          }

          resolve(results);
        });
      } else {
        this.conn.execute(stmt, params).then(resolve);
      }
    });
  }

  /**
   * Execute multiple SQL queries, each one right after the last
   *
   * @param stmts SQL statement.
   * @param params Values to be inserted into the statement.
   * @returns Results of all queries.
   */
  public async executeMany(
    stmts: string[],
    params: any[][] = []
  ): Promise<any[][]> {
    return new Promise((resolve) => {
      if (!this.conn) {
        this.pool.getConnection(async (err, conn) => {
          if (err) {
            conn.release();
            logError("", [], null, err);
            resolve([]);
          }

          let reses: any[][] = [];

          for (let i = 0; i < stmts.length; i++) {
            let results: any;
            let fields: mysql.FieldInfo[];

            try {
              [results, fields] = await doQuery(
                conn,
                stmts[i],
                params[i] || []
              );
            } catch (err) {
              logError(stmts[i], params[i] || [], results, err);
            } finally {
              reses.push(results);
            }
          }

          conn.release();
          resolve(reses);
        });
      } else {
        this.conn.executeMany(stmts, params).then(resolve);
      }
    });
  }

  /**
   * Get a single connection object from the pool.
   *
   * @returns The connection object.
   */
  public async getConnection(): Promise<DBConnection> {
    return new Promise((resolve) => {
      this.pool.getConnection(async (err, conn) => {
        if (err) {
          conn.release();
          logError("", [], null, err);
          resolve(null);
        }

        const connection = new DBConnection(conn);
        resolve(connection);
      });
    });
  }

  /**
   * Set the database controller's current connection object.
   * `null` can be passed to use the connection pool.
   *
   * @param conn The connection object.
   */
  public setConnection(conn: DBConnection): void {
    if (this.conn instanceof DBConnection) {
      this.conn.close();
    }

    this.conn = conn;
  }

  /**
   * Close the connection to the database.
   */
  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pool.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 * Control the database through a single connection.
 */
export class DBConnection {
  /**
   * Connection object.
   */
  private conn: mysql.PoolConnection;
  private closed: boolean = false;

  /**
   * Database connection constructor.
   *
   * @param connection The database connection.
   * @returns The database connection object.
   */
  constructor(connection: mysql.PoolConnection) {
    this.conn = connection;
  }

  /**
   * Execute a SQL query.
   *
   * @param stmt SQL statement.
   * @param params Values to be inserted into the statement.
   * @returns Query results.
   */
  public async execute(stmt: string, params: any[] = []): Promise<any> {
    let results: any;
    let fields: mysql.FieldInfo[];

    try {
      [results, fields] = await doQuery(this.conn, stmt, params);
      return results;
    } catch (err) {
      logError(stmt, params, results, err);
      return null;
    }
  }

  /**
   * Execute multiple SQL queries, each one right after the last
   *
   * @param stmts SQL statement.
   * @param params Values to be inserted into the statement.
   * @returns Results of all queries.
   */
  public async executeMany(
    stmts: string[],
    params: any[][] = []
  ): Promise<any[][]> {
    let reses: any[][] = [];

    for (let i = 0; i < stmts.length; i++) {
      let results: any;
      let fields: mysql.FieldInfo[];

      try {
        [results, fields] = await doQuery(this.conn, stmts[i], params[i] || []);
      } catch (err) {
        logError(stmts[i], params[i] || [], results, err);
      } finally {
        reses.push(results);
      }
    }

    return reses;
  }

  /**
   * Start a transaction.
   */
  public async startTransaction(): Promise<void> {
    await this.execute("START TRANSACTION;");
  }

  /**
   * Commit a transaction.
   */
  public async commit(): Promise<void> {
    await this.execute("COMMIT;");
  }

  /**
   * Rollback a transaction.
   */
  public async rollback(): Promise<void> {
    await this.execute("ROLLBACK;");
  }

  /**
   * Close the connection.
   */
  public close(): void {
    if (!this.closed) {
      this.conn.release();
      this.closed = true;
    }
  }
}
