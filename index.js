import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import helmet from "helmet";
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import userRoute from "./routes/user.route.js";
import commentRoute from "./routes/comment.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from "./middleware/logsmiddleware.js";
dotenv.config();

let app = express();
app.use(express.json());
app.use(helmet());
// app.use(morgan("common"))
app.use(cookieParser());
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // Allows all origins
  next();
});
app.use(express.static('public'))
app.use(logger)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    console.log('fileName',file.originalname)
    cb(null, file.originalname);
  },
});

// http://localhost:8800/images/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname)

const upload = multer({ storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully");
  } catch (error) {
    console.log(error);
  }
});

// app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);
app.use("/api/user", userRoute);
app.use("/api/comment", commentRoute);

mongoose.connect(process.env.MONGO_URL).then(
  (res) => console.log("connection established"),
  (err) => console.log("error in connection")
);

app.listen(8800, () => {
  console.log("server running");
});
