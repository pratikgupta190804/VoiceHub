import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaArrowUp,
  FaArrowDown,
  FaMapMarkerAlt,
  FaShare,
  FaComment,
  FaMap,
} from "react-icons/fa";
import { useComplaintStore } from "../store/useComplaintStore";
import { useStoreAuth } from "../store/useAuthStore";

const ComplaintCard = ({ complaint }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const {
    upvoteComplaint,
    downvoteComplaint,
    addComment,
    isVoting,
    isCommenting,
  } = useComplaintStore();
  const { authUser } = useStoreAuth();

  // Helper function to render user avatar
  const renderUserAvatar = (user, size = "w-8 h-8") => {
    const profilePicture = user?.profilePicture;

    return (
      <img
        src={profilePicture || "/avatar.png"}
        alt={user?.fullname || "User"}
        className={`${size} rounded-full object-cover border-2 border-gray-200`}
        onError={(e) => {
          e.target.src = "/avatar.png";
        }}
      />
    );
  };
  const nextMedia = () => {
    if (complaint.media && complaint.media.length > 0) {
      setCurrentMediaIndex((prev) =>
        prev === complaint.media.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevMedia = () => {
    if (complaint.media && complaint.media.length > 0) {
      setCurrentMediaIndex((prev) =>
        prev === 0 ? complaint.media.length - 1 : prev - 1
      );
    }
  };

  const handleVote = async (voteType) => {
    if (isVoting) return;

    if (voteType === "up") {
      await upvoteComplaint(complaint._id);
    } else {
      await downvoteComplaint(complaint._id);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() && !isCommenting) {
      const success = await addComment(complaint._id, newComment);
      if (success) {
        setNewComment("");
      }
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const currentMedia =
    complaint.media && complaint.media.length > 0
      ? complaint.media[currentMediaIndex]
      : null;
  const isVideo =
    currentMedia?.type === "video" || currentMedia?.url?.includes(".mp4");

  return (
    <div
      className="rounded-2xl shadow-sm hover:shadow-lg overflow-hidden border transition-all duration-300 hover:transform hover:-translate-y-1 complaint-card"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#FFD95A",
        borderWidth: "2px",
      }}
    >
      {/* Header with time */}
      <div className="flex items-center justify-end p-4 pb-2">
        <span
          className="text-xs font-medium font-inter"
          style={{ color: "#C07F00" }}
        >
          {formatTimeAgo(complaint.createdAt)}
        </span>
      </div>

      {/* Media Section */}
      {currentMedia && (
        <div className="relative mx-4 mb-4">
          <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
            {isVideo ? (
              <video
                src={currentMedia.url}
                controls
                className="w-full h-full object-cover"
                poster="/no-video.png"
              />
            ) : (
              <img
                src={currentMedia.url}
                alt="Complaint media"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "/no-img.png";
                }}
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {complaint.media && complaint.media.length > 1 && (
            <>
              <button
                onClick={prevMedia}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                onClick={nextMedia}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              >
                <FaChevronRight size={14} />
              </button>
            </>
          )}

          {/* Media Indicators */}
          {complaint.media && complaint.media.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {complaint.media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMediaIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentMediaIndex
                      ? "bg-white scale-125"
                      : "bg-white bg-opacity-60 hover:bg-opacity-80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Title */}
        <h2
          className="font-bold mb-2 text-lg leading-tight line-clamp-2 complaint-title font-playfair"
          style={{ color: "#4C3D3D" }}
        >
          {complaint.title}
        </h2>

        {/* Description */}
        <p
          className="text-sm mb-4 leading-relaxed line-clamp-3 complaint-description font-inter"
          style={{ color: "#000000" }}
        >
          {complaint.description}
        </p>

        {/* Location */}
        <div
          className="flex items-start space-x-3 mb-4 p-3 rounded-lg"
          style={{ backgroundColor: "#FFD95A", border: "1px solid #C07F00" }}
        >
          <FaMapMarkerAlt
            size={16}
            color="#C07F00"
            className="mt-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold mb-1 label font-inter"
              style={{ color: "#4C3D3D" }}
            >
              Location
            </p>
            <p
              className="text-xs leading-relaxed truncate font-inter"
              style={{ color: "rgba(76, 61, 61, 0.8)" }}
            >
              {complaint.location?.namedAddress || "Location not specified"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: "#FFD95A" }}
        >
          <div className="flex items-center space-x-4">
            {/* Upvote */}
            <button
              onClick={() => handleVote("up")}
              disabled={isVoting}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-inter font-medium ${
                isVoting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:text-white hover:opacity-80"
              }`}
              style={{
                backgroundColor: "transparent",
                color: "#4C3D3D",
              }}
              onMouseEnter={(e) => {
                if (!isVoting) e.target.style.backgroundColor = "#C07F00";
              }}
              onMouseLeave={(e) => {
                if (!isVoting) e.target.style.backgroundColor = "transparent";
              }}
            >
              <FaArrowUp size={16} />
              <span className="text-sm font-medium">
                {complaint.upvote || 0}
              </span>
            </button>

            {/* Downvote */}
            <button
              onClick={() => handleVote("down")}
              disabled={isVoting}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-inter font-medium ${
                isVoting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:text-white hover:opacity-80"
              }`}
              style={{
                backgroundColor: "transparent",
                color: "#4C3D3D",
              }}
              onMouseEnter={(e) => {
                if (!isVoting) e.target.style.backgroundColor = "#C07F00";
              }}
              onMouseLeave={(e) => {
                if (!isVoting) e.target.style.backgroundColor = "transparent";
              }}
            >
              <FaArrowDown size={16} />
              <span className="text-sm font-medium">
                {complaint.downvote || 0}
              </span>
            </button>

            {/* Share */}
            <button
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: "#4C3D3D" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFD95A")}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              <FaShare size={16} />
            </button>

            {/* Comments */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-inter font-medium"
              style={{ color: "#4C3D3D" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFD95A")}
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              <FaComment size={16} />
              <span className="text-sm font-medium">
                {complaint.comments?.length || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div
            className="px-4 pb-4 border-t"
            style={{ borderColor: "#f1f1f1" }}
          >
            {/* Comments List */}
            <div className="mt-3 max-h-60 overflow-y-auto space-y-3">
              {!complaint.comments || complaint.comments.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                complaint.comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {renderUserAvatar(comment.senderId)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.senderId?.fullname || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            <div className="mt-4 flex space-x-3">
              <div className="flex-shrink-0">{renderUserAvatar(authUser)}</div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    authUser ? "Write a comment..." : "Please login to comment"
                  }
                  disabled={isCommenting || !authUser}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                  rows="2"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim() || isCommenting || !authUser}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-inter"
                    style={{
                      backgroundColor: "#4C3D3D",
                      hover: { backgroundColor: "#3A2F2F" },
                    }}
                    onMouseEnter={(e) => {
                      if (!e.target.disabled)
                        e.target.style.backgroundColor = "#3A2F2F";
                    }}
                    onMouseLeave={(e) => {
                      if (!e.target.disabled)
                        e.target.style.backgroundColor = "#4C3D3D";
                    }}
                  >
                    {isCommenting
                      ? "Posting..."
                      : !authUser
                      ? "Login to Comment"
                      : "Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;
