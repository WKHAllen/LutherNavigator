/**
 * Post routes.
 * @packageDocumentation
 */

import { Router } from "express";
import {
  auth,
  upload,
  getUserID,
  maxImageSize,
  renderPage,
  getErrorMessage,
  setErrorMessage,
  getForm,
  setForm,
} from "./util";
import wrapRoute from "../asyncCatch";
import {
  PostService,
  UserService,
  UserStatusService,
  LocationTypeService,
  RatingParams,
  MetaService,
} from "../services";
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
    const error = getErrorMessage(req, res);
    const form = getForm(req, res);
    const locationTypes = await LocationTypeService.getLocations();

    await renderPage(req, res, "createPost", {
      title: "New post",
      error,
      form,
      locationTypes,
    });
  })
);

// Create post event
postRouter.post(
  "/",
  auth,
  upload.array("images", 25),
  wrapRoute(async (req, res) => {
    const mimetypes = ["image/png", "image/jpg", "image/jpeg"];
    const userID = await getUserID(req);
    const maxImages =
      parseInt(await MetaService.get("Images per post")) ||
      metaConfig["Images per post"];

    const content: string = req.body.postContent;
    const files = req.files as Express.Multer.File[];
    const location: string = req.body.location;
    const locationTypeID: number = parseInt(req.body.locationType) || 0;
    const program: string = req.body.program;
    const threeWords = [
      req.body.wordOne,
      req.body.wordTwo,
      req.body.wordThree,
    ].join(", ");

    const validLocationTypeID = LocationTypeService.validLocation(
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
    } else if (program.length <= 0 || program.length > 255) {
      setErrorMessage(res, "Program name must be less than 256 characters");
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

      const postID = await PostService.createPost(
        userID,
        content,
        imageData,
        location,
        locationTypeID,
        program,
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
    const postID = req.params.postID;
    const userID = await getUserID(req);
    const user = await UserService.getUser(userID);
    let error: string = null;

    const post = await PostService.getPost(postID);
    if (!post) {
      next(); // 404
    }

    const postUser = await PostService.getPostUser(postID);
    if (!post.approved) {
      if (user.admin || postUser.id === userID) {
        // The user is an admin or the creator of the post
        error =
          "This post has not yet been approved, and is not publicly available";
      } else {
        next(); // 404
        return;
      }
    }

    const userStatusName = await UserStatusService.getStatusName(
      user.statusID
    );
    const images = await PostService.getPostImages(postID);

    await renderPage(req, res, "post", {
      title: post.location,
      error,
      postID,
      location: post.location,
      firstname: user.firstname,
      lastname: user.lastname,
      status: userStatusName,
      program: post.program,
      createTime: post.createTime,
      threeWords: post.threeWords,
      content: post.content,
      images,
    });
  })
);
