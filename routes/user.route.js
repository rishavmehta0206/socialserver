import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/User.js";
import { verifyToken } from "../middleware/authmiddleware.js";

const router = express.Router();

// get all users
router.get("/users", verifyToken, async (req, res) => {
  console.log(req.user)
  try {
    let users = await User.find().populate([
      {
        path: "followers",
        model: "User",
        select: "profilePicture username _id",
      },
      {
        path: "followings",
        model: "User",
        select: "profilePicture username _id",
      },
    ]);
    // console.log(users);
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({
      message: "users not found",
    });
  }
});

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      let updatedUser = await User.findById(req.params.id).populate([{
        path:"followings",
        model:"User",
        select:'_id username profilePicture'
      },{
        path:'followers',
        model:"User",
        select:'_id username profilePicture'
      }])
      res.status(200).json(updatedUser);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId).populate({
        path:"followings",
        model:"User",
        select:"_id username profilePicture"
      })
      : await User.findOne({ username: username }).populate({
        path:"followings",
        model:"User"
      });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow-unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        // res.status(200).json("user has been followed");
      } else {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
      }
      let updatedUser = await User.findById(req.body.userId).populate([{
        path:"followings",
        model:"User",
        select:"username profilePicture _id"
      },{
        path:"followers",
        model:"User",
        select:"username profilePicture _id"
      }]); 
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

export default router;
