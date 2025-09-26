const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
require('dotenv').config();

// Comprehensive logging setup
const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor(level = 'INFO') {
    this.level = logLevels[level] || logLevels.INFO;
    this.logFile = `logs/twitter-test-${new Date().toISOString().split('T')[0]}.log`;
    
    // Create logs directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
  }

  log(level, message, data = null) {
    if (logLevels[level] <= this.level) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${level}: ${message}`;
      
      console.log(logMessage);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }

      // Also write to file
      const fs = require('fs');
      const fileMessage = data ? `${logMessage}\n${JSON.stringify(data, null, 2)}\n` : `${logMessage}\n`;
      fs.appendFileSync(this.logFile, fileMessage);
    }
  }

  error(message, data) { this.log('ERROR', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  debug(message, data) { this.log('DEBUG', message, data); }
}

const logger = new Logger(process.env.LOG_LEVEL || 'DEBUG');

// Twitter API Configuration Checker
class TwitterAPITester {
  constructor() {
    this.config = this.loadConfiguration();
    this.client = null;
    this.bearerClient = null;
  }

  loadConfiguration() {
    logger.info('Loading Twitter API configuration from environment variables...');
    
    const config = {
      // API v2 Bearer Token (for app-only authentication)
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
      
      // API v1.1/v2 OAuth 1.0a credentials (for user authentication)
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      
      // Additional config
      appId: process.env.APP_ID,
      apiUrl: process.env.X_API_URL || 'https://api.twitter.com/2/tweets'
    };

    logger.info('Configuration loaded:', {
      bearerToken: config.bearerToken ? `${config.bearerToken.substring(0, 10)}...` : 'NOT_SET',
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'NOT_SET',
      apiSecret: config.apiSecret ? `${config.apiSecret.substring(0, 10)}...` : 'NOT_SET',
      accessToken: config.accessToken ? `${config.accessToken.substring(0, 10)}...` : 'NOT_SET',
      accessTokenSecret: config.accessTokenSecret ? `${config.accessTokenSecret.substring(0, 10)}...` : 'NOT_SET',
      appId: config.appId || 'NOT_SET'
    });

    return config;
  }

  validateConfiguration() {
    logger.info('Validating Twitter API configuration...');
    
    const issues = [];
    
    // Check Bearer Token for app-only authentication
    if (!this.config.bearerToken) {
      issues.push('Bearer Token is missing (TWITTER_BEARER_TOKEN or X_BEARER_TOKEN)');
    } else if (this.config.bearerToken.includes('%2B')) {
      logger.warn('Bearer token appears to be URL encoded. Decoding...');
      this.config.bearerToken = decodeURIComponent(this.config.bearerToken);
    }

    // Check OAuth 1.0a credentials for user authentication
    if (!this.config.apiKey) issues.push('API Key is missing (TWITTER_API_KEY)');
    if (!this.config.apiSecret) issues.push('API Secret is missing (TWITTER_API_SECRET)');
    if (!this.config.accessToken) issues.push('Access Token is missing (TWITTER_ACCESS_TOKEN)');
    if (!this.config.accessTokenSecret) issues.push('Access Token Secret is missing (TWITTER_ACCESS_TOKEN_SECRET)');

    if (issues.length > 0) {
      logger.error('Configuration validation failed:', { issues });
      return false;
    }

    logger.info('Configuration validation passed ✓');
    return true;
  }

  async initializeClients() {
    logger.info('Initializing Twitter API clients...');

    try {
      // Initialize Bearer Token client (for app-only auth)
      if (this.config.bearerToken) {
        this.bearerClient = new TwitterApi(this.config.bearerToken);
        logger.info('Bearer Token client initialized ✓');
      }

      // Initialize OAuth 1.0a client (for user auth - required for posting tweets)
      if (this.config.apiKey && this.config.apiSecret && 
          this.config.accessToken && this.config.accessTokenSecret) {
        
        this.client = new TwitterApi({
          appKey: this.config.apiKey,
          appSecret: this.config.apiSecret,
          accessToken: this.config.accessToken,
          accessSecret: this.config.accessTokenSecret,
        });
        
        logger.info('OAuth 1.0a client initialized ✓');
      }

      if (!this.client && !this.bearerClient) {
        throw new Error('No valid Twitter API client could be initialized');
      }

    } catch (error) {
      logger.error('Failed to initialize Twitter API clients:', { error: error.message });
      throw error;
    }
  }

  async testAuthentication() {
    logger.info('Testing Twitter API authentication...');

    try {
      // Test OAuth 1.0a authentication (required for posting)
      if (this.client) {
        logger.info('Testing OAuth 1.0a authentication...');
        const userClient = this.client.readWrite;
        
        try {
          const user = await userClient.currentUserV2();
          logger.info('OAuth 1.0a authentication successful ✓', {
            userId: user.data.id,
            username: user.data.username,
            name: user.data.name
          });
        } catch (error) {
          logger.error('OAuth 1.0a authentication failed:', { error: error.message });
          throw error;
        }
      }

      // Test Bearer Token authentication
      if (this.bearerClient) {
        logger.info('Testing Bearer Token authentication...');
        
        try {
          const appOnlyClient = this.bearerClient.readOnly;
          // Test with a simple API call
          const response = await appOnlyClient.v2.get('tweets/search/recent', {
            query: 'from:twitterapi',
            max_results: 10
          });
          
          logger.info('Bearer Token authentication successful ✓', {
            resultCount: response.data?.data?.length || 0
          });
        } catch (error) {
          logger.error('Bearer Token authentication failed:', { error: error.message });
        }
      }

    } catch (error) {
      logger.error('Authentication test failed:', { error: error.message });
      throw error;
    }
  }

  async postDummyTweet() {
    logger.info('Attempting to post dummy tweet...');

    if (!this.client) {
      throw new Error('OAuth 1.0a client is required for posting tweets');
    }

    const dummyTweets = [
      '🧪 Testing Twitter API integration - SilentShout civic complaint system is working! #TestTweet #CivicTech',
      '📱 SilentShout API test - helping citizens report civic issues in Mumbai 🚨 #MumbaiCivic #TestPost',
      '🔧 API Test: SilentShout platform successfully connected to Twitter! Time: ' + new Date().toLocaleTimeString(),
      '🌟 Testing civic complaint system - SilentShout is ready to amplify citizen voices! #CivicEngagement'
    ];

    const tweetText = dummyTweets[Math.floor(Math.random() * dummyTweets.length)];

    try {
      logger.info('Posting tweet with content:', { tweetText });

      const userClient = this.client.readWrite;
      const response = await userClient.v2.tweet(tweetText);

      logger.info('Tweet posted successfully ✅', {
        tweetId: response.data.id,
        tweetText: response.data.text,
        tweetUrl: `https://twitter.com/user/status/${response.data.id}`
      });

      return {
        success: true,
        tweetId: response.data.id,
        tweetText: response.data.text,
        tweetUrl: `https://twitter.com/user/status/${response.data.id}`
      };

    } catch (error) {
      logger.error('Failed to post tweet:', {
        error: error.message,
        statusCode: error.code,
        data: error.data,
        rateLimit: error.rateLimit
      });

      // Handle specific Twitter API errors
      if (error.code === 429) {
        logger.warn('Rate limit exceeded. Please wait before making more requests.');
      } else if (error.code === 403) {
        logger.warn('Forbidden - Check if your app has write permissions');
      } else if (error.code === 401) {
        logger.warn('Unauthorized - Check your API credentials');
      }

      throw error;
    }
  }

  async testWithRawAxios() {
    logger.info('Testing with raw Axios request (as fallback)...');

    const tweetText = '🔄 Testing Twitter API with direct HTTP request - SilentShout backup method! #APITest';

    try {
      const response = await axios.post(
        'https://api.twitter.com/2/tweets',
        { text: tweetText },
        {
          headers: {
            'Authorization': `Bearer ${this.config.bearerToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info('Raw Axios request successful ✅', {
        tweetId: response.data.data.id,
        tweetText: response.data.data.text
      });

      return response.data;

    } catch (error) {
      logger.error('Raw Axios request failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  async runFullTest() {
    logger.info('🚀 Starting comprehensive Twitter API test...');
    logger.info('='.repeat(60));

    try {
      // Step 1: Validate configuration
      logger.info('STEP 1: Configuration validation');
      if (!this.validateConfiguration()) {
        throw new Error('Configuration validation failed');
      }
      logger.info('');

      // Step 2: Initialize clients
      logger.info('STEP 2: Client initialization');
      await this.initializeClients();
      logger.info('');

      // Step 3: Test authentication
      logger.info('STEP 3: Authentication test');
      await this.testAuthentication();
      logger.info('');

      // Step 4: Post dummy tweet
      logger.info('STEP 4: Posting dummy tweet');
      const result = await this.postDummyTweet();
      logger.info('');

      logger.info('🎉 All tests completed successfully!');
      logger.info('='.repeat(60));
      
      return result;

    } catch (error) {
      logger.error('❌ Test failed:', { error: error.message });
      
      // Try fallback method if OAuth fails but Bearer token exists
      if (this.config.bearerToken && error.message.includes('OAuth')) {
        logger.info('Attempting fallback method with Bearer token...');
        try {
          return await this.testWithRawAxios();
        } catch (fallbackError) {
          logger.error('Fallback method also failed:', { error: fallbackError.message });
        }
      }
      
      logger.info('='.repeat(60));
      throw error;
    }
  }

  // Utility method to check API rate limits
  async checkRateLimits() {
    logger.info('Checking Twitter API rate limits...');

    try {
      if (this.bearerClient) {
        const response = await this.bearerClient.readOnly.v1.get('application/rate_limit_status.json');
        
        logger.info('Rate limit status:', {
          'tweets/create': response.resources?.statuses?.['/statuses/update'] || 'Not available',
          'tweets/read': response.resources?.search?.['/search/tweets'] || 'Not available'
        });
      }
    } catch (error) {
      logger.warn('Could not fetch rate limit status:', { error: error.message });
    }
  }
}

// Main execution
async function main() {
  const tester = new TwitterAPITester();

  try {
    logger.info('Twitter API Test Script Started');
    logger.info('Environment:', process.env.NODE_ENV || 'development');
    logger.info('Log file:', tester.logger?.logFile || 'console only');
    logger.info('');

    // Run the full test
    const result = await tester.runFullTest();
    
    // Check rate limits
    await tester.checkRateLimits();

    logger.info('✅ Test completed successfully!', result);
    process.exit(0);

  } catch (error) {
    logger.error('❌ Test script failed:', { 
      error: error.message,
      stack: error.stack 
    });
    
    // Provide debugging suggestions
    logger.info('\n🔍 Debugging suggestions:');
    logger.info('1. Verify all Twitter API credentials in .env file');
    logger.info('2. Check if your Twitter Developer App has write permissions');
    logger.info('3. Ensure your Bearer Token is not URL encoded');
    logger.info('4. Check if you have exceeded API rate limits');
    logger.info('5. Verify your Twitter Developer App is approved for production');
    
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { TwitterAPITester, Logger };