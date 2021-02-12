import * as crypto from "crypto";
import { wait } from "./main";
import { getTime } from "../../src/services/util";
import { PostService } from "../../src/services/post";
import { UserService } from "../../src/services/user";

// Test post service
test("Post", async () => {
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

  const len = Math.floor(Math.random() * 63) + 1;
  const buf = crypto.randomBytes(len);

  const rating = {
    general: 1,
    cost: 3,
    safety: 7,
  };

  // Create post
  let lastPostTime = (await UserService.getUser(userID)).lastPostTime;
  expect(lastPostTime).toBeNull();
  const postID = await PostService.createPost(
    userID,
    content,
    [buf],
    location,
    locationTypeID,
    program,
    rating,
    threeWords
  );
  expect(postID.length).toBe(4);
  lastPostTime = (await UserService.getUser(userID)).lastPostTime;
  expect(lastPostTime - getTime()).toBeLessThanOrEqual(3);

  // Check post exists
  let postExists = await PostService.postExists(postID);
  expect(postExists).toBe(true);

  // Get post
  const post = await PostService.getPost(postID);
  expect(post.id).toBe(postID);
  expect(post.userID).toBe(userID);
  expect(post.content).toBe(content);
  expect(post.location).toBe(location);
  expect(post.locationTypeID).toBe(locationTypeID);
  expect(post.program).toBe(program);
  expect(post.threeWords).toBe(threeWords);
  expect(post.approved).toBeFalsy();
  expect(post.createTime - getTime()).toBeLessThanOrEqual(3);
  expect(post.editTime).toBeNull();

  // Get unapproved posts
  let unapproved = await PostService.getUnapproved();
  expect(unapproved.length).toBe(1);
  expect(unapproved[0]["postID"]).toBe(postID);
  expect(unapproved[0]["firstname"]).toBe(firstname);
  expect(unapproved[0]["lastname"]).toBe(lastname);
  expect(unapproved[0].content).toBe(content);
  expect(unapproved[0].location).toBe(location);
  expect(unapproved[0]["locationType"]).toBe("Restaurant");
  expect(unapproved[0].program).toBe(program);
  expect(unapproved[0].threeWords).toBe(threeWords);
  expect(unapproved[0].createTime - getTime()).toBeLessThanOrEqual(3);

  // Get post user
  const postUser = await PostService.getPostUser(postID);
  const user = await UserService.getUser(userID);
  expect(postUser).toMatchObject(user);

  // Get post rating
  const postRating = await PostService.getPostRating(postID);
  expect(postRating).toMatchObject(rating);

  // Get post content
  const postContent = await PostService.getPostContent(postID);
  expect(postContent).toBe(content);

  // Set post content
  const newContent = "Goodbye, post!";
  await PostService.setPostContent(postID, newContent);
  const newPostContent = await PostService.getPostContent(postID);
  expect(newPostContent).toBe(newContent);

  // Get post images
  const postImages = await PostService.getPostImages(postID);
  expect(postImages.length).toBe(1);
  expect(postImages[0].data.toString()).toBe(buf.toString());

  // Set post image
  const newLen = Math.floor(Math.random() * 63) + 1;
  const newBuf = crypto.randomBytes(newLen);
  await PostService.setPostImages(postID, [newBuf]);
  const newPostImages = await PostService.getPostImages(postID);
  expect(newPostImages.length).toBe(2);
  expect(newPostImages[1].data.toString()).toBe(newBuf.toString());

  // Check approved
  let approved = await PostService.isApproved(postID);
  expect(approved).toBe(false);

  // Set approved
  await PostService.setApproved(postID);
  approved = await PostService.isApproved(postID);
  expect(approved).toBe(true);
  unapproved = await PostService.getUnapproved();
  expect(unapproved.length).toBe(0);

  // Get all user posts
  const postID2 = await PostService.createPost(
    userID,
    content,
    [buf],
    location,
    locationTypeID,
    program,
    rating,
    threeWords
  );
  let posts = await PostService.getUserPosts(userID);
  expect(posts.length).toBe(2);
  expect(posts[0].id).toBe(postID);
  expect(posts[1].id).toBe(postID2);

  // Delete all user posts
  await PostService.deleteUserPosts(userID);
  posts = await PostService.getUserPosts(userID);
  expect(posts.length).toBe(0);
  postExists = await PostService.postExists(postID);
  expect(postExists).toBe(false);
  postExists = await PostService.postExists(postID2);
  expect(postExists).toBe(false);

  // Delete post
  await wait(1000);
  const postID3 = await PostService.createPost(
    userID,
    content,
    [buf],
    location,
    locationTypeID,
    program,
    rating,
    threeWords
  );
  postExists = await PostService.postExists(postID3);
  expect(postExists).toBe(true);
  await PostService.deletePost(postID3);

  // Check post is gone
  postExists = await PostService.postExists(postID3);
  expect(postExists).toBe(false);

  await UserService.deleteUser(userID);
});
