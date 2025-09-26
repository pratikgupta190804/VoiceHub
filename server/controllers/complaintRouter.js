const Complaint = require("../models/complaint");
const Comment = require("../models/comment");

exports.getAllComplaints = async (req, res) => {
  try {
    const allComplaints = await Complaint.find()
      .populate({
        path: "comments",
        populate: {
          path: "senderId",
          select: "fullname profilePicture email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: allComplaints,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

exports.upvoteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $inc: { upvote: 1 } },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        upvote: complaint.upvote,
        downvote: complaint.downvote,
      },
    });
  } catch (error) {
    console.error("Error upvoting complaint:", error);
    res.status(500).json({
      message: "Failed to upvote complaint",
      error: error.message,
    });
  }
};

exports.downvoteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $inc: { downvote: 1 } },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        upvote: complaint.upvote,
        downvote: complaint.downvote,
      },
    });
  } catch (error) {
    console.error("Error downvoting complaint:", error);
    res.status(500).json({
      message: "Failed to downvote complaint",
      error: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    // Create new comment with authenticated user
    const newComment = new Comment({
      senderId: req.user._id, // Use the authenticated user's ID
      text: text.trim(),
    });

    await newComment.save();

    // Populate the comment with user data
    await newComment.populate("senderId", "fullname profilePicture email");

    // Add comment to complaint
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $push: { comments: newComment._id } },
      { new: true }
    ).populate({
      path: "comments",
      populate: {
        path: "senderId",
        select: "fullname profilePicture email",
      },
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(201).json({
      success: true,
      data: {
        comment: newComment,
        totalComments: complaint.comments.length,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      message: "Failed to add comment",
      error: error.message,
    });
  }
};
