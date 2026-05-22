import Service from "../models/Service.js";
import mongoose from "mongoose";

const slugifyText = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  || "item";

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const resolveServiceQuery = (serviceIdentifier) => (
  isObjectId(serviceIdentifier)
    ? { _id: serviceIdentifier }
    : { slug: serviceIdentifier }
);

const buildSlugRegex = (baseSlug) => new RegExp(`^${baseSlug}(?:_\\d+)?$`);

const makeUniqueFromSet = (baseSlug, existingSlugs) => {
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let counter = 2;
  let nextSlug = `${baseSlug}_${counter}`;
  while (existingSlugs.has(nextSlug)) {
    counter += 1;
    nextSlug = `${baseSlug}_${counter}`;
  }
  return nextSlug;
};

const generateUniqueServiceSlug = async (title, excludeId = null) => {
  const baseSlug = slugifyText(title || "service");
  const slugRegex = buildSlugRegex(baseSlug);
  const existing = await Service.find({ slug: slugRegex }).select("slug");

  const existingSlugs = new Set(
    existing
      .filter((doc) => !excludeId || String(doc._id) !== String(excludeId))
      .map((doc) => doc.slug)
  );

  return makeUniqueFromSet(baseSlug, existingSlugs);
};

const ensureServiceSlugAvailable = async (slug, excludeId = null) => {
  const existing = await Service.findOne({ slug }).select("_id");
  if (existing && (!excludeId || String(existing._id) !== String(excludeId))) {
    const error = new Error("Service slug already exists");
    error.statusCode = 400;
    throw error;
  }
};

const generateUniqueItemSlug = (serviceDoc, title, excludeItemId = null) => {
  const baseSlug = slugifyText(title || "item");
  const existingSlugs = new Set(
    (serviceDoc.items || [])
      .filter((item) => !excludeItemId || String(item._id) !== String(excludeItemId))
      .map((item) => item.slug)
      .filter(Boolean)
  );

  return makeUniqueFromSet(baseSlug, existingSlugs);
};

const ensureItemSlugAvailable = (serviceDoc, slug, excludeItemId = null) => {
  const duplicate = (serviceDoc.items || []).some((item) => (
    item.slug === slug && (!excludeItemId || String(item._id) !== String(excludeItemId))
  ));

  if (duplicate) {
    const error = new Error("Item slug already exists in this service");
    error.statusCode = 400;
    throw error;
  }
};

const cleanServicePayload = (payload = {}) => {
  const cleaned = {};

  if (payload.title !== undefined) cleaned.title = payload.title;
  if (payload.slug?.trim()) cleaned.slug = payload.slug;

  return cleaned;
};

