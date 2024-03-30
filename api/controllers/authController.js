import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const testing=async(req,res,next)=>{
  try {
    // Sample logic to test
    const result = 2 + 2;

    // Send the result as a response
    res.status(200).json({ result });
  } catch (error) {
    // Handle errors
    next(error);
  }
}

export const register=async(req,res,next)=>{
    console.log("Inside register");
    try{
        const salt=bcrypt.genSaltSync(10);
        const hash=bcrypt.hashSync(req.body.password,salt);

        const newUser= new User({
            ...req.body,
            password:hash,
           // isAdmin:false
            
        });

        console.log("New user created", newUser);

        await newUser.save()
        console.log("user sav")
        res.status(200).send("User has been created")

    }catch(err){
        next(err);

    }
 
}


export const login=async(req,res,next)=>{
    try{
        const user= await User.findOne({username:req.body.username})
        // console.log(user);
        if(!user) return next(createError(404,"User not found"))

        const isPasswordCorrect= await bcrypt.compare(req.body.password,user.password);
        console.log(isPasswordCorrect)

        if(!isPasswordCorrect) return next(createError(400,"bad req-wrong password/username"));

        const token=jwt.sign({id:user._id,isAdmin:user.isAdmin},process.env.JWT);

        console.log(token);
        


        const{password,isAdmin, ...otherDetails}=user._doc;


        res.cookie("access_token",token,{
            httpOnly:true,
        }).status(200).json({details:{...otherDetails},isAdmin})

    }catch(err){
        next(err);

    }

};

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import uniqid from "uniqid";

export const uploads3=async(req,res,next)=>{

    try {
        const file = req.file;
     
        if (!file) {
          throw new Error("File not found");
        }
     
        const s3Client = new S3Client({
          region: "ap-south-1",
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          },
        });
     
        const randomId = uniqid();
        const ext = file.originalname.split('.').pop();
        const newFilename = randomId + '.' + ext;
        const bucketName = process.env.BUCKET_NAME;
     
        const result = await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: newFilename,
          ACL: 'public-read',
          Body: file.buffer, // Use req.file.buffer to upload the file
          ContentType: file.mimetype,
        }));
     
        const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
     
        return res.status(200).json({link});
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    
     
};



