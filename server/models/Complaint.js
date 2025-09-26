const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    locationType: {
      type: String,
      enum: ["manual", "auto", "map"],
      default: "manual",
    },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        isVerified: {
          type: Boolean,
          default: false,
        },
        twitter_media_id: {
          type: String,
          default: null,
        }
      }
    ],
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "posted"],
      default: "pending",
    },
    authorities: [
      {
        name: String,
        handle: String
      }
    ],
    twitter: {
      tweetId: String,
      status: { 
        type: String, 
        enum: ["pending", "posted", "failed"],
        default: "pending"
      },
      postedAt: Date,
      error: String
    },
    verificationDetails: {
      isAIGenerated: {
        type: Boolean,
        default: false,
      },
      isFromWeb: {
        type: Boolean,
        default: false,
      },
      confidence: {
        type: Number,
        default: 0,
      },
      verifiedAt: {
        type: Date,
        default: null,
      }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);