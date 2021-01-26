import * as crypto from "crypto";
import mainDB, {
  getTime,
  hashPassword,
  checkPassword,
} from "../src/services/util";
import initDB from "../src/dbinit";
import { UserStatusService } from "../src/services/userStatus";
import { LocationTypeService } from "../src/services/locationType";
import { ImageService } from "../src/services/image";
import { RatingService } from "../src/services/rating";
import { UserService } from "../src/services/user";
import { SessionService } from "../src/services/session";
import { PostService } from "../src/services/post";
import { MetaService } from "../src/services/meta";
import { PasswordResetService } from "../src/services/passwordReset";
import { VerifyService } from "../src/services/verify";
import { PostImageService } from "../src/services/postImage";
import { sendEmail } from "../src/emailer";

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Timeout after 30 seconds
jest.setTimeout(30000);

// Setup
beforeAll(
  async () =>
    new Promise((resolve) => {
      initDB(false).then(resolve);
    })
);

// Teardown
afterAll(() => {
  mainDB.close();
});

// Test util functions
test("Util", async () => {
  // Hash password
  const password = "password123";
  const hash = await hashPassword(password);
  expect(hash).not.toBe(password);

  // Check hashed password
  let same = await checkPassword(password, hash);
  expect(same).toBe(true);

  // Check invalid password
  same = await checkPassword(password + "4", hash);
  expect(same).toBe(false);
});

// Test user status service
test("UserStatus", async () => {
  // Get statuses
  const statuses = await UserStatusService.getStatuses();
  expect(statuses).toMatchObject([
    { id: 1, name: "Student" },
    { id: 2, name: "Alum" },
    { id: 3, name: "Faculty/Staff" },
    { id: 4, name: "Parent" },
    { id: 1000, name: "Other" },
  ]);

  // Get status names
  let statusName = await UserStatusService.getStatusName(1);
  expect(statusName).toBe("Student");
  statusName = await UserStatusService.getStatusName(4);
  expect(statusName).toBe("Parent");
  statusName = await UserStatusService.getStatusName(1000);
  expect(statusName).toBe("Other");
  statusName = await UserStatusService.getStatusName(999);
  expect(statusName).toBe(undefined);

  // Check valid statuses
  let validStatus = await UserStatusService.validStatus(2);
  expect(validStatus).toBe(true);
  validStatus = await UserStatusService.validStatus(3);
  expect(validStatus).toBe(true);
  validStatus = await UserStatusService.validStatus(999);
  expect(validStatus).toBe(false);
});

// Test location type service
test("LocationType", async () => {
  // Get locations
  const locations = await LocationTypeService.getLocations();
  expect(locations).toMatchObject([
    { id: 1, name: "Hotel" },
    { id: 2, name: "Hostel" },
    { id: 3, name: "B&B/Inn" },
    { id: 4, name: "Cafe/Bakery" },
    { id: 5, name: "Bar/Pub" },
    { id: 6, name: "Restaurant" },
    { id: 7, name: "Museum" },
    { id: 8, name: "Arts venue" },
    { id: 9, name: "Sports venue" },
    { id: 10, name: "Cultural attraction" },
    { id: 11, name: "Historical attraction" },
    { id: 1000, name: "Other" },
  ]);

  // Get location name
  let locationName = await LocationTypeService.getLocationName(1);
  expect(locationName).toBe("Hotel");
  locationName = await LocationTypeService.getLocationName(11);
  expect(locationName).toBe("Historical attraction");
  locationName = await LocationTypeService.getLocationName(1000);
  expect(locationName).toBe("Other");
  locationName = await LocationTypeService.getLocationName(999);
  expect(locationName).toBe(undefined);

  // Check valid locations
  let validLocation = await LocationTypeService.validLocation(2);
  expect(validLocation).toBe(true);
  validLocation = await LocationTypeService.validLocation(10);
  expect(validLocation).toBe(true);
  validLocation = await LocationTypeService.validLocation(999);
  expect(validLocation).toBe(false);
});

