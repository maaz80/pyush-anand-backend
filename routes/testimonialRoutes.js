import express from "express";
import upload from "../middleware/multer.js";

import {
     getTestimonials,
     createTestimonial,
     updateTestimonial,
     deleteTestimonial
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/testimonials", getTestimonials);

router.post("/testimonials", upload.single("avatar"), createTestimonial);

router.put("/testimonials/:id", upload.single("avatar"), updateTestimonial);

router.delete("/testimonials/:id", deleteTestimonial);

export default router;