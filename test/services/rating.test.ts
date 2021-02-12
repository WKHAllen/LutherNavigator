import { RatingService } from "../../src/services/rating";

// Test rating service
test("Rating", async () => {
  const rating = {
    general: 1,
    cost: 3,
    safety: 7,
  };

  // Create rating
  const ratingID = await RatingService.createRating(rating);
  expect(ratingID.length).toBe(4);

  // Check rating exists
  let ratingExists = await RatingService.ratingExists(ratingID);
  expect(ratingExists).toBe(true);

  // Get rating
  let rating2 = await RatingService.getRating(ratingID);
  expect(rating2).toMatchObject(rating);

  // Get missing rating
  rating2 = await RatingService.getRating("!!!!");
  expect(rating2).toBe(undefined);

  // Delete rating
  await RatingService.deleteRating(ratingID);

  // Check rating is gone
  ratingExists = await RatingService.ratingExists(ratingID);
  expect(ratingExists).toBe(false);
});
