import DatabaseManager from "../../src/services";
import { useConnection } from "../../src/dbinit";

const dbURL = process.env.DATABASE_URL;

// Get a database manager
export async function getDBM(): Promise<DatabaseManager> {
  const dbm = new DatabaseManager(dbURL);
  await useConnection(dbm);
  dbm.db.startTransaction();
  return dbm;
}

// Close a database manager
export async function closeDBM(dbm: DatabaseManager): Promise<void> {
  await dbm.db.rollback();
  await dbm.close();
}

// Asynchronously wait
export async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
