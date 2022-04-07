import express from "express";
import formidable from "express-formidable";

const router = express.Router();

// middleware
import { requireSignin, isCreator, isEnrolled } from "../middlewares";

// controllers
import {
  uploadImage,
  removeImage,
  create,
  read,
  uploadVideo,
  removeVideo,
  addVideo,
  update,
  removeVideoFromCollection,
  updateCollectionVideo,
  publishCollection,
  unpublishCollection,
  collections,
  checkSub,
  freeSub,
  paidSub,
  stripeSuccess,
  userCollections,
} from "../controllers/collection";

router.get("/collections", collections);

// Image
router.post("/collection/upload-image", uploadImage);
router.post("/collection/remove-image", removeImage);

// Collection
router.post("/collection", requireSignin, isCreator, create);
router.put("/collection/:slug", requireSignin, update);
router.get("/collection/:slug", read);
router.post(
  "/collection/video-upload/:creatorId",
  requireSignin,
  formidable({ maxFileSize: 500 * 1024 * 1024 }),
  uploadVideo
);
router.post("/collection/video-remove/:creatorId", requireSignin, removeVideo);

// publish unpublish
router.put(
  "/collection/publish/:collectionId",
  requireSignin,
  publishCollection
);
router.put(
  "/collection/unpublish/:collectionId",
  requireSignin,
  unpublishCollection
);

router.post("/collection/video/:slug/:creatorId", requireSignin, addVideo);
router.put(
  "/collection/video/:slug/:creatorId",
  requireSignin,
  updateCollectionVideo
);
router.put(
  "/collection/:slug/:videoId",
  requireSignin,
  removeVideoFromCollection
);

// sub
router.get("/check-sub/:collectionId", requireSignin, checkSub);
router.post("/free-sub/:collectionId", requireSignin, freeSub);
router.post("/paid-sub/:collectionId", requireSignin, paidSub);
router.get("/stripe-success/:collectionId", requireSignin, stripeSuccess);

router.get("/user-collections", requireSignin, userCollections);
router.get("/user/collection/:slug", requireSignin, isEnrolled, read);

module.exports = router;
