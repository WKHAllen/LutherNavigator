/**
 * Services for the program table.
 * @packageDocumentation
 */

import { BaseService } from "./util";

/**
 * Program architecture.
 */
export interface Program {
  id: number;
  name: string;
}

/**
 * Program services.
 */
export class ProgramService extends BaseService {
  /**
   * Create a new program.
   *
   * @param programID The new program's ID.
   * @param name The new program's name.
   */
  public async createProgram(programID: number, name: string): Promise<void> {
    const sql = `
      INSERT INTO Program (
        id, name
      ) VALUES (
        ?, ?
      );
    `;
    const params = [programID, name];
    await this.dbm.execute(sql, params);
  }

  /**
   * Check if a program exists.
   *
   * @param programID A program's ID.
   * @returns Whether or not the program exists.
   */
  public async programExists(programID: number): Promise<boolean> {
    const sql = `SELECT id FROM Program WHERE id = ?;`;
    const params = [programID];
    const rows: Program[] = await this.dbm.execute(sql, params);

    return rows.length > 0;
  }

  /**
   * Get a program.
   *
   * @param programID A program's ID.
   * @returns The program.
   */
  public async getProgram(programID: number): Promise<Program> {
    const sql = `SELECT * FROM Program WHERE id = ?;`;
    const params = [programID];
    const rows: Program[] = await this.dbm.execute(sql, params);

    return rows[0];
  }

  /**
   * Delete a program.
   * @param programID A program's ID.
   */
  public async deleteProgram(programID: number): Promise<void> {
    const sql = `DELETE FROM Program WHERE id = ?;`;
    const params = [programID];
    await this.dbm.execute(sql, params);
  }

  public async getProgramName(programID: number): Promise<string> {
    const sql = `SELECT name FROM Program WHERE id = ?;`;
    const params = [programID];
    const rows: Program[] = await this.dbm.execute(sql, params);

    return rows[0].name;
  }

  /**
   * Change a program's ID.
   *
   * @param currentID A program's ID.
   * @param newID The program's new ID.
   */
  public async changeProgramID(
    currentID: number,
    newID: number
  ): Promise<void> {
    const sql = `UPDATE Program SET id = ? WHERE id = ?`;
    const params = [newID, currentID];
    await this.dbm.execute(sql, params);
  }

  /**
   * Set a program's name.
   *
   * @param programID A program's ID.
   * @param newName The program's new name.
   */
  public async setProgramName(
    programID: number,
    newName: string
  ): Promise<void> {
    const sql = `UPDATE Program SET name = ? WHERE id = ?;`;
    const params = [newName, programID];
    await this.dbm.execute(sql, params);
  }
}
