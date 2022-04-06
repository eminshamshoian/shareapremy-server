import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import slugify from "slugify";
import Collection from "../models/collection";
import { readFileSync } from "fs";
import collection from "../models/collection";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const S3 = new AWS.S3(awsConfig);

export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).send("No image");

    // prepare the image
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1];

    // image params
    const params = {
      Bucket: "shareapremy-s3",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    // upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;
    // image params
    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };

    // send remove request to s3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};

export const create = async (req, res) => {
  try {
    const alreadyExist = await Collection.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });
    if (alreadyExist) return res.status(400).send("Title is taken");

    const collection = await new Collection({
      slug: slugify(req.body.name),
      creator: req.user._id,
      ...req.body,
    }).save();

    res.json(collection);
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send("Creating collection failed. Please try again!");
  }
};

export const read = async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug })
      .populate("creator", "_id name")
      .exec();
    res.json(collection);
  } catch (err) {
    console.log(err);
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (req.user._id != req.params.creatorId) {
      return res.status(400).send("Unauthorized");
    }

    const { video } = req.files;
    // console.log(video);
    if (!video) return res.status(400).send("No video");

    // video params
    const params = {
      Bucket: "shareapremy-s3",
      Key: `${nanoid()}.${video.type.split("/")[1]}`,
      Body: readFileSync(video.path),
      ACL: "public-read",
      ContentType: video.type,
    };

    // upload to s3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const removeVideo = async (req, res) => {
  try {
    if (req.user._id != req.params.creatorId) {
      return res.status(400).send("Unauthorized");
    }
    const { Bucket, Key } = req.body;
    // video params
    const params = {
      Bucket,
      Key,
    };

    // upload to s3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      console.log(data);
      res.send({ ok: true });
    });
  } catch (err) {
    console.log(err);
  }
};

export const addVideo = async (req, res) => {
  try {
    const { slug, creatorId } = req.params;
    const { title, content, video } = req.body;

    if (req.user._id != creatorId) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Collection.findOneAndUpdate(
      { slug },
      {
        $push: { videos: { title, content, video, slug: slugify(title) } },
      },
      { new: true }
    )
      .populate("creator", "_id name")
      .exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Add video failed");
  }
};

export const update = async (req, res) => {
  try {
    const { slug } = req.params;
    const collection = await Collection.findOne({ slug }).exec();
    if (req.user._id != collection.creator) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Collection.findOneAndUpdate({ slug }, req.body, {
      new: true,
    }).exec();

    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
};

export const removeVideoFromCollection = async (req, res) => {
  const { collectionId, videoId } = req.params;
  // find post
  const collectionFound = await Collection.findById(collectionId)
    .select("creator")
    .exec();
  // is owner?
  if (req.user._id != collectionFound.creator._id) {
    return res.status(400).send("Unauthorized");
  }

  // console.log("slug", req.params.slug);
  let collection = await Collection.findByIdAndUpdate(collectionId, {
    $pull: { videos: { _id: videoId } },
  }).exec();
  // console.log("remove lesson from this collection => ", collection);
  res.json({ ok: true });
};

export const updateCollectionVideo = async (req, res) => {
  try {
    // console.log("UPDATE LESSON", req.body);
    const { slug } = req.params;
    const { _id, title, content, video, free_preview } = req.body;
    const collection = await Collection.findOne({ slug })
      .select("creator")
      .exec();

    if (collection.creator._id != req.user._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Collection.updateOne(
      { "videos._id": _id },
      {
        $set: {
          "videos.$.title": title,
          "videos.$.slug": slugify(title.toLowerCase()),
          "videos.$.content": content,
          "videos.$.video": video,
          "videos.$.free_preview": free_preview,
        },
      },
      { new: true }
    ).exec();
    // console.log("updated", updated);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Update video failed");
  }
};

export const publishCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const collection = await Collection.findById(collectionId)
      .select("creator")
      .exec();

    if (collection.creator._id != req.user._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Collection.findByIdAndUpdate(
      collectionId,
      { published: true },
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Publish collection failed");
  }
};

export const unpublishCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const collection = await Collection.findById(collectionId)
      .select("creator")
      .exec();

    if (collection.creator._id != req.user._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Collection.findByIdAndUpdate(
      collectionId,
      { published: false },
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Unpublish collection failed");
  }
};

export const collections = async (req, res) => {
  const all = await Collection.find({ published: true })
    .populate("creator", "_id name")
    .exec();
  res.json(all);
};
