import * as crypto from "crypto";
import { getTime } from "../../src/services/util";
import { ImageService } from "../../src/services/image";

// Test image service
test("Image", async () => {
  const len = Math.floor(Math.random() * 63) + 1;
  const buf = crypto.randomBytes(len);

  // Create image
  const imageID = await ImageService.createImage(buf);
  expect(imageID.length).toBe(4);

  // Check image exists
  let imageExists = await ImageService.imageExists(imageID);
  expect(imageExists).toBe(true);

  // Get image
  let image = await ImageService.getImage(imageID);
  expect(image.id).toBe(imageID);
  expect(image.data.toString()).toBe(buf.toString());
  expect(image.registerTime - getTime()).toBeLessThanOrEqual(3);

  // Get missing image
  image = await ImageService.getImage("!!!!");
  expect(image).toBe(undefined);

  // Delete image
  await ImageService.deleteImage(imageID);

  // Check image is gone
  imageExists = await ImageService.imageExists(imageID);
  expect(imageExists).toBe(false);
});
