const mongoose=require('mongoose');
const userpath=require('./../model/userModel');
const userModel=mongoose.model('User');
const response=require('./../lib/responseLib');
const param=require('./../lib/paramvalidation');
const check=require('./../lib/checkLib');
const hashpassword=require('./../lib/passwordhasing');
const shortid=require('shortid');
const createstorypath=require('./../model/stories');
const storyModel=mongoose.model('stories');
const friendreqpath=require('./../model/friendreq');
const friendreqModel=mongoose.model('friendrequest');
const friendpath=require('./../model/friends');
const friendsModel=mongoose.model('friends');
const commentpath=require('./../model/comments');
const commentModel=mongoose.model('comments');
const chatpath=require('./../model/chat');
const chatModel=mongoose.model('chatmessage');
const Authjs=require('./../model/Auth');
const AuthModel=mongoose.model('Auth');
const token=require('./../lib/tokenLib');
const nodemailer=require('nodemailer');

let signup=(req,res)=>{
  userModel.findOne({email:req.body.email},(err,result)=>{
      if(err){
         let apiResponse=response.response(true,'some error occured',400,null)
         res.send(apiResponse);
      }
      else if(check.isEmpty(result)){
          

    let checkemail=()=>{
        return new Promise((resolve,reject)=>{
            if(req.body.email){
               if(!param.Email(req.body.email)){
                   let apiResponse=response.response(true,"Email Does Not Meet Their RequireMent",400,null);
                   reject(apiResponse);
               }
               else if(check.isEmpty(req.body.email)){
                  let apiResponse=response.response(true,'Email Field is empty',400,null)
                  reject(apiResponse);
               }
               else {
                   resolve(req);
               }
            }
            else {
            let apiResponse=response.response(true,'Email Parameter Is Missing',403,null);
            reject(apiResponse);
            }
        })
    }

    let checkpassword=()=>{
        return new Promise((resolve,reject)=>{
            if(req.body.password){
              if(!param.Password(req.body.password)){
                  let apiResponse=response.response(true,'Password Does Not Meet Their Requirement',400,null);
                  reject(apiResponse);
              }
              else if(check.isEmpty(req.body.password)){
                   let apiResponse=response.response(true,'Password Field Is Empty',400,null);
                   reject(apiResponse);
              }
              else{
                  resolve(req);
              }
            }
            else {
                let apiResponse=response.response(true,'Password Parameter Is Missing',403,null);
                reject(apiResponse);
            }
        })
    }

    let createUser=()=>{
        return new Promise((resolve,reject)=>{
            let createnewuser=new userModel({
                userId:shortid.generate(),
                email:req.body.email,
                status:req.body.status,
                password:hashpassword.hashpassword(req.body.password),
                firstName:req.body.firstName,
                lastName:req.body.lastName
            })
            createnewuser.save((err,result)=>{
                if(err){
                    let apiResponse=response.response(true,'User Is Not Created',500,null);
                    reject(apiResponse);
                }
                else {
                     resolve(result);
                }
            })
        })
    }
    
    checkemail(req,res)
    .then(checkpassword)
    .then(createUser)
    .then((resolve)=>{
        let apiResponse=response.response(false,'signup successfully',200,resolve);
        res.send(apiResponse);
    })
    .catch((reject)=>{
        res.send(reject);
    })
      }
      else {
          let apiResponse=response.response(true,'Email Is Already Present',400,null)
          res.send(apiResponse);
      }
  })



}


