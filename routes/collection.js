import express from "express";

const router = express.Router();

// middleware
import { requireSignin } from "../middlewares";

// controllers
import { uploadImage, removeImage } from "../controllers/collection";

router.post("/collection/upload-image", uploadImage);
router.post("/collection/remove-image", removeImage);

module.exports = router;
