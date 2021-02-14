import { getDBM, closeDBM } from "./util";
import { hashPassword, checkPassword } from "../../src/services/util";

// Test util functions
test("Util", async () => {
  const dbm = await getDBM();

  // Hash password
  const password = "password123";
  const hash = await hashPassword(dbm, password);
  expect(hash).not.toBe(password);

  // Check hashed password
  let same = await checkPassword(password, hash);
  expect(same).toBe(true);

  // Check invalid password
  same = await checkPassword(password + "4", hash);
  expect(same).toBe(false);

  await closeDBM(dbm);
});
