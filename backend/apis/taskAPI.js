import exp from "express";
import { TaskModel } from "../model/taskModel.js";
import { verifyToken } from "../middleware/verifyToken.js";

export const taskApp=exp.Router();

taskApp.post("/tasks",verifyToken,async(req,res)=>{
  try {
    const newTask=new TaskModel({ ...req.body,createdBy:req.user.id});
    await newTask.save();
    res.status(201).json({message:"Task created",payload:newTask});
  } 
  catch(err){
    res.status(500).json({message:"Task creation failed",error:err.message});
  }
});

taskApp.get("/tasks",verifyToken,async(req,res)=>{
  try{
    const tasks=await TaskModel.find({createdBy:req.user.id});
    res.status(200).json({message:"Tasks fetched",payload:tasks});
  } 
  catch(err){
    res.status(500).json({message:"Failed to fetch tasks",error:err.message});
  }
});

taskApp.put("/tasks/:id",verifyToken,async(req,res)=>{
  try{
    const task=await TaskModel.findById(req.params.id);
    if(!task){
      return res.status(404).json({message:"Task not found"});
    }
    if(task.createdBy.toString()!==req.user.id) {
      return res.status(403).json({message:"Unauthorized"});
    }
    const updatedTask=await TaskModel.findByIdAndUpdate(req.params.id,req.body,{new:true});
    res.status(200).json({message:"Task updated",payload:updatedTask,});
  } catch(err){
    res.status(500).json({message:"Task update failed",error:err.message});
  }
});

taskApp.delete("/tasks/:id",verifyToken,async(req,res)=>{
  try{
    const task=await TaskModel.findById(req.params.id);
    if(!task){
      return res.status(404).json({message:"Task not found"});
    }
    if(task.createdBy.toString()!==req.user.id) {
      return res.status(403).json({message:"Unauthorized"});
    }
    await TaskModel.findByIdAndDelete(req.params.id);
    res.status(200).json({message:"Task deleted"});
  } 
  catch(err){
    res.status(500).json({message:"Task deletion failed",error:err.message});
  }
});