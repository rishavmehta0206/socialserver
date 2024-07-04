import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/User.js";
import { verifyToken } from '../middleware/authmiddleware.js'
import jwt from "jsonwebtoken";
import {readFile,writeFile} from 'fs'

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login" });
    }

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    const savedUser = await newUser.save();
    console.log(savedUser);

    // Respond with the new user's information (excluding the password)
    res.status(201).json({ 
      id: savedUser._id, 
      username: savedUser.username, 
      email: savedUser.email 
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if(!user){
      return res.status(404).json("user not found");
    }

    const validPassword =  bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if(!validPassword){
      return res.status(400).json("wrong password");
    }
    const token = jwt.sign({ userId: user._id }, "secret", {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign({ userId: user._id }, "secret", {
      expiresIn: "2d",
    });

    const {password,...others} = user._doc;

    res
    .cookie("jwt", refreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:'None',
      maxAge:7 * 24 * 60 * 60 * 1000
    })
    .status(200)
    .send({...others,token:token} );

    // res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/check-token-expire',verifyToken,(req,res)=>{})

export default router;
