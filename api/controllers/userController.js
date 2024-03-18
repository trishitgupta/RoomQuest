import User from "../models/User.js";

export const updateUser = async (req,res,next)=>{
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
}



export const deleteUser = async (req,res,next)=>{
  try {
   
    const user = await User.findById(req.params.id);
    console.log(user)
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract S3 URLs from the user document
    const imageUrls = user.img; // Change 'img' to the actual field name in your schema

    console.log(imageUrls)

    // Delete each S3 object associated with the user
    deleteFromS3(imageUrls);
    console.log("after delete");







     await User.findByIdAndDelete(req.params.id);
     res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
};




export const getUser = async (req,res,next)=>{
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
export const getUsers = async (req,res,next)=>{
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}


import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

 
const deleteFromS3 = async (imageUrl) => {
  try {
   

    console.log(imageUrl);

    const s3Client = new S3Client({
      region: "ap-south-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    const bucketName = process.env.BUCKET_NAME;

    const key = imageUrl.split('/').pop();

    // Prepare the delete command
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // Delete the object from S3
    await s3Client.send(deleteCommand);

    console.log('Image deleted from S3:', imageUrl);
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    
  }
};