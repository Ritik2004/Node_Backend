import express from 'express';
import  path from "path";
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

//these are the steps to connecting to mongodb
mongoose.connect("mongodb://localhost:27017", {
    dbName:"backend",
})
.then(()=> console.log("Database Connected"))
.catch(()=>console.log("error in connecting"))

// /////////for datatbase//////////

// //here we will create schema
// const messageSchema = new mongoose.Schema({
//     name:String,
//     email:String
// });

//here we create model or collection

//const Messge = mongoose.model("Message", messageSchema)
/////////////////////////

//this schema will be for user
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

const User = mongoose.model("User", userSchema);


const app = express();

//const users= [];
//for excessing static file
app.use(express.static(path.join(path.resolve(), "public")))
//using middleware
app.use(express.urlencoded({extended:true}))
//setting the view engine
app.set("view engine", "ejs");

//this is used to access cookie
app.use(cookieParser())

const isAunthenticate = async (req,res,next)=>{
    const {token} = req.cookies;
    if(token){
 
      const decode =   jwt.verify(token,"feufhehfueh")
     next();
    }
    else{
    res.redirect("/login")
    }
}

app.get('/', isAunthenticate, (req,res)=>{
    res.render("logout")
})


/////////////////these are for practise//////////////

// app.get('/add',async (req,res)=>{
//     await Messge.create({
//          name:"Ritik2",email:"sample2@gmail.com"
//      })
//      res.send("created")
//  })
// app.get('/',(req,res)=>{
//     const {token} = req.cookies;
//     if(token){
//         res.render("logout")
//     }
//     else{
//     res.render("login")
//     }
// })
// app.get('/success',(req,res)=>{
//     res.render("success")
// })
// app.post("/contact",async (req,res)=>{
 
//     const{name,email} = req.body;
//     await Messge.create({name,email})
//  //await Messge.create({name : req.body.name, email:req.body.email })
//  //console.log(messageData)
//   res.redirect("/success")

// })
// app.get("/users", (req,res)=>{
//     res.json({
//         users,
//     });
//});

app.get('/login',(req,res)=>{
    res.render("login")
})
//if user is not registered it will go register page
app.get('/Register',(req,res)=>{
    res.render("Register")
})
//this is used to set coookie for logout
app.get('/logout',(req,res)=>{
    res.cookie("token", null,{
        httpOnly:true, 
        expires: new Date(Date.now())
    });
    res.redirect("/")
})
//this is used to to authenticate to login cookie
app.post('/Register', async (req,res)=>{

    const{name,email,password} = req.body;

    let user = await User.findOne({email});

    if(user){
        return res.redirect("/login")
    }
  const hashPassword = await bcrypt.hash(password,10)
    user =  await User.create({
             name,
             email,
             password:hashPassword 
    })

    const token =  jwt.sign({_id:user._id}, "feufhehfueh")
    // console.log(token)
    
    res.cookie("token",token,{
        httpOnly:true, 
        expires: new Date(Date.now()+60*1000)
    });
    res.redirect("/")
})

app.post("/login",async  (req,res)=>{
   const {email,password} = req.body;

   let user = await User.findOne({email})

   if(!user) {
    
    return res.redirect("/register")
   }
  const isMatch = await bcrypt.compare(password,user.password);

  if(!isMatch) return res.render("login", {email, message: "Incorrect Password"})
       
  const token =  jwt.sign({_id:user._id}, "feufhehfueh")
  // console.log(token)
  
  res.cookie("token",token,{
      httpOnly:true, 
      expires: new Date(Date.now()+60*1000)
  });
  res.redirect("/")

})


app.listen(5000, ()=>{
   console.log("running")
})