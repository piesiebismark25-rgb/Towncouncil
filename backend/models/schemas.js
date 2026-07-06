import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
  createdAt: { type: Date, default: Date.now }
});

const TaxPaymentSchema = new mongoose.Schema({
  citizenId: { type: String, required: true },
  citizenName: { type: String, required: true },
  amount: { type: Number, required: true },
  taxType: { type: String, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  billingDate: { type: Date, default: Date.now },
  paymentDate: { type: Date },
  receiptNumber: { type: String }
});

const PermitApplicationSchema = new mongoose.Schema({
  citizenId: { type: String, required: true },
  citizenName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  permitType: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  comments: { type: String }
});

const EventBookingSchema = new mongoose.Schema({
  citizenId: { type: String, required: true },
  citizenName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  venue: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'cancelled'], default: 'pending' },
  ticketsCount: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const ServiceRequestSchema = new mongoose.Schema({
  citizenId: { type: String, required: true },
  citizenName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['submitted', 'in-progress', 'resolved'], default: 'submitted' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  submittedAt: { type: Date, default: Date.now },
  updates: [{
    status: String,
    comment: String,
    updatedAt: { type: Date, default: Date.now }
  }]
});

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'event', 'urgent'], default: 'general' },
  date: { type: Date, default: Date.now },
  targetAudience: { type: String, default: 'all' },
  imageUrl: { type: String }
});

export {
  UserSchema,
  TaxPaymentSchema,
  PermitApplicationSchema,
  EventBookingSchema,
  ServiceRequestSchema,
  AnnouncementSchema
};
