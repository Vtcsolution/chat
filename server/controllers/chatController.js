const { OpenAI } = require("openai");
const axios = require("axios");
const ChatMessage = require("../models/chatMessage");
const AiPsychic = require("../models/aiPsychic");
const AiFormData = require("../models/aiFormData");
const { getRequiredFieldsByType } = require("../utils/formLogic");
const qs = require("querystring");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const getProkeralaAccessToken = async () => {
  const response = await axios.post(
    "https://api.prokerala.com/token",
    qs.stringify({
      grant_type: "client_credentials",
      client_id: process.env.PROKERALA_CLIENT_ID,
      client_secret: process.env.PROKERALA_CLIENT_SECRET,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

// In your getVedicAstrologyData function
const getVedicAstrologyData = async (formData) => {
  try {
    if (!formData.latitude || !formData.longitude) {
      throw new Error("Missing coordinates");
    }

const timeParts = formData.birthTime.split(":");
const birthTime = [
  timeParts[0]?.padStart(2, "0") || "00",
  timeParts[1]?.padStart(2, "0") || "00",
  timeParts[2]?.padStart(2, "0") || "00"
].join(":");
const datetime = `${formData.birthDate}T${birthTime}+05:00`; // Use cleaned value
console.log("🔍 DateTime sent:", datetime);
console.log("📍 Coordinates:", formData.latitude, formData.longitude);
    const token = await getProkeralaAccessToken();
   const response = await axios.get("https://api.prokerala.com/v2/astrology/kundli", {
  headers: { Authorization: `Bearer ${token}` },
  params: {
    ayanamsa: 1,
    coordinates: `${formData.latitude},${formData.longitude}`,
    datetime,
  },
});

console.log("📦 Full API Response:", response.data);


const { nakshatra_details } = response.data?.data || {};
if (!nakshatra_details) {
  throw new Error("Incomplete astrology data received.");
}

const moonSign = nakshatra_details.chandra_rasi?.name || "N/A";
const sunSign = nakshatra_details.soorya_rasi?.name || "N/A";
const ascendantSign = nakshatra_details.zodiac?.name || "N/A";
const nakshatraName = nakshatra_details.nakshatra?.name || "N/A";

return `
🌙 Moon Sign: ${moonSign}
☀️ Sun Sign: ${sunSign}
🔺 Ascendant: ${ascendantSign}
✴️ Nakshatra: ${nakshatraName}
`;

  } catch (error) {
    console.error("🔻 Astrology Fallback:", error.message);
    return "⚠️ Could not fetch astrology details. Please double-check your birth time and place.";
  }
};



// Main controller
const chatWithPsychic = async (req, res) => {
  try {
    const userId = req.user._id;
    const { message } = req.body;
    const psychicId = req.params.psychicId;

    if (!psychicId || !message) {
      return res.status(400).json({ success: false, message: "Missing fields required" });
    }

    const psychic = await AiPsychic.findById(psychicId);
    if (!psychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }

    const unrelatedKeywords = ['location', 'where is', 'how to go', 'flight', 'visa', 'travel', 'airport', 'usa to', 'lahore'];
    const isUnrelated = unrelatedKeywords.some(keyword =>
      message.toLowerCase().includes(keyword)
    );
    if (isUnrelated) {
      return res.status(400).json({
        success: false,
        message: "I'm guided to focus only on matters of the heart and soul. Let’s explore the energy of your relationships or emotional path.",
      });
    }

    const { type, systemPrompt } = psychic;
    const requiredFields = getRequiredFieldsByType(type);

    let form = null;
    if (requiredFields.length > 0) {
      form = await AiFormData.findOne({ userId, type });
      if (!form || !form.formData) {
        return res.status(400).json({
          success: false,
          message: `Please submit the required form for ${type} before chatting.`,
        });
      }

      const missingFields = requiredFields.filter(
        (f) => !form.formData[f] || form.formData[f] === ""
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }
    }

    let chat = await ChatMessage.findOne({ userId, psychicId });
    if (!chat) {
      chat = new ChatMessage({ userId, psychicId, messages: [] });
    }

    chat.messages.push({ sender: "user", text: message });
    await chat.save();

    const chatHistory = chat.messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

    const f = form?.formData || {};

    // 🟡 Get astrology context if applicable
    let astrologyContext = "";
if (type === "Astrology") {
  try {
    astrologyContext = await getVedicAstrologyData(f);

    // ✅ DO NOT SAVE SYSTEM MESSAGE TO DB
    chatHistory.unshift({
      role: "system",
      content: `User birth data astrology report:\n${astrologyContext}`
    });

  } catch (err) {
    console.error("❌ Astrology API Error:", err.message);
    astrologyContext = "⚠️ Could not fetch astrology details.";
  }
}


    // 🟢 Final system message to AI
let userDetailsSection = "";

if (type === "Love") {
  userDetailsSection = `
User:
- Name: ${f.yourName}
- Birth Date: ${f.yourBirthDate}
- Birth Time: ${f.yourBirthTime || "N/A"}
- Birth Place: ${f.yourBirthPlace || "N/A"}

Partner:
- Name: ${f.partnerName}
- Birth Date: ${f.partnerBirthDate}
- Birth Time: ${f.partnerBirthTime || "N/A"}
- Birth Place: ${f.partnerPlaceOfBirth || "N/A"}
`.trim();
} else if (type === "Numerology") {
  userDetailsSection = `
Numerology Profile:
- Name: ${f.yourName}
- Birth Date: ${f.birthDate}
`.trim();
} else if (type === "Tarot") {
  userDetailsSection = `The user is seeking spiritual tarot guidance. No form data required.`;
} else {
  userDetailsSection = `
- Name: ${f.yourName || f.fullName}
- Birth Date: ${f.birthDate}
- Birth Time: ${f.birthTime}
- Birth Place: ${f.birthPlace}
`;
}

const systemContent = `
${systemPrompt}

User Form Data:
${userDetailsSection}

${type === "Astrology" ? `Astrology Info:\n${astrologyContext}` : ""}
`.trim();


    const messagesForAI = [
      { role: "system", content: systemContent },
      ...chatHistory,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messagesForAI,
    });

    const aiReply = completion.choices[0].message.content;

    chat.messages.push({ sender: "ai", text: aiReply });
    await chat.save();

    return res.status(200).json({
      success: true,
      reply: aiReply,
      messages: chat.messages,
    });

  } catch (error) {
    console.error("❌ Chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { psychicId } = req.params;

    // ✅ 1. Find psychic and its type
    const psychic = await AiPsychic.findById(psychicId);
    if (!psychic) {
      return res.status(404).json({ success: false, message: "Psychic not found" });
    }

    const { type } = psychic;

    // ✅ 2. Get required fields for that type
    const requiredFields = getRequiredFieldsByType(type);

    // ✅ 3. If form is required, fetch it by userId and type
    let formData = null;
    if (requiredFields.length > 0) {
      const form = await AiFormData.findOne({ userId, type });
      if (form?.formData) {
        formData = {};
        requiredFields.forEach((field) => {
          formData[field] = form.formData[field] || "N/A";
        });
      }
    }

    // ✅ 4. Get chat history
    const chat = await ChatMessage.findOne({ userId, psychicId });

    return res.status(200).json({
      success: true,
      messages: chat?.messages.map(msg => ({
        ...msg.toObject(),
        id: msg._id,
        createdAt: msg.createdAt || new Date(),
      })) || [],
      formData: formData || null, // include form data if present
      psychicType: type,
    });

  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// controllers/chatController.js
const getAllUserChats = async (req, res) => {
  try {
    const chats = await ChatMessage.find()
      .populate("userId", "username image")       // Populate user fields
      .populate("psychicId", "name image")        // Populate advisor fields
      .sort({ createdAt: -1 });

    const formatted = chats.map(chat => ({
      id: chat._id,
      user: chat.userId,
      advisor: chat.psychicId,
      credits: Math.floor(Math.random() * 200 + 20), // Dummy credits for now
      createdAt: chat.createdAt
    }));

    res.status(200).json({ success: true, chats: formatted });
  } catch (error) {
    console.error("❌ getAllUserChats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chats" });
  }
};
const getChatMessagesById = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    const chat = await ChatMessage.findById(chatId)
      .populate("userId", "username image")
      .populate("psychicId", "name image");

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({
      success: true,
      chat: {
        id: chat._id,
        user: {
          id: chat.userId._id,
          username: chat.userId.username,
          image: chat.userId.image,
        },
        advisor: {
          id: chat.psychicId._id,
          name: chat.psychicId.name,
          image: chat.psychicId.image,
        },
        messages: chat.messages.map(msg => ({
          id: msg._id,
          sender: msg.sender, // 'user' or 'ai'
          text: msg.text,
          timestamp: msg.timestamp,
        })),
      },
    });
  } catch (error) {
    console.error("❌ getChatMessagesById error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  chatWithPsychic,
  getAllUserChats,
  getChatHistory,
  getChatMessagesById
};