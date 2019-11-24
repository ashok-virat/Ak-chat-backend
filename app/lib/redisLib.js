const check=require('./checkLib');

const redis=require('redis');
let client=redis.createClient();


client.on('connect',()=>{
    console.log('redis connection successfully opened')
})


let getAllUsersInHash=(hashName,callback)=>{
    client.HGETALL(hashName,(err,result)=>{
        if(err){
            console.log(err)
            callback(err,null)
        }
        else if(check.isEmpty(result)){
            console.log('online user list is empty')
        }
        else {
            console.log(result);
            callback(null,result)
        }
    })
}

let setNewOnlineUserInHash=(hashName,key,value,callback)=>{
   client.HMSET(hashName,[
        key,value
    ],(err,result)=>{
        if(err){
            console.log('some error is occured')
            callback(err,null)
        }
        else{
            console.log('user has been set in the hash map')
            callback(null,result)
        }
    })
}

let deleteUserFromHash=(hashName,Key)=>{
    client.HDEL(hashName,Key);
    return true;
}

module.exports={
    getAllUsersInHash:getAllUsersInHash,
    setNewOnlineUserInHash:setNewOnlineUserInHash,
    deleteUserFromHash:deleteUserFromHash
}