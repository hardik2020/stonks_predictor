const express=require("express");
const path=require("path");

const bcrypt=require("bcryptjs");
const cookieParser=require("cookie-parser");
const app=express();
const port=process.env.PORT || 5000;
const authentication=require("./middleware/authentication");
const jwt=require("jsonwebtoken");
const nodemailer = require("nodemailer");

require("./db/connection");
const Register=require("./models/registers");

const getName = require('./Constants/names')
var Quandl = require("quandl");
var quandl = new Quandl({
    auth_token: "NF3NnMfXhGstxj5HDzVF",
    api_version: 3,
});
const axios = require('axios')

app.use(cookieParser());


app.use(express.json({limit:'50mb'}));

app.use(express.urlencoded({extended:false}));



app.post('/fpass',async(req,res)=>{
  try{
    const data = await Register.findOne({email:req.body.email});
    if(data)
    {
      data.password=req.body.pass;
      await data.save();
    }
    else
    {
      res.status(400).json({status:400})  
    }
  }
  catch(err)
  {
    console.log(err);
    res.status(400).json({status:400})
  }
})

app.post("/fuser",async(req,res)=>{
  try{
    const data = await Register.findOne({email:req.body.email});
    if(data)
    {
      const user = process.env.USER;
      const pass = process.env.PASSWORD;
      const transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: user,
          pass: pass,
        },
      });
      const characters = '0123456789';
      let confirmationCode = '';
      for (let i = 0; i < 6; i++) {
        confirmationCode += characters[Math.floor(Math.random() * characters.length )];
      }
      transport.sendMail({
        from: user,
        to: req.body.email,
        subject: "Change Password",
        html: `<h3>Hello ${data.fname}</h3>
            <p>Your One Time Password is ${confirmationCode} (valid for only 10 minutes)</p>
            `,
      }).catch(err => console.log(err));
      res.status(201).json({status:201,code:confirmationCode});
    }
    else
    res.status(400).json({status:400})
  }
  catch(err)
  {
    console.log(err);
    res.status(400).json({status:400})
  }
})

app.post("/confirm",async(req,res)=>{
  try{
    const code = req.body.confirmationCode;
    console.log(code);
    const data = await Register.findOne({confirmationCode:code});
    console.log(data);
    if(!data)
    {
      res.status(200).json({status:400,result:"error"});
    }
    else
    {
      if(data.status==="Active")
      {
        res.status(200).json({status:400,result:"Account already active"});
      }
      else
      {
        await Register.updateOne({confirmationCode:code},{$set:{status:"Active"}});
        res.status(200).json({status:201,result:"Account activated"});
      }
    }



  }catch(err){
    console.log(err);
    res.status(400).json({status:400,error:err});
  }

})
app.post("/register",async (req,res)=>{
  try{
    const password=req.body.password;
    const cpassword=req.body.cpassword;
    let status = "Pending";
    if(req.body.status)
    {
      status=req.body.status;
    }
    const data = await Register.findOne({email:req.body.email});
    console.log(data);
    if(data)
    {
      res.status(201).json({status:400,error:"Already a User"});
    }
    else
    {
      if(password===cpassword)
      {
        

        const employee=new Register({
          username:req.body.fname,
          fname:req.body.fname,
          lname:req.body.lname,
          email:req.body.email,
          gender:req.body.gender,
          age:req.body.age,
          password:password,
          status:status
        })
        //console.log("here");
        
        // employee.password=await bcrypt.hash(password,10); //maine schema wali file me middleware chala diya h
        const result=await employee.save();
        console.log("end");
        res.status(201).json({status:201,result:"successful"});
      }
      else
      {
        res.status(201).json({status:400,error:"passwords are not same"});
      }
    }
  }catch(err){
    console.log(err);
    res.status(201).json({status:400,error:"Already a user"});
  }
})

app.post("/login",async (req,res)=>{
  try{
    const email=req.body.email
    const password=req.body.password;
    const employee= await Register.findOne({email:email});
    const isValid=await bcrypt.compare(password,employee.password);
    
    const token= await employee.createAuthToken();
    console.log(token);

    res.cookie("jwt",token,{
      httpOnly:true,
      // secure:true
    });
    
    if(isValid&&employee.status!=="Pending")
    {
      res.status(201).json({status:201,result:"Login Successful....",data:employee})
    }
    else if(isValid&&employee.status==="Pending")
    {
      res.status(201).json({status:400,error:"Please confirm your email first"});
    }
    else
    {
      res.json({status:400,error:"Invalid email or password",data:employee});
    }
  }catch(err)
  {
    console.log("Invalid email or password"); 
    res.json({status:400,error:"Invalid email or password",data:{}})
  }
})

app.get("/logout",authentication,async (req,res)=>{
  try {
    
    // // logout from single device
    // console.log("logout successful....");
    // req.data.tokens=req.data.tokens.filter((element)=>{
    //   return element.token!=req.token;
    // })

    //logout from all devices
    //console.log("logout from all devices successful");
    req.data.deviceCount--;
    
    if(req.data.deviceCount==0)
    {
      //req.data.token="";
      res.clearCookie("jwt");
      await Register.updateOne({_id:req.data._id},{$set:{token:"",deviceCount:0}});
    }
    else
    {
      await Register.updateOne({_id:req.data._id},{$set:{deviceCount:req.data.deviceCount}});

    }

    console.log(req.data);
    //await req.data.save();
    res.status(201).json({status:201});
  } catch (error) {
    console.log(error);
    res.status(400).json({status:400,error:error});
  }
})

app.get("/timeSeries", async(req, res) => {
  try{
    const indexId = req.query.indexId;
    console.log(req);
    if(getName(indexId).length>0){
      await quandl.dataset({
        source: 'BSE',
        table: 'BOM'+indexId
      },{
        start_date: '2019-06-06',
        end_date: '2020-06-06',
        order:'asc'
      }, function(err, response){
        if(err)
            throw err;
     
            console.log(response);
            res.status(201).json({data:(response)});
    })
      
    }
    else{
      res.json({status:400,error:"Invalid Index Id",data:indexId});
    }
    // send all data to frontend
  }
  catch (error) {
    console.log(error);
    res.status(400).json({status:400,error:error});
  }
})

app.listen(port,()=>{
  console.log(`listening at port number ${port}`);
})