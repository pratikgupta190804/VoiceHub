const axios = require('axios');
const FormData = require('form-data');

class AIDetectionService {
  constructor() {
    // Multiple AI detection API options
    this.apis = {
      // AI or Not API - v2 endpoint with file upload
      aiOrNot: {
        endpoint: 'https://api.aiornot.com/v2/image/sync',
        headers: {
          'Authorization': `Bearer ${process.env.AI_OR_NOT_API_KEY}`
          // Content-Type will be set automatically by form-data
        }
      },
      
      // Hive AI - Content moderation with AI detection
      hiveAI: {
        endpoint: 'https://api.thehive.ai/api/v2/task/sync',
        headers: {
          'Authorization': `Token ${process.env.HIVE_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      },
      
      // Sensity AI - Deepfake detection
      sensityAI: {
        endpoint: 'https://platform.sensity.ai/api/detection/submit',
        headers: {
          'X-API-Key': process.env.SENSITY_AI_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    };
  }

  /**
   * Download image from URL and return buffer
   * @param {string} imageUrl - URL of the image to download
   * @returns {Buffer} Image buffer
   */
  async downloadImage(imageUrl) {
    try {
      console.log(`📥 [AI DETECTION] Downloading image: ${imageUrl}`);
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'SilentShout-AI-Detection/1.0'
        }
      });
      
      console.log(`✅ [AI DETECTION] Image downloaded successfully (${response.data.length} bytes)`);
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      console.log(`❌ [AI DETECTION] Failed to download image: ${error.message}`);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * Detect if an image/video is AI-generated using AI or Not API
   * @param {string} mediaUrl - URL of the media to analyze
   * @param {string} mediaType - 'image' or 'video'
   * @returns {Object} Detection result
   */
  async detectWithAIOrNot(mediaUrl, mediaType = 'image') {
    console.log(`🤖 [AI DETECTION] Starting AI detection with AI or Not API`);
    console.log(`🤖 [AI DETECTION] Media URL: ${mediaUrl}`);
    console.log(`🤖 [AI DETECTION] Media Type: ${mediaType}`);

    try {
      if (!process.env.AI_OR_NOT_API_KEY) {
        console.log(`⚠️ [AI DETECTION] AI or Not API key not found, skipping detection`);
        return {
          success: false,
          provider: 'aiornot',
          error: 'API key not configured',
          isAIGenerated: null,
          confidence: 0
        };
      }

      // Download the image
      const imageBuffer = await this.downloadImage(mediaUrl);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', imageBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });

      // Optional parameters
      formData.append('only', 'ai_generated'); // Only check for AI generation
      formData.append('external_id', `silentshout_${Date.now()}`); // Tracking ID

      console.log(`🤖 [AI DETECTION] Sending request to AI or Not API...`);
      const response = await axios.post(this.apis.aiOrNot.endpoint, formData, {
        headers: {
          ...this.apis.aiOrNot.headers,
          ...formData.getHeaders() // This adds the correct Content-Type for multipart
        },
        timeout: 60000 // 60 second timeout for file upload
      });

      console.log(`✅ [AI DETECTION] AI or Not API response received`);
      console.log(`🤖 [AI DETECTION] Response data:`, JSON.stringify(response.data, null, 2));

      const result = response.data;
      
      // Parse the AI or Not v2 API response format
      const aiGenReport = result.report?.ai_generated;
      const aiConfidence = aiGenReport?.ai?.confidence || 0;
      const isAIGenerated = aiGenReport?.verdict === 'ai' || aiConfidence > 0.5;

      return {
        success: true,
        provider: 'aiornot',
        isAIGenerated: isAIGenerated,
        confidence: aiConfidence,
        details: {
          verdict: aiGenReport?.verdict || 'unknown',
          ai_confidence: aiConfidence,
          human_confidence: aiGenReport?.human?.confidence || (1 - aiConfidence),
          generators: aiGenReport?.generator || {},
          report_id: result.id,
          created_at: result.created_at
        },
        raw_response: result
      };

    } catch (error) {
      console.log(`❌ [AI DETECTION] AI or Not API error: ${error.message}`);
      if (error.response) {
        console.log(`❌ [AI DETECTION] Response status: ${error.response.status}`);
        console.log(`❌ [AI DETECTION] Response data:`, error.response.data);
      }
      return {
        success: false,
        provider: 'aiornot',
        error: error.message,
        isAIGenerated: null,
        confidence: 0
      };
    }
  }

  /**
   * Detect AI-generated content using Hive AI
   * @param {string} mediaUrl - URL of the media to analyze
   * @param {string} mediaType - 'image' or 'video'
   * @returns {Object} Detection result
   */
  async detectWithHiveAI(mediaUrl, mediaType = 'image') {
    console.log(`🐝 [AI DETECTION] Starting AI detection with Hive AI`);

    try {
      if (!process.env.HIVE_AI_API_KEY) {
        console.log(`⚠️ [AI DETECTION] Hive AI API key not found, skipping detection`);
        return {
          success: false,
          provider: 'hiveai',
          error: 'API key not configured',
          isAIGenerated: null,
          confidence: 0
        };
      }

      const payload = {
        url: mediaUrl,
        models: ['ai_generated']
      };

      console.log(`🐝 [AI DETECTION] Sending request to Hive AI...`);
      const response = await axios.post(this.apis.hiveAI.endpoint, payload, {
        headers: this.apis.hiveAI.headers,
        timeout: 30000
      });

      console.log(`✅ [AI DETECTION] Hive AI response received`);
      const result = response.data;

      const aiDetection = result.status?.[0]?.response?.output?.[0]?.classes?.find(
        cls => cls.class === 'ai_generated'
      );

      const aiScore = aiDetection?.score || 0;
      const isAIGenerated = aiScore > 0.5;

      return {
        success: true,
        provider: 'hiveai',
        isAIGenerated: isAIGenerated,
        confidence: aiScore,
        details: {
          ai_probability: aiScore,
          human_probability: 1 - aiScore,
          all_classes: result.status?.[0]?.response?.output?.[0]?.classes || []
        },
        raw_response: result
      };

    } catch (error) {
      console.log(`❌ [AI DETECTION] Hive AI error: ${error.message}`);
      return {
        success: false,
        provider: 'hiveai',
        error: error.message,
        isAIGenerated: null,
        confidence: 0
      };
    }
  }

  /**
   * Detect deepfakes using Sensity AI (specialized for video/face manipulation)
   * @param {string} mediaUrl - URL of the media to analyze
   * @param {string} mediaType - 'image' or 'video'
   * @returns {Object} Detection result
   */
  async detectWithSensityAI(mediaUrl, mediaType = 'image') {
    console.log(`👁️ [AI DETECTION] Starting deepfake detection with Sensity AI`);

    try {
      if (!process.env.SENSITY_AI_API_KEY) {
        console.log(`⚠️ [AI DETECTION] Sensity AI API key not found, skipping detection`);
        return {
          success: false,
          provider: 'sensityai',
          error: 'API key not configured',
          isAIGenerated: null,
          confidence: 0
        };
      }

      const payload = {
        url: mediaUrl,
        callback_url: null, // Synchronous detection
        detect_face_swap: true,
        detect_face_reenactment: true,
        detect_speech_synthesis: mediaType === 'video'
      };

      console.log(`👁️ [AI DETECTION] Sending request to Sensity AI...`);
      const response = await axios.post(this.apis.sensityAI.endpoint, payload, {
        headers: this.apis.sensityAI.headers,
        timeout: 60000 // Longer timeout for video processing
      });

      console.log(`✅ [AI DETECTION] Sensity AI response received`);
      const result = response.data;

      const faceSwapScore = result.face_swap_probability || 0;
      const faceReenactmentScore = result.face_reenactment_probability || 0;
      const speechSynthesisScore = result.speech_synthesis_probability || 0;

      const maxScore = Math.max(faceSwapScore, faceReenactmentScore, speechSynthesisScore);
      const isAIGenerated = maxScore > 0.5;

      return {
        success: true,
        provider: 'sensityai',
        isAIGenerated: isAIGenerated,
        confidence: maxScore,
        details: {
          face_swap_probability: faceSwapScore,
          face_reenactment_probability: faceReenactmentScore,
          speech_synthesis_probability: speechSynthesisScore,
          overall_manipulation_score: maxScore
        },
        raw_response: result
      };

    } catch (error) {
      console.log(`❌ [AI DETECTION] Sensity AI error: ${error.message}`);
      return {
        success: false,
        provider: 'sensityai',
        error: error.message,
        isAIGenerated: null,
        confidence: 0
      };
    }
  }

  /**
   * Run AI detection using multiple providers and aggregate results
   * @param {string} mediaUrl - URL of the media to analyze
   * @param {string} mediaType - 'image' or 'video'
   * @param {Array} providers - Array of providers to use ['aiornot', 'hiveai', 'sensityai']
   * @returns {Object} Aggregated detection result
   */
  async detectAIContent(mediaUrl, mediaType = 'image', providers = ['aiornot']) {
    console.log(`🔍 [AI DETECTION] Starting comprehensive AI detection`);
    console.log(`🔍 [AI DETECTION] Media: ${mediaUrl}`);
    console.log(`🔍 [AI DETECTION] Type: ${mediaType}`);
    console.log(`🔍 [AI DETECTION] Providers: ${providers.join(', ')}`);

    const results = [];
    let totalConfidence = 0;
    let successfulDetections = 0;

    // Run detection with each provider
    for (const provider of providers) {
      console.log(`🔍 [AI DETECTION] Testing with provider: ${provider}`);
      
      let result;
      switch (provider) {
        case 'aiornot':
          result = await this.detectWithAIOrNot(mediaUrl, mediaType);
          break;
        case 'hiveai':
          result = await this.detectWithHiveAI(mediaUrl, mediaType);
          break;
        case 'sensityai':
          result = await this.detectWithSensityAI(mediaUrl, mediaType);
          break;
        default:
          console.log(`❌ [AI DETECTION] Unknown provider: ${provider}`);
          continue;
      }

      results.push(result);

      if (result.success) {
        totalConfidence += result.confidence;
        successfulDetections++;
      }

      // Add delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Aggregate results
    const avgConfidence = successfulDetections > 0 ? totalConfidence / successfulDetections : 0;
    const majorityVote = results.filter(r => r.success && r.isAIGenerated).length > successfulDetections / 2;

    console.log(`🔍 [AI DETECTION] Detection completed`);
    console.log(`🔍 [AI DETECTION] Successful detections: ${successfulDetections}/${providers.length}`);
    console.log(`🔍 [AI DETECTION] Average confidence: ${avgConfidence.toFixed(3)}`);
    console.log(`🔍 [AI DETECTION] Majority vote AI-generated: ${majorityVote}`);

    return {
      success: successfulDetections > 0,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      isAIGenerated: majorityVote,
      confidence: avgConfidence,
      providers_tested: providers.length,
      successful_detections: successfulDetections,
      individual_results: results,
      recommendation: avgConfidence > 0.7 ? 'HIGH_CONFIDENCE' : 
                     avgConfidence > 0.3 ? 'MEDIUM_CONFIDENCE' : 'LOW_CONFIDENCE',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detect AI content for multiple media URLs
   * @param {Array} mediaUrls - Array of media URLs to analyze
   * @param {string} mediaType - 'image' or 'video'
   * @param {Array} providers - Array of providers to use
   * @returns {Array} Array of detection results
   */
  async detectMultipleMedia(mediaUrls, mediaType = 'image', providers = ['aiornot']) {
    console.log(`🔍 [AI DETECTION] Starting batch AI detection for ${mediaUrls.length} files`);

    const results = [];
    
    for (let i = 0; i < mediaUrls.length; i++) {
      console.log(`🔍 [AI DETECTION] Processing file ${i + 1}/${mediaUrls.length}`);
      const result = await this.detectAIContent(mediaUrls[i], mediaType, providers);
      results.push(result);
      
      // Add delay between batches
      if (i < mediaUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`✅ [AI DETECTION] Batch detection completed`);
    return results;
  }
}

module.exports = AIDetectionService;