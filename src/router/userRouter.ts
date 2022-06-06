import expres from "express";
import {
  userSignupValidation,
  userOtpValidation,
} from "../middleware/userValidation";
import {Response, Request} from 'express'
import { signup, searchFriend} from "../controller/userController";
import { userVerifiedEmail, tokenVarify } from "../services/userService";
export let userRoutes = expres.Router();

userRoutes.post("/signup", userSignupValidation, signup);


userRoutes.get("/login", (_,res:Response)=>{
  res.render("login",{
    msg:" "
  })
})


userRoutes.post("/verifyEmail", userOtpValidation, userVerifiedEmail);
userRoutes.get("/email", (_, res:Response)=>{
res.render("verifyemail")
})

userRoutes.get("/searchFriend", tokenVarify, searchFriend);

// userRoutes.get("/search", (req:Request, res:Response)=>{
// console.log(req.cookies);

// res.render("userlist")
// })
