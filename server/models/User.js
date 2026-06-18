import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values but enforces uniqueness when present
  },
  profilePicture: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  assignedGate: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: true, // Auto-verified if logging in via Google
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
