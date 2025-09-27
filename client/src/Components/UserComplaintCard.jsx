import React from "react";
import {
  FaMapMarkerAlt,
  FaClock,
  FaTag,
  FaTwitter,
  FaCheckCircle,
  FaClock as FaPending,
  FaExclamationTriangle,
  FaThumbsUp,
  FaThumbsDown,
  FaComments,
  FaExternalLinkAlt,
} from "react-icons/fa";

const UserComplaintCard = ({ complaint }) => {
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return {
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: FaCheckCircle,
          text: "Resolved",
        };
      case "in_progress":
        return {
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          icon: FaPending,
          text: "In Progress",
        };
      case "pending":
        return {
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: FaPending,
          text: "Pending",
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          icon: FaExclamationTriangle,
          text: "Unknown",
        };
    }
  };

  const statusInfo = getStatusInfo(complaint.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Media Section */}
      {complaint.media && complaint.media.length > 0 && (
        <div className="relative h-48 bg-gray-200">
          {complaint.media[0].type === "video" ||
          complaint.media[0].url?.includes(".mp4") ? (
            <video
              src={complaint.media[0].url}
              className="w-full h-full object-cover"
              controls={false}
              poster={complaint.media[0].thumbnail}
            />
          ) : (
            <img
              src={complaint.media[0].url}
              alt="Complaint media"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/no-img.png";
              }}
            />
          )}

          {/* Media Count Badge */}
          {complaint.media.length > 1 && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-sm font-medium">
              +{complaint.media.length - 1} more
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header with Status */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-2">
            {complaint.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {complaint.description}
        </p>

        {/* Meta Information */}
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
            <span className="truncate">
              {complaint.location?.namedAddress ||
                `${complaint.location?.coordinates?.[1]}, ${complaint.location?.coordinates?.[0]}` ||
                "Location not specified"}
            </span>
          </div>

          {/* Twitter Status */}
          {(complaint.twitterData?.tweetId ||
            complaint.twitter?.tweetId ||
            complaint.twitterUrl) && (
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <FaTwitter className="flex-shrink-0" />
              <span>Posted on Twitter</span>
              {(complaint.twitterUrl ||
                complaint.twitterData?.tweetUrl ||
                (complaint.twitter?.tweetId &&
                  `https://twitter.com/Devil453269/status/${complaint.twitter.tweetId}`)) && (
                <a
                  href={
                    complaint.twitterUrl ||
                    complaint.twitterData?.tweetUrl ||
                    `https://twitter.com/Devil453269/status/${complaint.twitter.tweetId}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  View Tweet
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserComplaintCard;
