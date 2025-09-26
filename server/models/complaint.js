const mongoose = require('mongoose');
const { Schema } = mongoose;

const ComplaintSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  anonymous: { type: Boolean, default: false },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String },
  severity: { type: String, enum: ['low','medium','high','critical'], default: 'low' },

  // media field directly inside complaint
  media: [
    {
      url: { type: String, required: true }, // Cloudinary secure_url
      type: { type: String, enum: ['image','video'], required: true } // classify quickly
    }
  ],

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },

  authorities: [{ name: String, handle: String }],

  twitter: {
    tweetId: String,
    status: { type: String, enum: ['pending','posted','failed'], default: 'pending' },
    postedAt: Date,
    error: String
  },

  status: { type: String, enum: ['open','in_progress','resolved','rejected'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ComplaintSchema.pre('save', function(next){
  this.updatedAt = new Date();
  next();
});

ComplaintSchema.index({ title: 'text', description: 'text' });
ComplaintSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Complaint', ComplaintSchema);