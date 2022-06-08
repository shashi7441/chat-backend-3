const { messages, conversation, users } = require("../../models/");
import sequelize, { Op, Sequelize } from "sequelize";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../services/error";
import { v4 as uuid, validate } from "uuid";
import io from "../socketClient";


export let seeFrontendMessage = async (conversationId:any, userId:any)=>{
  const messageData = await messages.findAll({
    where: {
      conversationId: conversationId,
      [Op.or]: [
        {
          to:userId,
        },
        {
          from: userId,
        },
      ],
  },
  
  order: [
    ['createdAt', 'ASC'],
  ],
    include: [
      {
        model: users,
        as: "reciever",
        attributes: ["fullName", "id"],
      },
      {
        model: users,
        as: "sender",
        attributes: ["fullName", "id"],
      },
    ],
  });


return messageData

}


export let sendMessage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const Op = sequelize.Op;
    const id = req.params.id;
    const myId = uuid();
    const { message } = req.body;
    const numberId: any = id.replace(/[' "]+/g, "");
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }

    if (message.length == 0) {
      return res.json({
        statusCode: 400,
        message: "message not be empty",
      });
    }


    const messageTrim: string = message.trim();
let otherUserId:any ;
    const cheackFriend = await conversation.findOne({
      where: {
        [Op.or]: [
          {
            senderId:[req.id ,numberId],
          },
          {
            recieverId:[req.id,numberId],
          },
        ],
        state: 'accepted',
      },
      include: [
        {
          model: users,
          attributes: ["fullName"],
          as: "reciever",
        },
      ],
    });
 

    if (!cheackFriend) {
      return next(new ApiError("you are not friend", 404));
    }
    const value = cheackFriend.dataValues.state;
    if(req.id ===numberId){
      return res.json({
        statusCode:400,
        message:"sender and reciever are not  same "
      })
    }
  


    if (value === "blocked") {
      return res.json({
        statusCode: 400,
        message: "blocked user can not send request",
      });
    }

    if (value === "pending") {
      return res.json({
        statusCode: 400,
        message: "you are not friend",
      });
    }
    if (value === "unfriend") {
      return res.json({
        statusCode: 400,
        message: "you are unfriend",
      });
    }
    if(cheackFriend.senderId===req.id){
      otherUserId = cheackFriend.recieverId
    }
    else{
      otherUserId = cheackFriend.senderId
    }

      
      console.log("in create",numberId);
      console.log("create",req.id);
      

      const createData =  await messages.create({
        id: myId,
        to: numberId,
        from: req.id,
        conversationId:cheackFriend.id ,
        message: messageTrim,
        state: "unedited",
      });
   
      const data = {
        message:createData.message,
        conversationId:createData.conversationId,
        userId:req.id
      }

    // io.to(cheackFriend.).emit("chat-message", {
    //  msg: createData.message,
    //  conversationId:cheackFriend.id
    // })
    io.emit("chat-message", {
      msg: createData.message,
      conversationId:cheackFriend.id,
      userId:req.id,
      recieverId:numberId
     })

     
      const messageData = await messages.findAll({
          where: {             
            to:
          {
            [Op.or]:[numberId,req.id],
        
          },      
          from:{
            [Op.or]:[numberId,req.id],
          }
      

        },
        include: [
          {
            model: users,
            as: "reciever",
            attributes: ["fullName", "id"],
          },
          {
            model: users,
            as: "sender",
            attributes: ["fullName", "id"],
          },
        ],
      });
     

     
    
     return res.render("test",{data: [], userId:req.id, conversationId:"",chatWith:cheackFriend.reciever.fullName,friendRequest:"",seeRequest:"",
      showmessages:messageData, sendMessage:"", userList:[], recieverId:numberId})



    
  } catch (e: any) {
    // console.log("dddd", e);

    return next(new ApiError(e.message, 404));
  }
};

