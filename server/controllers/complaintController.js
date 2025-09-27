const cloudinary = require("../lib/cloudinary");
const Complaint = require("../models/complaint");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const twitterService = require("../services/twitterService");
const { TwitterMediaUploader } = require("../services/twitter-media-uploader");
const AIDetectionService = require("../services/ai-detection-service");
const Comment = require("../models/comment");
const User = require("../models/user");

// Initialize Gemini AI, Twitter Media Uploader, and AI Detection Service
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const mediaUploader = new TwitterMediaUploader();
const aiDetectionService = new AIDetectionService();

// Convert URL to Base64
async function urlToBase64(url) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary").toString("base64");
  } catch (error) {
    throw new Error(`Error converting URL to base64: ${error.message}`);
  }
}

// Civic authorities database for intelligent tagging
const civicAuthorities = {
  mumbai: [
    {
      name: "Mumbai Municipal Corporation",
      handle: "@mybmc",
      keywords: [
        "mumbai",
        "bmc",
        "sewage",
        "water",
        "garbage",
        "sanitation",
        "infrastructure",
        "road",
        "pothole",
        "streetlight",
      ],
    },
    {
      name: "MMRDA",
      handle: "@MMRDAOfficial",
      keywords: [
        "mumbai",
        "metropolitan",
        "development",
        "planning",
        "transport",
        "metro",
      ],
    },
    {
      name: "Mumbai Police",
      handle: "@MumbaiPolice",
      keywords: [
        "mumbai",
        "police",
        "crime",
        "safety",
        "security",
        "traffic",
        "law",
      ],
    },
    {
      name: "Mumbai Traffic Police",
      handle: "@MTPHereToHelp",
      keywords: [
        "mumbai",
        "traffic",
        "signal",
        "congestion",
        "parking",
        "road safety",
      ],
    },
    {
      name: "BEST Bus",
      handle: "@myBESTBus",
      keywords: ["mumbai", "bus", "transport", "route", "timing", "shelter"],
    },
    {
      name: "Mumbai Waste Management",
      handle: "@mybmcSWM",
      keywords: [
        "mumbai",
        "waste",
        "garbage",
        "collection",
        "sanitation",
        "cleanliness",
      ],
    },
  ],
  palghar: [
    {
      name: "Collector Palghar",
      handle: "@collectorpal",
      keywords: [
        "palghar",
        "district",
        "administrative",
        "grievance",
        "government",
      ],
    },
    {
      name: "Municipal Council Palghar",
      handle: "@councilpalghar",
      keywords: ["palghar", "civic", "water", "sanitation", "infrastructure"],
    },
    {
      name: "Info Palghar",
      handle: "@InfoPalghar",
      keywords: ["palghar", "information", "updates", "schemes", "notices"],
    },
    {
      name: "Palghar Police",
      handle: "@Palghar_Police",
      keywords: ["palghar", "police", "law", "order", "safety", "crime"],
    },
  ],
  vasaiVirar: [
    {
      name: "Vasai Virar Municipal Corporation",
      handle: "@vvcmc_official",
      keywords: [
        "vasai",
        "virar",
        "civic",
        "municipal",
        "infrastructure",
        "services",
      ],
    },
    {
      name: "Zilla Parishad Palghar",
      handle: "@PalgharCEO",
      keywords: [
        "palghar",
        "rural",
        "development",
        "education",
        "healthcare",
        "zilla",
      ],
    },
  ],
};

// Get human-readable address from coordinates using reverse geocoding
async function getAddressFromCoords(lat, lng) {
  console.log(
    `🗺️ [GEOCODING] Starting reverse geocoding for coordinates: ${lat}, ${lng}`
  );

  try {
    // First try with OpenStreetMap Nominatim (free service)
    console.log("🗺️ [GEOCODING] Attempting with OpenStreetMap Nominatim...");
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );

    const data = response.data;
    console.log(`🗺️ [GEOCODING] Nominatim response:`, data);

    if (data && data.display_name) {
      const fullAddress = data.display_name;
      console.log(`✅ [GEOCODING] Address found: ${fullAddress}`);
      return fullAddress;
    } else {
      console.log("⚠️ [GEOCODING] No address found in Nominatim response");
      return `Location: ${lat}, ${lng}`;
    }
  } catch (nominatimError) {
    console.log(`❌ [GEOCODING] Nominatim failed: ${nominatimError.message}`);

    // Fallback: Try with Google Maps API if available
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        console.log("🗺️ [GEOCODING] Attempting with Google Maps API...");
        const googleResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
          {
            timeout: 10000,
          }
        );

        const googleData = googleResponse.data;
        console.log(
          `🗺️ [GEOCODING] Google Maps response status:`,
          googleData.status
        );

        if (
          googleData.status === "OK" &&
          googleData.results &&
          googleData.results.length > 0
        ) {
          const googleAddress = googleData.results[0].formatted_address;
          console.log(
            `✅ [GEOCODING] Google Maps address found: ${googleAddress}`
          );
          return googleAddress;
        } else {
          console.log(
            "⚠️ [GEOCODING] No address found in Google Maps response"
          );
        }
      } catch (googleError) {
        console.log(
          `❌ [GEOCODING] Google Maps API failed: ${googleError.message}`
        );
      }
    }

    // Final fallback: return coordinates as string
    console.log("🔄 [GEOCODING] Using coordinate fallback");
    return `Location: ${lat}, ${lng}`;
  }
}

