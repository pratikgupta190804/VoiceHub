const cloudinary = require("../lib/cloudinary");
const Complaint = require("../models/Complaint");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const twitterService = require("../services/twitterService");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Logger for complaint controller
class ComplaintLogger {
  constructor() {
    this.logFile = `logs/complaint-controller-${new Date().toISOString().split('T')[0]}.log`;
    
    // Create logs directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    
    console.log(logMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }

    // Write to file
    const fs = require('fs');
    const fileMessage = data ? `${logMessage}\n${JSON.stringify(data, null, 2)}\n` : `${logMessage}\n`;
    try {
      fs.appendFileSync(this.logFile, fileMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  error(message, data) { this.log('ERROR', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  debug(message, data) { this.log('DEBUG', message, data); }
}

const logger = new ComplaintLogger();

// Utility: Convert URL to Base64 for Gemini
async function urlToBase64(url) {
  try {
    logger.debug('Converting URL to Base64', { url });
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(res.data).toString("base64");
    logger.debug('URL to Base64 conversion successful');
    return base64;
  } catch (error) {
    logger.error("Error converting URL to base64:", { error: error.message, url });
    throw error;
  }
}

// Generate Twitter post content using Gemini AI
async function generateTweetWithGemini(description, location, mediaUrls) {
  logger.info('Generating tweet content with Gemini AI', {
    hasDescription: !!description,
    location: location,
    mediaCount: mediaUrls?.length || 0
  });

  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      logger.warn("No Gemini API key found, using fallback message");
      const fallbackTweet = `🚨 Civic issue reported at ${location}. ${description || "Immediate attention required!"} #MumbaiCivicIssue @mybmc`;
      return fallbackTweet;
    }
    
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
    
    // Process only image files for Gemini (skip videos for now)
    let mediaData = [];
    if (mediaUrls && mediaUrls.length > 0) {
      try {
        const imageUrls = mediaUrls.filter(url => 
          url.toLowerCase().includes('.jpg') || 
          url.toLowerCase().includes('.jpeg') || 
          url.toLowerCase().includes('.png') ||
          url.toLowerCase().includes('.webp')
        );
        
        logger.debug('Processing images for Gemini', { imageCount: imageUrls.length });
        
        if (imageUrls.length > 0) {
          // Process only the first 2 images to avoid token limits
          const limitedUrls = imageUrls.slice(0, 2);
          const mediaPromises = limitedUrls.map(async (url) => {
            const base64 = await urlToBase64(url);
            return {
              inlineData: {
                data: base64,
                mimeType: "image/jpeg",
              },
            };
          });
          mediaData = await Promise.all(mediaPromises);
          logger.debug('Media data prepared for Gemini', { processedCount: mediaData.length });
        }
      } catch (err) {
        logger.error("Error processing media for Gemini:", { error: err.message });
        // Continue without images if there's an error
      }
    }

    const prompt = `You are analyzing a civic complaint submitted by a citizen in Mumbai, India.

Location: ${location}
Description: ${description || "No description provided"}

Based on the image(s) and description, create a compelling Twitter post that:
1. Clearly describes the civic issue (garbage, pothole, water problem, etc.)
2. Mentions the specific location in Mumbai
3. Tags relevant authorities (@mybmc for BMC, @MumbaiPolice for safety, etc.)
4. Uses appropriate hashtags (#MumbaiCivicIssue, #CleanMumbai, etc.)
5. Includes a call to action
6. Is under 280 characters
7. Uses emojis to make it more engaging

IMPORTANT: Return ONLY the tweet text, nothing else. No explanations, no additional text.`;

    let result;
    try {
      // Generate content with or without images
      if (mediaData.length > 0) {
        logger.debug('Generating content with images');
        result = await model.generateContent([prompt, ...mediaData]);
      } else {
        logger.debug('Generating content without images');
        result = await model.generateContent(prompt);
      }
      
      const response = await result.response;
      const tweetText = response.text().trim();
      
      logger.info('Tweet content generated successfully', { 
        tweetLength: tweetText.length,
        hasImages: mediaData.length > 0
      });
      
      return tweetText;
    } catch (genError) {
      logger.error("Error generating content with Gemini:", { error: genError.message });
      // Fallback tweet text
      const fallbackTweet = `🚨 Civic issue reported at ${location}. ${description ? description.substring(0, 100) : "Immediate attention required!"} #MumbaiCivicIssue @mybmc`;
      logger.info('Using fallback tweet text', { fallbackTweet });
      return fallbackTweet;
    }
  } catch (error) {
    logger.error("Error in generateTweetWithGemini:", { error: error.message });
    const fallbackTweet = `🚨 Civic issue at ${location}. ${description?.substring(0, 100) || ""} #MumbaiCivicIssue @mybmc`;
    return fallbackTweet;
  }
}

// Post to Twitter using the Twitter Service
async function postToTwitterWithService(tweetText, mediaUrls = []) {
  logger.info('Posting to Twitter using Twitter Service', { 
    textLength: tweetText.length, 
    mediaCount: mediaUrls?.length || 0 
  });

  try {
    let mediaIds = [];
    
    // Upload media first if provided
    if (mediaUrls && mediaUrls.length > 0) {
      logger.info('Processing media for Twitter upload', { mediaCount: mediaUrls.length });
      
      const imageUrls = mediaUrls.filter(url => 
        url.toLowerCase().includes('.jpg') || 
        url.toLowerCase().includes('.jpeg') || 
        url.toLowerCase().includes('.png') ||
        url.toLowerCase().includes('.webp')
      );
      
      logger.debug('Filtered image URLs', { imageCount: imageUrls.length });
      
      // Process up to 4 images (Twitter limit)
      for (const mediaUrl of imageUrls.slice(0, 4)) {
        try {
          logger.debug('Downloading image for upload', { url: mediaUrl });
          
          // Download image from URL
          const imageResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(imageResponse.data);
          
          logger.debug('Image downloaded, uploading to Twitter', { 
            url: mediaUrl, 
            size: imageBuffer.length 
          });
          
          // Upload to Twitter using the service
          const mediaId = await twitterService.uploadMedia(imageBuffer, 'image/jpeg');
          mediaIds.push(mediaId);
          
          logger.info('Media uploaded successfully to Twitter', { mediaId, url: mediaUrl });
        } catch (error) {
          logger.error('Failed to upload media to Twitter', { 
            error: error.message, 
            url: mediaUrl 
          });
          // Continue without this media - don't fail the entire process
        }
      }
    }

    // Post tweet using the service
    logger.info('Posting tweet to Twitter', { 
      tweetLength: tweetText.length, 
      mediaIds: mediaIds.length 
    });
    
    const result = await twitterService.postTweet(tweetText, mediaIds);
    
    if (result.success) {
      logger.info('Tweet posted successfully via Twitter service', {
        tweetId: result.tweetId,
        tweetUrl: result.tweetUrl,
        mediaCount: mediaIds.length
      });
      
      return {
        success: true,
        tweetId: result.tweetId,
        tweetText: result.tweetText,
        tweetUrl: result.tweetUrl,
        message: "Tweet posted successfully with Twitter service",
        mediaCount: mediaIds.length
      };
    } else {
      logger.error('Twitter service returned error', { 
        error: result.error, 
        code: result.code 
      });
      
      return {
        success: false,
        error: result.error,
        code: result.code,
        tweetText: tweetText,
        mediaCount: mediaIds.length
      };
    }

  } catch (error) {
    logger.error("Error posting to Twitter with service:", { 
      error: error.message, 
      stack: error.stack 
    });
    
    // Return development mode response as fallback
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
  const complaintId = `complaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  logger.info('Starting complaint submission process', {
    complaintId,
    userId: req.user?._id,
    hasFiles: !!(req.files && req.files.length > 0)
  });

  // Check authentication first
  if (!req.user || !req.user._id) {
    logger.error('Authentication failed', { 
      complaintId,
      hasUser: !!req.user
    });
    return res.status(401).json({ 
      message: "You must be logged in to submit a complaint",
      complaintId,
      error: "AUTHENTICATION_REQUIRED"
    });
  }

  try {
    const { description, location, locationType } = req.body;
    const files = req.files;

    logger.info('Input validation passed, starting media upload', {
      complaintId,
      userId: req.user._id,
      fileCount: files?.length || 0
    });

    // Validate inputs
    if (!files || files.length === 0) {
      logger.warn('Complaint submission failed - no files uploaded', { complaintId });
      return res.status(400).json({ 
        message: "Please upload at least one image or video",
        complaintId 
      });
    }
    
    if (!location) {
      logger.warn('Complaint submission failed - no location provided', { complaintId });
      return res.status(400).json({ 
        message: "Location is required",
        complaintId 
      });
    }

    // Make sure user is authenticated
    if (!req.user || !req.user._id) {
      logger.warn('Complaint submission failed - user not authenticated', { complaintId });
      return res.status(401).json({ 
        message: "You must be logged in to submit a complaint",
        complaintId 
      });
    }

    logger.info('Input validation passed, starting media upload', {
      complaintId,
      userId: req.user._id,
      fileCount: files.length
    });

    // Upload media files to Cloudinary
    const uploadPromises = files.map(async (file, index) => {
      const fileType = file.mimetype.startsWith("image/") ? "image" : "video";
      const fileBuffer = file.buffer.toString("base64");
      const fileData = `data:${file.mimetype};base64,${fileBuffer}`;

      logger.debug('Uploading media to Cloudinary', {
        complaintId,
        fileIndex: index,
        fileType,
        mimetype: file.mimetype,
        size: file.size
      });

      try {
        const uploadResult = await cloudinary.uploader.upload(fileData, {
          resource_type: fileType,
          folder: "complaints",
        });

        logger.debug('Media uploaded to Cloudinary successfully', {
          complaintId,
          fileIndex: index,
          publicId: uploadResult.public_id,
          url: uploadResult.secure_url
        });

        return {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          type: fileType,
        };
      } catch (uploadError) {
        logger.error('Failed to upload media to Cloudinary', {
          complaintId,
          fileIndex: index,
          error: uploadError.message
        });
        throw uploadError;
      }
    });

    const uploadedMedia = await Promise.all(uploadPromises);
    const mediaUrls = uploadedMedia.map(media => media.url);

    logger.info('All media uploaded to Cloudinary successfully', {
      complaintId,
      uploadCount: uploadedMedia.length,
      mediaUrls: mediaUrls.length
    });

    // Generate tweet content using Gemini AI
    logger.info("Generating tweet content with Gemini AI", { complaintId });
    const tweetText = await generateTweetWithGemini(description, location, mediaUrls);
    
    logger.info("Tweet content generated", { 
      complaintId, 
      tweetLength: tweetText.length,
      tweetPreview: tweetText.substring(0, 50) + "..."
    });

    // Post to Twitter using the service
    logger.info("Attempting to post tweet to Twitter", { complaintId });
    const twitterResult = await postToTwitterWithService(tweetText, mediaUrls);
    
    logger.info("Twitter posting completed", { 
      complaintId,
      success: twitterResult.success,
      tweetId: twitterResult.tweetId || null,
      error: twitterResult.error || null
    });

    // Save complaint to database
    logger.info("Saving complaint to database", { complaintId });
    
    const newComplaint = new Complaint({
      user: req.user._id,
      description,
      location,
      locationType,
      media: uploadedMedia.map(media => ({
        url: media.url,
        public_id: media.public_id,
        type: media.type,
        isVerified: true, // Simplified - auto-verified for now
      })),
      status: twitterResult.success ? "posted" : "pending",
      twitter: {
        tweetId: twitterResult.tweetId || null,
        tweetUrl: twitterResult.tweetUrl || null,
        status: twitterResult.success ? "posted" : "failed",
        postedAt: twitterResult.success ? new Date() : null,
        error: twitterResult.success ? null : twitterResult.error,
        generatedText: tweetText,
      },
      metadata: {
        complaintId,
        submittedAt: new Date(),
        processingTime: Date.now() - parseInt(complaintId.split('_')[1])
      }
    });

    const savedComplaint = await newComplaint.save();
    
    logger.info("Complaint saved to database successfully", {
      complaintId,
      dbId: savedComplaint._id,
      status: savedComplaint.status
    });

    // Prepare response
    const response = {
      message: "Complaint submitted successfully!",
      complaintId: savedComplaint._id,
      customComplaintId: complaintId,
      tweetText: tweetText,
      twitterResult: {
        success: twitterResult.success,
        tweetId: twitterResult.tweetId,
        tweetUrl: twitterResult.tweetUrl,
        message: twitterResult.message,
        error: twitterResult.success ? null : twitterResult.error
      },
      complaint: {
        id: savedComplaint._id,
        status: savedComplaint.status,
        location: savedComplaint.location,
        mediaCount: savedComplaint.media.length,
        createdAt: savedComplaint.createdAt
      }
    };

    logger.info("Complaint submission process completed successfully", {
      complaintId,
      dbId: savedComplaint._id,
      twitterSuccess: twitterResult.success,
      responseCode: 201
    });

    res.status(201).json(response);

  } catch (error) {
    logger.error("Error in complaint submission process:", {
      complaintId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({ 
      message: "Error submitting complaint", 
      error: error.message,
      complaintId,
      timestamp: new Date().toISOString()
    });
  }
};

// Get user complaints
exports.getUserComplaints = async (req, res) => {
  logger.info('Fetching user complaints', { userId: req.user._id });

  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance when just reading
    
    logger.info('User complaints fetched successfully', { 
      userId: req.user._id,
      complaintCount: complaints.length
    });

    // Add some computed fields for frontend
    const enrichedComplaints = complaints.map(complaint => ({
      ...complaint,
      hasTwitterPost: !!(complaint.twitter && complaint.twitter.tweetId),
      mediaCount: complaint.media ? complaint.media.length : 0,
      isRecent: (Date.now() - new Date(complaint.createdAt).getTime()) < 24 * 60 * 60 * 1000 // 24 hours
    }));
    
    res.status(200).json({ 
      complaints: enrichedComplaints,
      total: complaints.length,
      userId: req.user._id
    });

  } catch (error) {
    logger.error("Error fetching user complaints:", { 
      userId: req.user._id,
      error: error.message 
    });
    
    res.status(500).json({ 
      message: "Error fetching complaints", 
      error: error.message 
    });
  }
};

// Get complaint by ID
exports.getComplaintById = async (req, res) => {
  const complaintId = req.params.id;
  logger.info('Fetching complaint by ID', { complaintId, userId: req.user._id });

  try {
    const complaint = await Complaint.findById(complaintId).lean();
    
    if (!complaint) {
      logger.warn('Complaint not found', { complaintId, userId: req.user._id });
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Check if the complaint belongs to the requesting user
    if (complaint.user.toString() !== req.user._id.toString()) {
      logger.warn('Unauthorized access attempt to complaint', { 
        complaintId, 
        userId: req.user._id, 
        complaintUserId: complaint.user 
      });
      return res.status(403).json({ message: "You don't have permission to view this complaint" });
    }

    // Enrich the complaint data
    const enrichedComplaint = {
      ...complaint,
      hasTwitterPost: !!(complaint.twitter && complaint.twitter.tweetId),
      mediaCount: complaint.media ? complaint.media.length : 0,
      isRecent: (Date.now() - new Date(complaint.createdAt).getTime()) < 24 * 60 * 60 * 1000,
      twitterUrl: complaint.twitter && complaint.twitter.tweetId 
        ? `https://twitter.com/user/status/${complaint.twitter.tweetId}` 
        : null
    };

    logger.info('Complaint fetched successfully', { 
      complaintId, 
      userId: req.user._id,
      hasTwitterPost: enrichedComplaint.hasTwitterPost
    });

    res.status(200).json({ complaint: enrichedComplaint });

  } catch (error) {
    logger.error("Error fetching complaint:", { 
      complaintId, 
      userId: req.user._id,
      error: error.message 
    });
    
    res.status(500).json({ 
      message: "Error fetching complaint", 
      error: error.message 
    });
  }
};

// Health check endpoint for the controller
exports.getHealthCheck = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
        gemini: !!process.env.GEMINI_API_KEY,
        twitter: await (async () => {
          try {
            const status = twitterService.getStatus();
            return status.hasCredentials && status.initialized;
          } catch {
            return false;
          }
        })(),
        database: true // Assume healthy if we can respond
      }
    };

    logger.info('Health check performed', health);
    res.status(200).json(health);

  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