let signin=(req,res)=>{
    let checkmail=()=>{
        return new Promise((resolve,reject)=>{
            if(req.body.email){
               userModel.findOne({email:req.body.email},(err,result)=>{
                   if(err){
                       let apiResponse=response.response(true,'some error occured',403,null);
                       reject(apiResponse)
                   }
                   else if(result){
                      resolve(result)
                   }
                   else {
                       let apiResponse=response.response(true,'Email Is Not Found',403,null);
                       reject(apiResponse)
                   }
               })
            }
            else {
                let apiResponse=response.response(true,'Email Parameter Is Missing',500,null);
                reject(apiResponse)
            }
        })
    }

    let checkpassword=(details)=> {
        return new Promise((resolve,reject)=>{
            if(req.body.password){
            hashpassword.comparepassword(req.body.password,details.password,(err,result)=>{
                if(err){
                    let apiResponse=response.response(true,'Password Is Miss Matching',403,null);
                    reject(apiResponse);
                }
                else if(result){
                    resolve(details);
                    
                }
                else {
                   let apiResponse=response.response(true,'Password Is Wrong',403,null);
                   reject(apiResponse)
                }
            })
            }
            else {
                let apiResponse=response.response(true,'Password Parameter Is Missing',500,null);
                reject(apiResponse)
            }
        })
    }

    let generatetoken=(details)=>{
        return new Promise((resolve,reject)=>{
             token.generateToken(details,(err,tokenDetails)=>{
                 if(err){
                    logger.captureError('some error occured','genertae token',8);
                    let apiResponse=response.response(true,'token is not generated',400,null)
                    reject(apiResponse)
                 }
                 else {
                     tokenDetails.userId=details.userId;
                     tokenDetails.userDetails=details;
                   
                     resolve(tokenDetails);
                 }
             })
        })
    }
    let saveToken=(tokenDetails)=>{
        
        return new Promise((resolve,reject)=>{
            AuthModel.findOne({userId:tokenDetails.userId},(err,retrievedUserSetails)=>{
                if(err){
                    logger.captureError(err.message,'userController:saveToken',10)
                    let apiResponse=response.generate(true,'Failed to Generate Token',500,null)
                    reject(apiResponse)
                }
                else if(check.isEmpty(retrievedUserSetails)) {
                    let newAuthToken=new AuthModel({
                        userId:tokenDetails.userId,
                        authToken:tokenDetails.token,
                        tokenSecret:tokenDetails.tokenSecret,
                        tokenGenerationTime:Date.now()
                    })
                   
                    newAuthToken.save((err,newTokenDetails)=>{
                        if(err){
                            logger.captureError(err.message,'userController:saveToken()',10)
                            let apiResponse=response.generate(true,'Failed To Generate Token',500,null)
                            reject(apiResponse)
                        }
                        else{
                            let responseBody={
                                authToken:newTokenDetails.authToken,
                                userDetails:tokenDetails.userDetails
                            }
                            
                            resolve(responseBody)
                        }
                    })
                }else {
                    retrievedUserSetails.authToken=tokenDetails.token;
                    retrievedUserSetails.tokenSecret=tokenDetails.tokenSecret;
                    retrievedUserSetails.tokenGenerationTime=Date.now();
                    retrievedUserSetails.save((err,newTokenDetails)=>{
                             if(err){
                                 logger.captureError(err.message,'userController:saveToken()',10)
                                 let apiResponse=response.generate(true,'Failed To Generate Token',500,null)
                                 reject(apiResponse)
                             }
                             else {
                                   let responseBody={
                                    authToken:newTokenDetails.authToken,
                                    userDetails:tokenDetails.userDetails
                                   }
                                  
                                   resolve(responseBody)
                             }
                    })
                    
                }
            })
        })
    
    }
       
    checkmail(req,res)
    .then(checkpassword)
    .then(generatetoken)
    .then(saveToken)
    .then((resolve)=>{
        
        let apiResponse=response.response(false,'signin successfully',200,resolve);
        res.send(apiResponse)
    })
    .catch((reject)=>{
  
    res.send(reject)
   
    })

}


//get users code start
 let getusers=(req,res)=>{
   userModel.find()
   .exec((err,result)=>{
       if(err){
        let apiResponse=response.response(true,'Users Not Found',500,null);
        res.send(apiResponse)
       }
       else {
        let apiResponse=response.response(false,'Users Are Listed',200,result);
        res.send(apiResponse)
       }
   })
 }
