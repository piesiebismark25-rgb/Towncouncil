import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const clearAndSeed = async () => {
  try {
    console.log('Connecting to database to clean...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      console.log(`Dropping collection: ${collection.collectionName}`);
      await collection.drop().catch(err => console.log(`Collection ${collection.collectionName} drop error:`, err.message));
    }

    console.log('Creating clean test users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const UserSchema = new mongoose.Schema({
      username: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
      createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', UserSchema);

    await User.create([
      {
        username: 'System Admin',
        email: 'admin@towncouncil.gov',
        password: hashedPassword,
        role: 'admin'
      },
      {
        username: 'John Doe',
        email: 'citizen@gmail.com',
        password: hashedPassword,
        role: 'citizen'
      }
    ]);

    console.log('Database cleared and seeded with clean test users successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during clearing:', err);
    process.exit(1);
  }
};

clearAndSeed();
