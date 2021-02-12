import { getTime, checkPassword } from "../../src/services/util";
import { PasswordResetService } from "../../src/services/passwordReset";
import { UserService } from "../../src/services/user";

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
  const resetID = await PasswordResetService.requestPasswordReset(email, false);
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
