/**
 * Services for the password reset table.
 * @packageDocumentation
 */

import mainDB, {
  getTime,
  newUniqueID,
  prunePasswordResetRecord,
  passwordResetIDLength,
} from "./util";
import { UserService } from "./user";

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
   * @param prune Whether or not to prune the record when the time comes.
   * @returns The new password reset record's ID.
   */
  export async function requestPasswordReset(
    email: string,
    prune: boolean = true
  ): Promise<string> {
    // Confirm that the email address exists
    const emailUnused = await UserService.uniqueEmail(email);

    if (emailUnused) {
      return null;
    }

    // Confirm account is verified
    const user = await UserService.getUserByEmail(email);
    const verified = await UserService.isVerified(user.id);

    if (!verified) {
      return null;
    }

    // Check that no password reset has already been requested
    let sql = `SELECT id FROM PasswordReset WHERE email = ?;`;
    let params: any[] = [email];
    let rows: PasswordReset[] = await mainDB.execute(sql, params);

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

    if (prune) {
      prunePasswordResetRecord(newPasswordResetID);
    }

    return newPasswordResetID;
  }

  /**
   * Check if a password reset record exists.
   *
   * @param resetID A password reset record's ID.
   * @returns Whether or not the password reset record exists.
   */
  export async function resetRecordExists(resetID: string): Promise<boolean> {
    const sql = `SELECT id FROM PasswordReset WHERE id = ?;`;
    const params = [resetID];
    const rows: PasswordReset[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  /**
   * Get a password reset record.
   *
   * @param resetID A password reset record's ID.
   * @returns The password reset record.
   */
  export async function getResetRecord(
    resetID: string
  ): Promise<PasswordReset> {
    const sql = `SELECT * FROM PasswordReset WHERE id = ?;`;
    const params = [resetID];
    const rows: PasswordReset[] = await mainDB.execute(sql, params);

    return rows[0];
  }

  /**
   * Delete a password reset record.
   *
   * @param resetID A password reset record's ID.
   */
  export async function deleteResetRecord(resetID: string): Promise<void> {
    const sql = `DELETE FROM PasswordReset WHERE id = ?;`;
    const params = [resetID];
    await mainDB.execute(sql, params);
  }

  /**
   * Reset a user's password.
   *
   * @param resetID A password reset record's ID.
   * @param newPassword The user's new password.
   * @returns Whether or not the reset was successful.
   */
  export async function resetPassword(
    resetID: string,
    newPassword: string
  ): Promise<boolean> {
    const resetRecord = await getResetRecord(resetID);

    if (!resetRecord) {
      return false;
    }

    const user = await UserService.getUserByEmail(resetRecord.email);

    if (!user) {
      return false;
    }

    await UserService.setUserPassword(user.id, newPassword);
    await deleteResetRecord(resetID);

    return true;
  }
}