// Test image service
test("Image", async () => {
  const len = Math.floor(Math.random() * 63) + 1;
  const buf = crypto.randomBytes(len);

  // Create image
  const imageID = await ImageService.createImage(buf);
  expect(imageID.length).toBe(4);

  // Check image exists
  let imageExists = await ImageService.imageExists(imageID);
  expect(imageExists).toBe(true);

  // Get image
  let image = await ImageService.getImage(imageID);
  expect(image.id).toBe(imageID);
  expect(image.data.toString()).toBe(buf.toString());
  expect(image.registerTime - getTime()).toBeLessThanOrEqual(3);

  // Get missing image
  image = await ImageService.getImage("!!!!");
  expect(image).toBe(undefined);

  // Delete image
  await ImageService.deleteImage(imageID);

  // Check image is gone
  imageExists = await ImageService.imageExists(imageID);
  expect(imageExists).toBe(false);
});

// Test rating service
test("Rating", async () => {
  const rating = {
    general: 1,
    cost: 3,
    safety: 7,
  };

  // Create rating
  const ratingID = await RatingService.createRating(rating);
  expect(ratingID.length).toBe(4);

  // Check rating exists
  let ratingExists = await RatingService.ratingExists(ratingID);
  expect(ratingExists).toBe(true);

  // Get rating
  let rating2 = await RatingService.getRating(ratingID);
  expect(rating2).toMatchObject(rating);

  // Get missing rating
  rating2 = await RatingService.getRating("!!!!");
  expect(rating2).toBe(undefined);

  // Delete rating
  await RatingService.deleteRating(ratingID);

  // Check rating is gone
  ratingExists = await RatingService.ratingExists(ratingID);
  expect(ratingExists).toBe(false);
});

