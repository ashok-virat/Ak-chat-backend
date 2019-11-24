
let response=(error,message,status,data)=>{
    let apiresponse={
        error:error,
        message:message,
        status:status,
        data:data
    }
    return apiresponse;
}

module.exports={
    response:response
}