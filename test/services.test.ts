import mainDB from "../src/services/util";
import initDB from "../src/dbinit";
import { UserStatusService } from "../src/services/userStatus";

// Setup
beforeAll(
  async () =>
    new Promise((resolve) => {
      initDB().then(resolve);
    })
);

// Teardown
afterAll(() => {
  mainDB.close();
});

// Test user status service
test("User status", async () => {
  // Get statuses
  const statuses = await UserStatusService.getStatuses();
  expect(statuses).toMatchObject([
    { id: 1, name: "Student" },
    { id: 2, name: "Alum" },
    { id: 3, name: "Faculty/Staff" },
    { id: 4, name: "Parent" },
    { id: 1000, name: "Other" },
  ]);

  // Get status names
  let statusName = await UserStatusService.getStatusName(1);
  expect(statusName).toBe("Student");
  statusName = await UserStatusService.getStatusName(4);
  expect(statusName).toBe("Parent");
  statusName = await UserStatusService.getStatusName(1000);
  expect(statusName).toBe("Other");
  statusName = await UserStatusService.getStatusName(999);
  expect(statusName).toBe(undefined);

  // Check valid statuses
  let validStatus = await UserStatusService.validStatus(2);
  expect(validStatus).toBe(true);
  validStatus = await UserStatusService.validStatus(3);
  expect(validStatus).toBe(true);
  validStatus = await UserStatusService.validStatus(999);
  expect(validStatus).toBe(false);
});
