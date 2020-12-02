import * as mysql from "mysql";

// If an error is thrown, provide information on the error
function logError(stmt: string, params: any[], res: any, err: Error) {
  console.error("\n\n######### ERROR #########\n\n");
  console.error("\nStatement:");
  console.error(stmt);
  console.error("\nParameters:");
  console.error(params);
  console.error("\nResponse: ");
  console.error(res);
  console.error("\nError:");
  throw err;
}

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

// Control the database through a single object
export class DB {
  private pool: mysql.Pool;

  constructor(dbURL: string) {
    this.pool = mysql.createPool(dbURL);
  }

  // Execute a SQL query
  public async execute(stmt: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve) => {
      this.pool.query(stmt, params, (err, results, fields) => {
        if (err) {
          logError(stmt, params, results, err);
        }

        resolve(results);
      });
    });
  }

  // Execute multiple SQL queries, each one right after the last
  public async executeMany(
    stmts: string[],
    params: any[][] = []
  ): Promise<any[][]> {
    return new Promise((resolve) => {
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
            [results, fields] = await doQuery(conn, stmts[i], params[i] || []);
          } catch (err) {
            logError(stmts[i], params[i] || [], results, err);
          } finally {
            reses.push(results);
          }
        }

        conn.release();
        resolve(reses);
      });
    });
  }

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