// Get coordinates from human-readable address using forward geocoding
async function getCoordsFromAddress(address) {
  console.log(
    `🗺️ [FORWARD GEOCODING] Starting forward geocoding for address: "${address}"`
  );

  // Detect and handle Plus Codes (e.g., "PQ4Q+864, ...")
  const firstPart = address.trim().split(",")[0];
  const isPlusCode =
    /^[23456789CFGHJMPQRVWX]{4}\+[23456789CFGHJMPQRVWX]{2,3}/.test(firstPart);

  if (isPlusCode) {
    console.log(
      "🎯 [FORWARD GEOCODING] Plus Code detected, using area-based search..."
    );

    // Extract the area information after the Plus Code
    const addressParts = address.split(",").map((part) => part.trim());
    console.log(`🔍 [FORWARD GEOCODING] Address parts:`, addressParts);

    // Try different search strategies for Plus Code addresses
    const searchStrategies = [
      // Strategy 1: Use area names without Plus Code
      addressParts.slice(1).join(", "),
      // Strategy 2: Extract postal code and use with state
      (() => {
        const postalCodeMatch = address.match(/\b\d{6}\b/);
        return postalCodeMatch ? `${postalCodeMatch[0]}, Maharashtra` : null;
      })(),
      // Strategy 3: Use major area names only
      (() => {
        const maharashtraIndex = addressParts.findIndex((part) =>
          part.toLowerCase().includes("maharashtra")
        );
        if (maharashtraIndex > 1) {
          return addressParts.slice(-2).join(", "); // Last two parts
        }
        return null;
      })(),
    ].filter(Boolean); // Remove null values

    console.log(
      `� [FORWARD GEOCODING] Trying ${searchStrategies.length} search strategies...`
    );

    // Try each strategy
    for (let i = 0; i < searchStrategies.length; i++) {
      const strategy = searchStrategies[i];
      console.log(`🔍 [FORWARD GEOCODING] Strategy ${i + 1}: "${strategy}"`);

      try {
        const result = await performNominatimSearch(strategy);
        if (result.success) {
          console.log(
            `✅ [FORWARD GEOCODING] Plus Code area found via strategy ${i + 1}`
          );
          return {
            ...result,
            isApproximate: true,
            originalAddress: address,
            searchStrategy: `Area-based search: ${strategy}`,
          };
        }
      } catch (error) {
        console.log(
          `⚠️ [FORWARD GEOCODING] Strategy ${i + 1} failed: ${error.message}`
        );
      }
    }
  }

  // Try with the full address for non-Plus Code addresses or if Plus Code strategies failed
  try {
    const result = await performNominatimSearch(address);
    if (result.success) {
      return result;
    }
  } catch (nominatimError) {
    console.log(
      `❌ [FORWARD GEOCODING] Nominatim failed: ${nominatimError.message}`
    );
  }

  // Fallback: Try with Google Maps API if available
  if (process.env.GOOGLE_MAPS_API_KEY) {
    try {
      const result = await performGoogleMapsSearch(address);
      if (result.success) {
        return result;
      }
    } catch (googleError) {
      console.log(
        `❌ [FORWARD GEOCODING] Google Maps API failed: ${googleError.message}`
      );
    }
  }

  // Final fallback: return failure with helpful message
  console.log("🔄 [FORWARD GEOCODING] Forward geocoding failed");
  return {
    success: false,
    error: "Unable to verify address or extract coordinates",
    originalAddress: address,
    suggestion: isPlusCode
      ? "Plus Codes work better with area information. Try including city/district name."
      : "Try including more specific location details like city, state, or landmarks.",
  };
}

// Helper function for Nominatim search
async function performNominatimSearch(searchAddress) {
  console.log(
    `🗺️ [FORWARD GEOCODING] Attempting with OpenStreetMap Nominatim: "${searchAddress}"`
  );

  const response = await axios.get(
    `https://nominatim.openstreetmap.org/search`,
    {
      params: {
        q: searchAddress,
        format: "jsonv2",
        limit: 3, // Increased limit for better results
        countrycodes: "in", // Limit to India for better accuracy
        addressdetails: 1,
        dedupe: 1, // Remove duplicate results
      },
      headers: {
        "User-Agent": "SilentShout-Civic-App/1.0",
      },
      timeout: 15000, // Increased timeout to 15 seconds
    }
  );

  const data = response.data;
  console.log(
    `🗺️ [FORWARD GEOCODING] Nominatim response count: ${data ? data.length : 0}`
  );

  if (data && data.length > 0) {
    // Find the best match (highest importance score)
    const result = data.reduce((best, current) => {
      return (current.importance || 0) > (best.importance || 0)
        ? current
        : best;
    });

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const foundAddress = result.display_name;

    console.log(
      `✅ [FORWARD GEOCODING] Coordinates found: lat=${lat}, lng=${lng}`
    );
    console.log(`✅ [FORWARD GEOCODING] Verified address: ${foundAddress}`);
    console.log(
      `🎯 [FORWARD GEOCODING] Confidence: ${result.importance || 0.5}`
    );

    return {
      success: true,
      latitude: lat,
      longitude: lng,
      verifiedAddress: foundAddress,
      confidence: result.importance || 0.5,
    };
  } else {
    console.log(
      "⚠️ [FORWARD GEOCODING] No coordinates found in Nominatim response"
    );
    return {
      success: false,
      error: "Address not found",
      originalAddress: searchAddress,
    };
  }
}

