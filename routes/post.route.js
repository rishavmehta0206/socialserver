import { Post } from "../model/Post.js";
import { User } from "../model/User.js";
import express, { response } from "express";

const router = express.Router();

//create a post

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    const populatedPost = await Post.findById(savedPost._id).populate({
      path: "userId",
      model: "User",
    });
    res.status(200).json(populatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//update a post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like / dislike a post

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send("Post not found");
    }

    const dislikedIndex = post.dislikes.indexOf(req.body.userId);
    if (dislikedIndex !== -1) {
      post.dislikes.splice(dislikedIndex, 1);
    }

    const likedIndex = post.likes.indexOf(req.body.userId);
    if (likedIndex === -1) {
      post.likes.push(req.body.userId);
    } else {
      post.likes.splice(likedIndex, 1);
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error disliking post.");
  }
});

router.put("/:id/dislike", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send("Post not found");
    }

    const likedIndex = post.likes.indexOf(req.body.userId);
    if (likedIndex !== -1) {
      post.likes.splice(likedIndex, 1);
    }

    const dislikedIndex = post.dislikes.indexOf(req.body.userId);
    if (dislikedIndex === -1) {
      post.dislikes.push(req.body.userId);
    } else {
      post.dislikes.splice(dislikedIndex, 1);
    }

    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error disliking post.");
  }
});
//get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get users posts

router.get("/my-posts/:userId", async (req, res) => {
  try {
    const userPosts = await Post.find({ userId: req.params.userId }).populate({
      path: "userId",
      model: "User",
      select: "_id username profilePicture",
    });
    res.status(200).json(userPosts);
  } catch (error) {
    res.status(401).json({ message: "no posts found" });
  }
});

//get timeline posts

router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id }).populate([
      {
        path: "userId",
        model: "User",
        select: "_id username profilePicture",
      },
      {
        path: "comments",
        model: "Comment",
      },
    ]);
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId }).populate([
          {
            path: "userId",
            model: "User",
            select: "_id username profilePicture",
          },
          {
            path: "comments",
            model: "Comment",
          },
        ]);
      })
    );

    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});
// pagination
router.get("/my-posts-pagination/:userId", async (req, res) => {
  let  p  = parseInt(req.query.p);
  console.log(p)
  const posts = await Post.find({ userId: req.params.userId })
    .skip(p * 3)
    .limit(3)
    .populate({
      path: "userId",
      model: "User",
      select: "_id username profilePicture",
    });;
  res.json(posts);
});

export default router;
