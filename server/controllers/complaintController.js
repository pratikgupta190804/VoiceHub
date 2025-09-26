const cloudinary = require("../lib/cloudinary");
const Complaint = require("../models/complaint");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const twitterService = require("../services/twitterService");
const {TwitterMediaUploader} = require("../services/twitter-media-uploader");

const Comment = require("../models/comment");

// Initialize Gemini AI and Twitter Media Uploader
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mediaUploader = new TwitterMediaUploader();

// Convert URL to Base64
async function urlToBase64(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  } catch (error) {
    throw new Error(`Error converting URL to base64: ${error.message}`);
  }
}

// Generate tweet content using Gemini AI
async function generateTweetWithGemini(description, location, mediaUrls = []) {
  console.log("🤖 [GEMINI] Starting tweet generation...");
  console.log(`🤖 [GEMINI] Location: ${location}`);
  console.log(`🤖 [GEMINI] Description: ${description}`);
  console.log(`🤖 [GEMINI] Media URLs count: ${mediaUrls.length}`);
  
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("⚠️ [GEMINI] No API key found, using fallback tweet");
      const fallbackTweet = `🚨 Civic issue reported at ${location}. Immediate attention required! #CivicIssue #SilentShout`;
      console.log(`🤖 [GEMINI] Fallback tweet: ${fallbackTweet}`);
      return fallbackTweet;
    }

    console.log("🤖 [GEMINI] Initializing Gemini model...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `Generate a compelling tweet about a civic complaint at location ${location}`;
    if (description) {
      prompt += ` with the following issue: ${description}`;
    }
    prompt += `. Include relevant hashtags like #MumbaiCivicIssue, #CleanMumbai, #SwachhBharat, #CivicIssue and mention @mybmc if it's in Mumbai. Keep it under 280 characters and make it engaging to drive public attention to the issue.`;
    console.log(`🤖 [GEMINI] Generated prompt: ${prompt}`);

    let mediaData = [];
    if (mediaUrls && mediaUrls.length > 0) {
      console.log("🖼️ [GEMINI] Processing images for AI analysis...");
      try {
        const imageUrls = mediaUrls.filter(url => 
          url.toLowerCase().includes('.jpg') || 
          url.toLowerCase().includes('.jpeg') || 
          url.toLowerCase().includes('.png') ||
          url.toLowerCase().includes('.webp') ||
          url.toLowerCase().includes('.avif') ||
          url.toLowerCase().includes('.gif')
        );
        console.log(`🖼️ [GEMINI] Found ${imageUrls.length} image URLs`);

        for (const imageUrl of imageUrls.slice(0, 2)) {
          try {
            console.log(`🖼️ [GEMINI] Converting image to base64: ${imageUrl}`);
            const base64Data = await urlToBase64(imageUrl);
            mediaData.push({
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg"
              }
            });
            console.log(`✅ [GEMINI] Image converted successfully`);
          } catch (err) {
            console.log(`❌ [GEMINI] Failed to convert image: ${err.message}`);
            continue; // Skip this image if conversion fails
          }
        }
      } catch (err) {
        console.log(`⚠️ [GEMINI] Error processing images: ${err.message}`);
        // Continue without images
      }
    }

    const parts = [{ text: prompt }];
    if (mediaData.length > 0) {
      parts.push(...mediaData);
      console.log(`🤖 [GEMINI] Including ${mediaData.length} images in analysis`);
    }

    try {
      console.log("🤖 [GEMINI] Calling Gemini API...");
      const result = await model.generateContent(parts);
      const response = await result.response;
      const tweetText = response.text();
      console.log(`✅ [GEMINI] Generated tweet: ${tweetText}`);
      return tweetText;
    } catch (genError) {
      console.log(`⚠️ [GEMINI] API call failed: ${genError.message}`);
      console.log("🔄 [GEMINI] Using fallback tweet");
      const fallbackTweet = `🚨 Civic issue reported at ${location}. Immediate attention required! #CivicIssue @mybmc`;
      console.log(`🤖 [GEMINI] Fallback tweet: ${fallbackTweet}`);
      return fallbackTweet;
    }

  } catch (error) {
    console.log(`❌ [GEMINI] Critical error: ${error.message}`);
    console.log("🔄 [GEMINI] Using emergency fallback tweet");
    return `🚨 Civic issue reported. Immediate attention required! #CivicIssue #SilentShout`;
  }
}

