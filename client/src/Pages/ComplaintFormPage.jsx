import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  XCircle,
  Upload,
  Loader,
  Camera,
  Video,
  AlertTriangle,
  Shield,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";

const ComplaintFormPage = () => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [locationType, setLocationType] = useState("manual"); // 'manual', 'auto', or 'map'
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [aiDetectionResults, setAiDetectionResults] = useState(null);
  const [showAiWarning, setShowAiWarning] = useState(false);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // File size limit in bytes (5MB)
  const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      mediaFiles.forEach((media) => {
        URL.revokeObjectURL(media.preview);
      });
    };
  }, [mediaFiles]);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      // Check file size
      if (file.size > FILE_SIZE_LIMIT) {
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return false;
      }

      // Check file type
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        toast.error(`File ${file.name} is not a supported media type`);
        return false;
      }

      return true;
    });

    const newMediaFiles = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      type: file.type.startsWith("image/") ? "image" : "video",
    }));

    setMediaFiles((prev) => [...prev, ...newMediaFiles]);
  };

  // Remove media file
  const handleRemoveFile = (index) => {
    const updatedFiles = [...mediaFiles];
    // Revoke object URL to free memory
    URL.revokeObjectURL(updatedFiles[index].preview);
    updatedFiles.splice(index, 1);
    setMediaFiles(updatedFiles);
  };

  // Auto-detect location
  const handleAutoDetectLocation = () => {
    setLocationType("auto");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(
            `${position.coords.latitude}, ${position.coords.longitude}`
          );
          toast.success("Location detected successfully");
        },
        (error) => {
          toast.error("Error detecting location: " + error.message);
          setLocationType("manual");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
      setLocationType("manual");
    }
  };

  // Select map location (placeholder - would need a map component integration)
  const handleMapSelection = () => {
    setLocationType("map");
    // In a real implementation, this would open a map component for location selection
    toast.error("Map selection is not implemented yet");
  };

  // Preview a media item in full size
  const openPreview = (media) => {
    setPreviewItem(media);
  };

  // Close the preview modal
  const closePreview = () => {
    setPreviewItem(null);
  };

  // Check for AI-generated content
  const checkForAIContent = async () => {
    console.log("🤖 [FRONTEND] Starting AI detection check...");
    setIsCheckingAI(true);
    setAiDetectionResults(null);
    setShowAiWarning(false);

    try {
      const formData = new FormData();

      // Append each file to the form data
      mediaFiles.forEach((mediaFile) => {
        formData.append("media", mediaFile.file);
      });

      console.log(
        `🤖 [FRONTEND] Checking ${mediaFiles.length} files for AI content...`
      );

      const response = await axiosInstance.post(
        "/complaints/detect-ai",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000, // 2 minute timeout for AI detection
        }
      );

      console.log("🤖 [FRONTEND] AI detection response:", response.data);
      setAiDetectionResults(response.data);

      if (response.data.hasAIContent) {
        console.log("⚠️ [FRONTEND] AI content detected, showing warning");
        setShowAiWarning(true);
        return false; // Block submission
      } else {
        console.log(
          "✅ [FRONTEND] No AI content detected, allowing submission"
        );
        return true; // Allow submission
      }
    } catch (error) {
      console.error("❌ [FRONTEND] AI detection error:", error);

      // If AI detection fails, show error but allow user to choose
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "AI detection service unavailable";

      toast.error(`AI detection failed: ${errorMessage}`);

      // For now, allow submission if AI detection fails (graceful degradation)
      console.log(
        "⚠️ [FRONTEND] AI detection failed, allowing submission to proceed"
      );
      return true;
    } finally {
      setIsCheckingAI(false);
    }
  };

  // Handle form submission with AI detection
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mediaFiles.length === 0) {
      return toast.error("Please upload at least one image or video");
    }

    if (!location) {
      return toast.error("Please provide a location");
    }

    // Step 1: Check for AI-generated content
    console.log("🔍 [FRONTEND] Step 1: Checking for AI-generated content...");
    const canProceed = await checkForAIContent();

    if (!canProceed) {
      console.log(
        "🚫 [FRONTEND] Submission blocked due to AI content detection"
      );
      return; // Stop here if AI content is detected
    }

    // Step 2: Proceed with normal submission if AI check passed
    console.log(
      "✅ [FRONTEND] Step 2: AI check passed, proceeding with submission..."
    );
    setIsLoading(true);

    try {
      const formData = new FormData();

      // Append each file to the form data
      mediaFiles.forEach((mediaFile) => {
        formData.append("media", mediaFile.file);
      });

      formData.append("description", description);
      formData.append("location", location);
      formData.append("locationType", locationType);

      const loadingToast = toast.loading("Submitting complaint...");

      const response = await axiosInstance.post(
        "/complaints/submit",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.dismiss(loadingToast);
      toast.success("Complaint submitted successfully!");

      // Clean up object URLs
      mediaFiles.forEach((media) => {
        URL.revokeObjectURL(media.preview);
      });

      // Reset form
      setMediaFiles([]);
      setDescription("");
      setLocation("");
      setLocationType("manual");
      setAiDetectionResults(null);
      setShowAiWarning(false);

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit complaint"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <AlertTriangle className="text-white" size={28} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Submit Your Complaint
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Report issues in your community and make your voice heard. We'll
            help amplify your concerns to the right authorities.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Media Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Upload className="text-white" size={18} />
                  </div>
                  <label className="text-lg font-semibold text-gray-800">
                    Upload Evidence <span className="text-red-500">*</span>
                  </label>
                </div>

                <div
                  className="border-2 border-dashed border-blue-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-blue-25 to-indigo-25"
                  onClick={() => fileInputRef.current.click()}
                >
                  <div className="flex space-x-6 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Camera size={28} className="text-white" />
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Video size={28} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Upload Your Evidence
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Click to upload or drag and drop your photos and videos
                  </p>
                  <p className="text-sm text-gray-500 mb-3">
                    Support: JPG, PNG, MP4, MOV (max 5MB each)
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center">
                    <AlertTriangle
                      size={16}
                      className="text-amber-600 mr-2 flex-shrink-0"
                    />
                    <p className="text-sm text-amber-800">
                      Only upload original, authentic media for verification
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Media Preview */}
                {mediaFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Uploaded Files ({mediaFiles.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {mediaFiles.map((media, index) => (
                        <div
                          key={index}
                          className="relative rounded-md overflow-hidden h-32 group cursor-pointer"
                          onClick={() => openPreview(media)}
                        >
                          {media.type === "image" ? (
                            <img
                              src={media.preview}
                              alt={`Upload ${index}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="relative h-full w-full">
                              <video
                                src={media.preview}
                                className="h-full w-full object-cover"
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                                  <Video size={16} className="text-white" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Delete button and filename */}
                          <div className="absolute inset-0 flex items-end justify-between p-1 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(index);
                              }}
                              className="text-white hover:text-red-400"
                            >
                              <XCircle size={20} />
                            </button>
                            <p className="text-xs text-white truncate max-w-[80%]">
                              {media.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                    <MapPin className="text-white" size={18} />
                  </div>
                  <label className="text-lg font-semibold text-gray-800">
                    Location Details <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex space-x-3 mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      locationType === "manual"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => setLocationType("manual")}
                  >
                    📍 Manual Input
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      locationType === "auto"
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={handleAutoDetectLocation}
                  >
                    🎯 Auto Detect
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      locationType === "map"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={handleMapSelection}
                  >
                    🗺️ Use Map
                  </button>
                </div>

                <div className="relative">
                  <MapPin
                    size={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location (e.g., Palghar, Maharashtra, 401404)"
                    className="pl-12 w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    disabled={locationType !== "manual"}
                    required
                  />
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-white" size={18} />
                  </div>
                  <label className="text-lg font-semibold text-gray-800">
                    Describe the Issue{" "}
                    <span className="text-gray-500 text-sm font-normal">
                      (optional)
                    </span>
                  </label>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about the issue you're reporting. Be specific about what happened, when it occurred, and any other relevant information..."
                  className="w-full border-2 border-gray-200 rounded-xl p-4 h-32 text-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white resize-none"
                />
                <p className="text-sm text-gray-500">
                  💡 Tip: Include specific details like time, date, and
                  circumstances for better resolution
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || isCheckingAI}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {isCheckingAI ? (
                    <>
                      <Shield size={22} className="animate-pulse mr-3" />
                      🔍 Checking for AI content...
                    </>
                  ) : isLoading ? (
                    <>
                      <Loader size={22} className="animate-spin mr-3" />
                      📤 Submitting your complaint...
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={22} className="mr-3" />
                      🚀 Submit Complaint
                    </>
                  )}
                </button>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    🛡️ Your complaint will be verified and posted to social
                    media
                  </p>
                  <p className="text-xs text-gray-500">
                    We ensure authentic content reaches the right authorities
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Media Preview Modal */}
        {previewItem && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl max-h-[90vh] relative">
              <button
                type="button"
                onClick={closePreview}
                className="absolute -top-10 right-0 text-white hover:text-red-400"
              >
                <XCircle size={24} />
              </button>
              {previewItem.type === "image" ? (
                <img
                  src={previewItem.preview}
                  alt="Preview"
                  className="max-h-[90vh] max-w-full object-contain"
                />
              ) : (
                <video
                  src={previewItem.preview}
                  className="max-h-[90vh] max-w-full"
                  controls
                  autoPlay
                />
              )}
              <p className="text-white text-sm mt-2">{previewItem.name}</p>
            </div>
          </div>
        )}

        {/* AI Content Warning Modal */}
        {showAiWarning && aiDetectionResults && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-red-500 mr-3" size={24} />
                <h2 className="text-lg font-bold text-red-700">
                  AI Generated Content Detected
                </h2>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-3">
                  Our system has detected that some of your uploaded files may
                  contain AI-generated content. To maintain authenticity, only
                  original content is allowed.
                </p>

                <div className="bg-red-50 p-3 rounded-md mb-3">
                  <p className="text-sm text-red-800 font-medium">
                    Detection Results:
                  </p>
                  <ul className="text-sm text-red-700 mt-1">
                    <li>
                      • {aiDetectionResults.aiDetectedCount} of{" "}
                      {aiDetectionResults.totalFiles} files flagged as
                      AI-generated
                    </li>
                    {aiDetectionResults.files.map(
                      (file, index) =>
                        file.isAIGenerated && (
                          <li key={index} className="ml-2">
                            • {file.filename}:{" "}
                            {Math.round(file.confidence * 100)}% AI confidence
                          </li>
                        )
                    )}
                  </ul>
                </div>

                <p className="text-gray-600 text-sm">
                  Please remove the flagged files and upload only original,
                  non-AI generated content.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAiWarning(false);
                    setAiDetectionResults(null);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  I'll Upload Different Files
                </button>
                <button
                  onClick={() => {
                    setShowAiWarning(false);
                    setAiDetectionResults(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintFormPage;
