import expressJwt from "express-jwt";
import User from "../models/user";
import Collection from "../models/collection";

export const requireSignin = expressJwt({
  getToken: (req, res) => req.cookies.token,
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

export const isCreator = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).exec();
    if (!user.role.includes("Creator")) {
      return res.sendStatus(403);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};

export const isEnrolled = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).exec();
    const collection = await Collection.findOne({
      slug: req.params.slug,
    }).exec();

    // check if collection id is found in user collections array
    let ids = [];
    for (let i = 0; i < user.collections.length; i++) {
      ids.push(user.collections[i].toString());
    }

    if (!ids.includes(collection._id.toString())) {
      res.sendStatus(403);
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
  }
};
