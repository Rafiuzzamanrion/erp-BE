const mongoose = require("mongoose");

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((m) => m.connection);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const app = require("../dist/app").default;

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("[Vercel] Failed to process request:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
