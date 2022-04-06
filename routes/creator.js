import express from "express";

const router = express.Router();

// middleware
import { requireSignin } from "../middlewares";

// controllers
import {
  makeCreator,
  getAccountStatus,
  currentCreator,
  creatorCollections,
  subscriberCount,
  creatorBalance,
  creatorPayoutSettings,
} from "../controllers/creator";

router.post("/make-creator", requireSignin, makeCreator);
router.post("/get-account-status", requireSignin, getAccountStatus);
router.get("/current-creator", requireSignin, currentCreator);
router.get("/creator-collections", requireSignin, creatorCollections);

router.post("/creator/subscriber-count", requireSignin, subscriberCount);

router.get("/creator/balance", requireSignin, creatorBalance);

router.get("/creator/payout-settings", requireSignin, creatorPayoutSettings);

module.exports = router;
