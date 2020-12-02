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

  // Get user
  let user = await UserService.getUser(userID);
  expect(user.id).toBe(userID);
  expect(user.firstname).toBe(firstname);
  expect(user.lastname).toBe(lastname);
  expect(user.email).toBe(email);
  expect(user.statusID).toBe(statusID);
  expect(user.verified).toBe(false);
  expect(user.admin).toBe(false);
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

  // Get user image

  // Set user image

  // Get new user image

  // Check if user is verified

  // Check if user is an admin

  // Delete user

  // Check user is gone
});
