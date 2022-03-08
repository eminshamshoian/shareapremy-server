import express from 'express';
import formidable from 'express-formidable';

const router = express.Router();

// middleware
import { requireSignin, isCreator } from '../middlewares';

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
} from '../controllers/collection';

// Image
router.post('/collection/upload-image', uploadImage);
router.post('/collection/remove-image', removeImage);

// Collection
router.post('/collection', requireSignin, isCreator, create);
router.put('/collection/:slug', requireSignin, update);
router.get('/collection/:slug', read);
router.post(
  '/collection/video-upload/:creatorId',
  requireSignin,
  formidable(),
  uploadVideo
);
router.post('/collection/video-remove/:creatorId', requireSignin, removeVideo);
router.post('/collection/video/:slug/:creatorId', requireSignin, addVideo);

module.exports = router;
