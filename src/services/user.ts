/**
 * Services for the user table.
 * @packageDocumentation
 */

import mainDB, {
  getTime,
  newUniqueID,
  hashPassword,
  checkPassword,
} from "./util";
import { UserStatusService } from "./userStatus";
import { Image, ImageService } from "./image";
import { SessionService } from "./session";
import { PostService } from "./post";

/**
 * User architecture.
 */
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

/**
 * User services.
 */
export module UserService {
  /**
   * Create a user.
   *
   * @param firstname The user's first name.
   * @param lastname The user's last name.
   * @param email The user's email address.
   * @param password The user's password.
   * @param statusID The status ID of the user.
   * @returns The new user's ID.
   */
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

  /**
   * Check if a user exists.
   *
   * @param userID A user's ID.
   * @returns Whether or not the user exists.
   */
  export async function userExists(userID: string): Promise<boolean> {
    const sql = `SELECT id FROM User WHERE id = ?;`;
    const params = [userID];
    const rows: User[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  /**
   * Get a user.
   *
   * @param userID A user's ID.
   * @returns The user.
   */
  export async function getUser(userID: string): Promise<User> {
    const sql = `SELECT * FROM User WHERE id = ?;`;
    const params = [userID];
    const rows: User[] = await mainDB.execute(sql, params);

    return rows[0];
  }

  /**
   * Delete a user.
   *
   * @param userID A user's ID.
   */
  export async function deleteUser(userID: string): Promise<void> {
    await deleteUserImage(userID);

    const sql = `DELETE FROM User WHERE id = ?;`;
    const params = [userID];
    await mainDB.execute(sql, params);

    await SessionService.deleteUserSessions(userID);
    await PostService.deleteUserPosts(userID);
  }

  /**
   * Get a user by their email address.
   *
   * @param email An email address.
   * @returns The user.
   */
  export async function getUserByEmail(email: string): Promise<User> {
    const sql = `SELECT * FROM User WHERE email = ?;`;
    const params = [email];
    const rows: User[] = await mainDB.execute(sql, params);

    return rows[0];
  }

  /**
   * Make sure an email address is not yet in use.
   *
   * @param email An email address.
   * @returns Whether or not the email address is unique.
   */
  export async function uniqueEmail(email: string): Promise<boolean> {
    const sql = `SELECT email FROM User WHERE email = ?;`;
    const params = [email];
    const rows: User[] = await mainDB.execute(sql, params);

    return rows.length === 0;
  }

  /**
   * Log a user in.
   *
   * @param email The user's email address.
   * @param password The user's password.
   * @returns Whether or not the login was successful.
   */
  export async function login(
    email: string,
    password: string
  ): Promise<boolean> {
    let sql = `SELECT password FROM User WHERE email = ?;`;
    let params: any[] = [email];
    let rows: User[] = await mainDB.execute(sql, params);

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

  /**
   * Get the name of a user's status.
   *
   * @param userID A user's ID.
   * @returns The name of the user's status.
   */
  export async function getUserStatusName(userID: string): Promise<string> {
    const sql = `SELECT statusID FROM User WHERE id = ?;`;
    const params = [userID];
    const rows: User[] = await mainDB.execute(sql, params);

    const statusID = rows[0]?.statusID;
    const statusName = await UserStatusService.getStatusName(statusID);

    return statusName;
  }

  /**
   * Check if a user is verified.
   *
   * @param userID A user's ID.
   * @returns Whether or not the user's account has been verified.
   */
  export async function isVerified(userID: string): Promise<boolean> {
    const sql = `SELECT verified FROM User WHERE id = ?;`;
    const params = [userID];
    const rows: User[] = await mainDB.execute(sql, params);

    return !!rows[0]?.verified;
  }

  /**
   * Set a user's verification status.
   *
   * @param userID A user's ID.
   * @param verified Verification status.
   */
  export async function setVerified(
    userID: string,
    verified: boolean = true
  ): Promise<void> {
    const sql = `UPDATE User SET verified = ? WHERE id = ?;`;
    const params = [verified, userID];
    await mainDB.execute(sql, params);
  }

  /**
   * Check if a user is an admin.
   *
   * @param userID A user's ID.
   * @returns Whether or not the user is an admin.
   */
  export async function isAdmin(userID: string): Promise<boolean> {
    const sql = `SELECT admin FROM User WHERE id = ?;`;
    const params = [userID];
    const rows: User[] = await mainDB.execute(sql, params);

    return !!rows[0]?.admin;
  }

  /**
   * Set a user's admin status.
   *
   * @param userID A user's ID.
   * @param admin Admin status.
   */
  export async function setAdmin(
    userID: string,
    admin: boolean = true
  ): Promise<void> {
    const sql = `UPDATE User SET admin = ? WHERE id = ?;`;
    const params = [admin, userID];
    await mainDB.execute(sql, params);
  }

  /**
   * Get a user's image.
   *
   * @param userID A user's ID.
   * @returns The user's profile image.
   */
  export async function getUserImage(userID: string): Promise<Image> {
    const sql = `SELECT imageID from User WHERE id = ?;`;
    const params = [userID];
    const rows: User[] = await mainDB.execute(sql, params);

    const imageID = rows[0]?.imageID;
    const image = await ImageService.getImage(imageID);

    return image;
  }

  /**
   * Set a user's image.
   *
   * @param userID A user's ID.
   * @param imageData The new binary image data.
   */
  export async function setUserImage(
    userID: string,
    imageData: Buffer
  ): Promise<void> {
    let sql = `SELECT imageID from User WHERE id = ?;`;
    let params = [userID];
    const rows: User[] = await mainDB.execute(sql, params);

    const newImageID = await ImageService.createImage(imageData);

    sql = `UPDATE User SET imageID = ? WHERE id = ?`;
    params = [newImageID, userID];
    await mainDB.execute(sql, params);

    const imageID = rows[0]?.imageID;
    await ImageService.deleteImage(imageID);
  }

  /**
   * Delete a user's image.
   *
   * @param userID A user's ID.
   */
  export async function deleteUserImage(userID: string): Promise<void> {
    let sql = `SELECT imageID from User WHERE id = ?;`;
    let params = [userID];
    const rows: User[] = await mainDB.execute(sql, params);

    sql = `UPDATE User SET imageID = ? WHERE id = ?`;
    params = [null, userID];
    await mainDB.execute(sql, params);

    const imageID = rows[0]?.imageID;
    await ImageService.deleteImage(imageID);
  }

  /**
   * Set a user's password.
   *
   * @param userID A user's ID.
   * @param password The user's new password.
   */
  export async function setUserPassword(
    userID: string,
    password: string
  ): Promise<void> {
    const hashedPassword = await hashPassword(password);

    const sql = `UPDATE User SET password = ? WHERE id = ?;`;
    const params = [hashedPassword, userID];
    await mainDB.execute(sql, params);
  }
}
