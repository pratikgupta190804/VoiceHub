const mongoose = require("mongoose");
const { Schema } = mongoose;

const ComplaintSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  upvote:{type :Number, default:0},
  downvote:{type :Number, default:0},
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, default: "General" },
  // media field directly inside complaint
  media: [
    {
      url: { type: String, required: true }, // Cloudinary secure_url
      type: { type: String, enum: ["image", "video"], required: true }, // classify quickly
    },
  ],

  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], index: "2dsphere" }, // [lng, lat]
    namedAddress: { type: String, required: true }, // Human readable address
    latitude: { type: Number, required: true }, // Separate lat field for easy access
    longitude: { type: Number, required: true }, // Separate lng field for easy access
  },

  authorities: [{ name: String, handle: String }],

  twitter: {
    tweetId: String,
    postedAt: Date,
    error: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
  