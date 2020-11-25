import * as db from "../db";

// Constants
export const dbURL = process.env.DATABASE_URL;

// Database object
const mainDB = new db.DB(dbURL);
export default mainDB;
