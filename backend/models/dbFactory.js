import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  UserSchema,
  TaxPaymentSchema,
  PermitApplicationSchema,
  EventBookingSchema,
  ServiceRequestSchema,
  AnnouncementSchema
} from './schemas.js';

// JSON database mock implementation
class JSONModel {
  constructor(name) {
    this.name = name;
    this.dirPath = path.join(process.cwd(), 'data');
    this.filePath = path.join(this.dirPath, `${name}.json`);
    
    if (!fs.existsSync(this.dirPath)) {
      fs.mkdirSync(this.dirPath, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  async read() {
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      return [];
    }
  }

  async write(data) {
    await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    const list = await this.read();
    return list.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const list = await this.read();
    return list.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  }

  async findById(id) {
    const list = await this.read();
    return list.find(item => item._id === id || item.id === id) || null;
  }

  async create(data) {
    const list = await this.read();
    const newItem = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdAt: new Date(),
      ...data
    };
    list.push(newItem);
    await this.write(list);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const list = await this.read();
    const index = list.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    
    let target = { ...list[index] };
    
    // Handle mongoose-like $push
    if (updateData.$push) {
      for (const key in updateData.$push) {
        if (!target[key]) target[key] = [];
        target[key].push({
          _id: Math.random().toString(36).substring(2, 10),
          createdAt: new Date(),
          ...updateData.$push[key]
        });
      }
      delete updateData.$push;
    }

    list[index] = {
      ...target,
      ...updateData,
      updatedAt: new Date()
    };
    await this.write(list);
    return list[index];
  }

  async findByIdAndDelete(id) {
    const list = await this.read();
    const index = list.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;
    const deleted = list[index];
    list.splice(index, 1);
    await this.write(list);
    return deleted;
  }
}

// Check connection helper
const useMongo = () => mongoose.connection.readyState === 1;

// Lazy compiled mongoose models
let MongoUser, MongoTaxPayment, MongoPermitApplication, MongoEventBooking, MongoServiceRequest, MongoAnnouncement;

const getMongoModels = () => {
  if (!MongoUser) {
    MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
    MongoTaxPayment = mongoose.models.TaxPayment || mongoose.model('TaxPayment', TaxPaymentSchema);
    MongoPermitApplication = mongoose.models.PermitApplication || mongoose.model('PermitApplication', PermitApplicationSchema);
    MongoEventBooking = mongoose.models.EventBooking || mongoose.model('EventBooking', EventBookingSchema);
    MongoServiceRequest = mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', ServiceRequestSchema);
    MongoAnnouncement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
  }
  return {
    User: MongoUser,
    TaxPayment: MongoTaxPayment,
    PermitApplication: MongoPermitApplication,
    EventBooking: MongoEventBooking,
    ServiceRequest: MongoServiceRequest,
    Announcement: MongoAnnouncement
  };
};

// JSON models instantiations
const jsonModels = {
  User: new JSONModel('users'),
  TaxPayment: new JSONModel('taxes'),
  PermitApplication: new JSONModel('permits'),
  EventBooking: new JSONModel('bookings'),
  ServiceRequest: new JSONModel('requests'),
  Announcement: new JSONModel('announcements')
};

// Wrapper creation utility
const createModelWrapper = (modelName) => {
  return {
    find: async (query) => {
      if (useMongo()) {
        const mongoModel = getMongoModels()[modelName];
        return await mongoModel.find(query);
      } else {
        return await jsonModels[modelName].find(query);
      }
    },
    findOne: async (query) => {
      if (useMongo()) {
        const mongoModel = getMongoModels()[modelName];
        return await mongoModel.findOne(query);
      } else {
        return await jsonModels[modelName].findOne(query);
      }
    },
    findById: async (id) => {
      if (useMongo()) {
        const mongoModel = getMongoModels()[modelName];
        return await mongoModel.findById(id);
      } else {
        return await jsonModels[modelName].findById(id);
      }
    },
    create: async (data) => {
      if (useMongo()) {
        const mongoModel = getMongoModels()[modelName];
        return await mongoModel.create(data);
      } else {
        return await jsonModels[modelName].create(data);
      }
    },
    findByIdAndUpdate: async (id, updateData, options) => {
      if (useMongo()) {
        const mongoModel = getMongoModels()[modelName];
        return await mongoModel.findByIdAndUpdate(id, updateData, { new: true, ...options });
      } else {
        return await jsonModels[modelName].findByIdAndUpdate(id, updateData, options);
      }
    },
    findByIdAndDelete: async (id) => {
      if (useMongo()) {
        const mongoModel = getMongoModels()[modelName];
        return await mongoModel.findByIdAndDelete(id);
      } else {
        return await jsonModels[modelName].findByIdAndDelete(id);
      }
    }
  };
};

export const User = createModelWrapper('User');
export const TaxPayment = createModelWrapper('TaxPayment');
export const PermitApplication = createModelWrapper('PermitApplication');
export const EventBooking = createModelWrapper('EventBooking');
export const ServiceRequest = createModelWrapper('ServiceRequest');
export const Announcement = createModelWrapper('Announcement');

// Seed Function
export const seedDatabase = async () => {
  const adminEmail = 'admin@towncouncil.gov';
  const citizenEmail = 'citizen@gmail.com';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const seedUsers = [
    {
      username: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    },
    {
      username: 'John Doe',
      email: citizenEmail,
      password: hashedPassword,
      role: 'citizen'
    }
  ];

  if (useMongo()) {
    try {
      const { User: MUser } = getMongoModels();
      const userCount = await MUser.countDocuments();
      if (userCount === 0) {
        await MUser.insertMany(seedUsers);
        console.log('MongoDB Seeded successfully with test users');
      }
    } catch (err) {
      console.error('Error seeding MongoDB:', err.message);
    }
  } else {
    // JSON Seeding
    const userList = await jsonModels.User.read();
    if (userList.length === 0) {
      await jsonModels.User.create(seedUsers[0]);
      await jsonModels.User.create(seedUsers[1]);
      console.log('Local JSON Database Seeded successfully with test users');
    }
  }
};

