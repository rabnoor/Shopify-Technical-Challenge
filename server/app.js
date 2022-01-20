const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
var mysql = require('mysql');
const path = require('path');
let converter = require('json-2-csv');


var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Harmin99',
  database : 'Inventory'
});
db.connect(err => {
    if (err) throw err;
    console.log("sql connected")
});


app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/all',(req, res) => {

  let Query = 'SELECT * FROM Inventory'

  db.query(Query, async (error, result) => {
      if (error){
          console.log(error);
      }
      if (result.length == 0){
          res.send({success:false, message: "No product"})
      }else {
          res.send({success: true, message: "Found", data: result})
      }
  }); 
  
})

app.post('/edit',(req, res) => {

  const id = req.body.ProductCode;
  var message =  ""

  db.query('SELECT * FROM Inventory WHERE ProductCode = ?', [id], async (error, result) => {
      if (error){
          console.log(error);

      }else {

          res.send({success: true, message: "Found", data: result[0]})
      }
  }); 
  
})

app.post('/update',(req, res) => {

  const ProductCode = req.body.ProductCode;

  var message =  ""
  // console.log(id)
  let Query = 'UPDATE Inventory SET `Name` = "' + `${req.body["Name"]}`+ '" ,`Company` = "'+`${req.body["Company"]}`+'",`Count` = '+`${req.body["Count"]}`+' WHERE (ProductCode = "'+`${ProductCode}` + '")'
  db.query(Query, async (error, result) => {
      if (error){
          console.log(error);
      }else {

          res.send({success: true, message: "Changes Processed!", data: result[0]})
      }
  }); 
  
})

app.post('/deleteProduct',(req, res) => {

  const id = req.body.ProductCode;
  var message =  ""

  db.query('DELETE FROM Inventory WHERE ProductCode = ?', [id], async (error, result) => {
      if (error){
          console.log(error);
      
      }else {

          res.send({success: true, message: "Deleted!", data: result[0]})
      }
  }); 
  
})

app.post('/addInventory',(req, res) => {

  db.query('SELECT ProductCode FROM Inventory WHERE ProductCode = ?', [req.body.ProductCode], async (error, result) => {
      if (error){
          console.log(error);
      }
      else if (result.length > 0){

          message = "Product already registered. To Edit go to Search Inventory";
          res.send({message: message})
      }else if (req.body.ProductCode == ''){
          message = "Product Code cannot be empty";
          res.send({message: message})
      }
      else{
  db.query('INSERT INTO Inventory SET ?', req.body,(error, results) => {
      if (error){
          console.log(error);
      } else {
          console.log("registered");
          message = "Product registered"
          res.send({message: message})

      }

  })
}
})
  
})

app.post('/search',(req, res) => {

  const ProductCode = req.body.ProductCode;
  var message =  ""

  db.query('SELECT * FROM Inventory WHERE ProductCode = ?', [ProductCode], async (error, result) => {
      if (error){
          console.log(error);
      }
      if (result.length == 0){
          res.send({success:false, message: "No such Product"})
      }else {
          res.send({success: true, message: "Found", data: result[0]})
      }
  }); 
  
})

app.get('/csv',(req, res) => {


  // console.log(id)
  let Query = 'SELECT * FROM Inventory'
  db.query(Query, async (error, result) => {
      if (error){
          console.log(error);
      }else {
        const jsonData = JSON.parse(JSON.stringify(result));
        converter.json2csvAsync(jsonData)
        .then((csv) => {
          res.setHeader('Content-type', "application/octet-stream");

          res.setHeader('Content-disposition', 'attachment; filename=Inventory.csv');
          
          res.send(csv);})
        .catch((err) => { throw error });
      
      
      }
  }); 
  
})




app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'editInventory.html'));
})
app.get('/addInventory', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'addInventory.html'));
})
app.listen(8080, () => {
    console.log(`Running on 8080`)
  });