// Helper function for Google Maps search
async function performGoogleMapsSearch(address) {
  console.log("🗺️ [FORWARD GEOCODING] Attempting with Google Maps API...");

  const googleResponse = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json`,
    {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
        region: "in", // Bias towards India
      },
      timeout: 15000, // Increased timeout
    }
  );

  const googleData = googleResponse.data;
  console.log(
    `🗺️ [FORWARD GEOCODING] Google Maps response status: ${googleData.status}`
  );

  if (
    googleData.status === "OK" &&
    googleData.results &&
    googleData.results.length > 0
  ) {
    const result = googleData.results[0];
    const lat = result.geometry.location.lat;
    const lng = result.geometry.location.lng;
    const googleAddress = result.formatted_address;

    console.log(
      `✅ [FORWARD GEOCODING] Google Maps coordinates found: lat=${lat}, lng=${lng}`
    );
    console.log(
      `✅ [FORWARD GEOCODING] Google verified address: ${googleAddress}`
    );

    return {
      success: true,
      latitude: lat,
      longitude: lng,
      verifiedAddress: googleAddress,
      confidence: 0.8, // Google typically has high confidence
    };
  } else {
    console.log(
      "⚠️ [FORWARD GEOCODING] No coordinates found in Google Maps response"
    );
    return {
      success: false,
      error: "Address not found in Google Maps",
      originalAddress: address,
    };
  }
}

// Generate comprehensive civic complaint content using Gemini AI
async function generateCivicComplaintContent(
  userDescription,
  location,
  mediaUrls = []
) {
  console.log("🤖 [GEMINI] Starting civic complaint content generation...");
  console.log(`🤖 [GEMINI] Location: ${location}`);
  console.log(`🤖 [GEMINI] User Description: ${userDescription}`);
  console.log(`🤖 [GEMINI] Media URLs count: ${mediaUrls.length}`);

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.log("⚠️ [GEMINI] No API key found, using fallback content");
      return {
        title: `Civic Issue Reported at ${location}`,
        description:
          userDescription ||
          "Civic infrastructure issue requiring immediate attention",
        category: "Infrastructure",
        authorities: [{ name: "Local Authority", handle: "@localauth" }],
        tweetText: `🚨 Civic issue reported at ${location}. Immediate attention required! #CivicIssue #SilentShout`,
      };
    }

    console.log("🤖 [GEMINI] Initializing Gemini model...");
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash",
    });

    // Professional prompt for diplomatic civic complaint analysis
    const prompt = `
As a professional civic complaint analyst, analyze the following civic issue and generate content for social media outreach:

**LOCATION:** ${location}
**USER DESCRIPTION:** ${userDescription || "No description provided"}
**IMAGES:** ${
      mediaUrls.length > 0
        ? "Images provided for analysis"
        : "No images provided"
    }

**CIVIC AUTHORITIES DATABASE:**
Mumbai Region:
- BMC (@mybmc): Sanitation, water, infrastructure, roads, streetlights
- MMRDA (@MMRDAOfficial): Metropolitan planning, transport, development  
- Mumbai Police (@MumbaiPolice): Law enforcement, public safety
- Traffic Police (@MTPHereToHelp): Traffic management, road safety
- BEST Bus (@myBESTBus): Public transport, bus services
- Waste Management (@mybmcSWM): Garbage collection, cleanliness

Palghar Region:
- Collector Palghar (@collectorpal): District administration, grievances
- Municipal Council (@councilpalghar): Local civic services
- Info Palghar (@InfoPalghar): Government updates, schemes
- Palghar Police (@Palghar_Police): Law enforcement

Vasai-Virar Region:
- VVMC (@vvcmc_official): Municipal services, infrastructure
- Zilla Parishad (@PalgharCEO): Rural development, healthcare

**INSTRUCTIONS:**
1. **ANALYZE** the location and user description to identify the civic issue type
2. **DETERMINE** appropriate category (Infrastructure, Sanitation, Traffic, Safety, Environment, etc.)
3. **SELECT** relevant authorities based on location and issue type (2-3 maximum)
4. **CREATE** a professional, diplomatic tweet (max 280 chars) that:
   - Uses respectful, non-aggressive tone
   - Includes location context
   - Tags appropriate authorities
   - Uses relevant hashtags (#MumbaiCivicIssue, #CleanMumbai, #SwachhBharat, #PalgharCares, #CivicIssue)
   - Encourages constructive action
5. **GENERATE** a clear, professional title (max 100 chars)
6. **WRITE** a detailed description for database storage (max 500 chars, more professional than user input)

**TONE GUIDELINES:**
- Professional and diplomatic
- Solution-oriented, not confrontational  
- Respectful to authorities
- Community-focused
- Urgent but not aggressive

**RESPONSE FORMAT (JSON):**
{
  "title": "Brief, descriptive title",
  "description": "Professional description for database storage",  
  "category": "Issue category",
  "authorities": [{"name": "Authority Name", "handle": "@handle"}],
  "tweetText": "Professional tweet with appropriate tags and hashtags"
}

Generate the response now:`;

    console.log(`🤖 [GEMINI] Generated comprehensive prompt`);

    let mediaData = [];
    if (mediaUrls && mediaUrls.length > 0) {
      console.log("🖼️ [GEMINI] Processing images for AI analysis...");
      try {
        const imageUrls = mediaUrls.filter(
          (url) =>
            url.toLowerCase().includes(".jpg") ||
            url.toLowerCase().includes(".jpeg") ||
            url.toLowerCase().includes(".png") ||
            url.toLowerCase().includes(".webp") ||
            url.toLowerCase().includes(".avif") ||
            url.toLowerCase().includes(".gif")
        );
        console.log(`🖼️ [GEMINI] Found ${imageUrls.length} image URLs`);

        for (const imageUrl of imageUrls.slice(0, 3)) {
          try {
            console.log(`🖼️ [GEMINI] Converting image to base64: ${imageUrl}`);
            const base64Data = await urlToBase64(imageUrl);
            mediaData.push({
              inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
              },
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
      console.log(
        `🤖 [GEMINI] Including ${mediaData.length} images in analysis`
      );
    }

    try {
      console.log("🤖 [GEMINI] Calling Gemini API...");
      const result = await model.generateContent(parts);
      const response = await result.response;
      const rawResponse = response.text();
      console.log(`📄 [GEMINI] Raw response: ${rawResponse}`);

      // Parse JSON response
      let parsedContent;
      try {
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : rawResponse;
        parsedContent = JSON.parse(jsonString);
        console.log(`✅ [GEMINI] Successfully parsed structured content`);
      } catch (parseError) {
        console.log(`⚠️ [GEMINI] Failed to parse JSON, using fallback parsing`);
        // Fallback parsing logic
        parsedContent = {
          title: `Civic Issue at ${location}`,
          description:
            userDescription || "Civic infrastructure issue requiring attention",
          category: "Infrastructure",
          authorities: [
            { name: "Local Municipal Corporation", handle: "@mybmc" },
          ],
          tweetText: rawResponse.substring(0, 280),
        };
      }

      // Validate and sanitize the parsed content
      const sanitizedContent = {
        title: (parsedContent.title || `Civic Issue at ${location}`).substring(
          0,
          100
        ),
        description: (
          parsedContent.description ||
          userDescription ||
          "Civic issue requiring attention"
        ).substring(0, 500),
        category: parsedContent.category || "Infrastructure",
        authorities: Array.isArray(parsedContent.authorities)
          ? parsedContent.authorities.slice(0, 3)
          : [{ name: "Local Authority", handle: "@mybmc" }],
        tweetText: (parsedContent.tweetText || rawResponse).substring(0, 280),
      };

      console.log(
        `✅ [GEMINI] Generated structured content:`,
        sanitizedContent
      );
      return sanitizedContent;
    } catch (genError) {
      console.log(`⚠️ [GEMINI] API call failed: ${genError.message}`);
      console.log("🔄 [GEMINI] Using intelligent fallback");
      return generateFallbackContent(userDescription, location);
    }
  } catch (error) {
    console.log(`❌ [GEMINI] Critical error: ${error.message}`);
    console.log("🔄 [GEMINI] Using emergency fallback");
    return generateFallbackContent(userDescription, location);
  }
}

// Generate intelligent fallback content when AI fails
function generateFallbackContent(userDescription, location) {
  console.log("🔄 [FALLBACK] Generating intelligent fallback content");

  // Determine authorities based on location
  let selectedAuthorities = [];
  const locationLower = location.toLowerCase();

  if (
    locationLower.includes("mumbai") ||
    locationLower.includes("bandra") ||
    locationLower.includes("andheri")
  ) {
    selectedAuthorities = [
      { name: "Mumbai Municipal Corporation", handle: "@mybmc" },
    ];
  } else if (locationLower.includes("palghar")) {
    selectedAuthorities = [
      { name: "Collector Palghar", handle: "@collectorpal" },
    ];
  } else if (
    locationLower.includes("vasai") ||
    locationLower.includes("virar")
  ) {
    selectedAuthorities = [
      { name: "Vasai Virar Municipal Corporation", handle: "@vvcmc_official" },
    ];
  } else {
    selectedAuthorities = [
      { name: "Local Municipal Corporation", handle: "@mybmc" },
    ];
  }

  // Determine category from description
  let category = "Infrastructure";
  if (userDescription) {
    const desc = userDescription.toLowerCase();
    if (
      desc.includes("garbage") ||
      desc.includes("waste") ||
      desc.includes("clean")
    ) {
      category = "Sanitation";
    } else if (
      desc.includes("traffic") ||
      desc.includes("signal") ||
      desc.includes("parking")
    ) {
      category = "Traffic";
    } else if (
      desc.includes("water") ||
      desc.includes("sewage") ||
      desc.includes("drain")
    ) {
      category = "Water Management";
    } else if (
      desc.includes("safety") ||
      desc.includes("crime") ||
      desc.includes("police")
    ) {
      category = "Safety";
    }
  }

  const fallbackContent = {
    title: `${category} Issue Reported at ${location}`,
    description: userDescription
      ? `${category} concern reported: ${userDescription}. Requires immediate attention from relevant authorities.`
      : `${category} issue identified at ${location}. Community seeks prompt resolution from civic authorities.`,
    category: category,
    authorities: selectedAuthorities,
    tweetText: `🚨 ${category} issue reported at ${location}. Requesting prompt attention ${selectedAuthorities[0]?.handle}. Community cooperation appreciated. #CivicIssue #SwachhBharat`,
  };

  console.log(`✅ [FALLBACK] Generated content:`, fallbackContent);
  return fallbackContent;
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
      const imageUrls = mediaUrls.filter((url) => {
        const lowerUrl = url.toLowerCase();
        return (
          lowerUrl.includes(".jpg") ||
          lowerUrl.includes(".jpeg") ||
          lowerUrl.includes(".png") ||
          lowerUrl.includes(".webp") ||
          lowerUrl.includes(".avif") ||
          lowerUrl.includes(".gif")
        );
      });
      console.log(
        `📷 [TWITTER] Found ${imageUrls.length} image URLs to upload`
      );

      try {
        console.log("📤 [TWITTER] Uploading media to Twitter...");
        const uploadResults = await mediaUploader.uploadMultipleMedia(
          imageUrls.slice(0, 4)
        );
        mediaIds = uploadResults
          .filter((result) => result.success)
          .map((result) => result.mediaId);
        console.log(
          `✅ [TWITTER] Successfully uploaded ${mediaIds.length} media files`
        );
        console.log(`🆔 [TWITTER] Media IDs: ${mediaIds.join(", ")}`);
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
        mediaCount: mediaIds.length,
      };
    } else {
      console.log(`❌ [TWITTER] Tweet posting failed: ${result.error}`);
      return {
        success: false,
        error: result.error,
        code: result.code,
        tweetText: tweetText,
        mediaCount: mediaIds.length,
      };
    }
  } catch (error) {
    console.log(
      `❌ [TWITTER] Critical error in Twitter posting: ${error.message}`
    );
    console.log(`❌ [TWITTER] Error stack:`, error.stack);
    return {
      success: false,
      error: error.message,
      tweetText: tweetText,
      fallbackMode: true,
      message: "Twitter posting failed - check logs for details",
    };
  }
}

