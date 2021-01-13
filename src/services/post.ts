/**
 * Services for the post table.
 * @packageDocumentation
 */

import mainDB, { getTime, newUniqueID } from "./util";
import { Image, ImageService } from "./image";
import { Rating, RatingParams, RatingService } from "./rating";
import { User, UserService } from "./user";
import { PostImageService } from "./postImage";

/**
 * Post architecture.
 */
export interface Post {
  id: string;
  userID: string;
  content: string;
  location: string;
  locationTypeID: number;
  program: string;
  ratingID: string;
  threeWords: string;
  approved: boolean;
  createTime: number;
  editTime: number | null;
}

/**
 * Post services.
 */
export module PostService {
  /**
   * Create a post.
   *
   * @param userID The ID of the user making the post.
   * @param content The text content of the post.
   * @param imageData The binary data of the images associated with the post.
   * @param location The post's location.
   * @param locationTypeID The type ID of location.
   * @param program The program the user is in.
   * @param rating The user's rating of the location.
   * @param threeWords Three words to describe the location.
   * @returns The new post's ID.
   */
  export async function createPost(
    userID: string,
    content: string,
    imageData: Buffer[],
    location: string,
    locationTypeID: number,
    program: string,
    rating: RatingParams,
    threeWords: string
  ): Promise<string> {
    const postID = await newUniqueID("Post");
    const ratingID = await RatingService.createRating(rating);
    await PostImageService.createPostImages(postID, imageData);

    const sql = `
      INSERT INTO Post (
        id, userID, content, location, locationTypeID, program, ratingID,
        threeWords, createTime
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?
        ?, ?
      );
    `;
    const params = [
      postID,
      userID,
      content,
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

  /**
   * Check if a post exists.
   *
   * @param postID A post's ID.
   * @returns Whether or not the post exists.
   */
  export async function postExists(postID: string): Promise<boolean> {
    const sql = `SELECT id FROM Post WHERE id = ?;`;
    const params = [postID];
    const rows: Post[] = await mainDB.execute(sql, params);

    return rows.length > 0;
  }

  /**
   * Get a post.
   *
   * @param postID A post's ID.
   * @returns The post.
   */
  export async function getPost(postID: string): Promise<Post> {
    const sql = `SELECT * FROM Post WHERE id = ?;`;
    const params = [postID];
    const rows: Post[] = await mainDB.execute(sql, params);

    return rows[0];
  }

  /**
   * Delete a post.
   *
   * @param postID A post's ID.
   */
  export async function deletePost(postID: string): Promise<void> {
    let sql = `SELECT ratingID FROM Post WHERE id = ?;`;
    let params = [postID];
    let rows: Post[] = await mainDB.execute(sql, params);

    sql = `DELETE FROM Post WHERE id = ?;`;
    params = [postID];
    await mainDB.execute(sql, params);

    const ratingID = rows[0]?.ratingID;
    await RatingService.deleteRating(ratingID);
    await PostImageService.deletePostImages(postID);
  }

  /**
   * Get the user who made the post.
   *
   * @param postID A post's ID.
   * @returns The user who made the post.
   */
  export async function getPostUser(postID: string): Promise<User> {
    const sql = `SELECT userID FROM Post WHERE id = ?;`;
    const params = [postID];
    const rows: Post[] = await mainDB.execute(sql, params);

    const userID = rows[0]?.userID;
    const user = await UserService.getUser(userID);

    return user;
  }

  /**
   * Get a post's rating.
   *
   * @param postID A post's ID.
   * @returns The post's rating.
   */
  export async function getPostRating(postID: string): Promise<Rating> {
    const sql = `SELECT ratingID FROM Post WHERE id = ?;`;
    const params = [postID];
    const rows: Post[] = await mainDB.execute(sql, params);

    const ratingID = rows[0]?.ratingID;
    const rating = await RatingService.getRating(ratingID);

    return rating;
  }

  /**
   * Get all of a user's posts.
   *
   * @param userID A user's ID.
   * @returns A list of all posts made by the user.
   */
  export async function getUserPosts(userID: string): Promise<Post[]> {
    const sql = `SELECT * FROM Post WHERE userID = ? ORDER BY createTime;`;
    const params = [userID];
    const rows: Post[] = await mainDB.execute(sql, params);

    return rows;
  }

  /**
   * Delete all of a user's posts.
   *
   * @param userID A user's ID.
   */
  export async function deleteUserPosts(userID: string): Promise<void> {
    let sql = `SELECT id, ratingID FROM Post WHERE userID = ?;`;
    let params = [userID];
    const rows: Post[] = await mainDB.execute(sql, params);

    sql = `DELETE FROM Post WHERE userID = ?;`;
    params = [userID];
    await mainDB.execute(sql, params);

    const ratingIDs = rows.map((post) => `'${post.ratingID}'`);
    const postIDs = rows.map((post) => post.id);

    if (ratingIDs.length > 0) {
      sql = `DELETE FROM Rating WHERE id IN (${ratingIDs.join(", ")});`;
      params = [];
      await mainDB.execute(sql, params);
    }

    for (const postID of postIDs) {
      await PostImageService.deletePostImages(postID);
    }
  }

  /**
   * Get a post's text content.
   *
   * @param postID A post's ID.
   * @returns The post's text content.
   */
  export async function getPostContent(postID: string): Promise<string> {
    const sql = `SELECT content FROM Post WHERE id = ?;`;
    const params = [postID];
    const rows: Post[] = await mainDB.execute(sql, params);

    return rows[0]?.content;
  }

  /**
   * Set a post's text content.
   *
   * @param postID A post's ID.
   * @param content The new text content of a post.
   */
  export async function setPostContent(
    postID: string,
    content: string
  ): Promise<void> {
    const sql = `UPDATE Post SET content = ? WHERE id = ?;`;
    const params = [content, postID];
    await mainDB.execute(sql, params);
  }

  /**
   * Get a post's images.
   *
   * @param postID A post's ID.
   * @returns The images associated with the post.
   */
  export async function getPostImages(postID: string): Promise<Image[]> {
    return await PostImageService.getPostImages(postID);
  }

  /**
   * Set a post's images.
   *
   * @param postID A post's ID.
   * @param imageData The binary data of the new images.
   * @returns The IDs of the new images.
   */
  export async function setPostImages(
    postID: string,
    imageData: Buffer[]
  ): Promise<string[]> {
    return await PostImageService.createPostImages(postID, imageData);
  }

  /**
   * Check if a post has been approved.
   *
   * @param postID A post's ID.
   * @returns Whether or not the post has been approved by an admin.
   */
  export async function isApproved(postID: string): Promise<boolean> {
    const sql = `SELECT approved FROM Post WHERE id = ?;`;
    const params = [postID];
    const rows: Post[] = await mainDB.execute(sql, params);

    return !!rows[0]?.approved;
  }

  /**
   * Set a post's approved status.
   *
   * @param postID A post's ID.
   * @param approved Approved status.
   */
  export async function setApproved(
    postID: string,
    approved: boolean = true
  ): Promise<void> {
    const sql = `UPDATE Post SET approved = ? WHERE id = ?;`;
    const params = [approved, postID];
    await mainDB.execute(sql, params);
  }
}
