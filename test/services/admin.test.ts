import { getDBM, closeDBM } from "./util";

// Test admin service
test("Admin", async () => {
  const dbm = await getDBM();

  // Get number of records in tables
  let numRecords = await dbm.adminService.getRecords("UserStatus");
  expect(numRecords).toBeGreaterThan(0);
  numRecords = await dbm.adminService.getRecords("LocationType");
  expect(numRecords).toBeGreaterThan(0);

  // Get all users
  const userProps = [
    "userID",
    "firstname",
    "lastname",
    "email",
    "status",
    "verified",
    "approved",
    "admin",
    "joinTime",
  ];
  const users = await dbm.adminService.getUsers();
  if (users.length >= 1) {
    for (const prop of userProps) expect(users[0]).toHaveProperty(prop);
  }

  // Get all posts
  const postProps = [
    "postID",
    "location",
    "postUser",
    "program",
    "rating",
    "approved",
  ];
  const posts = await dbm.adminService.getPosts();
  if (users.length >= 1) {
    for (const prop of postProps) expect(posts[0]).toHaveProperty(prop);
  }

  await closeDBM(dbm);
});
