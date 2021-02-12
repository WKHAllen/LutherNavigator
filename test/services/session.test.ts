import { wait } from "./main";
import { getTime, checkPassword } from "../../src/services/util";
import { SessionService } from "../../src/services/session";
import { UserService } from "../../src/services/user";

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
