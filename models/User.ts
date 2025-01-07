import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false, // Optional for Google login
  },
  googleId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: '/default-avatar.png',
  },
}, {
  timestamps: true, // This will add createdAt and updatedAt fields
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
