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
  FaBookmark,
  FaFilter,
  FaSearch,
  FaPlus,
  FaClock,
  FaFire,
  FaChartLine,
  FaMap,
} from "react-icons/fa";

const HomePage = () => {
  const { authUser } = useStoreAuth();
  const [activeFilter, setActiveFilter] = useState("trending");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

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

  console.log("Auth User:", authUser);

  // Enhanced sample complaint data
  const [complaints] = useState([
    {
      _id: "1",
      title: "Large pothole causing traffic issues",
      description:
        "A massive pothole has formed on the main road near the bus stop, causing vehicles to swerve dangerously. This has been an ongoing issue for over 2 weeks now.",
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
      userHasVoted: null,
      createdAt: "2024-03-15T10:30:00Z",
      status: "pending",
      category: "infrastructure",
      priority: "high",
    },
    {
      _id: "2",
      title: "Broken street light creating safety hazard",
      description:
        "The main street light has been broken for 5 days, making it dangerous for pedestrians at night. Multiple accidents have been reported.",
      lat: 19.076,
      lng: 72.8777,
      address: "Hill Road, Bandra West, Mumbai, Maharashtra 400050, India",
      media: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop",
        "https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=500&h=400&fit=crop",
      ],
      upvotes: 32,
      downvotes: 1,
      userHasVoted: "up",
      createdAt: "2024-03-14T15:20:00Z",
      status: "in-progress",
      category: "safety",
      priority: "urgent",
    },
    {
      _id: "3",
      title: "Garbage not collected for a week",
      description:
        "Waste management has not collected garbage from our society for over a week. The bins are overflowing and creating hygiene issues.",
      lat: 19.0761,
      lng: 72.8778,
      address: "Carter Road, Bandra West, Mumbai, Maharashtra 400050, India",
      media: [
        "https://images.unsplash.com/photo-1558618666-f3c94df2df82?w=500&h=400&fit=crop",
      ],
      upvotes: 28,
      downvotes: 5,
      userHasVoted: null,
      createdAt: "2024-03-13T09:15:00Z",
      status: "pending",
      category: "sanitation",
      priority: "medium",
    },
    {
      _id: "4",
      title: "Water logging during monsoon",
      description:
        "Severe water logging occurs every monsoon season at this junction, disrupting daily life and business activities.",
      lat: 19.0759,
      lng: 72.8776,
      address: "Turner Road, Bandra West, Mumbai, Maharashtra 400050, India",
      media: [
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500&h=400&fit=crop",
        "https://images.unsplash.com/photo-1573160813959-df05f9cec837?w=500&h=400&fit=crop",
      ],
      upvotes: 67,
      downvotes: 8,
      userHasVoted: null,
      createdAt: "2024-03-12T14:45:00Z",
      status: "resolved",
      category: "infrastructure",
      priority: "high",
    },
  ]);

  const filterOptions = [
    { key: "trending", label: "Trending", icon: FaChartLine },
    { key: "recent", label: "Recent", icon: FaClock },
  ];

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeFilter) {
      case "recent":
        return true; // Already sorted by date
      case "urgent":
        return complaint.priority === "urgent" || complaint.priority === "high";
      case "trending":
      default:
        return complaint.upvotes > 20; // High engagement posts
    }
  });

  return (
    <div
      className="min-h-screen p-20 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e8f4f8 100%)`,
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
            style={{ backgroundColor: "#0f70cd" }}
          ></div>
        </div>
        <div
          className="absolute top-40 right-20 animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        >
          <div
            className="w-6 h-6 rounded-full opacity-20"
            style={{ backgroundColor: "#ec8b0a" }}
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
        className="bg-white shadow-sm sticky top-0 z-10 rounded-2xl border-2 border-blue-900 "
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center ">
            {/* Filter Icon and Search Bar Container */}
            <div className="relative flex-1 flex items-center gap-2">
              {/* Filter Icon Button */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="p-3 hover:opacity-80 text-white rounded-xl transition-all duration-200 border"
                  style={{
                    backgroundColor: "#0f70cd",
                    borderColor: "#0f70cd",
                  }}
                >
                  <FaFilter size={16} />
                </button>

                {/* Filter Dropdown */}
                {showFilterDropdown && (
                  <div
                    className="absolute top-full left-0 mt-2 w-56 rounded-xl shadow-lg border z-20"
                    style={{
                      backgroundColor: "#ffffff",
                      borderColor: "#0f70cd",
                    }}
                  >
                    <div className="p-3">
                      <h3
                        className="text-sm font-semibold mb-3"
                        style={{ color: "#0f70cd" }}
                      >
                        Filter Options
                      </h3>

                      {/* Near By Filter */}
                      <div className="mb-4">
                        <label
                          className="block text-xs font-medium mb-2"
                          style={{ color: "#ec8b0a" }}
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
                                style={{ accentColor: "#0f70cd" }}
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
                          className="block text-xs font-medium mb-2"
                          style={{ color: "#ec8b0a" }}
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
                                style={{ accentColor: "#0f70cd" }}
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
                        style={{ borderColor: "#0f70cd" }}
                      >
                        <button
                          className="flex-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors duration-200 hover:opacity-80"
                          style={{ backgroundColor: "#0f70cd" }}
                        >
                          Apply Filters
                        </button>
                        <button
                          className="flex-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors duration-200 hover:opacity-80"
                          style={{ backgroundColor: "#ec8b0a" }}
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
                    borderColor: "#0f70cd",
                    backgroundColor: "#ffffff",
                    "--tw-ring-color": "#0f70cd",
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
                        activeFilter === filter.key ? "#0f70cd" : "#ffffff",
                      border: `1px solid ${
                        activeFilter === filter.key ? "#0f70cd" : "#ec8b0a"
                      }`,
                    }}
                  >
                    <IconComponent size={16} />
                    <span className="text-sm font-medium">{filter.label}</span>
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
          {/* Complaints Grid */}
          {isLoading ? (
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
          {!isLoading && filteredComplaints.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: `linear-gradient(to bottom right, #0f70cd, #ec8b0a)`,
                }}
              >
                <FaSearch className="text-white" size={32} />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: "#0f70cd" }}
              >
                No complaints found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                className="text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:opacity-80"
                style={{ backgroundColor: "#0f70cd" }}
              >
                Report New Issue
              </button>
            </div>
          )}

          {/* Load More Button */}
          {!isLoading && filteredComplaints.length > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setIsLoading(true);
                  // Simulate loading
                  setTimeout(() => setIsLoading(false), 2000);
                }}
                className="text-white border px-8 py-4 rounded-xl font-medium transition-all duration-200 hover:opacity-80 transform hover:scale-105"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "#ec8b0a",
                  color: "#ec8b0a",
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
            <h3 className="text-xl font-bold mb-2" style={{ color: "#0f70cd" }}>
              Please login to view complaints
            </h3>
            <p className="text-gray-600">
              You need to be logged in to access the community reports
            </p>
          </div>
        </div>
      )}
    </div>
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

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "text-white border-transparent";
      case "in-progress":
        return "text-white border-transparent";
      case "pending":
        return "text-white border-transparent";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "resolved":
        return "#0f70cd";
      case "in-progress":
        return "#ec8b0a";
      case "pending":
        return "#6c757d";
      default:
        return "#f8f9fa";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "#dc3545";
      case "high":
        return "#ec8b0a";
      case "medium":
        return "#ffc107";
      case "low":
        return "#0f70cd";
      default:
        return "#6c757d";
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

  const currentMedia = complaint.media[currentMediaIndex];
  const isVideo = currentMedia?.includes(".mp4");

  return (
    <div
      className="rounded-2xl shadow-sm hover:shadow-lg overflow-hidden border transition-all duration-300 hover:transform hover:-translate-y-1"
      style={{ backgroundColor: "#ffffff", borderColor: "#0f70cd" }}
    >
      {/* Header with Status and Priority */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getPriorityColor(complaint.priority) }}
          ></div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              complaint.status
            )}`}
            style={{ backgroundColor: getStatusBgColor(complaint.status) }}
          >
            {complaint.status.replace("-", " ")}
          </span>
        </div>
        <span className="text-xs font-medium" style={{ color: "#ec8b0a" }}>
          {formatTimeAgo(complaint.createdAt)}
        </span>
      </div>

      {/* Media Section */}
      <div className="relative mx-4 mb-4">
        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
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
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
        {complaint.media.length > 1 && (
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

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Title */}
        <h2
          className="font-bold mb-2 text-lg leading-tight line-clamp-2"
          style={{ color: "#0f70cd" }}
        >
          {complaint.title}
        </h2>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-3">
          {complaint.description}
        </p>

        {/* Location */}
        <div
          className="flex items-start space-x-3 mb-4 p-3 rounded-lg"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <FaMapMarkerAlt
            size={16}
            color="#ec8b0a"
            className="mt-0.5 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "#0f70cd" }}
            >
              Location
            </p>
            <p className="text-xs text-gray-600 leading-relaxed truncate">
              {complaint.address}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex items-center justify-between pt-3 border-t"
          style={{ borderColor: "#0f70cd" }}
        >
          <div className="flex items-center space-x-4">
            {/* Upvote */}
            <button
              onClick={() => handleVote("up")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                userVote === "up"
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:text-white hover:opacity-80"
              }`}
              style={{
                backgroundColor: userVote === "up" ? "#0f70cd" : "transparent",
                ":hover": { backgroundColor: "#0f70cd" },
              }}
            >
              <FaArrowUp size={16} />
              <span className="text-sm font-medium">{votes.up}</span>
            </button>

            {/* Downvote */}
            <button
              onClick={() => handleVote("down")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                userVote === "down"
                  ? "text-white shadow-sm"
                  : "text-gray-600 hover:text-white hover:opacity-80"
              }`}
              style={{
                backgroundColor:
                  userVote === "down" ? "#dc3545" : "transparent",
              }}
            >
              <FaArrowDown size={16} />
              <span className="text-sm font-medium">{votes.down}</span>
            </button>

            {/* Share */}
            <button
              className="p-2 text-gray-600 hover:text-white rounded-lg transition-all duration-200"
              style={{ ":hover": { backgroundColor: "#0f70cd" } }}
            >
              <FaShare size={16} />
            </button>
          </div>

          {/* Bookmark */}
          <button
            className="p-2 text-gray-600 hover:text-white rounded-lg transition-all duration-200"
            style={{ ":hover": { backgroundColor: "#ec8b0a" } }}
          >
            <FaBookmark size={16} />
          </button>
        </div>
      </div>

      {/* Floating Map Button - Bottom Right */}
      <Link
        to="/mapView"
        className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl group z-50 border-2"
        style={{
          background: "linear-gradient(135deg, #ec8b0a 0%, #ff9f2e 100%)",
          borderColor: "#ec8b0a",
        }}
        title="View complaints on map"
      >
        <FaMap
          size={20}
          className="text-white group-hover:animate-pulse drop-shadow-sm"
        />
      </Link>
    </div>
  );
};

export default HomePage;
