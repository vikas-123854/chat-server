const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Firebase Admin Setup
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chat-app-7447f-default-rtdb.firebaseio.com"
});

const db = admin.database();

// 🧠 memory store
let users = {};

// 🚫 SAFE TEXT FILTER
function isSafeText(text) {
  if (!text) return true; // empty safe

  const badWords = [
    "sex","porn","xxx","fuck","bitch",
    "madarchod","bhenchod","gandu"
  ];

  text = text.toLowerCase();

  for (let word of badWords) {
    if (text.includes(word)) {
      return false;
    }
  }

  return true;
}
// 🎭 moods
const moods = ["sweet", "normal", "attitude"];

// 🧠 AI LOGIC
function getAIReply(msg, userId) {
  msg = msg.toLowerCase();

  // ❌ unsafe block
  if (!isSafeText(msg)) {
    return "❌ Not allowed";
  }

  // user memory
  if (!users[userId]) {
    users[userId] = {
      name: null,
      mood: moods[Math.floor(Math.random() * moods.length)]
    };
  }

  let user = users[userId];

  // 👤 name detect
  if (msg.includes("mera naam")) {
    let name = msg.split("mera naam")[1]?.trim();
    user.name = name || "friend";
    return `acha ${user.name} 🙂 nice name`;
  }

  // 👋 greetings
  if (msg.includes("hi") || msg.includes("hello")) {
    if (user.mood === "sweet") return "hii 🙂 kya kar rahe ho?";
    if (user.mood === "attitude") return "hmm bolo…";
    return "hey 🙂";
  }

  if (msg.includes("kya kar rahe ho")) {
    return "bas tumse baat kar rahi hu";
  }

  if (msg.includes("love")) {
    return "itni jaldi? 😄";
  }

  if (msg.includes("miss")) {
    return "acha 😌 kitna miss kiya?";
  }

  if (msg.includes("kaha ho") || msg.includes("tum kaha se ho")) {
    return "me indore se hu";
  }

  if (msg.includes("bye")) {
    return "bye 😊 jaldi aana phir";
  }

  // 👤 name based replies
  if (user.name) {
    const replies = [
      `hmm ${user.name} 🙂`,
      `acha ${user.name} 😄`,
      `tum interesting ho ${user.name} 😏`,
      `aur batao ${user.name}...`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // default replies
  const replies = [
    "hmm 🙂",
    "acha 😄",
    "phir?",
    "interesting 😏",
    "aur batao…",
  ];

  return replies[Math.floor(Math.random() * replies.length)];
}

// 🟢 CHAT API
// 🟢 CHAT API
app.post("/chat", async (req, res) => {
  try {
    console.log("🔥 Request aaya:", req.body);

    const userMsg = req.body.message || "";
    const userId = req.body.userId || "guest";

    if (!isSafeText(userMsg)) {
      return res.json({ reply: "❌ Not allowed" });
    }

    const reply = getAIReply(userMsg, userId);

    await db.ref("messages").push({
      text: reply,
      user: "Neha Sharma",
      time: Date.now()
    });

    res.json({ reply });

  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ reply: "Server error" });
  }
});

// 🚀 START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running...");
});