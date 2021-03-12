/**
 * Export all services.
 * @packageDocumentation
 */

import { DB } from "./db";

import { AdminService } from "./services/admin";
import { ImageService } from "./services/image";
import { LocationTypeService } from "./services/locationType";
import { MetaService } from "./services/meta";
import { PasswordResetService } from "./services/passwordReset";
import { PostService } from "./services/post";
import { PostImageService } from "./services/postImage";
import { ProgramService } from "./services/program";
import { QueryService } from "./services/query";
import { RatingService } from "./services/rating";
import { SessionService } from "./services/session";
import { UserService } from "./services/user";
import { UserStatusService } from "./services/userStatus";
import { UserStatusChangeService } from "./services/userStatusChange";
import { VerifyService } from "./services/verify";

export default class DatabaseManager {
  readonly db: DB;
  readonly adminService: AdminService;
  readonly imageService: ImageService;
  readonly locationTypeService: LocationTypeService;
  readonly metaService: MetaService;
  readonly passwordResetService: PasswordResetService;
  readonly postService: PostService;
  readonly postImageService: PostImageService;
  readonly programService: ProgramService;
  readonly queryService: QueryService;
  readonly ratingService: RatingService;
  readonly sessionService: SessionService;
  readonly userService: UserService;
  readonly userStatusService: UserStatusService;
  readonly userStatusChangeService: UserStatusChangeService;
  readonly verifyService: VerifyService;

  constructor(dbURL: string) {
    this.db = new DB(dbURL);
    this.adminService = new AdminService(this);
    this.imageService = new ImageService(this);
    this.locationTypeService = new LocationTypeService(this);
    this.metaService = new MetaService(this);
    this.passwordResetService = new PasswordResetService(this);
    this.postService = new PostService(this);
    this.postImageService = new PostImageService(this);
    this.programService = new ProgramService(this);
    this.queryService = new QueryService(this);
    this.ratingService = new RatingService(this);
    this.sessionService = new SessionService(this);
    this.userService = new UserService(this);
    this.userStatusService = new UserStatusService(this);
    this.userStatusChangeService = new UserStatusChangeService(this);
    this.verifyService = new VerifyService(this);
  }

  public async execute(sql: string, params: any[] = []): Promise<any[]> {
    return await this.db.execute(sql, params);
  }

  public async close() {
    await this.db.close();
  }
}
