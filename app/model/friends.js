const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const friendsdetails=new Schema({
    friendId:{
        type:String,
        default:''
    },
    senderId:{
        type:String,
        default:''
    },
    receiverfirstName:{
        type:String,
        default:''
    },
    receiverlastname:{
         type:String,
         default:''
    },
    senderfirstName:{
        type:String,
        default:''
    },
    senderlastName:{
        type:String,
        default:''
    },
    receiverId:{
        type:String,
        default:''
    },
    acceptDate:{
        type:Date,
        default:Date.now()
    }
})

mongoose.model('friends',friendsdetails)