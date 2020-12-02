import mainDB, {
  getTime,
  newUniqueID,
  hashPassword,
  checkPassword,
} from "./util";
import { UserStatusService } from "./userStatus";
import { Image, ImageService } from "./image";

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
    const rows: User[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  // Get a user
  export async function getUser(userID: string): Promise<User> {
    const sql = `SELECT * FROM User WHERE id = ?;`;
    const params = [userID];
    const rows: User[] = await mainDB.execute(sql, params);

    return rows[0];
  }

  // Delete a user
  export async function deleteUser(userID: string): Promise<void> {
    const sql = `DELETE FROM User WHERE id = ?;`;
    const params = [userID];
    await mainDB.execute(sql, params);
  }

  // Log a user in
  export async function login(
    email: string,
    password: string
  ): Promise<boolean> {
    let sql = `SELECT password FROM User WHERE email = ?;`;
    let params: any[] = [email];
    let rows = await mainDB.execute(sql, params);

    const hash = rows[0]?.password || "";
    const same = await checkPassword(password, hash);
    if (rows.length === 0 || !same) {
      return false;
    }

    sql = `UPDATE User SET lastLoginTime = ? WHERE email = ?;`;
    params = [getTime(), email];
    await mainDB.execute(sql, params);

    return true;
  }

  // Get the name of a user's status
  export async function getUserStatusName(userID: string): Promise<string> {
    const sql = `SELECT statusID FROM User WHERE id = ?;`;
    const params = [userID];
    const rows = await mainDB.execute(sql, params);

    const statusID = rows[0]?.statusID;
    const statusName = await UserStatusService.getStatusName(statusID);

    return statusName;
  }

  // Check if a user is verified
  export async function isVerified(userID: string): Promise<boolean> {
    const sql = `SELECT verified FROM User WHERE id = ?;`;
    const params = [userID];
    const rows = await mainDB.execute(sql, params);

    return rows[0]?.verified;
  }

  // Set a user's verification status
  export async function setVerified(
    userID: string,
    verified: boolean = true
  ): Promise<void> {
    const sql = `UPDATE User SET verified = ? WHERE id = ?;`;
    const params = [verified, userID];
    await mainDB.execute(sql, params);
  }

  // Check if a user is an admin
  export async function isAdmin(userID: string): Promise<boolean> {
    const sql = `SELECT admin FROM User WHERE id = ?;`;
    const params = [userID];
    const rows = await mainDB.execute(sql, params);

    return rows[0]?.admin;
  }

  // Set a user's admin status
  export async function setAdmin(
    userID: string,
    admin: boolean = true
  ): Promise<void> {
    const sql = `UPDATE User SET admin = ? WHERE id = ?;`;
    const params = [admin, userID];
    await mainDB.execute(sql, params);
  }

  // Get a user's image
  export async function getUserImage(userID: string): Promise<Image> {
    const sql = `SELECT imageID from User WHERE id = ?;`;
    const params = [userID];
    const rows = await mainDB.execute(sql, params);

    const imageID = rows[0]?.imageID;
    const image = await ImageService.getImage(imageID);

    return image;
  }

  // Set a user's image
  export async function setUserImage(
    userID: string,
    imageData: Buffer
  ): Promise<void> {
    let sql = `SELECT imageID from User WHERE id = ?;`;
    let params = [userID];
    const rows = await mainDB.execute(sql, params);

    const imageID = rows[0]?.imageID;
    await ImageService.deleteImage(imageID);
    const newImageID = await ImageService.createImage(imageData);

    sql = `UPDATE User SET imageID = ? WHERE id = ?`;
    params = [newImageID, userID];
    await mainDB.execute(sql, params);
  }
}
