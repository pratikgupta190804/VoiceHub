import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStoreAuth } from "../store/useAuthStore";
import LoadingCard from "../Components/LoadingCard";
import {
  FaChevronLeft,
  FaChevronRight,
  FaArrowUp,
  FaArrowDown,
  FaMapMarkerAlt,
  FaShare,
  FaComment,
  FaFilter,
  FaSearch,
  FaPlus,
  FaClock,
  FaFire,
  FaChartLine,
  FaMap,
} from "react-icons/fa";
import { useComplaintStore } from "../store/useComplaintStore";
import ComplaintCard from "../Components/ComplaintCard";

const HomePage = () => {
  const { authUser } = useStoreAuth();
  const [activeFilter, setActiveFilter] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  const { isFetchingComplains, allcomplaints, getAllComplaints } =
    useComplaintStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    getAllComplaints();
  }, [getAllComplaints]);

  console.log("Auth User:", authUser);
  console.log("All complaints:", allcomplaints, "Type:", typeof allcomplaints);

  const filterOptions = [
    { key: "recent", label: "Recent", icon: FaClock },
    { key: "trending", label: "Trending", icon: FaChartLine },
  ];

  // Ensure allcomplaints is an array before filtering
  const complaintsArray = Array.isArray(allcomplaints) ? allcomplaints : [];

  // First filter by search term
  const searchFilteredComplaints = complaintsArray.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Then sort based on active filter
  const filteredComplaints = [...searchFilteredComplaints].sort((a, b) => {
    switch (activeFilter) {
      case "trending": {
        // Sort by upvote count (highest first)
        const aUpvotes = a.upvote || 0;
        const bUpvotes = b.upvote || 0;
        return bUpvotes - aUpvotes;
      }

      case "recent":
      default: {
        // Sort by creation date (most recent first) - this is already the default from backend
        const aDate = new Date(a.createdAt || 0);
        const bDate = new Date(b.createdAt || 0);
        return bDate - aDate;
      }
    }
  });

  return (
    <div
      className="min-h-screen p-20 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #EBD3F8 0%, #AD49E1 50%, #7A1CAC 100%)`,
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Community Icons */}
        <div
          className="absolute top-20 left-10 animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        >
          <div
            className="w-8 h-8 rounded-full opacity-20"
            style={{ backgroundColor: "#7A1CAC" }}
          ></div>
        </div>
        <div
          className="absolute top-40 right-20 animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        >
          <div
            className="w-6 h-6 rounded-full opacity-20"
            style={{ backgroundColor: "#E8DFCA" }}
          ></div>
        </div>
        <div
          className="absolute top-60 left-1/4 animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        >
          <div
            className="w-10 h-10 rounded-full opacity-15"
            style={{ backgroundColor: "#0f70cd" }}
          ></div>
        </div>
        <div
          className="absolute bottom-40 right-10 animate-bounce"
          style={{ animationDelay: "0.5s", animationDuration: "4.5s" }}
        >
          <div
            className="w-7 h-7 rounded-full opacity-20"
            style={{ backgroundColor: "#ec8b0a" }}
          ></div>
        </div>
        <div
          className="absolute bottom-20 left-20 animate-bounce"
          style={{ animationDelay: "1.5s", animationDuration: "3.2s" }}
        >
          <div
            className="w-5 h-5 rounded-full opacity-25"
            style={{ backgroundColor: "#0f70cd" }}
          ></div>
        </div>

        {/* Additional Floating Elements */}
        <div
          className="absolute top-1/3 left-1/3 animate-bounce"
          style={{ animationDelay: "3s", animationDuration: "5s" }}
        >
          <div
            className="w-4 h-4 rotate-45 opacity-15"
            style={{ backgroundColor: "#ec8b0a" }}
          ></div>
        </div>
        <div
          className="absolute top-3/4 right-1/3 animate-bounce"
          style={{ animationDelay: "2.5s", animationDuration: "4.2s" }}
        >
          <div
            className="w-6 h-6 rotate-45 opacity-18"
            style={{ backgroundColor: "#0f70cd" }}
          ></div>
        </div>
        <div
          className="absolute top-1/2 left-10 animate-bounce"
          style={{ animationDelay: "1.8s", animationDuration: "3.8s" }}
        >
          <div
            className="w-3 h-3 rounded-full opacity-22"
            style={{ backgroundColor: "#ec8b0a" }}
          ></div>
        </div>
        <div
          className="absolute top-1/6 right-1/2 animate-bounce"
          style={{ animationDelay: "0.3s", animationDuration: "4.7s" }}
        >
          <div
            className="w-8 h-8 rotate-12 opacity-12"
            style={{ backgroundColor: "#0f70cd" }}
          ></div>
        </div>

        {/* Geometric Patterns */}
        <div
          className="absolute top-32 right-1/4 opacity-10 animate-spin"
          style={{ animationDuration: "20s" }}
        >
          <div
            className="w-16 h-16 border-2 border-dashed rounded-full"
            style={{ borderColor: "#0f70cd" }}
          ></div>
        </div>
        <div
          className="absolute bottom-32 left-1/3 opacity-15 animate-spin"
          style={{ animationDuration: "15s", animationDirection: "reverse" }}
        >
          <div
            className="w-20 h-20 border-2 border-dotted rounded-full"
            style={{ borderColor: "#ec8b0a" }}
          ></div>
        </div>
        <div
          className="absolute top-1/2 right-20 opacity-8 animate-spin"
          style={{ animationDuration: "25s" }}
        >
          <div
            className="w-12 h-12 border border-solid rounded-full"
            style={{ borderColor: "#0f70cd" }}
          ></div>
        </div>
        <div
          className="absolute bottom-1/4 left-1/4 opacity-12 animate-spin"
          style={{ animationDuration: "18s", animationDirection: "reverse" }}
        >
          <div
            className="w-14 h-14 border-2 border-double rounded-full"
            style={{ borderColor: "#ec8b0a" }}
          ></div>
        </div>

        {/* Moving Triangles */}
        <div
          className="absolute top-1/4 left-1/2 opacity-8 animate-pulse"
          style={{ animationDuration: "6s" }}
        >
          <div
            className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent"
            style={{ borderBottomColor: "#0f70cd" }}
          ></div>
        </div>
        <div
          className="absolute bottom-1/3 right-1/4 opacity-10 animate-pulse"
          style={{ animationDuration: "7s", animationDelay: "2s" }}
        >
          <div
            className="w-0 h-0 border-l-6 border-r-6 border-t-10 border-transparent"
            style={{ borderTopColor: "#ec8b0a" }}
          ></div>
        </div>

        {/* Floating Icons representing complaints */}
        <div
          className="absolute top-16 left-1/2 opacity-5 animate-bounce"
          style={{ animationDelay: "4s", animationDuration: "6s" }}
        >
          <div className="text-2xl" style={{ color: "#0f70cd" }}>
            🏗️
          </div>
        </div>
        <div
          className="absolute bottom-16 right-1/3 opacity-5 animate-bounce"
          style={{ animationDelay: "1.2s", animationDuration: "5.5s" }}
        >
          <div className="text-2xl" style={{ color: "#ec8b0a" }}>
            🚦
          </div>
        </div>
        <div
          className="absolute top-1/3 right-10 opacity-5 animate-bounce"
          style={{ animationDelay: "3.5s", animationDuration: "4.8s" }}
        >
          <div className="text-2xl" style={{ color: "#0f70cd" }}>
            🗑️
          </div>
        </div>
        <div
          className="absolute bottom-1/2 left-1/4 opacity-5 animate-bounce"
          style={{ animationDelay: "2.8s", animationDuration: "5.2s" }}
        >
          <div className="text-2xl" style={{ color: "#ec8b0a" }}>
            🌳
          </div>
        </div>
        <div
          className="absolute top-2/3 left-1/3 opacity-5 animate-bounce"
          style={{ animationDelay: "5.2s", animationDuration: "4.5s" }}
        >
          <div className="text-2xl" style={{ color: "#0f70cd" }}>
            💡
          </div>
        </div>
        <div
          className="absolute bottom-1/4 right-1/2 opacity-5 animate-bounce"
          style={{ animationDelay: "3.8s", animationDuration: "5.8s" }}
        >
          <div className="text-2xl" style={{ color: "#ec8b0a" }}>
            🛣️
          </div>
        </div>

        {/* Particle Effects - Small moving dots */}
        <div
          className="absolute top-1/4 left-1/5 w-1 h-1 rounded-full opacity-20 animate-ping"
          style={{ backgroundColor: "#0f70cd", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/5 w-1 h-1 rounded-full opacity-20 animate-ping"
          style={{
            backgroundColor: "#ec8b0a",
            animationDuration: "4s",
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-1 h-1 rounded-full opacity-20 animate-ping"
          style={{
            backgroundColor: "#0f70cd",
            animationDuration: "3.5s",
            animationDelay: "2s",
          }}
        ></div>
        <div
          className="absolute bottom-1/5 left-1/2 w-1 h-1 rounded-full opacity-20 animate-ping"
          style={{
            backgroundColor: "#ec8b0a",
            animationDuration: "4.5s",
            animationDelay: "0.5s",
          }}
        ></div>

        {/* Floating Voice Bubbles representing anonymous complaints */}
        <div
          className="absolute top-1/5 right-1/3 opacity-8 animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        >
          <div
            className="w-8 h-6 rounded-full border-2 relative"
            style={{ borderColor: "#0f70cd" }}
          >
            <div
              className="absolute -bottom-1 left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent"
              style={{ borderTopColor: "#0f70cd" }}
            ></div>
          </div>
        </div>
        <div
          className="absolute bottom-1/5 left-1/5 opacity-8 animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "3s" }}
        >
          <div
            className="w-10 h-7 rounded-full border-2 relative"
            style={{ borderColor: "#ec8b0a" }}
          >
            <div
              className="absolute -bottom-1 right-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent"
              style={{ borderTopColor: "#ec8b0a" }}
            ></div>
          </div>
        </div>
        <div
          className="absolute top-2/3 right-1/5 opacity-8 animate-pulse"
          style={{ animationDuration: "4.5s", animationDelay: "2s" }}
        >
          <div
            className="w-7 h-5 rounded-full border-2 relative"
            style={{ borderColor: "#0f70cd" }}
          >
            <div
              className="absolute -bottom-1 left-3 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent"
              style={{ borderTopColor: "#0f70cd" }}
            ></div>
          </div>
        </div>

        {/* Hexagonal Patterns */}
        <div
          className="absolute top-1/6 left-2/3 opacity-6 animate-pulse"
          style={{ animationDuration: "8s" }}
        >
          <svg width="40" height="40" viewBox="0 0 100 100">
            <polygon
              points="30,20 70,20 85,50 70,80 30,80 15,50"
              fill="none"
              stroke="#ec8b0a"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div
          className="absolute bottom-1/6 right-2/3 opacity-6 animate-pulse"
          style={{ animationDuration: "7s", animationDelay: "4s" }}
        >
          <svg width="30" height="30" viewBox="0 0 100 100">
            <polygon
              points="30,20 70,20 85,50 70,80 30,80 15,50"
              fill="none"
              stroke="#0f70cd"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div
          className="absolute bottom-32 left-1/3 opacity-15 animate-spin"
          style={{ animationDuration: "15s", animationDirection: "reverse" }}
        >
          <div
            className="w-20 h-20 border-2 border-dotted rounded-full"
            style={{ borderColor: "#ec8b0a" }}
          ></div>
        </div>

        {/* Indian-inspired Mandala Patterns */}
        <div
          className="absolute top-10 right-10 opacity-5 animate-pulse"
          style={{ animationDuration: "4s" }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#0f70cd"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="30"
              fill="none"
              stroke="#ec8b0a"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              stroke="#0f70cd"
              strokeWidth="1"
            />
            <circle
              cx="50"
              cy="50"
              r="10"
              fill="none"
              stroke="#ec8b0a"
              strokeWidth="1"
            />
          </svg>
        </div>
        <div
          className="absolute bottom-10 left-10 opacity-5 animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "2s" }}
        >
          <svg width="60" height="60" viewBox="0 0 100 100">
            <polygon
              points="50,15 85,35 85,65 50,85 15,65 15,35"
              fill="none"
              stroke="#0f70cd"
              strokeWidth="1"
            />
            <polygon
              points="50,25 75,40 75,60 50,75 25,60 25,40"
              fill="none"
              stroke="#ec8b0a"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Connection Lines representing community network */}
        <div className="absolute inset-0 opacity-5">
          <svg
            width="100%"
            height="100%"
            className="animate-pulse"
            style={{ animationDuration: "6s" }}
          >
            <path
              d="M 100 200 Q 300 100 500 300 T 900 200"
              stroke="#0f70cd"
              strokeWidth="1"
              fill="none"
              strokeDasharray="5,5"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;10;0"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M 200 100 Q 400 300 600 150 T 800 400"
              stroke="#ec8b0a"
              strokeWidth="1"
              fill="none"
              strokeDasharray="3,7"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="10;0;10"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        {/* Floating Text Elements */}
        <div
          className="absolute top-1/4 left-5 opacity-10 animate-pulse"
          style={{ animationDuration: "8s" }}
        >
          <div
            className="text-4xl font-bold transform -rotate-12"
            style={{ color: "#0f70cd" }}
          >
            सुधार
          </div>
        </div>
        <div
          className="absolute top-1/3 right-5 opacity-10 animate-pulse"
          style={{ animationDuration: "7s", animationDelay: "3s" }}
        >
          <div
            className="text-3xl font-bold transform rotate-12"
            style={{ color: "#ec8b0a" }}
          >
            समाज
          </div>
        </div>
        <div
          className="absolute bottom-1/4 right-1/4 opacity-8 animate-pulse"
          style={{ animationDuration: "9s", animationDelay: "1s" }}
        >
          <div
            className="text-2xl font-bold transform -rotate-6"
            style={{ color: "#0f70cd" }}
          >
            एकता
          </div>
        </div>

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0f70cd 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>
      {/* Header Section with Search and Filters */}
      <div
        className="shadow-sm sticky top-0 z-10 rounded-2xl border-2"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#7A1CAC",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Left side: Filter and Search */}
            <div className="relative flex-1 flex items-center gap-2">
              {/* Filter Icon Button */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="p-3 hover:opacity-80 text-white rounded-xl transition-all duration-200 border"
                  style={{
                    backgroundColor: "#7A1CAC",
                    borderColor: "#7A1CAC",
                  }}
                >
                  <FaFilter size={16} />
                </button>

                {/* Filter Dropdown */}
                {showFilterDropdown && (
                  <div
                    className="absolute top-full left-0 mt-2 w-56 rounded-xl shadow-lg border z-20"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#7A1CAC",
                    }}
                  >
                    <div className="p-3">
                      <h3
                        className="heading text-sm mb-3"
                        style={{ color: "#7A1CAC" }}
                      >
                        Filter Options
                      </h3>

                      {/* Near By Filter */}
                      <div className="mb-4">
                        <label
                          className="label block text-xs mb-2"
                          style={{ color: "#AD49E1" }}
                        >
                          Near By
                        </label>
                        <div className="space-y-2">
                          {["1km", "5km"].map((distance) => (
                            <label key={distance} className="flex items-center">
                              <input
                                type="radio"
                                name="distance"
                                value={distance}
                                className="h-3 w-3 border-gray-300 focus:ring-2"
                                style={{ accentColor: "#7A1CAC" }}
                              />
                              <span className="ml-2 text-sm text-gray-700 capitalize">
                                {distance === "all"
                                  ? "All Distances"
                                  : `Within ${distance}`}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div className="mb-4">
                        <label
                          className="label block text-xs mb-2"
                          style={{ color: "#AD49E1" }}
                        >
                          Category
                        </label>
                        <div className="space-y-2">
                          {[
                            "all",
                            "infrastructure",
                            "safety",
                            "sanitation",
                            "environment",
                          ].map((category) => (
                            <label key={category} className="flex items-center">
                              <input
                                type="radio"
                                name="category"
                                value={category}
                                className="h-3 w-3 border-gray-300 focus:ring-2"
                                style={{ accentColor: "#7A1CAC" }}
                              />
                              <span className="ml-2 text-sm text-gray-700 capitalize">
                                {category === "all"
                                  ? "All Categories"
                                  : category}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div
                        className="flex gap-2 pt-3 border-t"
                        style={{ borderColor: "#7A1CAC" }}
                      >
                        <button
                          className="btn flex-1 px-3 py-2 text-xs text-white rounded-lg transition-colors duration-200 hover:opacity-80"
                          style={{ backgroundColor: "#7A1CAC" }}
                        >
                          Apply Filters
                        </button>
                        <button
                          className="btn flex-1 px-3 py-2 text-xs text-white rounded-lg transition-colors duration-200 hover:opacity-80"
                          style={{ backgroundColor: "#AD49E1" }}
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{
                    borderColor: "#7A1CAC",
                    backgroundColor: "#FFFFFF",
                    "--tw-ring-color": "#7A1CAC",
                  }}
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              {filterOptions.map((filter) => {
                const IconComponent = filter.icon;
                return (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all duration-200 ${
                      activeFilter === filter.key
                        ? "text-white shadow-md"
                        : "text-gray-700 hover:opacity-80"
                    }`}
                    style={{
                      backgroundColor:
                        activeFilter === filter.key ? "#7A1CAC" : "#FFFFFF",
                      border: `1px solid ${
                        activeFilter === filter.key ? "#7A1CAC" : "#AD49E1"
                      }`,
                    }}
                  >
                    <IconComponent size={16} />
                    <span className="nav-link text-sm">{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {authUser ? (
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Results Summary */}
          {!isFetchingComplains && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {filteredComplaints.length} complaint
                  {filteredComplaints.length !== 1 ? "s" : ""} found
                  {searchTerm && ` for "${searchTerm}"`}
                </span>
                <span className="flex items-center gap-2">
                  <span>Sorted by:</span>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor:
                        activeFilter === "trending" ? "#7A1CAC" : "#AD49E1",
                      color: "white",
                    }}
                  >
                    {activeFilter === "trending"
                      ? "Most Upvoted"
                      : "Most Recent"}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Complaints Grid */}
          {isFetchingComplains ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }, (_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredComplaints.map((complaint) => (
                <div key={complaint._id} className="animate-slide-up">
                  <ComplaintCard complaint={complaint} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isFetchingComplains && filteredComplaints.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: `linear-gradient(to bottom right, #7A1CAC, #AD49E1)`,
                }}
              >
                <FaSearch className="text-white" size={32} />
              </div>
              <h3 className="heading text-xl mb-2" style={{ color: "#7A1CAC" }}>
                No complaints found
              </h3>
              <p className="body-text text-gray-600 mb-6">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}

          {/* Load More Button */}
          {!isFetchingComplains && filteredComplaints.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  // Refresh complaints data
                  getAllComplaints();
                }}
                className="btn text-white border px-8 py-4 rounded-xl transition-all duration-200 hover:opacity-80 transform hover:scale-105"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#AD49E1",
                  color: "#7A1CAC",
                }}
              >
                Load More Reports
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h3 className="heading text-xl mb-2" style={{ color: "#7A1CAC" }}>
              Please login to view complaints
            </h3>
            <p className="body-text text-gray-600">
              You need to be logged in to access the community reports
            </p>
          </div>
        </div>
      )}

      {/* Floating Map Button - Bottom Right */}
      <Link
        to="/mapView"
        className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl group z-50 border-2 "
        style={{
          background: "linear-gradient(135deg, #AD49E1 0%, #7A1CAC 100%)",
          borderColor: "#AD49E1",
        }}
        title="View Map"
      >
        <FaMap
          size={20}
          className="text-white group-hover:animate-pulse drop-shadow-sm "
        />
      </Link>
    </div>
  );
};

export default HomePage;
