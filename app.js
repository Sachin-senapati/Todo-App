const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose=require("mongoose");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todolist");

const itemsSchema=new mongoose.Schema({
  name:String
});
const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});
const List=mongoose.model("List",listSchema);
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"welcome to do list"
});
const item2=new Item({
  name:"Hit the + button to add a new item"
});
const item3=new Item({
  name:"<-- Hit this to delete "
});
const defaultItems=[item1,item2,item3];

app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Sucesfully addedd");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {
        kindofDay:"Today",
        newItemList:foundItems

    });
    }
  });
});
app.get("/:post",function(req,res){
  console.log(req.params.post);
  const customListName=req.params.post;
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list =new List({
            name:customListName,
            items:defaultItems
            });
            list.save();
            res.redirect("/");
      }else{
        res.render("list",{
          kindofDay:foundList.name,
          newItemList:foundList.items
        });

      }
    }
  });
});

app.post("/",function(request,resp){

  const itemName=request.body.newItem;
  const listName=request.body.list;
  console.log(listName);
  const iteam=new Item({
    name:itemName
  });
  if(listName ==="Today"){
    iteam.save();
    resp.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(iteam);
      foundList.save();
      resp.redirect("/"+listName);
    });
  }
});
app.post("/delete",function(req,res){
  const checkedRequestedID=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedRequestedID,function(err){
    if(!err){
      console.log("Sucesfully Deleted");
      res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedRequestedID}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}

});
// app.post("/delete",function(req,res){
//   const checkedRequestedID=req.body.checkbox;
//   Item.findByIdAndRemove(checkedRequestedID,function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Sucesfully Deleted");
//     res.redirect("/");
//   }
// });
// })
app.listen(3000, function(request, response) {
  console.log("Server is working on port 3000");
});
