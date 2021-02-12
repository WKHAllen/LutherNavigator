import mainDB from "../../src/services/util";
import initDB from "../../src/dbinit";

// Asynchronously sleep
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Timeout after 30 seconds
jest.setTimeout(30000);

// Setup
beforeAll(
  async () =>
    new Promise((resolve) => {
      initDB(false).then(resolve);
    })
);

// Teardown
afterAll(() => {
  mainDB.close();
});
