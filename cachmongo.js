const express=require('express')
const mongoose=require('mongoose')
const app=express()
const Product=require("./models/productModel")
const redis=require('redis');
const redisClient=redis.createClient(6379,'127.0.0.1')
redisClient.on('error', err => console.log('Redis Client Error', err)).connect();
//let product;
let parentkeyname='products';
app.use(express.json())
app.get('/',(req,res) =>{
    res.send("Hello Node API")
})
app.get('/blog',(req,res) =>{
    res.send("Hello BLOG")
})
app.get('/products',async(req,res)=>{
    try
    {
        let resp="";
        let reparr=[];
        //const product = await Product.find({})
        for (var x in product)
        {
            let keyname=`product${x}`;
            let getcachedata= await redisClient.hGet(parentkeyname,keyname);
            let result=product[x];
            if(getcachedata){
               resp=JSON.parse(getcachedata)
               reparr[x]=resp
               console.log("GET Cache")
            }
            else{
                console.log("SET Cache")
                redisClient.hSet(parentkeyname,keyname,JSON.stringify(result),{EX:300})
                resp=result;
                reparr[x]=resp
            }
        }
        res.status(200).json(reparr)
    }
    catch(error){
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
})
app.get('/product/:id', async(req, res) =>{
    try {
        count=0
        const {id} = req.params;
        let reparr=[]
      //  product = await Product.find({})
       // const product = await Product.findById(id);
       for (var x in product)
       {
           let keyname=`product${x}`;
           let result=product[x]
           if(product[x]._id == id && count==0)
           {
           let getcachedata= await redisClient.hGet(parentkeyname,keyname);
              resp=JSON.parse(getcachedata)
              reparr[x]=resp
              console.log("GET Cache");
              count+=1
           }
           else{
               console.log("SET Cache")
               redisClient.hSet(parentkeyname,keyname,JSON.stringify(result),{EX:300})
               resp=result;
               reparr[x]=resp
           }
       }
       res.json(reparr)
   }
    catch (error) {
        res.status(500).json({message: error.message})
    }
})
app.put('/product/:id', async(req, res) => {
    try {
        const {id} = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body);
        if(!product){
            return res.status(404).json({message: `cannot find any product with ID ${id}`})
        }
        const updatedProduct = await Product.findById(id);
        res.status(200).json(updatedProduct);
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})
app.delete('/product/:id', async(req, res) =>{
    try {
        const {id} = req.params;
        const product = await Product.findByIdAndDelete(id);
        if(!product){
            return res.status(404).json({message: `cannot find any product with ID ${id}`})
        }
        res.status(200).json(product);
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

app.post('/product',async(req,res)=>{
    try
    {
        const product = await Product.create(req.body)
        res.status(200).json(product)
    }
    catch(error){
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
})

mongoose.connect('mongodb+srv://admin:pass123@apiwork1.lsurqje.mongodb.net/Node-API?retryWrites=true&w=majority').then(()=>{
    console.log("connected to MongoDB")
    app.listen(3000,() =>{
        console.log('Node API is running on port 3000')
    });
}).catch((error)=>{
    console.log(error);
})