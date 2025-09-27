const express = require('express');
const complaintRouter = express.Router();

const {
  submitComplaint,
  getUserComplaints,
  getComplaintById,
  healthCheck,
  getAllComplaints,
  upvoteComplaint,
  downvoteComplaint,
  addComment,
  detectAI
} = require("../controllers/complaintController");
const { checkUser } = require("../middlewares/checkUser");
const uploadMemory = require("../middlewares/multerUpload");


complaintRouter.get("/getallcomplaints", getAllComplaints);
complaintRouter.patch("/:complaintId/upvote", upvoteComplaint);
complaintRouter.patch("/:complaintId/downvote", downvoteComplaint);
complaintRouter.post("/:complaintId/comment", checkUser, addComment);

// Health check endpoint (no auth required)
complaintRouter.get("/health", healthCheck);

// AI Detection endpoint for frontend validation
complaintRouter.post('/detect-ai', checkUser, uploadMemory.array('media', 10), detectAI);

// Submit a new complaint with multiple media files
complaintRouter.post(
  "/submit",
  checkUser,
  uploadMemory.array("media", 10),
  submitComplaint
);

// Get all complaints for the current user
complaintRouter.get("/user", checkUser, getUserComplaints);

// Get a specific complaint by ID
complaintRouter.get("/:id", checkUser, getComplaintById);

module.exports = complaintRouter;
