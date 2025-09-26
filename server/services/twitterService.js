const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

class TwitterService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.config = this.loadConfig();
  }

  loadConfig() {
    return {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    };
  }

  validateConfig() {
    const required = ['apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing Twitter API credentials: ${missing.join(', ')}`);
    }
    
    return true;
  }

  async initialize() {
    try {
      this.validateConfig();
      
      this.client = new TwitterApi({
        appKey: this.config.apiKey,
        appSecret: this.config.apiSecret,
        accessToken: this.config.accessToken,
        accessSecret: this.config.accessTokenSecret,
      });

      // Verify credentials
      const me = await this.client.v2.me();
      this.isInitialized = true;
      
      return {
        success: true,
        userId: me.data.id,
        username: me.data.username
      };
      
    } catch (error) {
      this.isInitialized = false;
      throw new Error(`Twitter service initialization failed: ${error.message}`);
    }
  }

  async postTweet(text, mediaIds = []) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const tweetOptions = {
        text: text
      };

      if (mediaIds.length > 0) {
        tweetOptions.media = {
          media_ids: mediaIds
        };
      }

      const tweet = await this.client.v2.tweet(tweetOptions);
      
      return {
        success: true,
        tweetId: tweet.data.id,
        tweetText: text,
        tweetUrl: `https://twitter.com/user/status/${tweet.data.id}`,
        mediaCount: mediaIds.length
      };
      
    } catch (error) {
      throw new Error(`Failed to post tweet: ${error.message}`);
    }
  }

  async uploadMedia(mediaBuffer, mimeType = 'image/jpeg') {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const mediaId = await this.client.v1.uploadMedia(mediaBuffer, { mimeType });
      return mediaId;
      
    } catch (error) {
      throw new Error(`Failed to upload media: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      const initResult = await this.initialize();
      
      const testTweet = `🧪 SilentShout Twitter API test - ${new Date().toLocaleTimeString()} #APITest`;
      const result = await this.postTweet(testTweet);
      
      return {
        success: true,
        initialization: initResult,
        testTweet: result
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      hasCredentials: this.validateConfig(),
      service: 'Twitter API v2'
    };
  }
}

module.exports = new TwitterService();