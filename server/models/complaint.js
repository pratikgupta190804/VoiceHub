const mongoose = require('mongoose');
const { Schema } = mongoose;

const ComplaintSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  upvote: { type: Number, default: 0 },
  downvote: { type: Number, default: 0 },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String },

  // media field directly inside complaint
  media: [
    {
      url: { type: String, required: true }, // Cloudinary secure_url
      type: { type: String, enum: ['image','video'], required: true } // classify quickly
    }
  ],

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }, // [lng, lat]
    namedAddress: { type: String, default: '' } // Human-readable address
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