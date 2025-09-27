import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Map,
  Marker,
  Popup,
  NavigationControl,
  GeolocateControl,
  Source,
  Layer,
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import * as turf from "@turf/turf";
import {
  FaMapMarkerAlt,
  FaHome,
  FaFilter,
  FaSearch,
  FaClock,
  FaChartLine,
} from "react-icons/fa";
import { useStoreAuth } from "../store/useAuthStore";
import { useComplaintStore } from "../store/useComplaintStore";

// Custom styles for smaller map controls
const customStyles = `
  .maplibregl-ctrl-group {
    border-radius: 6px !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15) !important;
  }
  
  .maplibregl-ctrl-group button {
    width: 24px !important;
    height: 24px !important;
    font-size: 12px !important;
    line-height: 1 !important;
  }
  
  .maplibregl-ctrl-zoom-in,
  .maplibregl-ctrl-zoom-out {
    width: 24px !important;
    height: 24px !important;
    font-size: 14px !important;
  }
  
  .maplibregl-ctrl-geolocate {
    width: 24px !important;
    height: 24px !important;
  }
  
  .maplibregl-ctrl-geolocate .maplibregl-ctrl-icon {
    width: 16px !important;
    height: 16px !important;
  }
  
  .maplibregl-ctrl-compass {
    width: 24px !important;
    height: 24px !important;
  }
`;

/*

// Can be used to convert lat . long to word address 

async function getAddressFromCoords(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  );
  const data = await response.json();
  return data.display_name; // This is the full address
}

// Usage:
getAddressFromCoords(19.076, 72.8777).then(address => {
    console.log(address); // e.g., "Mumbai, Mumbai Suburban, Maharashtra, India"
});

*/

