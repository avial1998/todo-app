//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");
const uri = "mongodb+srv://root:root@cluster0.xydbh.mongodb.net/todo?retryWrites=true&w=majority";
try {
  mongoose.connect( uri, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
  console.log("connected"));    
  }catch (error) { 
  console.log("could not connect");    
  }

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// setting up the mongoose Schema//
const Schema=mongoose.Schema;
const itemsSchema=new Schema({
  name:String
})
const Item=mongoose.model("item",itemsSchema,"items");

// array creation//
const item1=new Item({
  name:"Welcome to your todolist"
})
const item2= new Item({
  name:"Hit + to add a new item"
})
const item3= new Item({
  name:"<--Hit this to delete an item"
})
const defaultItems=[item1,item2,item3];
const listSchema=({
  name:String,
  items:[itemsSchema]
});
const List=mongoose.model("list",listSchema,"lists");



// Request Mapping///
app.get("/", function(req, res) {

const day = date.getDate();

  Item.find(function(error,result){
    if(result.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Items added successfully...!");
      }
    });
    res.redirect("/");
  }
  else{
      res.render("list", {listTitle:"Today", newListItems:result });
  }
      });
    
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });

  if(listName==="Today"){
  item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,result){
      result.items.push(item);
      result.save();
      res.redirect("/"+listName);
    });
  }
});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,results){
    if(!err){
      if(!results){
        // console.log("Not found...!");
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        // console.log("Exists....!");
        res.render("list",{listTitle:results.name,newListItems:results.items})
      }
    }
  });
  
});


app.get("/about", function(req, res){
  res.render("about");
});
app.post("/delete",function (req,res){
  const checkedId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
  Item.findByIdAndRemove(checkedId,function(err){
    if(err){
      console.log("could not delete the item...!");
    }else{
      console.log("item deleted successfully...!");
      res.redirect("/");
    }
  });
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},function(err,result){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}
});
let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}
app.listen(process.env.PORT||3000, function() {
  console.log("Server started ...!");
});
