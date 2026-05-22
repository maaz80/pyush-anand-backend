import mongoose from "mongoose";

const heroSchema = new mongoose.Schema({
  title: String,
  description: String,
}, { _id: false });

const textCardSchema = new mongoose.Schema({
  title: String,
  description: String,
}, { _id: true });

const archiveImageSchema = new mongoose.Schema({
  image: String,
}, { _id: true });

const expertiseImageSchema = new mongoose.Schema({
  image: String,
  boldtext: String,
  italictext: String,
}, { _id: true });

const whySchema = new mongoose.Schema({
  title: String,
  keyword: String,
  description: String,
  cards: [textCardSchema],
}, { _id: false });

const archiveSchema = new mongoose.Schema({
  title: String,
  keyword: String,
  description: String,
  images: [archiveImageSchema],
}, { _id: false });

const expertiseSchema = new mongoose.Schema({
  title: String,
  keyword: String,
  description: String,
  images: [expertiseImageSchema],
}, { _id: false });

const impactSchema = new mongoose.Schema({
  title: String,
  keyword: String,
  cards: [textCardSchema],
}, { _id: false });

const homeSchema = new mongoose.Schema({
  hero: heroSchema,
  whychooseus: whySchema,
  archive: archiveSchema,
  expertise: expertiseSchema,
  impact: impactSchema,
}, { timestamps: true });

export default mongoose.model("Home", homeSchema);
