const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');
const sharp = require('sharp');
require('dotenv').config();

/**
 * Twitter Media Upload Utility
 * Based on Twitter API v1.1 Media Upload Documentation
 * https://developer.x.com/en/docs/x-api/v1/media/upload-media/api-reference/post-media-upload
 */
class TwitterMediaUploader {
  constructor() {
    this.config = {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    };
    
    this.uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
    this.maxFileSize = 5 * 1024 * 1024; // 5MB limit for images
  }

  /**
   * Generate OAuth 1.0a signature for Twitter API
   */
  generateOAuthSignature(method, url, params = {}) {
    // OAuth parameters
    const oauthParams = {
      oauth_consumer_key: this.config.apiKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: this.config.accessToken,
      oauth_version: '1.0'
    };

    // Combine all parameters
    const allParams = { ...oauthParams, ...params };
    
    // Create parameter string (URL encoded and sorted)
    const paramString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');

    // Create signature base string
    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    
    // Create signing key
    const signingKey = `${encodeURIComponent(this.config.apiSecret)}&${encodeURIComponent(this.config.accessTokenSecret)}`;
    
    // Generate HMAC-SHA1 signature
    const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
    
    // Create OAuth authorization header
    const authParams = { ...oauthParams, oauth_signature: signature };
    const authHeader = 'OAuth ' + Object.keys(authParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(authParams[key])}"`)
      .join(', ');
    
    return authHeader;
  }

  /**
   * Convert unsupported image formats to JPEG
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {string} mimeType - Original MIME type
   * @returns {Promise<{buffer: Buffer, mimeType: string}>} - Converted image data
   */
  async convertToSupportedFormat(imageBuffer, mimeType) {
    // Twitter supported formats: JPEG, PNG, GIF, WebP
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (supportedFormats.includes(mimeType.toLowerCase())) {
      return { buffer: imageBuffer, mimeType };
    }
    
    console.log(`🔄 Converting ${mimeType} to JPEG for Twitter compatibility...`);
    
    try {
      // Convert to JPEG with good quality
      const convertedBuffer = await sharp(imageBuffer)
        .jpeg({ quality: 90 })
        .toBuffer();
        
      console.log(`✅ Image converted from ${mimeType} to JPEG`);
      return { 
        buffer: convertedBuffer, 
        mimeType: 'image/jpeg' 
      };
    } catch (error) {
      console.error('❌ Failed to convert image format:', error.message);
      throw new Error(`Failed to convert ${mimeType} to supported format: ${error.message}`);
    }
  }

