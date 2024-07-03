import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.SchemaTypes.ObjectId, // Reference to Post document
      ref: 'Post'
  },
    comment: {
      type: String,
      max: 500,
    },
    likes: {
      type: Array,
      default: [],
    },
    dislikes:{
        type:Array,
        default:[]
    },
    reply:{
      type:Array,
      default:[]
    }
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment",commentSchema);
