const mongoose = require('mongoose');

// Reuse the connection across invocations of the same warm serverless
// instance instead of reconnecting on every request.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/easykhata';
    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB connected: ${cached.conn.connection.host}`);
  } catch (err) {
    cached.promise = null;
    console.error(`Error connecting to MongoDB: ${err.message}`);
    throw err;
  }

  return cached.conn;
};

module.exports = connectDB;
