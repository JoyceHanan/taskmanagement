import mongoose from "mongoose";
const taskSchema = new mongoose.Schema(
  {
    title:{
      type:String,
      required:true,
      trim:true,
    },
    description:{
      type:String,
      trim:true,
    },
    status:{
      type:String,
      enum:["pending","completed"],
      default:"pending",
    },
      priority:{
      type:String,
      enum:["low", "medium", "high"],
      default:"medium",
    },
    createdBy:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
    },
  },
  {
    timestamps:true,
    versionKey:false,
    strict:"throw"
  }
);

export const TaskModel=mongoose.model("task",taskSchema);