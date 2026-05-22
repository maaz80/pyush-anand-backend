import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({

     avatar: {
          type: String,
          required: true
     },

     quote: {
          type: String,
          required: true
     },

     name: {
          type: String,
          required: true
     },

     role: {
          type: String,
          required: true
     },
     title: {
          type: String,
          required: true
     }

}, { timestamps: true });

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;