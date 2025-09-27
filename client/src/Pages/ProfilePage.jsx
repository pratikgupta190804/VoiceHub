import React, { useEffect, useState } from "react";
import { useStoreAuth } from "../store/useAuthStore";
import { useComplaintStore } from "../store/useComplaintStore";
import UserComplaintCard from "../Components/UserComplaintCard";
import LoadingCard from "../Components/LoadingCard";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaEdit,
  FaClipboardList,
  FaTrophy,
  FaComments,
  FaHeart,
  FaThumbsUp,
  FaThumbsDown,
  FaCamera,
} from "react-icons/fa";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser } = useStoreAuth();
  const { usercomplaints, getUserComplaints, isFetchingUserComplaints } =
    useComplaintStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    fullname: "",
    email: "",
  });

  useEffect(() => {
    if (authUser) {
      getUserComplaints();
      setEditedProfile({
        fullname: authUser.fullname || "",
        email: authUser.email || "",
      });
    }
  }, [authUser]);

  // Helper function to render user avatar
  const renderUserAvatar = (user, size = "w-32 h-32") => {
    const profilePicture = user?.profilePicture;

    return (
      <div className="relative">
        <img
          src={profilePicture || "/avatar.png"}
          alt={user?.fullname || "User"}
          className={`${size} rounded-full object-cover border-4 border-white shadow-lg`}
          onError={(e) => {
            e.target.src = "/avatar.png";
          }}
        />
        <div className="absolute bottom-2 right-2 bg-blue-500 p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors">
          <FaCamera className="text-white text-sm" />
        </div>
      </div>
    );
  };

  // Calculate user stats
  const userStats = {
    totalComplaints: usercomplaints.length,
    totalUpvotes: usercomplaints.reduce(
      (sum, complaint) => sum + (complaint.upvote || 0),
      0
    ),
    totalDownvotes: usercomplaints.reduce(
      (sum, complaint) => sum + (complaint.downvote || 0),
      0
    ),
    totalComments: usercomplaints.reduce(
      (sum, complaint) => sum + (complaint.commentsCount || 0),
      0
    ),
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update API call
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      fullname: authUser.fullname || "",
      email: authUser.email || "",
    });
    setIsEditing(false);
  };

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login
          </h2>
          <p className="text-gray-600">
            You need to be logged in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-6 left-8">
              <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
              <p className="text-blue-100">
                Manage your account and view your complaints
              </p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="px-8 py-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 -mt-20">
              {/* Avatar */}
              <div className="relative z-10">{renderUserAvatar(authUser)}</div>

              {/* User Details */}
              <div className="flex-1 md:mt-20">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editedProfile.fullname}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            fullname: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {authUser.fullname}
                      </h2>
                      <button
                        onClick={handleEditProfile}
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEdit />
                      </button>
                    </div>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-500" />
                        <span>{authUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-500" />
                        <span>Joined {formatDate(authUser.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FaClipboardList className="text-blue-500 text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.totalComplaints}
            </h3>
            <p className="text-gray-600 text-sm">Total Complaints</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FaThumbsDown className="text-red-500 text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.totalDownvotes}
            </h3>
            <p className="text-gray-600 text-sm">Total Downvotes</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FaThumbsUp className="text-green-500 text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.totalUpvotes}
            </h3>
            <p className="text-gray-600 text-sm">Total Upvotes</p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FaComments className="text-purple-500 text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.totalComments}
            </h3>
            <p className="text-gray-600 text-sm">Total Comments</p>
          </div>
        </div>

        {/* My Complaints Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <FaClipboardList className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  My Complaints
                </h2>
                <p className="text-gray-600">
                  {userStats.totalComplaints > 0
                    ? `You have submitted ${
                        userStats.totalComplaints
                      } complaint${userStats.totalComplaints !== 1 ? "s" : ""}`
                    : "You haven't submitted any complaints yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {isFetchingUserComplaints ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <LoadingCard key={index} />
                ))}
              </div>
            ) : usercomplaints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {usercomplaints.map((complaint) => (
                  <UserComplaintCard
                    key={complaint.id || complaint._id}
                    complaint={complaint}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaClipboardList className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Complaints Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't submitted any complaints yet. Start by reporting
                  issues in your community to make a positive impact.
                </p>
                <button
                  onClick={() => (window.location.href = "/complaint")}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Submit Your First Complaint
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
