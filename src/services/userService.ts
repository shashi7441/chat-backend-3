import nodemailer from "nodemailer";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
const { users } = require("../../models/");
dotenv.config();
import * as jwt from "jsonwebtoken";
import { getAllUser } from "../controller/userController";

import sequelize, { Op } from 'sequelize'

export let tokenVarify = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    
    let secretKey: any = process.env.SECRET_KEY;
    let token: any = req.cookies.access_token ;
    if (!token) {
      return res.status(400).json({
        message: "A token is required for authentication",
        status: 400,
        success: false,
      });
    } else {
      // const authHeader: any = req.headers.authorization;
      // const bearerToken: any = authHeader.split(" ");
      // let myToken: any = bearerToken[1];
      await jwt.verify(token, secretKey, async (error: any, payload: any) => {
        if (payload) {
          req.id = payload.id
          next();
        } else {
          console.log("in token",error);
          
          return res.status(400).json({
            success: false,
            message: "Invalid token",
            data: error.message,
          });
        }
      });
    }
  } catch (e: any) {
    return res.json({
      success: false,
      statusCode: 400,
      message: e.message,
    });
  }
};


export let sendMail = async (req: Request, res: Response, html: any) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_MAIL,
        pass: process.env.MY_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.MY_MAIL,
      to: req.body.email,
      subject: "Verify your mail",
      html: html,
    };
    transporter.sendMail(mailOptions, function (error: any, info: any) {
      if (error) {
        console.log(">>>>>>>>>>error", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let userVerifiedEmail = async (req: Request, res: Response) => {
  try {
    const secretKey: any = process.env.SECRET_KEY;
    let { email, otp } = req.body;
    let emailTrim = email.trim();
    let otpTrim = otp.trim();
    let otpNumber = parseInt(otpTrim);
    const findData = await users.findOne({
      where: {
        email: emailTrim,
      },
    });
    if (!findData) {
      return res.render("verifyemail", {
        msg:"user not found"
      });
    }
    const id = findData.dataValues.id;
    const finalResult = findData.dataValues.otp;
    const otpExpTime = findData.dataValues.otpExpTime;
    if (finalResult != otpNumber) {
      return res.render("verifyemail", {
        msg:"otp are not match"
      });
    }
    const values = findData.dataValues.isVerified;
    const jwtToken = await jwt.sign({ id: id }, secretKey, {
      expiresIn: "24h",
    });
    //  const date:any = new Date()
    if (values === true) {
      res.cookie("access_token",`${jwtToken}`, {expires: new Date(Date.now() + 9999999), httpOnly: false})
      const userId = findData.id
      const {userData} = await getAllUser(req , res  ,userId)
  const userList =  await searchFriendForFrontend(req,res, userId)
       res.render("test",{data: userData, userId:userId, conversationId:"",chatWith:"",
         showmessages:[], sendMessage:"", userList:userList, recieverId:"", friendRequest:"" , seeRequest:""})
    }
    
    if (otpExpTime < Date.now()) {
      return res.render("verifyemail", {
        msg:"your otp will be expire"
      });
    }


    if (values === false) {
      const update = await users.update(
        { isVerified: true },
        {
          where: {
            otp: otpNumber,
          },
        }
      );
      res.cookie("access_token",`${jwtToken}`, {expires: new Date(Date.now() + 9999999), httpOnly: false})
      const userId = findData.id
      const {userData} = await getAllUser(req , res  ,userId)
  const userList =  await searchFriendForFrontend(req,res, userId)
       res.render("test",{data: userData, userId:userId, conversationId:"",chatWith:"",seeRequest:"",
         showmessages:[], sendMessage:"", userList:userList, recieverId:""})
    }
  } catch (e: any) {
    console.log(e);
    
    return res.json({
      success: false,
      statusCode: 400,
      message: e.message,
    });
  }
};

export let pageNotFound = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json({
      statusCode: 404,
      message: "page not found ",
    });
  } catch (e: any) {
    return res.json({
      statusCode: 500,
      message: e.message,
    });
  }
};





export let searchFriendForFrontend = async (
  req,
  res,
 userId:any
) => {
      const userData = await users.findAll({
        where: {
          id: {
            [Op.ne]: [userId],
          },
        },
        attributes: ["email", "fullName", "id"],
      });
    
      return userData
    
  }