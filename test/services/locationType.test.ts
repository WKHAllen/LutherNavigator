import { LocationTypeService } from "../../src/services/locationType";

// Test location type service
test("LocationType", async () => {
  // Get locations
  const locations = await LocationTypeService.getLocations();
  expect(locations).toMatchObject([
    { id: 1, name: "Hotel" },
    { id: 2, name: "Hostel" },
    { id: 3, name: "B&B/Inn" },
    { id: 4, name: "Cafe/Bakery" },
    { id: 5, name: "Bar/Pub" },
    { id: 6, name: "Restaurant" },
    { id: 7, name: "Museum" },
    { id: 8, name: "Arts venue" },
    { id: 9, name: "Sports venue" },
    { id: 10, name: "Cultural attraction" },
    { id: 11, name: "Historical attraction" },
    { id: 1000, name: "Other" },
  ]);

  // Get location name
  let locationName = await LocationTypeService.getLocationName(1);
  expect(locationName).toBe("Hotel");
  locationName = await LocationTypeService.getLocationName(11);
  expect(locationName).toBe("Historical attraction");
  locationName = await LocationTypeService.getLocationName(1000);
  expect(locationName).toBe("Other");
  locationName = await LocationTypeService.getLocationName(999);
  expect(locationName).toBe(undefined);

  // Check valid locations
  let validLocation = await LocationTypeService.validLocation(2);
  expect(validLocation).toBe(true);
  validLocation = await LocationTypeService.validLocation(10);
  expect(validLocation).toBe(true);
  validLocation = await LocationTypeService.validLocation(999);
  expect(validLocation).toBe(false);
});
