import Testimonial from "../models/Testimonial.js";

export const getTestimonials = async (req, res) => {

     try {

          const testimonials = await Testimonial.find().sort({ createdAt: -1 });

          res.json(testimonials);

     } catch (error) {

          res.status(500).json({ error: error.message });

     }

};


export const createTestimonial = async (req, res) => {

     try {

          const { quote, name, role ,title} = req.body;

          const avatar = req.file?.path || "";

          const testimonial = new Testimonial({
               avatar,
               quote,
               name,
               role,
               title
          });

          await testimonial.save();

          res.json(testimonial);

     } catch (error) {

          res.status(500).json({ error: error.message });

     }

};


export const updateTestimonial = async (req, res) => {

     try {

          const { id } = req.params;

          const updateData = {
               quote: req.body.quote,
               name: req.body.name,
               role: req.body.role,
               title: req.body.title
          };

          if (req.file) {

               updateData.avatar = req.file.path;

          }

          const testimonial = await Testimonial.findByIdAndUpdate(
               id,
               updateData,
               { new: true }
          );

          res.json(testimonial);

     } catch (error) {

          res.status(500).json({ error: error.message });

     }

};


export const deleteTestimonial = async (req, res) => {

     try {

          await Testimonial.findByIdAndDelete(req.params.id);

          res.json({ message: "Deleted" });

     } catch (error) {

          res.status(500).json({ error: error.message });

     }

};