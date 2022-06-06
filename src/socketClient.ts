// import { app } from "./app";
import dotenv from 'dotenv'
dotenv.config()
const port = process.env.PORT
import db from "../models";
import { Server } from "socket.io";
import { app } from './app';
import { NextFunction } from 'express';
import http from 'http'
const server = http.createServer(app)
const io = new Server(server 
  // {
  // cors: {
  //   origin: "http://127.0.0.1:8000",
  //   methods: ["GET", "POST"]
  // },
// }
)
  server.listen(port, async () => {
  await db.sequelize.authenticate({ logging: false }).then(() => {
    console.log("database connected successfully");
  }).catch((e:any)=>{
console.log("database not connected");
  })
  console.log(`server live at ${port}`);
});

// io.use((socket, next) => {
// let token = socket.handshake.headers.token
// let conversationId = socket.handshake.query.conversationId

// // if(!conversationId){
// //   console.log("0000");
// //   // io.emit("conversation","conversation id is required ");
// //   // socket._error("conversation is required")
// // }else{
// //   next()
// // }
// });

  
io.on("connection", (socket) => {
  // socket.send("connected")
console.log("connected");

socket.on("disconnect", ()=>{
  console.log("Disconnected");
})

socket.on("join-room",(conversationId)=>{
socket.join(conversationId)
})

socket.on("typing",(msg)=>{
  io.emit("typing", msg)
}
)

socket.on("stopTyping",(msg)=>{
  io.emit("stopTyping", msg)
}
)
socket.on("chat-message",({msg, conversationId})=>{
  //  io.to().emit("chat-message", data)
  

  io.to(`room_${conversationId}`).emit("chat-message", {msg:msg, conversationId:conversationId})
}
)


socket.on("sendRequest",(msg)=>{
io.emit("sendRequest", msg)
})
  

socket.on("sendRequest",(msg)=>{
  io.emit("sendRequest", msg)
  } )



})




export default io
