import express from "express";

const router = express.Router();

// middleware
import { requireSignin, isCreator } from "../middlewares";

// controllers
import { uploadImage, removeImage, create } from "../controllers/collection";

// Image
router.post("/collection/upload-image", uploadImage);
router.post("/collection/remove-image", removeImage);

// Collection
router.post("/collection", requireSignin, isCreator, create);

module.exports = router;
