/**
 * Services for admin functions.
 * @packageDocumentation
 */

import { BaseService } from "./util";

/**
 * Admin services.
 */
export class AdminService extends BaseService {
  /**
   * Get the number of records in a table.
   *
   * @param table The table name.
   * @returns The number of records in the table.
   */
  public async getRecords(table: string): Promise<number> {
    const sql = `SELECT COUNT(*) AS count FROM ${table}`;
    const rows = await this.dbm.execute(sql);
    return rows[0].count;
  }
}
