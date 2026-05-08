import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { UserModel } from "../model/userModel.js";
import { TaskModel } from "../model/taskModel.js";
export const adminApp=exp.Router();
adminApp.get("/admin/users",verifyToken,async(req,res)=>{
  try {
    if(req.user.role!=="ADMIN"){
      return res.status(403).json({message:"Access denied"});
    }
    const users = await UserModel.find().select("-password");
    res.status(200).json({message:"Users fetched",payload:users});
  } 
  catch(err){
    res.status(500).json({message:"Failed to fetch users",error:err.message});
  }
});

adminApp.delete("/admin/task/:id",verifyToken,async(req,res)=>{
    try{
      if(req.user.role!=="ADMIN"){
        return res.status(403).json({message:"Access denied"});
      }
      const task=await TaskModel.findById(req.params.id);
      if(!task){
        return res.status(404).json({message:"Task not found"});
      }
      await TaskModel.findByIdAndDelete(req.params.id);
      res.status(200).json({message:"Task deleted by admin"});
    } 
    catch(err){
      res.status(500).json({message:"Failed to delete task",error:err.message});
    }
  });