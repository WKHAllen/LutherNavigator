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

    const sql1 = `
      INSERT INTO Rating (
        ${cols.join(", ")}
      ) VALUES (
        ${"?, ".repeat(values.length).slice(0, -2)}
      );
    `;
    const sql2 = `SELECT LAST_INSERT_ID() AS id;`;
    const rows = await mainDB.executeMany([sql1, sql2], [values]);

    return rows[1][0]?.id;
  }

  // Check if a rating exists
  export async function ratingExists(ratingID: number): Promise<boolean> {
    const sql = `SELECT id FROM Rating WHERE id = ?;`;
    const params = [ratingID];
    const rows = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  // Get a rating
  export async function getRating(ratingID: number): Promise<Rating> {
    const sql = `SELECT * FROM Rating WHERE id = ?;`;
    const params = [ratingID];
    const rows = await mainDB.execute(sql, params);

    return rows[0];
  }

  // Delete a rating
  export async function deleteRating(ratingID: number): Promise<void> {
    const sql = `DELETE FROM Rating WHERE id = ?;`;
    const params = [ratingID];
    await mainDB.execute(sql, params);
  }
}
