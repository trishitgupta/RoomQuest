import express from "express";
import { register } from "../controllers/authController.js";
import { login } from "../controllers/authController.js";
import {uploads3} from "../controllers/authController.js";

import multer from "multer";

const router=express.Router();

const storage = multer.memoryStorage({});
 
const upload = multer({
  storage: storage
})
 

router.post("/register",register);
router.post("/login",login);
router.post("/upload",upload.single('file'),uploads3);


export default router;