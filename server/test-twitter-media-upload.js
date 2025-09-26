const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Twitter Media Upload Tester
class TwitterMediaUploadTester {
  constructor() {
    this.config = this.loadConfig();
    this.logFile = `logs/twitter-media-${new Date().toISOString().split('T')[0]}.log`;
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  }

  loadConfig() {
    return {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN
    };
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    
    console.log(logMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }

    // Write to file
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

  // Create a test image for uploading
  createTestImage() {
    const testImagePath = path.join(__dirname, 'test-image.png');
    
    if (!fs.existsSync(testImagePath)) {
      this.info('Creating test image...');
      
      // Create a simple PNG image data (1x1 pixel red PNG)
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
        0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
        0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
        0xE5, 0x27, 0xDE, 0xFC, 0x00, 0x00, 0x00, 0x00, // IEND chunk
        0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      
      fs.writeFileSync(testImagePath, pngData);
      this.info('Test image created successfully');
    }
    
    return testImagePath;
  }

  // Generate OAuth 1.0a signature for Twitter API v1.1
  generateOAuthSignature(method, url, params) {
    const crypto = require('crypto');
    
    // OAuth parameters
    const oauthParams = {
      oauth_consumer_key: this.config.apiKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: this.config.accessToken,
      oauth_version: '1.0'
    };

    // Combine OAuth params with request params
    const allParams = { ...oauthParams, ...params };
    
    // Create parameter string
    const paramString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');

    // Create signature base string
    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    
    // Create signing key
    const signingKey = `${encodeURIComponent(this.config.apiSecret)}&${encodeURIComponent(this.config.accessTokenSecret)}`;
    
    // Generate signature
    const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
    
    // Create authorization header
    const authParams = {
      ...oauthParams,
      oauth_signature: signature
    };
    
    const authHeader = 'OAuth ' + Object.keys(authParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(authParams[key])}"`)
      .join(', ');
    
    return authHeader;
  }

  // Method 1: Upload media using Twitter API v1.1 with OAuth 1.0a (RECOMMENDED)
  async uploadMediaWithOAuth(imagePath) {
    this.info('🔄 Starting media upload with OAuth 1.0a...');
    
    try {
      // Validate file
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const fileSize = imageBuffer.length;
      const mimeType = 'image/png';
      
      this.info('File details', {
        path: imagePath,
        size: fileSize,
        mimeType: mimeType
      });

      // Twitter API v1.1 media upload endpoint
      const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
      
      // Create form data
      const formData = new FormData();
      formData.append('media', imageBuffer, {
        filename: 'test-image.png',
        contentType: mimeType
      });
      formData.append('media_category', 'tweet_image');

      // Generate OAuth signature
      const authHeader = this.generateOAuthSignature('POST', uploadUrl, {});
      
      this.info('Making upload request to Twitter...');
      
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Authorization': authHeader,
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 second timeout
      });

      this.info('✅ Media upload successful!', {
        mediaId: response.data.media_id_string,
        mediaKey: response.data.media_key,
        size: response.data.size,
        expiresAfter: response.data.expires_after_secs
      });

      return {
        success: true,
        mediaId: response.data.media_id_string,
        mediaKey: response.data.media_key,
        data: response.data
      };

    } catch (error) {
      this.error('❌ Media upload failed', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  // Method 2: Upload media using Bearer Token (Alternative method)
  async uploadMediaWithBearerToken(imagePath) {
    this.info('🔄 Starting media upload with Bearer Token...');
    
    try {
      if (!this.config.bearerToken) {
        throw new Error('Bearer token not found in configuration');
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const formData = new FormData();
      formData.append('media', imageBuffer, {
        filename: 'test-image.png',
        contentType: 'image/png'
      });

      const response = await axios.post('https://upload.twitter.com/1.1/media/upload.json', formData, {
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`,
          ...formData.getHeaders()
        },
        timeout: 30000
      });

      this.info('✅ Media upload with Bearer Token successful!', {
        mediaId: response.data.media_id_string
      });

      return {
        success: true,
        mediaId: response.data.media_id_string,
        data: response.data
      };

    } catch (error) {
      this.error('❌ Media upload with Bearer Token failed', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Method 3: Upload media from URL (like Cloudinary URLs)
  async uploadMediaFromUrl(imageUrl) {
    this.info('🔄 Starting media upload from URL...', { url: imageUrl });
    
    try {
      // First, download the image from the URL
      this.info('Downloading image from URL...');
      const imageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      const imageBuffer = Buffer.from(imageResponse.data);
      const contentType = imageResponse.headers['content-type'] || 'image/jpeg';
      
      this.info('Image downloaded successfully', {
        size: imageBuffer.length,
        contentType: contentType
      });

      // Create form data
      const formData = new FormData();
      formData.append('media', imageBuffer, {
        filename: 'uploaded-image.jpg',
        contentType: contentType
      });
      formData.append('media_category', 'tweet_image');

      // Generate OAuth signature
      const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
      const authHeader = this.generateOAuthSignature('POST', uploadUrl, {});
      
      // Upload to Twitter
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          'Authorization': authHeader,
          ...formData.getHeaders()
        },
        timeout: 30000
      });

      this.info('✅ Media upload from URL successful!', {
        mediaId: response.data.media_id_string,
        originalUrl: imageUrl
      });

      return {
        success: true,
        mediaId: response.data.media_id_string,
        data: response.data
      };

    } catch (error) {
      this.error('❌ Media upload from URL failed', {
        error: error.message,
        url: imageUrl,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test posting a tweet with uploaded media
  async testTweetWithMedia(mediaIds) {
    this.info('🐦 Testing tweet with uploaded media...', { mediaIds });

    try {
      const tweetText = `🧪 Testing SilentShout media upload - ${new Date().toLocaleTimeString()} #MediaUploadTest`;
      
      const tweetData = {
        text: tweetText,
        media: {
          media_ids: Array.isArray(mediaIds) ? mediaIds : [mediaIds]
        }
      };

      this.info('Posting tweet with media...', { tweetData });

      const response = await axios.post('https://api.twitter.com/2/tweets', tweetData, {
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.info('✅ Tweet with media posted successfully!', {
        tweetId: response.data.data.id,
        tweetUrl: `https://twitter.com/user/status/${response.data.data.id}`
      });

      return {
        success: true,
        tweetId: response.data.data.id,
        tweetUrl: `https://twitter.com/user/status/${response.data.data.id}`
      };

    } catch (error) {
      this.error('❌ Tweet posting failed', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test multiple media uploads
  async testMultipleMediaUpload() {
    this.info('📸 Testing multiple media uploads...');

    try {
      const testImagePath = this.createTestImage();
      const mediaIds = [];

      // Upload the same image multiple times to simulate multiple files
      for (let i = 0; i < 2; i++) {
        this.info(`Uploading image ${i + 1}...`);
        const result = await this.uploadMediaWithOAuth(testImagePath);
        
        if (result.success) {
          mediaIds.push(result.mediaId);
        } else {
          this.warn(`Failed to upload image ${i + 1}`, result);
        }
        
        // Wait a bit between uploads to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.info('Multiple upload results', {
        totalAttempts: 2,
        successfulUploads: mediaIds.length,
        mediaIds: mediaIds
      });

      return mediaIds;

    } catch (error) {
      this.error('Multiple upload test failed', { error: error.message });
      return [];
    }
  }

  // Clean up test files
  cleanup() {
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      this.info('Test image cleaned up');
    }
  }

  // Run comprehensive media upload tests
  async runAllTests() {
    this.info('🚀 Starting Twitter Media Upload Tests...');
    this.info('='.repeat(60));

    try {
      // Test 1: Validate configuration
      this.info('TEST 1: Configuration Validation');
      if (!this.config.apiKey || !this.config.apiSecret || 
          !this.config.accessToken || !this.config.accessTokenSecret) {
        throw new Error('Missing OAuth 1.0a credentials');
      }
      this.info('✅ OAuth 1.0a credentials found');

      // Test 2: Create test image
      this.info('\nTEST 2: Test Image Creation');
      const testImagePath = this.createTestImage();
      this.info('✅ Test image ready');

      // Test 3: Upload media with OAuth 1.0a
      this.info('\nTEST 3: Media Upload with OAuth 1.0a');
      const oauthResult = await this.uploadMediaWithOAuth(testImagePath);
      
      if (oauthResult.success) {
        this.info('✅ OAuth media upload successful');
        
        // Test 4: Post tweet with uploaded media
        this.info('\nTEST 4: Tweet with Uploaded Media');
        if (this.config.bearerToken) {
          await this.testTweetWithMedia(oauthResult.mediaId);
        } else {
          this.warn('No Bearer token found, skipping tweet test');
        }
      }

      // Test 5: Test media upload from URL (example)
      this.info('\nTEST 5: Media Upload from URL');
      const sampleImageUrl = 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Test';
      await this.uploadMediaFromUrl(sampleImageUrl);

      // Test 6: Multiple media uploads
      this.info('\nTEST 6: Multiple Media Uploads');
      const multipleMediaIds = await this.testMultipleMediaUpload();
      
      if (multipleMediaIds.length > 0 && this.config.bearerToken) {
        this.info('\nTEST 7: Tweet with Multiple Media');
        await this.testTweetWithMedia(multipleMediaIds);
      }

      this.info('\n🎉 All media upload tests completed!');
      this.info('Check the log file for detailed results:', this.logFile);

    } catch (error) {
      this.error('❌ Test suite failed:', { error: error.message });
    } finally {
      // Cleanup
      this.cleanup();
    }
  }
}

// Usage examples and main execution
async function main() {
  console.log('🐦 Twitter Media Upload Tester');
  console.log('='.repeat(50));

  const tester = new TwitterMediaUploadTester();

  // Check if this file is run directly
  if (require.main === module) {
    console.log('Running comprehensive media upload tests...\n');
    await tester.runAllTests();
  }

  return tester;
}

// Export for use in other modules
module.exports = { TwitterMediaUploadTester };

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}