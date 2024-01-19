const mysql = require('mysql2');
const mysqlconnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'Deepesh1234$',
  database: 'product1',
});
mysqlconnection.connect((error)=>{
    if(error)
    {
        console.log("error in Database connection :"+JSON.stringify(error,undefined,3));
    }
    else{
        console.log("Database Connected");
    }
})
module.exports=mysqlconnection
