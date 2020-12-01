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
  console.log(statuses);
});
