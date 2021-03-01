import DatabaseManager from "../../src/services";
import { useConnection } from "../../src/dbinit";

const dbURL = process.env.DATABASE_URL;

/**
 * Get a database manager.
 *
 * @returns The database manager.
 */
export async function getDBM(): Promise<DatabaseManager> {
  const dbm = new DatabaseManager(dbURL);
  await useConnection(dbm);
  dbm.db.startTransaction();
  return dbm;
}

/**
 * Close a database manager.
 *
 * @param dbm The database manager.
 */
export async function closeDBM(dbm: DatabaseManager): Promise<void> {
  await dbm.db.rollback();
  await dbm.close();
}

/**
 * Asynchronously wait.
 *
 * @param ms The number of milliseconds to wait.
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Get an object with a specified ID from a list of objects.
 *
 * @param objects A list of objects.
 * @param objectID The object's ID.
 * @returns The object with the specified ID.
 */
export function getByID<T extends { id: any }>(objects: T[], objectID: any): T {
  for (const obj of objects) {
    if (obj.id === objectID) {
      return obj;
    }
  }
}