// Test user service
test("User", async () => {
  const firstname = "Martin";
  const lastname = "Luther";
  const email = "lumart01@luther.edu";
  const password = "password123";
  const statusID = 1; // Student

  // Make sure the email address is unique
  let uniqueEmail = await UserService.uniqueEmail(email);
  expect(uniqueEmail).toBe(true);

  // Create user
  const userID = await UserService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );
  expect(userID.length).toBe(4);

  // Check user exists
  let userExists = await UserService.userExists(userID);
  expect(userExists).toBe(true);

  // Check the email has now been registered
  uniqueEmail = await UserService.uniqueEmail(email);
  expect(uniqueEmail).toBe(false);

  // Get user
  let user = await UserService.getUser(userID);
  expect(user.id).toBe(userID);
  expect(user.firstname).toBe(firstname);
  expect(user.lastname).toBe(lastname);
  expect(user.email).toBe(email);
  expect(user.statusID).toBe(statusID);
  expect(user.verified).toBeFalsy();
  expect(user.approved).toBeFalsy();
  expect(user.admin).toBeFalsy();
  expect(user.imageID).toBeNull();
  expect(user.joinTime - getTime()).toBeLessThanOrEqual(3);
  expect(user.lastLoginTime).toBeNull();
  expect(user.lastPostTime).toBeNull();

  // Get user by email
  user = await UserService.getUserByEmail(email);
  expect(user.id).toBe(userID);
  expect(user.firstname).toBe(firstname);
  expect(user.lastname).toBe(lastname);
  expect(user.email).toBe(email);
  expect(user.statusID).toBe(statusID);
  expect(user.verified).toBeFalsy();
  expect(user.approved).toBeFalsy();
  expect(user.admin).toBeFalsy();
  expect(user.imageID).toBeNull();
  expect(user.joinTime - getTime()).toBeLessThanOrEqual(3);
  expect(user.lastLoginTime).toBeNull();
  expect(user.lastPostTime).toBeNull();

  // Check passwords match
  let same = await checkPassword(password, user.password);
  expect(same).toBe(true);

  // Get unapproved users
  let unapproved = await UserService.getUnapproved();
  expect(unapproved.length).toBe(1);
  expect(unapproved[0]["userID"]).toBe(userID);
  expect(unapproved[0].firstname).toBe(firstname);
  expect(unapproved[0].lastname).toBe(lastname);
  expect(unapproved[0].email).toBe(email);
  expect(unapproved[0]["status"]).toBe("Student");
  expect(unapproved[0].joinTime - getTime()).toBeLessThanOrEqual(3);

  // Log user in
  await UserService.setVerified(userID);
  await UserService.setApproved(userID);
  let success = await UserService.login(email, password);
  expect(success).toBe(true);
  unapproved = await UserService.getUnapproved();
  expect(unapproved.length).toBe(0);

  // Check last login timestamp has changed
  user = await UserService.getUser(userID);
  expect(user.lastLoginTime - getTime()).toBeLessThanOrEqual(3);

  // Attempt login with invalid email
  success = await UserService.login(email + "a", password);
  expect(success).toBe(false);

  // Attempt login with invalid password
  success = await UserService.login(email, password + "a");
  expect(success).toBe(false);

  // Get user status name
  const userStatusName = await UserService.getUserStatusName(userID);
  const statusName = await UserStatusService.getStatusName(statusID);
  expect(userStatusName).toBe(statusName);

  // Get null user image
  let userImage = await UserService.getUserImage(userID);
  expect(userImage).toBe(undefined);

  // Set user image
  const len = Math.floor(Math.random() * 63) + 1;
  const buf = crypto.randomBytes(len);
  await UserService.setUserImage(userID, buf);

  // Get new user image
  userImage = await UserService.getUserImage(userID);
  user = await UserService.getUser(userID);
  expect(userImage.id).toBe(user.imageID);
  expect(userImage.data.toString()).toBe(buf.toString());
  expect(userImage.registerTime - getTime()).toBeLessThanOrEqual(3);

  // Delete user image
  await UserService.deleteUserImage(userID);
  userImage = await UserService.getUserImage(userID);
  expect(userImage).toBe(undefined);

  // Check if user is verified
  await UserService.setVerified(userID, false);
  let verified = await UserService.isVerified(userID);
  expect(verified).toBe(false);

  // Set user to verified
  await UserService.setVerified(userID);
  verified = await UserService.isVerified(userID);
  expect(verified).toBe(true);

  // Check if user has been approved
  await UserService.setApproved(userID, false);
  let approved = await UserService.isApproved(userID);
  expect(approved).toBe(false);

  // Set user to approved
  await UserService.setApproved(userID);
  approved = await UserService.isApproved(userID);
  expect(approved).toBe(true);

  // Check if user is an admin
  let admin = await UserService.isAdmin(userID);
  expect(admin).toBe(false);

  // Make user an admin
  await UserService.setAdmin(userID);
  admin = await UserService.isAdmin(userID);
  expect(admin).toBe(true);

  // Change password
  const newPassword = "password135";
  await UserService.setUserPassword(userID, newPassword);
  user = await UserService.getUser(userID);

  // Check new password matches
  same = await checkPassword(newPassword, user.password);
  expect(same).toBe(true);

  // Check old password does not match
  same = await checkPassword(password, user.password);
  expect(same).toBe(false);

  // Check login with new password
  success = await UserService.login(email, newPassword);
  expect(success).toBe(true);

  // Check login with old password fails
  success = await UserService.login(email, password);
  expect(success).toBe(false);

  // Update post timestamp
  let lastPostTime = (await UserService.getUser(userID)).lastPostTime;
  expect(lastPostTime).toBeNull();
  await UserService.updateLastPostTime(userID);
  lastPostTime = (await UserService.getUser(userID)).lastPostTime;
  expect(lastPostTime - getTime()).toBeLessThanOrEqual(3);

  // Delete user
  await UserService.deleteUser(userID);

  // Check user is gone
  userExists = await UserService.userExists(userID);
  expect(userExists).toBe(false);

  // Check the email is no longer registered
  uniqueEmail = await UserService.uniqueEmail(email);
  expect(uniqueEmail).toBe(true);
});

