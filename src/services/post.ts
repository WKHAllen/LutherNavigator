import mainDB, { getTime, newUniqueID } from "./util";
import { ImageService } from "./image";
import { RatingParams, RatingService } from "./rating";

// Post architecture
export interface Post {
  id: string;
  userID: string;
  content: string;
  imageID: string;
  location: string;
  locationTypeID: number;
  program: string;
  ratingID: string;
  threeWords: string;
  approved: boolean;
  createTime: number;
  editTime: number | null;
}

// Post services
export module PostService {
  // Create a post
  export async function createPost(
    userID: string,
    content: string,
    imageData: Buffer,
    location: string,
    locationTypeID: number,
    program: string,
    rating: RatingParams,
    threeWords: string
  ): Promise<string> {
    const postID = await newUniqueID("Post");
    const imageID = await ImageService.createImage(imageData);
    const ratingID = await RatingService.createRating(rating);

    const sql = `
      INSERT INTO Post (
        id, userID, content, imageID, location, locationTypeID, program,
        ratingID, threeWords, createTime
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      );
    `;
    const params = [
      postID,
      userID,
      content,
      imageID,
      location,
      locationTypeID,
      program,
      ratingID,
      threeWords,
      getTime(),
    ];
    await mainDB.execute(sql, params);

    return postID;
  }

  // Check if a post exists
  export async function postExists(postID: string): Promise<boolean> {
    const sql = `SELECT id FROM Post WHERE id = ?;`;
    const params = [postID];
    const rows: Post[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  // Get a post
  export async function getPost(postID: string): Promise<Post> {
    const sql = `SELECT * FROM Post WHERE id = ?;`;
    const params = [postID];
    const rows: Post[] = await mainDB.execute(sql, params);

    return rows[0];
  }

  // Delete a post
  export async function deletePost(postID: string): Promise<void> {
    let sql = `SELECT imageID, ratingID FROM Post WHERE id = ?;`;
    let params = [postID];
    let rows: Post[] = await mainDB.execute(sql, params);

    const imageID = rows[0]?.imageID;
    const ratingID = rows[0]?.ratingID;

    await ImageService.deleteImage(imageID);
    await RatingService.deleteRating(ratingID);

    sql = `DELETE FROM Post WHERE id = ?;`;
    params = [postID];
    await mainDB.execute(sql, params);
  }
}
