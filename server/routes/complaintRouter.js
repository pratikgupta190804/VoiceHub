const express = require("express");
const complaintRouter = express.Router();
const {
  getAllComplaints,
  upvoteComplaint,
  downvoteComplaint,
  addComment,
} = require("../controllers/complaintRouter");
const { checkUser } = require("../middlewares/checkUser");

complaintRouter.get("/getallcomplaints", getAllComplaints);
complaintRouter.patch("/:complaintId/upvote", upvoteComplaint);
complaintRouter.patch("/:complaintId/downvote", downvoteComplaint);
complaintRouter.post("/:complaintId/comment", checkUser, addComment);

module.exports = complaintRouter;