// Test session service
test("Session", async () => {
  const firstname = "Martin";
  const lastname = "Luther";
  const email = "lumart01@luther.edu";
  const password = "password123";
  const statusID = 1; // Student

  const userID = await UserService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );
  await UserService.setVerified(userID);

  // Create session
  const sessionID = await SessionService.createSession(userID, false);
  expect(sessionID.length).toBe(16);

  // Check session exists
  let sessionExists = await SessionService.sessionExists(sessionID);
  expect(sessionExists).toBe(true);

  // Get session
  let session = await SessionService.getSession(sessionID);
  expect(session.id).toBe(sessionID);
  expect(session.userID).toBe(userID);
  expect(session.createTime - getTime()).toBeLessThanOrEqual(3);
  expect(session.updateTime - getTime()).toBeLessThanOrEqual(3);

  // Get userID by sessionID
  const sessionUserID = await SessionService.getUserIDBySessionID(sessionID);
  expect(sessionUserID).toBe(userID);

  // Get user by sessionID
  const sessionUser = await SessionService.getUserBySessionID(sessionID);
  expect(sessionUser.id).toBe(userID);
  expect(sessionUser.firstname).toBe(firstname);
  expect(sessionUser.lastname).toBe(lastname);
  expect(sessionUser.email).toBe(email);
  expect(sessionUser.statusID).toBe(statusID);
  const samePasswords = await checkPassword(password, sessionUser.password);
  expect(samePasswords).toBe(true);

  // Update session
  const previousUpdateTime = session.updateTime;
  await wait(1000);
  await SessionService.updateSession(sessionID, false);
  session = await SessionService.getSession(sessionID);
  expect(session.updateTime).toBeGreaterThan(previousUpdateTime);
  expect(session.updateTime - getTime()).toBeLessThanOrEqual(3);

  // Get all sessions
  await wait(1000);
  const sessionID2 = await SessionService.createSession(userID, false);
  let sessions = await SessionService.getUserSessions(userID);
  expect(sessions.length).toBe(2);
  expect(sessions[0].id).toBe(sessionID);
  expect(sessions[1].id).toBe(sessionID2);

  // Delete all sessions
  await SessionService.deleteUserSessions(userID);
  sessions = await SessionService.getUserSessions(userID);
  expect(sessions.length).toBe(0);
  sessionExists = await SessionService.sessionExists(sessionID);
  expect(sessionExists).toBe(false);
  sessionExists = await SessionService.sessionExists(sessionID2);
  expect(sessionExists).toBe(false);

  // Delete session
  const sessionID3 = await SessionService.createSession(userID, false);
  sessionExists = await SessionService.sessionExists(sessionID3);
  expect(sessionExists).toBe(true);
  await SessionService.deleteSession(sessionID3);

  // Check session is gone
  sessionExists = await SessionService.sessionExists(sessionID3);
  expect(sessionExists).toBe(false);

  await UserService.deleteUser(userID);
});

