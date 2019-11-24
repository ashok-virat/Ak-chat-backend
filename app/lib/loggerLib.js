let captureError=(errorMessage,errorOrigin,errorLevel)=>{
    let errorResponse={
        errorMessage:errorMessage,
        errorOrigin:errorOrigin,
        errorLevel:errorLevel
    }
    return errorResponse;
}

let captureInfo=(message,Origin,Importance)=>{
    let Response={
        message:message,
        origin:Origin,
        Importance:Importance
    }
    return Response;
}



module.exports={
    captureError:captureError,
    captureInfo:captureInfo
}