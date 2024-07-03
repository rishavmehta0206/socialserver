import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
    },
    img: {
      type: String,
    },
    likes: [{
      type: mongoose.SchemaTypes.ObjectId, // Reference to Comment documents
      ref: 'User'
  }],
    dislikes: [{
      type: mongoose.SchemaTypes.ObjectId, // Reference to Comment documents
      ref: 'User'
  }],
    comments: [{
      type: mongoose.SchemaTypes.ObjectId, // Reference to Comment documents
      ref: 'Comment'
  }]
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post",postSchema);
