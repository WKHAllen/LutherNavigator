import mainDB, { getTime, newUniqueID, sessionIDLength } from "./util";

// Session architecture
export interface Session {
  id: string;
  userID: string;
  createTime: number;
}

// Session services
export module SessionService {
  // Create a session
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

  // Check if a session exists
  export async function sessionExists(sessionID: string): Promise<boolean> {
    const sql = `SELECT id FROM Session WHERE id = ?;`;
    const params = [sessionID];
    const rows: Session[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  // Get a session
  export async function getSession(sessionID: string): Promise<Session> {
    const sql = `SELECT * FROM Session WHERE id = ?;`;
    const params = [sessionID];
    const rows: Session[] = await mainDB.execute(sql, params);

    return rows[0];
  }

  // Delete a session
  export async function deleteSession(sessionID: string): Promise<void> {
    const sql = `DELETE FROM Session WHERE id = ?;`;
    const params = [sessionID];
    await mainDB.execute(sql, params);
  }

  // Get all of a user's sessions
  export async function getUserSessions(userID: string): Promise<Session[]> {
    const sql = `SELECT * FROM Session WHERE userID = ? ORDER BY createTime;`;
    const params = [userID];
    const rows: Session[] = await mainDB.execute(sql, params);

    return rows;
  }

  // Delete all of a user's sessions
  export async function deleteUserSessions(userID: string): Promise<void> {
    const sql = `DELETE FROM Session WHERE userID = ?;`;
    const params = [userID];
    await mainDB.execute(sql, params);
  }

  // Get a user ID by session ID
  export async function getUserBySessionID(
    sessionID: string
  ): Promise<string> {
    const sql = `SELECT userID from Session WHERE id = ?;`;
    const params = [sessionID];
    const rows: Session[] = await mainDB.execute(sql, params);

    return rows[0]?.userID;
  }
}
