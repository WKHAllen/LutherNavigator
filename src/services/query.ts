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
  programID?: number;
  locationTypeID?: number;
  statusID?: number;
  rating?: number;
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
    const sql = `
      SELECT * FROM Post
        WHERE LOWER(Post.content) LIKE LOWER(%?%)
           OR LOWER(Post.location) LIKE LOWER(%?%)
           OR LOWER(Program.name) LIKE LOWER(%?%)
        JOIN Program ON Post.programID = Program.id;
    `;
    const params = [search, search, search];
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
    const sortOptions = {
      program: "Program.name",
      locationType: "LocationType.name",
      userStatus: "UserStatus.name",
      rating: "Rating.general",
    };

    const sortOrder = sortAscending ? "ASC" : "DESC";

    const sql = `
      SELECT * FROM Post
        WHERE (
              LOWER(Post.content) LIKE LOWER(%?%)
           OR LOWER(Post.location) LIKE LOWER(%?%)
           OR LOWER(Program.name) LIKE LOWER(%?%)
        ) AND Post.programID IN (...)
          AND Post.locationTypeID IN (...)
          AND User.statusID IN (...)
          AND Rating.general IN (...)
        JOIN User ON Post.userID = User.id
        JOIN Rating ON Post.ratingID = Rating.id
        ORDER BY ${sortOptions[sortBy]} ${sortOrder};
    `;
    const params = [];
    const rows: Post[] = await this.dbm.execute(sql, params);

    return rows;
  }
}
