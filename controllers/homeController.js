import Home from "../models/Home.js";

const emptyHome = {
  hero: { title: "", description: "" },
  whychooseus: { title: "", keyword: "", description: "", cards: [] },
  archive: { title: "", keyword: "", description: "", images: [] },
  expertise: { title: "", keyword: "", description: "", images: [] },
  impact: { title: "", keyword: "", cards: [] },
};

const normalizeHomePayload = (payload = {}) => ({
  hero: {
    title: payload.hero?.title || "",
    description: payload.hero?.description || "",
  },
  whychooseus: {
    title: payload.whychooseus?.title || "",
    keyword: payload.whychooseus?.keyword || "",
    description: payload.whychooseus?.description || "",
    cards: Array.isArray(payload.whychooseus?.cards) ? payload.whychooseus.cards : [],
  },
  archive: {
    title: payload.archive?.title || "",
    keyword: payload.archive?.keyword || "",
    description: payload.archive?.description || "",
    images: Array.isArray(payload.archive?.images) ? payload.archive.images : [],
  },
  expertise: {
    title: payload.expertise?.title || "",
    keyword: payload.expertise?.keyword || "",
    description: payload.expertise?.description || "",
    images: Array.isArray(payload.expertise?.images) ? payload.expertise.images : [],
  },
  impact: {
    title: payload.impact?.title || "",
    keyword: payload.impact?.keyword || "",
    cards: Array.isArray(payload.impact?.cards) ? payload.impact.cards : [],
  },
});

const applyIndexedFiles = (items = [], files = [], indexes = []) => {
  const indexArray = Array.isArray(indexes) ? indexes : [indexes];

  files.forEach((file, fileIndex) => {
    const itemIndex = Number(indexArray[fileIndex]);

    if (items[itemIndex]) {
      items[itemIndex].image = file.path;
    }
  });
};

export const getHome = async (req, res) => {
  try {
    const home = await Home.findOne().sort({ createdAt: -1 });
    res.json(home || emptyHome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveHome = async (req, res) => {
  try {
    const parsed = normalizeHomePayload(JSON.parse(req.body.data || "{}"));
    const files = req.files || [];

    applyIndexedFiles(
      parsed.archive.images,
      files.filter((file) => file.fieldname === "archiveImages"),
      req.body.archiveImageIndex || []
    );

    applyIndexedFiles(
      parsed.expertise.images,
      files.filter((file) => file.fieldname === "expertiseImages"),
      req.body.expertiseImageIndex || []
    );

    const existing = await Home.findOne().sort({ createdAt: -1 });

    const home = existing
      ? await Home.findByIdAndUpdate(existing._id, parsed, { new: true })
      : await Home.create(parsed);

    res.json(home);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
