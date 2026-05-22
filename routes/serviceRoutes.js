import express from "express";
import upload from "../middleware/multer.js";

import {
  getServices,
  getServiceById,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  addItem,
  getItem,
  updateItem,
  deleteItem
} from "../controllers/serviceController.js";

const router = express.Router();


// ===== SERVICE =====
router.get("/services", getServices);
router.get("/services/slug/:slug", getServiceBySlug);
router.get("/services/:id", getServiceById);
router.post("/services", upload.single("image"), createService);
router.put("/services/:id", upload.single("image"), updateService);
router.delete("/services/:id", deleteService);
router.put("/services/slug/:slug", upload.single("image"), updateService);
router.delete("/services/slug/:slug", deleteService);


// ===== ITEMS (IMPORTANT) =====
router.post("/services/:serviceId/items", upload.any(), addItem);
router.get("/services/:serviceId/items/:itemId", getItem);
router.put("/services/:serviceId/items/:itemId", upload.any(), updateItem);
router.delete("/services/:serviceId/items/:itemId", deleteItem);
router.post("/services/slug/:serviceId/items", upload.any(), addItem);
router.get("/services/slug/:serviceId/items/:itemId", getItem);
router.put("/services/slug/:serviceId/items/:itemId", upload.any(), updateItem);
router.delete("/services/slug/:serviceId/items/:itemId", deleteItem);


export default router;
