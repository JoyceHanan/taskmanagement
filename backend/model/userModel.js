import { Schema,model } from "mongoose";
const userSchema=new Schema({
    username:{
        type:String,
        required:[true,"First Name is required"]
    },
    email:{
      type:String,
      required:[true,"email required"],
      unique:[true,"Email Already Registered"]
    },
    password:{
        type:String,
        required:[true,"password is required"]
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        required:[true,"{Value} invalid"],
        default:"USER"
    },
     refreshToken:{
      type:String
}},
{
    timestamps:true,
    versionKey:false, 
    strict:"throw"
});

export const UserModel=model("user",userSchema)