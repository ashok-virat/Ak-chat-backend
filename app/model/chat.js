const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const messagedetails=new Schema({
   chatId:{
       type:String,
       default:''
   },  
   message:{
       type:String,
       default:''
   }, 
    senderId:{
        type:String,
        default:''
    },
    senderName:{
        type:String,
        default:''
    },
    receiverId:{
        type:String,
        default:''
    },
    createdOn:{
        type:Date,
        default:Date.now()
    }
})

mongoose.model('chatmessage',messagedetails)