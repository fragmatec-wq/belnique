const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'professor', 'collector', 'admin'], 
    default: 'student' 
  },
  isBlocked: { type: Boolean, default: false },
    bio: { type: String },
    profileImage: { type: String },
    
    // Personal Info
    phone: { type: String },
    gender: { type: String },
    documentType: { type: String },
    documentNumber: { type: String },
    address: { type: String },
    
    // Student specific
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    studyLog: [{ type: Date }],
    
    // Professor specific
    specialization: { type: String },
    
    // Collector specific
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
    ownedArtworks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' }],
    walletBalance: { type: Number, default: 0 },

    // Social
    website: { type: String },
    location: { type: String },

    // Preferences
    preferences: {
      notifications: {
        emailCourses: { type: Boolean, default: true },
        emailAssignments: { type: Boolean, default: true },
        emailMarketing: { type: Boolean, default: false },
        pushBrowser: { type: Boolean, default: false }
      },
      appearance: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        language: { type: String, default: 'pt-BR' },
        timezone: { type: String, default: 'America/Sao_Paulo' }
      },
      privacy: {
        profileVisibility: { type: String, enum: ['public', 'members', 'private'], default: 'public' },
        showActivityStatus: { type: Boolean, default: true }
      },
      studentMode: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
