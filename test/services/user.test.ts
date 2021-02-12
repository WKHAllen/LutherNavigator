import * as crypto from "crypto";
import { getTime, checkPassword } from "../../src/services/util";
import { UserService } from "../../src/services/user";
import { UserStatusService } from "../../src/services/userStatus";

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
