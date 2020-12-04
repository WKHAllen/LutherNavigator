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

// Timeout after 10 seconds
jest.setTimeout(10000);

// Setup
beforeAll(
  async () =>
    new Promise((resolve) => {
      initDB().then(resolve);
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
test("User status", async () => {
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
test("Location type", async () => {
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
  expect(user.admin).toBeFalsy();
  expect(user.imageID).toBe(null);
  expect(user.joinTime - getTime()).toBeLessThanOrEqual(3);
  expect(user.lastLoginTime).toBe(null);
  expect(user.lastPostTime).toBe(null);

  // Check passwords match
  const same = await checkPassword(password, user.password);
  expect(same).toBe(true);

  // Log user in
  let success = await UserService.login(email, password);
  expect(success).toBe(true);

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
  let verified = await UserService.isVerified(userID);
  expect(verified).toBeFalsy();

  // Set user to verified
  await UserService.setVerified(userID);
  verified = await UserService.isVerified(userID);
  expect(verified).toBeTruthy();

  // Check if user is an admin
  let admin = await UserService.isAdmin(userID);
  expect(admin).toBeFalsy();

  // Make user an admin
  await UserService.setAdmin(userID);
  admin = await UserService.isAdmin(userID);
  expect(admin).toBeTruthy();

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

  // Create session
  const sessionID = await SessionService.createSession(userID);
  expect(sessionID.length).toBe(16);

  // Check session exists
  let sessionExists = await SessionService.sessionExists(sessionID);
  expect(sessionExists).toBe(true);

  // Get session
  const session = await SessionService.getSession(sessionID);
  expect(session.id).toBe(sessionID);
  expect(session.userID).toBe(userID);
  expect(session.createTime - getTime()).toBeLessThanOrEqual(3);

  // Get userID by sessionID
  const sessionUserID = await SessionService.getUserBySessionID(sessionID);
  expect(sessionUserID).toBe(userID);

  // Get all sessions
  const sessionID2 = await SessionService.createSession(userID);
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
  const sessionID3 = await SessionService.createSession(userID);
  sessionExists = await SessionService.sessionExists(sessionID3);
  expect(sessionExists).toBe(true);
  await SessionService.deleteSession(sessionID3);

  // Check session is gone
  sessionExists = await SessionService.sessionExists(sessionID3);
  expect(sessionExists).toBe(false);

  await UserService.deleteUser(userID);
});
