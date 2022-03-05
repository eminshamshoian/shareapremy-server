import express from "express";

const router = express.Router();

// middleware
import { requireSignin, isCreator } from "../middlewares";

// controllers
import {
  uploadImage,
  removeImage,
  create,
  read,
} from "../controllers/collection";

// Image
router.post("/collection/upload-image", uploadImage);
router.post("/collection/remove-image", removeImage);

// Collection
router.post("/collection", requireSignin, isCreator, create);
router.get("/collection/:slug", read);

module.exports = router;
