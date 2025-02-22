const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);

// Enable CORS and JSON Parsing
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/honeypotDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Define Attack Schema
const attackSchema = new mongoose.Schema({
    ip: String,
    country: String,
    attackType: String,
    timestamp: { type: Date, default: Date.now }
});

// Create Model
const Attack = mongoose.model("Attack", attackSchema);

// Initialize Socket.io for Real-time Updates
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow frontend to connect
        methods: ["GET"]
    }
});

// API to Log an Attack (Store in MongoDB)
app.post("/log-attack", async (req, res) => {
    try {
        const newAttack = new Attack(req.body);
        await newAttack.save();

        // Send real-time update to frontend
        io.emit("newAttack", newAttack);

        res.json({ message: "Attack Logged", data: newAttack });
    } catch (error) {
        res.status(500).json({ error: "Failed to log attack" });
    }
});

// API to Get Attack Logs
app.get("/log-attack", async (req, res) => {
    try {
        const logs = await Attack.find().sort({ timestamp: -1 }); // Fetch logs from MongoDB
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
