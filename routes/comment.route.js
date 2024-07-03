import express from "express";
import { Comment } from "../model/Comment.js";
import { Post } from "../model/Post.js";
import { User } from "../model/User.js";
const router = express.Router();

// post a comment
router.post("/add-comment", async (req, res) => {
  let post = await Post.findById(req.body.postId);
  try {
    let comment = await Comment.create(req.body);
    comment = await comment.populate({
      path: "userId",
      model: "User",
      select: "username profilePicture",
    });
    // let updatedComment = await comment.populate({path:"userId",model:"User"});

    await post.updateOne({ $push: { comments: comment?._id } });
    // comment.replies = []
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// delete a comment
router.post("/delete-comment/:commentId", async (req, res) => {
  let comment = await Comment.findById(req.params.commentId);
  let post = await Post.findById(req.body.postId);
  await Post.updateOne({
    $pull: {
      comment: req.params.commentId,
    },
  });
  let updatedPost = await Post.findById(req.body.postId)
  try {
    await comment.deleteOne();
    // let updatedComment = await comment.populate({path:"userId",model:"User"});
    // await post.updateOne({ $push: { comments: comment?._id } });
    // comment.replies = []
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).send(error);
  }
});

// like a comment
router.put("/like-comment/:commentId", async (req, res) => {
  let comment = await Comment.findById(req.params.commentId);
  try {
    if (!comment.likes.includes(req.body.userId)) {
      const comment = await Comment.findOneAndUpdate(
        { _id: req.params.commentId },
        {
          $push: { likes: req.body.userId }, // Use $addToSet to add userId if not already present
        },
        { new: true } // Return the updated document
      );
      res.status(200).json(comment);
    } else {
      const comment = await Comment.findOneAndUpdate(
        { _id: req.params.commentId },
        {
          $pull: { likes: req.body.userId }, // Use $addToSet to add userId if not already present
        },
        { new: true } // Return the updated document
      );
      res.status(200).json(comment);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating comment likes.");
  }
});

// dislike a comment
router.put("/dislike-comment/:commentId", async (req, res) => {
  let comment = await Comment.findById(req.params.commentId);
  try {
    if (!comment.dislikes.includes(req.body.userId)) {
      const response = await comment.updateOne(
        {
          $push: { dislikes: req.body.userId }, // Use $addToSet to add userId if not already present
        },
        { new: true } // Return the updated document
      );
      res.status(200).json(response);
    } else {
      const response = await comment.updateOne(
        {
          $pull: { dislikes: req.body.userId }, // Use $addToSet to add userId if not already present
        },
        { new: true } // Return the updated document
      );
      res.status(200).json(response);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating comment likes.");
  }
});

// get all comments for a post

async function recursiveJoin(comment) {
  await comment.populate({
    path: "userId",
    model: "User",
    select: "username profilePicture",
  });
  await comment.populate({
    path: "reply",
    model: "Comment",
  });
  for (let reply of comment.reply) {
    await recursiveJoin(reply);
  }
}

router.get("/get-comments/:postId", async (req, res) => {
  try {
    // use populate to join tables
    // let { comments } = await Post.findById(req.params.postId, {
    //   comments: 1,
    // }).populate({
    //   path: "comments",
    //   model: "Comment",
    // });
    let comments = await Comment.find({ postId: req.params.postId });
    console.log(comments);
    for (let comment of comments) {
      await recursiveJoin(comment);
    }
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get single comment

router.get("/get-comment/:commentId", async (req, res) => {
  console.log(req.params.commentId);
  try {
    let comment = await Comment.findById(req.params.commentId);
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).send(error);
  }
});

// update comment
router.put("/update-comment/:commentId", async (req, res) => {
  let comment = await Comment.findById(req.params.commentId);
  if (comment?.userId != req.body.userId) {
    return res.status(401).json({
      message: "not allowed",
    });
  }
  const updatedComment = await comment.updateOne(
    { $set: req.body },
    { new: true }
  );
  res.status(201).json(updatedComment);
});

// reply to a comment

router.post("/reply/:commentId", async (req, res) => {
  // let comment = await Comment.findById(req.params.commentId);
  try {
    let newComment = await Comment.create(req.body);
    let populatedComment = await newComment.populate({
      path: "userId",
      model: "User",
    });
    await Comment.findByIdAndUpdate(
      req.params.commentId,
      { $push: { reply: newComment?._id } },
      { new: true }
    );

    res.status(200).json(populatedComment);
  } catch (error) {}
});

export default router;
