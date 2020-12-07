/**
 * Services for the session table.
 * @packageDocumentation
 */

import mainDB, { getTime, newUniqueID, sessionIDLength } from "./util";

/**
 * Session architecture.
 */
export interface Session {
  id: string;
  userID: string;
  createTime: number;
}

/**
 * Session services.
 */
export module SessionService {
  /**
   * Create a session.
   *
   * @param userID The ID of the user associated with the session.
   * @returns The new session's ID.
   */
  export async function createSession(userID: string): Promise<string> {
    const newSessionID = await newUniqueID("Session", sessionIDLength);

    const sql = `
      INSERT INTO Session (
        id, userID, createTime
      ) VALUES (
        ?, ?, ?
      );
    `;
    const params = [newSessionID, userID, getTime()];
    await mainDB.execute(sql, params);

    return newSessionID;
  }

  /**
   * Check if a session exists.
   *
   * @param sessionID A session's ID.
   * @returns Whether or not the session exists.
   */
  export async function sessionExists(sessionID: string): Promise<boolean> {
    const sql = `SELECT id FROM Session WHERE id = ?;`;
    const params = [sessionID];
    const rows: Session[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  /**
   * Get a session.
   *
   * @param sessionID A session's ID.
   * @returns The session.
   */
  export async function getSession(sessionID: string): Promise<Session> {
    const sql = `SELECT * FROM Session WHERE id = ?;`;
    const params = [sessionID];
    const rows: Session[] = await mainDB.execute(sql, params);

    return rows[0];
  }

  /**
   * Delete a session.
   *
   * @param sessionID A session's ID.
   */
  export async function deleteSession(sessionID: string): Promise<void> {
    const sql = `DELETE FROM Session WHERE id = ?;`;
    const params = [sessionID];
    await mainDB.execute(sql, params);
  }

  /**
   * Get all of a user's sessions.
   *
   * @param userID A user's ID.
   * @returns A list of all sessions associated with the user.
   */
  export async function getUserSessions(userID: string): Promise<Session[]> {
    const sql = `SELECT * FROM Session WHERE userID = ? ORDER BY createTime;`;
    const params = [userID];
    const rows: Session[] = await mainDB.execute(sql, params);

    return rows;
  }

  /**
   * Delete all of a user's sessions.
   *
   * @param userID A user's ID.
   */
  export async function deleteUserSessions(userID: string): Promise<void> {
    const sql = `DELETE FROM Session WHERE userID = ?;`;
    const params = [userID];
    await mainDB.execute(sql, params);
  }

  /**
   * Get a user ID by session ID.
   *
   * @param sessionID A session's ID.
   * @returns The ID of the user associated with the session.
   */
  export async function getUserBySessionID(
    sessionID: string
  ): Promise<string> {
    const sql = `SELECT userID from Session WHERE id = ?;`;
    const params = [sessionID];
    const rows: Session[] = await mainDB.execute(sql, params);

    return rows[0]?.userID;
  }
}