// Test post service
test("Post", async () => {
  const firstname = "Martin";
  const lastname = "Luther";
  const email = "lumart01@luther.edu";
  const password = "password123";
  const statusID = 1; // Student

  const userID = await UserService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );
  await UserService.setVerified(userID);

  const content = "Hello, post!";
  const location = "Mabe's Pizza";
  const locationTypeID = 6; // Restaurant
  const program = "N/A";
  const threeWords = "Absolutely amazing pizza";

  const len = Math.floor(Math.random() * 63) + 1;
  const buf = crypto.randomBytes(len);

  const rating = {
    general: 1,
    cost: 3,
    safety: 7,
  };

  // Create post
  let lastPostTime = (await UserService.getUser(userID)).lastPostTime;
  expect(lastPostTime).toBeNull();
  const postID = await PostService.createPost(
    userID,
    content,
    [buf],
    location,
    locationTypeID,
    program,
    rating,
    threeWords
  );
  expect(postID.length).toBe(4);
  lastPostTime = (await UserService.getUser(userID)).lastPostTime;
  expect(lastPostTime - getTime()).toBeLessThanOrEqual(3);

  // Check post exists
  let postExists = await PostService.postExists(postID);
  expect(postExists).toBe(true);

  // Get post
  const post = await PostService.getPost(postID);
  expect(post.id).toBe(postID);
  expect(post.userID).toBe(userID);
  expect(post.content).toBe(content);
  expect(post.location).toBe(location);
  expect(post.locationTypeID).toBe(locationTypeID);
  expect(post.program).toBe(program);
  expect(post.threeWords).toBe(threeWords);
  expect(post.approved).toBeFalsy();
  expect(post.createTime - getTime()).toBeLessThanOrEqual(3);
  expect(post.editTime).toBeNull();

  // Get unapproved posts
  let unapproved = await PostService.getUnapproved();
  expect(unapproved.length).toBe(1);
  expect(unapproved[0]["postID"]).toBe(postID);
  expect(unapproved[0]["firstname"]).toBe(firstname);
  expect(unapproved[0]["lastname"]).toBe(lastname);
  expect(unapproved[0].content).toBe(content);
  expect(unapproved[0].location).toBe(location);
  expect(unapproved[0]["locationType"]).toBe("Restaurant");
  expect(unapproved[0].program).toBe(program);
  expect(unapproved[0].threeWords).toBe(threeWords);
  expect(unapproved[0].createTime - getTime()).toBeLessThanOrEqual(3);

  // Get post user
  const postUser = await PostService.getPostUser(postID);
  const user = await UserService.getUser(userID);
  expect(postUser).toMatchObject(user);

  // Get post rating
  const postRating = await PostService.getPostRating(postID);
  expect(postRating).toMatchObject(rating);

  // Get post content
  const postContent = await PostService.getPostContent(postID);
  expect(postContent).toBe(content);

  // Set post content
  const newContent = "Goodbye, post!";
  await PostService.setPostContent(postID, newContent);
  const newPostContent = await PostService.getPostContent(postID);
  expect(newPostContent).toBe(newContent);

  // Get post images
  const postImages = await PostService.getPostImages(postID);
  expect(postImages.length).toBe(1);
  expect(postImages[0].data.toString()).toBe(buf.toString());

  // Set post image
  const newLen = Math.floor(Math.random() * 63) + 1;
  const newBuf = crypto.randomBytes(newLen);
  await PostService.setPostImages(postID, [newBuf]);
  const newPostImages = await PostService.getPostImages(postID);
  expect(newPostImages.length).toBe(2);
  expect(newPostImages[1].data.toString()).toBe(newBuf.toString());

  // Check approved
  let approved = await PostService.isApproved(postID);
  expect(approved).toBe(false);

  // Set approved
  await PostService.setApproved(postID);
  approved = await PostService.isApproved(postID);
  expect(approved).toBe(true);
  unapproved = await PostService.getUnapproved();
  expect(unapproved.length).toBe(0);

  // Get all user posts
  const postID2 = await PostService.createPost(
    userID,
    content,
    [buf],
    location,
    locationTypeID,
    program,
    rating,
    threeWords
  );
  let posts = await PostService.getUserPosts(userID);
  expect(posts.length).toBe(2);
  expect(posts[0].id).toBe(postID);
  expect(posts[1].id).toBe(postID2);

  // Delete all user posts
  await PostService.deleteUserPosts(userID);
  posts = await PostService.getUserPosts(userID);
  expect(posts.length).toBe(0);
  postExists = await PostService.postExists(postID);
  expect(postExists).toBe(false);
  postExists = await PostService.postExists(postID2);
  expect(postExists).toBe(false);

  // Delete post
  await wait(1000);
  const postID3 = await PostService.createPost(
    userID,
    content,
    [buf],
    location,
    locationTypeID,
    program,
    rating,
    threeWords
  );
  postExists = await PostService.postExists(postID3);
  expect(postExists).toBe(true);
  await PostService.deletePost(postID3);

  // Check post is gone
  postExists = await PostService.postExists(postID3);
  expect(postExists).toBe(false);

  await UserService.deleteUser(userID);
});

// Test meta service
test("Meta", async () => {
  const key1 = "Test Version";
  const value1 = "0.1.0";
  const value1_2 = "1.2.3";
  const key2 = "Test Table";
  const value2 = "Meta";

  // Insert values
  await MetaService.set(key1, value1);

  // Check values exists
  let valueExists = await MetaService.exists(key1);
  expect(valueExists).toBe(true);

  // Get value
  let value = await MetaService.get(key1);
  expect(value).toBe(value1);

  // Set value
  await MetaService.set(key1, value1_2);
  value = await MetaService.get(key1);
  expect(value).toBe(value1_2);

  // Get all
  await MetaService.set(key2, value2);
  const values = await MetaService.getAll();
  expect(values).toContainEqual({ name: key2, value: value2 });
  expect(values).toContainEqual({ name: key1, value: value1_2 });

  // Remove
  await MetaService.remove(key1);
  await MetaService.remove(key2);

  // Check values are gone
  valueExists = await MetaService.exists(key1);
  expect(valueExists).toBe(false);
  valueExists = await MetaService.exists(key2);
  expect(valueExists).toBe(false);
});

