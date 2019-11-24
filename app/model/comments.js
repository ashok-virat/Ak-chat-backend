const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const commentsdetails=new Schema({
    commentId:{
        type:String,
        default:''
    },
    comment:{
        type:String,
        default:''
    },
    storyId:{
        type:String,
        default:''
    },
    senderId:{
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
    createdOn:{
        type:Date,
        default:Date.now()
    }
  
})

mongoose.model('comments',commentsdetails)