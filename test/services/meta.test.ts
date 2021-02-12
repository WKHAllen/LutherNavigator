import { MetaService } from "../../src/services/meta";

// Test meta service
test("Meta", async () => {
  const key1 = "Test Version";
  const value1 = "0.1.0";
  const value1_2 = "1.2.3";
  const key2 = "Test Table";
  const value2 = "Meta";

  // Insert values
  await MetaService.set(key1, value1);

  // Check values exists
  let valueExists = await MetaService.exists(key1);
  expect(valueExists).toBe(true);

  // Get value
  let value = await MetaService.get(key1);
  expect(value).toBe(value1);

  // Set value
  await MetaService.set(key1, value1_2);
  value = await MetaService.get(key1);
  expect(value).toBe(value1_2);

  // Get all
  await MetaService.set(key2, value2);
  const values = await MetaService.getAll();
  expect(values).toContainEqual({ name: key2, value: value2 });
  expect(values).toContainEqual({ name: key1, value: value1_2 });

  // Remove
  await MetaService.remove(key1);
  await MetaService.remove(key2);

  // Check values are gone
  valueExists = await MetaService.exists(key1);
  expect(valueExists).toBe(false);
  valueExists = await MetaService.exists(key2);
  expect(valueExists).toBe(false);
});