//getusers code end


//get particular user code start
let getsingleuser=(req,res)=>{
    userModel.find({userId:req.body.userId},(err,result)=>{
        if(err){
            let apiResponse=response.response(true,'User Is Not Found',500,null);
            res.send(apiResponse)
           }
           else {
            let apiResponse=response.response(false,'User Is Found',200,result);
            res.send(apiResponse)
           }
    })
   
  }
//get particular user code end


//create story code start
let createstory=(req,res)=>{
    userModel.findOne({userId:req.body.userId},(err,result)=>{
        if(err){
            let apiResponse=response.response(true,'User Is Not Found',400,null);
            res.send(apiResponse)
        }
        else {
            let createstory=new storyModel({
                userId:result.userId,
                storyId:shortid.generate(),
                firstName:result.firstName,
                lastName:result.lastName,
                type:req.body.type,
                textStatus:req.body.textStatus,
                image:req.file.path,
                imageTitle:req.body.imageTitle,
                likes:req.body.likes,
                createdOn:Date.now()
            })
          createstory.save((err,result)=>{
               if(err){
                   logger.captureError(err.message,'create Issue',7)
                   let apiResponse=response.response(true,'Story Is Not Posted',403,null)
                   res.send(apiResponse)
               }
               else {
                   let apiResponse=response.response(false,'Story Is Posted',200,result);
                   res.send(apiResponse)
               }
            })
        }
    })
}

//create story code end

//get storeis code start
let getstories=(req,res)=>{
    storyModel.find({userId:req.body.userId},(err,result)=>{
        if(err){
            let apiResponse=response.response(true,'Stories Is Not Found',500,null);
            res.send(apiResponse)
           }
           else {
            let apiResponse=response.response(false,'Stories Is Found',200,result);
            res.send(apiResponse)
           }
    })
}
//get stories code end



//send friend request code start
let sendrequest=(req,res)=>{
    let findfriendreq=()=>{
        return new Promise((resolve,reject)=>{
            friendreqModel.findOne({receiverId:req.body.receiverId,senderId:req.body.senderId},(err,result)=>{
                if(err){
                   
            let apiResponse=response.response(true,'some error occured',500,null)
            reject(apiResponse)
                }
                else if(check.isEmpty(result)){
                    resolve(req);
                }
                else {
                   
                    let apiResponse=response.response(true,'Request is send already',403,null)
                    reject(apiResponse)
                }
            })
        })
    }
    let friendsId=()=>{
        return new Promise((resolve,reject)=>{
         friendsModel.findOne({receiverId:req.body.receiverId,senderId:req.body.senderId},(err,result)=>{
            if(err){
              
        let apiResponse=response.response(true,'some error occured',400,null)
        reject(apiResponse)
            }
            else if(check.isEmpty(result)){
                resolve(req);
            }
            else {
            
                let apiResponse=response.response(true,'already friends',500,null)
                reject(apiResponse)
            }
         })
        })
    }
  
    let sendrequest=()=>{
        return new Promise((resolve,reject)=>{
            userModel.findOne({userId:req.body.receiverId},(err,result)=>{
                if(err){
                 
                    let apiResponse=response.response(true,'some error occured',500,null)
                    reject(apiResponse)
                }
                else {
                    let createrequest=new friendreqModel({
                        friendreqId:shortid.generate(),
                        senderId:req.body.senderId,
                        receiverId:req.body.receiverId,
                        receiverfirstName:result.firstName,
                        receiverlastname:result.lastName,
                        senderfirstName:req.body.firstName,
                        senderlastName:req.body.lastName,
                        requestDate:Date.now()
                    })
                    createrequest.save((err,result)=>{
                        if(err){
                          
                          let apiResponse=response.response(true,'some error occured',400,null)
                          reject(apiResponse)
                        }
                        else {
                          resolve(result)
                      }
                    })
                }
            })
        })
    }


    findfriendreq(req,res)
    .then( friendsId)
   .then(sendrequest)
   .then((resolve)=>{
       let apiResponse=response.response(false,'Request send succesfully',200,resolve);
       res.send(apiResponse);
   })
   .catch((reject)=>{
       res.send(reject);
   })
}
//send friend request code end


