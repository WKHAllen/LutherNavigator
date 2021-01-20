/**
 * Utilities for services.
 * @packageDocumentation
 */

import * as db from "../db";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";
import { Session } from "./session";
import { Verify, VerifyService } from "./verify";
import { PasswordReset, PasswordResetService } from "./passwordReset";
import { MetaService } from "./meta";

/**
 * Database connection URL.
 */
export const dbURL = process.env.DATABASE_URL;

/**
 * Standard length of an ID.
 */
export const idLength = 4;

/**
 * Length of a session ID.
 */
export const sessionIDLength = 16;

/**
 * Length of a verification ID.
 */
export const verifyIDLength = 16;

/**
 * Length of a password reset ID.
 */
export const passwordResetIDLength = 16;

/**
 * Database object.
 */
const mainDB = new db.DB(dbURL);
export default mainDB;

/**
 * Get the current timestamp.
 *
 * @returns The timestamp in seconds.
 */
export function getTime(): number {
  return Math.floor(new Date().getTime() / 1000);
}

/**
 * Generate a new ID.
 *
 * @param len The length of the ID.
 * @returns The new ID.
 */
export async function newID(len: number = idLength): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(len, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        let base64ID = buffer.toString("base64").slice(0, len);
        while (base64ID.includes("/")) base64ID = base64ID.replace("/", "-");
        while (base64ID.includes("+")) base64ID = base64ID.replace("+", "_");
        resolve(base64ID);
      }
    });
  });
}

/**
 * Generate a new unique ID for a table.
 *
 * @param table The table name.
 * @param len The length of the ID.
 * @returns The new unique ID.
 */
export async function newUniqueID(
  table: string,
  len: number = idLength
): Promise<string> {
  let base64ID = await newID(len);

  const sql = `SELECT id FROM ${table} WHERE id = ?;`;
  let rows = await mainDB.execute(sql, [base64ID]);

  while (rows.length > 0) {
    base64ID = await newID(len);
    rows = await mainDB.execute(sql, [base64ID]);
  }

  return base64ID;
}

/**
 * Hash a password asynchronously.
 *
 * @param password The password.
 * @param rounds The number of salt rounds for bcrypt to use.
 * @returns The hashed password.
 */
export async function hashPasswordAsync(
  password: string,
  rounds: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, rounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

/**
 * Hash a password.
 *
 * @param password The password.
 * @param rounds The number of salt rounds for bcrypt to use.
 * @returns The hashed password.
 */
export async function hashPassword(
  password: string,
  rounds: number = null
): Promise<string> {
  if (!rounds) {
    rounds = parseInt(await MetaService.get("Salt rounds"));
  }

  return await hashPasswordAsync(password, rounds);
}

/**
 * Check if passwords match.
 *
 * @param password The password.
 * @param hash The hashed password.
 * @returns Whether or not the password and hash match.
 */
export async function checkPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, same) => {
      if (err) {
        reject(err);
      } else {
        resolve(same);
      }
    });
  });
}

/**
 * Delete a session when the time comes.
 *
 * @param sessionID A session's ID.
 * @param timeRemaining The amount of time to wait before removing the session.
 */
export async function pruneSession(
  sessionID: string,
  timeRemaining: number = null
): Promise<void> {
  const sessionAge = parseInt(await MetaService.get("Session age")) * 1000;
  if (timeRemaining === null) {
    timeRemaining = sessionAge;
  }

  setTimeout(async () => {
    let sql = `SELECT updateTime FROM Session WHERE id = ?;`;
    let params = [sessionID];
    const rows: Session[] = await mainDB.execute(sql, params);

    const updateTime = rows[0]?.updateTime;
    const deleteTime = updateTime + sessionAge / 1000;

    if (deleteTime && getTime() - deleteTime >= 0) {
      sql = `DELETE FROM Session WHERE id = ?;`;
      params = [sessionID];
      await mainDB.execute(sql, params);
    }
  }, timeRemaining);
}

/**
 * Delete all active sessions when the time comes.
 */
export async function pruneSessions(): Promise<void> {
  const sql = `SELECT id, updateTime FROM Session;`;
  const params = [];
  const rows: Session[] = await mainDB.execute(sql, params);

  const sessionAge = parseInt(await MetaService.get("Session age")) * 1000;

  rows.forEach((row) => {
    const timeRemaining = row.updateTime + sessionAge / 1000 - getTime();
    pruneSession(row.id, timeRemaining * 1000);
  });
}

/**
 * Delete a verification record when the time comes.
 *
 * @param verifyID A verification ID.
 * @param timeRemaining The amount of time to wait before removing the record.
 */
export async function pruneVerifyRecord(
  verifyID: string,
  timeRemaining: number = null
): Promise<void> {
  const verifyAge = parseInt(await MetaService.get("Verify age")) * 1000;
  if (timeRemaining === null) {
    timeRemaining = verifyAge;
  }

  setTimeout(async () => {
    await VerifyService.deleteUnverifiedUser(verifyID);
  }, timeRemaining);
}

/**
 * Delete all active verification records when the time comes.
 */
export async function pruneVerifyRecords(): Promise<void> {
  const sql = `SELECT id, createTime FROM Verify;`;
  const params = [];
  const rows: Verify[] = await mainDB.execute(sql, params);

  const verifyAge = parseInt(await MetaService.get("Verify age")) * 1000;

  rows.forEach((row) => {
    const timeRemaining = row.createTime + verifyAge / 1000 - getTime();
    pruneVerifyRecord(row.id, timeRemaining * 1000);
  });
}

/**
 * Delete a password reset record when the time comes.
 *
 * @param resetID A password reset ID.
 * @param timeRemaining The amount of time to wait before removing the record.
 */
export async function prunePasswordResetRecord(
  resetID: string,
  timeRemaining: number = null
): Promise<void> {
  const passwordResetAge =
    parseInt(await MetaService.get("Password reset age")) * 1000;
  if (timeRemaining === null) {
    timeRemaining = passwordResetAge;
  }

  setTimeout(async () => {
    await PasswordResetService.deleteResetRecord(resetID);
  }, timeRemaining);
}

/**
 * Delete all active password reset records when the time comes.
 */
export async function prunePasswordResetRecords(): Promise<void> {
  const sql = `SELECT id, createTime FROM PasswordReset;`;
  const params = [];
  const rows: PasswordReset[] = await mainDB.execute(sql, params);

  const passwordResetAge =
    parseInt(await MetaService.get("Password reset age")) * 1000;

  rows.forEach((row) => {
    const timeRemaining = row.createTime + passwordResetAge / 1000 - getTime();
    prunePasswordResetRecord(row.id, timeRemaining * 1000);
  });
}
