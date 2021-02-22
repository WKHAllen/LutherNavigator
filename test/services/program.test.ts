import { getDBM, closeDBM } from "./util";

// Test program service
test("Program", async () => {
  const dbm = await getDBM();

  const programID = -1000;
  const programName = "Test Program";

  // Create a program
  await dbm.programService.createProgram(programID, programName);

  // Check program exists
  let exists = await dbm.programService.programExists(programID);
  expect(exists).toBe(true);

  // Get program
  let program = await dbm.programService.getProgram(programID);
  expect(program.id).toBe(programID);
  expect(program.name).toBe(programName);

  // Get programs
  const programs = await dbm.programService.getPrograms();
  expect(programs.length).toBeGreaterThanOrEqual(1);
  expect(programs).toEqual(
    expect.arrayContaining([{ id: programID, name: programName }])
  );

  // Get name
  let progName = await dbm.programService.getProgramName(programID);
  expect(progName).toBe(programName);

  // Change program ID
  await dbm.programService.changeProgramID(programID, programID + 1);
  program = await dbm.programService.getProgram(programID + 1);
  expect(program.id).toBe(programID + 1);
  expect(program.name).toBe(programName);
  await dbm.programService.changeProgramID(programID + 1, programID);

  // Set program name
  await dbm.programService.setProgramName(programID, programName + "!");
  progName = await dbm.programService.getProgramName(programID);
  expect(progName).toBe(programName + "!");
  await dbm.programService.setProgramName(programID, programName);

  // Delete program
  await dbm.programService.deleteProgram(programID);

  // Check program is gone
  exists = await dbm.programService.programExists(programID);
  expect(exists).toBe(false);
  program = await dbm.programService.getProgram(programID);
  expect(program).toBeUndefined();

  await closeDBM(dbm);
});