//get request code start
let getrequest=(req,res)=>{
    friendreqModel.find({receiverId:req.params.userId},(err,result)=>{
        if(err){
            logger.captureError('some error occured','getrequest',9)
        let apiResponse=response.response(true,'some error occured',500,null)
        res.send(apiResponse)
        }
        else {
            let apiResponse=response.response(false,"requests are listed",200,result);
            res.send(apiResponse)
        }
})
}
//get request code end



//accept request code start
let acceptrequest=(req,res)=>{
    friendreqModel.findOne({friendreqId:req.body.friendreqId},(err,result)=>{
        if(err){
            logger.captureError('some error occured','acceptrequest',4)
            let apiResponse=response.response(true,'some error occured',400,null)
            res.send(apiResponse)
        }
        else if(result){
            let createUser=new friendsModel({
                friendId:result.friendreqId,
                senderId:result.senderId,
                receiverId:result.receiverId,
                receiverfirstName:result.receiverfirstName,
                receiverlastname:result.receiverlastname,
                senderfirstName:result.senderfirstName,
                senderlastName:result.senderlastName,
                acceptDate:Date.now()
            })
            deletereq(result.friendreqId);
            createUser.save((err,result)=>{
                if(err){
                    logger.captureError('some error occured','acceptrequest',8)
            let apiResponse=response.response(true,'some error occured',403,null)
            res.send(apiResponse)
                }
                else{
                    
                    let apiResponse=response.response(false,"Request are accepted",200,result);
                    res.send(apiResponse);
                }
               
            })
        }
    })
    
}

let deletereq=(friendreqId)=>{
    friendreqModel.deleteOne({friendreqId:friendreqId},(err,result)=>{
    })

}
//accept request code end


//delete friend request code start
let deletefrndreq=(req,res)=>{
    friendreqModel.deleteOne({friendreqId:req.body.friendreqId},(err,result)=>{
        if(err){
            logger.captureError('some error occured','deletefrndrequest',6)
    let apiResponse=response.response(true,'some error occured',500,null)
    res.send(apiResponse)
        }
        else {
            let apiResponse=response.response(false,"Request is deleted successfully",200,result);
            res.send(apiResponse);
        }
    })
}
//delete friend request code end


//get friends code start
let getfriends=(req,res)=>{
    friendsModel.find({senderId:req.params.userId},(err,result)=>{
        if(err){
            logger.captureError('some error occured','get friends',5)
    let apiResponse=response.response(true,'some error occured',500,null)
    res.send(apiResponse)
        }
        else {
            let apiResponse=response.response(false,"Friends are listed",200,result);
            res.send(apiResponse);
        }
    })
}
//get friends code end



//unfriend code start
let unfriend=(req,res)=>{
    friendsModel.deleteOne({friendId:req.body.friendId},(err,result)=>{
        if(err){
            logger.captureError('some error occured','un friend',5)
    let apiResponse=response.response(true,'some error occured',500,null)
    res.send(apiResponse)
        }
        else {
            let apiResponse=response.response(false,"Unfriend successfully",200,result);
            res.send(apiResponse);
        }
    })
}
//unfriend code end


