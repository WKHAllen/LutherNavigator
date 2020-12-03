import * as db from "../db";
import * as crypto from "crypto";
import * as bcrypt from "bcrypt";

// Constants
export const dbURL = process.env.DATABASE_URL;
export const idLength = 4;
export const sessionIDLength = 16;
export const saltRounds = 12;

// Database object
const mainDB = new db.DB(dbURL);
export default mainDB;

// Get the current timestamp
export function getTime(): number {
  return Math.floor(new Date().getTime() / 1000);
}

// Generate a new ID
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

// Generate a new unique ID for a table
export async function newUniqueID(
  table: string,
  len: number = idLength
): Promise<string> {
  let base64ID = await newID();

  const sql = `SELECT id FROM ${table} WHERE id = ?;`;
  let rows = await mainDB.execute(sql, [base64ID]);

  while (rows.length > 0) {
    base64ID = await newID();
    rows = await mainDB.execute(sql, [base64ID]);
  }

  return base64ID;
}

// Hash a password
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

// Check if passwords match
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
