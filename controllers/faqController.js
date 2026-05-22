import Faq from "../models/Faq.js";
import mongoose from "mongoose";

// Get data for a specific page
export const getFaq = async (req, res) => {
     try {
          const { pageId } = req.params;

          const data = await Faq.findOne({ pageSlug: pageId });

          if (!data) {
               return res.json({ title: "", description: "", keywords: "", faq: [] });
          }

          res.json(data);
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
};

// Create or Update data for a specific page
export const updateFaq = async (req, res) => {
     try {
          const { pageId } = req.params;
          const { title, description, keywords, faq } = req.body;

          let data = await Faq.findOne({ pageSlug: pageId });

          if (data) {
               data.title = title;
               data.description = description;
               data.keywords = keywords;
               data.faq = faq;
               await data.save();
          } else {
               data = await Faq.create({
                    pageSlug: pageId,
                    title,
                    description,
                    keywords,
                    faq
               });
          }

          res.json(data);
     } catch (err) {
          res.status(500).json({ error: err.message });
     }
};