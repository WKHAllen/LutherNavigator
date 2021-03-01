import { getDBM, closeDBM } from "./util";
import initDB from "../../src/dbinit";

// Setup
export = async function () {
  const dbm = await getDBM();
  await initDB(dbm, false);
  await closeDBM(dbm);
};
