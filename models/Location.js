import mongoose from "mongoose";

const heroSchema = new mongoose.Schema({
  title: String,
  description: String,
}, { _id: false });

const itemSchema = new mongoose.Schema({
  title: String,
  slug: String,
  seoTitle: String,
  keywords: mongoose.Schema.Types.Mixed,
  date: String,
  image: String,
  content: String,

  hero: heroSchema,

}, { _id: true });

const locationSchema = new mongoose.Schema({
  title: String,
  slug: {
    type: String,
    unique: true,
    sparse: true
  },

  items: [itemSchema]

}, { timestamps: true });

export default mongoose.model("Location", locationSchema);
