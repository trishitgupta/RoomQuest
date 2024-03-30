import express from "express";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";
import { countByCity, countByType, createHotel, deleteHotel, getHotel, getHotelRoom, getHotels, updateHotel } from "../controllers/hotelController.js";
import{verifyAdmin} from "../utils/verifyToken.js";
import { uploads3 } from "../controllers/hotelController.js";


import multer from "multer";
const storage = multer.memoryStorage({});
 
const upload = multer({
  storage: storage
})


const router=express.Router();
//create
router.post("/",verifyAdmin,createHotel);

//update
router.put("/:id",verifyAdmin,updateHotel);

    //delete
    router.delete("/:id",deleteHotel);

    //get
    router.get("/find/:id",getHotel);

    //all get
    router.get("/",getHotels);

    router.get("/countByCity",countByCity);

    router.get("/countByType",countByType);

    router.get("/room/:id",getHotelRoom);


    router.post("/upload",upload.array('files',6),uploads3);

    // router.post("/allHotels",getAllHotelsForTable)


    

    



export default router