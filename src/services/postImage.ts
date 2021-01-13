/**
 * Services for the post image table.
 * @packageDocumentation
 */

import mainDB from "./util";
import { Image, ImageService } from "./image";

/**
 * Post image architecture.
 */
export interface PostImage {
  postID: string;
  imageID: string;
}

/**
 * Post image services.
 */
export module PostImageService {
  /**
   * Get all images associated with a post.
   *
   * @param postID A post's ID.
   * @returns The images associated with the post.
   */
  export async function getPostImages(postID: string): Promise<Image[]> {
    const sql = `
      SELECT * FROM Image WHERE id IN (
        SELECT imageID FROM PostImage WHERE postID = ?
      );`;
    const params = [postID];
    const rows: Image[] = await mainDB.execute(sql, params);

    return rows;
  }

  /**
   * Associate an image with a post.
   *
   * @param postID A post's ID.
   * @param imageID An image's ID.
   */
  export async function setPostImage(
    postID: string,
    imageID: string
  ): Promise<void> {
    const sql = `
      INSERT INTO PostImage (
        postID, imageID
      ) VALUES (
        ?, ?
      );
    `;
    const params = [postID, imageID];
    await mainDB.execute(sql, params);
  }

  /**
   * Create a new image and associate it with a post.
   *
   * @param postID A post's ID.
   * @param imageData The new binary image data.
   * @returns The new image's ID.
   */
  export async function createPostImage(
    postID: string,
    imageData: Buffer
  ): Promise<string> {
    const imageID = await ImageService.createImage(imageData);
    await setPostImage(postID, imageID);

    return imageID;
  }

  /**
   * Get the number of images associated with a post.
   *
   * @param postID A post's ID.
   * @returns The number of images associated with the post.
   */
  export async function numImages(postID: string): Promise<number> {
    const sql = `SELECT COUNT(*) FROM PostImage WHERE postID = ?;`;
    const params = [postID];
    const rows = await mainDB.execute(sql, params);

    return rows[0]["COUNT(*)"];
  }

  /**
   * Delete all images associated with a post.
   *
   * @param postID A post's ID.
   */
  export async function deletePostImages(postID: string): Promise<void> {
    let sql = `
      DELETE FROM Image WHERE id IN (
        SELECT imageID FROM PostImage WHERE postID = ?
      );
    `;
    let params = [postID];
    await mainDB.execute(sql, params);

    sql = `DELETE FROM PostImage WHERE postID = ?;`;
    params = [postID];
    await mainDB.execute(sql, params);
  }
}