// Post to Twitter with service
async function postToTwitterWithService(tweetText, mediaUrls = []) {
  console.log("🐦 [TWITTER] Starting Twitter post process...");
  console.log(`🐦 [TWITTER] Tweet text: ${tweetText}`);
  console.log(`🐦 [TWITTER] Media URLs count: ${mediaUrls.length}`);
  
  try {
    let mediaIds = [];
    
    // Upload media first if provided
    if (mediaUrls && mediaUrls.length > 0) {
      console.log("📤 [TWITTER] Processing media uploads...");
      const imageUrls = mediaUrls.filter(url => {
        const lowerUrl = url.toLowerCase();
        return lowerUrl.includes('.jpg') || 
               lowerUrl.includes('.jpeg') || 
               lowerUrl.includes('.png') ||
               lowerUrl.includes('.webp') ||
               lowerUrl.includes('.avif') ||
               lowerUrl.includes('.gif');
      });
      console.log(`📷 [TWITTER] Found ${imageUrls.length} image URLs to upload`);
      
      try {
        console.log("📤 [TWITTER] Uploading media to Twitter...");
        const uploadResults = await mediaUploader.uploadMultipleMedia(imageUrls.slice(0, 4));
        mediaIds = uploadResults
          .filter(result => result.success)
          .map(result => result.mediaId);
        console.log(`✅ [TWITTER] Successfully uploaded ${mediaIds.length} media files`);
        console.log(`🆔 [TWITTER] Media IDs: ${mediaIds.join(', ')}`);
      } catch (mediaError) {
        console.log(`❌ [TWITTER] Media upload failed: ${mediaError.message}`);
        mediaIds = [];
      }
    }

    console.log("🐦 [TWITTER] Posting tweet to Twitter API...");
    const result = await twitterService.postTweet(tweetText, mediaIds);
    
    if (result.success) {
      console.log(`✅ [TWITTER] Tweet posted successfully!`);
      console.log(`🆔 [TWITTER] Tweet ID: ${result.tweetId}`);
      console.log(`🔗 [TWITTER] Tweet URL: ${result.tweetUrl}`);
      return {
        success: true,
        tweetId: result.tweetId,
        tweetText: result.tweetText,
        tweetUrl: result.tweetUrl,
        message: "Tweet posted successfully with Twitter service",
        mediaCount: mediaIds.length
      };
    } else {
      console.log(`❌ [TWITTER] Tweet posting failed: ${result.error}`);
      return {
        success: false,
        error: result.error,
        code: result.code,
        tweetText: tweetText,
        mediaCount: mediaIds.length
      };
    }

  } catch (error) {
    console.log(`❌ [TWITTER] Critical error in Twitter posting: ${error.message}`);
    console.log(`❌ [TWITTER] Error stack:`, error.stack);
    return {
      success: false,
      error: error.message,
      tweetText: tweetText,
      fallbackMode: true,
      message: "Twitter posting failed - check logs for details"
    };
  }
}

