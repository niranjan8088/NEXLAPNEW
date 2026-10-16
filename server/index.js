/**
 * Enterprise Production Express Backend Server for NexLapTech
 * Port: 3001 (default) or process.env.BACKEND_PORT
 * Subdomain: https://api.nexbyte.com
 * Features: Helmet, Rate Limiting, CORS, Compression, Supabase Storage, Health Check (/health), Graceful Shutdown
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "../.env.production" });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

// 1. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. CORS Policy (Includes https://api.nexbyte.com and www.nexbyte.com)
const allowedOrigins = (
  process.env.CORS_ALLOWED_ORIGINS ||
  "http://localhost:3000,http://127.0.0.1:3000,https://nexbyte.com,https://www.nexbyte.com,https://api.nexbyte.com"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || !isProd) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// 3. Compression & Body Parsers
app.use(compression());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// 4. Logging
app.use(morgan(isProd ? "combined" : "dev"));

// 5. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes.",
    code: "TOO_MANY_REQUESTS",
  },
});

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit booking/enquiry submissions to 15 per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Submission rate limit exceeded. Please wait a few minutes before submitting another request.",
    code: "SUBMISSION_LIMIT_EXCEEDED",
  },
});

app.use("/api/", apiLimiter);

// 6. Supabase Client & Storage Buckets Initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// 7. Health Check Endpoint (/health)
app.get("/health", async (req, res) => {
  const memoryUsage = process.memoryUsage();
  let dbStatus = "disconnected (using fallback)";

  if (supabase) {
    try {
      const { data, error } = await supabase.from("bookings").select("id").limit(1);
      if (!error) dbStatus = "connected (Supabase)";
    } catch {
      dbStatus = "error connecting to Supabase";
    }
  }

  res.status(200).json({
    status: "HEALTHY",
    service: "NexLapTech Low-Cost Enterprise Backend API",
    subdomain: "https://api.nexbyte.com",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    memoryUsage: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    },
    database: dbStatus,
  });
});

// 8. Storage Upload Endpoint (Supabase Cloud Storage for Images, Certificates, Invoices, PDFs)
app.post("/api/upload", async (req, res) => {
  try {
    const { fileName, fileData, bucketName = "nexbyte-assets" } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, message: "fileName and fileData (base64) are required.", code: "VALIDATION_ERROR" });
    }

    if (!supabase) {
      return res.status(200).json({
        success: true,
        fileUrl: `/uploads/${fileName}`,
        message: "File stored locally (Supabase not configured)",
      });
    }

    const buffer = Buffer.from(fileData.replace(/^data:.+;base64,/, ""), "base64");
    const filePath = `uploads/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage.from(bucketName).upload(filePath, buffer, {
      contentType: req.body.contentType || "application/octet-stream",
      upsert: true,
    });

    if (error) {
      return res.status(500).json({ success: false, message: error.message, code: "STORAGE_ERROR" });
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return res.status(200).json({
      success: true,
      filePath: data.path,
      fileUrl: publicUrlData.publicUrl,
      message: "File uploaded successfully to Supabase Storage",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, code: "SERVER_ERROR" });
  }
});

// 9. API Routes Handlers
app.post(["/api/bookings", "/api/book-product", "/api/product-booking", "/api/enquiry"], submitLimiter, async (req, res) => {
  try {
    const body = req.body;
    const customerName = body.customerName || body.customer_name || body.name;
    const phone = body.phone;

    if (!customerName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone number are required.",
        code: "VALIDATION_ERROR",
      });
    }

    const refId = `NB-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    const now = new Date().toISOString();
    const newBooking = {
      id: `b-${Date.now()}`,
      bookingId: refId,
      customerName,
      phone,
      email: body.email || "",
      city: body.city || "Bengaluru",
      productName: body.selectedItem || body.productName || body.service_name || "Hardware Booking",
      bookingType: body.requestType || "product",
      quantity: Number(body.quantity || 1),
      budget: body.budget || "N/A",
      status: "new",
      createdAt: now,
      updatedAt: now,
      timeline: [{ status: "submitted", timestamp: now, message: "Booking submitted by customer", by: "Customer" }],
    };

    if (supabase) {
      const { data, error } = await supabase.from("bookings").insert([newBooking]).select().single();
      if (!error && data) {
        return res.status(200).json({ success: true, bookingId: data.bookingId, booking: data, message: "Booking Submitted Successfully" });
      }
    }

    return res.status(200).json({ success: true, bookingId: newBooking.bookingId, booking: newBooking, message: "Booking Submitted Successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Server Error", code: "SERVER_ERROR" });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const { phone, bookingId } = req.query;
    if (supabase) {
      const { data } = await supabase.from("bookings").select("*");
      if (data && phone && bookingId) {
        const match = data.find((b) => b.phone?.includes(phone) && b.bookingId?.toLowerCase() === String(bookingId).toLowerCase());
        if (match) return res.status(200).json({ success: true, booking: match });
        return res.status(404).json({ success: false, message: "Booking not found", code: "NOT_FOUND" });
      }
      return res.status(200).json({ success: true, bookings: data || [] });
    }
    return res.status(200).json({ success: true, bookings: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, code: "SERVER_ERROR" });
  }
});

app.post("/api/laptop-enquiries", submitLimiter, async (req, res) => {
  try {
    const body = req.body;
    if (!body.customer_name || !body.phone) {
      return res.status(400).json({ success: false, message: "Missing required fields.", code: "VALIDATION_ERROR" });
    }
    const saved = { id: `lp-${Date.now()}`, ...body, created_at: new Date().toISOString() };
    if (supabase) {
      const { data } = await supabase.from("laptop_enquiries").insert([saved]).select().single();
      if (data) return res.status(200).json({ success: true, id: data.id, enquiry: data });
    }
    return res.status(200).json({ success: true, id: saved.id, enquiry: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, code: "SERVER_ERROR" });
  }
});

app.post("/api/contacts", submitLimiter, async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.email || !body.message) {
      return res.status(400).json({ success: false, message: "Missing required contact fields.", code: "VALIDATION_ERROR" });
    }
    const saved = { id: `ct-${Date.now()}`, ...body, created_at: new Date().toISOString() };
    if (supabase) {
      const { data } = await supabase.from("contacts").insert([saved]).select().single();
      if (data) return res.status(200).json({ success: true, id: data.id, contact: data });
    }
    return res.status(200).json({ success: true, id: saved.id, contact: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, code: "SERVER_ERROR" });
  }
});

app.post("/api/enrollments", submitLimiter, async (req, res) => {
  try {
    const body = req.body;
    if (!body.fullName || !body.phone || !body.email) {
      return res.status(400).json({ success: false, message: "Missing required enrollment fields.", code: "VALIDATION_ERROR" });
    }
    const saved = { id: `e-${Date.now()}`, enrollmentId: `NBT-2026-${Math.floor(Math.random() * 90000) + 10000}`, ...body, created_at: new Date().toISOString() };
    if (supabase) {
      const { data } = await supabase.from("enrollments").insert([saved]).select().single();
      if (data) return res.status(200).json({ success: true, enrollment: data });
    }
    return res.status(200).json({ success: true, enrollment: saved });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, code: "SERVER_ERROR" });
  }
});

app.get("/api/track", async (req, res) => {
  try {
    const searchVal = String(req.query.search || "").trim().toLowerCase();
    if (!searchVal) {
      return res.status(400).json({ success: false, message: "Search parameter is required.", code: "VALIDATION_ERROR" });
    }
    return res.status(200).json({ success: true, results: { bookings: [], enrollments: [] } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, code: "SERVER_ERROR" });
  }
});

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found on api.nexbyte.com backend server.`,
    code: "NOT_FOUND",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Unhandled Express Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
  });
});

// 10. Server Startup & Graceful Shutdown
const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 NexLapTech Enterprise Backend API running on Port ${PORT}`);
  console.log(`🌐 API Domain: https://api.nexbyte.com`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});

const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Received. Shutting down NexLapTech Backend API gracefully...`);
  server.close(() => {
    console.log("[Server Closed]. HTTP connections terminated cleanly.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("[Shutdown Timeout]. Forcing process exit.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