//put comment code start
let putcomment=(req,res)=>{
    commentModel.findOne({storyId:req.body.storyId},(err,result)=>{
        if(err){
    let apiResponse=response.response(true,'some error occured',400,null)
    res.send(apiResponse)
        }
        else {
        
            let createcomment=new commentModel({
                commentId:shortid.generate(),
                storyId:req.body.storyId,
                comment:req.body.comment,
                senderId:req.body.senderId,
                senderfirstName:req.body.senderfirstName,
                senderlastName:req.body.senderlastName,
                createdOn:Date.now()
            })
            createcomment.save((err,result)=>{
                if(err){
            let apiResponse=response.response(true,'some error occured',403,null)
            res.send(apiResponse)
                }
                else{
                    
                    let apiResponse=response.response(false,"Comment Is Added",200,result);
                    res.send(apiResponse);
                }
               
            })
        }
    })
}
//put comment code end



//view story code start
  let getsinglepost=(req,res)=>{
      storyModel.findOne({storyId:req.body.storyId},(err,result)=>{
        if(err){
            let apiResponse=response.response(true,'some error occured',403,null)
            res.send(apiResponse)
                }
                else{
                    
                    let apiResponse=response.response(false,"Story Is Listed",200,result);
                    res.send(apiResponse);
                }
      })
  }
//view story code end


//get comment code start
let getcomment=(req,res)=>{
    commentModel.find({storyId:req.body.storyId},(err,result)=>{
        if(err){
            let apiResponse=response.response(true,'some error occured',403,null)
            res.send(apiResponse)
                }
                else{
                    
                    let apiResponse=response.response(false,"Comments Are Listed",200,result);
                    res.send(apiResponse);
                }
    })
}
//get comment code end


//add likes code start
  let addlikes=(req,res)=>{
      storyModel.findOne({storyId:req.body.storyId},(err,result)=>{
        if(err){
            let apiResponse=response.response(true,'some error occured',403,null)
            res.send(apiResponse)
                }
                else{
                    
                    result.likes=result.likes+1;
                    result.save((err,result)=>{
                        if(err){
                            
                            let apiResponse=response.response(true,'some error occured',500,null)
                            res.send(apiResponse)
                        }
                        else {
                            let apiResponse=response.response(false,'Like Is added',200,result);
                            res.send(apiResponse)
                        }
                    })
                }
      })
  }
//add likes code end


//get my  messages code start

let getmessages=(req,res)=>{
   chatModel.find({senderId:req.body.senderId},(err,result)=>{
    if(err){
                            
        let apiResponse=response.response(true,'some error occured',500,null)
        res.send(apiResponse)
    }
    else {
        let apiResponse=response.response(false,'messages are listed',200,result);
        res.send(apiResponse)
    }
   })
}

//get my messages code end



//get others sended messages code start
let receivedmessages=(req,res)=>{
    chatModel.find({receiverId:req.body.receiverId},(err,result)=>{
     if(err){
                             
         let apiResponse=response.response(true,'some error occured',500,null)
         res.send(apiResponse)
     }
     else {
         let apiResponse=response.response(false,'received are listed',200,result);
         res.send(apiResponse)
     }
    })
 }
//get others sended messages code end


//delete post code start
let deletepost=(req,res)=>{
    storyModel.deleteOne({storyId:req.body.storyId},(err,result)=>{
        if(err){
                             
            let apiResponse=response.response(true,'some error occured',500,null)
            res.send(apiResponse)
        }
        else {
            let apiResponse=response.response(false,'Post Is Deleted SuccesFully',200,result);
            res.send(apiResponse)
        }
    })
}
//delete post code ends





