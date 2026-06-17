import mongoose from 'mongoose';

const userAccountSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobileNo: String,
  role: String, // user, admin, station_master
  assignedGate: String,
  currentLocation: String,
  status: String, // active, inactive
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
});

const UserAccount = mongoose.model('UserAccount', userAccountSchema);

export default UserAccount;
