import * as db from '../db';

// Constants
export const dbURL        = process.env.DATABASE_URL;
export const maxDBClients = 20;

// Database object
const mainDB = new db.DB(dbURL, maxDBClients);

export default mainDB;
