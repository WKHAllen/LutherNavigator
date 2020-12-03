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
    await deleteUserSessions(userID);
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

  // Delete a session
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
    const rows = await mainDB.execute(sql, params);

    return rows[0]?.userID;
  }
}
