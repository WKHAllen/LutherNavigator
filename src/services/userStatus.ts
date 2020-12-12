/**
 * Services for the user status table.
 * @packageDocumentation
 */

import mainDB from "./util";

/**
 * User status architecture.
 */
export interface UserStatus {
  id: number;
  name: string;
}

/**
 * User status services.
 */
export module UserStatusService {
  /**
   * Get all user statuses.
   *
   * @returns A list of all user statuses.
   */
  export async function getStatuses(): Promise<UserStatus[]> {
    const sql = `SELECT id, name FROM UserStatus ORDER BY id;`;
    const rows: UserStatus[] = await mainDB.execute(sql);

    return rows;
  }

  /**
   * Get the name of a user status by ID.
   *
   * @param statusID A status's ID.
   * @returns The status's name.
   */
  export async function getStatusName(statusID: number): Promise<string> {
    const sql = `SELECT name FROM UserStatus WHERE id = ?;`;
    const params = [statusID];
    const rows: UserStatus[] = await mainDB.execute(sql, params);

    return rows[0]?.name;
  }

  /**
   * Check if a user status is valid.
   *
   * @param statusID A status's ID.
   * @returns Whether or not the status is valid.
   */
  export async function validStatus(statusID: number): Promise<boolean> {
    const sql = `SELECT id FROM UserStatus WHERE id = ?;`;
    const params = [statusID];
    const rows: UserStatus[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }
}
