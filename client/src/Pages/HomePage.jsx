import React, { useState } from "react";
import { useStoreAuth } from "../store/useAuthStore";
import {
  FaChevronLeft,
  FaChevronRight,
  FaArrowUp,
  FaArrowDown,
  FaMapMarkerAlt,
  FaShare,
  FaBookmark,
} from "react-icons/fa";

const HomePage = () => {
  const { authUser } = useStoreAuth();
  console.log("Auth User:", authUser);

  // Sample complaint data - with proper addresses
  const [complaints] = useState([
    {
      _id: "1",
      title: "Large pothole causing traffic issues",
      description:
        "A massive pothole has formed on the main road near the bus stop, causing vehicles to swerve dangerously.",
      lat: 19.076,
      lng: 72.8777,
      address: "Linking Road, Bandra West, Mumbai, Maharashtra 400050, India",
      media: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop",
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&h=400&fit=crop",
        "https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4",
      ],
      upvotes: 45,
      downvotes: 3,
      userHasVoted: null, // null, 'up', or 'down'
    },
  ]);

  return (
    authUser && (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {complaints.map((complaint) => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      </div>
    )
  );
};

const ComplaintCard = ({ complaint }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [userVote, setUserVote] = useState(complaint.userHasVoted);
  const [votes, setVotes] = useState({
    up: complaint.upvotes,
    down: complaint.downvotes,
  });

  const nextMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === complaint.media.length - 1 ? 0 : prev + 1
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) =>
      prev === 0 ? complaint.media.length - 1 : prev - 1
    );
  };

  const handleVote = (voteType) => {
    if (userVote === voteType) {
      // Remove vote
      setVotes((prev) => ({
        ...prev,
        [voteType]: prev[voteType] - 1,
      }));
      setUserVote(null);
    } else {
      // Add new vote and remove old vote if exists
      setVotes((prev) => {
        const newVotes = { ...prev };
        if (userVote) {
          newVotes[userVote] -= 1;
        }
        newVotes[voteType] += 1;
        return newVotes;
      });
      setUserVote(voteType);
    }
  };

  const currentMedia = complaint.media[currentMediaIndex];
  const isVideo = currentMedia?.includes(".mp4");

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* User Info Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium">U</span>
          </div>
          <div>
            <h3 className="font-medium text-black text-sm">Anonymous User</h3>
            <p className="text-gray-500 text-xs">2 hours ago</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-black">
          <div className="flex flex-col space-y-1">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
        </button>
      </div>

      {/* Media Section */}
      <div className="relative">
        <div className="aspect-square bg-gray-100">
          {isVideo ? (
            <video
              src={currentMedia}
              controls
              className="w-full h-full object-cover"
              poster="/no-video.png"
            />
          ) : (
            <img
              src={currentMedia}
              alt="Complaint media"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/no-img.png";
              }}
            />
          )}
        </div>

        {/* Navigation Arrows */}
        {complaint.media.length > 1 && (
          <>
            <button
              onClick={prevMedia}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              onClick={nextMedia}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <FaChevronRight size={16} />
            </button>
          </>
        )}

        {/* Media Indicators */}
        {complaint.media.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {complaint.media.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentMediaIndex
                    ? "bg-white"
                    : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          {/* Upvote */}
          <button
            onClick={() => handleVote("up")}
            className={`flex items-center space-x-1 ${
              userVote === "up" ? "text-blue-500" : "text-gray-700"
            } hover:text-blue-500 transition-colors`}
          >
            <FaArrowUp size={20} />
            <span className="text-sm font-medium">{votes.up}</span>
          </button>

          {/* Downvote */}
          <button
            onClick={() => handleVote("down")}
            className={`flex items-center space-x-1 ${
              userVote === "down" ? "text-red-500" : "text-gray-700"
            } hover:text-red-500 transition-colors`}
          >
            <FaArrowDown size={20} />
            <span className="text-sm font-medium">{votes.down}</span>
          </button>

          {/* Share */}
          <button className="text-gray-700 hover:text-blue-500 transition-colors">
            <FaShare size={18} />
          </button>
        </div>

        {/* Bookmark */}
        <button className="text-gray-700 hover:text-orange-500 transition-colors">
          <FaBookmark size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Title */}
        <h2 className="font-semibold text-black mb-2 text-base">
          {complaint.title}
        </h2>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
          {complaint.description}
        </p>

        {/* Location */}
        <div className="flex items-start space-x-2 text-gray-600">
          <FaMapMarkerAlt
            size={16}
            color="#ec8b0a"
            className="mt-1 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-medium text-gray-800 mb-1">Location</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {complaint.address}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {complaint.lat.toFixed(4)}, {complaint.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* View Details Button */}
        <button
          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-blue-500 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-blue-600 transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #ec8b0a 0%, #0f70cd 100%)",
          }}
        >
          View Full Details
        </button>
      </div>
    </div>
  );
};

export default HomePage;
