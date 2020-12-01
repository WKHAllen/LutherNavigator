import mainDB from "../src/services/util";
import initDB from "../src/dbinit";
import { UserStatusService } from "../src/services/userStatus";

beforeAll(
  async () =>
    new Promise((resolve) => {
      initDB().then(resolve);
    })
);

afterAll(() => {
  mainDB.close();
});

test("User status", async () => {
  const statuses = await UserStatusService.getStatuses();
  expect(statuses).toMatchObject([
    { id: 1, name: "Student" },
    { id: 2, name: "Alum" },
    { id: 3, name: "Faculty/Staff" },
    { id: 4, name: "Parent" },
    { id: 1000, name: "Other" },
  ]);
});
