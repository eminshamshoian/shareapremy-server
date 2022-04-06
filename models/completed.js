import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const completedSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    collection: {
      type: ObjectId,
      ref: "Collection",
    },
    videos: [],
  },
  { timestamps: true }
);

export default mongoose.model("Completed", completedSchema);
