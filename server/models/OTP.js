import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // The document will be automatically deleted after 5 minutes
});

// A function to execute before saving a document
OTPSchema.pre('save', async function () {
  if (this.isModified('otp')) {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
  }
});

const OTP = mongoose.model('OTP', OTPSchema);

export default OTP;