//reset code start
let resetcode=(req,res)=>{     
    let findmaildetails=()=>{
        return new Promise((resolve,reject)=>{
            if(req.body.email){
                
                userModel.findOne({email:req.body.email},(err,result)=>{
                    if(err){
                       
                        let apiResponse=response.response(true,'some error occured',400,null)
                        reject(apiResponse)
                    }
                    else if(check.isEmpty(result)){
                        let apiResponse=response.response(true,'User is not found',403,null)
                        res.send(apiResponse)
                    }
                    else  {
                            let resetnumber=Math.floor(Math.random() * (99999-10000+1)) +1000;
                             result.resetId=resetnumber;
                                result.save((err,result)=>{
                                    if(err){
                                       
                                        let apiResponse=response.response(true,'some error occured',500,null)
                                        reject(apiResponse)
                                    }
                                    else {
                                        resolve(req)
                                    }
                                })
                            }
                        })
            }
          else {
            logger.captureError('some error occured','findemaildetails',7)
            let apiResponse=response.response(true,'Email parameter is missing',500,null)
            reject(apiResponse)
          }
        })
    }
    //reset code end


  //send mail code start 
  let sendmail=()=>{
      return new Promise((resolve,reject)=>{
          userModel.findOne({email:req.body.email},(err,result)=>{
              if(err){
               
                let apiResponse=response.response(true,'some error occured',400,null)
                reject(apiResponse)
              }
              else if(check.isEmpty(result)){
                let apiResponse=response.response(true,'Code is not found',500,null)
                res.send(apiResponse)
            }
              else {
                  
                let transporter=nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                        user:'ashokbejo01@gmail.com',
                        pass:'ashokbejo01@10@97'
                    }
                });
                let mailOptions={
                    from:'"Issue Tracker App"',
                    to:result.email,
                    subject:'"Welcome to Issue-Tracker app"',
                    html:`<p>YOUR RESET PASSWORD CODE IS</p> <h1>${result.resetId}</h1>`
                }
                transporter.sendMail(mailOptions,function(err,data){
                    if(err){
                       
                        let apiResponse=response.response(true,'some error occured',500,null)
                        reject(apiResponse)
                    }
                    else {
                        resolve('Reset Code send successfully')
                    }
                })
              }
          })
      })
  }
     findmaildetails(req,res)
     .then(sendmail)
   .then((resolve)=>{
       let apiResponse=response.response(false,'Reset code send your Email',200,resolve);
       res.send(apiResponse);
   })
   .catch((reject)=>{
       res.send(reject);
   })
}
//send mail code end


//resetpassword code start
let resetpassword=(req,res)=>{
    if(req.body.resetId){
        userModel.findOne({resetId:req.body.resetId},(err,result)=>{
            if(err){
                logger.captureError('some error occured','Reset password',5)
                let apiResponse=response.response(true,'Reset code is Wrong',403,null)
                res.send(apiResponse)
            }
            else if(check.isEmpty(result)){
                let apiResponse=response.response(true,'Reset code is Wrong',500,null)
                res.send(apiResponse)
            }
            else {
                 result.password=hashpassword.hashpassword(req.body.password);
                 let resetnumber=Math.floor(Math.random() * (99999-10000+1)) +1000;
                 result.resetId=resetnumber;
                        result.save((err,result)=>{
                            if(err){
                                logger.captureError('some error occured','Reset password',5)
                                let apiResponse=response.response(true,'Reset code is Wrong',500,null)
                                res.send(apiResponse)
                            }
                            else {
                                let apiResponse=response.response(false,'Your Password Is Reset Successfully',200,result)
                                res.send(apiResponse)
                            }
                        })
            }
        })
    }
       else {
        let apiResponse=response.response(true,'Reset code is Missing',403,null)
        res.send(apiResponse)
       }
}
//resetpassword code end


module.exports={
    signup:signup,
    signin:signin,
    getusers:getusers,
    getsingleuser:getsingleuser,
    createstory:createstory,
    getstories:getstories,
    sendrequest:sendrequest,
    getrequest:getrequest,
    deletefrndreq:deletefrndreq,
    getfriends:getfriends,
    unfriend:unfriend,
    acceptrequest:acceptrequest,
    putcomment:putcomment,
    getsinglepost:getsinglepost,
    getcomment:getcomment,
    addlikes:addlikes,
    getmessages:getmessages,
    receivedmessages:receivedmessages,
    deletepost:deletepost,
    resetcode:resetcode,
    resetpassword:resetpassword
}