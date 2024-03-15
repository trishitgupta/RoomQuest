import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

export const createHotel = async (req, res, next) => {
  const newHotel = new Hotel(req.body);

  try {
    const savedHotel = await newHotel.save();
    res.status(200).json(savedHotel);
  } catch (err) {
    next(err);
  }
};

export const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};

export const deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json("Hotel has been deleted");
  } catch (err) {
    next(err);
  }
};

export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};

//get all hotels

// export const getHotels = async (req, res, next) => {
//   const { limit, min, max, others } = req.query;

//   const limitValue = parseInt(limit, 10);
//   const conditions = {
//     ...others,
//     cheapestPrice: { $gt: min | 1, $lt: max || 999 },
//   };

//   console.log("conditions: ", conditions);
//   console.log("limitValue: ", limitValue);
//   try {
//     const hotels = await Hotel.find(conditions).limit(limitValue ?? 9999999);

    

//     res.status(200).json(hotels);
//   } catch (err) {
//     next(err);
//   }
// };


export const getHotels = async (req, res, next) => {
  const { limit, min, max, ...others } = req.query;

  const limitValue = parseInt(limit, 10);
  let conditions = {};

  if (Object.keys(others).length > 0) {
    conditions = {
      ...others,
      cheapestPrice: { $gt: min | 1, $lt: max || 999 },
    };
  }

  try {
    let query = Hotel.find(conditions);
    
    if (limitValue) {
      query = query.limit(limitValue);
    }

    const hotels = await query.exec();

    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};


export const countByCity = async (req, res, next) => {
  const cities = req.query.cities.split(",");
  const list = await Promise.all(
    cities.map((city) => {
      return Hotel.countDocuments({ city: city });
    })
  );
  try {
    const hotels = await Hotel.find();
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });

    res.status(200).json([
      { type: "hotel", count: hotelCount },
      { type: "apartments", count: apartmentCount },
      { type: "resorts", count: resortCount },
      { type: "villas", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

export const getHotelRoom = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    const list = await Promise.all(
      hotel.rooms.map((room) => {
        return Room.findById(room);
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import uniqid from "uniqid";

export const uploads3 = async (req, res, next) => {
  try {
    const files = req.files; // Access array of files using req.files

    if (!files || files.length === 0) {
      throw new Error("No files uploaded");
    }

    const s3Client = new S3Client({
      region: "ap-south-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    const uploadedFiles = [];

    for (const file of files) {
      const randomId = uniqid();
      const ext = file.originalname.split(".").pop();
      const newFilename = randomId + "." + ext;
      const bucketName = process.env.BUCKET_NAME;

      const result = await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: newFilename,
          ACL: "public-read",
          Body: file.buffer, // Use file.buffer to upload the file
          ContentType: file.mimetype,
        })
      );

      const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`;
      uploadedFiles.push(link);
    }

    return res.status(200).json(uploadedFiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllHotelsForTable = async (req, res, next) => {
  try {
    const hotel = await Hotel.find();
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};