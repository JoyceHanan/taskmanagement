import exp from 'express'
import { connect } from 'mongoose'
import { config } from 'dotenv'
import { userApp } from './apis/userAPI.js'
import {taskApp} from './apis/taskAPI.js'
import { adminApp } from './apis/adminAPI.js'
import cookieParser from "cookie-parser"
import { UserModel } from './model/userModel.js'
import { hash } from 'bcrypt'
 import cors from 'cors'
config()
 const app=exp()
app.use(cors({
  origin: ['http://localhost:5174', 'https://taskmanagement-flame.vercel.app'],
  credentials: true,               
}))
 app.use(exp.json())
 app.use(cookieParser())

 app.use("/user-api",userApp)
 app.use("/task-api",taskApp)
app.use("/admin-api",adminApp)
app.get('/seed-admin', async (req, res) => {
  try {
    const existing = await UserModel.findOne({ email: 'admin@gmail.com' })
    if (existing) return res.json({ message: 'Admin already exists' })
    const hashed = await hash('admin123', 12)
    await new UserModel({
      username: 'admin',
      email: 'admin@gmail.com',
      password: '$2a$12$ZwQfJVeW1OAdxjf6oITxx.KucSLkqoFo4tApaMkKbZQaCtpj7y5Wy',
      role: 'admin',
    }).save()
    res.json({ message: 'Admin created successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
 const port=process.env.PORT||3300
 const connectionDb=async()=>{
    try{
        await connect(process.env.DB_URL);
        console.log("connected ");
        app.listen(port,()=>console.log(`server is started on ${port}`))
    }catch(err){
        console.log(err)
    }
 }
 connectionDb()
 app.use((req,res,next)=>{
    console.log(req.url);
    res.status(404).json({message:"invald path"})
})

//error handling
app.use((err,req,res,next)=>{
    //res.json({message:"error has occured",error:err.message}) this is very basic 
    console.log(err.name)
    console.log(err.message)
    
    //validation error
    if(err.name==='ValidationError'){
        return res.status(400).json({messsage:"the validations is failed "})
    }
     //casterror
      if(err.name==='CastError'){
        return res.status(400).json({messsage:"the validations is failed "})
    }
    //send server side errors
    res.status(500).json({message:"this is from server side"})
})
