import { getDBM, closeDBM } from "./util";

// Test query functions
test("Query", async () => {
  const dbm = await getDBM();

  

  await closeDBM(dbm);
});
