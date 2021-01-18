/**
 * Services for admin functions.
 * @packageDocumentation
 */

import mainDB from "./util";

/**
 * Admin services.
 */
export module AdminService {
  /**
   * Get the number of records in a table.
   *
   * @param table The table name.
   * @returns The number of records in the table.
   */
  export async function getRecords(table: string): Promise<number> {
    const sql = `SELECT COUNT(*) AS count FROM ${table}`;
    const rows = await mainDB.execute(sql);
    return rows[0].count;
  }
}
