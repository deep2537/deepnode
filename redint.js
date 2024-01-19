const express=require('express')
const app=express()
const redis=require('redis');
const redisClient=redis.createClient(6379,'127.0.0.1')
redisClient.on('error', err => console.log('Redis Client Error', err)).connect();
app.get('/home', async (req,res)=>{
    let keyname='normalkey';
    let getcachedata= await redisClient.get(keyname);
    let result={
        id:13,
        dept:"HR",
    }
    let resp;
    if(getcachedata){
        resp=JSON.parse(getcachedata)
        console.log("GET Cache")
    }
    else{
        console.log("SET Cache")
        redisClient.set(keyname,JSON.stringify(result),{EX:300})
        resp=result;
    }
    console.log(getcachedata)
    res.status(200).json(resp)
});
app.listen(3000,() =>{
    console.log('Node API is running on port 3000')
});