import mainDB, { getTime, newUniqueID, hashPassword } from "./util";

// User architecture
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  statusID: number;
  verified: boolean;
  admin: boolean;
  imageID: string | null;
  joinTime: number;
  lastLoginTime: number | null;
  lastPostTime: number | null;
}

// User service
export module UserService {
  // Create a user
  export async function createUser(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    statusID: number
  ): Promise<string> {
    const userID = await newUniqueID("User");
    const hashedPassword = await hashPassword(password);

    const sql = `
      INSERT INTO User (
        id, firstname, lastname, email, password, statusID, joinTime
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?
      );
    `;
    const params = [
      userID,
      firstname,
      lastname,
      email,
      hashedPassword,
      statusID,
      getTime(),
    ];
    await mainDB.execute(sql, params);

    return userID;
  }

  // Check if a user exists
  export async function userExists(userID: string): Promise<boolean> {
    const sql = `SELECT id FROM User WHERE id = ?;`;
    const params = [userID];
    const rows = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  // Get a user
  export async function getUser(userID: string): Promise<User> {
    const sql = `SELECT * FROM User WHERE id = ?;`;
    const params = [userID];
    const rows = await mainDB.execute(sql, params);

    return rows[0];
  }

  // Delete a user
  export async function deleteUser(userID: string): Promise<void> {
    const sql = `DELETE FROM User WHERE id = ?;`;
    const params = [userID];
    await mainDB.execute(sql, params);
  }
}
