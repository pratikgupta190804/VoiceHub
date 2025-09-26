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
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Submit a Complaint</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Upload Images/Videos <span className="text-red-500">*</span>
          </label>

          <div
            className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
            onClick={() => fileInputRef.current.click()}
          >
            <div className="flex space-x-4 mb-2">
              <Camera size={30} className="text-gray-400" />
              <Video size={30} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              Images or videos (max 5MB each)
            </p>
            <p className="text-xs text-gray-400 mt-2 flex items-center">
              <AlertTriangle size={14} className="mr-1" />
              Only original media will be processed
            </p>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
          )}
        </div>

        {/* Location Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Location <span className="text-red-500">*</span>
          </label>

          <div className="flex space-x-2 mb-2">
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded-md ${
                locationType === "manual"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100"
              }`}
              onClick={() => setLocationType("manual")}
            >
              Manual Input
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded-md ${
                locationType === "auto"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100"
              }`}
              onClick={handleAutoDetectLocation}
            >
              Auto Detect
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-sm rounded-md ${
                locationType === "map"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100"
              }`}
              onClick={handleMapSelection}
            >
              Use Map
            </button>
          </div>

          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="pl-10 w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={locationType !== "manual"}
              required
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Description <span className="text-gray-500">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            className="w-full border rounded-md p-2 h-32 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || isCheckingAI}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 flex items-center justify-center"
          >
            {isCheckingAI ? (
              <>
                <Shield size={18} className="animate-pulse mr-2" />
                Checking for AI content...
              </>
            ) : isLoading ? (
              <>
                <Loader size={18} className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Complaint"
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Your complaint will be verified and posted to social media.
          </p>
        </div>
      </form>

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
                          • {file.filename}: {Math.round(file.confidence * 100)}
                          % AI confidence
                        </li>
                      )
                  )}
                </ul>
              </div>

              <p className="text-gray-600 text-sm">
                Please remove the flagged files and upload only original, non-AI
                generated content.
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
  );
};

export default ComplaintFormPage;
