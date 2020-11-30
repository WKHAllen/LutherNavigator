import mainDB, { getTime, newUniqueID } from "./util";

// Image architecture
export interface Image {
  id: string;
  data: Buffer;
  registerTime: number;
}

// Image services
export module ImageService {
  // Create an image
  export async function createImage(data: Buffer): Promise<string> {
    const imageID = await newUniqueID("Image");

    const sql = `INSERT INTO Image (id, data, registerTime) VALUES (?, ?, ?);`;
    const params = [imageID, data, getTime()];
    await mainDB.execute(sql, params);

    return imageID;
  }

  // Delete an image
  export async function deleteImage(id: string): Promise<void> {
    const sql = `DELETE FROM Image WHERE id = ?;`;
    const params = [id];
    await mainDB.execute(sql, params);
  }
}
