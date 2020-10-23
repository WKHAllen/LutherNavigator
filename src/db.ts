import { Pool, QueryResult } from 'pg';

// If an error is thrown, provide information on the error
function logError(stmt: string, params: any[], res: QueryResult<any>, err: Error) {
	console.error('\n\n######### ERROR #########\n\n');
	console.error('\nStatement:');
	console.error(stmt);
	console.error('\nParameters:');
	console.error(params);
	console.error('\nResponse: ');
	console.error(res);
	console.error('\nError:');
	throw err;
}

// Control the database through a single object
export class DB {
	private pool: Pool;

	constructor(dbURL: string, max: number = 20) {
		this.pool = new Pool({
			connectionString: dbURL,
			ssl: { rejectUnauthorized: false },
			max: max
		});
	}

	// Execute a SQL query
	async execute(stmt: string, params: any[] = []): Promise<any[]> {
		let paramCount = 0;
		while (stmt.includes('?')) {
			stmt = stmt.replace('?', `$${++paramCount}`);
		}

		const client = await this.pool.connect();
		let res: QueryResult<any>;

		try {
			res = await client.query(stmt, params);
		} catch (err) {
			logError(stmt, params, res, err);
		} finally {
			client.release();
		}

		return res.rows;
	}

	// Execute multiple SQL queries, each one right after the last
	async executeMany(stmts: string[]): Promise<any[][]> {
		const client = await this.pool.connect();
		let reses: any[][] = [];

		for (let stmt of stmts) {
			let res: QueryResult<any>;

			try {
				res = await client.query(stmt);
			} catch (err) {
				logError(stmt, [], res, err);
			}

			reses.push(res.rows);
		}

		client.release();
		return reses;
	}
}
