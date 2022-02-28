import express from "express";

const router = express.Router();

// middleware
import { requireSignin } from "../middlewares";

// controllers
import {
  makeCreator,
  getAccountStatus,
  currentCreator,
} from "../controllers/creator";

router.post("/make-creator", requireSignin, makeCreator);
router.post("/get-account-status", requireSignin, getAccountStatus);
router.get("/current-creator", requireSignin, currentCreator);

module.exports = router;
