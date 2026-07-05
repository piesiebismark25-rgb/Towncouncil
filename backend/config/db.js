import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectDB = async () => {
  const logFilePath = path.resolve(__dirname, '../debug_output.txt');
  const logLines = [];

  logLines.push(`Time: ${new Date().toISOString()}`);
  logLines.push(`MONGO_URI in env: "${process.env.MONGO_URI}"`);
  logLines.push(`JWT_SECRET in env: "${process.env.JWT_SECRET}"`);
  logLines.push(`PORT in env: "${process.env.PORT}"`);

  try {
    logLines.push(`Attempting mongoose connection...`);
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/town_council', {
      serverSelectionTimeoutMS: 2000
    });
    logLines.push(`MongoDB Connected successfully to host: ${conn.connection.host}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logLines.push(`MongoDB connection failed: ${error.message}`);
    logLines.push(`Error Stack: ${error.stack}`);
    console.warn(`[WARNING] MongoDB connection failed (${error.message}). Falling back to local JSON database mode.`);
  }

  fs.writeFileSync(logFilePath, logLines.join('\n'), 'utf-8');
};

export default connectDB;
