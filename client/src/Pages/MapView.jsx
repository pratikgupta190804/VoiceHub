import React, { useState, useEffect } from "react";
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
import { FaMapMarkerAlt } from "react-icons/fa";

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
    
  // Inject custom styles for smaller controls
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // A circle of 2 mile radius around me - using [longitude, latitude] format
  const GEOFENCE = turf.circle([72.8777, 19.076], 2, { units: "miles" });
  const [viewState, setViewState] = useState({
    longitude: 72.8777,
    latitude: 19.076,
    zoom: 14,
  });

  const [mapZoom, setMapZoom] = useState(15);
  const [selected, setSelected] = useState(null);
  console.log("mapzoom", mapZoom);

  // Constant marker size of 20px but hide when zoomed out
  const shouldShowMarker = (zoom) => {
    return zoom >= 10; // Only show markers when zoom level is 10 or higher
  };

  const getMarkerSize = () => {
    return 20; // Always 20px when visible
  };
  const complaints = [
    {
      _id: "1",
      title: "Large pothole causing traffic issues",
      description:
        "A massive pothole has formed on the main road near the bus stop, causing vehicles to swerve dangerously. The hole is approximately 2 feet deep and poses a serious risk to both cars and motorcycles.",
      lat: 19.076,
      lng: 72.8777,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
        "https://sample-videos.com/zip/10/mp4/SampleVideo_360x240_1mb.mp4",
      ],
    },
    {
      _id: "2",
      title: "Broken street light creating safety hazard",
      description:
        "The street light on Park Avenue has been non-functional for over two weeks, creating a dangerous situation for pedestrians and drivers during nighttime hours.",
      lat: 19.08,
      lng: 72.885,
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2904?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1518709268805-4e9042af2904?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop",
      ],
    },
    {
      _id: "3",
      title: "Illegal garbage dumping in residential area",
      description:
        "Large amounts of construction debris and household waste have been illegally dumped in the vacant lot behind the residential complex, attracting pests and creating health concerns.",
      lat: 19.07,
      lng: 72.87,
      image:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1607429715127-c5b18b6b9e5f?w=400&h=300&fit=crop",
      ],
    },
    {
      _id: "4",
      title: "Water leakage from municipal pipeline",
      description:
        "A major water leak from the underground municipal pipeline is causing flooding on the sidewalk and wasting thousands of gallons of clean water daily.",
      lat: 19.085,
      lng: 72.875,
      image:
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop",
        "https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_2mb.mp4",
      ],
    },
    {
      _id: "5",
      title: "Damaged traffic signal causing confusion",
      description:
        "The traffic signal at the main intersection is malfunctioning, with lights showing conflicting signals. This has resulted in near-miss accidents and traffic congestion.",
      lat: 19.065,
      lng: 72.89,
      image:
        "https://images.unsplash.com/photo-1530569673472-307dc017a82d?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1530569673472-307dc017a82d?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      ],
    },
    {
      _id: "6",
      title: "Overgrown vegetation blocking sidewalk",
      description:
        "Trees and bushes along the pedestrian walkway have grown out of control, forcing people to walk on the busy road instead of using the sidewalk safely.",
      lat: 19.09,
      lng: 72.865,
      image:
        "https://images.unsplash.com/photo-1574263867128-0945d9eb8dbc?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1574263867128-0945d9eb8dbc?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
      ],
    },
    {
      _id: "7",
      title: "Broken manhole cover poses danger",
      description:
        "A manhole cover on the residential street has completely broken and fallen into the drain, creating a dangerous hole that could cause serious accidents, especially at night.",
      lat: 19.072,
      lng: 72.88,
      image:
        "https://images.unsplash.com/photo-1604580864967-7c5b2d946a92?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1604580864967-7c5b2d946a92?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1607706189992-eae578626c86?w=400&h=300&fit=crop",
      ],
    },
    {
      _id: "8",
      title: "Public park playground equipment damaged",
      description:
        "Several pieces of playground equipment in the community park are broken and potentially dangerous for children, including swings with broken chains and slides with sharp edges.",
      lat: 19.082,
      lng: 72.872,
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1585239834423-4f11c16a029c?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1583912267550-17d8b5c8e6a4?w=400&h=300&fit=crop",
      ],
    },
    {
      _id: "9",
      title: "Stray dogs creating safety concerns",
      description:
        "A pack of stray dogs has taken residence near the school entrance, causing fear among children and parents. Several incidents of aggressive behavior have been reported.",
      lat: 19.078,
      lng: 72.888,
      image:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=300&fit=crop",
      ],
    },
    {
      _id: "10",
      title: "Bus stop shelter completely destroyed",
      description:
        "The public bus shelter on Main Road has been vandalized and is now completely unusable, leaving commuters without protection from weather conditions during their wait.",
      lat: 19.068,
      lng: 72.883,
      image:
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop",
      media: [
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1558882224-dda166733046?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop",
      ],
    },
  ];

  return (
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
      style={{ width: "100%", height: "100vh" }}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
    >
      <NavigationControl position="top-right" />
      <GeolocateControl position="top-right" />

      {/* Geofence circle */}
      {/* <Source id="geofence" type="geojson" data={GEOFENCE}>
        <Layer
          id="geofence-fill"
          type="fill"
          paint={{
            "fill-color": "#ff0000",
            "fill-opacity": 0.2,
          }}
        />
        <Layer
          id="geofence-line"
          type="line"
          paint={{
            "line-color": "#ff0000",
            "line-width": 4,
            "line-opacity": 1.0,
          }}
        />
      </Source> */}

      {complaints.map((c) => {
        // Don't render marker if zoomed out too much
        if (!shouldShowMarker(mapZoom)) return null;

        const markerSize = getMarkerSize();

        return (
          <Marker
            key={c._id}
            longitude={c.lng}
            latitude={c.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected(c);
            }}
          >
            {/* Simple small dot marker - constant 20px when visible */}
            <div
              style={{
                width: markerSize,
                height: markerSize,
                borderRadius: "50%",
                backgroundColor: "#ff4444", // Red color for all complaints
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
              <img
                src={selected.image}
                alt="/no-img"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
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
                    style={{ fontSize: 14, color: "#6B7280", fontWeight: 500 }}
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
                  {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                </p>
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
                  {selected.description}
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
                  {selected.media?.map((mediaUrl, index) => (
                    <div
                      key={index}
                      style={{
                        borderRadius: 8,
                        overflow: "hidden",
                        aspectRatio: "1",
                        backgroundColor: "#F3F4F6",
                      }}
                    >
                      {mediaUrl.includes(".mp4") ? (
                        <video
                          src={mediaUrl}
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
                          src={mediaUrl}
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
                          onClick={() => window.open(mediaUrl, "_blank")}
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
    </Map>
  );
};

export default MapView;
