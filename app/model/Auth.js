const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const Auth=new Schema({
    userId:{
        type:String,
        default:''
    },
    authToken:{
        type:String,
        default:''
    },
    tokenSecret:{
        type:String,
        default:''
    },
    tokenGenerationTime:{
        type:Date,
        default:Date.now()
    }
})

mongoose.model('Auth',Auth);