// Submit complaint - main controller function
exports.submitComplaint = async (req, res) => {
  console.log("🚀 [SUBMIT COMPLAINT] Starting complaint submission");
  const complaintId = `complaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`📝 [SUBMIT COMPLAINT] Generated complaint ID: ${complaintId}`);

  // Check authentication
  if (!req.user || !req.user._id) {
    console.log("❌ [SUBMIT COMPLAINT] Authentication failed - no user found");
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  console.log(`👤 [SUBMIT COMPLAINT] User authenticated: ${req.user._id}`);

  try {
    console.log("🔍 [SUBMIT COMPLAINT] Request body:", JSON.stringify(req.body, null, 2));
    console.log("🔍 [SUBMIT COMPLAINT] Request body keys:", Object.keys(req.body));
    
    const { description, location, locationType } = req.body;
    console.log(`🔍 [SUBMIT COMPLAINT] Raw location: "${location}"`);
    console.log(`🔍 [SUBMIT COMPLAINT] Location type: ${locationType}`);
    
    // Parse latitude and longitude from location string
    let latitude, longitude;
    if (location && typeof location === 'string' && location.includes(',')) {
      const [lat, lng] = location.split(',').map(coord => coord.trim());
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);
      console.log(`🔍 [SUBMIT COMPLAINT] Parsed coordinates - lat: ${latitude}, lng: ${longitude}`);
    } else {
      console.log(`❌ [SUBMIT COMPLAINT] Invalid location format: "${location}"`);
    }
    
    console.log(`📍 [SUBMIT COMPLAINT] Final Location: ${latitude}, ${longitude}, Type: ${locationType}`);
    console.log(`📄 [SUBMIT COMPLAINT] Description: ${description}`);
    console.log(`📎 [SUBMIT COMPLAINT] Files received: ${req.files ? req.files.length : 0}`);

    // Validation
    if (!req.files || req.files.length === 0) {
      console.log("❌ [SUBMIT COMPLAINT] Validation failed - no files provided");
      return res.status(400).json({
        success: false,
        message: "At least one image/video file is required"
      });
    }

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.log("❌ [SUBMIT COMPLAINT] Validation failed - missing or invalid coordinates");
      console.log(`🔍 [SUBMIT COMPLAINT] Latitude: ${latitude} (isNaN: ${isNaN(latitude)})`);
      console.log(`🔍 [SUBMIT COMPLAINT] Longitude: ${longitude} (isNaN: ${isNaN(longitude)})`);
      return res.status(400).json({
        success: false,
        message: "Valid location coordinates are required"
      });
    }
    console.log("✅ [SUBMIT COMPLAINT] Validation passed");

    // Upload media to Cloudinary
    console.log("☁️ [SUBMIT COMPLAINT] Starting Cloudinary uploads...");
    const mediaUrls = [];
    const uploadPromises = req.files.map(async (file, index) => {
      try {
        console.log(`📤 [CLOUDINARY] Uploading file ${index + 1}/${req.files.length}: ${file.originalname}`);
        console.log(`📤 [CLOUDINARY] File size: ${file.size} bytes, mimetype: ${file.mimetype}`);
        
        // Since we're using memory storage, upload from buffer
        const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
          folder: "complaints",
          resource_type: "auto"
        });
        console.log(`✅ [CLOUDINARY] File ${index + 1} uploaded successfully: ${result.secure_url}`);
        return result.secure_url;
      } catch (error) {
        console.log(`❌ [CLOUDINARY] Upload failed for file ${index + 1}: ${error.message}`);
        throw error;
      }
    });

    try {
      console.log("⏳ [CLOUDINARY] Waiting for all uploads to complete...");
      const uploadResults = await Promise.all(uploadPromises);
      mediaUrls.push(...uploadResults);
      console.log(`✅ [CLOUDINARY] All uploads completed. Total URLs: ${mediaUrls.length}`);
    } catch (uploadError) {
      console.log(`❌ [CLOUDINARY] Upload process failed: ${uploadError.message}`);
      return res.status(500).json({
        success: false,
        message: "Failed to upload media files",
        error: uploadError.message
      });
    }

    // Generate tweet content
    console.log("🤖 [GEMINI AI] Generating tweet content...");
    const locationString = `${latitude}, ${longitude}`;
    const tweetText = await generateTweetWithGemini(description, locationString, mediaUrls);
    console.log(`📝 [GEMINI AI] Generated tweet: ${tweetText}`);

    // Post to Twitter
    console.log("🐦 [TWITTER] Posting to Twitter...");
    const twitterResult = await postToTwitterWithService(tweetText, mediaUrls);
    console.log(`🐦 [TWITTER] Post result:`, twitterResult);

    // Save to database
    console.log("💾 [DATABASE] Saving complaint to database...");
    console.log("💾 [DATABASE] Preparing data according to schema...");
    
    // Convert mediaUrls to media format expected by schema
    const mediaArray = mediaUrls.map(url => ({
      url: url,
      type: url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.mov') || url.toLowerCase().includes('.avi') ? 'video' : 'image'
    }));
    console.log(`💾 [DATABASE] Media array prepared: ${mediaArray.length} items`);
    
    const newComplaint = new Complaint({
      userId: req.user._id,
      title: description || "Civic Issue Report", // Add required title field
      description: description || "Civic issue reported via SilentShout app",
      category: "civic", // Add category
      location: {
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        type: "Point"
      },
      media: mediaArray, // Use correct media format
      
      // Twitter data in correct format
      twitter: {
        tweetId: twitterResult.success ? twitterResult.tweetId : undefined,
        status: twitterResult.success ? 'posted' : 'failed',
        postedAt: twitterResult.success ? new Date() : undefined,
        error: twitterResult.success ? undefined : twitterResult.error
      },
      
      status: 'open' // Set initial status
    });

    console.log("💾 [DATABASE] Complaint object created, attempting to save...");
    const savedComplaint = await newComplaint.save();
    console.log(`✅ [DATABASE] Complaint saved successfully with ID: ${savedComplaint._id}`);

    console.log("🎉 [SUBMIT COMPLAINT] Process completed successfully");
    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: {
        id: savedComplaint._id,
        title: savedComplaint.title,
        description: savedComplaint.description,
        location: savedComplaint.location,
        media: savedComplaint.media, // Use correct field name from schema
        status: savedComplaint.status,
        createdAt: savedComplaint.createdAt,
        twitter: savedComplaint.twitter // Use correct field name from schema
      },
      twitter: {
        success: twitterResult.success,
        tweetId: twitterResult.tweetId,
        tweetUrl: twitterResult.tweetUrl,
        message: twitterResult.message
      }
    });

  } catch (error) {
    console.error("❌ [SUBMIT COMPLAINT] Error in complaint submission:", error);
    console.error("❌ [SUBMIT COMPLAINT] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to submit complaint",
      error: error.message
    });
  }
};

// Get user complaints
exports.getUserComplaints = async (req, res) => {
  console.log("📋 [GET USER COMPLAINTS] Starting to fetch user complaints");
  console.log(`👤 [GET USER COMPLAINTS] User ID: ${req.user?._id}`);
  try {
    if (!req.user || !req.user._id) {
      console.log("❌ [GET USER COMPLAINTS] Authentication failed - no user found");
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    console.log("🔍 [GET USER COMPLAINTS] Fetching complaints from database...");
    const complaints = await Complaint.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`✅ [GET USER COMPLAINTS] Found ${complaints.length} complaints`);
    res.json({
      success: true,
      message: "Complaints fetched successfully",
      complaints: complaints.map(complaint => ({
        id: complaint._id,
        description: complaint.description,
        location: complaint.location,
        mediaUrls: complaint.mediaUrls,
        status: complaint.status,
        createdAt: complaint.createdAt,
        twitterData: complaint.twitterData
      })),
      total: complaints.length
    });

  } catch (error) {
    console.error("❌ [GET USER COMPLAINTS] Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message
    });
  }
};

// Get complaint by ID
exports.getComplaintById = async (req, res) => {
  console.log("🔍 [GET COMPLAINT BY ID] Starting to fetch specific complaint");
  try {
    const { id } = req.params;
    console.log(`🆔 [GET COMPLAINT BY ID] Complaint ID: ${id}`);

    if (!req.user || !req.user._id) {
      console.log("❌ [GET COMPLAINT BY ID] Authentication failed - no user found");
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }
    console.log(`👤 [GET COMPLAINT BY ID] User authenticated: ${req.user._id}`);

    console.log("🔍 [GET COMPLAINT BY ID] Fetching complaint from database...");
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      console.log("❌ [GET COMPLAINT BY ID] Complaint not found in database");
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }
    console.log("✅ [GET COMPLAINT BY ID] Complaint found in database");

    // Check if user owns this complaint
    console.log("🔐 [GET COMPLAINT BY ID] Checking complaint ownership...");
    if (complaint.userId.toString() !== req.user._id.toString()) {
      console.log("❌ [GET COMPLAINT BY ID] Access denied - user doesn't own this complaint");
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    console.log("✅ [GET COMPLAINT BY ID] Ownership verified");

    console.log("📤 [GET COMPLAINT BY ID] Sending complaint data to client");
    res.json({
      success: true,
      message: "Complaint fetched successfully",
      complaint: {
        id: complaint._id,
        description: complaint.description,
        location: complaint.location,
        mediaUrls: complaint.mediaUrls,
        status: complaint.status,
        createdAt: complaint.createdAt,
        twitterData: complaint.twitterData,
        metadata: complaint.metadata
      }
    });

  } catch (error) {
    console.error("❌ [GET COMPLAINT BY ID] Error fetching complaint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint",
      error: error.message
    });
  }
};

// Health check endpoint
exports.healthCheck = async (req, res) => {
  console.log("🏥 [HEALTH CHECK] Health check endpoint called");
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      success: true,
      message: "Service is healthy",
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message
    });
  }
};





//shubham
exports.getAllComplaints = async (req, res) => {
  try {
    const allComplaints = await Complaint.find()
      .populate({
        path: "comments",
        populate: {
          path: "senderId",
          select: "fullname profilePicture email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: allComplaints,
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

exports.upvoteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $inc: { upvote: 1 } },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        upvote: complaint.upvote,
        downvote: complaint.downvote,
      },
    });
  } catch (error) {
    console.error("Error upvoting complaint:", error);
    res.status(500).json({
      message: "Failed to upvote complaint",
      error: error.message,
    });
  }
};

exports.downvoteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $inc: { downvote: 1 } },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        upvote: complaint.upvote,
        downvote: complaint.downvote,
      },
    });
  } catch (error) {
    console.error("Error downvoting complaint:", error);
    res.status(500).json({
      message: "Failed to downvote complaint",
      error: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text is required",
      });
    }

    // Create new comment with authenticated user
    const newComment = new Comment({
      senderId: req.user._id, // Use the authenticated user's ID
      text: text.trim(),
    });

    await newComment.save();

    // Populate the comment with user data
    await newComment.populate("senderId", "fullname profilePicture email");

    // Add comment to complaint
    const complaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { $push: { comments: newComment._id } },
      { new: true }
    ).populate({
      path: "comments",
      populate: {
        path: "senderId",
        select: "fullname profilePicture email",
      },
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(201).json({
      success: true,
      data: {
        comment: newComment,
        totalComments: complaint.comments.length,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({
      message: "Failed to add comment",
      error: error.message,
    });
  }
};
