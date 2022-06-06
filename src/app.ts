import { Request, Response } from "express";
import express from "express";
import db from "../models/";

export const app = express();
// import bodyparser from 'body-parser'
import { googleRoutes } from "./router/googleRoutes";
import { friendRequestRoutes } from "./router/friendRequestRouter";
import { messageRoutes } from "./router/messageRouter";
import { error } from "./services/error";
import { pageNotFound } from "./services/userService";
import  cookieParser from 'cookie-parser'
// const cookieParser = require('cookie-parser')
import '../src/socketClient'
import path from "path";
const port = process.env.PORT;
import userRoutes from "./router";
import './controller/passport'
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use("/api/auth/user", userRoutes);
app.use("/", googleRoutes);
app.use("/api", friendRequestRoutes);
app.use("/api", messageRoutes);
app.use(express.static(__dirname + '/views/pages'));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views/pages"));
app.get("/failed", (req, res) => {
  return res.json({
    statusCode: 400,
    message: "Invalid credential",
  });
});
// app.use(bodyparser)
// app.get("/", (req: Request, res: Response) => {
//   res.render("index");
// });


app.use("/*", pageNotFound);
app.use(error);

