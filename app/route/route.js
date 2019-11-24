const controller=require('./../controller/usercontroller')
const auth=require('./../middelwares/auth');
const multer = require('multer');
const appConfig=require('./../config/appConfig');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null,'./uploads/')
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname)
  }
})

const fileFilter=(req,file,cb)=>{
if(file.mimetype==='image/jpeg' || file.mimetype==='image/png' || file.mimetype==='image/jpg') {
    cb(null,true)
}
else {
  cb(null,false)
}
}

const upload= multer({
  storage: storage,
  limits: {
      fileSize: 1024 * 1024 * 5
  }
})


let setRouter=(app)=>{
  let baseUrl=`${appConfig.apiVersion}/users`;
  app.post(`${baseUrl}/signup`,controller.signup);
  app.post(`${baseUrl}/signin`,controller.signin);
  app.get(`${baseUrl}//getusers/:authToken`,auth.isAuthorized,controller.getusers);
  app.post(`${baseUrl}/getsingleuser`,auth.isAuthorized,controller.getsingleuser);
  app.post(`${baseUrl}/createstory`,upload.single('image'),controller.createstory);
  app.post(`${baseUrl}/getstories`,auth.isAuthorized,controller.getstories);
  app.post(`${baseUrl}/sendrequest`,auth.isAuthorized,controller.sendrequest);
  app.get(`${baseUrl}/getrequest/:userId/:authToken`,auth.isAuthorized,controller.getrequest);
  app.post(`${baseUrl}/acceptrequest`,auth.isAuthorized,controller.acceptrequest);
  app.get(`${baseUrl}/getfriends/:userId/:authToken`,auth.isAuthorized,controller.getfriends);
  app.post(`${baseUrl}/deletefriendrequest`,auth.isAuthorized,controller.deletefrndreq);
  app.post(`${baseUrl}/unfriend`,auth.isAuthorized,controller.unfriend);
  app.post(`${baseUrl}/addcomment`,auth.isAuthorized,controller.putcomment);
  app.post(`${baseUrl}/getsinglepost`,auth.isAuthorized,controller.getsinglepost);
  app.post(`${baseUrl}/getcomment`,auth.isAuthorized,controller.getcomment);
  app.post(`${baseUrl}/addlikes`,auth.isAuthorized,controller.addlikes);
  app.post(`${baseUrl}/getmessages`,controller.getmessages);
  app.post(`${baseUrl}/receivedmessages`,controller.receivedmessages);
  app.post(`${baseUrl}/deletepost`,controller.deletepost);
  app.post(`${baseUrl}/resetcode`,controller.resetcode);
  app.post(`${baseUrl}/resetpassword`,controller.resetpassword);
}

module.exports={
    setRouter:setRouter
}