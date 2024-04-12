import express from 'express';
import dotenv from "dotenv";
import mongoose  from 'mongoose';
import authRoute from "./routes/auth.js"
import usersRoute from "./routes/users.js"
import hotelsRoute from "./routes/hotels.js"
import roomsRoute from "./routes/rooms.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import stripeRoute from "./routes/stripe.js";
import webhookRoute from "./routes/webhook.js";
import path from "path";
import { GetBucketLifecycleConfigurationCommand } from '@aws-sdk/client-s3';

 const app=express();
dotenv.config()

const connect=async()=>{

    try {
        await mongoose.connect('mongodb+srv://trishitg123:trishitg123@cluster0.9gwsazl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log("connected to MONGODB")
      } catch (error) {
    throw error
      }
};

// mongoose.connection.on("disconnected",()=>{
//     console.log("mongodb disconnected!!")
// })

// mongoose.connection.on("connected",()=>{
//     console.log("mongodb connected!!")
// })



//middleware
app.use(cookieParser());
app.use(express.json());

 const _dirname=path.dirname("")
// const buildpath=path.join(_dirname,"../frontend/build")
// // app.use(express.static(buildpath));
app.use(cors());
// Allow requests from a specific origin
 app.use(cors({ origin: 'http://13.234.225.74:3000' }));

app.use("/api/auth",authRoute);
app.use("/api/users",usersRoute);
app.use("/api/rooms",roomsRoute);
app.use("/api/hotels",hotelsRoute);
app.use("/api/stripe",stripeRoute)
app.use("api/webhook",webhookRoute);

app.use(express.static(path.join(__dirname, '/frontend/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
})

app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";
    return res.status(errorStatus).json({
      success: false,
      status: errorStatus,
      message: errorMessage,
      stack: err.stack,
    });
  });


app.listen(8800,()=>{
    connect();
    console.log("connected to backend.")
})


export default app;

