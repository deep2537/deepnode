let parentkeyname='products';
let keyname=`product${x}`
let getcachedata= await redisClient.get(keyname);
let result=""
let resp="";
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