// Submit complaint - main controller function
exports.submitComplaint = async (req, res) => {
  console.log("🚀 [SUBMIT COMPLAINT] Starting complaint submission");
  const complaintId = `complaint_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  console.log(`📝 [SUBMIT COMPLAINT] Generated complaint ID: ${complaintId}`);

  // Check authentication
  if (!req.user || !req.user._id) {
    console.log("❌ [SUBMIT COMPLAINT] Authentication failed - no user found");
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  console.log(`👤 [SUBMIT COMPLAINT] User authenticated: ${req.user._id}`);

  try {
    console.log(
      "🔍 [SUBMIT COMPLAINT] Request body:",
      JSON.stringify(req.body, null, 2)
    );
    console.log(
      "🔍 [SUBMIT COMPLAINT] Request body keys:",
      Object.keys(req.body)
    );

    console.log(
      "🔍 [SUBMIT COMPLAINT] Request body keys:",
      Object.keys(req.body)
    );

    const { description, location, locationType } = req.body;
    console.log(`🔍 [SUBMIT COMPLAINT] Raw location: "${location}"`);
    console.log(`🔍 [SUBMIT COMPLAINT] Location type: ${locationType}`);

    // Parse latitude and longitude based on location type
    let latitude,
      longitude,
      namedAddress = "";

    if (locationType === "manual") {
      // Handle manual address input - validate and extract coordinates
      console.log("📍 [SUBMIT COMPLAINT] Processing manual address input...");

      if (!location || typeof location !== "string" || location.trim() === "") {
        console.log("❌ [SUBMIT COMPLAINT] Invalid manual address provided");
        return res.status(400).json({
          message: "Please provide a valid address",
          error: "INVALID_ADDRESS",
        });
      }

      try {
        console.log(
          "🗺️ [SUBMIT COMPLAINT] Validating address and extracting coordinates..."
        );
        const geocodeResult = await getCoordsFromAddress(location.trim());

        if (geocodeResult.success) {
          latitude = geocodeResult.latitude;
          longitude = geocodeResult.longitude;
          namedAddress = geocodeResult.verifiedAddress;

          console.log(`✅ [SUBMIT COMPLAINT] Address validated successfully`);
          console.log(
            `✅ [SUBMIT COMPLAINT] Extracted coordinates: lat=${latitude}, lng=${longitude}`
          );
          console.log(
            `✅ [SUBMIT COMPLAINT] Verified address: ${namedAddress}`
          );

          // Log if this is an approximate location
          if (geocodeResult.isApproximate) {
            console.log(
              `ℹ️ [SUBMIT COMPLAINT] Using approximate location - ${geocodeResult.searchStrategy}`
            );
          }
        } else {
          console.log(
            `❌ [SUBMIT COMPLAINT] Address validation failed: ${geocodeResult.error}`
          );

          // Provide specific error messages based on the type of address
          const originalAddr = geocodeResult.originalAddress || location.trim();
          let errorMessage =
            geocodeResult.suggestion ||
            "Unable to locate the provided address. Please check the address and try again.";

          if (
            /^[23456789CFGHJMPQRVWX]{4}\+[23456789CFGHJMPQRVWX]{2,3}/.test(
              originalAddr.split(",")[0].trim()
            )
          ) {
            errorMessage =
              "Plus Code addresses need additional area information. Please include the city/area name after the Plus Code (e.g., 'PQ4Q+864, City Name, State').";
          }

          return res.status(400).json({
            message: errorMessage,
            error: "ADDRESS_NOT_FOUND",
            originalAddress: originalAddr,
            suggestion:
              geocodeResult.suggestion ||
              "Try including more specific location details like city, state, or nearby landmarks.",
          });
        }
      } catch (geocodeError) {
        console.log(
          `❌ [SUBMIT COMPLAINT] Address validation error: ${geocodeError.message}`
        );
        return res.status(400).json({
          message: "Failed to validate address. Please try again.",
          error: "GEOCODING_FAILED",
        });
      }
    } else {
      // Handle coordinate-based input (auto-detect or map selection)
      console.log(
        "📍 [SUBMIT COMPLAINT] Processing coordinate-based location input..."
      );

      if (location && typeof location === "string" && location.includes(",")) {
        const [lat, lng] = location.split(",").map((coord) => coord.trim());
        latitude = parseFloat(lat);
        longitude = parseFloat(lng);
        console.log(
          `🔍 [SUBMIT COMPLAINT] Parsed coordinates - lat: ${latitude}, lng: ${longitude}`
        );

        if (!isNaN(latitude) && !isNaN(longitude)) {
          try {
            console.log(
              "🗺️ [SUBMIT COMPLAINT] Attempting to fetch named address from coordinates..."
            );
            namedAddress = await getAddressFromCoords(latitude, longitude);
            console.log(`✅ [SUBMIT COMPLAINT] Named Address: ${namedAddress}`);
          } catch (addressError) {
            console.log(
              `⚠️ [SUBMIT COMPLAINT] Address fetching failed: ${addressError.message}`
            );
            console.log(
              "🔄 [SUBMIT COMPLAINT] Proceeding without named address"
            );
            namedAddress = `Location: ${latitude}, ${longitude}`;
          }
        } else {
          console.log(
            `❌ [SUBMIT COMPLAINT] Invalid coordinates parsed from: "${location}"`
          );
          return res.status(400).json({
            message: "Invalid location coordinates provided",
            error: "INVALID_COORDINATES",
          });
        }
      } else {
        console.log(
          `❌ [SUBMIT COMPLAINT] Invalid location format: "${location}"`
        );
        return res.status(400).json({
          message:
            "Invalid location format. Please provide valid coordinates or address.",
          error: "INVALID_LOCATION_FORMAT",
        });
      }
    }

    console.log(
      `📍 [SUBMIT COMPLAINT] Final Location: ${latitude}, ${longitude}, Type: ${locationType}`
    );
    console.log(`🏠 [SUBMIT COMPLAINT] Named Address: ${namedAddress}`);
    console.log(`📄 [SUBMIT COMPLAINT] Description: ${description}`);
    console.log(
      `📎 [SUBMIT COMPLAINT] Files received: ${
        req.files ? req.files.length : 0
      }`
    );

    // Validation
    if (!req.files || req.files.length === 0) {
      console.log(
        "❌ [SUBMIT COMPLAINT] Validation failed - no files provided"
      );
      return res.status(400).json({
        success: false,
        message: "At least one image/video file is required",
      });
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      console.log(
        "❌ [SUBMIT COMPLAINT] Validation failed - missing or invalid coordinates"
      );
      console.log(
        `🔍 [SUBMIT COMPLAINT] Latitude: ${latitude} (isNaN: ${isNaN(
          latitude
        )})`
      );
      console.log(
        `🔍 [SUBMIT COMPLAINT] Longitude: ${longitude} (isNaN: ${isNaN(
          longitude
        )})`
      );
      return res.status(400).json({
        success: false,
        message: "Valid location coordinates are required",
      });
    }
    console.log("✅ [SUBMIT COMPLAINT] Validation passed");

    // Upload media to Cloudinary
    console.log("☁️ [SUBMIT COMPLAINT] Starting Cloudinary uploads...");
    const mediaUrls = [];
    const uploadPromises = req.files.map(async (file, index) => {
      try {
        console.log(
          `📤 [CLOUDINARY] Uploading file ${index + 1}/${req.files.length}: ${
            file.originalname
          }`
        );
        console.log(
          `📤 [CLOUDINARY] File size: ${file.size} bytes, mimetype: ${file.mimetype}`
        );

        // Since we're using memory storage, upload from buffer
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder: "complaints",
            resource_type: "auto",
          }
        );
        console.log(
          `✅ [CLOUDINARY] File ${index + 1} uploaded successfully: ${
            result.secure_url
          }`
        );
        return result.secure_url;
      } catch (error) {
        console.log(
          `❌ [CLOUDINARY] Upload failed for file ${index + 1}: ${
            error.message
          }`
        );
        throw error;
      }
    });

    try {
      console.log("⏳ [CLOUDINARY] Waiting for all uploads to complete...");
      const uploadResults = await Promise.all(uploadPromises);
      mediaUrls.push(...uploadResults);
      console.log(
        `✅ [CLOUDINARY] All uploads completed. Total URLs: ${mediaUrls.length}`
      );
    } catch (uploadError) {
      console.log(
        `❌ [CLOUDINARY] Upload process failed: ${uploadError.message}`
      );
      return res.status(500).json({
        success: false,
        message: "Failed to upload media files",
        error: uploadError.message,
      });
    }

    // Generate comprehensive complaint content using AI
    console.log("🤖 [GEMINI AI] Generating comprehensive complaint content...");
    const locationString = namedAddress || `${latitude}, ${longitude}`; // Use human-readable address
    console.log(`🤖 [GEMINI AI] Using location: ${locationString}`);
    const complaintContent = await generateCivicComplaintContent(
      description,
      locationString,
      mediaUrls
    );
    console.log(`📝 [GEMINI AI] Generated content:`, complaintContent);

    // Post to Twitter using the generated tweet text
    console.log("🐦 [TWITTER] Posting to Twitter...");
    const twitterResult = await postToTwitterWithService(
      complaintContent.tweetText,
      mediaUrls
    );
    console.log(`🐦 [TWITTER] Post result:`, twitterResult);

    // Save to database using AI-generated content
    console.log("💾 [DATABASE] Saving complaint to database...");
    console.log("💾 [DATABASE] Preparing data according to schema...");

    // Convert mediaUrls to media format expected by schema
    const mediaArray = mediaUrls.map((url) => ({
      url: url,
      type: "image",
    }));
    console.log(
      `💾 [DATABASE] Media array prepared: ${mediaArray.length} items`
    );

    const newComplaint = new Complaint({
      userId: req.user._id,
      title: complaintContent.title, // Use AI-generated title
      description: complaintContent.description, // Use AI-generated professional description
      category: complaintContent.category, // Use AI-determined category
      authorities: complaintContent.authorities, // Use AI-selected authorities
      location: {
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        type: "Point",
        namedAddress: namedAddress || `${latitude}, ${longitude}`, // Save the human-readable address
      },
      media: mediaArray, // Use correct media format

      // Twitter data in correct format
      twitter: {
        tweetId: twitterResult.success ? twitterResult.tweetId : undefined,
        status: twitterResult.success ? "posted" : "failed",
        postedAt: twitterResult.success ? new Date() : undefined,
        error: twitterResult.success ? undefined : twitterResult.error,
      },

      status: "open", // Set initial status
    });

    console.log(
      "💾 [DATABASE] Complaint object created, attempting to save..."
    );
    const savedComplaint = await newComplaint.save();
    console.log(
      `✅ [DATABASE] Complaint saved successfully with ID: ${savedComplaint._id}`
    );
    const currUser = await User.findById(req.user._id);
    currUser.complaints.push(savedComplaint._id);
    await currUser.save();

    console.log("🎉 [SUBMIT COMPLAINT] Process completed successfully");
    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      complaint: {
        id: savedComplaint._id,
        title: savedComplaint.title,
        description: savedComplaint.description,
        category: savedComplaint.category,
        authorities: savedComplaint.authorities,
        location: savedComplaint.location,
        media: savedComplaint.media,
        status: savedComplaint.status,
        createdAt: savedComplaint.createdAt,
        twitter: savedComplaint.twitter,
      },
      twitter: {
        success: twitterResult.success,
        tweetId: twitterResult.tweetId,
        tweetUrl: twitterResult.tweetUrl,
        message: twitterResult.message,
      },
      aiGenerated: {
        title: complaintContent.title,
        description: complaintContent.description,
        category: complaintContent.category,
        authorities: complaintContent.authorities,
        tweetText: complaintContent.tweetText,
      },
    });
  } catch (error) {
    console.error(
      "❌ [SUBMIT COMPLAINT] Error in complaint submission:",
      error
    );
    console.error("❌ [SUBMIT COMPLAINT] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to submit complaint",
      error: error.message,
    });
  }
};

// Get user complaints
exports.getUserComplaints = async (req, res) => {
  console.log("📋 [GET USER COMPLAINTS] Starting to fetch user complaints");
  console.log(`👤 [GET USER COMPLAINTS] User ID: ${req.user?._id}`);
  try {
    if (!req.user || !req.user._id) {
      console.log(
        "❌ [GET USER COMPLAINTS] Authentication failed - no user found"
      );
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    console.log(
      "🔍 [GET USER COMPLAINTS] Fetching complaints from database..."
    );
    const complaints = await Complaint.find({ userId: req.user._id })
      .populate("comments")
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(
      `✅ [GET USER COMPLAINTS] Found ${complaints.length} complaints`
    );
    res.json({
      success: true,
      message: "Complaints fetched successfully",
      complaints: complaints.map((complaint) => ({
        id: complaint._id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        authorities: complaint.authorities,
        location: complaint.location,
        media: complaint.media,
        status: complaint.status,
        upvote: complaint.upvote || 0,
        downvote: complaint.downvote || 0,
        comments: complaint.comments || [],
        commentsCount: complaint.comments ? complaint.comments.length : 0,
        createdAt: complaint.createdAt,
        twitterData: complaint.twitterData,
        twitter: complaint.twitter,
        twitterUrl:
          complaint.twitter && complaint.twitter.tweetId
            ? `https://twitter.com/SilentShout_App/status/${complaint.twitter.tweetId}`
            : null,
      })),
      total: complaints.length,
    });
  } catch (error) {
    console.error("❌ [GET USER COMPLAINTS] Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
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
      console.log(
        "❌ [GET COMPLAINT BY ID] Authentication failed - no user found"
      );
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    console.log(`👤 [GET COMPLAINT BY ID] User authenticated: ${req.user._id}`);

    console.log("🔍 [GET COMPLAINT BY ID] Fetching complaint from database...");
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      console.log("❌ [GET COMPLAINT BY ID] Complaint not found in database");
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }
    console.log("✅ [GET COMPLAINT BY ID] Complaint found in database");

    // Check if user owns this complaint
    console.log("🔐 [GET COMPLAINT BY ID] Checking complaint ownership...");
    if (complaint.userId.toString() !== req.user._id.toString()) {
      console.log(
        "❌ [GET COMPLAINT BY ID] Access denied - user doesn't own this complaint"
      );
      return res.status(403).json({
        success: false,
        message: "Access denied",
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
        metadata: complaint.metadata,
      },
    });
  } catch (error) {
    console.error("❌ [GET COMPLAINT BY ID] Error fetching complaint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch complaint",
      error: error.message,
    });
  }
};

