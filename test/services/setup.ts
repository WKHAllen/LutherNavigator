import initDB, { useConnection } from "../../src/dbinit";

// Setup
export = async function () {
  await useConnection();
  await initDB(false);
};