const normalizeKeywords = (value) => {
  if (Array.isArray(value)) {
    return value.map((keyword) => String(keyword)).join(", ");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
};

const findItemIndex = (serviceDoc, itemIdentifier) => (
  (serviceDoc.items || []).findIndex((item) => (
    String(item._id) === String(itemIdentifier) || item.slug === itemIdentifier
  ))
);

const ensureSlugsForService = async (serviceDoc) => {
  let changed = false;

  if (!serviceDoc.slug) {
    serviceDoc.slug = await generateUniqueServiceSlug(serviceDoc.title, serviceDoc._id);
    changed = true;
  }

  const existingItemSlugs = new Set();
  (serviceDoc.items || []).forEach((item) => {
    if (Array.isArray(item.keywords)) {
      item.keywords = normalizeKeywords(item.keywords);
      changed = true;
    }

    if (!item.slug || existingItemSlugs.has(item.slug)) {
      item.slug = makeUniqueFromSet(slugifyText(item.seoTitle || item.title || "item"), existingItemSlugs);
      changed = true;
    }
    existingItemSlugs.add(item.slug);
  });

  if (changed) {
    await serviceDoc.save();
  }

  return serviceDoc;
};


// ================= GET ALL SERVICES =================
export const getServices = async (req, res) => {
  try {
    const data = await Service.find()
      .select('title slug items')
      .sort({ createdAt: -1 })
      .lean();

    res.set('Cache-Control', 'public, max-age=60');
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// ================= GET SINGLE SERVICE =================
export const getServiceById = async (req, res) => {
  try {
    const data = await Service.findOne(resolveServiceQuery(req.params.id));
    if (!data) {
      return res.status(404).json({ error: "Service not found" });
    }
    await ensureSlugsForService(data);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getServiceBySlug = async (req, res) => {
  try {
    const data = await Service.findOne({ slug: req.params.slug });
    if (!data) {
      return res.status(404).json({ error: "Service not found" });
    }
    await ensureSlugsForService(data);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// ================= CREATE SERVICE =================
export const createService = async (req, res) => {
  try {
    const parsed = cleanServicePayload(JSON.parse(req.body.data || "{}"));
    if (parsed.slug) {
      parsed.slug = slugifyText(parsed.slug);
      await ensureServiceSlugAvailable(parsed.slug);
    } else {
      parsed.slug = await generateUniqueServiceSlug(parsed.title);
    }

    const service = new Service(parsed);
    await service.save();

    res.status(201).json(service);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// ================= UPDATE SERVICE =================
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = cleanServicePayload(JSON.parse(req.body.data || "{}"));
    const existing = await Service.findOne(resolveServiceQuery(id));

    if (!existing) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (parsed.slug) {
      parsed.slug = slugifyText(parsed.slug);
    } else if (!existing.slug || (parsed.title && parsed.title !== existing.title)) {
      parsed.slug = await generateUniqueServiceSlug(parsed.title, existing._id);
    }

    const updated = await Service.findByIdAndUpdate(
      existing._id,
      { $set: parsed },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// ================= DELETE SERVICE =================
export const deleteService = async (req, res) => {
  try {
    const existing = await Service.findOne(resolveServiceQuery(req.params.id));
    if (!existing) {
      return res.status(404).json({ error: "Service not found" });
    }
    await Service.findByIdAndDelete(existing._id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// ================= ADD ITEM =================
export const addItem = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const item = JSON.parse(req.body.data || "{}");
    const imageFile = (req.files || []).find((file) => file.fieldname === "image");

    if (imageFile) {
      item.image = imageFile.path;
    }

    item.keywords = normalizeKeywords(item.keywords);
    const service = await Service.findOne(resolveServiceQuery(serviceId));
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    if (item.slug) {
      item.slug = slugifyText(item.slug);
      ensureItemSlugAvailable(service, item.slug);
    } else {
      const slugSource = item.seoTitle?.trim() ? item.seoTitle : item.title;
      item.slug = generateUniqueItemSlug(service, slugSource || "item");
    }

    service.items.push(item);
    await service.save();

    res.json(service);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getItem = async (req, res) => {
  try {
    const { serviceId, itemId } = req.params;
    const service = await Service.findOne(resolveServiceQuery(serviceId));
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    await ensureSlugsForService(service);
    const itemIndex = findItemIndex(service, itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(service.items[itemIndex]);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// ================= UPDATE ITEM =================
export const updateItem = async (req, res) => {
  try {
    const { serviceId, itemId } = req.params;

    const parsed = JSON.parse(req.body.data || "{}");
    const files = (req.files || []).filter((file) => file.fieldname === "serviceImages");
    const imageFile = (req.files || []).find((file) => file.fieldname === "image");
    const indexes = req.body.serviceImageIndex || [];
    const indexArray = Array.isArray(indexes) ? indexes : [indexes];

    const service = await Service.findOne(resolveServiceQuery(serviceId));
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const itemIndex = findItemIndex(service, itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    const currentItem = service.items[itemIndex];

    if (imageFile) {
      parsed.image = imageFile.path;
    }

    const mergedItem = {
      ...currentItem.toObject(),
      ...parsed,
      _id: currentItem._id,
    };

    if (parsed.keywords !== undefined) {
      mergedItem.keywords = normalizeKeywords(parsed.keywords);
    }

    if (parsed.slug?.trim()) {
      mergedItem.slug = slugifyText(parsed.slug);
      ensureItemSlugAvailable(service, mergedItem.slug, currentItem._id);
    } else {
      mergedItem.slug = currentItem.slug;
    }

    service.items[itemIndex] = mergedItem;
    await service.save();

    res.json(service);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// ================= DELETE ITEM =================
export const deleteItem = async (req, res) => {
  try {
    const { serviceId, itemId } = req.params;
    const service = await Service.findOne(resolveServiceQuery(serviceId));

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const itemIndex = findItemIndex(service, itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    service.items.splice(itemIndex, 1);
    await service.save();

    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
