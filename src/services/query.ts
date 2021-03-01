/**
 * Services for query functions.
 * @packageDocumentation
 */

import { BaseService } from "./util";
import { Post } from "./post";

/**
 * Query parameters.
 */
export interface QueryParams {
  search?: string;
  programIDs?: number[];
  locationTypeIDs?: number[];
  statusIDs?: number[];
  ratings?: number[];
}

/**
 * Query sort options.
 */
export type QuerySortOptions =
  | "program"
  | "locationType"
  | "userStatus"
  | "rating";

/**
 * Query services.
 */
export class QueryService extends BaseService {
  /**
   * Perform a basic search for posts.
   *
   * @param search Search parameters.
   * @returns All posts that match the search parameters.
   */
  public async query(search: string): Promise<Post[]> {
    const searchLike = "%" + search + "%";

    const sql = `
      SELECT
        Post.id AS id,
        Rating.general AS rating,
        PostImage.imageID AS imageID
      FROM Post
        JOIN Program   ON Post.programID = Program.id
        JOIN Rating    ON Post.ratingID  = Rating.id
        JOIN PostImage ON Post.id        = PostImage.postID
      WHERE
        Post.approved = TRUE
        AND (
             LOWER(Post.content)  LIKE LOWER(?)
          OR LOWER(Post.location) LIKE LOWER(?)
          OR LOWER(Program.name)  LIKE LOWER(?)
        );
    `;
    const params = [searchLike, searchLike, searchLike];
    const rows: Post[] = await this.dbm.execute(sql, params);

    return rows;
  }

  /**
   * Perform an advanced search for posts.
   *
   * @param parameters Search parameters.
   * @param sortBy The element to sort by.
   * @param sortAscending Whether to sort ascending or descending.
   * @returns All posts that match the search parameters.
   */
  public async advancedQuery(
    parameters: QueryParams,
    sortBy: QuerySortOptions,
    sortAscending: boolean = true
  ): Promise<Post[]> {
    const whereOptions = {
      programIDs: "Post.programID",
      locationTypeIDs: "Post.locationTypeID",
      statusIDs: "User.statusID",
      ratings: "Rating.general",
    };

    const sortOptions = {
      program: "Program.name",
      locationType: "LocationType.name",
      userStatus: "UserStatus.name",
      rating: "Rating.general",
    };

    const sortOrder = sortAscending ? "ASC" : "DESC";

    // SELECT
    //   Post.id AS id,
    //   Rating.general AS rating,
    //   PostImage.imageID AS imageID
    // FROM Post
    //   JOIN User         ON Post.userID         = User.id
    //   JOIN LocationType ON Post.locationTypeID = LocationType.id
    //   JOIN UserStatus   ON User.statusID       = UserStatus.id
    //   JOIN Program      ON Post.programID      = Program.id
    //   JOIN Rating       ON Post.ratingID       = Rating.id
    //   JOIN PostImage    ON Post.id             = PostImage.postID
    // WHERE
    //   Post.approved = TRUE
    //   AND (
    //        LOWER(Post.content)  LIKE LOWER(%?%)
    //     OR LOWER(Post.location) LIKE LOWER(%?%)
    //     OR LOWER(Program.name)  LIKE LOWER(%?%)
    //   )
    //   AND Post.programID      IN (...)
    //   AND Post.locationTypeID IN (...)
    //   AND User.statusID       IN (...)
    //   AND Rating.general      IN (...)
    // ORDER BY ${sortOptions[sortBy]} ${sortOrder};

    const sqlStart = `
      SELECT
        Post.id AS id,
        Rating.general AS rating,
        PostImage.imageID AS imageID
      FROM Post
        JOIN User         ON Post.userID         = User.id
        JOIN LocationType ON Post.locationTypeID = LocationType.id
        JOIN UserStatus   ON User.statusID       = UserStatus.id
        JOIN Program      ON Post.programID      = Program.id
        JOIN Rating       ON Post.ratingID       = Rating.id
        JOIN PostImage    ON Post.id             = PostImage.postID
    `;
    const sqlEnd = `ORDER BY ${sortOptions[sortBy]} ${sortOrder};`;

    let params = [];
    let whereClause = ["Post.approved = TRUE"];

    for (const parameter in parameters) {
      if (parameter === "search") {
        const searchLike = "%" + parameters[parameter] + "%";

        whereClause.push(`(
             LOWER(Post.content)  LIKE LOWER(?)
          OR LOWER(Post.location) LIKE LOWER(?)
          OR LOWER(Program.name)  LIKE LOWER(?)
        )`);
        params.push(searchLike, searchLike, searchLike);
      } else if (parameters[parameter].length > 0) {
        whereClause.push(`${whereOptions[parameter]} IN (?)`);
        params.push(parameters[parameter]);
      }
    }

    const sql = `${sqlStart} WHERE ${whereClause.join(" AND ")} ${sqlEnd}`;
    const rows: Post[] = await this.dbm.execute(sql, params);

    return rows;
  }
}
