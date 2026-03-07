import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "civic-connect-secret-key";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use("/uploads", express.static("uploads"));

  // --- Auth Routes ---
  // Seed users
  const seedUsers = async () => {
    // Admin
    const adminEmail = "admin@civicconnect.com";
    const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')").run(adminEmail, hashedPassword);
      console.log("Admin user seeded: admin@civicconnect.com / admin123");
    }

    // Demo Citizen
    const userEmail = "citizen@civicconnect.com";
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(userEmail);
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("user123", 10);
      db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, 'user')").run(userEmail, hashedPassword);
      console.log("User seeded: citizen@civicconnect.com / user123");
    }
  };

  const seedIssues = () => {
    const issueCount = db.prepare("SELECT COUNT(*) as count FROM issues").get().count;
    if (issueCount === 0) {
      const issues = [
        {
          title: "Potholes on MVP Colony Main Road",
          description: "Several large potholes have formed near the Sector 4 junction. It's becoming dangerous for two-wheelers, especially at night.",
          category: "Roads",
          state: "Andhra Pradesh",
          district: "Visakhapatnam",
          locality: "MVP Colony",
          latitude: 17.7447,
          longitude: 83.3311,
          status: "in_progress",
          votes: 15,
          is_high_priority: 1
        },
        {
          title: "Garbage Accumulation at RK Beach",
          description: "Massive pile of plastic waste and food containers near the INS Kursura Museum area. Needs immediate cleanup.",
          category: "Sanitation",
          state: "Andhra Pradesh",
          district: "Visakhapatnam",
          locality: "Beach Road",
          latitude: 17.7185,
          longitude: 83.3314,
          status: "not_started",
          votes: 24,
          is_high_priority: 1
        },
        {
          title: "Street Light Failure in Siripuram",
          description: "The entire stretch from Siripuram Circle to Dutt Island is in pitch darkness for the last 3 days. Safety concern for pedestrians.",
          category: "Electricity",
          state: "Andhra Pradesh",
          district: "Visakhapatnam",
          locality: "Siripuram",
          latitude: 17.7224,
          longitude: 83.3151,
          status: "not_started",
          votes: 8,
          is_high_priority: 0
        },
        {
          title: "Water Pipeline Leakage in Gajuwaka",
          description: "Major water leakage observed near the Old Gajuwaka junction. Thousands of gallons of water being wasted daily.",
          category: "Water Supply",
          state: "Andhra Pradesh",
          district: "Visakhapatnam",
          locality: "Gajuwaka",
          latitude: 17.6905,
          longitude: 83.2095,
          status: "resolved",
          votes: 12,
          is_high_priority: 1
        },
        {
          title: "Stray Dog Menace near Madhurawada",
          description: "Increasing number of stray dogs near the IT Hill area. Several cases of chasing commuters reported recently.",
          category: "Public Safety",
          state: "Andhra Pradesh",
          district: "Visakhapatnam",
          locality: "Madhurawada",
          latitude: 17.8178,
          longitude: 83.3417,
          status: "not_started",
          votes: 19,
          is_high_priority: 1
        }
      ];

      const insertIssue = db.prepare(`
        INSERT INTO issues (title, description, category, state, district, locality, latitude, longitude, status, votes, is_high_priority, assigned_corporation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertTimeline = db.prepare(`
        INSERT INTO timeline (issue_id, status, note)
        VALUES (?, ?, ?)
      `);

      issues.forEach(issue => {
        const result = insertIssue.run(
          issue.title,
          issue.description,
          issue.category,
          issue.state,
          issue.district,
          issue.locality,
          issue.latitude,
          issue.longitude,
          issue.status,
          issue.votes,
          issue.is_high_priority,
          issue.status !== 'not_started' ? 'GVMC' : null
        );

        const issueId = result.lastInsertRowid;

        // Add initial timeline
        insertTimeline.run(issueId, 'not_started', 'Issue reported by citizen.');

        if (issue.status === 'in_progress') {
          insertTimeline.run(issueId, 'in_progress', 'GVMC team has been dispatched for inspection.');
          db.prepare("INSERT INTO comments (issue_id, text, user_role) VALUES (?, ?, ?)")
            .run(issueId, "We have noted this issue. A team will be visiting MVP Colony tomorrow morning.", "admin");
        } else if (issue.status === 'resolved') {
          insertTimeline.run(issueId, 'in_progress', 'Repair work initiated.');
          insertTimeline.run(issueId, 'resolved', 'Pipeline repaired and tested. Issue resolved.');
          db.prepare("INSERT INTO comments (issue_id, text, user_role) VALUES (?, ?, ?)")
            .run(issueId, "Thank you for reporting. The pipeline has been fixed.", "admin");
          db.prepare("INSERT INTO comments (issue_id, text, user_role) VALUES (?, ?, ?)")
            .run(issueId, "Great job! The water wastage has finally stopped.", "user");
        }

        if (issue.locality === "Beach Road") {
          db.prepare("INSERT INTO comments (issue_id, text, user_role) VALUES (?, ?, ?)")
            .run(issueId, "This is really bad. RK Beach is our pride, we should keep it clean.", "user");
        }
      });
      console.log("Demo issues seeded for Vizag city.");
    } else {
      // If issues already exist, ensure some comments are there for demo
      const commentCount = db.prepare("SELECT COUNT(*) as count FROM comments").get().count;
      if (commentCount === 0) {
        const issues = db.prepare("SELECT id, locality, status FROM issues LIMIT 5").all();
        issues.forEach((issue: any) => {
          if (issue.status === 'in_progress') {
            db.prepare("INSERT INTO comments (issue_id, text, user_role) VALUES (?, ?, ?)")
              .run(issue.id, "We have noted this issue. A team will be visiting the site tomorrow morning.", "admin");
          } else if (issue.status === 'resolved') {
            db.prepare("INSERT INTO comments (issue_id, text, user_role) VALUES (?, ?, ?)")
              .run(issue.id, "Thank you for reporting. The issue has been fixed.", "admin");
            db.prepare("INSERT INTO comments (issue_id, text, user_role) VALUES (?, ?, ?)")
              .run(issue.id, "Great job! Finally resolved.", "user");
          }
          if (issue.locality === "Beach Road") {
            db.prepare("INSERT INTO comments (issue_id, text, user_role) VALUES (?, ?, ?)")
              .run(issue.id, "This is really bad. We should keep our beaches clean.", "user");
          }
        });
      }
    }
  };

  seedUsers();
  seedIssues();

  app.post("/api/auth/register", async (req, res) => {
    const { email, password, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
      const result = stmt.run(email, hashedPassword, role || 'user');
      res.json({ id: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    console.log(`User logged in: ${email} (Role: ${user.role})`);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  });

  // --- Issue Routes ---
  app.get("/api/issues", (req, res) => {
    const { state, district, category, status } = req.query;
    let query = "SELECT * FROM issues WHERE 1=1";
    const params = [];

    if (state) { query += " AND state = ?"; params.push(state); }
    if (district) { query += " AND district = ?"; params.push(district); }
    if (category) { query += " AND category = ?"; params.push(category); }
    if (status) { query += " AND status = ?"; params.push(status); }

    query += " ORDER BY created_at DESC";
    const issues = db.prepare(query).all(...params);
    res.json(issues);
  });

  app.post("/api/issues", upload.single("photo"), (req, res) => {
    const { title, description, category, state, district, locality, latitude, longitude } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    const stmt = db.prepare(`
      INSERT INTO issues (title, description, category, state, district, locality, latitude, longitude, photo_url, assigned_corporation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, description, category, state, district, locality, latitude, longitude, photo_url, null);

    // Add initial timeline entry
    db.prepare("INSERT INTO timeline (issue_id, status, note) VALUES (?, ?, ?)")
      .run(result.lastInsertRowid, 'not_started', 'Issue reported by citizen.');

    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/issues/:id/vote", (req, res) => {
    const issueId = req.params.id;
    const ip = req.ip;

    try {
      db.prepare("INSERT INTO votes (issue_id, ip_address) VALUES (?, ?)").run(issueId, ip);
      db.prepare("UPDATE issues SET votes = votes + 1 WHERE id = ?").run(issueId);

      // Check threshold for high priority (e.g., 10 votes)
      const issue: any = db.prepare("SELECT votes FROM issues WHERE id = ?").get(issueId);
      if (issue.votes >= 10) {
        db.prepare("UPDATE issues SET is_high_priority = 1 WHERE id = ?").run(issueId);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "You have already voted for this issue." });
    }
  });

  app.patch("/api/issues/:id/status", (req, res) => {
    const { status, note } = req.body;
    const issueId = req.params.id;

    db.prepare("UPDATE issues SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, issueId);
    db.prepare("INSERT INTO timeline (issue_id, status, note) VALUES (?, ?, ?)")
      .run(issueId, status, note || `Status updated to ${status}`);

    res.json({ success: true });
  });

  app.patch("/api/issues/:id/assign", (req, res) => {
    const { corporation } = req.body;
    const issueId = req.params.id;

    db.prepare("UPDATE issues SET assigned_corporation = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(corporation, issueId);
    db.prepare("INSERT INTO timeline (issue_id, status, note) VALUES (?, (SELECT status FROM issues WHERE id = ?), ?)")
      .run(issueId, issueId, `Issue assigned to ${corporation}`);

    res.json({ success: true, corporation });
  });


  app.get("/api/issues/:id/details", (req, res) => {
    const issueId = req.params.id;
    const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId);
    const timeline = db.prepare("SELECT * FROM timeline WHERE issue_id = ? ORDER BY created_at DESC").all(issueId);
    const comments = db.prepare("SELECT * FROM comments WHERE issue_id = ? ORDER BY created_at ASC").all(issueId);
    res.json({ issue, timeline, comments });
  });

  app.post("/api/issues/:id/comments", (req, res) => {
    const { text, role } = req.body;
    const issueId = req.params.id;
    db.prepare("INSERT INTO comments (issue_id, text, user_role) VALUES (?, ?, ?)").run(issueId, text, role || 'user');
    res.json({ success: true });
  });

  // --- Analytics ---
  app.get("/api/analytics", (req, res) => {
    const stats = {
      total: db.prepare("SELECT COUNT(*) as count FROM issues").get().count,
      resolved: db.prepare("SELECT COUNT(*) as count FROM issues WHERE status = 'resolved'").get().count,
      pending: db.prepare("SELECT COUNT(*) as count FROM issues WHERE status != 'resolved'").get().count,
      byCategory: db.prepare("SELECT category, COUNT(*) as count FROM issues GROUP BY category").all(),
      byStatus: db.prepare("SELECT status, COUNT(*) as count FROM issues GROUP BY status").all(),
      highPriority: db.prepare("SELECT COUNT(*) as count FROM issues WHERE is_high_priority = 1").get().count,
      byCorporation: db.prepare("SELECT assigned_corporation as name, COUNT(*) as count FROM issues WHERE assigned_corporation IS NOT NULL GROUP BY assigned_corporation").all(),
    };
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
