const cloudinary = require("../lib/cloudinary");
const Complaint = require("../models/Complaint");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Utility: Convert URL to Base64 for Gemini
async function urlToBase64(url) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(res.data).toString("base64");
    return base64;
  } catch (error) {
    console.error("Error converting URL to base64:", error.message);
    throw error;
  }
}

// Generate Twitter post content using Gemini AI
async function generateTweetWithGemini(description, location, mediaUrls) {
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log("No Gemini API key found, using fallback message");
      return `🚨 Civic issue reported at ${location}. ${description || "Immediate attention required!"} #MumbaiCivicIssue @mybmc`;
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
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
        }
      } catch (err) {
        console.error("Error processing media for Gemini:", err);
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
        result = await model.generateContent([prompt, ...mediaData]);
      } else {
        result = await model.generateContent(prompt);
      }
      
      const response = await result.response;
      const tweetText = response.text().trim();
      return tweetText;
    } catch (genError) {
      console.error("Error generating content with Gemini:", genError);
      // Fallback tweet text
      return `🚨 Civic issue reported at ${location}. ${description ? description.substring(0, 100) : "Immediate attention required!"} #MumbaiCivicIssue @mybmc`;
    }
  } catch (error) {
    console.error("Error in generateTweetWithGemini:", error);
    return `🚨 Civic issue at ${location}. ${description?.substring(0, 100) || ""} #MumbaiCivicIssue @mybmc`;
  }
}

// Upload media to Twitter v1 API
async function uploadMediaToTwitter(imageUrl) {
  try {
    // Download image from Cloudinary
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data);
    
    // Create form data for media upload
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('media', imageBuffer, { 
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('media_category', 'tweet_image');

    const response = await axios.post(
      'https://upload.twitter.com/1.1/media/upload.json',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          ...formData.getHeaders()
        }
      }
    );

    return response.data.media_id_string;
  } catch (error) {
    console.error('Media upload error:', error.response?.data || error.message);
    throw error;
  }
}

// Post to Twitter using X API v2
async function postToTwitter(tweetText, mediaUrls = []) {
  try {
    // Check if Twitter API credentials are available
    if (!process.env.TWITTER_BEARER_TOKEN) {
      console.log("No Twitter Bearer Token found, simulating post");
      return { 
        success: true, 
        tweetId: "mock_" + Date.now(),
        message: "Development mode: Tweet simulated",
        tweetText: tweetText
      };
    }

    let mediaIds = [];
    
    // Upload media first if provided (only images for now)
    if (mediaUrls && mediaUrls.length > 0) {
      console.log('Uploading media to Twitter...');
      const imageUrls = mediaUrls.filter(url => 
        url.toLowerCase().includes('.jpg') || 
        url.toLowerCase().includes('.jpeg') || 
        url.toLowerCase().includes('.png') ||
        url.toLowerCase().includes('.webp')
      );
      
      for (const mediaUrl of imageUrls.slice(0, 4)) { // Twitter allows max 4 images
        try {
          const mediaId = await uploadMediaToTwitter(mediaUrl);
          mediaIds.push(mediaId);
          console.log('Media uploaded successfully:', mediaId);
        } catch (error) {
          console.error('Failed to upload media:', error.message);
          // Continue without this media
        }
      }
    }

    // Create tweet data
    const tweetData = {
      text: tweetText
    };

    // Add media if uploaded successfully
    if (mediaIds.length > 0) {
      tweetData.media = {
        media_ids: mediaIds
      };
    }

    console.log('Creating tweet with data:', JSON.stringify(tweetData, null, 2));

    // Make request to Twitter API v2
    const response = await axios.post(
      "https://api.twitter.com/2/tweets",
      tweetData,
      {
        headers: {
          "Authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      tweetId: response.data.data.id,
      tweetText: response.data.data.text,
      tweetUrl: `https://twitter.com/user/status/${response.data.data.id}`,
      message: "Tweet posted successfully with media"
    };
  } catch (error) {
    console.error("Error posting to Twitter:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data?.errors || error.message,
      tweetText: tweetText
    };
  }
}

// Submit complaint - simplified version
exports.submitComplaint = async (req, res) => {
  try {
    const { description, location, locationType } = req.body;
    const files = req.files;

    // Validate inputs
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one image or video" });
    }
    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Make sure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "You must be logged in to submit a complaint" });
    }

    // Upload media files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const fileType = file.mimetype.startsWith("image/") ? "image" : "video";
      const fileBuffer = file.buffer.toString("base64");
      const fileData = `data:${file.mimetype};base64,${fileBuffer}`;

      const uploadResult = await cloudinary.uploader.upload(fileData, {
        resource_type: fileType,
        folder: "complaints",
      });

      return {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        type: fileType,
      };
    });

    const uploadedMedia = await Promise.all(uploadPromises);
    const mediaUrls = uploadedMedia.map(media => media.url);

    // Generate tweet content using Gemini AI
    console.log("Generating tweet content with Gemini...");
    const tweetText = await generateTweetWithGemini(description, location, mediaUrls);
    console.log("Generated tweet:", tweetText);

    // Post to Twitter
    console.log("Posting to Twitter...");
    const twitterResult = await postToTwitter(tweetText, mediaUrls);
    console.log("Twitter result:", twitterResult);

    // Save complaint to database
    const newComplaint = new Complaint({
      user: req.user._id,
      description,
      location,
      locationType,
      media: uploadedMedia.map(media => ({
        url: media.url,
        public_id: media.public_id,
        type: media.type,
        isVerified: true, // Simplified - no verification for now
      })),
      status: twitterResult.success ? "posted" : "verified",
      twitter: {
        tweetId: twitterResult.tweetId || null,
        status: twitterResult.success ? "posted" : "failed",
        postedAt: twitterResult.success ? new Date() : null,
        error: twitterResult.success ? null : twitterResult.error,
      },
    });

    await newComplaint.save();

    // Return success response
    res.status(201).json({
      message: "Complaint submitted successfully!",
      complaintId: newComplaint._id,
      tweetText: tweetText,
      twitterResult: {
        success: twitterResult.success,
        tweetId: twitterResult.tweetId,
        message: twitterResult.message,
      },
    });

  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ 
      message: "Error submitting complaint", 
      error: error.message 
    });
  }
};

// Get user complaints
exports.getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({ complaints });
  } catch (error) {
    console.error("Error fetching user complaints:", error);
    res.status(500).json({ message: "Error fetching complaints", error: error.message });
  }
};

// Get complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Check if the complaint belongs to the requesting user
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You don't have permission to view this complaint" });
    }

    res.status(200).json({ complaint });
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({ message: "Error fetching complaint", error: error.message });
  }
};