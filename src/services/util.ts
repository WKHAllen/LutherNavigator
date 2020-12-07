/**
 * Utilities for services.
 * @packageDocumentation
 */

import * as db from "../db";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

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
 * Number of salt rounds for bcrypt to use.
 */
export const saltRounds = 12;

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
 * Hash a password.
 *
 * @param password The password.
 * @param rounds The number of salt rounds for bcrypt to use.
 * @returns The hashed password.
 */
export async function hashPassword(
  password: string,
  rounds: number = saltRounds
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
