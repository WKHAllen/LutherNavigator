/**
 * Services for the suspended table.
 * @packageDocumentation
 */

import { BaseService, getTime, newUniqueID } from "./util";
import { User } from "./user";

/**
 * Suspended architecture.
 */
export interface Suspended {
  id: string;
  userID: string;
  suspendedUntil: number;
  createTime: number;
}

/**
 * Suspended services.
 */
export class SuspendedService extends BaseService {
  /**
   * Suspend a user's account.
   *
   * @param userID A user's ID.
   * @param until The time at which the account will no longer be suspended.
   * @return The new suspension record's ID.
   */
  public async suspendUser(userID: string, until: number): Promise<string> {}

  /**
   * Check if a suspension record exists.
   *
   * @param suspensionID A suspension record's ID.
   * @returns Whether or not the suuspension record exists.
   */
  public async suspensionExists(suspensionID: string): Promise<boolean> {}

  /**
   * Get a suspension record.
   *
   * @param suspensionID A suspension record's ID.
   * @returns The suspension record.
   */
  public async getSuspension(suspensionID: string): Promise<Suspended> {}

  /**
   * Delete a suspension record.
   *
   * @param suspensionID A suspension record's ID.
   */
  public async deleteSuspension(suspensionID: string): Promise<void> {}

  /**
   * Check whether or not a user's account has been suspended.
   *
   * @param userID A user's ID.
   * @returns Whether or not the user's account has been suspended.
   */
  public async userIsSuspended(userID: string): Promise<boolean> {}

  /**
   * Get all suspended users.
   *
   * @returns All suspended users
   */
  public async suspendedUsers(): Promise<User[]> {}
}
