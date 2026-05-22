import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
     pageSlug: {
          type: String,
          required: true,
          unique: true
     },
     title: {
          type: String,
          trim: true
     },
     description: {
          type: String,
          trim: true
     },
     keywords: {
          type: String,
          trim: true
     },
     faq: [
          {
               ques: String,
               ans: String,
          }
     ]
}, { timestamps: true });

const Faq = mongoose.model("FAQ", faqSchema);
export default Faq;