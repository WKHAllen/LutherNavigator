/**
 * Post routes.
 * @packageDocumentation
 */

import { Router } from "express";
import {
  auth,
  upload,
  getDBM,
  getUserID,
  maxImageSize,
  renderPage,
  getErrorMessage,
  setErrorMessage,
  getForm,
  setForm,
} from "./util";
import wrapRoute from "../asyncCatch";
import { RatingParams } from "../services/rating";
import { metaConfig } from "../config";

/**
 * The post router.
 */
export const postRouter = Router();

// Create post page
postRouter.get(
  "/",
  auth,
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const error = getErrorMessage(req, res);
    const form = getForm(req, res);
    const locationTypes = await dbm.locationTypeService.getLocations();
    const programs = await dbm.programService.getPrograms();

    await renderPage(req, res, "createPost", {
      title: "New post",
      error,
      form,
      locationTypes,
      programs,
    });
  })
);

// Create post event
postRouter.post(
  "/",
  auth,
  upload.array("images", 25),
  wrapRoute(async (req, res) => {
    const dbm = getDBM(req);

    const mimetypes = ["image/png", "image/jpg", "image/jpeg"];
    const userID = await getUserID(req);
    const maxImages =
      parseInt(await dbm.metaService.get("Images per post")) ||
      metaConfig["Images per post"];

    const content: string = req.body.postContent;
    const files = req.files as Express.Multer.File[];
    const location: string = req.body.location;
    const locationTypeID: number = parseInt(req.body.locationType) || 0;
    const programID: number = parseInt(req.body.program);
    const threeWords = [
      req.body.wordOne,
      req.body.wordTwo,
      req.body.wordThree,
    ].join(", ");

    const validLocationTypeID = dbm.locationTypeService.validLocation(
      locationTypeID
    );
    const imageData = files.map((file) => file.buffer);
    const imageTypesGood = files.map((file) =>
      mimetypes.includes(file.mimetype)
    );
    const imageSizesGood = files.map((file) => file.size < maxImageSize);

    // Validation
    if (content.length <= 0 || content.length > 750) {
      setErrorMessage(res, "Post content must be no more than 750 characters");
    } else if (imageData.length <= 0 || imageData.length > maxImages) {
      setErrorMessage(res, `Please upload between 1 and ${maxImages} images`);
    } else if (imageTypesGood.includes(false)) {
      setErrorMessage(res, "All images must be in PNG, JPG, or JPEG format");
    } else if (imageSizesGood.includes(false)) {
      setErrorMessage(
        res,
        `All images must be less than ${Math.floor(maxImageSize / 1024)} KB`
      );
    } else if (location.length <= 0 || location.length > 255) {
      setErrorMessage(res, "Location name must be less than 256 characters");
    } else if (!validLocationTypeID) {
      setErrorMessage(res, "Invalid location type");
    } else if (threeWords.length < 7 || threeWords.length > 63) {
      setErrorMessage(
        res,
        "Three word description must total to less than 64 characters"
      );
    } else {
      // Create post
      // TODO: validate rating
      const rating: RatingParams = {
        general: 5,
      };

      const postID = await dbm.postService.createPost(
        userID,
        content,
        imageData,
        location,
        locationTypeID,
        programID,
        rating,
        threeWords
      );

      res.redirect(`/post/${postID}`);
      return;
    }

    setForm(res, req.body);
    res.redirect("/post");
  })
);

// Post page
postRouter.get(
  "/:postID",
  wrapRoute(async (req, res, next) => {
    const dbm = getDBM(req);

    const postID = req.params.postID;
    const userID = await getUserID(req);
    const user = await dbm.userService.getUser(userID);
    let error: string = null;

    const post = await dbm.postService.getPost(postID);
    if (!post) {
      next(); // 404
      return;
    }

    const postUser = await dbm.postService.getPostUser(postID);
    if (!post.approved) {
      if (user && (user.admin || postUser.id === userID)) {
        // The user is an admin or the creator of the post
        error =
          "This post has not yet been approved, and is not publicly available";
      } else {
        next(); // 404
        return;
      }
    }

    const postUserStatusName = await dbm.userStatusService.getStatusName(
      postUser.statusID
    );
    const program = await dbm.programService.getProgramName(post.programID);
    const images = await dbm.postService.getPostImages(postID);

    await renderPage(req, res, "post", {
      title: post.location,
      error,
      postID,
      location: post.location,
      firstname: postUser.firstname,
      lastname: postUser.lastname,
      status: postUserStatusName,
      program: program,
      createTime: post.createTime,
      threeWords: post.threeWords,
      content: post.content,
      images,
    });
  })
);
