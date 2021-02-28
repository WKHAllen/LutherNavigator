import { getDBM, closeDBM, getByID } from "./util";
import * as crypto from "crypto";

// Test query functions
test("Query", async () => {
  const dbm = await getDBM();

  const firstname = "Martin";
  const lastname = "Luther";
  const email = "lumart01@luther.edu";
  const password = "password123";
  const statusID = 1; // Student

  const userID = await dbm.userService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );
  await dbm.userService.setVerified(userID);

  const content = "QUERY POST CONTENT";
  const location = "QUERY POST LOCATION";
  const locationTypeID = 6; // Restaurant
  const programID = 1;
  const threeWords = "Three word description";

  const generalRating = 5;
  const rating = { general: generalRating };

  const len = Math.floor(Math.random() * 63) + 1;
  const buf = crypto.randomBytes(len);

  const postID = await dbm.postService.createPost(
    userID,
    content,
    [],
    location,
    locationTypeID,
    programID,
    rating,
    threeWords
  );
  await dbm.postService.setPostImages(postID, [buf]);

  // Query before approved
  let results = await dbm.queryService.query("Content");
  let result = getByID(results, postID);
  expect(result).toBeUndefined();
  await dbm.postService.setApproved(postID);

  // Query by content
  results = await dbm.queryService.query("Content");
  expect(results.length).toBeGreaterThan(0);
  result = getByID(results, postID);
  expect(result.id).toBe(postID);
  expect(result["rating"]).toBe(generalRating);

  // Query by location
  results = await dbm.queryService.query("Location");
  expect(results.length).toBeGreaterThan(0);
  result = getByID(results, postID);
  expect(result?.id).toBe(postID);
  expect(result["rating"]).toBe(generalRating);

  // Query by program
  results = await dbm.queryService.query("j-term");
  expect(results.length).toBeGreaterThan(0);
  result = getByID(results, postID);
  expect(result?.id).toBe(postID);
  expect(result["rating"]).toBe(generalRating);

  await dbm.postService.deletePost(postID);
  await dbm.userService.deleteUser(userID);

  await closeDBM(dbm);
});