export let seeMessages = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const Op = sequelize.Op;
    const numberId: any = id.replace(/[' "]+/g, "");
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }

    const cheackFriend = await conversation.findOne({
      where: {
        [Op.or]: [
          {
            senderId:[req.id ,numberId],
          },
          {
            recieverId:[req.id,numberId],
          },
        ],
        state: 'accepted',
      },
      include: [
        {
          model: users,
          attributes: ["fullName"],
          as: "reciever",
        },
      ],
    });
 
          // io.emit("join-room", cheackFriend.id)

    const messageData = await messages.findAll({
      where: {             
                  to:
                {
                  [Op.or]:[numberId,req.id],
              
                },      
                from:{
                  [Op.or]:[numberId,req.id],
                }
            
      },
      include: [
        {
          model: users,
          as: "reciever",
          attributes: ["fullName", "id"],
        },
        {
          model: users,
          as: "sender",
          attributes: ["fullName", "id"],
        },
      ],
    });
    if (!messageData) {
      return res.json({
        statusCode: 200,
        message: "no chat found",
      });
    }
     
const loginId = req.id 
const otherUser = id


const user=await users.findOne({
  where:{
    id:otherUser
  }
})



      res.render("test",{data: [], userId:loginId, conversationId:"", chatWith:user.fullName,friendRequest:"",seeRequest:"",
      showmessages:messageData, sendMessage:"", userList:[], recieverId:otherUser})


  } catch (e: any) {
    return next(new ApiError(e.message, 404));
  }
};

export let deleteChats = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }
    const messageData = await messages.findOne({
      where: {
        id: numberId,
        [Op.or]: [
          {
            to: req.id,
          },
          {
            from: req.id,
          },
        ],
      },
    });
    if (!messageData) {
      return res.json({
        statusCode: 404,
        messages: "no chat found ",
      });
    }
    if (messageData) {
      const conversationId = messageData.dataValues.conversationId;
      const deleteChat = await messages.destroy({
        where: {
          conversationId: conversationId,
        },
      });
      return res.json({
        statusCode: 200,
        message: "chat deleted successfully",
      });
    }
  } catch (e: any) {
    return next(new ApiError(e.message, 400));
  }
};

export let deleteAllChat = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let messageData = await messages.findAll({
      where: {
        from: req.id,
      },
    });

    if (messageData.length == 0) {
      return res.json({
        statusCode: "no chat found",
      });
    }

    if (messageData) {
      const checkMessage = messageData.dataValues.messages;
      if (checkMessage.length === 0) {
        return res.json({
          statusCode: 400,
          message: "chats already deleted",
        });
      }
      const deleteAllChat = await messages.destroy({
        where: {
          from: req.id,
        },
      });
      return res.json({
        statusCode: 400,
        messages: "all chat deleted successfully",
      });
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let editmessage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const numberId: any = id.replace(/[' "]+/g, "");
    const checkId = validate(numberId);
    if (checkId === false) {
      return next(new ApiError("please put valid id ", 400));
    }
    let { message }: { message: string } = req.body;
    if (!message) {
      return res.json({
        statusCode: 400,
        message: "message is required",
      });
    }
    if (message.length == 0) {
      return res.json({
        statusCode: 400,
        message: "message not be empty",
      });
    }
    const messageTrim: string = message.trim();

    const messageData = await messages.findOne({
      where: {
        id: numberId,
        [Op.or]: [
          {
            to: req.id,
          },
          {
            from: req.id,
          },
        ],
      },
    });
    if (!messageData) {
      return res.json({
        statusCode: 400,
        message: "no chat found",
      });
    }
    const messageId = messageData.from;
    if (messageId != req.id) {
      return res.json({
        statusCode: 400,
        message: "you can not edit message",
      });
    } else {
       await messages.update(
        {
          message: messageTrim,
          state: "edited",
        },
        {
          where: {
            from: req.id,
          },
        }
      );

  io.emit("edit", {
    userId:req.id,
    message:messageTrim,
    status:"edited",
  })


      return res.json({
        statusCode: 200,
        message: "message edited successfully",
      });
    }
  } catch (e: any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};


