/**
 * Services for the password reset table.
 * @packageDocumentation
 */

import mainDB, { getTime, newUniqueID, passwordResetIDLength } from "./util";

/**
 * Password reset architecture.
 */
export interface PasswordReset {
  id: string;
  email: string;
  createTime: number;
}

/**
 * Password reset services.
 */
export module PasswordResetService {
  /**
   * Request a password reset.
   *
   * @param email The email address associated with the user's account.
   * @returns The new password reset record's ID.
   */
  export async function requestPasswordReset(email: string): Promise<string> {
    // Confirm that the email address exists
    let sql = `SELECT id FROM User WHERE email = ? AND verified = TRUE;`;
    let params: any[] = [email];
    let rows: PasswordReset[] = await mainDB.execute(sql, params);

    if (rows.length !== 1) {
      return null;
    }

    // Check that no password reset has already been requested
    sql = `SELECT id FROM PasswordReset WHERE email = ?;`;
    params = [email];
    rows = await mainDB.execute(sql, params);

    if (rows.length > 0) {
      return null;
    }

    // Create the password reset record
    const newPasswordResetID = await newUniqueID(
      "PasswordReset",
      passwordResetIDLength
    );

    sql = `
      INSERT INTO PasswordReset (
        id, email, createTime
      ) VALUES (
        ?, ?, ?
      );
    `;
    params = [newPasswordResetID, email, getTime()];
    await mainDB.execute(sql, params);

    return newPasswordResetID;
  }
}
