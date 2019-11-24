const express=require('express');
const http=require('http');
const mongoose=require('mongoose');
const appconfig=require('./app/config/appConfig');
const logger=require('./app/lib/loggerLib');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const response=require('./app/lib/responseLib');
const setRouter=require('./app/route/route');

const globalErrorMiddleWare=require('./app/middelwares/appErrorHandler');
const routeLoggerMiddleware=require('./app/middelwares/routeLogger');

const app=express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads',express.static('uploads'));
app.use(globalErrorMiddleWare.globalErrorHandler)
app.use(routeLoggerMiddleware.logIp)

setRouter.setRouter(app);

app.use(globalErrorMiddleWare.globalNotFoundHandler);

const server=http.createServer(app);
server.listen(appconfig.port);
server.on('error',onerror);
server.on('listening',onlistening);

const socket=require('./app/lib/socketLib');
socket.setServer(server);
//error listener for http server 'error' event.
function onerror(error){
    if(error.syscall !== 'listen')  {
        logger.captureError(error.code+'not equal Listen','serverOnErrorHandler',10);
        throw error;
    }
    switch(error.code) {
        case 'EACCES':
            logger.captureError(error.code+':elavated privilages required','serverOnErrorHandler',10);
            process.exit(1)
            break;
         case 'EADDRINUSE':
             logger.captureError(error.code,':port is already in use Ashok','serverOnErrorHandler',10);
             process.exit(1)
             break;
         default:
             logger.captureError(error.code+':some unknown error occured','serverOnErrorHandler',10)       
    }
}

//event listener for Http server 'listening' event;
    function onlistening(){
        var addr=server.address()
        var bind=typeof addr === 'string'?'pipe'+addr:'port'+addr.port;
        ('Listening on'+bind)
        console.log(bind)
        logger.captureInfo('server listening on port'+addr.port,'serverListeningHandler',10)
    }
mongoose.connect(appconfig.db.uri, {useUnifiedTopology:true,useNewUrlParser:true})

mongoose.connection.on('error',()=>{
     console.log('data base connection is error')
})

mongoose.connection.on('open',()=>{
    console.log('data base connection is open')
})


