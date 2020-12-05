import mainDB, { newUniqueID } from "./util";

// Rating architecture
export interface Rating {
  id: string;
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
  export async function createRating(rating: RatingParams): Promise<string> {
    const ratingID = await newUniqueID("Rating");
    const cols = Object.keys(rating);
    const values = Object.values(rating);

    const sql = `
      INSERT INTO Rating (
        id, ${cols.join(", ")}
      ) VALUES (
        ?, ${"?, ".repeat(values.length).slice(0, -2)}
      );
    `;
    const params = [ratingID, ...values];
    await mainDB.execute(sql, params);

    return ratingID;
  }

  // Check if a rating exists
  export async function ratingExists(ratingID: string): Promise<boolean> {
    const sql = `SELECT id FROM Rating WHERE id = ?;`;
    const params = [ratingID];
    const rows: Rating[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  // Get a rating
  export async function getRating(ratingID: string): Promise<Rating> {
    const sql = `SELECT * FROM Rating WHERE id = ?;`;
    const params = [ratingID];
    const rows: Rating[] = await mainDB.execute(sql, params);

    return rows[0];
  }

  // Delete a rating
  export async function deleteRating(ratingID: string): Promise<void> {
    const sql = `DELETE FROM Rating WHERE id = ?;`;
    const params = [ratingID];
    await mainDB.execute(sql, params);
  }
}
