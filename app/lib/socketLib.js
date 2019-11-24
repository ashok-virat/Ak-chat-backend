const socketio=require('socket.io');
const mongoose=require('mongoose');
const userpath=require('./../model/userModel');
const userModel=mongoose.model('User');
const check=require('./../lib/checkLib');
const redisLib=require('./../lib/redisLib');
const chatpath=require('./../model/chat');
const chatModel=mongoose.model('chatmessage');
const events=require('events');
const eventEmitter=new events.EventEmitter();
const shortId=require('shortid');

let setServer=(server)=>{
   
    let io=socketio.listen(server);
    let myio=io.of('');

    myio.on('connection',(socket)=>{
       

        socket.emit('verifyUser','');
        //coder to verify the user and make him online
           
        
        //setuser code is start
        socket.on('set-user',(userId)=>{
            userModel.findOne({userId:userId},(err,result)=>{
                if(err){
                    socket.emit('user-error',{status:403,message:'user is not found'})
                }
                else if(check.isEmpty(result)) {
                    socket.emit('user-error',{status:403,message:'user is not found'})
                }
                else {
                    let currentUser=result;

                    socket.userId=currentUser.userId;
                         
                    let fullName=`${currentUser.firstName} ${currentUser.lastName}`;

                    let key=currentUser.userId;
                     let value=fullName;
                     let setUserOnline=redisLib.setNewOnlineUserInHash('onlineUsers',key,value,(err,result)=>{
                         if(err){
                             console.log(err)
                         }
                         
                         else {
                             redisLib.getAllUsersInHash('onlineUsers',(err,data)=>{
                                 if(err){
                                     console.log(err)
                                 }
                                 else {
                                     console.log(`${data} online`);
                                     socket.room='AkChat';
                                     socket.join(socket.room)
                                     socket.emit('online-user-list',data);
                                 }
                             })
                         }
                     })
                }
            })
    })
      //setuser code is end
    
      
        //socet disconnect code start
        socket.on('disconnect',()=>{
            if(socket.userId){
            redisLib.deleteUserFromHash('onlineUsers',socket.userId);
            redisLib.getAllUsersInHash('onlineUsers',(err,result)=>{
                if(err){
                    console.log(err)
                }
                else {
                    socket.leave(socket.room)
                    socket.to(socket.room).broadcast.emit('online-user-list',result)
                }
            })
        }
           })
       
   
        //send message code start
         socket.on('chat-message',(data)=>{
            data['chatId']=shortId.generate();
            let newChat=new chatModel({
                chatId:data.chatId,
                senderName:data.senderName,
                senderId:data.senderId,
                receiverId:data.receiverId,
                message:data.message,
                createdOn:Date.now()
            })
            newChat.save((err,result)=>{
                if(err){
                    console.log('error occured'+err)
                }
                else {
                    console.log('chat is saved')
                    console.log(result)
                }
            })
             socket.broadcast.emit(data.receiverId,data);
            data['createdOn']=Date.now();
             socket.emit(`${data.senderId} mymessages`,data);
         })
        //send message code end
      
           //sendrequest code start
           socket.on('send-request',data=>{
            socket.broadcast.emit(`${data.receiverId} reciverequest`,data);
           })
           //send request cod end

        
                })
}


module.exports={
    setServer:setServer
}