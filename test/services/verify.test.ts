import { getTime } from "../../src/services/util";
import { VerifyService } from "../../src/services/verify";
import { UserService } from "../../src/services/user";

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
