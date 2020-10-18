import * as db from '../db';

// Constants
export const dbURL        = process.env.DATABASE_URL;
export const maxDBClients = 20;

// Database object
export const mainDB = new db.DB(dbURL, maxDBClients);

async function wait(ms: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

// Initialize the database
export async function initDB() {
	// Create tables
	const mainTable = `
		CREATE TABLE IF NOT EXISTS Main (
			id SERIAL PRIMARY KEY,
			message TEXT NOT NULL
		);
	`;

	await mainDB.executeMany([mainTable]);
	await wait(1000);

	const rows = await mainDB.execute('SELECT id FROM Main;');
	const message = 'Hello, world!';
	if (rows.length === 0) {
		await mainDB.execute('INSERT INTO Main (message) VALUES (?);', [message]);
	}
}