// Test password reset service
test("PasswordReset", async () => {
  const firstname = "Martin";
  const lastname = "Luther";
  const email = "lumart01@luther.edu";
  const password = "password123";
  const statusID = 1; // Student

  const userID = await UserService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );
  await UserService.setVerified(userID);

  // Request password reset
  const resetID = await PasswordResetService.requestPasswordReset(
    email,
    false
  );
  expect(resetID).not.toBeNull();
  expect(resetID.length).toBe(16);

  // Attempt request with invalid email
  const resetID2 = await PasswordResetService.requestPasswordReset(
    "fake_email",
    false
  );
  expect(resetID2).toBeNull();

  // Attempt request with same email address
  const resetID3 = await PasswordResetService.requestPasswordReset(
    email,
    false
  );
  expect(resetID3).toBeNull();

  // Attempt request with unverified account
  await UserService.setVerified(userID, false);
  const resetID4 = await PasswordResetService.requestPasswordReset(
    email,
    false
  );
  expect(resetID4).toBeNull();
  await UserService.setVerified(userID);

  // Check reset record exists
  let recordExists = await PasswordResetService.resetRecordExists(resetID);
  expect(recordExists).toBe(true);

  // Get reset record
  const resetRecord = await PasswordResetService.getResetRecord(resetID);
  expect(resetRecord.id).toBe(resetID);
  expect(resetRecord.email).toBe(email);
  expect(resetRecord.createTime - getTime()).toBeLessThanOrEqual(3);

  // Delete reset record
  await PasswordResetService.deleteResetRecord(resetID);
  recordExists = await PasswordResetService.resetRecordExists(resetID);
  expect(recordExists).toBe(false);

  // Attempt to reset with invalid ID
  let success = await PasswordResetService.resetPassword(
    resetID3,
    "not new password"
  );
  expect(success).toBe(false);

  // Reset password
  const newPassword = "new password";
  const resetID5 = await PasswordResetService.requestPasswordReset(
    email,
    false
  );
  success = await PasswordResetService.resetPassword(resetID5, newPassword);
  expect(success).toBe(true);
  const newHashedPassword = (await UserService.getUser(userID)).password;
  const match = await checkPassword(newPassword, newHashedPassword);
  expect(match).toBe(true);

  // Check record has been removed
  recordExists = await PasswordResetService.resetRecordExists(resetID4);
  expect(recordExists).toBe(false);

  await UserService.deleteUser(userID);
});

// Test verify service
test("Verify", async () => {
  const firstname = "Martin";
  const lastname = "Luther";
  const email = "lumart01@luther.edu";
  const password = "password123";
  const statusID = 1; // Student

  // Create verification record
  const verifyID = await VerifyService.createVerifyRecord(email, false);
  expect(verifyID).not.toBeNull();
  expect(verifyID.length).toBe(16);

  // Create user record
  const userID = await UserService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );

  // Attempt verification with email that already exists
  const userID2 = await UserService.createUser(
    firstname,
    lastname,
    "email",
    password,
    statusID
  );
  const verifyID2 = await VerifyService.createVerifyRecord("email", false);
  expect(verifyID2).toBeNull();
  await UserService.deleteUser(userID2);

  // Attempt verification with the same email
  const verifyID3 = await VerifyService.createVerifyRecord(email, false);
  expect(verifyID3).toBeNull();

  // Check verification record exists
  let recordExists = await VerifyService.verifyRecordExists(verifyID);
  expect(recordExists).toBe(true);

  // Get verification record
  const verifyRecord = await VerifyService.getVerifyRecord(verifyID);
  expect(verifyRecord.id).toBe(verifyID);
  expect(verifyRecord.email).toBe(email);
  expect(verifyRecord.createTime - getTime()).toBeLessThanOrEqual(3);

  // Delete verification record
  await VerifyService.deleteVerifyRecord(verifyID);
  recordExists = await VerifyService.verifyRecordExists(verifyID);
  expect(recordExists).toBe(false);

  // Attempt to verify with invalid ID
  let success = await VerifyService.verifyUser(verifyID3);
  expect(success).toBe(false);
  await UserService.deleteUser(userID);

  // Verify user
  const verifyID4 = await VerifyService.createVerifyRecord(email, false);
  const userID3 = await UserService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );
  let verified = (await UserService.getUser(userID3)).verified;
  expect(verified).toBeFalsy();
  success = await VerifyService.verifyUser(verifyID4);
  expect(success).toBe(true);
  verified = (await UserService.getUser(userID3)).verified;
  expect(verified).toBeTruthy();

  // Check record has been removed
  recordExists = await VerifyService.verifyRecordExists(verifyID4);
  expect(recordExists).toBe(false);

  await UserService.deleteUser(userID3);
});