  /**
   * Upload media buffer to Twitter
   * @param {Buffer} mediaBuffer - Image/video buffer
   * @param {string} mimeType - MIME type (e.g., 'image/jpeg', 'image/png')
   * @param {string} filename - Original filename
   * @returns {Promise<Object>} - Upload result with media_id
   */
  async uploadMediaBuffer(mediaBuffer, mimeType = 'image/jpeg', filename = 'image.jpg') {
    try {
      console.log(`📤 Uploading media: ${filename} (${mediaBuffer.length} bytes)`);

      // Validate file size
      if (mediaBuffer.length > this.maxFileSize) {
        throw new Error(`File too large: ${mediaBuffer.length} bytes (max: ${this.maxFileSize})`);
      }

      // Convert to supported format if needed
      const { buffer: convertedBuffer, mimeType: convertedMimeType } = await this.convertToSupportedFormat(mediaBuffer, mimeType);

      // Determine media category
      const mediaCategory = convertedMimeType.startsWith('image/') ? 'tweet_image' : 'tweet_video';

      // Create form data
      const formData = new FormData();
      formData.append('media', convertedBuffer, {
        filename: filename.replace(/\.[^.]+$/, '.jpg'), // Change extension to jpg if converted
        contentType: convertedMimeType
      });
      formData.append('media_category', mediaCategory);

      // Generate OAuth signature (empty params since form data is in body)
      const authHeader = this.generateOAuthSignature('POST', this.uploadUrl, {});

      console.log('🔐 OAuth signature generated, making upload request...');

      // Make upload request
      const response = await axios.post(this.uploadUrl, formData, {
        headers: {
          'Authorization': authHeader,
          ...formData.getHeaders()
        },
        timeout: 60000, // 60 second timeout for large files
        maxContentLength: this.maxFileSize * 2,
        maxBodyLength: this.maxFileSize * 2
      });

      console.log('✅ Media uploaded successfully:', {
        mediaId: response.data.media_id_string,
        size: response.data.size
      });

      return {
        success: true,
        mediaId: response.data.media_id_string,
        mediaKey: response.data.media_key,
        size: response.data.size,
        expiresAfter: response.data.expires_after_secs,
        fullResponse: response.data
      };

    } catch (error) {
      console.error('❌ Media upload failed:', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        twitterError: error.response?.data
      });

      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        details: error.response?.data
      };
    }
  }

  /**
   * Upload media from URL (e.g., Cloudinary URL)
   * @param {string} mediaUrl - URL to download media from
   * @returns {Promise<Object>} - Upload result with media_id
   */
  async uploadMediaFromUrl(mediaUrl) {
    try {
      console.log(`🌐 Downloading media from URL: ${mediaUrl}`);

      // Download media from URL
      const response = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxContentLength: this.maxFileSize
      });

      const mediaBuffer = Buffer.from(response.data);
      const mimeType = response.headers['content-type'] || 'image/jpeg';
      const filename = mediaUrl.split('/').pop() || 'media';

      console.log(`✅ Media downloaded: ${mediaBuffer.length} bytes, type: ${mimeType}`);

      // Upload the downloaded media
      return await this.uploadMediaBuffer(mediaBuffer, mimeType, filename);

    } catch (error) {
      console.error('❌ Failed to upload media from URL:', error.message);
      return {
        success: false,
        error: `Failed to download/upload from URL: ${error.message}`
      };
    }
  }

  /**
   * Upload multiple media files
   * @param {Array} mediaList - Array of {buffer, mimeType, filename} or URLs
   * @returns {Promise<Array>} - Array of upload results
   */
  async uploadMultipleMedia(mediaList) {
    console.log(`📤 Uploading ${mediaList.length} media files...`);
    
    const results = [];
    const maxConcurrent = 2; // Limit concurrent uploads to avoid rate limits
    
    for (let i = 0; i < mediaList.length; i += maxConcurrent) {
      const batch = mediaList.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (media, index) => {
        try {
          // Add small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, index * 1000));
          
          if (typeof media === 'string') {
            // It's a URL
            return await this.uploadMediaFromUrl(media);
          } else if (media.buffer) {
            // It's a buffer object
            return await this.uploadMediaBuffer(media.buffer, media.mimeType, media.filename);
          } else {
            throw new Error('Invalid media format');
          }
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Media upload completed: ${successCount}/${mediaList.length} successful`);

    return results;
  }

  /**
   * Get successful media IDs from upload results
   * @param {Array} uploadResults - Results from uploadMultipleMedia
   * @returns {Array} - Array of media IDs
   */
  getMediaIds(uploadResults) {
    return uploadResults
      .filter(result => result.success)
      .map(result => result.mediaId);
  }

  /**
   * Validate configuration
   * @returns {boolean} - True if all required credentials are present
   */
  validateConfig() {
    const required = ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      console.error('❌ Missing Twitter API credentials:', missing);
      return false;
    }
    
    console.log('✅ Twitter API credentials validated');
    return true;
  }
}

// Example usage function
async function testMediaUpload() {
  console.log('🧪 Testing Twitter Media Upload...\n');

  const uploader = new TwitterMediaUploader();
  
  // Validate configuration
  if (!uploader.validateConfig()) {
    console.log('Please check your .env file for Twitter API credentials');
    return;
  }

  try {
    // Test 1: Upload from URL
    console.log('TEST 1: Upload from URL');
    const urlResult = await uploader.uploadMediaFromUrl('https://via.placeholder.com/300x200/FF0000/FFFFFF?text=SilentShout');
    console.log('URL upload result:', urlResult.success ? '✅ Success' : '❌ Failed');

    // Test 2: Upload multiple URLs
    console.log('\nTEST 2: Multiple URL uploads');
    const urls = [
      'https://via.placeholder.com/400x300/00FF00/FFFFFF?text=Test1',
      'https://via.placeholder.com/400x300/0000FF/FFFFFF?text=Test2'
    ];
    
    const multipleResults = await uploader.uploadMultipleMedia(urls);
    const mediaIds = uploader.getMediaIds(multipleResults);
    
    console.log('Multiple upload results:');
    multipleResults.forEach((result, index) => {
      console.log(`  Image ${index + 1}: ${result.success ? '✅' : '❌'} ${result.mediaId || result.error}`);
    });

    console.log(`\n📋 Ready for tweet posting with ${mediaIds.length} media IDs:`, mediaIds);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Export the class and test function
module.exports = { TwitterMediaUploader, testMediaUpload };

// Run test if file is executed directly
if (require.main === module) {
  testMediaUpload();
}