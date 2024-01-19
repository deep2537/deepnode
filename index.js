const connection=require('./deep1')
const express=require('express')
const bodyParser=require('body-parser')
const app=express()
app.use(bodyParser.json())
app.get('/products',(req,res)=>{
    connection.query("Select * from product",(error,rows)=>{
        if(error){
            console.log(error);
        }
        else{
           console.log(rows);
           res.send(rows);
        }
    })
});
app.get('/products/:id',(req,res)=>{
    connection.query("Select * from product WHERE p_id=?",[req.params.id],(error,rows)=>{
        if(error){
            console.log(error);
        }
        else{
           console.log(rows);
           res.send(rows);
        }
    })
});
app.delete('/products/:id',(req,res)=>{
    connection.query("DELETE from product WHERE p_id=?",[req.params.id],(error,rows)=>{
        if(error){
            console.log(error);
        }
        else{
           console.log(rows);
           res.send(rows);
        }
    })
})
app.post('/product',(req,res)=>{
    var product1=req.body
    var p_data=[product1.p_id,product1.p_name,product1.p_price]
     connection.query("INSERT INTO product VALUES(?)",[p_data],(error,rows)=>{
        if(error){
            console.log(error);
        }
        else{
           console.log(rows);
           res.send(rows);
        }
    })
});
app.put('/product',(req,res)=>{
    var product1=req.body
    connection.query("UPDATE product SET ? WHERE p_id="+product1.p_id,[product1],(error,rows)=>{
        if(error){
            console.log(error);
        }
        else{
           console.log(rows);
           res.send(rows);
        }
    })
});
app.listen(3000,()=>{
    console.log("express server is running on port 3000")
})