test("PostImage", async () => {
  const firstname = "Martin";
  const lastname = "Luther";
  const email = "lumart01@luther.edu";
  const password = "password123";
  const statusID = 1; // Student

  const userID = await UserService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );
  await UserService.setVerified(userID);

  const content = "Hello, post!";
  const location = "Mabe's Pizza";
  const locationTypeID = 6; // Restaurant
  const program = "N/A";
  const threeWords = "Absolutely amazing pizza";

  const rating = {
    general: 1,
    cost: 3,
    safety: 7,
  };

  // Create post
  const postID = await PostService.createPost(
    userID,
    content,
    [],
    location,
    locationTypeID,
    program,
    rating,
    threeWords
  );

  // Check no post images exist
  let postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(0);
  let numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(0);

  // Check set post image
  const len = Math.floor(Math.random() * 63) + 1;
  const buf = crypto.randomBytes(len);
  const imageID = await ImageService.createImage(buf);
  await PostImageService.setPostImage(postID, imageID);
  postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(1);
  expect(postImages[0].data.toString()).toBe(buf.toString());
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(1);

  // Create post image
  const len2 = Math.floor(Math.random() * 63) + 1;
  const buf2 = crypto.randomBytes(len2);
  const imageID2 = await PostImageService.createPostImage(postID, buf2);
  postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(2);
  expect(postImages[1].id).toBe(imageID2);
  expect(postImages[1].data.toString()).toBe(buf2.toString());
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(2);

  // Create post images
  const len3 = Math.floor(Math.random() * 63) + 1;
  const buf3 = crypto.randomBytes(len3);
  const len4 = Math.floor(Math.random() * 63) + 1;
  const buf4 = crypto.randomBytes(len4);
  const [imageID3, imageID4] = await PostImageService.createPostImages(
    postID,
    [buf3, buf4]
  );
  postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(4);
  expect(postImages[2].id).toBe(imageID3);
  expect(postImages[2].data.toString()).toBe(buf3.toString());
  expect(postImages[3].id).toBe(imageID4);
  expect(postImages[3].data.toString()).toBe(buf4.toString());
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(4);

  // Delete all post images
  await PostImageService.deletePostImages(postID);
  postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(0);
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(0);

  // Delete images upon post deletion
  const len5 = Math.floor(Math.random() * 63) + 1;
  const buf5 = crypto.randomBytes(len5);
  const imageID5 = await PostImageService.createPostImage(postID, buf5);
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(1);
  let imageExists = await ImageService.imageExists(imageID5);
  expect(imageExists).toBe(true);
  await PostService.deletePost(postID);
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(0);
  imageExists = await ImageService.imageExists(imageID5);
  expect(imageExists).toBe(false);

  await UserService.deleteUser(userID);
});

// Test sending emails
test("Email", async () => {
  // To test this, fill in an email address to send to below.
  const address = "";
  const subject = "Test email subject line";
  const html = "<h1>HTML Content</h1><p>Hello, email!</p>";
  const text = "Text Content\n\nHello, email!";

  if (address) {
    await sendEmail(address, subject, html, text);
  }
});
