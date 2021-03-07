import { getDBM, closeDBM, getByID } from "./util";
import { getTime } from "../../src/services/util";

// Test user status service
test("UserStatusChange", async () => {
  const dbm = await getDBM();

  const firstname = "Martin";
  const lastname = "Luther";
  const email = "lumart01@luther.edu";
  const password = "password123";
  const statusID = 1; // Student
  const newStatusID = 2; // Alum

  const userID = await dbm.userService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );
  await dbm.userService.setVerified(userID);

  // Request a status change
  let requestID = await dbm.userStatusChangeService.createStatusChangeRequest(
    userID,
    newStatusID
  );
  expect(requestID.length).toBe(4);

  // Check request exists
  let exists = await dbm.userStatusChangeService.statusChangeRequestExists(
    requestID
  );
  expect(exists).toBe(true);

  // Get status change request
  let request = await dbm.userStatusChangeService.getStatusChangeRequest(
    requestID
  );
  expect(request.id).toBe(requestID);
  expect(request.userID).toBe(userID);
  expect(request.newStatusID).toBe(newStatusID);
  expect(request.createTime - getTime()).toBeLessThanOrEqual(3);

  // Delete the request
  await dbm.userStatusChangeService.deleteStatusChangeRequest(requestID);
  exists = await dbm.userStatusChangeService.statusChangeRequestExists(
    requestID
  );
  expect(exists).toBe(false);
  request = await dbm.userStatusChangeService.getStatusChangeRequest(requestID);
  expect(request).toBe(undefined);

  // Get all requests
  requestID = await dbm.userStatusChangeService.createStatusChangeRequest(
    userID,
    newStatusID
  );
  const requests = await dbm.userStatusChangeService.getStatusChangeRequests();
  expect(requests.length).toBeGreaterThanOrEqual(1);
  request = getByID(requests, requestID);
  expect(request.id).toBe(requestID);
  expect(request.userID).toBe(userID);
  expect(request.newStatusID).toBe(newStatusID);
  expect(request.createTime - getTime()).toBeLessThanOrEqual(3);

  // Approve request
  let user = await dbm.userService.getUser(userID);
  expect(user.statusID).toBe(statusID);
  await dbm.userStatusChangeService.approveStatusChangeRequest(requestID);
  exists = await dbm.userStatusChangeService.statusChangeRequestExists(
    requestID
  );
  expect(exists).toBe(false);
  user = await dbm.userService.getUser(userID);
  expect(user.statusID).toBe(newStatusID);

  // Deny request
  requestID = await dbm.userStatusChangeService.createStatusChangeRequest(
    userID,
    statusID
  );
  user = await dbm.userService.getUser(userID);
  expect(user.statusID).toBe(newStatusID);
  await dbm.userStatusChangeService.denyStatusChangeRequest(requestID);
  exists = await dbm.userStatusChangeService.statusChangeRequestExists(
    requestID
  );
  expect(exists).toBe(false);
  user = await dbm.userService.getUser(userID);
  expect(user.statusID).toBe(newStatusID);

  await dbm.userService.deleteUser(userID);

  await closeDBM(dbm);
});