// will accept complaints array as prop in future
const MapView = () => {
  const { toggleNav } = useStoreAuth();
  const { allcomplaints, getAllComplaints } = useComplaintStore();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDistance, setSelectedDistance] = useState("all");
  const filterDropdownRef = useRef(null);

  // Map states
  const [viewState, setViewState] = useState({
    longitude: 72.7834,
    latitude: 19.7060,
    zoom: 14,
  });
  const [mapZoom, setMapZoom] = useState(15);
  const [selected, setSelected] = useState(null);
  
  // User location state
  const [userLocation, setUserLocation] = useState([72.7834, 19.7060]); // Default coordinates: 19.7060° N, 72.7835° E 19.7060, 72.7834

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

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          setViewState(prev => ({
            ...prev,
            longitude,
            latitude
          }));
        },
        (error) => {
          console.warn('Error getting location:', error);
          // Keep default coordinates (19.7060° N, 72.7835° E) if geolocation fails
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Inject custom styles for smaller controls
  useEffect(() => {
    toggleNav(false);
    getAllComplaints(); // Fetch complaints when component mounts
    const styleElement = document.createElement("style");
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      toggleNav(true);
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [getAllComplaints, toggleNav]);

  // Create dynamic geofence based on selected distance
  const createGeofence = (distance, location = userLocation) => {
    if (distance === "all") return null;
    
    const distanceValue = parseFloat(distance.replace('km', ''));
    return turf.circle(location, distanceValue, { units: "kilometers" });
  };

  // A circle of 2 mile radius around me - using [longitude, latitude] format (legacy)
  const GEOFENCE = turf.circle(userLocation, 2, { units: "miles" });
  
  // Dynamic geofence based on selected distance
  const dynamicGeofence = createGeofence(selectedDistance, userLocation);

  console.log("mapzoom", mapZoom);

  // Filtering logic - filter by search term, category, and distance
  const complaintsArray = Array.isArray(allcomplaints) ? allcomplaints : [];

  // Filter by search term, category, and distance
  const filteredComplaints = complaintsArray.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || complaint.category === selectedCategory;

    // Distance filter (using proper geospatial calculations)
    let matchesDistance = true;
    if (selectedDistance !== "all" && complaint.location?.coordinates) {
      const [lng, lat] = complaint.location.coordinates;
      const complaintPoint = turf.point([lng, lat]);
      const userPoint = turf.point(userLocation);
      const distance = turf.distance(userPoint, complaintPoint, { units: "kilometers" });
      
      const distanceValue = parseFloat(selectedDistance.replace('km', ''));
      if (distance > distanceValue) matchesDistance = false;
    }

    return matchesSearch && matchesCategory && matchesDistance;
  });

  // Constant marker size of 20px but hide when zoomed out
  const shouldShowMarker = (zoom) => {
    return zoom >= 10; // Only show markers when zoom level is 10 or higher
  };

  const getMarkerSize = () => {
    return 20; // Always 20px when visible
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Header Section with Search and Filters */}
      <div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-sm z-20 rounded-2xl border-2 border-blue-900"
        style={{
          backgroundColor: "#ffffff",
          width: "80%",
          maxWidth: "900px",
        }}
      >
        <div className="px-4 py-3">
          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4">
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

                      {/* Distance Filter */}
                      <div className="mb-4">
                        <label
                          className="block text-xs font-medium mb-2"
                          style={{ color: "#ec8b0a" }}
                        >
                          Distance
                        </label>
                        <div className="space-y-2">
                          {["all", "1km", "5km", "10km"].map((distance) => (
                            <label key={distance} className="flex items-center">
                              <input
                                type="radio"
                                name="distance"
                                value={distance}
                                checked={selectedDistance === distance}
                                onChange={(e) =>
                                  setSelectedDistance(e.target.value)
                                }
                                className="h-3 w-3 border-gray-300 focus:ring-2"
                                style={{ accentColor: "#0f70cd" }}
                              />
                              <span className="ml-2 text-sm text-gray-700 capitalize flex items-center gap-2">
                                {distance === "all"
                                  ? "All Distances"
                                  : `Within ${distance}`}
                                {distance !== "all" && selectedDistance === distance && (
                                  <span 
                                    className="inline-block w-2 h-2 rounded-full"
                                    style={{ backgroundColor: "#3B82F6" }}
                                    title="Geofence active"
                                  />
                                )}
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
                                checked={selectedCategory === category}
                                onChange={(e) =>
                                  setSelectedCategory(e.target.value)
                                }
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
                          onClick={() => {
                            setSelectedCategory("all");
                            setSelectedDistance("all");
                          }}
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
                  placeholder="Search complaints on map..."
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

          </div>
        </div>
      </div>

      {/* Status Legend - Bottom Left */}
      <div
        className="absolute bottom-20 left-4 bg-white shadow-lg rounded-lg border p-3 z-20"
        style={{ borderColor: "#0f70cd" }}
      >
        <h4 className="text-xs font-semibold mb-2" style={{ color: "#0f70cd" }}>
          Map Legend
        </h4>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Resolved</span>
          </div>
          {selectedDistance !== "all" && (
            <>
              <div className="border-t border-gray-200 my-1"></div>
              <div className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-1 rounded-full"
                  style={{ backgroundColor: "#3B82F6", borderRadius: "1px" }}
                ></div>
                <span>Distance Filter ({selectedDistance})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div 
                  className="w-3 h-3 rounded-full border-2"
                  style={{ 
                    borderColor: "#3B82F6",
                    backgroundColor: "transparent"
                  }}
                ></div>
                <span>Your Location</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map Component */}
      <Map
        mapLib={import("maplibre-gl")}
        initialViewState={viewState}
        onMove={(evt) => {
          setMapZoom(evt.viewState.zoom);
          const newCenter = [evt.viewState.longitude, evt.viewState.latitude];
          // Only update the view state if the center is inside the geofence
          if (turf.booleanPointInPolygon(newCenter, GEOFENCE)) {
            setViewState(evt.viewState);
          }
        }}
        style={{ width: "100%", height: "100vh", paddingTop: "100px" }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
      >
        <NavigationControl position="top-right" />
        <GeolocateControl 
          position="top-right"
          onGeolocate={(e) => {
            const { longitude, latitude } = e.coords;
            setUserLocation([longitude, latitude]);
          }}
        />

        {/* Dynamic Geofence circle based on selected distance */}
        {dynamicGeofence && (
          <Source id="dynamic-geofence" type="geojson" data={dynamicGeofence}>
            <Layer
              id="geofence-fill"
              type="fill"
              paint={{
                "fill-color": "#3B82F6",
                "fill-opacity": 0.1,
              }}
            />
            <Layer
              id="geofence-line"
              type="line"
              paint={{
                "line-color": "#3B82F6",
                "line-width": 2,
                "line-opacity": 0.8,
                "line-dasharray": [5, 5],
              }}
            />
          </Source>
        )}

        {/* User location marker */}
        <Marker
          longitude={userLocation[0]}
          latitude={userLocation[1]}
          anchor="center"
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: "#3B82F6",
              border: "3px solid white",
              boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
            }}
          />
        </Marker>

        {filteredComplaints.map((complaint) => {
          // Don't render marker if zoomed out too much
          if (!shouldShowMarker(mapZoom)) return null;

          // Skip complaints without valid location data
          if (
            !complaint.location ||
            !complaint.location.coordinates ||
            complaint.location.coordinates.length !== 2
          ) {
            return null;
          }

          const [longitude, latitude] = complaint.location.coordinates;
          const markerSize = getMarkerSize();

          return (
            <Marker
              key={complaint._id}
              longitude={longitude}
              latitude={latitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelected(complaint);
              }}
            >
              {/* Simple small dot marker - constant 20px when visible */}
              <div
                style={{
                  width: markerSize,
                  height: markerSize,
                  borderRadius: "50%",
                  backgroundColor:
                    complaint.status === "resolved"
                      ? "#10B981"
                      : complaint.status === "in-progress"
                      ? "#F59E0B"
                      : "#EF4444",
                  border: "2px solid white",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </Marker>
          );
        })}

        {selected && (
          <>
            {/* Overlay to close popup when clicked */}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.3)",
                zIndex: 1000,
              }}
              onClick={() => setSelected(null)}
            />

            {/* Left sidebar popup */}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 400,
                height: "100vh",
                backgroundColor: "white",
                zIndex: 1001,
                overflowY: "auto",
                boxShadow: "2px 0 20px rgba(0,0,0,0.15)",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  border: "none",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#666",
                  zIndex: 10,
                }}
              >
                ×
              </button>

              {/* Main image */}
              <div style={{ width: "100%", height: 200, overflow: "hidden" }}>
                {selected.media && selected.media.length > 0 ? (
                  selected.media[0].type === "video" ? (
                    <video
                      src={selected.media[0].url}
                      poster="/no-video.png"
                      controls
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <img
                      src={selected.media[0].url}
                      alt="Complaint"
                      onError={(e) => {
                        e.target.src = "/no-img.png";
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )
                ) : (
                  <img
                    src="/no-img.png"
                    alt="No media"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div style={{ padding: 24 }}>
                {/* Title */}
                <h2
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#1F2937",
                    lineHeight: "1.4",
                    paddingRight: 40, // Space for close button
                  }}
                >
                  {selected.title}
                </h2>

                {/* Location */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <FaMapMarkerAlt
                      size={18}
                      color="#ec8b0a"
                      style={{ marginRight: 8 }}
                    />
                    <span
                      style={{
                        fontSize: 14,
                        color: "#6B7280",
                        fontWeight: 500,
                      }}
                    >
                      Location
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#374151",
                      paddingLeft: 24,
                    }}
                  >
                    {selected.location?.namedAddress ||
                      `${selected.location?.coordinates[1]?.toFixed(
                        4
                      )}, ${selected.location?.coordinates[0]?.toFixed(4)}`}
                  </p>
                </div>

                {/* Status and Category */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 4,
                        backgroundColor:
                          selected.status === "resolved"
                            ? "#10B981"
                            : selected.status === "in-progress"
                            ? "#F59E0B"
                            : "#EF4444",
                        color: "white",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    >
                      {selected.status}
                    </span>
                    {selected.category && (
                      <span
                        style={{
                          fontSize: 12,
                          padding: "4px 8px",
                          borderRadius: 4,
                          backgroundColor: "#E5E7EB",
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {selected.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Voting Stats */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <span style={{ color: "#10B981", fontSize: 16 }}>👍</span>
                      <span
                        style={{
                          fontSize: 14,
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {selected.upvote || 0}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <span style={{ color: "#EF4444", fontSize: 16 }}>👎</span>
                      <span
                        style={{
                          fontSize: 14,
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {selected.downvote || 0}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <span style={{ color: "#6B7280", fontSize: 16 }}>💬</span>
                      <span
                        style={{
                          fontSize: 14,
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {selected.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 24 }}>
                  <h3
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1F2937",
                    }}
                  >
                    Description
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#6B7280",
                      lineHeight: "1.6",
                    }}
                  >
                    {selected.description || "No description provided."}
                  </p>
                </div>

                {/* Media Section */}
                <div>
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#1F2937",
                    }}
                  >
                    Media ({selected.media?.length || 0})
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 8,
                    }}
                  >
                    {selected.media?.map((mediaItem, index) => (
                      <div
                        key={index}
                        style={{
                          borderRadius: 8,
                          overflow: "hidden",
                          aspectRatio: "1",
                          backgroundColor: "#F3F4F6",
                        }}
                      >
                        {mediaItem.type === "video" ? (
                          <video
                            src={mediaItem.url}
                            poster="/no-video.png"
                            controls
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <img
                            src={mediaItem.url}
                            alt="Complaint media"
                            onError={(e) => {
                              e.target.src = "/no-img.png";
                            }}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                            onClick={() => window.open(mediaItem.url, "_blank")}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* View details button */}
                <a
                  href={`/complaint/${selected._id}`}
                  style={{
                    display: "inline-block",
                    padding: "12px 24px",
                    backgroundColor: "#ec8b0a",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    marginTop: 24,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#2563EB";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#3B82F6";
                  }}
                >
                  View Full Details →
                </a>
              </div>
            </div>
          </>
        )}

        {/* Floating Home Button - Bottom Right */}
        <Link
          to="/complaint"
          className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-3xl group z-50 border-2"
          style={{
            background: "linear-gradient(135deg, #0f70cd 0%, #2563eb 100%)",
            borderColor: "#0f70cd",
          }}
          title="Back to Home"
        >
          <FaHome
            size={20}
            className="text-white group-hover:animate-pulse drop-shadow-sm"
          />
        </Link>
      </Map>
    </div>
  );
};

export default MapView;
