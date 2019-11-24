const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const friendrequestdetails=new Schema({
    friendreqId:{
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
    requestDate:{
        type:Date,
        default:Date.now()
    }
})

mongoose.model('friendrequest',friendrequestdetails)