const mongoose=require('mongoose');

const Schema=mongoose.Schema;


const storiesModel=new Schema({
    userId:{
        type:String,
        default:''
    },
    storyId:{
        type:String,
        default:''
    },
    firstName:{
        type:String,
        default:''
    },
    lastName:{
        type:String,
        default:''
    },
    textStatus:{
        type:String,
        default:''
    },
    type:{
        type:String,
        default:''
    },
    image:{
         type:String,
         default:''
    },
    imageTitle:{
      type:String,
      default:""
    },
    likes:{
        type:Number,
        default:0
    },
    createdOn:{
        type:Date,
        default:Date.now()
    }
})


mongoose.model('stories',storiesModel);