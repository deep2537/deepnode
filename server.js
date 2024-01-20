const express=require('express')
const mongoose=require('mongoose')
const app=express()
const Product=require("./models/productModel")
const redis=require('redis');
const redisClient=redis.createClient(6379,'127.0.0.1')
redisClient.on('error', err => console.log('Redis Client Error', err)).connect();
app.use(express.json())
let m=0;
app.get('/',(req,res) =>{
    res.send("Hello Node API")
})
app.get('/blog',(req,res) =>{
    res.send("Hello BLOG")
}) 
app.get('/products',async(req,res)=>{
    try
    { 
        let allproducts=null;
        let finalresult=[]
        if (m==0)// for the very first time
        {
        const product = await Product.find({});// fetching all data from db
        let c=0
        for (x in product)// putting each product data in cache
        {
        let keyname=`product${c}`;
        await redisClient.HSET('products1',keyname,JSON.stringify(product[x]))
        await redisClient.EXPIRE('products1',300)
        c++;
        }
        console.log("Setting the cache for the first time");
        res.status(200).json(product);
        m++;
        }
        else
        {
           allproducts=await redisClient.HGETALL('products1');
           console.log(allproducts)
           for (x in allproducts)
           {
                m=JSON.parse(allproducts[x]) 
                console.log(m);
                finalresult[x]=m;
           }
           console.log("Getting from cache")
           console.log(finalresult)
           res.send(Object.values(allproducts).map(m=>JSON.parse(m)));
        }
    }
    catch(error){
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
})
app.get('/product/:id', async(req, res) =>{
    try {
        // generate a key for your current request and accessing the reddis cache
        const {id} = req.params;
        let find,m,x,count=0,c=0;
         find= await redisClient.HGETALL('products1');
         for (x in find)// check in Redis cache to check if it is present or not
         {
           m=JSON.parse(find[x])
           if(m["_id"]==id)// if yes ,then set value to variable product and send a response
           {
            console.log(m);
            count++;
            res.status(200).json(m);
            break;
           }
           c++;
         }
         if (count!=0)
         {
            console.log("Present in Cache GET cache");
         }
         else  // if not , we check key in database and fetch data from it 
         {
            let product = await Product.findById(id);
            if(!product) // if not , set a value to variable that record doesnt exist and send a response 
          {  
            console.log("Not found")
            res.status(404).json({message: 'Not found'})
          }
          else  // if yes, set value to variable product 
          {
            console.log(product)
            console.log("Putting in the cache SET cache");
            var keyname=`product${c}`;
            await redisClient.HSET('products1',keyname,JSON.stringify(product))// set the variable value to redis cache as well and send response
            await redisClient.EXPIRE('products1',300)
            res.json(product)
          }
         }
    } catch (error) {
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
        let find,m2,x,c=0;
        find= await redisClient.HGETALL('products1');
        for (x in find)
        {
          m2=JSON.parse(find[x])
          if(m2["_id"]==id)
          {
           await redisClient.HSET('products1',x,JSON.stringify(updatedProduct))
           c=1;
           break;
          }
        }
        if(c==1)
        {
        console.log(updatedProduct);
        }
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
        let find,m2,x,c=0;
         find= await redisClient.HGETALL('products1');
         for (x in find)
         {
           m2=JSON.parse(find[x])
           if(m2["_id"]==id)
           {
            await redisClient.HDEL('products1',x);
            c=1;
            break;
           }
         }
         if(c==1)
         {
         console.log(m2);
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
        let count=0,find;
        find= await redisClient.HGETALL('products1');
        for (x in find)
        {
            count++;
        } 
        console.log("Putting in the cache SET cache");
        var keyname=`product${count}`;
        await redisClient.HSET('products1',keyname,JSON.stringify(product))
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