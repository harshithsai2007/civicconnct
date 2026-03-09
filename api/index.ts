import express from "express";
import mongoose from "mongoose";
import { User, Issue, Vote, Comment, Timeline } from "../src/db-mongo.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "civic-connect-secret-key";
const MONGODB_URI = process.env.MONGODB_URI!;

// Connect to MongoDB (reuse connection across warm invocations)
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
};

// Use memory storage for uploads on Vercel (no persistent disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
app.use(express.json({ limit: '10mb' }));

// Seed users on first cold start or via emergency reset
const seedUsers = async (forceReset = false) => {
    const adminEmail = "admin@civicconnect.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin || forceReset) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        if (existingAdmin) {
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log("Admin account password reset to 'admin123'");
        } else {
            await User.create({ email: adminEmail, password: hashedPassword, role: 'admin' });
            console.log("Admin account created with password 'admin123'");
        }
    }

    const userEmail = "citizen@civicconnect.com";
    const existingUser = await User.findOne({ email: userEmail });
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash("user123", 10);
        await User.create({ email: userEmail, password: hashedPassword, role: 'user' });
    }
};

// --- Emergency Reset Route (Temporary) ---
app.get("/api/admin/emergency-reset", async (req, res) => {
    await connectDB();
    await seedUsers(true);
    res.json({ message: "Admin password has been reset to 'admin123'. Please log in now." });
});

// --- Auth Routes ---
app.post("/api/auth/register", async (req, res) => {
    await connectDB();
    const email = req.body.email.toLowerCase().trim();
    const { password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword, role: role || 'user' });
        res.json({ id: newUser._id });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/api/auth/login", async (req, res) => {
    await connectDB();
    await seedUsers();
    const email = req.body.email.toLowerCase().trim();
    const { password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
});

// --- Issue Routes ---
app.get("/api/issues", async (req, res) => {
    await connectDB();
    const { state, district, category, status } = req.query;
    const query: any = {};
    if (state) query.state = state;
    if (district) query.district = district;
    if (category) query.category = category;
    if (status) query.status = status;

    const issues = await Issue.find(query).sort({ createdAt: -1 });
    const formattedIssues = issues.map(issue => {
        const obj: any = issue.toObject();
        obj.id = obj._id;
        obj.created_at = obj.createdAt;
        obj.updated_at = obj.updatedAt;
        return obj;
    });
    res.json(formattedIssues);
});

app.post("/api/issues", upload.single("photo"), async (req, res) => {
    await connectDB();
    const { title, description, category, state, district, locality, latitude, longitude } = req.body;
    // On Vercel, photos go to a temp URL. For full support you'd use Cloudinary.
    const photo_url = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null;

    try {
        const newIssue = await Issue.create({
            title, description, category, state, district, locality,
            latitude, longitude, photo_url, assigned_corporation: null
        });
        await Timeline.create({ issue_id: newIssue._id, status: 'not_started', note: 'Issue reported by citizen.' });
        res.json({ id: newIssue._id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/issues/:id/vote", async (req, res) => {
    await connectDB();
    const issueId = req.params.id;
    const ip = req.ip || 'unknown';
    try {
        await Vote.create({ issue_id: issueId, ip_address: ip });
        const updatedIssue = await Issue.findByIdAndUpdate(issueId, { $inc: { votes: 1 } }, { new: true });
        if (updatedIssue && updatedIssue.votes >= 10) {
            updatedIssue.is_high_priority = 1;
            await updatedIssue.save();
        }
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: "You have already voted for this issue." });
    }
});

app.patch("/api/issues/:id/status", async (req, res) => {
    await connectDB();
    try {
        const { status, note } = req.body;
        const issueId = req.params.id;
        const current = await Issue.findById(issueId);
        if (current && current.status !== status) {
            current.status = status;
            await current.save();
            await Timeline.create({ issue_id: issueId, status, note: note || `Status updated to ${status}` });
        }
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.patch("/api/issues/:id/assign", async (req, res) => {
    await connectDB();
    try {
        const { corporation } = req.body;
        const issueId = req.params.id;
        const current = await Issue.findById(issueId);
        if (current && current.assigned_corporation !== corporation) {
            current.assigned_corporation = corporation;
            await current.save();
            await Timeline.create({ issue_id: issueId, status: current.status, note: `Issue assigned to ${corporation || 'None'}` });
        }
        res.json({ success: true, corporation });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/issues/:id/details", async (req, res) => {
    await connectDB();
    try {
        const issueId = req.params.id;
        const issueDoc = await Issue.findById(issueId);
        if (!issueDoc) return res.status(404).json({ error: 'Issue not found' });

        const issue: any = issueDoc.toObject();
        issue.id = issue._id;
        issue.created_at = issue.createdAt;
        issue.updated_at = issue.updatedAt;

        const timeline = await Timeline.find({ issue_id: issueId }).sort({ createdAt: -1 });
        const formattedTimeline = timeline.map((t: any) => {
            const obj: any = t.toObject();
            obj.created_at = obj.createdAt;
            return obj;
        });
        const comments = await Comment.find({ issue_id: issueId }).sort({ createdAt: 1 });
        const formattedComments = comments.map((c: any) => {
            const obj: any = c.toObject();
            obj.created_at = obj.createdAt;
            return obj;
        });

        res.json({ issue, timeline: formattedTimeline, comments: formattedComments });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/issues/:id/comments", async (req, res) => {
    await connectDB();
    const { text, role } = req.body;
    const issueId = req.params.id;
    await Comment.create({ issue_id: issueId, text, user_role: role || 'user' });
    res.json({ success: true });
});

// --- Analytics ---
app.get("/api/analytics", async (req, res) => {
    await connectDB();
    try {
        const total = await Issue.countDocuments();
        const resolved = await Issue.countDocuments({ status: 'resolved' });
        const pending = await Issue.countDocuments({ status: { $ne: 'resolved' } });
        const highPriority = await Issue.countDocuments({ is_high_priority: 1 });

        const byCategory = await Issue.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $project: { _id: 0, category: "$_id", count: 1 } }
        ]);
        const byStatus = await Issue.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { _id: 0, status: "$_id", count: 1 } }
        ]);
        const byCorporation = await Issue.aggregate([
            { $match: { assigned_corporation: { $ne: null } } },
            { $group: { _id: "$assigned_corporation", count: { $sum: 1 } } },
            { $project: { _id: 0, name: "$_id", count: 1 } }
        ]);

        res.json({ total, resolved, pending, highPriority, byCategory, byStatus, byCorporation });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default app;
