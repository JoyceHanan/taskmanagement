import jwt from 'jsonwebtoken'
const {verify}=jwt
export function verifyToken (req,res,next){
   const token=req.cookies.token;

    if(!token){
        return res.status(401).json({message:"please login"})
    }
    try{         
   const decodedToken= verify(token,process.env.JWT_SECRET) 
   req.user = decodedToken
   next()
    }
    catch(err){
     res.status(401).json({message:"session expires re-login"})
    }
}