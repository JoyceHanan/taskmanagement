import exp from "express";
import {UserModel} from "../model/userModel.js";
import {hash,compare} from "bcrypt";
import {verifyToken} from "../middleware/verifyToken.js";
import {config} from "dotenv";
import jwt from "jsonwebtoken";
import { now } from "mongoose";

config();
const {sign,verify}=jwt;
export const userApp=exp.Router();
userApp.post("/register",async(req,res)=>{
  try {
    const newUser=req.body;
    const existingUser=await UserModel.findOne({ email:newUser.email});
    if (existingUser) {
      return res.status(400).json({message:"User already exists"});
    }
    newUser.password=await hash(newUser.password,12);
    const userDoc=new UserModel(newUser);
    await userDoc.save();
    const token=sign({id:userDoc._id,email:userDoc.email,role:userDoc.role},process.env.JWT_SECRET,{expiresIn:"2h"} );

    res.cookie("token",token,{
      httpOnly: true,
      sameSite:"none",
      secure:true,
    });
    let userObj=userDoc.toObject();
    delete userObj.password;
    res.status(201).json({ message:"User has registered",payload:userObj  });
  } 
  catch(err){
    console.log("Registration error",err);
    res.status(500).json({message:"Registration failed",error:err.message });
  }
});

userApp.post("/login",async(req,res)=>{
  try {
    const{ email,password}=req.body;
    
    let user = await UserModel.findOne({email});
    if (!user) {
      return res.status(401).json({ message:"Invalid email"});
    }
    const isPasswordValid=await compare(password,user.password);
    if(!isPasswordValid){
      return res.status(401).json({ message:"Invalid password" });
    }
    const token=sign({id:user._id,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:"1h"});
    const refreshToken=sign({id:user._id,email:user.email,role:user.role},process.env.JWT_REFRESH,{  expiresIn:"7d"});
    user.refreshToken=refreshToken;
    await user.save();
    res.cookie("token",token,{
      httpOnly: true,
      sameSite:"none",
      secure:true,
    });
    res.cookie("refreshToken",refreshToken,{
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    let userObj=user.toObject();
    delete userObj.password;
    res.status(200).json({message:"Login successful",token,payload:userObj});
  } 
  catch(err){
    res.status(500).json({message:"Login failed",error:err.message});
  }
});
userApp.get("/logout",(req,res) =>{
  res.clearCookie("token",{
    httpOnly: true,
    secure:true,
    sameSite:"none",
  });
  res.clearCookie("refreshToken",{
    httpOnly: true,
    secure: true,
    sameSite:"none",
  });
  res.status(200).json({message:"Logout Successful"});
});

userApp.get("/check-auth",async(req,res)=>{
  try {
    const token=req.cookies.token;
    if(!token){
      return res.status(401).json({message:"No token found"});
    }
    const decoded=verify(token, process.env.JWT_SECRET)
    const user=await UserModel.findById(decoded.id);
    if(!user) {
      return res.status(401).json({message:"User not found"});
    }
    let userObj=user.toObject();
    delete userObj.password;
    res.status(200).json({message:"User authenticated",payload:userObj});
  } 
  catch(err){
    console.log(err)
    res.status(401).json({message:"Authentication failed"});
  }
});

userApp.get("/profile",verifyToken,async(req,res)=>{
  try {
    const idtoken=req.user.id;
    const userdetails=await UserModel.findById(idtoken);
    if(!userdetails){
      return res.status(404).json({message:"User not found"});
    }
    let userObj=userdetails.toObject();
    delete userObj.password;
    res.status(200).json({message:"User Details",payload:userObj});
  } 
  catch(err){
    res.status(500).json({message:"Failed to fetch profile",error:err.message});
  }
});

userApp.put("/password",async(req,res)=>{
  try {
    const {email,password,newpassword}=req.body;
    const user=await UserModel.findOne({email});
    if(!user){
      return res.status(404).json({message:"Email not found"});
    }
    const isPassValid=await compare(password,user.password);
    if(!isPassValid){
      return res.status(401).json({message:"Password Invalid"});
    }
    const isSame=await compare(newpassword,user.password);
    if(isSame){
      return res.status(400).json({message: "The password is same as old"});
    }
    const hashed=await hash(newpassword, 12);
    await UserModel.findOneAndUpdate({email:email },{$set:{password:hashed}},{new:true,runValidators:true});

    res.status(200).json({message:"Password updated"});
  } 
  catch(err){
    res.status(500).json({message:"Password update failed",error:err.message});
  }
});
userApp.post("/refresh",async(req,res)=>{
  try {
    const refreshToken=req.cookies.refreshToken||req.body.refreshToken;
    if(!refreshToken){
      return res.status(401).json({message:"Token not found"});
    }
    const decoded=verify(refreshToken,process.env.JWT_REFRESH);
    const user=await UserModel.findById(decoded.id);
    if(!user||user.refreshToken!==refreshToken) {
      return res.status(403).json({message:"Invalid refresh token"});
    }
    const newAccessToken=sign({id:user._id,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:"2d"});
    res.cookie("token",newAccessToken,{
      httpOnly: true,
      secure: true,
      sameSite:"none",
    });
    res.status(200).json({message:"Token Refreshed",token:newAccessToken});
  } 
  catch(err){
    res.status(401).json({message:"Invalid or expired refresh token"})
  }
});