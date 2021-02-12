import { hashPassword, checkPassword } from "../../src/services/util";

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
