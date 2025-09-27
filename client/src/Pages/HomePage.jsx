import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStoreAuth } from "../store/useAuthStore";
import LoadingCard from "../Components/LoadingCard";
import ComplaintCard from "../Components/ComplaintCard";
import WhyUsSection from "../Components/WhyUsSection"; // Imported UI Section
import {
  FaFilter,
  FaSearch,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaArrowUp,
  FaArrowDown,
  FaMapMarkerAlt,
  FaShare,
  FaComment,
  FaPlus,
  FaFire,
  FaChartLine,
  FaMap,
} from "react-icons/fa";
import { useComplaintStore } from "../store/useComplaintStore";

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

  const filterOptions = [
    { key: "recent", label: "Recent", icon: FaClock },
    { key: "trending", label: "Trending", icon: FaChartLine },
  ];

  const complaintsArray = Array.isArray(allcomplaints) ? allcomplaints : [];

  const searchFilteredComplaints = complaintsArray.filter((complaint) => {
    const matchesSearch =
      complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredComplaints = [...searchFilteredComplaints].sort((a, b) => {
    if (activeFilter === "trending") {
      return (b.upvote || 0) - (a.upvote || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #FFD95A 0%, rgba(192, 127, 0, 0.1) 50%, #4C3D3D 100%)`,
      }}
    >
      {/* HEADER + SEARCH */}
      <div
        className="sticky top-0 z-10 bg-white shadow-sm p-4"
        style={{ borderBottom: "3px solid #FFD95A" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg font-inter"
              style={{ borderColor: "#FFD95A", color: "#000000" }}
            />
            <FaSearch
              className="absolute left-3 top-3"
              style={{ color: "#C07F00" }}
            />
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto">
            {filterOptions.map((filter) => {
              const IconComponent = filter.icon;
              return (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-inter font-medium transition-colors ${
                    activeFilter === filter.key ? "text-white" : "bg-white"
                  }`}
                  style={
                    activeFilter === filter.key
                      ? { backgroundColor: "#4C3D3D", color: "#FFFFFF" }
                      : {
                          backgroundColor: "#FFFFFF",
                          color: "#4C3D3D",
                          borderColor: "#FFD95A",
                          border: "1px solid",
                        }
                  }
                >
                  <IconComponent size={16} />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* WHY US SECTION */}
      <WhyUsSection />

      {/* COMPLAINTS LIST */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {authUser ? (
          <>
            {!isFetchingComplains && (
              <div className="mb-6">
                <span
                  className="font-inter font-medium"
                  style={{ color: "#4C3D3D" }}
                >
                  {filteredComplaints.length} complaints found
                </span>
              </div>
            )}

            {isFetchingComplains ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredComplaints.map((complaint) => (
                  <ComplaintCard key={complaint._id} complaint={complaint} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            className="text-center py-12 bg-white rounded-xl shadow-lg mx-4"
            style={{ borderTop: "4px solid #FFD95A" }}
          >
            <h3
              className="font-playfair text-xl font-bold mb-2"
              style={{ color: "#4C3D3D" }}
            >
              Please login to view complaints
            </h3>
            <p
              className="font-inter"
              style={{ color: "rgba(76, 61, 61, 0.7)" }}
            >
              Access your community complaint dashboard
            </p>
          </div>
        )}
      </div>

      {/* MAP BUTTON */}
      <Link
        to="/mapView"
        className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full shadow-lg font-medium transition-transform hover:scale-105"
        style={{ background: `linear-gradient(135deg, #FFD95A, #C07F00)` }}
      >
        <FaMap size={20} className="text-white" />
      </Link>
    </div>
  );
};

export default HomePage;
