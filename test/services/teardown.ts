import mainDB from "../../src/services/util";

// Teardown
export = async function () {
  await mainDB.close();
};
