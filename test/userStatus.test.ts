import { UserStatusService } from "../src/services/userStatus";

test("thing", async () => {
  const statuses = await UserStatusService.getStatuses();
});
