import mongoose from 'mongoose';

const gateSchema = new mongoose.Schema({
  gateId: String,
  gateName: String,
  location: String,
  status: String, // Open, Closed, Waiting
  openTime: Date,
  closeTime: Date,
  waitingTime: Number, // minutes
  currentUpdate: String,
  assignedOperator: String,
  sensorStatus: String,
  lastUpdated: Date,
  createdAt: Date
});

const Gate = mongoose.model('Gate', gateSchema);

export default Gate;
