const AiPsychic = require("../models/aiPsychic");
const ChatMessage = require("../models/chatMessage"); // adjust path if needed


// Add AI Psychic
const addAiPsychic = async (req, res) => {
  try {
    const { name, type, image, bio, systemPrompt, rate, abilities } = req.body;

    const newPsychic = new AiPsychic({
      name,
      type,
      image,
      bio ,
      systemPrompt,
      rate,
      abilities: Array.isArray(abilities)
        ? abilities
        : abilities.split(",").map((a) => a.trim()).filter((a) => a),
    });

    await newPsychic.save();
    res.status(201).json({ success: true, data: newPsychic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get all AI Psychics
const getAllAiPsychics = async (req, res) => {
  try {
    const psychics = await AiPsychic.find();
    res.status(200).json({ success: true, data: psychics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single AI Psychic by ID
const getAiPsychicById = async (req, res) => {
  try {
    const psychic = await AiPsychic.findById(req.params.id);
    if (!psychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }
    res.status(200).json({ success: true, data: psychic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get available categories
const getPsychicCategories = async (req, res) => {
     const categories = await AiPsychic.distinct("type");

  try {
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


const getAiPsychicsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Find all unique psychicIds from chat history for the user
    const chats = await ChatMessage.find({ userId }).select("psychicId");

    const psychicIds = [...new Set(chats.map(chat => chat.psychicId.toString()))];

    if (psychicIds.length === 0) {
      return res.status(200).json({ success: true, data: [] }); // no chats yet
    }

    // Step 2: Get AI Psychics by those IDs
    const psychics = await AiPsychic.find({ _id: { $in: psychicIds } });

    res.status(200).json({ success: true, data: psychics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// controllers/aiPsychicController.js
const updateAiPsychic = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert abilities string to array if needed
    if (updateData.abilities && typeof updateData.abilities === 'string') {
      updateData.abilities = updateData.abilities
        .split(',')
        .map(a => a.trim())
        .filter(a => a);
    }

    const updatedPsychic = await AiPsychic.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedPsychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }

    res.status(200).json({ success: true, data: updatedPsychic });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete AI Psychic by ID
const deleteAiPsychic = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPsychic = await AiPsychic.findByIdAndDelete(id);

    if (!deletedPsychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }

    res.status(200).json({ success: true, message: "Psychic deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAiPsychicsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!type) {
      return res.status(400).json({ success: false, message: "Type is required" });
    }

    const psychics = await AiPsychic.find({ type: { $regex: new RegExp(type, "i") } });

    if (!psychics || psychics.length === 0) {
      return res.status(404).json({ success: false, message: "No psychics found for this type" });
    }

    res.status(200).json({ success: true, data: psychics });
  } catch (error) {
    console.error("getAiPsychicsByType error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = {
  addAiPsychic,
  getAllAiPsychics,
  getAiPsychicById,
  getPsychicCategories,
  getAiPsychicsByUserId,
  updateAiPsychic, 
  deleteAiPsychic,
  getAiPsychicsByType
};
