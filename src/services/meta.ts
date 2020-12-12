/**
 * Services for the meta table.
 * @packageDocumentation
 */

import mainDB from "./util";

/**
 * Meta architecture.
 */
export interface Meta {
  name: string;
  value: string;
}

/**
 * Meta services.
 */
export module MetaService {
  /**
   * Check if a key name exists.
   *
   * @param name The key name.
   * @returns Whether or not the name exists.
   */
  export async function exists(name: string): Promise<boolean> {
    const sql = `SELECT name FROM Meta WHERE name = ?;`;
    const params = [name];
    const rows: Meta[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  /**
   * Get the value given the key name.
   *
   * @param name The key name.
   * @returns The value.
   */
  export async function get(name: string): Promise<string> {
    const sql = `SELECT value FROM Meta WHERE name = ?;`;
    const params = [name];
    const rows: Meta[] = await mainDB.execute(sql, params);

    return rows[0]?.value;
  }

  /**
   * Set the key name and value.
   *
   * @param name The key name.
   * @param value The value.
   */
  export async function set(name: string, value: string): Promise<void> {
    const nameExists = await exists(name);

    let sql: string;
    let params: string[];

    if (!nameExists) {
      sql = `
				INSERT INTO Meta (
					name, value
				) VALUES (
					?, ?
				);
			`;
      params = [name, value];
    } else {
      sql = `UPDATE Meta SET value = ? WHERE name = ?;`;
      params = [value, name];
    }

    await mainDB.execute(sql, params);
  }

  /**
   * Delete the key name and value.
   *
   * @param name The key name.
   */
  export async function remove(name: string): Promise<void> {
    const sql = `DELETE FROM Meta WHERE name = ?;`;
    const params = [name];
    await mainDB.execute(sql, params);
  }

  /**
   * Get all key names and values.
   *
   * @returns Key names and values.
   */
  export async function getAll(): Promise<Meta[]> {
    const sql = `SELECT * FROM Meta;`;
    const params = [];
    const rows: Meta[] = await mainDB.execute(sql, params);

    return rows;
  }
}
