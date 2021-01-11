/**
 * Services for the verify table.
 * @packageDocumentation
 */

import mainDB, {
  getTime,
  newUniqueID,
  pruneVerifyRecord,
  verifyIDLength,
} from "./util";
import { UserService } from "./user";

/**
 * Verify architecture.
 */
export interface Verify {
  id: string;
  email: string;
  createTime: number;
}

/**
 * Verification services.
 */
export module VerifyService {
  /**
   * Create a user verification record.
   *
   * @param email The email address associated with the user's account.
   * @param prune Whether or not to prune the record when the time comes.
   * @returns The new verification record's ID.
   */
  export async function createVerifyRecord(
    email: string,
    prune: boolean = true
  ): Promise<string> {
    // Confirm that the email address exists
    const emailUnused = await UserService.uniqueEmail(email);

    if (emailUnused) {
      return null;
    }

    // Check that no verification record has already been created
    let sql = `SELECT id FROM Verify WHERE email = ?;`;
    let params: any[] = [email];
    let rows: Verify[] = await mainDB.execute(sql, params);

    if (rows.length > 0) {
      return null;
    }

    // Create the verification record
    const newVerifyID = await newUniqueID("Verify", verifyIDLength);

    sql = `
      INSERT INTO Verify (
        id, email, createTime
      ) VALUES (
        ?, ?, ?
      );
    `;
    params = [newVerifyID, email, getTime()];
    await mainDB.execute(sql, params);

    if (prune) {
      pruneVerifyRecord(newVerifyID);
    }

    return newVerifyID;
  }

  /**
   * Delete a verification record.
   *
   * @param verifyID A verification record's ID.
   */
  export async function deleteVerifyRecord(verifyID: string): Promise<void> {
    const sql = `DELETE FROM Verify WHERE id = ?;`;
    const params = [verifyID];
    await mainDB.execute(sql, params);
  }
}
