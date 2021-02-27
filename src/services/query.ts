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
  programID?: number;
  locationTypeID?: number;
  statusID?: number;
  rating?: number;
}

/**
 * Query services.
 */
export class QueryService extends BaseService {
  /**
   * Perform a basic search for posts.
   *
   * @param parameters Search parameters.
   * @returns All posts that match the parameters.
   */
  public async query(parameters: string): Promise<Post[]> {
    const sql = `
      SELECT * FROM Post WHERE id IN (
        SELECT Post.id FROM Post
          WHERE LOWER(Post.content) LIKE LOWER(%?%)
             OR LOWER(Post.location) LIKE LOWER(%?%)
             OR LOWER(Program.name) LIKE LOWER(%?%)
          JOIN Program ON Post.programID = Program.id
      );
    `;
    const params = [parameters, parameters];
    const rows: Post[] = await this.dbm.execute(sql, params);

    return rows;
  }

  /**
   * Perform an advanced search for posts.
   *
   * @param parameters Search parameters.
   * @returns All posts that match the parameters.
   */
  public async advancedQuery(parameters: QueryParams): Promise<Post[]> {
    
  }
}
