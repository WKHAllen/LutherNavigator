import mainDB from "./util";

// Rating architecture
export interface Rating {
  id: number;
  general: number;
  cost: number | null;
  quality: number | null;
  safety: number | null;
  cleanliness: number | null;
  guestServices: number | null;
}

// Rating parameters
export interface RatingParams {
  general: number;
  cost?: number;
  quality?: number;
  safety?: number;
  cleanliness?: number;
  guestService?: number;
}

// Rating services
export module RatingService {
  // Create a rating
  export async function createRating(rating: RatingParams): Promise<number> {
    const cols = Object.keys(rating);
    const values = Object.values(rating);

    const sql = `
			INSERT INTO Rating (
				${cols.join(", ")}
			) VALUES (
				${"?, ".repeat(values.length).slice(0, -2)}
			);

			SELECT LAST_INSERT_ID() AS id;
		`;
    const rows = await mainDB.execute(sql, values);

    return rows[0]?.id;
	}

	// Get a rating
	export async function getRating(ratingID: number): Promise<Rating> {
		const sql = `SELECT * FROM Rating WHERE id = ?;`
		const params = [ratingID];
		const rows = await mainDB.execute(sql, params);

		return rows[0];
	}
}
