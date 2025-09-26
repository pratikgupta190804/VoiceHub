const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

// Logger for this service
class TwitterServiceLogger {
  constructor() {
    this.logFile = `logs/twitter-service-${new Date().toISOString().split('T')[0]}.log`;
    
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

const logger = new TwitterServiceLogger();

class TwitterService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.config = this.loadConfig();
  }

  loadConfig() {
    const config = {
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    };

    // Decode bearer token if URL encoded
    if (config.bearerToken && config.bearerToken.includes('%2B')) {
      config.bearerToken = decodeURIComponent(config.bearerToken);
    }

    return config;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    logger.info('Initializing Twitter service...');

    try {
      // Validate credentials
      if (!this.config.apiKey || !this.config.apiSecret || 
          !this.config.accessToken || !this.config.accessTokenSecret) {
        throw new Error('Missing Twitter API credentials. Check your .env file.');
      }

      // Initialize Twitter client with OAuth 1.0a (required for posting)
      this.client = new TwitterApi({
        appKey: this.config.apiKey,
        appSecret: this.config.apiSecret,
        accessToken: this.config.accessToken,
        accessSecret: this.config.accessTokenSecret,
      });

      // Test authentication
      const user = await this.client.readWrite.currentUserV2();
      logger.info('Twitter service initialized successfully', {
        userId: user.data.id,
        username: user.data.username
      });

      this.isInitialized = true;

    } catch (error) {
      logger.error('Failed to initialize Twitter service:', { error: error.message });
      throw error;
    }
  }

  async postTweet(text, mediaIds = []) {
    try {
      await this.initialize();

      logger.info('Posting tweet...', { 
        textLength: text.length,
        mediaCount: mediaIds.length 
      });

      const tweetData = { text };
      
      if (mediaIds.length > 0) {
        tweetData.media = { media_ids: mediaIds };
      }

      const userClient = this.client.readWrite;
      const response = await userClient.v2.tweet(tweetData);

      const result = {
        success: true,
        tweetId: response.data.id,
        tweetText: response.data.text,
        tweetUrl: `https://twitter.com/user/status/${response.data.id}`
      };

      logger.info('Tweet posted successfully', result);
      return result;

    } catch (error) {
      logger.error('Failed to post tweet:', {
        error: error.message,
        code: error.code,
        data: error.data
      });

      return {
        success: false,
        error: error.message,
        code: error.code,
        tweetText: text
      };
    }
  }

  async uploadMedia(mediaBuffer, mediaType = 'image/jpeg') {
    try {
      await this.initialize();

      logger.info('Uploading media to Twitter...', { mediaType });

      const mediaUpload = await this.client.v1.uploadMedia(mediaBuffer, { 
        mimeType: mediaType 
      });

      logger.info('Media uploaded successfully', { 
        mediaId: mediaUpload 
      });

      return mediaUpload;

    } catch (error) {
      logger.error('Failed to upload media:', { error: error.message });
      throw error;
    }
  }

  // Method to test the service
  async testConnection() {
    try {
      await this.initialize();
      
      const testTweet = `🧪 SilentShout Twitter API test - ${new Date().toLocaleTimeString()} #APITest`;
      const result = await this.postTweet(testTweet);
      
      logger.info('Twitter service test completed', result);
      return result;

    } catch (error) {
      logger.error('Twitter service test failed:', { error: error.message });
      throw error;
    }
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasCredentials: !!(this.config.apiKey && this.config.apiSecret && 
                        this.config.accessToken && this.config.accessTokenSecret),
      config: {
        apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 8)}...` : null,
        bearerToken: this.config.bearerToken ? `${this.config.bearerToken.substring(0, 8)}...` : null
      }
    };
  }
}

// Create singleton instance
const twitterService = new TwitterService();

module.exports = twitterService;