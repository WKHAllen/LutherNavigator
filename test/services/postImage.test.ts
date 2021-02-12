import * as crypto from "crypto";
import { PostImageService } from "../../src/services/postImage";
import { ImageService } from "../../src/services/image";
import { UserService } from "../../src/services/user";
import { PostService } from "../../src/services/post";

test("PostImage", async () => {
  const firstname = "Martin";
  const lastname = "Luther";
  const email = "lumart01@luther.edu";
  const password = "password123";
  const statusID = 1; // Student

  const userID = await UserService.createUser(
    firstname,
    lastname,
    email,
    password,
    statusID
  );
  await UserService.setVerified(userID);

  const content = "Hello, post!";
  const location = "Mabe's Pizza";
  const locationTypeID = 6; // Restaurant
  const program = "N/A";
  const threeWords = "Absolutely amazing pizza";

  const rating = {
    general: 1,
    cost: 3,
    safety: 7,
  };

  // Create post
  const postID = await PostService.createPost(
    userID,
    content,
    [],
    location,
    locationTypeID,
    program,
    rating,
    threeWords
  );

  // Check no post images exist
  let postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(0);
  let numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(0);

  // Check set post image
  const len = Math.floor(Math.random() * 63) + 1;
  const buf = crypto.randomBytes(len);
  const imageID = await ImageService.createImage(buf);
  await PostImageService.setPostImage(postID, imageID);
  postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(1);
  expect(postImages[0].data.toString()).toBe(buf.toString());
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(1);

  // Create post image
  const len2 = Math.floor(Math.random() * 63) + 1;
  const buf2 = crypto.randomBytes(len2);
  const imageID2 = await PostImageService.createPostImage(postID, buf2);
  postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(2);
  expect(postImages[1].id).toBe(imageID2);
  expect(postImages[1].data.toString()).toBe(buf2.toString());
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(2);

  // Create post images
  const len3 = Math.floor(Math.random() * 63) + 1;
  const buf3 = crypto.randomBytes(len3);
  const len4 = Math.floor(Math.random() * 63) + 1;
  const buf4 = crypto.randomBytes(len4);
  const [imageID3, imageID4] = await PostImageService.createPostImages(postID, [
    buf3,
    buf4,
  ]);
  postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(4);
  expect(postImages[2].id).toBe(imageID3);
  expect(postImages[2].data.toString()).toBe(buf3.toString());
  expect(postImages[3].id).toBe(imageID4);
  expect(postImages[3].data.toString()).toBe(buf4.toString());
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(4);

  // Delete all post images
  await PostImageService.deletePostImages(postID);
  postImages = await PostImageService.getPostImages(postID);
  expect(postImages.length).toBe(0);
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(0);

  // Delete images upon post deletion
  const len5 = Math.floor(Math.random() * 63) + 1;
  const buf5 = crypto.randomBytes(len5);
  const imageID5 = await PostImageService.createPostImage(postID, buf5);
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(1);
  let imageExists = await ImageService.imageExists(imageID5);
  expect(imageExists).toBe(true);
  await PostService.deletePost(postID);
  numImages = await PostImageService.numImages(postID);
  expect(numImages).toBe(0);
  imageExists = await ImageService.imageExists(imageID5);
  expect(imageExists).toBe(false);

  await UserService.deleteUser(userID);
});
