import initDB from "../../src/dbinit";

// Setup
export = async function () {
  await initDB(false);
};
