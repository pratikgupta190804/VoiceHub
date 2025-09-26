const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');
const sharp = require('sharp');

/**
 * Twitter Media Uploader Class
 * Handles media upload to Twitter API v1.1 with OAuth 1.0a authentication
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
    this.maxFileSize = 5 * 1024 * 1024; // 5MB limit
  }

  /**
   * Generate OAuth 1.0a signature for Twitter API
   */
  generateOAuthSignature(method, url, params = {}) {
    const oauthParams = {
      oauth_consumer_key: this.config.apiKey,
      oauth_token: this.config.accessToken,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0'
    };

    // Combine OAuth params with query params
    const allParams = { ...oauthParams, ...params };
    
    // Create parameter string
    const paramString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');
    
    // Create base string
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
   */
  async convertToSupportedFormat(imageBuffer, mimeType) {
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (supportedFormats.includes(mimeType.toLowerCase())) {
      return { buffer: imageBuffer, mimeType };
    }
    
    try {
      const convertedBuffer = await sharp(imageBuffer)
        .jpeg({ quality: 90 })
        .toBuffer();
        
      return { 
        buffer: convertedBuffer, 
        mimeType: 'image/jpeg' 
      };
    } catch (error) {
      throw new Error(`Failed to convert ${mimeType} to supported format: ${error.message}`);
    }
  }

  /**
   * Upload media buffer to Twitter
   */
  async uploadMediaBuffer(mediaBuffer, mimeType = 'image/jpeg', filename = 'image.jpg') {
    try {
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
        filename: filename.replace(/\.[^.]+$/, '.jpg'),
        contentType: convertedMimeType
      });
      formData.append('media_category', mediaCategory);

      // Generate OAuth signature
      const authHeader = this.generateOAuthSignature('POST', this.uploadUrl, {});

      // Make upload request
      const response = await axios.post(this.uploadUrl, formData, {
        headers: {
          'Authorization': authHeader,
          ...formData.getHeaders()
        },
        timeout: 30000
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
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Upload media from URL
   */
  async uploadMediaFromUrl(mediaUrl) {
    try {
      // Download media from URL
      const response = await axios.get(mediaUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        maxContentLength: this.maxFileSize
      });

      const mediaBuffer = Buffer.from(response.data);
      const mimeType = response.headers['content-type'] || 'image/jpeg';
      const filename = mediaUrl.split('/').pop() || 'media';

      // Upload the downloaded media
      return await this.uploadMediaBuffer(mediaBuffer, mimeType, filename);

    } catch (error) {
      return {
        success: false,
        error: `Failed to download/upload from URL: ${error.message}`
      };
    }
  }

  /**
   * Upload multiple media files
   */
  async uploadMultipleMedia(mediaList) {
    const results = [];
    const maxConcurrent = 2;
    
    for (let i = 0; i < mediaList.length; i += maxConcurrent) {
      const batch = mediaList.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (media, index) => {
        try {
          // Add delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, index * 1000));
          
          if (typeof media === 'string') {
            return await this.uploadMediaFromUrl(media);
          } else if (media.buffer) {
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

    return results;
  }

  /**
   * Validate Twitter API credentials
   */
  validateCredentials() {
    const required = ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing Twitter API credentials: ${missing.join(', ')}`);
    }
    
    return true;
  }
}

module.exports = { TwitterMediaUploader };