// AI Detection endpoint for frontend validation
exports.detectAI = async (req, res) => {
  console.log("🤖 [AI DETECTION] Frontend AI detection request received");

  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      console.log("❌ [AI DETECTION] No files provided for AI detection");
      return res.status(400).json({
        success: false,
        message: "No files provided for AI detection",
      });
    }

    console.log(
      `📁 [AI DETECTION] Processing ${req.files.length} files for AI detection`
    );

    // Upload files to Cloudinary to get URLs for AI detection
    const uploadPromises = req.files.map(async (file, index) => {
      console.log(
        `☁️ [AI DETECTION] Uploading file ${index + 1} to Cloudinary...`
      );

      return new Promise((resolve, reject) => {
        // Set a timeout for the upload
        const uploadTimeout = setTimeout(() => {
          console.log(
            `⏰ [AI DETECTION] Cloudinary upload timeout for file ${index + 1}`
          );
          reject(new Error(`Upload timeout for file ${index + 1}`));
        }, 30000); // 30 second timeout

        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: file.mimetype.startsWith("video/")
              ? "video"
              : "image",
            folder: "temp-ai-detection",
            transformation: file.mimetype.startsWith("image/")
              ? [{ quality: "auto:good" }, { fetch_format: "auto" }]
              : undefined,
            timeout: 25000, // Cloudinary internal timeout
          },
          (error, result) => {
            clearTimeout(uploadTimeout); // Clear the manual timeout

            if (error) {
              console.log(
                `❌ [AI DETECTION] Cloudinary error for file ${index + 1}:`,
                {
                  message: error.message,
                  http_code: error.http_code,
                  name: error.name,
                }
              );

              // Don't throw, just reject with a user-friendly error
              reject({
                fileIndex: index + 1,
                filename: file.originalname,
                error: error.message || "Cloudinary upload failed",
                code: error.http_code || 500,
              });
            } else {
              console.log(
                `✅ [AI DETECTION] File ${index + 1} uploaded to Cloudinary: ${
                  result.secure_url
                }`
              );
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                type: file.mimetype.startsWith("video/") ? "video" : "image",
                filename: file.originalname,
              });
            }
          }
        );

        // Handle stream errors
        stream.on("error", (streamError) => {
          clearTimeout(uploadTimeout);
          console.log(
            `❌ [AI DETECTION] Stream error for file ${index + 1}:`,
            streamError.message
          );
          reject({
            fileIndex: index + 1,
            filename: file.originalname,
            error: streamError.message || "Upload stream failed",
            code: 500,
          });
        });

        stream.end(file.buffer);
      });
    });

    console.log(
      "⏳ [AI DETECTION] Waiting for all files to upload to Cloudinary..."
    );

    let uploadedFiles;
    try {
      uploadedFiles = await Promise.all(uploadPromises);
      console.log(
        `✅ [AI DETECTION] All ${uploadedFiles.length} files uploaded successfully`
      );
    } catch (uploadError) {
      console.log("❌ [AI DETECTION] File upload failed:", uploadError);

      // Return a user-friendly error instead of crashing
      return res.status(500).json({
        success: false,
        message: "File upload failed. Please try again.",
        error: "UPLOAD_FAILED",
        details:
          uploadError.error || uploadError.message || "Unknown upload error",
      });
    }

    // Run AI detection on each uploaded file
    const detectionPromises = uploadedFiles.map(async (file, index) => {
      console.log(
        `🔍 [AI DETECTION] Running AI detection on file ${index + 1}: ${
          file.filename
        }`
      );

      const detection = await aiDetectionService.detectAIContent(
        file.url,
        file.type,
        ["aiornot"] // Use only AI or Not for faster response
      );

      console.log(`🔍 [AI DETECTION] File ${index + 1} detection result:`, {
        filename: file.filename,
        isAI: detection.isAIGenerated,
        confidence: detection.confidence,
      });

      return {
        filename: file.filename,
        url: file.url,
        public_id: file.public_id,
        type: file.type,
        detection: detection,
      };
    });

    console.log("⏳ [AI DETECTION] Running AI detection on all files...");
    const detectionResults = await Promise.all(detectionPromises);
    console.log(
      `✅ [AI DETECTION] AI detection completed for all ${detectionResults.length} files`
    );

    // Analyze results
    const aiDetectedFiles = detectionResults.filter(
      (result) => result.detection.success && result.detection.isAIGenerated
    );

    const highConfidenceAI = aiDetectedFiles.filter(
      (result) => result.detection.confidence > 0.7
    );

    const hasAIContent = aiDetectedFiles.length > 0;
    const hasHighConfidenceAI = highConfidenceAI.length > 0;

    console.log(`📊 [AI DETECTION] Analysis summary:`, {
      totalFiles: detectionResults.length,
      aiDetectedFiles: aiDetectedFiles.length,
      highConfidenceAI: highConfidenceAI.length,
      hasAIContent,
      hasHighConfidenceAI,
    });

    // Clean up temporary files from Cloudinary
    console.log(
      "🧹 [AI DETECTION] Cleaning up temporary files from Cloudinary..."
    );
    const cleanupPromises = uploadedFiles.map((file) =>
      cloudinary.uploader.destroy(file.public_id, {
        resource_type: file.type === "video" ? "video" : "image",
      })
    );
    await Promise.all(cleanupPromises);
    console.log("✅ [AI DETECTION] Temporary files cleaned up");

    // Return results to frontend
    const response = {
      success: true,
      hasAIContent: hasAIContent,
      hasHighConfidenceAI: hasHighConfidenceAI,
      totalFiles: detectionResults.length,
      aiDetectedCount: aiDetectedFiles.length,
      highConfidenceCount: highConfidenceAI.length,
      files: detectionResults.map((result) => ({
        filename: result.filename,
        type: result.type,
        isAIGenerated: result.detection.isAIGenerated,
        confidence: result.detection.confidence,
        success: result.detection.success,
      })),
      recommendation: hasHighConfidenceAI
        ? "BLOCK"
        : hasAIContent
        ? "FLAG"
        : "ALLOW",
    };

    console.log("📤 [AI DETECTION] Sending response to frontend:", {
      hasAIContent: response.hasAIContent,
      recommendation: response.recommendation,
      fileCount: response.totalFiles,
    });

    res.json(response);
  } catch (error) {
    console.error("❌ [AI DETECTION] Error in AI detection endpoint:", error);
    res.status(500).json({
      success: false,
      message: "AI detection failed",
      error: error.message,
    });
  }
};

// Health check endpoint
exports.healthCheck = async (req, res) => {
  console.log("🏥 [HEALTH CHECK] Health check endpoint called");
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
    };

    res.json({
      success: true,
      message: "Service is healthy",
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
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
