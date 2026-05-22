import express from "express";
import upload from "../middleware/multer.js";
import { getHome, saveHome } from "../controllers/homeController.js";

const router = express.Router();

router.get("/home", getHome);
router.put("/home", upload.any(), saveHome);

export default router;
